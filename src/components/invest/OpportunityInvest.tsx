'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import TokenInvestDialog from '@/components/invest/TokenInvestDialog';

export default function OpportunityInvest({
  locale,
  caseData,
  balance,
  canInvest,
}: {
  locale: string;
  caseData: any;
  balance: number;
  canInvest: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isAr = locale === 'ar';

  if (!canInvest) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full text-lg h-12" size="lg">
        {isAr ? 'اشترِ توكنز الآن' : 'Buy Tokens Now'}
      </Button>
      <TokenInvestDialog
        locale={locale}
        caseData={caseData}
        balance={balance}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
