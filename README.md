# Cuenca Eventos

Plataforma web para descubrir eventos culturales en Cuenca, Ecuador.

## 🚀 Quick Start

### Desarrollo Local (sin Docker)

```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

### Desarrollo con Docker

```bash
docker-compose up --build
```

Abre [http://localhost:5173](http://localhost:5173)

## 📁 Estructura del Proyecto

```
├── frontend/
│   ├── src/
│   │   ├── icons/      # Assets SVG/imágenes
│   │   ├── mocks/      # Datos simulados
│   │   ├── App.tsx     # Componente principal con Router
│   │   ├── main.tsx    # Entry point
│   │   └── index.css   # Estilos Tailwind
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── docker-compose.yml
```

## 🛠️ Stack Tecnológico

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS 3.4.19** - Estilos
- **React Router DOM** - Navegación
- **Docker** - Contenedorización

## 📝 Licencia

MIT
