import { API_BASE_URL } from './api';

export interface TrackingLiveResponse {
    latitude: number;
    longitude: number;
    order_status: string;
    eta: string;
    order_id?: number; // In case backend adds it later
}

// Fallback to strict polling for now as requested
export const trackingApi = {
    getTracking: async (id: string | number): Promise<TrackingLiveResponse> => {
        // Using the hardcoded endpoint as base, but aiming to make it dynamic if the pattern allows
        // The user instruction said: https://procreative-dalilah-horsy.ngrok-free.dev/api/tracking/2/
        // We will assume '2' is the ID.
        const url = `${API_BASE_URL}/api/tracking/${id}/`;

        const token = localStorage.getItem('moveline_token');
        const headers: HeadersInit = {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Tracking API Error (${response.status}): ${errorText.slice(0, 200)}`);
            }

            return await response.json();
        } catch (error) {
            // Re-throw to be handled by the caller (useVehicleTracking)
            throw error;
        }


    }
};
