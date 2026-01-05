/**
 * AdminDashboardPage - Panel de control del administrador
 * Muestra estadísticas y accesos rápidos a la gestión de contenido
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { adminApi, Event, Alert } from '../../services/adminApi';

export default function AdminDashboardPage() {
    const { isDark } = useTheme();
    const [stats, setStats] = useState({
        events: 0,
        alerts: 0,
        routes: 0,
        users: 0,
        upcomingEvents: 0,
    });
    const [recentEvents, setRecentEvents] = useState<Event[]>([]);
    const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [events, alerts, routes, users] = await Promise.all([
                adminApi.events.list(),
                adminApi.alerts.list(),
                adminApi.routes.list(),
                adminApi.users.list(),
            ]);

            const now = new Date();
            const upcomingEvents = events.filter(e => new Date(e.date) > now);
            const active = alerts.filter(a => a.is_active && new Date(a.end_date) > now);

            setStats({
                events: events.length,
                alerts: alerts.length,
                routes: routes.length,
                users: users.length,
                upcomingEvents: upcomingEvents.length,
            });

            setRecentEvents(events.slice(0, 5));
            setActiveAlerts(active.slice(0, 3));
            setError(null);
        } catch (err) {
            setError('Error al cargar datos. Verifica la conexión con el servidor.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const adminLinks = [
        { icon: '📅', label: 'Gestionar Eventos', path: '/admin/eventos', description: 'Crear, editar y eliminar eventos', count: stats.events },
        { icon: '⚠️', label: 'Gestionar Alertas', path: '/admin/alertas', description: 'Avisos de tránsito y cierres', count: stats.alerts },
        { icon: '🛤️', label: 'Gestionar Rutas', path: '/admin/rutas', description: 'Rutas turísticas de la ciudad', count: stats.routes },
        { icon: '👥', label: 'Gestionar Usuarios', path: '/admin/usuarios', description: 'Administrar usuarios registrados', count: stats.users },
    ];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-EC', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <MenuPageLayout title="Panel de Administración">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className={`
                    p-6 sm:p-8 rounded-2xl mb-6
                    ${isDark
                        ? 'bg-gradient-to-r from-primary-900/50 to-secondary-900/50 backdrop-blur-sm border border-surface-700'
                        : 'bg-gradient-to-r from-primary-100 to-secondary-100 backdrop-blur-sm border border-surface-200 shadow-lg'
                    }
                `}>
                    <h1 className={`text-2xl sm:text-3xl font-bold font-display ${isDark ? 'text-white' : 'text-surface-900'}`}>
                        🛠️ Panel de Administración
                    </h1>
                    <p className={`mt-2 ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                        Gestiona el contenido de Cuenca Eventos
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500">
                        ❌ {error}
                        <button
                            onClick={loadDashboardData}
                            className="ml-4 underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className={`
                                p-6 rounded-2xl text-center
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                                }
                            `}>
                                <p className="text-4xl font-bold text-primary-500">{stats.events}</p>
                                <p className={`text-sm mt-1 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    Eventos totales
                                </p>
                            </div>
                            <div className={`
                                p-6 rounded-2xl text-center
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                                }
                            `}>
                                <p className="text-4xl font-bold text-green-500">{stats.upcomingEvents}</p>
                                <p className={`text-sm mt-1 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    Próximos eventos
                                </p>
                            </div>
                            <div className={`
                                p-6 rounded-2xl text-center
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                                }
                            `}>
                                <p className="text-4xl font-bold text-accent-500">{stats.alerts}</p>
                                <p className={`text-sm mt-1 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    Alertas
                                </p>
                            </div>
                            <div className={`
                                p-6 rounded-2xl text-center
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                                }
                            `}>
                                <p className="text-4xl font-bold text-secondary-500">{stats.routes}</p>
                                <p className={`text-sm mt-1 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    Rutas
                                </p>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Admin Links */}
                            <div className="lg:col-span-1 space-y-4">
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    🚀 Acciones
                                </h2>
                                {adminLinks.map(link => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`
                                            flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]
                                            ${isDark
                                                ? 'bg-surface-800/90 border border-surface-700 hover:bg-surface-700'
                                                : 'bg-white/90 border border-surface-200 shadow-lg hover:bg-surface-50'
                                            }
                                        `}
                                    >
                                        <span className="text-3xl">{link.icon}</span>
                                        <div className="flex-1">
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                {link.label}
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                {link.description}
                                            </p>
                                        </div>
                                        {link.count !== undefined && (
                                            <span className="px-3 py-1 rounded-full text-sm font-bold bg-primary-500/20 text-primary-500">
                                                {link.count}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* Recent Events */}
                            <div className={`
                                lg:col-span-1 p-6 rounded-2xl
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                                }
                            `}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        📅 Eventos Recientes
                                    </h2>
                                    <Link
                                        to="/admin/eventos"
                                        className="text-primary-500 text-sm hover:underline"
                                    >
                                        Ver todos →
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {recentEvents.length === 0 ? (
                                        <p className={`text-sm ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                            No hay eventos registrados
                                        </p>
                                    ) : (
                                        recentEvents.map(event => (
                                            <div
                                                key={event._id}
                                                className={`
                                                    p-3 rounded-xl
                                                    ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                                `}
                                            >
                                                <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {event.title}
                                                </p>
                                                <p className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                    {formatDate(event.date)} • {event.location}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Active Alerts */}
                            <div className={`
                                lg:col-span-1 p-6 rounded-2xl
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                                }
                            `}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        ⚠️ Alertas Activas
                                    </h2>
                                    <Link
                                        to="/admin/alertas"
                                        className="text-primary-500 text-sm hover:underline"
                                    >
                                        Ver todas →
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {activeAlerts.length === 0 ? (
                                        <p className={`text-sm ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                            No hay alertas activas
                                        </p>
                                    ) : (
                                        activeAlerts.map(alert => (
                                            <div
                                                key={alert._id}
                                                className={`
                                                    p-3 rounded-xl border-l-4
                                                    ${alert.type === 'cierre' ? 'border-red-500' :
                                                        alert.type === 'desvio' ? 'border-yellow-500' : 'border-orange-500'}
                                                    ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                                `}
                                            >
                                                <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {alert.title}
                                                </p>
                                                <p className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                    {alert.location}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MenuPageLayout>
    );
}
