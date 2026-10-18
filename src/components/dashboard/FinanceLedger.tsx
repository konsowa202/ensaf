'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const PAGE = 15;

export const TX_TYPE: Record<string, { ar: string; en: string; cls: string }> = {
  deposit:    { ar: 'إيداع', en: 'Deposit', cls: 'bg-primary/10 text-primary' },
  investment: { ar: 'استثمار', en: 'Investment', cls: 'bg-indigo/10 text-indigo' },
  payout:     { ar: 'صرف عوائد', en: 'Payout', cls: 'bg-gold/15 text-gold' },
  refund:     { ar: 'استرداد', en: 'Refund', cls: 'bg-coral/10 text-coral' },
  fee:        { ar: 'رسوم', en: 'Fee', cls: 'bg-muted text-muted-foreground' },
  adjustment: { ar: 'تسوية يدوية', en: 'Adjustment', cls: 'bg-indigo/10 text-indigo' },
};

function fmt(v: number, isAr: boolean) {
  return `${Math.round(Math.abs(v)).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`;
}

export default function FinanceLedger({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const supabase = createClient();

  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = async (q: string, t: string, p: number) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_search_transactions', {
      p_query: q.trim(), p_type: t, p_limit: PAGE, p_offset: p * PAGE,
    });
    setLoading(false);
    if (!error && data?.success) {
      setRows(data.transactions || []);
      setTotal(Number(data.total || 0));
    }
  };

  useEffect(() => { run('', '', 0); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onSearch = (q: string) => {
    setQuery(q);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setPage(0); run(q, type, 0); }, 350);
  };
  const onType = (t: string) => {
    setType(t);
    setPage(0);
    run(query, t, 0);
  };

  const pages = Math.max(1, Math.ceil(total / PAGE));
  const inTypes = ['deposit', 'payout', 'refund'];

  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle>{isAr ? 'سجل المعاملات' : 'Transactions Ledger'}</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
              placeholder={isAr ? 'ابحث بالمرجع أو اسم المستخدم أو البريد…' : 'Search by reference, user name or email…'}
              className="ps-9"
            />
            {loading && <Loader2 className="w-4 h-4 animate-spin absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground" />}
          </div>
          <div className="flex rounded-full border border-border p-1 text-xs font-bold overflow-x-auto">
            <button onClick={() => onType('')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${type === '' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {isAr ? 'الكل' : 'All'}
            </button>
            {Object.entries(TX_TYPE).map(([k, v]) => (
              <button key={k} onClick={() => onType(k)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${type === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {isAr ? v.ar : v.en}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {isAr ? `${total.toLocaleString('en-US')} معاملة` : `${total.toLocaleString('en-US')} transactions`}
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-start font-semibold py-2 pe-4">{isAr ? 'النوع' : 'Type'}</th>
                <th className="text-start font-semibold py-2 pe-4">{isAr ? 'المستخدم' : 'User'}</th>
                <th className="text-start font-semibold py-2 pe-4">{isAr ? 'القضية' : 'Case'}</th>
                <th className="text-start font-semibold py-2 pe-4">{isAr ? 'المبلغ' : 'Amount'}</th>
                <th className="text-start font-semibold py-2 pe-4">{isAr ? 'المرجع' : 'Reference'}</th>
                <th className="text-start font-semibold py-2">{isAr ? 'التاريخ' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tx) => {
                const tt = TX_TYPE[tx.type];
                const isIn = inTypes.includes(tx.type) || (tx.type === 'adjustment' && Number(tx.amount) > 0);
                return (
                  <tr key={tx.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pe-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${tt ? tt.cls : 'bg-muted text-muted-foreground'}`}>
                        {isIn ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {tt ? (isAr ? tt.ar : tt.en) : tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 pe-4">
                      <Link href={`/${locale}/admin/finance/users/${tx.user_id}`} className="font-semibold hover:text-primary hover:underline transition-colors">
                        {(isAr ? tx.user_name_ar : tx.user_name_en) || tx.user_email}
                      </Link>
                    </td>
                    <td className="py-2.5 pe-4 text-muted-foreground text-xs">
                      {tx.case_id ? (
                        <Link href={`/${locale}/dashboard/cases/${tx.case_id}`} className="hover:text-primary hover:underline transition-colors">
                          {(isAr ? tx.case_title_ar : tx.case_title_en) || ''} ({tx.case_number})
                        </Link>
                      ) : '—'}
                    </td>
                    <td className={`py-2.5 pe-4 font-bold ${isIn ? 'text-primary' : 'text-foreground'}`} dir="ltr">
                      {Number(tx.amount) < 0 ? '-' : ''}{fmt(Number(tx.amount || 0), isAr)}
                    </td>
                    <td className="py-2.5 pe-4 text-muted-foreground text-[11px] font-mono" dir="ltr">{tx.reference || '—'}</td>
                    <td className="py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && !loading && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                  {isAr ? 'لا توجد معاملات مطابقة.' : 'No matching transactions.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="md:hidden space-y-2">
          {rows.map((tx) => {
            const tt = TX_TYPE[tx.type];
            const isIn = inTypes.includes(tx.type) || (tx.type === 'adjustment' && Number(tx.amount) > 0);
            return (
              <div key={tx.id} className="rounded-2xl border border-border/60 bg-surface/50 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${tt ? tt.cls : 'bg-muted text-muted-foreground'}`}>
                    {isIn ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    {tt ? (isAr ? tt.ar : tt.en) : tx.type}
                  </span>
                  <span className={`font-extrabold text-sm ${isIn ? 'text-primary' : 'text-foreground'}`} dir="ltr">
                    {Number(tx.amount) < 0 ? '-' : ''}{fmt(Number(tx.amount || 0), isAr)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <Link href={`/${locale}/admin/finance/users/${tx.user_id}`} className="font-semibold truncate hover:text-primary hover:underline transition-colors">
                    {(isAr ? tx.user_name_ar : tx.user_name_en) || tx.user_email}
                  </Link>
                  <span className="shrink-0 text-muted-foreground whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                {(tx.case_id || tx.reference) && (
                  <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span className="truncate">
                      {tx.case_id ? (
                        <Link href={`/${locale}/dashboard/cases/${tx.case_id}`} className="hover:text-primary hover:underline transition-colors">
                          {(isAr ? tx.case_title_ar : tx.case_title_en) || ''} ({tx.case_number})
                        </Link>
                      ) : '—'}
                    </span>
                    {tx.reference && <span className="shrink-0 font-mono" dir="ltr">{tx.reference}</span>}
                  </div>
                )}
              </div>
            );
          })}
          {rows.length === 0 && !loading && (
            <p className="py-8 text-center text-muted-foreground text-sm">
              {isAr ? 'لا توجد معاملات مطابقة.' : 'No matching transactions.'}
            </p>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" size="sm" className="rounded-full" disabled={page === 0 || loading}
              onClick={() => { const p = page - 1; setPage(p); run(query, type, p); }}>
              <ChevronRight className="w-4 h-4 me-1 rtl:rotate-0 ltr:rotate-180" />{isAr ? 'السابق' : 'Prev'}
            </Button>
            <span className="text-xs text-muted-foreground font-semibold" dir="ltr">{page + 1} / {pages}</span>
            <Button variant="outline" size="sm" className="rounded-full" disabled={page >= pages - 1 || loading}
              onClick={() => { const p = page + 1; setPage(p); run(query, type, p); }}>
              {isAr ? 'التالي' : 'Next'}<ChevronLeft className="w-4 h-4 ms-1 rtl:rotate-0 ltr:rotate-180" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
