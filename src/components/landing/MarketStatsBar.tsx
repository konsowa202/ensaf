'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Award, Clock, Users, ShieldCheck, Sparkles } from 'lucide-react';

interface MarketStatsBarProps {
  locale: string;
}

export function MarketStatsBar({ locale }: MarketStatsBarProps) {
  const isAr = locale !== 'en';

  const stats = [
    {
      icon: Coins,
      value: isAr ? '18.5+ مليون' : '18.5M+',
      unit: isAr ? 'ريال سعودي' : 'SAR',
      label: isAr ? 'حجم القضايا والمطالبات المموّلة' : 'Funded Claims Portfolio',
      desc: isAr ? 'محافظ تمويل قضائي نشطة' : 'Active litigation capital',
    },
    {
      icon: Award,
      value: '94.2%',
      unit: '',
      label: isAr ? 'نسبة نجاح القضايا المعتمدة' : 'Committee Success Rate',
      desc: isAr ? 'بفضل التدقيق القضائي المشدد' : 'Strict due diligence filter',
    },
    {
      icon: Clock,
      value: isAr ? '10 أيام' : '10 Days',
      unit: '',
      label: isAr ? 'متوسط سرعة دراسة القضية' : 'Average Review Period',
      desc: isAr ? 'تحليل ذكي وقانوني فوري' : 'AI screening & committee vote',
    },
    {
      icon: Users,
      value: '+3,850',
      unit: '',
      label: isAr ? 'شبكة المستثمرين والمحامين' : 'Active Investor Network',
      desc: isAr ? 'نخبة قانونية واستثمارية' : 'Accredited legal partners',
    },
  ];

  return (
    <section className="relative bg-gradient-to-r from-[#072517] via-[#0E5B34] to-[#0A4427] text-white py-12 md:py-16 border-y-2 border-[#C09A4A]/30 overflow-hidden shadow-2xl">
      {/* Background Sadu Geometric Pattern subtle overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#C09A4A_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Top bar header note */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-white/10 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-[#E3CD94] font-bold">
            <Sparkles className="w-4 h-4 text-[#C09A4A]" />
            <span>
              {isAr
                ? 'أرقام حية من السوق القضائي السعودي — موثوقة ومحدّثة'
                : 'Verified Real-Time Metrics from the Saudi Litigation Finance Market'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isAr
                ? 'مطابق لمعايير الحوكمة والأنظمة القضائية السعودية'
                : 'Compliant with Saudi Commercial & Judicial Regulations'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-[#C09A4A]/40 flex items-center justify-center text-[#E3CD94] group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#E3CD94] tracking-tight flex items-baseline gap-1">
                      <span>{stat.value}</span>
                      {stat.unit && <span className="text-xs sm:text-sm font-bold text-white/80">{stat.unit}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-extrabold text-white mt-1">{stat.label}</div>
                <div className="text-xs text-white/60 mt-0.5">{stat.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
