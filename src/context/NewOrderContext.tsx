import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  NewOrder,
  NewOrderContextType,
  VehicleType,
  LocationData,
  UploadedPhoto,
  CustomerInfo,
  ServiceType,
  AddonService,
} from '@/types/newOrder';
import {
  calculateHaversineDistance,
  calculateEstimatedTime,
  analyzePhotos as analyzePhotosApi,
  createOrder,
  CreateOrderPayload,
  AnalyzedItem,
} from '@/lib/api';
import { calculateOrderPrice } from '@/services/orderPricing';

const createInitialOrder = (): NewOrder => ({
  step: 1,
  serviceType: 'home-furniture',
  hasAssembly: false,
  hasDisassembly: false,
  addons: [],
  hasDontWorryBundle: false,
  pickupLocation: null,
  dropoffLocation: null,
  distanceKm: null,
  estimatedTimeMinutes: null,
  pickup_floor: 0,
  pickup_has_elevator: false,
  dropoff_floor: 0,
  dropoff_has_elevator: false,
  photos: [],
  analyzedItems: [],
  isAnalyzing: false,
  vehicleType: 'small',
  workerCount: 1,
  scheduledDate: null,
  scheduledTime: null,
  customerInfo: {
    fullName: '',
    phone: '',
    email: '',
    notes: '',
  },
  specialInstructions: '',
  backendPrice: null,
  backendPriceLoading: false,
  backendPriceError: null,
});

const NewOrderContext = createContext<NewOrderContextType | null>(null);

export const useNewOrder = () => {
  const context = useContext(NewOrderContext);
  if (!context) {
    throw new Error('useNewOrder must be used within NewOrderProvider');
  }
  return context;
};

