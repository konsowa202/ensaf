import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CmsClientView from '@/components/dashboard/CmsClientView';

export default async function CmsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch all CMS content
  const { data: faqs } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true });
  const { data: partners } = await supabase.from('partners').select('*').order('sort_order', { ascending: true });
  const { data: clients } = await supabase.from('clients').select('*').order('sort_order', { ascending: true });
  const { data: comments } = await supabase.from('comments').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {locale === 'ar' ? 'إدارة المحتوى (CMS)' : 'Content Management (CMS)'}
        </h1>
      </div>

      <CmsClientView 
        locale={locale} 
        faqs={faqs || []} 
        partners={partners || []} 
        clients={clients || []} 
        comments={comments || []}
      />
    </div>
  );
}
