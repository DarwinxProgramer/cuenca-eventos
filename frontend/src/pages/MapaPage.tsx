import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import MenuPageLayout from '../components/menu/MenuPageLayout';
import { mockEvents, mockAlerts, getCategoryLabel, getCategoryColor } from '../mocks/eventData';

export default function MapaPage() {
    const { isDark } = useTheme();
    const [selectedItem, setSelectedItem] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'eventos' | 'avisos'>('eventos');

    const getAlertTypeStyles = (type: string) => {
        switch (type) {
            case 'cierre':
                return 'bg-secondary-500/20 text-secondary-500 border-secondary-500/30';
            case 'desvio':
                return 'bg-accent-500/20 text-accent-500 border-accent-500/30';
            case 'congestion':
                return 'bg-primary-500/20 text-primary-500 border-primary-500/30';
            default:
                return 'bg-surface-500/20 text-surface-500 border-surface-500/30';
        }
    };

    const getAlertTypeLabel = (type: string) => {
        switch (type) {
            case 'cierre': return '🚫 Cierre';
            case 'desvio': return '↪️ Desvío';
            case 'congestion': return '🚗 Congestión';
            default: return 'Aviso';
        }
    };

    // Build OpenStreetMap embed URL with markers
    // Cuenca center: -2.9001, -79.0059
    const mapBounds = '-79.02,-2.92,-78.99,-2.88';
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds}&layer=mapnik&marker=-2.9001,-79.0059`;

    return (
        <MenuPageLayout title="Mapa">
            <div className="container mx-auto px-4">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-2">
                        🗺️ Mapa Interactivo
                    </h1>
                    <p className="text-surface-300">
                        Explora eventos y avisos en el mapa de Cuenca
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Map Section */}
                    <div className={`
                        lg:col-span-2 rounded-2xl overflow-hidden
                        ${isDark
                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                        }
                    `}>
                        {/* Map Container */}
                        <div className="relative h-[500px]">
                            <iframe
                                title="Mapa de Cuenca"
                                src={mapUrl}
                                className="w-full h-full"
                                style={{ border: 0 }}
                                loading="lazy"
                            />

                            {/* Map Overlay with Pins */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Event Pins - Positioned manually for demo */}
                                {mockEvents.slice(0, 5).map((event, index) => {
                                    const positions = [
                                        { top: '30%', left: '45%' },
                                        { top: '35%', left: '50%' },
                                        { top: '40%', left: '42%' },
                                        { top: '45%', left: '55%' },
                                        { top: '50%', left: '48%' },
                                    ];
                                    const pos = positions[index];
                                    return (
                                        <button
                                            key={event.id}
                                            onClick={() => setSelectedItem(event.id)}
                                            style={{ top: pos.top, left: pos.left }}
                                            className={`
                                                absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2
                                                transition-all duration-300 hover:scale-125 z-10
                                                ${selectedItem === event.id ? 'scale-125 z-20' : ''}
                                            `}
                                        >
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg
                                                bg-gradient-to-br ${getCategoryColor(event.category)}
                                                ${selectedItem === event.id ? 'ring-4 ring-white/50' : ''}
                                            `}>
                                                📍
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* Alert Pins */}
                                {mockAlerts.map((alert, index) => {
                                    const positions = [
                                        { top: '25%', left: '40%' },
                                        { top: '55%', left: '60%' },
                                        { top: '38%', left: '35%' },
                                        { top: '60%', left: '45%' },
                                    ];
                                    const pos = positions[index];
                                    return (
                                        <button
                                            key={`alert-${alert.id}`}
                                            onClick={() => setSelectedItem(alert.id + 1000)}
                                            style={{ top: pos.top, left: pos.left }}
                                            className={`
                                                absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2
                                                transition-all duration-300 hover:scale-125 z-10
                                                ${selectedItem === alert.id + 1000 ? 'scale-125 z-20' : ''}
                                            `}
                                        >
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg
                                                ${alert.type === 'cierre' ? 'bg-secondary-500' : alert.type === 'desvio' ? 'bg-accent-500' : 'bg-primary-500'}
                                                ${selectedItem === alert.id + 1000 ? 'ring-4 ring-white/50' : ''}
                                            `}>
                                                ⚠️
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Map Legend */}
                            <div className={`
                                absolute bottom-4 left-4 p-3 rounded-xl backdrop-blur-md
                                ${isDark ? 'bg-surface-900/80' : 'bg-white/80'}
                            `}>
                                <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                    Leyenda
                                </p>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span>📍</span>
                                        <span className={isDark ? 'text-surface-300' : 'text-surface-600'}>Eventos</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>⚠️</span>
                                        <span className={isDark ? 'text-surface-300' : 'text-surface-600'}>Avisos viales</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className={`
                        lg:col-span-1 rounded-2xl overflow-hidden flex flex-col
                        ${isDark
                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                        }
                    `}>
                        {/* Tabs */}
                        <div className={`flex border-b ${isDark ? 'border-surface-700' : 'border-surface-200'}`}>
                            <button
                                onClick={() => setActiveTab('eventos')}
                                className={`
                                    flex-1 py-3 px-4 text-sm font-semibold transition-all
                                    ${activeTab === 'eventos'
                                        ? 'text-primary-500 border-b-2 border-primary-500'
                                        : isDark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'
                                    }
                                `}
                            >
                                📍 Eventos ({mockEvents.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('avisos')}
                                className={`
                                    flex-1 py-3 px-4 text-sm font-semibold transition-all
                                    ${activeTab === 'avisos'
                                        ? 'text-primary-500 border-b-2 border-primary-500'
                                        : isDark ? 'text-surface-400 hover:text-white' : 'text-surface-500 hover:text-surface-900'
                                    }
                                `}
                            >
                                ⚠️ Avisos ({mockAlerts.length})
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px]">
                            {activeTab === 'eventos' ? (
                                mockEvents.map(event => (
                                    <button
                                        key={event.id}
                                        onClick={() => setSelectedItem(event.id)}
                                        className={`
                                            w-full text-left p-3 rounded-xl transition-all duration-300
                                            ${selectedItem === event.id
                                                ? 'ring-2 ring-primary-500 scale-[1.02]'
                                                : ''
                                            }
                                            ${isDark
                                                ? 'bg-surface-700/50 hover:bg-surface-700'
                                                : 'bg-surface-50 hover:bg-surface-100'
                                            }
                                        `}
                                    >
                                        <div className="flex gap-3">
                                            <img
                                                src={event.image}
                                                alt={event.title}
                                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-semibold text-sm line-clamp-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {event.title}
                                                </h3>
                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                    📍 {event.location}
                                                </p>
                                                <span className={`
                                                    inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white
                                                    bg-gradient-to-r ${getCategoryColor(event.category)}
                                                `}>
                                                    {getCategoryLabel(event.category)}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                mockAlerts.map(alert => (
                                    <button
                                        key={alert.id}
                                        onClick={() => setSelectedItem(alert.id + 1000)}
                                        className={`
                                            w-full text-left p-3 rounded-xl transition-all duration-300
                                            ${selectedItem === alert.id + 1000
                                                ? 'ring-2 ring-primary-500 scale-[1.02]'
                                                : ''
                                            }
                                            ${isDark
                                                ? 'bg-surface-700/50 hover:bg-surface-700'
                                                : 'bg-surface-50 hover:bg-surface-100'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`
                                                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border
                                                ${getAlertTypeStyles(alert.type)}
                                            `}>
                                                {alert.type === 'cierre' ? '🚫' : alert.type === 'desvio' ? '↪️' : '🚗'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-semibold text-sm line-clamp-1 ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {alert.title}
                                                </h3>
                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                    📍 {alert.location}
                                                </p>
                                                <span className={`
                                                    inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border
                                                    ${getAlertTypeStyles(alert.type)}
                                                `}>
                                                    {getAlertTypeLabel(alert.type)}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Selected Item Detail */}
                {selectedItem && (
                    <div className={`
                        mt-6 p-6 rounded-2xl animate-fade-in
                        ${isDark
                            ? 'bg-surface-800/90 backdrop-blur-sm border border-surface-700'
                            : 'bg-white/90 backdrop-blur-sm border border-surface-200 shadow-lg'
                        }
                    `}>
                        {selectedItem < 1000 ? (
                            // Event Detail
                            (() => {
                                const event = mockEvents.find(e => e.id === selectedItem);
                                if (!event) return null;
                                return (
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full sm:w-48 h-48 rounded-xl object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {event.title}
                                                </h2>
                                                <button
                                                    onClick={() => setSelectedItem(null)}
                                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-surface-700' : 'hover:bg-surface-100'}`}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <p className={`mb-4 ${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                                                {event.description}
                                            </p>
                                            <div className={`grid sm:grid-cols-2 gap-3 text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>{new Date(event.date).toLocaleDateString('es-EC', { dateStyle: 'long' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>🕐</span>
                                                    <span>{event.time} - {event.endTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>📍</span>
                                                    <span>{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>🏷️</span>
                                                    <span>{getCategoryLabel(event.category)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            // Alert Detail
                            (() => {
                                const alert = mockAlerts.find(a => a.id === selectedItem - 1000);
                                if (!alert) return null;
                                return (
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {alert.image && (
                                            <img
                                                src={alert.image}
                                                alt={alert.title}
                                                className="w-full sm:w-48 h-48 rounded-xl object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-surface-900'}`}>
                                                    {alert.title}
                                                </h2>
                                                <button
                                                    onClick={() => setSelectedItem(null)}
                                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-surface-700' : 'hover:bg-surface-100'}`}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <p className={`mb-4 ${isDark ? 'text-surface-300' : 'text-surface-600'}`}>
                                                {alert.description}
                                            </p>
                                            <div className={`grid sm:grid-cols-2 gap-3 text-sm ${isDark ? 'text-surface-400' : 'text-surface-500'}`}>
                                                <div className="flex items-center gap-2">
                                                    <span>📍</span>
                                                    <span>{alert.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>Desde: {new Date(alert.startDate).toLocaleDateString('es-EC')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>Hasta: {new Date(alert.endDate).toLocaleDateString('es-EC')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertTypeStyles(alert.type)}`}>
                                                        {getAlertTypeLabel(alert.type)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        )}
                    </div>
                )}
            </div>
        </MenuPageLayout>
    );
}
