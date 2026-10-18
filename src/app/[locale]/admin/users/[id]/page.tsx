import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShieldCheck, Mail, Phone, CalendarClock, Wallet, Briefcase, Scale,
  History, ArrowDownLeft, ArrowUpRight, Fingerprint, User,
} from 'lucide-react';

const CASE_STATUS: Record<string, { ar: string; en: string; cls: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', cls: 'bg-muted text-muted-foreground' },
  submitted: { ar: 'مقدمة', en: 'Submitted', cls: 'bg-gold/15 text-gold' },
  under_review: { ar: 'قيد المراجعة', en: 'Under Review', cls: 'bg-gold/15 text-gold' },
  committee_review: { ar: 'أمام اللجنة', en: 'In Committee', cls: 'bg-indigo/10 text-indigo' },
  approved: { ar: 'معتمدة', en: 'Approved', cls: 'bg-primary/10 text-primary' },
  rejected: { ar: 'مرفوضة', en: 'Rejected', cls: 'bg-coral/10 text-coral' },
  funding_open: { ar: 'التمويل مفتوح', en: 'Funding Open', cls: 'bg-primary/10 text-primary' },
  funded: { ar: 'ممولة بالكامل', en: 'Funded', cls: 'bg-indigo/10 text-indigo' },
  in_litigation: { ar: 'قيد التقاضي', en: 'In Litigation', cls: 'bg-indigo/10 text-indigo' },
  settled: { ar: 'تمت التسوية', en: 'Settled', cls: 'bg-primary text-primary-foreground' },
  won: { ar: 'كسبت', en: 'Won', cls: 'bg-primary text-primary-foreground' },
  lost: { ar: 'خسرت', en: 'Lost', cls: 'bg-coral/10 text-coral' },
  closed: { ar: 'مغلقة', en: 'Closed', cls: 'bg-muted text-muted-foreground' },
};

const TX_TYPE: Record<string, { ar: string; en: string; cls: string; dir: 'in' | 'out' }> = {
  deposit:    { ar: 'إيداع', en: 'Deposit', cls: 'bg-primary/10 text-primary', dir: 'in' },
  payout:     { ar: 'صرف عوائد', en: 'Payout', cls: 'bg-gold/15 text-gold', dir: 'in' },
  refund:     { ar: 'استرداد', en: 'Refund', cls: 'bg-coral/10 text-coral', dir: 'in' },
  investment: { ar: 'استثمار', en: 'Investment', cls: 'bg-indigo/10 text-indigo', dir: 'out' },
  fee:        { ar: 'رسوم', en: 'Fee', cls: 'bg-muted text-muted-foreground', dir: 'out' },
};

const USER_TYPE: Record<string, { ar: string; en: string }> = {
  investor: { ar: 'مستثمر', en: 'Investor' },
  applicant: { ar: 'صاحب قضية', en: 'Applicant' },
  staff: { ar: 'فريق العمل', en: 'Staff' },
};

