"""
Script para migrar imágenes del frontend a MongoDB GridFS
Actualiza los eventos, alertas y rutas con los IDs de imagen correspondientes
"""
import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from bson import ObjectId

# Configuración
MONGODB_URL = "mongodb://mongodb:27017"
DATABASE_NAME = "cuenca_eventos"

# Mapeo de archivos a eventos (basado en el código TypeScript)
IMAGE_MAPPING = {
    # Eventos
    "Festival de luces.jpg": {"type": "event", "title": "Festival de Luces 2026"},
    "corpus christi.jpg": {"type": "event", "title": "Corpus Christi - Fiesta del Septenario"},
    "expo arte.jpeg": {"type": "event", "title": "Expo Arte Contemporáneo"},
    "pase del niño.jpg": {"type": "event", "title": "Pase del Niño Viajero"},
    "carnaval.jpg": {"type": "event", "title": "Carnaval Cuencano 2026"},
    "desfile.jpg": {"type": "event", "title": "Desfile de la Cuencanidad"},
    "feriasartesanas.jpg": {"type": "event", "title": "Feria de Artesanías"},
    
    # Alertas
    "callecerrada.jpg": {"type": "alert", "title": "Cierre vial por Festival de Luces"},
    "via cerrada.jpg": {"type": "alert", "title": "Desvío por Pase del Niño"},
    
    # Rutas
    "rutagastronomica.jpg": {"type": "route", "name": "Ruta Gastronómica del Centro"},
    "ruta de las igleais.jpg": {"type": "route", "name": "Ruta de las Iglesias"},
    "ruta turi.jpg": {"type": "route", "name": "Ruta Turi - Mirador"},
}

# Directorio de imágenes (docker cp crea subcarpeta con nombre del origen)
IMAGES_DIR = "/app/images_to_migrate"


def get_content_type(filename: str) -> str:
    """Obtener tipo MIME según extensión"""
    ext = filename.lower().split('.')[-1]
    types = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'gif': 'image/gif'
    }
    return types.get(ext, 'image/jpeg')


async def migrate_images():
    """Migrar imágenes a GridFS y actualizar documentos"""
    print("=" * 60)
    print("🖼️  Migrando imágenes a MongoDB GridFS")
    print("=" * 60)
    
    # Conectar a MongoDB
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    bucket = AsyncIOMotorGridFSBucket(db)
    
    # Verificar directorio de imágenes
    images_path = Path(IMAGES_DIR)
    if not images_path.exists():
        print(f"\n❌ Directorio de imágenes no encontrado: {IMAGES_DIR}")
        print("   Ejecuta primero: docker cp frontend/src/icons/eventos backend-container:/app/images_to_migrate")
        return
    
    # Procesar cada imagen
    uploaded_count = 0
    updated_events = 0
    updated_alerts = 0
    updated_routes = 0
    
    for filename, mapping in IMAGE_MAPPING.items():
        filepath = images_path / filename
        
        if not filepath.exists():
            print(f"   ⚠️  Imagen no encontrada: {filename}")
            continue
        
        # Leer archivo
        with open(filepath, 'rb') as f:
            file_data = f.read()
        
        # Subir a GridFS
        content_type = get_content_type(filename)
        file_id = await bucket.upload_from_stream(
            filename,
            file_data,
            metadata={
                "content_type": content_type,
                "source": "migration",
                "original_path": f"frontend/src/icons/eventos/{filename}"
            }
        )
        
        print(f"   ✅ Subida: {filename} -> {file_id}")
        uploaded_count += 1
        
        # Actualizar documento correspondiente
        if mapping["type"] == "event":
            result = await db.events.update_one(
                {"title": mapping["title"]},
                {"$set": {"image_id": file_id}}
            )
            if result.modified_count > 0:
                updated_events += 1
                print(f"      📅 Evento actualizado: {mapping['title']}")
        
        elif mapping["type"] == "alert":
            result = await db.alerts.update_one(
                {"title": mapping["title"]},
                {"$set": {"image_id": file_id}}
            )
            if result.modified_count > 0:
                updated_alerts += 1
                print(f"      ⚠️  Alerta actualizada: {mapping['title']}")
        
        elif mapping["type"] == "route":
            result = await db.routes.update_one(
                {"name": mapping["name"]},
                {"$set": {"image_id": file_id}}
            )
            if result.modified_count > 0:
                updated_routes += 1
                print(f"      🛤️  Ruta actualizada: {mapping['name']}")
    
    # Resumen
    print("\n" + "=" * 60)
    print("✅ MIGRACIÓN DE IMÁGENES COMPLETADA")
    print("=" * 60)
    print(f"   🖼️  Imágenes subidas:    {uploaded_count}")
    print(f"   📅 Eventos actualizados: {updated_events}")
    print(f"   ⚠️  Alertas actualizadas: {updated_alerts}")
    print(f"   🛤️  Rutas actualizadas:   {updated_routes}")
    print("=" * 60)
    
    # Cerrar conexión
    client.close()


if __name__ == "__main__":
    asyncio.run(migrate_images())
