import React from 'react';

interface HowItWorksStepsProps {
  locale: string;
}

export function HowItWorksSteps({ locale }: HowItWorksStepsProps) {
  const isAr = locale !== 'en';

  const steps = [
    {
      n: '01',
      titleAr: 'قدّم قضيتك أو استعرض الفرص',
      titleEn: 'Submit a case or browse deals',
      descAr:
        'يرفع صاحب القضية مستنداته بسرية تامة، ويطّلع المستثمر على الفرص المعتمدة في السوق.',
      descEn:
        'Claimants upload documents in full confidentiality; investors browse committee-approved opportunities.',
    },
    {
      n: '02',
      titleAr: 'تدقيق اللجنة القضائية',
      titleEn: 'Judicial committee review',
      descAr:
        'تفحص لجنة من قضاة وخبراء قوة الموقف القانوني وملاءة المحكوم عليه قبل اعتماد التمويل.',
      descEn:
        'Judges and experts assess legal merit and defendant solvency before any funding is approved.',
    },
    {
      n: '03',
      titleAr: 'التمويل والتنفيذ والأرباح',
      titleEn: 'Fund, enforce, distribute',
      descAr:
        'يُجمّع التمويل بالتوكنات عبر حساب ضمان، وتوزَّع العوائد تلقائياً عند تحصيل الحكم.',
      descEn:
        'Tokenized funding is collected in escrow; returns are distributed automatically upon enforcement.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Heading */}
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-bold tracking-wide text-[#C09A4A] mb-3">
            {isAr ? 'كيف نعمل' : 'How it works'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
            {isAr ? 'ثلاث خطوات واضحة، من المطالبة إلى التحصيل' : 'Three clear steps, from claim to collection'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isAr
              ? 'منهجية واحدة منضبطة تطبق على كل قضية، بلا استثناءات ولا تعقيد.'
              : 'One disciplined methodology applied to every case — no exceptions, no complexity.'}
          </p>
        </div>

        {/* Steps */}
        <ol className="grid md:grid-cols-3 gap-x-10 gap-y-12">
          {steps.map((step) => (
            <li key={step.n} className="relative">
              <span className="block text-5xl font-black text-[#0E5B34]/15 dark:text-[#C09A4A]/25 mb-4 select-none">
                {step.n}
              </span>
              <span className="absolute top-0 inset-inline-start-0 block w-10 h-px bg-[#C09A4A]" aria-hidden />
              <h3 className="text-lg font-extrabold text-foreground mb-2 pt-2">
                {isAr ? step.titleAr : step.titleEn}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isAr ? step.descAr : step.descEn}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
