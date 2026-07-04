import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface LocationMapProps {
  pickupCoords: [number, number] | null;
  dropoffCoords: [number, number] | null;
  onPickupSelect: (coords: [number, number], address: string) => void;
  onDropoffSelect: (coords: [number, number], address: string) => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  pickupCoords,
  dropoffCoords,
  onPickupSelect,
  onDropoffSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);
  const [accessToken, setAccessToken] = useState<string>(localStorage.getItem('mapbox_token') || '');
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectingMode, setSelectingMode] = useState<'pickup' | 'dropoff' | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(!localStorage.getItem('mapbox_token'));

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [46.6753, 24.7136], // Riyadh as default
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsMapReady(true);
      });

      map.current.on('click', async (e) => {
        if (!selectingMode) return;
        
        const { lng, lat } = e.lngLat;
        const coords: [number, number] = [lng, lat];
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
          );
          const data = await response.json();
          const address = data.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          if (selectingMode === 'pickup') {
            onPickupSelect(coords, address);
            updateMarker('pickup', coords);
          } else {
            onDropoffSelect(coords, address);
            updateMarker('dropoff', coords);
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          if (selectingMode === 'pickup') {
            onPickupSelect(coords, address);
            updateMarker('pickup', coords);
          } else {
            onDropoffSelect(coords, address);
            updateMarker('dropoff', coords);
          }
        }
        
        setSelectingMode(null);
      });
    } catch (err) {
      console.error('Map initialization error:', err);
      setShowTokenInput(true);
    }
  };

  const updateMarker = (type: 'pickup' | 'dropoff', coords: [number, number]) => {
    if (!map.current) return;

    const color = type === 'pickup' ? '#22c55e' : '#ef4444';
    const marker = type === 'pickup' ? pickupMarker : dropoffMarker;

    if (marker.current) {
      marker.current.setLngLat(coords);
    } else {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

      const newMarker = new mapboxgl.Marker(el).setLngLat(coords).addTo(map.current);
      
      if (type === 'pickup') {
        pickupMarker.current = newMarker;
      } else {
        dropoffMarker.current = newMarker;
      }
    }

    // Draw route if both markers exist
    if (pickupCoords && dropoffCoords) {
      drawRoute();
    }
  };

  const drawRoute = async () => {
    if (!map.current || !pickupCoords || !dropoffCoords) return;

    const routeId = 'route';
    if (map.current.getLayer(routeId)) {
      map.current.removeLayer(routeId);
      map.current.removeSource(routeId);
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?geometries=geojson&access_token=${accessToken}`
      );
      const data = await response.json();
      
      if (data.routes?.[0]) {
        map.current.addSource(routeId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: data.routes[0].geometry,
          },
        });

        map.current.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#4ade80',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        // Fit bounds to show route
        const coordinates = data.routes[0].geometry.coordinates;
        const bounds = coordinates.reduce(
          (bounds: mapboxgl.LngLatBounds, coord: [number, number]) => bounds.extend(coord),
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );
        map.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (err) {
      console.error('Route drawing error:', err);
    }
  };

  useEffect(() => {
    if (accessToken && !showTokenInput) {
      initializeMap(accessToken);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, showTokenInput]);

  useEffect(() => {
    if (pickupCoords) updateMarker('pickup', pickupCoords);
  }, [pickupCoords]);

  useEffect(() => {
    if (dropoffCoords) updateMarker('dropoff', dropoffCoords);
  }, [dropoffCoords]);

  useEffect(() => {
    if (pickupCoords && dropoffCoords && isMapReady) {
      drawRoute();
    }
  }, [pickupCoords, dropoffCoords, isMapReady]);

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
          To use the interactive map, please enter your Mapbox public token.
          Get one free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={selectingMode === 'pickup' ? 'default' : 'outline'}
          onClick={() => setSelectingMode('pickup')}
          className="flex-1"
        >
          <MapPin className="w-4 h-4 mr-2 text-green-500" />
          {pickupCoords ? 'Change Pickup' : 'Set Pickup'}
        </Button>
        <Button
          variant={selectingMode === 'dropoff' ? 'default' : 'outline'}
          onClick={() => setSelectingMode('dropoff')}
          className="flex-1"
        >
          <Navigation className="w-4 h-4 mr-2 text-red-500" />
          {dropoffCoords ? 'Change Drop-off' : 'Set Drop-off'}
        </Button>
      </div>
      
      {selectingMode && (
        <div className="p-3 bg-primary/10 rounded-lg text-center text-sm text-primary font-medium">
          Click on the map to select {selectingMode === 'pickup' ? 'pickup' : 'drop-off'} location
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg" />
    </div>
  );
};
