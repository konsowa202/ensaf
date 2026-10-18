'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { BarChart3, Percent, Gauge, Wrench, Save } from 'lucide-react';

export default function SettingsClientView({ locale, settings }: { locale: string; settings: any[] }) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const get = (key: string) => settings.find((s) => s.key === key)?.value || {};

  const [heroStats, setHeroStats] = useState({
    cases_funded: get('hero_stats').cases_funded ?? 0,
    funded_volume: get('hero_stats').funded_volume ?? 0,
    avg_review_days: get('hero_stats').avg_review_days ?? 0,
    investor_community: get('hero_stats').investor_community ?? 0,
  });
  const [fees, setFees] = useState({
    success_fee_percent: get('fees').success_fee_percent ?? 0,
    platform_fee_percent: get('fees').platform_fee_percent ?? 0,
  });
  const [limits, setLimits] = useState({
    min_investment: get('limits').min_investment ?? 0,
  });
  const [maintenance, setMaintenance] = useState(!!get('maintenance').is_active);

  const save = async (key: string, value: any) => {
    setLoading(key);
    setSaved(null);
    const { error } = await supabase.from('platform_settings').update({ value }).eq('key', key);
    setLoading(null);
    if (error) alert(error.message);
    else {
      setSaved(key);
      setTimeout(() => setSaved(null), 2500);
      router.refresh();
    }
  };

  const numField = (
    label: string, value: number, onChange: (v: number) => void, suffix?: string
  ) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <Input
          type="number" dir="ltr" value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value) || 0)}
          className="rounded-xl"
        />
        {suffix && <span className="text-xs text-muted-foreground shrink-0">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hero stats shown on landing */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {isAr ? 'إحصائيات الصفحة الرئيسية' : 'Landing Page Stats'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {numField(isAr ? 'قضايا تم تمويلها' : 'Cases funded', heroStats.cases_funded, (v) => setHeroStats({ ...heroStats, cases_funded: v }))}
          {numField(isAr ? 'حجم التمويل (ر.س)' : 'Funded volume (SAR)', heroStats.funded_volume, (v) => setHeroStats({ ...heroStats, funded_volume: v }))}
          {numField(isAr ? 'متوسط أيام المراجعة' : 'Avg review days', heroStats.avg_review_days, (v) => setHeroStats({ ...heroStats, avg_review_days: v }))}
          {numField(isAr ? 'مجتمع المستثمرين' : 'Investor community', heroStats.investor_community, (v) => setHeroStats({ ...heroStats, investor_community: v }))}
          <Button onClick={() => save('hero_stats', heroStats)} disabled={loading === 'hero_stats'} className="rounded-full">
            <Save className="w-4 h-4 me-2" />
            {saved === 'hero_stats' ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ' : 'Save')}
          </Button>
        </CardContent>
      </Card>

      {/* Fees */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-gold" />
            {isAr ? 'الرسوم' : 'Fees'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {numField(isAr ? 'رسوم النجاح %' : 'Success fee %', fees.success_fee_percent, (v) => setFees({ ...fees, success_fee_percent: v }), '%')}
          {numField(isAr ? 'رسوم المنصة %' : 'Platform fee %', fees.platform_fee_percent, (v) => setFees({ ...fees, platform_fee_percent: v }), '%')}
          <Button onClick={() => save('fees', fees)} disabled={loading === 'fees'} className="rounded-full">
            <Save className="w-4 h-4 me-2" />
            {saved === 'fees' ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ' : 'Save')}
          </Button>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-indigo" />
            {isAr ? 'الحدود' : 'Limits'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {numField(isAr ? 'الحد الأدنى للاستثمار (ر.س)' : 'Minimum investment (SAR)', limits.min_investment, (v) => setLimits({ min_investment: v }))}
          <Button onClick={() => save('limits', limits)} disabled={loading === 'limits'} className="rounded-full">
            <Save className="w-4 h-4 me-2" />
            {saved === 'limits' ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ' : 'Save')}
          </Button>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-coral" />
            {isAr ? 'وضع الصيانة' : 'Maintenance Mode'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isAr
              ? 'عند التفعيل تظهر للزوار رسالة صيانة بدلاً من المحتوى.'
              : 'When enabled, visitors see a maintenance notice instead of content.'}
          </p>
          <button
            onClick={() => setMaintenance(!maintenance)}
            className={`relative w-14 h-8 rounded-full transition-colors ${maintenance ? 'bg-coral' : 'bg-muted'}`}
            role="switch" aria-checked={maintenance}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all ${maintenance ? 'start-7' : 'start-1'}`} />
          </button>
          <div>
            <Button
              onClick={() => save('maintenance', { is_active: maintenance })}
              disabled={loading === 'maintenance'}
              variant={maintenance ? 'destructive' : 'default'}
              className="rounded-full"
            >
              <Save className="w-4 h-4 me-2" />
              {saved === 'maintenance' ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ' : 'Save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
