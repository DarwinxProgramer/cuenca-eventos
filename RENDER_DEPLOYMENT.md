# 🚀 Despliegue en Render

Esta guía te ayudará a desplegar el backend en Render.com.

## ⚙️ Configuración del Servicio

### 1. Crear Web Service en Render

1. Conecta tu repositorio de GitHub
2. Configura:
   - **Name**: `cuenca-eventos-api` (o el que prefieras)
   - **Environment**: `Python 3.11`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2. Variables de Entorno Requeridas

Ve a **Environment** en tu servicio y agrega:

```bash
# MongoDB Atlas (CRÍTICO)
MONGODB_URL=mongodb+srv://darwinchuqui_db_user:ocEgQWTlMolliOQt@clustercuencaeventos.b1qmntf.mongodb.net/cuenca_eventos?retryWrites=true&w=majority&appName=ClusterCuencaEventos
DATABASE_NAME=cuenca_eventos

# JWT Security
SECRET_KEY=HFXTmyvSHtEqCxc5IKsbCpL4HDxencOqHcKIFDVGKYc
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Admin por Defecto
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=rBGXrjjuPntI6kVeqrkXMA
ADMIN_NAME=Administrador

# CORS - Reemplaza con tu URL de Vercel
CORS_ORIGINS=["https://tu-app.vercel.app","http://localhost:5173"]

# Producción
ENVIRONMENT=production
DEBUG=false
```

### 3. Verificar Despliegue

Una vez desplegado, visita:
```
https://tu-servicio.onrender.com/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "project": "Cuenca Eventos API",
  "version": "1.0.0"
}
```

## ℹ️ Notas Importantes

- **Redis**: No es necesario en Render. El backend funcionará sin él usando almacenamiento en memoria para rate limiting.
- **MongoDB**: Debe apuntar a Atlas, NO a localhost.
- **CORS**: Actualiza con tu URL real de Vercel una vez desplegado el frontend.

## 🔧 Solución de Problemas

### Error: "Connection refused localhost:27017"
- Verifica que `MONGODB_URL` esté configurado correctamente en las variables de entorno
- Debe ser la URL de Atlas, no localhost

### Error: "Redis connection failed"
- Es normal si no tienes Redis. El backend está configurado para funcionar sin él.

### Error: "CORS policy"
- Verifica que `CORS_ORIGINS` incluya la URL de tu frontend en Vercel
