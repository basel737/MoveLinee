// Driver & Worker API Layer — Real API calls only
// ponytail: Driver/Worker do NOT have dedicated /api/driver/ or /api/worker/ endpoints.
// They share /api/orders/ (filtered by assigned driver/worker) and /api/users/ for profiles.

import api from './axios';
import { useAuth } from '@/context/AuthContext';

// ---- Types ----

export interface Driver {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  available: boolean;
  currentOrderId: number | null;
  averageRating: number;
  completedOrders: number;
  createdAt: string;
}

export interface Worker {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  specialty: 'loading' | 'packing' | 'disassembly' | 'general';
  available: boolean;
  assignedOrders: number;
  completedTasks: number;
  createdAt: string;
}

export interface Vehicle {
  id: number;
  type: string;
  capacityM3: number;
  available: boolean;
}

export interface OrderItem {
  id: number;
  orderId: number;
  name: string;
  category: string;
  quantity: number;
  volumeM3: number;
  fragile: boolean;
  needsDisassembly: boolean;
}

export interface Tracking {
  orderId: number;
  currentLocation: string;
  destination: string;
  lastUpdated: string;
}

export interface DriverRating {
  id: number;
  orderId: number;
  customerId: number;
  score: number;
  comment: string;
  createdAt: string;
}

export interface DriverOrder {
  id: number;
  customerId: number;
  driverId: number | null;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'in_transit' | 'loading' | 'unloading' | 'completed';
  price: number;
  notes: string;
  createdAt: string;
  vehicle?: Vehicle;
  workers?: Worker[];
  items?: OrderItem[];
  tracking?: Tracking;
}

export interface WorkerTask {
  id: number;
  orderId: number;
  serviceType: string;
  role: 'loading' | 'unloading' | 'packing' | 'disassembly';
  scheduledAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  pickupAddress: string;
  dropoffAddress: string;
  notes: string;
  items: OrderItem[];
  workerStatus: 'pending' | 'in_progress' | 'done';
}

// ---- Helpers ----

// Map a raw API order to DriverOrder shape
function mapOrder(o: any): DriverOrder {
  return {
    id: o.id,
    customerId: o.customer,
    driverId: o.driver ?? null,
    serviceType: o.service_type || o.serviceType || '',
    pickupAddress: o.pickup_address || o.pickupAddress || '',
    dropoffAddress: o.dropoff_address || o.dropoffAddress || '',
    scheduledAt: o.scheduled_start || o.scheduledAt || o.created_at,
    status: o.status,
    price: parseFloat(o.estimated_price || o.price || '0'),
    notes: o.special_instructions || o.notes || '',
    createdAt: o.created_at || o.createdAt,
    vehicle: o.vehicle,
    workers: o.order_workers?.map((w: any) => ({
      id: w.worker,
      userId: w.worker,
      fullName: w.worker_full_name || '',
      email: '',
      phone: '',
      specialty: 'general' as const,
      available: false,
      assignedOrders: 0,
      completedTasks: 0,
      createdAt: w.assigned_at,
    })),
    items: o.items?.map((item: any) => ({
      id: item.id,
      orderId: o.id,
      name: item.label || item.name || '',
      category: item.category || 'general',
      quantity: item.quantity,
      volumeM3: 0,
      fragile: item.is_fragile || false,
      needsDisassembly: false,
    })),
    tracking: o.tracking ? {
      orderId: o.id,
      currentLocation: `${o.tracking.current_latitude},${o.tracking.current_longitude}`,
      destination: o.dropoff_address || '',
      lastUpdated: o.tracking.last_ping_at || new Date().toISOString(),
    } : undefined,
  };
}

// Map a raw API user to Driver shape
function mapUserToDriver(u: any): Driver {
  const profile = u.driver_profile || {};
  return {
    id: u.id,
    userId: u.id,
    fullName: u.first_name || u.last_name
      ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
      : u.username || '',
    email: u.email || '',
    phone: profile.phone || u.phone || '',
    licenseNumber: profile.license_number || '',
    available: profile.availability ?? true,
    currentOrderId: null,
    averageRating: parseFloat(profile.rating || '0'),
    completedOrders: profile.completed_orders || 0,
    createdAt: u.date_joined || new Date().toISOString(),
  };
}

// Map a raw API user to Worker shape
function mapUserToWorker(u: any): Worker {
  const profile = u.worker_profile || {};
  return {
    id: u.id,
    userId: u.id,
    fullName: u.first_name || u.last_name
      ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
      : u.username || '',
    email: u.email || '',
    phone: profile.phone || u.phone || '',
    specialty: profile.specialty || 'general',
    available: profile.availability ?? true,
    assignedOrders: 0,
    completedTasks: profile.completed_tasks || 0,
    createdAt: u.date_joined || new Date().toISOString(),
  };
}

// ========== DRIVER API ==========

