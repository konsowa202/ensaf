'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, LogOut, X } from 'lucide-react';
import { ICONS, type SidebarNavItem } from '@/components/dashboard/SidebarNav';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

// Icons eligible to be promoted to a bottom-bar shortcut, in priority order.
const SHORTCUT_PRIORITY = ['kanban', 'landmark', 'scale'] as const;

interface Tab {
  key: string;
  href?: string; // undefined = "More" button
  label: string;
  iconKey?: keyof typeof ICONS;
}

export function MobileNav({ locale, items }: { locale: string; items: SidebarNavItem[] }) {
  const isAr = locale === 'ar';
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Lock body scroll while the "More" sheet is open.
  useEffect(() => {
    document.body.style.overflow = moreOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [moreOpen]);

  const home = items.find((i) => i.icon === 'home');
  const opportunities = items.find((i) => i.icon === 'briefcase');
  const shortcuts = SHORTCUT_PRIORITY
    .map((key) => items.find((i) => i.icon === key))
    .filter((i): i is SidebarNavItem => !!i)
    .slice(0, 2);

  const tabs: Tab[] = [
    ...(home ? [{ key: 'home', href: home.href, label: isAr ? 'الرئيسية' : 'Home', iconKey: 'home' as const }] : []),
    ...(opportunities
      ? [{ key: 'opportunities', href: opportunities.href, label: isAr ? 'الفرص' : 'Opportunities', iconKey: 'briefcase' as const }]
      : []),
    ...shortcuts.map((s) => ({ key: s.icon, href: s.href, label: s.label, iconKey: s.icon })),
    { key: 'more', label: isAr ? 'المزيد' : 'More' },
  ];

  const isTabActive = (tab: Tab) => {
    if (!tab.href) return false;
    if (tab.key === 'home') return pathname === tab.href;
    return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
  };

  // "More" is highlighted when the current page lives outside the main tabs.
  const moreActive = !tabs.some((t) => t.href && isTabActive(t)) && items.some((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));

  // Group all items by section for the sheet (mirrors SidebarNav).
  const groups: { section?: string; items: SidebarNavItem[] }[] = [];
  for (const item of items) {
    const g = groups.find((x) => x.section === item.section);
    if (g) g.items.push(item);
    else groups.push({ section: item.section, items: [item] });
  }

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const active = tab.key === 'more' ? moreActive : isTabActive(tab);
            const Icon = tab.iconKey ? ICONS[tab.iconKey] : LayoutGrid;
            const inner = (
              <>
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full px-4 py-1 transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold leading-none truncate max-w-full px-1',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {tab.label}
                </span>
              </>
            );
            const cls = 'flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[60px] min-w-0';
            return tab.href ? (
              <Link key={tab.key} href={tab.href} className={cls}>
                {inner}
              </Link>
            ) : (
              <button key={tab.key} type="button" onClick={() => setMoreOpen(true)} className={cls}>
                {inner}
              </button>
            );
          })}
        </div>
      </nav>

      {/* "More" full-height sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-background">
          <div className="h-16 shrink-0 border-b border-border flex items-center justify-between px-4">
            <Logo bare className="scale-90 origin-start" />
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label={isAr ? 'إغلاق' : 'Close'}
              className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 pb-8">
            {groups.map((g, gi) => (
              <div key={gi} className={gi > 0 ? 'mt-6' : ''}>
                {g.section && (
                  <div className="px-3 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {g.section}
                  </div>
                )}
                <div className="space-y-1">
                  {g.items.map((item) => {
                    const Icon = ICONS[item.icon];
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3.5 rounded-2xl font-semibold text-sm transition-colors',
                          active ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'text-foreground/80 hover:bg-muted'
                        )}
                      >
                        <Icon className={cn('w-5 h-5 shrink-0', active ? 'text-primary-foreground' : 'text-primary')} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl bg-destructive/10 text-destructive font-bold text-sm transition-colors hover:bg-destructive/15"
              >
                <LogOut className="w-5 h-5" />
                <span>{isAr ? 'تسجيل الخروج' : 'Sign out'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
