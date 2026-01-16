import api from './api';
import { User, UserCreate } from './adminApi'; // Reusing User types

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        // Usamos FormData porque el backend usa OAuth2PasswordRequestForm
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        // Nota: api.post usa JSON por defecto, aquí necesitamos enviarlo como form-data
        // pero api.post no soporta FormData directamente en el body si se espera JSON
        // Usaremos api.upload que soporta FormData, o fetch directo si es necesario
        // Pero api.post de mi api.ts usa `JSON.stringify(data)`.

        // Haremos un fetch directo usando la URL base de api.ts (import.meta...)
        // O mejor, extendamos api.ts o usemos api.upload para POSTs genéricos con FormData?
        // api.upload hace POST, así que sirve.
        // Endpoint: /auth/login

        return api.upload<LoginResponse>('/auth/login', formData);
    },

    loginJson: async (email: string, password: string): Promise<LoginResponse> => {
        return api.post<LoginResponse>('/auth/login/json', { email, password }, false);
    },

    register: async (userData: UserCreate): Promise<User> => {
        return api.post<User>('/auth/register', userData, false);
    },

    getCurrentUser: async (): Promise<User> => {
        return api.get<User>('/users/me');
    }
};
