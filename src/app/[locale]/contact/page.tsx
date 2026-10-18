import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  async function submitContactForm(formData: FormData) {
    'use server';
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    
    if (!name || !email || !message) return;
    
    const supabase = await createClient(await cookies());
    await supabase.from('contact_messages').insert([{ name, email, message }]);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${locale}`}>
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/login`}>
              <Button variant="ghost">{locale === 'ar' ? 'تسجيل الدخول' : 'Login'}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-primary">
          {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
        </h1>
        
        <form action={submitContactForm} className="space-y-6 bg-surface p-8 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'الاسم' : 'Name'}</label>
            <input type="text" name="name" required className="w-full p-3 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
            <input type="email" name="email" required className="w-full p-3 border rounded-md" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{locale === 'ar' ? 'الرسالة' : 'Message'}</label>
            <textarea name="message" required className="w-full p-3 border rounded-md" rows={5}></textarea>
          </div>
          <Button type="submit" size="lg" className="w-full">
            {locale === 'ar' ? 'إرسال' : 'Send Message'}
          </Button>
        </form>
      </main>
    </div>
  );
}