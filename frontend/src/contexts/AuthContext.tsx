/**
 * AuthContext - Contexto de autenticación
 * Maneja el estado de autenticación usando la API real
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setTokens, clearTokens, isAuthenticated as checkAuthToken } from '../services/api';
import { User } from '../services/adminApi';

// Extendemos User para compatibilidad si alguna parte usa .id en vez de ._id
export type AuthUser = User & { id?: string };

interface AuthContextType {
    isAuthenticated: boolean;
    currentUser: AuthUser | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => Promise<void>; // Para recargar usuario manualmente
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuario al iniciar
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        if (!checkAuthToken()) {
            setLoading(false);
            return;
        }

        try {
            // Obtener perfil del usuario usando endpoint /users/me
            try {
                const user = await api.get<User>('/users/me');
                // Mapeamos _id a id por si acaso
                setCurrentUser({ ...user, id: user._id });
            } catch (err) {
                // Si falla obtener usuario, puede ser token inválido
                console.error('Error cargando usuario:', err);
                logout();
            }
        } catch (error) {
            console.error('Auth load error:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // 1. Usar FormData para OAuth2PasswordRequestForm (estándar FastAPI)
            const formData = new FormData();
            formData.append('username', email); // FastAPI usa 'username' aunque sea email
            formData.append('password', password);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) return false;

            const data = await response.json();

            // 2. Guardar tokens
            setTokens(data.access_token, data.refresh_token || '');

            // 3. Obtener datos del usuario
            await loadUser();

            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        // Opcional: Llamar a logout en backend
        try {
            api.post('/auth/logout').catch(() => { });
        } catch { }

        clearTokens();
        setCurrentUser(null);
        window.location.href = '/login';
    };

    const value = {
        isAuthenticated: !!currentUser,
        currentUser,
        login,
        logout,
        checkAuth: loadUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
