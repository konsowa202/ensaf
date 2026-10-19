'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  X,
  Send,
  RefreshCw,
  Scale,
  Briefcase,
  Building2,
  FileText,
  User,
  Copy,
  Check,
  ChevronDown,
  Volume2,
  VolumeX,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Settings,
  Landmark,
  Coins,
  Search,
  Layers,
  BarChart3,
  ExternalLink,
  Target
} from 'lucide-react';

export type AssistantRole =
  | 'super_admin'
  | 'judicial_committee'
  | 'finance'
  | 'applicant'
  | 'investor'
  | 'lawyer'
  | 'corporate'
  | 'general';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserContext {
  name?: string;
  roleSlug?: string;
  roleName?: string;
  userType?: string;
  isDashboard?: boolean;
}

interface CaseItem {
  id: string;
  case_number?: string;
  title_ar: string;
  title_en?: string;
  status: string;
  status_label_ar?: string;
  requested_funding: number;
  funded_amount: number;
  claim_amount?: number;
  court?: string;
  case_type?: string;
}

interface DashboardStats {
  totalCases: number;
  totalUsers: number;
  totalInvested: number;
  totalTransactions: number;
  pendingReviewCount: number;
}

interface RoleConfig {
  id: AssistantRole;
  titleAr: string;
  titleEn: string;
  icon: any;
  greetingAr: (name?: string) => string;
  greetingEn: (name?: string) => string;
  suggestionsAr: string[];
  suggestionsEn: string[];
}

