-- 0013: Staff test accounts — one per role, so every permission set can be
-- tested end-to-end. All passwords: 123456
-- Emails: <role>@insaf.test

CREATE OR REPLACE FUNCTION public.create_staff_test_user(
  p_email text, p_full_name text, p_role_slug text, p_password text DEFAULT '123456'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $function$
DECLARE
  v_id uuid := gen_random_uuid();
  v_role_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM roles WHERE slug = p_role_slug;
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role not found: %', p_role_slug;
  END IF;

  -- Reuse existing account if the email is already registered
  SELECT id INTO v_id FROM auth.users WHERE email = p_email;
  IF v_id IS NULL THEN
    v_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_sso_user, is_anonymous
    ) VALUES (
      v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      p_email, crypt(p_password, gen_salt('bf')),
      NOW(), NOW(), NOW(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object(
        'sub', v_id::text, 'email', p_email,
        'full_name', p_full_name, 'user_type', 'staff',
        'email_verified', true, 'phone_verified', false
      ),
      false, false
    );
  END IF;

  -- Profile is created by handle_new_user trigger; ensure it exists and set role
  INSERT INTO public.profiles (id, full_name_ar, email, user_type, role_id)
  VALUES (v_id, p_full_name, p_email, 'staff', v_role_id)
  ON CONFLICT (id) DO UPDATE
    SET role_id = v_role_id, user_type = 'staff',
        full_name_ar = EXCLUDED.full_name_ar, updated_at = NOW();

  -- Wallet
  INSERT INTO public.wallets (user_id) VALUES (v_id) ON CONFLICT (user_id) DO NOTHING;

  RETURN v_id;
END;
$function$;

SELECT create_staff_test_user('analyst@insaf.test',   'محلل القضايا',        'case_analyst');
SELECT create_staff_test_user('committee@insaf.test', 'عضو اللجنة القضائية', 'judicial_committee');
SELECT create_staff_test_user('finance@insaf.test',   'مسؤول المالية',       'finance');
SELECT create_staff_test_user('compliance@insaf.test','مسؤول الامتثال',      'compliance');
SELECT create_staff_test_user('relations@insaf.test', 'علاقات المستثمرين',   'investor_relations');
SELECT create_staff_test_user('operations@insaf.test','مسؤول العمليات',      'operations');
