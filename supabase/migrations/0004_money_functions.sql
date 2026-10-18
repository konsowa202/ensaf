-- 0004_money_functions.sql
-- Secure RPC functions for wallet mutations and investments

CREATE OR REPLACE FUNCTION invest_in_case(
    p_case_id uuid,
    p_amount numeric
) RETURNS json AS $$
DECLARE
    v_user_id uuid;
    v_wallet wallets%ROWTYPE;
    v_case cases%ROWTYPE;
    v_remaining_capacity numeric;
BEGIN
    -- 1. Get authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Lock and get case
    SELECT * INTO v_case FROM cases WHERE id = p_case_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Case not found';
    END IF;

    IF v_case.status != 'funding_open' THEN
        RAISE EXCEPTION 'Case is not open for funding';
    END IF;

    -- 3. Check case capacity
    v_remaining_capacity := v_case.requested_funding - COALESCE(v_case.funded_amount, 0);
    IF p_amount > v_remaining_capacity THEN
        RAISE EXCEPTION 'Amount exceeds remaining funding capacity';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Investment amount must be greater than zero';
    END IF;

    -- 4. Lock and get wallet
    SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
    IF NOT FOUND THEN
        -- Create wallet if missing
        INSERT INTO wallets (user_id, balance, locked_balance) VALUES (v_user_id, 0, 0) RETURNING * INTO v_wallet;
    END IF;

    IF v_wallet.balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    -- 5. Update wallet
    UPDATE wallets
    SET balance = balance - p_amount,
        locked_balance = locked_balance + p_amount,
        updated_at = NOW()
    WHERE user_id = v_user_id;

    -- 6. Update case funded amount
    UPDATE cases
    SET funded_amount = COALESCE(funded_amount, 0) + p_amount
    WHERE id = p_case_id;

    -- 7. Insert investment record
    INSERT INTO investments (investor_id, case_id, amount, status)
    VALUES (v_user_id, p_case_id, p_amount, 'confirmed');

    -- 8. Insert transaction record
    INSERT INTO transactions (user_id, case_id, type, amount, status, reference)
    VALUES (v_user_id, p_case_id, 'investment', p_amount, 'completed', 'INV-' || encode(gen_random_bytes(6), 'hex'));

    RETURN json_build_object('success', true, 'message', 'Investment successful');
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback is automatic on exception in PL/pgSQL
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
