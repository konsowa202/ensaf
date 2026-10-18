'use client';

import React from 'react';
import {
  HelpCircle,
  Sparkles,
  Bot
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface FaqItem {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  category?: string;
}

interface FaqSectionProps {
  locale: string;
  faqsData?: FaqItem[] | null;
}

export function FaqSection({ locale, faqsData }: FaqSectionProps) {
  const isAr = locale !== 'en';

  const defaultFaqs: FaqItem[] = [
    {
      id: 'faq-1',
      question_ar: 'ماذا يحدث إذا خسرنا القضية؟ هل يطالَب صاحب القضية بأي سداد؟',
      question_en: 'What happens if the lawsuit is lost? Does the claimant owe anything?',
      answer_ar:
        'قطعاً لا. تعمل إنصاف بمبدأ التمويل غير القابل للرجوع (Non-recourse Funding)؛ فإذا لم تُكسب الدعوى ولم يتم استرداد المبالغ بحكم قطعي، يتحمل الممولون والمستثمرون المخاطرة كاملة ولا يُطالب صاحب القضية بسداد أي هللة عن أتعاب المحاماة أو مصاريف الخبراء.',
      answer_en:
        'Absolutely not. INSAF operates on a strict non-recourse basis. If the claim is unsuccessful, the claimant owes zero. Investors absorb the cost of litigation expenses.',
      category: 'applicant',
    },
    {
      id: 'faq-2',
      question_ar: 'هل تمويل التقاضي متوافق مع أحكام الشريعة الإسلامية والأنظمة السعودية؟',
      question_en: 'Is litigation finance compliant with Islamic Sharia and Saudi law?',
      answer_ar:
        'نعم، تمت صياغة عقود تمويل إنصاف وفق صيغ المشاركة المباحة شرعاً والمضاربة في الأرباح المحققة، دون أي فائدة مشروطة أو غرر، وتتوافق مع أحكام نظام المعاملات المدنية الصادر بالمرسوم الملكي في المملكة.',
      answer_en:
        'Yes. INSAF contracts are structured under legitimate Sharia profit-sharing frameworks with full compliance under the Saudi Civil Transactions Law.',
      category: 'sharia',
    },
    {
      id: 'faq-3',
      question_ar: 'ما هي معايير قبول القضية وفتح باب التمويل لها؟',
      question_en: 'What criteria determine case eligibility for funding?',
      answer_ar:
        'تخضع كل قضية لتدقيق ثلاثي: (1) متانة الموقف القانوني والحجج الموثقة، (2) الجدارة المالية والقدرة على سداد المحكوم عليه عبر محاكم التنفيذ، (3) تناسب التكاليف المطلوبة مع حجم المطالبة المحكوم بها (عادة تكون المطالبة 500,000 ر.س فأعلى).',
      answer_en:
        'Every claim undergoes a 3-part audit: legal strength, defendant solvency for enforcement, and proportionality of funding budget to total award value (typically SAR 500K+).',
      category: 'applicant',
    },
    {
      id: 'faq-4',
      question_ar: 'كيف تضمن المنصة حقوق المستثمرين وتوزيع الأرباح؟',
      question_en: 'How does INSAF protect investor capital and distribute returns?',
      answer_ar:
        'تودع أموال التمويل في حسابات ضمان بنكية مشروطة (Escrow Accounts) لدى بنوك سعودية مرخصة. ولا تُصرف للأطراف إلا وفق جدول إنجاز معتمد من الهيئة القضائية، وتوزع الأرباح آلياً فور تحصيل صك التنفيذ.',
      answer_en:
        'Capital is placed in dedicated escrow accounts in Saudi banks, released strictly upon verified trial milestones, and automatically paid out upon enforcement.',
      category: 'investor',
    },
    {
      id: 'faq-5',
      question_ar: 'هل تتدخل إنصاف في استراتيجية المحامي أو اختيار المستشارين؟',
      question_en: 'Does INSAF interfere with attorney trial strategy?',
      answer_ar:
        'لا تتدخل منصة إنصاف إطلاقاً في استراتيجية الترافع أو إدارة المحامي لمذكراته، التزاماً بنظام المحاماة السعودي وحصانة العلاقة المهنية بين الموكل ومحاميه.',
      answer_en:
        'Never. INSAF respects absolute tactical and professional independence under the Saudi Code of Law Practice without interfering in legal advocacy.',
      category: 'lawyer',
    },
  ];

  const faqs = faqsData && faqsData.length > 0 ? faqsData : defaultFaqs;

  return (
    <section id="faq" className="py-20 md:py-28 bg-white dark:bg-[#0D120F] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Section Heading */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 px-4 py-1.5 text-xs font-bold text-[#0E5B34] dark:text-[#E3CD94] mb-4">
            <HelpCircle className="w-4 h-4 text-[#C09A4A]" />
            <span>{isAr ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            {isAr ? (
              <>
                إجابات واضحة ومباشرة{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">عن كل ما يشغل بالك</span>
              </>
            ) : (
              <>
                Clear Answers to{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">Everything You Need to Know</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {isAr
              ? 'كل ما تود معرفته عن ضوابط التمويل، الحماية الشرعية، وإجراءات البت والتنفيذ'
              : 'Everything regarding funding regulations, Sharia safeguards, and procedural enforcement'}
          </p>
        </div>

        {/* Accordion Container - Clean Crisp Light & Dark Mode */}
        <div className="bg-white dark:bg-[#161D19] border-2 border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm mb-10 transition-colors">
          <Accordion className="w-full space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={faq.id || idx}
                value={`item-${idx}`}
                className="border border-slate-200 dark:border-white/10 rounded-2xl px-5 data-[state=open]:border-[#0E5B34] dark:data-[state=open]:border-[#1E8A54] data-[state=open]:bg-[#F8FAFC] dark:data-[state=open]:bg-[#121815] transition-all"
              >
                <AccordionTrigger className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:no-underline py-5 text-right">
                  {isAr ? faq.question_ar : faq.question_en}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pb-5 pt-1 font-normal">
                  {isAr ? faq.answer_ar : faq.answer_en}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Interactive AI Prompt Banner */}
        <div className="bg-[#F8FAFC] dark:bg-[#121815] border-2 border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center justify-center transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#0E5B34] dark:bg-[#1E8A54] text-[#E3CD94] flex items-center justify-center mb-4 shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            {isAr ? 'لديك استفسار خاص بقضيتك لم تجده هنا؟' : 'Have a specific case question not listed here?'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mb-6 font-normal">
            {isAr
              ? 'تحدث مباشرة مع "إنصاف: المساعد الذكي" المبرمج بالأنظمة والقوانين السعودية للحصول على إجابة فورية'
              : 'Ask "INSAF Smart Assistant" trained on Saudi judicial regulations for instant personalized guidance'}
          </p>
          <button
            onClick={() =>
              openInsafAi(
                'general',
                isAr ? 'مرحباً، لدي استفسار خاص حول تمويل قضيتي...' : 'Hello, I have a specific question about funding my case...'
              )
            }
            className="h-12 px-8 rounded-full bg-gradient-to-r from-[#0E5B34] to-[#0A4427] text-white font-black text-sm hover:opacity-95 transition-all flex items-center gap-2 shadow-md shadow-[#0E5B34]/20"
          >
            <Sparkles className="w-4 h-4 text-[#E3CD94]" />
            <span>{isAr ? 'اسأل إنصاف المساعد الذكي الآن' : 'Ask INSAF AI Now'}</span>
          </button>
        </div>

      </div>
    </section>
  );
}