function fmtMoney(v: number, isAr: boolean) {
  return `${Math.round(v).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default async function AdminUserPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const checks = await Promise.all(
    ['admin.access', 'users.view', 'users.manage'].map((k) => supabase.rpc('has_permission', { uid: user.id, perm_key: k }))
  );
  if (!checks.some((r) => !!r.data)) redirect(`/${locale}/403`);

  const [profileRes, walletRes, txRes, invRes, casesRes, auditRes, notifRes] = await Promise.all([
    supabase.from('profiles').select('*, roles(name_ar, name_en, slug)').eq('id', id).single(),
    supabase.from('wallets').select('*').eq('user_id', id).maybeSingle(),
    supabase.from('transactions').select('*, cases:case_id(id, title_ar, title_en, case_number)').eq('user_id', id).order('created_at', { ascending: false }).limit(25),
    supabase.from('investments').select('*, cases:case_id(id, title_ar, title_en, case_number, status)').eq('investor_id', id).order('created_at', { ascending: false }),
    supabase.from('cases').select('id, title_ar, title_en, case_number, status, requested_funding, funded_amount, created_at').eq('applicant_id', id).order('created_at', { ascending: false }),
    supabase.from('audit_logs').select('action, entity, entity_id, metadata, ip, created_at').eq('actor_id', id).order('created_at', { ascending: false }).limit(25),
    supabase.from('notifications').select('title_ar, title_en, is_read, created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
  ]);

  const p = profileRes.data as any;
  if (!p) notFound();

  const wallet = walletRes.data as any;
  const txs = txRes.data || [];
  const investments = invRes.data || [];
  const cases = casesRes.data || [];
  const audit = auditRes.data || [];
  const notifs = notifRes.data || [];

  const role = Array.isArray(p.roles) ? p.roles[0] : p.roles;
  const roleName = role ? (isAr ? role.name_ar : role.name_en) : (isAr ? 'بدون دور' : 'No role');
  const name = (isAr ? p.full_name_ar : p.full_name_en) || p.full_name_ar || '—';
  const totalInvested = investments.filter((i: any) => i.status !== 'cancelled').reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <Link href={`/${locale}/admin/roles`} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
        {isAr ? '← العودة للمستخدمين' : '← Back to users'}
      </Link>

      {/* Identity 360 header */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardContent className="p-6 flex items-center gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/15 overflow-hidden flex items-center justify-center shrink-0">
            {p.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-9 h-9 text-primary/60" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight truncate">{name}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15">{roleName}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {USER_TYPE[p.user_type] ? (isAr ? USER_TYPE[p.user_type].ar : USER_TYPE[p.user_type].en) : p.user_type}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.kyc_status === 'verified' ? 'bg-primary/10 text-primary' : p.kyc_status === 'rejected' ? 'bg-coral/10 text-coral' : 'bg-gold/15 text-gold'}`}>
                {p.kyc_status === 'verified' ? (isAr ? 'موثق' : 'Verified') : p.kyc_status === 'rejected' ? (isAr ? 'مرفوض' : 'Rejected') : (isAr ? 'قيد التوثيق' : 'KYC Pending')}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap mt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1" dir="ltr"><Mail className="w-3.5 h-3.5" />{p.email}</span>
              {p.phone && <span className="inline-flex items-center gap-1" dir="ltr"><Phone className="w-3.5 h-3.5" />{p.phone}</span>}
              {p.national_id && <span className="inline-flex items-center gap-1" dir="ltr"><Fingerprint className="w-3.5 h-3.5" />{p.national_id}</span>}
              <span className="inline-flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />{isAr ? 'انضم' : 'Joined'} {new Date(p.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Wallet & money */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" />{isAr ? 'الوضع المالي' : 'Financial Position'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: isAr ? 'الرصيد المتاح' : 'Available', v: wallet ? Number(wallet.balance || 0) : 0, tint: 'bg-primary/10 text-primary' },
                  { label: isAr ? 'محجوز' : 'Locked', v: wallet ? Number(wallet.locked_balance || 0) : 0, tint: 'bg-gold/15 text-gold' },
                  { label: isAr ? 'إجمالي المستثمَر' : 'Total Invested', v: totalInvested, tint: 'bg-indigo/10 text-indigo' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-border/60 bg-surface/50 p-3 text-center">
                    <div className="font-extrabold text-sm" dir="ltr">{fmtMoney(s.v, isAr)}</div>
                    <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {txs.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-muted-foreground mb-2">{isAr ? 'آخر المعاملات' : 'Recent transactions'}</div>
                  {txs.slice(0, 8).map((tx: any) => {
                    const tt = TX_TYPE[tx.type];
                    const c = Array.isArray(tx.cases) ? tx.cases[0] : tx.cases;
                    return (
                      <div key={tx.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0 text-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tt ? tt.cls : 'bg-muted'}`}>
                            {tt?.dir === 'in' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </span>
                          <div className="min-w-0">
                            <span className="font-semibold text-xs">{tt ? (isAr ? tt.ar : tt.en) : tx.type}</span>
                            {c?.id && (
                              <Link href={`/${locale}/dashboard/cases/${c.id}`} className="block text-[11px] text-muted-foreground truncate hover:text-primary hover:underline">
                                {isAr ? c.title_ar : c.title_en}
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="text-end shrink-0">
                          <span className={`font-bold text-xs ${tt?.dir === 'in' ? 'text-primary' : ''}`} dir="ltr">
                            {tt?.dir === 'in' ? '+' : '−'}{fmtMoney(Number(tx.amount || 0), isAr)}
                          </span>
                          <div className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investments */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo" />
                {isAr ? 'الاستثمارات' : 'Investments'}
                <span className="text-xs text-muted-foreground font-normal">({investments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">{isAr ? 'لا توجد استثمارات.' : 'No investments.'}</p>
              ) : (
                <div className="space-y-2">
                  {investments.map((inv: any) => {
                    const c = Array.isArray(inv.cases) ? inv.cases[0] : inv.cases;
                    return (
                      <div key={inv.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/60 bg-surface/50">
                        <div className="min-w-0">
                          {c?.id ? (
                            <Link href={`/${locale}/dashboard/cases/${c.id}`} className="font-bold text-sm truncate block hover:text-primary hover:underline">
                              {isAr ? c.title_ar : c.title_en}
                            </Link>
                          ) : <span className="font-bold text-sm">—</span>}
                          <span className="text-[11px] font-mono text-muted-foreground">{c?.case_number}</span>
                        </div>
                        <div className="text-end shrink-0">
                          <div className="font-bold text-sm" dir="ltr">{fmtMoney(Number(inv.amount || 0), isAr)}</div>
                          <div className="text-[10px] text-muted-foreground">{inv.status}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cases submitted */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-gold" />
                {isAr ? 'القضايا المقدمة' : 'Submitted Cases'}
                <span className="text-xs text-muted-foreground font-normal">({cases.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">{isAr ? 'لم يقدم قضايا.' : 'No cases submitted.'}</p>
              ) : (
                <div className="space-y-2">
                  {cases.map((c: any) => {
                    const st = CASE_STATUS[c.status];
                    return (
                      <Link key={c.id} href={`/${locale}/dashboard/cases/${c.id}`} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/60 bg-surface/50 hover:border-primary/30 transition-colors">
                        <div className="min-w-0">
                          <span className="font-bold text-sm truncate block">{isAr ? c.title_ar : c.title_en}</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{c.case_number}</span>
                        </div>
                        <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
                          {st ? (isAr ? st.ar : st.en) : c.status}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side: activity + notifications */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-coral" />{isAr ? 'سجل النشاط' : 'Activity Log'}</CardTitle>
            </CardHeader>
            <CardContent>
              {audit.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">{isAr ? 'لا يوجد نشاط مسجل.' : 'No recorded activity.'}</p>
              ) : (
                <div className="relative space-y-4 ps-4 border-s-2 border-border/60">
                  {audit.map((a: any, i: number) => (
                    <div key={i} className="relative">
                      <span className="absolute -start-[23px] top-1 w-3 h-3 rounded-full bg-coral border-2 border-card" />
                      <div className="text-sm font-bold" dir="ltr">{a.action}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {a.entity} · {new Date(a.created_at).toLocaleString(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-gold" />{isAr ? 'آخر الإشعارات' : 'Latest Notifications'}</CardTitle>
            </CardHeader>
            <CardContent>
              {notifs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">{isAr ? 'لا توجد إشعارات.' : 'No notifications.'}</p>
              ) : (
                <div className="space-y-2">
                  {notifs.map((n: any, i: number) => (
                    <div key={i} className="p-3 rounded-2xl border border-border/60 bg-surface/50">
                      <div className="text-xs font-bold">{isAr ? n.title_ar : (n.title_en || n.title_ar)}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(n.created_at).toLocaleString(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        {!n.is_read && <span className="ms-1 text-gold font-bold">· {isAr ? 'غير مقروء' : 'unread'}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
