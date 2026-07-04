import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { useNavigate } from 'react-router-dom';
import { workerApi, WorkerTask } from '@/lib/driverApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  Package,
  MapPin,
  Clock,
  ChevronRight,
  Play,
  CheckCircle,
  Wrench,
  Box,
  Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export const WorkerTasks: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const translations = {
    ar: {
      assignedTasks: 'المهام المعينة',
      noTasks: 'لا توجد مهام معينة حالياً',
      checkBackLater: 'سيتم إعلامك عند تعيين مهام جديدة',
      pickup: 'نقطة الاستلام',
      dropoff: 'نقطة التسليم',
      scheduledAt: 'الموعد المحدد',
      viewDetails: 'عرض التفاصيل',
      startTask: 'بدء المهمة',
      completeTask: 'إكمال المهمة',
      taskStarted: 'تم بدء المهمة',
      taskCompleted: 'تم إكمال المهمة',
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
      assignedTasks: 'Assigned Tasks',
      noTasks: 'No tasks assigned right now',
      checkBackLater: 'You will be notified when new tasks are assigned',
      pickup: 'Pickup Location',
      dropoff: 'Dropoff Location',
      scheduledAt: 'Scheduled At',
      viewDetails: 'View Details',
      startTask: 'Start Task',
      completeTask: 'Complete Task',
      taskStarted: 'Task Started',
      taskCompleted: 'Task Completed',
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
    const fetchTasks = async () => {
      try {
        const res = await workerApi.getAssignedTasks();
        setTasks(res.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: number, newStatus: 'in_progress' | 'done') => {
    setUpdatingId(taskId);
    try {
      await workerApi.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, workerStatus: newStatus } : task
      ));
      toast({
        title: newStatus === 'in_progress' ? t.taskStarted : t.taskCompleted,
      });
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'loading':
      case 'unloading':
        return <Box className="w-4 h-4" />;
      case 'packing':
        return <Package className="w-4 h-4" />;
      case 'disassembly':
        return <Wrench className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
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
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.assignedTasks}
        </h1>
        <p className="text-muted-foreground mt-1">
          {tasks.length} {language === 'ar' ? 'مهمة' : 'tasks'}
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{t.noTasks}</h3>
          <p className="text-muted-foreground mt-2">{t.checkBackLater}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Task Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {getRoleIcon(task.role)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">
                              {t.roles[task.role as keyof typeof t.roles]}
                            </Badge>
                            <Badge className={getStatusColor(task.workerStatus)}>
                              {t.statuses[task.workerStatus as keyof typeof t.statuses]}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {t.serviceTypes[task.serviceType as keyof typeof t.serviceTypes] || task.serviceType}
                          </h3>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        #{task.orderId}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Pickup */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.pickup}</p>
                          <p className="font-medium text-foreground">{task.pickupAddress}</p>
                        </div>
                      </div>

                      {/* Dropoff */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.dropoff}</p>
                          <p className="font-medium text-foreground">{task.dropoffAddress}</p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.scheduledAt}</p>
                          <p className="font-medium text-foreground">
                            {format(new Date(task.scheduledAt), 'PPp', {
                              locale: language === 'ar' ? ar : enUS,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {task.notes && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{task.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="lg:w-56 p-6 bg-muted/30 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-s">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/worker/tasks/${task.id}`)}
                    >
                      {t.viewDetails}
                      <ChevronRight className="w-4 h-4 ms-2" />
                    </Button>
                    
                    {task.workerStatus === 'pending' && (
                      <Button
                        className="w-full"
                        onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                        disabled={updatingId === task.id}
                      >
                        {updatingId === task.id ? (
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
                        onClick={() => handleUpdateStatus(task.id, 'done')}
                        disabled={updatingId === task.id}
                      >
                        {updatingId === task.id ? (
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full me-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 me-2" />
                        )}
                        {t.completeTask}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
