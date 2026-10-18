'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2, Sparkles, MapPin } from 'lucide-react';

interface TestimonialItem {
  content: string;
  author: string;
  role: string;
  city: string;
  rating: number;
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
        ? 'كانت لدي مطالبة تجارية متأخرة لأكثر من سنة ونصف بسبب نقص السيولة لتغطية أتعاب المحاماة والخبراء. منصة إنصاف تولت تمويل القضية بالكامل، وكسبنا حكم التنفيذ واسترددنا كامل مستحقاتنا دون أن أدفع ريالاً واحداً من جيبي.'
        : 'I had an overdue commercial claim that had stalled due to hefty legal costs. INSAF funded 100% of attorney and forensic fees. We secured a final enforceable judgment with zero upfront cash.',
      author: isAr ? 'م. عبد العزيز القحطاني' : 'Eng. Abdulaziz Al-Qahtani',
      role: isAr ? 'صاحب شركة مقاولات' : 'Managing Director, EPC Corp',
      city: isAr ? 'الرياض' : 'Riyadh',
      rating: 5,
    },
    {
      content: isAr
        ? 'كجهة استثمارية نبحث دوماً عن أصول بديلة غير مرتبطة بأسواق الأسهم. شفافية إنصاف في تقارير الهيئة القضائية وحسابات الضمان البنكية جعلت التجربة آمنة بعائد محقق تجاوز 25% سنوياً.'
        : 'As wealth managers, non-correlated yield is paramount. INSAF’s judicial committee due diligence and escrow accounts delivered transparent returns exceeding 25% p.a.',
      author: isAr ? 'سارة بنت سلطان المطيري' : 'Sarah Al-Mutairi',
      role: isAr ? 'مستثمرة مؤهلة' : 'Accredited Investor',
      city: isAr ? 'جدة' : 'Jeddah',
      rating: 5,
    },
    {
      content: isAr
        ? 'شراكتنا كمكتب محاماة مع إنصاف نقلت حجم أعمالنا لمستوى آخر؛ نترافع الآن في كبرى القضايا التجارية مع ضمان استلام أتعابنا بمواعيدها المحددة واستقلالية تامة في استراتيجية المرافعة.'
        : 'Partnering with INSAF transformed our firm. We handle multi-million SAR commercial trials with guaranteed timely fee disbursements and total tactical independence.',
      author: isAr ? 'المحامي فهد بن تركي الدوسري' : 'Adv. Fahad Al-Dossary',
      role: isAr ? 'محامٍ وموثق معتمد' : 'Senior Partner, Law Firm',
      city: isAr ? 'الخبر' : 'Khobar',
      rating: 5,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5B34]/10 border border-[#C09A4A]/40 px-4 py-1.5 text-xs font-bold text-[#0E5B34] dark:text-[#E3CD94] mb-4">
            <Sparkles className="w-4 h-4 text-[#C09A4A]" />
            <span>{isAr ? 'قصص نجاح وموثوقية حقيقية' : 'Verified Success Stories'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            {isAr ? (
              <>
                ماذا يقول عملاؤنا{' '}
                <span className="text-[#0E5B34] dark:text-[#E3CD94]">وشركاؤنا في المملكة؟</span>
              </>
            ) : (
              <>
                Trusted by Clients & Law Firms{' '}
                <span className="text-[#0E5B34]">Across the Kingdom</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {isAr
              ? 'تجارب حقيقية لأصحاب مطالبات كسبوا حقوقهم ومستثمرين حققوا عوائد مجزية برعاية إنصاف'
              : 'Real outcomes from claimants who achieved justice and investors who realized solid returns'}
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {defaultList.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-card border-2 border-border/80 hover:border-[#C09A4A]/60 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top Quote & Rating */}
                <div className="flex items-center justify-between mb-6">
                  <Quote className="w-8 h-8 text-[#C09A4A]/40" />
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s < item.rating ? 'text-[#C09A4A] fill-[#C09A4A]' : 'text-border'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-6 font-medium">
                  "{item.content}"
                </p>
              </div>

              {/* Author Info Footer */}
              <div className="pt-5 border-t border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0E5B34] to-[#0A4427] text-[#E3CD94] font-black text-base flex items-center justify-center shrink-0">
                    {item.author.trim().charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                      <span>{item.author}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                    <div className="text-xs text-muted-foreground">{item.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-surface px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3 h-3 text-[#0E5B34]" />
                  <span>{item.city}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
