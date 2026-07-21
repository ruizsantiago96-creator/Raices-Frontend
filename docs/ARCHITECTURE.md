# Arquitectura del Proyecto — Raíces para Florecer

Este documento describe la arquitectura feature-based del frontend, diseñada para escalar de forma organizada y mantener el código modular.

## 📁 Estructura General

```
src/
├── App.jsx                          # Punto de entrada de rutas
├── main.jsx                         # Montaje de React + providers
├── features/                        # Módulos por dominio de negocio
│   ├── a11y/                        # Accesibilidad
│   ├── about/                       # Página "Quiénes somos"
│   ├── admin/                       # Panel de administración
│   ├── auth/                        # Autenticación y sesión
│   ├── dashboard/                   # Panel principal del usuario
│   ├── favorites/                   # Instituciones guardadas
│   ├── institutions/                # Exploración y detalle de instituciones
│   ├── jobs/                        # Bolsa de trabajo inclusiva
│   ├── landing/                     # Página de inicio (pública)
│   ├── notifications/               # Sistema de notificaciones SSE
│   ├── profile/                     # Perfil de usuario y onboarding
│   ├── social/                      # Comunidad y mensajes directos
│   └── tutor/                       # Gestión de familiares dependientes
├── shared/                          # Utilidades compartidas
│   ├── components/                  # Componentes UI reutilizables
│   ├── lib/                         # Utilidades de red y storage
│   └── stores/                      # Stores globales
└── styles/
    └── global.css                   # Estilos globales y variables CSS
```

## 🧩 Cada Feature Contiene

Cada directorio dentro de `features/` es un módulo autocontenido que sigue la siguiente convención:

```
features/<nombre-feature>/
├── components/        # Componentes UI específicos de esta feature
├── hooks/             # Custom hooks (queries, mutations, lógica)
├── lib/               # Utilidades específicas (streams, helpers)
├── pages/             # Páginas/rutas de esta feature
└── store/             # Zustand store (si aplica)
```

### Features Detalladas

#### `auth/` — Autenticación
| Tipo | Archivos |
|------|----------|
| Components | `ProtectedRoute.jsx` |
| Hooks | `useAuth.js` (login, register, me, profile), `useSessionVerify.js` |
| Store | `authStore.js` (token, user, setAuth, logout) |
| Lib | `firebaseBridge.js` (puente Firebase REST API) |
| Pages | `AuthPage.jsx` (login, registro, forgot password) |

#### `institutions/` — Instituciones
| Tipo | Archivos |
|------|----------|
| Components | `MapView.jsx` (mapa con MapLibre) |
| Hooks | `useInstitutions.js`, `useReviews.js` |
| Pages | `ExplorePage.jsx`, `InstitutionPage.jsx` |

#### `jobs/` — Empleo
| Tipo | Archivos |
|------|----------|
| Hooks | `useJobs.js` (useJobs, useAppliedJobIds, useApplyJob, useMyApplications) |
| Pages | `JobsPage.jsx` |

#### `favorites/` — Favoritos
| Tipo | Archivos |
|------|----------|
| Hooks | `useFavorites.js` (useFavorites, useFavoriteIds, useToggleFavorite) |
| Pages | `FavoritesPage.jsx` |

#### `notifications/` — Notificaciones
| Tipo | Archivos |
|------|----------|
| Components | `NotificationBell.jsx` |
| Hooks | `useNotifications.js` (useNotifications, useMarkRead, useMarkAllRead, useNotificationStream) |
| Lib | `notificationStream.js` (gestor SSE con "freno de mano") |

#### `social/` — Comunidad
| Tipo | Archivos |
|------|----------|
| Hooks | `useCommunity.js` (grupos, posts, comentarios), `useMessages.js` (mensajes directos) |
| Pages | `SocialPage.jsx` |

#### `profile/` — Perfil
| Tipo | Archivos |
|------|----------|
| Hooks | `useProfile.js` (useProfile, useUpdateProfile, useSaveProfiling) |
| Pages | `ProfilePage.jsx`, `OnboardingPage.jsx` |

#### `tutor/` — Tutor/Familia
| Tipo | Archivos |
|------|----------|
| Hooks | `useDependents.js`, `useAI.js` (useChat, useAINextSteps, useAIForDependent) |
| Pages | `TutorPage.jsx` |

#### `admin/` — Administración
| Tipo | Archivos |
|------|----------|
| Hooks | `useAdmin.js` (stats, analytics, institutions, users, reviews, alerts, settings) |
| Pages | `AdminPage.jsx` |

#### `a11y/` — Accesibilidad
| Tipo | Archivos |
|------|----------|
| Components | `AccessibilityBar.jsx` (panel flotante de accesibilidad) |
| Store | `a11yStore.js` (textScale, highContrast, colorblindMode, ttsEnabled, etc.) |

#### `landing/` — Landing Page
| Tipo | Archivos |
|------|----------|
| Pages | `LandingPage.jsx` |

