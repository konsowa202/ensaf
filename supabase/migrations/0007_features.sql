-- 0007_features.sql
-- Features added in Round 3

CREATE OR REPLACE FUNCTION deposit_funds(
    p_amount numeric
) RETURNS json AS $$
DECLARE
    v_user_id uuid;
    v_wallet wallets%ROWTYPE;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Deposit amount must be greater than zero';
    END IF;

    -- Lock and get wallet
    SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
    IF NOT FOUND THEN
        INSERT INTO wallets (user_id, balance, locked_balance) VALUES (v_user_id, p_amount, 0) RETURNING * INTO v_wallet;
    ELSE
        UPDATE wallets
        SET balance = balance + p_amount,
            updated_at = NOW()
        WHERE user_id = v_user_id;
    END IF;

    -- Insert transaction record
    INSERT INTO transactions (user_id, type, amount, status, reference)
    VALUES (v_user_id, 'deposit', p_amount, 'completed', 'DEP-' || encode(gen_random_bytes(6), 'hex'));

    RETURN json_build_object('success', true, 'message', 'Deposit successful');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
