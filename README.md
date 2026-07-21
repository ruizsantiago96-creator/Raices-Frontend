# Raíces para Florecer - Frontend

Aplicación web frontend del proyecto **Raíces para Florecer** — ecosistema digital para personas con discapacidad, tutores e instituciones en México.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | React 18 + JSX |
| Bundler | Vite |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| HTTP Client | Axios |
| Mapas | MapLibre GL |
| Estilos | CSS Variables + Inline Styles |

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
VITE_FIREBASE_API_KEY=tu-api-key-de-firebase
```

## Estructura del Proyecto

El proyecto utiliza una **arquitectura feature-based** organizada por dominios de negocio:

```
src/
├── App.jsx                          # Punto de entrada de rutas
├── main.jsx                         # Montaje de React + providers
├── features/                        # Módulos por dominio de negocio
│   ├── a11y/                        # Accesibilidad (panel flotante)
│   ├── about/                       # Página "Quiénes somos"
│   ├── admin/                       # Panel de administración
│   ├── auth/                        # Autenticación y sesión
│   │   ├── components/              # AppSidebar, TopNav, ProtectedRoute
│   │   ├── hooks/                   # useAuth, useSessionVerify
│   │   ├── store/                   # authStore (Zustand)
│   │   └── pages/                   # AuthPage (login/registro)
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
│   ├── components/                  # Icons, CategoryTag, BrandMark, AppFooter
│   ├── lib/                         # api.js, storage.js, queryClient.js
│   └── stores/                      # uiStore.js (toasts)
└── styles/
    └── global.css                   # Estilos globales y variables CSS
```

### Cada Feature Contiene

```
features/<nombre-feature>/
├── components/        # Componentes UI específicos
├── hooks/             # Custom hooks (queries, mutations)
├── lib/               # Utilidades específicas
├── pages/             # Páginas/rutas
└── store/             # Zustand store (si aplica)
```

### Features Principales

| Feature | Descripción | Archivos clave |
|---------|-------------|----------------|
| `auth` | Login, registro, sesión | `useAuth.js`, `authStore.js`, `AuthPage.jsx` |
| `institutions` | Explorar instituciones | `useInstitutions.js`, `ExplorePage.jsx`, `InstitutionPage.jsx` |
| `jobs` | Bolsa de trabajo | `useJobs.js`, `JobsPage.jsx` |
| `favorites` | Guardar instituciones | `useFavorites.js`, `FavoritesPage.jsx` |
| `notifications` | Notificaciones SSE | `useNotifications.js`, `NotificationBell.jsx` |
| `social` | Comunidad y mensajes | `useCommunity.js`, `useMessages.js`, `SocialPage.jsx` |
| `profile` | Perfil y onboarding | `useProfile.js`, `ProfilePage.jsx`, `OnboardingPage.jsx` |
| `tutor` | Familiares dependientes | `useDependents.js`, `useAI.js`, `TutorPage.jsx` |
| `admin` | Panel de administración | `useAdmin.js`, `AdminPage.jsx` |
| `a11y` | Accesibilidad | `AccessibilityBar.jsx`, `a11yStore.js` |

## Convenciones

- **Imports**: Se usan path aliases (`@shared/*`, `@features/*`, `@styles/*`) para imports limpios y consistentes
- **Naming**: Components en PascalCase, hooks con prefijo `use`, stores con sufijo `Store`
- **Dependencia shared → features**: `shared/lib/api.js` importa `authStore` para manejar refresh token — es la única dependencia de shared hacia features y es aceptada

## Documentación

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para documentación completa de la arquitectura, guías para agregar nuevas features, y deuda técnica conocida.
## 🤖 Integración Continua (CI)

El repositorio cuenta con un pipeline automatizado en **GitHub Actions** (`.github/workflows/ci.yml`) que valida la calidad del código en cada `push` o `pull_request` a la rama `dev`:

1. **Linter:** `pnpm run lint` — Verifica sintaxis y formato.
2. **Audit:** `pnpm audit` — Escanea vulnerabilidades de paquetes.
3. **Build:** `pnpm run build` — Garantiza la compilación limpia del proyecto.