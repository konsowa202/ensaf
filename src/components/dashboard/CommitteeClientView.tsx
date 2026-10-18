'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Scale, FileText, Gavel, ClipboardCheck, Star, Building2, CalendarClock,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CaseDocumentsList } from '@/components/dashboard/CaseDocumentsList';

const CASE_STATUS: Record<string, { ar: string; en: string; cls: string }> = {
  submitted:        { ar: 'مقدمة', en: 'Submitted', cls: 'bg-gold/15 text-gold' },
  under_review:     { ar: 'قيد المراجعة', en: 'Under Review', cls: 'bg-gold/15 text-gold' },
  committee_review: { ar: 'أمام اللجنة', en: 'In Committee', cls: 'bg-indigo/10 text-indigo' },
  approved:         { ar: 'معتمدة', en: 'Approved', cls: 'bg-primary/10 text-primary' },
  rejected:         { ar: 'مرفوضة', en: 'Rejected', cls: 'bg-coral/10 text-coral' },
};

const CASE_TYPE: Record<string, { ar: string; en: string }> = {
  commercial: { ar: 'تجاري', en: 'Commercial' },
  civil: { ar: 'مدني', en: 'Civil' },
  labor: { ar: 'عمالي', en: 'Labor' },
  real_estate: { ar: 'عقاري', en: 'Real Estate' },
};

