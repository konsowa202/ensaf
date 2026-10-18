import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText, Download, Scale, Building2, Gavel, Star, CalendarClock,
  User, Wallet, ClipboardCheck, History, ShieldCheck, AlertTriangle, Clock, TrendingUp, Coins,
} from 'lucide-react';
import CaseFileActions from '@/components/dashboard/CaseFileActions';
import { CaseDocumentsList } from '@/components/dashboard/CaseDocumentsList';
import { CaseAiDiscussButton } from '@/components/dashboard/CaseAiDiscussButton';

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

const CASE_TYPE: Record<string, { ar: string; en: string }> = {
  commercial: { ar: 'تجاري', en: 'Commercial' },
  civil: { ar: 'مدني', en: 'Civil' },
  labor: { ar: 'عمالي', en: 'Labor' },
  real_estate: { ar: 'عقاري', en: 'Real Estate' },
};

const RISK: Record<string, { ar: string; en: string }> = {
  low: { ar: 'منخفضة', en: 'Low' },
  medium: { ar: 'متوسطة', en: 'Medium' },
  high: { ar: 'عالية', en: 'High' },
};

const RECO: Record<string, { ar: string; en: string; cls: string }> = {
  approve: { ar: 'موافقة', en: 'Approve', cls: 'bg-primary/10 text-primary' },
  reject: { ar: 'رفض', en: 'Reject', cls: 'bg-coral/10 text-coral' },
  request_info: { ar: 'طلب معلومات', en: 'Request Info', cls: 'bg-gold/15 text-gold' },
};

