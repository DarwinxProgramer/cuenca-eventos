import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Import logos
import LogoPrincipal from '../../icons/LogoPrincipal.PNG';
import LogoModoOscuro from '../../icons/LogoModoOscuro.PNG';

export default function LoginPage() {
    const { isDark } = useTheme();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(
        (location.state as { message?: string })?.message || ''
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to login using AuthContext
        const success = await login(email, password);

        if (success) {
            // Redirect based on role
            // Admin (email: admin@gmail.com) goes to admin panel
            // Regular users go to normal menu
            if (email.toLowerCase() === 'admin@gmail.com') {
                navigate('/admin');
            } else {
                navigate('/menu');
            }
        } else {
            setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        }

        setIsLoading(false);
    };



    return (
        <div className={`
      min-h-screen flex items-center justify-center px-4 py-12
      ${isDark
                ? 'bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900'
                : 'bg-gradient-to-br from-surface-50 via-white to-surface-100'
            }
    `}>
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className={`
          absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20
          ${isDark ? 'bg-primary-500' : 'bg-primary-300'}
        `} />
                <div className={`
          absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20
          ${isDark ? 'bg-secondary-500' : 'bg-secondary-300'}
        `} />
            </div>

            <div className={`
        w-full max-w-md p-8 rounded-3xl transition-colors duration-300
        ${isDark
                    ? 'bg-surface-800/80 backdrop-blur-xl border border-surface-700'
                    : 'bg-white/80 backdrop-blur-xl border border-surface-200 shadow-2xl'
                }
      `}>
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6">
                        <img
                            src={isDark ? LogoModoOscuro : LogoPrincipal}
                            alt="Cuenca Eventos"
                            className="h-16 mx-auto"
                        />
                    </Link>
                    <h1 className={`text-2xl font-bold font-display ${isDark ? 'text-white' : 'text-surface-900'}`}>
                        Bienvenido de nuevo
                    </h1>
                    <p className={`mt-2 ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                        Inicia sesión para continuar
                    </p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                    <button
                        type="button"
                        className={`
              w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3
              transition-all duration-300 hover:scale-[1.02]
              ${isDark
                                ? 'bg-surface-700 hover:bg-surface-600 text-white border border-surface-600'
                                : 'bg-white hover:bg-surface-50 text-surface-700 border border-surface-300 shadow-sm'
                            }
            `}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>

                    <button
                        type="button"
                        className={`
              w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3
              transition-all duration-300 hover:scale-[1.02]
              bg-[#1877F2] hover:bg-[#166FE5] text-white
            `}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Continuar con Facebook
                    </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                    <div className={`absolute inset-0 flex items-center`}>
                        <div className={`w-full border-t ${isDark ? 'border-surface-700' : 'border-surface-200'}`}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className={`px-4 ${isDark ? 'bg-surface-800 text-surface-400' : 'bg-white text-surface-500'}`}>
                            o continúa con email
                        </span>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {successMessage && (
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center">
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@gmail.com"
                            required
                            className={`
                w-full px-4 py-3 rounded-xl transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-primary-500
                ${isDark
                                    ? 'bg-surface-700 border-surface-600 text-white placeholder-surface-400'
                                    : 'bg-surface-50 border-surface-200 text-surface-900 placeholder-surface-400'
                                }
                border
              `}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className={`
                w-full px-4 py-3 rounded-xl transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-primary-500
                ${isDark
                                    ? 'bg-surface-700 border-surface-600 text-white placeholder-surface-400'
                                    : 'bg-surface-50 border-surface-200 text-surface-900 placeholder-surface-400'
                                }
                border
              `}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                            <input type="checkbox" className="rounded border-surface-300 text-primary-500 focus:ring-primary-500" />
                            Recordarme
                        </label>
                        <Link to="/recuperar" className="text-primary-500 hover:text-primary-600 font-medium">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`
              w-full py-3 px-4 rounded-xl font-semibold
              bg-gradient-to-r from-primary-500 to-primary-600 
              hover:from-primary-600 hover:to-primary-700
              text-white transition-all duration-300 
              hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              shadow-lg shadow-primary-500/25
            `}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Iniciando sesión...
                            </span>
                        ) : 'Iniciar sesión'}
                    </button>
                </form>

                {/* Register Link */}
                <p className={`mt-8 text-center text-sm ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                    ¿No tienes una cuenta?{' '}
                    <Link to="/registro" className="text-primary-500 hover:text-primary-600 font-semibold">
                        Regístrate aquí
                    </Link>
                </p>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className={`
              inline-flex items-center gap-2 text-sm font-medium
              ${isDark ? 'text-surface-400 hover:text-surface-200' : 'text-surface-500 hover:text-surface-700'}
              transition-colors
            `}
                    >
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div >
    );
}
