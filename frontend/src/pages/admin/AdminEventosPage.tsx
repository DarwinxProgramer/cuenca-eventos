/**
 * AdminEventosPage - Gestión de eventos
 * Lista, crear, editar y eliminar eventos
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { adminApi, Event } from '../../services/adminApi';

export default function AdminEventosPage() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('');

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await adminApi.events.list();
            setEvents(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar eventos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;

        setDeletingId(id);
        try {
            await adminApi.events.delete(id);
            setEvents(events.filter(e => e._id !== id));
        } catch (err) {
            alert('Error al eliminar evento');
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || event.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-EC', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            cultural: 'bg-primary-500/20 text-primary-500',
            religioso: 'bg-secondary-500/20 text-secondary-500',
            gastronomico: 'bg-accent-500/20 text-accent-500',
            artistico: 'bg-purple-500/20 text-purple-500',
            tradicional: 'bg-orange-500/20 text-orange-500',
        };
        return colors[category] || 'bg-surface-500/20 text-surface-500';
    };

    return (
        <MenuPageLayout title="Gestión de Eventos">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className={`
                    p-6 rounded-2xl mb-6
                    ${isDark
                        ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                        : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                    }
                `}>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                📅 Eventos
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                {events.length} eventos registrados
                            </p>
                        </div>
                        <Link
                            to="/admin/eventos/nuevo"
                            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all duration-300 hover:scale-105"
                        >
                            ➕ Nuevo Evento
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="🔍 Buscar eventos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`
                                    w-full px-4 py-3 rounded-xl transition-all
                                    ${isDark
                                        ? 'bg-surface-700 border-surface-600 text-white placeholder-surface-500'
                                        : 'bg-surface-50 border-surface-200 text-surface-900 placeholder-surface-400'
                                    }
                                    border focus:outline-none focus:ring-2 focus:ring-primary-500
                                `}
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className={`
                                px-4 py-3 rounded-xl transition-all cursor-pointer
                                ${isDark
                                    ? 'bg-surface-700 border-surface-600 text-white'
                                    : 'bg-surface-50 border-surface-200 text-surface-900'
                                }
                                border focus:outline-none focus:ring-2 focus:ring-primary-500
                            `}
                        >
                            <option value="">Todas las categorías</option>
                            <option value="cultural">Cultural</option>
                            <option value="religioso">Religioso</option>
                            <option value="gastronomico">Gastronómico</option>
                            <option value="artistico">Artístico</option>
                            <option value="tradicional">Tradicional</option>
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500">
                        ❌ {error}
                        <button onClick={loadEvents} className="ml-4 underline">Reintentar</button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                )}

                {/* Events List */}
                {!loading && (
                    <div className="space-y-4">
                        {filteredEvents.length === 0 ? (
                            <div className={`
                                p-12 rounded-2xl text-center
                                ${isDark
                                    ? 'bg-surface-800/90 border border-surface-700'
                                    : 'bg-white/90 border border-surface-200 shadow-lg'
                                }
                            `}>
                                <p className="text-4xl mb-4">📭</p>
                                <p className={`${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    {searchTerm || filterCategory ? 'No se encontraron eventos' : 'No hay eventos registrados'}
                                </p>
                            </div>
                        ) : (
                            filteredEvents.map(event => (
                                <div
                                    key={event._id}
                                    className={`
                                        p-4 sm:p-6 rounded-2xl transition-all duration-300 hover:scale-[1.01]
                                        ${isDark
                                            ? 'bg-surface-800/90 border border-surface-700 hover:border-surface-600'
                                            : 'bg-white/90 border border-surface-200 shadow-lg hover:shadow-xl'
                                        }
                                    `}
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Image */}
                                        <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex-shrink-0">
                                            {event.image_url ? (
                                                <img
                                                    src={event.image_url.startsWith('http') ? event.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}${event.image_url.startsWith('/api/v1') ? event.image_url.replace('/api/v1', '') : event.image_url}`}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        if (target.parentElement) {
                                                            target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">📅</div>';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                                    📅
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className={`text-lg font-bold truncate ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                        {event.title}
                                                    </h3>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryBadge(event.category)}`}>
                                                        {event.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                {event.description}
                                            </p>

                                            <div className="flex flex-wrap gap-4 mt-3">
                                                <span className={`text-sm ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                    📅 {formatDate(event.date)}
                                                </span>
                                                <span className={`text-sm ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                    🕐 {event.time}
                                                </span>
                                                <span className={`text-sm ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                    📍 {event.location}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex sm:flex-col gap-2 sm:gap-3">
                                            <button
                                                onClick={() => navigate(`/admin/eventos/${event._id}`)}
                                                className={`
                                                    flex-1 sm:flex-none px-4 py-2 rounded-xl font-medium transition-all
                                                    ${isDark
                                                        ? 'bg-surface-700 text-white hover:bg-surface-600'
                                                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                                                    }
                                                `}
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event._id, event.title)}
                                                disabled={deletingId === event._id}
                                                className={`
                                                    flex-1 sm:flex-none px-4 py-2 rounded-xl font-medium transition-all
                                                    ${deletingId === event._id
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-red-500/20 hover:text-red-500'
                                                    }
                                                    ${isDark
                                                        ? 'bg-surface-700 text-surface-300'
                                                        : 'bg-surface-100 text-surface-500'
                                                    }
                                                `}
                                            >
                                                {deletingId === event._id ? '⏳' : '🗑️'} Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Back to Dashboard */}
                <div className="mt-8">
                    <Link
                        to="/admin"
                        className={`
                            inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                            ${isDark
                                ? 'text-surface-400 hover:text-white hover:bg-surface-700'
                                : 'text-surface-500 hover:text-surface-900 hover:bg-surface-100'
                            }
                        `}
                    >
                        ← Volver al Panel
                    </Link>
                </div>
            </div>
        </MenuPageLayout>
    );
}
