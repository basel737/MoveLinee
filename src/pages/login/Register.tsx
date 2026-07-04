import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext1';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';


const Register = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    // Role removed from state, hardcoded in submission
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (!formData.email) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }

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
      try {
        await axios.post(`${API_BASE_URL}/api/users/`, {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            role: 'customer', // Hardcoded role
        });
        
        // Navigate to login on success
        navigate('/login');
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 400) {
                // Map backend errors to form errors
                const backendErrors: Record<string, string> = {};
                const data = error.response.data;
                
                // Handle various potential error formats from DRF
                for (const key in data) {
                    if (Array.isArray(data[key])) {
                        backendErrors[key] = data[key][0];
                    } else if (typeof data[key] === 'string') {
                         backendErrors[key] = data[key];
                    }
                }
                setErrors(backendErrors);
            } else {
                 setErrors({ form: 'Registration failed. Please try again.' });
            }
        } else {
             setErrors({ form: 'An unexpected error occurred.' });
        }
      }
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };
  


  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070)',
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
            {t('auth.register.heroTitle')}
          </h1>
          <p className="text-xl leading-relaxed text-white/90">
            {t('auth.register.heroSubtitle')}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <Card className="w-full max-w-md border-border/50 shadow-elegant my-8">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              {t('auth.register.title')}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t('auth.register.subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errors.form && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-center text-sm border border-red-200">
                    {errors.form}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`h-12 ${errors.username ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.username}</p>
                )}
              </div>

               {/* First Name & Last Name */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-foreground font-medium">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`h-12 ${errors.first_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.first_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-foreground font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`h-12 ${errors.last_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.last_name}</p>
                    )}
                  </div>
               </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  {t('auth.register.emailLabel')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  className={`h-12 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`h-12 ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.phone}</p>
                )}
              </div>



              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  {t('auth.register.passwordLabel')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  {t('auth.register.confirmPasswordLabel')}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
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
                {isSubmitting ? 'Registering...' : t('auth.register.submitButton')}
                {!isSubmitting && <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                {t('auth.register.haveAccount')}{' '}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  {t('auth.register.loginLink')}
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link to="/">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  {t('auth.register.backToHome')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
