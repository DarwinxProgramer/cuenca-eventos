import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { eventsApi, alertsApi, getImageUrl } from '../../services/eventsApi';

// Placeholder image as base64 gradient
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOTczMTY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWE1ODBlO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNDAiPvCfjok8L3RleHQ+PC9zdmc+';

type NewsItem = {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: 'evento' | 'aviso';
    image: string;
};

const getTypeStyles = (type: string, isDark: boolean) => {
    switch (type) {
        case 'evento':
            return isDark
                ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                : 'bg-primary-100 text-primary-600 border-primary-200';
        case 'aviso':
            return isDark
                ? 'bg-accent-500/20 text-accent-400 border-accent-500/30'
                : 'bg-accent-100 text-accent-600 border-accent-200';
        default:
            return isDark
                ? 'bg-surface-700 text-surface-300 border-surface-600'
                : 'bg-surface-100 text-surface-600 border-surface-200';
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'evento': return 'Evento';
        case 'aviso': return '⚠️ Aviso';
        default: return 'Noticia';
    }
};

export default function NewsSection() {
    const { isDark } = useTheme();
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNewsItems();
    }, []);

    const loadNewsItems = async () => {
        setLoading(true);
        try {
            // Get current month's start and end dates
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Load events and alerts in parallel
            const [allEvents, allAlerts] = await Promise.all([
                eventsApi.list(),
                alertsApi.list()
            ]);

            // Filter events for current month
            const monthEvents = allEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= firstDayOfMonth && eventDate <= lastDayOfMonth;
            });

            // Filter active alerts
            const activeAlerts = allAlerts.filter(alert => alert.is_active);

            // Convert to NewsItem format
            const eventItems: NewsItem[] = monthEvents.slice(0, 3).map(event => ({
                id: event._id,
                title: event.title,
                description: event.description,
                date: new Date(event.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }),
                time: event.time || 'Por confirmar',
                location: event.location,
                type: 'evento' as const,
                image: getImageUrl(event.image_url || event.image_id) || PLACEHOLDER_IMAGE
            }));

            const alertItems: NewsItem[] = activeAlerts.slice(0, 1).map(alert => ({
                id: alert._id,
                title: alert.title,
                description: alert.description,
                date: new Date(alert.start_date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' }),
                time: `Hasta ${new Date(alert.end_date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}`,
                location: alert.location,
                type: 'aviso' as const,
                image: PLACEHOLDER_IMAGE // Alerts don't have images
            }));

            // Combine and set news items (max 4 items)
            setNewsItems([...alertItems, ...eventItems].slice(0, 4));
        } catch (err) {
            console.error('Error loading news:', err);
            // Keep empty array if error
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-8 pb-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (newsItems.length === 0) {
        return (
            <section className="py-8 pb-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-8">
                        Noticias y Avisos
                    </h2>
                    <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-surface-800/90 text-surface-400' : 'bg-white/90 text-surface-500'}`}>
                        <span className="text-5xl mb-4 block">📭</span>
                        <p>No hay noticias disponibles este mes</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 pb-16">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className={`
                        text-2xl sm:text-3xl font-bold font-display
                        ${isDark ? 'text-white' : 'text-white'}
                    `}>
                        Noticias y Avisos
                    </h2>
                    <span className={`
                        px-4 py-2 rounded-full text-sm font-medium
                        ${isDark
                            ? 'bg-surface-800/80 text-surface-300 border border-surface-700'
                            : 'bg-white/20 text-white border border-white/30'
                        }
                    `}>
                        {newsItems.length} {newsItems.length === 1 ? 'elemento' : 'elementos'}
                    </span>
                </div>

                {/* News Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {newsItems.map((news, index) => (
                        <article
                            key={news.id}
                            className={`
                                group rounded-2xl overflow-hidden transition-all duration-300
                                hover:scale-[1.02] hover:-translate-y-2 cursor-pointer
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700 hover:border-primary-500/50'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg hover:shadow-2xl'
                                }
                            `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Image */}
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={news.image}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Type Badge */}
                                <span className={`
                                    absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm
                                    ${getTypeStyles(news.type, isDark)}
                                `}>
                                    {getTypeLabel(news.type)}
                                </span>

                                {/* Location on image */}
                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-medium">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {news.location}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {/* Title */}
                                <h3 className={`
                                    text-base font-bold mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors
                                    ${isDark ? 'text-white' : 'text-surface-900'}
                                `}>
                                    {news.title}
                                </h3>

                                {/* Description */}
                                <p className={`
                                    text-sm leading-relaxed mb-4 line-clamp-3
                                    ${isDark ? 'text-surface-400' : 'text-surface-600'}
                                `}>
                                    {news.description}
                                </p>

                                {/* Footer with date and time */}
                                <div className={`
                                    flex items-center justify-between text-xs font-medium pt-3 border-t
                                    ${isDark ? 'border-surface-700 text-surface-500' : 'border-surface-200 text-surface-400'}
                                `}>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {news.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {news.time}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
