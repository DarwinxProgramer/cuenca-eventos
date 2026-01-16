import { useEffect } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export function useAlerts() {
    useEffect(() => {
        let eventSource: EventSource | null = null;
        let retryTimeout: ReturnType<typeof setTimeout>;

        const connect = () => {
            // Close existing connection if any
            if (eventSource) {
                eventSource.close();
            }

            eventSource = new EventSource(`${API_URL}/alerts/stream`);

            eventSource.onopen = () => {
                console.log('🔗 Conectado al sistema de alertas en tiempo real');
            };

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Ignore connection handshake
                    if (data.type === 'connected') return;

                    handleAlert(data);
                } catch (error) {
                    console.error('Error parsing alert:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE Error:', error);
                eventSource?.close();

                // Retry connection after 5 seconds
                retryTimeout = setTimeout(connect, 5000);
            };
        };

        const handleAlert = (message: { type: string; data: any }) => {
            const { type, data } = message;

            // Only show toast for active alerts creation or critical updates
            if (type === 'create') {
                toast(() => (
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-lg">⚠️ Nueva Alerta</span>
                        <span className="font-semibold text-primary-600">{data.title}</span>
                        <span className="text-sm text-gray-600">{data.description}</span>
                    </div>
                ), {
                    duration: 6000,
                    icon: '🚨',
                    style: {
                        borderRadius: '12px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #f97316' // Orange border
                    },
                });
            } else if (type === 'update') {
                // Optional: Show update notifications
            }
        };

        connect();

        return () => {
            if (eventSource) eventSource.close();
            if (retryTimeout) clearTimeout(retryTimeout);
        };
    }, []);
}
