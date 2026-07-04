import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { confirmPayment } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext1';
import { toast } from 'sonner';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        setMessage(language === 'ar' ? 'رقم الجلسة مفقود' : 'Session ID is missing');
        return;
      }

      try {
        const result = await confirmPayment(sessionId);
        if (result.success) {
          setStatus('success');
          toast.success(language === 'ar' ? 'تم تأكيد الدفع بنجاح' : 'Payment confirmed successfully');
        } else {
          setStatus('error');
          setMessage(result.message || (language === 'ar' ? 'فشل تأكيد الدفع' : 'Payment confirmation failed'));
        }
      } catch (error) {
        console.error('Payment confirmation error:', error);
        setStatus('error');
        setMessage(language === 'ar' ? 'حدث خطأ أثناء الاتصال بالسيرفر' : 'Error connecting to the server');
      }
    };

    verifyPayment();
  }, [sessionId, language]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-elegant text-center space-y-6">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold">
              {language === 'ar' ? 'جاري التحقق من الدفع...' : 'Verifying Payment...'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'يرجى الانتظار بينما نقوم بتأكيد عملية الدفع مع Stripe.'
                : 'Please wait while we confirm your payment with Stripe.'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'شكراً لك! تم الدفع بنجاح' : 'Thank You! Payment Successful'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? 'لقد استلمنا دفعتك بنجاح. يمكنك الآن متابعة حالة طلبك من لوحة التحكم.'
                : 'We have successfully received your payment. You can now track your order from the dashboard.'}
            </p>
            <div className="pt-4 space-y-3">
              <Button onClick={() => navigate('/dashboard/orders')} className="w-full gap-2 h-12 text-lg">
                {language === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full h-12">
                {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'شكراً لك! تم الدفع بنجاح' : 'Thank You! Payment Successful'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? 'لقد استلمنا دفعتك بنجاح. يمكنك الآن متابعة حالة طلبك من لوحة التحكم.'
                : 'We have successfully received your payment. You can now track your order from the dashboard.'}
            </p>
            <div className="pt-4 space-y-3">
              <Button onClick={() => navigate('/dashboard/orders')} className="w-full gap-2 h-12 text-lg">
                {language === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full h-12">
                {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
