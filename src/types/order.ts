export type ServiceType = 
  | 'home-furniture'
  | 'intercity'
  | 'moving-storage'
  | 'office-business';

export type AddonService = 
  | 'packing'
  | 'loading'
  | 'transportation'
  | 'unloading'
  | 'unpacking'
  | 'disassembly';

export interface Location {
  address: string;
  city: string;
  lat?: number;
  lng?: number;
}

export interface AIAnalysis {
  volume: string;
  itemCount: number;
  itemTypes: string[];
  disassemblyNeeded: boolean;
  suggestedVehicle: string;
  suggestedMovers: number;
  estimatedPrice: number;
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

export type PaymentMethod = 'card' | 'cash' | 'partial';

export interface PaymentInfo {
  method: PaymentMethod;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  partialAmount?: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'driver-assigned'
  | 'in-transit'
  | 'arrived'
  | 'completed';

export interface OrderTracking {
  status: OrderStatus;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  estimatedArrival?: string;
  currentLocation?: { lat: number; lng: number };
}

export interface Rating {
  serviceRating: number;
  staffRating: number;
  feedback: string;
}

export interface Order {
  id: string;
  step: number;
  serviceType: ServiceType | null;
  addons: AddonService[];
  hasDontWorryBundle: boolean;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  estimatedDistance: number | null;
  estimatedDuration: number | null;
  photos: UploadedPhoto[];
  aiAnalysis: AIAnalysis | null;
  vehicleType: string;
  numberOfMovers: number;
  scheduledDate: Date | null;
  scheduledTimeSlot: TimeSlot | null;
  customerInfo: CustomerInfo;
  paymentInfo: PaymentInfo | null;
  tracking: OrderTracking;
  rating: Rating | null;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderContextType {
  order: Order;
  isLoading: boolean;
  error: string | null;
  setServiceType: (type: ServiceType) => Promise<void>;
  toggleAddon: (addon: AddonService) => void;
  setDontWorryBundle: (enabled: boolean) => void;
  setPickupLocation: (location: Location) => void;
  setDropoffLocation: (location: Location) => void;
  addPhoto: (photo: UploadedPhoto) => void;
  removePhoto: (id: string) => void;
  analyzePhotos: () => Promise<void>;
  setVehicleType: (type: string) => void;
  setNumberOfMovers: (count: number) => void;
  setScheduledDate: (date: Date) => void;
  setScheduledTimeSlot: (slot: TimeSlot) => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  setPaymentInfo: (info: PaymentInfo) => void;
  processPayment: () => Promise<void>;
  submitRating: (rating: Rating) => Promise<void>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  calculatePrice: () => number;
  resetOrder: () => void;
}

export const ADDON_PRICES: Record<AddonService, number> = {
  packing: 50,
  loading: 40,
  transportation: 100,
  unloading: 40,
  unpacking: 50,
  disassembly: 60,
};

export const BUNDLE_PRICE = 280;
export const BUNDLE_SAVINGS = 60;

export const SERVICE_BASE_PRICES: Record<ServiceType, number> = {
  'home-furniture': 150,
  'intercity': 300,
  'moving-storage': 200,
  'office-business': 250,
};
