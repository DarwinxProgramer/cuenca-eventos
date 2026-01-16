import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { EventFromAPI, getImageUrl } from '../../services/eventsApi';
import { agendaApi } from '../../services/agendaApi';
import { useEvents } from '../../hooks/useEvents';

// Helper functions for categories
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

export default function EventosPage() {
    const { isDark } = useTheme();
    const { currentUser } = useAuth();
    const [events, setEvents] = useState<EventFromAPI[]>([]);
    // const [loading, setLoading] = useState(true); // Replaced by hook
    // const [error, setError] = useState<string | null>(null); // Replaced by hook
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedEvent, setSelectedEvent] = useState<EventFromAPI | null>(null);
    const [userResponses, setUserResponses] = useState<Record<string, 'attending' | 'interested' | 'notGoing'>>({});

    const categories = ['all', 'cultural', 'religioso', 'gastronomico', 'artistico', 'tradicional'];

    // Load events using TanStack Query
    const {
        data: eventsData,
        isLoading: loading,
        error: errorQuery
    } = useEvents({ category: selectedCategory !== 'all' ? selectedCategory : undefined });

    // Handle events state
    useEffect(() => {
        if (eventsData) {
            // Sort by date ascending (although backend should do this ideally)
            const sorted = [...eventsData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setEvents(sorted);
        }
    }, [eventsData]);

    const error = errorQuery ? 'Error al cargar eventos. Verifica la conexión con el servidor.' : null;

    useEffect(() => {
        if (currentUser) {
            loadUserAgenda();
        }
    }, [currentUser]);

    const loadUserAgenda = async () => {
        try {
            const agenda = await agendaApi.get();
            // Convert agenda to userResponses format
            const responses: Record<string, 'attending' | 'interested' | 'notGoing'> = {};
            agenda.attending.forEach(eventId => {
                responses[eventId] = 'attending';
            });
            agenda.interested.forEach(eventId => {
                responses[eventId] = 'interested';
            });
            agenda.not_going.forEach(eventId => {
                responses[eventId] = 'notGoing';
            });
            setUserResponses(responses);
        } catch (err) {
            console.error('Error loading agenda:', err);
            // No mostrar error al usuario, solo continuar sin agenda
        }
    };

    // Filter events by search and date
    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = !selectedDate || event.date.split('T')[0] === selectedDate;
        return matchesSearch && matchesDate;
    });

    const handleResponse = async (eventId: string, response: 'attending' | 'interested' | 'notGoing') => {
        if (!currentUser) {
            alert('Debes iniciar sesión para guardar eventos en tu agenda');
            return;
        }

        try {
            // Si ya está marcado con la misma opción, quitar de la agenda
            if (userResponses[eventId] === response) {
                await agendaApi.removeFromAgenda(eventId);
                setUserResponses(prev => {
                    const newResponses = { ...prev };
                    delete newResponses[eventId];
                    return newResponses;
                });
            } else {
                // Marcar con la nueva respuesta
                if (response === 'attending') {
                    await agendaApi.markAttending(eventId);
                } else if (response === 'interested') {
                    await agendaApi.markInterested(eventId);
                } else {
                    await agendaApi.markNotGoing(eventId);
                }
                setUserResponses(prev => ({
                    ...prev,
                    [eventId]: response
                }));
            }
        } catch (err) {
            console.error('Error updating agenda:', err);
            alert('Error al actualizar tu agenda. Intenta de nuevo.');
        }
    };

    const getResponseButtonStyle = (eventId: string, type: 'attending' | 'interested' | 'notGoing') => {
        const isSelected = userResponses[eventId] === type;
        if (type === 'attending') {
            return isSelected
                ? 'bg-green-500 text-white border-green-500'
                : isDark ? 'bg-surface-700 text-surface-300 border-surface-600 hover:bg-green-500/20 hover:border-green-500' : 'bg-surface-100 text-surface-600 border-surface-200 hover:bg-green-50 hover:border-green-500';
        }
        if (type === 'interested') {
            return isSelected
                ? 'bg-accent-500 text-white border-accent-500'
                : isDark ? 'bg-surface-700 text-surface-300 border-surface-600 hover:bg-accent-500/20 hover:border-accent-500' : 'bg-surface-100 text-surface-600 border-surface-200 hover:bg-accent-50 hover:border-accent-500';
        }
        return isSelected
            ? 'bg-secondary-500 text-white border-secondary-500'
            : isDark ? 'bg-surface-700 text-surface-300 border-surface-600 hover:bg-secondary-500/20 hover:border-secondary-500' : 'bg-surface-100 text-surface-600 border-surface-200 hover:bg-secondary-50 hover:border-secondary-500';
    };

    const getEventImage = (event: EventFromAPI): string => {
        const imageUrl = getImageUrl(event.image_url || event.image_id);
        return imageUrl || PLACEHOLDER_IMAGE;
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedDate('');
    };

    return (
        <MenuPageLayout title="Eventos">
            <div className="container mx-auto px-4">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-2">
                        🎉 Eventos
                    </h1>
                    <p className="text-surface-300">
                        Descubre todos los eventos de Cuenca
                    </p>
                </div>

                {/* Search and Filters */}
                <div className={`
                    p-4 rounded-2xl mb-6
                    ${isDark
                        ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                        : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                    }
                `}>
                    <div className="flex flex-col gap-4">
                        {/* Search and Date Filter Row */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className={`
                                    relative flex items-center rounded-xl overflow-hidden
                                    ${isDark ? 'bg-surface-700' : 'bg-surface-100'}
                                `}>
                                    <span className="pl-4 text-lg">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar eventos por nombre o lugar..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`
                                            w-full px-3 py-3 text-sm bg-transparent outline-none
                                            ${isDark ? 'text-white placeholder-surface-400' : 'text-surface-900 placeholder-surface-500'}
                                        `}
                                    />
                                </div>
                            </div>

                            {/* Date Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📅</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className={`
                                        px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500
                                        ${isDark
                                            ? 'bg-surface-700 text-white border-surface-600'
                                            : 'bg-surface-100 text-surface-900 border-surface-200'
                                        }
                                    `}
                                />
                                {(searchQuery || selectedDate || selectedCategory !== 'all') && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-3 py-2 rounded-lg text-sm text-secondary-500 hover:bg-secondary-500/10"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`
                                        px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                                        ${selectedCategory === cat
                                            ? 'bg-primary-500 text-white'
                                            : isDark
                                                ? 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                                                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                                        }
                                    `}
                                >
                                    {cat === 'all' ? 'Todos' : getCategoryLabel(cat)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500">
                        ❌ {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Results Count */}
                        <p className={`mb-4 text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                            Mostrando {filteredEvents.length} eventos
                            {selectedDate && ` para ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                        </p>

                        {/* Events Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map(event => (
                                <article
                                    key={event._id}
                                    className={`
                                        group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer
                                        ${isDark
                                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700 hover:border-primary-500/50'
                                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg hover:shadow-xl'
                                        }
                                    `}
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={getEventImage(event)}
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                        <span className={`
                                            absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white
                                            bg-gradient-to-r ${getCategoryColor(event.category)}
                                        `}>
                                            {getCategoryLabel(event.category)}
                                        </span>
                                        <div className="absolute bottom-3 left-3 text-white">
                                            <p className="text-xs opacity-80">
                                                📅 {new Date(event.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className={`font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary-500 transition-colors ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                            {event.title}
                                        </h3>
                                        <p className={`text-sm line-clamp-2 mb-3 ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                                            {event.description}
                                        </p>
                                        <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                            <span>📍 {event.location}</span>
                                            <span>•</span>
                                            <span>🕐 {event.time}</span>
                                        </div>

                                        {/* Quick Response Buttons */}
                                        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleResponse(event._id, 'attending')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${getResponseButtonStyle(event._id, 'attending')}`}
                                            >
                                                ✅ Asistiré
                                            </button>
                                            <button
                                                onClick={() => handleResponse(event._id, 'interested')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${getResponseButtonStyle(event._id, 'interested')}`}
                                            >
                                                ⭐ Interesa
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* No Results */}
                        {filteredEvents.length === 0 && (
                            <div className={`text-center py-16 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                <span className="text-6xl block mb-4">🔍</span>
                                <p className="text-xl font-semibold mb-2">No se encontraron eventos</p>
                                <p className="text-sm mb-4">Intenta con otra búsqueda, fecha o categoría</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
                                >
                                    Ver todos los eventos
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className={`
                            w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl
                            ${isDark ? 'bg-surface-800' : 'bg-white'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header Image */}
                        <div className="relative h-64 overflow-hidden">
                            <img
                                src={getEventImage(selectedEvent)}
                                alt={selectedEvent.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                ✕
                            </button>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-gradient-to-r ${getCategoryColor(selectedEvent.category)}`}>
                                    {getCategoryLabel(selectedEvent.category)}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-bold">{selectedEvent.title}</h2>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Info Grid */}
                            <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Fecha</p>
                                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        {new Date(selectedEvent.date).toLocaleDateString('es-EC', { dateStyle: 'long' })}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Horario</p>
                                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        {selectedEvent.time}{selectedEvent.end_time ? ` - ${selectedEvent.end_time}` : ''}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Ubicación</p>
                                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        {selectedEvent.location}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Dirección</p>
                                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        {selectedEvent.address || selectedEvent.location}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-surface-900'}`}>Descripción</h3>
                                <p className={`${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                                    {selectedEvent.long_description || selectedEvent.description}
                                </p>
                            </div>

                            {/* Itinerary */}
                            {selectedEvent.itinerary && selectedEvent.itinerary.length > 0 && (
                                <div className="mb-6">
                                    <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-surface-900'}`}>📋 Itinerario</h3>
                                    <div className="space-y-2">
                                        {selectedEvent.itinerary.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`flex gap-4 p-3 rounded-lg ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}
                                            >
                                                <span className="text-primary-500 font-bold">{item.time}</span>
                                                <span className={isDark ? 'text-surface-300' : 'text-surface-600'}>{item.activity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Closed Streets */}
                            {selectedEvent.closed_streets && selectedEvent.closed_streets.length > 0 && (
                                <div className="mb-6">
                                    <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-surface-900'}`}>🚧 Vías Cerradas</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEvent.closed_streets.map((street, index) => (
                                            <span
                                                key={index}
                                                className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-secondary-500/20 text-secondary-400' : 'bg-secondary-100 text-secondary-600'}`}
                                            >
                                                {street}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-surface-700/50">
                                <button
                                    onClick={() => handleResponse(selectedEvent._id, 'attending')}
                                    className={`flex-1 sm:flex-none py-3 px-6 rounded-xl font-semibold transition-all ${getResponseButtonStyle(selectedEvent._id, 'attending')}`}
                                >
                                    ✅ Asistiré
                                </button>
                                <button
                                    onClick={() => handleResponse(selectedEvent._id, 'interested')}
                                    className={`flex-1 sm:flex-none py-3 px-6 rounded-xl font-semibold transition-all ${getResponseButtonStyle(selectedEvent._id, 'interested')}`}
                                >
                                    ⭐ Me interesa
                                </button>
                                <button
                                    onClick={() => handleResponse(selectedEvent._id, 'notGoing')}
                                    className={`flex-1 sm:flex-none py-3 px-6 rounded-xl font-semibold transition-all ${getResponseButtonStyle(selectedEvent._id, 'notGoing')}`}
                                >
                                    ❌ No voy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MenuPageLayout>
    );
}
