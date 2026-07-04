import React from 'react';
import { Clock, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingPriceProps {
  className?: string;
}

export const PendingPrice: React.FC<PendingPriceProps> = ({ className }) => {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-4", className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <h4 className="font-semibold text-foreground">Price Estimate</h4>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Price will be calculated after location & photo analysis</span>
      </div>
      <div className="mt-3 p-3 bg-accent/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          Final price is based on: distance, item volume, vehicle type, and number of movers
        </p>
      </div>
    </div>
  );
};
