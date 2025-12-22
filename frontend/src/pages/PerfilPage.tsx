import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import MenuPageLayout from '../components/menu/MenuPageLayout';
import { mockUserProfile, initialUserAgenda, getCategoryLabel, UserProfile } from '../mocks/eventData';

import perfilIcon from '../icons/perfil.png';

// Helper function to get user from localStorage
const getStoredUser = (): UserProfile => {
    const stored = localStorage.getItem('cuenca-eventos-user');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return mockUserProfile;
        }
    }
    return mockUserProfile;
};

export default function PerfilPage() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<UserProfile>(getStoredUser);
    const [editedProfile, setEditedProfile] = useState<UserProfile>(getStoredUser);

    const handleSave = () => {
        setProfile(editedProfile);
        // Persist to localStorage
        localStorage.setItem('cuenca-eventos-user', JSON.stringify(editedProfile));
        setIsEditing(false);
        alert('¡Perfil actualizado!');
    };

    const handleLogout = () => {
        localStorage.removeItem('cuenca-eventos-user');
        navigate('/login');
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const memberSinceDate = new Date(profile.memberSince);
    const formattedMemberSince = memberSinceDate.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long'
    });

    const quickLinks = [
        { icon: '📋', label: 'Mi Agenda', path: '/agenda', description: 'Ver eventos guardados' },
        { icon: '🧭', label: 'Mis Rutas', path: '/rutas', description: 'Rutas personalizadas' },
        { icon: '📅', label: 'Calendario', path: '/calendario', description: 'Explorar por fecha' },
        { icon: '⚙️', label: 'Configuración', path: '#', description: 'Ajustes de la app' },
    ];

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
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center overflow-hidden">
                                <img
                                    src={perfilIcon}
                                    alt="Perfil"
                                    className="w-16 h-16 filter brightness-0 invert"
                                />
                            </div>
                            <button className={`
                                absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center
                                ${isDark ? 'bg-surface-700 hover:bg-surface-600' : 'bg-white hover:bg-surface-100 shadow-md'}
                                transition-colors
                            `}>
                                📷
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className={`text-2xl sm:text-3xl font-bold font-display ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                {profile.name}
                            </h1>
                            <p className={`${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                {profile.email}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                                <span className={`text-sm ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                    📍 {profile.city}
                                </span>
                                <span className={`text-sm ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                    📅 Miembro desde {formattedMemberSince}
                                </span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all duration-300 hover:scale-105"
                        >
                            ✏️ Editar Perfil
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Stats & Preferences */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className={`
                            p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                📊 Tu Actividad
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                    <p className="text-3xl font-bold text-green-500">{initialUserAgenda.attending.length}</p>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Eventos confirmados</p>
                                </div>
                                <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                    <p className="text-3xl font-bold text-accent-500">{initialUserAgenda.interested.length}</p>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Me interesan</p>
                                </div>
                                <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                    <p className="text-3xl font-bold text-primary-500">{initialUserAgenda.createdRoutes.length}</p>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Rutas creadas</p>
                                </div>
                                <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                    <p className="text-3xl font-bold text-secondary-500">{initialUserAgenda.completedRoutes.length}</p>
                                    <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>Rutas completadas</p>
                                </div>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className={`
                            p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                ❤️ Mis Intereses
                            </h2>
                            <p className={`text-sm mb-4 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                Estos son los tipos de eventos que más te interesan
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {profile.preferences.map(pref => (
                                    <span
                                        key={pref}
                                        className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                                    >
                                        {getCategoryLabel(pref)}
                                    </span>
                                ))}
                                <button className={`
                                    px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed transition-colors
                                    ${isDark
                                        ? 'border-surface-600 text-surface-400 hover:border-primary-500 hover:text-primary-400'
                                        : 'border-surface-300 text-surface-500 hover:border-primary-500 hover:text-primary-500'
                                    }
                                `}>
                                    + Agregar
                                </button>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className={`
                            p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                👤 Información de Cuenta
                            </h2>
                            <div className="space-y-4">
                                <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                    <div>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>Nombre completo</p>
                                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>{profile.name}</p>
                                    </div>
                                    <span className="text-lg">👤</span>
                                </div>
                                <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                    <div>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>Correo electrónico</p>
                                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>{profile.email}</p>
                                    </div>
                                    <span className="text-lg">✉️</span>
                                </div>
                                <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                    <div>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>Teléfono</p>
                                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>{profile.phone || 'No registrado'}</p>
                                    </div>
                                    <span className="text-lg">📱</span>
                                </div>
                                <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}`}>
                                    <div>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>Ciudad</p>
                                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>{profile.city}</p>
                                    </div>
                                    <span className="text-lg">📍</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quick Links */}
                    <div className="space-y-6">
                        {/* Quick Links */}
                        <div className={`
                            p-6 rounded-2xl
                            ${isDark
                                ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                                : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                            }
                        `}>
                            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                🚀 Acceso Rápido
                            </h2>
                            <div className="space-y-3">
                                {quickLinks.map(link => (
                                    <Link
                                        key={link.label}
                                        to={link.path}
                                        className={`
                                            flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]
                                            ${isDark
                                                ? 'bg-surface-700/50 hover:bg-surface-700'
                                                : 'bg-surface-50 hover:bg-surface-100'
                                            }
                                        `}
                                    >
                                        <span className="text-2xl">{link.icon}</span>
                                        <div className="flex-1">
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                {link.label}
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                                {link.description}
                                            </p>
                                        </div>
                                        <span className={isDark ? 'text-surface-500' : 'text-surface-400'}>→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className={`
                            p-6 rounded-2xl border-2 border-dashed
                            ${isDark
                                ? 'border-secondary-500/30 bg-secondary-500/5'
                                : 'border-secondary-200 bg-secondary-50/50'
                            }
                        `}>
                            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-secondary-400' : 'text-secondary-600'}`}>
                                ⚠️ Zona de Peligro
                            </h2>
                            <button
                                onClick={handleLogout}
                                className={`
                                w-full py-3 rounded-xl font-medium transition-all
                                ${isDark
                                        ? 'bg-surface-700/50 text-surface-300 hover:bg-secondary-500/20 hover:text-secondary-400'
                                        : 'bg-white text-surface-600 hover:bg-secondary-100 hover:text-secondary-600'
                                    }
                            `}>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleCancel}
                >
                    <div
                        className={`
                            w-full max-w-lg rounded-2xl
                            ${isDark ? 'bg-surface-800' : 'bg-white'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    ✏️ Editar Perfil
                                </h2>
                                <button
                                    onClick={handleCancel}
                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-surface-700' : 'hover:bg-surface-100'}`}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                                        Nombre completo
                                    </label>
                                    <input
                                        type="text"
                                        value={editedProfile.name}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                        className={`
                                            w-full px-4 py-3 rounded-xl transition-all
                                            ${isDark
                                                ? 'bg-surface-700 border-surface-600 text-white'
                                                : 'bg-surface-50 border-surface-200 text-surface-900'
                                            }
                                            border focus:outline-none focus:ring-2 focus:ring-primary-500
                                        `}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={editedProfile.email}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                        className={`
                                            w-full px-4 py-3 rounded-xl transition-all
                                            ${isDark
                                                ? 'bg-surface-700 border-surface-600 text-white'
                                                : 'bg-surface-50 border-surface-200 text-surface-900'
                                            }
                                            border focus:outline-none focus:ring-2 focus:ring-primary-500
                                        `}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={editedProfile.phone || ''}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                        placeholder="+593 99 123 4567"
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
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                                        Ciudad
                                    </label>
                                    <input
                                        type="text"
                                        value={editedProfile.city}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                                        className={`
                                            w-full px-4 py-3 rounded-xl transition-all
                                            ${isDark
                                                ? 'bg-surface-700 border-surface-600 text-white'
                                                : 'bg-surface-50 border-surface-200 text-surface-900'
                                            }
                                            border focus:outline-none focus:ring-2 focus:ring-primary-500
                                        `}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCancel}
                                    className={`
                                        flex-1 py-3 rounded-xl font-medium transition-all
                                        ${isDark
                                            ? 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                                            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                                        }
                                    `}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MenuPageLayout>
    );
}