const DECIDED_STATUS: Record<string, { ar: string; en: string; cls: string }> = {
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

function fmtMoney(v: number, isAr: boolean) {
  return `${Math.round(v).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default function CommitteeClientView({ locale, cases, decidedCases = [], user, canReview = true, canAdvance = true }: { locale: string; cases: any[]; decidedCases?: any[]; user: any; canReview?: boolean; canAdvance?: boolean }) {
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [reviewError, setReviewError] = useState('');

  const [formData, setFormData] = useState({
    legal_strength: '5',
    enforceability: '5',
    counterparty_solvency: '5',
    recommendation: 'approve',
    notes: '',
  });

  const handleAdvance = async (caseId: string, newStatus: string) => {
    setLoading(true);
    const { error } = await supabase.from('cases').update({ status: newStatus }).eq('id', caseId);
    setLoading(false);
    if (error) alert(error.message);
    else router.refresh();
  };

  const openReview = (c: any) => {
    setSelectedCase(c);
    setReviewError('');
    setFormData({ legal_strength: '5', enforceability: '5', counterparty_solvency: '5', recommendation: 'approve', notes: '' });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setLoading(true);
    setReviewError('');

    const overall = (
      parseInt(formData.legal_strength) +
      parseInt(formData.enforceability) +
      parseInt(formData.counterparty_solvency)
    ) / 3;

    const { error } = await supabase.from('case_reviews').insert([{
      case_id: selectedCase.id,
      reviewer_id: user.id,
      legal_strength: parseInt(formData.legal_strength),
      enforceability: parseInt(formData.enforceability),
      counterparty_solvency: parseInt(formData.counterparty_solvency),
      overall_score: parseFloat(overall.toFixed(1)),
      recommendation: formData.recommendation,
      notes: formData.notes,
    }]);

    if (!error) {
      const statusMap: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected',
        request_info: 'under_review',
      };
      await supabase.from('cases').update({
        status: statusMap[formData.recommendation] || 'under_review',
        committee_decision: formData.recommendation,
        committee_notes: formData.notes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }).eq('id', selectedCase.id);
    }

    setLoading(false);
    if (error) {
      setReviewError(error.message);
    } else {
      setSelectedCase(null);
      router.refresh();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const kpis = [
    { icon: FileText, label: isAr ? 'بانتظار المراجعة' : 'Pending Review', value: String(cases.length), tint: 'bg-gold/15 text-gold' },
    { icon: ClipboardCheck, label: isAr ? 'أمام اللجنة' : 'In Committee', value: String(cases.filter((c) => c.status === 'committee_review').length), tint: 'bg-indigo/10 text-indigo' },
    { icon: Scale, label: isAr ? 'جديدة اليوم' : 'Submitted', value: String(cases.filter((c) => c.status === 'submitted').length), tint: 'bg-primary/10 text-primary' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="rounded-3xl border-border/70 shadow-sm">
            <CardContent className="p-3 md:p-5">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center mb-2 md:mb-4 ${kpi.tint}`}>
                <kpi.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="text-xl md:text-2xl font-extrabold tracking-tight">{kpi.value}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cases queue */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{isAr ? 'قضايا بانتظار المراجعة' : 'Cases Pending Review'}</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ClipboardCheck className="w-7 h-7" />
              </div>
              <p className="text-muted-foreground text-sm">
                {isAr ? 'لا توجد قضايا للمراجعة حالياً — كل شيء تحت السيطرة.' : 'No cases to review right now — all clear.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((c) => {
                const st = CASE_STATUS[c.status];
                const ct = CASE_TYPE[c.case_type];
                return (
                  <div key={c.id} className="p-4 md:p-5 rounded-2xl border border-border/60 bg-surface/50 hover:border-primary/25 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold">{isAr ? c.title_ar : c.title_en}</h3>
                          <span className="text-[11px] font-mono text-muted-foreground">{c.case_number}</span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${st ? st.cls : 'bg-muted text-muted-foreground'}`}>
                            {st ? (isAr ? st.ar : st.en) : c.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground font-medium">
                          {ct && (
                            <span className="inline-flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" /> {isAr ? ct.ar : ct.en}
                            </span>
                          )}
                          {c.court && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" /> {c.court}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Gavel className="w-3.5 h-3.5" /> {isAr ? 'المطالبة' : 'Claim'}: {fmtMoney(Number(c.claim_amount || 0), isAr)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-primary">
                            <Star className="w-3.5 h-3.5" /> {isAr ? 'التمويل المطلوب' : 'Requested'}: {fmtMoney(Number(c.requested_funding || 0), isAr)}
                          </span>
                          {c.created_at && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="w-3.5 h-3.5" /> {new Date(c.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                            </span>
                          )}
                        </div>
                        {(c.description_ar || c.description_en) && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {isAr ? c.description_ar : c.description_en}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                        <Button size="sm" variant="ghost" className="rounded-full w-full sm:w-auto" nativeButton={false}
                          render={<Link href={`/${locale}/dashboard/cases/${c.id}`} />}>
                          {isAr ? 'عرض الملف الكامل' : 'Full Case File'}
                        </Button>
                        {canAdvance && c.status === 'submitted' && (
                          <Button size="sm" variant="outline" className="rounded-full w-full sm:w-auto" disabled={loading}
                            onClick={() => handleAdvance(c.id, 'under_review')}>
                            {isAr ? 'بدء المراجعة' : 'Start Review'}
                          </Button>
                        )}
                        {canAdvance && c.status === 'under_review' && (
                          <Button size="sm" variant="outline" className="rounded-full w-full sm:w-auto" disabled={loading}
                            onClick={() => handleAdvance(c.id, 'committee_review')}>
                            {isAr ? 'إحالة للجنة' : 'To Committee'}
                          </Button>
                        )}
                        {canReview && (c.status === 'committee_review' || c.status === 'under_review' || c.status === 'submitted') && (
                          <Button size="sm" className="rounded-full w-full sm:w-auto" disabled={loading} onClick={() => openReview(c)}>
                            <Scale className="w-4 h-4 me-1.5" />
                            {isAr ? 'تقييم القضية' : 'Review Case'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently decided — always a way back to the full case file */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{isAr ? 'القضايا المحسومة مؤخراً' : 'Recently Decided Cases'}</CardTitle>
        </CardHeader>
        <CardContent>
          {decidedCases.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {isAr ? 'لا توجد قرارات سابقة بعد.' : 'No decided cases yet.'}
            </p>
          ) : (
            <div className="space-y-1">
              {decidedCases.map((c) => {
                const st = DECIDED_STATUS[c.status];
                return (
                  <Link
                    key={c.id}
                    href={`/${locale}/dashboard/cases/${c.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-2xl hover:bg-muted/60 transition-colors group"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-sm truncate block group-hover:text-primary transition-colors">
                        {isAr ? c.title_ar : c.title_en}
                      </span>
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

      {/* Review dialog */}
      <Dialog open={!!selectedCase} onOpenChange={(open: boolean) => !open && setSelectedCase(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAr ? 'تقييم القضية: ' : 'Reviewing Case: '}
              {selectedCase && (isAr ? selectedCase.title_ar : selectedCase.title_en)}
            </DialogTitle>
            <DialogDescription>
              {selectedCase && (
                <span className="text-xs">
                  {selectedCase.case_number} · {isAr ? 'التمويل المطلوب' : 'Requested'}: {fmtMoney(Number(selectedCase.requested_funding || 0), isAr)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-3 max-h-56 overflow-y-auto pe-1">
              {(selectedCase.description_ar || selectedCase.description_en) && (
                <div className="rounded-2xl border border-border/60 bg-surface/50 p-3">
                  <div className="text-[11px] font-bold text-muted-foreground mb-1">
                    {isAr ? 'وصف القضية' : 'Case Description'}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {isAr ? selectedCase.description_ar : selectedCase.description_en}
                  </p>
                </div>
              )}
              <div className="rounded-2xl border border-border/60 bg-surface/50 p-3">
                <div className="text-[11px] font-bold text-muted-foreground mb-2">
                  {isAr ? `المستندات (${(selectedCase.documents || []).length})` : `Documents (${(selectedCase.documents || []).length})`}
                </div>
                {(selectedCase.documents || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {isAr ? 'لا توجد مستندات مرفوعة.' : 'No documents uploaded.'}
                  </p>
                ) : (
                  <CaseDocumentsList documents={selectedCase.documents} isAr={isAr} />
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                { name: 'legal_strength', label: isAr ? 'القوة القانونية' : 'Legal Strength' },
                { name: 'enforceability', label: isAr ? 'قابلية التنفيذ' : 'Enforceability' },
                { name: 'counterparty_solvency', label: isAr ? 'ملاءة الخصم' : 'Counterparty Solvency' },
              ] as const).map((f) => (
                <div key={f.name} className="space-y-2 bg-surface rounded-2xl p-3 border border-border/60">
                  <label className="text-xs font-bold block">{f.label}</label>
                  <div className="flex items-center gap-3" dir="ltr">
                    <input
                      type="range" min="1" max="10" name={f.name}
                      value={formData[f.name]} onChange={handleChange}
                      className="flex-1 accent-primary"
                    />
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-extrabold text-sm flex items-center justify-center">
                      {formData[f.name]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'approve', label: isAr ? 'موافقة' : 'Approve', cls: 'border-primary bg-primary/10 text-primary' },
                { key: 'request_info', label: isAr ? 'طلب معلومات' : 'Request Info', cls: 'border-gold bg-gold/15 text-gold' },
                { key: 'reject', label: isAr ? 'رفض' : 'Reject', cls: 'border-coral bg-coral/10 text-coral' },
              ] as const).map((o) => (
                <label
                  key={o.key}
                  className={`text-center p-3 rounded-2xl border text-sm font-bold cursor-pointer transition-colors ${
                    formData.recommendation === o.key ? o.cls : 'border-border text-muted-foreground hover:border-foreground/30'
                  }`}
                >
                  <input
                    type="radio" name="recommendation" value={o.key}
                    checked={formData.recommendation === o.key}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{isAr ? 'ملاحظات اللجنة' : 'Committee Notes'}</label>
              <textarea
                name="notes" value={formData.notes} onChange={handleChange} rows={3}
                className="w-full p-3 border border-border rounded-2xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={isAr ? 'أسباب القرار وملاحظات إضافية…' : 'Decision rationale and extra notes…'}
              />
            </div>

            {reviewError && (
              <div className="text-destructive text-sm font-medium p-2 bg-destructive/10 rounded">{reviewError}</div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setSelectedCase(null)} disabled={loading}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={loading}>
                {isAr ? 'حفظ التقييم واعتماد القرار' : 'Save Review & Apply Decision'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
