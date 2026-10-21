import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Scale, Landmark, ArrowLeft, ArrowRight } from 'lucide-react';
import { HeroWordmark } from '@/components/landing/HeroWordmark';

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const isAr = locale !== 'en';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const trustItems = [
    {
      icon: ShieldCheck,
      ar: 'تدقيق من لجنة قضائية مختصة',
      en: 'Vetted by a judicial committee',
    },
    {
      icon: Landmark,
      ar: 'أموال محفوظة في حسابات ضمان بنكية',
      en: 'Capital held in bank escrow',
    },
    {
      icon: Scale,
      ar: 'متوافق مع الشريعة والأنظمة السعودية',
      en: 'Sharia & Saudi-law compliant',
    },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Animated «إنصاف» wordmark drawing itself in the background */}
      <HeroWordmark />

      {/* Very subtle ambient texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 32rem at 85% -10%, rgba(14,91,52,0.07), transparent 60%), radial-gradient(48rem 28rem at 10% 110%, rgba(192,154,74,0.08), transparent 60%)',
        }}
      />

      <div className="relative z-10 container mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-24 max-w-5xl text-center">
        {/* Eyebrow */}
        <p className="animate-hero text-sm font-bold tracking-wide text-[#C09A4A] mb-6" style={{ animationDelay: '0ms' }}>
          {isAr ? 'منصة إنصاف لتمويل التقاضي' : 'INSAF · Litigation Funding Platform'}
        </p>

        {/* Headline */}
        <h1
          className="animate-hero text-4xl md:text-6xl font-black leading-[1.2] tracking-tight text-foreground mb-6"
          style={{ animationDelay: '120ms' }}
        >
          {isAr ? (
            <>
              حقّك لا ينتظر السيولة.
              <br />
              <span className="text-[#0E5B34] dark:text-[#3FA974]">نموّل قضيتك حتى الحكم.</span>
            </>
          ) : (
            <>
              Justice should not wait for liquidity.
              <br />
              <span className="text-[#0E5B34] dark:text-[#3FA974]">We fund your case to verdict.</span>
            </>
          )}
        </h1>

        {/* Sub */}
        <p
          className="animate-hero text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10"
          style={{ animationDelay: '240ms' }}
        >
          {isAr
            ? 'تربط إنصاف أصحاب المطالبات المحقة بمستثمرين مؤهلين، عبر قضايا مدققة من لجنة مختصة واستثمار مُجزأ بالتوكنات — بتمويل غير قابل للرجوع على صاحب القضية.'
            : 'INSAF connects rightful claimants with qualified investors through committee-vetted, tokenized cases — fully non-recourse for the claimant.'}
        </p>

        {/* CTAs — full-width stacked on mobile */}
        <div
          className="animate-hero flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-14 max-w-md sm:max-w-none mx-auto"
          style={{ animationDelay: '360ms' }}
        >
          <Link
            href={`/${locale}/opportunities`}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-[#0E5B34] hover:bg-[#0A4427] text-white font-bold text-sm transition-all duration-200 shadow-md shadow-[#0E5B34]/20 hover:shadow-lg hover:shadow-[#0E5B34]/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{isAr ? 'ابدأ كمستثمر' : 'Start as an Investor'}</span>
            <Arrow className="w-4 h-4" />
          </Link>
          <Link
            href={`/${locale}/register`}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full border border-border hover:border-[#0E5B34]/50 hover:bg-[#0E5B34]/5 text-foreground font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{isAr ? 'قدّم قضيتك' : 'Submit Your Case'}</span>
          </Link>
        </div>

        {/* Trust indicators — hairline, no frames */}
        <ul
          className="animate-hero flex flex-col sm:flex-row items-center justify-center gap-y-4 sm:gap-y-0 sm:divide-x sm:divide-border/70 rtl:sm:divide-x-reverse"
          style={{ animationDelay: '480ms' }}
        >
          {trustItems.map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 sm:px-8 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4 text-[#0E5B34] dark:text-[#C09A4A] shrink-0" />
              <span>{isAr ? item.ar : item.en}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
