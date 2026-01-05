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

        const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(error.detail || `Error ${response.status}`);
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
     * POST request
     */
    post: async <T>(endpoint: string, data?: unknown, auth: boolean = true): Promise<T> => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(auth),
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse<T>(response);
    },

    /**
     * PUT request
     */
    put: async <T>(endpoint: string, data: unknown, auth: boolean = true): Promise<T> => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(auth),
            body: JSON.stringify(data),
        });
        return handleResponse<T>(response);
    },

    /**
     * DELETE request
     */
    delete: async <T>(endpoint: string, auth: boolean = true): Promise<T> => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(auth),
        });
        return handleResponse<T>(response);
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
