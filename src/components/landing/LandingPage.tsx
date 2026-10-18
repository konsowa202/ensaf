import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { SaudiPatternBg } from '@/components/landing/SaudiPatternBg';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { MarketStatsBar } from '@/components/landing/MarketStatsBar';
import { RoleSolutionsSection } from '@/components/landing/RoleSolutionsSection';
import { HowItWorksSteps } from '@/components/landing/HowItWorksSteps';
import { LitigationCalculator } from '@/components/landing/LitigationCalculator';
import { FeaturedCasesSection } from '@/components/landing/FeaturedCasesSection';
import { GovernanceSection } from '@/components/landing/GovernanceSection';
import { PartnersMarquee } from '@/components/landing/PartnersMarquee';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { RoyalFooter } from '@/components/landing/RoyalFooter';
import { InsafAiAssistant, type UserContext } from '@/components/landing/InsafAiAssistant';

interface LandingPageProps {
  locale: string;
}

export async function LandingPage({ locale }: LandingPageProps) {
  const isAr = locale !== 'en';
  let user = null;
  let userContext: UserContext | null = null;
  let publicCases: any[] | null = null;
  let faqs: any[] | null = null;
  let partners: any[] | null = null;
  let comments: any[] | null = null;

  try {
    const supabase = await createClient(await cookies());
    const { data: authData } = await supabase.auth.getUser();
    user = authData?.user || null;

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name_ar, full_name_en, user_type, roles(name_ar, name_en, slug)')
        .eq('id', user.id)
        .single();

      const roleObj = Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles;
      const name =
        (isAr ? profile?.full_name_ar : profile?.full_name_en) ||
        profile?.full_name_ar ||
        profile?.full_name_en ||
        '';

      let roleName = roleObj ? (isAr ? roleObj.name_ar : roleObj.name_en) : '';
      if (!roleName) {
        if (profile?.user_type === 'applicant') roleName = isAr ? 'صاحب قضية' : 'Claimant';
        else if (profile?.user_type === 'investor') roleName = isAr ? 'مستثمر' : 'Investor';
        else roleName = isAr ? 'مستخدم' : 'User';
      }

      const roleSlug = roleObj?.slug || profile?.user_type || 'general';

      userContext = {
        name,
        roleSlug,
        roleName,
        userType: profile?.user_type || 'general',
        isDashboard: false,
      };
    }

    const { data: casesData } = await supabase.from('public_cases').select('*').limit(3);
    publicCases = casesData;

    const { data: faqsData } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    faqs = faqsData;

    const { data: partnersData } = await supabase.from('partners').select('*').eq('is_active', true);
    partners = partnersData;

    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('is_approved', true)
      .eq('is_testimonial', true);
    comments = commentsData;
  } catch (err) {
    console.warn('Database query fallback during landing render:', err);
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-[#0D120F] dark:text-[#F3F6F4] relative selection:bg-[#0E5B34] selection:text-white transition-colors duration-300">
      {/* 1. Traditional Saudi Vector Motif Background */}
      <SaudiPatternBg />

      {/* 2. Crisp Luxury Header */}
      <LandingHeader locale={locale} user={user} />

      {/* 3. Hero Section with Live Case Showcase (Fixed overflow clipping & RTL flow) */}
      <HeroSection locale={locale} />

      {/* 4. Live Saudi Market Stats Bar */}
      <MarketStatsBar locale={locale} />

      {/* 5. Role-Specific Portals & Instant AI Triggers */}
      <RoleSolutionsSection locale={locale} />

      {/* 6. Step-by-Step Methodology Journey */}
      <HowItWorksSteps locale={locale} />

      {/* 7. Interactive Litigation & ROI Calculator */}
      <LitigationCalculator locale={locale} />

      {/* 8. Active Featured Cases (Opportunities) */}
      <FeaturedCasesSection locale={locale} publicCases={publicCases} />

      {/* 9. Institutional Governance & Saudi Legal Compliance */}
      <GovernanceSection locale={locale} />

      {/* 10. Accredited Law Firms & Partners Marquee */}
      <PartnersMarquee locale={locale} partnersData={partners} />

      {/* 11. Real Testimonials & Verified Cases */}
      <TestimonialsSection locale={locale} testimonialsData={comments} />

      {/* 12. Searchable FAQs & Custom Legal Inquiry */}
      <FaqSection locale={locale} faqsData={faqs} />

      {/* 13. Saudi Royal Footer */}
      <RoyalFooter locale={locale} />
    </div>
  );
}
