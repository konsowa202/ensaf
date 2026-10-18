'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError(isAr ? 'تعذر إرسال الرابط — تأكد من البريد وحاول مجدداً.' : 'Could not send the link — check the email and try again.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md rounded-3xl border-border/70 shadow-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2"><Logo /></div>
          <CardTitle className="text-2xl font-extrabold">
            {isAr ? 'نسيت كلمة المرور' : 'Forgot Password'}
          </CardTitle>
          <CardDescription>
            {isAr
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.'
              : 'Enter your email and we will send you a reset link.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isAr
                  ? 'تم إرسال رابط إعادة التعيين إلى بريدك. افتح الرابط لاختيار كلمة مرور جديدة.'
                  : 'A reset link has been sent to your email. Open it to choose a new password.'}
              </p>
              <Link href={`/${locale}/login`} className="inline-block text-sm font-bold text-primary hover:underline">
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-border bg-background ps-10 pe-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full rounded-full h-11" disabled={loading}>
                {loading
                  ? (isAr ? 'جارٍ الإرسال…' : 'Sending…')
                  : (isAr ? 'إرسال رابط إعادة التعيين' : 'Send reset link')}
              </Button>
              <div className="text-center">
                <Link href={`/${locale}/login`} className="text-sm font-bold text-primary hover:underline">
                  {isAr ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
