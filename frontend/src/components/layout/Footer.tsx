import { useTheme } from '../../context/ThemeContext';

export default function Footer() {
    const { isDark } = useTheme();

    return (
        <footer className={`
      py-8 text-center transition-colors duration-300
      ${isDark
                ? 'bg-surface-900 border-t border-surface-800 text-surface-400'
                : 'bg-surface-100 border-t border-surface-200 text-surface-600'
            }
    `}>
            <div className="container mx-auto px-4">
                <p className="text-sm font-medium">
                    © 2025 – Por <span className="text-primary-500 font-semibold">Dar Solutions</span>
                </p>
            </div>
        </footer>
    );
}
