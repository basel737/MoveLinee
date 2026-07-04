import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  pickupCoords: { lat: number; lng: number } | null;
  dropoffCoords: { lat: number; lng: number } | null;
  onPickupSelect: (lat: number, lng: number, address: string) => void;
  onDropoffSelect: (lat: number, lng: number, address: string) => void;
  onRouteFound?: (distanceKm: number, durationMinutes: number) => void;
}

// Custom marker icons
const createIcon = (color: string) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${color};
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const pickupIcon = createIcon('#22c55e');
const dropoffIcon = createIcon('#ef4444');

export const LeafletMap: React.FC<LeafletMapProps> = ({
  pickupCoords,
  dropoffCoords,
  onPickupSelect,
  onDropoffSelect,
  onRouteFound,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [selectingMode, setSelectingMode] = useState<'pickup' | 'dropoff' | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Default center: Damascus
    const defaultCenter: [number, number] = [33.5138, 36.2765];

    mapRef.current = L.map(mapContainer.current).setView(defaultCenter, 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // Click handler
    mapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Get current selecting mode from DOM to avoid stale closure
      const modeElement = document.getElementById('selecting-mode');
      const currentMode = modeElement?.dataset.mode as 'pickup' | 'dropoff' | null;
      
      if (!currentMode) return;

      let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      try {
        // Reverse Geocoding using Nominatim (OpenStreetMap)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en' // Get results in English as per requirements, or 'ar' if preferred
            }
          }
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          // Construct a cleaner address from available fields
          const addr = data.address;
          const road = addr.road || addr.pedestrian || '';
          const suburb = addr.suburb || addr.neighbourhood || addr.district || '';
          const city = addr.city || addr.town || addr.village || addr.county || '';
          
          const parts = [road, suburb, city].filter(Boolean);
          if (parts.length > 0) {
             address = parts.join(', ');
          } else {
             address = data.display_name.split(',').slice(0, 3).join(',');
          }
        }
      } catch (error) {
        console.error('Failed to resolve address:', error);
        // Fallback to coordinates is already set
      }

      if (currentMode === 'pickup') {
        onPickupSelect(lat, lng, address);
      } else {
        onDropoffSelect(lat, lng, address);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update hidden element with selecting mode
  useEffect(() => {
    const modeElement = document.getElementById('selecting-mode');
    if (modeElement) {
      modeElement.dataset.mode = selectingMode || '';
    }
  }, [selectingMode]);

  // Update pickup marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (pickupMarkerRef.current) {
      mapRef.current.removeLayer(pickupMarkerRef.current);
    }

    if (pickupCoords) {
      pickupMarkerRef.current = L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon })
        .addTo(mapRef.current)
        .bindPopup('Pickup Location');
      
      setSelectingMode(null);
    }
  }, [pickupCoords]);

  // Update dropoff marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (dropoffMarkerRef.current) {
      mapRef.current.removeLayer(dropoffMarkerRef.current);
    }

    if (dropoffCoords) {
      dropoffMarkerRef.current = L.marker([dropoffCoords.lat, dropoffCoords.lng], { icon: dropoffIcon })
        .addTo(mapRef.current)
        .bindPopup('Drop-off Location');
      
      setSelectingMode(null);
    }
  }, [dropoffCoords]);

  // Fix: Force map resize recalculation when coordinates or visibility changes
  // This resolves the "clipped tiles" issue when map loads in a dynamic container
  useEffect(() => {
    if (!mapRef.current) return;

    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [pickupCoords, dropoffCoords]);

  // Draw route line between points
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    let isActive = true;
    const map = mapRef.current;

    if (pickupCoords && dropoffCoords) {
      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropoffCoords.lng},${dropoffCoords.lat}?overview=full&geometries=geojson`
          );
          const data = await response.json();

          if (!isActive || !map) return;
          if (!data.routes || data.routes.length === 0) return;

          const route = data.routes[0];
          const coordinates = route.geometry?.coordinates?.map((coord: number[]) => [coord[1], coord[0]]) || [];
          if (coordinates.length === 0) return;

          routeLineRef.current = L.polyline(coordinates, {
            color: '#4ade80',
            weight: 5,
            opacity: 0.8,
          }).addTo(map);

          const bounds = L.latLngBounds(coordinates);
          map.fitBounds(bounds, { padding: [50, 50] });

          if (onRouteFound) {
            const distKm = Math.round((route.distance / 1000) * 10) / 10;
            const durMin = Math.round(route.duration / 60);
            onRouteFound(distKm, durMin);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
          if (!isActive || !map) return;

          routeLineRef.current = L.polyline(
            [
              [pickupCoords.lat, pickupCoords.lng],
              [dropoffCoords.lat, dropoffCoords.lng],
            ],
            {
              color: '#4ade80',
              weight: 3,
              opacity: 0.8,
              dashArray: '10, 10',
            }
          ).addTo(map);

          const bounds = L.latLngBounds(
            [pickupCoords.lat, pickupCoords.lng],
            [dropoffCoords.lat, dropoffCoords.lng]
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      };

      fetchRoute();
    }

    return () => {
      isActive = false;
    };
  }, [pickupCoords, dropoffCoords, onRouteFound]);

  return (
    <div className="space-y-4">
      {/* Hidden element to store selecting mode */}
      <div id="selecting-mode" data-mode={selectingMode || ''} className="hidden" />
      
      {/* Selection buttons */}
      <div className="flex gap-2">
        <Button
          variant={selectingMode === 'pickup' ? 'default' : 'outline'}
          onClick={() => setSelectingMode(selectingMode === 'pickup' ? null : 'pickup')}
          className="flex-1"
        >
          <MapPin className="w-4 h-4 mr-2 text-green-500" />
          {pickupCoords ? 'Change Pickup' : 'Set Pickup'}
        </Button>
        <Button
          variant={selectingMode === 'dropoff' ? 'default' : 'outline'}
          onClick={() => setSelectingMode(selectingMode === 'dropoff' ? null : 'dropoff')}
          className="flex-1"
        >
          <Navigation className="w-4 h-4 mr-2 text-red-500" />
          {dropoffCoords ? 'Change Drop-off' : 'Set Drop-off'}
        </Button>
      </div>

      {/* Selection mode indicator */}
      {selectingMode && (
        <div className="p-3 bg-primary/10 rounded-lg text-center text-sm text-primary font-medium">
          Click on the map to select {selectingMode === 'pickup' ? 'pickup' : 'drop-off'} location
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg" />
    </div>
  );
};
