import React from 'react';

interface KeywordsMarqueeProps {
  locale: string;
}

/**
 * Infinite-loop keyword marquee. Content duplicated for a seamless wrap;
 * pauses on hover; direction follows the locale (container dir).
 */
export function KeywordsMarquee({ locale }: KeywordsMarqueeProps) {
  const isAr = locale !== 'en';

  const items = isAr
    ? [
        'تمويل التقاضي',
        'لجنة قضائية مختصة',
        'استثمار مُجزأ بالتوكنات',
        'أموال محفوظة بحسابات ضمان',
        'متوافق مع الشريعة والأنظمة السعودية',
        'تمويل غير قابل للرجوع',
      ]
    : [
        'Litigation Funding',
        'Judicial Committee Review',
        'Tokenized Fractional Investment',
        'Bank Escrow Protection',
        'Sharia & Saudi-Law Compliant',
        'Non-Recourse Funding',
      ];

  const Row = () => (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-8 text-sm font-bold tracking-wide text-muted-foreground whitespace-nowrap">
            {item}
          </span>
          <span className="inline-block w-1.5 h-1.5 rotate-45 bg-[#C09A4A]/70" aria-hidden />
        </span>
      ))}
    </div>
  );

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="marquee-hover marquee-fade overflow-hidden border-b border-border/60 py-5"
      aria-hidden
    >
      <div className="animate-marquee flex w-max">
        <Row />
        <Row />
      </div>
    </div>
  );
}
