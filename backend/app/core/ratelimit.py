"""
Core Rate Limit - Configuración de límites de velocidad
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Request

from app.config import settings

# Función para obtener clave de rate limit
# Usa la IP del cliente por defecto
def get_rate_limit_key(request: Request) -> str:
    # Si quisieramos limitar por usuario autenticado podríamos hacerlo aquí
    # buscando el token en los headers, pero por seguridad es mejor IP + User
    return get_remote_address(request)


# Inicializar Limiter
# storage_uri se conecta al Redis que ya tenemos configurado
# Si Redis no está disponible, usa memoria (no persiste entre reinicios)
try:
    limiter = Limiter(
        key_func=get_rate_limit_key,
        storage_uri=settings.REDIS_URL,
        strategy="fixed-window" # o "moving-window"
    )
except Exception:
    # Fallback a memoria si Redis no está disponible
    limiter = Limiter(
        key_func=get_rate_limit_key,
        strategy="fixed-window"
    )

# Configuración por defecto si no se especifica en el endpoint
# limiter.default_limits = ["100/minute"]
