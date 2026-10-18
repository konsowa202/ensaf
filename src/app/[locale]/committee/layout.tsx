import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { getNavItems } from '@/components/dashboard/nav';

export default async function CommitteeLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { items } = await getNavItems(locale);
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar locale={locale} />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <TopBar locale={locale} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-6 lg:pb-8 overflow-y-auto">
          {children}
        </div>
      </main>
      <MobileNav locale={locale} items={items} />
    </div>
  );
}
