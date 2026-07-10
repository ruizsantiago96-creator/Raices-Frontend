# 📋 Auditoría y Documentación Técnica — Raíces para Florecer (Frontend)

> **Fecha:** 7 de julio de 2026  
> **Versión del proyecto:** 0.1.0  
> **Última revisión:** Auditors automatizados — Código generado con Codebuff

---

## 📑 Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Contexto Actual — Backend](#2-contexto-actual--backend)
3. [Contexto Actual — Frontend](#3-contexto-actual--frontend)
4. [Stack Tecnológico](#4-stack-tecnológico)
5. [Estructura del Proyecto](#5-estructura-del-proyecto)
6. [Arquitectura y Patrones](#6-arquitectura-y-patrones)
7. [Rutas y Navegación](#7-rutas-y-navegación)
8. [Sistema de Estado Global](#8-sistema-de-estado-global)
9. [Capa de API y Comunicación](#9-capa-de-api-y-comunicación)
10. [Documentación de Hooks](#10-documentación-de-hooks)
11. [Documentación de Componentes](#11-documentación-de-componentes)
12. [Documentación de Páginas](#12-documentación-de-páginas)
13. [Sistema de Estilos y Diseño](#13-sistema-de-estilos-y-diseño)
14. [Accesibilidad (A11y)](#14-accesibilidad-a11y)
15. [Análisis de Calidad del Código](#15-análisis-de-calidad-del-código)
16. [Problemas Detectados](#16-problemas-detectados)
17. [Recomendaciones](#17-recomendaciones)
18. [API Endpoints (Consumidos)](#18-api-endpoints-consumidos)
19. [Variables de Entorno](#19-variables-de-entorno)
20. [Credenciales de Demo](#20-credenciales-de-demo)

---

## 1. Resumen Ejecutivo

**Raíces para Florecer** es una aplicación web single-page (SPA) que conecta a personas con discapacidad, tutores/familiares e instituciones de apoyo en México. Ofrece recomendaciones personalizadas mediante IA, un directorio de instituciones verificadas, comunidad social, mensajería directa, bolsa de trabajo inclusiva y un panel administrativo completo.

### Hallazgos principales

| Aspecto | Estado | Observaciones |
|---------|--------|---------------|
| Arquitectura general | ✅ Buena | Separación clara hooks/components/pages/stores |
| Accesibilidad | ✅ Excepcional | Barra de accesibilidad completa, ARIA, skip-links, TTS |
| Documentación del código | ⚠️ Moderada | Comentarios clave presentes, falta JSDoc en funciones |
| Testing | ❌ Ausente | No hay archivos de test |
| Type checking | ⚠️ Parcial | ESLint configurado, sin TypeScript |
| Build y configuración | ✅ Correcta | Vite + React plugin, proxy configurado |
| Performance | ⚠️ A mejorar | No hay lazy loading de rutas, no hay code splitting manual |
| Seguridad | ⚠️ Revisar | Token en localStorage (vulnerable a XSS) |

---

## 2. Contexto Actual — Backend

### 2.1 Stack y Configuración

| Componente | Tecnología | Versión |
|---|---|---|
| Framework | NestJS (Node.js + TypeScript) | 10.x |
| Lenguaje | TypeScript | 5.4 |
| Base de datos | **Firebase Firestore** | — |
| Autenticación | Firebase Auth + Passport JWT (dual) | — |
| Hash de contraseñas | bcryptjs | 2.4 |
| IA | Anthropic SDK (Claude) | 0.27 |
| Validación | class-validator / class-transformer | — |
| Documentación API | Swagger (OpenAPI) | 7.4 |
| Seguridad | @nestjs/throttler | 6.5 |
| Firebase SDK | firebase-admin | 14.1 |

### 2.2 Arquitectura del Backend

```
backend/src/
├── main.ts                          # Bootstrap: CORS, pipes, Swagger, SPA fallback
├── app.module.ts                    # Root module (16 submodules)
├── spa-fallback.filter.ts           # Filtro SPA para producción
├── database/
│   ├── database.module.ts           # Module global con providers Firebase
│   ├── firebase.provider.ts         # Inicialización Firebase Admin + validación env
│   └── seed/seed.ts                 # Seed: 3 usuarios, 12 instituciones, 5 grupos
├── common/
│   ├── guards/
│   │   ├── jwt.guard.ts             # Auth dual: Firebase Auth → passport-jwt fallback
│   │   └── roles.guard.ts           # RBAC: @Roles('admin') decorator
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   └── tenant/
│       └── tenant.service.ts        # Wrapper Firestore collection()
├── modules/                         # 16 módulos de dominio
│   ├── auth/                        # Register, Login, JWT, Firebase Auth sync
│   ├── users/                       # Profile CRUD, profiling, dependents
│   ├── institutions/                # CRUD instituciones, filtros
│   ├── discovery/                   # Búsqueda inteligente con profile_match
│   ├── favorites/                   # Toggle favoritos
│   ├── reviews/                     # CRUD reseñas + recálculo rating
│   ├── community/                   # Groups, posts, likes, comments
│   ├── messages/                    # Mensajería directa 1-a-1
│   ├── notifications/               # CRUD + SSE stream en tiempo real
│   ├── jobs/                        # CRUD vacantes + postulaciones
│   ├── ai/                          # Chat IA (Claude) + recomendaciones
│   ├── admin/                       # Panel completo: stats, analytics, inteligencia
│   ├── email/                       # Servicio de correo (mock/Resend TODO)
│   └── storage/                     # Almacenamiento archivos (local/GCS TODO)
└── repositories/                    # Patrón repositorio (7 implementaciones)
    ├── repositories.module.ts
    ├── interfaces/                  # Contratos TypeScript
    └── implementations/            # Firestore implementations
```

### 2.3 Módulos del Backend (Detalle)

| Módulo | Controller | Endpoints | Service | Descripción |
|--------|-----------|-----------|---------|-------------|
| **Auth** | `auth.controller.ts` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | `auth.service.ts` | Registro con sync Firebase Auth, login con bcrypt, JWT |
| **Users** | `users.controller.ts` | `GET /users/profile`, `PUT /users/profile`, `POST /users/profiling`, `GET/POST /users/dependents`, `PUT/DELETE /users/dependents/:id` | `users.service.ts` | Perfil completo, onboarding profiling, CRUD dependientes |
| **Institutions** | `institutions.controller.ts` | `GET /institutions`, `GET /institutions/:id`, `POST /institutions` | `institutions.service.ts` | CRUD con filtros: category, city, search, disability_type, age |
| **Discovery** | `discovery.controller.ts` | `GET /discovery` | `discovery.service.ts` | Búsqueda inteligente: cruza perfil usuario ↔ instituciones |
| **Favorites** | `favorites.controller.ts` | `GET /favorites`, `GET /favorites/ids`, `POST /favorites/:institutionId/toggle` | `favorites.service.ts` | Toggle favoritos, consulta por IDs |
| **Reviews** | `reviews.controller.ts` | `GET /reviews/institution/:id`, `GET /reviews/mine`, `POST /reviews/institution/:id` | `reviews.service.ts` | CRUD reseñas, 1 por usuario/institución, recálculo rating |
| **Community** | `community.controller.ts` | `GET /community/groups`, `GET /community/posts`, `POST /community/posts`, `POST /community/posts/:id/like`, `GET/POST /community/posts/:id/comments` | `community.service.ts` | Grupos, posts, likes (toggle), comentarios |
| **Messages** | `messages.controller.ts` | `GET /messages/conversations`, `GET /messages/unread-count`, `GET /messages/with/:userId`, `POST /messages/send/:userId` | `messages.service.ts` | Mensajería directa, auto-mark-read, conteo no leídos |
| **Notifications** | `notifications.controller.ts` | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `GET /notifications/stream` (SSE) | `notifications.service.ts` | CRUD + Server-Sent Events en tiempo real (RxJS Subject) |
| **Jobs** | `jobs.controller.ts` | `GET /jobs`, `GET /jobs/:id`, `GET /jobs/applied`, `GET /jobs/my-applications`, `POST /jobs/:id/apply` | `jobs.service.ts` | CRUD vacantes, postulaciones, enriquecimiento con institución |
| **AI** | `ai.controller.ts` | `POST /ai/chat`, `POST /ai/recommendations` | `ai.service.ts` | Chat contextual (Claude), recomendaciones personalizadas |
| **Admin** | `admin.controller.ts` | `GET /admin/stats`, `GET /admin/analytics`, `GET /admin/needs-intelligence`, `GET /admin/institutions`, `GET /admin/institutions/pending`, `POST /admin/institutions/:id/approve`, `DELETE /admin/institutions/:id`, `PATCH /admin/institutions/:id/verify`, `GET /admin/users`, `PATCH /admin/users/:id/active`, `PATCH /admin/users/:id/role`, `GET /admin/reviews`, `DELETE /admin/reviews/:id`, `GET /admin/alerts`, `GET /admin/settings`, `PUT /admin/settings` | `admin.service.ts` | Panel completo: KPIs, analytics, inteligencia demanda-oferta, alertas |
| **Email** | — | — | `email.service.ts` | Mock email (logs). Resend TODO |
| **Storage** | — | — | `storage.service.ts` | Archivos locales `uploads/`. GCS TODO |
| **Database** | — | — | `firebase.provider.ts` | Firebase Admin SDK init, validación service account |

### 2.4 Autenticación y Seguridad

**Flujo de autenticación dual:**
1. **Firebase Auth** (preferido): `getAuth().verifyIdToken(token)` → funciona con emulador y producción
2. **Passport JWT** (fallback): Para tokens HS256 generados por el backend, o RS256 vía JWKS

**JwtAuthGuard (`jwt.guard.ts`):**
```
Request → Extraer Bearer token
  → Intentar Firebase Auth verifyIdToken()
    → SUCCESS: extraer uid, email, role del decoded token
    → FAIL: fallback a passport-jwt
      → HS256 (JWT_SECRET) o RS256 (JWKS_URI)
```

**RolesGuard:**
- `@Roles('admin')` decorator en endpoints protegidos
- Verifica `user.role` contra roles permitidos

**Seguridad actual (⚠️ pendientes):**
- `JWT_SECRET` tiene fallback hardcodeado `'raices_demo_secret_2026'`
- CORS abierto (`origin: true`)
- Token aceptado por query param (`?token=...`) para SSE
- Sin rate limiting en login ni endpoints de IA

### 2.5 Firebase Emuladores (Desarrollo Local)

| Servicio | Puerto | Configuración |
|----------|--------|---------------|
| Auth | 9099 | `firebase.json` |
| Firestore | 8080 | `firebase.json` |
| UI Emulator | Habilitada | `ui.enabled: true` |

### 2.6 Modelo de Datos Firestore

| Colección | Prefijo | Descripción |
|-----------|---------|-------------|
| `u_profiles` | `u_` | Cuentas de usuario (id, email, password_hash, role, city, state, is_active, is_verified) |
| `u_user_profiles` | `u_` | Perfiles de necesidades (user_id, disability_types, life_stage, needs, goals, support_areas) |
| `u_dependents` | `u_` | Dependientes de tutores (guardian_id, full_name, relationship, profile_data JSON) |
| `u_favorites` | `u_` | Favoritos (user_id, institution_id) |
| `u_reviews` | `u_` | Reseñas (user_id, institution_id, rating, comment) |
| `u_posts` | `u_` | Posts comunidad (author_id, content, group_id, like_count) |
| `u_comments` | `u_` | Comentarios (post_id, author_id, content) |
| `u_post_likes` | `u_` | Likes (user_id, post_id) |
| `u_groups` | `u_` | Grupos comunidad (name, description, category, is_public) |
| `u_direct_messages` | `u_` | Mensajes directos (from_id, to_id, content, is_read) |
| `u_notifications` | `u_` | Notificaciones (user_id, type, title, body, is_read) |
| `u_job_applications` | `u_` | Postulaciones (user_id, job_id, cover_letter, status) |
| `p_institutions` | `p_` | Instituciones (name, category, city, disability_types, is_verified, rating_avg) |
| `p_jobs` | `p_` | Vacantes empleo (institution_id, title, modality, disability_types) |
| `s_settings` | `s_` | Configuración plataforma (key-value) |

### 2.7 Repositorios (Patrón Repositorio)

| Repositorio | Interfaz | Implementación Firestore | Colecciones |
|-------------|----------|--------------------------|-------------|
| Community | `community.repository.interface.ts` | `firestore-community.repository.ts` | u_posts, u_comments, u_post_likes, u_groups, u_profiles |
| FavoriteReview | `favorite-review.repository.interface.ts` | `firestore-favorite-review.repository.ts` | u_favorites, u_reviews, p_institutions |
| Institution | `institution.repository.interface.ts` | `firestore-institution.repository.ts` | p_institutions |
| Job | `job.repository.interface.ts` | `firestore-job.repository.ts` | p_jobs, p_institutions, u_job_applications |
| Message | `message.repository.interface.ts` | `firestore-message.repository.ts` | u_direct_messages, u_profiles |
| Notification | `notification.repository.interface.ts` | `firestore-notification.repository.ts` | u_notifications |
| Profile | `profile.repository.interface.ts` | `firestore-profile.repository.ts` | u_profiles, u_user_profiles, u_dependents |

**Nota:** Los repositorios están registrados en `RepositoriesModule` pero los services actuales todavía acceden directamente a Firestore vía `TenantService` / `@Inject(FIRESTORE)`. La migración completa al patrón repositorio está en progreso.

### 2.8 Servicios de IA (Claude)

**Modelos utilizados:**
- `claude-haiku-4-5-20251001` → Chat institucional (respuestas ≤150 palabras)
- `claude-sonnet-4-6` → Recomendaciones personalizadas (JSON estructurado)

**Funcionalidad:**
- **Chat contextual:** Usa perfil del usuario + historial de 6 mensajes
- **Recomendaciones:** Analiza perfil, favoritos, posts, postulaciones → genera 3 próximos pasos
- **Recomendaciones por dependiente:** Para tutores con familia
- **Fallback mock:** Respuestas predefinidas cuando no hay API key

### 2.9 Endpoints API (Inventario Completo)

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/profiling
GET    /api/users/dependents
POST   /api/users/dependents
PUT    /api/users/dependents/:id
DELETE /api/users/dependents/:id

GET    /api/institutions
GET    /api/institutions/:id
POST   /api/institutions

GET    /api/discovery

GET    /api/favorites
GET    /api/favorites/ids
POST   /api/favorites/:institutionId/toggle

GET    /api/reviews/institution/:id
GET    /api/reviews/mine
POST   /api/reviews/institution/:id

GET    /api/community/groups
GET    /api/community/posts
POST   /api/community/posts
POST   /api/community/posts/:id/like
GET    /api/community/posts/:id/comments
POST   /api/community/posts/:id/comments

GET    /api/messages/conversations
GET    /api/messages/unread-count
GET    /api/messages/with/:userId
POST   /api/messages/send/:userId

GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
GET    /api/notifications/stream

GET    /api/jobs
GET    /api/jobs/:id
GET    /api/jobs/applied
GET    /api/jobs/my-applications
POST   /api/jobs/:id/apply

POST   /api/ai/chat
POST   /api/ai/recommendations

GET    /api/admin/stats
GET    /api/admin/analytics
GET    /api/admin/needs-intelligence
GET    /api/admin/institutions
GET    /api/admin/institutions/pending
POST   /api/admin/institutions/:id/approve
DELETE /api/admin/institutions/:id
PATCH  /api/admin/institutions/:id/verify
GET    /api/admin/users
PATCH  /api/admin/users/:id/active
PATCH  /api/admin/users/:id/role
GET    /api/admin/reviews
DELETE /api/admin/reviews/:id
GET    /api/admin/alerts
GET    /api/admin/settings
PUT    /api/admin/settings

GET    /api/docs                    (Swagger UI)
```

**Total: ~45 endpoints**

### 2.10 Variables de Entorno Backend

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `FIREBASE_PROJECT_ID` | ✅ Sí | ID del proyecto Firebase (`raices-499122`) |
| `FIREBASE_SERVICE_ACCOUNT` | No | JSON de service account (fallback: ADC) |
| `JWT_SECRET` | No | Secreto JWT (fallback: `raices_demo_secret_2026`) |
| `JWT_EXPIRES_IN` | No | Expiración JWT (default: `7d`) |
| `JWKS_URI` | No | URI JWKS para RS256 (si no está, usa HS256) |
| `ANTHROPIC_API_KEY` | No | API key de Claude (si no está, usa mock) |
| `RESEND_API_KEY` | No | API key Resend para emails (TODO) |
| `GCS_KEY_FILE` | No | Ruta a credenciales GCS (TODO) |
| `GCS_BUCKET` | No | Nombre bucket GCS (TODO) |
| `PORT` | No | Puerto del servidor (default: `7000`) |
| `NODE_ENV` | No | `production` activa SPA fallback |

### 2.11 Estado de Servicios Externos

| Servicio | Estado | Detalle |
|----------|--------|---------|
| Firebase Firestore | ✅ Funcional | Colecciones con prefijos `u_`, `p_`, `s_` |
| Firebase Auth | ✅ Funcional | Sync en registro, verificación en guard |
| Anthropic (Claude) | ⚠️ Condicional | Requiere `ANTHROPIC_API_KEY`, si no → mock |
| Email (Resend) | ❌ TODO | Solo escribe en log, sin envío real |
| Almacenamiento (GCS) | ❌ TODO | Guarda en carpeta local `uploads/` |
| Swagger docs | ✅ Funcional | Disponible en `/docs` |

### 2.12 Scripts Disponibles

```bash
pnpm run build          # Compilar TypeScript a dist/
pnpm run start:dev      # Iniciar con nodemon (watch mode)
pnpm run dev            # migrate + seed + start:dev
pnpm run migrate        # Ejecutar migraciones Knex (LEGACY - ya no se usa)
pnpm run seed           # Seed Firebase con datos demo
pnpm run db:scan        # Escanear estructura de BD
```

**⚠️ Nota:** Los scripts `migrate` y `setup` hacen referencia a Knex (LEGACY). La app ahora usa Firestore directamente. Solo `seed` es relevante.

---

## 3. Contexto Actual — Frontend

### 3.1 Stack y Configuración

| Componente | Tecnología | Versión |
|---|---|---|
| Framework | React | 18.3.1 |
| Ruteo | React Router DOM | 6.26.0 |
| Build | Vite | 5.4.8 |
| Estado global | Zustand | 4.5.4 |
| Datos / cache | TanStack React Query | 5.56.0 |
| HTTP client | Axios | 1.7.7 |
| Mapas | MapLibre GL | 4.7.0 |
| Estilos | CSS inline en JSX + variables CSS globales | — |
| Linting | ESLint (flat config) | — |

### 3.2 Archivos del Frontend

```
frontend/
├── index.html                    # Entry point HTML (lang="es")
├── package.json                  # Dependencias y scripts
├── pnpm-lock.yaml               # Lockfile (pnpm)
├── pnpm-workspace.yaml          # Config workspace
├── eslint.config.mjs            # ESLint flat config
├── vite.config.js               # Configuración Vite (proxy /api → localhost:7000)
├── src/
│   ├── main.jsx                 # Entry point React
│   ├── App.jsx                  # Router + providers (13 rutas)
│   ├── styles/
│   │   └── global.css           # Estilos globales + variables CSS + A11y
│   ├── lib/
│   │   ├── api.js               # Axios instance + interceptors (token + 401 redirect)
│   │   └── queryClient.js       # Configuración TanStack Query (stale: 5min, retry: 1)
│   ├── stores/
│   │   ├── authStore.js         # Zustand: auth (persist → raices_auth)
│   │   ├── uiStore.js           # Zustand: toasts/notificaciones
│   │   └── a11yStore.js         # Zustand: preferencias accesibilidad (persist → raices_a11y)
│   ├── hooks/                   # 12 custom hooks
│   │   ├── useAuth.js           # Login, register, me, profile, updateProfile
│   │   ├── useProfile.js        # useProfile, useUpdateProfile, useSaveProfiling
│   │   ├── useInstitutions.js   # useInstitutions, useInstitution, useDiscovery
│   │   ├── useJobs.js           # useJobs, useJob, useApplyJob, useMyApplications
│   │   ├── useFavorites.js      # useFavorites, useFavoriteIds, useToggleFavorite
│   │   ├── useCommunity.js      # useGroups, usePosts, useCreatePost, useComments
│   │   ├── useMessages.js       # useConversations, useMessages, useSendMessage
│   │   ├── useNotifications.js  # useNotifications, useNotificationStream (SSE)
│   │   ├── useReviews.js        # useReviews, useMyReviews, useSubmitReview
│   │   ├── useAdmin.js          # Admin completo: stats, analytics, CRUD, alerts
│   │   ├── useDependents.js     # CRUD dependientes (tutor)
│   │   └── useAI.js             # Chat IA, recomendaciones, recomendaciones por dependiente
│   ├── components/
│   │   ├── shared.jsx           # Componentes reutilizables: Icons (30+), Sidebar, TopNav, Footer, etc.
│   │   ├── ProtectedRoute.jsx   # Guard de autenticación y roles
│   │   ├── Toast.jsx            # Container de notificaciones toast
│   │   ├── AccessibilityBar.jsx # Panel completo de accesibilidad (flotante)
│   │   ├── NotificationBell.jsx # Campana de notificaciones con SSE
│   │   └── MapView.jsx          # Mapa MapLibre con markers y popups
│   └── pages/                   # 12 páginas
│       ├── LandingPage.jsx      # Landing pública (hero, categorías, features, CTA)
│       ├── AuthPage.jsx         # Login + Registro multi-paso (3 pasos)
│       ├── OnboardingPage.jsx   # Cuestionario de perfil (6 pasos)
│       ├── DashboardPage.jsx    # Dashboard personalizado + recomendaciones IA
│       ├── ExplorePage.jsx      # Explorador de instituciones (grid/list/map)
│       ├── InstitutionPage.jsx  # Detalle de institución + chat IA + reseñas
│       ├── FavoritesPage.jsx    # Instituciones guardadas
│       ├── SocialPage.jsx       # Comunidad (posts, grupos) + mensajes directos
│       ├── JobsPage.jsx         # Bolsa de trabajo inclusiva
│       ├── ProfilePage.jsx      # Perfil del usuario
│       ├── TutorPage.jsx        # Gestión de dependientes (familia)
│       └── AdminPage.jsx        # Panel administrativo completo (7 tabs)
```

### 3.3 Rutas y Navegación

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| `/` | `LandingPage` | No | Landing pública |
| `/auth` | `AuthPage` | No | Login + Registro |
| `/onboarding` | `OnboardingPage` | Sí | Cuestionario de perfil (6 pasos) |
| `/dashboard` | `DashboardPage` | Sí | Dashboard principal |
| `/explore` | `ExplorePage` | Sí | Explorar instituciones |
| `/institution/:id` | `InstitutionPage` | Sí | Detalle de institución |
| `/favorites` | `FavoritesPage` | Sí | Guardados |
| `/social` | `SocialPage` | Sí | Comunidad + Mensajes |
| `/jobs` | `JobsPage` | Sí | Bolsa de trabajo |
| `/profile` | `ProfilePage` | Sí | Mi perfil |
| `/familia` | `TutorPage` | Sí | Gestionar familia |
| `/institution-portal` | `DashboardPage` | Sí | Portal de institución (reusa Dashboard) |
| `/admin` | `AdminPage` | Sí | Panel administrativo |
| `*` | `Navigate → /` | No | Catch-all redirect |

**Redirección según rol (login):**
- `admin` → `/admin`
- `institution` → `/institution-portal`
- Otros → `/dashboard`

### 3.4 Sistema de Estado

**Stores Zustand:**

```js
// authStore.js (persist: raices_auth)
{ token, user, setAuth(token, user), logout() }

// uiStore.js
{ toasts: [{ id, msg, type }], addToast(msg, type?), removeToast(id) }

// a11yStore.js (persist: raices_a11y)
{ textScale, highContrast, easyRead, reducedMotion, ttsEnabled, colorblindMode, reset() }
```

**React Query (lib/queryClient.js):**
- Stale time global: 5 minutos
- Reintentos: 1

**Comunicación en tiempo real:**
- Notificaciones: SSE via `EventSource` en `/api/notifications/stream`
- Mensajes: Polling cada 15s (conversaciones) y 8s (chat activo)
- No leídos: Polling cada 30s

### 3.5 Hooks (Detalle)

| Hook | Archivo | Tipo | Endpoint | Descripción |
|------|---------|------|----------|-------------|
| `useLogin()` | useAuth.js | Mutation | `POST /auth/login` | Login + redirect según rol |
| `useRegister()` | useAuth.js | Mutation | `POST /auth/register` | Registro + redirect |
| `useMe()` | useAuth.js | Query | `GET /auth/me` | Datos usuario actual |
| `useProfile()` | useAuth.js + useProfile.js | Query | `GET /users/profile` | Perfil (⚠️ duplicado) |
| `useUpdateProfile()` | useAuth.js + useProfile.js | Mutation | `PUT /users/profile` | Actualizar (⚠️ duplicado) |
| `useSaveProfiling()` | useProfile.js | Mutation | `POST /users/profiling` | Guardar onboarding |
| `useInstitutions(filters)` | useInstitutions.js | Query | `GET /institutions` | Lista con filtros |
| `useInstitution(id)` | useInstitutions.js | Query | `GET /institutions/:id` | Detalle |
| `useDiscovery()` | useInstitutions.js | Query | `GET /discovery` | Recomendaciones |
| `useJobs(filters)` | useJobs.js | Query | `GET /jobs` | Lista vacantes |
| `useJob(id)` | useJobs.js | Query | `GET /jobs/:id` | Detalle vacante |
| `useAppliedJobIds()` | useJobs.js | Query | `GET /jobs/applied` | IDs postulados |
| `useMyApplications()` | useJobs.js | Query | `GET /jobs/my-applications` | Mis solicitudes |
| `useApplyJob()` | useJobs.js | Mutation | `POST /jobs/:id/apply` | Postularme |
| `useFavorites()` | useFavorites.js | Query | `GET /favorites` | Lista completa |
| `useFavoriteIds()` | useFavorites.js | Query | `GET /favorites/ids` | Solo IDs |
| `useToggleFavorite()` | useFavorites.js | Mutation | `POST /favorites/:id` | Toggle |
| `useGroups()` | useCommunity.js | Query | `GET /community/groups` | Grupos |
| `usePosts(groupId)` | useCommunity.js | Query | `GET /community/posts` | Posts |
| `useCreatePost()` | useCommunity.js | Mutation | `POST /community/posts` | Crear post |
| `useToggleLike()` | useCommunity.js | Mutation | `POST /community/posts/:id/like` | Like |
| `useComments(postId)` | useCommunity.js | Query | `GET /community/posts/:id/comments` | Comentarios |
| `useCreateComment(postId)` | useCommunity.js | Mutation | `POST /community/posts/:id/comments` | Crear comentario |
| `useConversations()` | useMessages.js | Query | `GET /messages/conversations` | Lista (poll 15s) |
| `useMessages(partnerId)` | useMessages.js | Query | `GET /messages/with/:id` | Chat (poll 8s) |
| `useUnreadCount()` | useMessages.js | Query | `GET /messages/unread-count` | Contador (poll 30s) |
| `useSendMessage()` | useMessages.js | Mutation | `POST /messages/send/:id` | Enviar |
| `useNotifications()` | useNotifications.js | Query | `GET /notifications` | Lista |
| `useMarkRead()` | useNotifications.js | Mutation | `PATCH /notifications/:id/read` | Marcar leída |
| `useMarkAllRead()` | useNotifications.js | Mutation | `PATCH /notifications/read-all` | Marcar todas |
| `useNotificationStream(cb)` | useNotifications.js | Effect | `GET /notifications/stream` | SSE |
| `useReviews(institutionId)` | useReviews.js | Query | `GET /reviews/institution/:id` | Reseñas |
| `useMyReviews()` | useReviews.js | Query | `GET /reviews/mine` | Mis reseñas |
| `useSubmitReview(id)` | useReviews.js | Mutation | `POST /reviews/institution/:id` | Crear reseña |
| `useDependents()` | useDependents.js | Query | `GET /users/dependents` | Lista dependientes |
| `useAddDependent()` | useDependents.js | Mutation | `POST /users/dependents` | Agregar |
| `useUpdateDependent()` | useDependents.js | Mutation | `PUT /users/dependents/:id` | Actualizar |
| `useDeleteDependent()` | useDependents.js | Mutation | `DELETE /users/dependents/:id` | Eliminar |
| `useChat()` | useAI.js | Mutation | `POST /ai/chat` | Chat IA |
| `useAINextSteps()` | useAI.js | Query | `POST /ai/recommendations` | Recomendaciones (15min stale) |
| `useAIForDependent()` | useAI.js | Mutation | `POST /ai/recommendations` | Recomendaciones dependiente |
| `useAdminStats()` | useAdmin.js | Query | `GET /admin/stats` | KPIs |
| `useAdminAnalytics()` | useAdmin.js | Query | `GET /admin/analytics` | Analítica (5min stale) |
| `useNeedsIntelligence()` | useAdmin.js | Query | `GET /admin/needs-intelligence` | Demanda vs oferta (5min stale) |
| `useAllInstitutions()` | useAdmin.js | Query | `GET /admin/institutions` | Todas |
| `usePendingInstitutions()` | useAdmin.js | Query | `GET /admin/institutions/pending` | Pendientes |
| `useApproveInstitution()` | useAdmin.js | Mutation | `POST /admin/institutions/:id/approve` | Aprobar |
| `useRejectInstitution()` | useAdmin.js | Mutation | `DELETE /admin/institutions/:id` | Eliminar |
| `useToggleVerifyInstitution()` | useAdmin.js | Mutation | `PATCH /admin/institutions/:id/verify` | Toggle verificación |
| `useAdminUsers()` | useAdmin.js | Query | `GET /admin/users` | Todos |
| `useToggleUserActive()` | useAdmin.js | Mutation | `PATCH /admin/users/:id/active` | Toggle activo |
| `useChangeUserRole()` | useAdmin.js | Mutation | `PATCH /admin/users/:id/role` | Cambiar rol |
| `useAdminReviews()` | useAdmin.js | Query | `GET /admin/reviews` | Todas |
| `useDeleteReview()` | useAdmin.js | Mutation | `DELETE /admin/reviews/:id` | Eliminar |
| `useAdminAlerts()` | useAdmin.js | Query | `GET /admin/alerts` | Alertas (2min stale) |
| `useAdminSettings()` | useAdmin.js | Query | `GET /admin/settings` | Config |
| `useUpdateSettings()` | useAdmin.js | Mutation | `PUT /admin/settings` | Actualizar config |

**Total: ~50 hooks (12 archivos)**

### 3.6 Componentes

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `ProtectedRoute` | ProtectedRoute.jsx | Guard: redirect `/` si no token, redirect `/dashboard` si rol no coincide |
| `ToastContainer` | Toast.jsx | Container fijo abajo-izquierda, auto-dismiss 4s, aria-live="polite" |
| `AccessibilityBar` | AccessibilityBar.jsx | Panel flotante: tamaño texto, alto contraste, modo daltónico, TTS, reducir movimiento |
| `NotificationBell` | NotificationBell.jsx | Badge + dropdown notificaciones, SSE tiempo real |
| `MapView` | MapView.jsx | MapLibre GL, centro Mérida, markers + popups instituciones |
| `Icons` | shared.jsx | 30+ iconos SVG inline consistentes |
| `AppSidebar` | shared.jsx | Sidebar lateral 88px, navegación por iconos |
| `TopNav` | shared.jsx | Header sticky con BrandMark + usuario + logout |
| `BrandMark` | shared.jsx | Logo texto "Raíces para florecer." |
| `AppFooter` | shared.jsx | Footer completo con gradientes |
| `CategoryTag` | shared.jsx | Badge de categoría con color |
| `CATEGORY_COLORS` | shared.jsx | Mapa de colores por categoría |

### 3.7 Páginas (Resumen Funcional)

| Página | Líneas aprox. | Funcionalidad clave |
|--------|---------------|---------------------|
| `LandingPage` | ~300 | Hero, 6 categorías, 4 features, CTA, redirect si autenticado |
| `AuthPage` | ~400 | Login + Registro 3 pasos (rol → datos → verificación), cuentas demo |
| `OnboardingPage` | ~350 | 6 pasos: datos → condición → etapa → historial → objetivos → estado |
| `DashboardPage` | ~300 | Banner progreso, análisis IA, recomendaciones, toggle favoritos |
| `ExplorePage` | ~350 | Búsqueda debounce, filtros pills, vista grid/list/map, paginación cliente |
| `InstitutionPage` | ~400 | Header, mapa embebido, chat IA, reseñas con estrellas |
| `FavoritesPage` | ~150 | Grid guardados, toggle quitar, estado vacío |
| `SocialPage` | ~500 | Dos tabs: Comunidad (posts, likes, comentarios) + Mensajes (chat polling) |
| `JobsPage` | ~300 | Dos tabs: Vacantes (filtros modalidad) + Mis solicitudes (estados) |
| `ProfilePage` | ~250 | Header avatar, stats, edición inline, perfil necesidades |
| `TutorPage` | ~300 | CRUD dependientes, tarjetas, recomendaciones IA expandible |
| `AdminPage` | ~900 | 7 sub-tabs: Overview, Inteligencia, Instituciones, Usuarios, Reseñas, Alertas, Config |

**Total: ~4,500 líneas de JSX**

### 3.8 Variables de Entorno Frontend

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `VITE_API_URL` | No | `/api` | URL base del backend |

> En desarrollo, Vite proxea `/api` → `http://localhost:7000` (sin prefijo).

### 3.9 Credenciales de Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Persona con discapacidad | `demo@raices.mx` | `Demo1234` |
| Tutor o familiar | `tutor@raices.mx` | `Tutor1234` |
| Administrador | `admin@raices.mx` | `Admin1234` |

---

## 4. Stack Tecnológico

### Framework y Herramientas

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **React** | ^18.3.1 | Framework UI (funciones + hooks) |
| **Vite** | ^5.4.8 | Build tool y dev server |
| **React Router** | ^6.26.0 | Enrutamiento SPA |
| **TanStack React Query** | ^5.56.0 | Gestión de estado del servidor (caching, mutations) |
| **Zustand** | ^4.5.4 | Estado global del cliente (persistencia en localStorage) |
| **Axios** | ^1.7.7 | Cliente HTTP |
| **MapLibre GL** | ^4.7.0 | Mapas interactivos (OpenStreetMap tiles) |

### Fuentes Tipográficas

- **Inter** (400, 500, 600, 700, 800) — Fuente principal del cuerpo
- **Playfair Display** (700) — Fuente de títulos / display

---

## 5. Estructura del Proyecto

*(Ver sección 3.2 para estructura completa)*

---

## 6. Arquitectura y Patrones

### Patrón de Capas

```
┌─────────────────────────────────────────────┐
│  Páginas (pages/)                           │  ← Orquestación de UI + lógica de negocio
├─────────────────────────────────────────────┤
│  Hooks (hooks/)                             │  ← Lógica de datos (React Query)
├─────────────────────────────────────────────┤
│  Stores (stores/)                           │  ← Estado global del cliente (Zustand)
├─────────────────────────────────────────────┤
│  Lib (lib/)                                 │  ← Configuración base (Axios, QueryClient)
├─────────────────────────────────────────────┤
│  API Backend (localhost:7000)               │  ← Servidor NestJS + Firebase
└─────────────────────────────────────────────┘
```

### Patrones Utilizados

1. **Custom Hooks con React Query** — Toda la lógica de fetching se encapsula en hooks que devuelven `{ data, isLoading, error, mutate }`.

2. **Optimistic Updates vía Invalidation** — Las mutaciones invalidan queries relacionadas automáticamente.

3. **Zustand con Persist** — Auth store y A11y store usan `persist` middleware para sobrevivir refreshes.

4. **Interceptors de Axios** — Token automático en requests y redirect a `/auth` en 401.

5. **Estilos Inline con CSS Variables** — Todo el UI se construye con estilos en línea que referencian `var(--*)` del CSS global, permitiendo temas dinámicos.

6. **Componentes como Funciones con Props de Estilo** — Los componentes comparten estilos vía objetos JS, no CSS modules.

---

## 7. Rutas y Navegación

*(Ver sección 3.3)*

---

## 8. Sistema de Estado Global

*(Ver sección 3.4)*

---

## 9. Capa de API y Comunicación

### Cliente Axios (`lib/api.js`)

- **Base URL:** `import.meta.env.VITE_API_URL ?? '/api'`
- **Proxy en dev:** `/api` → `http://localhost:7000` (sin prefijo `/api`)
- **Interceptor de request:** Inyecta `Authorization: Bearer <token>`
- **Interceptor de response:** En 401, limpia token y redirige a `/auth`

### Comunicación en Tiempo Real

- **Notificaciones:** Server-Sent Events (SSE) vía `EventSource` en `/api/notifications/stream`
- **Mensajes:** Polling cada 15s (conversaciones) y 8s (chat activo)
- **No leídos:** Polling cada 30s

---

## 10. Documentación de Hooks

*(Ver sección 3.5 para tabla completa)*

---

## 11. Documentación de Componentes

*(Ver sección 3.6)*

---

## 12. Documentación de Páginas

*(Ver sección 3.7)*

---

## 13. Sistema de Estilos y Diseño

### Variables CSS Principales

| Variable | Valor Default | Propósito |
|----------|---------------|-----------|
| `--primary` | `#2B7A84` | Color primario (teal) |
| `--primary-dark` | `#1D5960` | Variante oscura |
| `--primary-subtle` | `rgba(43,122,132,0.12)` | Fondo sutil |
| `--bg-warm` | `#FBF7F0` | Fondo principal |
| `--bg-cool` | `#E8DDD0` | Fondo secundario |
| `--bg-surface` | `#FFFFFF` | Superficies (cards) |
| `--fg1` | `#243434` | Texto principal |
| `--fg2` | `#4A5C5C` | Texto secundario (~7:1 contraste) |
| `--fg3` | `#5F7070` | Texto terciario (~4.6:1, pasa WCAG AA) |
| `--border-color` | `#C9BBAD` | Bordes normales |
| `--border-strong` | `#9CABAB` | Bordes fuertes |
| `--focus-ring` | 3px bg + 6px primary | Anillo de foco |

### Paleta de Categorías

| Categoría | Color | Hex |
|-----------|-------|-----|
| Terapia | Teal | `#2B7A84` |
| Educación | Púrpura | `#8B6BAE` |
| Empleo | Ámbar | `#D4944C` |
| Comunidad | Cyan | `#4BA3A3` |
| Salud | Rosa | `#C4789A` |
| Recreación | Verde | `#7BA05B` |

### Formas Características

- **Avatares:** `border-radius: 50% 50% 50% 14%` (forma de hoja/orgánica)
- **Tags de categoría:** `border-radius: 16px 16px 16px 5px`
- **Botones:** `border-radius: var(--radius-pill)` (pill)

---

## 14. Accesibilidad (A11y)

### Nivel de Cumplimiento: ⭐⭐⭐⭐ Excepcional

| Característica | Estado |
|----------------|--------|
| Skip to content | ✅ |
| Foco visible | ✅ |
| RouteFocus | ✅ |
| ARIA labels | ✅ |
| Roles ARIA | ✅ |
| Live regions | ✅ |
| Texto escalable | ✅ |
| Alto contraste | ✅ |
| Modo daltónico | ✅ |
| Lectura fácil | ✅ |
| Reducir movimiento | ✅ |
| TTS (Text-to-Speech) | ✅ |
| Idioma HTML | ✅ |
| Alt text | ✅ |
| Inputs con labels | ✅ |
| Min touch target | ✅ |

---

## 15. Análisis de Calidad del Código

### Fortalezas

1. Separación limpia de responsabilidades
2. Consistencia en naming
3. Reutilización vía `shared.jsx`
4. Estados de carga (skeletons)
5. Estados vacíos con CTAs
6. Error handling (toasts + inline)
7. Consistencia visual

### Debilidades

1. Ausencia total de tests
2. Estilos inline masivos
3. Duplicación de hooks (`useProfile` y `useUpdateProfile` en dos archivos)
4. Sin lazy loading
5. Sin TypeScript
6. Archivos monolíticos (`AdminPage.jsx` ~900 líneas)
7. Sin ErrorBoundary
8. Polling ineficiente

---

## 16. Problemas Detectados

### 🔴 Críticos

| # | Problema | Ubicación |
|---|---------|-----------|
| 1 | Token en localStorage (XSS vulnerable) | authStore.js, api.js |
| 2 | Sin tests | Proyecto completo |
| 3 | Credenciales demo hardcodeadas | LandingPage, AuthPage |

### 🟡 Moderados

| # | Problema | Ubicación |
|---|---------|-----------|
| 4 | Duplicación de hooks | useAuth.js + useProfile.js |
| 5 | Sin code splitting | App.jsx |
| 6 | Catch vacío en useNotifications | useNotifications.js:39 |
| 7 | Token en query string (SSE) | useNotifications.js:31 |
| 8 | Sin rate limiting client-side | useMessages.js |
| 9 | AdminPage monolítico | AdminPage.jsx |
| 10 | Estilos inline no memoizados | Todos los componentes |

### 🟢 Menores

| # | Problema | Ubicación |
|---|---------|-----------|
| 11 | eslint.config.mjs sin trackear | Raíz |
| 12 | Sin .env.example | Raíz |
| 13 | Sin meta description | index.html |
| 14 | console.log permitido | eslint.config.mjs |

---

## 17. Recomendaciones

### Prioridad Alta

1. Lazy loading de rutas con `React.lazy()` + `Suspense`
2. Eliminar hooks duplicados
3. Tests mínimos para hooks críticos
4. ErrorBoundary global
5. Mover token a httpOnly cookie

### Prioridad Media

6. Refactorizar AdminPage (extraer tabs)
7. Crear `.env.example`
8. Pausar polling en pestaña inactiva
9. Memoizar estilos inline
10. Agregar meta tags SEO

### Prioridad Baja

11. Migración incremental a TypeScript
12. Extraer estilos a CSS modules o Tailwind
13. Storybook para documentación visual
14. PWA con service worker

---

## 18. API Endpoints (Consumidos)

*(Ver sección 2.9 para inventario completo del backend)*

**Total: ~45 endpoints**

---

## 19. Variables de Entorno

### Frontend

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `VITE_API_URL` | No | `/api` | URL base del backend |

### Backend (referencia)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `FIREBASE_PROJECT_ID` | ✅ | ID proyecto Firebase |
| `FIREBASE_SERVICE_ACCOUNT` | No | JSON service account |
| `JWT_SECRET` | No | Secreto JWT (fallback hardcodeado) |
| `ANTHROPIC_API_KEY` | No | API key Claude |
| `PORT` | No | Puerto (default 7000) |

---

## 20. Credenciales de Demo

*(Ver sección 3.9)*

---

## Métricas del Proyecto

| Métrica | Frontend | Backend |
|---------|----------|---------|
| Archivos JSX | 18 | — |
| Archivos TS | — | ~30 |
| Archivos JS | 15 | — |
| Archivos CSS | 1 | — |
| Líneas de código (aprox.) | ~4,500 | ~3,500 |
| Custom hooks | 50+ | — |
| Componentes compartidos | 12 | — |
| Páginas | 12 | — |
| Rutas | 13 | — |
| Módulos NestJS | — | 16 |
| Endpoints API | — | ~45 |
| Repositorios | — | 7 |
| Firestore collections | — | 15 |
| Dependencias runtime | 7 | 16 |
| Dependencias dev | 2 | 6 |

---

*Documento generado automáticamente por Codebuff — Auditors v1.0*
