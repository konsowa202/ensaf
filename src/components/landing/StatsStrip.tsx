'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StatsStripProps {
  locale: string;
}

interface StatDef {
  value: number;
  decimals: number;
  prefix: { ar: string; en: string };
  suffix: { ar: string; en: string };
  label: { ar: string; en: string };
}

const STATS: StatDef[] = [
  {
    value: 120,
    decimals: 0,
    prefix: { ar: '+', en: 'SAR ' },
    suffix: { ar: ' مليون ر.س', en: 'M+' },
    label: { ar: 'مبالغ مموّلة', en: 'Funded to date' },
  },
  {
    value: 85,
    decimals: 0,
    prefix: { ar: '+', en: '' },
    suffix: { ar: '', en: '+' },
    label: { ar: 'قضية اجتازت التدقيق', en: 'Cases funded' },
  },
  {
    value: 22,
    decimals: 0,
    prefix: { ar: '', en: '' },
    suffix: { ar: '٪', en: '%' },
    label: { ar: 'متوسط العائد السنوي', en: 'Avg. annual return' },
  },
  {
    value: 0,
    decimals: 0,
    prefix: { ar: '', en: '' },
    suffix: { ar: '', en: '' },
    label: { ar: 'ريال يدفعه صاحب القضية عند الخسارة', en: 'SAR owed by claimant on loss' },
  },
];

export function StatsStrip({ locale }: StatsStripProps) {
  const isAr = locale !== 'en';
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();

          if (reduced) {
            setProgress(1);
            return;
          }

          const duration = 1400;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            // ease-out cubic
            setProgress(1 - Math.pow(1 - t, 3));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fmt = (n: number, decimals: number) =>
    n.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  return (
    <section className="border-b border-border/60">
      <div ref={ref} className="container mx-auto px-6 max-w-5xl">
        <dl className="grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-border/60 rtl:md:divide-x-reverse">
          {STATS.map((s, i) => (
            <div key={i} className="py-10 md:py-12 px-4 text-center">
              <dd className="text-2xl md:text-3xl font-black text-[#0E5B34] dark:text-[#C09A4A] mb-2 tabular-nums">
                {isAr ? s.prefix.ar : s.prefix.en}
                {fmt(s.value * progress, s.decimals)}
                {isAr ? s.suffix.ar : s.suffix.en}
              </dd>
              <dt className="text-xs md:text-sm text-muted-foreground font-medium">
                {isAr ? s.label.ar : s.label.en}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
