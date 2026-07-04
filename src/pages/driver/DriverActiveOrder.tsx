import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { driverApi, DriverOrder } from '@/lib/driverApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  Package,
  MapPin,
  Clock,
  Truck,
  Users,
  Box,
  AlertTriangle,
  Wrench,
  Play,
  Loader2,
  CheckCircle,
  Navigation,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export const DriverActiveOrder: React.FC = () => {
  const { language } = useLanguage();
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const translations = {
    ar: {
      activeOrder: 'الطلب النشط',
      noActiveOrder: 'لا يوجد طلب نشط حالياً',
      browseOrders: 'تصفح الطلبات المتاحة',
      pickup: 'نقطة الاستلام',
      dropoff: 'نقطة التسليم',
      scheduledAt: 'الموعد المحدد',
      status: 'الحالة',
      vehicle: 'المركبة',
      workers: 'العمال المعينون',
      orderItems: 'عناصر الطلب',
      updateStatus: 'تحديث الحالة',
      fragile: 'قابل للكسر',
      needsDisassembly: 'يحتاج فك',
      statusOptions: {
        confirmed: 'مؤكد',
        in_transit: 'في الطريق',
        loading: 'جاري التحميل',
        unloading: 'جاري التفريغ',
        completed: 'مكتمل',
      },
      statusLabels: {
        pending: 'قيد الانتظار',
        confirmed: 'مؤكد',
        in_progress: 'قيد التنفيذ',
        completed: 'مكتمل',
      },
      vehicleTypes: {
        small_van: 'فان صغير',
        medium_truck: 'شاحنة متوسطة',
        large_truck: 'شاحنة كبيرة',
      },
      capacity: 'السعة',
      m3: 'م³',
      statusUpdated: 'تم تحديث الحالة',
      orderCompleted: 'تم إكمال الطلب بنجاح!',
    },
    en: {
      activeOrder: 'Active Order',
      noActiveOrder: 'No active order right now',
      browseOrders: 'Browse available orders',
      pickup: 'Pickup Location',
      dropoff: 'Dropoff Location',
      scheduledAt: 'Scheduled At',
      status: 'Status',
      vehicle: 'Vehicle',
      workers: 'Assigned Workers',
      orderItems: 'Order Items',
      updateStatus: 'Update Status',
      fragile: 'Fragile',
      needsDisassembly: 'Needs Disassembly',
      statusOptions: {
        confirmed: 'Confirmed',
        in_transit: 'In Transit',
        loading: 'Loading',
        unloading: 'Unloading',
        completed: 'Completed',
      },
      statusLabels: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        in_progress: 'In Progress',
        completed: 'Completed',
      },
      vehicleTypes: {
        small_van: 'Small Van',
        medium_truck: 'Medium Truck',
        large_truck: 'Large Truck',
      },
      capacity: 'Capacity',
      m3: 'm³',
      statusUpdated: 'Status Updated',
      orderCompleted: 'Order completed successfully!',
    },
  };

  const t = translations[language];

  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        const res = await driverApi.getActiveOrder();
        setOrder(res.data);
      } catch (error) {
        console.error('Error fetching active order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveOrder();
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const res = await driverApi.updateOrderStatus(order.id, newStatus);
      setOrder(res.data);
      toast({
        title: t.statusUpdated,
        description: newStatus === 'completed' ? t.orderCompleted : '',
      });
      if (newStatus === 'completed') {
        setOrder(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.activeOrder}
        </h1>
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{t.noActiveOrder}</h3>
          <Button className="mt-4" asChild>
            <a href="/driver/orders">{t.browseOrders}</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t.activeOrder}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'طلب' : 'Order'} #{order.id}
          </p>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {t.statusLabels[order.status as keyof typeof t.statusLabels]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                {language === 'ar' ? 'تفاصيل المواقع' : 'Location Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">{t.pickup}</p>
                  <p className="text-foreground font-semibold">{order.pickupAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{t.dropoff}</p>
                  <p className="text-foreground font-semibold">{order.dropoffAddress}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t.scheduledAt}</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(order.scheduledAt), 'PPp', {
                      locale: language === 'ar' ? ar : enUS,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-primary" />
                  {t.orderItems}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item) => (
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
          {/* Status Control */}
          <Card>
            <CardHeader>
              <CardTitle>{t.updateStatus}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(t.statusOptions).map(([key, label]) => (
                <Button
                  key={key}
                  variant={order.status === key ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleUpdateStatus(key)}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  ) : key === 'completed' ? (
                    <CheckCircle className="w-4 h-4 me-2" />
                  ) : (
                    <Play className="w-4 h-4 me-2" />
                  )}
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Vehicle */}
          {order.vehicle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {t.vehicle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold text-foreground">
                    {t.vehicleTypes[order.vehicle.type as keyof typeof t.vehicleTypes]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.capacity}: {order.vehicle.capacityM3} {t.m3}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workers */}
          {order.workers && order.workers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t.workers}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.workers.map((worker) => (
                  <div key={worker.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{worker.fullName}</p>
                      <p className="text-sm text-muted-foreground">{worker.phone}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
