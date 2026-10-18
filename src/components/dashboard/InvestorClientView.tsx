'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Coins } from 'lucide-react';
import TokenInvestDialog from '@/components/invest/TokenInvestDialog';

export default function InvestorClientView({ 
  locale, 
  publicCases, 
  investments,
  balance 
}: { 
  locale: string, 
  publicCases: any[], 
  investments: any[],
  balance: number
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  // Invest Modal State
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const openInvestModal = (c: any) => {
    setSelectedCase(c);
    setIsInvestModalOpen(true);
  };

  const handleDeposit = async () => {
    const amount = prompt(locale === 'ar' ? 'أدخل مبلغ الإيداع التجريبي (ر.س): (بحد أقصى 1000000)' : 'Enter demo deposit amount (SAR): (Max 1,000,000)', '50000');
    if (!amount) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setLoading(true);
    const { error } = await supabase.rpc('deposit_funds', { p_amount: numAmount });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert(locale === 'ar' ? 'تم الإيداع بنجاح (تجريبي)' : 'Deposit successful (Demo)');
      router.refresh();
    }
  };

  const chartData = [
    { name: locale === 'ar' ? 'المستثمر' : 'Invested', value: investments.reduce((acc, i) => acc + i.amount, 0) },
    { name: locale === 'ar' ? 'المتاح' : 'Available', value: balance }
  ];
  const COLORS = ['#0E5B34', '#E2E8F0'];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{locale === 'ar' ? 'توزيع المحفظة' : 'Portfolio Distribution'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-48 md:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => value.toLocaleString('en-US') + ' SAR'} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Button onClick={handleDeposit} disabled={loading} variant="outline" className="w-full mt-4">
              {locale === 'ar' ? 'إيداع أموال (تجريبي)' : 'Deposit Funds (Demo)'}
            </Button>
          </CardContent>
        </Card>

        {/* Available Cases to Invest */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{locale === 'ar' ? 'الفرص المتاحة' : 'Available Opportunities'}</CardTitle>
          </CardHeader>
          <CardContent>
            {publicCases.filter(c => c.status === 'funding_open').length === 0 ? (
              <p className="text-muted-foreground">{locale === 'ar' ? 'لا توجد فرص متاحة حالياً.' : 'No available opportunities at the moment.'}</p>
            ) : (
              <div className="space-y-4">
                {publicCases.filter(c => c.status === 'funding_open').map(c => (
                  <div key={c.id} className="bg-surface p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:justify-between md:items-center gap-4 border border-border/50">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{locale === 'ar' ? c.title_ar : c.title_en}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {locale === 'ar' ? 'المطلوب:' : 'Required:'} <span className="font-medium text-foreground">{c.requested_funding.toLocaleString('en-US')} SAR</span> | 
                        {locale === 'ar' ? ' تم جمع:' : ' Raised:'} <span className="font-medium text-foreground">{(c.funded_amount || 0).toLocaleString('en-US')} SAR</span>
                      </p>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-primary" />
                        {locale === 'ar' ? 'سعر التوكن:' : 'Token Price:'} <span className="font-bold text-foreground">{Number(c.token_price || 0).toLocaleString('en-US')} SAR</span> ·
                        {locale === 'ar' ? ' متبقي:' : ' left:'} <span className="font-bold text-foreground">{Number((c.total_tokens || 0) - (c.sold_tokens || 0)).toLocaleString('en-US')}</span>
                      </p>
                      <p className="text-sm text-primary font-medium">
                        {locale === 'ar' ? 'العائد المتوقع:' : 'Expected Return:'} {c.expected_return_min}% - {c.expected_return_max}%
                      </p>
                    </div>
                    <Button onClick={() => openInvestModal(c)} disabled={loading} size="lg" className="w-full md:w-auto rounded-full md:px-8 shadow-sm hover:shadow-md transition-shadow">
                      {locale === 'ar' ? 'استثمر الآن' : 'Invest Now'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* My Investments */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{locale === 'ar' ? 'استثماراتي' : 'My Investments'}</CardTitle>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <p className="text-muted-foreground">{locale === 'ar' ? 'لم تقم بأي استثمارات بعد.' : 'You haven\'t made any investments yet.'}</p>
            ) : (
              <div className="space-y-4">
                {investments.map(inv => (
                  <div key={inv.id} className="bg-surface p-5 rounded-2xl flex justify-between items-center border border-border/50">
                    <div>
                      <h3 className="font-bold mb-1">{locale === 'ar' ? inv.cases?.title_ar : inv.cases?.title_en}</h3>
                      <p className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'المبلغ المستثمر:' : 'Amount Invested:'} <span className="font-bold text-foreground">{inv.amount.toLocaleString('en-US')} SAR</span>
                        {inv.tokens ? (
                          <span className="inline-flex items-center gap-1 ms-3 text-primary font-bold">
                            <Coins className="w-3.5 h-3.5" />{inv.tokens} {locale === 'ar' ? 'توكن' : 'tokens'}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {locale === 'ar' ? 'الحالة:' : 'Status:'} <span className="px-2 py-1 bg-card rounded-full text-xs font-medium border">{inv.status}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TokenInvestDialog
        locale={locale}
        caseData={selectedCase}
        balance={balance}
        open={isInvestModalOpen}
        onOpenChange={setIsInvestModalOpen}
      />
    </>
  );
}
