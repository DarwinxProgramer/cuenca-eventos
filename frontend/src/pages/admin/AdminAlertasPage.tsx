/**
 * AdminAlertasPage - Gestión de alertas de tránsito
 * Lista, crear, editar y eliminar alertas
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { adminApi, Alert, AlertCreate } from '../../services/adminApi';

export default function AdminAlertasPage() {
    const { isDark } = useTheme();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
    const [formData, setFormData] = useState<AlertCreate>({
        title: '',
        description: '',
        type: 'cierre',
        location: '',
        coordinates: { lat: -2.9001, lng: -79.0059 },
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const data = await adminApi.alerts.list();
            setAlerts(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar alertas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Eliminar alerta "${title}"?`)) return;
        setDeletingId(id);
        try {
            await adminApi.alerts.delete(id);
            setAlerts(alerts.filter(a => a._id !== id));
        } catch (err) {
            alert('Error al eliminar');
        } finally {
            setDeletingId(null);
        }
    };

    const openCreateModal = () => {
        setEditingAlert(null);
        setFormData({
            title: '',
            description: '',
            type: 'cierre',
            location: '',
            coordinates: { lat: -2.9001, lng: -79.0059 },
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
        });
        setShowModal(true);
    };

    const openEditModal = (alert: Alert) => {
        setEditingAlert(alert);
        setFormData({
            title: alert.title,
            description: alert.description,
            type: alert.type,
            location: alert.location,
            coordinates: alert.coordinates,
            start_date: alert.start_date.split('T')[0],
            end_date: alert.end_date.split('T')[0],
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                start_date: `${formData.start_date}T00:00:00`,
                end_date: `${formData.end_date}T23:59:59`,
            };

            if (editingAlert) {
                await adminApi.alerts.update(editingAlert._id, dataToSend);
            } else {
                await adminApi.alerts.create(dataToSend);
            }
            setShowModal(false);
            loadAlerts();
        } catch (err) {
            alert('Error al guardar');
        }
    };

    const getTypeBadge = (type: string) => {
        const badges: Record<string, { color: string; label: string }> = {
            cierre: { color: 'bg-red-500/20 text-red-500', label: '🚫 Cierre' },
            desvio: { color: 'bg-yellow-500/20 text-yellow-500', label: '↪️ Desvío' },
            congestion: { color: 'bg-orange-500/20 text-orange-500', label: '🚗 Congestión' },
        };
        return badges[type] || { color: 'bg-surface-500/20', label: type };
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
    };

    const inputClass = `w-full px-4 py-3 rounded-xl transition-all border focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-surface-700 border-surface-600 text-white' : 'bg-surface-50 border-surface-200 text-surface-900'}`;

    return (
        <MenuPageLayout title="Gestión de Alertas">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>⚠️ Alertas de Tránsito</h1>
                            <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>{alerts.length} alertas registradas</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all duration-300 hover:scale-105"
                        >
                            ➕ Nueva Alerta
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500">
                        ❌ {error} <button onClick={loadAlerts} className="ml-4 underline">Reintentar</button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className={`p-12 rounded-2xl text-center ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                        <p className="text-4xl mb-4">📭</p>
                        <p className={isDark ? 'text-surface-400' : 'text-surface-500'}>No hay alertas registradas</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alerts.map(alert => {
                            const badge = getTypeBadge(alert.type);
                            return (
                                <div key={alert._id} className={`p-5 rounded-2xl border-l-4 ${alert.type === 'cierre' ? 'border-red-500' : alert.type === 'desvio' ? 'border-yellow-500' : 'border-orange-500'} ${isDark ? 'bg-surface-800/90 border-r border-t border-b border-surface-700' : 'bg-white/90 border-r border-t border-b border-surface-200 shadow-lg'}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                                        <span className={`text-xs ${alert.is_active ? 'text-green-500' : 'text-surface-400'}`}>
                                            {alert.is_active ? '● Activa' : '○ Inactiva'}
                                        </span>
                                    </div>
                                    <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-surface-900'}`}>{alert.title}</h3>
                                    <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>{alert.description}</p>
                                    <p className={`text-xs mb-3 ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                        📍 {alert.location} • {formatDate(alert.start_date)} - {formatDate(alert.end_date)}
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(alert)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-surface-700 hover:bg-surface-600 text-white' : 'bg-surface-100 hover:bg-surface-200 text-surface-700'}`}>
                                            ✏️ Editar
                                        </button>
                                        <button onClick={() => handleDelete(alert._id, alert.title)} disabled={deletingId === alert._id} className={`flex-1 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-surface-700 hover:bg-red-500/20 text-surface-300 hover:text-red-500' : 'bg-surface-100 hover:bg-red-100 text-surface-500 hover:text-red-500'}`}>
                                            {deletingId === alert._id ? '⏳' : '🗑️'} Eliminar
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
                    <div className={`w-full max-w-lg rounded-2xl p-6 ${isDark ? 'bg-surface-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                            {editingAlert ? '✏️ Editar Alerta' : '➕ Nueva Alerta'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Título" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} required />
                            <textarea placeholder="Descripción" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className={inputClass} required />
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as 'cierre' | 'desvio' | 'congestion' })} className={inputClass}>
                                <option value="cierre">🚫 Cierre vial</option>
                                <option value="desvio">↪️ Desvío</option>
                                <option value="congestion">🚗 Congestión</option>
                            </select>
                            <input type="text" placeholder="Ubicación" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className={inputClass} required />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Inicio</label>
                                    <input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Fin</label>
                                    <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className={inputClass} required />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-surface-700 text-surface-300' : 'bg-surface-100 text-surface-600'}`}>Cancelar</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                                    {editingAlert ? '💾 Guardar' : '➕ Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MenuPageLayout>
    );
}
