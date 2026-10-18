'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = locale === 'ar' ? 'en' : 'ar';

  function onToggle() {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onToggle} 
      disabled={isPending}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
    </Button>
  );
}