#### `dashboard/` — Dashboard
| Tipo | Archivos |
|------|----------|
| Pages | `DashboardPage.jsx` |

#### `about/` — About
| Tipo | Archivos |
|------|----------|
| Pages | `AboutPage.jsx` |

## 📦 `shared/` — Utilidades Compartidas

Contiene código reutilizable que **no pertenece a una feature específica**:

### `shared/components/`
| Archivo | Exports |
|---------|---------|
| `shared.jsx` | `Icons`, `CategoryTag`, `CATEGORY_COLORS`, `BrandMark`, `LeafIcon`, `AppFooter`, `labelStyle`, `inputStyle` |
| `Toast.jsx` | `ToastContainer` |

### `shared/lib/`
| Archivo | Exports |
|---------|---------|
| `api.js` | Cliente Axios con interceptores de auth y refresh token |
| `storage.js` | Helpers para localStorage/sessionStorage (tokens, usuario) |
| `queryClient.js` | Instancia de TanStack Query |

### `shared/stores/`
| Archivo | Exports |
|---------|---------|
| `uiStore.js` | `useUiStore` (toasts) |

> **Nota**: `AppSidebar` y `TopNav` están en `features/auth/components/` (no en shared) porque dependen directamente de `useAuthStore`.

## 🔧 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | React 18 |
| Bundler | Vite |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| HTTP Client | Axios |
| Mapas | MapLibre GL |
| Estilos | CSS Variables + Inline Styles |

## 📐 Convenciones de Código

### Imports
Se utilizan **path aliases** configurados en `vite.config.js` para imports limpios y consistentes:
```js
@shared/*    → src/shared/*
@features/*  → src/features/*
@styles/*    → src/styles/*
```

Ejemplos:
```jsx
import { Icons } from '@shared/components/shared'
import { useAuthStore } from '@features/auth/store/authStore'
import { api } from '@shared/lib/api'
```

#### Regla de Profundidad de Rutas

Los aliases eliminan el problema de contar niveles `../`, pero si alguna vez necesitas rutas relativas, recuerda:

| Ubicación del archivo | Profundidad desde `src/` | Para llegar a `src/shared/` necesitas | Para llegar a `src/features/` necesitas |
|---|---|---|---|
| `src/App.jsx` | 1 nivel | `./shared/` | `./features/` |
| `src/features/X/pages/*.jsx` | 3 niveles | `../../../shared/` | `../../` |
| `src/features/X/hooks/*.js` | 3 niveles | `../../../shared/` | `../../` |
| `src/shared/lib/*.js` | 2 niveles | `../` | `../../features/` |

**Regla práctica**: Cuenta cuántos `../` necesitas para llegar a `src/` y luego agrega la ruta. Con aliases esto no es necesario — simplemente usa `@shared/...` o `@features/...`.

- **Nunca** importar directamente de `features/` desde `shared/` (excepto `shared.jsx` que importa `authStore` para el sidebar — deuda técnica conocida)
- `jsconfig.json` está configurado para que VSCode/IntelliJ resuelva los aliases en autocompletado y errores

### Naming
- **Components**: PascalCase (`AuthPage.jsx`, `NotificationBell.jsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.js`, `useFavorites.js`)
- **Stores**: camelCase con sufijo `Store` (`authStore.js`, `uiStore.js`)
- **Pages**: PascalCase con sufijo `Page` (`DashboardPage.jsx`)

## ➕ Cómo Agregar una Nueva Feature

### Paso 1: Crear la estructura de carpetas
```bash
mkdir -p src/features/<nombre-feature>/{components,hooks,pages,lib}
```

### Paso 2: Desarrollar los componentes
- **Hooks**: Si consume la API, usa `import api from '@shared/lib/api'`
- **Components**: Si necesita el usuario, importa `useAuthStore` de `@features/auth/store/authStore`
- **Pages**: Importa layouts compartidos de `@shared/components/shared`

### Paso 3: Registrar la ruta en App.jsx
```jsx
import <PageName> from '@features/<nombre-feature>/pages/<PageName>'

// Dentro de <Routes>:
<Route path="/<ruta>" element={<ProtectedRoute><PageName /></ProtectedRoute>} />
```

### Paso 4: Actualizar la navegación (si aplica)
Si la feature tiene página propia, agregar entrada en `AppSidebar` dentro de `@features/auth/components/AppSidebar.jsx`.

## ⚠️ Deuda Técnica Conocida

1. **Dependencia shared → features**: `shared/lib/api.js` importa `useAuthStore` desde `features/auth/` para manejar logout en 401 y refresh token. Esta cadena (api → authStore → storage) es unidireccional y no causa problemas de inicialización en runtime. Para eliminarla completamente, se pasarían las funciones de auth como parámetros al crear la instancia de axios, pero requeriría refactorizar toda la capa de API.

2. **Path aliases configurados**: Se usan `@shared/*`, `@features/*` y `@styles/*` en lugar de rutas relativas. Configurados en `vite.config.js` y `jsconfig.json`.
