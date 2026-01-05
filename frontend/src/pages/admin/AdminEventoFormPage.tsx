/**
 * AdminEventoFormPage - Formulario para crear/editar eventos
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { adminApi, EventCreate } from '../../services/adminApi';

const initialFormData: EventCreate = {
    title: '',
    description: '',
    long_description: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    address: '',
    coordinates: { lat: -2.9001, lng: -79.0059 }, // Centro de Cuenca
    category: 'cultural',
    itinerary: [],
    closed_streets: [],
};

export default function AdminEventoFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const isEditing = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<EventCreate>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newItineraryItem, setNewItineraryItem] = useState({ time: '', activity: '' });
    const [newStreet, setNewStreet] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    // Local state for coordinate string inputs
    const [latString, setLatString] = useState<string>('-2.9001');
    const [lngString, setLngString] = useState<string>('-79.0059');

    useEffect(() => {
        if (isEditing) {
            loadEvent();
        }
    }, [id]);

    const loadEvent = async () => {
        setLoading(true);
        try {
            const event = await adminApi.events.get(id!);
            setFormData({
                title: event.title,
                description: event.description,
                long_description: event.long_description || '',
                date: event.date.split('T')[0],
                time: event.time,
                end_time: event.end_time || '',
                location: event.location,
                address: event.address || '',
                coordinates: event.coordinates,
                category: event.category,
                itinerary: event.itinerary || [],
                closed_streets: event.closed_streets || [],
            });
            if (event.image_url) {
                setCurrentImageUrl(event.image_url);
            }
            // Set coordinate strings
            setLatString(event.coordinates.lat.toString());
            setLngString(event.coordinates.lng.toString());
        } catch (err) {
            setError('Error al cargar evento');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
            setError('Por favor completa todos los campos requeridos');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const dataToSend = {
                ...formData,
                date: `${formData.date}T${formData.time}:00`,
            };

            // Implementación de subida de imagen
            if (imageFile) {
                try {
                    const uploadRes = await adminApi.images.upload(imageFile);
                    dataToSend.image_id = uploadRes.id;
                } catch (uploadErr) {
                    console.error('Error subiendo imagen:', uploadErr);
                    // Opcional: mostrar error pero intentar guardar evento igual, o fallar.
                    // Decidimos fallar para que el usuario sepa.
                    throw new Error('Error al subir la imagen');
                }
            }

            if (isEditing) {
                await adminApi.events.update(id!, dataToSend);
            } else {
                await adminApi.events.create(dataToSend);
            }

            navigate('/admin/eventos');
        } catch (err) {
            setError(`Error al ${isEditing ? 'actualizar' : 'crear'} evento`);
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const addItineraryItem = () => {
        if (newItineraryItem.time && newItineraryItem.activity) {
            setFormData({
                ...formData,
                itinerary: [...(formData.itinerary || []), { ...newItineraryItem }],
            });
            setNewItineraryItem({ time: '', activity: '' });
        }
    };

    const removeItineraryItem = (index: number) => {
        setFormData({
            ...formData,
            itinerary: formData.itinerary?.filter((_, i) => i !== index),
        });
    };

    const addClosedStreet = () => {
        if (newStreet.trim()) {
            setFormData({
                ...formData,
                closed_streets: [...(formData.closed_streets || []), newStreet.trim()],
            });
            setNewStreet('');
        }
    };

    const removeClosedStreet = (index: number) => {
        setFormData({
            ...formData,
            closed_streets: formData.closed_streets?.filter((_, i) => i !== index),
        });
    };

    const inputClass = `
        w-full px-4 py-3 rounded-xl transition-all
        ${isDark
            ? 'bg-surface-700 border-surface-600 text-white placeholder-surface-500'
            : 'bg-surface-50 border-surface-200 text-surface-900 placeholder-surface-400'
        }
        border focus:outline-none focus:ring-2 focus:ring-primary-500
    `;

    const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`;

    return (
        <MenuPageLayout title={isEditing ? 'Editar Evento' : 'Nuevo Evento'}>
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className={`
                    p-6 rounded-2xl mb-6
                    ${isDark
                        ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                        : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                    }
                `}>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                        {isEditing ? '✏️ Editar Evento' : '➕ Nuevo Evento'}
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                        {isEditing ? 'Modifica los datos del evento' : 'Completa los datos para crear un nuevo evento'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500">
                        ❌ {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                )}

                {!loading && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Información básica */}
                        <div className={`
                            p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 border border-surface-700'
                                : 'bg-white/90 border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                📋 Información Básica
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Título *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ej: Festival de Luces 2026"
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Descripción corta *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Breve descripción del evento (máx 200 caracteres)"
                                        rows={2}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Descripción larga</label>
                                    <textarea
                                        value={formData.long_description}
                                        onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                                        placeholder="Descripción completa del evento"
                                        rows={4}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Categoría *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="cultural">Cultural</option>
                                        <option value="religioso">Religioso</option>
                                        <option value="gastronomico">Gastronómico</option>
                                        <option value="artistico">Artístico</option>
                                        <option value="tradicional">Tradicional</option>
                                    </select>
                                </div>

                                {/* Sección de imagen */}
                                <div>
                                    <label className={labelClass}>🖼️ Imagen del evento</label>
                                    <div className={`
                                        border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                                        ${isDark
                                            ? 'border-surface-600 hover:border-primary-500 bg-surface-700/50'
                                            : 'border-surface-300 hover:border-primary-500 bg-surface-50'
                                        }
                                    `}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setImagePreview(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        {imagePreview || currentImageUrl ? (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview || currentImageUrl || ''}
                                                    alt="Preview"
                                                    className="max-h-48 mx-auto rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImageFile(null);
                                                        setImagePreview(null);
                                                        setCurrentImageUrl(null);
                                                    }}
                                                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={isDark ? 'text-surface-400' : 'text-surface-500'}>
                                                <span className="text-4xl mb-2 block">📷</span>
                                                <p className="font-medium">Haz clic para seleccionar una imagen</p>
                                                <p className="text-sm opacity-75">JPG, PNG, WEBP (máx 5MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fecha y hora */}
                        <div className={`
                            p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 border border-surface-700'
                                : 'bg-white/90 border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                📅 Fecha y Hora
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Fecha *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Hora inicio *</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Hora fin</label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div className={`
                            p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 border border-surface-700'
                                : 'bg-white/90 border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                📍 Ubicación
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Lugar *</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Ej: Centro Histórico"
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Dirección</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Ej: Parque Calderón"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Latitud</label>
                                    <input
                                        type="text"
                                        value={latString}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setLatString(value);
                                            // Convertir a número si es válido
                                            const num = parseFloat(value);
                                            if (!isNaN(num)) {
                                                setFormData({
                                                    ...formData,
                                                    coordinates: { ...formData.coordinates, lat: num }
                                                });
                                            }
                                        }}
                                        onBlur={(e) => {
                                            // Validar y corregir al perder foco
                                            const num = parseFloat(e.target.value);
                                            if (!isNaN(num)) {
                                                setLatString(num.toString());
                                                setFormData({
                                                    ...formData,
                                                    coordinates: { ...formData.coordinates, lat: num }
                                                });
                                            } else {
                                                // Restaurar valor anterior si es inválido
                                                setLatString(formData.coordinates.lat.toString());
                                            }
                                        }}
                                        placeholder="Ej: -2.9001"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Longitud</label>
                                    <input
                                        type="text"
                                        value={lngString}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setLngString(value);
                                            // Convertir a número si es válido
                                            const num = parseFloat(value);
                                            if (!isNaN(num)) {
                                                setFormData({
                                                    ...formData,
                                                    coordinates: { ...formData.coordinates, lng: num }
                                                });
                                            }
                                        }}
                                        onBlur={(e) => {
                                            // Validar y corregir al perder foco
                                            const num = parseFloat(e.target.value);
                                            if (!isNaN(num)) {
                                                setLngString(num.toString());
                                                setFormData({
                                                    ...formData,
                                                    coordinates: { ...formData.coordinates, lng: num }
                                                });
                                            } else {
                                                // Restaurar valor anterior si es inválido
                                                setLngString(formData.coordinates.lng.toString());
                                            }
                                        }}
                                        placeholder="Ej: -79.0059"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Itinerario */}
                        <div className={`
                            p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 border border-surface-700'
                                : 'bg-white/90 border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                📋 Itinerario
                            </h2>

                            <div className="space-y-3">
                                {formData.itinerary?.map((item, index) => (
                                    <div key={index} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                        <span className={`flex-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>{item.activity}</span>
                                        <span className="font-medium text-primary-500">{item.time}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItineraryItem(index)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newItineraryItem.activity}
                                        onChange={(e) => setNewItineraryItem({ ...newItineraryItem, activity: e.target.value })}
                                        placeholder="Actividad"
                                        className={`flex-1 px-4 py-3 rounded-xl transition-all border focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-surface-700 border-surface-600 text-white placeholder-surface-500' : 'bg-surface-50 border-surface-200 text-surface-900 placeholder-surface-400'}`}
                                    />
                                    <input
                                        type="time"
                                        value={newItineraryItem.time}
                                        onChange={(e) => setNewItineraryItem({ ...newItineraryItem, time: e.target.value })}
                                        className={`w-32 px-4 py-3 rounded-xl transition-all border focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-surface-700 border-surface-600 text-white placeholder-surface-500' : 'bg-surface-50 border-surface-200 text-surface-900 placeholder-surface-400'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={addItineraryItem}
                                        className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
                                    >
                                        ➕
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Calles cerradas */}
                        <div className={`
                            p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 border border-surface-700'
                                : 'bg-white/90 border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                🚧 Calles Cerradas
                            </h2>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {formData.closed_streets?.map((street, index) => (
                                    <span key={index} className={`
                                        inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
                                        ${isDark ? 'bg-surface-700 text-white' : 'bg-surface-100 text-surface-700'}
                                    `}>
                                        {street}
                                        <button
                                            type="button"
                                            onClick={() => removeClosedStreet(index)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newStreet}
                                    onChange={(e) => setNewStreet(e.target.value)}
                                    placeholder="Nombre de la calle"
                                    className={`flex-1 ${inputClass}`}
                                />
                                <button
                                    type="button"
                                    onClick={addClosedStreet}
                                    className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
                                >
                                    ➕
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/eventos')}
                                className={`
                                    flex-1 py-4 rounded-xl font-medium transition-all
                                    ${isDark
                                        ? 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                                    }
                                `}
                            >
                                ← Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`
                                    flex-1 py-4 rounded-xl font-semibold text-white transition-all
                                    bg-gradient-to-r from-primary-500 to-primary-600 
                                    hover:from-primary-600 hover:to-primary-700
                                    ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
                                `}
                            >
                                {saving ? '⏳ Guardando...' : (isEditing ? '💾 Guardar Cambios' : '➕ Crear Evento')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </MenuPageLayout>
    );
}
