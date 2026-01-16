"""
Script de Verificación: MongoDB Atlas
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

ATLAS_URI = os.getenv("MONGODB_ATLAS_URI")
if not ATLAS_URI:
    # Fallback si no está en env
    ATLAS_URI = "mongodb+srv://darwinchuqui_db_user:ocEgQWTlMolliOQt@clustercuencaeventos.b1qmntf.mongodb.net/cuenca_eventos?retryWrites=true&w=majority&appName=ClusterCuencaEventos"

DB_NAME = "cuenca_eventos"
COLLECTIONS = ["users", "events", "alerts", "routes", "agenda"]

def verify():
    print("="*60)
    print("🔍 VERIFICACIÓN DE DATOS EN ATLAS")
    print("="*60)
    
    try:
        print(f"☁️  Conectando a: {DB_NAME}...")
        client = MongoClient(ATLAS_URI)
        db = client[DB_NAME]
        
        # Ping
        client.admin.command('ping')
        print("✅ Conexión exitosa.")
        print("-" * 30)
        
        total = 0
        for col in COLLECTIONS:
            count = db[col].count_documents({})
            print(f"📂 {col:<15}: {count} documentos")
            total += count
            
        print("-" * 30)
        print(f"📊 TOTAL            : {total} documentos")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error al conectar o verificar: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    verify()
