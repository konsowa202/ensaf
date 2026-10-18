import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/server';
import { InsafAiAssistant } from '@/components/landing/InsafAiAssistant';
import { ThemeSync } from '@/components/theme/ThemeSync';
import "../globals.css";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "INSAF | إنصاف",
  description: "The case became your case - Litigation Funding Platform",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  // Ensure that the incoming `locale` is valid
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // Determine text direction based on locale
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // Theme is persisted in a cookie so the server renders the right class —
  // no inline <script> needed, no flash, no hydration warning.
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value;
  const htmlClass = [ibmPlexSansArabic.variable, theme === 'dark' ? 'dark' : '']
    .filter(Boolean)
    .join(' ');

  // Fetch logged in user and build userContext if available
  let userContext = null;
  try {
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name_ar, full_name_en, user_type, roles(name_ar, name_en, slug)')
        .eq('id', user.id)
        .single();

      if (profile) {
        const isAr = locale !== 'en';
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

        userContext = {
          name,
          roleSlug: roleObj?.slug || profile.user_type || 'applicant',
          roleName,
          userType: profile.user_type || 'applicant',
          isDashboard: true,
        };
      }
    }
  } catch (authErr) {
    console.warn('Could not retrieve user session in LocaleLayout:', authErr);
  }

  return (
    <html lang={locale} dir={dir} className={htmlClass} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <ThemeSync />
        <NextIntlClientProvider messages={messages}>
          {children}
          <InsafAiAssistant locale={locale} userContext={userContext} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
