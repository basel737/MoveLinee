export interface RouteData {
    coordinates: [number, number][]; // [lat, lng] pairs
    distance: number; // in meters
    duration: number; // in seconds
}

export const routingService = {
    fetchRoute: async (start: [number, number], end: [number, number]): Promise<RouteData | null> => {
        try {
            // Defensive check: ensure coordinates are valid numbers
            if (!start || isNaN(start[0]) || isNaN(start[1]) || !end || isNaN(end[0]) || isNaN(end[1])) {
                console.warn('⚠️ Invalid coordinates passed to routingService:', { start, end });
                return null;
            }

            // OSRM expects [lng, lat]
            const startStr = `${start[1]},${start[0]}`;
            const endStr = `${end[1]},${end[0]}`;

            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson`
            );

            if (!response.ok) return null;

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.warn('OSRM returned non-JSON response:', jsonError);
                return null;
            }
            if (!data.routes || data.routes.length === 0) return null;

            const route = data.routes[0];

            // Convert GeoJSON coords [lng, lat] back to [lat, lng] for Leaflet
            const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);

            return {
                coordinates,
                distance: route.distance,
                duration: route.duration,
            };
        } catch (error) {
            console.error('Failed to fetch OSRM route:', error);
            return null;
        }
    }
};
