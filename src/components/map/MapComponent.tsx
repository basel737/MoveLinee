import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

// Fix for default Leaflet marker icons not showing up in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Truck Icon
const createTruckIcon = () => {
  return L.divIcon({
    className: 'custom-icon',
    html: ReactDOMServer.renderToString(
      <div className="w-10 h-10 bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
        <Truck className="w-6 h-6" />
      </div>
    ),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Custom Destination Icon
const createDestIcon = () => {
  return L.divIcon({
    className: 'custom-icon',
    html: ReactDOMServer.renderToString(
      <div className="w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <MapPin className="w-5 h-5" />
      </div>
    ),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Custom Pickup Icon
const createPickupIcon = () => {
  return L.divIcon({
    className: 'custom-icon',
    html: ReactDOMServer.renderToString(
      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <MapPin className="w-5 h-5" />
      </div>
    ),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Component to handle map center updates
const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center);
    }
  }, [center, map]);
  return null;
};

export const isValidCoord = (coord: any): coord is [number, number] => {
  return Array.isArray(coord) && 
    coord.length === 2 && 
    typeof coord[0] === 'number' && !isNaN(coord[0]) &&
    typeof coord[1] === 'number' && !isNaN(coord[1]);
};

export interface MarkerData {
  id: number | string;
  position: [number, number];
  type: 'truck' | 'destination' | 'pickup';
  label?: string;
}

interface MapComponentProps {
  center: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  truckPosition?: [number, number];
  truckData?: string;
  pickupPosition?: [number, number];
  destinationPosition?: [number, number];
  routeCoordinates?: [number, number][]; // Array of [lat, lng]
}

// Component to handle smooth marker animation
const MovingMarker = ({ position, icon, children }: { position: [number, number], icon: L.Icon<L.IconOptions> | L.DivIcon, children?: React.ReactNode }) => {
  const [currentPosition, setCurrentPosition] = React.useState(position);
  const requestRef = React.useRef<number>();
  const startTimeRef = React.useRef<number | null>(null);
  const startPositionRef = React.useRef(position);
  const targetPositionRef = React.useRef(position);
  
  // Return null if initial position is invalid
  if (!isValidCoord(position)) return null;

  React.useEffect(() => {
    // Only animate if position actually changed and is valid
    if (isValidCoord(position) && (position[0] !== targetPositionRef.current[0] || position[1] !== targetPositionRef.current[1])) {
      startPositionRef.current = currentPosition;
      targetPositionRef.current = position;
      startTimeRef.current = null;
      
      const duration = 2000; // Animation duration in ms (matches typical update rate roughly)

      const animate = (time: number) => {
        if (startTimeRef.current === null) startTimeRef.current = time;
        const timeElapsed = time - startTimeRef.current;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Linear interpolation
        const lat = startPositionRef.current[0] + (targetPositionRef.current[0] - startPositionRef.current[0]) * progress;
        const lng = startPositionRef.current[1] + (targetPositionRef.current[1] - startPositionRef.current[1]) * progress;
        
        setCurrentPosition([lat, lng]);

        if (progress < 1) {
          requestRef.current = requestAnimationFrame(animate);
        }
      };
      
      cancelAnimationFrame(requestRef.current as number);
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [position]);

  if (!isValidCoord(currentPosition)) return null;

  return <Marker position={currentPosition} icon={icon}>{children}</Marker>;
};

export const MapComponent: React.FC<MapComponentProps> = ({ 
  center, 
  zoom = 13, 
  markers,
  truckPosition, 
  truckData,
  pickupPosition,
  destinationPosition,
  routeCoordinates 
}) => {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap center={center} />
        
        {/* Render Multiple Markers */}
        {markers && markers.filter(m => isValidCoord(m.position)).map((marker) => (
          <Marker 
            key={marker.id} 
            position={marker.position} 
            icon={marker.type === 'truck' ? createTruckIcon() : marker.type === 'pickup' ? createPickupIcon() : createDestIcon()}
          >
            {marker.label && <Popup>{marker.label}</Popup>}
          </Marker>
        ))}

        {/* Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline 
            positions={routeCoordinates} 
            color="#2563eb" // Primary color
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Truck Marker */}
        {truckPosition && isValidCoord(truckPosition) && (
          <MovingMarker position={truckPosition} icon={createTruckIcon()}>
            <Popup>
              <div className="p-1">
                <p className="font-bold">Latest Position</p>
                <p className="text-sm">{truckData || 'In Transit'}</p>
              </div>
            </Popup>
          </MovingMarker>
        )}

        {/* Pickup Marker */}
        {pickupPosition && isValidCoord(pickupPosition) && (
          <Marker position={pickupPosition} icon={createPickupIcon()}>
            <Popup>Pickup Point</Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationPosition && isValidCoord(destinationPosition) && (
          <Marker position={destinationPosition} icon={createDestIcon()}>
            <Popup>Destination</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
