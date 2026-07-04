import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi, AdminStats, OrderStatusCounts, RevenueData, VehicleUsage } from '@/lib/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Truck, CreditCard, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(142, 50%, 48%)', 'hsl(142, 50%, 60%)', 'hsl(142, 50%, 72%)'];

export const AdminOverview: React.FC = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orderCounts, setOrderCounts] = useState<OrderStatusCounts | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [vehicleUsage, setVehicleUsage] = useState<VehicleUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      title: 'Dashboard Overview',
      subtitle: 'Monitor your business performance',
      totalOrders: 'Total Orders',
      activeOrders: 'Active Orders',
      completedOrders: 'Completed',
      pendingOrders: 'Pending',
      totalRevenue: 'Total Revenue',
      customers: 'Customers',
      drivers: 'Drivers',
      vehicles: 'Vehicles Available',
      avgRating: 'Avg. Rating',
      ordersByStatus: 'Orders by Status',
      revenueOverTime: 'Revenue Over Time',
      vehicleUsage: 'Vehicle Usage',
      sar: 'SAR',
    },
    ar: {
      title: 'نظرة عامة على لوحة التحكم',
      subtitle: 'راقب أداء عملك',
      totalOrders: 'إجمالي الطلبات',
      activeOrders: 'الطلبات النشطة',
      completedOrders: 'المكتملة',
      pendingOrders: 'قيد الانتظار',
      totalRevenue: 'إجمالي الإيرادات',
      customers: 'العملاء',
      drivers: 'السائقين',
      vehicles: 'المركبات المتاحة',
      avgRating: 'متوسط التقييم',
      ordersByStatus: 'الطلبات حسب الحالة',
      revenueOverTime: 'الإيرادات عبر الوقت',
      vehicleUsage: 'استخدام المركبات',
      sar: 'ر.س',
    },
  };

  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData, revenue, usage] = await Promise.all([
          adminApi.getAdminStats(),
          adminApi.getOrderStatusCounts(),
          adminApi.getRevenueData(),
          adminApi.getVehicleUsage(),
        ]);
        setStats(statsData);
        setOrderCounts(ordersData);
        setRevenueData(revenue);
        setVehicleUsage(usage);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const orderStatusData = orderCounts
    ? [
        { name: 'Pending', value: orderCounts.pending, fill: 'hsl(38, 92%, 50%)' },
        { name: 'Confirmed', value: orderCounts.confirmed, fill: 'hsl(200, 80%, 50%)' },
        { name: 'Assigned', value: orderCounts['driver-assigned'], fill: 'hsl(280, 60%, 50%)' },
        { name: 'In Transit', value: orderCounts['in-transit'], fill: 'hsl(142, 50%, 48%)' },
        { name: 'Completed', value: orderCounts.completed, fill: 'hsl(142, 60%, 40%)' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalOrders}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.activeOrders}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats?.activeOrders || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalRevenue}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats?.totalRevenue?.toLocaleString() || 0} <span className="text-sm">{t.sar}</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.avgRating}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats?.averageRating || 0} <Star className="inline w-5 h-5 text-warning fill-warning" />
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.customers}</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalCustomers || 0}</p>
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
                <p className="text-sm text-muted-foreground">{t.drivers}</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalDrivers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.vehicles}</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.availableVehicles || 0}/{stats?.totalVehicles || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">{t.ordersByStatus}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Over Time */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">{t.revenueOverTime}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value} ${t.sar}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(142, 50%, 48%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(142, 50%, 48%)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Usage Pie Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.vehicleUsage}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ type, percentage }) => `${type} (${percentage}%)`}
                >
                  {vehicleUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
