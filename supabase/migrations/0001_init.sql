-- 0001_init.sql
-- Core Schema for INSAF Litigation Funding Platform

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Roles & Permissions Tables first (needed for profiles)
CREATE TABLE roles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    slug text UNIQUE NOT NULL,
    is_system boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE permissions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    "group" text NOT NULL,
    label_ar text NOT NULL,
    label_en text NOT NULL
);

CREATE TABLE role_permissions (
    role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
    permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 3. Create Profiles Table (Extends auth.users)
CREATE TABLE profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name_ar text,
    full_name_en text,
    email text,
    phone text,
    national_id text,
    user_type text CHECK (user_type IN ('investor', 'applicant', 'staff')),
    role_id uuid REFERENCES roles(id),
    kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    avatar_url text,
    preferred_locale text DEFAULT 'ar',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Helper function to check permissions
CREATE OR REPLACE FUNCTION has_permission(uid uuid, perm_key text) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN role_permissions rp ON p.role_id = rp.role_id
    JOIN permissions perm ON rp.permission_id = perm.id
    WHERE p.id = uid AND perm.key = perm_key
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Create Core Tables

CREATE TABLE cases (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_number text UNIQUE NOT NULL,
    applicant_id uuid REFERENCES profiles(id) NOT NULL,
    title_ar text NOT NULL,
    title_en text NOT NULL,
    description_ar text NOT NULL,
    description_en text NOT NULL,
    case_type text CHECK (case_type IN ('commercial','civil','labor','real_estate','arbitration','execution','other')),
    court text NOT NULL,
    claim_amount numeric NOT NULL,
    requested_funding numeric NOT NULL,
    funded_amount numeric DEFAULT 0,
    expected_return_min numeric NOT NULL,
    expected_return_max numeric NOT NULL,
    duration_months integer NOT NULL,
    risk_level text CHECK (risk_level IN ('low','medium','high')),
    status text CHECK (status IN ('draft','submitted','under_review','committee_review','approved','rejected','funding_open','funded','in_litigation','settled','won','lost','closed')),
    committee_decision text,
    committee_notes text,
    reviewed_by uuid REFERENCES profiles(id),
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE case_documents (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
    uploaded_by uuid REFERENCES profiles(id),
    doc_type text CHECK (doc_type IN ('power_of_attorney','court_filing','evidence','contract','id_doc','other')),
    file_path text NOT NULL,
    file_name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE case_reviews (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
    reviewer_id uuid REFERENCES profiles(id),
    legal_strength integer CHECK (legal_strength BETWEEN 1 AND 10),
    enforceability integer CHECK (enforceability BETWEEN 1 AND 10),
    counterparty_solvency integer CHECK (counterparty_solvency BETWEEN 1 AND 10),
    overall_score numeric,
    recommendation text CHECK (recommendation IN ('approve','reject','request_info')),
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE investments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    investor_id uuid REFERENCES profiles(id),
    case_id uuid REFERENCES cases(id),
    amount numeric NOT NULL,
    status text CHECK (status IN ('pending','confirmed','returned','lost','cancelled')),
    expected_share numeric,
    actual_return numeric,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE transactions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id),
    case_id uuid REFERENCES cases(id),
    type text CHECK (type IN ('deposit','investment','payout','refund','fee')),
    amount numeric NOT NULL,
    status text,
    reference text UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE wallets (
    user_id uuid REFERENCES profiles(id) PRIMARY KEY,
    balance numeric DEFAULT 0,
    locked_balance numeric DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id),
    title_ar text NOT NULL,
    title_en text NOT NULL,
    body_ar text NOT NULL,
    body_en text NOT NULL,
    is_read boolean DEFAULT false,
    link text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE comments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_name text NOT NULL,
    author_role_ar text,
    author_role_en text,
    content_ar text NOT NULL,
    content_en text NOT NULL,
    rating integer CHECK (rating BETWEEN 1 AND 5),
    is_approved boolean DEFAULT false,
    is_testimonial boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE partners (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    logo_url text,
    website text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true
);

CREATE TABLE clients (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    logo_url text,
    website text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true
);

CREATE TABLE faqs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_ar text NOT NULL,
    question_en text NOT NULL,
    answer_ar text NOT NULL,
    answer_en text NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true
);

CREATE TABLE contact_messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE audit_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    actor_id uuid REFERENCES profiles(id),
    action text NOT NULL,
    entity text NOT NULL,
    entity_id uuid,
    metadata jsonb,
    ip text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE platform_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL
);

-- View for Public Cases
CREATE VIEW public_cases AS
SELECT 
    id, case_number, title_ar, title_en, description_ar, description_en, 
    case_type, court, claim_amount, requested_funding, funded_amount, 
    expected_return_min, expected_return_max, duration_months, risk_level, status
FROM cases
WHERE status IN ('funding_open', 'funded', 'in_litigation', 'settled', 'won');

-- Trigger to update 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_cases_modtime BEFORE UPDATE ON cases FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_wallets_modtime BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Create wallet and profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name_ar, email, user_type)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'user_type');
  
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();


