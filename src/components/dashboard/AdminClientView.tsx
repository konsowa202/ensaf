'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Users, FileText, Wallet, Hourglass, Play, Lock, Gavel, HandCoins,
  Trophy, Handshake, XCircle, ChevronDown,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CASE_STATUS: Record<string, { ar: string; en: string; cls: string }> = {
  draft:            { ar: 'مسودة', en: 'Draft', cls: 'bg-muted text-muted-foreground' },
  submitted:        { ar: 'مقدمة', en: 'Submitted', cls: 'bg-gold/15 text-gold' },
  under_review:     { ar: 'قيد المراجعة', en: 'Under Review', cls: 'bg-gold/15 text-gold' },
  committee_review: { ar: 'أمام اللجنة', en: 'In Committee', cls: 'bg-gold/15 text-gold' },
  approved:         { ar: 'معتمدة', en: 'Approved', cls: 'bg-primary/10 text-primary' },
  rejected:         { ar: 'مرفوضة', en: 'Rejected', cls: 'bg-coral/10 text-coral' },
  funding_open:     { ar: 'التمويل مفتوح', en: 'Funding Open', cls: 'bg-primary/10 text-primary' },
  funded:           { ar: 'ممولة بالكامل', en: 'Funded', cls: 'bg-indigo/10 text-indigo' },
  in_litigation:    { ar: 'قيد التقاضي', en: 'In Litigation', cls: 'bg-indigo/10 text-indigo' },
  settled:          { ar: 'تمت التسوية', en: 'Settled', cls: 'bg-primary text-primary-foreground' },
  won:              { ar: 'كسبت', en: 'Won', cls: 'bg-primary text-primary-foreground' },
  lost:             { ar: 'خسرت', en: 'Lost', cls: 'bg-coral/10 text-coral' },
  closed:           { ar: 'مغلقة', en: 'Closed', cls: 'bg-muted text-muted-foreground' },
};

const LIFECYCLE = ['submitted', 'under_review', 'committee_review', 'approved', 'funding_open', 'funded', 'in_litigation', 'won'] as const;

