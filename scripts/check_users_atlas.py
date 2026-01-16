"""
Script para verificar usuarios en MongoDB Atlas
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

ATLAS_URI = "mongodb+srv://darwinchuqui_db_user:ocEgQWTlMolliOQt@clustercuencaeventos.b1qmntf.mongodb.net/cuenca_eventos?retryWrites=true&w=majority&appName=ClusterCuencaEventos"
DB_NAME = "cuenca_eventos"

def check_users():
    print("="*60)
    print("👥 VERIFICANDO USUARIOS EN ATLAS")
    print("="*60)
    
    try:
        client = MongoClient(ATLAS_URI)
        db = client[DB_NAME]
        
        # Ping
        client.admin.command('ping')
        print("✅ Conectado a Atlas\n")
        
        # Obtener todos los usuarios
        users = list(db.users.find())
        
        if not users:
            print("⚠️  No hay usuarios en la base de datos")
        else:
            print(f"📊 Total de usuarios: {len(users)}\n")
            for i, user in enumerate(users, 1):
                print(f"{i}. Email: {user.get('email')}")
                print(f"   Nombre: {user.get('name')}")
                print(f"   Rol: {user.get('role')}")
                print(f"   Password Hash: {user.get('password')[:30]}...")
                print()
        
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    check_users()
