import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/brand/logo';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const redirectTo = resolvedSearchParams.redirect_to as string | undefined;
  const t = await getTranslations('Auth');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            {redirectTo && <input type="hidden" name="redirect_to" value={redirectTo} />}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('login.email')}</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full p-2 border rounded-md"
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('login.password')}</label>
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full p-2 border rounded-md"
                placeholder="********"
                dir="ltr"
              />
            </div>
            
            <Button type="submit" className="w-full">{t('login.submit')}</Button>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              {t('login.noAccount')}{' '}
              <Link href={`/${locale}/register`} className="text-primary hover:underline">
                {t('login.registerLink')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
