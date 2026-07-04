import {
  User,
  DashboardOrder,
  OrderWorker,
  OrderItemV2,
  OrderTracking,
  Rating,
  Vehicle,
  AIAnalyzer,
  Driver,
  DriverApplicant,
  WorkerApplicant,
  InterviewSchedulePayload,
  DriverOfficeAssignmentResponse,
  Office,
  PaginatedResponse,
  AdminOrderRating,
  AdminOrderRatingsResponse,
} from '@/types/dashboard';
import api from './axios';
import { vehiclesService } from '@/services/vehicles';

// Simulated API delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Admin statistics interface
export interface AdminStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalDrivers: number;
  availableVehicles: number;
  totalVehicles: number;
  averageRating: number;
}

// Order status counts for charts
export interface OrderStatusCounts {
  pending: number;
  confirmed: number;
  'driver-assigned': number;
  'in-transit': number;
  completed: number;
  cancelled: number;
}

export interface TrackingAlert {
  id: number;
  order: number;
  order_id: number;
  tracking: number;
  driver: number | null;
  driver_id: number | null;
  driver_name: string;
  alert_type: 'unexpected_stop';
  status: 'open' | 'acknowledged' | 'resolved';
  driver_reason: 'traffic' | 'vehicle_issue' | 'rest' | 'extra_loading' | 'other' | '';
  driver_note: string;
  driver_notified_at: string | null;
  driver_responded_at: string | null;
  admin_notified_at: string | null;
  customer_notified_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackingAlertSummary {
  open: number;
  acknowledged: number;
  resolved: number;
  admin_attention: number;
}

// Revenue data for charts
export interface RevenueData {
  month: string;
  revenue: number;
}

// Vehicle usage data
export interface VehicleUsage {
  type: string;
  count: number;
  percentage: number;
}

// Admin API
export const adminApi = {
  // ============ ADMIN STATS ============

  getAdminStats: async (): Promise<AdminStats> => {
    const [users, orders, vehicles] = await Promise.all([
      adminApi.getAllUsers(),
      adminApi.getAllOrders(),
      adminApi.getAllVehicles()
    ]);

    const completedOrders = orders.filter(o => o.status === 'completed');
    const activeOrders = orders.filter(o => ['confirmed', 'assigned', 'in-transit'].includes(o.status));
    const pendingOrders = orders.filter(o => o.status === 'pending');

    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + parseFloat(String(o.estimated_price || o.price || '0')), 0
    );

    const availableVehicles = vehicles.filter(v => v.available).length;

    return {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      totalCustomers: users.filter(u => u.role === 'customer').length,
      totalDrivers: users.filter(u => u.role === 'driver').length,
      availableVehicles,
      totalVehicles: vehicles.length,
      averageRating: 0, // ponytail: no /api/admin/ratings/average endpoint yet
    };
  },

  getOrderStatusCounts: async (): Promise<OrderStatusCounts> => {
    const counts: OrderStatusCounts = {
      pending: 0,
      confirmed: 0,
      'driver-assigned': 0,
      'in-transit': 0,
      completed: 0,
      cancelled: 0,
    };

    const orders = await adminApi.getAllOrders();
    orders.forEach(order => {
      const status = order.status === 'assigned' ? 'driver-assigned' : order.status;
      if (status in counts) {
        counts[status as keyof OrderStatusCounts]++;
      }
    });

    return counts;
  },