-- Row Level Security (RLS)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: user reads/updates own row; staff with users.manage reads all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON profiles FOR SELECT USING (has_permission(auth.uid(), 'users.manage'));
CREATE POLICY "Staff can update all profiles" ON profiles FOR UPDATE USING (has_permission(auth.uid(), 'users.manage'));

-- Cases
CREATE POLICY "Applicant sees own cases" ON cases FOR SELECT USING (applicant_id = auth.uid());
CREATE POLICY "Investors see public cases" ON cases FOR SELECT USING (
    has_permission(auth.uid(), 'cases.view_public') OR 
    status IN ('funding_open','funded','in_litigation','settled','won')
);
CREATE POLICY "Committee sees review cases" ON cases FOR SELECT USING (
    has_permission(auth.uid(), 'cases.approve') AND status IN ('submitted','under_review','committee_review')
);
CREATE POLICY "Admin sees all cases" ON cases FOR SELECT USING (has_permission(auth.uid(), 'cases.view'));

-- Case Documents
CREATE POLICY "Owner sees own docs" ON case_documents FOR SELECT USING (uploaded_by = auth.uid() OR case_id IN (SELECT id FROM cases WHERE applicant_id = auth.uid()));
CREATE POLICY "Committee/Admin sees all docs" ON case_documents FOR SELECT USING (has_permission(auth.uid(), 'cases.approve') OR has_permission(auth.uid(), 'cases.view'));

-- Investments
CREATE POLICY "Owner sees own investments" ON investments FOR SELECT USING (investor_id = auth.uid());
CREATE POLICY "Admin sees all investments" ON investments FOR SELECT USING (has_permission(auth.uid(), 'transactions.view'));

-- Transactions
CREATE POLICY "Owner sees own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin sees all transactions" ON transactions FOR SELECT USING (has_permission(auth.uid(), 'transactions.view'));

-- Wallets
CREATE POLICY "Owner sees own wallet" ON wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin sees all wallets" ON wallets FOR SELECT USING (has_permission(auth.uid(), 'transactions.view'));

-- Roles & Permissions
CREATE POLICY "Staff sees roles" ON roles FOR SELECT USING (has_permission(auth.uid(), 'roles.view'));
CREATE POLICY "Staff manages roles" ON roles FOR ALL USING (has_permission(auth.uid(), 'roles.manage'));

CREATE POLICY "Staff sees permissions" ON permissions FOR SELECT USING (has_permission(auth.uid(), 'roles.view'));
CREATE POLICY "Staff sees role_permissions" ON role_permissions FOR SELECT USING (has_permission(auth.uid(), 'roles.view'));
CREATE POLICY "Staff manages role_permissions" ON role_permissions FOR ALL USING (has_permission(auth.uid(), 'roles.manage'));

-- Content (Public reads, admin writes)
CREATE POLICY "Public reads partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Admin manages partners" ON partners FOR ALL USING (has_permission(auth.uid(), 'content.manage'));

CREATE POLICY "Public reads clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Admin manages clients" ON clients FOR ALL USING (has_permission(auth.uid(), 'content.manage'));

CREATE POLICY "Public reads faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Admin manages faqs" ON faqs FOR ALL USING (has_permission(auth.uid(), 'content.manage'));

CREATE POLICY "Public reads comments" ON comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Admin manages comments" ON comments FOR ALL USING (has_permission(auth.uid(), 'content.manage'));

-- Platform Settings
CREATE POLICY "Public reads settings" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Admin manages settings" ON platform_settings FOR ALL USING (has_permission(auth.uid(), 'settings.manage'));

-- Audit Logs
CREATE POLICY "Admin sees audit logs" ON audit_logs FOR SELECT USING (has_permission(auth.uid(), 'audit.view'));
