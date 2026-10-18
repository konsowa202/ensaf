import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/routing';
import { Scale, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { BackHeader } from '@/components/layout/BackHeader';

export default async function OpportunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const t = await getTranslations({ locale, namespace: 'Index' });
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cases } = await supabase
    .from('public_cases')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className={user ? 'bg-surface' : 'min-h-screen bg-surface'}>
      {!user && <BackHeader locale={locale} backHref={`/${locale}`} isAuthed={false} />}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">{t('nav.opportunities')}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === 'ar' 
              ? 'تصفح الفرص الاستثمارية المتاحة في القضايا التجارية وشارك في تمويلها لتحقيق عوائد مجزية.'
              : 'Browse available commercial litigation investment opportunities and fund them for rewarding returns.'}
          </p>
        </div>

        {(!cases || cases.length === 0) ? (
          <div className="text-center py-24 text-muted-foreground">
            {locale === 'ar' ? 'لا توجد فرص متاحة حالياً.' : 'No opportunities available right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {cases.map((c) => {
              const funded = c.funded_amount || 0;
              const progress = Math.min(100, Math.round((funded / c.requested_funding) * 100));
              
              return (
                <Link key={c.id} href={`/opportunities/${c.id}`} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                <Card className="flex flex-col h-full cursor-pointer transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={c.risk_level === 'high' ? 'destructive' : 'secondary'}>
                        {c.risk_level === 'high' ? (locale === 'ar' ? 'عالي المخاطر' : 'High Risk') : 
                         c.risk_level === 'medium' ? (locale === 'ar' ? 'متوسط المخاطر' : 'Medium Risk') : 
                         (locale === 'ar' ? 'منخفض المخاطر' : 'Low Risk')}
                      </Badge>
                      <Badge variant={c.status === 'funding_open' ? 'default' : 'outline'}>
                        {(() => {
                          const map: Record<string, { ar: string; en: string }> = {
                            funding_open: { ar: 'متاح للتمويل', en: 'Funding Open' },
                            funded: { ar: 'ممولة بالكامل', en: 'Funded' },
                            in_litigation: { ar: 'قيد التقاضي', en: 'In Litigation' },
                            settled: { ar: 'تمت التسوية', en: 'Settled' },
                            won: { ar: 'كسبت', en: 'Won' },
                            lost: { ar: 'خسرت', en: 'Lost' },
                            closed: { ar: 'مغلقة', en: 'Closed' },
                          };
                          const st = map[c.status];
                          return st ? (locale === 'ar' ? st.ar : st.en) : c.status;
                        })()}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">
                      {locale === 'ar' ? c.title_ar : c.title_en}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                      {locale === 'ar' ? c.description_ar : c.description_en}
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'التمويل' : 'Funding'}</span>
                          <span className="font-bold">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                          <span>{funded.toLocaleString('en-US')} SAR</span>
                          <span>{c.requested_funding.toLocaleString('en-US')} SAR</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <div className="text-sm">
                            <p className="text-muted-foreground text-xs">{locale === 'ar' ? 'العائد المتوقع' : 'Expected Return'}</p>
                            <p className="font-bold">{c.expected_return_min}% - {c.expected_return_max}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <div className="text-sm">
                            <p className="text-muted-foreground text-xs">{locale === 'ar' ? 'المدة المتوقعة' : 'Expected Duration'}</p>
                            <p className="font-bold">{c.duration_months} {locale === 'ar' ? 'أشهر' : 'months'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t">
                    <span className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium h-9 px-4 transition-colors ${
                      c.status === 'funding_open'
                        ? 'bg-primary text-primary-foreground group-hover:bg-primary/90'
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    </span>
                  </CardFooter>
                </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
