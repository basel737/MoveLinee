import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Mail, Lock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, LanguageProvider } from '@/context/LanguageContext1';
import { LanguageToggle } from '@/components/LanguageToggle';
import { toast } from 'sonner';

const LoginContent: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { language } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
      navigate('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>

        <Card className="shadow-xl border-primary/10">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {language === 'ar' ? 'مرحباً بك في Move-Line' : 'Welcome to Move-Line'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'سجل الدخول للوصول إلى لوحة التحكم'
                : 'Sign in to access your dashboard'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري الدخول...' : 'Signing in...'}
                  </>
                ) : (
                  language === 'ar' ? 'تسجيل الدخول' : 'Sign In'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  {language === 'ar' 
                    ? 'للتجربة، استخدم أي بريد وكلمة مرور'
                    : 'For demo, use any email and password'
                  }
                </p>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/')}
                className="text-muted-foreground"
              >
                {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const Login: React.FC = () => {
  return (
    <LanguageProvider>
      <LoginContent />
    </LanguageProvider>
  );
};
