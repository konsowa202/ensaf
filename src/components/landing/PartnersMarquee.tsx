'use client';

import React from 'react';
import { Sparkles, Handshake, ShieldCheck } from 'lucide-react';

interface PartnersMarqueeProps {
  locale: string;
  partnersData?: any[] | null;
}

export function PartnersMarquee({ locale, partnersData }: PartnersMarqueeProps) {
  const isAr = locale !== 'en';

  const defaultPartners = [
    { name: isAr ? 'نخبة المحامين المعتمدين' : 'Accredited Counsel Network', type: isAr ? 'مكاتب محاماة' : 'Law Firms' },
    { name: isAr ? 'خبراء التحكيم التجاري' : 'Commercial Arbitration Experts', type: isAr ? 'فض نزاعات' : 'ADR' },
    { name: isAr ? 'شركاء المحاسبة القضائية' : 'Forensic Accounting Partners', type: isAr ? 'تدقيق مالي' : 'Forensics' },
    { name: isAr ? 'بيوت الخبرة العقارية والهندسية' : 'Engineering & Real Estate Experts', type: isAr ? 'تقييم أصول' : 'Valuation' },
    { name: isAr ? 'مستشارو الامتثال المصرفي' : 'Banking & Escrow Advisors', type: isAr ? 'حوكمة بنكية' : 'Banking' },
    { name: isAr ? 'خبراء حوكمة الشركات' : 'Corporate Governance Counsel', type: isAr ? 'قطاع الأعمال' : 'Enterprises' },
  ];

  const partners =
    partnersData && partnersData.length > 0
      ? partnersData.map((p) => ({
          name: isAr ? p.name_ar || p.name : p.name_en || p.name,
          type: isAr ? 'شريك استراتيجي' : 'Strategic Partner',
        }))
      : defaultPartners;

  return (
    <section id="partners" className="py-20 bg-surface/50 border-b border-border/70 overflow-hidden">
      <div className="container mx-auto px-6 mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5B34]/10 border border-[#C09A4A]/40 px-4 py-1.5 text-xs font-bold text-[#0E5B34] dark:text-[#E3CD94] mb-3">
          <Handshake className="w-3.5 h-3.5 text-[#C09A4A]" />
          <span>{isAr ? 'منظومة الشركاء والنخبة القانونية' : 'Partner Ecosystem'}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          {isAr ? 'شبكة متكاملة من بيوت الخبرة ومكاتب المحاماة في المملكة' : 'Accredited Law Firms & Forensic Experts Across Saudi Arabia'}
        </h3>
      </div>

      {/* Infinite marquee ticker */}
      <div className="marquee-hover marquee-fade relative w-full overflow-hidden" dir="ltr">
        <div className="animate-marquee flex w-max items-center gap-6 py-2">
          {[...partners, ...partners, ...partners].map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 bg-card border-2 border-border/80 hover:border-[#C09A4A] rounded-2xl px-6 py-4 shadow-xs transition-all duration-300 shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0E5B34]/10 border border-[#0E5B34]/20 flex items-center justify-center text-[#0E5B34] dark:text-[#E3CD94] font-black text-base">
                {p.name.trim().charAt(0)}
              </div>
              <div className="text-right">
                <div className="font-extrabold text-sm text-foreground">{p.name}</div>
                <div className="text-[11px] font-medium text-muted-foreground">{p.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
