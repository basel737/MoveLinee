import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { useParams, useNavigate } from 'react-router-dom';
import { workerApi, WorkerTask } from '@/lib/driverApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  Box,
  AlertTriangle,
  Wrench,
  Play,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export const WorkerTaskDetails: React.FC = () => {
  const { language } = useLanguage();
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<WorkerTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const translations = {
    ar: {
      taskDetails: 'تفاصيل المهمة',
      back: 'رجوع',
      pickup: 'نقطة الاستلام',
      dropoff: 'نقطة التسليم',
      scheduledAt: 'الموعد المحدد',
      orderItems: 'عناصر الطلب',
      notes: 'ملاحظات',
      fragile: 'قابل للكسر',
      needsDisassembly: 'يحتاج فك',
      startTask: 'بدء المهمة',
      completeTask: 'إكمال المهمة',
      taskStarted: 'تم بدء المهمة',
      taskCompleted: 'تم إكمال المهمة بنجاح!',
      taskNotFound: 'لم يتم العثور على المهمة',
      m3: 'م³',
      roles: {
        loading: 'تحميل',
        unloading: 'تفريغ',
        packing: 'تغليف',
        disassembly: 'فك وتركيب',
      },
      statuses: {
        pending: 'قيد الانتظار',
        in_progress: 'قيد التنفيذ',
        done: 'مكتمل',
      },
      serviceTypes: {
        furniture_moving: 'نقل أثاث',
        office_moving: 'نقل مكاتب',
        small_items: 'أغراض صغيرة',
      },
    },
    en: {
      taskDetails: 'Task Details',
      back: 'Back',
      pickup: 'Pickup Location',
      dropoff: 'Dropoff Location',
      scheduledAt: 'Scheduled At',
      orderItems: 'Order Items',
      notes: 'Notes',
      fragile: 'Fragile',
      needsDisassembly: 'Needs Disassembly',
      startTask: 'Start Task',
      completeTask: 'Complete Task',
      taskStarted: 'Task Started',
      taskCompleted: 'Task completed successfully!',
      taskNotFound: 'Task not found',
      m3: 'm³',
      roles: {
        loading: 'Loading',
        unloading: 'Unloading',
        packing: 'Packing',
        disassembly: 'Disassembly',
      },
      statuses: {
        pending: 'Pending',
        in_progress: 'In Progress',
        done: 'Completed',
      },
      serviceTypes: {
        furniture_moving: 'Furniture Moving',
        office_moving: 'Office Moving',
        small_items: 'Small Items',
      },
    },
  };

  const t = translations[language];

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      try {
        const res = await workerApi.getTaskDetails(parseInt(taskId));
        setTask(res.data || null);
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleUpdateStatus = async (newStatus: 'in_progress' | 'done') => {
    if (!task) return;
    setUpdating(true);
    try {
      const res = await workerApi.updateTaskStatus(task.id, newStatus);
      setTask(res.data || null);
      toast({
        title: newStatus === 'in_progress' ? t.taskStarted : t.taskCompleted,
      });
      if (newStatus === 'done') {
        navigate('/worker/tasks');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/worker/tasks')}>
          <ArrowLeft className="w-4 h-4 me-2" />
          {t.back}
        </Button>
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{t.taskNotFound}</h3>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/worker/tasks')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t.taskDetails}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'طلب' : 'Order'} #{task.orderId}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(task.workerStatus)}>
          {t.statuses[task.workerStatus as keyof typeof t.statuses]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {t.serviceTypes[task.serviceType as keyof typeof t.serviceTypes] || task.serviceType}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {t.roles[task.role as keyof typeof t.roles]}
                </Badge>
              </div>

              {/* Pickup */}
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">{t.pickup}</p>
                  <p className="text-foreground font-semibold">{task.pickupAddress}</p>
                </div>
              </div>

              {/* Dropoff */}
              <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{t.dropoff}</p>
                  <p className="text-foreground font-semibold">{task.dropoffAddress}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.scheduledAt}</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(task.scheduledAt), 'PPp', {
                      locale: language === 'ar' ? ar : enUS,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          {task.items && task.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-primary" />
                  {t.orderItems}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Box className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x • {item.volumeM3} {t.m3}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {item.fragile && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            <AlertTriangle className="w-3 h-3 me-1" />
                            {t.fragile}
                          </Badge>
                        )}
                        {item.needsDisassembly && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            <Wrench className="w-3 h-3 me-1" />
                            {t.needsDisassembly}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'إجراءات' : 'Actions'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.workerStatus === 'pending' && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleUpdateStatus('in_progress')}
                  disabled={updating}
                >
                  {updating ? (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full me-2" />
                  ) : (
                    <Play className="w-4 h-4 me-2" />
                  )}
                  {t.startTask}
                </Button>
              )}
              
              {task.workerStatus === 'in_progress' && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={() => handleUpdateStatus('done')}
                  disabled={updating}
                >
                  {updating ? (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full me-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 me-2" />
                  )}
                  {t.completeTask}
                </Button>
              )}

              {task.workerStatus === 'done' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-700 dark:text-green-400">
                    {t.taskCompleted}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {task.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t.notes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-foreground">{task.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
