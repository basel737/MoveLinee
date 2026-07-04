import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { workerApi, Worker } from '@/lib/driverApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  CheckCircle,
  ListTodo,
  Clock,
  TrendingUp,
  Wrench,
  Package,
  Box,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const WorkerOverview: React.FC = () => {
  const { language } = useLanguage();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const translations = {
    ar: {
      overview: 'نظرة عامة',
      welcome: 'مرحباً',
      availability: 'متاح للعمل',
      availabilityUpdated: 'تم تحديث الحالة',
      completedTasks: 'المهام المكتملة',
      assignedOrders: 'الطلبات المعينة',
      thisMonthTasks: 'مهام هذا الشهر',
      tasksByRole: 'المهام حسب النوع',
      tasksOverTime: 'المهام عبر الوقت',
      roles: {
        loading: 'تحميل',
        unloading: 'تفريغ',
        packing: 'تغليف',
        disassembly: 'فك وتركيب',
      },
    },
    en: {
      overview: 'Overview',
      welcome: 'Welcome',
      availability: 'Available for work',
      availabilityUpdated: 'Status updated',
      completedTasks: 'Completed Tasks',
      assignedOrders: 'Assigned Orders',
      thisMonthTasks: 'This Month Tasks',
      tasksByRole: 'Tasks by Role',
      tasksOverTime: 'Tasks Over Time',
      roles: {
        loading: 'Loading',
        unloading: 'Unloading',
        packing: 'Packing',
        disassembly: 'Disassembly',
      },
    },
  };

  const t = translations[language];

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workerRes, statsRes] = await Promise.all([
          workerApi.getCurrentWorker(),
          workerApi.getWorkerStats(),
        ]);
        setWorker(workerRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAvailabilityToggle = async (checked: boolean) => {
    try {
      const res = await workerApi.updateAvailability(checked);
      setWorker(res.data);
      toast({
        title: t.availabilityUpdated,
        description: checked
          ? language === 'ar' ? 'أنت الآن متاح للعمل' : 'You are now available'
          : language === 'ar' ? 'أنت غير متاح حالياً' : 'You are now unavailable',
      });
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const tasksByRoleData = stats
    ? Object.entries(stats.tasksByRole).map(([role, count], index) => ({
        name: t.roles[role as keyof typeof t.roles],
        value: count as number,
        color: COLORS[index % COLORS.length],
      }))
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
            {t.welcome}, {worker?.fullName}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'تخصص' : 'Specialty'}: {worker?.specialty}
          </p>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">
              {t.availability}
            </span>
            <Switch
              checked={worker?.available || false}
              onCheckedChange={handleAvailabilityToggle}
            />
            <span
              className={`text-sm font-medium ${
                worker?.available ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {worker?.available
                ? language === 'ar' ? 'متاح' : 'Available'
                : language === 'ar' ? 'غير متاح' : 'Unavailable'}
            </span>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200 dark:border-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.completedTasks}</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.completedTasks || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.assignedOrders}</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.assignedOrders || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <ListTodo className="w-7 h-7 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.thisMonthTasks}</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.thisMonthTasks || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {t.tasksByRole}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {tasksByRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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

        {/* Tasks Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t.tasksOverTime}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.tasksOverTime || []}>
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
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
