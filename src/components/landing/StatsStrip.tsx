import React from 'react';

interface StatsStripProps {
  locale: string;
}

export function StatsStrip({ locale }: StatsStripProps) {
  const isAr = locale !== 'en';

  const stats = [
    {
      value: isAr ? '+120M' : 'SAR 120M+',
      label: isAr ? 'ريال مبالغ مموّلة' : 'Funded to date',
      arValue: '+١٢٠ مليون ر.س',
    },
    {
      value: isAr ? '+85' : '85+',
      label: isAr ? 'قضية اجتازت التدقيق' : 'Cases funded',
      arValue: '+٨٥ قضية',
    },
    {
      value: isAr ? '22%' : '22%',
      label: isAr ? 'متوسط العائد السنوي' : 'Avg. annual return',
      arValue: '٢٢٪ عائد سنوي',
    },
    {
      value: isAr ? '0' : '0',
      label: isAr ? 'ريال يدفعه صاحب القضية عند الخسارة' : 'Claimant owes if case is lost',
      arValue: 'صفر مخاطرة على المدّعي',
    },
  ];

  return (
    <section className="border-y border-border/60">
      <div className="container mx-auto px-6 max-w-5xl">
        <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60 rtl:divide-x-reverse">
          {stats.map((s, i) => (
            <div key={i} className="py-10 md:py-12 px-4 text-center">
              <dd className="text-2xl md:text-3xl font-black text-[#0E5B34] dark:text-[#C09A4A] mb-2">
                {isAr ? s.arValue : s.value}
              </dd>
              <dt className="text-xs md:text-sm text-muted-foreground font-medium">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
