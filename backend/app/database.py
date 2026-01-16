"""
Cuenca Eventos - Backend API
Conexión a MongoDB usando Motor y Beanie ODM
"""
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional

from app.config import settings

# Cliente global de MongoDB
db_client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongodb():
    """Conectar a MongoDB al iniciar la aplicación"""
    global db_client
    
    # Debug: Mostrar qué URL se está usando
    import os
    env_url = os.getenv("MONGODB_URL")
    print(f"🔍 DEBUG - MONGODB_URL desde env: {env_url[:50] if env_url else 'NO ENCONTRADA'}...")
    print(f"🔍 DEBUG - settings.MONGODB_URL: {settings.MONGODB_URL[:50]}...")
    print(f"🔗 Conectando a MongoDB: {settings.MONGODB_URL}")
    
    db_client = AsyncIOMotorClient(settings.MONGODB_URL)
    
    # Importar modelos aquí para evitar imports circulares
    from app.models.user import User
    from app.models.event import Event
    from app.models.alert import Alert
    from app.models.route import Route
    from app.models.agenda import Agenda
    
    # Inicializar Beanie con los modelos
    await init_beanie(
        database=db_client[settings.MONGODB_DB_NAME],
        document_models=[
            User,
            Event,
            Alert,
            Route,
            Agenda
        ]
    )
    
    print(f"✅ Conectado a MongoDB: {settings.MONGODB_DB_NAME}")


async def close_mongodb_connection():
    """Cerrar conexión a MongoDB al detener la aplicación"""
    global db_client
    
    if db_client:
        db_client.close()
        print("🔌 Conexión a MongoDB cerrada")


def get_database():
    """Obtener instancia de la base de datos"""
    return db_client[settings.MONGODB_DB_NAME]
