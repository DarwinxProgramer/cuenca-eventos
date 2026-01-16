"""
Core Logger - Configuración de Logging Estructurado (JSON)
"""
import sys
import logging
import structlog
from app.config import settings

def configure_logger():
    """
    Configura structlog para trabajar con el sistema de logging estándar de Python.
    En desarrollo: Output legible por humanos (colores).
    En producción: Output JSON para fácil parsing (ELK/Loki).
    """
    
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if settings.DEBUG:
        # Desarrollo: Pretty Print
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(),
        ]
    else:
        # Producción: JSON
        processors = shared_processors + [
            structlog.processors.JSONRenderer(),
        ]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configurar logging estándar de Python para usar structlog
    # Filtrar logs ruidosos de uvicorn si fuera necesario
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )

# Crear logger global
logger = structlog.get_logger()
