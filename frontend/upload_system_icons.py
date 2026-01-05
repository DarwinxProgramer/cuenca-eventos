#!/usr/bin/env python3
"""
Script para subir iconos del sistema a GridFS y actualizar systemIconsApi.ts

Uso:
    python upload_system_icons.py

Requiere:
    - requests
    - python-dotenv (opcional)
"""

import os
import sys
import json
import requests
from pathlib import Path

# Configuración
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')
ICONS_DIR = Path(__file__).parent / 'src' / 'icons'
SYSTEM_ICONS_API_PATH = Path(__file__).parent / 'src' / 'services' / 'systemIconsApi.ts'

# Mapeo de archivos a nombres de iconos
ICON_MAPPING = {
    'LogoPrincipal.PNG': 'logo-principal',
    'LogoModoOscuro.PNG': 'logo-oscuro',
    'LogoSecundario.PNG': 'logo-secundario',
    'agenda.png': 'agenda',
    'evento.png': 'evento',
    'mapa.png': 'mapa',
    'perfil.png': 'perfil',
    'rutas.png': 'rutas',
    'lupa.png': 'lupa',
    'destacados.png': 'destacados',
    'notificacion.png': 'notificacion',
    'descarga.png': 'descarga',
    'fondo_menu.png': 'fondo-menu',
}

def login_admin():
    """Login como admin y retorna el token"""
    print("🔐 Iniciando sesión como administrador...")
    
    # Credenciales de admin (cambiar según tu configuración)
    email = input("Email de administrador: ")
    password = input("Contraseña: ")
    
    response = requests.post(
        f"{BACKEND_URL}/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    
    if response.status_code != 200:
        print(f"❌ Error al iniciar sesión: {response.text}")
        sys.exit(1)
    
    data = response.json()
    print(f"✅ Sesión iniciada como: {data['user']['name']}")
    return data['token']

def upload_icon(file_path: Path, token: str):
    """Sube un icono a GridFS y retorna el ID"""
    print(f"📤 Subiendo {file_path.name}...")
    
    with open(file_path, 'rb') as f:
        files = {'file': (file_path.name, f, 'image/png')}
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.post(
            f"{BACKEND_URL}/api/v1/images/upload",
            files=files,
            headers=headers
        )
    
    if response.status_code != 200:
        print(f"❌ Error subiendo {file_path.name}: {response.text}")
        return None
    
    data = response.json()
    image_id = data.get('image_id') or data.get('id')
    print(f"✅ {file_path.name} subido con ID: {image_id}")
    return image_id

def update_system_icons_api(icon_ids: dict):
    """Actualiza el archivo systemIconsApi.ts con los IDs"""
    print("\n📝 Actualizando systemIconsApi.ts...")
    
    # Leer el archivo actual
    content = SYSTEM_ICONS_API_PATH.read_text(encoding='utf-8')
    
    # Crear el nuevo objeto SYSTEM_ICONS
    icons_entries = []
    for icon_name, icon_id in icon_ids.items():
        icons_entries.append(f"    '{icon_name}': '{icon_id}',")
    
    new_system_icons = "export const SYSTEM_ICONS = {\n" + "\n".join(icons_entries) + "\n} as const;"
    
    # Reemplazar el objeto SYSTEM_ICONS
    import re
    pattern = r'export const SYSTEM_ICONS = \{[^}]+\} as const;'
    new_content = re.sub(pattern, new_system_icons, content, flags=re.DOTALL)
    
    # Escribir el archivo actualizado
    SYSTEM_ICONS_API_PATH.write_text(new_content, encoding='utf-8')
    print("✅ systemIconsApi.ts actualizado correctamente")

def main():
    print("=" * 60)
    print("🚀 Migración de Iconos del Sistema a GridFS")
    print("=" * 60)
    
    # Verificar que el directorio de iconos existe
    if not ICONS_DIR.exists():
        print(f"❌ Directorio de iconos no encontrado: {ICONS_DIR}")
        sys.exit(1)
    
    # Login
    token = login_admin()
    
    # Subir iconos
    icon_ids = {}
    for filename, icon_name in ICON_MAPPING.items():
        file_path = ICONS_DIR / filename
        
        if not file_path.exists():
            print(f"⚠️  Archivo no encontrado: {filename}, saltando...")
            continue
        
        image_id = upload_icon(file_path, token)
        if image_id:
            icon_ids[icon_name] = image_id
    
    # Mostrar resumen
    print("\n" + "=" * 60)
    print(f"📊 Resumen: {len(icon_ids)}/{len(ICON_MAPPING)} iconos subidos")
    print("=" * 60)
    
    for icon_name, icon_id in icon_ids.items():
        print(f"  {icon_name}: {icon_id}")
    
    # Actualizar systemIconsApi.ts
    if icon_ids:
        update_system_icons_api(icon_ids)
    
    print("\n✅ ¡Migración completada!")
    print("\nPróximos pasos:")
    print("  1. Verificar que npm run dev funciona correctamente")
    print("  2. Probar que los iconos se cargan desde la base de datos")
    print("  3. Eliminar archivos locales: src/icons/*.png (opcional)")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Proceso interrumpido por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
