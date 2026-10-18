-- 0019: Real finance workspace
-- 1) Settlement batches + per-beneficiary items (auto/manual distribution)
-- 2) Search infrastructure that scales to ~1M users (trigram indexes)
-- 3) Admin RPCs: user search, user 360 financials, wallet adjustment,
--    transaction search
-- 4) transactions.type gains 'adjustment'

-- ── Extensions & indexes ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS profiles_email_trgm        ON profiles USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_name_ar_trgm      ON profiles USING gin (full_name_ar gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_name_en_trgm      ON profiles USING gin (full_name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_phone_trgm        ON profiles USING gin (phone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_national_id_idx   ON profiles (national_id);
CREATE INDEX IF NOT EXISTS transactions_user_idx      ON transactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_ref_trgm      ON transactions USING gin (reference gin_trgm_ops);
CREATE INDEX IF NOT EXISTS transactions_type_idx      ON transactions (type, created_at DESC);
CREATE INDEX IF NOT EXISTS investments_investor_idx   ON investments (investor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS investments_case_idx       ON investments (case_id) WHERE status = 'confirmed';

-- ── transactions.type: allow 'adjustment' ───────────────────────────────
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('deposit','investment','payout','refund','fee','adjustment'));

-- ── Settlement tables ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settlement_batches (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id uuid REFERENCES cases(id) NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('won','settled','lost')),
  return_pct numeric,
  mode text NOT NULL DEFAULT 'auto' CHECK (mode IN ('auto','manual')),
  total_amount numeric DEFAULT 0,
  beneficiaries_count int DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS settlement_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id uuid REFERENCES settlement_batches(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id),
  kind text NOT NULL CHECK (kind IN ('investor_payout','applicant_recovery','platform_fee','custom')),
  investment_id uuid REFERENCES investments(id),
  principal numeric DEFAULT 0,
  pct numeric,
  amount numeric NOT NULL DEFAULT 0,
  transaction_id uuid REFERENCES transactions(id),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS settlement_items_batch_idx ON settlement_items (batch_id);
CREATE INDEX IF NOT EXISTS settlement_batches_case_idx ON settlement_batches (case_id);

ALTER TABLE settlement_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance reads settlement batches" ON settlement_batches FOR SELECT
  USING (has_permission(auth.uid(), 'finance.payout') OR has_permission(auth.uid(), 'transactions.view') OR has_permission(auth.uid(), 'admin.access'));
CREATE POLICY "Finance reads settlement items" ON settlement_items FOR SELECT
  USING (has_permission(auth.uid(), 'finance.payout') OR has_permission(auth.uid(), 'transactions.view') OR has_permission(auth.uid(), 'admin.access'));

-- ── preview_case_settlement ─────────────────────────────────────────────
-- Returns the auto-computed beneficiary list for a case: every confirmed
-- investor (pro-rata by invested amount) + the applicant recovery line.
CREATE OR REPLACE FUNCTION public.preview_case_settlement(
  p_case_id uuid,
  p_outcome text,
  p_return_pct numeric DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  v_case cases%ROWTYPE;
  v_pct numeric;
  v_items json;
  v_total numeric := 0;
BEGIN
  IF current_user <> 'postgres'
     AND NOT has_permission(auth.uid(), 'finance.payout')
     AND NOT has_permission(auth.uid(), 'transactions.view')
     AND NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO v_case FROM cases WHERE id = p_case_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case not found'; END IF;

  IF p_return_pct IS NOT NULL THEN
    v_pct := p_return_pct;
  ELSIF p_outcome = 'won' THEN
    v_pct := COALESCE(v_case.expected_return_max, 0);
  ELSIF p_outcome = 'settled' THEN
    v_pct := COALESCE(v_case.expected_return_min, 0);
  ELSE
    v_pct := 0;
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.amount DESC), '[]'::json)
  INTO v_items
  FROM (
    SELECT
      i.investor_id AS user_id,
      COALESCE(p.full_name_ar, p.full_name_en, p.email) AS name_ar,
      COALESCE(p.full_name_en, p.full_name_ar, p.email) AS name_en,
      p.email,
      'investor_payout'::text AS kind,
      i.id AS investment_id,
      i.amount AS principal,
      COALESCE(i.tokens, 0) AS tokens,
      CASE WHEN SUM(i.amount) OVER () > 0
           THEN round(i.amount / SUM(i.amount) OVER () * 100, 2)
           ELSE 0 END AS share_pct,
      CASE WHEN p_outcome = 'lost' THEN 0
           ELSE round(i.amount * (1 + v_pct / 100.0), 2) END AS amount
    FROM investments i
    JOIN profiles p ON p.id = i.investor_id
    WHERE i.case_id = p_case_id AND i.status = 'confirmed'
  ) t;

  SELECT COALESCE(SUM((x->>'amount')::numeric), 0) INTO v_total
  FROM json_array_elements(v_items) x;

  RETURN json_build_object(
    'success', true,
    'return_pct', v_pct,
    'total', v_total,
    'funded_amount', COALESCE(v_case.funded_amount, 0),
    'applicant_id', v_case.applicant_id,
    'items', v_items
  );
END;
$function$;

-- ── process_case_settlement ─────────────────────────────────────────────
-- Executes a settlement with an explicit beneficiary list (auto or manual).
-- p_items: json array of {user_id, kind, investment_id?, principal?, pct?, amount}
CREATE OR REPLACE FUNCTION public.process_case_settlement(
  p_case_id uuid,
  p_outcome text,
  p_return_pct numeric DEFAULT NULL,
  p_mode text DEFAULT 'auto',
  p_items jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  v_case cases%ROWTYPE;
  v_item jsonb;
  v_batch_id uuid;
  v_tx_id uuid;
  v_total numeric := 0;
  v_count int := 0;
  v_caller uuid := auth.uid();
BEGIN
  IF current_user <> 'postgres'
     AND NOT has_permission(v_caller, 'finance.payout')
     AND NOT has_permission(v_caller, 'admin.access') THEN
    RAISE EXCEPTION 'Not authorized to process payouts';
  END IF;

  IF p_outcome NOT IN ('won','settled','lost') THEN
    RAISE EXCEPTION 'Invalid outcome: %', p_outcome;
  END IF;
  IF p_mode NOT IN ('auto','manual') THEN
    RAISE EXCEPTION 'Invalid mode: %', p_mode;
  END IF;

  SELECT * INTO v_case FROM cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case not found'; END IF;
  IF v_case.status NOT IN ('funded','in_litigation') THEN
    RAISE EXCEPTION 'Case % is not ready for settlement (status: %)', v_case.case_number, v_case.status;
  END IF;

  -- Auto mode without explicit items: delegate to the classic function logic
  IF p_items IS NULL THEN
    IF p_mode = 'auto' THEN
      p_items := (SELECT (preview_case_settlement(p_case_id, p_outcome, p_return_pct))->'items');
    ELSE
      RAISE EXCEPTION 'Manual mode requires items';
    END IF;
  END IF;

  -- Validate amounts
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) x WHERE (x->>'amount')::numeric < 0) THEN
    RAISE EXCEPTION 'Amounts must be >= 0';
  END IF;

  INSERT INTO settlement_batches (case_id, outcome, return_pct, mode, created_by)
  VALUES (p_case_id, p_outcome, p_return_pct, p_mode, v_caller)
  RETURNING id INTO v_batch_id;

  -- Credit every beneficiary
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_tx_id := NULL;

    IF (v_item->>'user_id') IS NOT NULL AND (v_item->>'amount')::numeric > 0 THEN
      INSERT INTO wallets (user_id, balance, locked_balance)
      VALUES ((v_item->>'user_id')::uuid, 0, 0)
      ON CONFLICT (user_id) DO NOTHING;

      UPDATE wallets
      SET balance = balance + (v_item->>'amount')::numeric, updated_at = NOW()
      WHERE user_id = (v_item->>'user_id')::uuid;

      INSERT INTO transactions (user_id, case_id, type, amount, status, reference)
      VALUES ((v_item->>'user_id')::uuid, p_case_id, 'payout', (v_item->>'amount')::numeric, 'completed',
              'PAY-' || encode(gen_random_bytes(6), 'hex'))
      RETURNING id INTO v_tx_id;

      INSERT INTO notifications (user_id, title_ar, title_en, body_ar, body_en, link)
      VALUES (
        (v_item->>'user_id')::uuid,
        'تم صرف مستحقاتك', 'Your settlement was paid',
        'تم إيداع ' || round((v_item->>'amount')::numeric, 2) || ' ر.س في محفظتك من قضية ' || COALESCE(v_case.title_ar, ''),
        'SAR ' || round((v_item->>'amount')::numeric, 2) || ' was credited to your wallet from case ' || COALESCE(v_case.title_en, ''),
        '/dashboard'
      );
    END IF;

    -- Release locked principal + close the investment line
    IF (v_item->>'investment_id') IS NOT NULL THEN
      UPDATE investments i
      SET status = CASE WHEN p_outcome = 'lost' THEN 'lost' ELSE 'returned' END,
          actual_return = CASE WHEN p_outcome = 'lost' THEN -i.amount
                               ELSE (v_item->>'amount')::numeric - i.amount END
      WHERE i.id = (v_item->>'investment_id')::uuid AND i.status = 'confirmed';

      IF (v_item->>'user_id') IS NOT NULL THEN
        UPDATE wallets w
        SET locked_balance = GREATEST(0, w.locked_balance - COALESCE((v_item->>'principal')::numeric, 0)),
            updated_at = NOW()
        WHERE w.user_id = (v_item->>'user_id')::uuid;
      END IF;
    END IF;

    INSERT INTO settlement_items (batch_id, user_id, kind, investment_id, principal, pct, amount, transaction_id)
    VALUES (v_batch_id, (v_item->>'user_id')::uuid,
            COALESCE(v_item->>'kind', 'investor_payout'),
            NULLIF(v_item->>'investment_id', '')::uuid,
            COALESCE((v_item->>'principal')::numeric, 0),
            NULLIF(v_item->>'pct', '')::numeric,
            (v_item->>'amount')::numeric, v_tx_id);

    v_total := v_total + (v_item->>'amount')::numeric;
    v_count := v_count + 1;
  END LOOP;

  -- Any confirmed investment missing from a manual list: mark lost-style release
  UPDATE investments SET status = 'lost', actual_return = -amount
  WHERE case_id = p_case_id AND status = 'confirmed';

  UPDATE settlement_batches
  SET total_amount = v_total, beneficiaries_count = v_count
  WHERE id = v_batch_id;

  UPDATE cases SET status = p_outcome, updated_at = NOW() WHERE id = p_case_id;

  INSERT INTO audit_logs (actor_id, action, entity, entity_id, metadata)
  VALUES (v_caller, 'case_settlement', 'cases', p_case_id,
          json_build_object('outcome', p_outcome, 'return_pct', p_return_pct, 'mode', p_mode,
                            'batch_id', v_batch_id, 'beneficiaries', v_count, 'total', v_total));

  RETURN json_build_object('success', true, 'batch_id', v_batch_id,
                           'beneficiaries', v_count, 'total', v_total);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- ── admin_search_users ──────────────────────────────────────────────────
-- Fast trigram search over profiles + wallet balance. Scales to ~1M rows.
CREATE OR REPLACE FUNCTION public.admin_search_users(
  p_query text DEFAULT '',
  p_limit int DEFAULT 25,
  p_offset int DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  v_q text := trim(COALESCE(p_query, ''));
  v_rows json;
  v_total bigint;
BEGIN
  IF current_user <> 'postgres'
     AND NOT has_permission(auth.uid(), 'users.view')
     AND NOT has_permission(auth.uid(), 'transactions.view')
     AND NOT has_permission(auth.uid(), 'finance.payout')
     AND NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM profiles p
  WHERE v_q = ''
     OR p.email ILIKE '%' || v_q || '%'
     OR p.full_name_ar ILIKE '%' || v_q || '%'
     OR p.full_name_en ILIKE '%' || v_q || '%'
     OR p.phone ILIKE '%' || v_q || '%'
     OR p.national_id ILIKE '%' || v_q || '%';

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_rows
  FROM (
    SELECT p.id,
           COALESCE(p.full_name_ar, p.full_name_en, p.email) AS name_ar,
           COALESCE(p.full_name_en, p.full_name_ar, p.email) AS name_en,
           p.email, p.phone, p.national_id, p.user_type, p.kyc_status, p.avatar_url,
           COALESCE(w.balance, 0) AS balance,
           COALESCE(w.locked_balance, 0) AS locked_balance
    FROM profiles p
    LEFT JOIN wallets w ON w.user_id = p.id
    WHERE v_q = ''
       OR p.email ILIKE '%' || v_q || '%'
       OR p.full_name_ar ILIKE '%' || v_q || '%'
       OR p.full_name_en ILIKE '%' || v_q || '%'
       OR p.phone ILIKE '%' || v_q || '%'
       OR p.national_id ILIKE '%' || v_q || '%'
    ORDER BY
      CASE WHEN v_q <> '' AND p.email ILIKE v_q || '%' THEN 0
           WHEN v_q <> '' AND p.national_id = v_q THEN 0
           ELSE 1 END,
      p.created_at DESC
    LIMIT LEAST(p_limit, 100) OFFSET p_offset
  ) t;

  RETURN json_build_object('success', true, 'total', v_total, 'users', v_rows);
END;
$function$;

-- ── admin_user_financials ───────────────────────────────────────────────
-- One-call 360° view: profile + wallet + transactions + investments.
CREATE OR REPLACE FUNCTION public.admin_user_financials(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  v_profile json;
  v_wallet json;
  v_txs json;
  v_invs json;
BEGIN
  IF current_user <> 'postgres'
     AND NOT has_permission(auth.uid(), 'users.view')
     AND NOT has_permission(auth.uid(), 'transactions.view')
     AND NOT has_permission(auth.uid(), 'finance.payout')
     AND NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT row_to_json(t) INTO v_profile
  FROM (
    SELECT p.id, p.full_name_ar, p.full_name_en, p.email, p.phone, p.national_id,
           p.user_type, p.kyc_status, p.avatar_url, p.created_at,
           r.name_ar AS role_ar, r.name_en AS role_en
    FROM profiles p LEFT JOIN roles r ON r.id = p.role_id
    WHERE p.id = p_user_id
  ) t;
  IF v_profile IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;

  SELECT row_to_json(w) INTO v_wallet
  FROM (SELECT balance, locked_balance, updated_at FROM wallets WHERE user_id = p_user_id) w;

  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.created_at DESC), '[]'::json) INTO v_txs
  FROM (
    SELECT tx.id, tx.type, tx.amount, tx.status, tx.reference, tx.created_at,
           c.case_number, c.title_ar AS case_title_ar, c.title_en AS case_title_en, c.id AS case_id
    FROM transactions tx LEFT JOIN cases c ON c.id = tx.case_id
    WHERE tx.user_id = p_user_id
    ORDER BY tx.created_at DESC LIMIT 200
  ) t;

  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.created_at DESC), '[]'::json) INTO v_invs
  FROM (
    SELECT i.id, i.amount, i.status, i.tokens, i.expected_share, i.actual_return, i.created_at,
           c.case_number, c.title_ar AS case_title_ar, c.title_en AS case_title_en, c.id AS case_id, c.status AS case_status
    FROM investments i LEFT JOIN cases c ON c.id = i.case_id
    WHERE i.investor_id = p_user_id
    ORDER BY i.created_at DESC LIMIT 200
  ) t;

  RETURN json_build_object('success', true, 'profile', v_profile,
                           'wallet', COALESCE(v_wallet, '{"balance":0,"locked_balance":0}'::json),
                           'transactions', v_txs, 'investments', v_invs);
