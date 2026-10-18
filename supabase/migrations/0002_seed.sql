-- 0002_seed.sql
-- Seed Data for INSAF Platform

-- 1. Insert Permissions
INSERT INTO permissions (key, "group", label_ar, label_en) VALUES
('cases.view', 'cases', 'عرض القضايا', 'View Cases'),
('cases.view_public', 'cases', 'عرض القضايا العامة', 'View Public Cases'),
('cases.manage', 'cases', 'إدارة القضايا', 'Manage Cases'),
('cases.approve', 'cases', 'مراجعة واعتماد القضايا', 'Review & Approve Cases'),
('users.view', 'users', 'عرض المستخدمين', 'View Users'),
('users.manage', 'users', 'إدارة المستخدمين', 'Manage Users'),
('roles.view', 'roles', 'عرض الأدوار', 'View Roles'),
('roles.manage', 'roles', 'إدارة الأدوار', 'Manage Roles'),
('transactions.view', 'transactions', 'عرض المعاملات', 'View Transactions'),
('transactions.manage', 'transactions', 'إدارة المعاملات', 'Manage Transactions'),
('finance.payout', 'finance', 'إصدار المدفوعات', 'Issue Payouts'),
('content.manage', 'content', 'إدارة المحتوى', 'Manage Content'),
('settings.manage', 'settings', 'إدارة الإعدادات', 'Manage Settings'),
('audit.view', 'audit', 'عرض سجل النشاطات', 'View Audit Logs')
ON CONFLICT (key) DO NOTHING;

-- 2. Insert System Roles
INSERT INTO roles (name_ar, name_en, slug, is_system) VALUES
('مدير النظام', 'Super Admin', 'super_admin', true),
('الهيئة القضائية', 'Judicial Committee', 'judicial_committee', true),
('العمليات', 'Operations', 'operations', true),
('المالية', 'Finance', 'finance', true),
('الامتثال', 'Compliance', 'compliance', true),
('علاقات المستثمرين', 'Investor Relations', 'investor_relations', true),
('محلل قضايا', 'Case Analyst', 'case_analyst', false)
ON CONFLICT (slug) DO NOTHING;

-- 3. Assign Permissions to Roles (Super Admin gets all)
DO $$
DECLARE
    super_admin_id uuid;
    judicial_id uuid;
    perm_record RECORD;
BEGIN
    SELECT id INTO super_admin_id FROM roles WHERE slug = 'super_admin';
    SELECT id INTO judicial_id FROM roles WHERE slug = 'judicial_committee';
    
    -- Assign all permissions to super_admin
    FOR perm_record IN SELECT id FROM permissions LOOP
        INSERT INTO role_permissions (role_id, permission_id) 
        VALUES (super_admin_id, perm_record.id) ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Assign specific permissions to judicial_committee
    FOR perm_record IN SELECT id FROM permissions WHERE key IN ('cases.view', 'cases.approve') LOOP
        INSERT INTO role_permissions (role_id, permission_id) 
        VALUES (judicial_id, perm_record.id) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 4. Platform Settings
INSERT INTO platform_settings (key, value) VALUES
('hero_stats', '{"funded_volume": 12000000, "cases_funded": 45, "investor_community": 3200, "avg_review_days": 14}'::jsonb),
('fees', '{"platform_fee_percent": 2.5, "success_fee_percent": 15}'::jsonb),
('limits', '{"min_investment": 1000}'::jsonb),
('maintenance', '{"is_active": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 5. Partners
INSERT INTO partners (name_ar, name_en, sort_order) VALUES
('شركة المحاماة المتقدمة', 'Advanced Law Firm', 1),
('مكتب الاستشارات القانونية', 'Legal Consulting Office', 2),
('مجموعة الاستثمار المتكامل', 'Integrated Investment Group', 3);

-- 6. FAQs
INSERT INTO faqs (question_ar, question_en, answer_ar, answer_en, sort_order) VALUES
('هل استثماري مضمون؟', 'Is my investment guaranteed?', 'لا، الاستثمار في القضايا يحمل مخاطر الخسارة. نرجو قراءة إخلاء المسؤولية.', 'No, investing in litigation carries risk of loss. Please read the risk disclosure.', 1),
('من يوافق على القضايا؟', 'Who approves cases?', 'هيئة قضائية مستقلة تتولى مراجعة كل قضية.', 'An independent judicial committee reviews each case.', 2),
('كيف يتم توزيع العوائد؟', 'How are returns distributed?', 'يتم توزيعها بشفافية وفق آلية محددة عند نجاح القضية.', 'Distributed transparently according to a specific mechanism upon case success.', 3);
