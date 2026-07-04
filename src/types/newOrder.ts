import { AnalyzedItem } from '@/lib/api';

export type VehicleType = 'small' | 'medium' | 'large';

export type ServiceType =
  | 'home-furniture'
  | 'intercity'
  | 'moving-storage'
  | 'office-business'
  | 'moving';

export type AddonService =
  | 'packing'
  | 'loading'
  | 'transportation'
  | 'unloading'
  | 'unpacking'
  | 'disassembly';

export interface LocationData {
  address: string;
  city?: string; // Optional or required? Step3 generates it. Making optional to avoid breaking other things if strict.
  lat: number;
  lng: number;
}

export interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  analyzed: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
}

export interface OrderPriceQuoteResponse {
  price?: number | string;
  total_price?: number | string;
  amount?: number | string;
  estimated_price?: number | string;
  total?: number | string;
  detail?: string;
}

export interface NewOrder {
  step: number;

  // Step 1: Service type
  serviceType: ServiceType;

  // Step 2: Add-ons
  hasAssembly: boolean;
  hasDisassembly: boolean;
  addons: AddonService[];
  hasDontWorryBundle: boolean;

  // Step 3: Locations
  pickupLocation: LocationData | null;
  dropoffLocation: LocationData | null;
  distanceKm: number | null;
  estimatedTimeMinutes: number | null;

  // Access Details (New Step)
  pickup_floor: number;
  pickup_has_elevator: boolean;
  dropoff_floor: number;
  dropoff_has_elevator: boolean;

  // Step 4: Photos & AI Analysis
  photos: UploadedPhoto[];
  analyzedItems: AnalyzedItem[];
  isAnalyzing: boolean;

  // Step 5: Confirmation
  vehicleType: VehicleType;
  workerCount: number;

  // Step 6: Schedule
  scheduledDate: Date | null;
  scheduledTime: string | null;

  // Step 7: Customer Info
  customerInfo: CustomerInfo;

  // Step 8: Payment
  specialInstructions: string;
  clientSecret?: string;
  backendPrice?: number | null;
  backendPriceLoading?: boolean;
  backendPriceError?: string | null;
}

export interface NewOrderContextType {
  order: NewOrder;
  isLoading: boolean;
  error: string | null;
  clientSecret: string | null;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  // Step 1: Service Type
  setServiceType: (type: ServiceType) => void;

  // Step 2: Add-ons
  toggleAssembly: () => void;
  toggleDisassembly: () => void;
  toggleAddon: (addon: AddonService) => void;
  setDontWorryBundle: (enabled: boolean) => void;

  // Step 3: Locations
  setPickupLocation: (location: LocationData) => void;
  setDropoffLocation: (location: LocationData) => void;
  setRouteDetails: (distanceKm: number, estimatedTimeMinutes: number) => void;

  // Access Details
  setAccessDetails: (details: { pickup_floor: number; pickup_has_elevator: boolean; dropoff_floor: number; dropoff_has_elevator: boolean }) => void;

  // Step 4: Photos
  addPhoto: (photo: UploadedPhoto) => void;
  removePhoto: (id: string) => void;
  analyzePhotos: () => Promise<void>;

  // Step 5: Confirmation
  setVehicleType: (type: VehicleType) => void;
  setWorkerCount: (count: number) => void;

  // Step 6: Schedule
  setScheduledDate: (date: Date) => void;
  setScheduledTime: (time: string) => void;

  // Step 7: Customer Info
  setCustomerInfo: (info: CustomerInfo) => void;

  // Step 8: Payment
  setSpecialInstructions: (instructions: string) => void;
  submitOrder: (paymentMethod?: string) => Promise<any>;
  fetchBackendPrice: () => Promise<boolean>;

  // Reset
  resetOrder: () => void;
  setClientSecret: (secret: string | null) => void;
}
