'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Scale,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Landmark,
  Lock,
  CheckCircle2,
  Coins,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const isAr = locale !== 'en';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-[#FBFBFC] to-white dark:from-[#0D120F] dark:via-[#111914] dark:to-[#0D120F] transition-colors duration-300">
      {/* Ambient background soft light glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-[#0E5B34]/10 via-[#C09A4A]/10 to-transparent dark:from-[#1E8A54]/15 dark:via-[#C09A4A]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Headlines & Call to Actions (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 max-w-2xl"
          >
            {/* National Identity Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 px-4 py-2 text-xs md:text-sm font-bold text-[#0E5B34] dark:text-[#E3CD94] mb-8 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
              <Scale className="w-4 h-4 text-[#C09A4A]" />
              <span>
                {isAr
                  ? 'المنصة السعودية لتمويل التقاضي والاستثمار العدلي'
                  : 'Saudi Premier Litigation Funding & Legal Finance'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.18] tracking-tight mb-6 text-slate-900 dark:text-white">
              {isAr ? (
                <>
                  القضية أصبحت{' '}
                  <span className="text-[#0E5B34] dark:text-[#22c55e]">قضيتك</span>
                  <br />
                  والحقوق أصبحت{' '}
                  <span className="text-[#B88E38] dark:text-[#E3CD94] relative inline-block">
                    فرصاً واعدة
                    <span className="absolute -bottom-1.5 left-0 w-full h-1 bg-[#C09A4A]/30 rounded-full" />
                  </span>
                </>
              ) : (
                <>
                  The Case Becomes{' '}
                  <span className="text-[#0E5B34] dark:text-[#22c55e]">Your Case</span>
                  <br />
                  Smart Legal Capital in KSA
                </>
              )}
            </h1>

            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-10 max-w-xl font-normal">
              {isAr
                ? 'نموّل كامل أتعاب المحاماة ومصاريف الدعاوى التجارية والعقارية بدون أي مخاطرة مالية مسبقة، ونفتح للمستثمرين فئة أصول بديلة بعوائد مجزية متوافقة مع الشريعة والأنظمة السعودية.'
                : 'Financing commercial litigation with zero upfront risk for claimants, offering investors vetted alternative returns under Saudi regulations.'}
            </p>

            {/* CTAs Cluster */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link href={`/${locale}/register?type=applicant`}>
                <Button
                  size="lg"
                  className="rounded-full px-8 h-14 text-base font-black bg-gradient-to-r from-[#0E5B34] to-[#0A4427] hover:from-[#116e3f] hover:to-[#0d5330] text-white shadow-xl shadow-[#0E5B34]/25 gap-2 border border-[#C09A4A]/30"
                >
                  {isAr ? 'قدّم قضيتك للتمويل' : 'Submit Your Case'}
                  <Arrow className="w-4 h-4" />
                </Button>
              </Link>

              <Link href={`/${locale}/opportunities`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-7 h-14 text-base font-bold border-2 border-slate-300 dark:border-white/20 hover:border-[#0E5B34] dark:hover:border-[#1E8A54] hover:bg-[#0E5B34]/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 transition-all gap-2"
                >
                  <Coins className="w-4 h-4 text-[#C09A4A]" />
                  {isAr ? 'استكشف الفرص' : 'Explore Cases'}
                </Button>
              </Link>

              {/* Direct AI Assistant Trigger */}
              <button
                onClick={() => openInsafAi('general')}
                className="flex items-center gap-2.5 h-14 px-5 rounded-full bg-white dark:bg-[#161D19] hover:bg-[#0E5B34]/5 dark:hover:bg-[#1E8A54]/15 border-2 border-[#0E5B34]/25 dark:border-[#1E8A54]/40 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all hover:border-[#0E5B34] dark:hover:border-[#1E8A54] shadow-xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#0E5B34] dark:bg-[#1E8A54] flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <span>{isAr ? 'المساعد الافتراضي' : 'Virtual Assistant'}</span>
                <Sparkles className="w-3.5 h-3.5 text-[#C09A4A]" />
              </button>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-3 gap-4 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0E5B34] dark:text-emerald-400 shrink-0" />
                <span>{isAr ? 'متوافق مع الشريعة' : 'Sharia-Compliant'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#0E5B34] dark:text-emerald-400 shrink-0" />
                <span>{isAr ? 'حسابات ضمان مستقلة' : 'SAMA Escrow Protection'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0E5B34] dark:text-emerald-400 shrink-0" />
                <span>{isAr ? 'حماية بيانات (PDPL)' : 'PDPL Data Privacy'}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: High-End Live Case Showcase Card (5 cols) - FIXED & REFINED */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5 relative flex justify-center"
          >
            {/* The Main Showcase Card: Fixed overflow clipping and crisp light & dark mode aesthetics */}
            <div className="w-full max-w-lg bg-white dark:bg-[#161D19] border-2 border-[#0E5B34]/15 dark:border-[#1E8A54]/30 rounded-[2rem] p-6 sm:p-7 shadow-[0_20px_50px_rgba(14,91,52,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative transition-colors">
              
              {/* Header Ribbon */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isAr ? 'قضية نشطة تحت الطرح' : 'Live Litigation Pool'}
                  </span>
                </div>
                <span className="rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/25 dark:border-[#1E8A54]/40 px-3 py-1 text-xs font-black text-[#0E5B34] dark:text-[#E3CD94]">
                  {isAr ? 'تصنيف ائتماني: AAA' : 'Vetted Rating: AAA'}
                </span>
              </div>

              {/* Court & Case Title */}
              <div className="mb-5">
                <div className="text-xs font-bold text-[#B88E38] dark:text-[#E3CD94] mb-1 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-[#0E5B34] dark:text-emerald-400" />
                  <span>{isAr ? 'محكمة الاستئناف التجارية — الرياض' : 'Riyadh Commercial Court of Appeal'}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                  {isAr
                    ? 'مطالبة تنفيذ عقد مقاولات وإنشاءات بنية تحتية'
                    : 'Infrastructure & Commercial Contract Claim'}
                </h3>
              </div>

              {/* Progress Flow Pipeline - Direction-Aware RTL Flow */}
              <div className="mb-5 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#121815] border border-slate-200 dark:border-white/10">
                <div className="text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-3 flex items-center justify-between">
                  <span>{isAr ? 'مسار الدعوى القضائية الذكي' : 'Intelligent Case Journey'}</span>
                  <span className="text-[#0E5B34] dark:text-[#E3CD94] font-black text-xs bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 px-2 py-0.5 rounded-full">
                    {isAr ? 'مكتمل 85%' : '85% Progress'}
                  </span>
                </div>

                {/* Direction-Aware RTL Progress Line */}
                <div className="relative mb-3">
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-[#0E5B34] to-[#C09A4A] dark:from-[#1E8A54] dark:to-[#E3CD94] rounded-full transition-all duration-1000 ${
                        isAr ? 'float-right' : 'float-left'
                      }`}
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>

                {/* 4 Steps Checklist in Natural RTL Order */}
                <div className="grid grid-cols-4 gap-1 text-[11px] text-center font-bold">
                  <div className="text-[#0E5B34] dark:text-emerald-400 flex flex-col items-center">
                    <CheckCircle2 className="w-4 h-4 text-[#0E5B34] dark:text-emerald-400 mb-1" />
                    <span>{isAr ? 'توثيق ناجز' : 'Najiz Filing'}</span>
                  </div>
                  <div className="text-[#0E5B34] dark:text-emerald-400 flex flex-col items-center">
                    <CheckCircle2 className="w-4 h-4 text-[#0E5B34] dark:text-emerald-400 mb-1" />
                    <span>{isAr ? 'فحص الهيئة' : 'Due Diligence'}</span>
                  </div>
                  <div className="text-[#0E5B34] dark:text-emerald-400 flex flex-col items-center">
                    <CheckCircle2 className="w-4 h-4 text-[#B88E38] dark:text-[#E3CD94] mb-1" />
                    <span>{isAr ? 'اكتمال التمويل' : 'Funded'}</span>
                  </div>
                  <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center">
                    <Scale className="w-4 h-4 text-slate-400 dark:text-slate-500 mb-1" />
                    <span>{isAr ? 'صك الحكم' : 'Judgment'}</span>
                  </div>
                </div>
              </div>

              {/* Funding Amount & Expected Return Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#F8FAFC] dark:bg-[#121815] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                    {isAr ? 'المبلغ المطلوب' : 'Target Amount'}
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    1,250,000 <span className="text-xs font-bold text-[#B88E38] dark:text-[#E3CD94]">{isAr ? 'ر.س' : 'SAR'}</span>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] dark:bg-[#121815] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                    {isAr ? 'العائد الصافي المتوقع' : 'Target Return'}
                  </div>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +24.8%
                  </div>
                </div>
              </div>

              {/* AI Study Trigger inside the card */}
              <button
                onClick={() =>
                  openInsafAi(
                    'investor',
                    isAr
                      ? 'كيف يتم فحص القضايا التجارية قبل فتح التمويل وما هي ضمانات الأرباح؟'
                      : 'How are commercial cases vetted prior to funding?'
                  )
                }
                className="w-full p-3 rounded-2xl bg-[#0E5B34]/10 dark:bg-[#1E8A54]/15 hover:bg-[#0E5B34]/15 dark:hover:bg-[#1E8A54]/25 border border-[#0E5B34]/30 dark:border-[#1E8A54]/40 flex items-center justify-between text-xs font-extrabold text-[#0E5B34] dark:text-[#E3CD94] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#C09A4A]" />
                  <span>{isAr ? 'تريد دراسة تمويل هذه القضية بالذكاء الاصطناعي؟' : 'Analyze this case with AI?'}</span>
                </div>
                <span className="flex items-center gap-1 font-black text-[#B88E38] dark:text-[#E3CD94]">
                  {isAr ? 'اسأل إنصاف' : 'Ask INSAF'}
                  <Arrow className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Clean Integrated Non-Recourse Guarantee Pill (Fixed, no clipping) */}
              <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#C09A4A]/10 via-[#E3CD94]/20 to-[#C09A4A]/10 dark:from-[#C09A4A]/15 dark:via-[#C09A4A]/10 dark:to-[#C09A4A]/15 border border-[#C09A4A]/40 dark:border-[#C09A4A]/30 flex items-center justify-center gap-2 text-xs font-black text-[#0E5B34] dark:text-[#E3CD94]">
                <ShieldCheck className="w-4 h-4 text-[#B88E38] dark:text-[#E3CD94]" />
                <span>{isAr ? 'مبدأ عدم الرجوع: تحمّل 100% من المخاطر للمدعي' : '100% Non-Recourse Protection for Claimant'}</span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
