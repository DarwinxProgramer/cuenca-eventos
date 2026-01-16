/**
 * Sync Status Badge - Badge para mostrar estado de sincronización offline
 * Muestra número de operaciones pendientes y botón para sincronizar manualmente
 */

import { useSyncQueue } from '../hooks/useSyncQueue';
import { useTheme } from '../contexts/ThemeContext';

export function SyncStatusBadge() {
    const { pendingCount, isSyncing, syncNow } = useSyncQueue();
    const { isDark } = useTheme();

    // No mostrar si no hay operaciones pendientes
    if (pendingCount === 0 && !isSyncing) {
        return null;
    }

    return (
        <div className={`
            fixed bottom-6 right-6 z-50
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
            backdrop-blur-md border
            ${isDark
                ? 'bg-surface-800/90 border-surface-700'
                : 'bg-white/90 border-surface-200'
            }
        `}>
            {/* Indicador de sincronización */}
            {isSyncing ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span className={`text-sm font-medium ${isDark ? 'text-surface-100' : 'text-surface-900'}`}>
                        Sincronizando...
                    </span>
                </div>
            ) : (
                <>
                    {/* Badge de operaciones pendientes */}
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-surface-200' : 'text-surface-700'}`}>
                            {pendingCount} operación{pendingCount !== 1 ? 'es' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Botón de sincronización manual */}
                    <button
                        onClick={syncNow}
                        className={`
                            px-3 py-1.5 rounded-md text-sm font-medium
                            transition-all duration-200
                            hover:scale-105 active:scale-95
                            ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-primary-500 hover:bg-primary-600 text-white'
                            }
                        `}
                    >
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sincronizar
                    </button>
                </>
            )}
        </div>
    );
}
