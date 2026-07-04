import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'Move-Line',
    'app.subtitle': 'Professional Moving Services',
    
    // Steps
    'step.service': 'Service',
    'step.addons': 'Add-ons',
    'step.locations': 'Locations',
    'step.photos': 'Photos',
    'step.confirm': 'Confirm',
    'step.schedule': 'Schedule',
    'step.info': 'Info',
    'step.payment': 'Payment',
    'step.tracking': 'Tracking',
    'step.rating': 'Rating',
    
    // Step 1
    'step1.title': 'Choose Your Service',
    'step1.subtitle': 'Select the type of moving service you need',
    'service.home': 'Home Furniture Moving',
    'service.home.desc': 'Professional moving of household items and furniture',
    'service.intercity': 'Intercity Moving',
    'service.intercity.desc': 'Long-distance moving between cities',
    'service.storage': 'Moving & Storage',
    'service.storage.desc': 'Moving with temporary storage solutions',
    'service.office': 'Office & Business Moving',
    'service.office.desc': 'Commercial and office relocations',
    
    // Step 2
    'step2.title': 'Additional Services',
    'step2.subtitle': 'Customize your moving experience',
    'addon.packing': 'Packing & Wrapping',
    'addon.packing.desc': 'Professional packing of all items',
    'addon.loading': 'Loading',
    'addon.loading.desc': 'Careful loading into vehicle',
    'addon.transportation': 'Transportation',
    'addon.transportation.desc': 'Safe transport to destination',
    'addon.unloading': 'Unloading',
    'addon.unloading.desc': 'Careful unloading at destination',
    'addon.unpacking': 'Unpacking',
    'addon.unpacking.desc': 'Unpacking and arrangement',
    'addon.disassembly': 'Disassembly',
    'addon.disassembly.desc': 'Furniture disassembly & assembly',
    'bundle.title': "Don't Worry Bundle",
    'bundle.desc': 'All services included at a discounted price',
    'bundle.save': 'Save',
    
    // Step 3
    'step3.title': 'Set Locations',
    'step3.subtitle': 'Enter pickup and drop-off addresses',
    'location.pickup': 'Pickup Location',
    'location.dropoff': 'Drop-off Location',
    'location.distance': 'Estimated Distance',
    'location.duration': 'Estimated Duration',
    'location.km': 'km',
    'location.min': 'min',
    
    // Step 4
    'step4.title': 'Photo Analysis',
    'step4.subtitle': 'Upload photos for AI-powered estimation',
    'photo.upload': 'Upload Photos',
    'photo.analyze': 'Analyze Photos',
    'photo.analyzing': 'Analyzing...',
    'ai.volume': 'Estimated Volume',
    'ai.items': 'Item Count',
    'ai.type': 'Item Type',
    'ai.disassembly': 'Disassembly Needed',
    'ai.vehicle': 'Suggested Vehicle',
    'ai.movers': 'Suggested Movers',
    'ai.price': 'Estimated Price',
    
    // Step 5
    'step5.title': 'Confirm Details',
    'step5.subtitle': 'Review and adjust your order',
    'confirm.vehicle': 'Vehicle Type',
    'confirm.movers': 'Number of Movers',
    'confirm.summary': 'Order Summary',
    
    // Step 6
    'step6.title': 'Schedule Move',
    'step6.subtitle': 'Select your preferred date and time',
    'schedule.date': 'Select Date',
    'schedule.time': 'Select Time Slot',
    'schedule.morning': 'Morning (8AM - 12PM)',
    'schedule.afternoon': 'Afternoon (12PM - 4PM)',
    'schedule.evening': 'Evening (4PM - 8PM)',
    
    // Step 7
    'step7.title': 'Your Information',
    'step7.subtitle': 'Enter your contact details',
    'info.name': 'Full Name',
    'info.phone': 'Phone Number',
    'info.email': 'Email (Optional)',
    'info.notes': 'Additional Notes',
    
    // Step 8
    'step8.title': 'Payment',
    'step8.subtitle': 'Choose your payment method',
    'payment.card': 'Credit/Debit Card',
    'payment.cash': 'Cash on Delivery',
    'payment.partial': 'Partial Payment',
    'payment.total': 'Total Amount',
    'payment.pay': 'Pay Now',
    'payment.processing': 'Processing...',
    
    // Step 9
    'step9.title': 'Track Your Move',
    'step9.subtitle': 'Real-time order tracking',
    'tracking.status': 'Order Status',
    'tracking.pending': 'Pending',
    'tracking.confirmed': 'Confirmed',
    'tracking.in_transit': 'In Transit',
    'tracking.delivered': 'Delivered',
    'tracking.driver': 'Contact Driver',
    'tracking.support': 'Contact Support',
    
    // Step 10
    'step10.title': 'Rate Your Experience',
    'step10.subtitle': 'Help us improve our service',
    'rating.service': 'Service Quality',
    'rating.staff': 'Staff Rating',
    'rating.feedback': 'Your Feedback',
    'rating.submit': 'Submit Rating',
    
    // Common
    'common.next': 'Next',
    'common.back': 'Back',
    'common.submit': 'Submit',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.success': 'Success!',
    'common.currency': '$',
    'common.yes': 'Yes',
    'common.no': 'No',
  },
  ar: {
    // Header
    'app.title': 'موف لاين',
    'app.subtitle': 'خدمات نقل احترافية',
    
    // Steps
    'step.service': 'الخدمة',
    'step.addons': 'إضافات',
    'step.locations': 'المواقع',
    'step.photos': 'الصور',
    'step.confirm': 'تأكيد',
    'step.schedule': 'الموعد',
    'step.info': 'المعلومات',
    'step.payment': 'الدفع',
    'step.tracking': 'التتبع',
    'step.rating': 'التقييم',
    
    // Step 1
    'step1.title': 'اختر نوع الخدمة',
    'step1.subtitle': 'اختر نوع خدمة النقل التي تحتاجها',
    'service.home': 'نقل أثاث منزلي',
    'service.home.desc': 'نقل احترافي للأثاث والمقتنيات المنزلية',
    'service.intercity': 'نقل بين المدن',
    'service.intercity.desc': 'نقل لمسافات طويلة بين المدن',
    'service.storage': 'نقل وتخزين',
    'service.storage.desc': 'نقل مع حلول تخزين مؤقتة',
    'service.office': 'نقل مكاتب وشركات',
    'service.office.desc': 'نقل تجاري ومكتبي',
    
    // Step 2
    'step2.title': 'خدمات إضافية',
    'step2.subtitle': 'خصص تجربة النقل الخاصة بك',
    'addon.packing': 'التغليف والتعبئة',
    'addon.packing.desc': 'تغليف احترافي لجميع الأغراض',
    'addon.loading': 'التحميل',
    'addon.loading.desc': 'تحميل بعناية في السيارة',
    'addon.transportation': 'النقل',
    'addon.transportation.desc': 'نقل آمن للوجهة',
    'addon.unloading': 'التفريغ',
    'addon.unloading.desc': 'تفريغ بعناية في الوجهة',
    'addon.unpacking': 'فك التغليف',
    'addon.unpacking.desc': 'فك التغليف والترتيب',
    'addon.disassembly': 'الفك والتركيب',
    'addon.disassembly.desc': 'فك وتركيب الأثاث',
    'bundle.title': 'باقة لا تقلق',
    'bundle.desc': 'جميع الخدمات بسعر مخفض',
    'bundle.save': 'وفر',
    
    // Step 3
    'step3.title': 'تحديد المواقع',
    'step3.subtitle': 'أدخل عناوين الاستلام والتسليم',
    'location.pickup': 'موقع الاستلام',
    'location.dropoff': 'موقع التسليم',
    'location.distance': 'المسافة التقديرية',
    'location.duration': 'الوقت التقديري',
    'location.km': 'كم',
    'location.min': 'دقيقة',
    
    // Step 4
    'step4.title': 'تحليل الصور',
    'step4.subtitle': 'ارفع صورًا للتقدير بالذكاء الاصطناعي',
    'photo.upload': 'رفع الصور',
    'photo.analyze': 'تحليل الصور',
    'photo.analyzing': 'جاري التحليل...',
    'ai.volume': 'الحجم التقديري',
    'ai.items': 'عدد القطع',
    'ai.type': 'نوع الأغراض',
    'ai.disassembly': 'يحتاج فك',
    'ai.vehicle': 'السيارة المقترحة',
    'ai.movers': 'العمال المقترحين',
    'ai.price': 'السعر التقديري',
    
    // Step 5
    'step5.title': 'تأكيد التفاصيل',
    'step5.subtitle': 'راجع وعدّل طلبك',
    'confirm.vehicle': 'نوع السيارة',
    'confirm.movers': 'عدد العمال',
    'confirm.summary': 'ملخص الطلب',
    
    // Step 6
    'step6.title': 'جدولة النقل',
    'step6.subtitle': 'اختر التاريخ والوقت المفضل',
    'schedule.date': 'اختر التاريخ',
    'schedule.time': 'اختر الفترة الزمنية',
    'schedule.morning': 'صباحًا (8ص - 12م)',
    'schedule.afternoon': 'ظهرًا (12م - 4م)',
    'schedule.evening': 'مساءً (4م - 8م)',
    
    // Step 7
    'step7.title': 'معلوماتك',
    'step7.subtitle': 'أدخل بيانات التواصل',
    'info.name': 'الاسم الكامل',
    'info.phone': 'رقم الهاتف',
    'info.email': 'البريد الإلكتروني (اختياري)',
    'info.notes': 'ملاحظات إضافية',
    
    // Step 8
    'step8.title': 'الدفع',
    'step8.subtitle': 'اختر طريقة الدفع',
    'payment.card': 'بطاقة ائتمان/خصم',
    'payment.cash': 'الدفع عند التسليم',
    'payment.partial': 'دفع جزئي',
    'payment.total': 'المبلغ الإجمالي',
    'payment.pay': 'ادفع الآن',
    'payment.processing': 'جاري المعالجة...',
    
    // Step 9
    'step9.title': 'تتبع نقلتك',
    'step9.subtitle': 'تتبع الطلب في الوقت الفعلي',
    'tracking.status': 'حالة الطلب',
    'tracking.pending': 'قيد الانتظار',
    'tracking.confirmed': 'مؤكد',
    'tracking.in_transit': 'في الطريق',
    'tracking.delivered': 'تم التسليم',
    'tracking.driver': 'اتصل بالسائق',
    'tracking.support': 'اتصل بالدعم',
    
    // Step 10
    'step10.title': 'قيّم تجربتك',
    'step10.subtitle': 'ساعدنا في تحسين خدمتنا',
    'rating.service': 'جودة الخدمة',
    'rating.staff': 'تقييم الفريق',
    'rating.feedback': 'ملاحظاتك',
    'rating.submit': 'إرسال التقييم',
    
    // Common
    'common.next': 'التالي',
    'common.back': 'السابق',
    'common.submit': 'إرسال',
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ ما',
    'common.success': 'نجاح!',
    'common.currency': '$',
    'common.yes': 'نعم',
    'common.no': 'لا',
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
