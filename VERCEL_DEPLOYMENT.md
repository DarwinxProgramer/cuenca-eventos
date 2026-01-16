# 🚀 Despliegue en Vercel - Checklist Rápida

## 1. Configuración Inicial
```
Framework: Vite
Root Directory: frontend
```

## 2. Variable de Entorno en Vercel
```bash
VITE_API_URL=https://TU-BACKEND.onrender.com/api/v1
```

## 3. Después del Deploy
En Render, actualizar CORS:
```bash
CORS_ORIGINS=["https://tu-app.vercel.app","http://localhost:5173"]
```

## ✅ Verificar
- [ ] App carga
- [ ] Login funciona  
- [ ] No hay errores CORS en consola
