# 📋 Análisis Completo del Dashboard — Persona con Discapacidad (PCD)

> **Fecha:** 20 de agosto de 2026  
> **Versión del proyecto:** v1.5.x (rama `dev`)  
> **Alcance:** Estructura, flujos, inconsistencias y redundancias del dashboard para el rol `pcd`.

---

## 1. Estructura General del Proyecto

```
src/
├── App.jsx                          ← Router principal
├── features/
│   ├── auth/                        ← Autenticación, registro, roles, sidebar, topnav
│   ├── dashboard/                   ← DashboardPage (solo 1 página)
│   ├── profile/                     ← ProfilePage, hooks de perfil
│   ├── institutions/                ← ExplorePage, InstitutionPage, Crear/Editar
│   ├── favorites/                   ← FavoritesPage
│   ├── social/                      ← SocialPage, MessagesPage (comunidad + chat)
│   ├── jobs/                        ← JobsPage (postulaciones/laboral)
│   ├── rutas/                       ← RutasPage, EscalasVidaPage
│   ├── tutor/                       ← TutorPage, dependientes, permisos
│   ├── notifications/               ← NotificationsPage
│   ├── admin/                       ← AdminPage
│   ├── a11y/                        ← AccessibilityBar
│   ├── landing/                     ← LandingPage
│   └── ...
└── shared/
    ├── components/
    │   ├── MainLayout.jsx           ← Layout global (sidebar + topnav + outlet + chat flotante)
    │   ├── shared.jsx               ← Icons, BrandMark, etc.
    │   └── ...
    ├── stores/
    │   └── uiStore.js               ← Estado UI global (sidebar, chat, tabs)
    └── hooks/
```

---

## 2. Flujo de Navegación del Rol PCD

### 2.1 Rutas disponibles para `role === 'pcd'`

| Ruta | Componente | Feature Guard | Sidebar Item | Descripción |
|------|-----------|---------------|--------------|-------------|
| `/dashboard` | `DashboardPage` | ❌ | ✅ Inicio | Dashboard principal con recomendaciones + IA |
| `/explore` | `ExplorePage` | ❌ | ❌ (eliminado del sidebar) | Explorar instituciones |
| `/jobs` | `JobsPage` | `postulaciones` | ✅ Oportunidades | Empleo/Postulaciones |
| `/favorites` | `FavoritesPage` | `favoritos` | ✅ Guardados | Instituciones guardadas |
| `/social` | `SocialPage` | `comunidad` | ✅ Comunidad | Comunidad/social |
| `/messages` | `MessagesPage` | `comunidad` | ❌ | Chat dedicado |
| `/rutas` | `RutasPage` | ❌ | ✅ Mis Rutas | Rutas de desarrollo |
| `/escalas-vida` | `EscalasVidaPage` | ❌ | ❌ | Evaluación de escalas |
| `/profile` | `ProfilePage` | ❌ | ❌ (via avatar) | Perfil del usuario |
| `/notifications` | `NotificationsPage` | ❌ | ❌ (via topnav) | Notificaciones |
| `/institution/:id` | `InstitutionPage` | ❌ | ❌ | Detalle de institución |

### 2.2 Sidebar para PCD

```
Inicio          → /dashboard
Oportunidades   → /jobs          (si feature 'postulaciones' habilitada)
Guardados       → /favorites     (si feature 'favoritos' habilitada)
Comunidad       → /social        (si feature 'comunidad' habilitada)
Mis Rutas       → /rutas         (solo rol pcd)
─────────────
[Avatar] → /profile
```

**Nota:** La ruta `/explore` fue eliminada del sidebar pero sigue accesible por URL directa y desde links internos (dashboard, search bar, etc.).

---

## 3. Flujo de Registro del PCD

El `RegistrationWizard` es un wizard de **11 pasos** para el registro de PCD:

```
identity → contact → security → accommodation → condition → origin 
→ scales1 → scales2 → formats → interests → viability → [submit]
```

### Paso a paso:

