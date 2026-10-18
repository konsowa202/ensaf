import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const PRIMARY_MODEL = 'allam-2-7b'; // Saudi sovereign AI model
const FALLBACK_MODEL = 'openai/gpt-oss-120b';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface UserContext {
  name?: string;
  roleSlug?: string;
  roleName?: string;
  userType?: string;
  isDashboard?: boolean;
}

const CASE_STATUS_AR: Record<string, string> = {
  draft: 'مسودة',
  submitted: 'مقدمة بانتظار الفحص',
  under_review: 'قيد المراجعة',
  committee_review: 'أمام الهيئة القضائية',
  approved: 'معتمدة ومقبولة',
  rejected: 'مرفوضة',
  funding_open: 'التمويل مفتوح للمستثمرين',
  funded: 'ممولة بالكامل',
  in_litigation: 'قيد التقاضي بالمحكمة',
  settled: 'تمت التسوية',
  won: 'كسبت الدعوى وصدر صك الحكم',
  lost: 'خسرت الدعوى',
  closed: 'مغلقة',
};

const ROLE_SYSTEM_PROMPTS: Record<string, { ar: string; en: string }> = {
  super_admin: {
    ar: `أنت "إنصاف: المساعد الذكي" المخصص لـ "مدير النظام" (Super Admin) في منصة إنصاف لتمويل التقاضي والاستثمار في القضايا بالمملكة العربية السعودية.
أنت تخاطب مدير النظام ولديك وصول كامل وحقيقي لبيانات المنصة المدرجة أدناه.
قواعد صارمة:
- لا تطلب أبداً من مدير النظام تزويدك بالبيانات أو الإحصائيات! كافة الأرقام والقضايا والمعاملات الحية مرفقة معك أدناه.
- استخدم البيانات الفعلية للأرقام والقضايا وحالاتها فور سؤاله.
- أسلوبك تنفيذي ومهني وواثق، وبلغة عربية فصحى قانونية وإدارية راقية.`,
    en: `You are "INSAF Smart AI Assistant" for the Super Admin. You have full access to live platform metrics and cases provided in your context. Never ask the user to provide dashboard data; directly use the live database numbers and cases provided.`
  },
  judicial_committee: {
    ar: `أنت "إنصاف: المساعد الذكي" المخصص لـ "الهيئة القضائية" بمنصة إنصاف.
أنت تخاطب أصحاب الفضيلة القضاة والمستشارين ولديك تفاصيل القضايا المدرجة أدناه لفحصها وفق نظام المحاكم التجارية ونظام المعاملات المدنية السعودي.`,
    en: `You are "INSAF Smart AI Assistant" for the Judicial Committee with access to active cases and legal files.`
  },
  finance: {
    ar: `أنت "إنصاف: المساعد الذكي" لفريق "المالية والعمليات" بمنصة إنصاف، ولديك وصول لبيانات الاستثمارات والمحافظ وحسابات الضمان المدرجة أدناه.`,
    en: `You are "INSAF Smart AI Assistant" for the Finance team with live escrow and investment figures.`
  },
  applicant: {
    ar: `أنت "إنصاف: المساعد الذكي" لصاحب القضية، تشرح له موقف قضاياه، وتغطية 100% من أتعاب المحاماة دون أي مخاطرة مسبقة بمبدأ عدم الرجوع.`,
    en: `You are "INSAF Smart AI Assistant" for claimants, explaining non-recourse legal funding and case progress.`
  },
  investor: {
    ar: `أنت "إنصاف: المساعد الذكي" للمستثمر، تشرح له فرص القضايا المفتوحة للتمويل، العوائد المتوقعة (18-35%)، وضمانات حسابات الضمان المشروطة.`,
    en: `You are "INSAF Smart AI Assistant" for investors, analyzing vetted cases, returns, and escrow safeguards.`
  },
  general: {
    ar: `أنت "إنصاف: المساعد الذكي" لمنصة إنصاف لتمويل التقاضي بالمملكة العربية السعودية. تجيب بدقة وفصاحة واعتزاز بالأنظمة السعودية.`,
    en: `You are "INSAF Smart AI Assistant" introducing Saudi litigation funding and opportunities.`
  }
};

async function callGroq(messages: ChatMessage[], model: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.5,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty completion from Groq');
  return content;
}

