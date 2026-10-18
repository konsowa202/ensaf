import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FinanceClientView from '@/components/dashboard/FinanceClientView';

export default async function FinancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: canView }, { data: canPay }, { data: isAdmin }] = await Promise.all([
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'transactions.view' }),
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'finance.payout' }),
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'admin.access' }),
  ]);
  if (!canView && !canPay && !isAdmin) {
    redirect(`/${locale}/403`);
  }

  const [walletsRes, transactionsRes, investmentsRes, settleCasesRes] = await Promise.all([
    supabase
      .from('wallets')
      .select('user_id, balance, locked_balance, updated_at, profiles(full_name_ar, full_name_en, email)')
      .order('updated_at', { ascending: false }),
    supabase
      .from('transactions')
      .select('id, user_id, case_id, type, amount, status, reference, created_at, profiles(full_name_ar, full_name_en), cases(case_number, title_ar, title_en)')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('investments')
      .select('id, amount, status, actual_return, created_at, profiles(full_name_ar, full_name_en), cases(case_number, title_ar, title_en)')
      .order('created_at', { ascending: false }),
    supabase
      .from('cases')
      .select('id, case_number, title_ar, title_en, status, requested_funding, funded_amount, expected_return_min, expected_return_max')
      .in('status', ['funded', 'in_litigation'])
      .order('updated_at', { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {locale === 'ar' ? 'المالية والمحافظ' : 'Finance & Wallets'}
        </h1>
      </div>

      <FinanceClientView
        locale={locale}
        wallets={walletsRes.data || []}
        transactions={transactionsRes.data || []}
        investments={investmentsRes.data || []}
        settleCases={settleCasesRes.data || []}
        canPayout={!!(canPay || isAdmin)}
      />
    </div>
  );
}
