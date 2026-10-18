import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, Activity } from 'lucide-react';

const ACTION_LABELS: Record<string, { ar: string; en: string }> = {
  case_payout: { ar: 'صرف عوائد قضية', en: 'Case payout' },
  login: { ar: 'تسجيل دخول', en: 'Login' },
  case_status: { ar: 'تغيير حالة قضية', en: 'Case status change' },
};

export default async function AuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: canAudit }, { data: isAdmin }] = await Promise.all([
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'audit.view' }),
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'admin.access' }),
  ]);
  if (!canAudit && !isAdmin) {
    redirect(`/${locale}/403`);
  }

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('id, actor_id, action, entity, entity_id, metadata, ip, created_at, profiles(full_name_ar, full_name_en, email)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {isAr ? 'سجل التدقيق' : 'Audit Log'}
        </h1>
      </div>

      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" />
            {isAr ? 'آخر الأحداث' : 'Recent Events'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Activity className="w-7 h-7" />
              </div>
              <p className="text-muted-foreground text-sm">
                {isAr ? 'لا توجد أحداث مسجلة بعد.' : 'No events recorded yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log: any) => {
                const prof = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
                const actor = (isAr ? prof?.full_name_ar : prof?.full_name_en) || prof?.full_name_ar || prof?.email || (isAr ? 'النظام' : 'System');
                const actionLabel = ACTION_LABELS[log.action];
                return (
                  <div key={log.id} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
                    <span className="w-9 h-9 rounded-xl bg-surface border border-border/60 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">
                        <span className="font-bold">{actor}</span>
                        <span className="text-muted-foreground"> · </span>
                        <span className="font-semibold text-primary">
                          {actionLabel ? (isAr ? actionLabel.ar : actionLabel.en) : log.action}
                        </span>
                        <span className="text-muted-foreground"> · {log.entity}</span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-[11px] text-muted-foreground font-mono mt-1 truncate" dir="ltr">
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                    <div className="text-end shrink-0">
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                      </div>
                      <div className="text-[11px] text-muted-foreground/70">
                        {new Date(log.created_at).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
