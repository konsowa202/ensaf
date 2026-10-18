'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Briefcase,
  FileText,
  Building2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Bot,
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openInsafAi, AssistantRole } from '@/components/landing/InsafAiAssistant';

interface RoleSolutionsSectionProps {
  locale: string;
}

export function RoleSolutionsSection({ locale }: RoleSolutionsSectionProps) {
  const isAr = locale !== 'en';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<AssistantRole>('applicant');

  const roles = [
    {
      id: 'applicant' as AssistantRole,
      title: isAr ? 'أصحاب القضايا والمطالبات' : 'Claimants & Case Owners',
      badge: isAr ? 'تمويل بدون مخاطرة' : 'Non-Recourse Funding',
      icon: Scale,
      headline: isAr
        ? 'تغطية كامل أتعاب المحاماة والخبراء دون سداد ريال واحد مقدماً'
        : 'Secure 100% upfront litigation costs with zero out-of-pocket risk',
      description: isAr
        ? 'إذا كان لديك حق قانوني أو مطالبة تجارية قوية وتخشى استنزاف السيولة أو طول أمد التقاضي، تتولى إنصاف تغطية أتعاب أفضل المحامين والمصاريف الفنية. وإذا لم تُكسب الدعوى، لا تسدد أي شيء.'
        : 'Pursue high-value claims without draining your liquidity. We fund top-tier legal representation and expert fees. If the case does not succeed, you owe zero.',
      points: [
        isAr ? 'تغطية 100% لأتعاب المحاماة ورسوم الخبراء' : '100% funding of legal counsel & expert fees',
        isAr ? 'مبدأ عدم الرجوع: إعفاء كامل في حال عدم كسب الدعوى' : 'Zero obligation if the lawsuit is unsuccessful',
        isAr ? 'الاحتفاظ بالقرار النهائي وحرية اختيار المحامي المعتمد' : 'You retain full ownership of settlement choices',
        isAr ? 'سرعة البت عبر فحص رقمي متكامل' : 'Fast-track committee vetting via digital filing',
      ],
      ctaText: isAr ? 'قدّم قضيتك الآن مجاناً' : 'Submit Case for Review',
      ctaLink: `/${locale}/register?type=applicant`,
      sampleQuestion: isAr
        ? 'كيف تضمن إنصاف عدم مطالبتي بأي مبالغ في حال خسرنا القضية؟'
        : 'How does non-recourse litigation funding protect me from legal expenses?',
    },
    {
      id: 'investor' as AssistantRole,
      title: isAr ? 'المستثمرون ورؤوس الأموال' : 'Litigation Investors',
      badge: isAr ? 'أصل بديل بعائد 18-35%' : 'Non-Correlated 18-35% ROI',
      icon: Briefcase,
      headline: isAr
        ? 'الاستثمار في فئة أصول بديلة ذات عوائد مجزية وغير مرتبطة بأسواق الأسهم'
        : 'Allocate into high-yield alternative assets immune to equity volatility',
      description: isAr
        ? 'تمويل الدعاوى القضائية يتيح للمستثمرين تمويل قضايا تجارية وعقارية ذات احتمالية نجاح عالية خضعت لتدقيق من هيئة قضائية متخصصة، مع حفظ المبالغ في حسابات ضمان بنكية موثوقة.'
        : 'Litigation finance provides uncorrelated returns backed by solid judicial merits. Every case is vetted by our judicial experts, with funds held in secured escrow.',
      points: [
        isAr ? 'عائد متوقع يتراوح بين 18% و 35% حسب دراسة القضية' : 'Expected annual returns ranging 18% to 35%',
        isAr ? 'أصل حقيقي غير متأثر بتقلبات أسواق الأسهم والتضخم' : 'Zero correlation with equity market fluctuations',
        isAr ? 'تدقيق قضائي صارم ونسبة قبول مدروسة للفرص' : 'Institutional due diligence with strict vetting',
        isAr ? 'متوافق تماماً مع صيغ المشاركة والأحكام الشرعية' : 'Fully compliant with Sharia profit-sharing frameworks',
      ],
      ctaText: isAr ? 'افتح حساب مستثمر معتمد' : 'Open Investor Account',
      ctaLink: `/${locale}/register?type=investor`,
      sampleQuestion: isAr
        ? 'ما هي الإجراءات والضمانات التي تتخذها الهيئة لحماية أموال المستثمرين؟'
        : 'What security structures and escrow mechanisms protect investor capital?',
    },
    {
      id: 'lawyer' as AssistantRole,
      title: isAr ? 'مكاتب المحاماة والنخبة القانونية' : 'Law Firms & Counsel',
      badge: isAr ? 'ضمان سداد الأتعاب' : 'Fee Guarantees',
      icon: FileText,
      headline: isAr
        ? 'استلام الأتعاب المهنية كاملة وفي مواعيدها مع استقلالية تامة في الترافع'
        : 'Eliminate client payment risks and take on high-stakes commercial disputes',
      description: isAr
        ? 'تمكّن إنصاف مكاتب المحاماة من تولي القضايا الكبرى دون القلق من قدرة الموكل المالية أو تعثر السيولة. نحرص على عدم التدخل في استراتيجية الترافع مع الالتزام التام بنظام المحاماة السعودي.'
        : 'Focus on legal advocacy while INSAF handles case capital. Ensure on-time fee disbursements without interfering in trial strategy or client privilege.',
      points: [
        isAr ? 'سداد منتظم لأتعاب المحاماة دون الاعتماد على سيولة الموكل' : 'Guaranteed fee disbursement milestones',
        isAr ? 'استقلالية كاملة للمحامي في الترافع وإعداد المذكرات' : 'Complete autonomy over legal strategy & litigation',
        isAr ? 'تلقي قضايا مفحوصة ومؤهلة عبر شبكة إنصاف' : 'Dealflow of vetted, committee-screened cases',
        isAr ? 'تغطية مصاريف الخبراء والمحاسبة الجنائية القضائية' : 'Coverage of expensive forensic & expert witness fees',
      ],
      ctaText: isAr ? 'انضم لشبكة المحامين المعتمدة' : 'Join Lawyer Network',
      ctaLink: `/${locale}/register?type=lawyer`,
      sampleQuestion: isAr
        ? 'كيف تضمن إنصاف عدم التدخل في استراتيجية المحامي أمام المحاكم التجارية؟'
        : 'How does INSAF respect professional independence under the Saudi Law Code?',
    },
    {
      id: 'corporate' as AssistantRole,
      title: isAr ? 'الشركات والقطاع التجاري' : 'Enterprises & SMEs',
      badge: isAr ? 'حماية السيولة النقدية' : 'Working Capital Defense',
      icon: Building2,
      headline: isAr
        ? 'تحويل المطالبات المعلقة إلى أصول مستردة دون المساس برأس المال العامل'
        : 'Monetize pending enterprise claims without burdening your balance sheet',
      description: isAr
        ? 'النزاعات التجارية والمقاولات ومطالبات العقود قد تجمد ملايين الريالات وتستنزف التدفقات النقدية. تمويل إنصاف يرفع عبء التقاضي عن ميزانية الشركة ويحول النزاع إلى استرداد ناجح.'
        : 'Litigation shouldn’t tie up operating capital. Offload dispute legal costs to INSAF so your business stays focused on core growth and operations.',
      points: [
        isAr ? 'حماية التدفقات النقدية من استنزاف أتعاب التقاضي الطويلة' : 'Protect cash flow from prolonged litigation drain',
        isAr ? 'تمويل قضايا المقاولات، منازعات الشركاء، وتحصيل الديون' : 'Funding for construction, contract, and debt disputes',
        isAr ? 'إخراج تكاليف التقاضي من قائمة الدخل (Off-Balance-Sheet)' : 'Off-balance-sheet accounting treatment',
        isAr ? 'تسريع تحصيل المبالغ المحكوم بها عبر دوائر التنفيذ' : 'Accelerated enforcement via expert commercial recovery',
      ],
      ctaText: isAr ? 'استشر إنصاف لحلول الشركات' : 'Explore Corporate Solutions',
      ctaLink: `/${locale}/contact`,
      sampleQuestion: isAr
        ? 'كيف يمكن للشركات الاستفادة من تمويل التقاضي لإدارة قضايا المقاولات الكبرى؟'
        : 'How can enterprises finance major construction & contract claims via INSAF?',
    },
  ];

  const currentRole = roles.find((r) => r.id === activeTab) || roles[0];

  return (
    <section id="solutions-by-role" className="py-20 md:py-28 bg-[#F8FAFC] dark:bg-[#0D120F] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 px-4 py-1.5 text-xs font-bold text-[#0E5B34] dark:text-[#E3CD94] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C09A4A]" />
            <span>{isAr ? 'بوابات إنصاف المتخصصة' : 'Tailored Solutions by Role'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            {isAr ? (
              <>
                حلول مصممة بدقة{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">لكل طرف في المنظومة</span>
              </>
            ) : (
              <>
                Engineered for Every Stakeholder in the{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">Legal Ecosystem</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {isAr
              ? 'اختر مجالك لتكتشف كيف تُمكّنك منصة إنصاف من تحقيق أهدافك القانونية والمالية مع مساعدة ذكية مخصصة'
              : 'Select your role to explore how INSAF empowers you with capital, protection, and dedicated AI assistance'}
          </p>
        </div>

        {/* Role Tab Navigation Pills */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-3xl bg-white dark:bg-[#161D19] border-2 border-slate-200 dark:border-white/10 shadow-sm max-w-full overflow-x-auto scrollbar-none gap-1 sm:gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = activeTab === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveTab(r.id)}
                  className={`relative flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#0E5B34] to-[#0A4427] text-white shadow-md shadow-[#0E5B34]/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#E3CD94]' : ''}`} />
                  <span>{r.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Role Content Card - Crisp Light & Dark Aesthetics */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRole.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-[#161D19] border-2 border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-colors"
          >
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Side: Descriptions & Checklist (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#C09A4A]/15 border border-[#C09A4A]/40 px-3.5 py-1 text-xs font-black text-[#B88E38] dark:text-[#E3CD94]">
                  <Award className="w-3.5 h-3.5" />
                  <span>{currentRole.badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
                  {currentRole.headline}
                </h3>

                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {currentRole.description}
                </p>

                {/* Benefits Bullet Grid */}
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  {currentRole.points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 text-[#0E5B34] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{point}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link href={currentRole.ctaLink}>
                    <Button
                      size="lg"
                      className="rounded-full px-8 h-13 font-black bg-gradient-to-r from-[#0E5B34] to-[#0A4427] text-white hover:opacity-95 shadow-md shadow-[#0E5B34]/20 gap-2"
                    >
                      {currentRole.ctaText}
                      <Arrow className="w-4 h-4" />
                    </Button>
                  </Link>

                  {/* AI Assistant Button for this Role */}
                  <button
                    onClick={() => openInsafAi(currentRole.id, currentRole.sampleQuestion)}
                    className="flex items-center gap-2.5 h-13 px-6 rounded-full bg-white dark:bg-[#121815] hover:bg-slate-50 dark:hover:bg-[#121815]/80 border-2 border-[#0E5B34]/30 dark:border-[#1E8A54]/40 text-[#0E5B34] dark:text-[#E3CD94] font-black text-sm transition-all shadow-xs"
                  >
                    <Bot className="w-4 h-4 text-[#C09A4A]" />
                    <span>
                      {isAr ? 'اسأل إنصاف المساعد الذكي عن هذا الدور' : 'Ask INSAF AI about this Role'}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#C09A4A]" />
                  </button>
                </div>
              </div>

              {/* Right Side: Interactive AI Assistant Preview Card (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-[#F8FAFC] dark:bg-[#121815] border-2 border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 relative shadow-sm">
                  {/* Card top banner */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0E5B34] dark:bg-[#1E8A54] text-[#E3CD94] flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {isAr ? 'إنصاف — المساعد الذكي' : 'INSAF Smart Assistant'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {isAr ? `مستشارك المخصص: ${currentRole.title}` : `Advisor for: ${currentRole.title}`}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      {isAr ? 'متصل الآن' : 'Live'}
                    </span>
                  </div>

                  {/* Suggested Question Prompt */}
                  <div className="mb-4 p-4 rounded-2xl bg-white dark:bg-[#161D19] border border-slate-200 dark:border-white/10 text-xs">
                    <div className="text-[11px] uppercase font-bold text-[#B88E38] dark:text-[#E3CD94] mb-1">
                      {isAr ? 'سؤال شائع لهذا الدور:' : 'Top Question for this Role:'}
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">"{currentRole.sampleQuestion}"</p>
                  </div>

                  {/* Quick interactive launcher */}
                  <button
                    onClick={() => openInsafAi(currentRole.id, currentRole.sampleQuestion)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0E5B34] to-[#0A4427] text-white hover:opacity-95 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-[#E3CD94]" />
                    <span>
                      {isAr
                        ? `احصل على إجابة فورية من إنصاف الآن`
                        : `Get instant answer from INSAF AI`}
                    </span>
                    <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
