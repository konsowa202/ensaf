import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminClientView from '@/components/dashboard/AdminClientView';

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch KPIs
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalCases } = await supabase.from('cases').select('*', { count: 'exact', head: true });
  const { data: investments } = await supabase.from('investments').select('amount');
  const totalInvestments = investments?.reduce((acc, i) => acc + Number(i.amount), 0) || 0;

  // Fetch cases pipeline
  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {locale === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard'}
        </h1>
      </div>

      <AdminClientView 
        locale={locale} 
        cases={cases || []} 
        kpis={{
          totalUsers: totalUsers || 0,
          totalCases: totalCases || 0,
          totalInvestments
        }} 
      />
    </div>
  );
}
