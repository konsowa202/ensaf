import React from 'react';
import Link from 'next/link';
import { TrendingUp, FileText, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface SolutionsSplitProps {
  locale: string;
}

export function SolutionsSplit({ locale }: SolutionsSplitProps) {
  const isAr = locale !== 'en';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const columns = [
    {
      icon: TrendingUp,
      titleAr: 'للمستثمرين',
      titleEn: 'For Investors',
      leadAr: 'أصل استثماري بديل غير مرتبط بتقلبات أسواق الأسهم.',
      leadEn: 'An alternative asset uncorrelated with equity markets.',
      bulletsAr: [
        'قضايا مدققة من لجنة قضائية مستقلة',
        'دخول مُجزأ بالتوكنات بدءاً من مبالغ صغيرة',
        'أموال محفوظة في حسابات ضمان بنكية',
        'توزيع آلي للأرباح عند تحصيل الحكم',
      ],
      bulletsEn: [
        'Cases vetted by an independent judicial committee',
        'Fractional token entry from small ticket sizes',
        'Capital secured in bank escrow accounts',
        'Automated profit distribution on enforcement',
      ],
      ctaAr: 'ابدأ الاستثمار',
      ctaEn: 'Start investing',
      href: `/${locale}/opportunities`,
    },
    {
      icon: FileText,
      titleAr: 'لأصحاب القضايا',
      titleEn: 'For Claimants',
      leadAr: 'حوّل مطالبتك المحقة إلى قوة ترافع كاملة دون تكلفة مسبقة.',
      leadEn: 'Turn your rightful claim into full legal power at zero upfront cost.',
      bulletsAr: [
        'تمويل غير قابل للرجوع: لا سداد عند الخسارة',
        'تغطية أتعاب المحاماة والخبراء والرسوم',
        'استقلالية تامة لمحاميك في استراتيجية الترافع',
        'سرية كاملة لمستنداتك وبياناتك',
      ],
      bulletsEn: [
        'Non-recourse funding: nothing owed if you lose',
        'Attorney, expert and court fees fully covered',
        'Your attorney keeps full tactical independence',
        'Complete confidentiality of your documents',
      ],
      ctaAr: 'قدّم قضيتك',
      ctaEn: 'Submit your case',
      href: `/${locale}/register`,
    },
  ];

  return (
    <section id="solutions" className="py-20 md:py-28 border-t border-border/60">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-bold tracking-wide text-[#C09A4A] mb-3">
            {isAr ? 'لمن صُممت إنصاف' : 'Who INSAF serves'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {isAr ? 'مساران، منصة واحدة' : 'Two paths, one platform'}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {columns.map((col, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border/70 bg-card shadow-sm p-8 flex flex-col"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#0E5B34]/10 dark:bg-[#C09A4A]/10 flex items-center justify-center mb-5">
                <col.icon className="w-5 h-5 text-[#0E5B34] dark:text-[#C09A4A]" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground mb-2">
                {isAr ? col.titleAr : col.titleEn}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {isAr ? col.leadAr : col.leadEn}
              </p>

              <ul className="space-y-3 mb-8">
                {(isAr ? col.bulletsAr : col.bulletsEn).map((b, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 mt-0.5 text-[#0E5B34] dark:text-[#C09A4A] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={col.href}
                className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-[#0E5B34] dark:text-[#C09A4A] hover:opacity-80 transition-opacity"
              >
                <span>{isAr ? col.ctaAr : col.ctaEn}</span>
                <Arrow className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
