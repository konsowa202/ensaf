'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const DONUT_COLORS = ['#0E5B34', '#C09A4A', '#F2665C', '#4736E8', '#1E8A54', '#E3CD94', '#6B7280', '#0A4427', '#F9A8A2', '#93C5A9', '#D1D5DB', '#9AA8A0', '#C9A557'];

const tooltipStyle = {
  borderRadius: '14px',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--card)',
  color: 'var(--foreground)',
  fontSize: '13px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
} as const;

/* ------------------------------------------------------------------ */
/* Cumulative investments area chart with period filter                 */
/* ------------------------------------------------------------------ */
export function InvestmentsAreaChart({
  data, locale,
}: { data: { date: string; amount: number }[]; locale: string }) {
  const isAr = locale === 'ar';
  const [range, setRange] = useState<'7' | '30' | '90' | 'all'>('all');

  // cumulative over the full series, then window by selected range
  let running = 0;
  const cumulative = data.map((d) => ({ date: d.date, amount: (running += d.amount) }));

  const filtered = (() => {
    if (range === 'all' || cumulative.length === 0) return cumulative;
    const max = new Date(cumulative[cumulative.length - 1].date).getTime();
    const from = max - parseInt(range, 10) * 86400000;
    return cumulative.filter((d) => new Date(d.date).getTime() >= from);
  })();

  const series = filtered.map((d) => ({ ...d, label: d.date.slice(5) }));

  const ranges: { key: '7' | '30' | '90' | 'all'; ar: string; en: string }[] = [
    { key: '7', ar: '٧ أيام', en: '7D' },
    { key: '30', ar: '٣٠ يوم', en: '30D' },
    { key: '90', ar: '٩٠ يوم', en: '90D' },
    { key: 'all', ar: 'الكل', en: 'All' },
  ];

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3" dir={isAr ? 'rtl' : 'ltr'}>
        {ranges.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={`text-[11px] font-bold px-3 py-1 rounded-full transition-colors ${
              range === r.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {isAr ? r.ar : r.en}
          </button>
        ))}
      </div>
      <div className="h-48 md:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="invFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E5B34" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#0E5B34" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [
              `${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString('en-US')} ${isAr ? 'ر.س' : 'SAR'}`,
              isAr ? 'الإجمالي التراكمي' : 'Cumulative total',
            ]}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#0E5B34"
            strokeWidth={3}
            fill="url(#invFill)"
            dot={{ r: 4, fill: '#0E5B34', strokeWidth: 2, stroke: 'var(--card)' }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--card)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cases donut with center total + custom legend list                   */
/* ------------------------------------------------------------------ */
export function CasesDonut({
  data, locale,
}: { data: { name: string; value: number }[]; locale: string }) {
  const isAr = locale === 'ar';
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative shrink-0 mx-auto" style={{ width: 190, height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold tracking-tight">{total}</span>
          <span className="text-[11px] text-muted-foreground font-semibold">{isAr ? 'قضية' : 'cases'}</span>
        </div>
      </div>
      <div className="flex-1 min-w-[150px] grid grid-cols-1 gap-y-2 content-center">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs rounded-xl px-2 py-1.5 hover:bg-muted/50 transition-colors">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span className="text-muted-foreground font-semibold flex-1">{d.name}</span>
            <span className="font-extrabold shrink-0 tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
