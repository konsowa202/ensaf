import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialItem {
  content: string;
  author: string;
  role: string;
  city: string;
}

interface TestimonialsSectionProps {
  locale: string;
  testimonialsData?: any[] | null;
}

export function TestimonialsSection({ locale, testimonialsData }: TestimonialsSectionProps) {
  const isAr = locale !== 'en';

  const defaultList: TestimonialItem[] = [
    {
      content: isAr
        ? 'كانت لدي مطالبة تجارية متعثرة بسبب تكاليف التقاضي. تولت إنصاف تمويل القضية بالكامل، وكسبنا الحكم واسترددنا مستحقاتنا دون أن أدفع ريالاً واحداً.'
        : 'My commercial claim had stalled over litigation costs. INSAF funded the case in full; we won and recovered everything without me paying a single riyal.',
      author: isAr ? 'م. عبد العزيز القحطاني' : 'Eng. Abdulaziz Al-Qahtani',
      role: isAr ? 'صاحب شركة مقاولات' : 'Managing Director, Contracting Co.',
      city: isAr ? 'الرياض' : 'Riyadh',
    },
    {
      content: isAr
        ? 'أبحث عن أصول بديلة غير مرتبطة بالأسهم. شفافية تقارير اللجنة وحسابات الضمان البنكية جعلت التجربة موثوقة بعائد تجاوز 22% سنوياً.'
        : 'I look for alternative assets uncorrelated with equities. Committee reporting and bank escrow made it a trusted experience with 22%+ annual returns.',
      author: isAr ? 'سارة المطيري' : 'Sarah Al-Mutairi',
      role: isAr ? 'مستثمرة مؤهلة' : 'Qualified Investor',
      city: isAr ? 'جدة' : 'Jeddah',
    },
    {
      content: isAr
        ? 'شراكتنا مع إنصاف رفعت حجم أعمال المكتب؛ نترافع في قضايا كبرى مع ضمان الأتعاب في مواعيدها واستقلالية تامة في المرافعة.'
        : 'Partnering with INSAF grew our practice; we litigate major cases with guaranteed timely fees and complete advocacy independence.',
      author: isAr ? 'المحامي فهد الدوسري' : 'Adv. Fahad Al-Dossary',
      role: isAr ? 'شريك أول في مكتب محاماة' : 'Senior Partner, Law Firm',
      city: isAr ? 'الخبر' : 'Khobar',
    },
  ];

  const list: TestimonialItem[] =
    testimonialsData && testimonialsData.length > 0
      ? testimonialsData.map((t: any, i: number) => ({
          content: (isAr ? t.content_ar : t.content_en) || t.content || defaultList[i % 3].content,
          author: (isAr ? t.author_ar : t.author_en) || t.author || defaultList[i % 3].author,
          role: (isAr ? t.role_ar : t.role_en) || t.role || defaultList[i % 3].role,
          city: (isAr ? t.city_ar : t.city_en) || t.city || '',
        }))
      : defaultList;

  const Card = ({ t }: { t: TestimonialItem }) => (
    <figure dir={isAr ? 'rtl' : 'ltr'} className="w-80 shrink-0 rounded-3xl border border-border/70 bg-card shadow-sm p-6 flex flex-col text-start">
      <Quote className="w-5 h-5 text-[#C09A4A] mb-4" aria-hidden />
      <blockquote className="text-sm text-foreground leading-relaxed mb-5 line-clamp-5">
        {t.content}
      </blockquote>
      <figcaption className="mt-auto pt-4 border-t border-border/60">
        <p className="text-sm font-extrabold text-foreground">{t.author}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t.role}
          {t.city ? ` · ${t.city}` : ''}
        </p>
      </figcaption>
    </figure>
  );

  const Row = () => (
    <div className="flex shrink-0 gap-4 pe-4">
      {list.map((t, i) => (
        <Card key={i} t={t} />
      ))}
    </div>
  );

  return (
    <section className="py-16 md:py-24 bg-surface/60 border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-bold tracking-wide text-[#C09A4A] mb-3">
            {isAr ? 'قصص حقيقية' : 'Real stories'}
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            {isAr ? 'ماذا يقول عملاؤنا وشركاؤنا' : 'What our clients and partners say'}
          </h2>
        </div>
      </div>

      {/* Auto-scrolling seamless marquee of quote cards.
          Wrapper is dir="ltr" so the oversized track anchors to the LEFT edge;
          in an RTL overflow container Chrome anchors oversized content right and
          the animated track gets composited outside the clip (cards vanished). */}
      <div dir="ltr" className="marquee-hover overflow-hidden">
        <div className="marquee-track flex w-max" style={{ animationDuration: '45s' }}>
          <Row />
          <Row />
        </div>
      </div>
    </section>
  );
}
