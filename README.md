# Raíces para Florecer - Frontend

Aplicación web frontend del proyecto **Raíces para Florecer**.

## Stack

- **React 18** con JSX
- **Vite** como bundler
- **React Router** para navegación
- **TanStack Query** para manejo de datos
- **Zustand** para estado global
- **Axios** para peticiones HTTP
- **MapLibre GL** para mapas

## Inicio rápido

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Build de producción
pnpm build

# Preview del build
pnpm preview
```

## Variables de entorno

Crea un archivo `.env.development` con:

```
VITE_API_URL=http://localhost:7000
```

## Estructura

```
src/
├── components/    # Componentes compartidos
├── hooks/         # Custom hooks
├── lib/           # Utilidades (api, queryClient)
├── pages/         # Páginas/rutas
├── stores/        # Estado global (Zustand)
├── styles/        # Estilos globales
├── App.jsx        # Router principal
└── main.jsx       # Entry point
```
