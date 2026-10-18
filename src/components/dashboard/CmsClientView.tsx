'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { MessagesSquare, CircleHelp, Handshake, Building2, Star, Eye, EyeOff, Check } from 'lucide-react';

export default function CmsClientView({
  locale, faqs, partners, clients, comments,
}: {
  locale: string; faqs: any[]; partners: any[]; clients: any[]; comments: any[];
}) {
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'faqs' | 'partners' | 'clients'>('comments');
  const router = useRouter();
  const supabase = createClient();

  const run = async (fn: () => PromiseLike<{ error: any }>) => {
    setLoading(true);
    const { error } = await fn();
    setLoading(false);
    if (error) alert(error.message);
    else router.refresh();
  };

  const toggleActive = (table: string, id: string, current: boolean) =>
    run(async () => await supabase.from(table).update({ is_active: !current }).eq('id', id));

  const handleApproveComment = (id: string, isTestimonial: boolean) =>
    run(async () => await supabase.from('comments').update({ is_approved: true, is_testimonial: isTestimonial }).eq('id', id));

  const handleRejectComment = (id: string) =>
    run(async () => await supabase.from('comments').update({ is_approved: false, is_testimonial: false }).eq('id', id));

  const tabs = [
    { key: 'comments', label: isAr ? 'التعليقات' : 'Comments', icon: MessagesSquare, count: comments.length },
    { key: 'faqs', label: isAr ? 'الأسئلة الشائعة' : 'FAQs', icon: CircleHelp, count: faqs.length },
    { key: 'partners', label: isAr ? 'الشركاء' : 'Partners', icon: Handshake, count: partners.length },
    { key: 'clients', label: isAr ? 'العملاء' : 'Clients', icon: Building2, count: clients.length },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-full bg-surface border border-border/70">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition-colors ${
              activeTab === tab.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-muted'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Comments */}
      {activeTab === 'comments' && (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{isAr ? 'التعليقات وآراء العملاء' : 'Comments & Testimonials'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {comments.length === 0 && (
              <p className="text-muted-foreground text-sm py-8 text-center">{isAr ? 'لا توجد تعليقات.' : 'No comments yet.'}</p>
            )}
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 rounded-2xl border border-border/60 bg-surface/50 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">{comment.author_name}</h3>
                    <span className="inline-flex items-center gap-0.5 text-gold text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" /> {comment.rating}/5
                    </span>
                    {(comment.author_role_ar || comment.author_role_en) && (
                      <span className="text-[11px] text-muted-foreground">
                        {isAr ? comment.author_role_ar : comment.author_role_en}
                      </span>
                    )}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      comment.is_approved ? 'bg-primary/10 text-primary' : 'bg-gold/15 text-gold'
                    }`}>
                      {comment.is_approved
                        ? (isAr ? 'معتمد' : 'Approved') + (comment.is_testimonial ? (isAr ? ' · شهادة' : ' · Testimonial') : '')
                        : (isAr ? 'بانتظار المراجعة' : 'Pending')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {isAr ? comment.content_ar : comment.content_en}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!comment.is_approved ? (
                    <>
                      <Button size="sm" className="rounded-full" onClick={() => handleApproveComment(comment.id, false)} disabled={loading}>
                        <Check className="w-4 h-4 me-1" />
                        {isAr ? 'اعتماد' : 'Approve'}
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleApproveComment(comment.id, true)} disabled={loading}>
                        <Star className="w-4 h-4 me-1" />
                        {isAr ? 'كشهادة' : 'Testimonial'}
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleRejectComment(comment.id)} disabled={loading}>
                      <EyeOff className="w-4 h-4 me-1" />
                      {isAr ? 'إلغاء الاعتماد' : 'Unpublish'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* FAQs */}
      {activeTab === 'faqs' && (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{isAr ? 'الأسئلة الشائعة' : 'FAQs'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className={`p-4 rounded-2xl border border-border/60 bg-surface/50 flex items-start gap-4 ${!faq.is_active ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm">{isAr ? faq.question_ar : faq.question_en}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    {isAr ? faq.answer_ar : faq.answer_en}
                  </p>
                </div>
                <Button
                  size="sm" variant={faq.is_active ? 'outline' : 'default'} className="rounded-full shrink-0"
                  onClick={() => toggleActive('faqs', faq.id, faq.is_active)} disabled={loading}
                >
                  {faq.is_active
                    ? <><EyeOff className="w-4 h-4 me-1" />{isAr ? 'إخفاء' : 'Hide'}</>
                    : <><Eye className="w-4 h-4 me-1" />{isAr ? 'إظهار' : 'Show'}</>}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Partners / Clients share the same shape */}
      {(activeTab === 'partners' || activeTab === 'clients') && (
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>
              {activeTab === 'partners'
                ? (isAr ? 'شركاؤنا (شريط اللاندينج)' : 'Partners (landing marquee)')
                : (isAr ? 'عملاؤنا' : 'Clients')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(activeTab === 'partners' ? partners : clients).map((item: any) => (
                <div key={item.id} className={`p-4 rounded-2xl border border-border/60 bg-surface/50 flex items-center gap-3 ${!item.is_active ? 'opacity-50' : ''}`}>
                  {item.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.logo_url} alt="" className="w-10 h-10 rounded-xl object-contain bg-card border border-border/50 p-1 shrink-0" />
                  ) : (
                    <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold shrink-0">
                      {String((isAr ? item.name_ar : item.name_en) || '?').charAt(0)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{isAr ? item.name_ar : item.name_en}</div>
                    {item.website && (
                      <div className="text-[11px] text-muted-foreground truncate" dir="ltr">{item.website}</div>
                    )}
                  </div>
                  <Button
                    size="sm" variant="ghost" className="rounded-full shrink-0"
                    onClick={() => toggleActive(activeTab, item.id, item.is_active)} disabled={loading}
                  >
                    {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
