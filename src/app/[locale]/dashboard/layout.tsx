import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { InsafAiAssistant, type UserContext } from '@/components/landing/InsafAiAssistant';
import { getNavItems } from '@/components/dashboard/nav';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userContext: UserContext | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name_ar, full_name_en, user_type, roles(name_ar, name_en, slug)')
      .eq('id', user.id)
      .single();

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

    const roleSlug = roleObj?.slug || profile?.user_type || 'applicant';

    userContext = {
      name,
      roleSlug,
      roleName,
      userType: profile?.user_type || 'applicant',
      isDashboard: true,
    };
  }

  const { items } = await getNavItems(locale);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar locale={locale} />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <TopBar locale={locale} userContext={userContext} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-6 lg:pb-8 overflow-y-auto">{children}</div>
      </main>
      <MobileNav locale={locale} items={items} />
    </div>
  );
}
