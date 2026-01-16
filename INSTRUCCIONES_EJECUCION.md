# 🚀 Instrucciones para Ejecutar Cuenca Eventos

## Requisitos Previos
- Docker Desktop instalado y corriendo
- PowerShell o terminal con permisos de administrador

## Pasos de Ejecución

### 1. Navegar al Directorio del Proyecto
```powershell
cd "C:\Users\darwi\Desktop\Universidad\Octavo\Interaccion Humano Maquina\Pagina WebCUENCAEVENTOS"
```

### 2. Levantar los Contenedores
```powershell
docker-compose up -d
```
> **Nota:** El flag `-d` ejecuta los contenedores en segundo plano (detached mode).

### 3. Verificar que los Servicios estén Corriendo
```powershell
docker-compose ps
```
Deberías ver 3 contenedores activos:
- `mongodb` (Puerto 27017)
- `redis` (Puerto 6379)
- `backend` (Puerto 3001)
- `frontend` (Puerto 5173)

### 4. Ver los Logs (Opcional)
Para ver los logs de todos los servicios:
```powershell
docker-compose logs -f
```
Para ver logs de un servicio específico:
```powershell
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 5. Acceder a la Aplicación
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api/v1
- **Documentación API:** http://localhost:3001/docs

---

## Comandos Útiles

### Detener los Contenedores
```powershell
docker-compose stop
```

### Detener y Eliminar los Contenedores
```powershell
docker-compose down
```

### Reconstruir y Levantar (si hay cambios en el código)
```powershell
docker-compose up -d --build
```

### Reiniciar un Servicio Específico
```powershell
docker-compose restart frontend
docker-compose restart backend
```

### Entrar a un Contenedor (para debugging)
```powershell
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh
```

---

## Solución de Problemas

### Error: Puerto en Uso
Si un puerto ya está ocupado, puedes:
1. Detener el proceso que usa ese puerto
2. O modificar el puerto en `docker-compose.yml`

### Reconstruir desde Cero
Si algo falla, puedes eliminar todo y empezar de nuevo:
```powershell
docker-compose down -v
docker-compose up -d --build
```
> **Advertencia:** El flag `-v` elimina los volúmenes (se perderán los datos de MongoDB).

---

## Notas Importantes
- **Primera Ejecución:** La primera vez tardará más porque Docker debe descargar las imágenes base.
- **Hot Reload:** Tanto frontend como backend tienen hot-reload activado, los cambios se reflejan automáticamente.
- **Base de Datos:** MongoDB persiste los datos en un volumen Docker, por lo que se mantienen entre reinicios.
