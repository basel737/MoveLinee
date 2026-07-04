import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext1';
import { useAuth, ROLE_DASHBOARD } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: '',
      password: '',
    };

    if (!formData.email) {
      newErrors.email = t('auth.errors.emailRequired') || 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    }

    setErrors(newErrors);
    setGeneralError('');

    if (newErrors.email || newErrors.password) return;

    setIsLoading(true);
    try {
      const role = await login(formData.email, formData.password);
      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
      navigate(ROLE_DASHBOARD[role] ?? '/');
    } catch (error: any) {
      const message = error?.message || (isRTL ? 'فشل تسجيل الدخول. يرجى التحقق من البيانات.' : 'Login failed. Please check your credentials.');
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=2074)',
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
            {t('auth.login.heroTitle')}
          </h1>
          <p className="text-xl leading-relaxed text-white/90">
            {t('auth.login.heroSubtitle')}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-border/50 shadow-elegant">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              {t('auth.login.title')}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t('auth.login.subtitle')}
            </CardDescription>
            {generalError && (
              <div className="bg-destructive/10 p-3 rounded-lg text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {generalError}
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  {t('auth.login.emailLabel') || 'Email'}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder') || 'Enter your email'}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="username"
                  className={`h-12 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    {t('auth.login.passwordLabel')}
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    autoComplete="new-password"
                    className={`h-12 pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium text-lg shadow-card hover:shadow-glow transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {isRTL ? 'جاري التحقق...' : 'Verifying...'}
                  </>
                ) : (
                  <>
                    {t('auth.login.submitButton')}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                {t('auth.login.noAccount')}{' '}
                <Link
                  to="/register/choose"
                  className="text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  {t('auth.login.registerLink')}
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link to="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  {t('auth.login.backToHome')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
