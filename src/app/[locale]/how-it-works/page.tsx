import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('Index');
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">{t('title')} - how-it-works</h1>
    </div>
  );
}