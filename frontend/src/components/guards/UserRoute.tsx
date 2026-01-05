/**
 * UserRoute - Componente de ruta protegida para usuarios normales
 * Redirige a login si no está autenticado, o a /admin si es administrador
 */
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UserRouteProps {
    children: ReactNode;
}

const UserRoute = ({ children }: UserRouteProps) => {
    const { isAuthenticated, currentUser, loading } = useAuth();

    // Mientras carga, mostrar spinner (evita redirecciones prematuras)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si es admin, redirigir al panel de administración
    const isAdmin = currentUser?.email === 'admin@gmail.com';

    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

export default UserRoute;
