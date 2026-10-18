import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { SidebarNavItem } from '@/components/dashboard/SidebarNav';

const PERM_KEYS = [
  'admin.access',
  'cases.review',
  'cases.approve',
  'cases.manage',
  'cases.view',
  'users.view',
  'users.manage',
  'content.manage',
  'roles.view',
  'roles.manage',
  'transactions.view',
  'finance.payout',
  'audit.view',
  'settings.manage',
] as const;

export type NavProfile = {
  userName: string | null;
  roleName: string | null;
  avatarUrl: string | null;
};

// Single source of truth for the dashboard navigation. Used by the desktop
// Sidebar and the mobile menu in TopBar so both always match the user's
// actual permissions.
export async function getNavItems(locale: string): Promise<{ items: SidebarNavItem[]; profile: NavProfile }> {
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const perms: Record<string, boolean> = {};
  const profile: NavProfile = { userName: null, roleName: null, avatarUrl: null };

  if (user) {
    const [profileRes, ...permResults] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name_ar, full_name_en, avatar_url, roles(name_ar, name_en, slug)')
        .eq('id', user.id)
        .single(),
      ...PERM_KEYS.map((k) => supabase.rpc('has_permission', { uid: user.id, perm_key: k })),
    ]);

    PERM_KEYS.forEach((k, i) => {
      perms[k] = !!permResults[i]?.data;
    });

    const p = profileRes.data as {
      full_name_ar?: string;
      full_name_en?: string;
      avatar_url?: string | null;
      roles?: { name_ar: string; name_en: string; slug: string } | { name_ar: string; name_en: string; slug: string }[] | null;
    } | null;

    profile.userName = (isAr ? p?.full_name_ar : p?.full_name_en) || p?.full_name_ar || null;
    profile.avatarUrl = p?.avatar_url || null;
    const role = Array.isArray(p?.roles) ? p?.roles[0] : p?.roles;
    profile.roleName = role ? (isAr ? role.name_ar : role.name_en) : null;
  }

  const isAdmin = perms['admin.access'];
  const canReview = perms['cases.review'] || perms['cases.approve'] || perms['cases.manage'] || isAdmin;
  const canViewCases = perms['cases.view'] || perms['cases.manage'] || canReview || isAdmin;
  const canManageUsers = perms['users.manage'] || isAdmin;
  const canViewUsers = perms['users.view'] || canManageUsers || isAdmin;
  const canManageRoles = perms['roles.view'] || perms['roles.manage'] || isAdmin;
  const canManageContent = perms['content.manage'] || isAdmin;
  const canViewFinance = perms['transactions.view'] || perms['finance.payout'] || isAdmin;
  const canViewAudit = perms['audit.view'] || isAdmin;
  const canManageSettings = perms['settings.manage'] || isAdmin;

  const secCases = isAr ? 'القضايا' : 'Cases';
  const secFinance = isAr ? 'المالية' : 'Finance';
  const secPeople = isAr ? 'المستخدمون' : 'People';
  const secPlatform = isAr ? 'إدارة المنصة' : 'Platform Admin';

  const items: SidebarNavItem[] = [
    { href: `/${locale}/dashboard`, label: isAr ? 'اللوحة الرئيسية' : 'Dashboard', icon: 'home' },
    { href: `/${locale}/dashboard/profile`, label: isAr ? 'الملف الشخصي' : 'My Profile', icon: 'user' },
    { href: `/${locale}/opportunities`, label: isAr ? 'الفرص الاستثمارية' : 'Opportunities', icon: 'briefcase' },
    ...(canViewCases ? [{ href: `/${locale}/dashboard/pipeline`, label: isAr ? 'خط سير القضايا' : 'Case Pipeline', icon: 'kanban' as const, section: secCases }] : []),
    ...(canReview ? [{ href: `/${locale}/committee`, label: isAr ? 'اللجنة القضائية' : 'Committee', icon: 'scale' as const, section: secCases }] : []),
    ...(canViewFinance ? [{ href: `/${locale}/admin/finance`, label: isAr ? 'المالية والمحافظ' : 'Finance & Wallets', icon: 'landmark' as const, section: secFinance }] : []),
    ...(canManageUsers ? [{ href: `/${locale}/dashboard/kyc`, label: isAr ? 'توثيق الهوية (KYC)' : 'KYC Queue', icon: 'shield-check' as const, section: secPeople }] : []),
    ...(canViewUsers ? [{ href: `/${locale}/dashboard/relations`, label: isAr ? 'علاقات المستثمرين' : 'Investor Relations', icon: 'handshake' as const, section: secPeople }] : []),
    ...(isAdmin ? [{ href: `/${locale}/admin`, label: isAr ? 'لوحة الإدارة' : 'Admin Panel', icon: 'settings' as const, section: secPlatform }] : []),
    ...(canManageRoles ? [{ href: `/${locale}/admin/roles`, label: isAr ? 'المستخدمين والصلاحيات' : 'Users & Roles', icon: 'users' as const, section: secPlatform }] : []),
    ...(canManageContent ? [{ href: `/${locale}/admin/cms`, label: isAr ? 'إدارة المحتوى' : 'Content (CMS)', icon: 'pen-square' as const, section: secPlatform }] : []),
    ...(canViewAudit ? [{ href: `/${locale}/admin/audit`, label: isAr ? 'سجل التدقيق' : 'Audit Log', icon: 'scroll-text' as const, section: secPlatform }] : []),
    ...(canManageSettings ? [{ href: `/${locale}/admin/settings`, label: isAr ? 'إعدادات المنصة' : 'Platform Settings', icon: 'sliders' as const, section: secPlatform }] : []),
  ];

  return { items, profile };
}