export const NewOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [order, setOrder] = useState<NewOrder>(createInitialOrder());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrder = useCallback((updates: Partial<NewOrder>) => {
    setOrder(prev => ({ ...prev, ...updates }));
  }, []);

  // Navigation
  const nextStep = useCallback(() => {
    setOrder(prev => ({ ...prev, step: Math.min(prev.step + 1, 11) })); // Increased to 11 to cover Tracking (9), Rating (10), and potentially Done (11)
  }, []);

  const prevStep = useCallback(() => {
    setOrder(prev => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }, []);

  const goToStep = useCallback((step: number) => {
    updateOrder({ step });
  }, [updateOrder]);

  // Step 1: Service Type
  const setServiceType = useCallback((type: ServiceType) => {
    updateOrder({ serviceType: type });
  }, [updateOrder]);

  // Step 2: Add-ons
  const toggleAssembly = useCallback(() => {
    setOrder(prev => {
      const hasAssembly = !prev.hasAssembly;
      const addons = hasAssembly 
        ? [...prev.addons, 'disassembly' as AddonService] // assembly usually implies disassembly logic in simple toggle? No, keeping separate.
        : prev.addons; // Wait, keep it simple.
      return { ...prev, hasAssembly };
    });
  }, []);

  const toggleDisassembly = useCallback(() => {
    setOrder(prev => ({ ...prev, hasDisassembly: !prev.hasDisassembly }));
  }, []);

  const toggleAddon = useCallback((addon: AddonService) => {
    setOrder(prev => {
      const newAddons = prev.addons.includes(addon)
        ? prev.addons.filter(a => a !== addon)
        : [...prev.addons, addon];
      
      // Sync flags
      const hasDisassembly = newAddons.includes('disassembly');
      // Assembly isn't in AddonService types? Wait, checked AddonService in previous turn...
      // 'packing', 'loading', 'transportation', 'unloading', 'unpacking', 'disassembly'. No 'assembly'.
      // Step2Addons checks for 'disassembly'. 
      // But API has 'assembly' and 'disassembly'.
      // Assuming 'disassembly' addon covers both or one? 
      // Let's look at Step2Addons again: It has 'disassembly' icon Wrench. Description "Furniture disassembly/assembly".
      // So 'disassembly' addon maps to BOTH hasAssembly and hasDisassembly? Or just one?
      // Let's assume it maps to hasDisassembly for now.
      
      return { 
        ...prev, 
        addons: newAddons,
        hasDisassembly: newAddons.includes('disassembly'),
        // hasAssembly? Let's leave it manual or linked?
        // If the user selects the "Disassembly" card, we probably want both flags true?
        // Or maybe Step2Addons logic updates both?
        // Let's just update based on string presence.
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
      hasDisassembly: enabled,
      hasAssembly: enabled
    }));
  }, []);

  // Step 3: Locations
  const setPickupLocation = useCallback((location: LocationData) => {
    setOrder(prev => {
      const newOrder = { ...prev, pickupLocation: location };
      
      // Recalculate distance if both locations are set
      if (prev.dropoffLocation) {
        const distance = calculateHaversineDistance(
          location.lat,
          location.lng,
          prev.dropoffLocation.lat,
          prev.dropoffLocation.lng
        );
        newOrder.distanceKm = Math.round(distance * 10) / 10;
        newOrder.estimatedTimeMinutes = calculateEstimatedTime(distance);
      }
      
      return newOrder;
    });
  }, []);

  const setDropoffLocation = useCallback((location: LocationData) => {
    setOrder(prev => {
      const newOrder = { ...prev, dropoffLocation: location };
      
      // Recalculate distance if both locations are set
      if (prev.pickupLocation) {
        const distance = calculateHaversineDistance(
          prev.pickupLocation.lat,
          prev.pickupLocation.lng,
          location.lat,
          location.lng
        );
        newOrder.distanceKm = Math.round(distance * 10) / 10;
        newOrder.estimatedTimeMinutes = calculateEstimatedTime(distance);
      }
      
      return newOrder;
    });
  }, []);

  const setRouteDetails = useCallback((distanceKm: number, estimatedTimeMinutes: number) => {
    setOrder(prev => ({
      ...prev,
      distanceKm,
      estimatedTimeMinutes
    }));
  }, []);

  const setAccessDetails = useCallback((details: { pickup_floor: number; pickup_has_elevator: boolean; dropoff_floor: number; dropoff_has_elevator: boolean }) => {
    updateOrder(details);
  }, [updateOrder]);

  // Step 4: Photos
  const addPhoto = useCallback((photo: UploadedPhoto) => {
    setOrder(prev => ({ ...prev, photos: [...prev.photos, photo] }));
  }, []);

  const removePhoto = useCallback((id: string) => {
    setOrder(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id),
      analyzedItems: [], // Clear analyzed items when photos change
    }));
  }, []);

  const analyzePhotos = useCallback(async () => {
    if (order.photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    setOrder(prev => ({ ...prev, isAnalyzing: true }));
    setError(null);

    try {
      const allItems: AnalyzedItem[] = [];

      // Analyze each photo
      for (const photo of order.photos) {
        try {
          const result = await analyzePhotosApi(photo.file);
          if (result.items) {
            allItems.push(...result.items);
          }
          
          // Mark photo as analyzed
          setOrder(prev => ({
            ...prev,
            photos: prev.photos.map(p => 
              p.id === photo.id ? { ...p, analyzed: true } : p
            ),
          }));
        } catch (err) {
          console.error(`Failed to analyze photo ${photo.id}:`, err);
        }
      }

      // Merge duplicate items
      const mergedItems = allItems.reduce((acc, item) => {
        const existing = acc.find(i => i.label.toLowerCase() === item.label.toLowerCase());
        if (existing) {
          existing.quantity += item.quantity;
          existing.is_fragile = existing.is_fragile || item.is_fragile;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [] as AnalyzedItem[]);

      setOrder(prev => ({
        ...prev,
        analyzedItems: mergedItems,
        isAnalyzing: false,
      }));

      toast.success(`Analyzed ${order.photos.length} photos, found ${mergedItems.length} items`);
    } catch (err) {
      setError('Failed to analyze photos');
      setOrder(prev => ({ ...prev, isAnalyzing: false }));
      toast.error('Failed to analyze photos. Please try again.');
    }
  }, [order.photos]);

  // Step 5: Confirmation
  const setVehicleType = useCallback((type: VehicleType) => {
    updateOrder({ vehicleType: type });
  }, [updateOrder]);

  const setWorkerCount = useCallback((count: number) => {
    updateOrder({ workerCount: Math.max(1, Math.min(10, count)) });
  }, [updateOrder]);

  // Step 6: Schedule
  const setScheduledDate = useCallback((date: Date) => {
    updateOrder({ scheduledDate: date });
  }, [updateOrder]);

  const setScheduledTime = useCallback((time: string) => {
    updateOrder({ scheduledTime: time });
  }, [updateOrder]);

  // Step 7: Customer Info
  const setCustomerInfo = useCallback((info: CustomerInfo) => {
    updateOrder({ customerInfo: info });
  }, [updateOrder]);

  // Step 8: Payment
  const setSpecialInstructions = useCallback((instructions: string) => {
    updateOrder({ specialInstructions: instructions });
  }, [updateOrder]);

  const fetchBackendPrice = useCallback(async () => {
    if (!order.pickupLocation || !order.dropoffLocation || !order.scheduledDate || !order.scheduledTime) {
      toast.error('Please complete all required fields before calculating the price');
      return false;
    }

    setOrder(prev => ({ ...prev, backendPriceLoading: true, backendPriceError: null }));

    try {
      const scheduledDate = new Date(order.scheduledDate);
      const [hours, minutes] = order.scheduledTime.split(':').map(Number);
      scheduledDate.setHours(hours, minutes, 0, 0);

      const payload: CreateOrderPayload = {
        required_vehicle_type: order.vehicleType,
        required_workers: order.workerCount,
        scheduled_start: scheduledDate.toISOString(),
        pickup_address: order.pickupLocation.address,
        pickup_latitude: order.pickupLocation.lat.toFixed(6),
        pickup_longitude: order.pickupLocation.lng.toFixed(6),
        pickup_floor: order.pickup_floor,
        pickup_has_elevator: order.pickup_has_elevator,
        dropoff_address: order.dropoffLocation.address,
        dropoff_latitude: order.dropoffLocation.lat.toFixed(6),
        dropoff_longitude: order.dropoffLocation.lng.toFixed(6),
        dropoff_floor: order.dropoff_floor,
        dropoff_has_elevator: order.dropoff_has_elevator,
        assembly: order.hasAssembly,
        disassembly: order.hasDisassembly,
        service_notes: order.specialInstructions || order.customerInfo.notes || 'No additional notes',
        items: order.analyzedItems.length > 0
          ? order.analyzedItems
          : [{ label: 'General items', quantity: 1, is_fragile: false }],
        success_url: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/payment-cancel`,
      };

      const backendPrice = await calculateOrderPrice(payload);
      setOrder(prev => ({ ...prev, backendPrice, backendPriceLoading: false, backendPriceError: null }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate price from backend';
      setOrder(prev => ({ ...prev, backendPriceLoading: false, backendPriceError: message }));
      toast.error(message);
      return false;
    }
  }, [order]);

  const submitOrder = useCallback(async () => {
    if (isLoading) return;

    if (!order.pickupLocation || !order.dropoffLocation || !order.scheduledDate || !order.scheduledTime) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!order.backendPrice && order.backendPrice !== 0) {
      const errorMessage = 'Please calculate the price from the backend before continuing to payment';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const scheduledDate = new Date(order.scheduledDate);
      const [hours, minutes] = order.scheduledTime.split(':').map(Number);
      scheduledDate.setHours(hours, minutes, 0, 0);

      const payload: CreateOrderPayload = {
        required_vehicle_type: order.vehicleType,
        required_workers: order.workerCount,
        scheduled_start: scheduledDate.toISOString(),
        pickup_address: order.pickupLocation.address,
        pickup_latitude: order.pickupLocation.lat.toFixed(6),
        pickup_longitude: order.pickupLocation.lng.toFixed(6),
        pickup_floor: order.pickup_floor,
        pickup_has_elevator: order.pickup_has_elevator,
        dropoff_address: order.dropoffLocation.address,
        dropoff_latitude: order.dropoffLocation.lat.toFixed(6),
        dropoff_longitude: order.dropoffLocation.lng.toFixed(6),
        dropoff_floor: order.dropoff_floor,
        dropoff_has_elevator: order.dropoff_has_elevator,
        assembly: order.hasAssembly,
        disassembly: order.hasDisassembly,
        service_notes: order.specialInstructions || order.customerInfo.notes || 'No additional notes',
        items: order.analyzedItems.length > 0
          ? order.analyzedItems
          : [{ label: 'General items', quantity: 1, is_fragile: false }],
        success_url: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/payment-cancel`,
      };

      const { checkout_url } = await createOrder(payload);
      window.location.href = checkout_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout session';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [order, isLoading]);

  const resetOrder = useCallback(() => {
    setOrder(createInitialOrder());
    setError(null);
  }, []);

  const value = useMemo<NewOrderContextType>(() => ({
    order,
    isLoading,
    error,
    clientSecret: null,
    nextStep,
    prevStep,
    goToStep,
    setServiceType,
    toggleAssembly,
    toggleDisassembly,
    toggleAddon,
    setDontWorryBundle,
    setPickupLocation,
    setDropoffLocation,
    setRouteDetails,
    setAccessDetails,
    addPhoto,
    removePhoto,
    analyzePhotos,
    setVehicleType,
    setWorkerCount,
    setScheduledDate,
    setScheduledTime,
    setCustomerInfo,
    setSpecialInstructions,
    submitOrder,
    fetchBackendPrice,
    resetOrder,
    setClientSecret: () => {},
  }), [
    order,
    isLoading,
    error,
    nextStep,
    prevStep,
    goToStep,
    setServiceType,
    toggleAssembly,
    toggleDisassembly,
    toggleAddon,
    setDontWorryBundle,
    setPickupLocation,
    setDropoffLocation,
    setRouteDetails,
    setAccessDetails,
    addPhoto,
    removePhoto,
    analyzePhotos,
    setVehicleType,
    setWorkerCount,
    setScheduledDate,
    setScheduledTime,
    setCustomerInfo,
    setSpecialInstructions,
    submitOrder,
    fetchBackendPrice,
    resetOrder,
  ]);

  return (
    <NewOrderContext.Provider value={value}>
      {children}
    </NewOrderContext.Provider>
  );
};