1. **identity** — Nombres, apellidos, fecha de nacimiento
2. **contact** — CURP, domicilio
3. **security** — Email, contraseña
4. **accommodation** — Preferencia de acompañamiento + subida de identificación PCD
5. **condition** — Tipo de condición (motriz, visual, auditiva, intelectual, TEA, etc.)
6. **origin** — Neurodivergencia, diagnóstico, temporalidad
7. **scales1** — Escalas A-D (autonomía, independencia, comunicación, comprensión)
8. **scales2** — Escalas E-H (energía, movilidad, social, emocional)
9. **formats** — Preferencias de formato (texto, imágenes, audio, video, persona)
10. **interests** — Intereses (deporte, bienestar, empleo, arte, etc.)
11. **viability** — Viabilidad económica

### Después del registro:
- Se guarda el usuario vía `api.post('/autenticacion/registro')`
- Se guardan las escalas vía `api.post('/usuarios/escalas-vida')`
- Se guarda el perfil de necesidades vía `updateProfile.mutateAsync()` (PUT /usuarios/perfil)
- Se redirige a `/auth` (login) — **el wizard termina en el login, no en el dashboard**

---

## 4. Flujo del Dashboard Principal

### Secciones del DashboardPage:

```
┌─────────────────────────────────────────────────┐
│  Saludo: "Hola, {nombre}"                       │
├─────────────────────────────────────────────────┤
│  Tus caminos de interés prioritarios            │  ← interest tags (de profiling o localStorage)
│  [interest1] [interest2] ...                    │
├─────────────────────────────────────────────────┤
│  Próximos pasos (IA)                            │  ← useAINextSteps
│  1. Paso uno                                    │
│  2. Paso dos                                    │
│  Instituciones sugeridas [tag] [tag]            │
├─────────────────────────────────────────────────┤
│  Recomendaciones para ti                        │  ← useDiscovery
│  [Card] [Card] [Card]                           │
│  Ver todas → /explore                           │
└─────────────────────────────────────────────────┘
```

### Fuentes de datos del Dashboard:
- `useMe()` → datos del usuario (queryKey: `['me']`)
- `useProfile()` → perfil completo con profiling (queryKey: `['profile']`)
- `useDiscovery()` → recomendaciones de instituciones
- `useFavoriteIds()` → IDs de favoritos
- `useAINextSteps()` → pasos sugeridos por IA

---

## 5. 🔴 Inconsistencias Detectadas

### 5.1 Doble `useProfile` hook con diferentes queryKeys

**Archivo:** `src/features/profile/hooks/useProfile.js` y `src/features/auth/hooks/useAuth.js`

Ambos archivos exportan un hook `useProfile()`, pero:
- `profile/hooks/useProfile.js` usa queryKey `['perfil']` y retorna crudo `r.data`
- `auth/hooks/useAuth.js` usa queryKey `['profile']`, mapea backend→frontend y retorna objeto con `profiling`

**Problema:** El `DashboardPage` importa `useProfile` desde `@features/auth`, pero `ProfilePage` también importa desde `@features/auth`. El hook en `profile/hooks` queda como código muerto que se invalida con queryKey diferente.

**Archivo afectado:**
```javascript
// auth/hooks/useAuth.js
export function useProfile() {
  return useQuery({ queryKey: ['profile'], ... })
}

// profile/hooks/useProfile.js  
export function useProfile() {
  return useQuery({ queryKey: ['perfil'], ... })
}
```

---

### 5.2 Doble `useUpdateProfile` con interfaces incompatibles

- `auth/hooks/useAuth.js` → `useUpdateProfile()` espera `{ full_name, city, state, profiling }` y hace mapeo al backend
- `profile/hooks/useProfile.js` → `useUpdateProfile()` hace `api.put('/usuarios/perfil', data)` directamente sin mapeo

**Problema:** `RegistrationWizard` usa el de `auth/hooks`, pero `ProfilePage` y `JobsPage` (ApplicationModal) también usan el de `auth/hooks`. El de `profile/hooks` invalida queries `['perfil']` y `['yo']`, mientras que el de `auth/hooks` invalida `['profile']` y `['me']`. Esto puede causar inconsistencias de caché.

---

### 5.3 Registro redirige a `/auth` en vez de `/dashboard`

En `RegistrationWizard.jsx`, el botón final dice "Comencemos tu camino en Raíces" pero hace `nav('/auth')`. Después del registro exitoso, el usuario debe volver a hacer login manualmente. Sin embargo, `useRegister` en `useAuth.js` también hace `nav('/dashboard', { replace: true })` en el onSuccess. Esto puede causar un race condition o confusión.

---

### 5.4 Sidebar no incluye `/explore` pero múltiples rutas enlazan a él

