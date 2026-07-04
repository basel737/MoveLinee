import React from 'react';
import { Truck } from 'lucide-react';
import { useNewOrder } from '@/context/NewOrderContext';
import { Button } from '@/components/ui/button';

export const NewStep1Service: React.FC = () => {
  const { nextStep } = useNewOrder();

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Furniture Moving Service</h1>
        <p className="text-muted-foreground">Professional furniture moving with care</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="bg-card border-2 border-primary rounded-xl p-8 text-center shadow-lg">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Truck className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Moving</h2>
          <p className="text-muted-foreground mb-6">
            Complete furniture moving service including transportation, loading, and unloading
          </p>
          
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Professional handling of all furniture types</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Trained and experienced workers</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Safe and secure transportation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Optional assembly/disassembly services</span>
            </div>
          </div>
          
          <Button onClick={nextStep} className="w-full" size="lg">
            Continue to Add-ons
          </Button>
        </div>
      </div>
    </div>
  );
};
