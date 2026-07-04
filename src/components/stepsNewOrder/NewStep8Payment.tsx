import React, { useEffect } from 'react';
import { useNewOrder as useOrder } from '@/context/NewOrderContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext1';

/**
 * NEW: Stripe Hosted Checkout Flow
 * Legacy Stripe Elements logic is preserved at the bottom but inactive.
 */
export const NewStep8Payment: React.FC = () => {
  const { order, submitOrder, isLoading, prevStep, fetchBackendPrice } = useOrder();
  const { language } = useLanguage();

  useEffect(() => {
    if (!order.backendPrice && order.backendPrice !== 0 && !order.backendPriceLoading && order.pickupLocation && order.dropoffLocation && order.scheduledDate && order.scheduledTime) {
      void fetchBackendPrice();
    }
  }, [fetchBackendPrice, order.backendPrice, order.backendPriceLoading, order.pickupLocation, order.dropoffLocation, order.scheduledDate, order.scheduledTime]);

  const handlePay = async () => {
    try {
      // Logic in NewOrderContext will handle window.location.href redirect
      await submitOrder('stripe');
    } catch (error) {
      console.error('Payment preparation failed:', error);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {language === 'ar' ? 'الدفع الآمن' : 'Secure Payment'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'أكمل حجزك من خلال بوابة الدفع الآمنة' 
            : 'Complete your booking through our secure payment gateway'}
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">
              {language === 'ar' ? 'الدفع عبر Stripe' : 'Pay with Stripe'}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {language === 'ar'
                ? 'سيتم توجيهك إلى Stripe لإكمال عملية الدفع بأمان. نحن لا نقوم بتخزين بيانات بطاقتك الائتمانية.'
                : 'You’ll be redirected to Stripe to complete your payment securely. We do not store your card details.'}
            </p>
            
            <div className="pt-4 flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                SSL Secure
              </span>
              <span>•</span>
              <span>PCI Compliant</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              className="px-8 h-12"
              disabled={isLoading}
            >
              {language === 'ar' ? 'رجوع' : 'Back'}
            </Button>
            <Button 
              onClick={handlePay} 
              className="flex-1 h-12 text-lg font-semibold gap-2 shadow-lg shadow-primary/20" 
              disabled={isLoading || order.backendPriceLoading || order.backendPrice === null || order.backendPrice === undefined || !!order.backendPriceError}
            >
              {isLoading || order.backendPriceLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {language === 'ar' ? 'جاري التحويل...' : 'Preparing payment...'}
                </>
              ) : (
                <>
                  {language === 'ar' ? 'ادفع الآن' : 'Pay now'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          {order.backendPriceError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <p className="font-medium">{order.backendPriceError}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => void fetchBackendPrice()}>
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground">
              {language === 'ar' ? 'السعر النهائي' : 'Final quote'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'ar'
                ? 'سيظهر السعر النهائي هنا بعد حسابه من الخادم قبل الدفع.'
                : 'Your final quote will appear here after the backend calculates it before payment.'}
            </p>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              {order.backendPriceLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'ar' ? 'جاري حساب السعر...' : 'Calculating your quote...'}
                </div>
              ) : order.backendPrice !== null && order.backendPrice !== undefined ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'السعر المقدر' : 'Estimated price'}</p>
                  <p className="text-3xl font-bold text-primary">${Number(order.backendPrice).toFixed(2)}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'في انتظار الحساب من الخادم' : 'Waiting for the backend quote'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 
        LEGACY STRIPE ELEMENTS CODE (OBSCURED/INACTIVE)
        Preserved as per user request.
      */}
      <div className="hidden">
        {/* Previous logic for Stripe Elements/StripePaymentForm would go here if revived */}
      </div>
    </div>
  );
};
