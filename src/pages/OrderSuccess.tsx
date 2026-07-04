import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext1';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-card border border-border rounded-2xl p-12 shadow-elegant text-center space-y-8 animate-fade-in">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {language === 'ar' ? '✓ تم إنشاء الطلب بنجاح!' : '✓ Order Created Successfully!'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === 'ar'
                ? 'شكراً لاختيارك خدماتنا. طلبك قيد المعالجة الآن.'
                : 'Thank you for choosing our services. Your order is now being processed.'}
            </p>
          </div>

          {/* Order Details Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Package className="w-6 h-6 text-primary mt-1" />
              <div className="text-left flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {language === 'ar' ? 'ماذا يحدث الآن؟' : "What's Next?"}
                </h3>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>
                    {language === 'ar'
                      ? '✓ تم حفظ تفاصيل طلبك'
                      : '✓ Your order details have been saved'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? '✓ سيتم إسناد السائق والعمال قريباً'
                      : '✓ Driver and workers will be assigned shortly'}
                  </li>
                  <li>
                    {language === 'ar'
                      ? '✓ ستتلقى تنبيهات عند كل تحديث'
                      : '✓ You will receive notifications for updates'}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Button
              onClick={() => navigate('/dashboard/orders')}
              className="h-12 text-base gap-2 flex items-center justify-center"
            >
              <Package className="w-5 h-5" />
              {language === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
            </Button>
            <Button
              onClick={() => navigate('/dashboard/track')}
              variant="outline"
              className="h-12 text-base gap-2 flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              {language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
            </Button>
          </div>

          {/* Secondary Button */}
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            {language === 'ar' ? 'العودة لوحة التحكم' : 'Back to Dashboard'}
          </Button>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center text-muted-foreground text-sm">
          <p>
            {language === 'ar'
              ? 'هل تحتاج إلى مساعدة؟'
              : 'Need help?'}{' '}
            <a href="/contact" className="text-primary hover:underline font-medium">
              {language === 'ar' ? 'اتصل بنا' : 'Contact us'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
