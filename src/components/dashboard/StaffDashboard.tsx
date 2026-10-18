import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  Users, ShieldCheck, Info, Wallet, FileText, Activity, MessagesSquare,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvestmentsAreaChart, CasesDonut } from '@/components/dashboard/StaffCharts';

const PERM_KEYS = [
  'admin.access', 'cases.view', 'cases.manage', 'cases.approve', 'cases.review',
  'users.view', 'users.manage', 'roles.view', 'roles.manage',
  'transactions.view', 'finance.payout', 'content.manage', 'audit.view', 'settings.manage',
] as const;

const CASE_STATUS: Record<string, { ar: string; en: string; cls: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', cls: 'bg-muted text-muted-foreground' },
  submitted: { ar: 'مقدمة', en: 'Submitted', cls: 'bg-gold/15 text-gold' },
  under_review: { ar: 'قيد المراجعة', en: 'Under Review', cls: 'bg-gold/15 text-gold' },
  committee_review: { ar: 'أمام اللجنة', en: 'In Committee', cls: 'bg-gold/15 text-gold' },
  approved: { ar: 'معتمدة', en: 'Approved', cls: 'bg-primary/10 text-primary' },
  rejected: { ar: 'مرفوضة', en: 'Rejected', cls: 'bg-coral/10 text-coral' },
  funding_open: { ar: 'التمويل مفتوح', en: 'Funding Open', cls: 'bg-primary/10 text-primary' },
  funded: { ar: 'ممولة', en: 'Funded', cls: 'bg-indigo/10 text-indigo' },
  in_litigation: { ar: 'قيد التقاضي', en: 'In Litigation', cls: 'bg-indigo/10 text-indigo' },
  settled: { ar: 'تمت التسوية', en: 'Settled', cls: 'bg-primary text-primary-foreground' },
  won: { ar: 'كسبت', en: 'Won', cls: 'bg-primary text-primary-foreground' },
  lost: { ar: 'خسرت', en: 'Lost', cls: 'bg-coral/10 text-coral' },
  closed: { ar: 'مغلقة', en: 'Closed', cls: 'bg-muted text-muted-foreground' },
};

const TX_TYPE: Record<string, { ar: string; en: string }> = {
  deposit: { ar: 'إيداع', en: 'Deposit' },
  investment: { ar: 'استثمار', en: 'Investment' },
  payout: { ar: 'صرف عوائد', en: 'Payout' },
  refund: { ar: 'استرداد', en: 'Refund' },
  fee: { ar: 'رسوم', en: 'Fee' },
};

const USER_TYPE: Record<string, { ar: string; en: string }> = {
  investor: { ar: 'مستثمر', en: 'Investor' },
  applicant: { ar: 'صاحب قضية', en: 'Applicant' },
  staff: { ar: 'فريق العمل', en: 'Staff' },
};

interface StaffProfile {
  full_name_ar?: string;
  full_name_en?: string;
  roles?: { name_ar: string; name_en: string; slug: string } | { name_ar: string; name_en: string; slug: string }[] | null;
}

