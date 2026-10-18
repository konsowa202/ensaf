'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Wallet, Lock, TrendingUp, ArrowRight, Plus, Minus, Loader2, ArrowDownLeft, ArrowUpRight,
  ShieldCheck, Phone, Mail, CreditCard,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TX_TYPE } from '@/components/dashboard/FinanceLedger';

const INV_STATUS: Record<string, { ar: string; en: string; cls: string }> = {
  confirmed: { ar: 'نشط', en: 'Active', cls: 'bg-primary/10 text-primary' },
  returned:  { ar: 'تم صرفه', en: 'Paid', cls: 'bg-gold/15 text-gold' },
  lost:      { ar: 'خسارة', en: 'Lost', cls: 'bg-coral/10 text-coral' },
  pending:   { ar: 'معلق', en: 'Pending', cls: 'bg-muted text-muted-foreground' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', cls: 'bg-muted text-muted-foreground' },
};

const KYC: Record<string, { ar: string; en: string; cls: string }> = {
  verified: { ar: 'موثق', en: 'Verified', cls: 'bg-primary/10 text-primary' },
  pending:  { ar: 'قيد التوثيق', en: 'Pending', cls: 'bg-gold/15 text-gold' },
  rejected: { ar: 'مرفوض', en: 'Rejected', cls: 'bg-coral/10 text-coral' },
};

function fmt(v: number, isAr: boolean) {
  return `${Math.round(Math.abs(v)).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default function UserFinancialsView({
  locale, profile, wallet, transactions, investments, canAdjust,
}: {
  locale: string; profile: any; wallet: any; transactions: any[]; investments: any[]; canAdjust: boolean;
}) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const supabase = createClient();

  const [adjOpen, setAdjOpen] = useState(false);
  const [adjDir, setAdjDir] = useState<'credit' | 'debit'>('credit');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjError, setAdjError] = useState('');
  const [loading, setLoading] = useState(false);

  const name = (isAr ? profile.full_name_ar : profile.full_name_en) || profile.full_name_ar || profile.email;
  const balance = Number(wallet?.balance || 0);
  const locked = Number(wallet?.locked_balance || 0);
  const totalInvested = investments.filter((i) => i.status === 'confirmed').reduce((a, i) => a + Number(i.amount || 0), 0);
  const kyc = KYC[profile.kyc_status] || KYC.pending;

  const handleAdjust = async () => {
    setAdjError('');
    const v = parseFloat(adjAmount);
    if (isNaN(v) || v <= 0) {
      setAdjError(isAr ? 'أدخل مبلغًا صحيحًا أكبر من صفر' : 'Enter a valid amount greater than zero');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_adjust_wallet', {
      p_user_id: profile.id,
      p_amount: adjDir === 'credit' ? v : -v,
      p_reason: adjReason.trim(),
    });
    setLoading(false);
    if (error) { setAdjError(error.message); return; }
    if (!data?.success) { setAdjError(data?.error || (isAr ? 'فشل التعديل' : 'Adjustment failed')); return; }
    setAdjOpen(false);
    setAdjAmount('');
    setAdjReason('');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* back + header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/finance`}>
          <Button variant="outline" size="sm" className="rounded-full">
            <ArrowRight className="w-4 h-4 me-1 rtl:rotate-0 ltr:rotate-180" />
            {isAr ? 'المالية' : 'Finance'}
          </Button>
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">{isAr ? 'الملف المالي للعميل' : 'Client Financial File'}</h1>
      </div>

      {/* profile + wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/15 overflow-hidden flex items-center justify-center text-primary font-extrabold text-xl shrink-0">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (name || '—').trim().charAt(0)
                )}
              </span>
              <div className="min-w-0">
                <div className="font-extrabold text-lg leading-snug break-words">{name}</div>
                <span className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${kyc.cls}`}>
                  {isAr ? kyc.ar : kyc.en}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4 shrink-0" /><span dir="ltr" className="truncate">{profile.email || '—'}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4 shrink-0" /><span dir="ltr">{profile.phone || '—'}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><CreditCard className="w-4 h-4 shrink-0" /><span dir="ltr">{profile.national_id || '—'}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{isAr ? (profile.role_ar || 'مستخدم') : (profile.role_en || 'User')}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {isAr ? 'عضو منذ' : 'Member since'} {new Date(profile.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
            </div>
          </CardContent>
        </Card>

        {/* wallet card with adjust */}
        <Card className="rounded-3xl border-border/70 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              {isAr ? 'المحفظة' : 'Wallet'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                <div className="text-xs text-muted-foreground mb-1">{isAr ? 'الرصيد المتاح' : 'Available balance'}</div>
                <div className="text-2xl font-extrabold text-primary" dir="ltr">{fmt(balance, isAr)}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Lock className="w-3 h-3" />{isAr ? 'محجوز' : 'Locked'}</div>
                <div className="text-2xl font-extrabold" dir="ltr">{fmt(locked, isAr)}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{isAr ? 'استثمارات نشطة' : 'Active investments'}</div>
                <div className="text-2xl font-extrabold text-gold" dir="ltr">{fmt(totalInvested, isAr)}</div>
              </div>
            </div>
            {canAdjust && (
              <div className="flex gap-3 mt-5">
                <Button className="rounded-full" onClick={() => { setAdjDir('credit'); setAdjOpen(true); }}>
                  <Plus className="w-4 h-4 me-1" />{isAr ? 'إضافة رصيد (له)' : 'Credit'}
                </Button>
                <Button variant="outline" className="rounded-full text-coral border-coral/30 hover:bg-coral/10" onClick={() => { setAdjDir('debit'); setAdjOpen(true); }}>
                  <Minus className="w-4 h-4 me-1" />{isAr ? 'خصم رصيد (عليه)' : 'Debit'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* investments */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{isAr ? `الاستثمارات (${investments.length})` : `Investments (${investments.length})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">{isAr ? 'لا توجد استثمارات.' : 'No investments.'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-start font-semibold py-2 pe-4">{isAr ? 'القضية' : 'Case'}</th>
                    <th className="text-start font-semibold py-2 pe-4">{isAr ? 'المبلغ' : 'Amount'}</th>
                    <th className="text-start font-semibold py-2 pe-4">{isAr ? 'التوكنز' : 'Tokens'}</th>
                    <th className="text-start font-semibold py-2 pe-4">{isAr ? 'العائد الفعلي' : 'Actual return'}</th>
                    <th className="text-start font-semibold py-2 pe-4">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="text-start font-semibold py-2">{isAr ? 'التاريخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => {
                    const st = INV_STATUS[inv.status];
                    return (
                      <tr key={inv.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pe-4">
                          {inv.case_id ? (
                            <Link href={`/${locale}/dashboard/cases/${inv.case_id}`} className="font-semibold hover:text-primary hover:underline transition-colors">
                              {(isAr ? inv.case_title_ar : inv.case_title_en) || ''} <span className="text-[11px] font-mono text-muted-foreground">{inv.case_number}</span>
                            </Link>
                          ) : '—'}
                        </td>
                        <td className="py-2.5 pe-4 font-bold" dir="ltr">{fmt(Number(inv.amount || 0), isAr)}</td>
                        <td className="py-2.5 pe-4 text-muted-foreground" dir="ltr">{inv.tokens ?? '—'}</td>
                        <td className={`py-2.5 pe-4 font-semibold ${Number(inv.actual_return) > 0 ? 'text-primary' : Number(inv.actual_return) < 0 ? 'text-coral' : 'text-muted-foreground'}`} dir="ltr">
                          {inv.actual_return != null ? `${Number(inv.actual_return) > 0 ? '+' : Number(inv.actual_return) < 0 ? '-' : ''}${fmt(Number(inv.actual_return), isAr)}` : '—'}
                        </td>
                        <td className="py-2.5 pe-4">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
                            {st ? (isAr ? st.ar : st.en) : inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs whitespace-nowrap">{new Date(inv.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* transactions */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{isAr ? `كل المعاملات (${transactions.length})` : `All Transactions (${transactions.length})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">{isAr ? 'لا توجد معاملات.' : 'No transactions.'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-start font-semibold py-2 pe-4">{isAr ? 'النوع' : 'Type'}</th>
                    <th className="text-start font-semibold py-2 pe-4">{isAr ? 'القضية' : 'Case'}</th>
                    <th className="text-start font-semibold py-2 pe-4">{isAr ? 'المبلغ' : 'Amount'}</th>
                    <th className="text-start font-semibold py-2 pe-4">{isAr ? 'المرجع' : 'Reference'}</th>
                    <th className="text-start font-semibold py-2">{isAr ? 'التاريخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const tt = TX_TYPE[tx.type];
                    const isIn = ['deposit', 'payout', 'refund'].includes(tx.type) || (tx.type === 'adjustment' && Number(tx.amount) > 0);
                    return (
                      <tr key={tx.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pe-4">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${tt ? tt.cls : 'bg-muted text-muted-foreground'}`}>
                            {isIn ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {tt ? (isAr ? tt.ar : tt.en) : tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 pe-4 text-muted-foreground text-xs">
                          {tx.case_id ? (
                            <Link href={`/${locale}/dashboard/cases/${tx.case_id}`} className="hover:text-primary hover:underline transition-colors">
                              {(isAr ? tx.case_title_ar : tx.case_title_en) || ''} ({tx.case_number})
                            </Link>
                          ) : '—'}
                        </td>
                        <td className={`py-2.5 pe-4 font-bold ${isIn ? 'text-primary' : 'text-foreground'}`} dir="ltr">
                          {Number(tx.amount) < 0 ? '-' : ''}{fmt(Number(tx.amount || 0), isAr)}
                        </td>
                        <td className="py-2.5 pe-4 text-muted-foreground text-[11px] font-mono" dir="ltr">{tx.reference || '—'}</td>
                        <td className="py-2.5 text-muted-foreground text-xs whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* adjust dialog */}
      <Dialog open={adjOpen} onOpenChange={(open: boolean) => !open && setAdjOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{adjDir === 'credit' ? (isAr ? 'إضافة رصيد للعميل' : 'Credit client wallet') : (isAr ? 'خصم رصيد من العميل' : 'Debit client wallet')}</DialogTitle>
            <DialogDescription>{name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{isAr ? 'المبلغ' : 'Amount'}</label>
              <Input type="number" dir="ltr" min={0} value={adjAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjAmount(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{isAr ? 'السبب (يظهر في سجل التدقيق وإشعار العميل)' : 'Reason (audit log & client notification)'}</label>
              <Input value={adjReason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjReason(e.target.value)}
                placeholder={isAr ? 'مثال: تصحيح خطأ تحويل' : 'e.g. transfer correction'} />
            </div>
            <div className="text-xs text-muted-foreground">
              {isAr ? 'الرصيد الحالي:' : 'Current balance:'} <span className="font-bold" dir="ltr">{fmt(balance, isAr)}</span>
            </div>
            {adjError && <div className="text-destructive text-sm font-medium p-2 bg-destructive/10 rounded">{adjError}</div>}
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => setAdjOpen(false)} disabled={loading}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleAdjust} disabled={loading} variant={adjDir === 'debit' ? 'destructive' : 'default'}>
                {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {adjDir === 'credit' ? (isAr ? 'تأكيد الإضافة' : 'Confirm credit') : (isAr ? 'تأكيد الخصم' : 'Confirm debit')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
