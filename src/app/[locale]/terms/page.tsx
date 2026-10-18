import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${locale}`}>
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/login`}>
              <Button variant="ghost">{locale === 'ar' ? 'تسجيل الدخول' : 'Login'}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          {locale === 'ar' ? 'الشروط والأحكام' : 'Terms and Conditions'}
        </h1>
        <div className="prose prose-lg max-w-none">
          <p>{locale === 'ar' ? 'هذه هي الشروط والأحكام الخاصة باستخدام منصة إنصاف...' : 'These are the terms and conditions for using the INSAF platform...'}</p>
          <h2>{locale === 'ar' ? '1. القبول' : '1. Acceptance'}</h2>
          <p>{locale === 'ar' ? 'باستخدامك للمنصة، فإنك توافق على هذه الشروط.' : 'By using the platform, you agree to these terms.'}</p>
        </div>
      </main>
    </div>
  );
}