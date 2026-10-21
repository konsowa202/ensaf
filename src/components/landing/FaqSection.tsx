'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
}

interface FaqSectionProps {
  locale: string;
  faqsData?: FaqItem[] | null;
}

export function FaqSection({ locale, faqsData }: FaqSectionProps) {
  const isAr = locale !== 'en';
  const [openIndex, setOpenIndex] = useState<number>(0);

  const defaultFaqs: FaqItem[] = [
    {
      id: 'faq-1',
      question_ar: 'ماذا يحدث إذا خُسرت القضية؟ هل يُطالَب صاحب القضية بالسداد؟',
      question_en: 'What happens if the case is lost? Does the claimant owe anything?',
      answer_ar:
        'لا. تعمل إنصاف بمبدأ التمويل غير القابل للرجوع؛ فإذا لم تُكسب الدعوى يتحمل المستثمرون المخاطرة كاملة، ولا يُطالب صاحب القضية بسداد أي مبلغ.',
      answer_en:
        'No. INSAF operates on a strict non-recourse basis. If the claim fails, investors absorb the loss and the claimant owes nothing.',
    },
    {
      id: 'faq-2',
      question_ar: 'هل تمويل التقاضي متوافق مع الشريعة والأنظمة السعودية؟',
      question_en: 'Is litigation funding compliant with Sharia and Saudi law?',
      answer_ar:
        'نعم، تُصاغ عقود التمويل وفق صيغ المشاركة المباحة شرعاً دون فائدة مشروطة أو غرر، وبما يتوافق مع نظام المعاملات المدنية في المملكة.',
      answer_en:
        'Yes. Funding contracts follow legitimate Sharia profit-sharing structures with no interest or gharar, in full compliance with the Saudi Civil Transactions Law.',
    },
    {
      id: 'faq-3',
      question_ar: 'ما معايير قبول القضية وفتح باب التمويل لها؟',
      question_en: 'What criteria determine case eligibility?',
      answer_ar:
        'تخضع كل قضية لتدقيق ثلاثي: قوة الموقف القانوني، وملاءة المحكوم عليه المالية، وتناسب التمويل المطلوب مع حجم المطالبة.',
      answer_en:
        'Every case passes a three-part review: legal merit, defendant solvency, and proportionality of funding to claim size.',
    },
    {
      id: 'faq-4',
      question_ar: 'كيف تُحمى أموال المستثمرين وتوزَّع الأرباح؟',
      question_en: 'How is investor capital protected and how are returns distributed?',
      answer_ar:
        'تُودع أموال التمويل في حسابات ضمان بنكية ولا تُصرف إلا وفق مراحل معتمدة، وتوزَّع الأرباح تلقائياً فور تحصيل الحكم.',
      answer_en:
        'Funds sit in bank escrow accounts released only at approved milestones, and profits are distributed automatically once the judgment is collected.',
    },
    {
      id: 'faq-5',
      question_ar: 'هل تتدخل إنصاف في استراتيجية المحامي؟',
      question_en: 'Does INSAF interfere with attorney strategy?',
      answer_ar:
        'لا تتدخل المنصة إطلاقاً في إدارة المحامي للقضية، التزاماً بنظام المحاماة السعودي وحصانة العلاقة بين الموكل ومحاميه.',
      answer_en:
        'Never. INSAF respects full professional independence under the Saudi Code of Law Practice.',
    },
  ];

  const faqs = faqsData && faqsData.length > 0 ? faqsData : defaultFaqs;

  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm font-bold tracking-wide text-[#C09A4A] mb-3">
            {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {isAr ? 'إجابات واضحة ومباشرة' : 'Clear, direct answers'}
          </h2>
        </div>

        <div className="max-w-2xl mx-auto border-t border-border/60">
          {faqs.map((faq, idx) => {
            const open = openIndex === idx;
            return (
              <div key={faq.id || idx} className="border-b border-border/60">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : idx)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 py-5 text-start group"
                >
                  <span
                    className={`text-base font-bold transition-colors ${
                      open
                        ? 'text-[#0E5B34] dark:text-[#C09A4A]'
                        : 'text-foreground group-hover:text-[#0E5B34] dark:group-hover:text-[#C09A4A]'
                    }`}
                  >
                    {isAr ? faq.question_ar : faq.question_en}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      open ? 'rotate-180 text-[#0E5B34] dark:text-[#C09A4A]' : ''
                    }`}
                    aria-hidden
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-muted-foreground leading-relaxed pb-6">
                      {isAr ? faq.answer_ar : faq.answer_en}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
