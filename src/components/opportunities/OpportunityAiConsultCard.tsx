'use client';

import React from 'react';
import { Bot, Sparkles, Scale, TrendingUp, ShieldCheck, Coins, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface OpportunityAiConsultCardProps {
  caseData: {
    id: string;
    case_number?: string;
    title_ar: string;
    title_en?: string;
    status: string;
    case_type?: string;
    court?: string;
    claim_amount?: number;
    requested_funding: number;
    funded_amount: number;
    expected_return_min?: number;
    expected_return_max?: number;
    duration_months?: number;
    risk_level?: string;
  };
  locale: string;
}

export function OpportunityAiConsultCard({ caseData, locale }: OpportunityAiConsultCardProps) {
  const isAr = locale !== 'en';

  const caseItemPayload = {
    id: caseData.id,
    case_number: caseData.case_number,
    title_ar: caseData.title_ar,
    title_en: caseData.title_en,
    status: caseData.status,
    requested_funding: caseData.requested_funding,
    funded_amount: caseData.funded_amount,
    claim_amount: caseData.claim_amount,
    court: caseData.court,
    case_type: caseData.case_type,
  };

  const handleAskQuestion = (question: string) => {
    openInsafAi(
      'investor',
      question,
      { selectedCase: caseItemPayload }
    );
  };

  const handleOpenGeneralChat = () => {
    openInsafAi(
      'investor',
      isAr
        ? `أريد دراسة متكاملة لقضية "${caseData.title_ar}" (رقم ${caseData.case_number || 'المسجل'})؛ من حيث وقائع النزاع، الجدوى المالية، ومخاطر التنفيذ.`
        : `I would like a comprehensive analysis of case "${caseData.title_en || caseData.title_ar}" covering merits, financial returns, and execution risks.`,
      { selectedCase: caseItemPayload }
    );
  };

  const quickQuestions = isAr
    ? [
        {
          icon: Scale,
          label: 'الموقف القانوني',
          q: `ما هو السند النظامي وموقف الدعوى أمام ${caseData.court || 'المحكمة المختصة'} في قضية "${caseData.title_ar}"؟`,
        },
        {
          icon: TrendingUp,
          label: 'العائد والمدة',
          q: `كيف تم تقدير العائد المتوقع (${caseData.expected_return_min || 15}% - ${caseData.expected_return_max || 25}%) ومدة ${caseData.duration_months || 18} شهراً في قضية "${caseData.title_ar}"؟`,
        },
        {
          icon: ShieldCheck,
          label: 'ضمانات التنفيذ',
          q: `ما هي الضمانات الإجرائية لحماية أموال المستثمرين في قضية "${caseData.title_ar}" بموجب نظام التنفيذ السعودي؟`,
        },
        {
          icon: Coins,
          label: 'تحليل التمويل والتوكنز',
          q: `حلل حجم التمويل المطلوب (${Number(caseData.requested_funding || 0).toLocaleString('en-US')} ر.س) ونسبة التمويل المكتمل في هذه القضية.`,
        },
      ]
    : [
        {
          icon: Scale,
          label: 'Legal Merits',
          q: `What are the legal merits and grounds for case "${caseData.title_en || caseData.title_ar}" before ${caseData.court || 'the competent court'}?`,
        },
        {
          icon: TrendingUp,
          label: 'Return & Duration',
          q: `How is the projected yield (${caseData.expected_return_min || 15}% - ${caseData.expected_return_max || 25}%) and ${caseData.duration_months || 18}-month timeline estimated?`,
        },
        {
          icon: ShieldCheck,
          label: 'Enforcement Safety',
          q: `What enforcement safeguards protect investor capital under the Saudi Enforcement Law for this claim?`,
        },
        {
          icon: Coins,
          label: 'Syndication Metrics',
          q: `Analyze the funding target (${Number(caseData.requested_funding || 0).toLocaleString('en-US')} SAR) and token progress for this case.`,
        },
      ];

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/25 bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/50 dark:from-emerald-950/30 dark:via-card dark:to-amber-950/20 p-5 sm:p-6 shadow-md transition-all hover:border-emerald-500/40">
      {/* Decorative background glow */}
      <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/15">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0E5B34] to-[#0A4427] text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-[#C09A4A]/40">
            <Bot className="w-6 h-6 text-[#E3CD94]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black tracking-wider uppercase bg-[#0E5B34] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#E3CD94]" />
                {isAr ? 'إنصاف Copilot' : 'INSAF Copilot'}
              </span>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                Allam 2.0 🇸🇦
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              {isAr ? 'استشر المساعد الذكي في تفاصيل هذه القضية' : 'Consult INSAF AI on this Opportunity'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {isAr
                ? `تحليل فوري لوقائع النزاع (${caseData.title_ar})، العائد المتوقع، والموقف الإجرائي لدى ${caseData.court || 'المحكمة'}.`
                : `Instant analytical advisory covering merits, returns, and procedural status for (${caseData.title_en || caseData.title_ar}).`}
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleOpenGeneralChat}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0E5B34] to-[#0A4427] hover:from-[#0B4929] hover:to-[#08351F] text-white text-xs font-black shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-[#E3CD94]" />
          <span>{isAr ? 'محادثة مباشرة حول القضية' : 'Start AI Case Discussion'}</span>
          {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Quick Interactive Question Chips */}
      <div className="relative mt-4">
        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C09A4A]" />
          <span>{isAr ? 'انقر على أي سؤال للحصول على إجابة تحليلية فورية:' : 'Click any question to ask AI immediately:'}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quickQuestions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleAskQuestion(item.q)}
                className="group flex items-start gap-2.5 p-3 rounded-2xl bg-white/90 dark:bg-card/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-border hover:border-emerald-400 dark:hover:border-emerald-700 text-start transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-[#0E5B34] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[11px] font-black text-emerald-800 dark:text-emerald-300 mb-0.5">
                    {item.label}
                  </span>
                  <span className="block text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#0E5B34] dark:group-hover:text-emerald-300 transition-colors leading-relaxed line-clamp-2">
                    {item.q}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
