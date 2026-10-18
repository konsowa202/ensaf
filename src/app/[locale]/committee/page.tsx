import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CommitteeClientView from '@/components/dashboard/CommitteeClientView';

export default async function CommitteePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Who can do what: analysts (cases.manage) advance stages, committee
  // members (cases.approve) issue decisions. Admins can do both.
  const [{ data: canApprove }, { data: canManage }, { data: isAdmin }] = await Promise.all([
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'cases.approve' }),
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'cases.manage' }),
    supabase.rpc('has_permission', { uid: user.id, perm_key: 'admin.access' }),
  ]);
  if (!canApprove && !canManage && !isAdmin) {
    redirect(`/${locale}/403`);
  }

  // Fetch cases pending review
  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .in('status', ['submitted', 'under_review', 'committee_review']);

  // Attach uploaded documents (with signed URLs) to each case so the
  // committee can review evidence before deciding.
  const caseIds = (cases || []).map((c) => c.id);
  const { data: docs } = caseIds.length
    ? await supabase.from('case_documents').select('*').in('case_id', caseIds).order('created_at', { ascending: false })
    : { data: [] as any[] };

  const docsByCase: Record<string, any[]> = {};
  for (const d of docs || []) {
    const { data: signed } = await supabase.storage.from('case-documents').createSignedUrl(d.file_path, 3600);
    (docsByCase[d.case_id] ||= []).push({ ...d, url: signed?.signedUrl || null });
  }

  const enriched = (cases || []).map((c) => ({ ...c, documents: docsByCase[c.id] || [] }));

  // Recently decided cases — so reviewers can always go back to the full file
  const { data: decided } = await supabase
    .from('cases')
    .select('id, case_number, title_ar, title_en, status, committee_decision, reviewed_at, updated_at')
    .in('status', ['approved', 'rejected', 'funding_open', 'funded', 'in_litigation', 'settled', 'won', 'lost', 'closed'])
    .order('updated_at', { ascending: false })
    .limit(12);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {locale === 'ar' ? 'اللجنة القضائية' : 'Judicial Committee'}
        </h1>
      </div>

      <CommitteeClientView
        locale={locale}
        cases={enriched}
        decidedCases={decided || []}
        user={user}
        canReview={!!(canApprove || isAdmin)}
        canAdvance={!!(canManage || canApprove || isAdmin)}
      />
    </div>
  );
}
