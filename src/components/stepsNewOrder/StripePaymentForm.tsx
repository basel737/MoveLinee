import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext1';
import { toast } from 'sonner';

export const StripePaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      toast.error(error.message || 'Payment failed');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      
      {errorMessage && (
        <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full h-12 text-lg font-semibold gap-2 shadow-lg shadow-primary/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            {language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}
          </>
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground pt-2">
        {language === 'ar' 
          ? 'بالضغط على تأكيد الدفع، فإنك توافق على شروط الخدمة.' 
          : 'By clicking Confirm Payment, you agree to our Terms of Service.'}
      </p>
    </form>
  );
};
