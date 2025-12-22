import { useState } from 'react';
import Calendar from 'react-calendar';
import { useTheme } from '../context/ThemeContext';
import MenuPageLayout from '../components/menu/MenuPageLayout';
import { mockEvents, getEventsByMonth, getCategoryLabel, getCategoryColor } from '../mocks/eventData';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarioPage() {
    const { isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState<Value>(new Date());
    const [activeMonth, setActiveMonth] = useState(new Date());

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

    const eventsOnSelectedDate = mockEvents.filter(event => event.date === selectedDateStr);

    // Get events for the active month
    const monthEvents = getEventsByMonth(activeMonth.getFullYear(), activeMonth.getMonth());

    // Get upcoming events (next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingEvents = mockEvents
        .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= thirtyDaysFromNow;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Helper to check if a date has events
    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dateStr = date.toISOString().split('T')[0];
            const hasEvents = mockEvents.some(event => event.date === dateStr);
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
                                        key={event.id}
                                        className={`
                                            flex gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer
                                            ${isDark
                                                ? 'bg-surface-700/50 hover:bg-surface-700'
                                                : 'bg-surface-50 hover:bg-surface-100'
                                            }
                                        `}
                                    >
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
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
                                                    🕐 {event.time} - {event.endTime}
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
                                    key={event.id}
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

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingEvents.slice(0, 6).map(event => (
                            <div
                                key={event.id}
                                className={`
                                    flex gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer
                                    ${isDark
                                        ? 'bg-surface-700/50 hover:bg-surface-700'
                                        : 'bg-surface-50 hover:bg-surface-100'
                                    }
                                `}
                            >
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
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
                </div>
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
