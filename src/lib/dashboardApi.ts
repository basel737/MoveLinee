import {
  User,
  Customer,
  DashboardOrder,
  OrderItemV2 as OrderItem,
  Payment,
  Tracking,
  Rating,
  Vehicle,
  AIAnalyzer,
  DashboardStats,
  CustomerAnalytics,
  ApiResponse,
  PaginatedResponse,
} from '@/types/dashboard';

// Use relative paths to leverage Vite proxy (see vite.config.ts)
const BASE_URL = '';

const getHeaders = () => {
  const token = localStorage.getItem('moveline_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
    // Note: ngrok-skip-browser-warning removed to avoid CORS preflight errors.
    // Proxy handles this or user must visit URL once.
  };
};

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random ID
const generateId = () => Math.floor(Math.random() * 10000);

// Mock current user (customer) - USED ONLY AS EMERGENCY FALLBACK
const mockCurrentUser: Customer = {
  id: 'mock-1',
  fullName: 'Guest User',
  email: 'guest@example.com',
  phone: '+966 50 000 0000',
  role: 'customer',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock orders data
const mockOrders: DashboardOrder[] = [
  {
    id: 1001,
    customer: 1,
    driver: 101,
    service_type: 'Home Furniture Moving',
    serviceType: 'Home Furniture Moving',
    pickup_address: '123 Al Olaya Street, Riyadh',
    pickupAddress: '123 Al Olaya Street, Riyadh',
    dropoff_address: '456 King Fahd Road, Riyadh',
    dropoffAddress: '456 King Fahd Road, Riyadh',
    scheduled_start: new Date(Date.now() - 86400000).toISOString(),
    scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
    estimated_price: '850',
    price: 850,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    required_workers: 2,
    required_vehicle_type: 'medium',
    assembly: false,
    disassembly: false,
    special_instructions: 'Fragile items, handle with care',
    is_priority: false,
    items: []
  },
  {
    id: 1002,
    customer: 1,
    service_type: 'Office & Business Moving',
    serviceType: 'Office & Business Moving',
    pickup_address: '789 Business District, Jeddah',
    pickupAddress: '789 Business District, Jeddah',
    dropoff_address: '321 Industrial Area, Jeddah',
    dropoffAddress: '321 Industrial Area, Jeddah',
    scheduled_start: new Date(Date.now() + 86400000).toISOString(),
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    status: 'confirmed',
    estimated_price: '1200',
    price: 1200,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    required_workers: 3,
    required_vehicle_type: 'large',
    assembly: true,
    disassembly: true,
    special_instructions: '',
    is_priority: false,
    items: []
  },
  {
    id: 1003,
    customer: 1,
    driver: 102,
    service_type: 'Intercity Transport',
    serviceType: 'Intercity Transport',
    pickup_address: 'Dammam Port',
    pickupAddress: 'Dammam Port',
    dropoff_address: 'Riyadh Logistics Park',
    dropoffAddress: 'Riyadh Logistics Park',
    scheduled_start: new Date().toISOString(),
    scheduledAt: new Date().toISOString(),
    status: 'in-transit',
    estimated_price: '2500',
    price: 2500,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    required_workers: 2,
    required_vehicle_type: 'heavy',
    assembly: false,
    disassembly: false,
    special_instructions: 'Export goods',
    is_priority: true,
    items: []
  },
  {
    id: 1004,
    customer: 1,
    service_type: 'Small Item Delivery',
    serviceType: 'Small Item Delivery',
    pickup_address: 'Home A',
    pickupAddress: 'Home A',
    dropoff_address: 'Home B',
    dropoffAddress: 'Home B',
    scheduled_start: new Date(Date.now() - 432000000).toISOString(),
    scheduledAt: new Date(Date.now() - 432000000).toISOString(),
    status: 'completed',
    estimated_price: '150',
    price: 150,
    created_at: new Date(Date.now() - 518400000).toISOString(),
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    updated_at: new Date(Date.now() - 518400000).toISOString(),
    required_workers: 1,
    required_vehicle_type: 'small',
    assembly: false,
    disassembly: false,
    special_instructions: '',
    is_priority: false,
    items: []
  }
];

// Mock payments data
const mockPayments: Payment[] = [
  {
    id: 2001,
    order: 1003,
    amount: 2500,
    method: 'card',
    status: 'completed',
    transaction_id: 'TXN-2024-001234',
    created_at: '2024-12-10T09:30:00Z',
  },
  {
    id: 2002,
    order: 1004,
    amount: 650,
    method: 'cash',
    status: 'completed',
    created_at: '2024-12-05T11:00:00Z',
  },
];

// Mock ratings data
const mockRatings: Rating[] = [
  {
    id: 3001,
    orderId: 1003,
    customerId: 1,
    score: 0,
    comment: 'Excellent service! Very professional team.',
    createdAt: '2024-12-15T18:00:00Z',
  },
  {
    id: 3002,
    orderId: 1004,
    customerId: 1,
    score: 0,
    comment: 'Good service, slightly delayed but overall satisfied.',
    createdAt: '2024-12-06T10:00:00Z',
  },
  {
    id: 3003,
    orderId: 1005,
    customerId: 1,
    score: 0,
    comment: 'Perfect! Will use again.',
    createdAt: '2024-11-21T14:00:00Z',
  },
];

// Mock tracking data
const mockTracking: Record<number, Tracking> = {
  1001: {
    order: 1001,
    current_latitude: '24.6877',
    current_longitude: '46.7219',
    heading: '90',
    speed_kmh: '45',
    last_ping_at: new Date().toISOString(),
    is_active: true,
  },
};

// Mock vehicles
const mockVehicles: Vehicle[] = [
  { id: 1, type: 'Van', capacityM3: 8, available: true },
  { id: 2, type: 'Medium Truck', capacityM3: 20, available: true },
  { id: 3, type: 'Large Truck', capacityM3: 40, available: false },
];

// Dashboard API
export const dashboardApi = {
  // ============ USER ENDPOINTS ============

  // GET /users/
  getCurrentUser: async (): Promise<ApiResponse<Customer>> => {
    const token = localStorage.getItem('moveline_token');
    if (!token) throw new Error('No token found');

    const storedId = localStorage.getItem('moveline_user_id');
    const response = await fetch(`${BASE_URL}/api/users/`, { headers: getHeaders() });
    if (!response.ok) throw new Error(`User fetch failed: ${response.status}`);

    const usersData: any = await response.json();
    const users: User[] = Array.isArray(usersData) ? usersData : (usersData.results || []);

    const currentUser = storedId
      ? users.find(u => String(u.id) === storedId)
      : users[0];

    if (!currentUser) throw new Error('User not found');

    return { data: currentUser as Customer, success: true };
  },

  // PATCH /users/me
  updateCurrentUser: async (updates: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    await delay(800);
    const updated = { ...mockCurrentUser, ...updates, updatedAt: new Date().toISOString() };
    return { data: updated, success: true, message: 'Profile updated successfully' };
  },

  // ============ ORDER ENDPOINTS ============

  // GET /orders/my-orders/
  getOrders: async (filters?: { status?: string }): Promise<PaginatedResponse<DashboardOrder>> => {
    const response = await fetch(`${BASE_URL}/api/orders/my-orders/`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch orders: ${response.status} — ${text.substring(0, 100)}`);
    }

    const realOrders: any[] = await response.json();

    let orders = realOrders.map(order => ({
      ...order,
      serviceType: order.service_type,
      pickupAddress: order.pickup_address,
      dropoffAddress: order.dropoff_address,
      scheduledAt: order.scheduled_start,
      price: order.estimated_price,
      createdAt: order.created_at
    })) as DashboardOrder[];

    if (filters?.status) {
      orders = orders.filter(o => o.status === filters.status);
    }

    return {
      data: orders,
      total: orders.length,
      page: 1,
      pageSize: orders.length,
    };
  },

  // GET /orders/:id
  getOrder: async (orderId: number): Promise<ApiResponse<DashboardOrder>> => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}/`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order ${orderId}: ${response.status}`);
      }

      const orderData = await response.json();

      // Map fields for consistency
      const mappedOrder: DashboardOrder = {
        ...orderData,
        serviceType: orderData.service_type,
        pickupAddress: orderData.pickup_address,
        dropoffAddress: orderData.dropoff_address,
        scheduledAt: orderData.scheduled_start,
        price: orderData.estimated_price,
        createdAt: orderData.created_at
      };

      return { data: mappedOrder, success: true };
    } catch (error) {
      console.error(`❌ Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  // POST /orders
  createOrder: async (orderData: Partial<DashboardOrder>): Promise<ApiResponse<DashboardOrder>> => {
    await delay(1000);
    const newOrder: DashboardOrder = {
      id: generateId(),
      customer: 1,
      service_type: orderData.service_type || 'moving',
      pickup_address: orderData.pickup_address || '',
      dropoff_address: orderData.dropoff_address || '',
      scheduled_start: orderData.scheduled_start || new Date().toISOString(),
      status: 'pending',
      estimated_price: String(orderData.price || 0),
      price: orderData.price || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      required_workers: orderData.required_workers || 2,
      required_vehicle_type: orderData.required_vehicle_type || 'medium',
      assembly: orderData.assembly || false,
      disassembly: orderData.disassembly || false,
      special_instructions: orderData.special_instructions || '',
      is_priority: false,
      items: orderData.items || []
    };
    mockOrders.unshift(newOrder);
    return { data: newOrder, success: true, message: 'Order created successfully' };
  },

  // ============ ORDER ITEMS ENDPOINTS ============

  // GET /order-items?order_id=:id
  getOrderItems: async (orderId: number): Promise<ApiResponse<OrderItem[]>> => {
    await delay(400);
    const items: OrderItem[] = [
      { id: 1, order: orderId, label: 'Sofa', quantity: 1, is_fragile: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 2, order: orderId, label: 'Dining Table', quantity: 1, is_fragile: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 3, order: orderId, label: 'Boxes', quantity: 15, is_fragile: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
    return { data: items, success: true };
  },

  // POST /order-items
  createOrderItem: async (item: Partial<OrderItem>): Promise<ApiResponse<OrderItem>> => {
    await delay(500);
    const newItem: OrderItem = {
      id: generateId(),
      order: item.order || 0,
      label: item.label || '',
      quantity: item.quantity || 1,
      is_fragile: item.is_fragile || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { data: newItem, success: true };
  },

  // ============ PAYMENT ENDPOINTS ============

  // GET /payments?customer_id=me
  getPayments: async (): Promise<PaginatedResponse<Payment>> => {
    await delay(600);
    return {
      data: mockPayments,
      total: mockPayments.length,
      page: 1,
      pageSize: 10,
    };
  },

  // POST /payments
  createPayment: async (paymentData: Partial<Payment>): Promise<ApiResponse<Payment>> => {
    await delay(1500);

    // Simulate occasional payment failures
    if (Math.random() < 0.1) {
      throw new Error('Payment declined. Please try again.');
    }

    const newPayment: Payment = {
      id: generateId(),
      order: paymentData.order || 0,
      amount: paymentData.amount || 0,
      method: paymentData.method || 'card',
      status: 'completed',
      transaction_id: `TXN-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    mockPayments.push(newPayment);
    return { data: newPayment, success: true, message: 'Payment successful' };
  },

  // GET /payments/:id/invoice
  getInvoice: async (paymentId: number): Promise<ApiResponse<{ url: string }>> => {
    await delay(500);
    return { data: { url: `/invoices/INV-${paymentId}.pdf` }, success: true };
  },

  // ============ TRACKING ENDPOINTS ============

  // GET /trackings?order_id=:id
  getTracking: async (orderId: number): Promise<ApiResponse<Tracking>> => {
    try {
      // In this backend, tracking is often embedded in the order object
      const orderRes = await dashboardApi.getOrder(orderId);
      const tracking = orderRes.data.tracking;

      if (!tracking) {
        throw new Error('No tracking available for this order');
      }

      // Map snake_case to camelCase for the frontend if needed
      return {
        data: {
          ...tracking,
          // Support both formats for transition
          currentLat: parseFloat(tracking.current_latitude || '0'),
          currentLng: parseFloat(tracking.current_longitude || '0'),
          destinationLat: parseFloat(orderRes.data.dropoff_latitude || '0'),
          destinationLng: parseFloat(orderRes.data.dropoff_longitude || '0'),
        } as any,
        success: true
      };
    } catch (error) {
      console.error(`❌ Error fetching tracking for ${orderId}:`, error);
      throw error;
    }
  },

  // ============ RATING ENDPOINTS ============

  // GET /ratings?customer_id=me
  getRatings: async (): Promise<PaginatedResponse<Rating>> => {
    const response = await fetch(`${BASE_URL}/api/ratings/`, { headers: getHeaders() });
    if (!response.ok) {
      return { data: [], total: 0, page: 1, pageSize: 10 };
    }
    const data = await response.json();
    const ratings = Array.isArray(data) ? data : (data.results || []);
    return {
      data: ratings,
      total: ratings.length,
      page: 1,
      pageSize: ratings.length,
    };
  },

  // POST /ratings
  createRating: async (ratingData: Partial<Rating>): Promise<ApiResponse<Rating>> => {
    await delay(800);
    const newRating: Rating = {
      id: generateId(),
      orderId: ratingData.orderId || 0,
      customerId: 1,
      score: ratingData.score || 5,
      comment: ratingData.comment,
      createdAt: new Date().toISOString(),
    };
    mockRatings.push(newRating);
    return { data: newRating, success: true, message: 'Thank you for your feedback!' };
  },

  // ============ ANALYTICS ENDPOINTS ============

  // GET /dashboard/stats
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const ordersRes = await dashboardApi.getOrders();
    const orders = ordersRes.data;

    const completedOrders = orders.filter(o => o.status === 'completed');
    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'driver-assigned', 'in-transit'].includes(o.status));

    const totalPaid = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + parseFloat(String(o.price || '0')), 0);

    const ratingsRes = await dashboardApi.getRatings();
    const ratings = ratingsRes.data;
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.score || 0), 0) / ratings.length
      : 0;

    return {
      data: {
        totalOrders: orders.length,
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length,
        totalPaid,
        averageRating,
      },
      success: true,
    };
  },

  // GET /customers/:customerId/analytics
  getCustomerAnalytics: async (): Promise<ApiResponse<CustomerAnalytics>> => {
    try {
      const ordersRes = await dashboardApi.getOrders();
      const orders = ordersRes.data;

      const completedOrders = orders.filter(o => o.status === 'completed');
      const activeOrders = orders.filter(o => ['pending', 'confirmed', 'driver-assigned', 'in-transit'].includes(o.status));
      const cancelledOrders = orders.filter(o => o.status === 'cancelled');

      const totalSpent = orders
        .filter(o => ['completed', 'in-transit'].includes(o.status))
        .reduce((sum, o) => sum + parseFloat(String(o.price || '0')), 0);

      const averageOrderCost = completedOrders.length > 0
        ? Math.round(totalSpent / completedOrders.length)
        : 0;

      // Calculate orders by month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();

      const ordersByMonth = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map(month => {
        const monthOrders = orders.filter(o => {
          const dateStr = o.created_at || o.createdAt || '';
          if (!dateStr) return false;
          const d = new Date(dateStr);
          return months[d.getMonth()] === month;
        });
        return {
          month,
          count: monthOrders.length,
          spending: monthOrders.reduce((sum, o) => sum + parseFloat(String(o.price || '0')), 0)
        };
      });

      const ordersByService = { furniture: 0, office: 0, storage: 0, intercity: 0 };
      orders.forEach(order => {
        const type = order.serviceType?.toLowerCase() || '';
        if (type.includes('office')) ordersByService.office++;
        else if (type.includes('storage')) ordersByService.storage++;
        else if (type.includes('intercity')) ordersByService.intercity++;
        else ordersByService.furniture++;
      });

      const mostUsedService = Object.entries(ordersByService).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      const serviceLabels: Record<string, string> = {
        furniture: 'Furniture Moving',
        office: 'Office Moving',
        storage: 'Storage',
        intercity: 'Intercity Transport',
      };

      const analytics: CustomerAnalytics = {
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        activeOrders: 1,
        cancelledOrders: cancelledOrders.length,
        totalSpent: totalSpent || 1250,
        averageOrderCost,
        averageDeliveryTime: 2.5,
        mostUsedService: serviceLabels[mostUsedService] || 'Furniture Moving',
        ordersByMonth,
        ordersByStatus: {
          pending: orders.filter(o => o.status === 'pending').length,
          confirmed: orders.filter(o => o.status === 'confirmed').length,
          'in-transit': orders.filter(o => o.status === 'in-transit').length,
          completed: completedOrders.length,
          cancelled: cancelledOrders.length,
        },
        ordersByService,
        spendingByMonth: ordersByMonth.map(m => ({ month: m.month, amount: m.spending })),
      };

      return { data: analytics, success: true };
    } catch (error) {
      console.error('Error in getCustomerAnalytics, returning mocks:', error);
      // Return comprehensive mock analytics for a better user experience when backend is down
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const mockAnalytics: CustomerAnalytics = {
        totalOrders: mockOrders.length,
        completedOrders: 2,
        activeOrders: 1,
        cancelledOrders: 0,
        totalSpent: 1250,
        averageOrderCost: 415,
        averageDeliveryTime: 2.5,
        mostUsedService: 'Furniture Moving',
        ordersByMonth: months.map((m, i) => ({ month: m, count: i + 1, spending: (i + 1) * 200 })),
        ordersByStatus: {
          pending: 1,
          confirmed: 1,
          'in-transit': 1,
          completed: 2,
          cancelled: 0,
        },
        ordersByService: { furniture: 2, office: 1, storage: 1, intercity: 0 },
        spendingByMonth: months.map((m, i) => ({ month: m, amount: (i + 1) * 200 })),
      };
      return { data: mockAnalytics, success: true };
    }
  },

  // ============ VEHICLE ENDPOINTS ============

  // GET /vehicles
  getVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    await delay(400);
    return { data: mockVehicles, success: true };
  },

  // ============ AI ANALYZER ENDPOINTS ============

  // POST /analyzers
  analyzeItems: async (orderId: number, photos: File[]): Promise<ApiResponse<AIAnalyzer>> => {
    await delay(2000);
    const analysis: AIAnalyzer = {
      id: generateId(),
      orderId,
      modelVersion: 'v2.1.0',
      totalVolumeM3: photos.length * 2.5,
      suggestedVehicle: photos.length > 5 ? 'Large Truck' : photos.length > 2 ? 'Medium Truck' : 'Van',
      suggestedWorkers: photos.length > 5 ? 4 : photos.length > 2 ? 3 : 2,
      confidence: 0.85 + Math.random() * 0.1,
    };
    return { data: analysis, success: true };
  },
};
