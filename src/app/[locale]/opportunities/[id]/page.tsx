import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/routing';
import { Scale, TrendingUp, AlertTriangle, Clock, ArrowRight, ArrowLeft, Coins } from 'lucide-react';
import { BackHeader } from '@/components/layout/BackHeader';
import OpportunityInvest from '@/components/invest/OpportunityInvest';
import { OpportunityAiConsultCard } from '@/components/opportunities/OpportunityAiConsultCard';
import { CaseAiDiscussButton } from '@/components/dashboard/CaseAiDiscussButton';

export default async function OpportunityDetailsPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  const isAr = locale === 'ar';
  const t = await getTranslations({ locale, namespace: 'Index' });
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caseDetails } = await supabase
    .from('public_cases')
    .select('*')
    .eq('id', id)
    .single();

  if (!caseDetails) {
    notFound();
  }

  // Staff (any cases.* permission or admin) can jump straight to the internal case file
  let isStaff = false;
  let walletBalance = 0;
  if (user) {
    const checks = await Promise.all(
      ['admin.access', 'cases.view', 'cases.manage', 'cases.approve', 'cases.review'].map((k) =>
        supabase.rpc('has_permission', { uid: user.id, perm_key: k })
      )
    );
    isStaff = checks.some((r) => !!r.data);
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
    walletBalance = Number(wallet?.balance || 0);
  }

  const funded = caseDetails.funded_amount || 0;
  const progress = Math.min(100, Math.round((funded / caseDetails.requested_funding) * 100));

  return (
    <div className={user ? 'bg-surface' : 'min-h-screen bg-surface'}>
      {!user && <BackHeader locale={locale} backHref={`/${locale}/opportunities`} backLabel={isAr ? 'العودة للفرص' : 'Back to Opportunities'} isAuthed={false} />}
      <div className="container mx-auto px-4 max-w-4xl py-6 md:py-12">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {isAr ? 'العودة للفرص' : 'Back to Opportunities'}
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <CaseAiDiscussButton
              caseItem={{
                id: caseDetails.id,
                title_ar: caseDetails.title_ar,
                title_en: caseDetails.title_en,
                status: caseDetails.status,
                requested_funding: caseDetails.requested_funding,
                funded_amount: caseDetails.funded_amount,
                court: caseDetails.court,
                case_type: caseDetails.case_type,
              }}
              locale={locale}
            />
            {user && isStaff && (
              <Link
                href={`/dashboard/cases/${caseDetails.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo hover:bg-indigo/10 rounded-full px-4 py-1.5 transition-colors"
              >
                {isAr ? 'فتح الملف الداخلي للقضية' : 'Open internal case file'}
              </Link>
            )}
          </div>
        </div>

        <div className="flex justify-between items-start gap-3 mb-6 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold min-w-0 break-words">
            {locale === 'ar' ? caseDetails.title_ar : caseDetails.title_en}
          </h1>
          <Badge variant={caseDetails.status === 'funding_open' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
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
              const st = map[caseDetails.status];
              return st ? (locale === 'ar' ? st.ar : st.en) : caseDetails.status;
            })()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Interactive AI Case Consultation Card */}
            <OpportunityAiConsultCard caseData={caseDetails} locale={locale} />
            <Card>
              <CardHeader>
                <CardTitle>{locale === 'ar' ? 'تفاصيل القضية' : 'Case Details'}</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {locale === 'ar' ? caseDetails.description_ar : caseDetails.description_en}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{locale === 'ar' ? 'معلومات قانونية' : 'Legal Information'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'نوع القضية' : 'Case Type'}</p>
                    <p className="font-medium capitalize">{caseDetails.case_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'المحكمة المختصة' : 'Court'}</p>
                    <p className="font-medium">{caseDetails.court}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{locale === 'ar' ? 'رقم القضية' : 'Case Number'}</p>
                    <p className="font-medium">{caseDetails.case_number || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle>{locale === 'ar' ? 'بيانات الاستثمار' : 'Investment Data'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{locale === 'ar' ? 'التمويل' : 'Funding'}</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>{funded.toLocaleString('en-US')} SAR</span>
                    <span>{caseDetails.requested_funding.toLocaleString('en-US')} SAR</span>
                  </div>
                </div>

                {/* Tokenization */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-primary">
                    <Coins className="w-4 h-4" />
                    {locale === 'ar' ? 'توكنز القضية' : 'Case Tokens'}
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">{locale === 'ar' ? 'سعر التوكن' : 'Token Price'}</span>
                    <span className="font-bold text-end">{Number(caseDetails.token_price || 0).toLocaleString('en-US')} {locale === 'ar' ? 'ر.س' : 'SAR'}</span>
                    <span className="text-muted-foreground">{locale === 'ar' ? 'إجمالي التوكنز' : 'Total Tokens'}</span>
                    <span className="font-bold text-end">{Number(caseDetails.total_tokens || 0).toLocaleString('en-US')}</span>
                    <span className="text-muted-foreground">{locale === 'ar' ? 'تم بيعها' : 'Sold'}</span>
                    <span className="font-bold text-end">{Number(caseDetails.sold_tokens || 0).toLocaleString('en-US')}</span>
                    <span className="text-muted-foreground">{locale === 'ar' ? 'الحد الأدنى / الأقصى' : 'Min / Max'}</span>
                    <span className="font-bold text-end" dir="ltr">{caseDetails.min_tokens} / {caseDetails.max_tokens}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm flex items-center">
                      <TrendingUp className="w-4 h-4 me-2" /> 
                      {locale === 'ar' ? 'العائد المتوقع' : 'Expected Return'}
                    </span>
                    <span className="font-bold">{caseDetails.expected_return_min}% - {caseDetails.expected_return_max}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm flex items-center">
                      <Clock className="w-4 h-4 me-2" /> 
                      {locale === 'ar' ? 'المدة المتوقعة' : 'Duration'}
                    </span>
                    <span className="font-bold">{caseDetails.duration_months} {locale === 'ar' ? 'أشهر' : 'months'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 me-2" /> 
                      {locale === 'ar' ? 'مستوى المخاطرة' : 'Risk Level'}
                    </span>
                    <Badge variant={caseDetails.risk_level === 'high' ? 'destructive' : 'secondary'}>
                      {caseDetails.risk_level === 'high' ? (locale === 'ar' ? 'عالي' : 'High') : 
                       caseDetails.risk_level === 'medium' ? (locale === 'ar' ? 'متوسط' : 'Medium') : 
                       (locale === 'ar' ? 'منخفض' : 'Low')}
                    </Badge>
                  </div>
                </div>

                <div className="max-md:sticky max-md:bottom-24 max-md:z-10 max-md:bg-card max-md:rounded-2xl max-md:p-2 max-md:shadow-lg max-md:border max-md:border-border/60">
                {caseDetails.status === 'funding_open' ? (
                  user ? (
                    isStaff ? (
                      <Button disabled className="w-full text-lg h-12" size="lg" variant="secondary">
                        {locale === 'ar' ? 'الاستثمار لحسابات المستثمرين' : 'Investing is for investor accounts'}
                      </Button>
                    ) : (
                      <OpportunityInvest locale={locale} caseData={caseDetails} balance={walletBalance} canInvest={true} />
                    )
                  ) : (
                    <Button render={<Link href="/login" />} nativeButton={false} className="w-full text-lg h-12" size="lg">
                      {locale === 'ar' ? 'سجل دخولك للاستثمار' : 'Log in to Invest'}
                    </Button>
                  )
                ) : (
                  <Button disabled className="w-full text-lg h-12" size="lg" variant="secondary">
                    {locale === 'ar' ? 'التمويل مغلق' : 'Funding Closed'}
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {locale === 'ar' 
                    ? 'يجب تسجيل الدخول كـ "مستثمر" لإتمام عملية الاستثمار.'
                    : 'You must log in as an "Investor" to complete the investment.'}
                </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}