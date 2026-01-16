# 🎉 Cuenca Eventos

**Plataforma digital para descubrir, planificar y disfrutar los eventos culturales de Cuenca, Ecuador.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?logo=pwa)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?logo=kubernetes)

---

## 📖 Descripción

Cuenca Eventos es una **aplicación web progresiva (PWA)** full-stack que permite a turistas y ciudadanos explorar los eventos culturales, religiosos, gastronómicos y tradicionales de Cuenca, Patrimonio Cultural de la Humanidad.

### ✨ Características Principales

**Para Usuarios:**
- 📅 **Calendario de Eventos** - Visualiza eventos por fecha con filtros
- 🗺️ **Mapa Interactivo** - Explora eventos con geolocalización en OpenStreetMap
- 📲 **Experiencia PWA Completa** - Instalable en iOS/Android, soporte offline y experiencia nativa
- 🛤️ **Rutas Turísticas** - Descubre rutas temáticas de la ciudad
- 📋 **Agenda Personal** - Guarda y organiza tus eventos favoritos
- 🔔 **Alertas de Tránsito** - Información sobre cierres viales y desvíos

**Para Administradores:**
- 🛠️ **Panel de Admin** - CRUD completo de eventos, alertas, rutas y usuarios
- 📸 **Gestión de Imágenes** - Subida optimizada y almacenamiento con GridFS (MongoDB)
- 👥 **Gestión de Usuarios** - Control de roles y permisos
- 📊 **Dashboard** - Estadísticas en tiempo real

---

## 📱 Instalación PWA (App Móvil)

Puedes instalar Cuenca Eventos como una aplicación nativa en tu dispositivo:

1. **Android (Chrome/Edge):** Toca "Agregar a la pantalla principal" en el menú o usa el botón flotante de instalación en la app.
2. **iOS (Safari):** Toca el botón "Compartir" y selecciona "Agregar al inicio".
3. **Escritorio:** Haz clic en el icono de instalación en la barra de direcciones del navegador.

---

## 🐳 Despliegue y Producción

Este proyecto está preparado para desplegarse en entornos modernos escalables.

### Arquitectura de Producción
- **Frontend**: Vercel (Static Web App + PWA)
- **Backend**: Render / Kubernetes (Containerized API)
- **Database**: MongoDB Atlas (Cloud Database)

### 1. Migración de Base de Datos
Para mover tus datos locales a producción (MongoDB Atlas):

1. Configura tu Connection String de Atlas en una variable de entorno `MONGODB_ATLAS_URI` o ingrésala cuando el script lo solicite.
2. Ejecuta el script seguro de migración:
   ```powershell
   python scripts/migrate_db_safe.py
   ```
3. Selecciona el modo: `Limpiar` (sobrescribe todo) o `Agregar` (mantiene existentes).

### 2. Despliegue en Kubernetes (K8s)

Los manifiestos de producción se encuentran en la carpeta `kubernetes/`.

1. **Configurar Credenciales**:
   El archivo `kubernetes/config.yaml` contiene los Secrets (Base64). Asegúrate de actualizarlos con tus credenciales reales de Atlas.
   
2. **Aplicar Manifiestos**:
   ```bash
   kubectl apply -f kubernetes/config.yaml
   kubectl apply -f kubernetes/redis.yaml
   kubectl apply -f kubernetes/backend.yaml
   ```

---

## 🚀 Desarrollo Local

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/DarwinxProgramer/cuenca-eventos.git
cd cuenca-eventos

# Levantar todos los servicios
docker-compose up -d

# Acceder a:
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
# Swagger Docs: http://localhost:3001/api/v1/docs
```

### Opción 2: Instalación Manual

#### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 3001
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Acceder a http://localhost:5173
```

---

## 🗄️ Estructura del Proyecto

```
cuenca-eventos/
├── backend/                 # Backend FastAPI
│   ├── app/                 # Código fuente API
│   ├── requirements.txt     # Dependencias Python
│   └── Dockerfile           # Contenedor Backend
├── frontend/                # Frontend React + Vite
│   ├── src/                 # Código fuente React
│   └── vite.config.ts       # Configuración PWA
├── kubernetes/              # Manifiestos K8s de producción
│   ├── backend.yaml         # Deployment & Service
│   └── config.yaml          # ConfigMap & Secrets
├── scripts/                 # Utilidades de mantenimiento
│   ├── migrate_db_safe.py   # Migración segura a Atlas
│   └── cleanup.ps1          # Limpieza de archivos obsoletos
├── docker-compose.yml       # Orquestación local
└── README.md                # Documentación
```

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3 | Interfaz de usuario |
| TypeScript | 5.6 | Tipado estático |
| Vite | 6.0 | Build tool de alto rendimiento |
| Vite PWA | 1.2 | Funcionalidades Progressive Web App |
| TailwindCSS | 3.4 | Estilos y diseño responsivo |
| React Leaflet | 4.2 | Mapas interactivos |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.11+ | Lenguaje base |
| FastAPI | 0.115+ | API REST de alto rendimiento |
| MongoDB | Latest | Persistencia de datos (Motor) |
| Redis | 7.x | Caché y Rate Limiting |
| Kubernetes | 1.2x | Orquestación de contenedores |


---

## 👥 Equipo - Dar Solutions

| Nombre | Rol |
|--------|-----|
| **Darwin Chuqui** | Líder de Proyecto, Desarrollo Full-Stack |
| Christopher Timbi | Diseñador UI y Programador |
**Universidad:** Universidad de Cuenca, Ecuador

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos para la Universidad de Cuenca.
