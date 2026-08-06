# 🔍 Auditoría Completa del Proyecto Raíces Frontend

**Fecha de Auditoría:** Agosto 6, 2026  
**Versión:** v1.4.0  
**Framework:** React 18 + Vite + Tailwind CSS  
**Estado:** Activo (Dev branch)

---

## 📋 Resumen Ejecutivo

Raíces es una plataforma web para conectar a personas con discapacidad (PCD) con instituciones que ofrecen servicios especializados. Incluye roles diferenciados (usuario, tutor, institución, admin), sistema de empleo, comunidad social, y administración avanzada con inteligencia artificial.

---

## 🏗️ Arquitectura General

```
src/
├── App.jsx                    # Router principal
├── main.jsx                   # Entry point React
├── features/                  # Módulos por dominio (Feature-Driven)
│   ├── auth/                  # Autenticación y sesión
│   ├── dashboard/             # Dashboard principal
│   ├── explore/               # Exploración de instituciones
│   ├── institutions/          # Gestión de instituciones
│   ├── jobs/                  # Sistema de empleo
│   ├── tutor/                 # Gestión de dependientes (tutor)
│   ├── admin/                 # Panel de administración
│   ├── social/                # Comunidad y mensajes
│   ├── favorites/             # Guardados/favoritos
│   ├── notifications/         # Notificaciones y FCM
│   ├── profile/               # Perfil de usuario
│   ├── reviews/               # Reseñas
│   ├── users/                 # Gestión de usuarios (admin)
│   ├── about/                 # Página about
│   ├── landing/               # Landing page
│   └── a11y/                  # Accesibilidad
├── shared/                    # Componentes compartidos
│   ├── components/            # UI reutilizable
│   ├── constants/             # Endpoints y mensajes
│   ├── hooks/                 # Hooks compartidos
│   ├── lib/                   # Utilidades (api, storage, etc.)
│   └── stores/                # Zustand stores
└── styles/                    # CSS global y Tailwind
```

---

## 🔐 Sistema de Autenticación

### Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `user` | Usuario estándar (PCD) | Explorar, favoritos, empleo, comunidad |
| `tutor` | Tutor/responsable | + Gestionar dependientes |
| `institution` | Institución proveedora | + Portal de gestión, vacantes |
| `admin` | Administrador | + Panel completo, usuarios, analytics |

### Flujo de Login

```
1. Usuario ingresa email/contraseña → AuthPage.jsx
2. POST /autenticacion/inicio-sesion
3. Respuesta: { tokenAcceso, tokenRefresco, usuario }
4. Tokens guardados en localStorage/sessionStorage
5. Zustand store actualizado → redirigir a /dashboard
```

### Flujo de Registro

```
1. AuthPage.jsx → modo "register"
2. POST /autenticacion/registro
3. Si es PCD/Tutor: Login automático
4. Si es Institution: Redirigir a login (pendiente aprobación)
5. Después de login: Redirigir a /onboarding (primera vez)
```

### Persistencia de Sesión

- `useSessionVerify.js` verifica token al cargar app
- `api.js` interceptors: Auto-refresh con `/autenticacion/renovar-token`
- `PUBLIC_ROUTES`: Solo `/auth` (resto requiere sesión)

---

## 🧭 Navegación y Rutas

### Rutas Públicas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | LandingPage | Página principal |
| `/about` | AboutPage | Sobre nosotros |
| `/auth` | AuthPage | Login/Registro |
| `/explore` | ExplorePage | Explorar instituciones |
| `/design-preview` | DesignPreview | Preview de diseño |

### Rutas Protegidas (cualquier usuario logueado)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/dashboard` | DashboardPage | Inicio del usuario |
| `/social` | SocialPage | Comunidad |
| `/favorites` | FavoritesPage | Guardados |
| `/institution/nueva` | CrearInstitucionPage | Crear institución |
| `/institution/:id` | InstitutionPage | Detalle institución |
| `/profile` | ProfilePage | Mi perfil |
| `/jobs` | JobsPage | Empleo/Oportunidades |
| `/notifications` | NotificationsPage | Notificaciones |

### Rutas por Rol

| Ruta | Rol Requerido | Componente |
|------|---------------|------------|
| `/familia` | `tutor` | TutorPage |
| `/personas` | `tutor` | TutorPage |
| `/institution-portal` | `institution` | InstitutionPortalPage |
| `/admin` | `admin` | AdminPage |

---

## 📱 Sidebar por Rol

### Usuario Estándar (`user`)

