/**
 * API Client - Cliente HTTP base para comunicación con backend
 * Maneja JWT tokens automáticamente
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Claves de localStorage
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Obtener token de acceso
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Obtener token de refresco
 */
export const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Guardar tokens
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Limpiar tokens (logout)
 */
export const clearTokens = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Verificar si hay sesión activa
 */
export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
};

/**
 * Headers por defecto con JWT
 */
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

/**
 * Headers como objeto plano (para guardar en IndexedDB)
 */
const getHeadersObject = (includeAuth: boolean = true): Record<string, string> => {
    const token = includeAuth ? getAccessToken() : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

/**
 * Manejar respuesta de la API
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        // Si es 401, intentar refrescar token
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
                clearTokens();
                window.location.href = '/login';
                throw new Error('Sesión expirada');
            }
        }

        const errorBody = await response.json().catch(() => ({ detail: 'Error desconocido' }));

        let errorMessage = errorBody.detail || `Error ${response.status}`;

        // Si el detalle es un objeto o array (ej: errores de validación de FastAPI), convertir a string
        if (typeof errorMessage === 'object') {
            // Si es un array de errores de validación, intentar formatearlo mejor
            if (Array.isArray(errorMessage) && errorMessage.length > 0 && errorMessage[0].msg) {
                errorMessage = errorMessage.map((e: any) => `${e.loc?.join('.')} ${e.msg}`).join(', ');
            } else {
                errorMessage = JSON.stringify(errorMessage);
            }
        }

        throw new Error(errorMessage);
    }

    // Si es 204 No Content, retornar null
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
};

/**
 * Refrescar token de acceso
 */
const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            setTokens(data.access_token, data.refresh_token);
            return true;
        }
    } catch {
        // Error al refrescar, limpiar tokens
    }

    return false;
};

// ============================================
// MÉTODOS HTTP
// ============================================

import { syncQueue } from './syncQueue';

/**
 * Detectar si el error es de red (sin conexión)
 */
const isNetworkError = (error: any): boolean => {
    const message = error?.message || '';
    // Chrome/Edge/Firefox suelen usar 'Failed to fetch' o 'NetworkError'
    // Pero a veces el mensaje varía o el tipo de error no es exactamente TypeError
    return message.includes('Failed to fetch') ||
        message.includes('NetworkError') ||
        message.includes('Network request failed') ||
        message.includes('connection refused') ||
        // Fallback final: si estamos offline según el navegador, asumimos que es error de red
        (!navigator.onLine);
};

export const api = {
    /**
     * GET request
     */
    get: async <T>(endpoint: string, auth: boolean = true): Promise<T> => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(auth),
        });
        return handleResponse<T>(response);
    },

    /**
     * POST request (con queue offline)
     */
    post: async <T>(endpoint: string, data?: unknown, auth: boolean = true): Promise<T> => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(auth),
                body: data ? JSON.stringify(data) : undefined,
            });
            return handleResponse<T>(response);
        } catch (error) {
            // Si es error de red, encolar operación
            if (isNetworkError(error)) {
                await syncQueue.queueOperation({
                    operation: 'CREATE',
                    endpoint,
                    method: 'POST',
                    data,
                    headers: getHeadersObject(auth),
                });

                // Retornar respuesta optimista con ID temporal
                return {
                    _id: `temp-${Date.now()}`,
                    ...(typeof data === 'object' && data !== null ? data : {}),
                } as T;
            }
            throw error;
        }
    },

    /**
     * PUT request (con queue offline)
     */
    put: async <T>(endpoint: string, data: unknown, auth: boolean = true): Promise<T> => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: getHeaders(auth),
                body: JSON.stringify(data),
            });
            return handleResponse<T>(response);
        } catch (error) {
            // Si es error de red, encolar operación
            if (isNetworkError(error)) {
                await syncQueue.queueOperation({
                    operation: 'UPDATE',
                    endpoint,
                    method: 'PUT',
                    data,
                    headers: getHeadersObject(auth),
                });

                // Retornar data optimista
                return data as T;
            }
            throw error;
        }
    },

    /**
     * DELETE request (con queue offline)
     */
    delete: async <T>(endpoint: string, auth: boolean = true): Promise<T> => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: getHeaders(auth),
            });
            return handleResponse<T>(response);
        } catch (error) {
            // Si es error de red, encolar operación
            if (isNetworkError(error)) {
                await syncQueue.queueOperation({
                    operation: 'DELETE',
                    endpoint,
                    method: 'DELETE',
                    headers: getHeadersObject(auth),
                });

                // Retornar respuesta vacía optimista
                return { message: 'Operación encolada' } as T;
            }
            throw error;
        }
    },

    /**
     * POST con FormData (para uploads)
     */
    upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
        const token = getAccessToken();
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });
        return handleResponse<T>(response);
    },
};

export default api;
