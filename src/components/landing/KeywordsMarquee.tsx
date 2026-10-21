import React from 'react';

interface KeywordsMarqueeProps {
  locale: string;
}

/**
 * Infinite-loop keyword marquee.
 * - Track wrapper is always dir="ltr" (stable translate math).
 * - Direction is chosen per locale in CSS: [dir=rtl] .marquee-track uses
 *   marquee-rtl (-50% → 0), so Arabic flows left→right (enters left, exits
 *   right) and English right→left. Content duplicated exactly 2x = seamless.
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
          <span className="inline-block w-1.5 h-1.5 rotate-45 bg-[#C09A4A]/70 shrink-0" aria-hidden />
        </span>
      ))}
    </div>
  );

  return (
    // Wrapper is dir="ltr" so the oversized track anchors to the LEFT edge —
    // in an RTL overflow container Chrome anchors oversized content to the
    // right and the sliding track gets composited outside the clip (cards vanish).
    <div dir="ltr" className="marquee-hover overflow-hidden border-y border-border/60 py-3" aria-hidden>
      <div className="marquee-track flex w-max">
        <Row />
        <Row />
      </div>
    </div>
  );
}
