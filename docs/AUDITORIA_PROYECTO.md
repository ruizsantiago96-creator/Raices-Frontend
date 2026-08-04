# 🔍 Auditoría Completa del Proyecto — Raíces Frontend

**Fecha:** 31 de julio, 2026
**Rama:** `dev`
**Estado del repo:** Limpio (solo archivos untracked nuevos)

---

## 1. Estructura General del Proyecto

### Stack Tecnológico
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | ^19.1.0 | Framework UI |
| Vite | ^5.4.8 | Build tool |
| React Router | ^7.6.2 | Enrutamiento |
| Zustand | ^5.0.5 | State management |
| TanStack Query | ^5.83.0 | Server state / data fetching |
| Axios | ^1.9.0 | HTTP client |
| Firebase | ^12.1.0 | Push notifications (FCM) |
| Tailwind CSS | ^4.1.8 | Utility-first CSS |
| Lucide React | ^0.525.0 | Iconos |
| Vitest | ^2.1.9 | Testing framework (NUEVO) |
| React Testing Library | ^16.3.2 | Component testing (NUEVO) |

### Arquitectura
```
src/
├── App.jsx                    # Router principal + providers
├── main.jsx                   # Entry point
├── shared/                    # Capa compartida
│   ├── components/            # Componentes genéricos (Toast, BackendFallback, shared)
│   ├── constants/             # Endpoints, mensajes UI
│   ├── hooks/                 # useCatalogos
│   ├── lib/                   # api.js, storage.js, queryClient, scrollReveal, mexicoLocations
│   └── stores/                # uiStore (Zustand)
├── features/                  # Feature-based architecture
│   ├── a11y/                  # Barra de accesibilidad + store
│   ├── about/                 # Página About
│   ├── admin/                 # Panel de administración
│   ├── auth/                  # Autenticación, ProtectedRoute, TopNav, Sidebar
│   ├── dashboard/             # Dashboard principal
│   ├── favorites/             # Favoritos
│   ├── institutions/          # Explorar instituciones, MapView, Reviews
│   ├── jobs/                  # Empleo
│   ├── landing/               # Landing page + DesignPreview
│   ├── notifications/         # FCM, NotificationBell, notificaciones
│   ├── profile/               # Perfil + Onboarding
│   ├── social/                # Comunidad + Mensajes
│   └── tutor/                 # Tutor/dependientes, IA, permisos
└── test/                      # Infraestructura de testing (NUEVO)
    ├── setup.js
    └── renderWithProviders.jsx
```

---

## 2. Archivos Totales del Proyecto

### Por tipo
| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| `.jsx` | ~40 | Componentes React |
| `.js` | ~30 | Hooks, stores, utilidades, constantes |
| `.css` | 1 | Estilos globales (Tailwind) |
| `.html` | 1 | index.html |
| `.json` | 3 | package.json, jsconfig.json, pnpm-workspace.yaml |
| `.yml` | 1 | CI/CD (ci.yml) |
| `.md` | 10+ | Documentación |
| `.test.jsx` | 8 | Tests de componentes (NUEVO) |
| `.test.js` | 9 | Tests de utilidades/hooks (NUEVO) |

**Total de archivos fuente (sin tests):** ~70 archivos
**Total de archivos de test:** 17 archivos
**Total de líneas de código de test:** 2,590 líneas

---

## 3. Estado de Testing — Antes vs Después

### Antes de esta sesión
- ❌ **0 tests** — El proyecto no tenía ningún test automatizado
- ❌ **Sin infraestructura** — No existía vitest.config.js, setup.js, ni helpers de testing
- ❌ **Sin dependencias de testing** — No había vitest, testing-library, ni jsdom
- ❌ **Sin scripts de test** — No se podía ejecutar `pnpm test`
- ❌ **Sin cobertura** — No había forma de medir cobertura

### Después de esta sesión
- ✅ **346 tests pasando** — Cobertura inicial de todas las capas
- ✅ **Infraestructura completa** — vitest.config.js, setup.js, renderWithProviders.jsx
- ✅ **5 dependencias nuevas** — vitest, testing-library, jsdom, user-event, jest-dom
- ✅ **4 scripts de test** — test, test:watch, test:coverage, test:ui
- ✅ **Alias de ruta** — `@shared`, `@features`, `@test` configurados en vitest

