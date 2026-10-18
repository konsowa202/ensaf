'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Scale,
  Landmark,
  Lock,
  FileCheck2,
  Sparkles,
  Bot
} from 'lucide-react';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface GovernanceSectionProps {
  locale: string;
}

export function GovernanceSection({ locale }: GovernanceSectionProps) {
  const isAr = locale !== 'en';

  const pillars = [
    {
      icon: Scale,
      title: isAr ? 'التوافق مع الشريعة الإسلامية' : 'Sharia-Compliant Structures',
      desc: isAr
        ? 'عقود تمويل مبنية على أسس المشاركة والمضاربة المشروعة في الأرباح، معتمدة ومراجعة من لجان شرعية وقانونية متخصصة خالية من شبهات الربا والغرر.'
        : 'Contractual structures built upon authentic Islamic profit-sharing frameworks, reviewed and approved by certified Sharia scholars.',
    },
    {
      icon: Landmark,
      title: isAr ? 'حسابات ضمان بنكية مشروطة (Escrow)' : 'Segregated Escrow Accounts',
      desc: isAr
        ? 'أموال المستثمرين ومخصصات القضايا تُحفظ في حسابات بنكية منفصلة لدى بنوك سعودية مرخصة من البنك المركزي السعودي (ساما)، وتُصرف بقرارات إنجاز موثقة.'
        : 'Capital is held in isolated escrow accounts with SAMA-regulated Saudi banks, released exclusively against verified judicial milestones.',
    },
    {
      icon: Lock,
      title: isAr ? 'حماية البيانات الشخصية (نظام PDPL)' : 'PDPL Data Privacy & Encryption',
      desc: isAr
        ? 'تشفير شامل بأعلى معايير الأمن السيبراني متوافق تماماً مع نظام حماية البيانات الشخصية السعودي (PDPL) والضوابط الصادرة عن الهيئة الوطنية للأمن السيبراني.'
        : 'Enterprise-grade 256-bit encryption compliant with the Saudi Personal Data Protection Law (PDPL) and NCA cybersecurity controls.',
    },
    {
      icon: FileCheck2,
      title: isAr ? 'هيئة قضائية مستقلة ومحايدة' : 'Independent Judicial Committee',
      desc: isAr
        ? 'تضم الهيئة قضاة ومستشارين سابقين في ديوان المظالم والمحاكم التجارية لتقييم الحجج والبينات باحترافية وتحديد نسب الكسب بدقة متناهية.'
        : 'Senior former judges and commercial arbitration experts conduct rigorous due diligence on evidence, merits, and statutory deadlines.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F8FAFC] dark:bg-[#0D120F] border-y-2 border-slate-200 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 px-4 py-1.5 text-xs font-bold text-[#0E5B34] dark:text-[#E3CD94] mb-4">
            <ShieldCheck className="w-4 h-4 text-[#C09A4A]" />
            <span>{isAr ? 'الأمان والحوكمة والامتثال' : 'Governance & Regulatory Trust'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            {isAr ? (
              <>
                معايير مؤسسية راسخة{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">تحمي كافة الأطراف</span>
              </>
            ) : (
              <>
                Institutional Safeguards{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">Protecting Every Participant</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {isAr
              ? 'تلتزم منصة إنصاف بالأنظمة واللوائح الصادرة في المملكة العربية السعودية لضمان أعلى درجات الموثوقية والشفافية'
              : 'Built to conform with modern Saudi commercial court regulations and institutional wealth governance'}
          </p>
        </div>

        {/* 4 Pillars Grid - Elevated Light & Dark Mode */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white dark:bg-[#161D19] border-2 border-slate-200 dark:border-white/10 hover:border-[#0E5B34] dark:hover:border-[#1E8A54] rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-lg dark:hover:shadow-2xl"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 flex items-center justify-center text-[#0E5B34] dark:text-emerald-400 mb-6 shadow-2xs">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white mb-3 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner Triggering AI Assistant */}
        <div className="bg-gradient-to-r from-[#072718] via-[#0E5B34] to-[#0A4427] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#C09A4A]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-right">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#C09A4A]/40 flex items-center justify-center text-[#E3CD94] shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-base sm:text-lg text-[#E3CD94]">
                {isAr ? 'هل لديك استفسار قانوني حول ضوابط وحوكمة إنصاف؟' : 'Questions regarding regulatory compliance?'}
              </h4>
              <p className="text-xs sm:text-sm text-white/80 font-normal">
                {isAr
                  ? 'إنصاف المساعد الذكي جاهز للإجابة فوراً عن نظام المعاملات المدنية وحماية البيانات وتوثيق العقود'
                  : 'INSAF Smart Assistant can clarify PDPL privacy, contract validity, and escrow protections'}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              openInsafAi(
                'general',
                isAr
                  ? 'ما هي الضوابط القانونية ونظام المعاملات المدنية التي تحكم تمويل التقاضي في السعودية؟'
                  : 'What legal frameworks and regulations govern litigation finance in Saudi Arabia?'
              )
            }
            className="h-12 px-6 rounded-full bg-gradient-to-r from-[#C09A4A] to-[#E3CD94] text-[#0A4427] font-black text-xs sm:text-sm hover:opacity-95 transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#0A4427]" />
            <span>{isAr ? 'اسأل إنصاف المساعد الذكي الآن' : 'Consult AI Assistant'}</span>
          </button>
        </div>

      </div>
    </section>
  );
}
