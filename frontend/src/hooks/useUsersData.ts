/**
 * useUsersData - Hook para obtener usuarios con fallback offline
 */
import { useQuery } from '@tanstack/react-query';
import { dbService } from '../services/db';
import { adminApi } from '../services/adminApi';

export function useUsersData() {
    return useQuery({
        queryKey: ['users-data'],
        queryFn: async () => {
            try {
                // Intentar obtener desde API
                const users = await adminApi.users.list();

                // Guardar en IndexedDB para uso offline
                await dbService.saveUsers(users);

                return users;
            } catch (error) {
                console.log('[useUsersData] API failed, falling back to IndexedDB');

                // Fallback a IndexedDB
                const cachedUsers = await dbService.getUsers();

                if (cachedUsers.length === 0) {
                    return [];
                }

                return cachedUsers;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: false, // No reintentar, usar cache inmediatamente
    });
}
