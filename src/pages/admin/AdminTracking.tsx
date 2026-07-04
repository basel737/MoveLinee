import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { adminApi } from '@/lib/adminApi';
import { Tracking, DashboardOrder } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, Clock, RefreshCw, Navigation } from 'lucide-react';
import { MapComponent, MarkerData, isValidCoord } from '@/components/map/MapComponent';
import { useVehicleTracking } from '@/hooks/useVehicleTracking';

export const AdminTracking: React.FC = () => {
  const { language } = useLanguage();
  const [activeOrders, setActiveOrders] = useState<DashboardOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock trackings for the initial list view
  const [mockTrackings, setMockTrackings] = useState<Tracking[]>([]);

  // Real tracking for the selected vehicle
  const { data: liveData, route: liveRoute } = useVehicleTracking({
    orderId: selectedOrderId || '',
    destination: selectedOrderId ? getDestination(selectedOrderId) : undefined,
    pollInterval: 3000
  });

  const translations = {
    en: {
      title: 'Live Tracking',
      subtitle: 'Monitor all active orders in real-time',
      activeVehicles: 'Active Vehicles',
      lastUpdated: 'Last Updated',
      destination: 'Destination',
      currentLocation: 'Current Location',
      refresh: 'Refresh',
      noActiveOrders: 'No active orders being tracked',
      orderId: 'Order',
      inTransit: 'In Transit',
      selectToTrack: 'Select an order to view live path',
    },
    ar: {
      title: 'التتبع المباشر',
      subtitle: 'راقب جميع الطلبات النشطة في الوقت الفعلي',
      activeVehicles: 'المركبات النشطة',
      lastUpdated: 'آخر تحديث',
      destination: 'الوجهة',
      currentLocation: 'الموقع الحالي',
      refresh: 'تحديث',
      noActiveOrders: 'لا توجد طلبات نشطة قيد التتبع',
      orderId: 'طلب',
      inTransit: 'في الطريق',
      selectToTrack: 'اختر طلبًا لعرض المسار المباشر',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ordersData = await adminApi.getAllOrders({ status: 'all' });
      const active = ordersData.filter(o => 
        ['in-transit', 'in_progress', 'assigned'].includes(o.status)
      );
      setActiveOrders(active);
    } catch (error) {
      console.error('Failed to fetch tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  function getDestination(id: number): [number, number] | undefined {
    const order = activeOrders.find(o => Number(o.id) === id);
    if (order && order.dropoff_latitude && order.dropoff_longitude) {
      return [parseFloat(order.dropoff_latitude), parseFloat(order.dropoff_longitude)];
    }
    return undefined;
  }

  function getPickup(id: number): [number, number] | undefined {
    const order = activeOrders.find(o => Number(o.id) === id);
    if (order && order.pickup_latitude && order.pickup_longitude) {
      return [parseFloat(order.pickup_latitude), parseFloat(order.pickup_longitude)];
    }
    return undefined;
  }

  // Robust map center calculation
  const getMapCenter = (): [number, number] => {
    // 1. Try live data if valid
    if (liveData && isValidCoord([liveData.latitude, liveData.longitude])) {
      return [liveData.latitude, liveData.longitude];
    }
    
    // 2. Try first order's tracking if valid
    const firstTrackedOrder = activeOrders.find(o => o.tracking && o.tracking.current_latitude && o.tracking.current_longitude);
    if (firstTrackedOrder && firstTrackedOrder.tracking) {
      const lat = parseFloat(firstTrackedOrder.tracking.current_latitude || '0');
      const lng = parseFloat(firstTrackedOrder.tracking.current_longitude || '0');
      if (isValidCoord([lat, lng])) {
        return [lat, lng];
      }
    }
    
    // 3. Fallback to default Riyadh coordinates
    return [24.7136, 46.6753];
  };

  const mapCenter = getMapCenter();

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t.refresh}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Sidebar List */}
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          <Card className="shadow-sm sticky top-0 z-10 bg-background/95 backdrop-blur">
            <CardContent className="p-4 flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">{t.activeVehicles}</span>
              <Badge variant="secondary">{activeOrders.length}</Badge>
            </CardContent>
          </Card>

          {activeOrders.map((order) => (
            <Card 
              key={order.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${Number(selectedOrderId) === Number(order.id) ? 'border-primary ring-1 ring-primary' : ''}`}
              onClick={() => setSelectedOrderId(Number(order.id))}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${Number(selectedOrderId) === Number(order.id) ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{t.inTransit}</p>
                    </div>
                  </div>
                  {Number(selectedOrderId) === Number(order.id) && (
                     <Badge className="animate-pulse">Live</Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                   <div className="flex gap-2">
                     <MapPin className="w-4 h-4 text-muted-foreground" />
                     <span className="truncate">{order.pickup_address}</span>
                   </div>
                   <div className="flex gap-2">
                     <Navigation className="w-4 h-4 text-muted-foreground" />
                     <span className="truncate">{order.dropoff_address}</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeOrders.length === 0 && !loading && (
             <div className="text-center p-8 text-muted-foreground">
               <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p>{t.noActiveOrders}</p>
             </div>
          )}
        </div>

        {/* Map Area */}
        <Card className="lg:col-span-2 shadow-lg overflow-hidden flex flex-col">
          <CardContent className="p-0 flex-1 relative">
            <MapComponent 
              center={mapCenter}
              zoom={selectedOrderId ? 14 : 10}
              markers={activeOrders
                .filter(o => 
                  o.tracking && 
                  o.tracking.current_latitude && 
                  o.tracking.current_longitude && 
                  Number(o.id) !== Number(selectedOrderId)
                )
                .map(o => ({
                  id: `marker-${o.id}`,
                  position: [parseFloat(o.tracking!.current_latitude!), parseFloat(o.tracking!.current_longitude!)] as [number, number],
                  type: 'truck',
                  label: `Order #${o.id} - ${o.dropoff_address}`
                }))}
              truckPosition={selectedOrderId && liveData && isValidCoord([liveData.latitude, liveData.longitude]) ? [liveData.latitude, liveData.longitude] : undefined}
              pickupPosition={selectedOrderId ? getPickup(selectedOrderId) : undefined}
              destinationPosition={selectedOrderId ? getDestination(selectedOrderId) : undefined}
              routeCoordinates={selectedOrderId && liveRoute ? liveRoute.coordinates : undefined}
              truckData={liveData ? liveData.eta : undefined}
            />
            
            {!selectedOrderId && (
               <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                 <div className="bg-background/80 backdrop-blur p-4 rounded-lg shadow-lg">
                   <p className="font-medium text-foreground">{t.selectToTrack}</p>
                 </div>
               </div>
            )}
            
            {/* Live Stats Overlay */}
            {selectedOrderId && liveRoute && (
                <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur p-4 rounded-lg shadow-lg border z-[400] flex justify-around animate-in slide-in-from-bottom-2">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase">{language === 'ar' ? 'المسافة' : 'Distance'}</p>
                        <p className="text-xl font-bold flex items-center justify-center gap-1">
                        <Navigation className="w-4 h-4 text-primary" />
                        {(liveRoute.distance / 1000).toFixed(1)} km
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase">{language === 'ar' ? 'الوقت المقدر' : 'Est. Time'}</p>
                        <p className="text-xl font-bold flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        {Math.round(liveRoute.duration / 60)} min
                        </p>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTracking;
