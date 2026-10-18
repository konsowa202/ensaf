-- 0017_role_workspaces.sql
-- Real per-role workspaces: compliance KYC queue, operations pipeline, investor relations.

-- 1. Permission adjustments
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'compliance' AND p.key = 'users.manage'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'operations' AND p.key = 'cases.manage'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'investor_relations' AND p.key = 'cases.view'
ON CONFLICT DO NOTHING;

-- 2. KYC review (compliance / super_admin): approve or reject a user's verification
CREATE OR REPLACE FUNCTION review_kyc(
    p_user_id uuid,
    p_status text,        -- 'verified' | 'rejected'
    p_note text DEFAULT NULL
) RETURNS json AS $$
DECLARE
    v_reviewer uuid;
BEGIN
    v_reviewer := auth.uid();
    IF v_reviewer IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF NOT has_permission(v_reviewer, 'users.manage') THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    IF p_status NOT IN ('verified', 'rejected', 'pending') THEN
        RAISE EXCEPTION 'Invalid KYC status';
    END IF;

    UPDATE profiles
    SET kyc_status = p_status, updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO audit_logs (actor_id, action, entity, entity_id, metadata)
    VALUES (v_reviewer, 'kyc_review', 'profiles', p_user_id,
            jsonb_build_object('status', p_status, 'note', p_note));

    INSERT INTO notifications (user_id, title_ar, title_en, body_ar, body_en, link)
    VALUES (
        p_user_id,
        CASE WHEN p_status = 'verified' THEN 'تم توثيق حسابك' ELSE 'تحديث حالة التوثيق' END,
        CASE WHEN p_status = 'verified' THEN 'Account verified' ELSE 'Verification update' END,
        CASE WHEN p_status = 'verified'
             THEN 'تم توثيق حسابك بنجاح وأصبح بإمكانك استخدام كامل خدمات المنصة.'
             ELSE COALESCE('تم رفض توثيق حسابك. ' || p_note, 'تم رفض توثيق حسابك، يرجى مراجعة بياناتك وإعادة المحاولة.') END,
        CASE WHEN p_status = 'verified'
             THEN 'Your account has been verified. Full platform access is now enabled.'
             ELSE COALESCE('Your verification was rejected. ' || p_note, 'Your verification was rejected. Please review your data and try again.') END,
        '/dashboard/profile'
    );

    RETURN json_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION review_kyc(uuid, text, text) TO authenticated;

-- 3. Investor directory for investor-relations / admins (bypasses RLS safely)
CREATE OR REPLACE FUNCTION investor_directory()
RETURNS TABLE (
    id uuid,
    full_name_ar text,
    full_name_en text,
    email text,
    kyc_status text,
    created_at timestamptz,
    balance numeric,
    locked_balance numeric,
    total_invested numeric,
    investments_count bigint,
    tokens_total bigint
) AS $$
BEGIN
    IF NOT (has_permission(auth.uid(), 'users.view') OR has_permission(auth.uid(), 'admin.access')) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    RETURN QUERY
    SELECT p.id, p.full_name_ar, p.full_name_en, p.email, p.kyc_status, p.created_at,
           COALESCE(w.balance, 0), COALESCE(w.locked_balance, 0),
           COALESCE(SUM(i.amount), 0), COUNT(i.id), COALESCE(SUM(i.tokens), 0)::bigint
    FROM profiles p
    LEFT JOIN wallets w ON w.user_id = p.id
    LEFT JOIN investments i ON i.investor_id = p.id
    WHERE p.user_type = 'investor'
    GROUP BY p.id, w.balance, w.locked_balance
    ORDER BY COALESCE(SUM(i.amount), 0) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION investor_directory() TO authenticated;
