import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, KeyRound } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const VerifyOtp = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = language === 'ar';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get email from previous page
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
        // If no email, redirect back to forgot password
        navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError(t('auth.verifyOtp.errorRequired'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/password-reset/verify/`, { 
        email, 
        code: otp 
      });
      
      const { reset_token } = response.data;

      // Navigate to Reset Password page with reset_token
      navigate('/reset-password', { state: { reset_token } });
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
           setError(t('auth.verifyOtp.errorInvalid'));
        } else {
           setError(t('auth.verifyOtp.errorFailed'));
        }
      } else {
         setError(t('auth.errors.unexpected'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=2070)',
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
            {t('auth.verifyOtp.heroTitle')}
          </h1>
          <p className="text-xl leading-relaxed text-white/90">
             {t('auth.verifyOtp.heroSubtitle')}
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
              {t('auth.verifyOtp.title')}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t('auth.verifyOtp.subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-foreground font-medium">
                  {t('auth.verifyOtp.otpLabel')}
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder={t('auth.verifyOtp.otpPlaceholder')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`h-12 text-center text-lg tracking-widest ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                {isSubmitting ? t('auth.verifyOtp.submitting') : t('auth.verifyOtp.submitButton')}
                {!isSubmitting && <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/forgot-password"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                {t('auth.verifyOtp.backToForgotPassword')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOtp;
