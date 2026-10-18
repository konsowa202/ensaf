'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  FileText, Coins, Paperclip, ClipboardCheck, ArrowRight, ArrowLeft,
  Plus, Trash2, UploadCloud, CheckCircle2, Scale,
} from 'lucide-react';

const CASE_TYPES = [
  { key: 'commercial', ar: 'تجاري', en: 'Commercial' },
  { key: 'civil', ar: 'مدني', en: 'Civil' },
  { key: 'labor', ar: 'عمالي', en: 'Labor' },
  { key: 'real_estate', ar: 'عقاري', en: 'Real Estate' },
  { key: 'arbitration', ar: 'تحكيم', en: 'Arbitration' },
  { key: 'enforcement', ar: 'تنفيذ', en: 'Enforcement' },
];

const DOC_TYPES = [
  { key: 'contract', ar: 'عقد / اتفاقية', en: 'Contract / Agreement' },
  { key: 'court_filing', ar: 'صحيفة دعوى / صك', en: 'Court Filing / Deed' },
  { key: 'evidence', ar: 'مستند إثبات', en: 'Evidence' },
  { key: 'power_of_attorney', ar: 'وكالة شرعية', en: 'Power of Attorney' },
  { key: 'id_doc', ar: 'مستند هوية', en: 'ID Document' },
  { key: 'other', ar: 'أخرى', en: 'Other' },
];

const CASE_STATUS: Record<string, { ar: string; en: string; cls: string }> = {
  draft:            { ar: 'مسودة', en: 'Draft', cls: 'bg-muted text-muted-foreground' },
  submitted:        { ar: 'مقدمة', en: 'Submitted', cls: 'bg-gold/15 text-gold' },
  under_review:     { ar: 'قيد المراجعة', en: 'Under Review', cls: 'bg-gold/15 text-gold' },
  committee_review: { ar: 'أمام اللجنة', en: 'In Committee', cls: 'bg-indigo/10 text-indigo' },
  approved:         { ar: 'معتمدة', en: 'Approved', cls: 'bg-primary/10 text-primary' },
  rejected:         { ar: 'مرفوضة', en: 'Rejected', cls: 'bg-coral/10 text-coral' },
  funding_open:     { ar: 'التمويل مفتوح', en: 'Funding Open', cls: 'bg-primary/10 text-primary' },
  funded:           { ar: 'ممولة', en: 'Funded', cls: 'bg-indigo/10 text-indigo' },
  in_litigation:    { ar: 'قيد التقاضي', en: 'In Litigation', cls: 'bg-indigo/10 text-indigo' },
  settled:          { ar: 'تمت التسوية', en: 'Settled', cls: 'bg-primary text-primary-foreground' },
  won:              { ar: 'كسبت', en: 'Won', cls: 'bg-primary text-primary-foreground' },
  lost:             { ar: 'خسرت', en: 'Lost', cls: 'bg-coral/10 text-coral' },
  closed:           { ar: 'مغلقة', en: 'Closed', cls: 'bg-muted text-muted-foreground' },
};

interface DocFile { file: File; doc_type: string; }

const inputCls = 'w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow';

