import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import MenuPageLayout from '../components/menu/MenuPageLayout';
import { mockEvents, Event, getCategoryLabel, getCategoryColor } from '../mocks/eventData';

export default function EventosPage() {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [userResponses, setUserResponses] = useState<Record<number, 'attending' | 'interested' | 'notGoing'>>({});

    const categories = ['all', 'cultural', 'religioso', 'gastronomico', 'artistico', 'tradicional'];

    // Filter events based on search and category
    const filteredEvents = mockEvents.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleResponse = (eventId: number, response: 'attending' | 'interested' | 'notGoing') => {
        setUserResponses(prev => ({
            ...prev,
            [eventId]: prev[eventId] === response ? undefined : response
        } as Record<number, 'attending' | 'interested' | 'notGoing'>));
    };

    const getResponseButtonStyle = (eventId: number, type: 'attending' | 'interested' | 'notGoing') => {
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
                                    placeholder="Buscar eventos por nombre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`
                                        w-full px-3 py-3 text-sm bg-transparent outline-none
                                        ${isDark ? 'text-white placeholder-surface-400' : 'text-surface-900 placeholder-surface-500'}
                                    `}
                                />
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

                {/* Results Count */}
                <p className={`mb-4 text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                    Mostrando {filteredEvents.length} de {mockEvents.length} eventos
                </p>

                {/* Events Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                        <article
                            key={event.id}
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
                                    src={event.image}
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
                                        onClick={() => handleResponse(event.id, 'attending')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${getResponseButtonStyle(event.id, 'attending')}`}
                                    >
                                        ✅ Asistiré
                                    </button>
                                    <button
                                        onClick={() => handleResponse(event.id, 'interested')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${getResponseButtonStyle(event.id, 'interested')}`}
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
                        <p className="text-sm">Intenta con otra búsqueda o categoría</p>
                    </div>
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
                                src={selectedEvent.image}
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
                                        {selectedEvent.time} - {selectedEvent.endTime}
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
                                        {selectedEvent.address}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-surface-900'}`}>Descripción</h3>
                                <p className={`${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                                    {selectedEvent.longDescription || selectedEvent.description}
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
                            {selectedEvent.closedStreets && selectedEvent.closedStreets.length > 0 && (
                                <div className="mb-6">
                                    <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-surface-900'}`}>🚧 Vías Cerradas</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEvent.closedStreets.map((street, index) => (
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

                            {/* Testimonials */}
                            {selectedEvent.testimonials && selectedEvent.testimonials.length > 0 && (
                                <div className="mb-6">
                                    <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-surface-900'}`}>💬 Testimonios</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {selectedEvent.testimonials.map((testimonial, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                                                        {testimonial.name.charAt(0)}
                                                    </div>
                                                    <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                        {testimonial.name}
                                                    </span>
                                                    <span className="text-yellow-500">
                                                        {'⭐'.repeat(testimonial.rating)}
                                                    </span>
                                                </div>
                                                <p className={`text-sm italic ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                                                    "{testimonial.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-surface-700/50">
                                <button
                                    onClick={() => handleResponse(selectedEvent.id, 'attending')}
                                    className={`flex-1 sm:flex-none py-3 px-6 rounded-xl font-semibold transition-all ${getResponseButtonStyle(selectedEvent.id, 'attending')}`}
                                >
                                    ✅ Asistiré
                                </button>
                                <button
                                    onClick={() => handleResponse(selectedEvent.id, 'interested')}
                                    className={`flex-1 sm:flex-none py-3 px-6 rounded-xl font-semibold transition-all ${getResponseButtonStyle(selectedEvent.id, 'interested')}`}
                                >
                                    ⭐ Me interesa
                                </button>
                                <button
                                    onClick={() => handleResponse(selectedEvent.id, 'notGoing')}
                                    className={`flex-1 sm:flex-none py-3 px-6 rounded-xl font-semibold transition-all ${getResponseButtonStyle(selectedEvent.id, 'notGoing')}`}
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
