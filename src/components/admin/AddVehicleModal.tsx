import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/context/LanguageContext1';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CreateVehiclePayload } from '@/types/vehicle';
import { vehiclesService } from '@/services/vehicles';
import { toast } from '@/hooks/use-toast';

const getVehicleSchema = (language: 'en' | 'ar') => {
  const isEn = language === 'en';
  return z.object({
    office: z.coerce
      .number()
      .min(1, isEn ? 'Office number must be at least 1' : 'رقم المكتب يجب أن يكون 1 على الأقل'),
    name: z.string().min(1, isEn ? 'Vehicle name is required' : 'اسم الشاحنة مطلوب'),
    vehicle_type: z.string().min(1, isEn ? 'Vehicle type is required' : 'نوع الشاحنة مطلوب'),
    max_payload_kg: z.coerce
      .number()
      .min(1, isEn ? 'Max payload must be greater than 0' : 'الحمولة القصوى يجب أن تكون أكبر من 0'),
    plate_number: z.string().min(1, isEn ? 'Plate number is required' : 'رقم اللوحة مطلوب'),
    is_available: z.boolean().default(true),
  });
};

const translations = {
  en: {
    addVehicle: 'Add Vehicle',
    office: 'Office Number',
    vehicleName: 'Vehicle Name',
    vehicleType: 'Vehicle Type',
    maxPayload: 'Max Payload (kg)',
    plateNumber: 'Plate Number',
    isAvailable: 'Is Available',
    submit: 'Add Vehicle',
    submitting: 'Adding...',
    cancel: 'Cancel',
    successMsg: 'Vehicle added successfully',
    errorMsg: 'Failed to add vehicle',
    selectType: 'Select Type',
    small: 'Small Van / Pickup',
    medium: 'Medium Truck',
    large: 'Large Truck',
  },
  ar: {
    addVehicle: 'إضافة شاحنة',
    office: 'رقم المكتب',
    vehicleName: 'اسم الشاحنة / المركبة',
    vehicleType: 'نوع الشاحنة',
    maxPayload: 'الحمولة القصوى (كغ)',
    plateNumber: 'رقم اللوحة',
    isAvailable: 'المركبة متاحة',
    submit: 'إضافة الشاحنة',
    submitting: 'جاري الإضافة...',
    cancel: 'إلغاء',
    successMsg: 'تمت إضافة الشاحنة بنجاح',
    errorMsg: 'فشلت إضافة الشاحنة',
    selectType: 'اختر النوع',
    small: 'فان صغير / بيك آب',
    medium: 'شاحنة متوسطة',
    large: 'شاحنة كبيرة',
  }
};

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = translations[language];
  const schema = getVehicleSchema(language);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateVehiclePayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      office: 1,
      name: '',
      vehicle_type: 'small',
      max_payload_kg: 1000,
      plate_number: '',
      is_available: true,
    },
  });

  const onSubmit = async (data: CreateVehiclePayload) => {
    setIsSubmitting(true);
    try {
      await vehiclesService.createVehicle(data);
      toast({
        title: t.successMsg,
      });
      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      console.error('Error in AddVehicleModal submit:', error);
      let apiError = t.errorMsg;
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          apiError = errorData;
        } else if (typeof errorData === 'object') {
          apiError = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
        }
      }
      toast({
        title: t.errorMsg,
        description: apiError,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            {t.addVehicle}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="office"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.office}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.plateNumber}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SY-1240" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.vehicleName}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Box Truck 02" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.vehicleType}</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="small">{t.small}</option>
                        <option value="medium">{t.medium}</option>
                        <option value="large">{t.large}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_payload_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.maxPayload}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t.isAvailable}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t.submitting : t.submit}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
