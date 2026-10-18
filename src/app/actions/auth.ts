'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  locale: z.string().default('ar'),
  redirect_to: z.string().optional()
});

export async function login(formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    redirect(`/${formData.get('locale') || 'ar'}/login?error=Invalid input`);
  }
  const { email, password, locale, redirect_to } = result.data;
  
  const supabase = await createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/${locale}/login?error=${encodeURIComponent(error.message)}`);
  }
  
  if (redirect_to && redirect_to.startsWith('/')) {
    redirect(redirect_to);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Staff land on the role-aware dashboard hub; it gates sections by permission.
    redirect(`/${locale}/dashboard`);
  } else {
    redirect(`/${locale}/dashboard`);
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  user_type: z.enum(['investor', 'applicant']),
  full_name: z.string().min(2),
  phone: z.string().min(8),
  locale: z.string().default('ar')
});

export async function register(formData: FormData) {
  const result = registerSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    redirect(`/${formData.get('locale') || 'ar'}/register?error=Invalid input`);
  }
  const { email, password, user_type, full_name, phone, locale } = result.data;
  
  const supabase = await createClient(await cookies());
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type,
        full_name,
        phone
      },
    },
  });

  if (error) {
    redirect(`/${locale}/register?error=${encodeURIComponent(error.message)}`);
  }

  // Update profile with phone if we have a session (RLS allows updating own phone)
  if (data.session?.user) {
    await supabase.from('profiles').update({ phone }).eq('id', data.session.user.id);
  }

  redirect(`/${locale}/dashboard`);
}

export async function logout(locale: string = 'ar') {
  const supabase = await createClient(await cookies());
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
