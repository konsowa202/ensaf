-- 0003_rls_fixes.sql
-- Added by QA pass: closes RLS/storage gaps found in 0001_init.sql.
-- Idempotent: safe to re-run. Apply AFTER 0001_init.sql and 0002_seed.sql.

-- ============ MISSING TABLE POLICIES ============

-- profiles: allow a user to insert their own row (backstop if handle_new_user
-- trigger is missing/fails; the SECURITY DEFINER trigger remains the primary path)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- cases: applicant can create and edit their own draft/submitted cases
DROP POLICY IF EXISTS "Applicant inserts own cases" ON cases;
CREATE POLICY "Applicant inserts own cases" ON cases
  FOR INSERT WITH CHECK (applicant_id = auth.uid() AND status IN ('draft', 'submitted'));
DROP POLICY IF EXISTS "Applicant updates own draft cases" ON cases;
CREATE POLICY "Applicant updates own draft cases" ON cases
  FOR UPDATE USING (applicant_id = auth.uid() AND status IN ('draft', 'submitted'));
DROP POLICY IF EXISTS "Staff manage cases" ON cases;
CREATE POLICY "Staff manage cases" ON cases
  FOR UPDATE USING (has_permission(auth.uid(), 'cases.manage') OR has_permission(auth.uid(), 'cases.approve'));

-- case_documents: case owner can upload documents for their own cases
DROP POLICY IF EXISTS "Owner inserts docs" ON case_documents;
CREATE POLICY "Owner inserts docs" ON case_documents
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    AND case_id IN (SELECT id FROM cases WHERE applicant_id = auth.uid())
  );

-- case_reviews: table previously had ZERO policies (locked everyone out)
DROP POLICY IF EXISTS "Committee reads reviews" ON case_reviews;
CREATE POLICY "Committee reads reviews" ON case_reviews
  FOR SELECT USING (
    has_permission(auth.uid(), 'cases.approve') OR has_permission(auth.uid(), 'cases.view')
  );
DROP POLICY IF EXISTS "Committee inserts reviews" ON case_reviews;
CREATE POLICY "Committee inserts reviews" ON case_reviews
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid() AND has_permission(auth.uid(), 'cases.approve')
  );

-- investments: investor can create their own investment
DROP POLICY IF EXISTS "Investor inserts own investments" ON investments;
CREATE POLICY "Investor inserts own investments" ON investments
  FOR INSERT WITH CHECK (investor_id = auth.uid());

-- transactions: user can create their own transaction rows
DROP POLICY IF EXISTS "Owner inserts own transactions" ON transactions;
CREATE POLICY "Owner inserts own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- notifications: table previously had ZERO policies
DROP POLICY IF EXISTS "Owner reads own notifications" ON notifications;
CREATE POLICY "Owner reads own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Owner updates own notifications" ON notifications;
CREATE POLICY "Owner updates own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Staff broadcasts notifications" ON notifications;
CREATE POLICY "Staff broadcasts notifications" ON notifications
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'users.manage'));

-- contact_messages: table previously had ZERO policies.
-- Public (anon) insert is the standard contact-form pattern; rate-limit at app layer.
DROP POLICY IF EXISTS "Anyone can send contact message" ON contact_messages;
CREATE POLICY "Anyone can send contact message" ON contact_messages
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Staff reads contact messages" ON contact_messages;
CREATE POLICY "Staff reads contact messages" ON contact_messages
  FOR SELECT USING (has_permission(auth.uid(), 'content.manage'));
DROP POLICY IF EXISTS "Staff updates contact messages" ON contact_messages;
CREATE POLICY "Staff updates contact messages" ON contact_messages
  FOR UPDATE USING (has_permission(auth.uid(), 'content.manage'));

-- audit_logs: allow authenticated users to insert their own audit rows
-- (server actions run as the user when only the publishable key is in use)
DROP POLICY IF EXISTS "Users insert own audit rows" ON audit_logs;
CREATE POLICY "Users insert own audit rows" ON audit_logs
  FOR INSERT WITH CHECK (actor_id = auth.uid());

-- ============ STORAGE (spec section 5.4) ============

INSERT INTO storage.buckets (id, name, public) VALUES
  ('case-documents', 'case-documents', false),
  ('avatars', 'avatars', true),
  ('content-media', 'content-media', true)
ON CONFLICT (id) DO NOTHING;

-- case-documents: authenticated users upload to a folder named by case id;
-- read restricted to uploader's own folder path prefix or committee/admin.
DROP POLICY IF EXISTS "Authenticated upload case docs" ON storage.objects;
CREATE POLICY "Authenticated upload case docs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'case-documents');
DROP POLICY IF EXISTS "Read case docs" ON storage.objects;
CREATE POLICY "Read case docs" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'case-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR has_permission(auth.uid(), 'cases.approve')
      OR has_permission(auth.uid(), 'cases.view')
    )
  );

-- avatars: public read, users write only into their own folder
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users write own avatar" ON storage.objects;
CREATE POLICY "Users write own avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- content-media: public read, write only with content.manage
DROP POLICY IF EXISTS "Public read content media" ON storage.objects;
CREATE POLICY "Public read content media" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-media');
DROP POLICY IF EXISTS "Staff write content media" ON storage.objects;
CREATE POLICY "Staff write content media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'content-media' AND has_permission(auth.uid(), 'content.manage')
  );