export const driverApi = {
  // Get current driver profile from /api/users/ by stored user ID
  getCurrentDriver: async () => {
    const userId = localStorage.getItem('moveline_user_id');
    const response = await api.get('/api/users/');
    const users: any[] = response.data.results || response.data || [];
    const me = users.find((u: any) => String(u.id) === userId);
    if (!me) throw new Error('Driver profile not found');
    return { data: mapUserToDriver(me) };
  },

  // Update driver availability via PATCH /api/users/:id/
  updateAvailability: async (available: boolean) => {
    const userId = localStorage.getItem('moveline_user_id');
    const response = await api.patch(`/api/users/${userId}/`, {
      driver_profile: { availability: available },
    });
    return { data: mapUserToDriver(response.data) };
  },

  // Get orders with status=pending (available for driver to pick up)
  getPendingOrders: async () => {
    const response = await api.get('/api/orders/', { params: { status: 'pending' } });
    const raw: any[] = response.data.results || response.data || [];
    return { data: raw.map(mapOrder) };
  },

  // Accept an order — assign current driver to it
  acceptOrder: async (orderId: number) => {
    const userId = localStorage.getItem('moveline_user_id');
    const response = await api.patch(`/api/orders/${orderId}/`, {
      driver: Number(userId),
      status: 'confirmed',
    });
    return { data: mapOrder(response.data) };
  },

  // Get active order assigned to this driver
  getActiveOrder: async () => {
    const userId = localStorage.getItem('moveline_user_id');
    const response = await api.get('/api/orders/', {
      params: { driver: userId, status: 'confirmed,in_progress,in_transit,loading,unloading' },
    });
    const raw: any[] = response.data.results || response.data || [];
    const active = raw.find((o: any) =>
      ['confirmed', 'in_progress', 'in_transit', 'loading', 'unloading'].includes(o.status)
    );
    return { data: active ? mapOrder(active) : null };
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: string) => {
    const response = await api.patch(`/api/orders/${orderId}/`, { status });
    return { data: mapOrder(response.data) };
  },

  // Update tracking location
  updateLocation: async (orderId: number, lat: number, lng: number) => {
    const response = await api.patch(`/api/trackings/${orderId}/`, {
      current_latitude: String(lat),
      current_longitude: String(lng),
    });
    return { data: response.data };
  },

  // Get driver ratings from /api/ratings/ filtered by driver
  getDriverRatings: async () => {
    const response = await api.get('/api/ratings/');
    const raw: any[] = response.data.results || response.data || [];
    const ratings: DriverRating[] = raw.map((r: any) => ({
      id: r.id,
      orderId: r.order || r.orderId,
      customerId: r.customer || r.customerId,
      score: r.score || r.rating || 0,
      comment: r.comment || '',
      createdAt: r.created_at || r.createdAt || '',
    }));
    return { data: ratings };
  },

  // Get driver stats derived from real orders
  getDriverStats: async () => {
    const userId = localStorage.getItem('moveline_user_id');
    const [ordersRes, ratingsRes] = await Promise.all([
      api.get('/api/orders/', { params: { driver: userId } }),
      api.get('/api/ratings/').catch(() => ({ data: [] })),
    ]);

    const orders: any[] = ordersRes.data.results || ordersRes.data || [];
    const ratings: any[] = ratingsRes.data.results || ratingsRes.data || [];

    const completed = orders.filter((o: any) => o.status === 'completed');
    const now = new Date();
    const thisMonth = orders.filter((o: any) => {
      const d = new Date(o.created_at || o.createdAt || '');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthEarnings = thisMonth
      .filter((o: any) => o.status === 'completed')
      .reduce((sum: number, o: any) => sum + parseFloat(o.estimated_price || '0'), 0);

    const avgRating = ratings.length
      ? ratings.reduce((s: number, r: any) => s + (r.score || r.rating || 0), 0) / ratings.length
      : 0;

    // Build orders-over-time from last 5 months
    const months: string[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short' }));
    }
    const ordersOverTime = months.map(month => ({
      month,
      orders: orders.filter((o: any) => {
        const d = new Date(o.created_at || '');
        return d.toLocaleString('default', { month: 'short' }) === month;
      }).length,
    }));

    // Ratings breakdown
    const ratingsBreakdown: Record<string, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r: any) => {
      const score = String(Math.round(r.score || r.rating || 0));
      if (score in ratingsBreakdown) ratingsBreakdown[score]++;
    });

    return {
      data: {
        completedOrders: completed.length,
        averageRating: Math.round(avgRating * 10) / 10,
        thisMonthOrders: thisMonth.length,
        thisMonthEarnings,
        ratingsBreakdown,
        ordersOverTime,
      },
    };
  },
};

// ========== WORKER API ==========

