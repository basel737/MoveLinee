import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext1';

const RegisterChoose = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('auth.register.chooseTitle') || 'Create an account'}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('auth.register.chooseSubtitle') || 'Choose the type of account to create'}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Link to="/register" className="block">
                <Button className="w-full">{t('auth.register.customer') || 'Register as Customer'}</Button>
              </Link>
              <Link to="/register/driver" className="block">
                <Button className="w-full">{t('auth.register.driver') || 'Register as Driver'}</Button>
              </Link>
              <Link to="/register/worker" className="block">
                <Button className="w-full">{t('auth.register.worker') || 'Register as Worker'}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterChoose;
