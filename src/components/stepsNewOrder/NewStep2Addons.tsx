import React from 'react';
import { Wrench, Settings, Check } from 'lucide-react';
import { useNewOrder } from '@/context/NewOrderContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddonItemProps {
  title: string;
  description: string;
  isSelected: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}

const AddonItem: React.FC<AddonItemProps> = ({
  title,
  description,
  isSelected,
  onToggle,
  icon,
}) => (
  <button
    onClick={onToggle}
    className={cn(
      "relative p-6 rounded-xl border-2 text-left transition-all duration-200",
      isSelected
        ? "border-primary bg-primary/5 shadow-md"
        : "border-border hover:border-primary/50 bg-card"
    )}
  >
    {isSelected && (
      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <Check className="w-4 h-4 text-primary-foreground" />
      </div>
    )}
    
    <div className="flex items-start gap-4">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </button>
);

export const NewStep2Addons: React.FC = () => {
  const { order, toggleAssembly, toggleDisassembly, nextStep, prevStep } = useNewOrder();

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Additional Services</h1>
        <p className="text-muted-foreground">Select any additional services you need</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <AddonItem
            title="Assembly"
            description="Professional assembly of furniture at destination"
            isSelected={order.hasAssembly}
            onToggle={toggleAssembly}
            icon={<Wrench className="w-6 h-6" />}
          />
          
          <AddonItem
            title="Disassembly"
            description="Careful disassembly of furniture before moving"
            isSelected={order.hasDisassembly}
            onToggle={toggleDisassembly}
            icon={<Settings className="w-6 h-6" />}
          />
        </div>
        
        <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
          <p>💡 These services are optional. You can skip them if not needed.</p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={prevStep} className="flex-1">
            Back
          </Button>
          <Button onClick={nextStep} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
