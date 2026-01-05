/**
 * System Icons Service
 * 
 * Este servicio proporciona acceso a los iconos del sistema almacenados en GridFS.
 * Los iconos deben ser subidos primero mediante el panel de administración.
 * 
 * IMPORTANTE: Actualizar los IDs después de subir los iconos a GridFS
 */

import { getImageUrl } from './eventsApi';

/**
 * Mapeo de nombres de iconos a sus IDs en GridFS
 * 
 * INSTRUCCIONES PARA ACTUALIZAR:
 * 1. Subir cada icono mediante el panel de admin
 * 2. Copiar el ID generado por GridFS
 * 3. Actualizar el valor correspondiente aquí
 */
export const SYSTEM_ICONS = {
    // Branding
    'logo-principal': 'REPLACE_WITH_GRID_FS_ID',  // LogoPrincipal.PNG
    'logo-oscuro': 'REPLACE_WITH_GRID_FS_ID',     // LogoModoOscuro.PNG
    'logo-secundario': 'REPLACE_WITH_GRID_FS_ID', // LogoSecundario.PNG

    // Navegación
    'agenda': 'REPLACE_WITH_GRID_FS_ID',          // agenda.png
    'evento': 'REPLACE_WITH_GRID_FS_ID',          // evento.png
    'mapa': 'REPLACE_WITH_GRID_FS_ID',            // mapa.png
    'perfil': 'REPLACE_WITH_GRID_FS_ID',          // perfil.png
    'rutas': 'REPLACE_WITH_GRID_FS_ID',           // rutas.png

    // UI
    'lupa': 'REPLACE_WITH_GRID_FS_ID',            // lupa.png
    'destacados': 'REPLACE_WITH_GRID_FS_ID',      // destacados.png
    'notificacion': 'REPLACE_WITH_GRID_FS_ID',    // notificacion.png
    'descarga': 'REPLACE_WITH_GRID_FS_ID',        // descarga.png
    'fondo-menu': 'REPLACE_WITH_GRID_FS_ID',      // fondo_menu.png
} as const;

/**
 * Placeholder para iconos que no se encuentran
 */
const ICON_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij7wn5qrPC90ZXh0Pjwvc3ZnPg==';

/**
 * Obtiene la URL de un icono del sistema
 * 
 * @param iconName - Nombre del icono (ver SYSTEM_ICONS)
 * @returns URL del icono desde GridFS o placeholder si no existe
 * 
 * @example
 * ```tsx
 * import { getSystemIconUrl } from '../services/systemIconsApi';
 * 
 * <img src={getSystemIconUrl('logo-principal')} alt="Logo" />
 * ```
 */
export const getSystemIconUrl = (iconName: keyof typeof SYSTEM_ICONS): string => {
    const iconId = SYSTEM_ICONS[iconName];

    // Si aún no se ha configurado el ID
    if (!iconId || iconId === 'REPLACE_WITH_GRID_FS_ID') {
        console.warn(`⚠️ Icon "${iconName}" no configurado. Use el panel admin para subir el icono.`);
        return ICON_PLACEHOLDER;
    }

    // Obtener URL desde GridFS
    const url = getImageUrl(iconId);
    return url || ICON_PLACEHOLDER;
};

/**
 * Hook personalizado para usar iconos del sistema (opcional)
 * 
 * @example
 * ```tsx
 * const logoUrl = useSystemIcon('logo-principal');
 * ```
 */
export const useSystemIcon = (iconName: keyof typeof SYSTEM_ICONS): string => {
    return getSystemIconUrl(iconName);
};

/**
 * Obtiene todos los iconos configurados
 * Útil para verificar qué iconos están disponibles
 */
export const getAllSystemIcons = (): Record<string, string> => {
    const icons: Record<string, string> = {};

    Object.keys(SYSTEM_ICONS).forEach((key) => {
        icons[key] = getSystemIconUrl(key as keyof typeof SYSTEM_ICONS);
    });

    return icons;
};

/**
 * Verifica si un icono está configurado
 */
export const isIconConfigured = (iconName: keyof typeof SYSTEM_ICONS): boolean => {
    const iconId = SYSTEM_ICONS[iconName];
    return iconId !== 'REPLACE_WITH_GRID_FS_ID' && !!iconId;
};

export default {
    getSystemIconUrl,
    useSystemIcon,
    getAllSystemIcons,
    isIconConfigured,
    SYSTEM_ICONS
};
