"""
Cuenca Eventos - Backend API
Configuración centralizada usando pydantic-settings
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Configuración del servidor FastAPI"""
    
    # Información del proyecto
    PROJECT_NAME: str = "Cuenca Eventos API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "API REST para la plataforma de eventos culturales de Cuenca"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True
    
    # Servidor
    HOST: str = "0.0.0.0"
    PORT: int = 3001
    
    # MongoDB  
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "cuenca_eventos"
    
    # JWT
    SECRET_KEY: str = "tu-clave-secreta-cambiar-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://cuenca-eventos.vercel.app"
    ]
    
    class Config:
        # No requiere archivo .env - lee directamente de variables de entorno
        case_sensitive = False  # Permite MONGODB_URL o mongodb_url
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Las variables de entorno tienen prioridad sobre .env
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Singleton para obtener la configuración"""
    return Settings()


settings = get_settings()
