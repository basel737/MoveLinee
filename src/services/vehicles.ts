import api from '@/lib/axios';
import { Vehicle, CreateVehiclePayload } from '@/types/vehicle';

export const vehiclesService = {
  /**
   * Create a new vehicle
   * POST /api/vehicles/
   */
  createVehicle: async (payload: CreateVehiclePayload): Promise<Vehicle> => {
    try {
      const response = await api.post('/api/vehicles/', payload);
      const data = response.data;
      
      // Map response to include compatibility fields
      return {
        ...data,
        type: data.vehicle_type || data.name || 'Unknown',
        // ponytail: Simple approximation for capacity from payload (e.g. payload_kg / 100). Max capacity in m3.
        capacityM3: data.max_payload_kg ? Math.round(data.max_payload_kg / 100) : 10,
        available: data.is_available ?? true
      };
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  /**
   * Get all vehicles
   * GET /api/vehicles/
   */
  getAllVehicles: async (): Promise<Vehicle[]> => {
    try {
      const response = await api.get('/api/vehicles/');
      const results = response.data.results || response.data || [];
      return results.map((v: any) => ({
        ...v,
        type: v.vehicle_type || v.name || 'Unknown',
        capacityM3: v.max_payload_kg ? Math.round(v.max_payload_kg / 100) : 10,
        available: v.is_available ?? true
      }));
    } catch (error) {
      console.error('Error fetching vehicles, trying admin endpoint:', error);
      // Fallback to the existing /api/admin/vehicles/
      const response = await api.get('/api/admin/vehicles/');
      const results = response.data.results || response.data || [];
      return results.map((v: any) => ({
        ...v,
        office: v.office || 1,
        name: v.name || v.type || `Vehicle #${v.id}`,
        vehicle_type: v.vehicle_type || v.type || 'medium',
        max_payload_kg: v.max_payload_kg || (v.capacityM3 ? v.capacityM3 * 100 : 1500),
        plate_number: v.plate_number || `SY-${1000 + v.id}`,
        is_available: v.is_available ?? v.available ?? true,
        type: v.type || v.vehicle_type || 'Unknown',
        capacityM3: v.capacityM3 || 10,
        available: v.available ?? v.is_available ?? true
      }));
    }
  },

  /**
   * Update vehicle availability
   * PATCH /api/vehicles/{id}/
   */
  updateVehicleAvailability: async (id: number, available: boolean): Promise<Vehicle> => {
    try {
      const response = await api.patch(`/api/vehicles/${id}/`, { is_available: available });
      const data = response.data;
      return {
        ...data,
        type: data.vehicle_type || data.name || 'Unknown',
        capacityM3: data.max_payload_kg ? Math.round(data.max_payload_kg / 100) : 10,
        available: data.is_available ?? true
      };
    } catch (error) {
      console.error('Error updating vehicle availability, trying admin endpoint:', error);
      const response = await api.patch(`/api/admin/vehicles/${id}/`, { available });
      const data = response.data;
      return {
        ...data,
        office: data.office || 1,
        name: data.name || data.type || `Vehicle #${data.id}`,
        vehicle_type: data.vehicle_type || data.type || 'medium',
        max_payload_kg: data.max_payload_kg || (data.capacityM3 ? data.capacityM3 * 100 : 1500),
        plate_number: data.plate_number || `SY-${1000 + data.id}`,
        is_available: data.is_available ?? data.available ?? true,
        type: data.type || data.vehicle_type || 'Unknown',
        capacityM3: data.capacityM3 || 10,
        available: data.available ?? data.is_available ?? true
      };
    }
  }
};
