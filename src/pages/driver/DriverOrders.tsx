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
  DollarSign,
  CheckCircle,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export const DriverOrders: React.FC = () => {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const translations = {
    ar: {
      availableOrders: 'الطلبات المتاحة',
      noOrders: 'لا توجد طلبات متاحة حالياً',
      checkBackLater: 'تحقق لاحقاً للعثور على طلبات جديدة',
      pickup: 'نقطة الاستلام',
      dropoff: 'نقطة التسليم',
      scheduledAt: 'الموعد المحدد',
      price: 'السعر',
      acceptOrder: 'قبول الطلب',
      accepting: 'جاري القبول...',
      orderAccepted: 'تم قبول الطلب',
      orderAcceptedDesc: 'يمكنك الآن رؤية تفاصيل الطلب في صفحة الطلب النشط',
      serviceTypes: {
        furniture_moving: 'نقل أثاث',
        office_moving: 'نقل مكاتب',
        small_items: 'أغراض صغيرة',
        packing_only: 'تغليف فقط',
      },
      syp: 'ل.س',
    },
    en: {
      availableOrders: 'Available Orders',
      noOrders: 'No orders available right now',
      checkBackLater: 'Check back later to find new orders',
      pickup: 'Pickup Location',
      dropoff: 'Dropoff Location',
      scheduledAt: 'Scheduled At',
      price: 'Price',
      acceptOrder: 'Accept Order',
      accepting: 'Accepting...',
      orderAccepted: 'Order Accepted',
      orderAcceptedDesc: 'You can now view order details in the Active Order page',
      serviceTypes: {
        furniture_moving: 'Furniture Moving',
        office_moving: 'Office Moving',
        small_items: 'Small Items',
        packing_only: 'Packing Only',
      },
      syp: 'SYP',
    },
  };

  const t = translations[language];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await driverApi.getPendingOrders();
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleAcceptOrder = async (orderId: number) => {
    setAcceptingId(orderId);
    try {
      await driverApi.acceptOrder(orderId);
      setOrders(orders.filter(o => o.id !== orderId));
      toast({
        title: t.orderAccepted,
        description: t.orderAcceptedDesc,
      });
    } catch (error) {
      console.error('Error accepting order:', error);
    } finally {
      setAcceptingId(null);
    }
  };

  const getServiceTypeLabel = (type: string) => {
    return t.serviceTypes[type as keyof typeof t.serviceTypes] || type;
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
          {t.availableOrders}
        </h1>
        <p className="text-muted-foreground mt-1">
          {orders.length} {language === 'ar' ? 'طلب متاح' : 'orders available'}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{t.noOrders}</h3>
          <p className="text-muted-foreground mt-2">{t.checkBackLater}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Order Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2">{getServiceTypeLabel(order.serviceType)}</Badge>
                        <h3 className="text-lg font-semibold text-foreground">
                          {language === 'ar' ? 'طلب' : 'Order'} #{order.id}
                        </h3>
                      </div>
                      <div className="text-end">
                        <p className="text-2xl font-bold text-primary">
                          {order.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.syp}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Pickup */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.pickup}</p>
                          <p className="font-medium text-foreground">{order.pickupAddress}</p>
                        </div>
                      </div>

                      {/* Dropoff */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t.dropoff}</p>
                          <p className="font-medium text-foreground">{order.dropoffAddress}</p>
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
                            {format(new Date(order.scheduledAt), 'PPp', {
                              locale: language === 'ar' ? ar : enUS,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Section */}
                  <div className="lg:w-48 p-6 bg-muted/30 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-s">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={acceptingId === order.id}
                    >
                      {acceptingId === order.id ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full me-2" />
                          {t.accepting}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 me-2" />
                          {t.acceptOrder}
                        </>
                      )}
                    </Button>
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
