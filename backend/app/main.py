"""
Cuenca Eventos - Backend API
Punto de entrada principal de FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import connect_to_mongodb, close_mongodb_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    # Startup
    from app.core.logger import configure_logger
    configure_logger()
    
    await connect_to_mongodb()
    
    print(f"🚀 {settings.PROJECT_NAME} v{settings.VERSION} iniciado")
    
    yield
    
    # Shutdown
    await close_mongodb_connection()
    print("👋 Servidor detenido")


# Crear instancia de FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar Rate Limit
from app.core.ratelimit import limiter, RateLimitExceeded, _rate_limit_exceeded_handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Verificar estado del servidor"""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@app.get(f"{settings.API_V1_PREFIX}/health", tags=["Health"])
async def api_health_check():
    """Verificar estado de la API"""
    return {
        "status": "healthy",
        "api_version": "v1"
    }


# Importar y registrar routers
from app.routers import auth, events, alerts, routes, users, agenda, images

app.include_router(auth.router, prefix=settings.API_V1_PREFIX, tags=["Autenticación"])
app.include_router(events.router, prefix=settings.API_V1_PREFIX, tags=["Eventos"])
app.include_router(alerts.router, prefix=settings.API_V1_PREFIX, tags=["Alertas"])
app.include_router(routes.router, prefix=settings.API_V1_PREFIX, tags=["Rutas"])
app.include_router(users.router, prefix=settings.API_V1_PREFIX, tags=["Usuarios"])
app.include_router(agenda.router, prefix=settings.API_V1_PREFIX, tags=["Agenda"])
app.include_router(images.router, prefix=settings.API_V1_PREFIX, tags=["Imágenes"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
