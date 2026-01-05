import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

// Import logos
import LogoPrincipal from '../../icons/LogoPrincipal.PNG';
import LogoModoOscuro from '../../icons/LogoModoOscuro.PNG';

const navLinks = [
    { name: 'Conócenos', path: '/conocenos' },
    { name: 'Más información', path: '/info' },
    { name: 'Explorar', path: '/explorar' },
];

export default function Header() {
    const { toggleTheme, isDark } = useTheme();
    const location = useLocation();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <div className={`
        mx-4 mt-4 rounded-2xl px-6 py-4
        ${isDark
                    ? 'bg-surface-900/80 backdrop-blur-xl border border-surface-700/50'
                    : 'bg-white/80 backdrop-blur-xl border border-surface-200/50 shadow-lg shadow-surface-200/20'
                }
      `}>
                <div className="flex items-center justify-between">
                    {/* Left Zone - Logo and Welcome Text */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src={isDark ? LogoModoOscuro : LogoPrincipal}
                            alt="Cuenca Eventos Logo"
                            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className={`
              hidden sm:block text-sm font-medium transition-colors
              ${isDark ? 'text-surface-300' : 'text-surface-600'}
            `}>
                            Bienvenidos a Cuenca Eventos
                        </span>
                    </Link>

                    {/* Center Zone - Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`
                    px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300
                    ${isActive
                                            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                                            : isDark
                                                ? 'text-surface-300 hover:text-white hover:bg-surface-800'
                                                : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                                        }
                  `}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Zone - Login & Theme Toggle */}
                    <div className="flex items-center gap-3">
                        {/* Login Button */}
                        <Link
                            to="/login"
                            className={`
                px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300
                ${isDark
                                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/30'
                                    : 'bg-surface-900 hover:bg-surface-800 text-white'
                                }
                hover:scale-105 active:scale-95
              `}
                        >
                            Iniciar sesión
                        </Link>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className={`
                w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-300 hover:scale-110 active:scale-95
                ${isDark
                                    ? 'bg-surface-800 hover:bg-surface-700 text-yellow-400'
                                    : 'bg-surface-100 hover:bg-surface-200 text-surface-700'
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

                        {/* Mobile Menu Button */}
                        <button
                            className={`
                md:hidden w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-300
                ${isDark
                                    ? 'bg-surface-800 hover:bg-surface-700 text-surface-300'
                                    : 'bg-surface-100 hover:bg-surface-200 text-surface-600'
                                }
              `}
                            aria-label="Menú"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
