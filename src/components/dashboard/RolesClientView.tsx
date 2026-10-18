'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, ShieldCheck, Plus, KeyRound, Eye } from 'lucide-react';
import Link from 'next/link';

const USER_TYPE: Record<string, { ar: string; en: string }> = {
  investor: { ar: 'مستثمر', en: 'Investor' },
  applicant: { ar: 'صاحب قضية', en: 'Applicant' },
  staff: { ar: 'فريق العمل', en: 'Staff' },
};

export default function RolesClientView({
  locale,
  users,
  initialRoles,
  permissions,
  rolePermissions,
}: {
  locale: string;
  users: any[];
  initialRoles: any[];
  permissions: any[];
  rolePermissions: any[];
}) {
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [newRoleAr, setNewRoleAr] = useState('');
  const [newRoleEn, setNewRoleEn] = useState('');
  const [newRoleSlug, setNewRoleSlug] = useState('');

  const router = useRouter();
  const supabase = createClient();

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    setLoading(true);
    const { error } = await supabase.rpc('admin_set_user_role', { p_user_id: userId, p_role_id: newRoleId || null });
    setLoading(false);
    if (error) alert(error.message);
    else router.refresh();
  };

  const handleKycChange = async (userId: string, newStatus: string) => {
    setLoading(true);
    const { error } = await supabase.rpc('admin_set_kyc_status', { p_user_id: userId, p_status: newStatus });
    setLoading(false);
    if (error) alert(error.message);
    else router.refresh();
  };

  const handleCreateRole = async () => {
    if (!newRoleAr || !newRoleEn || !newRoleSlug) return alert(isAr ? 'كل الحقول مطلوبة' : 'All fields required');
    setLoading(true);
    const { error } = await supabase.rpc('admin_create_role', {
      p_name_ar: newRoleAr,
      p_name_en: newRoleEn,
      p_slug: newRoleSlug,
    });
    setLoading(false);
    if (error) alert(error.message);
    else {
      setNewRoleAr(''); setNewRoleEn(''); setNewRoleSlug('');
      router.refresh();
    }
  };

  const handleSavePermissions = async (roleId: string) => {
    const checkboxes = document.querySelectorAll(`input[data-role="${roleId}"]:checked`) as NodeListOf<HTMLInputElement>;
    const keys = Array.from(checkboxes).map((cb) => cb.value);
    setLoading(true);
    const { error } = await supabase.rpc('admin_set_role_permissions', {
      p_role_id: roleId,
      p_permission_keys: keys,
    });
    setLoading(false);
    if (error) alert(error.message);
    else {
      alert(isAr ? 'تم حفظ الصلاحيات بنجاح' : 'Permissions saved successfully');
      router.refresh();
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.group]) acc[perm.group] = [];
    acc[perm.group].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface border border-border/70">
        {([
          { key: 'users', label: isAr ? 'المستخدمون' : 'Users', icon: Users },
          { key: 'roles', label: isAr ? 'الأدوار والصلاحيات' : 'Roles & Permissions', icon: ShieldCheck },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-full transition-colors ${
              activeTab === tab.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{isAr ? 'إدارة المستخدمين' : 'User Management'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-start font-semibold py-3 pe-4">{isAr ? 'المستخدم' : 'User'}</th>
                    <th className="text-start font-semibold py-3 pe-4">{isAr ? 'النوع' : 'Type'}</th>
                    <th className="text-start font-semibold py-3 pe-4">{isAr ? 'الدور' : 'Role'}</th>
                    <th className="text-start font-semibold py-3">{isAr ? 'حالة التوثيق' : 'KYC Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const name = (isAr ? user.full_name_ar : user.full_name_en) || user.full_name_ar || user.email || '—';
                    const ut = USER_TYPE[user.user_type];
                    return (
                      <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors">
                        <td className="py-3 pe-4">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-full bg-primary/10 border border-primary/10 overflow-hidden flex items-center justify-center text-primary font-extrabold text-sm shrink-0">
                              {user.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                String(name).trim().charAt(0)
                              )}
                            </span>
                            <div className="min-w-0">
                              <Link href={`/${locale}/admin/users/${user.id}`} className="font-semibold truncate block hover:text-primary hover:underline transition-colors">
                                {name}
                              </Link>
                              <div className="text-xs text-muted-foreground truncate" dir="ltr">{user.email || user.id}</div>
                            </div>
                            <Link
                              href={`/${locale}/admin/users/${user.id}`}
                              title={isAr ? 'عرض الحساب الكامل' : 'View full account'}
                              className="w-7 h-7 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-colors shrink-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                        <td className="py-3 pe-4">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                            {ut ? (isAr ? ut.ar : ut.en) : user.user_type}
                          </span>
                        </td>
                        <td className="py-3 pe-4">
                          <select
                            disabled={loading}
                            value={user.role_id || ''}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="p-2 border border-border rounded-xl bg-card text-sm w-full max-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">{isAr ? '— بدون دور —' : '— No role —'}</option>
                            {initialRoles.map((r) => (
                              <option key={r.id} value={r.id}>{isAr ? r.name_ar : r.name_en}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3">
                          <select
                            disabled={loading}
                            value={user.kyc_status || 'pending'}
                            onChange={(e) => handleKycChange(user.id, e.target.value)}
                            className={`p-2 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                              user.kyc_status === 'verified' ? 'text-primary font-bold' : ''
                            }`}
                          >
                            <option value="pending">{isAr ? 'قيد التوثيق' : 'Pending'}</option>
                            <option value="verified">{isAr ? 'موثق' : 'Verified'}</option>
                            <option value="rejected">{isAr ? 'مرفوض' : 'Rejected'}</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Create role */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {isAr ? 'إضافة دور جديد' : 'Create New Role'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">{isAr ? 'الاسم (عربي)' : 'Name (AR)'}</label>
                  <Input value={newRoleAr} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoleAr(e.target.value)} placeholder="مدير" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">{isAr ? 'الاسم (إنجليزي)' : 'Name (EN)'}</label>
                  <Input dir="ltr" value={newRoleEn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoleEn(e.target.value)} placeholder="Manager" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">{isAr ? 'المعرف (Slug)' : 'Slug'}</label>
                  <Input dir="ltr" value={newRoleSlug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoleSlug(e.target.value)} placeholder="manager" className="rounded-xl" />
                </div>
                <Button disabled={loading} onClick={handleCreateRole} className="rounded-full">
                  {isAr ? 'إنشاء الدور' : 'Create Role'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Roles matrix */}
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-6">
                {/* Role list */}
                <div className="md:col-span-1 space-y-2 md:border-e md:pe-4 border-border/60">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    {isAr ? 'الأدوار' : 'Roles'}
                  </h3>
                  {initialRoles.map((role) => {
                    const userCount = users.filter((u) => u.role_id === role.id).length;
                    return (
                      <div
                        key={role.id}
                        className={`p-3 rounded-2xl cursor-pointer border transition-colors ${
                          selectedRole === role.id
                            ? 'bg-primary/10 border-primary'
                            : 'border-border/60 hover:bg-surface hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <div className="font-bold text-sm">{isAr ? role.name_ar : role.name_en}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {userCount} {isAr ? 'مستخدم' : 'users'}
                          {role.is_system && <span className="ms-1 opacity-60">· {isAr ? 'نظام' : 'system'}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Permissions matrix */}
                <div className="md:col-span-3">
                  {selectedRole ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-border/60 pb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-gold" />
                          {isAr ? 'صلاحيات الدور' : 'Role Permissions'}
                        </h3>
                        <Button onClick={() => handleSavePermissions(selectedRole)} disabled={loading} className="rounded-full">
                          {isAr ? 'حفظ الصلاحيات' : 'Save Permissions'}
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.keys(groupedPermissions).map((group) => (
                          <div key={group} className="border border-border/60 p-4 rounded-2xl bg-surface/60">
                            <h4 className="font-bold text-sm mb-3 capitalize text-muted-foreground">{group}</h4>
                            <div className="space-y-2.5">
                              {groupedPermissions[group].map((perm: any) => {
                                const isChecked = rolePermissions.some(
                                  (rp) => rp.role_id === selectedRole && rp.permission_id === perm.id
                                );
                                return (
                                  <label key={perm.id} className="flex items-center gap-2.5 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      value={perm.key}
                                      data-role={selectedRole}
                                      defaultChecked={isChecked}
                                      className="w-4 h-4 accent-primary"
                                    />
                                    <span className="text-sm font-medium group-hover:text-foreground">
                                      {isAr ? perm.label_ar : perm.label_en}
                                      <span className="block text-[10px] text-muted-foreground font-mono" dir="ltr">{perm.key}</span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full min-h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                      {isAr ? 'اختر دوراً من القائمة لعرض صلاحياته' : 'Select a role to view its permissions'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
