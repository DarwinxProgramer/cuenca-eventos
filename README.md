# 🎉 Cuenca Eventos

**Plataforma digital para descubrir, planificar y disfrutar los eventos culturales de Cuenca, Ecuador.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?logo=pwa)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb)

---

## 📖 Descripción

Cuenca Eventos es una **aplicación web progresiva (PWA)** full-stack que permite a turistas y ciudadanos explorar los eventos culturales, religiosos, gastronómicos y tradicionales de Cuenca, Patrimonio Cultural de la Humanidad.

### ✨ Características Principales

**Para Usuarios:**
- 📅 **Calendario de Eventos** - Visualiza eventos por fecha con filtros
- 🗺️ **Mapa Interactivo** - Explora eventos con geolocalización en OpenStreetMap
- � **Experiencia PWA Completa** - Instalable en iOS/Android, soporte offline y experiencia nativa
- �🛤️ **Rutas Turísticas** - Descubre rutas temáticas de la ciudad
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

## 🚀 Inicio Rápido

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

#### Backend (FastAPI + MongoDB + Redis)

```bash
# 1. Requisitos previos: MongoDB y Redis deben estar corriendo (local o docker)
docker-compose up -d mongodb redis

# 2. Configurar entorno
cd backend
cp .env.example .env
# IMPORTANTE: Revisa .env y ajusta las credenciales de DB si es necesario

# 3. Entorno virtual e instalación
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 4. Ejecutar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 3001
```

#### Frontend (React + TypeScript)

```bash
# 1. Configurar entorno (CRÍTICO para imágenes)
cd frontend
cp .env.example .env
# El archivo .env debe contener: VITE_API_URL=http://localhost:3001/api/v1

# 2. Instalar y ejecutar
npm install
npm run dev

# Acceder a http://localhost:5173
```

---

## 🗄️ Estructura del Proyecto

```
cuenca-eventos/
├── backend/                 # Backend FastAPI
│   ├── app/                # Código fuente API
│   ├── scripts/            # Scripts de utilidad
│   └── requirements.txt    # Dependencias Python
├── frontend/               # Frontend React + Vite
│   ├── public/             # Assets estáticos (PWA icons)
│   ├── src/
│   │   ├── components/     # Componentes (Hero, Maps, Gallery)
│   │   ├── services/       # Cliente API (Axios)
│   │   └── ...
│   └── vite.config.ts      # Configuración Vite + PWA
├── docker-compose.yml      # Orquestación
└── README.md              # Documentación
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
| FastAPI | 0.100+ | API REST de alto rendimiento |
| MongoDB | Latest | Persistencia de datos (Motor) |
| Beanie ODM | - | ORM asíncrono para MongoDB |
| Redis | Latest | Caché y sesiones |

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
