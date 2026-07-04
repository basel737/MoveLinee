import React from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { NewOrderProvider, useNewOrder } from '@/context/NewOrderContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext1';
import { OrderStepper } from '@/components/OrderStepper';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Chatbot } from '@/components/Chatbot';
import {
  NewStep1Service,
  NewStep2Addons,
  NewStep3Locations,
  NewStepAccessDetails,
  NewStep4Photos,
  NewStep5Confirm,
  NewStep6Schedule,
  NewStep7CustomerInfo,
  NewStep8Payment,
} from '@/components/stepsNewOrder';

const steps = [
  { number: 1, title: 'Service', shortTitle: 'Service' },
  { number: 2, title: 'Add-ons', shortTitle: 'Add-ons' },
  { number: 3, title: 'Locations', shortTitle: 'Locations' },
  { number: 4, title: 'Access', shortTitle: 'Access' },
  { number: 5, title: 'Photos', shortTitle: 'Photos' },
  { number: 6, title: 'Confirm', shortTitle: 'Confirm' },
  { number: 7, title: 'Schedule', shortTitle: 'Schedule' },
  { number: 8, title: 'Info', shortTitle: 'Info' },
  { number: 9, title: 'Payment', shortTitle: 'Payment' },
];

const StepRenderer: React.FC = () => {
  const { order } = useNewOrder();

  // Unified Flow: Steps 1-8 from 'stepsNewOrder'
  switch (order.step) {
    case 1: return <NewStep1Service />;
    case 2: return <NewStep2Addons />;
    case 3: return <NewStep3Locations />;
    case 4: return <NewStepAccessDetails />;
    case 5: return <NewStep4Photos />;
    case 6: return <NewStep5Confirm />;
    case 7: return <NewStep6Schedule />;
    case 8: return <NewStep7CustomerInfo />;
    case 9: return <NewStep8Payment />;
    default: return <NewStep1Service />;
  }
};

const OrderWizard: React.FC = () => {
  const { order, goToStep } = useNewOrder();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:opacity-90 transition-opacity">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {language === 'ar' ? 'خدمة النقل' : 'Moving Service'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'حلول نقل احترافية' : 'Professional moving solutions'}
                </p>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Stepper - Only show for steps 1-9 */}
      {order.step <= 9 && (
        <div className="container mx-auto px-4 py-4">
          <div className="overflow-x-auto pb-2">
            <OrderStepper
              steps={steps}
              currentStep={order.step}
              onStepClick={goToStep}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <StepRenderer />
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <NewOrderProvider>
        <OrderWizard />
      </NewOrderProvider>
    </LanguageProvider>
  );
};

export default Index;