```
🏠 Inicio          → /dashboard
🔍 Explorar        → /explore
💼 Oportunidades   → /jobs
❤️ Guardados       → /favorites
💬 Comunidad       → /social
👤 [Avatar]        → /perfil
```

### Tutor (`tutor`)

```
🏠 Inicio          → /dashboard
🔍 Explorar        → /explore
💼 Oportunidades   → /jobs
❤️ Guardados       → /favorites
💬 Comunidad       → /social
👥 Mis personas    → /personas
👤 [Avatar]        → /perfil
```

### Institución (`institution`)

```
🏠 Inicio          → /dashboard
🔍 Explorar        → /explore
💼 Oportunidades   → /jobs
❤️ Guardados       → /favorites
💬 Comunidad       → /social
🛡️ Panel           → /institution-portal
👤 [Avatar]        → /perfil
```

### Admin (`admin`)

```
🏠 Inicio          → /dashboard
🔍 Explorar        → /explore
💼 Oportunidades   → /jobs
❤️ Guardados       → /favorites
💬 Comunidad       → /social
🛡️ Admin           → /admin
👤 [Avatar]        → /perfil
```

---

## 🏢 Módulo de Instituciones

### Exploración (`/explore`)

- **Filtros:** Búsqueda, categoría, ciudad, estado, discapacidad
- **Vistas:** Grid / Lista / Mapa
- **Acciones:** Ver detalle, agregar a favoritos
- **Paginación:** Carga por lotes (12 items)

### Portal de Institución (`/institution-portal`)

**Sidebar tabs:**

| Tab | Componente | Descripción |
|-----|------------|-------------|
| `postulaciones` | PostulacionesTab | Gestionar vacantes |
| `candidatos` | CandidatosTab | Ver postulantes |
| `reviews` | InstitutionReviews | Reseñas recibidas |
| `ai-chat` | InstitutionAIChat | Chat IA para portal |
| `settings` | InstitutionSettings | Configuración |

### Endpoints de Institución

```
GET    /instituciones                  → Lista paginada
GET    /instituciones/:id              → Detalle
POST   /instituciones                  → Crear
PUT    /instituciones/:id              → Actualizar
DELETE /instituciones/:id              → Eliminar
GET    /instituciones/mi-institucion   → Mi institución
PUT    /instituciones/mi-institucion   → Actualizar mi institución
```

---

## 👥 Módulo Tutor / Dependientes

### Funcionalidades

1. **Listar dependientes:** `useDependientes()` → GET `/usuarios/dependientes`
2. **Agregar dependiente:** `useAddDependiente()` → POST `/usuarios/dependientes`
3. **Vincular PCD existente:** `useVincularPCD()` → POST `/usuarios/vincular-pcd`
4. **Gestionar permisos:** `useUpdatePermisos()` → PATCH `/usuarios/dependientes/:id/permisos`
5. **Configurar features:** `useUpdateDependentFeatures()` → PUT `/usuarios/dependientes/:id/features`
6. **Eliminar:** `useDeleteDependent()` → DELETE `/usuarios/dependientes/:id`

### Datos del Dependiente

```javascript
{
  id: string,
  tutorId: string,
  nombreCompleto: string,
  parentesco: string,
  tiposDiscapacidad: string[],
  rangoEdad: string,
  etapaVida: string,
  notas: string,
  rol: 'pcd',
  fechaCreacion: string
}
```

---

## 💼 Módulo de Empleo

### Flujo de Publicación de Vacante (Institución)

```
1. InstitutionPortalPage → PostulacionesTab
2. useCreateJobPosting() → POST /empleo
3. Vacante aparece en /jobs para todos los usuarios
4. Institución ve postulantes en CandidatosTab
5. useUpdateApplicationStatus() para aceptar/rechazar
```

### Flujo de Postulación (Usuario)

```
1. JobsPage → Explorar vacantes
2. Filtrar por categoría, ciudad, búsqueda
3. Ver detalle de vacante
4. useApplyJob() → POST /empleo/:jobId/postularse
5. Incluir carta de presentación
6. Ver mis postulaciones en "Mis postulaciones"
```

### Endpoints de Empleo

```
GET    /empleo                           → Lista vacantes
GET    /empleo/:id                       → Detalle vacante
POST   /empleo                           → Crear (institución)
PUT    /empleo/:id                       → Actualizar (institución)
DELETE /empleo/:id                       → Eliminar (institución)
POST   /empleo/:jobId/postularse         → Postularse (usuario)
GET    /empleo/mis-postulaciones         → Mis postulaciones
GET    /empleo/postuladas                → IDs de vacantes postuladas
```

