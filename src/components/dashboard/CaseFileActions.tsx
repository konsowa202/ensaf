"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Props = {
  locale: string;
  caseId: string;
  status: string;
  expectedReturnMin: number | null;
  expectedReturnMax: number | null;
  fundedAmount: number;
  requestedFunding: number;
  tokenPrice: number;
  minTokens: number;
  maxTokens: number;
  canAdvance: boolean;
  canReview: boolean;
  canPayout: boolean;
};

const NEXT_STEP: Record<string, { to: string; ar: string; en: string }> = {
  submitted: { to: "under_review", ar: "بدء المراجعة", en: "Start review" },
  under_review: { to: "committee", ar: "إحالة إلى اللجنة", en: "Refer to committee" },
  approved: { to: "funding_open", ar: "فتح التمويل", en: "Open funding" },
  funding_open: { to: "funded", ar: "إغلاق التمويل (مكتمل)", en: "Close funding (funded)" },
  funded: { to: "in_litigation", ar: "بدء التقاضي", en: "Start litigation" },
};

export default function CaseFileActions({
  locale,
  caseId,
  status,
  expectedReturnMin,
  expectedReturnMax,
  fundedAmount,
  requestedFunding,
  tokenPrice,
  minTokens,
  maxTokens,
  canAdvance,
  canReview,
  canPayout,
}: Props) {
  const router = useRouter();
  const ar = locale === "ar";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);
  const [tkPrice, setTkPrice] = useState(String(tokenPrice));
  const [tkMin, setTkMin] = useState(String(minTokens));
  const [tkMax, setTkMax] = useState(String(maxTokens));
  const [updTitleAr, setUpdTitleAr] = useState("");
  const [updTitleEn, setUpdTitleEn] = useState("");
  const [updBodyAr, setUpdBodyAr] = useState("");
  const [updBodyEn, setUpdBodyEn] = useState("");
  const [updPublic, setUpdPublic] = useState(true);
  const [outcome, setOutcome] = useState<"won" | "settled" | "lost">("won");
  const [returnPct, setReturnPct] = useState<string>(
    expectedReturnMin != null && expectedReturnMax != null
      ? String(Math.round(((expectedReturnMin + expectedReturnMax) / 2) * 100))
      : "20"
  );

  async function advance(to: string) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("cases")
      .update({ status: to })
      .eq("id", caseId);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
  }

  async function processPayout() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const pct = Number(returnPct) / 100;
    const { data, error: err } = await supabase.rpc("process_case_payout", {
      p_case_id: caseId,
      p_outcome: outcome,
      p_return_pct: Number.isFinite(pct) ? pct : 0,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    const res = data as { success?: boolean; error?: string } | null;
    if (res && res.success === false) {
      setError(res.error ?? (ar ? "فشل تنفيذ الصرف" : "Payout failed"));
      return;
    }
    setPayoutOpen(false);
    router.refresh();
  }

  async function postUpdate() {
    if (!updTitleAr.trim() || !updBodyAr.trim()) {
      setError(ar ? "أدخل عنوان ونص التحديث بالعربية" : "Enter the update title and body");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setError(ar ? "الجلسة منتهية — سجل الدخول مجدداً" : "Session expired — sign in again");
      return;
    }
    const { error: err } = await supabase.from("case_updates").insert({
      case_id: caseId,
      author_id: user.id,
      title_ar: updTitleAr.trim(),
      title_en: updTitleEn.trim() || null,
      body_ar: updBodyAr.trim(),
      body_en: updBodyEn.trim() || null,
      is_public: updPublic,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setUpdateOpen(false);
    setUpdTitleAr(""); setUpdTitleEn(""); setUpdBodyAr(""); setUpdBodyEn(""); setUpdPublic(true);
    router.refresh();
  }

  const step = NEXT_STEP[status];
  const showAdvance = canAdvance && step;
  const showPayout = canPayout && (status === "in_litigation" || status === "funded");

  async function saveTokenSettings() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.rpc("update_case_tokenization", {
      p_case_id: caseId,
      p_token_price: Number(tkPrice),
      p_min_tokens: parseInt(tkMin, 10),
      p_max_tokens: parseInt(tkMax, 10),
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    const res = data as { success?: boolean; error?: string } | null;
    if (res && res.success === false) { setError(res.error ?? (ar ? "فشل الحفظ" : "Save failed")); return; }
    setTokenOpen(false);
    router.refresh();
  }

  const previewTotal = Number(tkPrice) > 0 ? Math.floor(requestedFunding / Number(tkPrice)) : 0;

  if (!canAdvance && !showPayout && !canReview) return null;

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold mb-3">
        {ar ? "الإجراءات" : "Actions"}
      </h3>
      {error && (
        <p className="mb-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {showAdvance && (
          <Button
            className="rounded-full"
            disabled={busy}
            onClick={() => advance(step.to)}
          >
            {ar ? step.ar : step.en}
          </Button>
        )}
        {canReview && (
          <Button
            variant="outline"
            className="rounded-full"
            nativeButton={false}
            render={<Link href={`/${locale}/committee`} />}
          >
            {ar ? "تقييم القضية في اللجنة" : "Review in committee"}
          </Button>
        )}
        {canAdvance && (
          <Button
            variant="outline"
            className="rounded-full"
            disabled={busy}
            onClick={() => setUpdateOpen(true)}
          >
            {ar ? "إضافة تحديث للقضية" : "Post case update"}
          </Button>
        )}
        {canAdvance && (
          <Button
            variant="outline"
            className="rounded-full"
            disabled={busy}
            onClick={() => { setTkPrice(String(tokenPrice)); setTkMin(String(minTokens)); setTkMax(String(maxTokens)); setTokenOpen(true); }}
          >
            {ar ? "إعدادات التوكنز" : "Token settings"}
          </Button>
        )}
        {showPayout && (
          <Button
            variant="outline"
            className="rounded-full border-gold/40 text-gold hover:bg-gold/10"
            disabled={busy}
            onClick={() => setPayoutOpen(true)}
          >
            {ar ? "تسوية وصرف العوائد" : "Settle & pay out"}
          </Button>
        )}
      </div>

      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {ar ? "تسوية القضية وصرف العوائد" : "Settle case & distribute payouts"}
            </DialogTitle>
            <DialogDescription>
              {ar
                ? `سيتم توزيع العوائد على المستثمرين حسب نتيجة القضية. إجمالي التمويل: ${fundedAmount.toLocaleString()} ر.س`
                : `Returns will be distributed to investors based on the outcome. Total funded: ${fundedAmount.toLocaleString()} SAR`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 py-2">
            {(["won", "settled", "lost"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOutcome(o)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  outcome === o
                    ? o === "lost"
                      ? "bg-coral text-white"
                      : "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {o === "won"
                  ? ar
                    ? "كسب القضية"
                    : "Won"
                  : o === "settled"
                    ? ar
                      ? "تسوية"
                      : "Settled"
                    : ar
                      ? "خسارة"
                      : "Lost"}
              </button>
            ))}
          </div>

          {outcome !== "lost" && (
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">
                {ar ? "نسبة العائد %" : "Return %"}
              </span>
              <input
                type="number"
                min={0}
                max={500}
                value={returnPct}
                onChange={(e) => setReturnPct(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2"
              />
            </label>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setPayoutOpen(false)}
              disabled={busy}
            >
              {ar ? "إلغاء" : "Cancel"}
            </Button>
            <Button className="rounded-full" onClick={processPayout} disabled={busy}>
              {busy
                ? ar
                  ? "جارٍ التنفيذ…"
                  : "Processing…"
                : ar
                  ? "تأكيد الصرف"
                  : "Confirm payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post case update */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{ar ? "إضافة تحديث للقضية" : "Post a case update"}</DialogTitle>
            <DialogDescription>
              {ar
                ? "يظهر التحديث للمستثمرين في القضية ومقدم الطلب (أو للفريق الداخلي فقط إذا ألغيت العلني)."
                : "The update is shown to the case's investors and applicant (or staff-only if not public)."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <input
              value={updTitleAr}
              onChange={(e) => setUpdTitleAr(e.target.value)}
              placeholder={ar ? "عنوان التحديث (عربي) *" : "Update title (Arabic) *"}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={updTitleEn}
              onChange={(e) => setUpdTitleEn(e.target.value)}
              placeholder={ar ? "عنوان التحديث (إنجليزي — اختياري)" : "Update title (English — optional)"}
              dir="ltr"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <textarea
              value={updBodyAr}
              onChange={(e) => setUpdBodyAr(e.target.value)}
              rows={3}
              placeholder={ar ? "نص التحديث (عربي) *" : "Update body (Arabic) *"}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <textarea
              value={updBodyEn}
              onChange={(e) => setUpdBodyEn(e.target.value)}
              rows={2}
              placeholder={ar ? "نص التحديث (إنجليزي — اختياري)" : "Update body (English — optional)"}
              dir="ltr"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={updPublic}
                onChange={(e) => setUpdPublic(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              {ar ? "علني — يظهر للمستثمرين ومقدم الطلب" : "Public — visible to investors and the applicant"}
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setUpdateOpen(false)} disabled={busy}>
              {ar ? "إلغاء" : "Cancel"}
            </Button>
            <Button className="rounded-full" onClick={postUpdate} disabled={busy}>
              {busy ? (ar ? "جارٍ النشر…" : "Posting…") : (ar ? "نشر التحديث" : "Post update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Token settings */}
      <Dialog open={tokenOpen} onOpenChange={setTokenOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ar ? "إعدادات توكنز القضية" : "Case token settings"}</DialogTitle>
            <DialogDescription>
              {ar
                ? `التمويل المطلوب: ${requestedFunding.toLocaleString("en-US")} ر.س — التوكنز المباعة محفوظة ولن تتأثر`
                : `Requested funding: ${requestedFunding.toLocaleString("en-US")} SAR — sold tokens are preserved`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3">
            <label className="block text-sm col-span-3 sm:col-span-1">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">{ar ? "سعر التوكن (ر.س)" : "Token price (SAR)"}</span>
              <input type="number" min={1} value={tkPrice} onChange={(e) => setTkPrice(e.target.value)} dir="ltr"
                className="w-full rounded-xl border border-border bg-background px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">{ar ? "الحد الأدنى" : "Min tokens"}</span>
              <input type="number" min={1} value={tkMin} onChange={(e) => setTkMin(e.target.value)} dir="ltr"
                className="w-full rounded-xl border border-border bg-background px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-semibold text-muted-foreground">{ar ? "الحد الأقصى" : "Max tokens"}</span>
              <input type="number" min={1} value={tkMax} onChange={(e) => setTkMax(e.target.value)} dir="ltr"
                className="w-full rounded-xl border border-border bg-background px-3 py-2" />
            </label>
          </div>

          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3.5 text-sm flex items-center justify-between">
            <span className="text-muted-foreground font-semibold">{ar ? "إجمالي التوكنز الناتج" : "Resulting total tokens"}</span>
            <span className="font-extrabold text-primary" dir="ltr">{previewTotal.toLocaleString("en-US")}</span>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setTokenOpen(false)} disabled={busy}>
              {ar ? "إلغاء" : "Cancel"}
            </Button>
            <Button className="rounded-full" onClick={saveTokenSettings} disabled={busy}>
              {busy ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ الإعدادات" : "Save settings")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
