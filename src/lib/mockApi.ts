import { ServiceType, PaymentInfo, Rating, UploadedPhoto, AIAnalysis, TimeSlot } from '@/types/order';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const mockApi = {
  // POST /orders - Create new order
  createOrder: async (serviceType: ServiceType): Promise<{ orderId: string; message: string }> => {
    await delay(800);
    
    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network error. Please try again.');
    }
    
    return {
      orderId: generateId(),
      message: 'Order created successfully',
    };
  },

  // PATCH /orders/:id - Update order
  updateOrder: async (orderId: string, data: any): Promise<{ success: boolean }> => {
    await delay(500);
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    return { success: true };
  },

  // POST /uploads - Upload photos
  uploadPhoto: async (file: File): Promise<{ photoId: string; url: string }> => {
    await delay(1000);
    
    return {
      photoId: generateId(),
      url: URL.createObjectURL(file),
    };
  },

  // POST /analyze - AI photo analysis
  analyzePhotos: async (photos: UploadedPhoto[]): Promise<AIAnalysis> => {
    await delay(2500);
    
    // Simulate AI analysis based on number of photos
    const itemCount = photos.length * Math.floor(Math.random() * 5 + 3);
    const volume = `${(photos.length * 2.5).toFixed(1)} m³`;
    
    const itemTypes = [
      'Furniture',
      'Boxes',
      'Electronics',
      'Appliances',
      'Fragile items',
    ].slice(0, Math.min(photos.length + 1, 5));
    
    const disassemblyNeeded = photos.length > 2;
    
    let suggestedVehicle = 'Van';
    let suggestedMovers = 2;
    
    if (photos.length > 5) {
      suggestedVehicle = 'Large Truck';
      suggestedMovers = 4;
    } else if (photos.length > 2) {
      suggestedVehicle = 'Medium Truck';
      suggestedMovers = 3;
    }
    
    const estimatedPrice = 150 + (photos.length * 50) + (suggestedMovers * 30);
    
    return {
      volume,
      itemCount,
      itemTypes,
      disassemblyNeeded,
      suggestedVehicle,
      suggestedMovers,
      estimatedPrice,
    };
  },

  // GET /availability - Get available time slots
  getAvailability: async (date: Date): Promise<TimeSlot[]> => {
    await delay(600);
    
    const slots: TimeSlot[] = [
      { id: '1', time: '08:00 - 10:00', available: Math.random() > 0.3 },
      { id: '2', time: '10:00 - 12:00', available: Math.random() > 0.3 },
      { id: '3', time: '12:00 - 14:00', available: Math.random() > 0.5 },
      { id: '4', time: '14:00 - 16:00', available: Math.random() > 0.3 },
      { id: '5', time: '16:00 - 18:00', available: Math.random() > 0.4 },
      { id: '6', time: '18:00 - 20:00', available: Math.random() > 0.6 },
    ];
    
    return slots;
  },

  // POST /payments - Process payment
  processPayment: async (orderId: string, paymentInfo: PaymentInfo): Promise<{ 
    success: boolean; 
    transactionId: string;
    invoiceUrl: string;
  }> => {
    await delay(2000);
    
    // Simulate payment validation
    if (paymentInfo.method === 'card') {
      if (!paymentInfo.cardNumber || paymentInfo.cardNumber.length < 16) {
        throw new Error('Invalid card number');
      }
    }
    
    // Simulate occasional payment failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Payment declined. Please try a different payment method.');
    }
    
    return {
      success: true,
      transactionId: generateId(),
      invoiceUrl: `/invoice/${generateId()}`,
    };
  },

  // GET /tracking/:orderId - Get order tracking
  getTracking: async (orderId: string): Promise<{
    status: string;
    driverName: string;
    driverPhone: string;
    vehicleNumber: string;
    estimatedArrival: string;
    currentLocation: { lat: number; lng: number };
  }> => {
    await delay(500);
    
    return {
      status: 'in-transit',
      driverName: 'John Smith',
      driverPhone: '+1 (555) 123-4567',
      vehicleNumber: 'ML-2024',
      estimatedArrival: '15 minutes',
      currentLocation: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.006 + (Math.random() - 0.5) * 0.01,
      },
    };
  },

  // POST /ratings - Submit rating
  submitRating: async (orderId: string, rating: Rating): Promise<{ success: boolean }> => {
    await delay(800);
    
    if (rating.serviceRating < 1 || rating.serviceRating > 5) {
      throw new Error('Invalid rating');
    }
    
    return { success: true };
  },

  // Chat with support
  sendMessage: async (message: string): Promise<{ response: string }> => {
    await delay(1000);
    
    const responses = [
      "Thank you for your message! Our team is here to help. How can I assist you with your move today?",
      "I understand. Let me check that for you. Is there anything specific about your order you'd like to know?",
      "Great question! Our Move-Line service includes professional movers and premium equipment. Would you like more details?",
      "I'd be happy to help with that. Can you provide your order number so I can look into it?",
      "Our team typically responds within 30 minutes. In the meantime, is there anything else I can help with?",
    ];
    
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
    };
  },
};
