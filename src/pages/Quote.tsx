import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext1';

const Quote = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          {t('quote.button')}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {t('quote.text')}
        </p>
        {/* Quote form will be added later */}
      </div>
    </div>
  );
};

export default Quote;