END;
$function$;

-- ── admin_adjust_wallet ─────────────────────────────────────────────────
-- Credit (positive) or debit (negative) a user's wallet with a reason.
CREATE OR REPLACE FUNCTION public.admin_adjust_wallet(
  p_user_id uuid,
  p_amount numeric,
  p_reason text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  v_caller uuid := auth.uid();
  v_new_balance numeric;
BEGIN
  IF current_user <> 'postgres'
     AND NOT has_permission(v_caller, 'finance.payout')
     AND NOT has_permission(v_caller, 'admin.access') THEN
    RAISE EXCEPTION 'Not authorized to adjust wallets';
  END IF;
  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Amount must be non-zero';
  END IF;

  INSERT INTO wallets (user_id, balance, locked_balance)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE wallets SET balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance for this debit';
  END IF;

  INSERT INTO transactions (user_id, type, amount, status, reference)
  VALUES (p_user_id, 'adjustment', p_amount, 'completed',
          'ADJ-' || encode(gen_random_bytes(6), 'hex'));

  INSERT INTO audit_logs (actor_id, action, entity, entity_id, metadata)
  VALUES (v_caller, 'wallet_adjustment', 'wallets', p_user_id,
          json_build_object('amount', p_amount, 'reason', p_reason, 'new_balance', v_new_balance));

  INSERT INTO notifications (user_id, title_ar, title_en, body_ar, body_en, link)
  VALUES (
    p_user_id,
    CASE WHEN p_amount > 0 THEN 'تم إضافة رصيد لمحفظتك' ELSE 'تم خصم رصيد من محفظتك' END,
    CASE WHEN p_amount > 0 THEN 'Wallet credited' ELSE 'Wallet debited' END,
    'المبلغ: ' || round(p_amount, 2) || ' ر.س' || CASE WHEN p_reason <> '' THEN ' — السبب: ' || p_reason ELSE '' END,
    'Amount: SAR ' || round(p_amount, 2) || CASE WHEN p_reason <> '' THEN ' — Reason: ' || p_reason ELSE '' END,
    '/dashboard'
  );

  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- ── admin_search_transactions ───────────────────────────────────────────
-- Searchable/filterable/paginated ledger (reference, user name/email, type).
CREATE OR REPLACE FUNCTION public.admin_search_transactions(
  p_query text DEFAULT '',
  p_type text DEFAULT '',
  p_limit int DEFAULT 25,
  p_offset int DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  v_q text := trim(COALESCE(p_query, ''));
  v_rows json;
  v_total bigint;
BEGIN
  IF current_user <> 'postgres'
     AND NOT has_permission(auth.uid(), 'transactions.view')
     AND NOT has_permission(auth.uid(), 'finance.payout')
     AND NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM transactions tx JOIN profiles p ON p.id = tx.user_id
  WHERE (p_type = '' OR tx.type = p_type)
    AND (v_q = '' OR tx.reference ILIKE '%' || v_q || '%'
         OR p.email ILIKE '%' || v_q || '%'
         OR p.full_name_ar ILIKE '%' || v_q || '%'
         OR p.full_name_en ILIKE '%' || v_q || '%');

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_rows
  FROM (
    SELECT tx.id, tx.type, tx.amount, tx.status, tx.reference, tx.created_at,
           tx.user_id,
           COALESCE(p.full_name_ar, p.full_name_en, p.email) AS user_name_ar,
           COALESCE(p.full_name_en, p.full_name_ar, p.email) AS user_name_en,
           p.email AS user_email,
           c.case_number, c.title_ar AS case_title_ar, c.title_en AS case_title_en, c.id AS case_id
    FROM transactions tx
    JOIN profiles p ON p.id = tx.user_id
    LEFT JOIN cases c ON c.id = tx.case_id
    WHERE (p_type = '' OR tx.type = p_type)
      AND (v_q = '' OR tx.reference ILIKE '%' || v_q || '%'
           OR p.email ILIKE '%' || v_q || '%'
           OR p.full_name_ar ILIKE '%' || v_q || '%'
           OR p.full_name_en ILIKE '%' || v_q || '%')
    ORDER BY tx.created_at DESC
    LIMIT LEAST(p_limit, 100) OFFSET p_offset
  ) t;

  RETURN json_build_object('success', true, 'total', v_total, 'transactions', v_rows);
END;
$function$;
