import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Wallet, Coins, ShieldCheck } from 'lucide-react';
import RelationsSearch from '@/components/dashboard/RelationsSearch';

export default async function RelationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: allowed } = await supabase.rpc('has_permission', { uid: user.id, perm_key: 'users.view' });
  if (!allowed) redirect(`/${locale}/dashboard`);

  const { data: investors } = await supabase.rpc('investor_directory');
  const list = investors || [];

  const totalInvested = list.reduce((s: number, i: any) => s + Number(i.total_invested || 0), 0);
  const totalTokens = list.reduce((s: number, i: any) => s + Number(i.tokens_total || 0), 0);
  const verified = list.filter((i: any) => i.kyc_status === 'verified').length;

  const kpis = [
    { icon: Users, label: isAr ? 'إجمالي المستثمرين' : 'Total Investors', value: String(list.length), tint: 'bg-indigo/10 text-indigo' },
    { icon: ShieldCheck, label: isAr ? 'موثقون' : 'Verified', value: String(verified), tint: 'bg-primary/10 text-primary' },
    { icon: Wallet, label: isAr ? 'إجمالي المستثمَر' : 'Total Invested', value: `${Math.round(totalInvested).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`, tint: 'bg-gold/15 text-gold', small: true },
    { icon: Coins, label: isAr ? 'إجمالي التوكنز' : 'Total Tokens', value: totalTokens.toLocaleString('en-US'), tint: 'bg-coral/10 text-coral' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{isAr ? 'علاقات المستثمرين' : 'Investor Relations'}</h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? 'دليل المستثمرين ونشاطهم الاستثماري على المنصة' : 'Investor directory and their investment activity'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="rounded-3xl border-border/70 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${kpi.tint}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className={`font-extrabold tracking-tight leading-none whitespace-nowrap ${kpi.small ? 'text-lg' : 'text-2xl'}`} dir="ltr">{kpi.value}</div>
                <div className="text-xs text-muted-foreground font-semibold mt-1.5">{kpi.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RelationsSearch locale={locale} />
    </div>
  );
}
