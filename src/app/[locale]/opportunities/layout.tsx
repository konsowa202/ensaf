import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { getNavItems } from '@/components/dashboard/nav';

export default async function OpportunitiesLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // Guests (public browsing) keep the standalone page chrome.
  if (!user) {
    return <div className="min-h-screen bg-surface">{children}</div>;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name_ar, full_name_en, user_type, roles(name_ar, name_en, slug)')
    .eq('id', user.id)
    .single();

  const isAr = locale !== 'en';
  const roleObj = Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles;
  const name =
    (isAr ? profile?.full_name_ar : profile?.full_name_en) ||
    profile?.full_name_ar ||
    profile?.full_name_en ||
    '';

  let roleName = roleObj ? (isAr ? roleObj.name_ar : roleObj.name_en) : '';
  if (!roleName) {
    if (profile?.user_type === 'applicant') roleName = isAr ? 'صاحب قضية' : 'Claimant';
    else if (profile?.user_type === 'investor') roleName = isAr ? 'مستثمر' : 'Investor';
    else roleName = isAr ? 'مستخدم المنصة' : 'User';
  }

  const userContext = {
    name,
    roleSlug: roleObj?.slug || profile?.user_type || 'applicant',
    roleName,
    userType: profile?.user_type || 'applicant',
    isDashboard: true,
  };

  // Logged-in users get the persistent dashboard shell (fixed sidebar + topbar).
  const { items } = await getNavItems(locale);
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar locale={locale} />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <TopBar locale={locale} userContext={userContext} />
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {children}
        </div>
      </main>
      <MobileNav locale={locale} items={items} />
    </div>
  );
}
