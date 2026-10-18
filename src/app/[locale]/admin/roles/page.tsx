import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RolesClientView from '@/components/dashboard/RolesClientView';

export default async function RolesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch all users/profiles
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: roles } = await supabase.from('roles').select('*').order('created_at');
  const { data: permissions } = await supabase.from('permissions').select('*').order('group');
  const { data: role_permissions } = await supabase.from('role_permissions').select('*');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {locale === 'ar' ? 'منشئ الصلاحيات (Roles Builder)' : 'Roles & Permissions Builder'}
        </h1>
      </div>

      <RolesClientView 
        locale={locale} 
        users={users || []} 
        initialRoles={roles || []}
        permissions={permissions || []}
        rolePermissions={role_permissions || []}
      />
    </div>
  );
}
