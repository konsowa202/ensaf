'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/brand/logo';

import { Bot, Sparkles } from 'lucide-react';
import { openInsafAi, type UserContext } from '@/components/landing/InsafAiAssistant';

export function TopBar({ locale, userContext }: { locale: string; userContext?: UserContext | null }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [resolvedContext, setResolvedContext] = useState<UserContext | null>(userContext || null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (userContext) {
      setResolvedContext(userContext);
    }
  }, [userContext]);

  useEffect(() => {
    const fetchUserDataAndNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile if not provided
      if (!userContext) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name_ar, full_name_en, user_type, roles(name_ar, name_en, slug)')
          .eq('id', user.id)
          .single();

        if (profile) {
          const isAr = locale !== 'en';
          const roleObj = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
          const name =
            (isAr ? profile.full_name_ar : profile.full_name_en) ||
            profile.full_name_ar ||
            profile.full_name_en ||
            '';

          let roleName = roleObj ? (isAr ? roleObj.name_ar : roleObj.name_en) : '';
          if (!roleName) {
            if (profile.user_type === 'applicant') roleName = isAr ? 'صاحب قضية' : 'Claimant';
            else if (profile.user_type === 'investor') roleName = isAr ? 'مستثمر' : 'Investor';
            else roleName = isAr ? 'مستخدم المنصة' : 'User';
          }

          setResolvedContext({
            name,
            roleSlug: roleObj?.slug || profile.user_type || 'applicant',
            roleName,
            userType: profile.user_type || 'applicant',
            isDashboard: true,
          });
        }
      }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) setNotifications(data);
    };

    fetchUserDataAndNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userContext, locale]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleSwitchLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shrink-0">
      {/* Mobile: compact brand mark (navigation lives in the bottom tab bar) */}
      <div className="md:hidden flex items-center">
        <Logo bare className="scale-[0.8] origin-start" />
      </div>

      <div className="flex items-center gap-2 ms-auto">

        {/* INSAF Smart AI Assistant Button */}
        <button
          onClick={() => openInsafAi(resolvedContext?.roleSlug as any)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E5B34]/10 hover:bg-[#0E5B34]/15 border border-[#0E5B34]/25 text-[#0E5B34] dark:text-[#E3CD94] text-xs font-bold transition-all shadow-xs cursor-pointer"
          title={locale === 'ar' ? 'إنصاف — المساعد الذكي' : 'INSAF AI Assistant'}
        >
          <Bot className="w-4 h-4 text-[#C09A4A]" />
          <span className="hidden md:inline">
            {locale === 'ar' ? 'المساعد الافتراضي' : 'AI Assistant'}
          </span>
          {resolvedContext?.roleName && (
            <span className="hidden md:inline-flex text-[10px] bg-[#0E5B34] text-white px-2 py-0.5 rounded-full font-bold">
              {resolvedContext.roleName}
            </span>
          )}
          <Sparkles className="w-3 h-3 text-[#C09A4A] animate-pulse" />
        </button>

        {/* Dark Mode Toggle */}
        <ThemeToggle locale={locale} />

        {/* Language Switcher */}
        <Button variant="ghost" size="sm" onClick={handleSwitchLanguage} className="font-medium">
          {locale === 'ar' ? 'English' : 'العربية'}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <span className="font-bold text-sm">{locale === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs font-semibold text-primary hover:underline">
                  {locale === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(n => (
                  <DropdownMenuItem 
                    key={n.id} 
                    className={`p-4 flex flex-col items-start gap-1 cursor-pointer border-b last:border-0 ${!n.is_read ? 'bg-primary/5' : ''}`}
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    <div className="font-bold text-sm">
                      {locale === 'ar' ? n.title_ar : n.title_en}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {locale === 'ar' ? n.body_ar : n.body_en}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            <div className="border-t border-border p-2">
              <Link
                href={`/${locale}/dashboard/notifications`}
                className="block text-center text-xs font-bold text-primary hover:bg-surface rounded-xl py-2 transition-colors"
              >
                {locale === 'ar' ? 'عرض كل الإشعارات' : 'View all notifications'}
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
      </div>
    </div>
  );
}
