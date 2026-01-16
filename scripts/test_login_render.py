"""
Script para probar login contra el backend de Render
"""
import requests
import json

# Tu backend en Render
API_URL = "https://cuenca-eventos.onrender.com/api/v1"

def test_login():
    print("="*60)
    print("🔐 PROBANDO LOGIN EN RENDER")
    print("="*60)
    
    # Método 1: OAuth2 (form-data con username)
    print("\n\n=== MÉTODO 1: OAuth2 Form ===")
    print(f"🌐 Endpoint: {API_URL}/auth/login")
    
    form_data = {
        "username": "admin@gmail.com",  # OAuth2 usa 'username' aunque sea email
        "password": "rBGXrjjuPntI6kVeqrkXMA"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            data=form_data,  # form-data, no JSON
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ LOGIN EXITOSO (OAuth2)")
            data = response.json()
            print(f"🎟️  Token: {data.get('access_token', '')[:50]}...")
        else:
            print(f"❌ Falló: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Método 2: JSON body
    print("\n\n=== MÉTODO 2: JSON Body ===")
    print(f"🌐 Endpoint: {API_URL}/auth/login/json")
    
    json_data = {
        "email": "admin@gmail.com",
        "password": "rBGXrjjuPntI6kVeqrkXMA"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login/json",
            json=json_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ LOGIN EXITOSO (JSON)")
            data = response.json()
            print(f"🎟️  Token: {data.get('access_token', '')[:50]}...")
        else:
            print(f"❌ Falló: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    test_login()
