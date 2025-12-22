import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'
import MainMenuPage from './pages/MainMenuPage'
import CalendarioPage from './pages/CalendarioPage'
import MapaPage from './pages/MapaPage'
import EventosPage from './pages/EventosPage'
import RutasPage from './pages/RutasPage'
import MiAgendaPage from './pages/MiAgendaPage'
import PerfilPage from './pages/PerfilPage'
import ConocenosPage from './pages/ConocenosPage'
import MasInfoPage from './pages/MasInfoPage'

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
            <Routes>
                {/* Main Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/menu" element={<MainMenuPage />} />

                {/* Core Feature Pages */}
                <Route path="/calendario" element={<CalendarioPage />} />
                <Route path="/mapa" element={<MapaPage />} />
                <Route path="/eventos" element={<EventosPage />} />
                <Route path="/rutas" element={<RutasPage />} />
                <Route path="/agenda" element={<MiAgendaPage />} />
                <Route path="/perfil" element={<PerfilPage />} />

                {/* Landing page links */}
                <Route path="/explorar" element={<Navigate to="/login" replace />} />
                <Route path="/conocenos" element={<ConocenosPage />} />
                <Route path="/info" element={<MasInfoPage />} />
                <Route path="/intereses" element={<PlaceholderPage title="Personalizar Intereses" />} />
                <Route path="/recuperar" element={<PlaceholderPage title="Recuperar Contraseña" />} />
            </Routes>
        </ThemeProvider>
    )
}

export default App

