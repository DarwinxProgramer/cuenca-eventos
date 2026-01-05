import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

// Import icons
import mapaIcon from '../../icons/mapa.png';
import agendaIcon from '../../icons/agenda.png';
import rutasIcon from '../../icons/rutas.png';
import eventoIcon from '../../icons/evento.png';

const exploreItems = [
    {
        id: 1,
        title: 'Calendario',
        icon: null, // Will use emoji
        emoji: '📅',
        path: '/calendario',
        gradient: 'from-primary-500 to-primary-600',
    },
    {
        id: 2,
        title: 'Mapa',
        icon: mapaIcon,
        emoji: null,
        path: '/mapa',
        gradient: 'from-secondary-500 to-secondary-600',
    },
    {
        id: 3,
        title: 'Eventos',
        icon: eventoIcon,
        emoji: null,
        path: '/eventos',
        gradient: 'from-accent-500 to-accent-600',
    },
    {
        id: 4,
        title: 'Rutas',
        icon: rutasIcon,
        emoji: null,
        path: '/rutas',
        gradient: 'from-primary-600 to-secondary-500',
    },
    {
        id: 5,
        title: 'Mi Agenda',
        icon: agendaIcon,
        emoji: null,
        path: '/agenda',
        gradient: 'from-secondary-600 to-accent-500',
    },
];

export default function ExploreSection() {
    const { isDark } = useTheme();

    return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <h2 className={`
                    text-2xl sm:text-3xl font-bold font-display mb-8
                    ${isDark ? 'text-white' : 'text-white'}
                `}>
                    Explorar
                </h2>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                    {exploreItems.map((item, index) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`
                                group relative p-6 rounded-2xl transition-all duration-300
                                hover:scale-[1.05] hover:-translate-y-2 cursor-pointer
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700 hover:border-primary-500/50'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg hover:shadow-xl hover:border-primary-300'
                                }
                            `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Icon Container */}
                            <div className={`
                                w-16 h-16 mx-auto rounded-xl mb-4 flex items-center justify-center
                                bg-gradient-to-br ${item.gradient}
                                shadow-md group-hover:scale-110 transition-transform duration-300
                            `}>
                                {item.emoji ? (
                                    <span className="text-3xl">{item.emoji}</span>
                                ) : (
                                    <img
                                        src={item.icon!}
                                        alt={item.title}
                                        className="w-8 h-8 object-contain filter brightness-0 invert"
                                    />
                                )}
                            </div>

                            {/* Title */}
                            <h3 className={`
                                text-center text-sm sm:text-base font-semibold
                                ${isDark ? 'text-white' : 'text-surface-900'}
                            `}>
                                {item.title}
                            </h3>

                            {/* Subtle Glow Effect on Hover */}
                            <div className={`
                                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20
                                transition-opacity duration-300 -z-10 blur-xl
                                bg-gradient-to-br ${item.gradient}
                            `} />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
