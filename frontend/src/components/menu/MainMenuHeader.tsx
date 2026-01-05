import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Import logos
import LogoPrincipal from '../../icons/LogoPrincipal.PNG';
import LogoModoOscuro from '../../icons/LogoModoOscuro.PNG';
import lupaIcon from '../../icons/lupa.png';
import perfilIcon from '../../icons/perfil.png';

interface MainMenuHeaderProps {
    pageTitle?: string;
}

export default function MainMenuHeader({ pageTitle }: MainMenuHeaderProps) {
    const { toggleTheme, isDark } = useTheme();
    const { logout, currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Check if we're in admin zone
    const isAdminZone = location.pathname.startsWith('/admin');

    // Get user data from context or localStorage
    const getUserName = (): string => {
        if (currentUser?.name) return currentUser.name;
        const stored = localStorage.getItem('cuenca-eventos-user');
        if (stored) {
            try {
                const userData = JSON.parse(stored);
                return userData.name || 'Usuario';
            } catch {
                return 'Usuario';
            }
        }
        return 'Usuario';
    };
    const userName = getUserName();

    // Determine if we're on the main menu page
    const isMainMenu = location.pathname === '/menu';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <div className={`
                mx-4 mt-4 rounded-2xl px-4 sm:px-6 py-4
                ${isDark
                    ? 'bg-surface-900/80 backdrop-blur-xl border border-surface-700/50'
                    : 'bg-white/80 backdrop-blur-xl border border-surface-200/50 shadow-lg shadow-surface-200/20'
                }
            `}>
                <div className="flex items-center justify-between gap-4">
                    {/* Left Zone - Logo and Menu Title */}
                    <Link to="/menu" className="flex items-center gap-3 group">
                        <img
                            src={isDark ? LogoModoOscuro : LogoPrincipal}
                            alt="Cuenca Eventos Logo"
                            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="hidden sm:block">
                            <span className={`
                                text-lg font-bold font-display
                                ${isDark ? 'text-white' : 'text-surface-900'}
                            `}>
                                {pageTitle || 'Menú Principal'}
                            </span>
                            <p className={`text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                Explora Cuenca
                            </p>
                        </div>
                    </Link>

                    {/* Center Zone - Search Bar */}
                    <div className="flex-1 max-w-md hidden md:block">
                        <div className={`
                            relative flex items-center rounded-xl overflow-hidden transition-all duration-300
                            ${isDark
                                ? 'bg-surface-800 border border-surface-700 focus-within:border-primary-500'
                                : 'bg-surface-100 border border-surface-200 focus-within:border-primary-500 focus-within:shadow-md'
                            }
                        `}>
                            <input
                                type="text"
                                placeholder="Buscar eventos, lugares o rutas…"
                                className={`
                                    w-full px-4 py-2.5 pr-12 text-sm
                                    bg-transparent outline-none transition-colors
                                    ${isDark
                                        ? 'text-white placeholder-surface-400'
                                        : 'text-surface-900 placeholder-surface-500'
                                    }
                                `}
                            />
                            <button className={`
                                absolute right-2 p-2 rounded-lg transition-all duration-300
                                ${isDark
                                    ? 'hover:bg-surface-700 hover:text-primary-400'
                                    : 'hover:bg-surface-200 hover:text-primary-500'
                                }
                            `}>
                                <img
                                    src={lupaIcon}
                                    alt="Buscar"
                                    className={`w-5 h-5 ${isDark ? 'filter invert opacity-70' : 'opacity-60'}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Right Zone - Profile & Navigation Button */}
                    <div className="flex items-center gap-3">
                        {/* Profile Button */}
                        <Link
                            to="/perfil"
                            className={`
                                hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group
                                ${isDark
                                    ? 'bg-surface-800 hover:bg-surface-700 border border-surface-700 hover:border-primary-500/50'
                                    : 'bg-surface-100 hover:bg-surface-200 border border-surface-200 hover:border-primary-300'
                                }
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center overflow-hidden
                                bg-gradient-to-br from-primary-500 to-secondary-500
                            `}>
                                <img
                                    src={perfilIcon}
                                    alt="Perfil"
                                    className="w-5 h-5 filter brightness-0 invert"
                                />
                            </div>
                            <div className="text-left">
                                <span className={`block text-sm font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    {userName}
                                </span>
                                <span className={`block text-xs ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    Ver perfil
                                </span>
                            </div>
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center
                                transition-all duration-300 hover:scale-110 active:scale-95
                                ${isDark
                                    ? 'bg-surface-800 hover:bg-surface-700 text-yellow-400 border border-surface-700'
                                    : 'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200'
                                }
                            `}
                            aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
                        >
                            {isDark ? (
                                <span className="text-xl">☀️</span>
                            ) : (
                                <span className="text-xl">🌙</span>
                            )}
                        </button>

                        {/* Navigation Button - Changes based on current page */}
                        {isAdminZone ? (
                            // In Admin Zone: Show "Dashboard" button
                            <Link
                                to="/admin"
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                                    transition-all duration-300 hover:scale-105 active:scale-95
                                    bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700
                                    text-white shadow-md shadow-primary-500/25
                                `}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                        ) : isMainMenu ? (
                            // On Main Menu: Show "Inicio" button to go back to home
                            <Link
                                to="/"
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                                    transition-all duration-300 hover:scale-105 active:scale-95
                                    ${isDark
                                        ? 'bg-surface-800 hover:bg-surface-700 border border-surface-700 text-white'
                                        : 'bg-surface-100 hover:bg-surface-200 border border-surface-200 text-surface-900'
                                    }
                                `}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="hidden sm:inline">Inicio</span>
                            </Link>
                        ) : (
                            // On other pages: Show "Menú" button to go back to menu
                            <Link
                                to="/menu"
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                                    transition-all duration-300 hover:scale-105 active:scale-95
                                    bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700
                                    text-white shadow-md shadow-primary-500/25
                                `}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                <span className="hidden sm:inline">Menú</span>
                            </Link>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                                transition-all duration-300 hover:scale-105 active:scale-95
                                ${isDark
                                    ? 'bg-secondary-500/20 hover:bg-secondary-500/30 border border-secondary-500/50 text-secondary-400'
                                    : 'bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 text-secondary-600'
                                }
                            `}
                            aria-label="Cerrar sesión"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden mt-4">
                    <div className={`
                        relative flex items-center rounded-xl overflow-hidden
                        ${isDark
                            ? 'bg-surface-800 border border-surface-700'
                            : 'bg-surface-100 border border-surface-200'
                        }
                    `}>
                        <input
                            type="text"
                            placeholder="Buscar eventos, lugares o rutas…"
                            className={`
                                w-full px-4 py-2.5 pr-12 text-sm
                                bg-transparent outline-none transition-colors
                                ${isDark
                                    ? 'text-white placeholder-surface-400'
                                    : 'text-surface-900 placeholder-surface-500'
                                }
                            `}
                        />
                        <button className={`
                            absolute right-2 p-2 rounded-lg transition-colors
                            ${isDark
                                ? 'hover:bg-surface-700'
                                : 'hover:bg-surface-200'
                            }
                        `}>
                            <img
                                src={lupaIcon}
                                alt="Buscar"
                                className={`w-5 h-5 ${isDark ? 'filter invert opacity-70' : 'opacity-60'}`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
