/**
 * Hook para gestionar el estado de sincronización offline
 * Proporciona estado en tiempo real de la cola de sincronización
 */

import { useEffect, useState } from 'react';
import { syncQueue } from '../services/syncQueue';

export function useSyncQueue() {
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Actualizar contadores
    const updateStatus = async () => {
        const count = await syncQueue.getPendingCount();
        setPendingCount(count);
        setIsSyncing(syncQueue.isSyncing());
    };

    useEffect(() => {
        // Actualizar estado inicial
        updateStatus();

        // Suscribirse a cambios en la cola
        const unsubscribe = syncQueue.subscribe(() => {
            updateStatus();
        });

        // Actualizar periódicamente (cada 30 segundos)
        const interval = setInterval(updateStatus, 30000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    return {
        pendingCount,
        isSyncing,
        syncNow: () => syncQueue.processPendingOperations(),
        clearFailed: () => syncQueue.clearFailedOperations(),
    };
}
