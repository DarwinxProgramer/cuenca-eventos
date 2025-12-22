import { useTheme } from '../../context/ThemeContext';

// Import custom icons
import rutasIcon from '../../icons/rutas.png';
import agendaIcon from '../../icons/agenda.png';
import mapaIcon from '../../icons/mapa.png';
import destacadosIcon from '../../icons/destacados.png';

const features = [
    {
        id: 1,
        icon: rutasIcon,
        title: 'Rutas temáticas',
        description: 'Explora recorridos culturales únicos diseñados para cada tipo de viajero.',
        gradient: 'from-primary-500 to-primary-600',
    },
    {
        id: 2,
        icon: agendaIcon,
        title: 'Agenda de eventos',
        description: 'Mantente al día con todos los eventos próximos y no te pierdas ninguno.',
        gradient: 'from-secondary-500 to-secondary-600',
    },
    {
        id: 3,
        icon: mapaIcon,
        title: 'Mapa interactivo',
        description: 'Encuentra ubicaciones exactas y planifica tu visita de manera eficiente.',
        gradient: 'from-accent-500 to-accent-600',
    },
    {
        id: 4,
        icon: destacadosIcon,
        title: 'Eventos destacados',
        description: 'Descubre los eventos más populares y mejor valorados por la comunidad.',
        gradient: 'from-primary-600 to-secondary-500',
    },
];

export default function FeaturesSection() {
    const { isDark } = useTheme();

    return (
        <section className={`
      py-20 transition-colors duration-300
      ${isDark ? 'bg-surface-800/50' : 'bg-surface-50'}
    `}>
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <span className={`
            inline-block px-4 py-1 rounded-full text-sm font-medium
            ${isDark
                            ? 'bg-primary-500/20 text-primary-400'
                            : 'bg-primary-100 text-primary-600'
                        }
          `}>
                        Funcionalidades
                    </span>
                    <h2 className={`
            text-3xl sm:text-4xl font-bold font-display
            ${isDark ? 'text-white' : 'text-surface-900'}
          `}>
                        Todo lo que necesitas en un solo lugar
                    </h2>
                    <p className={`
            text-lg max-w-2xl mx-auto
            ${isDark ? 'text-surface-400' : 'text-surface-600'}
          `}>
                        Nuestra plataforma te ofrece herramientas diseñadas para que vivas
                        la mejor experiencia cultural en Cuenca.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            className={`
                group relative p-6 rounded-2xl transition-all duration-300
                hover:scale-[1.02] hover:-translate-y-1 cursor-pointer
                ${isDark
                                    ? 'bg-surface-800 border border-surface-700 hover:border-primary-500/30'
                                    : 'bg-white border border-surface-200 shadow-md hover:shadow-lg hover:border-primary-200'
                                }
              `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Icon Container */}
                            <div className={`
                w-14 h-14 rounded-xl mb-5 flex items-center justify-center p-2
                bg-gradient-to-br ${feature.gradient}
                shadow-md group-hover:scale-105 transition-transform duration-300
              `}>
                                <img src={feature.icon} alt={feature.title} className="w-8 h-8 object-contain filter brightness-0 invert" />
                            </div>

                            {/* Content */}
                            <h3 className={`
                text-lg font-bold mb-2
                ${isDark ? 'text-white' : 'text-surface-900'}
              `}>
                                {feature.title}
                            </h3>
                            <p className={`
                text-sm leading-relaxed
                ${isDark ? 'text-surface-400' : 'text-surface-600'}
              `}>
                                {feature.description}
                            </p>

                            {/* Subtle Hover Glow Effect */}
                            <div className={`
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 
                transition-opacity duration-300 -z-10 blur-xl
                bg-gradient-to-br ${feature.gradient}
              `} style={{ transform: 'scale(0.9)' }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
