import { API_BASE_URL } from './api';

type TrackingCallback = (data: any) => void;

class TrackingSocket {
    private socket: WebSocket | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private isExplicitDisconnect: boolean = false;
    private listeners: TrackingCallback[] = [];
    private currentOrderId: string | number | null = null;

    // Configuration
    private readonly RECONNECT_DELAY = 3000;
    private readonly MAX_RETRIES = 5;
    private retryCount = 0;

    constructor() { }

    public connect(orderId: string | number) {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            if (this.currentOrderId === orderId) {
                console.log('WebSocket already connected to this order.');
                return;
            } else {
                this.disconnect();
            }
        }

        this.currentOrderId = orderId;
        this.isExplicitDisconnect = false;
        this.retryCount = 0;
        this.initiateConnection();
    }

    private initiateConnection() {
        if (!this.currentOrderId) return;

        const token = localStorage.getItem('moveline_token');

        // Use the configured API base URL, or fallback to the known ngrok address if empty
        let host = API_BASE_URL.replace(/^https?:\/\//, '');
        if (!host || host === '') {
            host = 'procreative-dalilah-horsy.ngrok-free.dev';
        }

        // Determine protocol: wss for https or ngrok
        const wsProtocol = (API_BASE_URL.startsWith('https') || host.includes('ngrok')) ? 'wss' : 'ws';

        // Construct standard WebSocket URL: /ws/tracking/{orderId}/
        const url = `${wsProtocol}://${host}/ws/tracking/${this.currentOrderId}/?token=${token || ''}`;

        console.log(`Connecting to WebSocket: ${url}`);

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log('WebSocket Connected');
                this.retryCount = 0;
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.notifyListeners(data);
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };

            this.socket.onclose = (event) => {
                console.log(`WebSocket Disconnected (Code: ${event.code})`);
                if (!this.isExplicitDisconnect) {
                    this.scheduleReconnect();
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

        } catch (e) {
            console.error('WebSocket Connection Failed:', e);
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect() {
        if (this.retryCount >= this.MAX_RETRIES) {
            console.warn('Max WebSocket reconnections reached. Falling back to polling (if handled by consumer).');
            return;
        }

        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

        this.reconnectTimer = setTimeout(() => {
            console.log(`Attempting Reconnect (${this.retryCount + 1}/${this.MAX_RETRIES})...`);
            this.retryCount++;
            this.initiateConnection();
        }, this.RECONNECT_DELAY);
    }

    public disconnect() {
        this.isExplicitDisconnect = true;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.currentOrderId = null;
    }

    public subscribe(callback: TrackingCallback) {
        this.listeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(data: any) {
        this.listeners.forEach(listener => listener(data));
    }

    public isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}

// Export singleton instance
export const trackingSocket = new TrackingSocket();
