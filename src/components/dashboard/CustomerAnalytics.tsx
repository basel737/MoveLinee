import React, { useEffect, useState } from 'react';
import { 
  Package, TrendingUp, DollarSign, Clock, Truck, 
  BarChart3, PieChart as PieChartIcon, Activity 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi } from '@/lib/dashboardApi';
import { CustomerAnalytics as CustomerAnalyticsType } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext1';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const CHART_COLORS = {
  primary: 'hsl(142.1 76.2% 36.3%)',
  secondary: 'hsl(142.1 76.2% 46.3%)',
  tertiary: 'hsl(142.1 50% 56.3%)',
  quaternary: 'hsl(142.1 30% 66.3%)',
  muted: 'hsl(240 4.8% 95.9%)',
};

const STATUS_COLORS = {
  pending: 'hsl(45 93% 47%)',
  confirmed: 'hsl(199 89% 48%)',
  'in-transit': 'hsl(262 83% 58%)',
  completed: 'hsl(142 76% 36%)',
  cancelled: 'hsl(0 84% 60%)',
};

const SERVICE_COLORS = {
  furniture: 'hsl(142.1 76.2% 36.3%)',
  office: 'hsl(199 89% 48%)',
  storage: 'hsl(45 93% 47%)',
  intercity: 'hsl(262 83% 58%)',
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  colorClass?: string;
}

const AnalyticsStatCard: React.FC<StatCardProps> = ({ 
  title, value, icon: Icon, description, trend, colorClass = 'bg-primary/10 text-primary' 
}) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const CustomerAnalytics: React.FC = () => {
  const { language } = useLanguage();
  const [analytics, setAnalytics] = useState<CustomerAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await dashboardApi.getCustomerAnalytics();
        setAnalytics(response.data);
      } catch (err) {
        setError(language === 'ar' ? 'فشل في تحميل التحليلات' : 'Failed to load analytics');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [language]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center text-destructive">
          {error || (language === 'ar' ? 'لا توجد بيانات' : 'No data available')}
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const statusData = Object.entries(analytics.ordersByStatus)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
      value,
      fill: STATUS_COLORS[key as keyof typeof STATUS_COLORS] || CHART_COLORS.muted,
    }));

  const serviceData = Object.entries(analytics.ordersByService)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      fill: SERVICE_COLORS[key as keyof typeof SERVICE_COLORS] || CHART_COLORS.primary,
    }));

  const serviceLabels: Record<string, string> = {
    Furniture: language === 'ar' ? 'نقل أثاث' : 'Furniture',
    Office: language === 'ar' ? 'نقل مكاتب' : 'Office',
    Storage: language === 'ar' ? 'تخزين' : 'Storage',
    Intercity: language === 'ar' ? 'نقل بين المدن' : 'Intercity',
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {language === 'ar' ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'ar' 
            ? 'نظرة شاملة على نشاطك وإنفاقك'
            : 'A comprehensive overview of your activity and spending'
          }
        </p>
      </div>

      {/* Extended Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStatCard
          title={language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
          value={analytics.totalOrders}
          icon={Package}
          description={language === 'ar' ? 'جميع الطلبات' : 'All time'}
          colorClass="bg-primary/10 text-primary"
        />
        <AnalyticsStatCard
          title={language === 'ar' ? 'الطلبات المكتملة' : 'Completed Orders'}
          value={analytics.completedOrders}
          icon={TrendingUp}
          description={`${Math.round((analytics.completedOrders / analytics.totalOrders) * 100)}% ${language === 'ar' ? 'معدل الإكمال' : 'completion rate'}`}
          colorClass="bg-green-500/10 text-green-600"
        />
        <AnalyticsStatCard
          title={language === 'ar' ? 'الطلبات النشطة' : 'Active Orders'}
          value={analytics.activeOrders}
          icon={Truck}
          description={language === 'ar' ? 'قيد التنفيذ' : 'In progress'}
          colorClass="bg-amber-500/10 text-amber-600"
        />
        <AnalyticsStatCard
          title={language === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}
          value={`$${analytics.totalSpent.toLocaleString()}`}
          icon={DollarSign}
          trend={language === 'ar' ? '+12% هذا الشهر' : '+12% this month'}
          colorClass="bg-blue-500/10 text-blue-600"
        />
        <AnalyticsStatCard
          title={language === 'ar' ? 'متوسط تكلفة الطلب' : 'Avg Order Cost'}
          value={`$${analytics.averageOrderCost}`}
          icon={BarChart3}
          colorClass="bg-purple-500/10 text-purple-600"
        />
        <AnalyticsStatCard
          title={language === 'ar' ? 'متوسط وقت التوصيل' : 'Avg Delivery Time'}
          value={`${analytics.averageDeliveryTime}h`}
          icon={Clock}
          description={language === 'ar' ? 'ساعات' : 'hours'}
          colorClass="bg-teal-500/10 text-teal-600"
        />
        <AnalyticsStatCard
          title={language === 'ar' ? 'الخدمة الأكثر استخداماً' : 'Most Used Service'}
          value={analytics.mostUsedService}
          icon={PieChartIcon}
          colorClass="bg-indigo-500/10 text-indigo-600"
        />
        <AnalyticsStatCard
          title={language === 'ar' ? 'الطلبات الملغاة' : 'Cancelled Orders'}
          value={analytics.cancelledOrders}
          icon={Package}
          description={`${Math.round((analytics.cancelledOrders / analytics.totalOrders) * 100)}% ${language === 'ar' ? 'معدل الإلغاء' : 'cancellation rate'}`}
          colorClass="bg-red-500/10 text-red-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'الطلبات عبر الزمن' : 'Orders Over Time'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.ordersByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name={language === 'ar' ? 'الطلبات' : 'Orders'}
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: CHART_COLORS.primary }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'توزيع حالة الطلبات' : 'Order Status Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending Overview - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'نظرة عامة على الإنفاق' : 'Spending Overview'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.spendingByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value}`, language === 'ar' ? 'الإنفاق' : 'Spending']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill={CHART_COLORS.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Type Usage - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'استخدام أنواع الخدمات' : 'Service Type Usage'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData.map(d => ({
                      ...d,
                      name: serviceLabels[d.name] || d.name,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
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
    </div>
  );
};
