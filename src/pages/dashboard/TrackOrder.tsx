import React, { useEffect, useState } from 'react';
import { MapPin, Truck, Phone, Clock, Package, RefreshCw, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dashboardApi } from '@/lib/dashboardApi';
import { DashboardOrder, Tracking } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext1';
import { useSearchParams } from 'react-router-dom';
import { MapComponent } from '@/components/map/MapComponent';
import { useVehicleTracking } from '@/hooks/useVehicleTracking';

export const TrackOrder: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('order');
  
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || '');
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [staticPickup, setStaticPickup] = useState<[number, number] | undefined>(undefined);
  const [staticDestination, setStaticDestination] = useState<[number, number] | undefined>(undefined);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Use the custom hook for real-time tracking
  // We pass the static destination so the hook can fetch the route
  const { 
    data: liveTracking, 
    route, 
    isLoading: isTrackingLoading, 
    error: trackingError 
  } = useVehicleTracking({
    orderId: selectedOrderId, // In reality this might be the vehicle ID or order ID
    destination: staticDestination,
    pollInterval: 4000
  });

  // Fetch trackable orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await dashboardApi.getOrders();
        const trackable = response.data.filter(o => 
          ['driver-assigned', 'assigned', 'in-transit', 'in_progress', 'arrived'].includes(o.status)
        );
        setOrders(trackable);
        
        if (initialOrderId && trackable.find(o => o.id.toString() === initialOrderId)) {
          setSelectedOrderId(initialOrderId);
        } else if (trackable.length > 0) {
          setSelectedOrderId(trackable[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [initialOrderId]);

  // Fetch static order details and destination coordinates (from mock/db)
  useEffect(() => {
    if (!selectedOrderId) return;

    const fetchOrderDetails = async () => {
      try {
        const orderId = parseInt(selectedOrderId);
        
        // Fetch order details first
        try {
          const orderRes = await dashboardApi.getOrder(orderId);
          setSelectedOrder(orderRes.data);
          
          // Set coordinates from order data
          const orderData = orderRes.data;
          if (orderData.pickup_latitude && orderData.pickup_longitude) {
            setStaticPickup([parseFloat(orderData.pickup_latitude), parseFloat(orderData.pickup_longitude)]);
          }
          if (orderData.dropoff_latitude && orderData.dropoff_longitude) {
            setStaticDestination([parseFloat(orderData.dropoff_latitude), parseFloat(orderData.dropoff_longitude)]);
          }
        } catch (err) {
          console.error('Failed to fetch order details:', err);
        }

        // Fetch tracking separately so it doesn't block order details
        try {
          const trackingRes = await dashboardApi.getTracking(orderId);
          const trackingData = trackingRes.data as any;
          if (trackingData && trackingData.destinationLat && trackingData.destinationLng) {
            setStaticDestination([trackingData.destinationLat, trackingData.destinationLng]);
          }
        } catch (err) {
          console.warn('Tracking not available for this order yet:', err);
        }
      } catch (err) {
        console.error('General error in fetchOrderDetails:', err);
      }
    };

    fetchOrderDetails();
  }, [selectedOrderId]);

  // Derived state for display
  const currentPosition: [number, number] | undefined = liveTracking 
    ? [liveTracking.latitude, liveTracking.longitude]
    : undefined;

  const center: [number, number] = currentPosition || staticDestination || [24.7136, 46.6753]; // Default to Riyadh

  const roadDistanceKm = route ? (route.distance / 1000).toFixed(1) : null;
  const roadDurationMin = route ? Math.round(route.duration / 60) : null;

  if (isLoadingOrders) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'تتبع موقع سيارتك في الوقت الفعلي'
            : 'Track your vehicle location in real-time'
          }
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'لا توجد طلبات نشطة للتتبع'
                : 'No active orders to track'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Order Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'اختر طلب' : 'Select an order'} />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id.toString()}>
                          #{order.id} - {order.serviceType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Status Indicator */}
                {isTrackingLoading && (
                   <span className="text-sm text-muted-foreground animate-pulse">
                     {language === 'ar' ? 'جاري الاتصال...' : 'Connecting...'}
                   </span>
                )}
                {trackingError && (
                   <span className="text-sm text-destructive">
                     {language === 'ar' ? 'خطأ في الاتصال' : 'Connection Error'}
                   </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <Card className="lg:col-span-2 overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0 h-[500px] relative">
                  <MapComponent
                    center={center}
                    zoom={14}
                    truckPosition={currentPosition}
                    truckData={liveTracking?.eta}
                    pickupPosition={staticPickup}
                    destinationPosition={staticDestination}
                    routeCoordinates={route?.coordinates}
                  />
                  
                  {/* Overlay Info */}
                  {route && (
                    <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur p-4 rounded-lg shadow-lg border z-[1000] flex justify-around">
                       <div className="text-center">
                          <p className="text-xs text-muted-foreground uppercase">{language === 'ar' ? 'المسافة' : 'Distance'}</p>
                          <p className="text-xl font-bold flex items-center justify-center gap-1">
                            <Navigation className="w-4 h-4 text-primary" />
                            {roadDistanceKm} km
                          </p>
                       </div>
                       <div className="text-center">
                          <p className="text-xs text-muted-foreground uppercase">{language === 'ar' ? 'الوقت المقدر' : 'Est. Time'}</p>
                          <p className="text-xl font-bold flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4 text-primary" />
                            {roadDurationMin} min
                          </p>
                       </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedOrder && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'رقم الطلب' : 'Order ID'}
                      </p>
                      <p className="font-medium">#{selectedOrder.id}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'الحالة' : 'Status'}
                      </p>
                      <Badge variant="default" className="mt-1">
                        {liveTracking?.order_status || selectedOrder.status}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {language === 'ar' ? 'من' : 'From'}
                      </p>
                      <p className="font-medium text-sm">{selectedOrder.pickupAddress}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {language === 'ar' ? 'إلى' : 'To'}
                      </p>
                      <p className="font-medium text-sm">{selectedOrder.dropoffAddress}</p>
                    </div>

                    {liveTracking && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {language === 'ar' ? 'الوصول المتوقع' : 'ETA (Live)'}
                        </p>
                        <p className="font-medium text-sm text-primary">
                          {liveTracking.eta}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <Button className="w-full gap-2">
                        <Phone className="w-4 h-4" />
                        {language === 'ar' ? 'اتصل بالسائق' : 'Call Driver'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

