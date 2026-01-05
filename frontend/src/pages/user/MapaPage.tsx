import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { eventsApi, alertsApi, EventFromAPI, AlertFromAPI, getImageUrl } from '../../services/eventsApi';

// Helper functions
const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
        cultural: 'Cultural',
        religioso: 'Religioso',
        gastronomico: 'Gastronómico',
        artistico: 'Artístico',
        tradicional: 'Tradicional',
    };
    return labels[category] || category;
};

const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        cultural: 'from-primary-500 to-primary-600',
        religioso: 'from-secondary-500 to-secondary-600',
        gastronomico: 'from-accent-500 to-accent-600',
        artistico: 'from-purple-500 to-purple-600',
        tradicional: 'from-orange-500 to-orange-600',
    };
    return colors[category] || 'from-surface-500 to-surface-600';
};

// Placeholder image as base64 gradient
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOTczMTY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWE1ODBlO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNDAiPvCfjok8L3RleHQ+PC9zdmc+';

// Centro de Cuenca
const CUENCA_CENTER = { lat: -2.9001, lng: -79.0059 };

export default function MapaPage() {
    const { isDark } = useTheme();
    const [events, setEvents] = useState<EventFromAPI[]>([]);
    const [alerts, setAlerts] = useState<AlertFromAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [eventsData, alertsData] = await Promise.all([
                eventsApi.list(),
                alertsApi.list()
            ]);
            // Sort events by date
            const sortedEvents = eventsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setEvents(sortedEvents);
            setAlerts(alertsData);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter events and alerts by selected date
    const filteredEvents = useMemo(() => {
        if (!selectedDate) return events;
        return events.filter(event => event.date.split('T')[0] === selectedDate);
    }, [events, selectedDate]);

    const filteredAlerts = useMemo(() => {
        if (!selectedDate) return alerts;
        return alerts.filter(alert => {
            const alertStart = new Date(alert.start_date);
            const alertEnd = new Date(alert.end_date);
            const selectedDateObj = new Date(selectedDate);
            return selectedDateObj >= alertStart && selectedDateObj <= alertEnd;
        });
    }, [alerts, selectedDate]);

    // Get marker coordinates - selected event, first filtered event, or center of Cuenca
    const markerCoords = useMemo(() => {
        // Si hay un evento seleccionado, mostramos ese
        if (selectedItem && selectedItem.startsWith('event-')) {
            const eventId = selectedItem.replace('event-', '');
            const event = events.find(e => e._id === eventId);
            if (event && event.coordinates) {
                return event.coordinates;
            }
        }

        // Si no, mostramos el primero de la lista filtrada
        if (filteredEvents.length > 0 && filteredEvents[0].coordinates) {
            return filteredEvents[0].coordinates;
        }
        return CUENCA_CENTER;
    }, [filteredEvents, selectedItem, events]);

    // Build OpenStreetMap embed URL with marker
    const mapUrl = useMemo(() => {
        const { lat, lng } = markerCoords;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015},${lat - 0.015},${lng + 0.015},${lat + 0.015}&layer=mapnik&marker=${lat},${lng}`;
    }, [markerCoords]);

    const getAlertTypeStyles = (type: string) => {
        switch (type) {
            case 'cierre':
                return 'bg-secondary-500/20 text-secondary-500 border-secondary-500/30';
            case 'desvio':
                return 'bg-accent-500/20 text-accent-500 border-accent-500/30';
            case 'congestion':
                return 'bg-primary-500/20 text-primary-500 border-primary-500/30';
            default:
                return 'bg-surface-500/20 text-surface-500 border-surface-500/30';
        }
    };

    const getAlertTypeLabel = (type: string) => {
        switch (type) {
            case 'cierre': return '🚫 Cierre';
            case 'desvio': return '↪️ Desvío';
            case 'congestion': return '🚗 Congestión';
            default: return 'Aviso';
        }
    };

    const getEventImage = (event: EventFromAPI): string => {
        const imageUrl = getImageUrl(event.image_url || event.image_id);
        return imageUrl || PLACEHOLDER_IMAGE;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-EC', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <MenuPageLayout title="Mapa">
            <div className="container mx-auto px-4">
                {/* Page Title */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-2">
                        🗺️ Mapa de Eventos
                    </h1>
                    <p className="text-surface-300">
                        Busca eventos por fecha y visualízalos en el mapa de Cuenca
                    </p>
                </div>

                {/* Date Search */}
                <div className={`
                    p-4 rounded-2xl mb-6
                    ${isDark
                        ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                        : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                    }
                `}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📅</span>
                            <div>
                                <label className={`text-sm font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    Buscar por fecha
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedItem(null);
                                    }}
                                    className={`
                                        block mt-1 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500
                                        ${isDark
                                            ? 'bg-surface-700 text-white border-surface-600'
                                            : 'bg-surface-100 text-surface-900 border-surface-200'
                                        }
                                    `}
                                />
                            </div>
                        </div>

                        {selectedDate && (
                            <div className={`flex-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                <p className="text-sm font-medium">
                                    {formatDate(selectedDate)}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    {filteredEvents.length} evento(s) • {filteredAlerts.length} aviso(s)
                                </p>
                            </div>
                        )}

                        {selectedDate && (
                            <button
                                onClick={() => {
                                    setSelectedDate('');
                                    setSelectedItem(null);
                                }}
                                className="px-4 py-2 rounded-xl text-sm text-secondary-500 hover:bg-secondary-500/10 transition-colors"
                            >
                                ✕ Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Map Section */}
                        <div className={`
                            lg:col-span-2 rounded-2xl overflow-hidden
                            ${isDark
                                ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                            }
                        `}>
                            <div className="relative h-[500px]">
                                <iframe
                                    key={mapUrl}
                                    title="Mapa de Cuenca"
                                    src={mapUrl}
                                    className="w-full h-full"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                />

                                {/* Map Info Overlay */}
                                <div className={`
                                    absolute bottom-4 left-4 p-3 rounded-xl backdrop-blur-md max-w-xs
                                    ${isDark ? 'bg-surface-900/90' : 'bg-white/90'}
                                `}>
                                    {filteredEvents.length > 0 ? (
                                        <div>
                                            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-primary-400' : 'text-primary-500'}`}>
                                                📍 Evento marcado:
                                            </p>
                                            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                {filteredEvents[0].title}
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                {filteredEvents[0].location}
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className={`text-xs font-semibold ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                📍 Centro de Cuenca
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                {selectedDate ? 'No hay eventos en esta fecha' : 'Selecciona una fecha para ver eventos'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Side Panel - Events and Alerts for the day */}
                        <div className={`
                            lg:col-span-1 rounded-2xl overflow-hidden flex flex-col
                            ${isDark
                                ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                            }
                        `}>
                            <div className={`p-4 border-b ${isDark ? 'border-surface-700' : 'border-surface-200'}`}>
                                <h2 className={`font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    {selectedDate ? `📅 ${formatDate(selectedDate)}` : '📍 Todos los eventos'}
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px]">
                                {/* Events Section */}
                                {filteredEvents.length > 0 && (
                                    <div>
                                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                            🎉 Eventos ({filteredEvents.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {filteredEvents.map(event => (
                                                <button
                                                    key={event._id}
                                                    onClick={() => setSelectedItem(`event-${event._id}`)}
                                                    className={`
                                                        w-full text-left p-3 rounded-xl transition-all duration-300
                                                        ${selectedItem === `event-${event._id}` ? 'ring-2 ring-primary-500' : ''}
                                                        ${isDark ? 'bg-surface-700/50 hover:bg-surface-700' : 'bg-surface-50 hover:bg-surface-100'}
                                                    `}
                                                >
                                                    <div className="flex gap-3">
                                                        <img
                                                            src={getEventImage(event)}
                                                            alt={event.title}
                                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`font-semibold text-sm line-clamp-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                                {event.title}
                                                            </h4>
                                                            <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                                🕐 {event.time} • 📍 {event.location}
                                                            </p>
                                                            <span className={`
                                                                inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white
                                                                bg-gradient-to-r ${getCategoryColor(event.category)}
                                                            `}>
                                                                {getCategoryLabel(event.category)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Alerts Section */}
                                {filteredAlerts.length > 0 && (
                                    <div>
                                        <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                            ⚠️ Avisos Viales ({filteredAlerts.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {filteredAlerts.map(alert => (
                                                <button
                                                    key={alert._id}
                                                    onClick={() => setSelectedItem(`alert-${alert._id}`)}
                                                    className={`
                                                        w-full text-left p-3 rounded-xl transition-all duration-300
                                                        ${selectedItem === `alert-${alert._id}` ? 'ring-2 ring-primary-500' : ''}
                                                        ${isDark ? 'bg-surface-700/50 hover:bg-surface-700' : 'bg-surface-50 hover:bg-surface-100'}
                                                    `}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`
                                                            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border
                                                            ${getAlertTypeStyles(alert.type)}
                                                        `}>
                                                            {alert.type === 'cierre' ? '🚫' : alert.type === 'desvio' ? '↪️' : '🚗'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`font-semibold text-sm line-clamp-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                                {alert.title}
                                                            </h4>
                                                            <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                                📍 {alert.location}
                                                            </p>
                                                            <span className={`
                                                                inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border
                                                                ${getAlertTypeStyles(alert.type)}
                                                            `}>
                                                                {getAlertTypeLabel(alert.type)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No results */}
                                {filteredEvents.length === 0 && filteredAlerts.length === 0 && (
                                    <div className={`text-center py-8 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                        <span className="text-4xl block mb-3">📭</span>
                                        <p className="font-medium">No hay eventos ni avisos</p>
                                        <p className="text-sm">
                                            {selectedDate ? 'para esta fecha' : 'Selecciona una fecha'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Selected Item Detail */}
                {selectedItem && (
                    <div className={`
                        mt-6 p-6 rounded-2xl
                        ${isDark
                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                        }
                    `}>
                        {selectedItem.startsWith('event-') ? (
                            (() => {
                                const event = events.find(e => `event-${e._id}` === selectedItem);
                                if (!event) return null;
                                return (
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <img
                                            src={getEventImage(event)}
                                            alt={event.title}
                                            className="w-full sm:w-48 h-48 rounded-xl object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {event.title}
                                                </h2>
                                                <button
                                                    onClick={() => setSelectedItem(null)}
                                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-surface-700' : 'hover:bg-surface-100'}`}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <p className={`mb-4 ${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                                                {event.description}
                                            </p>
                                            <div className={`grid sm:grid-cols-2 gap-3 text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>{new Date(event.date).toLocaleDateString('es-EC', { dateStyle: 'long' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>🕐</span>
                                                    <span>{event.time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>📍</span>
                                                    <span>{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>🏷️</span>
                                                    <span>{getCategoryLabel(event.category)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            (() => {
                                const alert = alerts.find(a => `alert-${a._id}` === selectedItem);
                                if (!alert) return null;
                                return (
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {alert.title}
                                                </h2>
                                                <button
                                                    onClick={() => setSelectedItem(null)}
                                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-surface-700' : 'hover:bg-surface-100'}`}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <p className={`mb-4 ${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                                                {alert.description}
                                            </p>
                                            <div className={`grid sm:grid-cols-2 gap-3 text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                <div className="flex items-center gap-2">
                                                    <span>📍</span>
                                                    <span>{alert.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>Desde: {new Date(alert.start_date).toLocaleDateString('es-EC')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>Hasta: {new Date(alert.end_date).toLocaleDateString('es-EC')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertTypeStyles(alert.type)}`}>
                                                        {getAlertTypeLabel(alert.type)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        )}
                    </div>
                )}
            </div>
        </MenuPageLayout>
    );
}
