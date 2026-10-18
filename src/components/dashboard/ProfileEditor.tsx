'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, User } from 'lucide-react';

export function ProfileEditor({
  locale,
  userId,
  initial,
}: {
  locale: string;
  userId: string;
  initial: {
    full_name_ar: string | null;
    full_name_en: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
}) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nameAr, setNameAr] = useState(initial.full_name_ar || '');
  const [nameEn, setNameEn] = useState(initial.full_name_en || '');
  const [phone, setPhone] = useState(initial.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function uploadAvatar(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ ok: false, text: isAr ? 'الصورة أكبر من 5 ميجا.' : 'Image is larger than 5MB.' });
      return;
    }
    setUploading(true);
    setMsg(null);
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const path = `${userId}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      setMsg({ ok: false, text: upErr.message });
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${data.publicUrl}?v=${Date.now()}`;
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
    setAvatarUrl(url);
    setUploading(false);
    setMsg({ ok: true, text: isAr ? 'تم تحديث الصورة.' : 'Photo updated.' });
    router.refresh();
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name_ar: nameAr.trim() || null,
        full_name_en: nameEn.trim() || null,
        phone: phone.trim() || null,
      })
      .eq('id', userId);
    setBusy(false);
    setMsg(error
      ? { ok: false, text: error.message }
      : { ok: true, text: isAr ? 'تم حفظ البيانات بنجاح.' : 'Profile saved.' });
    if (!error) router.refresh();
  }

  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{isAr ? 'بيانات الحساب' : 'Account Details'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/15 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-primary/50" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -end-2 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-60"
              aria-label={isAr ? 'تغيير الصورة' : 'Change photo'}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
                e.target.value = '';
              }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-bold text-foreground">{isAr ? 'الصورة الشخصية' : 'Profile photo'}</p>
            <p className="text-xs mt-1">{isAr ? 'PNG أو JPG حتى 5 ميجا.' : 'PNG or JPG up to 5MB.'}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">{isAr ? 'الاسم الكامل (عربي)' : 'Full name (Arabic)'}</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">{isAr ? 'الاسم الكامل (إنجليزي)' : 'Full name (English)'}</label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              dir="ltr"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">{isAr ? 'رقم الجوال' : 'Phone'}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              placeholder="+9665XXXXXXXX"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {msg && (
          <p className={`rounded-xl px-3 py-2 text-xs font-medium ${msg.ok ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
            {msg.text}
          </p>
        )}

        <Button className="rounded-full px-8" onClick={save} disabled={busy || uploading}>
          {busy ? (isAr ? 'جارٍ الحفظ…' : 'Saving…') : (isAr ? 'حفظ التغييرات' : 'Save changes')}
        </Button>
      </CardContent>
    </Card>
  );
}
