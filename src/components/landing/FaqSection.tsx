'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
    <section id="faq" className="py-20 md:py-28 border-t border-border/60">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm font-bold tracking-wide text-[#C09A4A] mb-3">
            {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {isAr ? 'إجابات واضحة ومباشرة' : 'Clear, direct answers'}
          </h2>
        </div>

        <Accordion className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={faq.id || idx} value={`item-${idx}`} className="border-b border-border/60">
              <AccordionTrigger className="text-base font-bold text-foreground hover:no-underline py-5 text-start">
                {isAr ? faq.question_ar : faq.question_en}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {isAr ? faq.answer_ar : faq.answer_en}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
