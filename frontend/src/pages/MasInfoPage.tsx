import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// Import logos
import LogoPrincipal from '../icons/LogoPrincipal.PNG';
import LogoModoOscuro from '../icons/LogoModoOscuro.PNG';

// Section data
const sections = {
    objetivo: {
        title: 'Objetivo de la Plataforma',
        icon: '🎯',
        content: 'Cuenca Eventos es una plataforma digital diseñada para transformar la manera en que residentes y turistas descubren, planifican y disfrutan los eventos culturales, religiosos, gastronómicos y tradicionales de la ciudad de Cuenca, Patrimonio Cultural de la Humanidad.',
    },
    funcionalidades: {
        title: 'Funcionalidades Principales',
        icon: '⚡',
        items: [
            { icon: '📅', name: 'Calendario de Eventos', desc: 'Visualiza todos los eventos organizados por fecha con filtros por categoría y ubicación.' },
            { icon: '🗺️', name: 'Mapa Interactivo', desc: 'Explora eventos y alertas viales en un mapa de Cuenca con geolocalización en tiempo real.' },
            { icon: '🛤️', name: 'Rutas Turísticas', desc: 'Descubre rutas temáticas (gastronómicas, religiosas, culturales) para recorrer la ciudad.' },
            { icon: '📋', name: 'Agenda Personal', desc: 'Guarda eventos de tu interés y organiza tu itinerario personalizado.' },
            { icon: '🔔', name: 'Alertas de Tránsito', desc: 'Recibe notificaciones sobre cierres viales y desvíos durante eventos.' },
            { icon: '👤', name: 'Perfil Personalizado', desc: 'Configura tus preferencias para recibir recomendaciones personalizadas.' },
        ],
    },
    tecnologias: {
        title: 'Tecnologías Utilizadas',
        icon: '🛠️',
        items: [
            { icon: '⚛️', name: 'React 18', desc: 'Biblioteca de JavaScript para interfaces de usuario interactivas.' },
            { icon: '📘', name: 'TypeScript', desc: 'Superset de JavaScript con tipado estático para código más robusto.' },
            { icon: '⚡', name: 'Vite', desc: 'Herramienta de construcción ultrarrápida para desarrollo web moderno.' },
            { icon: '🎨', name: 'TailwindCSS', desc: 'Framework de CSS utility-first para diseño responsive y moderno.' },
            { icon: '🗺️', name: 'OpenStreetMap', desc: 'Mapas interactivos de código abierto para geolocalización.' },
            { icon: '📱', name: 'PWA Ready', desc: 'Aplicación web progresiva instalable en dispositivos móviles.' },
        ],
    },
    beneficios: {
        title: 'Beneficios',
        icon: '✨',
        groups: [
            {
                title: 'Para Turistas',
                icon: '🌍',
                items: [
                    'Descubrir eventos únicos de la cultura cuencana',
                    'Planificar visitas con rutas optimizadas',
                    'Acceso offline a información esencial',
                    'Alertas de tránsito en tiempo real',
                ],
            },
            {
                title: 'Para Ciudadanos',
                icon: '🏠',
                items: [
                    'No perderse ningún evento local',
                    'Agenda personal para organizar actividades',
                    'Información actualizada sobre festividades',
                    'Participar en la vida cultural de la ciudad',
                ],
            },
            {
                title: 'Para la Ciudad',
                icon: '🏛️',
                items: [
                    'Promoción del turismo y patrimonio cultural',
                    'Mayor difusión de eventos tradicionales',
                    'Digitalización de servicios turísticos',
                    'Fortalecimiento de la identidad cuencana',
                ],
            },
        ],
    },
};

