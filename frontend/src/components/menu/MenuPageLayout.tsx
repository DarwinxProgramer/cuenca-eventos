import { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';
import MainMenuHeader from './MainMenuHeader';

// Import background image
import fondoMenu from '../../icons/eventos/fondo_menu.png';

interface MenuPageLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function MenuPageLayout({ children, title }: MenuPageLayoutProps) {
    const { isDark } = useTheme();

    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Background Image with Overlay */}
            <div className="fixed inset-0 -z-10">
                <img
                    src={fondoMenu}
                    alt="Cuenca"
                    className="w-full h-full object-cover"
                />
                <div className={`
                    absolute inset-0
                    ${isDark ? 'bg-surface-900/75' : 'bg-surface-900/55'}
                `} />
                <div className={`
                    absolute inset-0 bg-gradient-to-b 
                    ${isDark
                        ? 'from-surface-900/80 via-transparent to-surface-900/90'
                        : 'from-surface-900/60 via-transparent to-surface-900/80'
                    }
                `} />
            </div>

            {/* Header */}
            <MainMenuHeader pageTitle={title} />

            {/* Main Content */}
            <main className="flex-1 pt-32 md:pt-28 pb-8">
                {children}
            </main>

            {/* Footer */}
            <footer className={`
                py-6 text-center transition-colors duration-300
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