function fmtMoney(v: number, isAr: boolean) {
  return `${Math.round(v).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default async function StaffDashboard({ locale, profile }: { locale: string; profile: StaffProfile }) {
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  /* ---------------- permissions ---------------- */
  const perms: Record<string, boolean> = {};
  if (user) {
    const results = await Promise.all(
      PERM_KEYS.map((k) => supabase.rpc('has_permission', { uid: user.id, perm_key: k }))
    );
    PERM_KEYS.forEach((k, i) => {
      perms[k] = !!results[i]?.data;
    });
  }
  const isAdmin = perms['admin.access'];
  const canViewUsers = perms['users.view'] || perms['users.manage'] || isAdmin;
  const canViewCases = perms['cases.view'] || perms['cases.approve'] || perms['cases.review'] || perms['cases.manage'] || isAdmin;
  const canViewMoney = perms['transactions.view'] || perms['finance.payout'] || isAdmin;
  const canReview = perms['cases.review'] || perms['cases.approve'] || isAdmin;
  const canManageRoles = perms['roles.view'] || perms['roles.manage'] || isAdmin;
  const canManageContent = perms['content.manage'] || isAdmin;

  /* ---------------- data (each gated by its permission) ---------------- */
  const [usersCountRes, latestUsersRes, casesRes, investmentsRes, txRes, contentCountsRes] = await Promise.all([
    canViewUsers ? supabase.from('profiles').select('*', { count: 'exact', head: true }) : Promise.resolve({ count: null }),
    canViewUsers ? supabase.from('profiles').select('full_name_ar, full_name_en, user_type, kyc_status, created_at, roles(name_ar, name_en)').order('created_at', { ascending: false }).limit(5) : Promise.resolve({ data: null }),
    canViewCases ? supabase.from('cases').select('id, title_ar, title_en, status, requested_funding, funded_amount, created_at').order('created_at', { ascending: false }) : Promise.resolve({ data: null }),
    canViewMoney ? supabase.from('investments').select('amount, status, created_at').order('created_at', { ascending: true }) : Promise.resolve({ data: null }),
    canViewMoney ? supabase.from('transactions').select('type, amount, status, created_at').order('created_at', { ascending: false }).limit(6) : Promise.resolve({ data: null }),
    canManageContent ? Promise.all([
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('partners').select('*', { count: 'exact', head: true }),
      supabase.from('faqs').select('*', { count: 'exact', head: true }),
    ]) : Promise.resolve(null),
  ]);

  const totalUsers = usersCountRes.count ?? null;
  const latestUsers = latestUsersRes.data ?? [];
  const cases = casesRes.data ?? [];
  const investments = investmentsRes.data ?? [];
  const transactions = txRes.data ?? [];
  const contentCounts = contentCountsRes
    ? { comments: contentCountsRes[0].count ?? 0, partners: contentCountsRes[1].count ?? 0, faqs: contentCountsRes[2].count ?? 0 }
    : null;

  const totalInvested = investments.reduce((acc, i) => acc + Number(i.amount || 0), 0);
  const pendingReview = cases.filter((c) => ['submitted', 'under_review', 'committee_review'].includes(c.status)).length;

  /* investment timeline (group by day) */
  const invByDay = new Map<string, number>();
  for (const inv of investments) {
    const day = new Date(inv.created_at).toISOString().slice(0, 10);
    invByDay.set(day, (invByDay.get(day) ?? 0) + Number(inv.amount || 0));
  }
  const investmentsSeries = [...invByDay.entries()].map(([date, amount]) => ({ date, amount }));

  /* cases by status */
  const statusCount = new Map<string, number>();
  for (const c of cases) statusCount.set(c.status, (statusCount.get(c.status) ?? 0) + 1);
  const casesDonut = [...statusCount.entries()].map(([status, value]) => ({
    name: CASE_STATUS[status] ? (isAr ? CASE_STATUS[status].ar : CASE_STATUS[status].en) : status,
    value,
  }));

  /* ---------------- identity ---------------- */
  const role = Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles;
  const roleName = role ? (isAr ? role.name_ar : role.name_en) : null;
  const userName = (isAr ? profile?.full_name_ar : profile?.full_name_en) || profile?.full_name_ar || '';

  const hasStaffAccess = canReview || isAdmin || canManageRoles || canManageContent || canViewUsers || canViewCases || canViewMoney;

  const kpis: { icon: LucideIcon; label: string; value: string; sub?: string; tint: string; small?: boolean }[] = [
    ...(canViewUsers && totalUsers !== null ? [{ icon: Users, label: isAr ? 'المستخدمون' : 'Users', value: String(totalUsers), tint: 'bg-indigo/10 text-indigo' }] : []),
    ...(canViewCases ? [{ icon: FileText, label: isAr ? 'القضايا' : 'Cases', value: String(cases.length), sub: pendingReview > 0 ? (isAr ? `${pendingReview} بانتظار المراجعة` : `${pendingReview} pending review`) : undefined, tint: 'bg-primary/10 text-primary' }] : []),
    ...(canViewMoney ? [{ icon: Wallet, label: isAr ? 'حجم الاستثمارات' : 'Investments', value: fmtMoney(totalInvested, isAr), sub: isAr ? `${investments.length} عملية` : `${investments.length} investments`, tint: 'bg-gold/15 text-gold', small: true }] : []),
    ...(canViewMoney ? [{ icon: Activity, label: isAr ? 'المعاملات' : 'Transactions', value: String(transactions.length), tint: 'bg-coral/10 text-coral' }] : []),
    ...(contentCounts ? [{ icon: MessagesSquare, label: isAr ? 'المحتوى' : 'Content', value: String(contentCounts.comments + contentCounts.partners + contentCounts.faqs), sub: isAr ? `${contentCounts.comments} تعليق · ${contentCounts.partners} شريك · ${contentCounts.faqs} سؤال` : `${contentCounts.comments} comments · ${contentCounts.partners} partners · ${contentCounts.faqs} FAQs`, tint: 'bg-primary/10 text-primary' }] : []),
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {isAr ? `مرحباً، ${userName}` : `Welcome, ${userName}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAr ? 'نظرة شاملة على المنصة' : 'Platform overview'}
          </p>
        </div>
        {roleName && (
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/15 text-primary px-4 py-1.5 text-sm font-bold">
            <ShieldCheck className="w-4 h-4" />
            {roleName}
          </span>
        )}
      </div>

      {!hasStaffAccess && (
        <div className="flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm font-medium text-foreground">
          <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <p>
            {isAr
              ? 'حسابك مسجل كعضو فريق لكن لم تُمنح له صلاحيات بعد. تواصل مع مدير النظام لإسناد الصلاحيات المناسبة لدورك.'
              : 'Your account is registered as staff but has no permissions yet. Contact the system admin to assign permissions for your role.'}
          </p>
        </div>
      )}

      {/* Analytics — stats strip + main chart + side analysis panel */}
      {(kpis.length > 0 || investmentsSeries.length > 0 || casesDonut.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main card: inline stats on top, big chart below */}
          <Card className="rounded-3xl border-border/70 shadow-sm xl:col-span-8">
            <CardContent className="p-3 md:p-6">
              {kpis.length > 0 && (
                <div className={`grid gap-y-4 md:gap-y-5 grid-cols-2 sm:grid-cols-3 ${kpis.length >= 5 ? 'lg:grid-cols-5' : kpis.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                  {kpis.map((kpi, i) => (
                    <div key={i} className="px-2.5 md:px-4 first:ps-0 border-s border-border/60 first:border-s-0 min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center ${kpi.tint}`}><kpi.icon className="w-3 h-3" /></span>
                        <span className="truncate">{kpi.label}</span>
                      </div>
                      <div className={`mt-1.5 font-extrabold tracking-tight leading-none whitespace-nowrap ${kpi.small ? 'text-sm md:text-lg' : 'text-lg md:text-2xl'}`} dir="ltr">{kpi.value}</div>
                      {kpi.sub && <div className="text-[10px] font-bold text-gold mt-1.5 truncate">{kpi.sub}</div>}
                    </div>
                  ))}
                </div>
              )}
              {investmentsSeries.length > 0 && (
                <div className={kpis.length > 0 ? 'mt-6 pt-5 border-t border-border/60' : ''} dir="ltr">
                  <InvestmentsAreaChart data={investmentsSeries} locale={locale} />
                </div>
              )}
              {investmentsSeries.length === 0 && casesDonut.length > 0 && (
                <div className={kpis.length > 0 ? 'mt-6 pt-5 border-t border-border/60' : ''}>
                  <CasesDonut data={casesDonut} locale={locale} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side analysis panel */}
          <Card className="rounded-3xl border-border/70 shadow-sm xl:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle>{isAr ? 'التحليلات' : 'Analysis'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {investmentsSeries.length > 0 && casesDonut.length > 0 && (
                <CasesDonut data={casesDonut} locale={locale} />
              )}
              {(() => {
                const rows: { label: string; value: string }[] = [];
                if (canViewCases) {
                  const active = cases.filter((c) => ['funding_open', 'funded', 'in_litigation'].includes(c.status)).length;
                  const req = cases.reduce((s, c) => s + Number(c.requested_funding || 0), 0);
                  const got = cases.reduce((s, c) => s + Number(c.funded_amount || 0), 0);
                  rows.push({ label: isAr ? 'إجمالي القضايا' : 'Total cases', value: String(cases.length) });
                  rows.push({ label: isAr ? 'قضايا نشطة الآن' : 'Active cases', value: String(active) });
                  rows.push({ label: isAr ? 'بانتظار المراجعة' : 'Pending review', value: String(pendingReview) });
                  if (req > 0) rows.push({ label: isAr ? 'اكتمال التمويل' : 'Funding completion', value: `${Math.round((got / req) * 100)}%` });
                }
                if (canViewMoney) {
                  rows.push({ label: isAr ? 'حجم الاستثمارات' : 'Invested volume', value: fmtMoney(totalInvested, isAr) });
                  rows.push({ label: isAr ? 'عدد العمليات' : 'Investments count', value: String(investments.length) });
                }
                if (canViewUsers && totalUsers !== null) {
                  rows.push({ label: isAr ? 'المستخدمون' : 'Users', value: String(totalUsers) });
                }
                if (rows.length === 0) return null;
                return (
                  <div className="divide-y divide-border/60 border-t border-border/60">
                    {rows.map((r, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-muted-foreground font-semibold">{r.label}</span>
                        <span className="font-extrabold" dir="ltr">{r.value}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Funding progress per case */}
      {canViewCases && (() => {
        const fundingCases = cases
          .filter((c) => ['funding_open', 'funded', 'in_litigation', 'approved'].includes(c.status))
          .slice(0, 5);
        if (fundingCases.length === 0) return null;
        return (
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{isAr ? 'تقدم تمويل القضايا' : 'Case Funding Progress'}</CardTitle>
              <Link href={`/${locale}/dashboard/pipeline`} className="text-xs font-bold text-primary hover:underline">
                {isAr ? 'خط السير الكامل' : 'Full pipeline'}
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {fundingCases.map((c) => {
                const req = Number(c.requested_funding || 0);
                const got = Number(c.funded_amount || 0);
                const pct = req > 0 ? Math.min(100, Math.round((got / req) * 100)) : 0;
                const st = CASE_STATUS[c.status];
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <Link href={`/${locale}/dashboard/cases/${c.id}`} className="font-bold truncate hover:text-primary hover:underline transition-colors">
                        {isAr ? c.title_ar : c.title_en}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground font-semibold" dir="ltr">
                        {fmtMoney(got, isAr)} / {fmtMoney(req, isAr)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden" dir="ltr">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-primary' : 'bg-gradient-to-r from-primary/70 to-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-xs font-extrabold text-primary text-end" dir="ltr">{pct}%</span>
                      <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
                        {st ? (isAr ? st.ar : st.en) : c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })()}

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canViewCases && cases.length > 0 && (
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{isAr ? 'أحدث القضايا' : 'Latest Cases'}</CardTitle>
              {canReview && (
                <Link href={`/${locale}/committee`} className="text-xs font-bold text-primary hover:underline">
                  {isAr ? 'مراجعة الكل' : 'Review all'}
                </Link>
              )}
            </CardHeader>
            <CardContent className="space-y-1">
              {cases.slice(0, 6).map((c) => {
                const st = CASE_STATUS[c.status];
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50 last:border-0">
                    <div className="min-w-0">
                      <Link href={`/${locale}/dashboard/cases/${c.id}`} className="font-semibold text-sm truncate hover:text-primary hover:underline transition-colors block">{isAr ? c.title_ar : c.title_en}</Link>
                      <div className="text-xs text-muted-foreground mt-0.5">{fmtMoney(Number(c.requested_funding || 0), isAr)}</div>
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
                      {st ? (isAr ? st.ar : st.en) : c.status}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {canViewUsers && latestUsers.length > 0 && (
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{isAr ? 'أحدث المستخدمين' : 'Latest Users'}</CardTitle>
              {canManageRoles && (
                <Link href={`/${locale}/admin/roles`} className="text-xs font-bold text-primary hover:underline">
                  {isAr ? 'إدارة الصلاحيات' : 'Manage roles'}
                </Link>
              )}
            </CardHeader>
            <CardContent className="space-y-1">
              {latestUsers.map((u, i) => {
                const uRole = Array.isArray(u.roles) ? u.roles[0] : u.roles;
                const name = (isAr ? u.full_name_ar : u.full_name_en) || u.full_name_ar || '—';
                return (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
                    <span className="w-9 h-9 rounded-full bg-primary/10 border border-primary/10 flex items-center justify-center text-primary font-extrabold text-sm shrink-0">
                      {name.trim().charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {uRole ? (isAr ? uRole.name_ar : uRole.name_en) : (USER_TYPE[u.user_type] ? (isAr ? USER_TYPE[u.user_type].ar : USER_TYPE[u.user_type].en) : u.user_type)}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${u.kyc_status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-gold/15 text-gold'}`}>
                      {u.kyc_status === 'verified' ? (isAr ? 'موثق' : 'Verified') : (isAr ? 'قيد التوثيق' : 'Pending')}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {canViewMoney && transactions.length > 0 && (
          <Card className="rounded-3xl border-border/70 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>{isAr ? 'أحدث المعاملات المالية' : 'Latest Transactions'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs border-b border-border">
                      <th className="text-start font-semibold py-2 pe-4">{isAr ? 'النوع' : 'Type'}</th>
                      <th className="text-start font-semibold py-2 pe-4">{isAr ? 'المبلغ' : 'Amount'}</th>
                      <th className="text-start font-semibold py-2 pe-4">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="text-start font-semibold py-2">{isAr ? 'التاريخ' : 'Date'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => {
                      const tt = TX_TYPE[tx.type];
                      return (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 pe-4 font-semibold">{tt ? (isAr ? tt.ar : tt.en) : tx.type}</td>
                          <td className="py-2.5 pe-4 font-bold text-primary">{fmtMoney(Number(tx.amount || 0), isAr)}</td>
                          <td className="py-2.5 pe-4">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-gold/15 text-gold'}`}>
                              {tx.status || '—'}
                            </span>
                          </td>
                          <td className="py-2.5 text-muted-foreground text-xs">{new Date(tx.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
