"""
Core Cache - Sistema de caché con Redis
- Conexión Redis async
- Decorador @cache_response
- Funciones de invalidación
"""
import json
import hashlib
from functools import wraps
from typing import Optional, Callable, Any
from datetime import timedelta
import redis.asyncio as redis

from app.config import settings

# Cliente Redis global
redis_client: Optional[redis.Redis] = None


async def connect_to_redis():
    """Conectar a Redis al iniciar la aplicación"""
    global redis_client
    
    print(f"🔗 Intentando conectar a Redis...")
    
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2  # Timeout corto para fallar rápido
        )
        
        # Verificar conexión con timeout
        await redis_client.ping()
        print(f"✅ Conectado a Redis: {settings.REDIS_URL}")
    except Exception as e:
        print(f"⚠️  Redis no disponible: {str(e)[:100]}")
        print("ℹ️  La aplicación funcionará sin caché")
        redis_client = None


async def close_redis_connection():
    """Cerrar conexión a Redis"""
    global redis_client
    
    if redis_client:
        await redis_client.close()
        print("🔌 Conexión a Redis cerrada")


def get_redis() -> Optional[redis.Redis]:
    """Obtener cliente Redis"""
    return redis_client


# ============================================
# FUNCIONES DE CACHÉ
# ============================================

async def get_cached(key: str) -> Optional[str]:
    """
    Obtener valor del caché
    
    Args:
        key: Clave del caché
        
    Returns:
        Valor cacheado o None
    """
    if not redis_client:
        return None
    
    try:
        return await redis_client.get(key)
    except Exception:
        return None


async def set_cached(key: str, value: str, ttl: int = 300) -> bool:
    """
    Guardar valor en caché
    
    Args:
        key: Clave del caché
        value: Valor a guardar (string/JSON)
        ttl: Tiempo de vida en segundos (default: 5 min)
        
    Returns:
        True si se guardó, False si falló
    """
    if not redis_client:
        return False
    
    try:
        await redis_client.setex(key, ttl, value)
        return True
    except Exception:
        return False


async def invalidate_cache(pattern: str) -> int:
    """
    Invalidar claves que coincidan con un patrón
    
    Args:
        pattern: Patrón de claves a invalidar (ej: "events:*")
        
    Returns:
        Número de claves eliminadas
    """
    if not redis_client:
        return 0
    
    try:
        keys = []
        async for key in redis_client.scan_iter(pattern):
            keys.append(key)
        
        if keys:
            await redis_client.delete(*keys)
        
        return len(keys)
    except Exception:
        return 0


async def clear_all_cache() -> bool:
    """Limpiar todo el caché"""
    if not redis_client:
        return False
    
    try:
        await redis_client.flushdb()
        return True
    except Exception:
        return False


# ============================================
# DECORADOR DE CACHÉ
# ============================================

def generate_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generar clave única para el caché basada en argumentos"""
    # Crear hash de los argumentos
    key_data = json.dumps({"args": str(args), "kwargs": str(kwargs)}, sort_keys=True)
    key_hash = hashlib.md5(key_data.encode()).hexdigest()[:12]
    return f"{prefix}:{key_hash}"


def cache_response(prefix: str, ttl: int = 300):
    """
    Decorador para cachear respuestas de endpoints
    
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
            # Generar clave de caché
            cache_key = generate_cache_key(prefix, *args, **kwargs)
            
            # Intentar obtener del caché
            cached = await get_cached(cache_key)
            if cached:
                return json.loads(cached)
            
            # Ejecutar función original
            result = await func(*args, **kwargs)
            
            # Guardar en caché
            try:
                # Convertir resultado a JSON
                if hasattr(result, "model_dump"):
                    # Pydantic model
                    json_result = json.dumps(result.model_dump(), default=str)
                elif isinstance(result, list):
                    # Lista de modelos
                    json_result = json.dumps(
                        [item.model_dump() if hasattr(item, "model_dump") else item for item in result],
                        default=str
                    )
                else:
                    json_result = json.dumps(result, default=str)
                
                await set_cached(cache_key, json_result, ttl)
            except Exception:
                pass  # Si falla el caché, retornar resultado normal
            
            return result
        
        return wrapper
    return decorator


# ============================================
# HELPERS PARA INVALIDACIÓN
# ============================================

async def invalidate_events_cache():
    """Invalidar caché de eventos"""
    return await invalidate_cache("events:*")


async def invalidate_alerts_cache():
    """Invalidar caché de alertas"""
    return await invalidate_cache("alerts:*")


async def invalidate_routes_cache():
    """Invalidar caché de rutas"""
    return await invalidate_cache("routes:*")
