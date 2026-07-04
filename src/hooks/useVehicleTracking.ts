import { useState, useEffect, useRef } from 'react';
import { trackingSocket } from '../lib/trackingSocket';
import { TrackingLiveResponse, trackingApi } from '../lib/trackingApi';
import { routingService, RouteData } from '../lib/routingService';

interface UseVehicleTrackingProps {
    orderId: string | number;
    destination?: [number, number];
    pollInterval?: number; // Kept for interface compatibility but unused for WS
}

export const useVehicleTracking = ({ orderId, destination }: UseVehicleTrackingProps) => {
    const [data, setData] = useState<TrackingLiveResponse | null>(null);
    const [route, setRoute] = useState<RouteData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastLocationRef = useRef<[number, number] | null>(null);

    const destinationRef = useRef<[number, number] | undefined>(destination);

    // Keep destinationRef in sync with props, but don't trigger WS reconnect
    useEffect(() => {
        destinationRef.current = destination;
    }, [destination]);

    useEffect(() => {
        if (!orderId) return;

        let isMounted = true;

        // Connect to WebSocket
        trackingSocket.connect(orderId);

        // Subscribe to updates
        const unsubscribe = trackingSocket.subscribe(async (wsData: any) => {
            if (!isMounted) return;

            // Map WS data to TrackingLiveResponse structure if needed
            // Backend sends: { current_latitude: number, current_longitude: number, heading: number, ... }
            const lat = typeof wsData.current_latitude === 'string' ? parseFloat(wsData.current_latitude) : wsData.current_latitude;
            const lng = typeof wsData.current_longitude === 'string' ? parseFloat(wsData.current_longitude) : wsData.current_longitude;

            // Defensive check: only update if we have valid coordinates
            if (lat === null || lat === undefined || isNaN(lat) || lng === null || lng === undefined || isNaN(lng)) {
                console.warn('⚠️ Received invalid coordinates from WebSocket:', wsData);
                return;
            }

            const mappedData: TrackingLiveResponse = {
                latitude: lat,
                longitude: lng,
                order_status: wsData.is_active ? 'in-transit' : 'stopped',
                eta: wsData.remaining_distance_km ? `${Math.round(Number(wsData.remaining_distance_km) * 2)} min` : 'Calculating...',
                order_id: wsData.order,
            };

            setData(mappedData);
            setIsLoading(false);

            // Access latest state/refs for routing
            const newLoc: [number, number] = [mappedData.latitude, mappedData.longitude];
            const lastLoc = lastLocationRef.current;
            const currentDest = destinationRef.current;

            // Route Calculation Logic
            if (currentDest && (!lastLoc ||
                Math.abs(newLoc[0] - lastLoc[0]) > 0.0001 ||
                Math.abs(newLoc[1] - lastLoc[1]) > 0.0001)) {

                lastLocationRef.current = newLoc;
                try {
                    const routeData = await routingService.fetchRoute(newLoc, currentDest);
                    if (isMounted && routeData) {
                        setRoute(routeData);
                    }
                } catch (e) {
                    console.error('Failed to update route:', e);
                }
            }
        });

        // Optional: Initial fetch via HTTP to get immediate state while WS connects
        const initialFetch = async () => {
            try {
                const result = await trackingApi.getTracking(orderId);
                if (isMounted && !data) { // Only set if WS hasn't already provided data
                    setData(result);
                    setIsLoading(false);
                    if (result.latitude && result.longitude) {
                        lastLocationRef.current = [result.latitude, result.longitude];
                        const currentDest = destinationRef.current;
                        if (currentDest) {
                            const routeData = await routingService.fetchRoute([result.latitude, result.longitude], currentDest);
                            if (isMounted && routeData) setRoute(routeData);
                        }
                    }
                }
            } catch (err) {
                console.warn('Initial fetch failed, waiting for WS:', err);
            }
        };
        initialFetch();

        return () => {
            isMounted = false;
            unsubscribe();
            trackingSocket.disconnect();
        };
    }, [orderId]);

    return { data, route, isLoading, error };
};
