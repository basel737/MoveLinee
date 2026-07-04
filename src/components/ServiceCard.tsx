import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon: Icon,
  isSelected,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full p-6 rounded-xl border-2 text-left transition-all duration-300",
        "hover:shadow-lg hover:border-primary/50 hover:-translate-y-1",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isSelected 
          ? "border-primary bg-primary-light shadow-glow" 
          : "border-border bg-card",
        disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
      )}
    >
      {/* Selection indicator */}
      <div 
        className={cn(
          "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          isSelected 
            ? "border-primary bg-primary" 
            : "border-muted-foreground"
        )}
      >
        {isSelected && (
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Icon */}
      <div 
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
          isSelected ? "bg-primary text-primary-foreground" : "bg-accent text-primary"
        )}
      >
        <Icon className="w-7 h-7" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2 pr-8">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
};
