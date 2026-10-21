import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsStrip } from '@/components/landing/StatsStrip';
import { HowItWorksSteps } from '@/components/landing/HowItWorksSteps';
import { FeaturedCasesSection } from '@/components/landing/FeaturedCasesSection';
import { SolutionsSplit } from '@/components/landing/SolutionsSplit';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { RoyalFooter } from '@/components/landing/RoyalFooter';

interface LandingPageProps {
  locale: string;
}

export async function LandingPage({ locale }: LandingPageProps) {
  let user = null;
  let publicCases: any[] | null = null;
  let faqs: any[] | null = null;
  let comments: any[] | null = null;

  try {
    const supabase = await createClient(await cookies());
    const { data: authData } = await supabase.auth.getUser();
    user = authData?.user || null;

    const { data: casesData } = await supabase.from('public_cases').select('*').limit(3);
    publicCases = casesData;

    const { data: faqsData } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    faqs = faqsData;

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
    <div className="min-h-screen bg-background text-foreground dark:bg-[#0D120F] transition-colors duration-300 selection:bg-[#0E5B34] selection:text-white">
      {/* Header */}
      <LandingHeader locale={locale} user={user} />

      <main>
        {/* 1. Hero */}
        <HeroSection locale={locale} />

        {/* 2. Stats strip */}
        <StatsStrip locale={locale} />

        {/* 3. How it works */}
        <HowItWorksSteps locale={locale} />

        {/* 4. Featured cases */}
        <FeaturedCasesSection locale={locale} publicCases={publicCases} />

        {/* 5. For investors / for claimants */}
        <SolutionsSplit locale={locale} />

        {/* 6. Testimonials */}
        <TestimonialsSection locale={locale} testimonialsData={comments} />

        {/* 7. FAQ */}
        <FaqSection locale={locale} faqsData={faqs} />
      </main>

      {/* 8. Footer (unchanged) */}
      <RoyalFooter locale={locale} />
    </div>
  );
}
