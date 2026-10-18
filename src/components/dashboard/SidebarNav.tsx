'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Scale, Settings, Users, PenSquare, Landmark, ScrollText, SlidersHorizontal, CircleUser, ShieldCheck, KanbanSquare, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ICONS = {
  home: Home,
  briefcase: Briefcase,
  scale: Scale,
  settings: Settings,
  users: Users,
  'pen-square': PenSquare,
  landmark: Landmark,
  'scroll-text': ScrollText,
  sliders: SlidersHorizontal,
  user: CircleUser,
  'shield-check': ShieldCheck,
  kanban: KanbanSquare,
  handshake: Handshake,
} as const;

export type SidebarIconKey = keyof typeof ICONS;

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: SidebarIconKey;
  section?: string;
}

export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  const pathname = usePathname();

  // Group items by their section (undefined = no header, top group)
  const groups: { section?: string; items: SidebarNavItem[] }[] = [];
  for (const item of items) {
    const g = groups.find((x) => x.section === item.section);
    if (g) g.items.push(item);
    else groups.push({ section: item.section, items: [item] });
  }

  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      {groups.map((g, gi) => (
        <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
          {g.section && (
            <div className="px-4 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-sidebar-foreground/40">
              {g.section}
            </div>
          )}
          <div className="space-y-1">
            {g.items.map((item) => {
              const isActive = pathname === item.href || (item.href.split('/').length > 3 && pathname.startsWith(item.href));
              const Icon = ICONS[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary-foreground' : 'text-primary')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
