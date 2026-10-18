import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicantClientView from './ApplicantClientView';

export default async function ApplicantDashboard({ locale, profile }: { locale: string, profile: any }) {
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch applicant's cases
  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq('applicant_id', user!.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">
          {locale === 'ar' ? `مرحباً، ${profile.full_name_ar}` : `Welcome, ${profile.full_name_ar}`}
        </h1>
      </div>

      <ApplicantClientView locale={locale} cases={cases || []} />
    </div>
  );
}