---

## 4. Cobertura Detallada por Feature

### `shared/` — Capa Compartida
| Archivo | Estado | Tests |
|---------|--------|-------|
| `lib/storage.js` | ✅ Testeado | 18 tests |
| `lib/queryClient.js` | ✅ Testeado | 4 tests |
| `lib/scrollReveal.js` | ✅ Testeado | 10 tests |
| `lib/api.js` | ❌ Sin test | — |
| `lib/mexicoLocations.js` | ❌ Sin test | — |
| `constants/backendEndpoints.js` | ✅ Testeado | 30+ tests |
| `constants/uiMessages.js` | ✅ Testeado | 15 tests |
| `stores/uiStore.js` | ✅ Testeado | 18 tests |
| `components/Toast.jsx` | ✅ Testeado | 12 tests |
| `components/BackendFallback.jsx` | ✅ Testeado | 14 tests |
| `components/shared.jsx` | ✅ Testeado | 50+ tests |
| `hooks/useCatalogos.js` | ❌ Sin test | — |

**Cobertura shared:** 9/12 archivos (75%)

### `features/a11y/` — Accesibilidad
| Archivo | Estado | Tests |
|---------|--------|-------|
| `store/a11yStore.js` | ✅ Testeado | 45+ tests |
| `components/AccessibilityBar.jsx` | ❌ Sin test | — |

**Cobertura a11y:** 1/2 archivos (50%)

### `features/auth/` — Autenticación
| Archivo | Estado | Tests |
|---------|--------|-------|
| `store/authStore.js` | ✅ Testeado | 22 tests |
| `components/ProtectedRoute.jsx` | ✅ Testeado | 12 tests |
| `hooks/useAuth.js` | ❌ Sin test | — |
| `hooks/useSessionVerify.js` | ❌ Sin test | — |
| `lib/firebaseBridge.js` | ❌ Sin test | — |
| `components/AppSidebar.jsx` | ❌ Sin test | — |
| `components/TopNav.jsx` | ❌ Sin test | — |
| `pages/AuthPage.jsx` | ❌ Sin test | — |

**Cobertura auth:** 2/8 archivos (25%)

### `features/notifications/` — Notificaciones
| Archivo | Estado | Tests |
|---------|--------|-------|
| `hooks/useNotifications.js` | ✅ Testeado | 8 tests |
| `hooks/useFCM.js` | ❌ Sin test | — |
| `components/FCMProvider.jsx` | ❌ Sin test | — |
| `components/NotificationBell.jsx` | ❌ Sin test | — |
| `lib/firebase.js` | ❌ Sin test | — |
| `lib/notificationStream.js` | ❌ Sin test | — |
| `pages/NotificationsPage.jsx` | ❌ Sin test | — |

**Cobertura notifications:** 1/7 archivos (14%)

### `features/profile/` — Perfil
| Archivo | Estado | Tests |
|---------|--------|-------|
| `hooks/useProfile.js` | ✅ Testeado | 5 tests |
| `pages/ProfilePage.jsx` | ❌ Sin test | — |
| `pages/OnboardingPage.jsx` | ❌ Sin test | — |

**Cobertura profile:** 1/3 archivos (33%)

### `features/tutor/` — Tutor/Dependientes
| Archivo | Estado | Tests |
|---------|--------|-------|
| `hooks/useDependientes.js` | ✅ Testeado | 5 tests |
| `hooks/useAI.js` | ❌ Sin test | — |
| `hooks/usePermisos.js` | ❌ Sin test | — |
| `components/AddDependienteModal.jsx` | ❌ Sin test | — |
| `components/DependientesPanel.jsx` | ❌ Sin test | — |
| `components/PermissionsModal.jsx` | ❌ Sin test | — |
| `pages/TutorPage.jsx` | ❌ Sin test | — |

**Cobertura tutor:** 1/7 archivos (14%)

### `features/institutions/` — Instituciones
| Archivo | Estado | Tests |
|---------|--------|-------|
| `hooks/useInstitutions.js` | ✅ Testeado | 4 tests |
| `hooks/useReviews.js` | ❌ Sin test | — |
| `components/MapView.jsx` | ❌ Sin test | — |
| `pages/ExplorePage.jsx` | ❌ Sin test | — |
| `pages/InstitutionPage.jsx` | ❌ Sin test | — |
| `pages/CrearInstitucionPage.jsx` | ❌ Sin test | — |

