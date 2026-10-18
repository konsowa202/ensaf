import { register } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/brand/logo';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Auth');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">{t('register.title')}</CardTitle>
          <CardDescription>{t('register.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={register} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('register.accountType')}</label>
              <select name="user_type" required className="w-full p-2 border rounded-md bg-card">
                <option value="investor">{t('register.investor')}</option>
                <option value="applicant">{t('register.applicant')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('register.fullName')}</label>
              <input 
                name="full_name" 
                type="text" 
                required 
                className="w-full p-2 border rounded-md"
                placeholder={t('register.fullName')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('register.phone')}</label>
              <input 
                name="phone" 
                type="tel" 
                required 
                className="w-full p-2 border rounded-md"
                placeholder="+966500000000"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('register.email')}</label>
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
              <label className="text-sm font-medium">{t('register.password')}</label>
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full p-2 border rounded-md"
                placeholder="********"
                dir="ltr"
              />
            </div>
            
            <Button type="submit" className="w-full">{t('register.submit')}</Button>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
              {t('register.hasAccount')}{' '}
              <Link href={`/${locale}/login`} className="text-primary hover:underline">
                {t('register.loginLink')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
