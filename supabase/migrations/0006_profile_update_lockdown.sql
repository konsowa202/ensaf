-- 0006_profile_update_lockdown.sql
-- Added by QA Round 2: fixes privilege-escalation hole found during live testing.
-- The 0001 policy "Users can update own profile" lets ANY user update ALL columns of
-- their own row — QA proved a live investor could set user_type='staff' (and could
-- likewise set role_id / kyc_status='verified'). Column-level grants fix this.
-- Apply in Supabase SQL Editor AFTER 0001-0005. Safe to re-run.

-- 1. Remove the table-wide UPDATE privilege; allow only safe self-service columns
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name_ar, full_name_en, phone, national_id, avatar_url, preferred_locale)
  ON public.profiles TO authenticated;

-- 2. Privileged profile changes go through SECURITY DEFINER functions
--    that enforce has_permission('users.manage') server-side.
CREATE OR REPLACE FUNCTION admin_set_user_role(p_user_id uuid, p_role_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT has_permission(auth.uid(), 'users.manage') THEN
    RAISE EXCEPTION 'Forbidden: users.manage required';
  END IF;
  UPDATE public.profiles SET role_id = p_role_id, user_type = 'staff' WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_set_kyc_status(p_user_id uuid, p_status text)
RETURNS void AS $$
BEGIN
  IF NOT has_permission(auth.uid(), 'users.manage') THEN
    RAISE EXCEPTION 'Forbidden: users.manage required';
  END IF;
  IF p_status NOT IN ('pending', 'verified', 'rejected') THEN
    RAISE EXCEPTION 'Invalid kyc_status';
  END IF;
  UPDATE public.profiles SET kyc_status = p_status WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-apply missing audit_logs insert policy (live probe in R2 showed it inactive)
DROP POLICY IF EXISTS "Users insert own audit rows" ON audit_logs;
CREATE POLICY "Users insert own audit rows" ON audit_logs
  FOR INSERT WITH CHECK (actor_id = auth.uid());
