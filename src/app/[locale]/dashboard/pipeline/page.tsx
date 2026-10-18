import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PipelineClientView from '@/components/dashboard/PipelineClientView';

export default async function PipelinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const [{ data: canView }, { data: canManage }] = await Promise.all([
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'cases.view' }),
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'cases.manage' }),
  ]);
  if (!canView && !canManage) redirect(`/${locale}/dashboard`);

  const { data: cases } = await supabase
    .from('cases')
    .select('id, case_number, title_ar, title_en, status, requested_funding, funded_amount, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{isAr ? 'خط سير القضايا' : 'Case Pipeline'}</h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? 'تابع حركة كل قضية عبر مراحل المنصة وحرّكها للمرحلة التالية' : 'Track every case across platform stages and move it forward'}
        </p>
      </div>
      <PipelineClientView locale={locale} cases={cases || []} canManage={!!canManage} />
    </div>
  );
}
