'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const PAGE = 15;

export default function RelationsSearch({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const supabase = createClient();

  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = async (q: string, p: number) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_search_investors', {
      p_query: q.trim(), p_limit: PAGE, p_offset: p * PAGE,
    });
    setLoading(false);
    if (!error && data?.success) {
      setRows(data.investors || []);
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
        <CardTitle>{isAr ? 'المستثمرون' : 'Investors'}</CardTitle>
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
          {isAr ? `${total.toLocaleString('en-US')} مستثمر` : `${total.toLocaleString('en-US')} investors`}
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 && !loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">{isAr ? 'لا توجد نتائج.' : 'No results.'}</p>
        ) : (
          <div className="space-y-2">
            {rows.map((inv) => {
              const name = (isAr ? inv.name_ar : inv.name_en) || inv.name_ar || '—';
              return (
                <div key={inv.id} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-border/60 bg-surface/50">
                  <span className="w-10 h-10 rounded-xl bg-indigo/10 text-indigo overflow-hidden flex items-center justify-center font-extrabold shrink-0">
                    {inv.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={inv.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      name.trim().charAt(0)
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm truncate">{name}</div>
                    <div className="text-[11px] text-muted-foreground" dir="ltr">{inv.email}</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="font-extrabold text-sm" dir="ltr">{Number(inv.total_invested).toLocaleString('en-US')}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? 'مستثمَر (ر.س)' : 'Invested (SAR)'}</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="font-extrabold text-sm" dir="ltr">{Number(inv.tokens_total).toLocaleString('en-US')}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? 'توكن' : 'Tokens'}</div>
                  </div>
                  <div className="text-center px-3">
                    <div className="font-extrabold text-sm" dir="ltr">{inv.investments_count}</div>
                    <div className="text-[10px] text-muted-foreground">{isAr ? 'استثمار' : 'Deals'}</div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${inv.kyc_status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-gold/15 text-gold'}`}>
                    {inv.kyc_status === 'verified' ? (isAr ? 'موثق' : 'Verified') : (isAr ? 'قيد التوثيق' : 'Pending')}
                  </span>
                  <div className="flex gap-3 shrink-0">
                    <Link href={`/${locale}/admin/finance/users/${inv.id}`} className="text-xs font-bold text-gold hover:underline">
                      {isAr ? 'الملف المالي' : 'Financial file'}
                    </Link>
                    <Link href={`/${locale}/admin/users/${inv.id}`} className="text-xs font-bold text-primary hover:underline">
                      {isAr ? 'الملف الكامل' : 'Full file'}
                    </Link>
                  </div>
                </div>
              );
            })}
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
