import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { eventsApi, EventFromAPI, getImageUrl } from '../../services/eventsApi';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

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

export default function CalendarioPage() {
    const { isDark } = useTheme();
    const [events, setEvents] = useState<EventFromAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Value>(new Date());
    const [activeMonth, setActiveMonth] = useState(new Date());

    // Load all events
    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await eventsApi.list();
            setEvents(data);
        } catch (err) {
            console.error('Error loading events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (value: Value) => {
        setSelectedDate(value);
    };

    const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
        if (activeStartDate) {
            setActiveMonth(activeStartDate);
        }
    };

    // Get events for the selected date
    const selectedDateStr = selectedDate instanceof Date
        ? selectedDate.toISOString().split('T')[0]
        : '';

    const eventsOnSelectedDate = events.filter(event => event.date.split('T')[0] === selectedDateStr);

    // Get events for the active month
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === activeMonth.getFullYear() &&
            eventDate.getMonth() === activeMonth.getMonth();
    });

    // Get upcoming events (next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingEvents = events
        .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= thirtyDaysFromNow;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Helper to check if a date has events
    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dateStr = date.toISOString().split('T')[0];
            const hasEvents = events.some(event => event.date.split('T')[0] === dateStr);
            if (hasEvents) {
                return (
                    <div className="flex justify-center mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    </div>
                );
            }
        }
        return null;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-EC', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getEventImage = (event: EventFromAPI): string => {
        return getImageUrl(event.image_url || event.image_id) || PLACEHOLDER_IMAGE;
    };

    return (
        <MenuPageLayout title="Calendario">
            <div className="container mx-auto px-4">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-2">
                        📅 Calendario de Eventos
                    </h1>
                    <p className="text-surface-300">
                        Explora los eventos de Cuenca por fecha
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Calendar Section */}
                            <div className={`
                                lg:col-span-1 p-6 rounded-2xl
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                                }
                            `}>
                                <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    Selecciona una fecha
                                </h2>
                                <div className={`calendar-wrapper ${isDark ? 'dark-calendar' : 'light-calendar'}`}>
                                    <Calendar
                                        onChange={handleDateChange}
                                        value={selectedDate}
                                        onActiveStartDateChange={handleActiveStartDateChange}
                                        tileContent={tileContent}
                                        locale="es-EC"
                                        className={`
                                            w-full rounded-xl border-0
                                            ${isDark ? 'bg-surface-800 text-white' : 'bg-white text-surface-900'}
                                        `}
                                    />
                                </div>

                                {/* Legend */}
                                <div className={`mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                                    <span>Días con eventos</span>
                                </div>
                            </div>

                            {/* Selected Date Events */}
                            <div className={`
                                lg:col-span-2 p-6 rounded-2xl
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                                }
                            `}>
                                <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    {selectedDate instanceof Date
                                        ? `Eventos del ${formatDate(selectedDateStr)}`
                                        : 'Selecciona una fecha'
                                    }
                                </h2>

                                {eventsOnSelectedDate.length > 0 ? (
                                    <div className="space-y-4">
                                        {eventsOnSelectedDate.map(event => (
                                            <div
                                                key={event._id}
                                                className={`
                                                    flex gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer
                                                    ${isDark
                                                        ? 'bg-surface-700/50 hover:bg-surface-700'
                                                        : 'bg-surface-50 hover:bg-surface-100'
                                                    }
                                                `}
                                            >
                                                <img
                                                    src={getEventImage(event)}
                                                    alt={event.title}
                                                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                            {event.title}
                                                        </h3>
                                                        <span className={`
                                                            px-2 py-1 rounded-full text-xs font-medium text-white
                                                            bg-gradient-to-r ${getCategoryColor(event.category)}
                                                        `}>
                                                            {getCategoryLabel(event.category)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm mb-2 line-clamp-2 ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                                                        {event.description}
                                                    </p>
                                                    <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-surface-500' : 'text-surface-500'}`}>
                                                        <span className="flex items-center gap-1">
                                                            🕐 {event.time}{event.end_time ? ` - ${event.end_time}` : ''}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            📍 {event.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-center py-12 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                        <span className="text-5xl mb-4 block">📭</span>
                                        <p>No hay eventos programados para esta fecha</p>
                                        <p className="text-sm mt-2">Selecciona otra fecha o explora los eventos del mes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Monthly Events Gallery */}
                        <div className={`
                            mt-8 p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                🗓️ Eventos de {activeMonth.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })}
                            </h2>

                            {monthEvents.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {monthEvents.map(event => (
                                        <div
                                            key={event._id}
                                            className={`
                                                group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer
                                                ${isDark
                                                    ? 'bg-surface-700/50 hover:bg-surface-700'
                                                    : 'bg-surface-50 hover:bg-surface-100'
                                                }
                                            `}
                                        >
                                            <div className="relative h-32 overflow-hidden">
                                                <img
                                                    src={getEventImage(event)}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                                                    }}
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
                                                <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {event.title}
                                                </h3>
                                                <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                    {new Date(event.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} • {event.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-8 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    No hay eventos programados para este mes
                                </p>
                            )}
                        </div>

                        {/* Upcoming Events */}
                        <div className={`
                            mt-8 p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                🚀 Próximos Eventos
                            </h2>

                            {upcomingEvents.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {upcomingEvents.slice(0, 6).map(event => (
                                        <div
                                            key={event._id}
                                            className={`
                                                flex gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer
                                                ${isDark
                                                    ? 'bg-surface-700/50 hover:bg-surface-700'
                                                    : 'bg-surface-50 hover:bg-surface-100'
                                                }
                                            `}
                                        >
                                            <img
                                                src={getEventImage(event)}
                                                alt={event.title}
                                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-semibold text-sm line-clamp-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {event.title}
                                                </h3>
                                                <p className={`text-xs mt-1 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                    {new Date(event.date).toLocaleDateString('es-EC', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className={`text-xs ${isDark ? 'text-primary-400' : 'text-primary-500'}`}>
                                                    {event.location}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-center py-8 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    No hay eventos próximos en los siguientes 30 días
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Calendar Styles */}
            <style>{`
                .react-calendar {
                    width: 100%;
                    border: none;
                    font-family: inherit;
                    line-height: 1.5;
                }
                .react-calendar__navigation {
                    display: flex;
                    margin-bottom: 1rem;
                }
                .react-calendar__navigation button {
                    min-width: 44px;
                    background: none;
                    font-size: 1rem;
                    font-weight: 600;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s;
                }
                .dark-calendar .react-calendar__navigation button {
                    color: white;
                }
                .dark-calendar .react-calendar__navigation button:hover {
                    background: rgba(255,255,255,0.1);
                }
                .light-calendar .react-calendar__navigation button:hover {
                    background: rgba(0,0,0,0.05);
                }
                .react-calendar__month-view__weekdays {
                    text-transform: uppercase;
                    font-weight: 600;
                    font-size: 0.75rem;
                }
                .dark-calendar .react-calendar__month-view__weekdays {
                    color: #94a3b8;
                }
                .light-calendar .react-calendar__month-view__weekdays {
                    color: #64748b;
                }
                .react-calendar__month-view__weekdays__weekday {
                    padding: 0.5rem;
                    text-align: center;
                }
                .react-calendar__month-view__weekdays__weekday abbr {
                    text-decoration: none;
                }
                .react-calendar__tile {
                    padding: 0.75rem 0.5rem;
                    text-align: center;
                    border-radius: 0.5rem;
                    transition: all 0.2s;
                }
                .dark-calendar .react-calendar__tile {
                    color: white;
                }
                .dark-calendar .react-calendar__tile:hover {
                    background: rgba(249, 115, 22, 0.2);
                }
                .light-calendar .react-calendar__tile:hover {
                    background: rgba(249, 115, 22, 0.1);
                }
                .react-calendar__tile--now {
                    background: rgba(249, 115, 22, 0.2) !important;
                    font-weight: 700;
                }
                .react-calendar__tile--active {
                    background: #f97316 !important;
                    color: white !important;
                    font-weight: 700;
                }
                .react-calendar__tile--active:hover {
                    background: #ea580c !important;
                }
                .dark-calendar .react-calendar__month-view__days__day--neighboringMonth {
                    color: #475569;
                }
                .light-calendar .react-calendar__month-view__days__day--neighboringMonth {
                    color: #cbd5e1;
                }
            `}</style>
        </MenuPageLayout>
    );
}
