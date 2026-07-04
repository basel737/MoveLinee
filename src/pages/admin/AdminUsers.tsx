import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi } from '@/lib/adminApi';
import { User, Driver, Office } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Users, Eye, Trash2, Search, Star, Phone, Mail, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [customers, setCustomers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | Driver | null>(null);
  const [assigningUserId, setAssigningUserId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('customers');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('moveline_token'));
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<number>(1);
  const [assignTargetUserId, setAssignTargetUserId] = useState<number | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [officesLoading, setOfficesLoading] = useState(false);

  const translations = {
    en: {
      title: 'Users Management',
      subtitle: 'Manage all platform users',
      customers: 'Customers',
      drivers: 'Drivers',
      workers: 'Workers',
      id: 'ID',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      rating: 'Rating',
      status: 'Status',
      joinedDate: 'Joined',
      actions: 'Actions',
      view: 'View',
      delete: 'Delete',
      userDetails: 'User Details',
      available: 'Available',
      unavailable: 'Unavailable',
      license: 'License Number',
      search: 'Search users...',
      noUsers: 'No users found',
      close: 'Close',
      totalCustomers: 'Total Customers',
      totalDrivers: 'Total Drivers',
      totalWorkers: 'Total Workers',
      deleteConfirm: 'Are you sure you want to delete this user?',
      userDeleted: 'User deleted successfully',
      office: 'Office',
      assignToOffice: 'Assign to Office',
      assigning: 'Assigning...',
      assignSuccess: 'Assigned to office successfully',
      assignError: 'Failed to assign user to office',
      assignOfficeTitle: 'Assign to Office',
      assignOfficeDescription: 'Select an office to assign this user to.',
      selectOffice: 'Select an office',
      confirm: 'Confirm',
      cancel: 'Cancel',
      errorTitle: 'Failed to Load Users',
      errorMessage: 'Unable to fetch users from the server.',
      errorDetails: 'Error Details:',
      retry: 'Retry',
    },
    ar: {
      title: 'إدارة المستخدمين',
      subtitle: 'إدارة جميع مستخدمي المنصة',
      customers: 'العملاء',
      drivers: 'السائقين',
      workers: 'العمال',
      id: 'المعرف',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      rating: 'التقييم',
      status: 'الحالة',
      joinedDate: 'تاريخ الانضمام',
      actions: 'الإجراءات',
      view: 'عرض',
      delete: 'حذف',
      userDetails: 'تفاصيل المستخدم',
      available: 'متاح',
      unavailable: 'غير متاح',
      license: 'رقم الرخصة',
      search: 'البحث عن المستخدمين...',
      noUsers: 'لم يتم العثور على مستخدمين',
      close: 'إغلاق',
      totalCustomers: 'إجمالي العملاء',
      totalDrivers: 'إجمالي السائقين',
      totalWorkers: 'إجمالي العمال',
      deleteConfirm: 'هل أنت متأكد أنك تريد حذف هذا المستخدم؟',
      userDeleted: 'تم حذف المستخدم بنجاح',
      office: 'المكتب',
      assignToOffice: 'إسناد إلى المكتب',
      assigning: 'جاري الإسناد...',
      assignSuccess: 'تم الإسناد إلى المكتب بنجاح',
      assignError: 'فشل إسناد المستخدم إلى المكتب',
      assignOfficeTitle: 'إسناد إلى المكتب',
      assignOfficeDescription: 'اختر مكتباً لإسناد هذا المستخدم إليه.',
      selectOffice: 'اختر مكتباً',
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      errorTitle: 'فشل تحميل المستخدمين',
      errorMessage: 'تعذر جلب المستخدمين من الخادم.',
      errorDetails: 'تفاصيل الخطأ:',
      retry: 'إعادة المحاولة',
    },
  };

  const t = translations[language];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [customersData, driversData, workersData] = await Promise.all([
        adminApi.getAllUsers('customer'),
        adminApi.getAllUsers('driver') as Promise<Driver[]>,
        adminApi.getAllUsers('worker'),
      ]);
      setCustomers(customersData);
      setDrivers(driversData as Driver[]);
      setWorkers(workersData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch users:', errorMessage);
      toast({ 
        title: t.errorTitle, 
        description: `${t.errorMessage} ${t.errorDetails} ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('moveline_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    fetchUsers();
    fetchOffices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchOffices = async () => {
    setOfficesLoading(true);
    try {
      const data = await adminApi.getOffices();
      setOffices(data);
      if (data.length > 0 && !data.some(o => o.id === selectedOffice)) {
        setSelectedOffice(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch offices:', error);
    } finally {
      setOfficesLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('moveline_token');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      await adminApi.deleteUser(userId);
      toast({ title: t.userDeleted });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleAssignToOffice = async (userId: number | string) => {
    const numericUserId = Number(userId);
    if (!Number.isFinite(numericUserId)) return;

    setAssigningUserId(numericUserId);

    try {
      const currentUser = drivers.find((user) => Number(user.id) === numericUserId) || workers.find((user) => Number(user.id) === numericUserId);
      const officeToAssign = selectedOffice;
      const role = currentUser?.role === 'driver' ? 'driver' : 'worker';
      const response = await adminApi.assignUserToOffice(numericUserId, role, officeToAssign);
      const nextOffice = response.driver?.office ?? response.worker?.office ?? null;

      setDrivers((prev) => prev.map((user) => (Number(user.id) === numericUserId ? { ...user, office: nextOffice } : user)));
      setWorkers((prev) => prev.map((user) => (Number(user.id) === numericUserId ? { ...user, office: nextOffice } : user)));
      setSelectedUser((prev) => (prev && Number(prev.id) === numericUserId ? { ...prev, office: nextOffice } : prev));

      toast({
        title: language === 'en' ? 'Success' : 'نجاح',
        description: response.detail || t.assignSuccess,
      });

      setShowAssignDialog(false);
      setAssignTargetUserId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.assignError;
      toast({
        title: t.assignError,
        description: message,
        variant: 'destructive',
      });
    } finally {
      setAssigningUserId(null);
    }
  };

  const filterUsers = (users: (User | Driver)[]) => {
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
    );
  };

  const getOfficeName = (officeId?: number | null) => {
    if (officeId == null) return '—';
    const office = offices.find((office) => office.id === officeId);
    return office?.name || `Office ${officeId}`;
  };

  const renderUserTable = (users: (User | Driver)[], isDriver: boolean = false, showOfficeAction: boolean = false, showRating: boolean = true) => {
    const filteredUsers = filterUsers(users);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.id}</TableHead>
            <TableHead>{t.name}</TableHead>
            <TableHead>{t.email}</TableHead>
            <TableHead>{t.phone}</TableHead>
            {showRating && <TableHead>{t.rating}</TableHead>}
            {isDriver && <TableHead>{t.status}</TableHead>}
            {showOfficeAction && <TableHead>{t.office}</TableHead>}
            <TableHead>{t.joinedDate}</TableHead>
            <TableHead className="text-right">{t.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6 + (isDriver ? 1 : 0) + (showOfficeAction ? 1 : 0) + (showRating ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                {t.noUsers}
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">#{user.id}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                {showRating && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      {((user as User).rating ?? 0).toFixed(1)}
                    </div>
                  </TableCell>
                )}
                {isDriver && (
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        (user as Driver).available
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {(user as Driver).available ? t.available : t.unavailable}
                    </Badge>
                  </TableCell>
                )}
                {showOfficeAction && (
                  <TableCell>{getOfficeName(user.office)}</TableCell>
                )}
                <TableCell>
                  {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {showOfficeAction && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAssignTargetUserId(Number(user.id));
                          setSelectedOffice(user.office ?? 1);
                          setShowAssignDialog(true);
                        }}
                        disabled={assigningUserId === Number(user.id)}
                      >
                        {assigningUserId === Number(user.id) ? t.assigning : t.assignToOffice}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteUser(Number(user.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-destructive text-lg">{t.errorTitle}</h3>
                <p className="text-sm text-muted-foreground mt-2">{t.errorMessage}</p>
              </div>
              
              {/* Error Details Box */}
              <div className="bg-destructive/5 border border-destructive/20 rounded p-4 space-y-2">
                <p className="text-xs font-semibold text-destructive/70">{t.errorDetails}</p>
                <p className="text-sm font-mono text-destructive/80 break-all whitespace-pre-wrap">
                  {error}
                </p>
              </div>

              {/* Troubleshooting Tips */}
              <div className="bg-warning/5 border border-warning/20 rounded p-4 space-y-2">
                <p className="text-xs font-semibold text-warning/70">💡 {language === 'en' ? 'Troubleshooting Tips:' : 'نصائح حل المشاكل:'}</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{language === 'en' ? 'Make sure you are logged in' : 'تأكد من تسجيل دخولك'} {isAuthenticated ? '✓' : '✗'}</li>
                  <li>{language === 'en' ? 'Make sure the backend server is running' : 'تأكد من أن خادم الـ Backend قيد التشغيل'}</li>
                  <li>{language === 'en' ? 'Check your internet connection' : 'تحقق من اتصالك بالإنترنت'}</li>
                  <li>{language === 'en' ? 'Verify the API URL is correct in the configuration' : 'تحقق من صحة رابط الـ API'}</li>
                  <li>{language === 'en' ? 'Check browser console for more details (F12)' : 'افحص وحدة التحكم في المتصفح لمزيد من التفاصيل'}</li>
                </ul>
              </div>
              
              <Button 
                onClick={fetchUsers}
                className="mt-4"
              >
                {t.retry}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Logout */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.totalCustomers}</p>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.totalDrivers}</p>
                <p className="text-2xl font-bold text-foreground">{drivers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.totalWorkers}</p>
                <p className="text-2xl font-bold text-foreground">{workers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="customers">{t.customers}</TabsTrigger>
          <TabsTrigger value="drivers">{t.drivers}</TabsTrigger>
          <TabsTrigger value="workers">{t.workers}</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card className="shadow-card">
            <CardContent className="p-0">
              {renderUserTable(customers, false, false, false)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card className="shadow-card">
            <CardContent className="p-0">
              {renderUserTable(drivers, true, true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers">
          <Card className="shadow-card">
            <CardContent className="p-0">
              {renderUserTable(workers, false, true)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.userDetails}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedUser.fullName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.fullName}</h3>
                  <Badge variant="outline" className="capitalize">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.email}</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.phone}</p>
                    <p className="font-medium">{selectedUser.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.joinedDate}</p>
                    <p className="font-medium">
                      {format(new Date(selectedUser.createdAt), 'PPP')}
                    </p>
                  </div>
                </div>

                {'licenseNumber' in selectedUser && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">
                      #
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.license}</p>
                      <p className="font-medium">{(selectedUser as Driver).licenseNumber}</p>
                    </div>
                  </div>
                )}

                {'rating' in selectedUser && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Star className="w-5 h-5 text-warning fill-warning" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.rating}</p>
                      <p className="font-medium">{(selectedUser as Driver).rating} / 5.0</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Office Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.assignOfficeTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{t.assignOfficeDescription}</p>
            <div className="space-y-2">
              <Label>{t.office}</Label>
              <Select
                value={String(selectedOffice)}
                onValueChange={(value) => setSelectedOffice(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectOffice} />
                </SelectTrigger>
                <SelectContent>
                  {officesLoading && <SelectItem value="loading" disabled>...</SelectItem>}
                  {offices.map((office) => (
                    <SelectItem key={office.id} value={String(office.id)}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignDialog(false);
                setAssignTargetUserId(null);
              }}
              disabled={assigningUserId !== null}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={() => {
                if (assignTargetUserId !== null) {
                  handleAssignToOffice(assignTargetUserId);
                }
              }}
              disabled={assigningUserId !== null}
            >
              {assigningUserId !== null ? t.assigning : t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
