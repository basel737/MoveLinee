import React from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Navigation } from 'lucide-react';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: 'pickup' | 'dropoff';
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  icon = 'pickup',
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <div 
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center",
            icon === 'pickup' ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          )}
        >
          {icon === 'pickup' ? (
            <Navigation className="w-5 h-5" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-16 pr-4 py-4 rounded-xl border-2 border-border bg-card",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "transition-all duration-200"
          )}
        />
      </div>
    </div>
  );
};
