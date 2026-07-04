import React from 'react';
import { Truck, Users, Minus, Plus, MapPin, Package, Route, Wrench, Settings } from 'lucide-react';
import { useNewOrder } from '@/context/NewOrderContext';
import { Button } from '@/components/ui/button';
import { VehicleType } from '@/types/newOrder';
import { SERVICE_PRICES } from '@/lib/api';
import { cn } from '@/lib/utils';

const vehicles: { type: VehicleType; name: string; description: string; icon: string }[] = [
  { type: 'small', name: 'Small Truck', description: 'Small moves, few items', icon: '🚐' },
  { type: 'medium', name: 'Medium Truck', description: '1-2 bedroom apartment', icon: '🚚' },
  { type: 'large', name: 'Large Truck', description: 'Full house, office', icon: '🚛' },
];

export const NewStep5Confirm: React.FC = () => {
  const { 
    order, 
    setVehicleType, 
    setWorkerCount, 
    nextStep, 
    prevStep 
  } = useNewOrder();

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Confirm Details & Pricing</h1>
        <p className="text-muted-foreground">Review and adjust your order details</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order Summary
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block">Pickup:</span>
                    <span className="font-medium">{order.pickupLocation?.address || 'Not set'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block">Drop-off:</span>
                    <span className="font-medium">{order.dropoffLocation?.address || 'Not set'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {order.distanceKm && (
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-primary" />
                    <span>Distance: <strong>{order.distanceKm} km</strong></span>
                  </div>
                )}
                {order.hasAssembly && (
                  <div className="flex items-center gap-2 text-primary">
                    <Wrench className="w-4 h-4" />
                    <span>Assembly included (+${SERVICE_PRICES.assembly})</span>
                  </div>
                )}
                {order.hasDisassembly && (
                  <div className="flex items-center gap-2 text-primary">
                    <Settings className="w-4 h-4" />
                    <span>Disassembly included (+${SERVICE_PRICES.disassembly})</span>
                  </div>
                )}
                {order.analyzedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span>Items: <strong>{order.analyzedItems.length}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Vehicle Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {vehicles.map(v => (
                <button 
                  key={v.type} 
                  onClick={() => setVehicleType(v.type)} 
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    order.vehicleType === v.type 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-3xl block mb-2">{v.icon}</span>
                  <span className="text-sm font-medium block">{v.name}</span>
                  <span className="text-xs text-muted-foreground block">{v.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Workers */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Number of Workers
            </h3>
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => setWorkerCount(order.workerCount - 1)} 
                disabled={order.workerCount <= 1}
                className="w-12 h-12 rounded-full border-2 border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all disabled:opacity-50"
                aria-label="Decrease workers"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-center">
                <span className="text-5xl font-bold text-primary">{order.workerCount}</span>
                <p className="text-sm text-muted-foreground mt-1">workers</p>
              </div>
              <button 
                onClick={() => setWorkerCount(order.workerCount + 1)} 
                disabled={order.workerCount >= 10}
                className="w-12 h-12 rounded-full border-2 border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all disabled:opacity-50"
                aria-label="Increase workers"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground">
            <p>💡 The next step will collect your scheduling and contact details.</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1">
              Back
            </Button>
            <Button onClick={nextStep} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