  getRevenueData: async (): Promise<RevenueData[]> => {
    // ponytail: No /api/admin/revenue/ endpoint exists yet.
    // Revenue is derived from completed orders. Upgrade path: add dedicated endpoint.
    try {
      const orders = await adminApi.getAllOrders({ status: 'completed' });
      const months: string[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toLocaleString('default', { month: 'short' }));
      }
      return months.map(month => ({
        month,
        revenue: orders
          .filter(o => {
            const d = new Date(o.created_at);
            return d.toLocaleString('default', { month: 'short' }) === month;
          })
          .reduce((sum, o) => sum + parseFloat(String(o.estimated_price || '0')), 0),
      }));
    } catch {
      return [];
    }
  },

  getVehicleUsage: async (): Promise<VehicleUsage[]> => {
    // ponytail: No /api/admin/vehicle-usage/ endpoint exists yet.
    // Upgrade path: add dedicated backend analytics endpoint.
    try {
      const vehicles = await adminApi.getAllVehicles();
      const total = vehicles.length || 1;
      const grouped: Record<string, number> = {};
      vehicles.forEach(v => { grouped[v.type] = (grouped[v.type] || 0) + 1; });
      return Object.entries(grouped).map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100),
      }));
    } catch {
      return [];
    }
  },

  // ============ USER ENDPOINTS ============

  getAllUsers: async (role?: 'customer' | 'driver' | 'worker'): Promise<User[]> => {
    try {
      console.log('🔄 Fetching users from: /api/users/');

      // Use axios instance which automatically goes through Vite proxy
      const response = await api.get('/api/users/');

      // Debug: Log the entire response structure
      console.log('📦 Full response object:', response);
      console.log('📦 response.data:', response.data);
      console.log('📦 response.data.results:', response.data?.results);
      console.log('📊 Results length:', response.data?.results?.length || 0);
      console.log('✅ Successfully fetched users:', response.data?.results?.length || 0, 'users');

      const backendUsers = response.data.results || [];

      // Map backend data to frontend User/Driver interface
      const mappedUsers: (User | Driver)[] = backendUsers.map((u: Record<string, unknown>) => {
        const roleValue = (u.role as string) || (u.driver_profile ? 'driver' : u.worker_profile ? 'worker' : 'customer');
        const validRole = (['customer', 'driver', 'worker', 'admin'].includes(roleValue) ? roleValue : 'customer') as 'customer' | 'driver' | 'worker' | 'admin';

        const driverProfile = u.driver_profile as Record<string, unknown>;
        const workerProfile = u.worker_profile as Record<string, unknown>;
        const officeValue = (u.office as number | null)
          ?? (driverProfile?.office as number | null)
          ?? (workerProfile?.office as number | null)
          ?? null;

        const profileName = (driverProfile?.full_name as string) || (workerProfile?.full_name as string);
        const phoneValue = (u.phone as string) || (driverProfile?.phone as string) || (workerProfile?.phone as string) || '';
        const ratingValue = Number(driverProfile?.rating ?? workerProfile?.rating ?? 0) || 0;
        const availableValue = (driverProfile?.availability as boolean) ?? (workerProfile?.availability as boolean) ?? false;

        const baseUser: User = {
          id: u.id as number,
          fullName: profileName ||
            ((u.first_name || u.last_name)
              ? `${(u.first_name as string) || ''} ${(u.last_name as string) || ''}`.trim()
              : (u.username as string) || ''),
          email: (u.email as string) || '',
          phone: phoneValue,
          role: validRole,
          office: officeValue,
          rating: ratingValue,
          available: availableValue,
          createdAt: (u.date_joined as string) || new Date().toISOString(),
          updatedAt: (u.date_joined as string) || new Date().toISOString(),
        };

        if ((validRole === 'driver' || driverProfile) && driverProfile) {
          return {
            ...baseUser,
            licenseNumber: (driverProfile.license_number as string) || 'N/A',
          } as Driver;
        }

        return baseUser;
      });

      if (role) {
        return mappedUsers.filter(u => u.role === role);
      }

      return mappedUsers;

    } catch (error) {
      let errorMessage = 'Unknown error occurred while fetching users';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('❌ Error in getAllUsers:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  getUser: async (userId: number): Promise<User | null> => {
    // Since we removed mock data, this would need to call real API
    // For now, return null as fallback
    console.warn('getUser called but mock data removed. Implement real API call.');
    return null;
  },

  getOffices: async (): Promise<Office[]> => {
    const response = await api.get<PaginatedResponse<Office>>('/api/offices/');
    return response.data.results;
  },

  updateUser: async (userId: number, updates: Partial<User>): Promise<User> => {
    console.warn('updateUser called but mock data removed. Implement real API call.');
    throw new Error('updateUser not implemented - mock data removed');
  },

  deleteUser: async (userId: number): Promise<void> => {
    // Mock deletion
    console.log(`User ${userId} deleted`);
  },

  assignUserToOffice: async (userId: number, role: 'driver' | 'worker', officeId: number): Promise<DriverOfficeAssignmentResponse> => {
    const url = role === 'driver'
      ? `/api/drivers/${userId}/assign-office/`
      : `/api/workers/${userId}/assign-office/`;
    const data = { office: officeId };

    console.log('assignUserToOffice request', { url, data });

    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      const errorData = (error as { response?: { data?: unknown } })?.response?.data;
      let errorMessage = 'Unknown error occurred while assigning user to office';

      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData && typeof errorData === 'object') {
        const detail = (errorData as { detail?: unknown; message?: unknown }).detail;
        const message = (errorData as { detail?: unknown; message?: unknown }).message;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (typeof message === 'string') {
          errorMessage = message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      }

      console.error('❌ Failed to assign user to office:', error);
      throw new Error(errorMessage);
    }
  },

  getDrivers: async (): Promise<Driver[]> => {
    // Return drivers from getAllUsers instead
    const users = await adminApi.getAllUsers('driver');
    return users as Driver[];
  },

  // ============ ORDER ENDPOINTS ============

  getAllOrders: async (filters?: { status?: string; serviceType?: string }): Promise<DashboardOrder[]> => {
    const response = await api.get('/api/orders/');
    let orders: DashboardOrder[] = response.data.results || response.data || [];

    if (filters?.status && filters.status !== 'all') {
      const filterStatus = filters.status === 'driver-assigned' ? 'assigned' : filters.status;
      orders = orders.filter(o => o.status === filterStatus);
    }

    if (filters?.serviceType && filters.serviceType !== 'all') {
      orders = orders.filter(o => o.service_type === filters.serviceType);
    }

    return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getOrder: async (orderId: number): Promise<DashboardOrder | null> => {
    try {
      const response = await api.get(`/api/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch order ${orderId}:`, error);
      return null;
    }
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<DashboardOrder> => {
    try {
      const backendStatus = status === 'driver-assigned' ? 'assigned' : status;
      const response = await api.patch(`/api/orders/${orderId}/`, { status: backendStatus });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      throw error;
    }
  },

  markDelivered: async (orderId: number | string): Promise<DashboardOrder> => {
    const response = await api.post(`/api/orders/${orderId}/mark-delivered/`);
    return response.data;
  },

  markAvailable: async (orderId: number | string): Promise<DashboardOrder> => {
    const response = await api.post(`/api/orders/${orderId}/mark-available/`);
    return response.data;
  },

  assignDriver: async (orderId: number, driverId: number): Promise<DashboardOrder> => {
    try {
      const response = await api.patch(`/api/orders/${orderId}/`, {
        driver: driverId,
        status: 'assigned'
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to assign driver:', error);
      throw error;
    }
  },

  getOrderItems: async (orderId: number): Promise<OrderItemV2[]> => {
    try {
      const response = await api.get(`/api/orders/${orderId}/`);
      return response.data.items || [];
    } catch (error) {
      console.error('❌ Failed to fetch order items:', error);
      return [];
    }
  },

  // ============ VEHICLE ENDPOINTS ============
  getAllVehicles: async (): Promise<Vehicle[]> => {
    return vehiclesService.getAllVehicles();
  },

  updateVehicleAvailability: async (id: number, available: boolean): Promise<Vehicle> => {
    return vehiclesService.updateVehicleAvailability(id, available);
  },


  // ============ PAYMENT ENDPOINTS ============

  getAllPayments: async (): Promise<any[]> => {
    try {
      const response = await api.get('/api/admin/payments/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('❌ Failed to fetch payments:', error);
      return [];
    }
  },

  updatePaymentStatus: async (paymentId: number, status: string): Promise<any> => {
    try {
      const response = await api.patch(`/api/admin/payments/${paymentId}/`, { status });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update payment:', error);
      throw error;
    }
  },

  // ============ TRACKING ENDPOINTS ============

  getAllActiveTrackings: async (): Promise<OrderTracking[]> => {
    try {
      const orders = await adminApi.getAllOrders();
      return orders
        .filter(o => o.tracking && o.tracking.is_active)
        .map(o => o.tracking!);
    } catch (error) {
      console.error('❌ Failed to fetch trackings:', error);
      return [];
    }
  },

  getTracking: async (orderId: number): Promise<OrderTracking | null> => {
    try {
      const order = await adminApi.getOrder(orderId);
      return order?.tracking || null;
    } catch (error) {
      console.error('❌ Failed to fetch tracking:', error);
      return null;
    }
  },

  getTrackingAlerts: async (filters?: { status?: string; adminAttention?: boolean }): Promise<TrackingAlert[]> => {
    const response = await api.get('/api/tracking-alerts/', {
      params: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.adminAttention ? { admin_attention: 'true' } : {}),
      },
    });
    return (response.data?.results || response.data || []) as TrackingAlert[];
  },

  getTrackingAlertSummary: async (): Promise<TrackingAlertSummary> => {
    const response = await api.get('/api/tracking-alerts/summary/');
    return response.data as TrackingAlertSummary;
  },

  resolveTrackingAlert: async (alertId: number): Promise<TrackingAlert> => {
    const response = await api.post(`/api/tracking-alerts/${alertId}/resolve/`);
    return response.data as TrackingAlert;
  },

  sendTrackingAlertNotification: async (
    alertId: number,
    state: 'open' | 'acknowledged' | 'admin_attention' | 'customer_delay' | 'resolved',
  ): Promise<{ detail: string; state: string; recipient_count: number; sent_count: number }> => {
    const response = await api.post(`/api/tracking-alerts/${alertId}/send-notification/`, { state });
    return response.data;
  },

  // ============ RATING ENDPOINTS ============

  getAllRatings: async (): Promise<Rating[]> => {
    try {
      const response = await api.get('/api/admin/ratings/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('❌ Failed to fetch ratings:', error);
      return [];
    }
  },

  getAdminOrderRatings: async (page = 1): Promise<AdminOrderRatingsResponse> => {
    try {
      const response = await api.get('/api/ratings/admin-order-ratings/', {
        params: { page },
      });

      const payload = response.data ?? {};
      const results = Array.isArray(payload.results) ? payload.results : [];

      return {
        count: Number(payload.count ?? results.length ?? 0),
        next: payload.next ?? null,
        previous: payload.previous ?? null,
        results: results as AdminOrderRating[],
      };
    } catch (error) {
      console.error('❌ Failed to fetch admin order ratings:', error);
      throw error;
    }
  },

  // ============ PERFORMANCE ALERTS ENDPOINTS ============

  getPerformanceAlerts: async (filters?: { status?: string; level?: string; page?: number }): Promise<{ results?: any[]; count?: number; next?: string | null; previous?: string | null }> => {
    try {
      const params: Record<string, string | number> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.level) params.level = filters.level;
      if (filters?.page) params.page = filters.page;

      const response = await api.get('/api/performance-alerts/', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch performance alerts:', error);
      throw error;
    }
  },

  resolvePerformanceAlert: async (alertId: number | string): Promise<any> => {
    try {
      const response = await api.post(`/api/performance-alerts/${alertId}/resolve/`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to resolve performance alert:', error);
      throw error;
    }
  },

  // ============ AI ANALYZER ENDPOINTS ============

  getAnalyzerResults: async (): Promise<AIAnalyzer[]> => {
    return []; // Mocked as AI analysis is integral now
  },

  getAnalyzerResult: async (orderId: number): Promise<AIAnalyzer | null> => {
    return null; // Mocked as AI analysis is integral now
  },

  // ============ APPLICANTS ENDPOINTS ============

  getDriverApplicants: async (): Promise<DriverApplicant[]> => {
    try {
      const response = await api.get('/api/admin/applicants/drivers/');
      console.log('📦 Driver applicants response:', response.data);
      const data = response.data.results || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch driver applicants:', error);
      throw error;
    }
  },

  getWorkerApplicants: async (): Promise<WorkerApplicant[]> => {
    try {
      const response = await api.get('/api/admin/applicants/workers/');
      console.log('📦 Worker applicants response:', response.data);
      const data = response.data.results || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch worker applicants:', error);
      throw error;
    }
  },

  scheduleInterview: async (type: 'drivers' | 'workers', id: number, payload: InterviewSchedulePayload): Promise<void> => {
    try {
      const url = `/api/admin/applicants/${type}/${id}/schedule-interview/`;
      console.log('📅 Scheduling interview:', { url, payload });
      await api.patch(url, payload);
      console.log('✅ Interview scheduled successfully');
    } catch (error) {
      console.error('❌ Failed to schedule interview:', error);
      throw error;
    }
  },

  approveApplicant: async (type: 'drivers' | 'workers', id: number): Promise<void> => {
    try {
      await api.post(`/api/admin/applicants/${type}/${id}/approve/`);
    } catch (error) {
      console.error('Failed to approve applicant:', error);
      throw error;
    }
  },

  rejectApplicant: async (type: 'drivers' | 'workers', id: number): Promise<void> => {
    try {
      await api.post(`/api/admin/applicants/${type}/${id}/reject/`);
    } catch (error) {
      console.error('Failed to reject applicant:', error);
      throw error;
    }
  },
};
