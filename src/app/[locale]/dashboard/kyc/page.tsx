import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import KycClientView from '@/components/dashboard/KycClientView';

export default async function KycPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: allowed } = await supabase.rpc('has_permission', { uid: user.id, perm_key: 'users.manage' });
  if (!allowed) redirect(`/${locale}/dashboard`);

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name_ar, full_name_en, email, user_type, kyc_status, national_id, created_at')
    .neq('kyc_status', 'verified')
    .neq('user_type', 'staff')
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{isAr ? 'طلبات توثيق الهوية' : 'KYC Verification Queue'}</h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? 'راجع بيانات المستخدمين واعتمد أو ارفض توثيقهم' : 'Review user data and approve or reject their verification'}
        </p>
      </div>
      <Card className="rounded-3xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {isAr ? `بانتظار المراجعة (${users?.length || 0})` : `Pending (${users?.length || 0})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KycClientView locale={locale} users={users || []} />
        </CardContent>
      </Card>
    </div>
  );
}
