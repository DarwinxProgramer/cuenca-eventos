"""
Script para verificar y resetear contraseña del admin en Atlas
"""
from pymongo import MongoClient
from passlib.context import CryptContext

ATLAS_URI = "mongodb+srv://darwinchuqui_db_user:ocEgQWTlMolliOQt@clustercuencaeventos.b1qmntf.mongodb.net/cuenca_eventos?retryWrites=true&w=majority&appName=ClusterCuencaEventos"
DB_NAME = "cuenca_eventos"

# Configuración para hashear passwords (igual que en el backend)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def reset_admin_password():
    print("="*60)
    print("🔐 RESETEO DE CONTRASEÑA ADMIN")
    print("="*60)
    
    # Nueva contraseña que configuraste en Render
    new_password = "rBGXrjjuPntI6kVeqrkXMA"
    
    # Generar hash
    password_hash = pwd_context.hash(new_password)
    
    print(f"✅ Nueva contraseña: {new_password}")
    print(f"✅ Hash generado: {password_hash[:50]}...\n")
    
    try:
        client = MongoClient(ATLAS_URI)
        db = client[DB_NAME]
        
        # Actualizar contraseña del admin
        result = db.users.update_one(
            {"email": "admin@gmail.com"},
            {"$set": {"password": password_hash}}
        )
        
        if result.modified_count > 0:
            print("✅ Contraseña actualizada exitosamente")
        else:
            print("⚠️  No se modificó ningún documento (quizás ya tenía ese hash)")
        
        # Verificar
        admin = db.users.find_one({"email": "admin@gmail.com"})
        if admin:
            print(f"\n📧 Email: {admin['email']}")
            print(f"👤 Nombre: {admin['name']}")
            print(f"🔑 Rol: {admin['role']}")
            
            # Probar la contraseña
            if pwd_context.verify(new_password, admin['password']):
                print(f"\n✅ VERIFICACIÓN: La contraseña '{new_password}' es CORRECTA")
            else:
                print(f"\n❌ VERIFICACIÓN: La contraseña NO coincide")
        
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    reset_admin_password()
