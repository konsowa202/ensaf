-- 0009_fixes.sql
-- Fixes for R4 QA

CREATE TABLE IF NOT EXISTS contact_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    created_at timestamptz DEFAULT NOW()
);


-- 1. Fix notify_case_approved to match 0001 schema
CREATE OR REPLACE FUNCTION notify_case_approved() RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO notifications (user_id, title_ar, title_en, body_ar, body_en)
        VALUES (
            NEW.applicant_id,
            'تمت الموافقة على قضيتك',
            'Your Case is Approved',
            'وافقت اللجنة القضائية على قضيتك: ' || NEW.title_ar,
            'The Judicial Committee has approved your case: ' || NEW.title_en
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Roles & Permissions RPCs
CREATE OR REPLACE FUNCTION admin_create_role(p_name_ar text, p_name_en text, p_slug text)
RETURNS uuid AS $$
DECLARE
  v_role_id uuid;
BEGIN
  IF NOT has_permission(auth.uid(), 'roles.manage') THEN
    RAISE EXCEPTION 'Forbidden: roles.manage required';
  END IF;
  
  INSERT INTO roles (name_ar, name_en, slug)
  VALUES (p_name_ar, p_name_en, p_slug)
  RETURNING id INTO v_role_id;
  
  RETURN v_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_set_role_permissions(p_role_id uuid, p_permission_keys text[])
RETURNS void AS $$
BEGIN
  IF NOT has_permission(auth.uid(), 'roles.manage') THEN
    RAISE EXCEPTION 'Forbidden: roles.manage required';
  END IF;
  
  -- Delete existing permissions for this role
  DELETE FROM role_permissions WHERE role_id = p_role_id;
  
  -- Insert new permissions
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT p_role_id, p.id 
  FROM permissions p 
  WHERE p.key = ANY(p_permission_keys);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Document upload storage bucket and RLS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('case-documents', 'case-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Owner sees own docs" ON storage.objects;
CREATE POLICY "Owner sees own docs" ON storage.objects FOR SELECT USING (bucket_id = 'case-documents' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Owner uploads own docs" ON storage.objects;
CREATE POLICY "Owner uploads own docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'case-documents' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Committee sees all docs" ON storage.objects;
CREATE POLICY "Committee sees all docs" ON storage.objects FOR SELECT USING (bucket_id = 'case-documents' AND has_permission(auth.uid(), 'cases.view'));

-- 4. Notification trigger for investments
CREATE OR REPLACE FUNCTION notify_investment_confirmed() RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'confirmed' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'confirmed')) THEN
        -- Notify Investor
        INSERT INTO notifications (user_id, title_ar, title_en, body_ar, body_en)
        VALUES (
            NEW.investor_id,
            'تم تأكيد الاستثمار',
            'Investment Confirmed',
            'تم تأكيد استثمارك بمبلغ ' || NEW.amount || ' ريال',
            'Your investment of ' || NEW.amount || ' SAR has been confirmed'
        );
        
        -- Notify Applicant
        INSERT INTO notifications (user_id, title_ar, title_en, body_ar, body_en)
        SELECT 
            c.applicant_id,
            'تمويل جديد',
            'New Funding',
            'تم استثمار ' || NEW.amount || ' ريال في قضيتك',
            'An investment of ' || NEW.amount || ' SAR was made in your case'
        FROM cases c WHERE c.id = NEW.case_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_investment_confirmed ON investments;
CREATE TRIGGER on_investment_confirmed
    AFTER INSERT OR UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION notify_investment_confirmed();

-- 5. Cap demo deposit
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
    
    IF p_amount > 1000000 THEN
        RAISE EXCEPTION 'Demo deposit limit is 1,000,000 SAR';
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
    VALUES (v_user_id, 'deposit', p_amount, 'completed', 'DEMO-' || encode(gen_random_bytes(6), 'hex'));

    RETURN json_build_object('success', true, 'message', 'Deposit successful');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
