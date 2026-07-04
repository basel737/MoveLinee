// Keep browser requests same-origin so the Vite development proxy can forward
// `/api` calls to the backend without triggering browser CORS enforcement.
export const API_BASE_URL = '';

// Default headers for API requests
export const getHeaders = () => {
  const token = localStorage.getItem('moveline_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

// Function to refresh token when expired
export const refreshTokenIfExpired = async (email: string, password: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const newToken = data.access || data.token || data.access_token;
      if (newToken) {
        localStorage.setItem('moveline_token', newToken);
        return newToken;
      }
    } else {
      localStorage.removeItem('moveline_token');
    }
  } catch {
    localStorage.removeItem('moveline_token');
  }
  return null;
};

export interface LoginResponse {
  access: string;
  refresh: string;
  user: { id: number; role: string };
}

// Login function — returns full server response so caller has access+refresh+user
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Login failed: ${response.statusText}`);
  }

  const data: LoginResponse = await response.json();
  localStorage.setItem('moveline_token', data.access);
  localStorage.setItem('moveline_refresh_token', data.refresh);
  return data;
};

// Analyzed item from AI
export interface AnalyzedItem {
  label: string;
  quantity: number;
  is_fragile: boolean;
}

// Order creation payload
export interface CreateOrderPayload {
  required_vehicle_type: 'small' | 'medium' | 'large';
  required_workers: number;
  scheduled_start: string;
  pickup_address: string;
  pickup_latitude: string;
  pickup_longitude: string;
  pickup_floor: number;
  pickup_has_elevator: boolean;
  dropoff_address: string;
  dropoff_latitude: string;
  dropoff_longitude: string;
  dropoff_floor: number;
  dropoff_has_elevator: boolean;
  assembly: boolean;
  disassembly: boolean;
  service_notes: string;
  items: AnalyzedItem[];
  success_url: string;
  cancel_url: string;
}

// AI Analysis response
export interface AIAnalysisResponse {
  items: AnalyzedItem[];
  volume?: string;
  itemCount?: number;
  suggestedVehicle?: 'small' | 'medium' | 'large';
  suggestedWorkers?: number;
}

// Phase 1: Send order data → backend creates Stripe Checkout Session (no order created yet)
export const createOrder = async (payload: CreateOrderPayload): Promise<{ checkout_url: string; session_id: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/payments/stripe/create-order-checkout/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Failed to create checkout session: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && Object.keys(errorData).length > 0) {
        message = Object.entries(errorData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      }
    } catch {
      // ignore JSON parse failure, use status text
    }
    throw new Error(message);
  }

  return response.json();
};

// Phase 2: Confirm payment → backend verifies Stripe session and creates the order
export const confirmPayment = async (sessionId: string): Promise<{ success: boolean; message?: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/payments/stripe/confirm-order-checkout/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Payment confirmation failed: ${errorText}`);
  }

  return response.json();
};




// Analyze photos with AI
export const analyzePhotos = async (file: File): Promise<AIAnalysisResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/ai/analyze/`, {
    method: 'POST',
    headers: { 'Authorization': getHeaders().Authorization },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to analyze photo: ${errorText}`);
  }

  return response.json();
};

// Haversine distance calculation (in km)
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate estimated time (2 min per km)
export const calculateEstimatedTime = (distanceKm: number): number => {
  return Math.round(distanceKm * 2);
};

// Pricing constants
export const VEHICLE_PRICES = {
  small: 5,    // $5 per km
  medium: 7.5, // $7.5 per km
  large: 10,   // $10 per km
} as const;

export const WORKER_PRICE = 5; // $5 per worker

export const SERVICE_PRICES = {
  assembly: 10,
  disassembly: 10,
} as const;

// Calculate total price
export const calculatePrice = (
  distanceKm: number,
  vehicleType: 'small' | 'medium' | 'large',
  workerCount: number,
  hasAssembly: boolean,
  hasDisassembly: boolean
): number => {
  let total = 0;

  // Vehicle pricing (per km)
  total += distanceKm * VEHICLE_PRICES[vehicleType];

  // Worker pricing
  total += workerCount * WORKER_PRICE;

  // Service pricing
  if (hasAssembly) total += SERVICE_PRICES.assembly;
  if (hasDisassembly) total += SERVICE_PRICES.disassembly;

  return Math.round(total * 100) / 100; // Round to 2 decimals
};