- El sidebar eliminó el item "Explorar" (commit reciente)
- Pero el DashboardPage enlaza a `/explore` ("Ver todas", "Explorar oportunidades")
- El TopNavSearchBar navega a `/explore?q=...` y `/explore?category=...`
- La función `handleSearchSubmit` redirige a `/explore`
- El "Preguntar en la comunidad" del search bar va a `/social`

**Resultado:** El usuario llega a `/explore` por múltiples vías pero no tiene forma de volver desde el sidebar.

---

### 5.5 Ruta `/messages` existe pero no está en el sidebar

La ruta `/messages` está definida en `App.jsx` con `FeatureGuard feature="comunidad"`, pero:
- No aparece como item en el sidebar
- El botón de mensajes en TopNav abre el **chat flotante** (no navega a `/messages`)
- `/messages` solo es accesible por URL directa

**Pregunta:** ¿Se eliminó la ruta `/messages` de forma intencional o es un leftover?

---

### 5.6 `hashColor` definido en múltiples archivos

- `src/shared/components/shared.jsx` exporta `hashColor`
- `src/features/social/pages/MessagesPage.jsx` redefine localmente `hashColor`

---

### 5.7 Roles inconsistentes: `pcd` vs permisos

- El sidebar usa `user?.role === 'pcd'` para agregar "Mis Rutas"
- Las features se evalúan con `hasFeature()` que verifica `user?.features`
- La ruta `/rutas` no tiene `FeatureGuard` — cualquier usuario autenticado puede acceder
- La ruta `/escalas-vida` tampoco tiene protección por rol

---

### 5.8 `currentPage` en MainLayout no cubre todas las rutas

```javascript
// MainLayout.jsx
if (location.pathname.startsWith('/dashboard')) currentPage = 'dashboard'
else if (location.pathname.startsWith('/explore')) currentPage = 'explore'
else if (location.pathname.startsWith('/jobs')) currentPage = 'jobs'
else if (location.pathname.startsWith('/favorites')) currentPage = 'favorites'
else if (location.pathname.startsWith('/social')) currentPage = 'social'
else if (location.pathname.startsWith('/personas') || location.pathname.startsWith('/familia')) currentPage = 'tutor'
else if (location.pathname.startsWith('/profile')) currentPage = 'profile'
else if (location.pathname.startsWith('/notifications')) currentPage = 'notifications'
```

**Faltan:** `/messages`, `/rutas`, `/escalas-vida` — estas rutas nunca resaltan un item en el sidebar.

---

## 6. 🔴 Redundancias Detectadas

### 6.1 Onboarding eliminado pero lógica dispersa

El archivo `OnboardingPage.jsx` fue eliminado, pero:
- `RegistrationWizard` ahora captura la misma información en sus 11 pasos
- Se guarda el perfil de necesidades inline en el wizard con `updateProfile.mutateAsync()`
- La función `useSaveProfiling` fue eliminada de `profile/hooks/useProfile.js`
- El test de `useSaveProfiling` fue eliminado

**Veredicto:** La limpieza es correcta, pero la lógica de profiling ahora está duplicada entre:
1. El wizard de registro (inline, campos hardcodeados)
2. El `ProfilePage` (lectura/visualización)
3. `useUpdateProfile` en `auth/hooks` (escritura)

---

### 6.2 Chat flotante vs `/messages` vs `/social`

Existen **3 formas** de acceder al chat:

1. **Chat flotante** (MainLayout) — Botón en TopNav → `setFloatingChatOpen(true)`
2. **Ruta `/messages`** — `MessagesPage` con `DirectMessages`
3. **Tab "Mensajes" en SocialPage** — (eliminada en el commit reciente)

El componente `DirectMessages` se renderiza en:
- `MainLayout.jsx` como chat flotante (`isFloating={true}`)
- `MessagesPage.jsx` como página dedicada (`isFloating={false}`)

**Redundancia:** `MessagesPage` existe como ruta pero el chat flotante ya cubre la funcionalidad. Si `/messages` se mantiene, ambas instancias comparten el mismo store (`floatingChatOpen`, `floatingChatPartnerId`) lo que puede causar estado cruzado.

---

### 6.3 Tres fuentes de verdad para el perfil del usuario