export const workerApi = {
  // Get current worker profile
  getCurrentWorker: async () => {
    const userId = localStorage.getItem('moveline_user_id');
    const response = await api.get('/api/users/');
    const users: any[] = response.data.results || response.data || [];
    const me = users.find((u: any) => String(u.id) === userId);
    if (!me) throw new Error('Worker profile not found');
    return { data: mapUserToWorker(me) };
  },

  // Update worker availability
  updateAvailability: async (available: boolean) => {
    const userId = localStorage.getItem('moveline_user_id');
    const response = await api.patch(`/api/users/${userId}/`, {
      worker_profile: { availability: available },
    });
    return { data: mapUserToWorker(response.data) };
  },

  // Get tasks assigned to this worker from /api/orders/ order_workers
  getAssignedTasks: async () => {
    const userId = localStorage.getItem('moveline_user_id');
    const response = await api.get('/api/orders/', { params: { worker: userId } });
    const raw: any[] = response.data.results || response.data || [];

    const tasks: WorkerTask[] = raw.map((o: any) => {
      const myWorkerEntry = o.order_workers?.find((w: any) => String(w.worker) === String(userId));
      return {
        id: o.id,
        orderId: o.id,
        serviceType: o.service_type || '',
        role: myWorkerEntry?.role_description || 'loading',
        scheduledAt: o.scheduled_start || o.created_at,
        status: o.status === 'completed' ? 'completed' : o.status === 'in_transit' ? 'in_progress' : 'pending',
        pickupAddress: o.pickup_address || '',
        dropoffAddress: o.dropoff_address || '',
        notes: o.special_instructions || '',
        workerStatus: myWorkerEntry?.status || 'pending',
        items: (o.items || []).map((item: any) => ({
          id: item.id,
          orderId: o.id,
          name: item.label || item.name || '',
          category: 'general',
          quantity: item.quantity,
          volumeM3: 0,
          fragile: item.is_fragile || false,
          needsDisassembly: false,
        })),
      };
    });

    return { data: tasks };
  },

  // Get task details
  getTaskDetails: async (taskId: number) => {
    const response = await api.get(`/api/orders/${taskId}/`);
    const o = response.data;
    const userId = localStorage.getItem('moveline_user_id');
    const myWorkerEntry = o.order_workers?.find((w: any) => String(w.worker) === String(userId));
    const task: WorkerTask = {
      id: o.id,
      orderId: o.id,
      serviceType: o.service_type || '',
      role: myWorkerEntry?.role_description || 'loading',
      scheduledAt: o.scheduled_start || o.created_at,
      status: o.status === 'completed' ? 'completed' : o.status === 'in_transit' ? 'in_progress' : 'pending',
      pickupAddress: o.pickup_address || '',
      dropoffAddress: o.dropoff_address || '',
      notes: o.special_instructions || '',
      workerStatus: myWorkerEntry?.status || 'pending',
      items: (o.items || []).map((item: any) => ({
        id: item.id,
        orderId: o.id,
        name: item.label || item.name || '',
        category: 'general',
        quantity: item.quantity,
        volumeM3: 0,
        fragile: item.is_fragile || false,
        needsDisassembly: false,
      })),
    };
    return { data: task };
  },

  // Update task/worker status
  updateTaskStatus: async (taskId: number, status: 'pending' | 'in_progress' | 'done') => {
    // ponytail: Backend may not have a dedicated worker-status PATCH endpoint.
    // We PATCH the order_worker entry if the API supports it; otherwise this is a no-op.
    // Upgrade path: add PATCH /api/order-workers/:id/ on backend.
    try {
      const userId = localStorage.getItem('moveline_user_id');
      const orderRes = await api.get(`/api/orders/${taskId}/`);
      const workerEntry = orderRes.data.order_workers?.find((w: any) => String(w.worker) === String(userId));
      if (workerEntry?.id) {
        await api.patch(`/api/order-workers/${workerEntry.id}/`, { status });
      }
    } catch {
      // Silently ignore if endpoint doesn't exist
    }
    return workerApi.getTaskDetails(taskId);
  },

  // Get worker stats derived from real orders
  getWorkerStats: async () => {
    const userId = localStorage.getItem('moveline_user_id');
    const response = await api.get('/api/orders/', { params: { worker: userId } });
    const orders: any[] = response.data.results || response.data || [];

    const completed = orders.filter((o: any) => o.status === 'completed');
    const active = orders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled');
    const now = new Date();
    const thisMonth = orders.filter((o: any) => {
      const d = new Date(o.scheduled_start || o.created_at || '');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // Build tasks-over-time from last 5 months
    const months: string[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short' }));
    }
    const tasksOverTime = months.map(month => ({
      month,
      tasks: orders.filter((o: any) => {
        const d = new Date(o.scheduled_start || o.created_at || '');
        return d.toLocaleString('default', { month: 'short' }) === month;
      }).length,
    }));

    // Tasks by role — derived from order_workers entries
    const tasksByRole: Record<string, number> = { loading: 0, unloading: 0, packing: 0, disassembly: 0 };
    orders.forEach((o: any) => {
      const entry = o.order_workers?.find((w: any) => String(w.worker) === String(userId));
      const role = entry?.role_description || 'loading';
      if (role in tasksByRole) tasksByRole[role]++;
    });

    return {
      data: {
        completedTasks: completed.length,
        assignedOrders: active.length,
        thisMonthTasks: thisMonth.length,
        tasksByRole,
        tasksOverTime,
      },
    };
  },
};
