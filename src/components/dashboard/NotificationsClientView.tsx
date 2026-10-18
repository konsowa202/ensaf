'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Bell, BellOff, CheckCheck, CircleDot } from 'lucide-react';

export default function NotificationsClientView({
  locale, initialNotifications,
}: {
  locale: string; initialNotifications: any[];
}) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const shown = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const handleOpen = async (n: any) => {
    if (!n.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    }
    if (n.link) router.push(`/${locale}${n.link}`);
  };

  const handleMarkAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-card border border-border/70">
          {([
            { key: 'all', label: isAr ? 'الكل' : 'All' },
            { key: 'unread', label: isAr ? `غير المقروءة (${unreadCount})` : `Unread (${unreadCount})` },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${
                filter === f.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="rounded-full" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 me-1.5" />
            {isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
          </Button>
        )}
      </div>

      {/* list */}
      {shown.length === 0 ? (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardContent className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <BellOff className="w-7 h-7" />
            </div>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'لا توجد إشعارات هنا.' : 'No notifications here.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shown.map((n) => (
            <button
              key={n.id}
              onClick={() => handleOpen(n)}
              className={`w-full text-start p-5 rounded-3xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                n.is_read
                  ? 'bg-card border-border/60'
                  : 'bg-primary/[0.04] border-primary/25 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.is_read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                }`}>
                  <Bell className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{isAr ? n.title_ar : n.title_en}</h3>
                    {!n.is_read && <CircleDot className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {isAr ? n.body_ar : n.body_en}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 mt-1">
                  {new Date(n.created_at).toLocaleString(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