const ROLES: RoleConfig[] = [
  {
    id: 'super_admin',
    titleAr: 'مدير النظام',
    titleEn: 'Super Admin',
    icon: Settings,
    greetingAr: (name) =>
      `أهلاً بك يا سعادة مدير النظام ${name ? `أ. ${name}` : ''}. أنا "إنصاف: المساعد الذكي" لإدارة المنصة، ومتاح لدي الآن كافة البيانات الحية للوحة التحكم والقضايا المسجلة. كيف أساعدك اليوم في إدارة القضايا، مراجعة العمليات، تدقيق حسابات الضمان أو الحوكمة النظامية؟`,
    greetingEn: (name) =>
      `Welcome Administrator ${name || ''}. I am INSAF AI Executive Copilot with full live access to platform cases and database metrics. How can I assist you with platform health, committee oversight, escrow audits, or compliance?`,
    suggestionsAr: [
      'ما هي القضايا التي بانتظار مراجعة الهيئة القضائية؟',
      'لخص لي إحصائيات وأرقام لوحة التحكم الحالية',
      'ما إجمالي مبالغ الاستثمار المجمّعة في المنصة حالياً؟',
      'ما هي مؤشرات الامتثال لنظام المعاملات المدنية وحماية البيانات؟'
    ],
    suggestionsEn: [
      'What cases are currently pending committee review?',
      'Summarize current dashboard metrics and active stats',
      'What is the total syndication volume on the platform?',
      'What are our regulatory compliance metrics under PDPL?'
    ]
  },
  {
    id: 'judicial_committee',
    titleAr: 'الهيئة القضائية',
    titleEn: 'Judicial Committee',
    icon: Scale,
    greetingAr: (name) =>
      `أهلاً بأصحاب الفضيلة والسعادة أعضاء الهيئة القضائية ${name ? `أ. ${name}` : ''}. قضايا المنصة الحالية متاحة لدي لفحصها وتلخيص وقائعها وفق نظام المحاكم التجارية والمعاملات المدنية.`,
    greetingEn: (name) =>
      `Welcome esteemed Judicial Committee members ${name || ''}. All active cases are accessible for claim summary, procedural analysis, and risk scoring.`,
    suggestionsAr: [
      'لخص لي أهم أسانيد دعوى منازعة المقاولات المعروضة',
      'ما هي شروط نفاذ صك السند التنفيذي لدى محاكم التنفيذ؟',
      'ما هي معايير تقدير نسبة احتمالية كسب الدعوى في المنصة؟',
      'كيف نصيغ مذكرة اعتماد القضية لطرحها للمستثمرين؟'
    ],
    suggestionsEn: [
      'Summarize key merits of the pending commercial claim',
      'What are enforcement requirements under Saudi execution courts?',
      'What criteria determine claim win probability scoring?',
      'Draft a committee approval memo for investor syndication'
    ]
  },
  {
    id: 'finance',
    titleAr: 'المالية والعمليات',
    titleEn: 'Finance & Escrow',
    icon: Landmark,
    greetingAr: (name) =>
      `مرحباً بفريق المالية ${name ? `أ. ${name}` : ''}. أنا مستشارك الذكي لحسابات الضمان، وتوزيع العوائد، ومطابقة القيود المالية للمنصة.`,
    greetingEn: (name) =>
      `Welcome Finance team ${name || ''}. I can assist with escrow reconciliation, disbursement schedules, and investor payout distributions.`,
    suggestionsAr: [
      'ما هي ضوابط صرف دفعات حسابات الضمان البنكية؟',
      'كيف يتم احتساب حصة المنصة من رسوم النجاح؟',
      'ما آلية توزيع مبالغ صك التنفيذ على المحافظ آلياً؟',
      'هل توجد معاملات معلقة بحاجة للتدقيق المالي؟'
    ],
    suggestionsEn: [
      'What are the escrow release criteria for lawyer fees?',
      'How is the platform success fee calculated?',
      'How are enforcement court awards auto-distributed to wallets?',
      'Are there pending transactions requiring ledger audit?'
    ]
  },
  {
    id: 'applicant',
    titleAr: 'صاحب قضية',
    titleEn: 'Claimant',
    icon: Scale,
    greetingAr: (name) =>
      `أهلاً بك ${name ? `أ. ${name}` : ''}! أنا "إنصاف: المساعد الذكي" لأصحاب القضايا. كيف أساعدك في تمويل دعواك وتغطية 100% من أتعاب المحاماة والخبراء دون أي مخاطرة مالية مسبقة؟`,
    greetingEn: (name) =>
      `Welcome ${name || ''}! I am INSAF Smart Assistant for claimants. How can I help you secure 100% upfront litigation funding with zero out-of-pocket risk?`,
    suggestionsAr: [
      'هل أتحمل أي تكاليف إذا خسرت القضية؟',
      'ما هي معايير قبول القضية للتمويل؟',
      'كيف تسير إجراءات التقديم والاعتماد؟',
      'هل تتدخل إنصاف في اختيار محامي الدعوى؟'
    ],
    suggestionsEn: [
      'Do I owe anything if the lawsuit is lost?',
      'What are the eligibility criteria for funding?',
      'How does the application and vetting process work?',
      'Can I choose my own lawyer?'
    ]
  },
  {
    id: 'investor',
    titleAr: 'مستثمر',
    titleEn: 'Investor',
    icon: Briefcase,
    greetingAr: (name) =>
      `مرحباً بك ${name ? `أ. ${name}` : ''}! أنا مستشارك الذكي للاستثمار في القضايا عبر إنصاف. كيف أساعدك في تحليل العوائد، دراسة الفرص، ومتابعة حسابات الضمان؟`,
    greetingEn: (name) =>
      `Greetings ${name || ''}! I am your AI advisor for litigation investments on INSAF. How can I assist with returns, due diligence, and escrow mechanisms?`,
    suggestionsAr: [
      'ما هو متوسط العائد السنوي المتوقع (IRR)؟',
      'كيف تضمن المنصة حماية رأس المال في حسابات الضمان؟',
      'هل التمويل متوافق مع الضوابط الشرعية؟',
      'ما هي معايير فحص وتقييم القضايا الاستثمارية؟'
    ],
    suggestionsEn: [
      'What is the typical expected ROI on funded cases?',
      'How does INSAF protect investor capital in escrow?',
      'Is litigation funding Sharia-compliant?',
      'What due diligence does the judicial committee perform?'
    ]
  },
  {
    id: 'lawyer',
    titleAr: 'محامٍ ومستشار',
    titleEn: 'Lawyer / Firm',
    icon: FileText,
    greetingAr: (name) =>
      `أهلاً بزميلنا المحامي ${name ? `أ. ${name}` : ''}. أنا هنا لتوضيح كيف تضمن إنصاف أتعابكم المهنية كاملة دون تأخير وبلا أي تدخل في استراتيجية الترافع.`,
    greetingEn: (name) =>
      `Welcome Counselor ${name || ''}. I am here to explain fee disbursements, partnership onboarding, and complete independence in your trial strategy.`,
    suggestionsAr: [
      'كيف يضمن تمويل إنصاف سداد أتعاب المحامي في وقتها؟',
      'كيف ينضم مكتبي إلى شبكة المحامين المعتمدة؟',
      'هل تتدخل إنصاف في مذكراتي واستراتيجية الترافع؟',
      'ما هي الضوابط المهنية المتبعة مع نظام المحاماة السعودي؟'
    ],
    suggestionsEn: [
      'How does INSAF guarantee on-time payment of legal fees?',
      'How can our law firm join the accredited network?',
      'Does INSAF interfere with trial strategy or legal briefs?',
      'How do you comply with the Saudi Code of Law Practice?'
    ]
  },
  {
    id: 'corporate',
    titleAr: 'شركات ومنشآت',
    titleEn: 'Corporate / SME',
    icon: Building2,
    greetingAr: (name) =>
      `حياكم الله ${name ? `أ. ${name}` : ''}. يسعدني توضيح كيف يحمي تمويل التقاضي السيولة النقدية لشركتكم من استنزاف النزاعات التجارية والمقاولات.`,
    greetingEn: (name) =>
      `Welcome ${name || ''}. I can demonstrate how litigation finance unlocks balance-sheet value and shields working capital during disputes.`,
    suggestionsAr: [
      'كيف نحمي ميزانية الشركة من تكاليف النزاعات الطويلة؟',
      'هل تمولون قضايا المقاولات ومنازعات العقود الكبرى؟',
      'ما الفرق بين تمويل التقاضي والتمويل البنكي التقليدي؟',
      'كيف نتعامل مع قضايا تحصيل الديون المتعثرة قضائياً؟'
    ],
    suggestionsEn: [
      'How does this preserve working capital during disputes?',
      'Do you finance construction and large contract claims?',
      'How does this differ from traditional bank credit?',
      'How does enforcement through Saudi commercial courts work?'
    ]
  },
  {
    id: 'general',
    titleAr: 'استفسار عام',
    titleEn: 'General Inquiry',
    icon: Sparkles,
    greetingAr: () =>
      'أهلاً بك في منصة إنصاف لتمويل التقاضي! أنا "إنصاف: المساعد الذكي"، جاهز للإجابة عن أي استفسار حول خدماتنا، الأنظمة القضائية، وضوابط التمويل والاستثمار.',
    greetingEn: () =>
      'Welcome to INSAF Litigation Funding Platform! I am "INSAF Smart Assistant", ready to answer questions about our judicial ecosystem and financing options.',
    suggestionsAr: [
      'ما هو تمويل التقاضي وكيف يعمل في السعودية؟',
      'هل المنصة متوافقة مع نظام المعاملات المدنية والشريعة؟',
      'ما هي أنواع القضايا التي تمولها إنصاف؟',
      'كيف أبدأ استخدام المنصة الآن؟'
    ],
    suggestionsEn: [
      'What is litigation finance and how does it work in Saudi Arabia?',
      'Is INSAF compliant with Saudi civil transaction laws?',
      'What types of commercial disputes does INSAF fund?',
      'How do I get started today?'
    ]
  }
];

