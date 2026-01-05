/**
 * PerfilPage - Perfil de usuario real
 * Gestiona datos del usuario autenticado vía API
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { User, UserUpdate } from '../../services/adminApi';


export default function PerfilPage() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { currentUser, logout, checkAuth } = useAuth();

    // Estado local para edición, inicializado con currentUser
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserUpdate>({});
    const [loading, setLoading] = useState(false);

    // Sincronizar formData con currentUser cuando carga
    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone,
                city: currentUser.city,
                age: currentUser.age,
                gender: currentUser.gender,
            });
        }
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // PUT /users/me
            await api.put<User>('/users/me', formData);
            await checkAuth(); // Recargar usuario en contexto
            setIsEditing(false);
            alert('¡Perfil actualizado!');
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            alert('Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCancel = () => {
        if (currentUser) {
            setFormData({
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone,
                city: currentUser.city,
                age: currentUser.age,
                gender: currentUser.gender,
            });
        }
        setIsEditing(false);
    };

    if (!currentUser) {
        return (
            <MenuPageLayout title="Mi Perfil">
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                </div>
            </MenuPageLayout>
        );
    }

    const memberSinceDate = new Date(currentUser.member_since);
    const formattedMemberSince = memberSinceDate.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long'
    });

    const quickLinks = [
        { icon: '📋', label: 'Mi Agenda', path: '/agenda', description: 'Ver eventos guardados' },
        { icon: '🧭', label: 'Mis Rutas', path: '/rutas', description: 'Rutas personalizadas' },
        { icon: '📅', label: 'Calendario', path: '/calendario', description: 'Explorar por fecha' },
    ];

    if (currentUser.role === 'admin') {
        quickLinks.push({ icon: '⚙️', label: 'Panel Admin', path: '/admin', description: 'Gestión del sistema' });
    }

    const inputClass = `w-full px-4 py-3 rounded-xl transition-all border focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-surface-700 border-surface-600 text-white' : 'bg-surface-50 border-surface-200 text-surface-900'} disabled:opacity-60 disabled:cursor-not-allowed`;
    const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-surface-400' : 'text-surface-600'}`;

    return (
        <MenuPageLayout title="Mi Perfil">
            <div className="container mx-auto px-4">
                {/* Profile Header Card */}
                <div className={`
                    p-6 sm:p-8 rounded-2xl mb-6
                    ${isDark
                        ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                        : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                    }
                `}>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center overflow-hidden text-4xl text-white font-bold">
                                {currentUser.avatar_url ? (
                                    <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    currentUser.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            {/* TODO: Implementar subida de avatar aquí si se desea */}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className={`text-2xl sm:text-3xl font-bold font-display ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                {currentUser.name}
                            </h1>
                            <p className={`${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                {currentUser.email}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                                <span className={`text-sm ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                    📍 {currentUser.city || 'Sin ciudad'}
                                </span>
                                <span className={`text-sm ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                    🎈 Miembro desde {formattedMemberSince}
                                </span>
                                {currentUser.role === 'admin' && (
                                    <span className="bg-primary-500/20 text-primary-500 px-2 py-0.5 rounded text-xs font-bold border border-primary-500/30">
                                        Administrador
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'bg-surface-700 hover:bg-red-500/20 text-surface-300 hover:text-red-400' : 'bg-surface-100 hover:bg-red-50 text-surface-600 hover:text-red-600'}`}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Info Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className={`p-6 rounded-2xl ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>Información Personal</h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                                    >
                                        ✏️ Editar
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            className="text-surface-500 hover:text-surface-600 font-medium text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="text-primary-500 hover:text-primary-600 font-bold text-sm"
                                        >
                                            {loading ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!isEditing}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        disabled={true} // Email no editable usualmente
                                        className={`${inputClass} opacity-60 cursor-not-allowed`}
                                        title="El correo no se puede cambiar"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={!isEditing}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Ciudad</label>
                                    <input
                                        type="text"
                                        value={formData.city || ''}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        disabled={!isEditing}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Edad</label>
                                    <input
                                        type="number"
                                        value={formData.age || ''}
                                        onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                                        disabled={!isEditing}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Género</label>
                                    <select
                                        value={formData.gender || ''}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        disabled={!isEditing}
                                        className={inputClass}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links Mobile only (or desktop if preferred layout change) */}
                        <div className="lg:hidden grid grid-cols-2 gap-4">
                            {quickLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className={`p-4 rounded-xl text-center transition-transform hover:scale-105 ${isDark ? 'bg-surface-800 border border-surface-700 hover:bg-surface-700' : 'bg-white border border-surface-200 shadow hover:shadow-md'}`}
                                >
                                    <div className="text-2xl mb-2">{link.icon}</div>
                                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>{link.label}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Quick Actions Desktop */}
                        <div className={`hidden lg:block p-6 rounded-2xl ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>Accesos Rápidos</h3>
                            <div className="space-y-3">
                                {quickLinks.map((link, index) => (
                                    <Link
                                        key={index}
                                        to={link.path}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDark
                                            ? 'hover:bg-surface-700 text-surface-300 hover:text-white'
                                            : 'hover:bg-surface-50 text-surface-600 hover:text-primary-600'
                                            }`}
                                    >
                                        <span className="text-xl">{link.icon}</span>
                                        <div>
                                            <div className="font-semibold">{link.label}</div>
                                            <div className="text-xs opacity-70">{link.description}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Preferences Summary */}
                        <div className={`p-6 rounded-2xl ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>Mis Preferencias</h3>
                                <Link to="/configuracion" className="text-xs text-primary-500 hover:underline">Gestionar</Link>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {currentUser.preferences && currentUser.preferences.length > 0 ? (
                                    currentUser.preferences.map((pref, i) => (
                                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-surface-700 text-surface-300' : 'bg-surface-100 text-surface-600'}`}>
                                            {pref}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm opacity-50">Sin preferencias seleccionadas</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MenuPageLayout>
    );
}
