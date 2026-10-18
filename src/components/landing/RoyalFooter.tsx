'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import {
  Scale,
  ShieldCheck,
  Mail,
  MapPin,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Bot
} from 'lucide-react';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface RoyalFooterProps {
  locale: string;
}

export function RoyalFooter({ locale }: RoyalFooterProps) {
  const isAr = locale !== 'en';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <footer className="bg-gradient-to-b from-[#0A3D24] to-[#051A10] text-white pt-20 pb-12 relative overflow-hidden border-t-2 border-[#C09A4A]/30">
      {/* Background Sadu pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#C09A4A_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Pre-Footer Action Box */}
      <div className="container mx-auto px-6 mb-20 relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0E5B34] via-[#12683C] to-[#0A4427] border-2 border-[#C09A4A]/50 rounded-[2.5rem] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-[#E3CD94] mb-4">
            <Sparkles className="w-4 h-4 text-[#C09A4A]" />
            <span>{isAr ? 'ابدأ اليوم بكل ثقة' : 'Start Today with Confidence'}</span>
          </div>

          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {isAr ? 'جاهز لتحويل قضيتك إلى حق مسترد؟' : 'Ready to Transform Litigation into Secured Recovery?'}
          </h3>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            {isAr
              ? 'سواء كنت صاحب حق يبحث عن تغطية أتعاب محاميه أو مستثمراً يتطلع لعوائد استثنائية، إنصاف توفر لك البيئة العدلية والمالية المتكاملة.'
              : 'Whether seeking zero-risk legal funding or non-correlated alternative returns, INSAF is your gateway.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${locale}/register?type=applicant`}>
              <Button
                size="lg"
                className="rounded-full px-8 h-13 font-black bg-gradient-to-r from-[#C09A4A] to-[#E3CD94] text-[#0A4427] hover:opacity-95 shadow-xl shadow-black/20 gap-2"
              >
                {isAr ? 'قدّم قضيتك الآن مجاناً' : 'Submit Case Free'}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>

            <Link href={`/${locale}/register?type=investor`}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-13 font-bold border-2 border-white/40 text-white hover:bg-white hover:text-[#0A4427] bg-transparent"
              >
                {isAr ? 'افتح حساب مستثمر' : 'Open Investor Account'}
              </Button>
            </Link>

            <button
              onClick={() => openInsafAi('general')}
              className="h-13 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-[#E3CD94]" />
              <span>{isAr ? 'اسأل المساعد الافتراضي' : 'Ask Virtual Assistant'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          
          {/* Brand Col (2 cols on lg) */}
          <div className="col-span-2 space-y-4">
            <div className="inline-block">
              <Logo />
            </div>
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              {isAr
                ? 'منصة إنصاف — المنصة الرائدة لتمويل الدعاوى القضائية والاستثمار في القضايا بالمملكة العربية السعودية ودول الخليج، لتمكين العدالة وبناء شراكات مالية متوافقة مع الشريعة.'
                : 'INSAF — Premier litigation funding & legal capital platform in Saudi Arabia and the GCC, fostering justice through Sharia-compliant capital.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E3CD94] font-bold pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'متوافق مع الأنظمة القضائية والمالية في المملكة' : 'Saudi Judicial & Financial Regulatory Compliance'}</span>
            </div>
          </div>

          {/* Quick Links: Solutions */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#E3CD94] tracking-wider uppercase">
              {isAr ? 'بوابات المنصة' : 'Solutions'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/70">
              <li>
                <Link href={`/${locale}/register?type=applicant`} className="hover:text-white transition-colors">
                  {isAr ? 'أصحاب القضايا' : 'Claimants'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/opportunities`} className="hover:text-white transition-colors">
                  {isAr ? 'فرص المستثمرين' : 'Investor Deals'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/register?type=lawyer`} className="hover:text-white transition-colors">
                  {isAr ? 'شبكة المحامين' : 'Lawyer Network'}
                </Link>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">
                  {isAr ? 'حاسبة التمويل' : 'Finance Calculator'}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links: Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#E3CD94] tracking-wider uppercase">
              {isAr ? 'الحوكمة والنظام' : 'Legal & Compliance'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/70">
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
                  {isAr ? 'الشروط والأحكام' : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
                  {isAr ? 'الخصوصية ونظام PDPL' : 'Privacy (PDPL)'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/risk-disclosure`} className="hover:text-white transition-colors text-amber-300">
                  {isAr ? 'إفصاح المخاطر' : 'Risk Disclosure'}
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  {isAr ? 'التدقيق القضائي' : 'Due Diligence'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3 col-span-2 sm:col-span-1">
            <h4 className="text-sm font-black text-[#E3CD94] tracking-wider uppercase">
              {isAr ? 'المقر والتواصل' : 'Headquarters'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C09A4A] shrink-0" />
                <span>{isAr ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C09A4A] shrink-0" />
                <span>support@insaf.sa</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => openInsafAi('general')}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-[#E3CD94] transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{isAr ? 'مساعدك الافتراضي 24/7' : 'AI Assistant 24/7'}</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Vision 2030 */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            © {new Date().getFullYear()} {isAr ? 'منصة إنصاف لتمويل التقاضي. جميع الحقوق محفوظة.' : 'INSAF Litigation Funding. All rights reserved.'}
          </div>
          <div className="flex items-center gap-2 text-white/80 font-medium">
            <Scale className="w-4 h-4 text-[#C09A4A]" />
            <span>
              {isAr
                ? 'مبادرة رقمية تدعم ريادة وتطور البيئة القضائية والاستثمارية في المملكة العربية السعودية 🇸🇦'
                : 'Empowering the Saudi judicial & legal tech investment landscape 🇸🇦'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
