import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function ForbiddenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Index'); // Fallback to Index or we could create Error ns

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4 text-destructive">
            <ShieldAlert size={64} />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            {locale === 'ar' ? 'غير مصرح' : 'Forbidden'}
          </CardTitle>
          <CardDescription>
            {locale === 'ar' ? 'ليس لديك الصلاحية للوصول إلى هذه الصفحة.' : 'You do not have permission to access this page.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href={`/${locale}`}>
            <Button>{locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
