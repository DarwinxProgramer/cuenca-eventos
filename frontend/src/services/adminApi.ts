/**
 * Admin API - Servicios específicos para el panel de administración
 */
import { api } from './api';

// ============================================
// TIPOS
// ============================================

export interface Event {
    _id: string;
    title: string;
    description: string;
    long_description?: string;
    date: string;
    time: string;
    end_time?: string;
    location: string;
    address?: string;
    coordinates: { lat: number; lng: number };
    category: 'cultural' | 'religioso' | 'gastronomico' | 'artistico' | 'tradicional';
    image_url?: string;
    gallery: string[];
    itinerary: { time: string; activity: string }[];
    closed_streets: string[];
    testimonials: { name: string; comment: string; rating: number; created_at: string }[];
    created_at: string;
    updated_at: string;
}

export interface EventCreate {
    title: string;
    description: string;
    long_description?: string;
    date: string;
    time: string;
    end_time?: string;
    location: string;
    address?: string;
    coordinates: { lat: number; lng: number };
    category: string;
    image_id?: string;
    gallery?: string[];
    itinerary?: { time: string; activity: string }[];
    closed_streets?: string[];
}

export interface Alert {
    _id: string;
    title: string;
    description: string;
    type: 'cierre' | 'desvio' | 'congestion';
    location: string;
    coordinates: { lat: number; lng: number };
    start_date: string;
    end_date: string;
    image_url?: string;
    is_active: boolean;
    created_at: string;
}

export interface AlertCreate {
    title: string;
    description: string;
    type: 'cierre' | 'desvio' | 'congestion';
    location: string;
    coordinates: { lat: number; lng: number };
    start_date: string;
    end_date: string;
    image_id?: string;
}

export interface Route {
    _id: string;
    name: string;
    description: string;
    category: 'gastronomica' | 'cultural' | 'religiosa' | 'aventura';
    duration: string;
    distance: string;
    difficulty: 'facil' | 'moderada' | 'dificil';
    image_url?: string;
    events: string[];
    stops: { name: string; coordinates: { lat: number; lng: number } }[];
    created_at: string;
}

export interface RouteCreate {
    name: string;
    description: string;
    category: string;
    duration: string;
    distance: string;
    difficulty: string;
    image_id?: string;
    events?: string[];
    stops?: { name: string; coordinates: { lat: number; lng: number } }[];
}

export interface UploadResult {
    id: string;
    filename: string;
    content_type: string;
    size: number;
    url: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    age?: number;
    gender?: string;
    member_since: string;
    preferences: string[];
    role: 'user' | 'admin';
    avatar_url?: string;
}

export interface UserUpdate {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    age?: number;
    gender?: string;
    role?: 'user' | 'admin';
}

// ============================================
// SERVICIOS ADMIN
// ============================================

export const adminApi = {
    // ============================================
    // EVENTOS
    // ============================================
    events: {
        list: () => api.get<Event[]>('/events/'),
        get: (id: string) => api.get<Event>(`/events/${id}`),
        create: (data: EventCreate) => api.post<Event>('/events/', data),
        update: (id: string, data: Partial<EventCreate>) => api.put<Event>(`/events/${id}`, data),
        delete: (id: string) => api.delete<void>(`/events/${id}`),
    },

    // ============================================
    // ALERTAS
    // ============================================
    alerts: {
        list: () => api.get<Alert[]>('/alerts/?active_only=false'),
        get: (id: string) => api.get<Alert>(`/alerts/${id}`),
        create: (data: AlertCreate) => api.post<Alert>('/alerts/', data),
        update: (id: string, data: Partial<AlertCreate>) => api.put<Alert>(`/alerts/${id}`, data),
        delete: (id: string) => api.delete<void>(`/alerts/${id}`),
    },

    // ============================================
    // RUTAS
    // ============================================
    routes: {
        list: () => api.get<Route[]>('/routes/'),
        get: (id: string) => api.get<Route>(`/routes/${id}`),
        create: (data: RouteCreate) => api.post<Route>('/routes/', data),
        update: (id: string, data: Partial<RouteCreate>) => api.put<Route>(`/routes/${id}`, data),
        delete: (id: string) => api.delete<void>(`/routes/${id}`),
    },

    // ============================================
    // USUARIOS
    // ============================================
    users: {
        list: () => api.get<User[]>('/users/'),
        create: (data: { name: string; email: string; password: string; phone?: string; city?: string }) =>
            api.post<User>('/auth/register', data, false), // false = no auth required
        update: (id: string, data: UserUpdate) => api.put<User>(`/users/${id}`, data),
        delete: (id: string) => api.delete<void>(`/users/${id}`),
    },

    // ============================================
    // IMÁGENES
    // ============================================
    images: {
        upload: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return api.upload<UploadResult>('/images/upload/', formData);
        },
        delete: (id: string) => api.delete<void>(`/images/${id}`),
        getUrl: (id: string) => `/api/v1/images/${id}`,
    },
};

export default adminApi;
