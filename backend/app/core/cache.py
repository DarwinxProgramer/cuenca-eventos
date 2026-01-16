"""
Core Cache - Sistema de caché (Sin Redis)
La aplicación funciona sin caché. Para activar caché en producción,
considera usar un servicio externo como Upstash o Redis Cloud.
"""
from functools import wraps
from typing import Optional, Callable, Any


# ============================================
# FUNCIONES DE CACHÉ (NO-OP)
# ============================================

async def get_cached(key: str) -> Optional[str]:
    """
    Obtener valor del caché (no implementado sin Redis)
    
    Args:
        key: Clave del caché
        
    Returns:
        None (caché deshabilitado)
    """
    return None


async def set_cached(key: str, value: str, ttl: int = 300) -> bool:
    """
    Guardar valor en caché (no implementado sin Redis)
    
    Args:
        key: Clave del caché
        value: Valor a guardar
        ttl: Tiempo de vida en segundos
        
    Returns:
        False (caché deshabilitado)
    """
    return False


async def invalidate_cache(pattern: str) -> int:
    """
    Invalidar claves (no implementado sin Redis)
    
    Args:
        pattern: Patrón de claves
        
    Returns:
        0 (caché deshabilitado)
    """
    return 0


async def clear_all_cache() -> bool:
    """Limpiar caché (no implementado sin Redis)"""
    return False


# ============================================
# DECORADOR DE CACHÉ (NO-OP)
# ============================================

def cache_response(prefix: str, ttl: int = 300):
    """
    Decorador para cachear respuestas (deshabilitado sin Redis)
    
    La función se ejecuta normalmente sin caché.
    
    Uso:
        @router.get("/events")
        @cache_response("events:list", ttl=300)
        async def get_events():
            ...
    
    Args:
        prefix: Prefijo para la clave del caché
        ttl: Tiempo de vida en segundos
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Ejecutar función sin caché
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


# ============================================
# HELPERS PARA INVALIDACIÓN (NO-OP)
# ============================================

async def invalidate_events_cache():
    """Invalidar caché de eventos (no implementado)"""
    return 0


async def invalidate_alerts_cache():
    """Invalidar caché de alertas (no implementado)"""
    return 0


async def invalidate_routes_cache():
    """Invalidar caché de rutas (no implementado)"""
    return 0
