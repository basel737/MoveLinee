import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const ResetPassword = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get reset_token from previous page
  const { reset_token } = location.state || {};

  useEffect(() => {
    if (!reset_token) {
        // If missing token, redirect to forgot password
        navigate('/forgot-password');
    }
  }, [reset_token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.errors.passwordTooShort');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordMismatch');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await axios.post(`${API_BASE_URL}/api/auth/password-reset/complete/`, {
            token: reset_token,
            new_password: formData.password,
        });
        
        // Success! Redirect to login
        // Optional: Show a toast or success message before redirecting
        navigate('/login');
      } catch (err: any) {
         if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 400) {
                // Map backend errors
                const backendErrors: Record<string, string> = {};
                const data = err.response.data;
                 for (const key in data) {
                    if (Array.isArray(data[key])) {
                        backendErrors[key] = data[key][0];
                    } else if (typeof data[key] === 'string') {
                         backendErrors[key] = data[key];
                    }
                }
                setErrors(backendErrors);
            } else {
                 setErrors({ form: 'Password reset failed. Please try again.' });
            }
        } else {
             setErrors({ form: 'An unexpected error occurred.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
         setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };

  if (!reset_token) return null;

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?q=80&w=2070)',
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
            {t('auth.resetPassword.heroTitle')}
          </h1>
          <p className="text-xl leading-relaxed text-white/90">
            {t('auth.resetPassword.heroSubtitle')}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-border/50 shadow-elegant">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              {t('auth.resetPassword.title')}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t('auth.resetPassword.subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  {t('auth.resetPassword.passwordLabel')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.resetPassword.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    className={`h-12 pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  {t('auth.resetPassword.confirmPasswordLabel')}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`h-12 pr-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium text-lg shadow-card hover:shadow-glow transition-all duration-300"
              >
                {isSubmitting ? 'Resetting...' : t('auth.resetPassword.submitButton')}
                {!isSubmitting && <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                {t('auth.resetPassword.backToLogin')}
              </Link>
            </div>

            <div className="mt-6 text-center">
              <Link to="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  {t('auth.resetPassword.backToHome')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
