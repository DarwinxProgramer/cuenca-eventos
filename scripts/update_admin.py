"""
Script simple para actualizar contraseña del admin
"""
from pymongo import MongoClient
import bcrypt

ATLAS_URI = "mongodb+srv://darwinchuqui_db_user:ocEgQWTlMolliOQt@clustercuencaeventos.b1qmntf.mongodb.net/cuenca_eventos?retryWrites=true&w=majority&appName=ClusterCuencaEventos"
DB_NAME = "cuenca_eventos"

def update_admin():
    print("="*60)
    print("🔐 ACTUALIZANDO CONTRASEÑA ADMIN")
    print("="*60)
    
    # Contraseña que configuraste en Render
    password = "rBGXrjjuPntI6kVeqrkXMA"
    
    # Generar hash usando bcrypt directo
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    print(f"✅ Contraseña: {password}")
    print(f"✅ Hash generado\n")
    
    try:
        client = MongoClient(ATLAS_URI)
        db = client[DB_NAME]
        
        # Actualizar
        result = db.users.update_one(
            {"email": "admin@gmail.com"},
            {"$set": {
                "password": password_hash,
                "name": "Administrador",
                "role": "admin"
            }}
        )
        
        if result.modified_count > 0:
            print("✅ Contraseña actualizada")
        else:
            print("⚠️  Usuario ya tenía esa configuración")
        
        # Mostrar información
        admin = db.users.find_one({"email": "admin@gmail.com"})
        if admin:
            print(f"\n📧 Email: {admin['email']}")
            print(f"👤 Nombre: {admin.get('name', 'N/A')}")
            print(f"🔑 Rol: {admin.get('role', 'N/A')}")
            
            # Verificar contraseña
            if bcrypt.checkpw(password.encode('utf-8'), admin['password'].encode('utf-8')):
                print(f"\n✅ VERIFICADO: Puedes usar estas credenciales para login:")
                print(f"   Email: admin@gmail.com")
                print(f"   Password: {password}")
            else:
                print("\n❌ Error en la verificación")
        
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    update_admin()
