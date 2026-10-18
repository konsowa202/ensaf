'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import { Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // The recovery link opens with a temporary recovery session (PKCE code
  // exchange is handled automatically by the supabase browser client).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasSession(!!user);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب ألا تقل عن 6 أحرف.' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(isAr ? 'تعذر تحديث كلمة المرور — اطلب رابطاً جديداً.' : 'Could not update the password — request a new link.');
      return;
    }
    setDone(true);
    setTimeout(() => router.push(`/${locale}/dashboard`), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md rounded-3xl border-border/70 shadow-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2"><Logo /></div>
          <CardTitle className="text-2xl font-extrabold">
            {isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {isAr ? 'اختر كلمة مرور جديدة لحسابك.' : 'Choose a new password for your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checking ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              {isAr ? 'جارٍ التحقق من الرابط…' : 'Verifying the link…'}
            </p>
          ) : done ? (
            <div className="text-center space-y-4 py-4">
              <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </span>
              <p className="text-sm text-muted-foreground">
                {isAr ? 'تم تحديث كلمة المرور بنجاح — جارٍ تحويلك للوحتك.' : 'Password updated — redirecting to your dashboard.'}
              </p>
            </div>
          ) : !hasSession ? (
            <div className="text-center space-y-4 py-4">
              <span className="w-14 h-14 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? 'الرابط غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً.'
                  : 'This link is invalid or expired. Please request a new one.'}
              </p>
              <Link href={`/${locale}/forgot-password`} className="inline-block text-sm font-bold text-primary hover:underline">
                {isAr ? 'طلب رابط جديد' : 'Request a new link'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { v: password, set: setPassword, label: isAr ? 'كلمة المرور الجديدة' : 'New password', ph: '••••••••' },
                { v: confirm, set: setConfirm, label: isAr ? 'تأكيد كلمة المرور' : 'Confirm password', ph: '••••••••' },
              ].map((f, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-sm font-semibold">{f.label}</label>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={f.v}
                      onChange={(e) => f.set(e.target.value)}
                      dir="ltr"
                      placeholder={f.ph}
                      className="w-full rounded-xl border border-border bg-background ps-10 pe-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              ))}
              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full rounded-full h-11" disabled={loading}>
                {loading
                  ? (isAr ? 'جارٍ التحديث…' : 'Updating…')
                  : (isAr ? 'تحديث كلمة المرور' : 'Update password')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