**Cobertura institutions:** 1/6 archivos (17%)

### `features/jobs/` — Empleo
| Archivo | Estado | Tests |
|---------|--------|-------|
| `hooks/useJobs.js` | ✅ Testeado | 3 tests |
| `pages/JobsPage.jsx` | ❌ Sin test | — |

**Cobertura jobs:** 1/2 archivos (50%)

### `features/social/` — Comunidad
| Archivo | Estado | Tests |
|---------|--------|-------|
| `hooks/useCommunity.js` | ❌ Sin test | — |
| `hooks/useMessages.js` | ❌ Sin test | — |
| `pages/SocialPage.jsx` | ❌ Sin test | — |

**Cobertura social:** 0/3 archivos (0%)

### `features/admin/` — Administración
| Archivo | Estado | Tests |
|---------|--------|-------|
| `hooks/useAdmin.js` | ❌ Sin test | — |
| `pages/AdminPage.jsx` | ❌ Sin test | — |

**Cobertura admin:** 0/2 archivos (0%)

### `features/favorites/` — Favoritos
| Archivo | Estado | Tests |
|---------|--------|-------|
| `hooks/useFavorites.js` | ❌ Sin test | — |
| `pages/FavoritesPage.jsx` | ❌ Sin test | — |

**Cobertura favorites:** 0/2 archivos (0%)

### `features/landing/` — Landing
| Archivo | Estado | Tests |
|---------|--------|-------|
| `pages/LandingPage.jsx` | ❌ Sin test | — |
| `pages/DesignPreview.jsx` | ❌ Sin test | — |

**Cobertura landing:** 0/2 archivos (0%)

### `features/about/` — About
| Archivo | Estado | Tests |
|---------|--------|-------|
| `pages/AboutPage.jsx` | ❌ Sin test | — |

**Cobertura about:** 0/1 archivos (0%)

### `features/dashboard/` — Dashboard
| Archivo | Estado | Tests |
|---------|--------|-------|
| `pages/DashboardPage.jsx` | ❌ Sin test | — |

**Cobertura dashboard:** 0/1 archivos (0%)

### Archivos raíz
| Archivo | Estado | Tests |
|---------|--------|-------|
| `App.jsx` | ❌ Sin test | — |
| `main.jsx` | ❌ Sin test | — |

---

## 5. Resumen de Cobertura Global

| Métrica | Valor |
|---------|-------|
| **Archivos con tests** | 17 de ~70 (24%) |
| **Tests totales** | 346 |
| **Tests pasando** | 346/346 (100%) |
| **Líneas de código de test** | 2,590 |
| **Hooks testeados** | 8 de ~20 (40%) |
| **Stores testeados** | 3 de 3 (100%) |
| **Componentes testeados** | 6 de ~40 (15%) |
| **Utilidades testeados** | 5 de 7 (71%) |
| **Páginas testeadas** | 0 de 13 (0%) |

### Cobertura por Feature
| Feature | Archivos fuente | Con tests | % Cobertura |
|---------|----------------|-----------|-------------|
| `shared/` | 12 | 9 | **75%** ✅ |
| `a11y/` | 2 | 1 | **50%** ⚠️ |
| `auth/` | 8 | 2 | **25%** ⚠️ |
| `jobs/` | 2 | 1 | **50%** ⚠️ |
| `profile/` | 3 | 1 | **33%** ⚠️ |
| `notifications/` | 7 | 1 | **14%** ❌ |
| `tutor/` | 7 | 1 | **14%** ❌ |
| `institutions/` | 6 | 1 | **17%** ❌ |
| `social/` | 3 | 0 | **0%** ❌ |
| `admin/` | 2 | 0 | **0%** ❌ |
| `favorites/` | 2 | 0 | **0%** ❌ |
| `landing/` | 2 | 0 | **0%** ❌ |
| `about/` | 1 | 0 | **0%** ❌ |
| `dashboard/` | 1 | 0 | **0%** ❌ |

---

## 6. Archivos Nuevos vs Modificados