export default function ApplicantClientView({ locale, cases }: { locale: string; cases: any[] }) {
  const isAr = locale === 'ar';
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [docType, setDocType] = useState('contract');
  const router = useRouter();
  const supabase = createClient();

  const [f, setF] = useState({
    title_ar: '', title_en: '', description_ar: '', description_en: '',
    case_type: 'commercial', court: '', case_number_court: '',
    claim_amount: '', requested_funding: '', duration_months: '12',
  });

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const steps = [
    { icon: FileText, ar: 'بيانات القضية', en: 'Case Info' },
    { icon: Coins, ar: 'التفاصيل المالية', en: 'Financials' },
    { icon: Paperclip, ar: 'المستندات', en: 'Documents' },
    { icon: ClipboardCheck, ar: 'المراجعة والإرسال', en: 'Review & Submit' },
  ];

  const claimAmount = parseFloat(f.claim_amount) || 0;
  const requested = parseFloat(f.requested_funding) || 0;

  const stepValid = useMemo(() => {
    if (step === 0) return f.title_ar.trim() && f.title_en.trim() && f.court.trim();
    if (step === 1) return f.description_ar.trim() && claimAmount > 0 && requested > 0 && requested <= claimAmount && parseInt(f.duration_months) > 0;
    return true;
  }, [step, f, claimAmount, requested]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...docs];
    for (const file of Array.from(list)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(isAr ? `الملف "${file.name}" أكبر من 10MB` : `"${file.name}" exceeds 10MB`);
        continue;
      }
      next.push({ file, doc_type: docType });
    }
    setDocs(next);
    setError('');
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: inserted, error: caseError } = await supabase.from('cases').insert([{
      case_number: 'C-' + Date.now().toString().slice(-6),
      applicant_id: user.id,
      title_ar: f.title_ar.trim(),
      title_en: f.title_en.trim(),
      description_ar: f.description_ar.trim(),
      description_en: f.description_en.trim() || f.description_ar.trim(),
      case_type: f.case_type,
      court: f.court.trim(),
      claim_amount: claimAmount,
      requested_funding: requested,
      duration_months: parseInt(f.duration_months) || 12,
      risk_level: 'medium',
      status: 'submitted',
    }]).select().single();

    if (caseError) {
      setError(caseError.message);
      setLoading(false);
      return;
    }

    for (const d of docs) {
      const ext = d.file.name.split('.').pop();
      const path = `${inserted.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('case-documents').upload(path, d.file);
      if (!upErr) {
        await supabase.from('case_documents').insert([{
          case_id: inserted.id, uploaded_by: user.id, doc_type: d.doc_type,
          file_path: path, file_name: d.file.name,
        }]);
      }
    }

    setLoading(false);
    setShowWizard(false);
    setStep(0);
    setDocs([]);
    setF({ title_ar: '', title_en: '', description_ar: '', description_en: '', case_type: 'commercial', court: '', case_number_court: '', claim_amount: '', requested_funding: '', duration_months: '12' });
    router.refresh();
  };

  const openWizard = () => { setStep(0); setError(''); setShowWizard(true); };

  /* ---------------- wizard ---------------- */
  if (showWizard) {
    return (
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{isAr ? 'تقديم قضية جديدة' : 'Submit a New Case'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stepper */}
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-1 flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/10 text-primary cursor-pointer' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isAr ? s.ar : s.en}</span>
                </button>
                {i < steps.length - 1 && <div className={`h-0.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          {error && <div className="text-destructive text-sm font-medium p-3 bg-destructive/10 rounded-2xl">{error}</div>}

          {/* Step 0: basics */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">{isAr ? 'عنوان القضية (عربي) *' : 'Case Title (Arabic) *'}</label>
                <input value={f.title_ar} onChange={(e) => set('title_ar', e.target.value)} className={inputCls} placeholder={isAr ? 'مثال: نزاع مقاولات مع شركة…' : ''} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">{isAr ? 'عنوان القضية (إنجليزي) *' : 'Case Title (English) *'}</label>
                <input value={f.title_en} onChange={(e) => set('title_en', e.target.value)} className={inputCls} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">{isAr ? 'نوع القضية *' : 'Case Type *'}</label>
                <select value={f.case_type} onChange={(e) => set('case_type', e.target.value)} className={inputCls}>
                  {CASE_TYPES.map((t) => <option key={t.key} value={t.key}>{isAr ? t.ar : t.en}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">{isAr ? 'المحكمة / الجهة المختصة *' : 'Court / Authority *'}</label>
                <input value={f.court} onChange={(e) => set('court', e.target.value)} className={inputCls} placeholder={isAr ? 'مثال: المحكمة التجارية بالرياض' : 'e.g. Commercial Court, Riyadh'} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold">{isAr ? 'رقم القضية لدى المحكمة (إن وجد)' : 'Court Case Number (optional)'}</label>
                <input value={f.case_number_court} onChange={(e) => set('case_number_court', e.target.value)} className={inputCls} dir="ltr" />
              </div>
            </div>
          )}

          {/* Step 1: financials */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">{isAr ? 'قيمة المطالبة (ر.س) *' : 'Claim Amount (SAR) *'}</label>
                  <input type="number" min="1" value={f.claim_amount} onChange={(e) => set('claim_amount', e.target.value)} className={inputCls} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">{isAr ? 'التمويل المطلوب (ر.س) *' : 'Requested Funding (SAR) *'}</label>
                  <input type="number" min="1" value={f.requested_funding} onChange={(e) => set('requested_funding', e.target.value)} className={inputCls} dir="ltr" />
                  {requested > claimAmount && claimAmount > 0 && (
                    <p className="text-xs text-coral font-semibold">{isAr ? 'لا يمكن أن يتجاوز التمويل قيمة المطالبة' : 'Funding cannot exceed claim amount'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">{isAr ? 'المدة المتوقعة (أشهر) *' : 'Expected Duration (months) *'}</label>
                  <input type="number" min="1" value={f.duration_months} onChange={(e) => set('duration_months', e.target.value)} className={inputCls} dir="ltr" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">{isAr ? 'وصف القضية (عربي) *' : 'Case Description (Arabic) *'}</label>
                <textarea value={f.description_ar} onChange={(e) => set('description_ar', e.target.value)} rows={5} className={inputCls} placeholder={isAr ? 'اشرح وقائع النزاع، مرحلته الحالية، والأدلة المتوفرة…' : ''} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">{isAr ? 'الوصف (إنجليزي — اختياري)' : 'Description (English — optional)'}</label>
                <textarea value={f.description_en} onChange={(e) => set('description_en', e.target.value)} rows={4} className={inputCls} dir="ltr" />
              </div>
            </div>
          )}

          {/* Step 2: documents */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">{isAr ? 'نوع المستند' : 'Document Type'}</label>
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} className={inputCls}>
                    {DOC_TYPES.map((t) => <option key={t.key} value={t.key}>{isAr ? t.ar : t.en}</option>)}
                  </select>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  {isAr ? 'اختر ملفات (PDF/صور — 10MB)' : 'Choose files (PDF/images — 10MB)'}
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
                </label>
              </div>

              {docs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-2xl">
                  {isAr ? 'لا توجد مستندات مضافة بعد. المستندات القوية تسرّع اعتماد القضية.' : 'No documents yet. Strong evidence speeds up approval.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {docs.map((d, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/60 bg-surface/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{d.file.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {(d.file.size / 1024).toFixed(0)} KB · {isAr ? DOC_TYPES.find((t) => t.key === d.doc_type)?.ar : DOC_TYPES.find((t) => t.key === d.doc_type)?.en}
                          </div>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => setDocs(docs.filter((_, j) => j !== i))}>
                        <Trash2 className="w-4 h-4 text-coral" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-surface/50 p-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'العنوان' : 'Title'}</span><span className="font-bold">{f.title_ar}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'النوع' : 'Type'}</span><span className="font-bold">{isAr ? CASE_TYPES.find((t) => t.key === f.case_type)?.ar : CASE_TYPES.find((t) => t.key === f.case_type)?.en}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'المحكمة' : 'Court'}</span><span className="font-bold">{f.court}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'قيمة المطالبة' : 'Claim'}</span><span className="font-bold" dir="ltr">{claimAmount.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'التمويل المطلوب' : 'Funding'}</span><span className="font-bold text-primary" dir="ltr">{requested.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'المدة' : 'Duration'}</span><span className="font-bold">{f.duration_months} {isAr ? 'شهر' : 'months'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'المستندات' : 'Documents'}</span><span className="font-bold">{docs.length}</span></div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAr
                  ? 'بالضغط على "إرسال الطلب" تقرّ بصحة البيانات المقدمة، وستخضع القضية لمراجعة المحلل ثم اللجنة القضائية قبل عرضها للمستثمرين.'
                  : 'By submitting you confirm the data is accurate. The case will be reviewed by an analyst then the judicial committee before being listed to investors.'}
              </p>
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Button type="button" variant="outline" className="rounded-full" disabled={loading}
              onClick={() => (step === 0 ? setShowWizard(false) : setStep(step - 1))}>
              {isAr ? <ArrowRight className="w-4 h-4 me-1.5" /> : <ArrowLeft className="w-4 h-4 me-1.5" />}
              {step === 0 ? (isAr ? 'إلغاء' : 'Cancel') : (isAr ? 'السابق' : 'Back')}
            </Button>
            {step < 3 ? (
              <Button type="button" className="rounded-full" disabled={!stepValid} onClick={() => setStep(step + 1)}>
                {isAr ? 'التالي' : 'Next'}
                {isAr ? <ArrowLeft className="w-4 h-4 ms-1.5" /> : <ArrowRight className="w-4 h-4 ms-1.5" />}
              </Button>
            ) : (
              <Button type="button" className="rounded-full" disabled={loading} onClick={submit}>
                {loading ? (isAr ? 'جارٍ الإرسال…' : 'Submitting…') : (isAr ? 'إرسال الطلب' : 'Submit Application')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ---------------- list ---------------- */
  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isAr ? 'قضاياي' : 'My Cases'}</CardTitle>
        <Button className="rounded-full" onClick={openWizard}>
          <Plus className="w-4 h-4 me-1.5" />
          {isAr ? 'تقديم قضية جديدة' : 'Submit New Case'}
        </Button>
      </CardHeader>
      <CardContent>
        {cases.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Scale className="w-7 h-7" />
            </div>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'لم تقدّم أي قضية بعد — ابدأ بتقديم قضيتك الأولى.' : 'No cases yet — submit your first case.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => {
              const st = CASE_STATUS[c.status];
              return (
                <div key={c.id} className="bg-surface p-5 rounded-2xl flex justify-between items-center border border-border/50">
                  <div className="min-w-0">
                    <h3 className="font-bold mb-1 truncate">{isAr ? c.title_ar : c.title_en}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isAr ? 'رقم القضية:' : 'Case #'} <span className="font-medium text-foreground">{c.case_number}</span>
                    </p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
                    {st ? (isAr ? st.ar : st.en) : c.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
