import React from 'react';
import { cn } from '@/lib/utils';
import { Check, LucideIcon } from 'lucide-react';

interface AddonCardProps {
  title: string;
  description: string;
  price: number;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
  isBundle?: boolean;
  bundleSavings?: number;
}

export const AddonCard: React.FC<AddonCardProps> = ({
  title,
  description,
  price,
  icon: Icon,
  isSelected,
  onClick,
  disabled = false,
  isBundle = false,
  bundleSavings,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
        "hover:shadow-md hover:border-primary/50",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected 
          ? "border-primary bg-primary-light shadow-md" 
          : "border-border bg-card",
        isBundle && "ring-2 ring-primary ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Bundle badge */}
      {isBundle && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
          ⭐ BEST VALUE
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div 
          className={cn(
            "w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors duration-300",
            isSelected ? "bg-primary text-primary-foreground" : "bg-accent text-primary"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-foreground">{title}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
            
            {/* Price & checkbox */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <span className="font-bold text-lg text-foreground">${price}</span>
                {bundleSavings && (
                  <div className="text-xs text-primary font-medium">
                    Save ${bundleSavings}
                  </div>
                )}
              </div>
              
              {/* Checkbox */}
              <div 
                className={cn(
                  "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300",
                  isSelected 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground"
                )}
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
