'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react';

const STAGES = [
  { key: 'submitted', ar: 'مقدمة', en: 'Submitted', next: 'under_review', nextAr: 'بدء المراجعة', nextEn: 'Start Review', tint: 'bg-gold/15 text-gold' },
  { key: 'under_review', ar: 'قيد المراجعة', en: 'Under Review', next: 'committee_review', nextAr: 'إحالة للجنة', nextEn: 'To Committee', tint: 'bg-gold/15 text-gold' },
  { key: 'committee_review', ar: 'أمام اللجنة', en: 'In Committee', next: null, nextAr: null, nextEn: null, tint: 'bg-indigo/10 text-indigo' },
  { key: 'approved', ar: 'معتمدة', en: 'Approved', next: 'funding_open', nextAr: 'فتح التمويل', nextEn: 'Open Funding', tint: 'bg-primary/10 text-primary' },
  { key: 'funding_open', ar: 'التمويل مفتوح', en: 'Funding Open', next: null, nextAr: null, nextEn: null, tint: 'bg-primary/10 text-primary' },
  { key: 'funded', ar: 'ممولة', en: 'Funded', next: 'in_litigation', nextAr: 'بدء التقاضي', nextEn: 'Start Litigation', tint: 'bg-indigo/10 text-indigo' },
  { key: 'in_litigation', ar: 'قيد التقاضي', en: 'In Litigation', next: null, nextAr: null, nextEn: null, tint: 'bg-indigo/10 text-indigo' },
  { key: 'closed', ar: 'منتهية', en: 'Resolved', next: null, nextAr: null, nextEn: null, tint: 'bg-muted text-muted-foreground' },
];

const CLOSED_SET = ['settled', 'won', 'lost', 'closed', 'rejected'];

export default function PipelineClientView({
  locale, cases, canManage,
}: { locale: string; cases: any[]; canManage: boolean }) {
  const isAr = locale === 'ar';
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  // stages containing cases start expanded; the rest collapsed
  const [openStages, setOpenStages] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of STAGES) {
      const count = cases.filter((c) => s.key === 'closed' ? CLOSED_SET.includes(c.status) : c.status === s.key).length;
      init[s.key] = count > 0;
    }
    return init;
  });

  const toggle = (key: string) => setOpenStages((p) => ({ ...p, [key]: !p[key] }));

  const advance = async (caseId: string, status: string) => {
    setBusy(caseId + status);
    const { error } = await supabase.from('cases').update({ status, updated_at: new Date().toISOString() }).eq('id', caseId);
    setBusy(null);
    if (error) alert(error.message);
    else router.refresh();
  };

  return (
    <div className="space-y-3">
      {STAGES.map((stage, idx) => {
        const list = cases.filter((c) =>
          stage.key === 'closed' ? CLOSED_SET.includes(c.status) : c.status === stage.key
        );
        const open = !!openStages[stage.key];
        return (
          <div key={stage.key} className="rounded-3xl border border-border/70 bg-card shadow-sm overflow-hidden">
            {/* Stage header — always visible, click to expand */}
            <button
              type="button"
              onClick={() => toggle(stage.key)}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors text-start"
            >
              <span className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-xs font-extrabold text-muted-foreground shrink-0" dir="ltr">
                {idx + 1}
              </span>
              <span className="font-bold flex-1">{isAr ? stage.ar : stage.en}</span>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${stage.tint}`}>
                {list.length} {isAr ? 'قضية' : 'cases'}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Stage body */}
            {open && (
              <div className="border-t border-border/60 p-4">
                {list.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">{isAr ? 'لا توجد قضايا في هذه المرحلة' : 'No cases in this stage'}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {list.map((c) => {
                      const req = Number(c.requested_funding || 0);
                      const got = Number(c.funded_amount || 0);
                      const pct = req > 0 ? Math.min(100, Math.round((got / req) * 100)) : 0;
                      return (
                        <div key={c.id} className="rounded-2xl bg-surface/60 border border-border/60 p-4 space-y-3">
                          <div>
                            <Link href={`/${locale}/dashboard/cases/${c.id}`} className="font-bold text-sm block truncate hover:text-primary transition-colors">
                              {isAr ? c.title_ar : c.title_en}
                            </Link>
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                              <span className="font-mono">{c.case_number}</span>
                              <span className="font-bold text-foreground" dir="ltr">{req.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}</span>
                            </div>
                          </div>
                          {got > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden" dir="ltr">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] font-extrabold text-primary" dir="ltr">{pct}%</span>
                            </div>
                          )}
                          {canManage && stage.next && (
                            <button
                              onClick={() => advance(c.id, stage.next!)}
                              disabled={busy !== null}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold py-2 hover:bg-primary/20 transition-colors disabled:opacity-50"
                            >
                              {isAr ? stage.nextAr : stage.nextEn}
                              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
