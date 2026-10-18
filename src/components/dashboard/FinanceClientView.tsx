'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Wallet, Lock, TrendingUp, HandCoins,
} from 'lucide-react';
import Link from 'next/link';
import SettlementWizard from '@/components/dashboard/SettlementWizard';
import FinanceWallets from '@/components/dashboard/FinanceWallets';
import FinanceLedger from '@/components/dashboard/FinanceLedger';

function fmtMoney(v: number, isAr: boolean) {
  return `${Math.round(v).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default function FinanceClientView({
  locale, wallets, transactions, investments, settleCases, canPayout,
}: {
  locale: string; wallets: any[]; transactions: any[]; investments: any[]; settleCases: any[]; canPayout: boolean;
}) {
  const isAr = locale === 'ar';
  const [settleCase, setSettleCase] = useState<any | null>(null);

  const totalBalance = wallets.reduce((a, w) => a + Number(w.balance || 0), 0);
  const totalLocked = wallets.reduce((a, w) => a + Number(w.locked_balance || 0), 0);
  const totalInvested = investments.filter((i) => i.status === 'confirmed').reduce((a, i) => a + Number(i.amount || 0), 0);
  const totalPaidOut = transactions.filter((t) => t.type === 'payout').reduce((a, t) => a + Number(t.amount || 0), 0);

  const kpis = [
    { icon: Wallet, label: isAr ? 'أرصدة المحافظ' : 'Wallet Balances', value: fmtMoney(totalBalance, isAr), tint: 'bg-primary/10 text-primary' },
    { icon: Lock, label: isAr ? 'مبالغ محجوزة' : 'Locked Funds', value: fmtMoney(totalLocked, isAr), tint: 'bg-indigo/10 text-indigo' },
    { icon: TrendingUp, label: isAr ? 'استثمارات نشطة' : 'Active Investments', value: fmtMoney(totalInvested, isAr), tint: 'bg-gold/15 text-gold' },
    { icon: HandCoins, label: isAr ? 'إجمالي المصروف' : 'Total Paid Out', value: fmtMoney(totalPaidOut, isAr), tint: 'bg-coral/10 text-coral' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="rounded-3xl border-border/70 shadow-sm">
            <CardContent className="p-3 md:p-5">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-2 md:mb-4 ${kpi.tint}`}>
                <kpi.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="text-base md:text-xl font-extrabold tracking-tight">{kpi.value}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cases awaiting settlement */}
      {canPayout && settleCases.length > 0 && (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-gold" />
              {isAr ? 'قضايا جاهزة للتسوية والصرف' : 'Cases Ready for Settlement'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settleCases.map((c) => {
              const requested = Number(c.requested_funding || 0);
              const fundedAmt = Number(c.funded_amount || 0);
              const progress = requested > 0 ? Math.min(100, Math.round((fundedAmt / requested) * 100)) : 0;
              return (
                <div key={c.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-2xl border border-border/60 bg-surface/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/${locale}/dashboard/cases/${c.id}`} className="font-bold truncate hover:text-primary hover:underline transition-colors">{isAr ? c.title_ar : c.title_en}</Link>
                      <span className="text-[11px] font-mono text-muted-foreground">{c.case_number}</span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo/10 text-indigo">
                        {c.status === 'in_litigation' ? (isAr ? 'قيد التقاضي' : 'In Litigation') : (isAr ? 'ممولة' : 'Funded')}
                      </span>
                    </div>
                    <div className="mt-3 max-w-md">
                      <div className="flex justify-between text-[11px] text-muted-foreground font-semibold mb-1">
                        <span>{isAr ? 'المبلغ الممول' : 'Funded'}</span>
                        <span>{fmtMoney(fundedAmt, isAr)} ({progress}%)</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                  <Button onClick={() => setSettleCase(c)} className="rounded-full shrink-0 w-full lg:w-auto">
                    <HandCoins className="w-4 h-4 me-2" />
                    {isAr ? 'تسوية وصرف' : 'Settle & Pay'}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Wallets: searchable directory */}
      <FinanceWallets locale={locale} />

      {/* Transactions ledger: searchable + filterable */}
      <FinanceLedger locale={locale} />

      {/* Settlement wizard */}
      <SettlementWizard locale={locale} settleCase={settleCase} onClose={() => setSettleCase(null)} />
    </div>
  );
}
