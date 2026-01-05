import { useTheme } from '../../contexts/ThemeContext';
import MainMenuHeader from '../../components/menu/MainMenuHeader';
import ExploreSection from '../../components/menu/ExploreSection';
import NewsSection from '../../components/menu/NewsSection';

// Import background image
import fondoMenu from '../../icons/fondo_menu.png';

export default function MainMenuPage() {
    const { isDark } = useTheme();

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Background Image with Overlay */}
            <div className="fixed inset-0 -z-10">
                {/* Background Image */}
                <img
                    src={fondoMenu}
                    alt="Cuenca"
                    className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className={`
                    absolute inset-0
                    ${isDark
                        ? 'bg-surface-900/70'
                        : 'bg-surface-900/50'
                    }
                `} />
                {/* Gradient Overlay for better readability */}
                <div className={`
                    absolute inset-0 bg-gradient-to-b 
                    ${isDark
                        ? 'from-surface-900/80 via-transparent to-surface-900/90'
                        : 'from-surface-900/60 via-transparent to-surface-900/80'
                    }
                `} />
            </div>

            {/* Header */}
            <MainMenuHeader />

            {/* Main Content */}
            <main className="flex-1 pt-32 md:pt-28">
                <ExploreSection />
                <NewsSection />
            </main>

            {/* Footer */}
            <footer className={`
                py-8 text-center transition-colors duration-300
                ${isDark
                    ? 'bg-surface-900/90 backdrop-blur-sm border-t border-surface-800 text-surface-400'
                    : 'bg-surface-900/80 backdrop-blur-sm border-t border-surface-700 text-surface-300'
                }
            `}>
                <div className="container mx-auto px-4">
                    <p className="text-sm font-medium">
                        © 2025 – Por <span className="text-primary-500 font-semibold">Dar Solutions</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}
