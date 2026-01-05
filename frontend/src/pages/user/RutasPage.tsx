import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { routesApi, eventsApi, RouteFromAPI, EventFromAPI, getImageUrl } from '../../services/eventsApi';

// Helper functions
const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'facil': return 'text-green-500 bg-green-500/20';
        case 'moderada': return 'text-accent-500 bg-accent-500/20';
        case 'dificil': return 'text-secondary-500 bg-secondary-500/20';
        default: return 'text-surface-500 bg-surface-500/20';
    }
};
const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
        cultural: 'Cultural',
        religioso: 'Religioso',
        gastronomico: 'Gastronómico',
        gastronomica: 'Gastronómico',
        artistico: 'Artístico',
        tradicional: 'Tradicional',
        religiosa: 'Religioso',
        aventura: 'Aventura',
    };
    return labels[category] || category;
};



// Placeholder image as base64 gradient
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOTczMTY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWE1ODBlO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNDAiPvCfjok8L3RleHQ+PC9zdmc+';

export default function RutasPage() {
    const { isDark } = useTheme();
    const [routes, setRoutes] = useState<RouteFromAPI[]>([]);
    const [events, setEvents] = useState<EventFromAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<RouteFromAPI | null>(null);
    const [isCreatingRoute, setIsCreatingRoute] = useState(false);
    const [newRouteEvents, setNewRouteEvents] = useState<string[]>([]);
    const [newRouteName, setNewRouteName] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [routesData, eventsData] = await Promise.all([
                routesApi.list(),
                eventsApi.list()
            ]);
            setRoutes(routesData);
            setEvents(eventsData);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };



    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'facil': return '🟢 Fácil';
            case 'moderada': return '🟡 Moderada';
            case 'dificil': return '🔴 Difícil';
            default: return difficulty;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'gastronomica':
            case 'gastronomico': return '🍽️';
            case 'cultural': return '🎭';
            case 'religiosa':
            case 'religioso': return '⛪';
            case 'aventura': return '🥾';
            default: return '📍';
        }
    };

    const getRouteImage = (route: RouteFromAPI): string => {
        const imageUrl = getImageUrl(route.image_url || route.image_id);
        return imageUrl || PLACEHOLDER_IMAGE;
    };

    const toggleEventInNewRoute = (eventId: string) => {
        setNewRouteEvents(prev =>
            prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        );
    };

    const handleCreateRoute = () => {
        if (newRouteEvents.length > 0 && newRouteName.trim()) {
            alert(`¡Ruta "${newRouteName}" creada con ${newRouteEvents.length} eventos! (Próximamente guardará en el backend)`);
            setIsCreatingRoute(false);
            setNewRouteEvents([]);
            setNewRouteName('');
        }
    };

    const getEventImage = (event: EventFromAPI): string => {
        const imageUrl = getImageUrl(event.image_url || event.image_id);
        return imageUrl || PLACEHOLDER_IMAGE;
    };

    return (
        <MenuPageLayout title="Rutas">
            <div className="container mx-auto px-4">
                {/* Page Title */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-2">
                            🧭 Rutas Turísticas
                        </h1>
                        <p className="text-surface-300">
                            Explora Cuenca con rutas temáticas
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreatingRoute(true)}
                        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all duration-300 hover:scale-105"
                    >
                        ➕ Crear Ruta
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : routes.length === 0 ? (
                    <div className={`text-center py-16 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                        <span className="text-6xl block mb-4">🧭</span>
                        <p className="text-xl font-semibold mb-2">No hay rutas disponibles</p>
                        <p className="text-sm">Las rutas se crearán próximamente</p>
                    </div>
                ) : (
                    /* Routes Grid */
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {routes.map(route => (
                            <article
                                key={route._id}
                                onClick={() => setSelectedRoute(route)}
                                className={`
                                    group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer
                                    ${isDark
                                        ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700 hover:border-primary-500/50'
                                        : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg hover:shadow-xl'
                                    }
                                `}
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={getRouteImage(route)}
                                        alt={route.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white">
                                            {getCategoryIcon(route.category)} {getCategoryLabel(route.category)}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 right-3 text-white">
                                        <h3 className="font-bold text-lg">{route.name}</h3>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <p className={`text-sm line-clamp-2 mb-4 ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                                        {route.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-surface-500' : 'text-surface-500'}`}>
                                            <span>⏱️ {route.duration}</span>
                                            <span>📏 {route.distance}</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(route.difficulty)}`}>
                                            {getDifficultyLabel(route.difficulty)}
                                        </span>
                                    </div>

                                    <div className={`mt-4 pt-4 border-t ${isDark ? 'border-surface-700' : 'border-surface-200'}`}>
                                        <p className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                            {route.stops?.length || 0} paradas
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Route Detail Modal */}
            {selectedRoute && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedRoute(null)}
                >
                    <div
                        className={`
                            w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl
                            ${isDark ? 'bg-surface-800' : 'bg-white'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header Image */}
                        <div className="relative h-56 overflow-hidden">
                            <img
                                src={getRouteImage(selectedRoute)}
                                alt={selectedRoute.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <button
                                onClick={() => setSelectedRoute(null)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                ✕
                            </button>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm mb-2">
                                    {getCategoryIcon(selectedRoute.category)} {getCategoryLabel(selectedRoute.category)}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-bold">{selectedRoute.name}</h2>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Info Grid */}
                            <div className={`grid sm:grid-cols-4 gap-4 mb-6 p-4 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                <div className="text-center">
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>{selectedRoute.duration}</p>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Duración</p>
                                </div>
                                <div className="text-center">
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>{selectedRoute.distance}</p>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Distancia</p>
                                </div>
                                <div className="text-center">
                                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>{selectedRoute.stops?.length || 0}</p>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Paradas</p>
                                </div>
                                <div className="text-center">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedRoute.difficulty)}`}>
                                        {getDifficultyLabel(selectedRoute.difficulty)}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-surface-900'}`}>Descripción</h3>
                                <p className={`${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                                    {selectedRoute.description}
                                </p>
                            </div>

                            {/* Route Stops */}
                            {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                                <div className="mb-6">
                                    <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>📍 Paradas de la Ruta</h3>
                                    <div className="relative">
                                        {/* Connection Line */}
                                        <div className={`absolute left-4 top-6 bottom-6 w-0.5 ${isDark ? 'bg-surface-700' : 'bg-surface-200'}`} />

                                        {selectedRoute.stops.map((stop, index) => (
                                            <div key={index} className="flex items-center gap-4 mb-4 relative">
                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center z-10 font-bold text-sm
                                                    ${index === 0
                                                        ? 'bg-green-500 text-white'
                                                        : index === selectedRoute.stops!.length - 1
                                                            ? 'bg-secondary-500 text-white'
                                                            : isDark ? 'bg-surface-700 text-white' : 'bg-surface-200 text-surface-700'
                                                    }
                                                `}>
                                                    {index + 1}
                                                </div>
                                                <div className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                        {stop.name}
                                                    </p>
                                                    <p className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                        📍 {stop.coordinates.lat.toFixed(4)}, {stop.coordinates.lng.toFixed(4)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Map Preview */}
                            {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                                <div className="mb-6">
                                    <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>🗺️ Mapa de la Ruta</h3>
                                    <div className={`rounded-xl overflow-hidden h-48 ${isDark ? 'border border-surface-700' : 'border border-surface-200'}`}>
                                        <iframe
                                            title="Mapa de Ruta"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=-79.02,-2.92,-78.99,-2.88&layer=mapnik&marker=${selectedRoute.stops[0].coordinates.lat},${selectedRoute.stops[0].coordinates.lng}`}
                                            className="w-full h-full"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <button className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all duration-300">
                                🚀 Iniciar esta Ruta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Route Modal */}
            {isCreatingRoute && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsCreatingRoute(false)}
                >
                    <div
                        className={`
                            w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl
                            ${isDark ? 'bg-surface-800' : 'bg-white'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    ➕ Crear Nueva Ruta
                                </h2>
                                <button
                                    onClick={() => setIsCreatingRoute(false)}
                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-surface-700' : 'hover:bg-surface-100'}`}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Route Name */}
                            <div className="mb-6">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                                    Nombre de la ruta
                                </label>
                                <input
                                    type="text"
                                    value={newRouteName}
                                    onChange={(e) => setNewRouteName(e.target.value)}
                                    placeholder="Ej: Mi Ruta Cultural"
                                    className={`
                                        w-full px-4 py-3 rounded-xl transition-all
                                        ${isDark
                                            ? 'bg-surface-700 border-surface-600 text-white placeholder-surface-400'
                                            : 'bg-surface-50 border-surface-200 text-surface-900 placeholder-surface-400'
                                        }
                                        border focus:outline-none focus:ring-2 focus:ring-primary-500
                                    `}
                                />
                            </div>

                            {/* Select Events */}
                            <div className="mb-6">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                                    Selecciona los eventos ({newRouteEvents.length} seleccionados)
                                </label>
                                <div className="grid gap-3 max-h-80 overflow-y-auto">
                                    {events.map(event => (
                                        <button
                                            key={event._id}
                                            onClick={() => toggleEventInNewRoute(event._id)}
                                            className={`
                                                flex gap-3 p-3 rounded-xl text-left transition-all
                                                ${newRouteEvents.includes(event._id)
                                                    ? 'ring-2 ring-primary-500 bg-primary-500/10'
                                                    : isDark ? 'bg-surface-700/50 hover:bg-surface-700' : 'bg-surface-50 hover:bg-surface-100'
                                                }
                                            `}
                                        >
                                            <img
                                                src={getEventImage(event)}
                                                alt={event.title}
                                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {event.title}
                                                </h4>
                                                <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                    {event.location}
                                                </p>
                                            </div>
                                            <div className={`
                                                w-6 h-6 rounded-full flex items-center justify-center
                                                ${newRouteEvents.includes(event._id)
                                                    ? 'bg-primary-500 text-white'
                                                    : isDark ? 'bg-surface-600' : 'bg-surface-200'
                                                }
                                            `}>
                                                {newRouteEvents.includes(event._id) && '✓'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={handleCreateRoute}
                                disabled={newRouteEvents.length === 0 || !newRouteName.trim()}
                                className={`
                                    w-full py-3 rounded-xl font-semibold transition-all duration-300
                                    ${newRouteEvents.length > 0 && newRouteName.trim()
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                                        : 'bg-surface-600 text-surface-400 cursor-not-allowed'
                                    }
                                `}
                            >
                                Crear Ruta ({newRouteEvents.length} eventos)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MenuPageLayout>
    );
}
