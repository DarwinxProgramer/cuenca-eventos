import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { eventsApi, EventFromAPI, getImageUrl } from '../../services/eventsApi';
import { agendaApi } from '../../services/agendaApi';

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

// Placeholder image 
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOTczMTY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWE1ODBlO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNDAiPvCfjok8L3RleHQ+PC9zdmc+';

export default function MiAgendaPage() {
    const { isDark } = useTheme();
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'attending' | 'interested' | 'upcoming'>('upcoming');
    const [upcomingEvents, setUpcomingEvents] = useState<EventFromAPI[]>([]);
    const [attendingEvents, setAttendingEvents] = useState<EventFromAPI[]>([]);
    const [interestedEvents, setInterestedEvents] = useState<EventFromAPI[]>([]);
    const [loading, setLoading] = useState(true);

    // Load agenda and events from API
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load all events
            const allEvents = await eventsApi.list();

            // Filter upcoming events
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcoming = allEvents
                .filter(event => new Date(event.date) >= today)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setUpcomingEvents(upcoming);

            // Load user's agenda
            if (currentUser) {
                try {
                    const userAgenda = await agendaApi.get();

                    // Filter events for attending and interested
                    const attending = allEvents.filter(event =>
                        userAgenda.attending.includes(event._id) && new Date(event.date) >= today
                    );
                    const interested = allEvents.filter(event =>
                        userAgenda.interested.includes(event._id) && new Date(event.date) >= today
                    );

                    setAttendingEvents(attending);
                    setInterestedEvents(interested);
                } catch (agendaErr) {
                    console.error('Error loading agenda:', agendaErr);
                    // Continue without agenda data
                }
            }
        } catch (err) {
            console.error('Error loading events:', err);
        } finally {
            setLoading(false);
        }
    };

    const getEventImage = (event: EventFromAPI): string => {
        const imageUrl = getImageUrl(event.image_url || event.image_id);
        return imageUrl || PLACEHOLDER_IMAGE;
    };

    const tabs = [
        { id: 'upcoming', label: '📅 Próximos', count: upcomingEvents.length },
        { id: 'attending', label: '✅ Asistiré', count: attendingEvents.length },
        { id: 'interested', label: '⭐ Me interesa', count: interestedEvents.length },
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
                        Hola, {currentUser?.name || 'Usuario'} - Tu actividad personal y eventos guardados
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className={`
                        p-4 rounded-2xl text-center
                        ${isDark
                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                        }
                    `}>
                        <p className="text-3xl font-bold text-primary-500">{upcomingEvents.length}</p>
                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Próximos eventos</p>
                    </div>
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
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <>
                            {/* Upcoming Events */}
                            {activeTab === 'upcoming' && (
                                <div>
                                    <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        📅 Próximos Eventos
                                    </h2>
                                    {upcomingEvents.length > 0 ? (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {upcomingEvents.slice(0, 9).map(event => (
                                                <div
                                                    key={event._id}
                                                    className={`
                                                        group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]
                                                        ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                                    `}
                                                >
                                                    <div className="relative h-32 overflow-hidden">
                                                        <img
                                                            src={getEventImage(event)}
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
                                            <p className="font-medium">No hay eventos próximos</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'attending' && (
                                <div>
                                    <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        ✅ Eventos a los que asistiré
                                    </h2>
                                    {attendingEvents.length > 0 ? (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {attendingEvents.map(event => (
                                                <div
                                                    key={event._id}
                                                    className={`
                                                        group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]
                                                        ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                                    `}
                                                >
                                                    <div className="relative h-32 overflow-hidden">
                                                        <img
                                                            src={getEventImage(event)}
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
                                            <span className="text-5xl block mb-4">💭</span>
                                            <p className="font-medium">No tienes eventos confirmados</p>
                                            <p className="text-sm mt-2">Explora eventos y marca "✅ Asistiré" para agregarlos aquí</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'interested' && (
                                <div>
                                    <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        ⭐ Eventos que me interesan
                                    </h2>
                                    {interestedEvents.length > 0 ? (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {interestedEvents.map(event => (
                                                <div
                                                    key={event._id}
                                                    className={`
                                                        group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]
                                                        ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                                    `}
                                                >
                                                    <div className="relative h-32 overflow-hidden">
                                                        <img
                                                            src={getEventImage(event)}
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
                                            <p className="text-sm mt-2">Explora eventos y marca "⭐ Me interesa" para guardarlos</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MenuPageLayout>
    );
}
