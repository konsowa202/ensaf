import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SettingsClientView from '@/components/dashboard/SettingsClientView';

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: canManage }, { data: isAdmin }] = await Promise.all([
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'settings.manage' }),
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'admin.access' }),
  ]);
  if (!canManage && !isAdmin) {
    redirect(`/${locale}/403`);
  }

  const { data: settings } = await supabase.from('platform_settings').select('key, value');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {locale === 'ar' ? 'إعدادات المنصة' : 'Platform Settings'}
        </h1>
      </div>

      <SettingsClientView locale={locale} settings={settings || []} />
    </div>
  );
}
