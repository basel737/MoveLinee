import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext1';
import { driverApi, DriverOrder } from '@/lib/driverApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  MapPin,
  Navigation,
  Send,
  Pause,
  Play,
  Truck,
  Clock,
  Target,
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const DriverTracking: React.FC = () => {
  const { language } = useLanguage();
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [mapboxToken, setMapboxToken] = useState(localStorage.getItem('mapbox_token') || '');
  const [showTokenInput, setShowTokenInput] = useState(!mapboxToken);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const translations = {
    ar: {
      liveTracking: 'التتبع المباشر',
      noActiveOrder: 'لا يوجد طلب نشط للتتبع',
      startSharing: 'بدء مشاركة الموقع',
      stopSharing: 'إيقاف المشاركة',
      currentLocation: 'الموقع الحالي',
      destination: 'الوجهة',
      lastUpdated: 'آخر تحديث',
      locationUpdated: 'تم تحديث الموقع',
      enterMapboxToken: 'أدخل رمز Mapbox',
      tokenPlaceholder: 'pk.eyJ1I...',
      saveToken: 'حفظ',
      sharingLocation: 'جاري مشاركة الموقع...',
      pickup: 'نقطة الاستلام',
      dropoff: 'نقطة التسليم',
    },
    en: {
      liveTracking: 'Live Tracking',
      noActiveOrder: 'No active order to track',
      startSharing: 'Start Sharing Location',
      stopSharing: 'Stop Sharing',
      currentLocation: 'Current Location',
      destination: 'Destination',
      lastUpdated: 'Last Updated',
      locationUpdated: 'Location Updated',
      enterMapboxToken: 'Enter Mapbox Token',
      tokenPlaceholder: 'pk.eyJ1I...',
      saveToken: 'Save',
      sharingLocation: 'Sharing location...',
      pickup: 'Pickup',
      dropoff: 'Dropoff',
    },
  };

  const t = translations[language];

  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        const res = await driverApi.getActiveOrder();
        setOrder(res.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveOrder();
  }, []);

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || showTokenInput || !order) return;

    mapboxgl.accessToken = mapboxToken;
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [36.2765, 33.5138], // Damascus default
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add destination marker
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([36.28, 33.52])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${t.dropoff}</strong><br/>${order.dropoffAddress}`))
      .addTo(mapRef.current);

    // Add pickup marker
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([36.27, 33.51])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${t.pickup}</strong><br/>${order.pickupAddress}`))
      .addTo(mapRef.current);

    // Driver marker (will be updated)
    const el = document.createElement('div');
    el.className = 'driver-marker';
    el.innerHTML = `<div style="background: #3b82f6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/>
        <polygon points="12 22 17 17 7 17 12 22"/>
      </svg>
    </div>`;

    markerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([36.275, 33.515])
      .addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
    };
  }, [mapboxToken, showTokenInput, order]);

  const handleTokenSubmit = () => {
    if (mapboxToken) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
    }
  };

  const startLocationSharing = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported',
        variant: 'destructive',
      });
      return;
    }

    setSharing(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update marker on map
        if (markerRef.current) {
          markerRef.current.setLngLat([longitude, latitude]);
        }
        if (mapRef.current) {
          mapRef.current.panTo([longitude, latitude]);
        }

        // Send to API
        if (order) {
          try {
            await driverApi.updateLocation(order.id, latitude, longitude);
          } catch (error) {
            console.error('Error updating location:', error);
          }
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: 'Location Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
  };

  const stopLocationSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.liveTracking}
        </h1>
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{t.noActiveOrder}</h3>
        </Card>
      </div>
    );
  }

  if (showTokenInput) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t.liveTracking}
        </h1>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{t.enterMapboxToken}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder={t.tokenPlaceholder}
            />
            <Button onClick={handleTokenSubmit} className="w-full">
              {t.saveToken}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t.liveTracking}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'طلب' : 'Order'} #{order.id}
          </p>
        </div>

        <Button
          size="lg"
          variant={sharing ? 'destructive' : 'default'}
          onClick={sharing ? stopLocationSharing : startLocationSharing}
        >
          {sharing ? (
            <>
              <Pause className="w-4 h-4 me-2" />
              {t.stopSharing}
            </>
          ) : (
            <>
              <Play className="w-4 h-4 me-2" />
              {t.startSharing}
            </>
          )}
        </Button>
      </div>

      {sharing && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-700 dark:text-green-400 font-medium">
            {t.sharingLocation}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <Card className="lg:col-span-3 overflow-hidden">
          <div ref={mapContainerRef} className="h-[500px] w-full" />
        </Card>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Navigation className="w-4 h-4 text-primary" />
                {t.currentLocation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {order.tracking?.currentLocation || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-4 h-4 text-red-500" />
                {t.destination}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {order.dropoffAddress}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-blue-500" />
                {t.lastUpdated}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {order.tracking?.lastUpdated
                  ? new Date(order.tracking.lastUpdated).toLocaleTimeString()
                  : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