| Fuente | QueryKey | Mapeo | Uso |
|--------|----------|-------|-----|
| `useMe()` (auth/hooks) | `['me']` | Backend→Frontend | Datos básicos del usuario |
| `useProfile()` (auth/hooks) | `['profile']` | Backend→Frontend + profiling | Perfil completo con necesidades |
| `useProfile()` (profile/hooks) | `['perfil']` | Sin mapeo | Código muerto / no usado |

---

### 6.4 `useDiscovery` vs `useInstitutions` en ExplorePage

- `DashboardPage` usa `useDiscovery()` para recomendaciones
- `ExplorePage` usa `useInstitutions()` para exploración
- Ambos probablemente llaman al mismo endpoint pero con diferentes parámetros

---

### 6.5 Estilos inline repetidos en cada página

Cada página (Dashboard, Favorites, Profile, Social, etc.) redeclara estilos como:
```javascript
const s = {
  card: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, ... },
  sectionTitle: { ... },
  ...
}
```

No hay un sistema de diseño compartido más allá de `shared.jsx` (Icons, BrandMark, CategoryTag).

---

### 6.6 `AppSidebar` importado pero no usado en varias páginas

Varias páginas importan `AppSidebar` y `TopNav` pero no los renderizan directamente (porque `MainLayout` ya los renderiza):
- `DashboardPage.jsx` — importa pero no renderiza (el layout lo hace)
- `FavoritesPage.jsx` — importa pero no renderiza
- `ExplorePage.jsx` — importa pero no renderiza
- `JobsPage.jsx` — importa pero no renderiza

---

## 7. 🔴 Flujos Problemáticos

### 7.1 Postulación a empleo (JobsPage)

El flujo de postulación es un wizard de 4 pasos dentro de un modal:

```
[0: Candidato (solo tutor)] → [1: Ubicación] → [2: CV] → [3: Revisión]
```

**Problemas:**
- El CV se guarda en `localStorage` (`raices_user_cv_{candidateId}`), no en el servidor
- La información de contacto se guarda parcialmente en localStorage y parcialmente en el perfil
- El `CvDocumentPreview` tiene datos hardcodeados de ejemplo (habilidades, experiencia, educación)
- El wizard carga datos de `localStorage` al iniciar, no del backend

---

### 7.2 Escalas de Vida (EscalasVidaPage)

Las escalas se pueden evaluar desde:
1. El wizard de registro (RegistrationWizard) — escalas simplificadas
2. La página dedicada `/escalas-vida` — escalas completas con metadata

**Problema:** Las escalas del wizard tienen opciones diferentes a las de la página dedicada:
- Wizard: valores 1-5 para comunicación, 1-4 para el resto
- Página dedicada: valores 1-4 para todas
- Los labels y descripciones son diferentes

---

### 7.3 Perfil de necesidades después del registro

El wizard de registro guarda el perfil con campos parciales:
```javascript
profiling: {
  disability_types: conditionData.conditions,
  severity: conditionData.conditions.join(', '),  // ⚠️ Guarda las condiciones como severidad
  communication_modes: [],  // ⚠️ Vacío a pesar de tener escalas
  mobility_needs: conditionData.conditions,  // ⚠️ Duplicado de disability_types
  goals: selectedInterests,
  needs: [],  // ⚠️ Vacío
  // ... otros campos vacíos
}
```

**Resultado:** El perfil se guarda con datos incompletos y campos que contienen información incorrecta (severity contiene las condiciones, mobility_needs es duplicado).

---

### 7.4 Búsqueda y Exploración

- TopNavSearchBar → `/explore?q=term`
- TopNavSearchBar trending → `/explore?category=cat`
- Dashboard "Ver todas" → `/explore`
- Dashboard interests → `/explore?query=interest`
- SocialPage no tiene integración directa con explore

---

## 8. 📊 Resumen de Estados de UI

### uiStore (Zustand)

```javascript
{
  // Toasts
  toasts: [],
  
  // Sidebar
  sidebarOpen: false,
  
  // Admin portal
  adminTab: 'overview',
  
  // Institution portal
  instPortalTab: 'postulaciones',
  
  // Floating chat
  floatingChatOpen: false,
  floatingChatMinimized: false,
  floatingChatPartnerId: null,
}
```

### authStore (Zustand)

```javascript
{
  token: string | null,
  refreshToken: string | null,
  user: {
    id, email, role, full_name, features,
    // Opcionales:
    avatar_url, is_verified, city, state,
    curp, telefonoContacto, preferenciasAcompanamiento
  } | null,
}
```

