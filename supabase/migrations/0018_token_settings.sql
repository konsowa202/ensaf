-- 0018_token_settings.sql
-- Per-case tokenization settings, editable by staff with cases.manage

CREATE OR REPLACE FUNCTION update_case_tokenization(
    p_case_id uuid,
    p_token_price numeric,
    p_min_tokens integer,
    p_max_tokens integer
) RETURNS json AS $$
DECLARE
    v_actor uuid;
    v_case cases%ROWTYPE;
    v_sold integer;
BEGIN
    v_actor := auth.uid();
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF NOT has_permission(v_actor, 'cases.manage') THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_case FROM cases WHERE id = p_case_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Case not found';
    END IF;

    IF p_token_price IS NULL OR p_token_price <= 0 THEN
        RAISE EXCEPTION 'Token price must be greater than zero';
    END IF;
    IF p_min_tokens IS NULL OR p_min_tokens < 1 THEN
        RAISE EXCEPTION 'Minimum tokens must be at least 1';
    END IF;
    IF p_max_tokens IS NULL OR p_max_tokens < p_min_tokens THEN
        RAISE EXCEPTION 'Maximum tokens must be >= minimum';
    END IF;

    -- Never allow a configuration that invalidates tokens already sold
    v_sold := FLOOR(COALESCE(v_case.funded_amount, 0) / NULLIF(p_token_price, 0));
    IF FLOOR(v_case.requested_funding / p_token_price) < v_sold THEN
        RAISE EXCEPTION 'Configuration conflicts with tokens already sold';
    END IF;

    UPDATE cases
    SET token_price = p_token_price,
        min_tokens = p_min_tokens,
        max_tokens = p_max_tokens,
        updated_at = NOW()
    WHERE id = p_case_id;

    INSERT INTO audit_logs (actor_id, action, entity, entity_id, metadata)
    VALUES (v_actor, 'case_tokenization_update', 'cases', p_case_id,
            jsonb_build_object('token_price', p_token_price, 'min_tokens', p_min_tokens, 'max_tokens', p_max_tokens));

    RETURN json_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_case_tokenization(uuid, numeric, integer, integer) TO authenticated;
