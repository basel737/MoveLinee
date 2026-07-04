import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, DollarSign, Star, ArrowRight, MapPin, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/lib/dashboardApi';
import { DashboardStats, DashboardOrder } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext1';
import { useAuth } from '@/context/AuthContext';
import { CustomerAnalytics } from '@/components/dashboard/CustomerAnalytics';

const getStatusBadge = (status: string, language: string) => {
  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; labelAr: string }> = {
    'pending': { variant: 'secondary', label: 'Pending', labelAr: 'قيد الانتظار' },
    'confirmed': { variant: 'outline', label: 'Confirmed', labelAr: 'مؤكد' },
    'driver-assigned': { variant: 'outline', label: 'Driver Assigned', labelAr: 'تم تعيين السائق' },
    'in-transit': { variant: 'default', label: 'In Transit', labelAr: 'في الطريق' },
    'arrived': { variant: 'default', label: 'Arrived', labelAr: 'وصل' },
    'completed': { variant: 'secondary', label: 'Completed', labelAr: 'مكتمل' },
  };

  const config = statusConfig[status] || statusConfig['pending'];
  return (
    <Badge variant={config.variant}>
      {language === 'ar' ? config.labelAr : config.label}
    </Badge>
  );
};

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          dashboardApi.getDashboardStats(),
          dashboardApi.getOrders(),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 3));
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ar' ? `مرحباً، ${user?.fullName}` : `Welcome back, ${user?.fullName}`}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'إليك نظرة عامة على طلباتك ونشاطك'
            : "Here's an overview of your orders and activity"
          }
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? 'الطلبات النشطة' : 'Active Orders'}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.activeOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? 'الطلبات المكتملة' : 'Completed'}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.completedOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? 'إجمالي المدفوعات' : 'Total Paid'}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  ${stats?.totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start gap-2" 
              onClick={() => navigate('/quote')}
            >
              <Package className="w-4 h-4" />
              {language === 'ar' ? 'إنشاء طلب جديد' : 'Create New Order'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/dashboard/track')}
            >
              <MapPin className="w-4 h-4" />
              {language === 'ar' ? 'تتبع طلب' : 'Track an Order'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/dashboard/payments')}
            >
              <CreditCard className="w-4 h-4" />
              {language === 'ar' ? 'عرض المدفوعات' : 'View Payments'}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{language === 'ar' ? 'الطلبات الأخيرة' : 'Recent Orders'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/orders')}>
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.serviceType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status, language)}
                    <p className="text-sm text-muted-foreground mt-1">
                      ${order.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Rating */}
      {stats && stats.averageRating > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? 'متوسط تقييماتك' : 'Your Average Rating'}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.averageRating} / 5.0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Analytics Section */}
      <CustomerAnalytics />
    </div>
  );
};
