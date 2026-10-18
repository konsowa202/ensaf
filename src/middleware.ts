import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from './utils/supabase/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First, apply next-intl routing
  const response = intlMiddleware(request);

  // Then, attach Supabase auth session update
  const { supabase, supabaseResponse, user } = await updateSession(request, response);

  const pathname = request.nextUrl.pathname;
  // Remove locale prefix for checking
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';
  
  // If we're hitting /admin without locale, next-intl handles the rewrite, 
  // but we must be careful with our path matching
  const isDashboard = pathWithoutLocale.startsWith('/dashboard');
  const isAdmin = pathWithoutLocale.startsWith('/admin');
  const isCommittee = pathWithoutLocale.startsWith('/committee');
  
  const isProtectedPath = isDashboard || isAdmin || isCommittee;

  if (isProtectedPath && !user) {
    // Redirect to login if unauthenticated
    const loginUrl = new URL(request.nextUrl.pathname.startsWith('/en') ? '/en/login' : '/ar/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based authorization
  if (user && isProtectedPath) {
    const localePrefix = request.nextUrl.pathname.startsWith('/en') ? '/en' : '/ar';

    if (isAdmin) {
      const { data: hasAdminAccess } = await supabase.rpc('has_permission', { uid: user.id, perm_key: 'admin.access' });
      if (!hasAdminAccess) {
        // Section-level permissions: staff roles reach only their own /admin tools
        const sectionPerms: [RegExp, string[]][] = [
          [/^\/admin\/finance/, ['finance.payout', 'transactions.view', 'transactions.manage']],
          [/^\/admin\/audit/, ['audit.view']],
          [/^\/admin\/roles/, ['roles.view', 'roles.manage', 'users.manage']],
          [/^\/admin\/cms/, ['content.manage']],
          [/^\/admin\/settings/, ['settings.manage']],
        ];
        const match = sectionPerms.find(([re]) => re.test(pathWithoutLocale));
        let allowed = false;
        if (match) {
          const results = await Promise.all(
            match[1].map((k) => supabase.rpc('has_permission', { uid: user.id, perm_key: k }))
          );
          allowed = results.some((r) => r.data);
        }
        if (!allowed) {
          return NextResponse.redirect(new URL(`${localePrefix}/403`, request.url));
        }
      }
    }

    if (isCommittee) {
      const keys = ['cases.review', 'cases.manage', 'cases.approve', 'admin.access'];
      const results = await Promise.all(
        keys.map((k) => supabase.rpc('has_permission', { uid: user.id, perm_key: k }))
      );
      if (!results.some((r) => r.data)) {
        return NextResponse.redirect(new URL(`${localePrefix}/403`, request.url));
      }
    }
  }

  // Merge cookies
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value);
  });

  return response;
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /images, /favicon.ico, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
