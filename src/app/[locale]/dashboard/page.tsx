import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import InvestorDashboard from '@/components/dashboard/InvestorDashboard';
import ApplicantDashboard from '@/components/dashboard/ApplicantDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, full_name_ar, full_name_en, role_id, roles(name_ar, name_en, slug)')
    .eq('id', user.id)
    .single();

  // Staff members (any role) get the role-aware staff hub —
  // each role sees only what its permissions allow; super_admin sees everything.
  if (profile?.role_id || profile?.user_type === 'staff') {
    return <StaffDashboard locale={locale} profile={profile} />;
  }

  if (profile?.user_type === 'investor') {
    return <InvestorDashboard locale={locale} profile={profile} />;
  } else if (profile?.user_type === 'applicant') {
    return <ApplicantDashboard locale={locale} profile={profile} />;
  }

  // Fallback (e.g., if staff bypasses middleware somehow)
  redirect(`/${locale}/admin`);
}
