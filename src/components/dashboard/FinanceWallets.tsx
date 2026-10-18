'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const PAGE = 15;

function fmt(v: number, isAr: boolean) {
  return `${Math.round(v).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default function FinanceWallets({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const supabase = createClient();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = async (q: string, p: number) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_search_users', {
      p_query: q.trim(), p_limit: PAGE, p_offset: p * PAGE,
    });
    setLoading(false);
    if (!error && data?.success) {
      setUsers(data.users || []);
      setTotal(Number(data.total || 0));
    }
  };

  useEffect(() => { run('', 0); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onSearch = (q: string) => {
    setQuery(q);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setPage(0); run(q, 0); }, 350);
  };

  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle>{isAr ? 'محافظ المستخدمين' : 'User Wallets'}</CardTitle>
        <div className="relative">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
            placeholder={isAr ? 'ابحث بالاسم، البريد، الجوال أو رقم الهوية…' : 'Search name, email, phone or national ID…'}
            className="ps-9"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground" />}
        </div>
        <div className="text-xs text-muted-foreground">
          {isAr ? `${total.toLocaleString('en-US')} مستخدم` : `${total.toLocaleString('en-US')} users`}
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 && !loading ? (
          <p className="text-muted-foreground text-sm py-6 text-center">{isAr ? 'لا توجد نتائج.' : 'No results.'}</p>
        ) : (
          <div className="space-y-1">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/${locale}/admin/finance/users/${u.id}`}
                className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl border-b border-border/50 last:border-0 hover:bg-surface/70 transition-colors group"
              >
                <span className="w-9 h-9 rounded-full bg-primary/10 border border-primary/10 overflow-hidden flex items-center justify-center text-primary font-extrabold text-sm shrink-0">
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    ((isAr ? u.name_ar : u.name_en) || '—').trim().charAt(0)
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {(isAr ? u.name_ar : u.name_en) || u.name_ar}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate" dir="ltr">{u.email}</div>
                </div>
                <div className="text-end shrink-0">
                  <div className="font-extrabold text-sm text-primary" dir="ltr">{fmt(Number(u.balance || 0), isAr)}</div>
                  {Number(u.locked_balance || 0) > 0 && (
                    <div className="text-[11px] text-muted-foreground" dir="ltr">
                      {isAr ? 'محجوز' : 'Locked'}: {fmt(Number(u.locked_balance), isAr)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" size="sm" className="rounded-full" disabled={page === 0 || loading}
              onClick={() => { const p = page - 1; setPage(p); run(query, p); }}>
              <ChevronRight className="w-4 h-4 me-1 rtl:rotate-0 ltr:rotate-180" />{isAr ? 'السابق' : 'Prev'}
            </Button>
            <span className="text-xs text-muted-foreground font-semibold" dir="ltr">{page + 1} / {pages}</span>
            <Button variant="outline" size="sm" className="rounded-full" disabled={page >= pages - 1 || loading}
              onClick={() => { const p = page + 1; setPage(p); run(query, p); }}>
              {isAr ? 'التالي' : 'Next'}<ChevronLeft className="w-4 h-4 ms-1 rtl:rotate-0 ltr:rotate-180" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
