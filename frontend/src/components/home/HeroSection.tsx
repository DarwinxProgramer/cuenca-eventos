import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { eventsApi, EventFromAPI, getImageUrl } from '../../services/eventsApi';


// Placeholder image for events without images
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOTczMTY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZWE1ODBlO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNDAiPvCfjok8L3RleHQ+PC9zdmc+';

// Sample avatars for social proof
const avatars = [
    { id: 1, color: 'bg-primary-400' },
    { id: 2, color: 'bg-secondary-400' },
    { id: 3, color: 'bg-accent-400' },
    { id: 4, color: 'bg-primary-500' },
];

type GalleryItem = {
    id: string | number;
    title: string;
    image: string;
    location: string;
};

export default function HeroSection() {
    const { isDark } = useTheme();
    const [activeImage, setActiveImage] = useState(0);
    const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);

    useEffect(() => {
        loadCurrentMonthEvents();
    }, []);

    const loadCurrentMonthEvents = async () => {
        try {
            const allEvents = await eventsApi.list();

            // Get current month and year
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Filter events for current month
            const monthEvents = allEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getMonth() === currentMonth &&
                    eventDate.getFullYear() === currentYear;
            });

            // Take up to 4 events for the gallery
            const limitedEvents = monthEvents.slice(0, 4);

            // Convert events to gallery format
            const galleryData = limitedEvents.map(event => ({
                id: event._id,
                title: event.title,
                image: getEventImage(event),
                location: event.location
            }));
            setGalleryImages(galleryData);
        } catch (error) {
            console.error('Error loading current month events:', error);
            setGalleryImages([]);
        }
    };

    const getEventImage = (event: EventFromAPI): string => {
        // Fix: Use getImageUrl for image_url too, to handle relative paths (/api/v1/...)
        if (event.image_url) return getImageUrl(event.image_url) || PLACEHOLDER_IMAGE;
        if (event.image_id) return getImageUrl(event.image_id) || PLACEHOLDER_IMAGE;
        return PLACEHOLDER_IMAGE;
    };

    const nextImage = () => {
        setActiveImage((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = () => {
        setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    return (
        <section className={`min-h-screen pt-32 pb-16 relative overflow-hidden flex items-center ${isDark ? 'bg-surface-900' : 'bg-surface-50'}`}>
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className={`
          absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl opacity-20
          ${isDark ? 'bg-primary-500' : 'bg-primary-300'}
        `} />
                <div className={`
          absolute bottom-20 left-0 w-80 h-80 rounded-full blur-3xl opacity-20
          ${isDark ? 'bg-secondary-500' : 'bg-secondary-300'}
        `} />
            </div>

            <div className="mx-auto px-6 w-full max-w-[1440px]">
                {/* Grid Container: gap-12 para separar columnas, items-center para centrar verticalmente */}
                <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* Left Side - Content */}
                    <div className="
                        lg:col-span-6
                        lg:relative
                        lg:z-20
                        space-y-8
                        animate-fade-in
                        ">

                        {/* Tagline */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20">
                            <span className="text-primary-500 font-semibold">Vive la tradición</span>
                            <span className="text-2xl">🎉</span>
                        </div>

                        {/* Main Title */}
                        <h1 className={`
              text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight
              ${isDark ? 'text-white' : 'text-surface-900'}
            `}>
                            Descubre, planifica y{' '}
                            <span className="text-gradient">disfruta</span>{' '}
                            los eventos de la ciudad
                        </h1>

                        {/* Description */}
                        <p className={`
              text-lg sm:text-xl max-w-xl leading-relaxed
              ${isDark ? 'text-surface-300' : 'text-surface-600'}
            `}>
                            Tu guía digital para explorar la cultura, tradición y alegría de nuestra ciudad.
                            <br />
                            <span className="font-medium">Encuentra los mejores eventos diseñados para ti.</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link to="/explorar" className="btn-primary flex items-center gap-2">
                                <span>Explorar eventos</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link to="/intereses" className="btn-secondary">
                                Personalizar intereses
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex -space-x-3">
                                {avatars.map((avatar) => (
                                    <div
                                        key={avatar.id}
                                        className={`
                      w-10 h-10 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold
                      ${avatar.color}
                      ${isDark ? 'border-surface-900' : 'border-white'}
                    `}
                                    >
                                        👤
                                    </div>
                                ))}
                                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold
                  ${isDark
                                        ? 'bg-surface-800 border-surface-900 text-surface-300'
                                        : 'bg-surface-100 border-white text-surface-600'
                                    }
                `}>
                                    +99
                                </div>
                            </div>
                            <div>
                                <p className={`font-semibold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    +1,200
                                </p>
                                <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                    Turistas conectados
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Map & Gallery Container */}
                    <div className="lg:col-span-6 space-y-4 animate-slide-up lg:pl-8">

                        {/* 1. OpenStreetMap Embed - Parte Superior */}
                        {/* Se ajustó la altura a h-64 sm:h-72 para que no sea excesivamente alto */}
                        <div className={`
                            relative rounded-2xl overflow-hidden h-64 sm:h-72 w-full shadow-lg
                            ${isDark
                                ? 'border border-surface-700'
                                : 'border border-surface-200'
                            }
                        `}>
                            <iframe
                                title="Mapa de Cuenca"
                                src="https://www.openstreetmap.org/export/embed.html?bbox=-79.02%2C-2.91%2C-78.99%2C-2.88&layer=mapnik&marker=-2.8974%2C-79.0045"
                                style={{ border: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                            {/* Etiqueta flotante opcional para indicar que es el mapa */}
                            <div className="absolute top-2 right-2 bg-surface-900/80 backdrop-blur text-white text-xs px-2 py-1 rounded">
                                📍 Mapa interactivo
                            </div>
                        </div>

                        {/* 2. Mini Gallery - Parte Inferior */}
                        <div className="relative">
                            {galleryImages.length > 0 ? (
                                <>
                                    {/* Main Gallery Image */}
                                    <div className={`
                                        relative rounded-2xl overflow-hidden aspect-[16/9] mb-3 shadow-lg
                                        ${isDark ? 'border border-surface-700' : 'border border-surface-200'}
                                    `}>
                                        <img
                                            src={galleryImages[activeImage].image}
                                            alt={galleryImages[activeImage].title}
                                            className="w-full h-full object-cover transition-all duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-4 text-white">
                                            <h3 className="font-bold text-lg">{galleryImages[activeImage].title}</h3>
                                            <p className="text-sm text-white/90 flex items-center gap-1">
                                                <span className="text-xs">📍</span> {galleryImages[activeImage].location}
                                            </p>
                                        </div>

                                        {/* Navigation Arrows */}
                                        {galleryImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors border border-white/30"
                                                >
                                                    ◀
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors border border-white/30"
                                                >
                                                    ▶
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Thumbnail Navigation */}
                                    {galleryImages.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {galleryImages.map((image, index) => (
                                                <button
                                                    key={image.id}
                                                    onClick={() => setActiveImage(index)}
                                                    className={`
                                                        aspect-square rounded-lg overflow-hidden transition-all duration-300 relative
                                                        ${activeImage === index
                                                            ? 'ring-2 ring-primary-500 ring-offset-2 opacity-100'
                                                            : 'opacity-60 hover:opacity-100'
                                                        }
                                                        ${isDark ? 'ring-offset-surface-900' : 'ring-offset-white'}
                                                    `}
                                                >
                                                    <img
                                                        src={image.image}
                                                        alt={image.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={`
                                    relative rounded-2xl overflow-hidden aspect-[16/9] mb-3 shadow-lg flex items-center justify-center
                                    ${isDark ? 'bg-surface-800 border border-surface-700' : 'bg-surface-100 border border-surface-200'}
                                `}>
                                    <div className="text-center p-8">
                                        <div className="text-6xl mb-4">📅</div>
                                        <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                            No hay eventos este mes
                                        </h3>
                                        <p className={`text-sm ${isDark ? 'text-surface-400' : 'text-surface-600'}`}>
                                            Próximamente nuevos eventos
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}