function fmtMoney(v: number, isAr: boolean) {
  return `${Math.round(v).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default async function CaseFilePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  /* permissions */
  const permKeys = ['admin.access', 'cases.view', 'cases.manage', 'cases.approve', 'cases.review', 'transactions.view', 'finance.payout'] as const;
  const permResults = await Promise.all(permKeys.map((k) => supabase.rpc('has_permission', { uid: user.id, perm_key: k })));
  const perms: Record<string, boolean> = {};
  permKeys.forEach((k, i) => { perms[k] = !!permResults[i]?.data; });
  const isAdmin = perms['admin.access'];
  const isStaff = isAdmin || perms['cases.view'] || perms['cases.manage'] || perms['cases.approve'] || perms['cases.review'];
  const canAdvance = isAdmin || perms['cases.manage'] || perms['cases.approve'];
  const canReview = isAdmin || perms['cases.approve'];
  const canPayout = isAdmin || perms['finance.payout'];
  const canSeeMoney = isAdmin || perms['transactions.view'] || perms['finance.payout'];

  /* the case */
  const { data: c } = await supabase.from('cases').select('*').eq('id', id).single();
  if (!c) notFound();

  const isOwner = c.applicant_id === user.id;
  if (!isStaff && !isOwner) redirect(`/${locale}/403`);

  /* related data */
  const [applicantRes, docsRes, reviewsRes, investmentsRes, auditRes, updatesRes] = await Promise.all([
    c.applicant_id
      ? supabase.from('profiles').select('full_name_ar, full_name_en, email, phone, kyc_status, user_type').eq('id', c.applicant_id).single()
      : Promise.resolve({ data: null }),
    supabase.from('case_documents').select('*').eq('case_id', id).order('created_at', { ascending: false }),
    supabase.from('case_reviews').select('*, profiles:reviewer_id(full_name_ar, full_name_en)').eq('case_id', id).order('created_at', { ascending: false }),
    canSeeMoney
      ? supabase.from('investments').select('*, profiles:investor_id(full_name_ar, full_name_en, email)').eq('case_id', id).order('created_at', { ascending: false })
      : Promise.resolve({ data: null }),
    supabase.from('audit_logs').select('action, metadata, created_at').eq('entity', 'cases').eq('entity_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('case_updates').select('*, profiles:author_id(full_name_ar, full_name_en)').eq('case_id', id).order('created_at', { ascending: false }),
  ]);

  /* signed URLs for documents (bucket is private) */
  const documents = await Promise.all(
    (docsRes.data || []).map(async (d: any) => {
      const { data } = await supabase.storage.from('case-documents').createSignedUrl(d.file_path, 3600);
      return { ...d, url: data?.signedUrl || null };
    })
  );

  const requested = Number(c.requested_funding || 0);
  const fundedAmt = Number(c.funded_amount || 0);
  const progress = requested > 0 ? Math.min(100, Math.round((fundedAmt / requested) * 100)) : 0;
  const st = CASE_STATUS[c.status];
  const ct = CASE_TYPE[c.case_type];
  const risk = RISK[c.risk_level];
  const applicant = applicantRes.data as any;
  const reviews = reviewsRes.data || [];
  const investments = investmentsRes.data || [];
  const audit = auditRes.data || [];
  const updates = updatesRes.data || [];

  /* timeline: creation + review + audit events */
  const timeline: { date: string; title: string; desc?: string }[] = [
    { date: c.created_at, title: isAr ? 'تم تقديم القضية' : 'Case submitted' },
    ...(c.reviewed_at ? [{ date: c.reviewed_at, title: isAr ? 'قرار اللجنة' : 'Committee decision', desc: c.committee_notes || undefined }] : []),
    ...audit.map((a: any) => ({
      date: a.created_at,
      title: a.action === 'case_payout'
        ? (isAr ? `صرف عوائد (${a.metadata?.outcome === 'won' ? 'كسبت' : a.metadata?.outcome === 'settled' ? 'تسوية' : 'خسرت'})` : `Payout (${a.metadata?.outcome})`)
        : a.action,
      desc: a.metadata ? JSON.stringify(a.metadata) : undefined,
    })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const detail = (icon: any, label: string, value: React.ReactNode) => (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface/60 border border-border/50">
      <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground font-semibold">{label}</div>
        <div className="font-bold text-sm truncate">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight">{isAr ? c.title_ar : c.title_en}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
              {st ? (isAr ? st.ar : st.en) : c.status}
            </span>
            <CaseAiDiscussButton
              locale={locale}
              caseItem={{
                id: c.id,
                title_ar: c.title_ar,
                title_en: c.title_en,
                status: c.status,
                requested_funding: requested,
                funded_amount: fundedAmt,
                court: c.court,
                case_type: c.case_type,
              }}
            />
          </div>
          <p className="text-muted-foreground text-sm font-mono">{c.case_number}</p>
        </div>
        <CaseFileActions
          locale={locale}
          caseId={c.id}
          status={c.status}
          expectedReturnMin={c.expected_return_min}
          expectedReturnMax={c.expected_return_max}
          fundedAmount={fundedAmt}
          requestedFunding={requested}
          tokenPrice={Number(c.token_price || 100)}
          minTokens={Number(c.min_tokens || 10)}
          maxTokens={Number(c.max_tokens || 500)}
          canAdvance={canAdvance}
          canReview={canReview}
          canPayout={canPayout}
        />
      </div>

      {/* Funding progress */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-muted-foreground">{isAr ? 'تقدم التمويل' : 'Funding Progress'}</span>
            <span>{fmtMoney(fundedAmt, isAr)} / {fmtMoney(requested, isAr)} ({progress}%)</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </CardContent>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {detail(<Scale className="w-4 h-4" />, isAr ? 'نوع القضية' : 'Case Type', ct ? (isAr ? ct.ar : ct.en) : c.case_type)}
        {detail(<Building2 className="w-4 h-4" />, isAr ? 'المحكمة' : 'Court', c.court || '—')}
        {detail(<Gavel className="w-4 h-4" />, isAr ? 'حجم المطالبة' : 'Claim Amount', fmtMoney(Number(c.claim_amount || 0), isAr))}
        {detail(<Star className="w-4 h-4" />, isAr ? 'التمويل المطلوب' : 'Requested Funding', fmtMoney(requested, isAr))}
        {detail(<Coins className="w-4 h-4" />, isAr ? 'سعر التوكن' : 'Token Price', `${fmtMoney(Number(c.token_price || 0), isAr)} · ${isAr ? `حد ${c.min_tokens} - ${c.max_tokens}` : `limit ${c.min_tokens} - ${c.max_tokens}`}`)}
        {detail(<Wallet className="w-4 h-4" />, isAr ? 'التوكنز المباعة' : 'Tokens Sold', `${Math.floor(fundedAmt / Number(c.token_price || 1)).toLocaleString('en-US')} / ${Math.floor(requested / Number(c.token_price || 1)).toLocaleString('en-US')}`)}
        {detail(<TrendingUp className="w-4 h-4" />, isAr ? 'العائد المتوقع' : 'Expected Return', `${c.expected_return_min ?? '—'}% - ${c.expected_return_max ?? '—'}%`)}
        {detail(<Clock className="w-4 h-4" />, isAr ? 'المدة المتوقعة' : 'Duration', `${c.duration_months ?? '—'} ${isAr ? 'شهر' : 'months'}`)}
        {detail(<AlertTriangle className="w-4 h-4" />, isAr ? 'مستوى المخاطرة' : 'Risk Level', risk ? (isAr ? risk.ar : risk.en) : (c.risk_level || '—'))}
        {detail(<CalendarClock className="w-4 h-4" />, isAr ? 'تاريخ التقديم' : 'Submitted', new Date(c.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US'))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader><CardTitle>{isAr ? 'وصف القضية' : 'Case Description'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {isAr ? c.description_ar : c.description_en}
              </p>
              {isAr && c.description_en && c.description_en !== c.description_ar && (
                <p className="text-sm leading-relaxed text-muted-foreground/70 whitespace-pre-wrap border-t border-border/50 pt-4" dir="ltr">
                  {c.description_en}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {isAr ? 'المستندات المرفوعة' : 'Uploaded Documents'}
                <span className="text-xs text-muted-foreground font-normal">({documents.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CaseDocumentsList documents={documents} isAr={isAr} />
            </CardContent>
          </Card>

          {/* Case updates feed (AxiaFunder-style progress updates) */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-coral" />
                {isAr ? 'تحديثات القضية' : 'Case Updates'}
                <span className="text-xs text-muted-foreground font-normal">({updates.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {isAr ? 'لا توجد تحديثات بعد — ستظهر هنا مستجدات سير القضية.' : 'No updates yet — case progress will appear here.'}
                </p>
              ) : (
                <div className="relative space-y-4 ps-4 border-s-2 border-border/60">
                  {updates.map((u: any) => {
                    const prof = Array.isArray(u.profiles) ? u.profiles[0] : u.profiles;
                    const author = (isAr ? prof?.full_name_ar : prof?.full_name_en) || prof?.full_name_ar || '';
                    return (
                      <div key={u.id} className="relative">
                        <span className="absolute -start-[23px] top-1 w-3 h-3 rounded-full bg-coral border-2 border-card" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{isAr ? u.title_ar : (u.title_en || u.title_ar)}</span>
                          {!u.is_public && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold">
                              {isAr ? 'داخلي' : 'Internal'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                          {isAr ? u.body_ar : (u.body_en || u.body_ar)}
                        </p>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          {author && <span>{author} · </span>}
                          {new Date(u.created_at).toLocaleString(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Committee reviews */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-indigo" />
                {isAr ? 'تقييمات اللجنة' : 'Committee Reviews'}
                <span className="text-xs text-muted-foreground font-normal">({reviews.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {isAr ? 'لم يتم تقييم هذه القضية بعد.' : 'No reviews yet.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r: any) => {
                    const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                    const reviewer = (isAr ? prof?.full_name_ar : prof?.full_name_en) || prof?.full_name_ar || '—';
                    const reco = RECO[r.recommendation];
                    return (
                      <div key={r.id} className="p-4 rounded-2xl border border-border/60 bg-surface/50 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-indigo/10 text-indigo flex items-center justify-center font-extrabold text-xs">
                              {reviewer.trim().charAt(0)}
                            </span>
                            <span className="font-bold text-sm">{reviewer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {reco && (
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${reco.cls}`}>
                                {isAr ? reco.ar : reco.en}
                              </span>
                            )}
                            <span className="text-xs font-extrabold text-gold">{r.overall_score}/10</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: isAr ? 'القوة القانونية' : 'Legal', v: r.legal_strength },
                            { label: isAr ? 'قابلية التنفيذ' : 'Enforceability', v: r.enforceability },
                            { label: isAr ? 'ملاءة الخصم' : 'Solvency', v: r.counterparty_solvency },
                          ].map((s, i) => (
                            <div key={i} className="bg-card rounded-xl border border-border/50 p-2">
                              <div className="text-lg font-extrabold">{s.v}</div>
                              <div className="text-[10px] text-muted-foreground font-semibold">{s.label}</div>
                            </div>
                          ))}
                        </div>
                        {r.notes && (
                          <p className="text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">{r.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Applicant (staff only) */}
          {isStaff && (
            <Card className="rounded-3xl border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gold" />
                  {isAr ? 'مقدم الطلب' : 'Applicant'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicant ? (
                  <div className="space-y-2 text-sm">
                    <div className="font-bold">{(isAr ? applicant.full_name_ar : applicant.full_name_en) || applicant.full_name_ar || '—'}</div>
                    <div className="text-muted-foreground text-xs" dir="ltr">{applicant.email}</div>
                    {applicant.phone && <div className="text-muted-foreground text-xs" dir="ltr">{applicant.phone}</div>}
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 ${applicant.kyc_status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-gold/15 text-gold'}`}>
                      {applicant.kyc_status === 'verified' ? (isAr ? 'موثق' : 'Verified') : (isAr ? 'قيد التوثيق' : 'KYC Pending')}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{isAr ? 'قضية بيانات تجريبية (بدون مقدم).' : 'Seed case (no applicant).'}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Legal team & insurance (LexShares/AxiaFunder transparency) */}
          {(c.lawyer_name || c.law_firm || c.insurance_coverage_pct != null) && (
            <Card className="rounded-3xl border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-indigo" />
                  {isAr ? 'الفريق القانوني والتأمين' : 'Legal Team & Insurance'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {c.lawyer_name && (
                  <div>
                    <div className="text-[11px] text-muted-foreground font-semibold">{isAr ? 'المحامي المسؤول' : 'Lead Counsel'}</div>
                    <div className="font-bold">{c.lawyer_name}</div>
                  </div>
                )}
                {c.law_firm && (
                  <div>
                    <div className="text-[11px] text-muted-foreground font-semibold">{isAr ? 'مكتب المحاماة' : 'Law Firm'}</div>
                    <div className="font-bold">{c.law_firm}</div>
                  </div>
                )}
                {c.engagement_type && (
                  <div>
                    <div className="text-[11px] text-muted-foreground font-semibold">{isAr ? 'نوع التعاقد' : 'Engagement'}</div>
                    <div className="font-bold">
                      {c.engagement_type === 'contingency' ? (isAr ? 'نسبة من التعويض (طارئ)' : 'Contingency')
                        : c.engagement_type === 'hourly' ? (isAr ? 'بالساعة' : 'Hourly')
                        : (isAr ? 'مختلط' : 'Hybrid')}
                    </div>
                  </div>
                )}
                {c.insurance_coverage_pct != null && (
                  <div className="rounded-2xl bg-primary/5 border border-primary/15 p-3">
                    <div className="text-[11px] text-primary font-semibold">{isAr ? 'تغطية تأمينية لرأس المال' : 'Capital insurance cover'}</div>
                    <div className="font-extrabold text-primary text-lg" dir="ltr">{Number(c.insurance_coverage_pct)}%</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Investments (money permission) */}
          {canSeeMoney && (
            <Card className="rounded-3xl border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  {isAr ? 'الاستثمارات في القضية' : 'Case Investments'}
                  <span className="text-xs text-muted-foreground font-normal">({investments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">{isAr ? 'لا توجد استثمارات بعد.' : 'No investments yet.'}</p>
                ) : (
                  <div className="space-y-1">
                    {investments.map((inv: any) => {
                      const prof = Array.isArray(inv.profiles) ? inv.profiles[0] : inv.profiles;
                      const name = (isAr ? prof?.full_name_ar : prof?.full_name_en) || prof?.full_name_ar || prof?.email || '—';
                      return (
                        <div key={inv.id} className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0">
                          <span className="text-sm font-semibold truncate">{name}</span>
                          <span className="text-sm font-bold text-primary shrink-0" dir="ltr">{fmtMoney(Number(inv.amount || 0), isAr)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-coral" />
                {isAr ? 'السجل الزمني' : 'Timeline'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4 ps-4 border-s-2 border-border/60">
                {timeline.map((t, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -start-[23px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                    <div className="text-sm font-bold">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(t.date).toLocaleString(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    {t.desc && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.desc}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Committee decision */}
          {c.committee_decision && (
            <Card className="rounded-3xl border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  {isAr ? 'قرار اللجنة' : 'Committee Decision'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Badge variant={c.committee_decision === 'approve' ? 'default' : 'secondary'}>
                  {RECO[c.committee_decision] ? (isAr ? RECO[c.committee_decision].ar : RECO[c.committee_decision].en) : c.committee_decision}
                </Badge>
                {c.committee_notes && <p className="text-muted-foreground leading-relaxed">{c.committee_notes}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
