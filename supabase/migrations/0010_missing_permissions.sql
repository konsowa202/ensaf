-- 0010_missing_permissions.sql
-- Added by QA: middleware.ts and Sidebar.tsx gate /admin and /committee on the
-- permission keys 'admin.access' and 'cases.review', but no migration ever inserts
-- them — so has_permission() returns false for EVERYONE (including super_admin)
-- and both areas are dead-locked. Idempotent: safe to re-run.

INSERT INTO permissions (key, "group", label_ar, label_en) VALUES
('admin.access', 'admin', 'الوصول إلى لوحة الإدارة', 'Access Admin Panel'),
('cases.review', 'cases', 'الوصول إلى لجنة المراجعة', 'Access Committee Review')
ON CONFLICT (key) DO NOTHING;

DO $$
DECLARE
    super_admin_id uuid;
    judicial_id uuid;
    perm_record RECORD;
BEGIN
    SELECT id INTO super_admin_id FROM roles WHERE slug = 'super_admin';
    SELECT id INTO judicial_id FROM roles WHERE slug = 'judicial_committee';

    -- super_admin gets both new permissions
    FOR perm_record IN SELECT id FROM permissions WHERE key IN ('admin.access', 'cases.review') LOOP
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (super_admin_id, perm_record.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- judicial_committee gets committee access
    FOR perm_record IN SELECT id FROM permissions WHERE key IN ('cases.review') LOOP
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (judicial_id, perm_record.id) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
