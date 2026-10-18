-- 0016_tokenization.sql
-- Tokenized investment model: each case is split into tokens with a fixed price.
-- Investors buy a number of tokens between the case's min/max limits.

-- 1. Case token configuration
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS token_price numeric NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS min_tokens integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS max_tokens integer NOT NULL DEFAULT 500;

-- 2. Tokens owned per investment
ALTER TABLE investments
  ADD COLUMN IF NOT EXISTS tokens integer;

-- Backfill existing investments: tokens = amount / token_price
UPDATE investments inv
SET tokens = GREATEST(1, ROUND(inv.amount / c.token_price))
FROM cases c
WHERE c.id = inv.case_id AND inv.tokens IS NULL;

UPDATE investments SET tokens = 1 WHERE tokens IS NULL;
ALTER TABLE investments ALTER COLUMN tokens SET NOT NULL;

-- 3. Recreate public view with token data
DROP VIEW IF EXISTS public_cases;
CREATE OR REPLACE VIEW public_cases AS
SELECT id,
       case_number,
       title_ar,
       title_en,
       description_ar,
       description_en,
       case_type,
       court,
       claim_amount,
       requested_funding,
       funded_amount,
       expected_return_min,
       expected_return_max,
       duration_months,
       risk_level,
       status,
       created_at,
       updated_at,
       lawyer_name,
       law_firm,
       engagement_type,
       insurance_coverage_pct,
       token_price,
       min_tokens,
       max_tokens,
       GREATEST(1, FLOOR(requested_funding / NULLIF(token_price, 0)))::integer AS total_tokens,
       FLOOR(COALESCE(funded_amount, 0) / NULLIF(token_price, 0))::integer        AS sold_tokens
FROM cases
WHERE (status = ANY (ARRAY['funding_open'::text, 'funded'::text, 'in_litigation'::text, 'settled'::text, 'won'::text, 'lost'::text, 'closed'::text]));

GRANT SELECT ON public_cases TO anon, authenticated;

-- 4. Token-based invest function (replaces amount-based one)
DROP FUNCTION IF EXISTS invest_in_case(uuid, numeric);

CREATE OR REPLACE FUNCTION invest_in_case(
    p_case_id uuid,
    p_tokens integer
) RETURNS json AS $$
DECLARE
    v_user_id uuid;
    v_wallet wallets%ROWTYPE;
    v_case cases%ROWTYPE;
    v_amount numeric;
    v_remaining_tokens integer;
    v_total_tokens integer;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF p_tokens IS NULL OR p_tokens <= 0 THEN
        RAISE EXCEPTION 'Token count must be greater than zero';
    END IF;

    -- Lock case
    SELECT * INTO v_case FROM cases WHERE id = p_case_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Case not found';
    END IF;

    IF v_case.status != 'funding_open' THEN
        RAISE EXCEPTION 'Case is not open for funding';
    END IF;

    v_total_tokens := GREATEST(1, FLOOR(v_case.requested_funding / NULLIF(v_case.token_price, 0)));
    v_remaining_tokens := v_total_tokens - FLOOR(COALESCE(v_case.funded_amount, 0) / NULLIF(v_case.token_price, 0));

    -- Token limits
    IF p_tokens < v_case.min_tokens THEN
        RAISE EXCEPTION 'Below minimum tokens (%)', v_case.min_tokens;
    END IF;
    IF p_tokens > v_case.max_tokens THEN
        RAISE EXCEPTION 'Above maximum tokens (%)', v_case.max_tokens;
    END IF;
    IF p_tokens > v_remaining_tokens THEN
        RAISE EXCEPTION 'Not enough tokens remaining (%)', v_remaining_tokens;
    END IF;

    v_amount := p_tokens * v_case.token_price;

    -- Lock wallet
    SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
    IF NOT FOUND THEN
        INSERT INTO wallets (user_id, balance, locked_balance) VALUES (v_user_id, 0, 0) RETURNING * INTO v_wallet;
    END IF;

    IF v_wallet.balance < v_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    UPDATE wallets
    SET balance = balance - v_amount,
        locked_balance = locked_balance + v_amount,
        updated_at = NOW()
    WHERE user_id = v_user_id;

    UPDATE cases
    SET funded_amount = COALESCE(funded_amount, 0) + v_amount,
        status = CASE WHEN COALESCE(funded_amount, 0) + v_amount >= requested_funding THEN 'funded'::text ELSE status END,
        updated_at = NOW()
    WHERE id = p_case_id;

    INSERT INTO investments (investor_id, case_id, amount, tokens, status)
    VALUES (v_user_id, p_case_id, v_amount, p_tokens, 'confirmed');

    INSERT INTO transactions (user_id, case_id, type, amount, status, reference)
    VALUES (v_user_id, p_case_id, 'investment', v_amount, 'completed', 'INV-' || encode(gen_random_bytes(6), 'hex'));

    RETURN json_build_object('success', true, 'tokens', p_tokens, 'amount', v_amount);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION invest_in_case(uuid, integer) TO authenticated;
