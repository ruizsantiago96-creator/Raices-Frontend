# 🏗️ Arquitectura Feature-Driven — Raíces para Florecer

> Guía completa para el equipo sobre la estructura del proyecto, convenciones de imports y reglas de exportación.

---

## 📑 Índice

1. [Visión General](#1-visión-general)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Reglas de Feature Modules](#3-reglas-de-feature-modules)
4. [El Punto de Entrada `index.js`](#4-el-punto-de-entrada-indexjs)
5. [Convenciones de Imports](#5-convenciones-de-imports)
6. [Directorio `shared/`](#6-directorio-shared)
7. [Guía: Agregar una Nueva Feature](#7-guía-agregar-una-nueva-feature)
8. [Guía: Consumir Otra Feature](#8-guía-consumir-otra-feature)
9. [Problemas Conocidos y Soluciones](#9-problemas-conocidos-y-soluciones)
10. [Referencia Rápida](#10-referencia-rápida)

---

## 1. Visión General

El proyecto utiliza una **arquitectura Feature-Driven** donde el código se organiza por **dominios de negocio** en lugar de por tipo técnico (componentes, hooks, utils separados).

### Principios Clave

| Principio | Descripción |
|-----------|-------------|
| **Agrupación por feature** | Cada dominio (auth, jobs, social) es un módulo autocontenido |
| **API pública explícita** | Solo lo que se usa fuera de la feature se exporta en `index.js` |
| **Privacidad por defecto** | Páginas, stores, tests y mocks son internos |
| **Reutilización global** | Código compartido por múltiples features va en `src/shared/` |

### Beneficios

- **Bajo acoplamiento**: Las features no conocen la estructura interna de otras
- **Fácil refactorización**: Mover archivos internos no rompe imports externos
- **Claridad**: Es obvio qué es público vs privado
- **Escalabilidad**: Agregar features no afecta las existentes

---

## 2. Estructura del Proyecto

```
src/
├── App.jsx                    # Punto de entrada de rutas (importa páginas directamente)
├── main.jsx                   # Montaje de React + providers
│
├── features/                  # 🧩 Módulos por dominio de negocio
│   ├── a11y/                  # Accesibilidad (panel flotante)
│   ├── about/                 # Página "Quiénes somos"
│   ├── admin/                 # Panel de administración
│   ├── auth/                  # Autenticación y sesión
│   ├── dashboard/             # Panel principal del usuario
│   ├── favorites/             # Instituciones guardadas
│   ├── institutions/          # Exploración y detalle de instituciones
│   ├── jobs/                  # Bolsa de trabajo inclusiva
│   ├── landing/               # Página de inicio (pública)
│   ├── notifications/         # Sistema de notificaciones SSE
│   ├── profile/               # Perfil de usuario y onboarding
│   ├── social/                # Comunidad y mensajes directos
│   └── tutor/                 # Gestión de familiares dependientes
│
├── shared/                    # 🔧 Utilidades compartidas entre features
│   ├── components/            # UI reutilizable (Icons, BrandMark, etc.)
│   ├── lib/                   # api.js, storage.js, queryClient.js
│   └── stores/                # uiStore.js (toasts globales)
│
└── styles/
    └── global.css             # Variables CSS y estilos globales
```

---

## 3. Reglas de Feature Modules

Cada feature en `src/features/<nombre>/` debe seguir esta estructura interna **si aplica**:

```
features/<nombre-feature>/
├── index.js         ← 🆕 Punto de entrada único (OBLIGATORIO)
├── components/      # Elementos UI específicos de la feature
├── hooks/           # Custom hooks (queries, mutations, lógica)
├── lib/             # Utilidades y funciones helpers
├── store/           # Estado global (Zustand) — PRIVADO
├── pages/           # Pantallas/rutas — PRIVADAS
├── types/           # Definiciones de tipos (si se usa TypeScript)
└── __tests__/       # Tests — PRIVADOS
```

### Reglas Estrictas de Exportación

| Categoría | ¿Se exporta en index.js? | Ejemplo |
|-----------|--------------------------|---------|
| **Componentes reutilizables** | ✅ SÍ | `AppSidebar`, `TopNav`, `ProtectedRoute` |
| **Hooks usados fuera** | ✅ SÍ | `useAuth`, `useMe`, `useJobs` |
| **Helpers/funciones** | ✅ SÍ | `firebaseBridgeLogin`, `isBridgeAvailable` |
| **Stores (estado)** | ⚠️ Solo si se consumen fuera | `useAuthStore` (usado por múltiples features) |
| **Páginas/Views** | ❌ NO | `AuthPage`, `DashboardPage` |
| **Tests/Mocks** | ❌ NO | `__tests__/`, `__mocks__/` |
| **Tipos/Types** | ✅ SÍ | `UserProfile`, `Institution` |

---

## 4. El Punto de Entrada `index.js`

### Propósito

El `index.js` actúa como la **API pública** de cada feature. Es el único punto de contacto que otras features necesitan conocer.

### Ejemplo: `src/features/auth/index.js`

```js
/**
 * Auth Feature — Public API
 *
 * Exports components, hooks, and state used by other features.
 * Pages (AuthPage) are kept private — imported directly by App.jsx.
 */

// ── Components (reusable UI used across features) ──────────────────
export { AppSidebar } from './components/AppSidebar'
export { default as ProtectedRoute } from './components/ProtectedRoute'
export { TopNav } from './components/TopNav'

// ── Hooks (business logic used by other features) ─────────────────
export { useLogin, useRegister, useMe, useProfile, useUpdateProfile } from './hooks/useAuth'
export { useSessionVerify } from './hooks/useSessionVerify'

// ── Store (auth state consumed by multiple features) ───────────────
export { useAuthStore } from './store/authStore'

// ── Lib (Firebase bridge — used internally and by api.js) ──────────
export { firebaseBridgeLogin, isBridgeAvailable } from './lib/firebaseBridge'
```

### Features con index.js vacío (solo páginas)

Algunas features solo contienen páginas y no tienen componentes o hooks reutilizables:

```js
// src/features/landing/index.js
/**
 * Landing Feature — Public API
 *
 * This feature only contains pages (LandingPage).
 * Pages are kept private — imported directly by App.jsx.
 * No reusable components or hooks to export.
 */
```

---

## 5. Convenciones de Imports

### Aliases Disponibles

| Alias | Ruta | Uso |
|-------|------|-----|
| `@features` | `src/features` | Imports entre features |
| `@shared` | `src/shared` | Utilidades compartidas |
| `@styles` | `src/styles` | Hojas de estilo |

### Reglas de Import

#### ✅ CORRECTO — Importar desde el index.js de otra feature

```jsx
// Desde cualquier archivo fuera de auth:
import { AppSidebar, TopNav, useAuthStore } from '@features/auth'
import { useMe, useProfile } from '@features/auth'
import { ProtectedRoute, useSessionVerify } from '@features/auth'
```

#### ✅ CORRECTO — Importar páginas directamente (solo en App.jsx)

```jsx
// App.jsx importa páginas directamente (son privadas):
import AuthPage from '@features/auth/pages/AuthPage'
import DashboardPage from '@features/dashboard/pages/DashboardPage'
```

#### ✅ CORRECTO — Imports internos dentro de la misma feature

```jsx
// Dentro de auth/hooks/useAuth.js:
import api from '@shared/lib/api'
import { useAuthStore } from '../store/authStore'  // relativo es OK intra-feature
```

#### ✅ CORRECTO — Imports desde shared

```jsx
import api from '@shared/lib/api'
import { Icons, BrandMark } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import { getToken } from '@shared/lib/storage'
```

#### ❌ INCORRECTO — Importar rutas internas de otra feature

```jsx
// NO hacer esto:
import { AppSidebar } from '@features/auth/components/AppSidebar'
import { useAuthStore } from '@features/auth/store/authStore'
import { useMe } from '@features/auth/hooks/useAuth'
```

#### ❌ INCORRECTO — Imports con rutas relativas a shared

```jsx
// NO hacer esto (usar alias @shared):
import api from '../../../shared/lib/api'
import { Icons } from '../../../shared/components/shared'
```

### Resumen de Convenciones

| Desde | Hacia | Import |
|-------|-------|--------|
| Cualquier archivo | Otra feature | `import { X } from '@features/otra'` |
| App.jsx | Página de feature | `import Page from '@features/xxx/pages/Page'` |
| Dentro de feature | Shared | `import X from '@shared/lib/xxx'` |
| Dentro de feature | Mismo store | `import { X } from '../store/xxx'` (relativo OK) |
| Dentro de feature | Mismo hook | `import { X } from '../hooks/xxx'` (relativo OK) |

---

## 6. Directorio `shared/`

El directorio `shared/` contiene código reutilizado por múltiples features.

### Estructura

```
shared/
├── components/
│   ├── shared.jsx        # Icons, BrandMark, CategoryTag, AppFooter, etc.
│   └── Toast.jsx         # Container de notificaciones toast
├── lib/
│   ├── api.js            # Cliente Axios con interceptores de auth
│   ├── storage.js        # Gestión de tokens (localStorage/sessionStorage)
│   └── queryClient.js    # Configuración de TanStack Query
└── stores/
    └── uiStore.js        # Estado global de UI (toasts)
```

### Regla: shared → features

Existe **una única dependencia** de `shared` hacia `features`:

```js
// shared/lib/api.js importa authStore para manejar refresh token:
import { useAuthStore } from '@features/auth/store/authStore'
```

Esta dependencia es **aceptada** porque `api.js` necesita acceder al token y al store para manejar la autenticación. Sin embargo, se importa directamente del store (no del index.js) para evitar dependencias circulares.

---

## 7. Guía: Agregar una Nueva Feature

### Paso 1: Crear la estructura

```bash
mkdir -p src/features/mi-feature/{components,hooks,pages,store}
```

### Paso 2: Crear el index.js

```js
// src/features/mi-feature/index.js
/**
 * Mi Feature — Public API
 *
 * Exports components and hooks used by other features.
 * Pages are kept private — imported directly by App.jsx.
 */

// ── Components ─────────────────────────────────────────────────────
export { default as MiComponente } from './components/MiComponente'

// ── Hooks ──────────────────────────────────────────────────────────
export { useMiHook } from './hooks/useMiHook'
```

### Paso 3: Implementar componentes y hooks

```jsx
// src/features/mi-feature/components/MiComponente.jsx
import { Icons } from '@shared/components/shared'

export default function MiComponente() {
  return <div>{Icons.home()}</div>
}
```

```js
// src/features/mi-feature/hooks/useMiHook.js
import api from '@shared/lib/api'

export function useMiHook() {
  // ...
}
```

### Paso 4: Agregar ruta en App.jsx

```jsx
import MiFeaturePage from '@features/mi-feature/pages/MiFeaturePage'

// En las rutas:
<Route path="/mi-feature" element={<ProtectedRoute><MiFeaturePage /></ProtectedRoute>} />
```

### Paso 5: Consumir desde otras features

```jsx
import { MiComponente, useMiHook } from '@features/mi-feature'
```

---

## 8. Guía: Consumir Otra Feature

### Regla de Oro

> **Nunca importes directamente los archivos internos de otra feature.**
> **Siempre importa desde el `index.js` de esa feature.**

### Ejemplo: Dashboard usa auth

```jsx
// ✅ CORRECTO
import { AppSidebar, TopNav, useMe, useAuthStore } from '@features/auth'
import { NotificationBell } from '@features/notifications'

// ❌ INCORRECTO
import { AppSidebar } from '@features/auth/components/AppSidebar'
import { useAuthStore } from '@features/auth/store/authStore'
import { useMe } from '@features/auth/hooks/useAuth'
```

### Si necesitas algo que no está exportado

Si una feature no exporta algo que necesitas:

1. **Verifica si es realmente necesario** fuera de la feature
2. **Si sí**: Agrega el export al `index.js` de esa feature
3. **Si no**: El código debe vivir dentro de esa feature

---

## 9. Problemas Conocidos y Soluciones

### Dependencia Circular

**Problema**: `shared/lib/api.js` necesita `useAuthStore` de auth, pero auth hooks usan `api.js`.

**Solución**: `api.js` importa directamente del store, no del index.js:

```js
// shared/lib/api.js
import { useAuthStore } from '@features/auth/store/authStore'  // ✅ Directo al store
// NO: import { useAuthStore } from '@features/auth'           // ❌ Circular
```

### Páginas que necesitan ser importadas externamente

**Problema**: App.jsx necesita importar páginas, pero las páginas son "privadas".

**Solución**: App.jsx importa páginas directamente de la ruta interna:

```jsx
// App.jsx
import AuthPage from '@features/auth/pages/AuthPage'
import DashboardPage from '@features/dashboard/pages/DashboardPage'
```

Esto es aceptable porque App.jsx es el orquestador de rutas y es el único lugar que necesita esta importación.

---

## 10. Referencia Rápida

### Mapa de Imports por Feature

| Feature | Index.js Exporta | Páginas (privadas) |
|---------|------------------|-------------------|
| `auth` | `AppSidebar`, `ProtectedRoute`, `TopNav`, `useLogin`, `useRegister`, `useMe`, `useProfile`, `useUpdateProfile`, `useSessionVerify`, `useAuthStore`, `firebaseBridgeLogin`, `isBridgeAvailable` | `AuthPage` |
| `a11y` | `AccessibilityBar` | — |
| `institutions` | `MapView`, `useInstitutions`, `useDiscovery`, `useReviews` | `ExplorePage`, `InstitutionPage` |
| `notifications` | `NotificationBell`, `useNotifications`, `closeNotificationStream`, `suspendStream`, `resumeStream` | — |
| `profile` | `useProfile`, `useUpdateProfile` | `ProfilePage`, `OnboardingPage` |
| `social` | `useCommunity`, `useMessages` | `SocialPage` |
| `tutor` | `useAI`, `useDependents` | `TutorPage` |
| `jobs` | `useJobs` | `JobsPage` |
| `favorites` | `useFavorites` | `FavoritesPage` |
| `admin` | `useAdmin` | `AdminPage` |
| `landing` | *(vacío)* | `LandingPage` |
| `about` | *(vacío)* | `AboutPage` |
| `dashboard` | *(vacío)* | `DashboardPage` |

### Checklist para Code Review

- [ ] ¿Los imports entre features usan el `index.js` (`@features/xxx`)?
- [ ] ¿Los imports de shared usan el alias (`@shared/xxx`)?
- [ ] ¿Las páginas solo se importan en App.jsx?
- [ ] ¿El `index.js` no exporta tests, mocks ni páginas?
- [ ] ¿No hay dependencias circulares entre features?
- [ ] ¿Los stores solo se exportan si se consumen fuera de la feature?

---

*Documento creado el 21 de julio de 2026 para el proyecto Raíces Frontend.*
*Última actualización: 21 de julio de 2026.*
