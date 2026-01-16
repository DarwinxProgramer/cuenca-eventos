"""
Script de Migración Robusto: MongoDB Local → MongoDB Atlas
"""
import os
import sys
from pymongo import MongoClient, InsertOne
from pymongo.errors import BulkWriteError
from dotenv import load_dotenv

# Cargar variables de entorno si existen
load_dotenv()

# Configuración por defecto (puede sobreescribirse)
LOCAL_URI = os.getenv("MONGODB_LOCAL_URI", "mongodb://localhost:27017")
# Intentar leer URI de Atlas de argumento o variable de entorno
ATLAS_URI = os.getenv("MONGODB_ATLAS_URI")
DB_NAME = "cuenca_eventos"

COLLECTIONS = ["users", "events", "alerts", "routes", "agenda"]

def confirm_action(message):
    """Solicita confirmación al usuario"""
    response = input(f"{message} (s/n): ").strip().lower()
    return response == 's'

def migrate():
    print("="*60)
    print("🚀 MIGRACIÓN DE DATOS: LOCAL -> ATLAS")
    print("="*60)
    
    global ATLAS_URI
    if not ATLAS_URI:
        ATLAS_URI = input("Ingrese su URI de conexión a MongoDB Atlas: ").strip()
        if not ATLAS_URI:
            print("❌ Error: URI de Atlas requerida.")
            return

    try:
        # 1. Conexión Local
        print("\n📡 Conectando a MongoDB Local...")
        local_client = MongoClient(LOCAL_URI)
        local_db = local_client[DB_NAME]
        
        # 2. Conexión Atlas
        print("☁️  Conectando a MongoDB Atlas...")
        atlas_client = MongoClient(ATLAS_URI)
        atlas_db = atlas_client[DB_NAME]
        
        # Verificar conexión
        atlas_client.admin.command('ping')
        print("✅ Conexión a Atlas exitosa.")
        
        # 3. Confirmación
        print(f"\nSe migrarán las colecciones: {COLLECTIONS}")
        print("⚠️  ADVERTENCIA: Esta acción verificará los datos en Atlas.")
        print("   Si elige el modo 'limpiar', se BORRARÁN los datos existentes en Atlas.")
        
        mode = input("\n¿Desea limpiar la base de datos destino antes de migrar? (limpiar/agregar): ").strip().lower()
        if mode == 'limpiar':
            if not confirm_action("🔴 ¿ESTÁ SEGURO? Se eliminarán permanentemente los datos en Atlas."):
                print("Operación cancelada.")
                return
        
        # 4. Proceso
        for col_name in COLLECTIONS:
            print(f"\n📂 Procesando: {col_name}...")
            local_col = local_db[col_name]
            atlas_col = atlas_db[col_name]
            
            # Obtener datos
            docs = list(local_col.find())
            count = len(docs)
            
            if count == 0:
                print("   ⚠️  Colección local vacía. Saltando.")
                continue
                
            print(f"   📥 Leídos {count} documentos locales.")
            
            # Limpiar si es necesario
            if mode == 'limpiar':
                deleted = atlas_col.delete_many({})
                print(f"   🗑️  Eliminados {deleted.deleted_count} docs en Atlas.")
            
            # Insertar
            try:
                # Usar insert_many es eficiente para este volumen
                result = atlas_col.insert_many(docs, ordered=False)
                print(f"   ✅ Insertados {len(result.inserted_ids)} documentos.")
            except BulkWriteError as bwe:
                print(f"   ⚠️  Errores de escritura (posibles duplicados): {bwe.details['nInserted']} insertados.")
            except Exception as e:
                print(f"   ❌ Error insertando: {e}")

        print("\n" + "="*60)
        print("🎉 Migración Finalizada.")
        print("="*60)

    except Exception as e:
        print(f"\n❌ Error Fatal: {e}")
    finally:
        if 'local_client' in locals(): local_client.close()
        if 'atlas_client' in locals(): atlas_client.close()

if __name__ == "__main__":
    migrate()