interface InsafAiAssistantProps {
  locale: string;
  userContext?: UserContext | null;
}

export function InsafAiAssistant({ locale, userContext }: InsafAiAssistantProps) {
  const isAr = locale !== 'en';
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Inspector Overlay states
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const selectedCaseRef = useRef<CaseItem | null>(null);

  const [casesList, setCasesList] = useState<CaseItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [caseSearchTerm, setCaseSearchTerm] = useState('');

  // Resolved user context state (supports SSR prop and client-side fallback)
  const [currentUserContext, setCurrentUserContext] = useState<UserContext | null>(userContext || null);

  useEffect(() => {
    selectedCaseRef.current = selectedCase;
  }, [selectedCase]);

  // Client-side fallback to fetch user profile if userContext was not passed
  useEffect(() => {
    if (userContext) {
      setCurrentUserContext(userContext);
      return;
    }
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name_ar, full_name_en, user_type, roles(name_ar, name_en, slug)')
          .eq('id', user.id)
          .single();

        if (profile) {
          const roleObj = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
          const name =
            (isAr ? profile.full_name_ar : profile.full_name_en) ||
            profile.full_name_ar ||
            profile.full_name_en ||
            '';

          let roleName = roleObj ? (isAr ? roleObj.name_ar : roleObj.name_en) : '';
          if (!roleName) {
            if (profile.user_type === 'applicant') roleName = isAr ? 'صاحب قضية' : 'Claimant';
            else if (profile.user_type === 'investor') roleName = isAr ? 'مستثمر' : 'Investor';
            else roleName = isAr ? 'مستخدم المنصة' : 'User';
          }

          const ctx: UserContext = {
            name,
            roleSlug: roleObj?.slug || profile.user_type || 'applicant',
            roleName,
            userType: profile.user_type || 'applicant',
            isDashboard: true,
          };
          setCurrentUserContext(ctx);
          const match = ROLES.find((r) => r.id === ctx.roleSlug);
          if (match) setActiveRole(match.id);
        }
      } catch (err) {
        console.warn('Failed to resolve user session in InsafAiAssistant:', err);
      }
    };
    fetchUser();
  }, [userContext, isAr]);

  // Auto-detect role from userContext if logged in
  const defaultRole: AssistantRole = (() => {
    const slug = currentUserContext?.roleSlug || userContext?.roleSlug;
    if (slug) {
      const match = ROLES.find((r) => r.id === slug);
      if (match) return match.id;
    }
    const uType = currentUserContext?.userType || userContext?.userType;
    if (uType === 'applicant') return 'applicant';
    if (uType === 'investor') return 'investor';
    return 'general';
  })();

  const [activeRole, setActiveRole] = useState<AssistantRole>(defaultRole);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTypingMessageId, setActiveTypingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [unreadPrompt, setUnreadPrompt] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fullTextRef = useRef<Record<string, string>>({});

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      isTypingRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleSkipTyping = (msgId: string) => {
    if (isTyping && activeTypingMessageId === msgId) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      isTypingRef.current = false;
      const full = fullTextRef.current[msgId];
      if (full) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: full } : m))
        );
      }
      setIsTyping(false);
      setActiveTypingMessageId(null);
    }
  };

  const typeOutMessage = (
    msgId: string,
    fullText: string,
    onComplete?: () => void
  ) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    fullTextRef.current[msgId] = fullText;
    setIsTyping(true);
    setActiveTypingMessageId(msgId);
    isTypingRef.current = true;

    // Tokenize into words and spaces/newlines while preserving formatting
    const tokens = fullText.match(/\S+|\s+/g) || [fullText];
    let currentIndex = 0;
    let accumulated = '';

    const typeNextToken = () => {
      if (!isTypingRef.current || currentIndex >= tokens.length) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: fullText } : m))
        );
        setIsTyping(false);
        setActiveTypingMessageId(null);
        isTypingRef.current = false;
        onComplete?.();
        return;
      }

      const token = tokens[currentIndex];
      accumulated += token;
      currentIndex++;

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, content: accumulated } : m))
      );

      // Smooth scroll follows streaming response
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

      // Natural reading cadence (30ms - 40ms per word, slightly longer for punctuation)
      let delay = 32;
      if (token.includes('\n')) {
        delay = 75;
      } else if (
        token.endsWith('.') ||
        token.endsWith('؟') ||
        token.endsWith('?') ||
        token.endsWith('!')
      ) {
        delay = 90;
      } else if (
        token.endsWith('،') ||
        token.endsWith(',') ||
        token.endsWith(':')
      ) {
        delay = 50;
      }

      typingTimeoutRef.current = setTimeout(typeNextToken, delay);
    };

    typeNextToken();
  };

  const currentRoleConfig = ROLES.find((r) => r.id === activeRole) || ROLES[ROLES.length - 1];

  // Fetch available cases and stats
  useEffect(() => {
    const fetchCasesAndStats = async () => {
      try {
        const res = await fetch('/api/ai-assistant');
        const data = await res.json();
        if (data.success) {
          const list = data.cases || [];
          setCasesList(list);
          setDashboardStats(data.stats || null);

          // If on a specific case URL, auto-bind that case immediately!
          if (pathname) {
            const match = pathname.match(/\/(?:opportunities|cases)\/([a-zA-Z0-9-]+)/);
            if (match && match[1]) {
              const urlCase = list.find((c: CaseItem) => c.id === match[1]);
              if (urlCase && !selectedCaseRef.current) {
                setSelectedCase(urlCase);
                selectedCaseRef.current = urlCase;
              }
            }
          }
        }
      } catch (e) {
        console.warn('Failed to prefetch cases for inspector:', e);
      }
    };
    fetchCasesAndStats();
  }, [pathname]);

  // Auto-detect case from URL if pathname changes
  useEffect(() => {
    if (!pathname || casesList.length === 0) return;
    const match = pathname.match(/\/(?:opportunities|cases)\/([a-zA-Z0-9-]+)/);
    if (match && match[1]) {
      const urlId = match[1];
      const found = casesList.find((c) => c.id === urlId);
      if (found && (!selectedCaseRef.current || selectedCaseRef.current.id !== found.id)) {
        setSelectedCase(found);
        selectedCaseRef.current = found;
      }
    }
  }, [pathname, casesList]);

  // Update greeting on role switch or when userContext / selectedCase updates
  useEffect(() => {
    let greetingText = '';
    if (selectedCase) {
      greetingText = isAr
        ? `أهلاً بك! لقد ربطت محادثتنا بملف قضية "${selectedCase.title_ar}" (${selectedCase.court || 'مركز التحكيم'}${selectedCase.case_number ? ` - رقم ${selectedCase.case_number}` : ''}). كيف أساعدك اليوم في دراسة وقائعها، أو تدقيق الجدوى والعائد، أو الاستفسار عن ضمانات التنفيذ؟`
        : `Welcome! I have linked case "${selectedCase.title_en || selectedCase.title_ar}" (${selectedCase.case_number || ''}) to our session. How can I assist you with claim merits, expected returns, or execution safeguards?`;
    } else {
      greetingText = isAr
        ? currentRoleConfig.greetingAr(currentUserContext?.name)
        : currentRoleConfig.greetingEn(currentUserContext?.name);
    }

    setMessages([
      {
        id: `greeting-${currentRoleConfig.id}-${Date.now()}`,
        role: 'assistant',
        content: greetingText,
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  }, [activeRole, isAr, currentUserContext?.name, selectedCase?.id]);

  // Listen to custom event to open AI with a specific role, case or question
  useEffect(() => {
    const handleOpenWithRole = (
      e: CustomEvent<{
        role?: AssistantRole;
        question?: string;
        selectedCase?: CaseItem;
      }>
    ) => {
      if (e.detail?.role) {
        setActiveRole(e.detail.role);
      }
      if (e.detail?.selectedCase) {
        setSelectedCase(e.detail.selectedCase);
        selectedCaseRef.current = e.detail.selectedCase;
      }
      setIsOpen(true);
      setUnreadPrompt(false);
      if (e.detail?.question) {
        const q = e.detail.question;
        const c = e.detail.selectedCase;
        setTimeout(() => {
          handleSendMessage(q, c);
        }, 120);
      }
    };

    window.addEventListener('open-insaf-ai' as any, handleOpenWithRole as any);
    return () => {
      window.removeEventListener('open-insaf-ai' as any, handleOpenWithRole as any);
    };
  }, [activeRole, isAr]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (userText?: string, caseOverride?: CaseItem) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');

    const targetCase = caseOverride || selectedCaseRef.current;

    const newUserMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: activeRole,
          locale: isAr ? 'ar' : 'en',
          userContext: currentUserContext,
          selectedCaseId: targetCase?.id || null,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.message?.content) {
        const fullContent = data.message.content;
        const assistantMsgId = `ai-${Date.now()}`;
        const assistantReply: Message = {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, assistantReply]);
        setIsLoading(false);

        // Stream word-by-word typewriter effect
        typeOutMessage(assistantMsgId, fullContent);
      } else {
        throw new Error(data.error || 'No response received');
      }
    } catch (err: any) {
      console.error('Failed to query AI assistant:', err);
      const fallbackText = isAr
        ? 'عذراً، حدث تأخر مؤقت في الاتصال بالخدمة الذكية. يرجى إعادة المحاولة أو التواصل مع فريقنا عبر support@insaf.sa.'
        : 'A temporary delay occurred. Please try again or reach our team at support@insaf.sa.';
      const fallbackId = `ai-err-${Date.now()}`;
      const fallbackReply: Message = {
        id: fallbackId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
      setIsLoading(false);
      typeOutMessage(fallbackId, fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCaseFromInspector = (c: CaseItem) => {
    setSelectedCase(c);
    setIsInspectorOpen(false);

    // Add proactive prompt to assist with the selected case
    handleSendMessage(
      isAr
        ? `لخص لي ملابسات قضية "${c.title_ar}"، وحجم التمويل المطلوب والمكتمل، وحالتها الحالية في المنصة.`
        : `Summarize the merits, funding status, and current judicial stage for case "${c.title_ar}".`
    );
  };

  const handleAnalyzeDashboard = () => {
    setIsInspectorOpen(false);
    setSelectedCase(null);
    handleSendMessage(
      isAr
        ? 'قدم لي تحليلاً شاملاً ودقيقاً لكافة مؤشرات لوحة التحكم الحالية (أعداد القضايا وتوزيع حالاتها، حجم الاستثمارات، والعمليات).'
        : 'Provide a comprehensive breakdown of current dashboard metrics: case distribution, funded volume, and active pipeline.'
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isAr ? 'ar-SA' : 'en-US';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    setIsTyping(false);
    setActiveTypingMessageId(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setSelectedCase(null);
    const greetingText = isAr
      ? currentRoleConfig.greetingAr(currentUserContext?.name)
      : currentRoleConfig.greetingEn(currentUserContext?.name);
    setMessages([
      {
        id: `greeting-${currentRoleConfig.id}-${Date.now()}`,
        role: 'assistant',
        content: greetingText,
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const availableRoles = userContext?.isDashboard
    ? ROLES
    : ROLES.filter((r) => !['super_admin', 'judicial_committee', 'finance'].includes(r.id));

  const filteredCases = casesList.filter(
    (c) =>
      c.title_ar?.toLowerCase().includes(caseSearchTerm.toLowerCase()) ||
      c.court?.toLowerCase().includes(caseSearchTerm.toLowerCase()) ||
      c.status_label_ar?.toLowerCase().includes(caseSearchTerm.toLowerCase())
  );

  // Dynamic suggestions: if a case is selected, tailor suggestions to that case!
  const currentSuggestions = selectedCase
    ? isAr
      ? [
          `ما هو المبلغ المطلوب ونسبة التمويل المكتمل لقضية (${selectedCase.title_ar})؟`,
          `ما هي الخطوة النظامية القادمة أمام المحكمة في هذه القضية؟`,
          `ما هو تقييم المخاطر وقرار الهيئة القضائية حولها؟`,
          `ما هي الأطراف المتنازعة وتفاصيل صك الدعوى؟`
        ]
      : [
          `What is the funding target and progress for (${selectedCase.title_ar})?`,
          `What is the next legal milestone in court?`,
          `What was the judicial committee rating and decision?`,
          `Who are the disputing parties in this claim?`
        ]
    : isAr
    ? currentRoleConfig.suggestionsAr
    : currentRoleConfig.suggestionsEn;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING LAUNCHER (المساعد الافتراضي)                                  */}
      {/* ========================================================================= */}
      <div
        className={`fixed bottom-24 md:bottom-6 ${isAr ? 'left-4 md:left-6' : 'right-4 md:right-6'} z-50 flex flex-col items-end gap-3`}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <AnimatePresence>
          {!isOpen && unreadPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative bg-white dark:bg-[#161D19] text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-2xl shadow-xl border-2 border-[#0E5B34]/20 dark:border-[#1E8A54]/40 flex items-center gap-3 cursor-pointer group max-w-xs transition-colors"
              onClick={() => {
                setIsOpen(true);
                setUnreadPrompt(false);
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 border border-[#0E5B34]/30 dark:border-[#1E8A54]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#0E5B34] dark:text-[#E3CD94] animate-pulse" />
              </div>
              <div className="text-xs leading-snug">
                <p className="font-bold text-[#0E5B34] dark:text-[#E3CD94]">
                  {userContext?.name
                    ? `${isAr ? 'مرحباً' : 'Welcome'} ${userContext.name}`
                    : (isAr ? 'إنصاف — المساعد الذكي' : 'INSAF Smart Assistant')}
                </p>
                <p className="text-muted-foreground line-clamp-1 font-medium">
                  {userContext?.roleName
                    ? (isAr ? `متصل بدقة بصلاحيات: ${userContext.roleName}` : `Assistant for ${userContext.roleName}`)
                    : (isAr ? 'مستشارك الفوري في التمويل القضائي' : 'Instant litigation capital advisor')}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUnreadPrompt(false);
                }}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-white dark:bg-[#161D19] rotate-45 border-r border-b border-[#0E5B34]/20 dark:border-[#1E8A54]/40" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setUnreadPrompt(false);
          }}
          className="relative group flex items-center gap-3 h-14 px-5 rounded-full bg-gradient-to-r from-[#0E5B34] via-[#0D5530] to-[#0A4427] text-white shadow-xl shadow-[#0E5B34]/30 border-2 border-[#C09A4A]/50 hover:border-[#C09A4A] transition-all"
          aria-label={isAr ? 'المساعد الافتراضي' : 'Virtual Assistant'}
        >
          <div className="relative w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-[#E3CD94] border border-[#C09A4A]/40">
            <Bot className="w-5 h-5 text-[#E3CD94]" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A4427]" />
          </div>

          <div className="relative flex flex-col text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#E3CD94] font-bold leading-none">
              {userContext?.roleName ? userContext.roleName : (isAr ? 'الذكاء الاصطناعي' : 'AI Powered')}
            </span>
            <span className="text-sm font-black text-white leading-tight">
              {isAr ? 'المساعد الافتراضي' : 'Virtual Assistant'}
            </span>
          </div>

          <Sparkles className="relative w-4 h-4 text-[#E3CD94] hidden sm:block animate-pulse" />
        </motion.button>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHAT MODAL DIALOG                                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-xl h-[92vh] sm:h-[680px] bg-white dark:bg-[#131A16] text-slate-900 dark:text-slate-100 rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl border-2 border-[#0E5B34]/20 dark:border-[#1E8A54]/40 flex flex-col overflow-hidden z-10 transition-colors"
            >
              {/* Royal Emerald & Gold Header */}
              <div className="relative px-6 py-4 bg-gradient-to-r from-[#072B18] via-[#0E5B34] to-[#0A4427] text-white border-b border-[#C09A4A]/30 shrink-0">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-2xl bg-white dark:bg-emerald-950/60 border border-[#C09A4A] p-2 flex items-center justify-center shadow-md">
                      <Scale className="w-6 h-6 text-[#0E5B34] dark:text-[#E3CD94]" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0E5B34]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg text-white tracking-wide">
                          {isAr ? 'إنصاف — المساعد الذكي' : 'INSAF — Smart Assistant'}
                        </h3>
                        <span className="rounded-full bg-[#C09A4A]/25 border border-[#C09A4A]/60 px-2 py-0.5 text-[10px] font-bold text-[#E3CD94]">
                          Allam 2.0 🇸🇦
                        </span>
                      </div>
                      <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#E3CD94]" />
                        {currentUserContext?.roleName
                          ? (isAr ? `متصل بحساب: ${currentUserContext.name || ''} (${currentUserContext.roleName})` : `Active Role: ${currentUserContext.roleName}`)
                          : (isAr ? 'متصل بقاعدة البيانات والأنظمة القضائية' : 'Live Database & Judicial System Connected')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleResetChat}
                      title={isAr ? 'محادثة جديدة' : 'New chat'}
                      className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      title={isAr ? 'إغلاق' : 'Close'}
                      className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Sub-Header Toolbar: Role Switcher & Case Inspector Button */}
                <div className="relative mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
                    {availableRoles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = activeRole === role.id;
                      return (
                        <button
                          key={role.id}
                          onClick={() => setActiveRole(role.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#C09A4A] to-[#E3CD94] text-[#0A4427] shadow-md scale-105'
                              : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-white/10'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{isAr ? role.titleAr : role.titleEn}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* PROMINENT BUTTON: Ask about a specific Case / Section Overlay */}
                  <button
                    onClick={() => setIsInspectorOpen(!isInspectorOpen)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#C09A4A] hover:bg-[#d6af55] text-[#072B18] text-[11px] font-black transition-all shadow-md shrink-0 border border-white/40"
                    title={isAr ? 'اسأل عن جزء محدد أو قضية معينة' : 'Inspect specific case / section'}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>{isAr ? 'اسأل عن قضية / جزء' : 'Focus Case'}</span>
                  </button>
                </div>
              </div>

              {/* Active Case Target Focus Banner (if a case is selected) */}
              {selectedCase && (
                <div className="bg-gradient-to-r from-[#0E5B34]/10 via-[#C09A4A]/15 to-[#0E5B34]/10 dark:from-[#1E8A54]/15 dark:via-[#C09A4A]/10 dark:to-[#1E8A54]/15 border-b border-[#0E5B34]/20 dark:border-white/10 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#0E5B34] dark:text-emerald-400" />
                    <span>
                      {isAr ? 'أنت تناقش الآن:' : 'Focused on:'}{' '}
                      <strong className="text-[#0E5B34] dark:text-[#E3CD94]">{selectedCase.title_ar}</strong>
                    </span>
                    <span className="text-[10px] bg-[#0E5B34] dark:bg-[#1E8A54] text-white px-2 py-0.5 rounded-full">
                      {selectedCase.status_label_ar || selectedCase.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="text-slate-500 hover:text-red-600 p-1 flex items-center gap-1 text-[11px]"
                    title={isAr ? 'إلغاء التحديد' : 'Clear focus'}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إلغاء' : 'Clear'}</span>
                  </button>
                </div>
              )}

              {/* Message List Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8F9FA] dark:bg-[#0D120F] relative transition-colors">
                {messages.map((msg) => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAssistant && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0E5B34] to-[#0A4427] border border-[#C09A4A]/40 flex items-center justify-center shrink-0 shadow-sm mt-1">
                          <Bot className="w-4 h-4 text-[#E3CD94]" />
                        </div>
                      )}

                      <div className="max-w-[85%] sm:max-w-[80%] space-y-1">
                        <div
                          onClick={() => handleSkipTyping(msg.id)}
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all ${
                            isAssistant
                              ? 'bg-white dark:bg-[#161D19] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 whitespace-pre-line rounded-tr-none'
                              : 'bg-gradient-to-r from-[#0E5B34] to-[#0A4427] text-white rounded-tl-none font-medium'
                          }`}
                        >
                          {msg.content}
                          {isAssistant && isTyping && activeTypingMessageId === msg.id && (
                            <span className="inline-block w-1.5 h-4 ms-1 bg-[#0E5B34] dark:bg-[#E3CD94] animate-pulse align-middle rounded-xs" />
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                            isAssistant ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isAssistant && (
                            <>
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="hover:text-[#0E5B34] transition-colors flex items-center gap-0.5 ml-1"
                                title={isAr ? 'نسخ' : 'Copy'}
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => handleSpeak(msg.id, msg.content)}
                                className="hover:text-[#0E5B34] transition-colors flex items-center gap-0.5"
                                title={isAr ? 'صوت' : 'TTS'}
                              >
                                {speakingId === msg.id ? (
                                  <VolumeX className="w-3 h-3 text-red-500 animate-pulse" />
                                ) : (
                                  <Volume2 className="w-3 h-3" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {!isAssistant && (
                        <div className="w-8 h-8 rounded-xl bg-[#0E5B34]/10 border border-[#0E5B34]/20 flex items-center justify-center shrink-0 shadow-sm mt-1">
                          <User className="w-4 h-4 text-[#0E5B34]" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0E5B34] to-[#0A4427] border border-[#C09A4A]/40 flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-[#E3CD94]" />
                    </div>
                    <div className="rounded-2xl rounded-tr-none px-4 py-3 bg-white border border-slate-200 flex items-center gap-2 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-[#0E5B34] animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-[#C09A4A] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-[#0E5B34] animate-bounce [animation-delay:0.4s]" />
                      <span className="text-xs text-slate-500 mr-2 font-medium">
                        {isAr ? 'إنصاف يحلل بيانات المنصة ويكتب الإجابة...' : 'INSAF is retrieving live data...'}
                      </span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />

                {/* ========================================================================= */}
                {/* 3. CASE / SECTION INSPECTOR OVERLAY                                       */}
                {/* ========================================================================= */}
                <AnimatePresence>
                  {isInspectorOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-x-3 inset-y-3 bg-white/98 dark:bg-[#131A16]/98 backdrop-blur-md border-2 border-[#0E5B34]/30 dark:border-[#1E8A54]/40 rounded-3xl p-5 shadow-2xl flex flex-col z-20 transition-colors"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
                          <Target className="w-4 h-4 text-[#0E5B34] dark:text-emerald-400" />
                          <span>{isAr ? 'اختر جزءاً أو قضية لمناقشتها مع الذكاء الاصطناعي:' : 'Select context to discuss:'}</span>
                        </div>
                        <button
                          onClick={() => setIsInspectorOpen(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-4">
                        {/* Option 1: Discuss live Dashboard Stats */}
                        <div
                          onClick={handleAnalyzeDashboard}
                          className="p-4 rounded-2xl bg-gradient-to-r from-[#0E5B34]/10 via-[#C09A4A]/10 to-[#0E5B34]/10 dark:from-[#1E8A54]/15 dark:via-[#C09A4A]/10 dark:to-[#1E8A54]/15 border-2 border-[#0E5B34]/20 dark:border-[#1E8A54]/30 hover:border-[#0E5B34] dark:hover:border-[#1E8A54] cursor-pointer transition-all shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-extrabold text-xs text-[#0E5B34] dark:text-[#E3CD94] flex items-center gap-1.5">
                              <BarChart3 className="w-4 h-4" />
                              {isAr ? 'تحليل ومناقشة بيانات الداش بورد الحالية' : 'Analyze Current Dashboard Metrics'}
                            </span>
                            <span className="text-[10px] font-bold bg-[#0E5B34] dark:bg-[#1E8A54] text-white px-2 py-0.5 rounded-full">
                              {isAr ? 'بيانات حية' : 'Live Data'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {isAr
                              ? `فحص وتحليل إحصائيات المنصة الحالية (${dashboardStats?.totalCases || 9} قضايا، ${Number(dashboardStats?.totalInvested || 26000).toLocaleString('en-US')} ر.س استثمارات، ${dashboardStats?.totalUsers || 12} مستخدم).`
                              : `Analyze real-time metrics across ${dashboardStats?.totalCases || 9} cases and SAR ${dashboardStats?.totalInvested || 26000} volume.`}
                          </p>
                        </div>

                        {/* Option 2: Select a Specific Case */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Scale className="w-3.5 h-3.5 text-[#C09A4A]" />
                              {isAr ? 'قائمة القضايا المتاحة في المنصة:' : 'Platform Cases:'}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                              ({casesList.length} {isAr ? 'قضايا' : 'cases'})
                            </span>
                          </div>

                          {/* Case Search Input */}
                          <div className="relative mb-3">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 right-3" />
                            <input
                              type="text"
                              value={caseSearchTerm}
                              onChange={(e) => setCaseSearchTerm(e.target.value)}
                              placeholder={isAr ? 'ابحث عن قضية بالاسم أو المحكمة...' : 'Search cases...'}
                              className="w-full bg-slate-50 dark:bg-[#1A231E] border border-slate-200 dark:border-white/10 rounded-xl py-1.5 pr-8 pl-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E5B34] dark:text-white"
                            />
                          </div>

                          {/* Cases List */}
                          <div className="space-y-2 max-h-56 overflow-y-auto">
                            {filteredCases.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => handleSelectCaseFromInspector(c)}
                                className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A231E] hover:bg-[#0E5B34]/5 dark:hover:bg-[#1E8A54]/15 border border-slate-200 dark:border-white/10 hover:border-[#0E5B34]/40 dark:hover:border-[#1E8A54]/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#0E5B34] dark:group-hover:text-[#E3CD94] truncate">
                                      {c.title_ar}
                                    </span>
                                    <span className="text-[10px] bg-[#0E5B34]/10 dark:bg-[#1E8A54]/20 text-[#0E5B34] dark:text-[#E3CD94] px-1.5 py-0.5 rounded-md font-bold shrink-0">
                                      {c.status_label_ar || c.status}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span>{c.court || (isAr ? 'المحكمة التجارية' : 'Commercial Court')}</span>
                                    <span>·</span>
                                    <span>
                                      {isAr ? 'المطلوب:' : 'Target:'} {Number(c.requested_funding || 0).toLocaleString('en-US')} {isAr ? 'ر.س' : 'SAR'}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[11px] font-black text-[#B88E38] dark:text-[#E3CD94] group-hover:translate-x-[-2px] transition-transform">
                                  {isAr ? 'اختر ➔' : 'Select ➔'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Suggestions Chips Bar (Dynamic: adapts if a case is selected!) */}
              <div className="px-4 py-2.5 bg-white dark:bg-[#131A16] border-t border-slate-200 dark:border-white/10 shrink-0 transition-colors">
                <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#C09A4A]" />
                  <span>
                    {selectedCase
                      ? (isAr ? `أسئلة مقترحة لقضية (${selectedCase.title_ar}):` : `Questions for this case:`)
                      : (isAr ? `أسئلة مقترحة لدور (${currentRoleConfig.titleAr}):` : `Suggested for (${currentRoleConfig.titleEn}):`)}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {currentSuggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sugg)}
                      disabled={isLoading || isTyping}
                      className="text-xs px-3 py-1.5 rounded-full bg-[#F1F5F9] dark:bg-[#1C2620] hover:bg-[#0E5B34]/10 dark:hover:bg-[#1E8A54]/20 hover:border-[#0E5B34]/40 dark:hover:border-[#1E8A54]/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-[#0E5B34] dark:hover:text-[#E3CD94] transition-all whitespace-nowrap disabled:opacity-50 font-medium"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Footer */}
              <div className="p-3 sm:p-4 bg-white dark:bg-[#131A16] border-t border-slate-200 dark:border-white/10 shrink-0 transition-colors">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isTyping}
                    placeholder={
                      isTyping
                        ? (isAr ? 'إنصاف يكتب الرد الآن (انقر فوق الرسالة للإكمال الفوري)...' : 'INSAF is typing...')
                        : selectedCase
                          ? (isAr ? `اسأل إنصاف عن قضية (${selectedCase.title_ar})...` : `Ask about (${selectedCase.title_ar})...`)
                          : (isAr
                            ? `اسأل إنصاف المساعد الذكي عن (${currentRoleConfig.titleAr})...`
                            : `Ask INSAF Smart Assistant about (${currentRoleConfig.titleEn})...`)
                    }
                    className="flex-1 bg-[#F8F9FA] dark:bg-[#1A231E] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E5B34] focus:border-transparent text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-70"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || isTyping}
                    className="h-11 px-5 rounded-2xl bg-gradient-to-r from-[#0E5B34] to-[#0A4427] text-white hover:opacity-95 disabled:opacity-40 font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#0E5B34]/20"
                    aria-label={isAr ? 'إرسال' : 'Send'}
                  >
                    <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                  </button>
                </form>
                <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 font-medium">
                  {isAr
                    ? 'إنصاف متصل مباشرة بالبيانات الحية للمنصة والأنظمة القضائية السعودية.'
                    : 'INSAF is connected directly to live platform data and Saudi judicial regulations.'}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Helper function to trigger opening the AI Assistant from anywhere in page */
export function openInsafAi(
  role: AssistantRole = 'general',
  question?: string,
  extra?: { selectedCase?: CaseItem }
) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('open-insaf-ai', {
        detail: { role, question, selectedCase: extra?.selectedCase },
      })
    );
  }
}
