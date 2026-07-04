export interface Vehicle {
  id: number;
  office: number;
  name: string;
  vehicle_type: string;
  max_payload_kg: number;
  plate_number: string;
  is_available: boolean;
  
  // Compatibility fields for UI/legacy code
  type: string;
  capacityM3: number;
  available: boolean;
}

export interface CreateVehiclePayload {
  office: number;
  name: string;
  vehicle_type: string;
  max_payload_kg: number;
  plate_number: string;
  is_available: boolean;
}
