-- 0014: users.view permission must actually grant read access to profiles.
-- Previously only users.manage could read all profiles, making users.view useless
-- for compliance / investor_relations / operations roles.

DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;

CREATE POLICY "Staff can view all profiles" ON public.profiles
FOR SELECT USING (
  has_permission(auth.uid(), 'users.manage'::text)
  OR has_permission(auth.uid(), 'users.view'::text)
);

-- UPDATE stays restricted to users.manage (view ≠ manage) — unchanged.
