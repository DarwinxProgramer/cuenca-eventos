/**
 * useAlertsData - Hook para obtener alertas con fallback offline
 */
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/db';
import { adminApi } from '../services/adminApi';

export function useAlertsData() {
    return useQuery({
        queryKey: ['alerts-data'],
        queryFn: async () => {
            try {
                // Intentar obtener desde API
                const alerts = await adminApi.alerts.list();

                // Guardar en IndexedDB para uso offline
                await dbService.saveAlerts(alerts);

                return alerts;
            } catch (error) {
                console.log('[useAlertsData] API failed, falling back to IndexedDB');

                // Fallback a IndexedDB
                const cachedAlerts = await dbService.getAlerts();

                if (cachedAlerts.length === 0) {
                    return [];
                }

                return cachedAlerts;
            }
        },
        staleTime: 1000 * 10, // 10 segundos para evitar recargas constantes pero refrescar rápido
        refetchOnWindowFocus: true,
    });
}
