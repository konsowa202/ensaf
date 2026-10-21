'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Scale } from 'lucide-react';

interface PublicCaseItem {
  id: string;
  title_ar: string;
  title_en: string;
  case_type: string;
  requested_funding: number;
  funded_amount: number;
  expected_return_min: number;
  token_price: number;
}

interface FeaturedCasesSectionProps {
  locale: string;
  publicCases: any[] | null;
}

export function FeaturedCasesSection({ locale, publicCases }: FeaturedCasesSectionProps) {
  const isAr = locale !== 'en';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const caseTypeLabels: Record<string, { ar: string; en: string }> = {
    commercial: { ar: 'تجاري', en: 'Commercial' },
    labor: { ar: 'عمالي', en: 'Labor' },
    real_estate: { ar: 'عقاري', en: 'Real Estate' },
    execution: { ar: 'تنفيذ', en: 'Enforcement' },
    civil: { ar: 'مدني', en: 'Civil' },
    construction: { ar: 'مقاولات', en: 'Construction' },
  };

  const fallbackCases: PublicCaseItem[] = [
    {
      id: 'case-demo-1',
      title_ar: 'مطالبة مستحقات عقد مقاولات وتوريد بنية تحتية',
      title_en: 'Infrastructure Contracting & Supply Claim',
      case_type: 'construction',
      requested_funding: 850000,
      funded_amount: 680000,
      expected_return_min: 24.5,
      token_price: 100,
    },
    {
      id: 'case-demo-2',
      title_ar: 'نزاع ملكية وتطوير مخطط عقاري تجاري بجدة',
      title_en: 'Commercial Real Estate Ownership Claim',
      case_type: 'real_estate',
      requested_funding: 1500000,
      funded_amount: 1125000,
      expected_return_min: 22.0,
      token_price: 250,
    },
    {
      id: 'case-demo-3',
      title_ar: 'تنفيذ صك واسترداد مديونية تجارية',
      title_en: 'Debt Recovery & Enforcement Claim',
      case_type: 'execution',
      requested_funding: 600000,
      funded_amount: 540000,
      expected_return_min: 28.0,
      token_price: 100,
    },
  ];

  const displayCases: PublicCaseItem[] =
    publicCases && publicCases.length > 0
      ? publicCases.map((c, i) => ({
          id: c.id || `case-${i}`,
          title_ar: c.title_ar || 'مطالبة تجارية معتمدة',
          title_en: c.title_en || 'Vetted Commercial Claim',
          case_type: c.case_type || 'commercial',
          requested_funding: Number(c.requested_funding) || 1000000,
          funded_amount: Number(c.funded_amount) || 0,
          expected_return_min: Number(c.expected_return_min) || 0,
          token_price: Number(c.token_price) || 100,
        }))
      : fallbackCases;

  const fmt = (n: number) => n.toLocaleString('en-US');

  return (
    <section id="opportunities" className="py-16 md:py-24 border-t border-border/60">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-wide text-[#C09A4A] mb-3">
              {isAr ? 'الفرص الاستثمارية' : 'Opportunities'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              {isAr ? 'قضايا معتمدة متاحة الآن للتمويل' : 'Vetted cases open for funding'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {isAr
                ? 'كل قضية اجتازت تدقيق اللجنة القضائية وتُعرض بشفافية كاملة: نسبة الإنجاز، سعر التوكن، والعائد المتوقع.'
                : 'Every case has passed judicial committee review and is shown with full transparency: progress, token price, expected return.'}
            </p>
          </div>

          <Link
            href={`/${locale}/opportunities`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0E5B34] dark:text-[#C09A4A] hover:opacity-80 transition-opacity shrink-0"
          >
            <span>{isAr ? 'عرض جميع الفرص' : 'View all opportunities'}</span>
            <Arrow className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {displayCases.slice(0, 3).map((item) => {
            const pct = Math.min(
              100,
              Math.round((item.funded_amount / item.requested_funding) * 100)
            );
            const typeLabel = isAr
              ? caseTypeLabels[item.case_type]?.ar || item.case_type
              : caseTypeLabels[item.case_type]?.en || item.case_type;

            return (
              <Link
                key={item.id}
                href={`/${locale}/opportunities/${item.id}`}
                className="group rounded-3xl border border-border/70 bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#0E5B34]/40 dark:hover:border-[#C09A4A]/40 transition-all duration-300 p-6 flex flex-col"
              >
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E5B34] dark:text-[#C09A4A]">
                    <Scale className="w-3.5 h-3.5" />
                    {typeLabel}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    +{item.expected_return_min}% {isAr ? 'عائد متوقع' : 'exp. return'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-foreground leading-snug mb-6 group-hover:text-[#0E5B34] dark:group-hover:text-[#C09A4A] transition-colors">
                  {isAr ? item.title_ar : item.title_en}
                </h3>

                <div className="mt-auto space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">{isAr ? 'اكتمال التمويل' : 'Funded'}</span>
                    <span className="text-foreground">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0E5B34] dark:bg-[#C09A4A] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <span>
                      {isAr ? 'المطلوب' : 'Target'}:{' '}
                      <span className="font-bold text-foreground">
                        {fmt(item.requested_funding)} {isAr ? 'ر.س' : 'SAR'}
                      </span>
                    </span>
                    <span>
                      {isAr ? 'سعر التوكن' : 'Token'}:{' '}
                      <span className="font-bold text-foreground">
                        {fmt(item.token_price)} {isAr ? 'ر.س' : 'SAR'}
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
