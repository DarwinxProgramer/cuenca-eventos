/**
 * Events API Service - Servicio para obtener eventos desde el backend
 * Usado por las páginas públicas del frontend (no admin)
 */
import { api } from './api';

// Tipos para eventos
export interface EventFromAPI {
    _id: string;
    title: string;
    description: string;
    long_description?: string;
    date: string;
    time: string;
    end_time?: string;
    location: string;
    address?: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    category: string;
    image_id?: string;
    image_url?: string;  // Added: some endpoints return image_url instead of image_id
    itinerary?: Array<{ time: string; activity: string }>;
    closed_streets?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface AlertFromAPI {
    _id: string;
    title: string;
    description: string;
    type: 'cierre' | 'desvio' | 'congestion';
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    start_date: string;
    end_date: string;
    is_active: boolean;
    related_event_id?: string;
}

export interface RouteFromAPI {
    _id: string;
    name: string;
    description: string;
    category: 'cultural' | 'gastronomica' | 'religiosa' | 'aventura';
    duration: string;
    distance: string;
    difficulty: 'facil' | 'moderada' | 'dificil';
    stops?: Array<{
        name: string;
        coordinates: { lat: number; lng: number };
    }>;
    image_id?: string;
    image_url?: string;  // Added: some endpoints return image_url instead of image_id
    events?: string[];
    created_at?: string;
    updated_at?: string;
}

// URL base para imágenes de GridFS
const IMAGE_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

/**
 * Obtener URL de imagen desde GridFS
 * Maneja tanto image_url (ruta completa del backend) como image_id
 */
export const getImageUrl = (image?: string): string | null => {
    if (!image) return null;

    // Si ya es una URL completa (http/https), retornarla directamente
    if (image.startsWith('http')) {
        return image;
    }

    // Si es una ruta que empieza con /api/v1, construir URL completa
    if (image.startsWith('/api/v1')) {
        return `${IMAGE_BASE_URL}${image}`;
    }

    // Si es solo un ID, construir URL completa
    return `${IMAGE_BASE_URL}/api/v1/images/${image}`;
};

/**
 * Servicio de eventos públicos
 */
export const eventsApi = {
    /**
     * Obtener todos los eventos
     */
    list: async (category?: string): Promise<EventFromAPI[]> => {
        const params = category ? `?category=${category}` : '';
        return api.get<EventFromAPI[]>(`/events/${params}`, false);
    },

    /**
     * Obtener evento por ID
     */
    get: async (id: string): Promise<EventFromAPI> => {
        return api.get<EventFromAPI>(`/events/${id}`, false);
    },

    /**
     * Obtener eventos por fecha
     */
    getByDate: async (date: string): Promise<EventFromAPI[]> => {
        return api.get<EventFromAPI[]>(`/events/date/${date}`, false);
    },

    /**
     * Obtener próximos eventos
     */
    getUpcoming: async (limit: number = 10): Promise<EventFromAPI[]> => {
        return api.get<EventFromAPI[]>(`/events/upcoming?limit=${limit}`, false);
    },

    /**
     * Obtener eventos cercanos
     */
    getNearby: async (lat: number, lng: number, radius: number = 5): Promise<EventFromAPI[]> => {
        return api.get<EventFromAPI[]>(`/events/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, false);
    },
};

/**
 * Servicio de alertas públicas
 */
export const alertsApi = {
    /**
     * Obtener alertas activas
     */
    list: async (): Promise<AlertFromAPI[]> => {
        return api.get<AlertFromAPI[]>('/alerts/', false);
    },

    /**
     * Obtener alerta por ID
     */
    get: async (id: string): Promise<AlertFromAPI> => {
        return api.get<AlertFromAPI>(`/alerts/${id}`, false);
    },
};

/**
 * Servicio de rutas turísticas públicas
 */
export const routesApi = {
    /**
     * Obtener todas las rutas
     */
    list: async (category?: string): Promise<RouteFromAPI[]> => {
        const params = category ? `?category=${category}` : '';
        return api.get<RouteFromAPI[]>(`/routes/${params}`, false);
    },

    /**
     * Obtener ruta por ID
     */
    get: async (id: string): Promise<RouteFromAPI> => {
        return api.get<RouteFromAPI>(`/routes/${id}`, false);
    },

    /**
     * Crear ruta (público/usuario)
     */
    create: async (data: any): Promise<RouteFromAPI> => {
        return api.post<RouteFromAPI>('/routes/', data);
    },
};

export default eventsApi;
