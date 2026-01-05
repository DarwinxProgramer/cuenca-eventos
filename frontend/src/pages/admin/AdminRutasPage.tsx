/**
 * AdminRutasPage - Gestión de rutas turísticas
 * Lista, crear, editar y eliminar rutas
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { adminApi, Route as TouristRoute, RouteCreate } from '../../services/adminApi';

export default function AdminRutasPage() {
    const { isDark } = useTheme();
    const [routes, setRoutes] = useState<TouristRoute[]>([]);
    const [events, setEvents] = useState<any[]>([]); // Lista de eventos disponibles para agregar a rutas
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState<TouristRoute | null>(null);

    // Estados para formulario
    const [formData, setFormData] = useState<RouteCreate>({
        name: '',
        description: '',
        category: 'cultural',
        duration: '',
        distance: '',
        difficulty: 'facil',
        stops: [],
        events: [] // IDs de eventos seleccionados
    });

    // Estados auxiliares para UI
    const [newStop, setNewStop] = useState({ name: '', lat: -2.9001, lng: -79.0059 });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [routesData, eventsData] = await Promise.all([
                adminApi.routes.list(),
                adminApi.events.list()
            ]);
            setRoutes(routesData);
            setEvents(eventsData);
            setError(null);
        } catch (err) {
            setError('Error al cargar datos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar ruta "${name}"?`)) return;
        setDeletingId(id);
        try {
            await adminApi.routes.delete(id);
            setRoutes(routes.filter(r => r._id !== id));
        } catch (err) {
            alert('Error al eliminar');
        } finally {
            setDeletingId(null);
        }
    };

    const openCreateModal = () => {
        setEditingRoute(null);
        setFormData({
            name: '',
            description: '',
            category: 'cultural',
            duration: '2 horas',
            distance: '2 km',
            difficulty: 'facil',
            stops: [],
            events: []
        });
        setImageFile(null);
        setImagePreview(null);
        setCurrentImageUrl(null);
        setShowModal(true);
    };

    const openEditModal = (route: TouristRoute) => {
        setEditingRoute(route);
        setFormData({
            name: route.name,
            description: route.description,
            category: route.category,
            duration: route.duration,
            distance: route.distance,
            difficulty: route.difficulty,
            stops: route.stops || [],
            events: route.events || []
        });
        setImageFile(null);
        setImagePreview(null);
        setCurrentImageUrl(route.image_url || null);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData };

            // Subir imagen si existe
            if (imageFile) {
                try {
                    const uploadRes = await adminApi.images.upload(imageFile);
                    dataToSend.image_id = uploadRes.id;
                } catch (uploadErr) {
                    console.error('Error subiendo imagen:', uploadErr);
                    alert('Error al subir la imagen, pero se intentará guardar la ruta.');
                }
            }

            if (editingRoute) {
                await adminApi.routes.update(editingRoute._id, dataToSend);
            } else {
                await adminApi.routes.create(dataToSend);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            alert('Error al guardar');
            console.error(err);
        }
    };

    const addStop = () => {
        if (newStop.name.trim()) {
            setFormData({
                ...formData,
                stops: [...(formData.stops || []), { name: newStop.name, coordinates: { lat: newStop.lat, lng: newStop.lng } }],
            });
            setNewStop({ name: '', lat: -2.9001, lng: -79.0059 });
        }
    };

    const removeStop = (index: number) => {
        setFormData({
            ...formData,
            stops: formData.stops?.filter((_, i) => i !== index),
        });
    };

    const toggleEvent = (eventId: string) => {
        const currentEvents = formData.events || [];
        if (currentEvents.includes(eventId)) {
            setFormData({ ...formData, events: currentEvents.filter(id => id !== eventId) });
        } else {
            setFormData({ ...formData, events: [...currentEvents, eventId] });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getCategoryBadge = (category: string) => {
        const badges: Record<string, { color: string; icon: string }> = {
            gastronomica: { color: 'bg-accent-500/20 text-accent-500', icon: '🍽️' },
            cultural: { color: 'bg-primary-500/20 text-primary-500', icon: '🏛️' },
            religiosa: { color: 'bg-secondary-500/20 text-secondary-500', icon: '⛪' },
            aventura: { color: 'bg-green-500/20 text-green-500', icon: '🏔️' },
        };
        return badges[category] || { color: 'bg-surface-500/20', icon: '📍' };
    };

    const getDifficultyBadge = (difficulty: string) => {
        const badges: Record<string, string> = {
            facil: '🟢 Fácil',
            moderada: '🟡 Moderada',
            dificil: '🔴 Difícil',
        };
        return badges[difficulty] || difficulty;
    };

    const inputClass = `w-full px-4 py-3 rounded-xl transition-all border focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-surface-700 border-surface-600 text-white' : 'bg-surface-50 border-surface-200 text-surface-900'}`;

    return (
        <MenuPageLayout title="Gestión de Rutas">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>🛤️ Rutas Turísticas</h1>
                            <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>{routes.length} rutas registradas</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all duration-300 hover:scale-105"
                        >
                            ➕ Nueva Ruta
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500">
                        ❌ {error} <button onClick={loadData} className="ml-4 underline">Reintentar</button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : routes.length === 0 ? (
                    <div className={`p-12 rounded-2xl text-center ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                        <p className="text-4xl mb-4">📭</p>
                        <p className={isDark ? 'text-surface-400' : 'text-surface-500'}>No hay rutas registradas</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {routes.map(route => {
                            const badge = getCategoryBadge(route.category);
                            return (
                                <div key={route._id} className={`p-5 rounded-2xl ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                                    <div className="relative mb-3 h-40 rounded-xl overflow-hidden bg-gray-200">
                                        {route.image_url ? (
                                            <img
                                                src={route.image_url.startsWith('http') ? route.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}${route.image_url.startsWith('/api/v1') ? route.image_url.replace('/api/v1', '') : route.image_url}`}
                                                alt={route.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    if (target.parentElement) {
                                                        target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-4xl">🗺️</div>';
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-4xl">🗺️</div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold bg-white/90 shadow-sm ${badge.color}`}>
                                                {badge.icon} {route.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-surface-900'}`}>{route.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-surface-700' : 'bg-surface-100'}`}>
                                            {getDifficultyBadge(route.difficulty)}
                                        </span>
                                    </div>

                                    <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>{route.description}</p>

                                    <div className={`flex flex-wrap gap-3 text-xs mb-4 ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                        <span title="Duración">⏱️ {route.duration}</span>
                                        <span title="Distancia">📏 {route.distance}</span>
                                        <span title="Eventos incluidos">🎉 {route.events?.length || 0} eventos</span>
                                        <span title="Paradas extra">📍 {route.stops?.length || 0} paradas</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(route)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-surface-700 hover:bg-surface-600 text-white' : 'bg-surface-100 hover:bg-surface-200 text-surface-700'}`}>
                                            ✏️ Editar
                                        </button>
                                        <button onClick={() => handleDelete(route._id, route.name)} disabled={deletingId === route._id} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-surface-700 hover:bg-red-500/20 text-surface-300 hover:text-red-500' : 'bg-surface-100 hover:bg-red-100 text-surface-500 hover:text-red-500'}`}>
                                            {deletingId === route._id ? '⏳' : '🗑️'} Eliminar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8">
                    <Link to="/admin" className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isDark ? 'text-surface-400 hover:text-white hover:bg-surface-700' : 'text-surface-500 hover:text-surface-900 hover:bg-surface-100'}`}>
                        ← Volver al Panel
                    </Link>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-surface-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                            {editingRoute ? '✏️ Editar Ruta' : '➕ Nueva Ruta'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Información Básica */}
                            <div className="space-y-4">
                                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Información Básica</h3>
                                <input type="text" placeholder="Nombre de la ruta" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
                                <textarea placeholder="Descripción" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className={inputClass} required />

                                <div className="grid grid-cols-2 gap-4">
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inputClass}>
                                        <option value="cultural">🏛️ Cultural</option>
                                        <option value="gastronomica">🍽️ Gastronómica</option>
                                        <option value="religiosa">⛪ Religiosa</option>
                                        <option value="aventura">🏔️ Aventura</option>
                                    </select>
                                    <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className={inputClass}>
                                        <option value="facil">🟢 Fácil</option>
                                        <option value="moderada">🟡 Moderada</option>
                                        <option value="dificil">🔴 Difícil</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Duración (ej: 2 horas)" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className={inputClass} />
                                    <input type="text" placeholder="Distancia (ej: 3 km)" value={formData.distance} onChange={e => setFormData({ ...formData, distance: e.target.value })} className={inputClass} />
                                </div>
                            </div>

                            {/* Imagen */}
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Imagen de Portada</h3>
                                <input type="file" accept="image/*" onChange={handleImageChange} className={`block w-full text-sm ${isDark ? 'text-surface-300' : 'text-surface-600'} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100`} />
                                {(imagePreview || currentImageUrl) && (
                                    <div className="mt-2 relative w-full h-48 rounded-xl overflow-hidden bg-black/20">
                                        <img src={imagePreview || currentImageUrl || ''} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Selección de Eventos */}
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    Eventos Incluidos ({formData.events?.length || 0})
                                </h3>
                                <div className={`max-h-48 overflow-y-auto p-3 rounded-xl border ${isDark ? 'border-surface-700 bg-surface-900/50' : 'border-surface-200 bg-surface-50'}`}>
                                    {events.length === 0 ? (
                                        <p className="text-sm opacity-50 text-center py-2">No hay eventos disponibles</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {events.map(event => (
                                                <div
                                                    key={event._id}
                                                    onClick={() => toggleEvent(event._id)}
                                                    className={`
                                                        cursor-pointer p-2 rounded-lg border text-sm flex items-center gap-2 transition-all
                                                        ${formData.events?.includes(event._id)
                                                            ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-medium'
                                                            : isDark ? 'border-surface-700 hover:border-surface-500' : 'border-surface-200 hover:border-surface-300'
                                                        }
                                                    `}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.events?.includes(event._id) ? 'bg-primary-500 border-primary-500' : 'border-current'}`}>
                                                        {formData.events?.includes(event._id) && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className="truncate">{event.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Paradas adicionales */}
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Paradas Adicionales</h3>
                                <div className="space-y-2 mb-3">
                                    {formData.stops?.map((stop, i) => (
                                        <div key={i} className={`flex items-center gap-2 p-3 rounded-lg border ${isDark ? 'bg-surface-700 border-surface-600' : 'bg-surface-50 border-surface-200'}`}>
                                            <span className="text-primary-500 font-bold w-6 text-center bg-primary-500/10 rounded">{i + 1}</span>
                                            <span className={`flex-1 font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>{stop.name}</span>
                                            <span className="text-xs opacity-50 font-mono">({stop.coordinates.lat.toFixed(4)}, {stop.coordinates.lng.toFixed(4)})</span>
                                            <button type="button" onClick={() => removeStop(i)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors">🗑️</button>
                                        </div>
                                    ))}
                                    {(!formData.stops || formData.stops.length === 0) && (
                                        <p className="text-sm opacity-50 italic">Sin paradas adicionales</p>
                                    )}
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <input type="text" placeholder="Nombre de la parada (Ej: Mirador de Turi)" value={newStop.name} onChange={e => setNewStop({ ...newStop, name: e.target.value })} className={inputClass} />
                                    </div>
                                    <div className="w-24">
                                        <input type="number" placeholder="Lat" value={newStop.lat} onChange={e => setNewStop({ ...newStop, lat: parseFloat(e.target.value) })} className={inputClass} step="0.0001" />
                                    </div>
                                    <div className="w-24">
                                        <input type="number" placeholder="Lng" value={newStop.lng} onChange={e => setNewStop({ ...newStop, lng: parseFloat(e.target.value) })} className={inputClass} step="0.0001" />
                                    </div>
                                    <button type="button" onClick={addStop} disabled={!newStop.name} className="px-4 py-3 rounded-xl bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 text-white transition-colors">➕</button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-surface-700 text-surface-300 hover:bg-surface-600' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>Cancelar</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:-translate-y-0.5 transition-all">
                                    {editingRoute ? '💾 Guardar Cambios' : '✨ Crear Ruta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MenuPageLayout>
    );
}
