import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabase = await createClient(await cookies());
  await supabase.auth.signOut();
  
  // Get locale from referer or default to ar
  const referer = request.headers.get('referer');
  const locale = referer?.includes('/en/') ? 'en' : 'ar';
  
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}
