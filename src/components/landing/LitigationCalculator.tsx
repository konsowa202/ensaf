'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calculator,
  ShieldCheck,
  TrendingUp,
  Scale,
  Sparkles,
  Bot,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface LitigationCalculatorProps {
  locale: string;
}

export function LitigationCalculator({ locale }: LitigationCalculatorProps) {
  const isAr = locale !== 'en';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [claimType, setClaimType] = useState('commercial');
  const [claimAmount, setClaimAmount] = useState(2500000); // 2.5M SAR
  const [fundingNeeded, setFundingNeeded] = useState(250000); // 250k SAR
  const [monthsDuration, setMonthsDuration] = useState(12); // 12 months

  const claimTypes = [
    { id: 'commercial', nameAr: 'منازعات تجارية وعقود', nameEn: 'Commercial & Contracts', avgIrr: 24, successRate: 94 },
    { id: 'construction', nameAr: 'مقاولات وبنية تحتية', nameEn: 'Construction & EPC', avgIrr: 26, successRate: 92 },
    { id: 'real_estate', nameAr: 'مطالبات عقارية', nameEn: 'Real Estate Disputes', avgIrr: 22, successRate: 95 },
    { id: 'enforcement', nameAr: 'تحصيل ديون وتنفيذ', nameEn: 'Debt Enforcement', avgIrr: 28, successRate: 96 },
  ];

  const currentType = claimTypes.find((c) => c.id === claimType) || claimTypes[0];

  const estimatedReturnAmount = Math.round(fundingNeeded * (1 + (currentType.avgIrr / 100) * (monthsDuration / 12)));
  const investorProfit = estimatedReturnAmount - fundingNeeded;
  const claimantNetRecovery = Math.round(claimAmount - estimatedReturnAmount);
  const claimantPercentage = Math.round((claimantNetRecovery / claimAmount) * 100);

  return (
    <section id="calculator" className="py-20 md:py-28 bg-white dark:bg-[#0D120F] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/20 dark:border-[#1E8A54]/40 px-4 py-1.5 text-xs font-bold text-[#0E5B34] dark:text-[#E3CD94] mb-4">
            <Calculator className="w-4 h-4 text-[#C09A4A]" />
            <span>{isAr ? 'حاسبة التمويل والعوائد التفاعلية' : 'Litigation Finance Calculator'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            {isAr ? (
              <>
                محاكاة مالية وقضائية{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">بشفافية مطلقة</span>
              </>
            ) : (
              <>
                Estimate Returns & Funding{' '}
                <span className="text-[#0E5B34] dark:text-[#22c55e]">with Absolute Transparency</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {isAr
              ? 'جرّب محاكاة تمويل قضيتك أو استثمارك لتكتشف توزيع المبالغ والأرباح التقديرية وفق معايير السوق السعودي'
              : 'Simulate your claim funding or investment to preview profit distribution under Saudi litigation benchmarks'}
          </p>
        </div>

        {/* Calculator Main Box - Crisp White & Dark Luxury Contrast */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-[#161D19] border-2 border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Controls: Inputs & Sliders (7 cols) */}
            <div className="lg:col-span-7 space-y-7">
              
              {/* Claim Type Selector */}
              <div>
                <label className="block text-sm font-black text-slate-900 dark:text-white mb-3">
                  {isAr ? '1. اختر نوع القضية أو المطالبة:' : '1. Select Dispute Type:'}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {claimTypes.map((type) => {
                    const isSelected = claimType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setClaimType(type.id)}
                        className={`p-3 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all text-right ${
                          isSelected
                            ? 'border-[#0E5B34] dark:border-[#1E8A54] bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 text-[#0E5B34] dark:text-[#E3CD94]'
                            : 'border-slate-200 dark:border-white/10 bg-[#F8FAFC] dark:bg-[#121815] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="font-extrabold">{isAr ? type.nameAr : type.nameEn}</div>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          {isAr ? `متوسط عائد: ${type.avgIrr}%` : `Avg. IRR: ${type.avgIrr}%`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider 1: Total Claim Amount */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    {isAr ? '2. إجمالي مبلغ المطالبة المتنازع عليها:' : '2. Total Claim Value:'}
                  </label>
                  <span className="text-base sm:text-lg font-black text-[#0E5B34] dark:text-[#E3CD94]">
                    {claimAmount.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}
                  </span>
                </div>
                <input
                  type="range"
                  min={200000}
                  max={10000000}
                  step={100000}
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  className="w-full accent-[#0E5B34] h-2 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-bold">
                  <span>200,000 {isAr ? 'ر.س' : 'SAR'}</span>
                  <span>10,000,000 {isAr ? 'ر.س' : 'SAR'}</span>
                </div>
              </div>

              {/* Slider 2: Funding Needed */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    {isAr ? '3. ميزانية التمويل المطلوبة (أتعاب المحامين والخبراء):' : '3. Legal Funding Needed:'}
                  </label>
                  <span className="text-base sm:text-lg font-black text-[#0E5B34] dark:text-[#E3CD94]">
                    {fundingNeeded.toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={1500000}
                  step={25000}
                  value={fundingNeeded}
                  onChange={(e) => setFundingNeeded(Number(e.target.value))}
                  className="w-full accent-[#0E5B34] h-2 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-bold">
                  <span>50,000 {isAr ? 'ر.س' : 'SAR'}</span>
                  <span>1,500,000 {isAr ? 'ر.س' : 'SAR'}</span>
                </div>
              </div>

              {/* Slider 3: Duration in Months */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    {isAr ? '4. المدة المتوقعة للتقاضي والتنفيذ:' : '4. Expected Litigation Duration:'}
                  </label>
                  <span className="text-base sm:text-lg font-black text-[#0E5B34] dark:text-[#E3CD94]">
                    {monthsDuration} {isAr ? 'شهراً' : 'Months'}
                  </span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={24}
                  step={2}
                  value={monthsDuration}
                  onChange={(e) => setMonthsDuration(Number(e.target.value))}
                  className="w-full accent-[#0E5B34] h-2 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-bold">
                  <span>{isAr ? '6 أشهر (سريع)' : '6 Mo'}</span>
                  <span>{isAr ? '24 شهراً (استئناف/تنفيذ)' : '24 Mo'}</span>
                </div>
              </div>

            </div>

            {/* Right Projection Results Card (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#072B18] via-[#0E5B34] to-[#0A4427] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#C09A4A]/40 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#E3CD94]">
                  {isAr ? 'نتائج المحاكاة التقديرية' : 'Estimated Projections'}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  {isAr ? `احتمالية كسب: ${currentType.successRate}%` : `${currentType.successRate}% Win Likelihood`}
                </span>
              </div>

              {/* Claimant Net Benefit */}
              <div className="space-y-4 mb-7">
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                  <div className="text-xs text-white/80 font-medium mb-1">
                    {isAr ? 'صافي ما يحصله صاحب القضية عند النجاح:' : 'Claimant Net Recovery at Success:'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#E3CD94]">
                    {claimantNetRecovery.toLocaleString('en-US')}{' '}
                    <span className="text-sm font-bold text-white">{isAr ? 'ر.س' : 'SAR'}</span>
                  </div>
                  <div className="text-[11px] text-emerald-300 font-bold mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {isAr
                        ? `يحصل على ${claimantPercentage}% من المطالبة بدون أي أتعاب مسبقة`
                        : `Retains ${claimantPercentage}% with 0 upfront expense`}
                    </span>
                  </div>
                </div>

                {/* Investor ROI Metric */}
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
                  <div className="text-xs text-white/80 font-medium mb-1">
                    {isAr ? 'العائد المتوقع للممول / المستثمر:' : 'Projected Investor Return:'}
                  </div>
                  <div className="text-2xl font-black text-white flex items-center justify-between">
                    <span>
                      {investorProfit.toLocaleString('en-US')}{' '}
                      <span className="text-sm font-normal text-white/70">{isAr ? 'ر.س ربح' : 'SAR Profit'}</span>
                    </span>
                    <span className="text-lg font-bold text-emerald-300 bg-emerald-400/20 px-2.5 py-1 rounded-xl">
                      +{currentType.avgIrr}% IRR
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Button to consult AI Assistant with this calculation */}
              <button
                onClick={() =>
                  openInsafAi(
                    'general',
                    isAr
                      ? `بناءً على حاسبة التمويل: لدي قضية (${currentType.nameAr}) بمبلغ ${claimAmount.toLocaleString('en-US')} ر.س، وأحتاج تمويلاً بقيمة ${fundingNeeded.toLocaleString('en-US')} ر.س. ما هي شروط القبول والخطوات القادمة؟`
                      : `Based on the calculator: I have a ${currentType.nameEn} claim of SAR ${claimAmount.toLocaleString('en-US')} needing SAR ${fundingNeeded.toLocaleString('en-US')} funding. What are the next steps?`
                  )
                }
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#C09A4A] to-[#E3CD94] text-[#0A4427] font-black text-xs sm:text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg mb-3"
              >
                <Bot className="w-4 h-4 text-[#0A4427]" />
                <span>{isAr ? 'اسأل إنصاف المساعد الذكي عن هذه الحسبة' : 'Ask INSAF AI About This Simulation'}</span>
                <Sparkles className="w-3.5 h-3.5 text-[#0A4427]" />
              </button>

              <div className="text-[10px] text-white/60 text-center font-medium">
                {isAr
                  ? '* الأرقام استرشادية وتخضع للتقييم النهائي من الهيئة القضائية المستقلة لمنصة إنصاف.'
                  : '* Figures are indicative subject to judicial committee underwriting.'}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
