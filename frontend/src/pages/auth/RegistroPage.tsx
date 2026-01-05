import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';

// Import logos
import LogoPrincipal from '../../icons/LogoPrincipal.PNG';
import LogoModoOscuro from '../../icons/LogoModoOscuro.PNG';

export default function RegistroPage() {
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        city: 'Cuenca',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }



        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Register the new user
            await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                city: formData.city,
                // gender: 'Otro', // Backend might need this if required, checking default behavior
                // memberSince managed by backend
                // preferences managed by backend
            }, false); // false = no auth required

            // Success - redirect to login
            navigate('/login', {
                state: { message: '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.' }
            });
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(err);
            if (err.message && err.message.includes('registered')) {
                setError('Este correo ya está registrado.');
            } else {
                setError('Error al crear la cuenta. Intenta de nuevo.');
            }
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
                    ${isDark ? 'bg-secondary-500' : 'bg-secondary-300'}
                `} />
                <div className={`
                    absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20
                    ${isDark ? 'bg-primary-500' : 'bg-primary-300'}
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
                        Crear cuenta
                    </h1>
                    <p className={`mt-2 ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                        Únete a la comunidad de Cuenca Eventos
                    </p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Name Field */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                            Nombre completo *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Tu nombre"
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

                    {/* Email Field */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                            Correo electrónico *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
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

                    {/* Password Field */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                            Contraseña *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
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

                    {/* Confirm Password Field */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                            Confirmar contraseña *
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repite tu contraseña"
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

                    {/* Phone Field (Optional) */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                            Teléfono (opcional)
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+593 99 123 4567"
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

                    {/* City Field */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-surface-300' : 'text-surface-700'}`}>
                            Ciudad
                        </label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`
                                w-full px-4 py-3 rounded-xl transition-all duration-300
                                focus:outline-none focus:ring-2 focus:ring-primary-500
                                ${isDark
                                    ? 'bg-surface-700 border-surface-600 text-white'
                                    : 'bg-surface-50 border-surface-200 text-surface-900'
                                }
                                border
                            `}
                        >
                            <option value="Cuenca">Cuenca</option>
                            <option value="Quito">Quito</option>
                            <option value="Guayaquil">Guayaquil</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`
                            w-full py-3 px-4 rounded-xl font-semibold mt-6
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
                                Creando cuenta...
                            </span>
                        ) : 'Crear cuenta'}
                    </button>
                </form>

                {/* Login Link */}
                <p className={`mt-8 text-center text-sm ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
                        Inicia sesión
                    </Link>
                </p>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className={`
                            inline-flex items-center gap-2 text-sm font-medium
                            ${isDark ? 'text-surface-400 hover:text-surface-200' : 'text-surface-500 hover:text-surface-700'}
                            transition-colors
                        `}
                    >
                        ← Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
