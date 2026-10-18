'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Scale,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Bot,
  Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface PublicCaseItem {
  id: string;
  title_ar: string;
  title_en: string;
  case_type: string;
  requested_funding: number;
  funded_amount: number;
  expected_return_min: number;
  court?: string;
  rating?: string;
  days_left?: number;
}

interface FeaturedCasesSectionProps {
  locale: string;
  publicCases: any[] | null;
}

export function FeaturedCasesSection({ locale, publicCases }: FeaturedCasesSectionProps) {
  const isAr = locale !== 'en';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const caseTypeLabels: Record<string, { ar: string; en: string }> = {
    commercial: { ar: 'تجاري ونزاع عقود', en: 'Commercial & Contract' },
    labor: { ar: 'عمالية جماعية', en: 'Labor & Corporate' },
    real_estate: { ar: 'عقارات وتطوير', en: 'Real Estate' },
    execution: { ar: 'تنفيذ صكوك وديون', en: 'Enforcement' },
    civil: { ar: 'معاملات مدنية', en: 'Civil Law' },
    construction: { ar: 'مقاولات وإنشاءات', en: 'Construction' },
  };

  const fallbackCases: PublicCaseItem[] = [
    {
      id: 'case-demo-1',
      title_ar: 'مطالبة مستحقات عقد مقاولات وتوريد بنية تحتية',
      title_en: 'Infrastructure Contracting & Supply Dispute Claim',
      case_type: 'construction',
      requested_funding: 850000,
      funded_amount: 680000,
      expected_return_min: 24.5,
      court: isAr ? 'المحكمة التجارية بالرياض' : 'Riyadh Commercial Court',
      rating: 'AAA',
      days_left: 8,
    },
    {
      id: 'case-demo-2',
      title_ar: 'نزاع ملكية وتطوير مخطط عقاري تجاري بجدة',
      title_en: 'Commercial Real Estate Development Ownership Claim',
      case_type: 'real_estate',
      requested_funding: 1500000,
      funded_amount: 1125000,
      expected_return_min: 22.0,
      court: isAr ? 'محكمة الاستئناف بجدة' : 'Jeddah Court of Appeal',
      rating: 'AA+',
      days_left: 14,
    },
    {
      id: 'case-demo-3',
      title_ar: 'تنفيذ صك إفلاس واسترداد أصول مديونية تجارية',
      title_en: 'Bankruptcy Debt Recovery & Asset Liquidation Claim',
      case_type: 'execution',
      requested_funding: 600000,
      funded_amount: 540000,
      expected_return_min: 28.0,
      court: isAr ? 'دوائر التنفيذ بالدمام' : 'Dammam Enforcement Circuit',
      rating: 'AAA',
      days_left: 5,
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
          funded_amount: Number(c.funded_amount) || 750000,
          expected_return_min: Number(c.expected_return_min) || 24,
          court: isAr ? 'المحكمة التجارية بالرياض' : 'Riyadh Commercial Court',
          rating: 'AAA',
          days_left: 10,
        }))
      : fallbackCases;

  return (
    <section id="opportunities" className="py-20 md:py-28 bg-white dark:bg-[#0D120F] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 px-4 py-1.5 text-xs font-bold text-[#0E5B34] dark:text-[#E3CD94] mb-4">
              <Scale className="w-4 h-4 text-[#C09A4A]" />
              <span>{isAr ? 'فرص استثمارية نشطة' : 'Active Investment Deals'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {isAr ? (
                <>
                  قضايا اجتازت{' '}
                  <span className="text-[#0E5B34] dark:text-[#22c55e]">التدقيق القضائي المشدد</span>
                </>
              ) : (
                <>
                  Cases Vetted by the{' '}
                  <span className="text-[#0E5B34] dark:text-[#22c55e]">Judicial Committee</span>
                </>
              )}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {isAr
                ? 'قضايا ومطالبات تجارية وعقارية مفحوصة بدقة من قضاة وخبراء، متاحة الآن للتمويل بعوائد متوقعة متوافقة مع الشريعة'
                : 'Commercial and real estate claims vetted by judicial experts, open for syndicate participation'}
            </p>
          </div>

          <Link href={`/${locale}/opportunities`}>
            <Button
              variant="outline"
              className="rounded-full px-6 h-12 border-2 border-slate-300 dark:border-white/20 font-black gap-2 hover:border-[#0E5B34] dark:hover:border-[#1E8A54] text-slate-800 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <span>{isAr ? 'عرض كافة الفرص المتاحة' : 'View All Opportunities'}</span>
              <Arrow className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* 3 Featured Deal Cards - Crisp Light & Dark Mode */}
        <div className="grid md:grid-cols-3 gap-8">
          {displayCases.slice(0, 3).map((item, idx) => {
            const pct = Math.min(100, Math.round((item.funded_amount / item.requested_funding) * 100));
            const typeLabel = isAr
              ? caseTypeLabels[item.case_type]?.ar || item.case_type
              : caseTypeLabels[item.case_type]?.en || item.case_type;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white dark:bg-[#161D19] border-2 border-slate-200 dark:border-white/10 hover:border-[#0E5B34]/50 dark:hover:border-[#1E8A54]/50 rounded-3xl p-7 shadow-xs hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card top chips */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/25 dark:border-[#1E8A54]/40 px-3 py-1 text-xs font-black text-[#0E5B34] dark:text-[#E3CD94]">
                      {typeLabel}
                    </span>
                    <span className="rounded-full bg-[#C09A4A]/15 border border-[#C09A4A]/40 px-3 py-1 text-xs font-black text-[#B88E38] dark:text-[#E3CD94] flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{item.expected_return_min}% {isAr ? 'عائد' : 'IRR'}
                    </span>
                  </div>

                  {/* Court / Jurisdiction */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    <Landmark className="w-3.5 h-3.5 text-[#0E5B34] dark:text-emerald-400" />
                    <span>{item.court}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 leading-snug group-hover:text-[#0E5B34] dark:group-hover:text-[#E3CD94] transition-colors">
                    {isAr ? item.title_ar : item.title_en}
                  </h3>

                  {/* Funding progress */}
                  <div className="space-y-2 mb-6 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#121815] border border-slate-200 dark:border-white/10">
                    <div className="flex justify-between items-center text-xs font-extrabold">
                      <span className="text-slate-500 dark:text-slate-400">{isAr ? 'اكتمال التمويل:' : 'Funding Progress:'}</span>
                      <span className="text-[#0E5B34] dark:text-[#E3CD94] font-black">{pct}%</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0E5B34] to-[#C09A4A] dark:from-[#1E8A54] dark:to-[#E3CD94] h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
                      <span>{isAr ? 'المبلغ المجمّع:' : 'Funded:'}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {item.funded_amount.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}
                      </span>
                    </div>
                  </div>

                  {/* Meta stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#121815] border border-slate-200 dark:border-white/10">
                      <span className="text-slate-500 dark:text-slate-400 block font-bold">{isAr ? 'المطلوب' : 'Target'}</span>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {item.requested_funding.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#121815] border border-slate-200 dark:border-white/10">
                      <span className="text-slate-500 dark:text-slate-400 block font-bold">{isAr ? 'تقييم الجدارة' : 'Rating'}</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {item.rating || 'AAA'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Link href={`/${locale}/login?redirect_to=/${locale}/dashboard`}>
                    <Button className="w-full rounded-full h-11 font-black bg-[#0E5B34] hover:bg-[#0A4427] text-white">
                      {isAr ? 'تفاصيل القضية والاستثمار' : 'View Details & Invest'}
                    </Button>
                  </Link>

                  <button
                    onClick={() =>
                      openInsafAi(
                        'investor',
                        isAr
                          ? `ما هي تفاصيل وضمانات القضية الاستثمارية (${item.title_ar})؟`
                          : `What are the risk and return details for the opportunity (${item.title_en})?`
                      )
                    }
                    className="w-full py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#0E5B34] dark:hover:text-[#E3CD94] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#C09A4A]" />
                    <span>{isAr ? 'اسأل إنصاف المساعد الذكي عن هذه الفرصة' : 'Ask AI about this opportunity'}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
