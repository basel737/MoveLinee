import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const ForgotPassword = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError(t('auth.errors.emailRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('auth.errors.emailInvalid'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/api/auth/password-reset/`, { email });
      // Navigate to OTP verification page
      navigate('/verify-otp', { state: { email } });
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400 && err.response.data.email) {
           // Handle specific email error from backend (Array or String)
           const emailError = Array.isArray(err.response.data.email) 
             ? err.response.data.email[0] 
             : err.response.data.email;
           setError(emailError);
        } else {
           setError('Failed to send reset email. Please try again.');
        }
      } else {
         setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2070)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-[#00796B]/85" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link to="/" className="mb-12">
            <div className="text-4xl font-bold">
              <span className="text-white">Move</span>
              <span className="text-[#D4AF37]">Line</span>
            </div>
          </Link>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            {t('auth.forgotPassword.heroTitle')}
          </h1>
          <p className="text-xl leading-relaxed text-white/90">
            {t('auth.forgotPassword.heroSubtitle')}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-border/50 shadow-elegant">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              {t('auth.forgotPassword.title')}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t('auth.forgotPassword.subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  {t('auth.forgotPassword.emailLabel')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  value={email}
                  onChange={handleChange}
                  className={`h-12 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {error && (
                  <p className="text-sm text-red-500 mt-1 animate-fade-in">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium text-lg shadow-card hover:shadow-glow transition-all duration-300"
              >
                {isSubmitting ? 'Sending...' : t('auth.forgotPassword.submitButton')}
                {!isSubmitting && <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>

            <div className="mt-6 text-center">
              <Link to="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  {t('auth.forgotPassword.backToHome')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