function fmtMoney(v: number, isAr: boolean) {
  return `${Math.round(v).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default function AdminClientView({
  locale,
  cases,
  kpis,
}: {
  locale: string;
  cases: any[];
  kpis: { totalUsers: number; totalInvestments: number; totalCases: number };
}) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('actionable');

  /* settlement dialog state */
  const [settleCase, setSettleCase] = useState<any | null>(null);
  const [outcome, setOutcome] = useState<'won' | 'settled' | 'lost'>('won');
  const [returnPct, setReturnPct] = useState('');
  const [settleError, setSettleError] = useState('');

  const handleUpdateStatus = async (caseId: string, newStatus: string) => {
    setLoading(true);
    const { error } = await supabase.from('cases').update({ status: newStatus }).eq('id', caseId);
    setLoading(false);
    if (error) alert(error.message);
    else router.refresh();
  };

  const openSettle = (c: any) => {
    setSettleCase(c);
    setOutcome('won');
    setReturnPct(String(c.expected_return_max ?? ''));
    setSettleError('');
  };

  const handleSettle = async () => {
    if (!settleCase) return;
    setSettleError('');
    setLoading(true);
    const pct = returnPct.trim() === '' ? null : parseFloat(returnPct);
    if (pct !== null && (isNaN(pct) || pct < -100)) {
      setSettleError(isAr ? 'نسبة العائد غير صحيحة' : 'Invalid return percentage');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.rpc('process_case_payout', {
      p_case_id: settleCase.id,
      p_outcome: outcome,
      p_return_pct: pct,
    });
    setLoading(false);
    if (error) { setSettleError(error.message); return; }
    if (data && data.success === false) { setSettleError(data.error || (isAr ? 'فشل الصرف' : 'Payout failed')); return; }
    setSettleCase(null);
    router.refresh();
  };

  /* next action per status */
  const nextAction = (c: any) => {
    switch (c.status) {
      case 'approved':
        return { label: isAr ? 'فتح التمويل' : 'Open Funding', icon: Play, fn: () => handleUpdateStatus(c.id, 'funding_open') };
      case 'funding_open':
        return { label: isAr ? 'إغلاق التمويل' : 'Close Funding', icon: Lock, fn: () => handleUpdateStatus(c.id, 'funded') };
      case 'funded':
        return { label: isAr ? 'بدء التقاضي' : 'Start Litigation', icon: Gavel, fn: () => handleUpdateStatus(c.id, 'in_litigation') };
      case 'in_litigation':
        return { label: isAr ? 'تسوية وصرف' : 'Settle & Pay', icon: HandCoins, fn: () => openSettle(c), accent: true };
      default:
        return null;
    }
  };

  const actionable = cases.filter((c) => nextAction(c) !== null);
  const shown = useMemo(() => {
    if (filter === 'actionable') return cases.filter((c) => nextAction(c) !== null);
    if (filter === 'all') return cases;
    return cases.filter((c) => c.status === filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, cases]);

  const kpiCards = [
    { icon: Users, label: isAr ? 'المستخدمون' : 'Users', value: String(kpis.totalUsers), tint: 'bg-indigo/10 text-indigo' },
    { icon: FileText, label: isAr ? 'القضايا' : 'Cases', value: String(kpis.totalCases), tint: 'bg-primary/10 text-primary' },
    { icon: Wallet, label: isAr ? 'حجم الاستثمارات' : 'Investments', value: fmtMoney(kpis.totalInvestments, isAr), tint: 'bg-gold/15 text-gold' },
    { icon: Hourglass, label: isAr ? 'تنتظر إجراء' : 'Need Action', value: String(actionable.length), tint: 'bg-coral/10 text-coral' },
  ];

  const filterChips: { key: string; label: string }[] = [
    { key: 'actionable', label: isAr ? 'تنتظر إجراء' : 'Actionable' },
    { key: 'all', label: isAr ? 'الكل' : 'All' },
    ...LIFECYCLE.map((s) => ({ key: s, label: isAr ? CASE_STATUS[s].ar : CASE_STATUS[s].en })),
  ];

  return (
    <div className="space-y-8">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <Card key={i} className="rounded-3xl border-border/70 shadow-sm">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${kpi.tint}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight">{kpi.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader className="space-y-4">
          <CardTitle>{isAr ? 'دورة حياة القضايا' : 'Case Lifecycle'}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                  filter === chip.key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {shown.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              {isAr ? 'لا توجد قضايا في هذه المرحلة.' : 'No cases at this stage.'}
            </p>
          ) : (
            <div className="space-y-3">
              {shown.map((c) => {
                const st = CASE_STATUS[c.status];
                const action = nextAction(c);
                const requested = Number(c.requested_funding || 0);
                const fundedAmt = Number(c.funded_amount || 0);
                const progress = requested > 0 ? Math.min(100, Math.round((fundedAmt / requested) * 100)) : 0;
                return (
                  <div
                    key={c.id}
                    className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-2xl border border-border/60 bg-surface/50 hover:border-primary/25 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/${locale}/dashboard/cases/${c.id}`} className="font-bold truncate hover:text-primary hover:underline transition-colors">{isAr ? c.title_ar : c.title_en}</Link>
                        <span className="text-[11px] font-mono text-muted-foreground">{c.case_number}</span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
                          {st ? (isAr ? st.ar : st.en) : c.status}
                        </span>
                      </div>
                      <div className="mt-3 max-w-md">
                        <div className="flex justify-between text-[11px] text-muted-foreground font-semibold mb-1">
                          <span>{isAr ? 'التمويل' : 'Funding'}</span>
                          <span>{fmtMoney(fundedAmt, isAr)} / {fmtMoney(requested, isAr)} ({progress}%)</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>
                    {action && (
                      <Button
                        onClick={action.fn}
                        disabled={loading}
                        variant={action.accent ? 'default' : 'outline'}
                        className="rounded-full shrink-0"
                      >
                        <action.icon className="w-4 h-4 me-2" />
                        {action.label}
                        <ChevronDown className="w-3.5 h-3.5 ms-1 opacity-50" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settlement dialog */}
      <Dialog open={!!settleCase} onOpenChange={(open: boolean) => !open && setSettleCase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'تسوية القضية وصرف العوائد' : 'Settle Case & Pay Returns'}</DialogTitle>
            <DialogDescription>
              {settleCase && (isAr ? settleCase.title_ar : settleCase.title_en)}
              {settleCase && (
                <span className="block mt-1 text-xs">
                  {isAr ? 'المبلغ الممول:' : 'Funded amount:'} {fmtMoney(Number(settleCase.funded_amount || 0), isAr)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-2 py-2">
            {([
              { key: 'won', label: isAr ? 'كسبت' : 'Won', icon: Trophy, cls: 'border-primary bg-primary/10 text-primary' },
              { key: 'settled', label: isAr ? 'تسوية' : 'Settled', icon: Handshake, cls: 'border-indigo bg-indigo/10 text-indigo' },
              { key: 'lost', label: isAr ? 'خسرت' : 'Lost', icon: XCircle, cls: 'border-coral bg-coral/10 text-coral' },
            ] as const).map((o) => (
              <button
                key={o.key}
                onClick={() => setOutcome(o.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-sm font-bold transition-colors ${
                  outcome === o.key ? o.cls : 'border-border text-muted-foreground hover:border-foreground/30'
                }`}
              >
                <o.icon className="w-5 h-5" />
                {o.label}
              </button>
            ))}
          </div>

          {outcome !== 'lost' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isAr ? 'نسبة العائد % (اتركها فارغة للقيمة الافتراضية)' : 'Return % (leave empty for default)'}
              </label>
              <Input
                type="number"
                dir="ltr"
                value={returnPct}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReturnPct(e.target.value)}
                placeholder={settleCase ? String(outcome === 'won' ? settleCase.expected_return_max : settleCase.expected_return_min) : ''}
              />
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? 'سيتم إيداع (رأس المال + العائد) في محفظة كل مستثمر وإشعاره فوراً.'
                  : "Each investor's wallet will be credited (principal + return) and notified instantly."}
              </p>
            </div>
          )}
          {outcome === 'lost' && (
            <p className="text-sm text-muted-foreground bg-coral/10 text-coral rounded-xl p-3 font-medium">
              {isAr
                ? 'سيتم تحرير المبالغ المحجوزة وتسجيل الاستثمارات كخسارة كاملة. لا يمكن التراجع.'
                : 'Locked funds will be released and investments recorded as a full loss. This cannot be undone.'}
            </p>
          )}

          {settleError && (
            <div className="text-destructive text-sm font-medium p-2 bg-destructive/10 rounded">
              {settleError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setSettleCase(null)} disabled={loading}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSettle} disabled={loading} variant={outcome === 'lost' ? 'destructive' : 'default'}>
              {isAr ? 'تأكيد التسوية والصرف' : 'Confirm Settlement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
