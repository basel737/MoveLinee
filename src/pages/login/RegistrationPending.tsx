import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext1';

const RegistrationPending = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="max-w-lg w-full m-6">
        <CardHeader>
          <CardTitle>{t('auth.register.pendingTitle') || 'Registration Submitted'}</CardTitle>
          <CardDescription>{t('auth.register.pendingSubtitle') || 'Your application has been received and is pending admin review. You will be contacted for an interview.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPending;
