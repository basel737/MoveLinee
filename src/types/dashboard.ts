export interface User {
    id: number | string;
    fullName: string;
    email: string;
    phone: string;
    role: 'customer' | 'driver' | 'worker' | 'admin';
    office?: number | null;
    rating?: number;
    available?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Office {
    id: number;
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface OfficeAssignmentProfile {
    id: number;
    user_id: number;
    full_name: string;
    phone: string;
    office: number | null;
    skills?: string;
    license_number?: string;
    rating: number;
    availability: boolean;
    suspended_until: string | null;
    current_latitude: number | null;
    current_longitude: number | null;
    location_updated_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface DriverOfficeAssignmentResponse {
    detail: string;
    driver?: OfficeAssignmentProfile;
    worker?: OfficeAssignmentProfile;
}

export interface Driver extends User {
    licenseNumber: string;
    rating: number;
    available: boolean;
}

export interface Rating {
    id: number;
    orderId: number;
    customerId: number;
    score: number;
    comment: string;
    createdAt: string;
}

export interface AdminOrderRatingItem {
    id?: number | string;
    ratedUserName?: string | null;
    ratedUserEmail?: string | null;
    ratedUserRole?: string | null;
    targetRole?: string | null;
    score?: number | string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    [key: string]: unknown;
}

export interface AdminOrderRating {
    id?: number | string;
    orderId?: number | string | null;
    orderStatus?: string | null;
    customerName?: string | null;
    customerEmail?: string | null;
    customerRole?: string | null;
    feedback?: string | null;
    feedbackCreatedAt?: string | null;
    feedbackUpdatedAt?: string | null;
    ratings?: AdminOrderRatingItem[];
    [key: string]: unknown;
}

export interface AdminOrderRatingsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: AdminOrderRating[];
}

export interface OrderWorker {
    id: number;
    order: number;
    worker: number;
    worker_full_name: string;
    status: string;
    role_description: string;
    assigned_at: string;
    started_at?: string;
    completed_at?: string;
}

export interface OrderItemV2 {
    id: number;
    order: number;
    label: string;
    quantity: number;
    is_fragile: boolean;
    created_at: string;
    updated_at: string;
}

export interface OrderTracking {
    order: number;
    current_latitude?: string;
    current_longitude?: string;
    heading?: string;
    speed_kmh?: string;
    last_ping_at?: string;
    is_active: boolean;
}

export type Tracking = OrderTracking;

export interface DashboardOrder {
    id: number | string;
    customer: number | string;
    driver?: number | string;
    vehicle?: number | string;
    workers?: (number | string)[];
    required_workers: number;
    required_vehicle_type: string;
    assembly: boolean;
    disassembly: boolean;
    service_type: string;
    serviceType?: string; // Alias
    status: string;
    scheduled_start: string;
    scheduledAt?: string; // Alias
    scheduled_end?: string;
    pickup_address?: string;
    pickupAddress?: string; // Alias
    pickup_latitude?: string;
    pickup_longitude?: string;
    dropoff_address?: string;
    dropoffAddress?: string; // Alias
    dropoff_latitude?: string;
    dropoff_longitude?: string;
    special_instructions?: string;
    estimated_distance_km?: string;
    estimated_duration_minutes?: number;
    estimated_price: string;
    price?: string | number; // Alias
    final_price?: string;
    is_priority: boolean;
    order_workers?: OrderWorker[];
    items: OrderItemV2[];
    payment?: any;
    tracking?: OrderTracking;
    created_at: string;
    createdAt?: string; // Alias
    updated_at: string;
    notes?: string; // Added
}

import { Vehicle } from './vehicle';
export type { Vehicle };

export interface AIAnalyzer {
    id: number;
    orderId: number;
    modelVersion: string;
    totalVolumeM3: number;
    suggestedVehicle: string;
    suggestedWorkers: number;
    confidence: number;
}

export interface PerformanceAlert {
    id: number | string;
    employee_name?: string;
    worker_name?: string;
    driver_name?: string;
    name?: string;
    account_type?: string;
    employee_type?: string;
    type?: string;
    level?: string;
    status?: string;
    reason?: string;
    description?: string;
    message?: string;
    current_rating?: number | string;
    rating?: number | string;
    created_at?: string;
    createdAt?: string;
    [key: string]: unknown;
}

export interface DriverApplicant {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    city_area: string;
    availability: string;
    license_number: string;
    license_photo: string;
    personal_photo: string;
    status: 'pending' | 'approved' | 'rejected';
    interview_status: string;
    interview_datetime?: string;
    interview_location?: string;
    created_at: string;
}

export interface WorkerApplicant {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    city_area: string;
    availability: string;
    skills: string;
    can_lift_heavy: boolean;
    id_card_photo_front: string;
    id_card_photo_back: string;
    personal_photo: string;
    status: 'pending' | 'approved' | 'rejected';
    interview_status: string;
    interview_datetime?: string;
    interview_location?: string;
    created_at: string;
}

export interface InterviewSchedulePayload {
    interview_datetime: string;
    interview_location: string;
}

export interface Customer extends User {
    // Basic customer fields already in User
}

export interface DashboardStats {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    totalPaid: number;
    averageRating: number;
}

export interface Payment {
    id: number | string;
    order: number | string;
    amount: string | number;
    status: string;
    method: string;
    transaction_id?: string;
    created_at: string;
    paidAt?: string; // Alias
}

export interface CustomerAnalytics {
    totalOrders: number;
    completedOrders: number;
    activeOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    averageOrderCost: number;
    averageDeliveryTime: number;
    mostUsedService: string;
    ordersByMonth: {
        month: string;
        count: number;
        spending: number;
    }[];
    ordersByStatus: Record<string, number>;
    ordersByService: Record<string, number>;
    spendingByMonth: {
        month: string;
        amount: number;
    }[];
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
