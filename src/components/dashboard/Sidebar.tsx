import { Logo } from '@/components/brand/logo';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { getNavItems } from '@/components/dashboard/nav';
import { LogOut, ShieldCheck } from 'lucide-react';

export async function Sidebar({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const { items, profile } = await getNavItems(locale);

  return (
    <aside className="w-72 shrink-0 bg-sidebar border-e border-sidebar-border hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-sidebar-border">
        <Logo />
      </div>

      {(profile.userName || profile.roleName) && (
        <div className="mx-4 mt-4 rounded-2xl bg-sidebar-accent border border-sidebar-border p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 overflow-hidden flex items-center justify-center shrink-0">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-primary" />
            )}
          </span>
          <div className="min-w-0">
            {profile.userName && (
              <div dir="auto" className="font-bold text-sm text-sidebar-foreground leading-snug line-clamp-2 break-words">{profile.userName}</div>
            )}
            {profile.roleName && (
              <span className="inline-block mt-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/15 rounded-full px-2.5 py-0.5">
                {profile.roleName}
              </span>
            )}
          </div>
        </div>
      )}

      <SidebarNav items={items} />

      <div className="p-4 border-t border-sidebar-border">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-destructive hover:bg-destructive/10 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>{isAr ? 'تسجيل الخروج' : 'Sign out'}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
