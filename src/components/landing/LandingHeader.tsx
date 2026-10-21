'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/landing/LanguageSwitcher';
import { Bot, Sparkles, Menu, X } from 'lucide-react';
import { openInsafAi } from '@/components/landing/InsafAiAssistant';

interface LandingHeaderProps {
  locale: string;
  user: any;
}

export function LandingHeader({ locale, user }: LandingHeaderProps) {
  const isAr = locale !== 'en';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#how-it-works', label: isAr ? 'كيف نعمل' : 'How it works' },
    { href: '#opportunities', label: isAr ? 'الفرص الاستثمارية' : 'Opportunities' },
    { href: '#solutions', label: isAr ? 'لمن نخدم' : 'Who we serve' },
    { href: '#faq', label: isAr ? 'الأسئلة الشائعة' : 'FAQ' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-md shadow-sm border-b border-border/80'
          : 'bg-background/60 backdrop-blur-xs border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left (or Right in RTL): Logo */}
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="focus:outline-none">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-muted-foreground">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="hover:text-[#0E5B34] dark:hover:text-[#E3CD94] transition-colors py-1 relative group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0E5B34] dark:bg-[#E3CD94] transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Virtual Assistant Trigger in Nav */}
          <button
            onClick={() => openInsafAi('general')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0E5B34]/10 hover:bg-[#0E5B34]/15 border border-[#C09A4A]/50 text-[#0E5B34] dark:text-[#E3CD94] text-xs font-extrabold transition-all shadow-xs"
            title={isAr ? 'المساعد الافتراضي' : 'Virtual Assistant'}
          >
            <Bot className="w-3.5 h-3.5 text-[#C09A4A]" />
            <span>{isAr ? 'المساعد الافتراضي' : 'AI Assistant'}</span>
            <Sparkles className="w-3 h-3 text-[#C09A4A] animate-pulse" />
          </button>

          <ThemeToggle locale={locale} />
          <LanguageSwitcher />

          {user ? (
            <Link href={`/${locale}/dashboard`}>
              <Button className="rounded-full px-5 h-10 font-bold bg-[#0E5B34] hover:bg-[#0A4427] text-white shadow-md shadow-[#0E5B34]/20">
                {isAr ? 'لوحتي الرئيسية' : 'My Dashboard'}
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" className="rounded-full px-4 h-10 font-bold text-foreground">
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button className="rounded-full px-6 h-10 font-bold bg-gradient-to-r from-[#0E5B34] to-[#0A4427] text-white shadow-md shadow-[#0E5B34]/25 hover:opacity-95">
                  {isAr ? 'ابدأ الآن' : 'Get Started'}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card/95 backdrop-blur-xl border-b border-border p-6 shadow-xl space-y-4">
          <nav className="flex flex-col space-y-3 font-bold text-sm">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-foreground hover:text-[#0E5B34] border-b border-border/50"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openInsafAi('general');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0E5B34]/10 border border-[#C09A4A]/50 text-[#0E5B34] dark:text-[#E3CD94] font-extrabold text-sm"
            >
              <Bot className="w-4 h-4 text-[#C09A4A]" />
              <span>{isAr ? 'تحدث مع المساعد الافتراضي' : 'Chat with AI Assistant'}</span>
            </button>

            {!user && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href={`/${locale}/login`} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-2xl h-11 font-bold">
                    {isAr ? 'تسجيل الدخول' : 'Sign In'}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-2xl h-11 font-bold bg-[#0E5B34] text-white">
                    {isAr ? 'ابدأ الآن' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
