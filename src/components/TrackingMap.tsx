import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Truck } from 'lucide-react';

interface TrackingMapProps {
  pickupCoords: [number, number];
  dropoffCoords: [number, number];
  progress: number; // 0 to 1
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  pickupCoords,
  dropoffCoords,
  progress,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const vehicleMarker = useRef<mapboxgl.Marker | null>(null);
  const [accessToken, setAccessToken] = useState<string>(localStorage.getItem('mapbox_token') || '');
  const [showTokenInput, setShowTokenInput] = useState(!localStorage.getItem('mapbox_token'));
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!accessToken || showTokenInput || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: pickupCoords,
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for pickup and dropoff
    const pickupEl = document.createElement('div');
    pickupEl.innerHTML = '📍';
    pickupEl.style.fontSize = '24px';
    new mapboxgl.Marker(pickupEl).setLngLat(pickupCoords).addTo(map.current);

    const dropoffEl = document.createElement('div');
    dropoffEl.innerHTML = '🏁';
    dropoffEl.style.fontSize = '24px';
    new mapboxgl.Marker(dropoffEl).setLngLat(dropoffCoords).addTo(map.current);

    // Fetch and draw route
    map.current.on('load', async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?geometries=geojson&access_token=${accessToken}`
        );
        const data = await response.json();

        if (data.routes?.[0]) {
          const coordinates = data.routes[0].geometry.coordinates as [number, number][];
          setRouteCoords(coordinates);

          // Draw the route
          map.current!.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry,
            },
          });

          map.current!.addLayer({
            id: 'route-bg',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#cbd5e1', 'line-width': 6 },
          });

          map.current!.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#4ade80', 'line-width': 4 },
          });

          // Fit bounds
          const bounds = coordinates.reduce(
            (bounds, coord) => bounds.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          );
          map.current!.fitBounds(bounds, { padding: 50 });

          // Create vehicle marker
          const vehicleEl = document.createElement('div');
          vehicleEl.innerHTML = '🚚';
          vehicleEl.style.fontSize = '32px';
          vehicleEl.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
          vehicleMarker.current = new mapboxgl.Marker(vehicleEl)
            .setLngLat(coordinates[0])
            .addTo(map.current!);
        }
      } catch (err) {
        console.error('Route error:', err);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, showTokenInput, pickupCoords, dropoffCoords]);

  // Update vehicle position based on progress
  useEffect(() => {
    if (!vehicleMarker.current || routeCoords.length === 0) return;

    const index = Math.min(
      Math.floor(progress * routeCoords.length),
      routeCoords.length - 1
    );
    vehicleMarker.current.setLngLat(routeCoords[index]);

    // Update completed route
    if (map.current && map.current.getSource('route-completed')) {
      const completedCoords = routeCoords.slice(0, index + 1);
      (map.current.getSource('route-completed') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: completedCoords,
        },
      });
    } else if (map.current && map.current.isStyleLoaded()) {
      const completedCoords = routeCoords.slice(0, index + 1);
      map.current.addSource('route-completed', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: completedCoords,
          },
        },
      });

      map.current.addLayer({
        id: 'route-completed',
        type: 'line',
        source: 'route-completed',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#22c55e', 'line-width': 4 },
      });
    }
  }, [progress, routeCoords]);

  const handleTokenSubmit = () => {
    if (accessToken) {
      localStorage.setItem('mapbox_token', accessToken);
      setShowTokenInput(false);
    }
  };

  if (showTokenInput) {
    return (
      <div className="bg-muted rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Mapbox Token Required</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your Mapbox token to view live tracking.
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="pk.eyJ1IjoieW91ci10b2tlbi4uLiI="
            className="flex-1"
          />
          <Button onClick={handleTokenSubmit} disabled={!accessToken}>
            Connect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Truck className="w-4 h-4 text-primary" />
          <span>Live Vehicle Tracking</span>
        </div>
        <span className="text-sm font-medium text-primary">{Math.round(progress * 100)}% complete</span>
      </div>
      <div ref={mapContainer} className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg" />
    </div>
  );
};
