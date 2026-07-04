import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  shortTitle?: string;
}

interface OrderStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const OrderStepper: React.FC<OrderStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full py-4">
      {/* Mobile view - compact */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="mt-2 h-2 w-full bg-step-line rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop view - full stepper */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isPending = step.number > currentStep;
            const isClickable = onStepClick && step.number <= currentStep;

            return (
              <React.Fragment key={step.number}>
                <div 
                  className={cn(
                    "flex flex-col items-center gap-2 cursor-default transition-all duration-300",
                    isClickable && "cursor-pointer hover:opacity-80"
                  )}
                  onClick={() => isClickable && onStepClick(step.number)}
                >
                  {/* Step circle */}
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                      isCompleted && "bg-primary text-primary-foreground shadow-glow",
                      isCurrent && "bg-primary text-primary-foreground shadow-glow animate-pulse-soft",
                      isPending && "bg-step-pending text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  
                  {/* Step title */}
                  <span 
                    className={cn(
                      "text-xs font-medium text-center max-w-[80px] transition-colors duration-300",
                      isCompleted && "text-primary",
                      isCurrent && "text-foreground",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {step.shortTitle || step.title}
                  </span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 rounded-full bg-step-line overflow-hidden">
                    <div 
                      className={cn(
                        "h-full bg-primary transition-all duration-500 ease-out",
                        step.number < currentStep ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
