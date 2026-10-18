'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Trophy, Handshake, XCircle, UserPlus, Trash2, Loader2, Search, ArrowRight, ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type Beneficiary = {
  user_id: string | null;
  name_ar?: string;
  name_en?: string;
  email?: string;
  kind: 'investor_payout' | 'applicant_recovery' | 'platform_fee' | 'custom';
  investment_id?: string | null;
  principal?: number;
  tokens?: number;
  share_pct?: number;
  amount: number;
};

const KIND_LABEL: Record<string, { ar: string; en: string; cls: string }> = {
  investor_payout:     { ar: 'مستثمر', en: 'Investor', cls: 'bg-primary/10 text-primary' },
  applicant_recovery:  { ar: 'صاحب القضية', en: 'Applicant', cls: 'bg-indigo/10 text-indigo' },
  platform_fee:        { ar: 'رسوم منصة', en: 'Platform fee', cls: 'bg-gold/15 text-gold' },
  custom:              { ar: 'مخصص', en: 'Custom', cls: 'bg-muted text-muted-foreground' },
};

function fmt(v: number, isAr: boolean) {
  return `${Math.round(v).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default function SettlementWizard({
  locale, settleCase, onClose,
}: {
  locale: string;
  settleCase: any | null;
  onClose: () => void;
}) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [outcome, setOutcome] = useState<'won' | 'settled' | 'lost'>('won');
  const [returnPct, setReturnPct] = useState('');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [items, setItems] = useState<Beneficiary[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // add-beneficiary search
  const [addQuery, setAddQuery] = useState('');
  const [addResults, setAddResults] = useState<any[]>([]);
  const [addSearching, setAddSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (settleCase) {
      setStep(1);
      setOutcome('won');
      setReturnPct(String(settleCase.expected_return_max ?? ''));
      setMode('auto');
      setItems([]);
      setError('');
      setAddQuery('');
      setAddResults([]);
    }
  }, [settleCase]);

  const total = useMemo(() => items.reduce((a, i) => a + (Number(i.amount) || 0), 0), [items]);

  const loadPreview = async (oc = outcome, pct = returnPct) => {
    if (!settleCase) return;
    setPreviewLoading(true);
    setError('');
    const parsed = pct.trim() === '' ? null : parseFloat(pct);
    const { data, error: rpcError } = await supabase.rpc('preview_case_settlement', {
      p_case_id: settleCase.id,
      p_outcome: oc,
      p_return_pct: parsed !== null && isNaN(parsed) ? null : parsed,
    });
    setPreviewLoading(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (!data?.success) { setError(data?.error || 'preview failed'); return; }
    setItems((data.items || []).map((i: any) => ({
      user_id: i.user_id,
      name_ar: i.name_ar, name_en: i.name_en, email: i.email,
      kind: 'investor_payout', investment_id: i.investment_id,
      principal: Number(i.principal || 0), tokens: i.tokens, share_pct: i.share_pct,
      amount: Number(i.amount || 0),
    })));
  };

  const goStep2 = async () => {
    const pct = returnPct.trim() === '' ? null : parseFloat(returnPct);
    if (pct !== null && (isNaN(pct) || pct < -100)) {
      setError(isAr ? 'نسبة العائد غير صحيحة' : 'Invalid return percentage');
      return;
    }
    setError('');
    await loadPreview();
    setStep(2);
  };

  const searchUsers = (q: string) => {
    setAddQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setAddResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setAddSearching(true);
      const { data } = await supabase.rpc('admin_search_users', { p_query: q.trim(), p_limit: 8 });
      setAddSearching(false);
      if (data?.success) setAddResults(data.users || []);
    }, 350);
  };

  const addBeneficiary = (u: any, kind: Beneficiary['kind']) => {
    if (items.some((i) => i.user_id === u.id)) return;
    setItems((prev) => [...prev, {
      user_id: u.id, name_ar: u.name_ar, name_en: u.name_en, email: u.email,
      kind, amount: 0, principal: 0,
    }]);
    setAddQuery('');
    setAddResults([]);
  };

  const handleConfirm = async () => {
    if (!settleCase) return;
    setLoading(true);
    setError('');
    const pct = returnPct.trim() === '' ? null : parseFloat(returnPct);
    const payload = items.map((i) => ({
      user_id: i.user_id,
      kind: i.kind,
      investment_id: i.investment_id ?? null,
      principal: i.principal ?? 0,
      pct: i.share_pct ?? null,
      amount: Number(i.amount) || 0,
    }));
    const { data, error: rpcError } = await supabase.rpc('process_case_settlement', {
      p_case_id: settleCase.id,
      p_outcome: outcome,
      p_return_pct: pct,
      p_mode: mode,
      p_items: payload,
    });
    setLoading(false);
    if (rpcError) { setError(rpcError.message); return; }
    if (!data?.success) { setError(data?.error || (isAr ? 'فشل الصرف' : 'Payout failed')); return; }
    onClose();
    router.refresh();
  };

  const kindLabel = (k: string) => {
    const l = KIND_LABEL[k];
    return l ? (isAr ? l.ar : l.en) : k;
  };

  return (
    <Dialog open={!!settleCase} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isAr ? 'تسوية القضية وصرف المستحقات' : 'Case Settlement & Distribution'}</DialogTitle>
          <DialogDescription>
            {settleCase && (isAr ? settleCase.title_ar : settleCase.title_en)}
            {settleCase && (
              <span className="block mt-1 text-xs">
                {isAr ? 'المبلغ الممول:' : 'Funded:'} {fmt(Number(settleCase.funded_amount || 0), isAr)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* step indicator */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {[
            { n: 1, label: isAr ? 'النتيجة' : 'Outcome' },
            { n: 2, label: isAr ? 'المستفيدون' : 'Beneficiaries' },
            { n: 3, label: isAr ? 'التأكيد' : 'Confirm' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              {i > 0 && <span className="w-6 h-px bg-border" />}
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                step >= s.n ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
              }`}>{s.n}</span>
              <span className={step >= s.n ? 'text-foreground' : 'text-muted-foreground'}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Step 1: outcome ── */}
        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'won', label: isAr ? 'كسبت' : 'Won', icon: Trophy, cls: 'border-primary bg-primary/10 text-primary' },
                { key: 'settled', label: isAr ? 'تسوية' : 'Settled', icon: Handshake, cls: 'border-indigo bg-indigo/10 text-indigo' },
                { key: 'lost', label: isAr ? 'خسرت' : 'Lost', icon: XCircle, cls: 'border-coral bg-coral/10 text-coral' },
              ] as const).map((o) => (
                <button
                  key={o.key}
                  onClick={() => {
                    setOutcome(o.key);
                    if (settleCase) {
                      setReturnPct(String(o.key === 'won' ? settleCase.expected_return_max ?? '' : o.key === 'settled' ? settleCase.expected_return_min ?? '' : '0'));
                    }
                  }}
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
                  {isAr ? 'نسبة العائد % على أصل الاستثمار' : 'Return % on principal'}
                </label>
                <Input
                  type="number" dir="ltr" value={returnPct}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReturnPct(e.target.value)}
                  placeholder={settleCase ? String(outcome === 'won' ? settleCase.expected_return_max : settleCase.expected_return_min) : ''}
                />
              </div>
            )}
            {outcome === 'lost' && (
              <p className="text-sm bg-coral/10 text-coral rounded-xl p-3 font-medium">
                {isAr ? 'سيتم تسجيل الاستثمارات كخسارة كاملة. لا يمكن التراجع.' : 'Investments will be recorded as a full loss. This cannot be undone.'}
              </p>
            )}
          </div>
        )}

        {/* ── Step 2: beneficiaries ── */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex rounded-full border border-border p-1 text-xs font-bold">
                {(['auto', 'manual'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-4 py-1.5 rounded-full transition-colors ${
                      mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m === 'auto' ? (isAr ? 'توزيع تلقائي' : 'Auto') : (isAr ? 'توزيع يدوي' : 'Manual')}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => loadPreview()} disabled={previewLoading} className="rounded-full">
                {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAr ? 'إعادة الحساب' : 'Recalculate')}
              </Button>
            </div>

            {previewLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="rounded-2xl border border-border/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs border-b border-border bg-surface/60">
                      <th className="text-start font-semibold py-2.5 px-3">{isAr ? 'المستفيد' : 'Beneficiary'}</th>
                      <th className="text-start font-semibold py-2.5 px-3">{isAr ? 'النوع' : 'Type'}</th>
                      <th className="text-start font-semibold py-2.5 px-3">{isAr ? 'الأصل' : 'Principal'}</th>
                      <th className="text-start font-semibold py-2.5 px-3">{isAr ? 'الحصة %' : 'Share %'}</th>
                      <th className="text-start font-semibold py-2.5 px-3">{isAr ? 'المبلغ المستحق' : 'Amount'}</th>
                      {mode === 'manual' && <th className="py-2.5 px-3" />}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={`${it.user_id}-${idx}`} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold truncate max-w-[180px]">{isAr ? it.name_ar : it.name_en}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[180px]" dir="ltr">{it.email}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${KIND_LABEL[it.kind]?.cls || ''}`}>
                            {kindLabel(it.kind)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold" dir="ltr">{fmt(Number(it.principal || 0), isAr)}</td>
                        <td className="py-2.5 px-3 text-muted-foreground" dir="ltr">{it.share_pct != null ? `${it.share_pct}%` : '—'}</td>
                        <td className="py-2.5 px-3">
                          {mode === 'manual' ? (
                            <Input
                              type="number" dir="ltr" min={0} value={it.amount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const v = parseFloat(e.target.value);
                                setItems((prev) => prev.map((p, i) => i === idx ? { ...p, amount: isNaN(v) ? 0 : v } : p));
                              }}
                              className="w-28 h-8"
                            />
                          ) : (
                            <span className="font-extrabold text-primary" dir="ltr">{fmt(Number(it.amount || 0), isAr)}</span>
                          )}
                        </td>
                        {mode === 'manual' && (
                          <td className="py-2.5 px-3">
                            {it.kind !== 'investor_payout' && (
                              <button
                                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                        {isAr ? 'لا يوجد مستفيدون' : 'No beneficiaries'}
                      </td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-surface/60 font-extrabold">
                      <td className="py-3 px-3" colSpan={4}>{isAr ? 'إجمالي التوزيع' : 'Total distribution'}</td>
                      <td className="py-3 px-3 text-primary" dir="ltr" colSpan={2}>{fmt(total, isAr)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {mode === 'manual' && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  {isAr ? 'إضافة مستفيد (رسوم منصة / صاحب القضية / مخصص)' : 'Add beneficiary (platform fee / applicant / custom)'}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
                  <Input
                    value={addQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => searchUsers(e.target.value)}
                    placeholder={isAr ? 'ابحث بالاسم أو البريد أو الجوال أو الهوية…' : 'Search by name, email, phone or ID…'}
                    className="ps-9"
                  />
                  {addSearching && <Loader2 className="w-4 h-4 animate-spin absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground" />}
                </div>
                {addResults.length > 0 && (
                  <div className="rounded-2xl border border-border/60 divide-y divide-border/50 max-h-48 overflow-y-auto">
                    {addResults.map((u) => (
                      <div key={u.id} className="flex items-center gap-2 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm truncate">{isAr ? u.name_ar : u.name_en}</div>
                          <div className="text-[11px] text-muted-foreground truncate" dir="ltr">{u.email}</div>
                        </div>
                        {(['applicant_recovery', 'platform_fee', 'custom'] as const).map((k) => (
                          <Button key={k} size="sm" variant="outline" className="rounded-full text-[11px] h-7" onClick={() => addBeneficiary(u, k)}>
                            {kindLabel(k)}
                          </Button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: confirm ── */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-border/60 bg-surface/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'النتيجة' : 'Outcome'}</span><span className="font-bold">{outcome === 'won' ? (isAr ? 'كسبت' : 'Won') : outcome === 'settled' ? (isAr ? 'تسوية' : 'Settled') : (isAr ? 'خسرت' : 'Lost')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'نسبة العائد' : 'Return %'}</span><span className="font-bold" dir="ltr">{returnPct || '0'}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'طريقة التوزيع' : 'Mode'}</span><span className="font-bold">{mode === 'auto' ? (isAr ? 'تلقائي' : 'Auto') : (isAr ? 'يدوي' : 'Manual')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{isAr ? 'عدد المستفيدين' : 'Beneficiaries'}</span><span className="font-bold">{items.filter((i) => Number(i.amount) > 0 || i.investment_id).length}</span></div>
              <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-bold">{isAr ? 'إجمالي المبالغ' : 'Total'}</span><span className="font-extrabold text-primary" dir="ltr">{fmt(total, isAr)}</span></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? 'سيتم إيداع المبالغ في محافظ المستفيدين، وإنشاء معاملات وسجل تدقيق، وإخطار كل مستفيد. لا يمكن التراجع بعد التأكيد.'
                : 'Amounts will be credited to beneficiary wallets with transactions, audit log and notifications. This cannot be undone.'}
            </p>
          </div>
        )}

        {error && <div className="text-destructive text-sm font-medium p-2 bg-destructive/10 rounded">{error}</div>}

        {/* footer nav */}
        <div className="flex justify-between gap-3 pt-2">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                <ArrowRight className="w-4 h-4 me-1 rtl:rotate-0 ltr:rotate-180" />
                {isAr ? 'السابق' : 'Back'}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
            {step === 1 && (
              <Button onClick={goStep2} disabled={previewLoading}>
                {isAr ? 'التالي: المستفيدون' : 'Next: Beneficiaries'}
                <ArrowLeft className="w-4 h-4 ms-1 rtl:rotate-0 ltr:rotate-180" />
              </Button>
            )}
            {step === 2 && (
              <Button onClick={() => setStep(3)} disabled={previewLoading || items.length === 0}>
                {isAr ? 'مراجعة وتأكيد' : 'Review & Confirm'}
                <ArrowLeft className="w-4 h-4 ms-1 rtl:rotate-0 ltr:rotate-180" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleConfirm} disabled={loading} variant={outcome === 'lost' ? 'destructive' : 'default'}>
                {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {isAr ? 'تنفيذ التسوية والصرف' : 'Execute Settlement'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
