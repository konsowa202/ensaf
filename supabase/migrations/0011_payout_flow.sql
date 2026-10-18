-- 0011: Case payout flow (finance.payout) + data fixes
-- Adds process_case_payout(): distributes returns to investors' wallets when a
-- case is won/settled, or releases locked funds when lost. Closes the loop:
-- funding_open -> funded -> in_litigation -> won/settled/lost -> payouts.

CREATE OR REPLACE FUNCTION public.process_case_payout(
  p_case_id uuid,
  p_outcome text,               -- 'won' | 'settled' | 'lost'
  p_return_pct numeric DEFAULT NULL  -- override return %; NULL = auto
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  v_case cases%ROWTYPE;
  v_inv RECORD;
  v_pct numeric;
  v_payout numeric;
  v_total numeric := 0;
  v_count int := 0;
  v_caller uuid := auth.uid();
BEGIN
  -- 1. Authorization: finance.payout or admin.access permission required.
  --    (current_user = 'postgres' allows direct admin SQL / service calls.)
  IF current_user <> 'postgres'
     AND NOT has_permission(v_caller, 'finance.payout')
     AND NOT has_permission(v_caller, 'admin.access') THEN
    RAISE EXCEPTION 'Not authorized to process payouts';
  END IF;

  -- 2. Validate outcome
  IF p_outcome NOT IN ('won', 'settled', 'lost') THEN
    RAISE EXCEPTION 'Invalid outcome: %', p_outcome;
  END IF;

  -- 3. Lock case
  SELECT * INTO v_case FROM cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Case not found';
  END IF;
  IF v_case.status NOT IN ('funded', 'in_litigation') THEN
    RAISE EXCEPTION 'Case % is not ready for settlement (status: %)', v_case.case_number, v_case.status;
  END IF;

  -- 4. Resolve effective return percentage
  IF p_return_pct IS NOT NULL THEN
    v_pct := p_return_pct;
  ELSIF p_outcome = 'won' THEN
    v_pct := COALESCE(v_case.expected_return_max, 0);
  ELSIF p_outcome = 'settled' THEN
    v_pct := COALESCE(v_case.expected_return_min, 0);
  ELSE
    v_pct := 0;
  END IF;

  -- 5. Process every confirmed investment
  FOR v_inv IN
    SELECT * FROM investments
    WHERE case_id = p_case_id AND status = 'confirmed'
    ORDER BY created_at
    FOR UPDATE
  LOOP
    -- Ensure wallet exists
    INSERT INTO wallets (user_id, balance, locked_balance)
    VALUES (v_inv.investor_id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    IF p_outcome = 'lost' THEN
      -- Principal is lost: release locked funds, no credit
      UPDATE wallets
      SET locked_balance = GREATEST(0, locked_balance - v_inv.amount), updated_at = NOW()
      WHERE user_id = v_inv.investor_id;

      UPDATE investments
      SET status = 'lost', actual_return = -v_inv.amount
      WHERE id = v_inv.id;
    ELSE
      v_payout := v_inv.amount * (1 + v_pct / 100.0);

      UPDATE wallets
      SET balance = balance + v_payout,
          locked_balance = GREATEST(0, locked_balance - v_inv.amount),
          updated_at = NOW()
      WHERE user_id = v_inv.investor_id;

      UPDATE investments
      SET status = 'returned', actual_return = v_payout - v_inv.amount
      WHERE id = v_inv.id;

      INSERT INTO transactions (user_id, case_id, type, amount, status, reference)
      VALUES (v_inv.investor_id, p_case_id, 'payout', v_payout, 'completed',
              'PAY-' || encode(gen_random_bytes(6), 'hex'));

      v_total := v_total + v_payout;
      v_count := v_count + 1;

      -- Notify investor
      INSERT INTO notifications (user_id, title_ar, title_en, body_ar, body_en, link)
      VALUES (
        v_inv.investor_id,
        'تم صرف عوائد استثمارك',
        'Your investment return was paid',
        'تم إيداع ' || round(v_payout, 2) || ' ر.س في محفظتك من قضية ' || COALESCE(v_case.title_ar, ''),
        'SAR ' || round(v_payout, 2) || ' was credited to your wallet from case ' || COALESCE(v_case.title_en, ''),
        '/dashboard'
      );
    END IF;
  END LOOP;

  -- 6. Close the case
  UPDATE cases SET status = p_outcome, updated_at = NOW() WHERE id = p_case_id;

  -- 7. Audit trail
  INSERT INTO audit_logs (actor_id, action, entity, entity_id, metadata)
  VALUES (v_caller, 'case_payout', 'cases', p_case_id,
          json_build_object('outcome', p_outcome, 'return_pct', v_pct,
                            'investors_paid', v_count, 'total_payout', v_total));

  RETURN json_build_object(
    'success', true,
    'outcome', p_outcome,
    'return_pct', v_pct,
    'investors_paid', v_count,
    'total_payout', v_total
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Fix mojibake in QA test case title (encoding was corrupted on insert)
UPDATE cases
SET title_ar = 'مطالبة تجارية - اختبار',
    title_en = 'Commercial Claim - QA Test',
    description_ar = COALESCE(NULLIF(description_ar, ''), 'قضية اختبارية للتحقق من دورة العمل.'),
    description_en = COALESCE(NULLIF(description_en, ''), 'Test case for workflow verification.')
WHERE case_number = 'QA-R2-001';
