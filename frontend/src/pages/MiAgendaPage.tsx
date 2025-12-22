import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import MenuPageLayout from '../components/menu/MenuPageLayout';
import { initialUserAgenda, getEventById, getRouteById, getCategoryLabel, getCategoryColor } from '../mocks/eventData';

export default function MiAgendaPage() {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<'attending' | 'interested' | 'routes' | 'history'>('attending');
    const [userAgenda] = useState(initialUserAgenda);

    const attendingEvents = userAgenda.attending.map(id => getEventById(id)).filter(Boolean);
    const interestedEvents = userAgenda.interested.map(id => getEventById(id)).filter(Boolean);
    const completedRoutes = userAgenda.completedRoutes.map(id => getRouteById(id)).filter(Boolean);

    const tabs = [
        { id: 'attending', label: '✅ Asistiré', count: attendingEvents.length },
        { id: 'interested', label: '⭐ Me interesa', count: interestedEvents.length },
        { id: 'routes', label: '🧭 Mis Rutas', count: userAgenda.createdRoutes.length },
        { id: 'history', label: '📜 Historial', count: completedRoutes.length },
    ] as const;

    return (
        <MenuPageLayout title="Mi Agenda">
            <div className="container mx-auto px-4">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-2">
                        📋 Mi Agenda
                    </h1>
                    <p className="text-surface-300">
                        Tu actividad personal y eventos guardados
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className={`
                        p-4 rounded-2xl text-center
                        ${isDark
                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                        }
                    `}>
                        <p className="text-3xl font-bold text-green-500">{attendingEvents.length}</p>
                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Eventos confirmados</p>
                    </div>
                    <div className={`
                        p-4 rounded-2xl text-center
                        ${isDark
                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                        }
                    `}>
                        <p className="text-3xl font-bold text-accent-500">{interestedEvents.length}</p>
                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Me interesan</p>
                    </div>
                    <div className={`
                        p-4 rounded-2xl text-center
                        ${isDark
                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                        }
                    `}>
                        <p className="text-3xl font-bold text-primary-500">{userAgenda.createdRoutes.length}</p>
                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Rutas creadas</p>
                    </div>
                    <div className={`
                        p-4 rounded-2xl text-center
                        ${isDark
                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                        }
                    `}>
                        <p className="text-3xl font-bold text-secondary-500">{completedRoutes.length}</p>
                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Rutas completadas</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className={`
                    p-2 rounded-2xl mb-6 flex flex-wrap gap-2
                    ${isDark
                        ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                        : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                    }
                `}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex-1 min-w-[140px] py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300
                                ${activeTab === tab.id
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : isDark
                                        ? 'text-surface-400 hover:text-white hover:bg-surface-700'
                                        : 'text-surface-500 hover:text-surface-900 hover:bg-surface-100'
                                }
                            `}
                        >
                            {tab.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : isDark ? 'bg-surface-700' : 'bg-surface-200'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className={`
                    p-6 rounded-2xl
                    ${isDark
                        ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                        : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                    }
                `}>
                    {/* Attending Events */}
                    {activeTab === 'attending' && (
                        <div>
                            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                ✅ Eventos a los que asistiré
                            </h2>
                            {attendingEvents.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {attendingEvents.map(event => event && (
                                        <div
                                            key={event.id}
                                            className={`
                                                group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]
                                                ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                            `}
                                        >
                                            <div className="relative h-32 overflow-hidden">
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <span className={`
                                                    absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white
                                                    bg-gradient-to-r ${getCategoryColor(event.category)}
                                                `}>
                                                    {getCategoryLabel(event.category)}
                                                </span>
                                                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                    ✅ Confirmado
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {event.title}
                                                </h3>
                                                <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                    📅 {new Date(event.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} • {event.time}
                                                </p>
                                                <p className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                    📍 {event.location}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-12 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    <span className="text-5xl block mb-4">📭</span>
                                    <p className="font-medium">No tienes eventos confirmados</p>
                                    <p className="text-sm mt-2">Explora eventos y marca "Asistiré" para agregarlos aquí</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Interested Events */}
                    {activeTab === 'interested' && (
                        <div>
                            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                ⭐ Eventos que me interesan
                            </h2>
                            {interestedEvents.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {interestedEvents.map(event => event && (
                                        <div
                                            key={event.id}
                                            className={`
                                                group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]
                                                ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                            `}
                                        >
                                            <div className="relative h-32 overflow-hidden">
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <span className={`
                                                    absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white
                                                    bg-gradient-to-r ${getCategoryColor(event.category)}
                                                `}>
                                                    {getCategoryLabel(event.category)}
                                                </span>
                                                <div className="absolute bottom-2 left-2 bg-accent-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                    ⭐ Interesado
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {event.title}
                                                </h3>
                                                <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                    📅 {new Date(event.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} • {event.time}
                                                </p>
                                                <p className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                    📍 {event.location}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-12 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    <span className="text-5xl block mb-4">⭐</span>
                                    <p className="font-medium">No tienes eventos marcados como interés</p>
                                    <p className="text-sm mt-2">Explora eventos y marca "Me interesa" para guardarlos</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* My Routes */}
                    {activeTab === 'routes' && (
                        <div>
                            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                🧭 Mis Rutas Personalizadas
                            </h2>
                            {userAgenda.createdRoutes.length > 0 ? (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {userAgenda.createdRoutes.map(route => (
                                        <div
                                            key={route.id}
                                            className={`p-4 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}
                                        >
                                            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                {route.name}
                                            </h3>
                                            <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                {route.stops.length} paradas
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-12 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    <span className="text-5xl block mb-4">🧭</span>
                                    <p className="font-medium">No has creado rutas todavía</p>
                                    <p className="text-sm mt-2">Ve a Rutas y crea tu propia ruta personalizada</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* History */}
                    {activeTab === 'history' && (
                        <div>
                            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                📜 Historial de Rutas Completadas
                            </h2>
                            {completedRoutes.length > 0 ? (
                                <div className="space-y-4">
                                    {completedRoutes.map(route => route && (
                                        <div
                                            key={route.id}
                                            className={`flex gap-4 p-4 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}
                                        >
                                            <img
                                                src={route.image}
                                                alt={route.name}
                                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                        {route.name}
                                                    </h3>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                                                        ✅ Completada
                                                    </span>
                                                </div>
                                                <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                    {route.description}
                                                </p>
                                                <div className={`flex gap-4 mt-2 text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                    <span>⏱️ {route.duration}</span>
                                                    <span>📏 {route.distance}</span>
                                                    <span>📍 {route.stops.length} paradas</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-12 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    <span className="text-5xl block mb-4">📜</span>
                                    <p className="font-medium">No has completado rutas todavía</p>
                                    <p className="text-sm mt-2">Explora las rutas disponibles y comienza tu aventura</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MenuPageLayout>
    );
}
