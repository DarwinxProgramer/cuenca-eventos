import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

// Import event images
import FestivalLuces from '../../icons/eventos/Festival de luces.jpg';
import CorpusChristi from '../../icons/eventos/corpus christi.jpg';
import ExpoArte from '../../icons/eventos/expo arte.jpeg';
import PaseNino from '../../icons/eventos/pase del niño.jpg';

// Gallery images with event data
const galleryImages = [
    { id: 1, title: 'Festival de Luces', image: FestivalLuces, location: 'Centro Histórico' },
    { id: 2, title: 'Corpus Christi', image: CorpusChristi, location: 'Catedral' },
    { id: 3, title: 'Expo Arte', image: ExpoArte, location: 'Museo de Arte Moderno' },
    { id: 4, title: 'Pase del Niño', image: PaseNino, location: 'Calles de Cuenca' },
];

// Sample avatars for social proof
const avatars = [
    { id: 1, color: 'bg-primary-400' },
    { id: 2, color: 'bg-secondary-400' },
    { id: 3, color: 'bg-accent-400' },
    { id: 4, color: 'bg-primary-500' },
];

export default function HeroSection() {
    const { isDark } = useTheme();
    const [activeImage, setActiveImage] = useState(0);

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
                            </div>

                            {/* Thumbnail Navigation */}
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
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}