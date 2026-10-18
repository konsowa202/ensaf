import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProfileEditor } from '@/components/dashboard/ProfileEditor';
import {
  Wallet, Briefcase, Scale, ShieldCheck, Mail, Phone, CalendarClock, TrendingUp,
} from 'lucide-react';

const CASE_STATUS: Record<string, { ar: string; en: string; cls: string }> = {
  draft:            { ar: 'مسودة', en: 'Draft', cls: 'bg-muted text-muted-foreground' },
  submitted:        { ar: 'مقدمة', en: 'Submitted', cls: 'bg-gold/15 text-gold' },
  under_review:     { ar: 'قيد المراجعة', en: 'Under Review', cls: 'bg-gold/15 text-gold' },
  committee_review: { ar: 'أمام اللجنة', en: 'In Committee', cls: 'bg-indigo/10 text-indigo' },
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

const INV_STATUS: Record<string, { ar: string; en: string; cls: string }> = {
  confirmed: { ar: 'نشط', en: 'Active', cls: 'bg-primary/10 text-primary' },
  returned:  { ar: 'تم صرفه', en: 'Paid', cls: 'bg-gold/15 text-gold' },
  lost:      { ar: 'خسارة', en: 'Lost', cls: 'bg-coral/10 text-coral' },
  pending:   { ar: 'معلق', en: 'Pending', cls: 'bg-muted text-muted-foreground' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', cls: 'bg-muted text-muted-foreground' },
};

function fmtMoney(v: number, isAr: boolean) {
  return `${Math.round(v).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const [profileRes, walletRes, investmentsRes, myCasesRes] = await Promise.all([
    supabase.from('profiles').select('*, roles(name_ar, name_en, slug)').eq('id', user.id).single(),
    supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('investments').select('*, cases:case_id(id, title_ar, title_en, case_number, status)').eq('investor_id', user.id).order('created_at', { ascending: false }),
    supabase.from('cases').select('id, title_ar, title_en, case_number, status, requested_funding, funded_amount, created_at').eq('applicant_id', user.id).order('created_at', { ascending: false }),
  ]);

  const profile = profileRes.data as any;
  const wallet = walletRes.data as any;
  const investments = investmentsRes.data || [];
  const myCases = myCasesRes.data || [];
  const role = Array.isArray(profile?.roles) ? profile.roles[0] : profile?.roles;
  const roleName = role ? (isAr ? role.name_ar : role.name_en) : (isAr ? 'مستخدم' : 'User');

  const totalInvested = investments.filter((i: any) => i.status !== 'cancelled').reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
  const totalReturned = investments.filter((i: any) => i.status === 'returned').reduce((s: number, i: any) => s + Number(i.actual_return || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Identity header */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardContent className="p-6 flex items-center gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/15 overflow-hidden flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="w-9 h-9 text-primary/60" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight truncate">
              {(isAr ? profile?.full_name_ar : profile?.full_name_en) || profile?.full_name_ar || '—'}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15">{roleName}</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${profile?.kyc_status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-gold/15 text-gold'}`}>
                {profile?.kyc_status === 'verified' ? (isAr ? 'موثق' : 'Verified') : (isAr ? 'التوثيق قيد المراجعة' : 'KYC pending')}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap mt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1" dir="ltr"><Mail className="w-3.5 h-3.5" />{profile?.email}</span>
              {profile?.phone && <span className="inline-flex items-center gap-1" dir="ltr"><Phone className="w-3.5 h-3.5" />{profile.phone}</span>}
              <span className="inline-flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />{isAr ? 'انضم' : 'Joined'} {new Date(profile?.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet (investors) */}
      {wallet && (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" />{isAr ? 'محفظتي' : 'My Wallet'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: isAr ? 'الرصيد المتاح' : 'Available', v: Number(wallet.balance || 0), tint: 'bg-primary/10 text-primary' },
                { label: isAr ? 'رصيد محجوز' : 'Reserved', v: Number(wallet.locked_balance || 0), tint: 'bg-gold/15 text-gold' },
                { label: isAr ? 'إجمالي المستثمَر' : 'Total Invested', v: totalInvested, tint: 'bg-indigo/10 text-indigo' },
                { label: isAr ? 'عوائد مستلمة' : 'Returns Received', v: totalReturned, tint: 'bg-primary/10 text-primary' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-surface/50 p-4">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${s.tint}`}><TrendingUp className="w-4 h-4" /></span>
                  <div className="font-extrabold" dir="ltr">{fmtMoney(s.v, isAr)}</div>
                  <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My investments */}
      {investments.length > 0 && (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo" />
              {isAr ? 'استثماراتي' : 'My Investments'}
              <span className="text-xs text-muted-foreground font-normal">({investments.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {investments.map((inv: any) => {
              const c = Array.isArray(inv.cases) ? inv.cases[0] : inv.cases;
              const st = INV_STATUS[inv.status];
              return (
                <div key={inv.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/60 bg-surface/50">
                  <div className="min-w-0">
                    {c?.id ? (
                      <Link href={`/${locale}/dashboard/cases/${c.id}`} className="font-bold text-sm truncate block hover:text-primary hover:underline transition-colors">
                        {isAr ? c.title_ar : c.title_en}
                      </Link>
                    ) : (
                      <span className="font-bold text-sm">—</span>
                    )}
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{c?.case_number}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-end">
                      <div className="font-bold text-sm" dir="ltr">{fmtMoney(Number(inv.amount || 0), isAr)}</div>
                      {inv.tokens ? (
                        <div className="text-[11px] text-indigo font-bold">{inv.tokens} {isAr ? 'توكن' : 'tokens'}</div>
                      ) : null}
                      {inv.status === 'returned' && inv.actual_return != null && (
                        <div className="text-[11px] text-primary font-bold" dir="ltr">+{fmtMoney(Number(inv.actual_return), isAr)}</div>
                      )}
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
                      {st ? (isAr ? st.ar : st.en) : inv.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* My cases (applicants) */}
      {myCases.length > 0 && (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-gold" />
              {isAr ? 'قضاياي' : 'My Cases'}
              <span className="text-xs text-muted-foreground font-normal">({myCases.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myCases.map((c: any) => {
              const st = CASE_STATUS[c.status];
              const pct = c.requested_funding > 0 ? Math.min(100, Math.round(((c.funded_amount || 0) / c.requested_funding) * 100)) : 0;
              return (
                <Link key={c.id} href={`/${locale}/dashboard/cases/${c.id}`} className="block p-4 rounded-2xl border border-border/60 bg-surface/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <span className="font-bold text-sm">{isAr ? c.title_ar : c.title_en}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
                      {st ? (isAr ? st.ar : st.en) : c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                    <span className="font-mono">{c.case_number}</span>
                    <span>·</span>
                    <span dir="ltr">{fmtMoney(Number(c.funded_amount || 0), isAr)} / {fmtMoney(Number(c.requested_funding || 0), isAr)}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Edit account */}
      <ProfileEditor
        locale={locale}
        userId={user.id}
        initial={{
          full_name_ar: profile?.full_name_ar ?? null,
          full_name_en: profile?.full_name_en ?? null,
          phone: profile?.phone ?? null,
          avatar_url: profile?.avatar_url ?? null,
        }}
      />
    </div>
  );
}
