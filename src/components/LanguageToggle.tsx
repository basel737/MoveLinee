import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext1';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="w-4 h-4" />
      <span>{language === 'en' ? 'عربي' : 'English'}</span>
    </Button>
  );
};
