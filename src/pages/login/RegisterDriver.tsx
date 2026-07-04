import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext1';
import { ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';

const RegisterDriver = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    city_area: '',
    availability: '',
    driver_license_number: '',
    password: '',
    confirmPassword: '',
  });

  const [driverLicensePhoto, setDriverLicensePhoto] = useState<File | null>(null);
  const [personalPhoto, setPersonalPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setter(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = t('auth.errors.passwordRequired') || 'Password is required';
    if (!form.confirmPassword) newErrors.confirmPassword = t('auth.errors.confirmPasswordRequired') || 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = t('auth.errors.passwordMismatch') || 'Passwords do not match';

    setErrors(newErrors);
    if (Object.keys(newErrors).length) { setIsSubmitting(false); return; }

    try {
      const data = new FormData();
      // Append exact keys expected by backend
      data.append('full_name', form.full_name);
      data.append('phone', form.phone);
      data.append('email', form.email);
      data.append('city_area', form.city_area);
      data.append('availability', form.availability);
      data.append('driver_license_number', form.driver_license_number);
      data.append('password', form.password);
      if (driverLicensePhoto) data.append('driver_license_photo', driverLicensePhoto);
      if (personalPhoto) data.append('personal_photo', personalPhoto);

      await axios.post(`${API_BASE_URL}/api/applicants/drivers/register/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/register/pending');
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const resp = err.response.data;
        const backendErrors: Record<string, string> = {};
        for (const key in resp) {
          if (Array.isArray(resp[key])) backendErrors[key] = resp[key][0];
          else if (typeof resp[key] === 'string') backendErrors[key] = resp[key];
        }
        setErrors(backendErrors);
      } else {
        setErrors({ form: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
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
          <a href="/" className="mb-12">
            <div className="text-4xl font-bold">
              <span className="text-white">Move</span>
              <span className="text-[#D4AF37]">Line</span>
            </div>
          </a>
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
            <CardTitle className="text-3xl font-bold text-foreground">{t('auth.register.driverTitle') || 'Driver Registration'}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{t('auth.register.driverSubtitle') || 'Provide your details and upload required documents'}</CardDescription>
          </CardHeader>

          <CardContent>
            {errors.form && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-center text-sm border border-red-200">
                    {errors.form}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-foreground font-medium">{t('auth.register.fullName') || 'Full name'}</Label>
                <Input id="full_name" name="full_name" type="text" placeholder={t('auth.register.fullNamePlaceholder') || 'Enter full name'} value={form.full_name} onChange={handleChange} className={`h-12 ${errors.full_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                {errors.full_name && <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-medium">{t('auth.register.phone') || 'Phone'}</Label>
                <Input id="phone" name="phone" type="tel" placeholder={t('auth.register.phonePlaceholder') || 'Your phone number'} value={form.phone} onChange={handleChange} className={`h-12 ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                {errors.phone && <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">{t('auth.register.emailLabel') || 'Email'}</Label>
                  <Input id="email" name="email" type="email" placeholder={t('auth.register.emailPlaceholder') || 'your.email@example.com'} value={form.email} onChange={handleChange} autoComplete="username" className={`h-12 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                {errors.email && <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city_area" className="text-foreground font-medium">{t('auth.register.cityArea') || 'City / Area'}</Label>
                  <Input id="city_area" name="city_area" type="text" placeholder={t('auth.register.cityAreaPlaceholder') || 'City or area'} value={form.city_area} onChange={handleChange} className={`h-12 ${errors.city_area ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-foreground font-medium">{t('auth.register.availability') || 'Availability'}</Label>
                  <select id="availability" name="availability" value={form.availability} onChange={handleChange} className={`h-12 w-full rounded-md border px-3 ${errors.availability ? 'border-red-500' : ''}`}>
                    <option value="">{t('auth.register.selectAvailability') || 'Select availability'}</option>
                    <option value="morning">{t('auth.register.availabilityMorning') || 'Morning (08:00 - 14:00)'}</option>
                    <option value="evening">{t('auth.register.availabilityEvening') || 'Evening (14:00 - 20:00)'}</option>
                    <option value="full_time">{t('auth.register.availabilityFull') || 'Full time'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver_license_number" className="text-foreground font-medium">{t('auth.register.driverLicenseNumber') || 'Driver License Number'}</Label>
                <Input id="driver_license_number" name="driver_license_number" type="text" placeholder={t('auth.register.driverLicenseNumberPlaceholder') || 'e.g. SY-48484'} value={form.driver_license_number} onChange={handleChange} className={`h-12 ${errors.driver_license_number ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                {errors.driver_license_number && <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.driver_license_number}</p>}
              </div>

              <div>
                <Label className="text-foreground font-medium">{t('auth.register.driverLicensePhoto') || 'Driver License Photo'}</Label>
                <input type="file" accept="image/*" onChange={(e) => handleFile(e, setDriverLicensePhoto)} />
                {errors.driver_license_photo && <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.driver_license_photo}</p>}
              </div>

              <div>
                <Label className="text-foreground font-medium">{t('auth.register.personalPhoto') || 'Personal Photo'}</Label>
                <input type="file" accept="image/*" onChange={(e) => handleFile(e, setPersonalPhoto)} />
                {errors.personal_photo && <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.personal_photo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">{t('auth.register.passwordLabel') || 'Password'}</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} autoComplete="new-password" className={`h-12 pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">{t('auth.register.confirmPasswordLabel') || 'Confirm Password'}</Label>
                <div className="relative">
                   <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" className={`h-12 pr-10 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1 animate-fade-in">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium text-lg shadow-card hover:shadow-glow transition-all duration-300">
                {isSubmitting ? 'Submitting...' : t('auth.register.submitButton') || 'Register'}
                {!isSubmitting && <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterDriver;
