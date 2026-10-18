'use client';

import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Minus, Plus, Coins, Wallet, TrendingUp } from 'lucide-react';

interface TokenCase {
  id: string;
  title_ar: string;
  title_en: string;
  token_price: number;
  min_tokens: number;
  max_tokens: number;
  total_tokens: number;
  sold_tokens: number;
  expected_return_min?: number;
  expected_return_max?: number;
}

export default function TokenInvestDialog({
  locale,
  caseData,
  balance,
  open,
  onOpenChange,
}: {
  locale: string;
  caseData: TokenCase | null;
  balance: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const supabase = createClient();

  const [tokens, setTokens] = useState<number>(0);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ tokens: number; amount: number } | null>(null);

  const remaining = useMemo(
    () => (caseData ? Math.max(0, caseData.total_tokens - caseData.sold_tokens) : 0),
    [caseData]
  );
  const maxAllowed = useMemo(
    () => (caseData ? Math.min(caseData.max_tokens, remaining, Math.floor(balance / (caseData.token_price || 1))) : 0),
    [caseData, remaining, balance]
  );

  // Reset dialog state every time it opens for a case
  useEffect(() => {
    if (open && caseData) {
      setTokens(caseData.min_tokens);
      setRiskAcknowledged(false);
      setError('');
      setDone(null);
    }
  }, [open, caseData]);

  const amount = caseData ? tokens * caseData.token_price : 0;
  const expMin = caseData?.expected_return_min ? (amount * caseData.expected_return_min) / 100 : 0;
  const expMax = caseData?.expected_return_max ? (amount * caseData.expected_return_max) / 100 : 0;

  const clamp = (v: number) => {
    if (!caseData) return 0;
    const min = caseData.min_tokens;
    const max = Math.max(min, maxAllowed);
    return Math.max(min, Math.min(max, Math.floor(v)));
  };

  const submit = async () => {
    if (!caseData) return;
    setError('');
    if (tokens < caseData.min_tokens) { setError(isAr ? `الحد الأدنى ${caseData.min_tokens} توكن` : `Minimum is ${caseData.min_tokens} tokens`); return; }
    if (tokens > maxAllowed) { setError(isAr ? `الحد الأقصى المتاح ${maxAllowed} توكن` : `Max available is ${maxAllowed} tokens`); return; }
    if (!riskAcknowledged) { setError(isAr ? 'يجب الموافقة على إخلاء مسؤولية المخاطر' : 'You must acknowledge the risk disclaimer'); return; }

    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc('invest_in_case', {
      p_case_id: caseData.id,
      p_tokens: tokens,
    });
    setLoading(false);

    if (rpcError) { setError(rpcError.message); return; }
    const res = data as { success?: boolean; error?: string; amount?: number; tokens?: number } | null;
    if (res && res.success === false) { setError(res.error || (isAr ? 'فشل الاستثمار' : 'Investment failed')); return; }
    setDone({ tokens, amount: res?.amount ?? amount });
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAr ? 'شراء توكنز استثمارية' : 'Buy Investment Tokens'}</DialogTitle>
          <DialogDescription>{caseData && (isAr ? caseData.title_ar : caseData.title_en)}</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Coins className="w-7 h-7" />
            </div>
            <p className="font-bold text-lg">{isAr ? 'تم الشراء بنجاح!' : 'Purchase successful!'}</p>
            <p className="text-sm text-muted-foreground">
              {isAr
                ? `تمت إضافة ${done.tokens} توكن بقيمة ${done.amount.toLocaleString('en-US')} ر.س إلى محفظتك الاستثمارية`
                : `${done.tokens} tokens worth ${done.amount.toLocaleString('en-US')} SAR added to your portfolio`}
            </p>
            <Button className="w-full mt-2" onClick={() => onOpenChange(false)}>{isAr ? 'تم' : 'Done'}</Button>
          </div>
        ) : caseData && (
          <div className="space-y-5 py-2">
            {/* stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-surface rounded-xl p-3 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">{isAr ? 'سعر التوكن' : 'Token Price'}</div>
                <div className="font-extrabold">{caseData.token_price.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}</div>
              </div>
              <div className="bg-surface rounded-xl p-3 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">{isAr ? 'التوكنز المتبقية' : 'Tokens Left'}</div>
                <div className="font-extrabold">{remaining.toLocaleString('en-US')}</div>
              </div>
              <div className="bg-surface rounded-xl p-3 border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">{isAr ? 'الحد الأدنى / الأقصى' : 'Min / Max'}</div>
                <div className="font-extrabold" dir="ltr">{caseData.min_tokens} / {caseData.max_tokens}</div>
              </div>
            </div>

            {/* token stepper */}
            <div>
              <label className="text-sm font-medium block mb-2">{isAr ? 'عدد التوكنز' : 'Number of Tokens'}</label>
              <div className="flex items-center gap-2" dir="ltr">
                <Button type="button" variant="outline" size="icon" onClick={() => setTokens(clamp(tokens - 1))} disabled={tokens <= caseData.min_tokens}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  dir="ltr"
                  className="text-center font-bold text-lg"
                  value={tokens || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = parseInt(e.target.value, 10);
                    setTokens(isNaN(v) ? 0 : v);
                  }}
                  onBlur={() => setTokens(clamp(tokens))}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setTokens(clamp(tokens + 1))} disabled={tokens >= maxAllowed || maxAllowed < caseData.min_tokens}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {maxAllowed < caseData.min_tokens && (
                <p className="text-xs text-coral font-semibold mt-2">
                  {isAr ? 'لا توجد توكنز كافية متاحة أو رصيد غير كافٍ' : 'Not enough tokens available or insufficient balance'}
                </p>
              )}
            </div>

            {/* summary */}
            <div className="bg-surface rounded-xl p-4 border border-border/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Wallet className="w-4 h-4" />{isAr ? 'رصيدك المتاح' : 'Your Balance'}</span>
                <span className="font-bold">{balance.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Coins className="w-4 h-4" />{isAr ? 'إجمالي الشراء' : 'Total'}</span>
                <span className="font-extrabold text-primary text-base">{amount.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}</span>
              </div>
              {(caseData.expected_return_min || caseData.expected_return_max) ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-4 h-4" />{isAr ? 'العائد المتوقع' : 'Expected Return'}</span>
                  <span className="font-bold text-gold">{expMin.toLocaleString('en-US')} - {expMax.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="risk-ack" checked={riskAcknowledged} onCheckedChange={(c: boolean) => setRiskAcknowledged(!!c)} className="mt-0.5 cursor-pointer" />
              <label htmlFor="risk-ack" className="text-sm leading-relaxed font-medium cursor-pointer select-none">
                {isAr
                  ? 'أقر بأنني قرأت وفهمت المخاطر المتعلقة بهذا الاستثمار وأوافق على شروط وأحكام منصة إنصاف.'
                  : 'I acknowledge that I have read and understood the risks associated with this investment and agree to INSAF terms and conditions.'}
              </label>
            </div>

            {error && <div className="text-destructive text-sm font-medium p-3 bg-destructive/10 rounded-xl">{error}</div>}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={submit} disabled={loading || !riskAcknowledged || tokens < caseData.min_tokens || tokens > maxAllowed || maxAllowed < caseData.min_tokens}>
                {loading ? (isAr ? 'جارٍ الشراء...' : 'Processing...') : (isAr ? `تأكيد شراء ${tokens} توكن` : `Confirm ${tokens} tokens`)}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
