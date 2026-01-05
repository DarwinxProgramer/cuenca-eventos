/**
 * AdminRoute - Componente de ruta protegida para administradores
 * Redirige a login si no está autenticado o no es admin
 */
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
    children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
    const { isAuthenticated, currentUser, loading } = useAuth();

    // Mientras carga, mostrar nada (evita redirecciones prematuras)
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

    // Si no es admin, redirigir al menú principal
    const isAdmin = currentUser?.email === 'admin@gmail.com';

    if (!isAdmin) {
        return <Navigate to="/menu" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