---

## 9. 🗂️ Mapa de Features del Usuario

Las features se obtienen de `user.features` (viene del endpoint `/autenticacion/yo`):

| Feature | Sidebar | FeatureGuard | Descripción |
|---------|---------|--------------|-------------|
| `postulaciones` | Oportunidades | JobsPage | Empleo y postulaciones |
| `favoritos` | Guardados | FavoritesPage | Guardar instituciones |
| `comunidad` | Comunidad | SocialPage, MessagesPage | Comunidad y chat |

**Nota:** Las features son controladas por el tutor (vía `PermissionsModal`) y pueden deshabilitar secciones completas.

---

## 10. 🎯 Recomendaciones

### Prioridad Alta

1. **Consolidar `useProfile`**: Eliminar el hook duplicado en `profile/hooks/useProfile.js` (queryKey `['perfil']`) y unificar en `auth/hooks/useAuth.js` (queryKey `['profile']`).

2. **Corregir el perfil post-registro**: El `RegistrationWizard` guarda campos incorrectos en `profiling.severity` y `profiling.mobility_needs`. Debería mapear correctamente los datos del wizard al formato del backend.

3. **Decidir sobre `/messages` vs chat flotante**: Si el chat flotante reemplaza a la página dedicada, eliminar `/messages` y `MessagesPage`. Si ambos coexisten, sincronizar el estado del store.

4. **Añadir protección por rol** a `/rutas` y `/escalas-vida` (actualmente accesibles para todos los roles autenticados).

### Prioridad Media

5. **Eliminar imports no utilizados** de `AppSidebar` y `TopNav` en páginas donde `MainLayout` ya los renderiza.

6. **Unificar las escalas de vida** entre el wizard de registro y `EscalasVidaPage` (mismos valores, mismos labels).

7. **Completar el mapeo de `currentPage`** en `MainLayout` para incluir todas las rutas (`/messages`, `/rutas`, `/escalas-vida`).

8. **Eliminar `hashColor` duplicado** en `MessagesPage.jsx` y usar el de `shared.jsx`.

### Prioridad Baja

9. **Externalizar estilos repetidos** a un sistema de tokens/componentes compartidos.

10. **Migrar datos de `localStorage`** del CV y teléfono a persistencia en backend.

---

## 11. Diagrama de Dependencias del Dashboard PCD

```
DashboardPage
├── useMe()                    ← auth/hooks (queryKey: 'me')
├── useProfile()               ← auth/hooks (queryKey: 'profile')
│   └── profiling.goals        ← Para "Tus caminos de interés"
├── useDiscovery()             ← institutions/hooks
├── useFavoriteIds()           ← favorites/hooks
├── useToggleFavorite()        ← favorites/hooks
└── useAINextSteps()           ← tutor/hooks

ProfilePage
├── useProfile()               ← auth/hooks (queryKey: 'profile')
├── useUpdateProfile()         ← auth/hooks
├── useActualizarAvatar()      ← auth/hooks
├── useEliminarAvatar()        ← auth/hooks
└── useCatalogos()             ← shared/hooks

JobsPage
├── useJobs()                  ← jobs/hooks
├── useApplyJob()              ← jobs/hooks
├── useMiInstitucion()         ← institutions/hooks
├── useDependientes()          ← tutor/hooks
├── useUpdateProfile()         ← auth/hooks
└── useSendMessage()           ← social/hooks (para contactar reclutador)

SocialPage
├── useCommunityPosts()        ← social/hooks
├── useCommunityStats()        ← social/hooks
└── useMiembrosDestacados()    ← social/hooks

MessagesPage / DirectMessages
├── useConversations()         ← social/hooks
├── useMessages()              ← social/hooks
├── useSendMessage()           ← social/hooks
└── useMiembrosDestacados()    ← social/hooks

RutasPage
├── useRutas()                 ← rutas/hooks
├── useRutasSummary()          ← rutas/hooks
└── useRutaDetail()            ← rutas/hooks

EscalasVidaPage
├── useSaveEscalasVida()       ← profile/hooks (queryKey: 'perfil')
└── useCatalogos()             ← shared/hooks
```

---

*Documento generado el 20/08/2026 — Análisis basado en la rama `dev`.*