### Archivos NUEVOS (untracked)
```
?? docs/RESUMEN_SEMANA_LUNES_JUEVES.md
?? src/features/a11y/__tests__/
?? src/features/auth/__tests__/
?? src/features/institutions/__tests__/
?? src/features/jobs/__tests__/
?? src/features/notifications/__tests__/
?? src/features/profile/__tests__/
?? src/features/tutor/__tests__/
?? src/shared/components/__tests__/
?? src/shared/constants/__tests__/
?? src/shared/lib/__tests__/
?? src/shared/stores/__tests__/
?? src/test/
?? vitest.config.js
```

### Archivos MODIFICADOS
```
M package.json          # Scripts de test + dependencias nuevas
M pnpm-lock.yaml        # Lock file actualizado
```

---

## 7. Mejoras Implementadas

### Infraestructura de Testing
1. **Vitest configurado** con jsdom, aliases de ruta, y coverage v8
2. **Polyfills para jsdom 30+** — localStorage/sessionStorage que jsdom 30 ya no expone
3. **Mocks globales** — IntersectionObserver, ResizeObserver, matchMedia, scrollTo
4. **Helper renderWithProviders** — Evita duplicación de QueryClient + BrowserRouter en cada test
5. **Alias de ruta `@test`** — Imports limpios y mantenibles

### Patrones de Testing
1. **Zustand stores** — Testing directo con `useStore.setState()` (sin mocks innecesarios)
2. **TanStack Query hooks** — Testing con wrapper de QueryClientProvider
3. **Componentes React** — Testing con React Testing Library + userEvent
4. **Utilidades puras** — Testing directo de funciones sin mocks

---

## 8. Áreas Críticas sin Cobertura

### 🔴 Alta prioridad
1. **`App.jsx`** — Routing, protección de rutas, loading/error states
2. **`useSessionVerify.js`** — Hook crítico de verificación de sesión
3. **`useAuth.js`** — Hook principal de autenticación
4. **`firebaseBridge.js`** — Bridge a Firebase Auth
5. **`api.js`** — Cliente HTTP central (interceptors, error handling)

### 🟡 Media prioridad
6. **Páginas principales** — AuthPage, DashboardPage, ProfilePage, AdminPage
7. **`useCommunity.js` / `useMessages.js`** — Hooks de social
8. **`useAdmin.js`** — Hook de administración
9. **`useFavorites.js`** — Hook de favoritos
10. **`notificationStream.js`** — Stream de notificaciones en tiempo real

### 🟢 Baja prioridad
11. **Componentes de UI** — AppSidebar, TopNav, AccessibilityBar
12. **Páginas secundarias** — AboutPage, DesignPreview, LandingPage
13. **Componentes de modal** — AddDependienteModal, PermissionsModal
14. **`mexicoLocations.js`** — Datos geográficos

---

## 9. Recomendaciones

### Inmediatas
1. **Instalar `@vitest/coverage-v8`** — Para generar reportes de cobertura reales
2. **Agregar test de `App.jsx`** — Verificar routing y protección de rutas
3. **Crear tests de `useSessionVerify`** — Hook crítico sin cobertura
4. **Agregar `pnpm test` al CI/CD** — `.github/workflows/ci.yml`

### Corto plazo
5. **Tests de páginas** — Al menos las 5 más usadas (Auth, Dashboard, Profile, Admin, Social)
6. **Tests de `api.js`** — Verificar interceptores y manejo de errores
7. **Tests de componentes de layout** — TopNav, AppSidebar, AccessibilityBar
8. **Coverage thresholds** — Configurar mínimos en vitest.config.js

### Largo plazo
9. **Test coverage > 70%** — Meta de cobertura de líneas
10. **E2E tests** — Considerar Playwright o Cypress para flujos completos
11. **Visual regression tests** — Para componentes de UI críticos
12. **Performance tests** — Para hooks con debounce/throttle

---

## 10. Comandos Útiles

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests en watch mode
pnpm test:watch

# Ejecutar con cobertura
pnpm test:coverage

# Ejecutar tests de un archivo específico
pnpm vitest run src/shared/lib/__tests__/storage.test.js

# Ejecutar tests que matchean un patrón
pnpm vitest run -t "storage"
```
