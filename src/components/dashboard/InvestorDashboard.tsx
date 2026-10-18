import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Briefcase, TrendingUp } from 'lucide-react';
import InvestorClientView from './InvestorClientView';

export default async function InvestorDashboard({ locale, profile }: { locale: string, profile: any }) {
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  // Fetch Investments
  const { data: investments } = await supabase
    .from('investments')
    .select('*, cases(title_ar, title_en, expected_return_min, expected_return_max)')
    .eq('investor_id', user!.id);

  // Fetch Public Cases
  const { data: publicCases } = await supabase
    .from('public_cases')
    .select('*');

  const totalInvested = investments?.reduce((acc, inv) => acc + Number(inv.amount), 0) || 0;
  const balance = wallet?.balance || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">
          {locale === 'ar' ? `مرحباً، ${profile.full_name_ar}` : `Welcome, ${profile.full_name_ar}`}
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <Card className="max-md:[--card-spacing:--spacing(3)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === 'ar' ? 'الرصيد المتاح' : 'Available Balance'}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{balance.toLocaleString('en-US')} SAR</div>
          </CardContent>
        </Card>
        
        <Card className="max-md:[--card-spacing:--spacing(3)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === 'ar' ? 'إجمالي الاستثمارات' : 'Total Investments'}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{totalInvested.toLocaleString('en-US')} SAR</div>
          </CardContent>
        </Card>
        
        <Card className="max-md:[--card-spacing:--spacing(3)] max-md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === 'ar' ? 'العوائد المتوقعة' : 'Expected Returns'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">
              {investments?.length ? '+15%' : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      <InvestorClientView 
        locale={locale} 
        publicCases={publicCases || []} 
        investments={investments || []} 
        balance={balance}
      />
    </div>
  );
}
