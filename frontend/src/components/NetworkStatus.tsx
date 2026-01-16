/**
 * NetworkStatus - Banner global que muestra estado de conexión
 * Aparece cuando se pierde/recupera conexión
 */

import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSyncQueue } from '../hooks/useSyncQueue';

export function NetworkStatus() {
    const { isDark } = useTheme();
    const { pendingCount } = useSyncQueue();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Verificar estado inicial
        if (!navigator.onLine) {
            setMessage('⚠️ Sin conexión. Los cambios se guardarán localmente.');
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 5000);
        }

        const handleOnline = () => {
            setIsOnline(true);
            setMessage('✅ Conexión restaurada. Sincronizando datos...');
            setShowBanner(true);

            // Ocultar después de 5 segundos
            setTimeout(() => setShowBanner(false), 5000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setMessage('⚠️ Sin conexión. Los cambios se guardarán localmente.');
            setShowBanner(true);

            // Ocultar después de 5 segundos también para offline
            setTimeout(() => setShowBanner(false), 5000);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Mostrar banner permanente si hay operaciones pendientes
    const hasPending = pendingCount > 0;

    if (!showBanner && !hasPending) {
        return null;
    }

    return (
        <>
            {/* Banner fijo superior cuando estás offline */}
            {/* Banner único de estado (online/offline) */}

            {/* Banner de transición (online/offline) */}
            {showBanner && (
                <div className={`
                    fixed top-5 left-1/2 transform -translate-x-1/2 z-50
                    px-6 py-4 rounded-lg shadow-2xl
                    backdrop-blur-md border
                    transition-all duration-500
                    ${isOnline
                        ? (isDark
                            ? 'bg-green-600/90 border-green-500 text-white'
                            : 'bg-green-500/90 border-green-400 text-white'
                        )
                        : (isDark
                            ? 'bg-orange-600/90 border-orange-500 text-white'
                            : 'bg-orange-500/90 border-orange-400 text-white'
                        )
                    }
                    animate-slide-down
                `}>
                    <p className="font-semibold">{message}</p>
                </div>
            )}
        </>
    );
}