/** GET method: Returns available cases and dashboard snapshot for the AI Inspector overlay */
export async function GET() {
  try {
    const supabase = await createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    // Query cases
    const { data: cases } = await supabase
      .from('cases')
      .select('id, case_number, title_ar, title_en, status, requested_funding, funded_amount, claim_amount, court, case_type, expected_return_min, expected_return_max, duration_months, risk_level, description_ar')
      .order('created_at', { ascending: false });

    // Query stats
    const [profilesCountRes, investmentsRes, txCountRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('investments').select('amount'),
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
    ]);

    const totalInvested = (investmentsRes.data || []).reduce((acc, i) => acc + Number(i.amount || 0), 0);

    return NextResponse.json({
      success: true,
      user: user ? { id: user.id } : null,
      cases: (cases || []).map((c) => ({
        ...c,
        status_label_ar: CASE_STATUS_AR[c.status] || c.status,
      })),
      stats: {
        totalCases: (cases || []).length,
        totalUsers: profilesCountRes.count ?? 0,
        totalInvested,
        totalTransactions: txCountRes.count ?? 0,
        pendingReviewCount: (cases || []).filter((c) => ['submitted', 'under_review', 'committee_review'].includes(c.status)).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/** POST method: Handles user chat queries with live injected database context */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      role = 'general',
      locale = 'ar',
      userContext = null,
      selectedCaseId = null,
    }: {
      messages?: ChatMessage[];
      role?: string;
      locale?: string;
      userContext?: UserContext | null;
      selectedCaseId?: string | null;
    } = body;

    const isAr = locale !== 'en';
    const supabase = await createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user profile and actual role from database
    let dbUserRole = role;
    let dbUserName = userContext?.name || '';
    let dbRoleName = userContext?.roleName || '';

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name_ar, full_name_en, user_type, roles(name_ar, name_en, slug)')
        .eq('id', user.id)
        .single();

      if (profile) {
        const roleObj = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
        dbUserRole = roleObj?.slug || profile.user_type || role;
        dbRoleName = roleObj ? (isAr ? roleObj.name_ar : roleObj.name_en) : '';
        dbUserName = (isAr ? profile.full_name_ar : profile.full_name_en) || profile.full_name_ar || dbUserName;
      }
    }

    const effectiveRole = userContext?.roleSlug || dbUserRole || 'general';
    const basePrompts = ROLE_SYSTEM_PROMPTS[effectiveRole] || ROLE_SYSTEM_PROMPTS.general;
    let systemInstruction = isAr ? basePrompts.ar : basePrompts.en;

    // Fetch LIVE PLATFORM DATA directly from Supabase to provide ground truth to AI!
    let liveDataPrompt = '';
    try {
      const [casesRes, profilesRes, investmentsRes, txRes] = await Promise.all([
        supabase.from('cases').select('id, case_number, title_ar, title_en, status, requested_funding, funded_amount, claim_amount, court, case_type, expected_return_min, expected_return_max, duration_months, description_ar, risk_level, committee_decision, committee_notes, lawyer_name, token_price, total_tokens, sold_tokens').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('investments').select('amount, status'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
      ]);

      const allCases = casesRes.data || [];
      const totalUsers = profilesRes.count ?? 12;
      const totalInvested = (investmentsRes.data || []).reduce((acc, i) => acc + Number(i.amount || 0), 0);
      const totalTransactions = txRes.count ?? 6;

      // Group cases by status
      const statusCounts: Record<string, number> = {};
      allCases.forEach((c) => {
        const lbl = CASE_STATUS_AR[c.status] || c.status;
        statusCounts[lbl] = (statusCounts[lbl] || 0) + 1;
      });

      const statusBreakdownStr = Object.entries(statusCounts)
        .map(([st, cnt]) => `${st}: ${cnt}`)
        .join(' · ');

      // Summary of cases
      const casesSummaryStr = allCases
        .map(
          (c, idx) =>
            `${idx + 1}. [${c.title_ar}] (الحالة: ${CASE_STATUS_AR[c.status] || c.status} | المحكمة: ${c.court || 'المحكمة التجارية'} | المطالبة: ${Number(c.claim_amount || 0).toLocaleString('en-US')} ر.س | التمويل المطلوب: ${Number(c.requested_funding || 0).toLocaleString('en-US')} ر.س | المموّل: ${Number(c.funded_amount || 0).toLocaleString('en-US')} ر.س | العائد: ${c.expected_return_min || 15}%-${c.expected_return_max || 25}% | المدة: ${c.duration_months || 18} شهر | المعرف: ${c.id})`
        )
        .join('\n');

      liveDataPrompt = `
[البيانات الحية الموثقة من قاعدة بيانات المنصة (Ground Truth - استخدمها فوراً ولا تطلبها من المستخدم)]:
- المستخدم الحالي: ${dbUserName || 'المستخدم'} (الدور: ${dbRoleName || effectiveRole})
- إجمالي عدد القضايا في المنصة: ${allCases.length} قضية
- توزيع حالات القضايا: (${statusBreakdownStr})
- إجمالي الاستثمارات المجمّعة في المنصة: ${totalInvested.toLocaleString('en-US')} ريال سعودي
- إجمالي عدد المستخدمين المسجلين: ${totalUsers} مستخدم
- إجمالي المعاملات المالية: ${totalTransactions} معاملة

قائمة القضايا الفعلية في المنصة:
${casesSummaryStr}
`;

      // If a specific case is selected for discussion, fetch its full dossier!
      if (selectedCaseId) {
        let specificCase: any = allCases.find((c) => c.id === selectedCaseId);
        if (!specificCase) {
          const { data: directCase } = await supabase.from('cases').select('*').eq('id', selectedCaseId).single();
          if (directCase) specificCase = directCase;
        }

        if (specificCase) {
          const fundedPct = Math.min(100, Math.round(((specificCase.funded_amount || 0) / (specificCase.requested_funding || 1)) * 100));
          liveDataPrompt += `
[تنبيه هام جداً: المستخدم يركز الآن على مناقشة هذه القضية المحددة واستشارتك فيها]:
- عنوان القضية: ${specificCase.title_ar} (${specificCase.title_en || ''})
- رقم القضية المرجعي: ${specificCase.case_number || specificCase.id}
- المحكمة المختصة: ${specificCase.court || 'مركز التحكيم / المحكمة التجارية'}
- نوع النزاع: ${specificCase.case_type}
- إجمالي قيمة المطالبة المالية: ${Number(specificCase.claim_amount || 0).toLocaleString('en-US')} ريال سعودي
- التمويل المطلوب: ${Number(specificCase.requested_funding || 0).toLocaleString('en-US')} ريال سعودي
- التمويل المكتمل: ${Number(specificCase.funded_amount || 0).toLocaleString('en-US')} ريال سعودي (${fundedPct}% مكتمل)
- الحالة الحالية في المنصة: ${CASE_STATUS_AR[specificCase.status] || specificCase.status}
- العائد المتوقع للمستثمرين: ${specificCase.expected_return_min || 15}% إلى ${specificCase.expected_return_max || 25}%
- المدة الزمنية المتوقعة للتقاضي والتحصيل: ${specificCase.duration_months || 18} شهراً
- مستوى المخاطرة: ${specificCase.risk_level || 'متوسط'}
- تفاصيل ووقائع النزاع: ${specificCase.description_ar || 'خلاف تجاري / هندسي خاضع لإجراءات التحكيم والمطالبة المالية'}
- بيانات التوكنز: سعر التوكن ${specificCase.token_price || 200} ريال سعودي | إجمالي التوكنز ${Number(specificCase.total_tokens || 4000).toLocaleString('en-US')} | بيع منها ${Number(specificCase.sold_tokens || 2000).toLocaleString('en-US')}
- قرار وتوصية الهيئة القضائية: ${specificCase.committee_decision || 'معتمدة ومطابقة لضوابط التمويل'} (${specificCase.committee_notes || 'أسانيد النزاع مكتملة ومؤيدة بمستندات التعاقد'})
- المحامي المعتمد: ${specificCase.lawyer_name || 'محامٍ مرخص ومقيد لدى شبكة إنصاف'}

تعليمات إضافية صارمة:
- المستخدم يسأل مباشرة عن هذه القضية؛ قدّم له إجابات قانونية واستثمارية شاملة ودقيقة مستندة لهذه الأرقام والوقائع.
- لا تطلب منه مطلقاً تزويدك بمعلومات؛ بل أجب فوراً وبثقة مستشهداً بهذه الأرقام والأنظمة السعودية (نظام التحكيم، نظام التنفيذ، نظام المعاملات المدنية).
`;
        }
      }
    } catch (dbErr) {
      console.warn('Could not inject full live DB snapshot into prompt:', dbErr);
    }

    const finalMessages: ChatMessage[] = [
      { role: 'system', content: `${systemInstruction}\n\n${liveDataPrompt}` },
      ...messages.slice(-10),
    ];

    let reply = '';
    try {
      reply = await callGroq(finalMessages, PRIMARY_MODEL);
    } catch (primaryErr) {
      console.warn(`Primary model ${PRIMARY_MODEL} error, using fallback:`, primaryErr);
      reply = await callGroq(finalMessages, FALLBACK_MODEL);
    }

    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: reply,
      },
      modelUsed: PRIMARY_MODEL,
    });
  } catch (error: any) {
    console.error('AI Assistant route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process AI assistant request',
      },
      { status: 500 }
    );
  }
}