---

## 💬 Módulo de Comunidad (`/social`)

### Funcionalidades

1. **Grupos:** Crear, unirse, salir
2. **Publicaciones:** Crear, editar, eliminar, likes
3. **Comentarios:** En publicaciones
4. **Estadísticas:** Miembros, grupos, publicaciones
5. **Mensajes:** Chat 1:1 entre usuarios

### Endpoints de Comunidad

```
GET    /comunidad/grupos                    → Lista grupos
POST   /comunidad/grupos                    → Crear grupo
POST   /comunidad/grupos/:id/unirse         → Unirse
POST   /comunidad/grupos/:id/salir          → Salir
GET    /comunidad/publicaciones             → Lista publicaciones
POST   /comunidad/publicaciones             → Crear
PUT    /comunidad/publicaciones/:id         → Editar
DELETE /comunidad/publicaciones/:id         → Eliminar
POST   /comunidad/publicaciones/:id/me-gusta → Like
GET    /comunidad/publicaciones/:id/comentarios → Comentarios
POST   /comunidad/publicaciones/:id/comentarios → Crear comentario
GET    /comunidad/estadisticas              → Stats
GET    /comunidad/miembros                  → Miembros destacados
```

### Endpoints de Mensajes

```
GET  /mensajes/conversaciones        → Lista conversaciones
GET  /mensajes/con/:partnerId        → Mensajes con usuario
POST /mensajes/enviar/:partnerId     → Enviar mensaje
GET  /mensajes/no-leidos             → Conteo no leídos
```

---

## 🔔 Sistema de Notificaciones

### Tipos

- **In-app:** Polling cada 30s
- **Push (FCM):** Firebase Cloud Messaging
- **SSE:** Server-Sent Events para tiempo real

### Flujo

```
1. FCMProvider envuelve toda la app
2. useFCM() solicita permiso y guarda token
3. POST /notificaciones/fcm-token
4. useNotificationStream() escucha SSE
5. Cuando llega notificación → toast + actualización UI
```

### Endpoints

```
GET    /notificaciones                → Lista notificaciones
PATCH  /notificaciones/:id/leer       → Marcar leída
PATCH  /notificaciones/leer-todas     → Marcar todas leídas
POST   /notificaciones/fcm-token      → Guardar token FCM
DELETE /notificaciones/fcm-token      → Eliminar token FCM
GET    /notificaciones/flujo          → SSE stream
```

---

## 🛡️ Panel de Administración (`/admin`)

### Tabs

| Tab | Componente | Descripción |
|-----|------------|-------------|
| `overview` | OverviewTab | Estadísticas generales |
| `intelligence` | IntelligenceTab | Inteligencia de necesidades |
| `institutions` | InstitutionsTab | Gestionar instituciones |
| `users` | UsersTab | Gestionar usuarios |
| `reviews` | ReviewsTab | Moderar reseñas |
| `settings` | SettingsTab | Configuración del sistema |
| `alerts` | AlertsTab | Alertas del sistema |

### Endpoints de Admin

```
GET  /administracion/estadisticas              → Stats generales
GET  /administracion/inteligencia-necesidades  → IA insights
GET  /administracion/instituciones             → Lista instituciones
GET  /administracion/instituciones/pendientes  → Pendientes aprobación
POST /administracion/instituciones/:id/aprobar → Aprobar
DELETE /administracion/instituciones/:id       → Eliminar
PATCH /administracion/instituciones/:id/verificar → Verificar
GET  /administracion/usuarios                  → Lista usuarios
PATCH /administracion/usuarios/:id/activo      → Toggle activo
PATCH /administracion/usuarios/:id/rol         → Cambiar rol
DELETE /administracion/usuarios/:id            → Eliminar
GET  /administracion/resenas                   → Lista reseñas
DELETE /administracion/resenas/:id             → Eliminar reseña
GET  /administracion/alertas                   → Alertas
GET  /administracion/configuracion             → Settings
PUT  /administracion/configuracion             → Actualizar settings
GET  /administracion/analiticas                → Analytics
GET  /administracion/visitantes-activos        → Visitantes activos
```

---

## 🎨 Componentes Compartidos (`shared/`)

### Componentes UI

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `Icons` | shared.jsx | Iconos SVG centralizados |
| `LeafIcon` | shared.jsx | Logo de la hoja |
| `BrandMark` | shared.jsx | Marca "Raíces" |
| `CategoryTag` | shared.jsx | Etiqueta de categoría |
| `TopNav` | shared.jsx | Navegación superior |
| `AppFooter` | shared.jsx | Footer de la app |
| `BackendFallback` | BackendFallback.jsx | Fallback para endpoints no implementados |
| `Toast` | Toast.jsx | Notificaciones toast |

