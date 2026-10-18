'use client';

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface CaseAiDiscussButtonProps {
  caseItem: {
    id: string;
    title_ar: string;
    title_en?: string;
    status: string;
    requested_funding: number;
    funded_amount: number;
    court?: string;
    case_type?: string;
  };
  locale: string;
  className?: string;
}

export function CaseAiDiscussButton({ caseItem, locale, className = '' }: CaseAiDiscussButtonProps) {
  const isAr = locale !== 'en';

  const handleClick = () => {
    openInsafAi(
      undefined,
      isAr
        ? `لخص لي وقائع قضية "${caseItem.title_ar}"، وموقفها في محكمة ${caseItem.court || 'التجارية'}، والمبالغ المطلوبة والمموّلة.`
        : `Summarize the facts and funding progress for case "${caseItem.title_ar}".`,
      {
        selectedCase: {
          id: caseItem.id,
          title_ar: caseItem.title_ar,
          title_en: caseItem.title_en,
          status: caseItem.status,
          requested_funding: caseItem.requested_funding,
          funded_amount: caseItem.funded_amount,
          court: caseItem.court,
          case_type: caseItem.case_type,
        },
      }
    );
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0E5B34]/10 hover:bg-[#0E5B34]/15 border border-[#0E5B34]/25 text-[#0E5B34] dark:text-[#E3CD94] text-xs font-black transition-all shadow-2xs hover:shadow-xs ${className}`}
      title={isAr ? 'مناقشة تفاصيل القضية مع إنصاف الذكي' : 'Discuss case with AI'}
    >
      <Bot className="w-3.5 h-3.5 text-[#C09A4A]" />
      <span>{isAr ? 'ناقش القضية مع إنصاف الذكي' : 'Discuss with AI'}</span>
      <Sparkles className="w-3 h-3 text-[#C09A4A]" />
    </button>
  );
}
