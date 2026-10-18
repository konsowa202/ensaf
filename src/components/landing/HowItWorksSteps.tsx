'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Scale,
  Landmark,
  Coins,
  CheckCircle2,
  Sparkles,
  Bot
} from 'lucide-react';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface HowItWorksStepsProps {
  locale: string;
}

export function HowItWorksSteps({ locale }: HowItWorksStepsProps) {
  const isAr = locale !== 'en';
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: isAr ? 'تقديم الدعوى والتقييم الرقمي' : 'Digital Filing & AI Screening',
      badge: isAr ? 'خلال 48 ساعة' : 'Within 48h',
      icon: FileText,
      desc: isAr
        ? 'يرفع صاحب القضية أو محاميه تفاصيل النزاع والمستندات عبر بوابة إنصاف الآمنة. يقوم نظام الفحص الرقمي بالتحقق من اكتمال الأوراق ومطابقة الاختصاص القضائي.'
        : 'The claimant or legal counsel securely uploads case files. Our AI engine conducts initial screening for jurisdictional fit, merits, and completeness.',
      highlights: [
        isAr ? 'ربط رقمي مشفر متوافق مع نظام حماية البيانات (PDPL)' : 'Encrypted upload compliant with PDPL standards',
        isAr ? 'تحليل فوري للمستندات وصكوك الدعوى' : 'Automated contract & filing validation',
        isAr ? 'بدون أي رسوم فحص أو تقديم مسبقة' : 'Zero application or intake fees',
      ],
      aiQuestion: isAr
        ? 'ما هي المستندات المطلوبة لتقديم قضية تجارية أو عقارية للتمويل؟'
        : 'What documents are required to submit a commercial litigation funding claim?',
    },
    {
      num: '02',
      title: isAr ? 'التدقيق والاعتماد القضائي' : 'Judicial Due Diligence',
      badge: isAr ? 'فحص مشدد' : 'Strict Vetting',
      icon: Scale,
      desc: isAr
        ? 'تتولى هيئة قضائية مستقلة تضم نخبة من القضاة السابقين والمستشارين دراسة القضية، وتقدير احتمالية كسبها، وتحديد ميزانية التمويل اللازمة بدقة.'
        : 'An independent judicial committee of retired judges and senior legal counselors evaluates the merits, assesses victory probability, and sets the approved budget.',
      highlights: [
        isAr ? 'هيئة محايدة ومستقلة تضمن جودة وحصانة الفرص' : 'Neutral committee ensures institutional-grade diligence',
        isAr ? 'تقييم مخاطر متقدم ونسبة قبول مدروسة' : 'Sophisticated risk scoring model',
        isAr ? 'تحديد ميزانية الأتعاب والخبراء ومراحل الصرف' : 'Fixed funding schedule tied to procedural milestones',
      ],
      aiQuestion: isAr
        ? 'كيف تعمل الهيئة القضائية في منصة إنصاف وما هي معايير قبول القضايا؟'
        : 'How does the INSAF judicial committee operate and what are the vetting standards?',
    },
    {
      num: '03',
      title: isAr ? 'الطرح الاستثماري وحسابات الضمان' : 'Syndication & Escrow Protection',
      badge: isAr ? 'حماية مصرفية' : 'SAMA Escrow',
      icon: Landmark,
      desc: isAr
        ? 'تُطرح الفرصة للمستثمرين المؤهلين عبر المنصة. تُودع أموال التمويل في حساب ضمان بنكي مستقل لكل قضية، وتُصرف حصراً حسب إنجاز المراحل القضائية.'
        : 'The opportunity is syndicated to accredited investors. Capital is held in a dedicated escrow account and released strictly against verified legal milestones.',
      highlights: [
        isAr ? 'حساب ضمان بنكي منفصل لكل قضية لدى بنك سعودي مرخص' : 'Segregated escrow account in licensed Saudi banks',
        isAr ? 'صرف دفعات المحامين بناءً على مخرجات ومذكرات موثقة' : 'Milestone disbursements tied to verified submissions',
        isAr ? 'شفافية كاملة ومتابعة مباشرة لتطورات الجلسات' : 'Live dashboard tracking procedural hearings and appeals',
      ],
      aiQuestion: isAr
        ? 'كيف تضمن إنصاف حماية أموال المستثمرين في حسابات الضمان البنكية؟'
        : 'How does the escrow mechanism protect litigation funding capital in Saudi Arabia?',
    },
    {
      num: '04',
      title: isAr ? 'كسب الحكم وتوزيع العوائد آلياً' : 'Enforcement & Return Payout',
      badge: isAr ? 'تنفيذ ناجز' : 'Enforcement & Payout',
      icon: Coins,
      desc: isAr
        ? 'عند صدور الحكم النهائي المكتسب للقطعية وتحصيل المبالغ عبر محكمة التنفيذ، يتم توزيع المبالغ والأرباح آلياً وبأمان تام على صاحب القضية والمستثمرين.'
        : 'Upon receiving a final executable judgment and recovering damages via the enforcement court, proceeds and profits are automatically distributed into wallets.',
      highlights: [
        isAr ? 'توزيع آلي سريع للعوائد عبر المحافظ الرقمية' : 'Instant automated yield disbursement to investor wallets',
        isAr ? 'صاحب القضية يستلم نصيبه الصافي فوراً دون تعقيدات' : 'Claimant receives net awarded settlement immediately',
        isAr ? 'في حال عدم كسب الدعوى: إعفاء كامل ولا يطالب المدعي بسداد' : 'Non-recourse: claimant owes nothing if case fails',
      ],
      aiQuestion: isAr
        ? 'كيف يتم توزيع الأرباح والمبالغ بعد صدور حكم محكمة التنفيذ؟'
        : 'How are proceeds distributed once the enforcement court recovers funds?',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#F8FAFC] dark:bg-[#0D120F] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 px-4 py-1.5 text-xs font-bold text-[#0E5B34] dark:text-[#E3CD94] mb-4">
            <Sparkles className="w-4 h-4 text-[#C09A4A]" />
            <span>{isAr ? 'منهجية العمل المحكمة' : 'Structured Process'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            {isAr ? (
              <>
                كيف تعمل منصة إنصاف؟{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">4 خطوات نحو العدالة والعائد</span>
              </>
            ) : (
              <>
                How INSAF Works:{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">4 Steps from Filing to Payout</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {isAr
              ? 'رحلة متكاملة تبدأ من تقديم أوراق القضية وتنتهي بتنفيذ الحكم وتوزيع الأرباح بأعلى معايير الحوكمة'
              : 'An institutional, automated lifecycle connecting merit screening, judicial vetting, secure funding, and recovery'}
          </p>
        </div>

        {/* 4 Interactive Stage Cards - Elevated Light & Dark Mode */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = activeStep === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                onMouseEnter={() => setActiveStep(idx)}
                className={`group relative bg-white dark:bg-[#161D19] border-2 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between ${
                  isHovered
                    ? 'border-[#0E5B34] dark:border-[#1E8A54] shadow-[0_15px_30px_rgba(14,91,52,0.08)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.5)] -translate-y-1'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-300 dark:text-slate-600 group-hover:text-[#B88E38] dark:group-hover:text-[#C9A557] transition-colors">
                      {step.num}
                    </span>
                    <span className="rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 px-3 py-1 text-[11px] font-black text-[#0E5B34] dark:text-[#E3CD94]">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 flex items-center justify-center text-[#0E5B34] dark:text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5 font-normal">
                    {step.desc}
                  </p>

                  <div className="space-y-2 mb-6 pt-3 border-t border-slate-100 dark:border-white/10">
                    {step.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0E5B34] dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openInsafAi('general', step.aiQuestion)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#121815] hover:bg-[#0E5B34]/10 dark:hover:bg-[#1E8A54]/15 border border-slate-200 dark:border-white/10 hover:border-[#0E5B34]/30 dark:hover:border-[#1E8A54]/40 text-[11px] font-black text-slate-700 dark:text-slate-300 hover:text-[#0E5B34] dark:hover:text-[#E3CD94] transition-all flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-[#C09A4A]" />
                  <span>{isAr ? 'اسأل إنصاف عن هذه المرحلة' : 'Ask AI about this stage'}</span>
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
