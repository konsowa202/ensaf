'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface KycUser {
  id: string;
  full_name_ar: string;
  full_name_en: string;
  email: string;
  user_type: string;
  kyc_status: string;
  national_id: string | null;
  created_at: string;
}

export default function KycClientView({ locale, users }: { locale: string; users: KycUser[] }) {
  const isAr = locale === 'ar';
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const act = async (u: KycUser, status: 'verified' | 'rejected') => {
    let note: string | null = null;
    if (status === 'rejected') {
      note = prompt(isAr ? 'سبب الرفض (يظهر للمستخدم):' : 'Rejection reason (shown to user):');
      if (note === null) return;
    }
    setBusy(u.id + status);
    setError('');
    const { data, error: rpcErr } = await supabase.rpc('review_kyc', { p_user_id: u.id, p_status: status, p_note: note });
    setBusy(null);
    if (rpcErr || (data && data.success === false)) {
      setError(rpcErr?.message || data?.error || (isAr ? 'فشل التنفيذ' : 'Action failed'));
      return;
    }
    router.refresh();
  };

  if (users.length === 0) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <p className="text-muted-foreground text-sm">{isAr ? 'لا توجد طلبات توثيق بانتظار المراجعة.' : 'No pending verifications.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <div className="text-destructive text-sm font-medium p-3 bg-destructive/10 rounded-2xl">{error}</div>}
      {users.map((u) => (
        <div key={u.id} className="p-5 rounded-2xl border border-border/60 bg-surface/50 flex flex-wrap items-center gap-4">
          <span className="w-11 h-11 rounded-2xl bg-indigo/10 text-indigo flex items-center justify-center font-extrabold shrink-0">
            {((isAr ? u.full_name_ar : u.full_name_en) || u.full_name_ar || '?').trim().charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-bold truncate">{(isAr ? u.full_name_ar : u.full_name_en) || u.full_name_ar}</div>
            <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">{u.email}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {u.user_type === 'investor' ? (isAr ? 'مستثمر' : 'Investor') : u.user_type === 'applicant' ? (isAr ? 'صاحب قضية' : 'Applicant') : u.user_type}
              {u.national_id ? ` · ${isAr ? 'هوية:' : 'ID:'} ${u.national_id}` : ''}
              {' · '}{new Date(u.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" className="rounded-full" disabled={busy !== null} onClick={() => act(u, 'verified')}>
              <CheckCircle2 className="w-4 h-4 me-1.5" />
              {busy === u.id + 'verified' ? (isAr ? 'جارٍ…' : '…') : (isAr ? 'توثيق' : 'Verify')}
            </Button>
            <Button size="sm" variant="outline" className="rounded-full text-coral border-coral/30 hover:bg-coral/10" disabled={busy !== null} onClick={() => act(u, 'rejected')}>
              <XCircle className="w-4 h-4 me-1.5" />
              {isAr ? 'رفض' : 'Reject'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