### Hooks Compartidos

| Hook | Archivo | Descripción |
|------|---------|-------------|
| `useCatalogos` | hooks/useCatalogos.js | Catálogos del sistema |

### Stores (Zustand)

| Store | Archivo | Descripción |
|-------|---------|-------------|
| `useAuthStore` | features/auth/store/authStore.js | Token, usuario, sesión |
| `useUiStore` | shared/stores/uiStore.js | Sidebar, theme, UI state |
| `useA11yStore` | features/a11y/store/a11yStore.js | Accesibilidad |

### Utilidades

| Utilidad | Archivo | Descripción |
|----------|---------|-------------|
| `api` | lib/api.js | Axios client con interceptors |
| `storage` | lib/storage.js | localStorage/sessionStorage |
| `queryClient` | lib/queryClient.js | React Query client |
| `initScrollReveal` | lib/scrollReveal.js | Animaciones scroll |
| `mexicoLocations` | lib/mexicoLocations.js | Estados y ciudades de México |

---

## 🎨 Sistema de Diseño

### Tokens CSS

```css
:root {
  --sidebar-width: 220px;
  --sidebar-bg: rgba(0, 29, 38, 0.92);
  --primary: #004E52;           /* Verde institucional */
  --primary-subtle: ...;        /* Versión sutil */
  --bg-warm: ...;               /* Fondo cálido para active states */
  --font-display: 'Poppins';
  --font-body: 'Lato';
}
```

### Paleta de Colores por Categoría

```javascript
CATEGORY_COLORS = {
  'educacion': '#2196F3',    /* Azul */
  'salud': '#4CAF50',        /* Verde */
  'empleo': '#FF9800',       /* Naranja */
  'rehabilitacion': '#9C27B0', /* Púrpura */
  'deporte': '#00BCD4',      /* Cyan */
  'cultura': '#E91E63',      /* Rosa */
  'tecnologia': '#3F51B5',   /* Indigo */
  'otros': '#607D8B',        /* Gris azulado */
}
```

### Sidebar Styles

```css
.responsive-sidebar {
  background: var(--sidebar-bg);
  backdrop-filter: blur(12px);
  border-right: none;
}

.sidebar-desktop-nav-item.active {
  background: var(--bg-warm);
  color: var(--primary);
  border-radius: 24px 0 0 24px;
  margin-right: 0;
}
```

---

## 📊 Flujo de Datos

### React Query

- **Stale Time:** 5 minutos (default)
- **Cache Time:** 10 minutos
- **Retry:** 1 intento en errores de red
- **Refetch on Window Focus:** true

### Patrón de Hooks

```javascript
// Patrón estándar para cada feature
export function useFeatureName(params) {
  return useQuery({
    queryKey: ['feature', params],
    queryFn: () => api.get('/endpoint').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

// Para mutaciones
export function useMutateFeature() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/endpoint', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature'] })
    },
  })
}
```

---

## 🐛 Problemas Conocidos

1. **Ruta duplicada:** `/familia` y `/personas` ambas apuntan a TutorPage
2. **Icono de sidebar:** Solo LeafIcon para todos los roles (pendiente diferenciación)
3. **Mobile drawer:** Icono fijo sin variación por rol

---

## 📈 Estadísticas del Código

| Métrica | Valor |
|---------|-------|
| **Features** | 16 módulos |
| **Páginas** | 17 rutas |
| **Hooks** | ~50+ custom hooks |
| **Endpoints** | ~120+ documentados |
| **Componentes** | ~60+ |
| **Stores Zustand** | 3 |

---

## ✅ Checklist de Auditoría

- [x] Autenticación funcional (login, registro, refresh, logout)
- [x] Protección de rutas por rol
- [x] Sidebar dinámico por rol
- [x] CRUD de instituciones
- [x] Sistema de favoritos
- [x] Reseñas y calificaciones
- [x] Empleo (vacantes + postulaciones)
- [x] Comunidad (grupos, posts, comentarios)
- [x] Mensajería 1:1
- [x] Notificaciones in-app + FCM
- [x] Panel admin completo
- [x] Tutor y dependientes
- [x] IA chat y recomendaciones
- [x] Accesibilidad (a11y bar)
- [x] Responsive design
- [x] Dark mode

---

*Documento generado automáticamente por Buffy - Auditoría de Proyecto Raíces Frontend*
