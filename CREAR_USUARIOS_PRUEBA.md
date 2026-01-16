# Script para crear usuarios de prueba en MongoDB

## Conectar a MongoDB
```powershell
docker-compose exec mongodb mongosh cuenca_eventos
```

## Usuarios de Prueba

### 1. Usuario Admin
```javascript
db.User.insertOne({
  email: "admin@cuenca.com",
  full_name: "Admin Cuenca",
  hashed_password: "$2b$12$LQv3c1yqBT.RxUfYSzsDx.lECkQNmZfLDWcSa3BdyDbfnX/4fF5CK", // admin123
  role: "admin",
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
})
```

### 2. Usuario Normal
```javascript
db.User.insertOne({
  email: "user@cuenca.com",
  full_name: "Usuario Normal",
  hashed_password: "$2b$12$LQv3c1yqBT.RxUfYSzsDx.lECkQNmZfLDWcSa3BdyDbfnX/4fF5CK", // user123
  role: "user",
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
})
```

## Verificar
```javascript
db.User.find({}, {email: 1, full_name: 1, role: 1})
```

## Credenciales LOGIN
- **Admin:** admin@cuenca.com / admin123
- **User:** user@cuenca.com / user123
