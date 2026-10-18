import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UserFinancialsView from '@/components/dashboard/UserFinancialsView';

export default async function FinanceUserPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const [{ data: canView }, { data: canPay }, { data: isAdmin }] = await Promise.all([
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'transactions.view' }),
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'finance.payout' }),
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'admin.access' }),
  ]);
  if (!canView && !canPay && !isAdmin) redirect(`/${locale}/403`);

  const { data } = await supabase.rpc('admin_user_financials', { p_user_id: id });
  if (!data?.success) redirect(`/${locale}/admin/finance`);

  return (
    <div className="space-y-6">
      <UserFinancialsView
        locale={locale}
        profile={data.profile}
        wallet={data.wallet}
        transactions={data.transactions || []}
        investments={data.investments || []}
        canAdjust={!!(canPay || isAdmin)}
      />
    </div>
  );
}
