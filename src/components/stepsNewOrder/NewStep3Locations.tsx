import React from 'react';
import { MapPin, Navigation, Route, Clock } from 'lucide-react';
import { useNewOrder } from '@/context/NewOrderContext';
import { Button } from '@/components/ui/button';
import { LeafletMap } from '@/components/maps/LeafletMap';

export const NewStep3Locations: React.FC = () => {
  const { order, setPickupLocation, setDropoffLocation, nextStep, prevStep, setRouteDetails } = useNewOrder();

  const handlePickupSelect = (lat: number, lng: number, address: string) => {
    setPickupLocation({ lat, lng, address });
  };

  const handleDropoffSelect = (lat: number, lng: number, address: string) => {
    setDropoffLocation({ lat, lng, address });
  };

  const canContinue = order.pickupLocation && order.dropoffLocation;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Select Locations</h1>
        <p className="text-muted-foreground">Choose your pickup and drop-off locations on the map</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Address displays */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-green-500" />
                <span className="font-medium text-foreground">Pickup Location</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {order.pickupLocation?.address || 'Click "Set Pickup" then click on the map'}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-red-500" />
                <span className="font-medium text-foreground">Drop-off Location</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {order.dropoffLocation?.address || 'Click "Set Drop-off" then click on the map'}
              </p>
            </div>
          </div>

          {/* Map */}
          <LeafletMap
            pickupCoords={order.pickupLocation}
            dropoffCoords={order.dropoffLocation}
            onPickupSelect={handlePickupSelect}
            onDropoffSelect={handleDropoffSelect}
            onRouteFound={setRouteDetails}
          />

          {/* Distance & Duration */}
          {order.distanceKm && order.estimatedTimeMinutes && (
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg">
                <Route className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{order.distanceKm} km</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">~{order.estimatedTimeMinutes} min estimated</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-3">Location Info</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Click the buttons above the map to set locations</p>
              <p>• Distance is calculated as straight-line distance</p>
              <p>• Time estimate is ~2 min per km</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1">
              Back
            </Button>
            <Button onClick={nextStep} className="flex-1" disabled={!canContinue}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
