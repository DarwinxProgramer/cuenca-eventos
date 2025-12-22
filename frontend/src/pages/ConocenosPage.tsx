import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// Import logos
import LogoPrincipal from '../icons/LogoPrincipal.PNG';
import LogoModoOscuro from '../icons/LogoModoOscuro.PNG';

// Team members data
const teamMembers = [
    {
        id: 1,
        name: 'Darwin Chuqui',
        role: 'Líder de Proyecto (PM), Diseño UI y Prototipado',
        description: 'Responsable de la gestión global del proyecto, cumplimiento del cronograma y liderazgo en el diseño visual e interactividad del prototipo.',
        isLeader: true,
        emoji: '👨‍💼',
    },
    {
        id: 2,
        name: 'Alejandro Cabrera',
        role: 'Investigador UX',
        description: 'Responsable de la investigación de usuarios, definición de perfiles y análisis de necesidades.',
        isLeader: false,
        emoji: '🔍',
    },
    {
        id: 3,
        name: 'Fabián López',
        role: 'Tester e Investigador UX',
        description: 'Responsable de apoyar la investigación UX y liderar las pruebas de calidad y usabilidad.',
        isLeader: false,
        emoji: '🧪',
    },
    {
        id: 4,
        name: 'Andrés Meneses',
        role: 'Documentación, Redacción y Análisis de Contenidos',
        description: 'Responsable de la redacción técnica, coherencia del contenido y calidad de los entregables escritos.',
        isLeader: false,
        emoji: '📝',
    },
    {
        id: 5,
        name: 'Christopher Timbi',
        role: 'Diseñador UI y Programador Principal',
        description: 'Responsable del desarrollo técnico, factibilidad del sistema y apoyo en el diseño de la interfaz gráfica.',
        isLeader: false,
        emoji: '💻',
    },
];

export default function ConocenosPage() {
    const { isDark } = useTheme();

    return (
        <div className={`min-h-screen py-12 px-4 ${isDark ? 'bg-surface-900' : 'bg-surface-50'}`}>
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className={`
                    absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl opacity-20
                    ${isDark ? 'bg-primary-500' : 'bg-primary-300'}
                `} />
                <div className={`
                    absolute bottom-20 left-0 w-80 h-80 rounded-full blur-3xl opacity-20
                    ${isDark ? 'bg-secondary-500' : 'bg-secondary-300'}
                `} />
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Header with Logo */}
                <div className="text-center mb-12 pt-8">
                    {/* Centered Logo */}
                    <div className="mb-8">
                        <img
                            src={isDark ? LogoModoOscuro : LogoPrincipal}
                            alt="Cuenca Eventos"
                            className="h-24 mx-auto"
                        />
                    </div>

                    {/* Project Name */}
                    <h1 className={`text-3xl md:text-4xl font-bold font-display mb-4 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                        Transformación Digital de la Experiencia de Eventos en Cuenca
                    </h1>

                    {/* Team Name */}
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg mb-4">
                        <span className="text-2xl">🚀</span>
                        <span className="text-xl font-bold">Equipo Dar Solutions</span>
                    </div>

                    <p className={`text-lg max-w-2xl mx-auto mt-4 ${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                        Conoce al equipo detrás de esta innovadora plataforma para eventos y turismo en Cuenca.
                    </p>
                </div>

                {/* Team Leader Card - Featured */}
                <div className="mb-8">
                    {teamMembers.filter(m => m.isLeader).map(member => (
                        <div
                            key={member.id}
                            className={`
                                relative p-8 rounded-3xl transition-all duration-300
                                ${isDark
                                    ? 'bg-gradient-to-br from-yellow-900/30 to-surface-800 border-2 border-yellow-500/50'
                                    : 'bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-400 shadow-xl shadow-yellow-200/30'
                                }
                            `}
                        >
                            {/* Leader Badge */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-surface-900 font-bold text-sm flex items-center gap-2 shadow-lg">
                                    <span>👑</span>
                                    <span>Líder del Equipo</span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
                                {/* Avatar */}
                                <div className={`
                                    w-24 h-24 rounded-full flex items-center justify-center text-4xl
                                    bg-gradient-to-br from-yellow-400 to-yellow-500
                                    ring-4 ring-yellow-300 shadow-lg
                                `}>
                                    {member.emoji}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        {member.name}
                                    </h3>
                                    <p className="text-yellow-500 font-semibold mb-2">
                                        {member.role}
                                    </p>
                                    <p className={`${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                                        {member.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {teamMembers.filter(m => !m.isLeader).map(member => (
                        <div
                            key={member.id}
                            className={`
                                p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]
                                ${isDark
                                    ? 'bg-surface-800/80 backdrop-blur-xl border border-surface-700 hover:border-primary-500/50'
                                    : 'bg-white/80 backdrop-blur-xl border border-surface-200 shadow-lg hover:shadow-xl hover:border-primary-300'
                                }
                            `}
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className={`
                                    w-16 h-16 rounded-2xl flex items-center justify-center text-2xl
                                    ${isDark
                                        ? 'bg-surface-700'
                                        : 'bg-gradient-to-br from-primary-100 to-secondary-100'
                                    }
                                `}>
                                    {member.emoji}
                                </div>

                                <div className="flex-1">
                                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                        {member.name}
                                    </h3>
                                    <p className="text-primary-500 font-medium text-sm mb-2">
                                        {member.role}
                                    </p>
                                    <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                                        {member.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

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
