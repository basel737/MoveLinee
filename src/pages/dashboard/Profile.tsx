import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext1';
import { toast } from 'sonner';

export const Profile: React.FC = () => {
  const { language } = useLanguage();
  const { user, updateProfile, isLoading: authLoading } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setHasChanges(
        fullName !== user.fullName ||
        email !== user.email ||
        phone !== user.phone
      );
    }
  }, [fullName, email, phone, user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        fullName,
        email,
        phone,
      });
      toast.success(
        language === 'ar' 
          ? 'تم تحديث الملف الشخصي بنجاح'
          : 'Profile updated successfully'
      );
      setHasChanges(false);
    } catch (err) {
      toast.error(
        language === 'ar'
          ? 'فشل تحديث الملف الشخصي'
          : 'Failed to update profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'عرض وتعديل معلوماتك الشخصية'
            : 'View and edit your personal information'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {user ? getInitials(user.fullName) : 'U'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">{user?.fullName}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="mt-4 w-full pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'عضو منذ' : 'Member since'}
                </span>
                <span className="font-medium">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })
                    : '-'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'معلومات الحساب' : 'Account Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 50 xxx xxxx"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="min-w-32"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'الأمان' : 'Security'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">
                {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'تحديث كلمة المرور الخاصة بك'
                  : 'Update your account password'
                }
              </p>
            </div>
            <Button variant="outline">
              {language === 'ar' ? 'تغيير' : 'Change'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
