import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api'; // Using shared api instance
import { dbService } from '../services/db';

export interface Evento {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image_url?: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

// Claves de consulta (para caché)
export const eventKeys = {
    all: ['events'] as const,
    lists: () => [...eventKeys.all, 'list'] as const,
    list: (filters: any) => [...eventKeys.lists(), { filters }] as const,
    details: () => [...eventKeys.all, 'detail'] as const,
    detail: (id: string) => [...eventKeys.details(), id] as const,
    upcoming: () => [...eventKeys.all, 'upcoming'] as const,
};

// Hooks
export function useEvents(filters?: { category?: string; date?: string; search?: string }) {
    return useQuery({
        queryKey: eventKeys.list(filters),
        queryFn: async () => {
            try {
                // Construir query string
                const params = new URLSearchParams();
                if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
                if (filters?.date) params.append('date', filters.date);
                if (filters?.search) params.append('search', filters.search);

                const events = await api.get<Evento[]>(`/events/?${params.toString()}`);

                // Guardar en DB solo si no es búsqueda específica (cache strategy: stale-while-revalidate for lists)
                if (!filters?.search && !filters?.date) {
                    dbService.saveEvents(events).catch(console.error);
                }

                return events;
            } catch (error) {
                console.warn('Network request failed, falling back to IndexedDB', error);

                // Fallback a IndexedDB
                const cachedEvents = await dbService.getEvents();

                // Aplicar filtros en memoria
                let filtered = cachedEvents;
                if (filters?.category && filters.category !== 'all') {
                    filtered = filtered.filter(e => e.category === filters.category);
                }

                if (filtered.length > 0) return filtered;

                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

export function useUpcomingEvents(limit = 10) {
    return useQuery({
        queryKey: eventKeys.upcoming(),
        queryFn: async () => {
            try {
                return await api.get<Evento[]>(`/events/upcoming?limit=${limit}`);
            } catch (error) {
                // Fallback simple
                const allEvents = await dbService.getEvents();
                const now = new Date();
                return allEvents
                    .filter(e => new Date(e.date) >= now)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, limit);
            }
        },
    });
}

export function useEvent(id: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: eventKeys.detail(id),
        queryFn: async () => {
            try {
                const event = await api.get<Evento>(`/events/${id}`);
                dbService.saveEvents([event]).catch(console.error); // Guardar detalle
                return event;
            } catch (error) {
                // Fallback DB
                const cached = await dbService.getEvent(id);
                if (cached) return cached;

                // Fallback Cache Lista
                const listCache = queryClient.getQueriesData<Evento[]>({ queryKey: eventKeys.lists() });
                for (const [, list] of listCache) {
                    const found = list?.find(e => e._id === id);
                    if (found) return found;
                }

                throw error;
            }
        },
        enabled: !!id,
        initialData: () => {
            // Intentar precargar desde lista
            const listCache = queryClient.getQueriesData<Evento[]>({ queryKey: eventKeys.lists() });
            for (const [, list] of listCache) {
                const found = list?.find(e => e._id === id);
                if (found) return found;
            }
            return undefined;
        }
    });
}
