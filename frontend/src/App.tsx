import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/auth/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegistroPage from './pages/auth/RegistroPage'
import MainMenuPage from './pages/menu/MainMenuPage'
import CalendarioPage from './pages/user/CalendarioPage'
import MapaPage from './pages/user/MapaPage'
import EventosPage from './pages/user/EventosPage'
import RutasPage from './pages/user/RutasPage'
import MiAgendaPage from './pages/user/MiAgendaPage'
import PerfilPage from './pages/user/PerfilPage'
import ConocenosPage from './pages/menu/ConocenosPage'
import MasInfoPage from './pages/menu/MasInfoPage'

// Admin pages
import AdminRoute from './components/guards/AdminRoute'
import UserRoute from './components/guards/UserRoute'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminEventosPage from './pages/admin/AdminEventosPage'
import AdminEventoFormPage from './pages/admin/AdminEventoFormPage'
import AdminAlertasPage from './pages/admin/AdminAlertasPage'
import AdminRutasPage from './pages/admin/AdminRutasPage'
import AdminUsuariosPage from './pages/admin/AdminUsuariosPage'

// Placeholder pages - for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-4">{title}</h1>
                <p className="text-surface-600 dark:text-surface-400 mb-6">Próximamente...</p>
                <a
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02]"
                >
                    ← Volver al inicio
                </a>
            </div>
        </div>
    )
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Routes>
                    {/* Public Pages */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegistroPage />} />

                    {/* User Pages (Protected - only for regular users, not admin) */}
                    <Route path="/menu" element={<UserRoute><MainMenuPage /></UserRoute>} />
                    <Route path="/calendario" element={<UserRoute><CalendarioPage /></UserRoute>} />
                    <Route path="/mapa" element={<UserRoute><MapaPage /></UserRoute>} />
                    <Route path="/eventos" element={<UserRoute><EventosPage /></UserRoute>} />
                    <Route path="/rutas" element={<UserRoute><RutasPage /></UserRoute>} />
                    <Route path="/agenda" element={<UserRoute><MiAgendaPage /></UserRoute>} />
                    <Route path="/perfil" element={<UserRoute><PerfilPage /></UserRoute>} />

                    {/* Admin Pages (Protected) */}
                    <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                    <Route path="/admin/eventos" element={<AdminRoute><AdminEventosPage /></AdminRoute>} />
                    <Route path="/admin/eventos/nuevo" element={<AdminRoute><AdminEventoFormPage /></AdminRoute>} />
                    <Route path="/admin/eventos/:id" element={<AdminRoute><AdminEventoFormPage /></AdminRoute>} />
                    <Route path="/admin/alertas" element={<AdminRoute><AdminAlertasPage /></AdminRoute>} />
                    <Route path="/admin/rutas" element={<AdminRoute><AdminRutasPage /></AdminRoute>} />
                    <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuariosPage /></AdminRoute>} />

                    {/* Landing page links */}
                    <Route path="/explorar" element={<Navigate to="/login" replace />} />
                    <Route path="/conocenos" element={<ConocenosPage />} />
                    <Route path="/info" element={<MasInfoPage />} />
                    <Route path="/intereses" element={<PlaceholderPage title="Personalizar Intereses" />} />
                    <Route path="/recuperar" element={<PlaceholderPage title="Recuperar Contraseña" />} />
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
