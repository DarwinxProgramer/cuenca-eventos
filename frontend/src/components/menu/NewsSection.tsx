import { useTheme } from '../../context/ThemeContext';

// Import event images
import FestivalLuces from '../../icons/eventos/Festival de luces.jpg';
import CorpusChristi from '../../icons/eventos/corpus christi.jpg';
import ExpoArte from '../../icons/eventos/expo arte.jpeg';
import ViaCerrada from '../../icons/eventos/via cerrada.jpg';

// News data with real images
const newsItems = [
    {
        id: 1,
        title: 'Festival de Luces 2025',
        description: 'El Centro Histórico de Cuenca se ilumina con más de 50 instalaciones lumínicas artísticas. Disfruta de un recorrido mágico por las calles empedradas mientras admiras proyecciones y esculturas de luz que transforman la ciudad en un escenario de ensueño.',
        date: '25 Dic 2025',
        time: '18:00 - 23:00',
        location: 'Centro Histórico',
        type: 'evento',
        image: FestivalLuces,
    },
    {
        id: 2,
        title: 'Corpus Christi - Fiesta del Septenario',
        description: 'Una de las celebraciones más importantes de Cuenca. Siete días de festividades religiosas y culturales con procesiones, fuegos artificiales, y los tradicionales dulces típicos en el Parque Calderón. Una experiencia única de fe y tradición.',
        date: '19 Jun 2025',
        time: 'Todo el día',
        location: 'Catedral de la Inmaculada',
        type: 'destacado',
        image: CorpusChristi,
    },
    {
        id: 3,
        title: 'Expo Arte Contemporáneo',
        description: 'El Museo de Arte Moderno presenta una exposición sin precedentes con obras de artistas locales e internacionales. Pinturas, esculturas e instalaciones que desafían los límites del arte tradicional. Entrada gratuita para estudiantes.',
        date: '15 Ene 2025',
        time: '09:00 - 17:00',
        location: 'Museo de Arte Moderno',
        type: 'evento',
        image: ExpoArte,
    },
    {
        id: 4,
        title: 'Via Cerrada por ',
        description: 'El desfile navideño más grande y colorido del Ecuador. Miles de participantes recorren las calles de Cuenca con carros alegóricos, niños disfrazados y ofrendas al Niño Jesús. Una tradición declarada Patrimonio Cultural del Ecuador.',
        date: '24 Dic 2025',
        time: '10:00 - 18:00',
        location: 'Presidente cordova y tarqui',
        type: 'destacado',
        image: ViaCerrada,
    },
];

const getTypeStyles = (type: string, isDark: boolean) => {
    switch (type) {
        case 'evento':
            return isDark
                ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                : 'bg-primary-100 text-primary-600 border-primary-200';
        case 'aviso':
            return isDark
                ? 'bg-accent-500/20 text-accent-400 border-accent-500/30'
                : 'bg-accent-100 text-accent-600 border-accent-200';
        case 'destacado':
            return isDark
                ? 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30'
                : 'bg-secondary-100 text-secondary-600 border-secondary-200';
        default:
            return isDark
                ? 'bg-surface-700 text-surface-300 border-surface-600'
                : 'bg-surface-100 text-surface-600 border-surface-200';
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'evento': return 'Evento';
        case 'aviso': return 'Aviso';
        case 'destacado': return '⭐ Destacado';
        default: return 'Noticia';
    }
};

export default function NewsSection() {
    const { isDark } = useTheme();

    return (
        <section className="py-8 pb-16">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className={`
                        text-2xl sm:text-3xl font-bold font-display
                        ${isDark ? 'text-white' : 'text-white'}
                    `}>
                        Noticias y Avisos
                    </h2>
                    <span className={`
                        px-4 py-2 rounded-full text-sm font-medium
                        ${isDark
                            ? 'bg-surface-800/80 text-surface-300 border border-surface-700'
                            : 'bg-white/20 text-white border border-white/30'
                        }
                    `}>
                        {newsItems.length} eventos próximos
                    </span>
                </div>

                {/* News Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {newsItems.map((news, index) => (
                        <article
                            key={news.id}
                            className={`
                                group rounded-2xl overflow-hidden transition-all duration-300
                                hover:scale-[1.02] hover:-translate-y-2 cursor-pointer
                                ${isDark
                                    ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700 hover:border-primary-500/50'
                                    : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg hover:shadow-2xl'
                                }
                            `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Image */}
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={news.image}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Type Badge */}
                                <span className={`
                                    absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm
                                    ${getTypeStyles(news.type, isDark)}
                                `}>
                                    {getTypeLabel(news.type)}
                                </span>

                                {/* Location on image */}
                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-medium">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {news.location}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {/* Title */}
                                <h3 className={`
                                    text-base font-bold mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors
                                    ${isDark ? 'text-white' : 'text-surface-900'}
                                `}>
                                    {news.title}
                                </h3>

                                {/* Description */}
                                <p className={`
                                    text-sm leading-relaxed mb-4 line-clamp-3
                                    ${isDark ? 'text-surface-400' : 'text-surface-600'}
                                `}>
                                    {news.description}
                                </p>

                                {/* Footer with date and time */}
                                <div className={`
                                    flex items-center justify-between text-xs font-medium pt-3 border-t
                                    ${isDark ? 'border-surface-700 text-surface-500' : 'border-surface-200 text-surface-400'}
                                `}>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {news.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {news.time}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
