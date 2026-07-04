import React from 'react';
import { cn } from '@/lib/utils';
import { useNewOrder as useOrder } from '@/context/NewOrderContext';

interface PriceSummaryProps {
  className?: string;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({ className }) => {
  const { order } = useOrder();

  return (
    <div className={cn('bg-card border border-border rounded-xl p-4', className)}>
      <h4 className="font-semibold text-foreground mb-3">Order details</h4>
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between gap-3">
          <span>Service type</span>
          <span className="text-foreground capitalize">{order.serviceType.replace(/-/g, ' ')}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Vehicle</span>
          <span className="text-foreground capitalize">{order.vehicleType}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Workers</span>
          <span className="text-foreground">{order.workerCount}</span>
        </div>
      </div>
    </div>
  );
};
