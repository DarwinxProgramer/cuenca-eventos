/**
 * AdminUsuariosPage - Gestión de usuarios registrados
 * Lista, ver y gestionar usuarios reales desde la API
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MenuPageLayout from '../../components/menu/MenuPageLayout';
import { adminApi, User } from '../../services/adminApi';
import { dbService } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useUsersData } from '../../hooks/useUsersData';
import toast from 'react-hot-toast';

export default function AdminUsuariosPage() {
    const { isDark } = useTheme();
    const { currentUser } = useAuth();
    // Usar hook con cache offline
    const { data: users = [], isLoading: loading, error: hookError, isError, refetch } = useUsersData();
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUserData, setNewUserData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: 'Cuenca',
        role: 'user' as 'user' | 'admin'
    });
    const [editUserData, setEditUserData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        role: 'user' as 'user' | 'admin'
    });

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setActionLoading('creating');
            // Usar endpoint de registro para crear usuario
            let createdUser = await adminApi.users.create({
                name: newUserData.name,
                email: newUserData.email,
                password: newUserData.password,
                phone: newUserData.phone,
                city: newUserData.city
            });

            // Si se creó como admin, actualizar el rol
            if (newUserData.role === 'admin') {
                // Si es offline, la actualización de rol también se encola
                try {
                    await adminApi.users.update(createdUser._id, { role: 'admin' });
                    createdUser.role = 'admin'; // Forzar rol en local
                } catch (ignore) { /* si falla update rol, seguimos */ }
            }

            // Offline Optimista
            await dbService.saveUser(createdUser);

            setShowCreateModal(false);
            setNewUserData({
                name: '',
                email: '',
                password: '',
                phone: '',
                city: 'Cuenca',
                role: 'user'
            });
            toast.success('Usuario creado');
            await refetch();
        } catch (err: any) {
            console.error('Error creando usuario:', err);
            toast.error('Error al crear usuario: ' + (err.message || 'Error desconocido'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            setActionLoading(userId);
            await adminApi.users.delete(userId);
            // Offline Optimista
            await dbService.deleteUser(userId);

            toast.success('Usuario eliminado');
            await refetch();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            toast.error('Error al eliminar usuario');
        } finally {
            setActionLoading(null);
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditUserData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            city: user.city || 'Cuenca',
            role: user.role
        });
        setShowEditModal(true);
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            setActionLoading(editingUser._id);
            const updated = await adminApi.users.update(editingUser._id, {
                name: editUserData.name,
                phone: editUserData.phone,
                city: editUserData.city,
                role: editUserData.role
            });

            // Offline Optimista
            await dbService.saveUser(updated);

            setShowEditModal(false);
            setEditingUser(null);
            toast.success('Usuario actualizado');
            await refetch();
        } catch (err: any) {
            console.error('Error editando usuario:', err);
            toast.error('Error al editar usuario: ' + (err.message || 'Error desconocido'));
        } finally {
            setActionLoading(null);
        }
    };


    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const inputClass = `w-full px-4 py-3 rounded-xl transition-all border focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-surface-700 border-surface-600 text-white placeholder-surface-500' : 'bg-surface-50 border-surface-200 text-surface-900 placeholder-surface-400'}`;
    const cardClass = `p-5 rounded-2xl ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`;

    return (
        <MenuPageLayout title="Gestión de Usuarios">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>👥 Usuarios Registrados</h1>
                            <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>{users.length} usuarios en el sistema</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all duration-300 hover:scale-105"
                        >
                            ➕ Nuevo Usuario
                        </button>
                    </div>
                </div>

                {/* Error Display - Moved here to be visible */}
                {isError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500">
                        ❌ {(hookError as any)?.message || 'Error al cargar usuarios'}
                        <button onClick={() => refetch()} className="ml-4 underline">Reintentar</button>
                    </div>
                )}

                {/* Buscador */}
                <div className="mb-6">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`${inputClass} pl-12`}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className={`p-12 rounded-2xl text-center ${isDark ? 'bg-surface-800/90 border border-surface-700' : 'bg-white/90 border border-surface-200 shadow-lg'}`}>
                        <p className="text-4xl mb-4">📭</p>
                        <p className={isDark ? 'text-surface-400' : 'text-surface-500'}>No se encontraron usuarios</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map(user => {
                            const isMe = currentUser?._id === user._id; // Asumiendo currentUser tiene _id
                            const isAdmin = user.role === 'admin';

                            return (
                                <div key={user._id} className={cardClass}>
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold
                                            ${isAdmin
                                                ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
                                                : isDark ? 'bg-surface-700 text-surface-300' : 'bg-surface-100 text-surface-600'
                                            }
                                        `}>
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold truncate ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {user.name}
                                                    {isMe && <span className="ml-2 text-xs opacity-60">(Tú)</span>}
                                                </h3>
                                                {isAdmin && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500/20 text-primary-500">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            {user._id.startsWith('temp-') && (
                                                <div className="text-xs text-amber-500 dark:text-amber-400 mb-1 flex items-center gap-1">
                                                    📡 Pendiente de Sincronizar
                                                </div>
                                            )}
                                            <p className={`text-sm truncate ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`mt-4 pt-4 border-t ${isDark ? 'border-surface-700' : 'border-surface-200'}`}>
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                            <div>
                                                <span className={isDark ? 'text-surface-500' : 'text-surface-400'}>📱 </span>
                                                <span className={isDark ? 'text-surface-300' : 'text-surface-600'}>
                                                    {user.phone || 'Sin teléfono'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className={isDark ? 'text-surface-500' : 'text-surface-400'}>🏙️ </span>
                                                <span className={isDark ? 'text-surface-300' : 'text-surface-600'}>
                                                    {user.city || 'Sin ciudad'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`text-xs ${isDark ? 'text-surface-500' : 'text-surface-400'}`}>
                                            📅 Registrado: {formatDate(user.member_since)}
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                disabled={!!actionLoading}
                                                className={`
                                                    flex-1 px-4 py-2 rounded-xl font-medium transition-all
                                                    ${isDark
                                                        ? 'bg-surface-700 text-white hover:bg-surface-600'
                                                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                                                    }
                                                    ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                ✏️ Editar
                                            </button>
                                            {!isMe && (
                                                <button
                                                    onClick={() => handleDelete(user._id, user.name)}
                                                    disabled={!!actionLoading}
                                                    className={`
                                                        flex-1 px-4 py-2 rounded-xl font-medium transition-all
                                                        ${actionLoading === user._id
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : 'hover:bg-red-500/20 hover:text-red-500'
                                                        }
                                                        ${isDark
                                                            ? 'bg-surface-700 text-surface-300'
                                                            : 'bg-surface-100 text-surface-500'
                                                        }
                                                    `}
                                                >
                                                    {actionLoading === user._id ? '⏳' : '🗑️'} Eliminar
                                                </button>
                                            )}
                                        </div>
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

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                    <div className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-surface-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                            ➕ Nuevo Usuario
                        </h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                value={newUserData.name}
                                onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                                className={inputClass}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newUserData.email}
                                onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                                className={inputClass}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Contraseña (mínimo 6 caracteres)"
                                value={newUserData.password}
                                onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                                className={inputClass}
                                required
                                minLength={6}
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono (opcional)"
                                value={newUserData.phone}
                                onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })}
                                className={inputClass}
                            />
                            <input
                                type="text"
                                placeholder="Ciudad"
                                value={newUserData.city}
                                onChange={e => setNewUserData({ ...newUserData, city: e.target.value })}
                                className={inputClass}
                            />
                            <select
                                value={newUserData.role}
                                onChange={e => setNewUserData({ ...newUserData, role: e.target.value as 'user' | 'admin' })}
                                className={inputClass}
                            >
                                <option value="user">👤 Usuario</option>
                                <option value="admin">👮 Administrador</option>
                            </select>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-surface-700 text-surface-300' : 'bg-surface-100 text-surface-600'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!!actionLoading}
                                    className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white disabled:opacity-50"
                                >
                                    {actionLoading === 'creating' ? '⏳ Creando...' : '➕ Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
                    <div className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-surface-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                            ✏️ Editar Usuario
                        </h2>
                        <form onSubmit={handleEditUser} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                value={editUserData.name}
                                onChange={e => setEditUserData({ ...editUserData, name: e.target.value })}
                                className={inputClass}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={editUserData.email}
                                className={`${inputClass} opacity-50 cursor-not-allowed`}
                                disabled
                                title="El email no se puede modificar"
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono (opcional)"
                                value={editUserData.phone}
                                onChange={e => setEditUserData({ ...editUserData, phone: e.target.value })}
                                className={inputClass}
                            />
                            <input
                                type="text"
                                placeholder="Ciudad"
                                value={editUserData.city}
                                onChange={e => setEditUserData({ ...editUserData, city: e.target.value })}
                                className={inputClass}
                            />
                            <select
                                value={editUserData.role}
                                onChange={e => setEditUserData({ ...editUserData, role: e.target.value as 'user' | 'admin' })}
                                className={inputClass}
                            >
                                <option value="user">👤 Usuario</option>
                                <option value="admin">👮 Administrador</option>
                            </select>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-surface-700 text-surface-300' : 'bg-surface-100 text-surface-600'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!!actionLoading}
                                    className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white disabled:opacity-50"
                                >
                                    {actionLoading === editingUser._id ? '⏳ Guardando...' : '💾 Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MenuPageLayout>
    );
}
