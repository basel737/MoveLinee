import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Plus, Minus, ArrowRight, ArrowLeft, 
  Info, ShieldCheck, Calculator, Clock, ClipboardList,
  MapPin, Navigation, ArrowUpDown
} from 'lucide-react';
import { useNewOrder } from '@/context/NewOrderContext';
import { useLanguage } from '@/context/LanguageContext1';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const NewStepAccessDetails: React.FC = () => {
  const { order, setAccessDetails, nextStep, prevStep } = useNewOrder();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const handleUpdate = (updates: Partial<{
    pickup_floor: number;
    pickup_has_elevator: boolean;
    dropoff_floor: number;
    dropoff_has_elevator: boolean;
  }>) => {
    setAccessDetails({
      pickup_floor: order.pickup_floor,
      pickup_has_elevator: order.pickup_has_elevator,
      dropoff_floor: order.dropoff_floor,
      dropoff_has_elevator: order.dropoff_has_elevator,
      ...updates
    });
  };

  const getFloorLabel = (val: number) => {
    if (val === 0) return `${t('access.ground')} (0)`;
    if (val === 1) return `First Floor (1)`;
    if (val === 2) return `Second Floor (2)`;
    if (val === 3) return `Third Floor (3)`;
    return `${val}th Floor (${val})`;
  };

  const FloorSelector = ({
    value,
    onChange,
    label,
    theme
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
    theme: 'pickup' | 'dropoff';
  }) => {
    const isPickup = theme === 'pickup';
    const activeColor = isPickup ? 'text-green-600' : 'text-red-600';
    const hoverBg = isPickup ? 'hover:bg-green-50' : 'hover:bg-red-50';
    const hoverBorder = isPickup ? 'hover:border-green-200' : 'hover:border-red-200';

    return (
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{label}</Label>
        <div className="flex items-center justify-between bg-slate-50/50 rounded-2xl border border-slate-200 p-2 shadow-sm">
          <button
            onClick={() => onChange(Math.max(0, value - 1))}
            disabled={value === 0}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 
              ${value === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : `bg-white border border-slate-200 text-slate-600 shadow-sm ${hoverBg} ${hoverBorder}`}`}
          >
            <Minus className="w-5 h-5" />
          </button>
          
          <div className="flex-1 text-center flex flex-col justify-center overflow-hidden">
             <AnimatePresence mode="popLayout">
               <motion.span 
                 key={value}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className={`text-lg font-bold ${activeColor}`}
               >
                 {getFloorLabel(value)}
               </motion.span>
             </AnimatePresence>
          </div>

          <button
            onClick={() => onChange(value + 1)}
            className={`w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm flex items-center justify-center transition-all duration-200 ${hoverBg} ${hoverBorder}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto w-full pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 shadow-sm">
          <Building className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
          {t('access.title')}
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          {t('access.subtitle')}
        </p>
      </motion.div>

      {/* Access Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-10">
        
        {/* Pickup Card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden transition-all duration-300 group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shadow-sm border border-green-100">
              <MapPin className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{t('access.pickup')}</h3>
              <p className="text-sm text-slate-500">Starting location details</p>
            </div>
          </div>

          <div className="space-y-8">
            <FloorSelector
              value={order.pickup_floor}
              onChange={(val) => handleUpdate({ pickup_floor: val })}
              label={t('access.floorNumber')}
              theme="pickup"
            />

            <AnimatePresence>
              {order.pickup_floor > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                          <ArrowUpDown className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-base font-bold text-slate-900 cursor-pointer">
                            {t('access.hasElevator')}
                          </Label>
                          <p className="text-sm text-slate-500 font-medium leading-snug pr-4">
                            Required for large or heavy items
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={order.pickup_has_elevator}
                        onCheckedChange={(checked) => handleUpdate({ pickup_has_elevator: checked })}
                        className="scale-110 data-[state=checked]:bg-green-600"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="bg-green-50/80 border border-green-100 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium leading-relaxed">
                This information helps us estimate the required team and equipment.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Drop-off Card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden transition-all duration-300 group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center shadow-sm border border-red-100">
              <Navigation className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{t('access.dropoff')}</h3>
              <p className="text-sm text-slate-500">Destination location details</p>
            </div>
          </div>

          <div className="space-y-8">
            <FloorSelector
              value={order.dropoff_floor}
              onChange={(val) => handleUpdate({ dropoff_floor: val })}
              label={t('access.floorNumber')}
              theme="dropoff"
            />

            <AnimatePresence>
              {order.dropoff_floor > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                          <ArrowUpDown className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-base font-bold text-slate-900 cursor-pointer">
                            {t('access.hasElevator')}
                          </Label>
                          <p className="text-sm text-slate-500 font-medium leading-snug pr-4">
                            Required for large or heavy items
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={order.dropoff_has_elevator}
                        onCheckedChange={(checked) => handleUpdate({ dropoff_has_elevator: checked })}
                        className="scale-110 data-[state=checked]:bg-red-600"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium leading-relaxed">
                Accurate access details help us provide a smoother moving experience.
              </p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Navigation Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col-reverse sm:flex-row gap-4 mb-16">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          className="flex-1 h-14 text-base font-semibold rounded-2xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all group"
        >
          {isRTL ? (
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          ) : (
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          )}
          {t('access.back')}
        </Button>
        <Button 
          onClick={nextStep} 
          className="flex-1 h-14 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all group"
        >
          {t('access.next')}
          {isRTL ? (
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          ) : (
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          )}
        </Button>
      </motion.div>

      {/* Bottom Trust Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-slate-50 rounded-3xl p-8 border border-slate-100"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center space-y-3 p-2">
            <div className="w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">Your information is secure</h4>
            <p className="text-sm text-slate-500 font-medium">We use industry-standard encryption</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-3 p-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 mb-2">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">Better planning</h4>
            <p className="text-sm text-slate-500 font-medium">Helps us assign the right team</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-2">
            <div className="w-12 h-12 rounded-full bg-amber-100/50 flex items-center justify-center text-amber-600 mb-2">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">Accurate pricing</h4>
            <p className="text-sm text-slate-500 font-medium">No hidden fees or surprises</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-2">
            <div className="w-12 h-12 rounded-full bg-purple-100/50 flex items-center justify-center text-purple-600 mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">On-time service</h4>
            <p className="text-sm text-slate-500 font-medium">Optimized schedules for efficiency</p>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};
