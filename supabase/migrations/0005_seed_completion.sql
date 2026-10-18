-- 0005_seed_completion.sql
-- Completing the seed data per QA requirements

-- 1. Make cases.applicant_id nullable to allow demo cases
ALTER TABLE cases ALTER COLUMN applicant_id DROP NOT NULL;

-- 2. Assign permissions to empty roles
DO $$
DECLARE
    operations_id uuid;
    finance_id uuid;
    compliance_id uuid;
    investor_relations_id uuid;
    case_analyst_id uuid;
    perm_record RECORD;
BEGIN
    SELECT id INTO operations_id FROM roles WHERE slug = 'operations';
    SELECT id INTO finance_id FROM roles WHERE slug = 'finance';
    SELECT id INTO compliance_id FROM roles WHERE slug = 'compliance';
    SELECT id INTO investor_relations_id FROM roles WHERE slug = 'investor_relations';
    SELECT id INTO case_analyst_id FROM roles WHERE slug = 'case_analyst';

    -- Operations gets cases and users view
    FOR perm_record IN SELECT id FROM permissions WHERE key IN ('cases.view', 'users.view', 'transactions.view') LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (operations_id, perm_record.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Finance gets transactions view, manage, and payout
    FOR perm_record IN SELECT id FROM permissions WHERE key IN ('transactions.view', 'transactions.manage', 'finance.payout') LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (finance_id, perm_record.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Compliance gets audit view and users view
    FOR perm_record IN SELECT id FROM permissions WHERE key IN ('audit.view', 'users.view') LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (compliance_id, perm_record.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Investor Relations gets users view and cases view public
    FOR perm_record IN SELECT id FROM permissions WHERE key IN ('users.view', 'cases.view_public') LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (investor_relations_id, perm_record.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Case Analyst gets cases view and manage
    FOR perm_record IN SELECT id FROM permissions WHERE key IN ('cases.view', 'cases.manage') LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (case_analyst_id, perm_record.id) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 3. Add remaining partners (3 more to make 6)
INSERT INTO partners (name_ar, name_en, sort_order) VALUES
('مؤسسة العدالة', 'Justice Foundation', 4),
('شركاء الأعمال', 'Business Partners', 5),
('الرواد للمحاماة', 'Pioneers Law', 6);

-- 4. Add clients (8 total)
INSERT INTO clients (name_ar, name_en, sort_order) VALUES
('شركة التقنية', 'Tech Co', 1),
('مجموعة البناء', 'Build Group', 2),
('مؤسسة التجارة', 'Trade Corp', 3),
('مصنع الصناعات', 'Industries Plant', 4),
('شركة النقل', 'Transport Co', 5),
('مجموعة العقارات', 'Real Estate Group', 6),
('شركة الخدمات', 'Services Co', 7),
('مؤسسة التعليم', 'Edu Foundation', 8);

-- 5. Add testimonials (6 total)
INSERT INTO comments (author_name, author_role_ar, author_role_en, content_ar, content_en, rating, is_approved, is_testimonial) VALUES
('أحمد محمد', 'مستثمر', 'Investor', 'تجربة ممتازة وعوائد مجزية', 'Excellent experience and rewarding returns', 5, true, true),
('سارة الخالد', 'صاحب قضية', 'Applicant', 'تمويل سريع وشفافية عالية', 'Fast funding and high transparency', 5, true, true),
('فهد العتيبي', 'مستثمر', 'Investor', 'منصة موثوقة وفريق محترف', 'Reliable platform and professional team', 4, true, true),
('نورة السعيد', 'محامي', 'Lawyer', 'نظام مرن يسهل عملنا', 'Flexible system that eases our work', 5, true, true),
('عمر عبدالله', 'مستثمر', 'Investor', 'فرص متنوعة ومخاطر واضحة', 'Diverse opportunities and clear risks', 4, true, true),
('خالد العبدالرحمن', 'صاحب قضية', 'Applicant', 'أنقذوا قضيتي من التعثر', 'They saved my case from faltering', 5, true, true);

-- 6. Add remaining FAQs (5 more to make 8)
INSERT INTO faqs (question_ar, question_en, answer_ar, answer_en, sort_order) VALUES
('ما هو الحد الأدنى للاستثمار؟', 'What is the minimum investment?', 'الحد الأدنى هو 1000 ريال.', 'The minimum is 1000 SAR.', 4),
('كم تستغرق مراجعة القضية؟', 'How long does case review take?', 'عادة بين 14 و 30 يوماً.', 'Usually between 14 and 30 days.', 5),
('هل يمكن سحب الاستثمار؟', 'Can I withdraw my investment?', 'لا، الاستثمار مرتبط بمدة القضية.', 'No, the investment is tied to the case duration.', 6),
('ما هي الرسوم؟', 'What are the fees?', 'نستقطع نسبة من الأرباح عند النجاح فقط.', 'We take a percentage of profits upon success only.', 7),
('هل بياناتي آمنة؟', 'Is my data safe?', 'نعم، نستخدم أعلى معايير التشفير.', 'Yes, we use the highest encryption standards.', 8);

-- 7. Add demo cases (8 total)
INSERT INTO cases (case_number, title_ar, title_en, description_ar, description_en, case_type, court, claim_amount, requested_funding, funded_amount, expected_return_min, expected_return_max, duration_months, risk_level, status) VALUES
('C-1001', 'نزاع مقاولات', 'Construction Dispute', 'مطالبة بمستحقات مقاول', 'Contractor dues claim', 'commercial', 'المحكمة التجارية', 5000000, 500000, 325000, 15, 25, 18, 'medium', 'funding_open'),
('C-1002', 'فسخ عقد إيجار', 'Lease Termination', 'مطالبة بإخلاء عقار تجاري', 'Commercial property eviction', 'real_estate', 'المحكمة العامة', 2000000, 200000, 200000, 12, 18, 12, 'low', 'funded'),
('C-1003', 'تعويض عمالي', 'Labor Compensation', 'مستحقات نهاية خدمة', 'End of service benefits', 'labor', 'المحكمة العمالية', 500000, 50000, 50000, 10, 15, 6, 'low', 'in_litigation'),
('C-1004', 'نزاع شركاء', 'Partnership Dispute', 'تصفية شركة', 'Company liquidation', 'commercial', 'المحكمة التجارية', 10000000, 1000000, 0, 20, 35, 24, 'high', 'approved'),
('C-1005', 'مطالبة تأمين', 'Insurance Claim', 'تعويض عن حريق', 'Fire compensation', 'commercial', 'اللجان شبه القضائية', 3000000, 300000, 0, 12, 20, 18, 'medium', 'committee_review'),
('C-1006', 'تنفيذ شيك', 'Cheque Execution', 'شيك بدون رصيد', 'Bounced cheque', 'execution', 'محكمة التنفيذ', 1000000, 100000, 100000, 8, 12, 3, 'low', 'won'),
('C-1007', 'نزاع علامة تجارية', 'Trademark Dispute', 'تعدي على حقوق ملكية', 'IP infringement', 'commercial', 'المحكمة التجارية', 4000000, 400000, 0, 18, 30, 24, 'high', 'under_review'),
('C-1008', 'تحكيم هندسي', 'Engineering Arbitration', 'خلاف حول مواصفات', 'Dispute over specs', 'arbitration', 'مركز التحكيم', 8000000, 800000, 400000, 15, 25, 18, 'medium', 'funding_open');

-- 8. Create a demo notification for super_admin
DO $$
DECLARE
    super_admin_profile_id uuid;
BEGIN
    -- We assume there's at least one super_admin created, but if not, this will just gracefully do nothing
    SELECT id INTO super_admin_profile_id FROM profiles WHERE user_type = 'staff' LIMIT 1;
    IF super_admin_profile_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title_ar, title_en, body_ar, body_en) VALUES
        (super_admin_profile_id, 'مرحباً بك في إنصاف', 'Welcome to INSAF', 'تم إعداد النظام بنجاح.', 'System setup completed successfully.');
    END IF;
END $$;
