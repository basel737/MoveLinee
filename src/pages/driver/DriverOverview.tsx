import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { driverApi, Driver } from '@/lib/driverApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Truck,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export const DriverOverview: React.FC = () => {
  const { language } = useLanguage();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const translations = {
    ar: {
      overview: 'نظرة عامة',
      welcomeBack: 'مرحباً بعودتك',
      availability: 'الحالة',
      available: 'متاح',
      unavailable: 'غير متاح',
      averageRating: 'متوسط التقييم',
      completedOrders: 'الطلبات المكتملة',
      thisMonthOrders: 'طلبات هذا الشهر',
      thisMonthEarnings: 'أرباح هذا الشهر',
      ordersOverTime: 'الطلبات عبر الزمن',
      ratingsDistribution: 'توزيع التقييمات',
      orders: 'طلبات',
      syp: 'ل.س',
      stars: 'نجوم',
    },
    en: {
      overview: 'Overview',
      welcomeBack: 'Welcome back',
      availability: 'Status',
      available: 'Available',
      unavailable: 'Unavailable',
      averageRating: 'Average Rating',
      completedOrders: 'Completed Orders',
      thisMonthOrders: 'This Month Orders',
      thisMonthEarnings: 'This Month Earnings',
      ordersOverTime: 'Orders Over Time',
      ratingsDistribution: 'Ratings Distribution',
      orders: 'orders',
      syp: 'SYP',
      stars: 'stars',
    },
  };

  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driverRes, statsRes] = await Promise.all([
          driverApi.getCurrentDriver(),
          driverApi.getDriverStats(),
        ]);
        setDriver(driverRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAvailabilityChange = async (available: boolean) => {
    if (!driver) return;
    try {
      const res = await driverApi.updateAvailability(available);
      setDriver(res.data);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const ratingsData = stats
    ? Object.entries(stats.ratingsBreakdown).map(([stars, count]) => ({
        stars: `${stars} ${t.stars}`,
        count,
      }))
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t.welcomeBack}, {driver?.fullName}
          </h1>
          <p className="text-muted-foreground mt-1">{t.overview}</p>
        </div>
        
        {/* Availability Toggle */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{t.availability}:</span>
            <Switch
              checked={driver?.available}
              onCheckedChange={handleAvailabilityChange}
            />
            <Badge variant={driver?.available ? 'default' : 'secondary'}>
              {driver?.available ? t.available : t.unavailable}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200 dark:border-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.averageRating}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {driver?.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.completedOrders}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {driver?.completedOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200 dark:border-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.thisMonthOrders}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats?.thisMonthOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.thisMonthEarnings}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats?.thisMonthEarnings.toLocaleString()} {t.syp}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t.ordersOverTime}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.ordersOverTime || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ratings Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              {t.ratingsDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="stars" type="category" className="text-xs" width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
