'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';

/**
 * Compact sticky header for public standalone pages (opportunities, details…)
 * so a logged-in user never lands on a bare page with no way back.
 */
export function BackHeader({
  locale,
  backHref,
  backLabel,
  isAuthed,
}: {
  locale: string;
  backHref: string;
  backLabel?: string;
  isAuthed?: boolean;
}) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const Arrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push(backHref);
            }}
          >
            <Arrow className="w-4 h-4 me-1.5" />
            {backLabel || (isAr ? 'رجوع' : 'Back')}
          </Button>
          <Logo className="hidden sm:flex" />
        </div>

        <div className="flex items-center gap-2">
          {isAuthed && (
            <Button
              variant="ghost"
              size="sm"
              className="font-medium"
              onClick={() => router.push(`/${locale}/dashboard`)}
            >
              <LayoutDashboard className="w-4 h-4 me-1.5" />
              {isAr ? 'لوحتي' : 'My Dashboard'}
            </Button>
          )}
          <ThemeToggle locale={locale} />
        </div>
      </div>
    </header>
  );
}
