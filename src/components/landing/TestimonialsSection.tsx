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
      ? testimonialsData.slice(0, 3).map((t: any, i: number) => ({
          content: (isAr ? t.content_ar : t.content_en) || t.content || defaultList[i % 3].content,
          author: (isAr ? t.author_ar : t.author_en) || t.author || defaultList[i % 3].author,
          role: (isAr ? t.role_ar : t.role_en) || t.role || defaultList[i % 3].role,
          city: (isAr ? t.city_ar : t.city_en) || t.city || '',
        }))
      : defaultList;

  return (
    <section className="py-16 md:py-24 border-t border-border/60">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-bold tracking-wide text-[#C09A4A] mb-3">
            {isAr ? 'قصص حقيقية' : 'Real stories'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {isAr ? 'ماذا يقول عملاؤنا وشركاؤنا' : 'What our clients and partners say'}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {list.map((t, i) => (
            <figure key={i} className="rounded-3xl border border-border/70 bg-card shadow-sm p-7 flex flex-col">
              <Quote className="w-5 h-5 text-[#C09A4A] mb-4" aria-hidden />
              <blockquote className="text-sm text-foreground leading-relaxed mb-6">
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
          ))}
        </div>
      </div>
    </section>
  );
}