export default function MasInfoPage() {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen py-12 px-4 ${isDark ? 'bg-surface-900' : 'bg-surface-50'}`}>
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className={`
                    absolute top-40 right-10 w-72 h-72 rounded-full blur-3xl opacity-20
                    ${isDark ? 'bg-primary-500' : 'bg-primary-300'}
                `} />
                <div className={`
                    absolute bottom-40 left-10 w-64 h-64 rounded-full blur-3xl opacity-20
                    ${isDark ? 'bg-secondary-500' : 'bg-secondary-300'}
                `} />
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 pt-8">
                    <img
                        src={isDark ? LogoModoOscuro : LogoPrincipal}
                        alt="Cuenca Eventos"
                        className="h-20 mx-auto mb-6"
                    />
                    <h1 className={`text-3xl md:text-4xl font-bold font-display mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                        Más Información
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                        Todo lo que necesitas saber sobre la plataforma Cuenca Eventos
                    </p>
                </div>

                {/* Objetivo Section */}
                <section className={`
                    p-8 rounded-3xl mb-8
                    ${isDark
                        ? 'bg-surface-800/80 backdrop-blur-xl border border-surface-700'
                        : 'bg-white/80 backdrop-blur-xl border border-surface-200 shadow-xl'
                    }
                `}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{sections.objetivo.icon}</span>
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                            {sections.objetivo.title}
                        </h2>
                    </div>
                    <p className={`text-lg leading-relaxed ${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                        {sections.objetivo.content}
                    </p>
                </section>

                {/* Funcionalidades Section */}
                <section className={`
                    p-8 rounded-3xl mb-8
                    ${isDark
                        ? 'bg-surface-800/80 backdrop-blur-xl border border-surface-700'
                        : 'bg-white/80 backdrop-blur-xl border border-surface-200 shadow-xl'
                    }
                `}>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">{sections.funcionalidades.icon}</span>
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                            {sections.funcionalidades.title}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sections.funcionalidades.items.map((item, index) => (
                            <div
                                key={index}
                                className={`
                                    p-4 rounded-2xl flex items-start gap-4
                                    ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                `}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        {item.name}
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tecnologías Section */}
                <section className={`
                    p-8 rounded-3xl mb-8
                    ${isDark
                        ? 'bg-surface-800/80 backdrop-blur-xl border border-surface-700'
                        : 'bg-white/80 backdrop-blur-xl border border-surface-200 shadow-xl'
                    }
                `}>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">{sections.tecnologias.icon}</span>
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                            {sections.tecnologias.title}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {sections.tecnologias.items.map((item, index) => (
                            <div
                                key={index}
                                className={`
                                    p-4 rounded-2xl text-center
                                    ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                `}
                            >
                                <span className="text-3xl block mb-2">{item.icon}</span>
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    {item.name}
                                </h3>
                                <p className={`text-xs mt-1 ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Beneficios Section */}
                <section className={`
                    p-8 rounded-3xl mb-8
                    ${isDark
                        ? 'bg-surface-800/80 backdrop-blur-xl border border-surface-700'
                        : 'bg-white/80 backdrop-blur-xl border border-surface-200 shadow-xl'
                    }
                `}>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">{sections.beneficios.icon}</span>
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                            {sections.beneficios.title}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {sections.beneficios.groups.map((group, index) => (
                            <div
                                key={index}
                                className={`
                                    p-5 rounded-2xl
                                    ${isDark ? 'bg-surface-700/50' : 'bg-surface-50'}
                                `}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">{group.icon}</span>
                                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        {group.title}
                                    </h3>
                                </div>
                                <ul className="space-y-2">
                                    {group.items.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className={`flex items-start gap-2 text-sm ${isDark ? 'text-surface-300' : 'text-surface-600'}`}
                                        >
                                            <span className="text-primary-500 mt-1">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Back Button */}
                <div className="text-center">
                    <Link
                        to="/"
                        className={`
                            inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                            transition-all duration-300 hover:scale-[1.02]
                            ${isDark
                                ? 'bg-surface-800 hover:bg-surface-700 text-white border border-surface-700'
                                : 'bg-white hover:bg-surface-50 text-surface-900 border border-surface-200 shadow-md'
                            }
                        `}
                    >
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
