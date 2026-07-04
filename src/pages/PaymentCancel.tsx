import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext1';
import { useNewOrder } from '@/context/NewOrderContext';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { goToStep } = useNewOrder();

  useEffect(() => {
    // Auto-navigate to the final order completion step after 2 seconds
    const timer = setTimeout(() => {
      goToStep(9); // Go to order tracking/completion page
      navigate('/dashboard/orders');
    }, 2000);

    return () => clearTimeout(timer);
  }, [goToStep, navigate]);

  const handleGoToFinalStep = () => {
    goToStep(9); // Go to order tracking/completion page
    navigate('/dashboard/orders');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-elegant text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order Created Successfully'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar'
            ? 'لقد تم إنشاء طلبك بنجاح! يمكنك الآن متابعة حالة طلبك من لوحة التحكم.'
            : 'Your order has been created successfully! You can now track your order from the dashboard.'}
        </p>
        <div className="pt-4 space-y-3">
          <Button onClick={handleGoToFinalStep} className="w-full gap-2 h-12 text-lg">
            {language === 'ar' ? 'متابعة الطلب' : 'Track Order'}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="ghost" className="w-full">
            {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
