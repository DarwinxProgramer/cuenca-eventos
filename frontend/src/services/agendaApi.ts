/**
 * Agenda API - Gestión de la agenda personal del usuario
 */
import { api } from './api';

export interface AgendaResponse {
    _id: string;
    user_id: string;
    attending: string[];
    interested: string[];
    not_going: string[];
    created_routes: string[];
    completed_routes: string[];
}

export const agendaApi = {
    /**
     * Obtener agenda del usuario actual
     */
    async get(): Promise<AgendaResponse> {
        return api.get<AgendaResponse>('/agenda');
    },

    /**
     * Marcar que asistiré a un evento
     */
    async markAttending(eventId: string): Promise<AgendaResponse> {
        return api.post<AgendaResponse>(`/agenda/attending/${eventId}`, {});
    },

    /**
     * Marcar que me interesa un evento
     */
    async markInterested(eventId: string): Promise<AgendaResponse> {
        return api.post<AgendaResponse>(`/agenda/interested/${eventId}`, {});
    },

    /**
     * Marcar que no asistiré a un evento
     */
    async markNotGoing(eventId: string): Promise<AgendaResponse> {
        return api.post<AgendaResponse>(`/agenda/not-going/${eventId}`, {});
    },

    /**
     * Quitar evento de la agenda (de todas las listas)
     */
    async removeFromAgenda(eventId: string): Promise<void> {
        return api.delete(`/agenda/${eventId}`);
    }
};
