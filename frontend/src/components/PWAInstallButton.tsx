import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsInstallable(false);
            setIsInstalled(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installApp = async () => {
        if (!deferredPrompt) return false;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
            return true;
        }
        return false;
    };

    return { isInstallable, isInstalled, installApp };
}

interface PWAInstallButtonProps {
    className?: string;
}

export default function PWAInstallButton({ className = '' }: PWAInstallButtonProps) {
    const { isDark } = useTheme();
    const { isInstallable, isInstalled, installApp } = usePWAInstall();
    const [showTooltip, setShowTooltip] = useState(false);

    const handleClick = async () => {
        if (isInstallable) {
            const success = await installApp();
            if (success) {
                setShowTooltip(true);
                setTimeout(() => setShowTooltip(false), 3000);
            }
        } else if (!isInstalled) {
            // Show instructions for manual installation
            alert(
                '📱 Para instalar la app:\n\n' +
                '• En Chrome/Edge: Menú ⋮ → "Instalar aplicación"\n' +
                '• En Safari iOS: Compartir → "Añadir a pantalla de inicio"\n' +
                '• En Firefox: Este navegador no soporta instalación PWA'
            );
        }
    };

    // Don't show if already installed
    if (isInstalled) {
        return null;
    }

    return (
        <button
            onClick={handleClick}
            className={`
                fixed bottom-6 right-6 z-50
                w-14 h-14 rounded-full
                flex items-center justify-center
                transition-all duration-300
                hover:scale-110 active:scale-95
                shadow-lg hover:shadow-xl
                group
                ${isDark
                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-primary-500/30 hover:shadow-primary-500/50'
                    : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/40 hover:shadow-primary-500/60'
                }
                ${className}
            `}
            aria-label={isInstallable ? 'Instalar aplicación' : 'Información de instalación'}
            title={isInstallable ? 'Instalar Cuenca Eventos' : 'Cómo instalar la app'}
        >
            {/* Download/Install icon */}
            <svg
                className="w-7 h-7 text-white transition-transform group-hover:translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                {isInstallable ? (
                    // Download arrow icon
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                ) : (
                    // Info/question icon
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                )}
            </svg>

            {/* Pulse animation ring - only show when installable */}
            {isInstallable && (
                <span
                    className="absolute inset-0 rounded-full animate-ping bg-primary-500/30"
                    style={{ animationDuration: '2s' }}
                />
            )}

            {/* Tooltip */}
            <span className={`
                absolute right-full mr-3 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                ${isDark
                    ? 'bg-surface-800 text-white border border-surface-700'
                    : 'bg-white text-surface-900 shadow-lg border border-surface-200'
                }
            `}>
                {isInstallable ? '¡Instalar App!' : 'Descargar App'}
            </span>

            {/* Success tooltip */}
            {showTooltip && (
                <span className={`
                    absolute right-full mr-3 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                    ${isDark ? 'bg-green-800 text-white' : 'bg-green-100 text-green-800'}
                `}>
                    ✓ ¡Instalando!
                </span>
            )}
        </button>
    );
}
