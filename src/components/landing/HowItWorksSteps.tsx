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
    <section id="how-it-works" className="relative py-20 md:py-32 overflow-hidden">
      {/* Soft brand wash so the glass cards read as glass (light mode); faint in dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(52rem 30rem at 12% 0%, rgba(14,91,52,0.08), transparent 60%), radial-gradient(46rem 26rem at 88% 100%, rgba(192,154,74,0.10), transparent 60%), linear-gradient(180deg, rgba(14,91,52,0.03), rgba(192,154,74,0.02))',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background:
            'radial-gradient(52rem 30rem at 12% 0%, rgba(63,169,116,0.06), transparent 60%), radial-gradient(46rem 26rem at 88% 100%, rgba(192,154,74,0.05), transparent 60%)',
        }}
      />

      <div className="relative container mx-auto px-4 md:px-6 max-w-6xl">
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

        {/* Steps — glass cards */}
        <ol className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <li
              key={step.n}
              className="relative rounded-3xl border border-white/50 dark:border-white/10 bg-white/55 dark:bg-white/5 backdrop-blur-md shadow-lg shadow-black/5 p-7"
            >
              <span className="block text-5xl font-black text-[#0E5B34]/15 dark:text-[#C09A4A]/25 mb-4 select-none">
                {step.n}
              </span>
              <span className="absolute top-7 inset-inline-start-7 block w-10 h-px bg-[#C09A4A]" aria-hidden />
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
