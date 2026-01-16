/**
 * useRoutesData - Hook para obtener rutas con fallback offline
 */
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/db';
import { adminApi } from '../services/adminApi';

export function useRoutesData() {
    return useQuery({
        queryKey: ['routes-data'],
        queryFn: async () => {
            try {
                // Intentar obtener desde API
                const routes = await adminApi.routes.list();

                // Guardar en IndexedDB para uso offline
                await dbService.saveRoutes(routes);

                return routes;
            } catch (error) {
                console.log('[useRoutesData] API failed, falling back to IndexedDB');

                // Fallback a IndexedDB
                const cachedRoutes = await dbService.getRoutes();

                if (cachedRoutes.length === 0) {
                    // Si no hay cache, retornamos array vacío en lugar de error
                    // para que la UI no muestre pantalla roja
                    return [];
                }

                return cachedRoutes;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: false, // No reintentar, usar cache inmediatamente
    });
}
