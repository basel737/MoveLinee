import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Order,
  OrderContextType,
  ServiceType,
  AddonService,
  Location,
  UploadedPhoto,
  TimeSlot,
  CustomerInfo,
  PaymentInfo,
  Rating,
  AIAnalysis,
  ADDON_PRICES,
  BUNDLE_PRICE,
  SERVICE_BASE_PRICES,
} from '@/types/order';
import { mockApi } from '@/lib/mockApi';

const createInitialOrder = (): Order => ({
  id: '',
  step: 1,
  serviceType: null,
  addons: [],
  hasDontWorryBundle: false,
  pickupLocation: null,
  dropoffLocation: null,
  estimatedDistance: null,
  estimatedDuration: null,
  photos: [],
  aiAnalysis: null,
  vehicleType: 'Van',
  numberOfMovers: 2,
  scheduledDate: null,
  scheduledTimeSlot: null,
  customerInfo: {
    fullName: '',
    phone: '',
    email: '',
    notes: '',
  },
  paymentInfo: null,
  tracking: {
    status: 'pending',
  },
  rating: null,
  totalPrice: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const OrderContext = createContext<OrderContextType | null>(null);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [order, setOrder] = useState<Order>(createInitialOrder());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrder = useCallback((updates: Partial<Order>) => {
    setOrder(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date(),
    }));
  }, []);

  const calculatePrice = useCallback(() => {
    let price = 0;

    // Base service price
    if (order.serviceType) {
      price += SERVICE_BASE_PRICES[order.serviceType];
    }

    // Addons or bundle
    if (order.hasDontWorryBundle) {
      price += BUNDLE_PRICE;
    } else {
      order.addons.forEach(addon => {
        price += ADDON_PRICES[addon];
      });
    }

    // Distance-based pricing
    if (order.estimatedDistance) {
      price += order.estimatedDistance * 2; // $2 per km
    }

    // Movers pricing
    price += (order.numberOfMovers - 2) * 30; // Additional movers

    return price;
  }, [order]);

  const setServiceType = useCallback(async (type: ServiceType) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mockApi.createOrder(type);
      updateOrder({
        id: response.orderId,
        serviceType: type,
      });
      toast.success('Service selected successfully');
    } catch (err) {
      setError('Failed to create order');
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [updateOrder]);

  const toggleAddon = useCallback((addon: AddonService) => {
    setOrder(prev => {
      const hasAddon = prev.addons.includes(addon);
      const newAddons = hasAddon
        ? prev.addons.filter(a => a !== addon)
        : [...prev.addons, addon];
      
      return {
        ...prev,
        addons: newAddons,
        hasDontWorryBundle: false,
        updatedAt: new Date(),
      };
    });
  }, []);

  const setDontWorryBundle = useCallback((enabled: boolean) => {
    setOrder(prev => ({
      ...prev,
      hasDontWorryBundle: enabled,
      addons: enabled 
        ? ['packing', 'loading', 'transportation', 'unloading', 'unpacking', 'disassembly']
        : [],
      updatedAt: new Date(),
    }));
  }, []);

  const setPickupLocation = useCallback((location: Location) => {
    updateOrder({ pickupLocation: location });
  }, [updateOrder]);

  const setDropoffLocation = useCallback((location: Location) => {
    // Calculate distance if both locations have coordinates
    let distance: number | null = null;
    let duration: number | null = null;
    
    if (order.pickupLocation?.lat && order.pickupLocation?.lng && location.lat && location.lng) {
      // Haversine formula for distance
      const R = 6371; // Earth's radius in km
      const dLat = (location.lat - order.pickupLocation.lat) * Math.PI / 180;
      const dLon = (location.lng - order.pickupLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(order.pickupLocation.lat * Math.PI / 180) * Math.cos(location.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = Math.round(R * c);
      duration = Math.round(distance * 2); // Estimate 2 min per km
    }

    updateOrder({
      dropoffLocation: location,
      estimatedDistance: distance,
      estimatedDuration: duration,
    });
  }, [order.pickupLocation, updateOrder]);

  const addPhoto = useCallback((photo: UploadedPhoto) => {
    setOrder(prev => ({
      ...prev,
      photos: [...prev.photos, photo],
      updatedAt: new Date(),
    }));
  }, []);

  const removePhoto = useCallback((id: string) => {
    setOrder(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id),
      updatedAt: new Date(),
    }));
  }, []);

  const analyzePhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mockApi.analyzePhotos(order.photos);
      updateOrder({ aiAnalysis: response });
      
      // Auto-update suggestions
      if (response.suggestedVehicle) {
        updateOrder({ vehicleType: response.suggestedVehicle });
      }
      if (response.suggestedMovers) {
        updateOrder({ numberOfMovers: response.suggestedMovers });
      }
      
      toast.success('AI analysis complete');
    } catch (err) {
      setError('Failed to analyze photos');
      toast.error('Failed to analyze photos. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [order.photos, updateOrder]);

  const setVehicleType = useCallback((type: string) => {
    updateOrder({ vehicleType: type });
  }, [updateOrder]);

  const setNumberOfMovers = useCallback((count: number) => {
    updateOrder({ numberOfMovers: count });
  }, [updateOrder]);

  const setScheduledDate = useCallback((date: Date) => {
    updateOrder({ scheduledDate: date });
  }, [updateOrder]);

  const setScheduledTimeSlot = useCallback((slot: TimeSlot) => {
    updateOrder({ scheduledTimeSlot: slot });
  }, [updateOrder]);

  const setCustomerInfo = useCallback((info: CustomerInfo) => {
    updateOrder({ customerInfo: info });
  }, [updateOrder]);

  const setPaymentInfo = useCallback((info: PaymentInfo) => {
    updateOrder({ paymentInfo: info });
  }, [updateOrder]);

  const processPayment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await mockApi.processPayment(order.id, order.paymentInfo!);
      updateOrder({
        totalPrice: calculatePrice(),
        tracking: { status: 'confirmed' },
      });
      toast.success('Payment processed successfully');
    } catch (err) {
      setError('Payment failed');
      toast.error('Payment failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [order.id, order.paymentInfo, calculatePrice, updateOrder]);

  const submitRating = useCallback(async (rating: Rating) => {
    setIsLoading(true);
    setError(null);
    try {
      await mockApi.submitRating(order.id, rating);
      updateOrder({ rating });
      toast.success('Thank you for your feedback!');
    } catch (err) {
      setError('Failed to submit rating');
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [order.id, updateOrder]);

  const goToStep = useCallback((step: number) => {
    updateOrder({ step });
  }, [updateOrder]);

  const nextStep = useCallback(() => {
    setOrder(prev => ({
      ...prev,
      step: Math.min(prev.step + 1, 10),
      updatedAt: new Date(),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setOrder(prev => ({
      ...prev,
      step: Math.max(prev.step - 1, 1),
      updatedAt: new Date(),
    }));
  }, []);

  const resetOrder = useCallback(() => {
    setOrder(createInitialOrder());
    setError(null);
  }, []);

  const value = useMemo<OrderContextType>(() => ({
    order,
    isLoading,
    error,
    setServiceType,
    toggleAddon,
    setDontWorryBundle,
    setPickupLocation,
    setDropoffLocation,
    addPhoto,
    removePhoto,
    analyzePhotos,
    setVehicleType,
    setNumberOfMovers,
    setScheduledDate,
    setScheduledTimeSlot,
    setCustomerInfo,
    setPaymentInfo,
    processPayment,
    submitRating,
    goToStep,
    nextStep,
    prevStep,
    calculatePrice,
    resetOrder,
  }), [
    order,
    isLoading,
    error,
    setServiceType,
    toggleAddon,
    setDontWorryBundle,
    setPickupLocation,
    setDropoffLocation,
    addPhoto,
    removePhoto,
    analyzePhotos,
    setVehicleType,
    setNumberOfMovers,
    setScheduledDate,
    setScheduledTimeSlot,
    setCustomerInfo,
    setPaymentInfo,
    processPayment,
    submitRating,
    goToStep,
    nextStep,
    prevStep,
    calculatePrice,
    resetOrder,
  ]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
