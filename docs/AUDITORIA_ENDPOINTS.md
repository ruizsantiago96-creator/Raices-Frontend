# Auditoría de Endpoints del Frontend — Raíces

> **Fecha:** 20 de julio de 2026  
> **Alcance:** Todos los módulos excepto Autenticación (Auth), que está completo y funcional.  
> **Objetivo:** Mapear endpoints consumidos, identificar los faltantes y detectar inconsistencias de datos.

---

## 1. Mapa de Endpoints Actualmente Consumidos

### 1.1 Perfil de Usuario

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/users/profile` | `useProfile()` | ProfilePage, DashboardPage |
| `PUT` | `/users/profile` | `useUpdateProfile()` | ProfilePage (editar nombre, ciudad, estado) |
| `POST` | `/users/profiling` | `useSaveProfiling()` | OnboardingPage (wizard de 6 pasos) |

### 1.2 Comunidad

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/community/groups` | `useGroups()` | SocialPage (sidebar de grupos) |
| `GET` | `/community/posts?group_id=` | `usePosts(groupId)` | SocialPage (feed de publicaciones) |
| `POST` | `/community/posts` | `useCreatePost()` | SocialPage (caja de composición) |
| `POST` | `/community/posts/:postId/like` | `useToggleLike()` | SocialPage (botón de me gusta) |
| `GET` | `/community/posts/:postId/comments` | `useComments(postId)` | SocialPage (sección de comentarios) |
| `POST` | `/community/posts/:postId/comments` | `useCreateComment(postId)` | SocialPage (enviar comentario) |

### 1.3 Mensajería Directa

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/messages/conversations` | `useConversations()` | SocialPage > DirectMessages (lista de chats) |
| `GET` | `/messages/with/:partnerId` | `useMessages(partnerId)` | SocialPage > DirectMessages (historial) |
| `GET` | `/messages/unread-count` | `useUnreadCount()` | NotificationBell (badge) |
| `POST` | `/messages/send/:toId` | `useSendMessage()` | SocialPage > DirectMessages (enviar) |
| `GET` | `/notifications/stream?token=` | `useNotificationStream()` | NotificationBell (SSE en tiempo real) |

### 1.4 Empleo (Bolsa de Trabajo)

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/jobs?city=&modality=` | `useJobs(filters)` | JobsPage (listado con filtros) |
| `GET` | `/jobs/:id` | `useJob(id)` | (disponible, sin uso visible aún) |
| `GET` | `/jobs/applied` | `useAppliedJobIds()` | JobsPage (marcar "Postulado") |
| `GET` | `/jobs/my-applications` | `useMyApplications()` | JobsPage (tab "Mis solicitudes") |
| `POST` | `/jobs/:jobId/apply` | `useApplyJob()` | JobsPage (modal de postulación) |

### 1.5 Instituciones

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/institutions?search=&category=` | `useInstitutions(filters)` | ExplorePage (búsqueda/filtrado) |
| `GET` | `/institutions/:id` | `useInstitution(id)` | InstitutionPage (detalle) |
| `GET` | `/discovery` | `useDiscovery()` | DashboardPage (recomendaciones) |

### 1.6 Favoritos

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/favorites` | `useFavorites()` | FavoritesPage (listado completo) |
| `GET` | `/favorites/ids` | `useFavoriteIds()` | ExplorePage, DashboardPage, InstitutionPage (estado del corazón) |
| `POST` | `/favorites/:id` | `useToggleFavorite()` | ExplorePage, DashboardPage, InstitutionPage, FavoritesPage |

### 1.7 Reseñas

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/reviews/institution/:institutionId` | `useReviews(institutionId)` | InstitutionPage (listado) |
| `GET` | `/reviews/mine` | `useMyReviews()` | (disponible, sin uso visible aún) |
| `POST` | `/reviews/institution/:institutionId` | `useSubmitReview(institutionId)` | InstitutionPage (formulario) |

### 1.8 Dependientes (Tutor/Familiar)

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/users/dependents` | `useDependents()` | TutorPage (listado de familiares) |
| `POST` | `/users/dependents` | `useAddDependent()` | TutorPage (agregar persona) |
| `PUT` | `/users/dependents/:id` | `useUpdateDependent()` | TutorPage (editar persona) |
| `DELETE` | `/users/dependents/:id` | `useDeleteDependent()` | TutorPage (eliminar persona) |

### 1.9 Notificaciones

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/notifications` | `useNotifications()` | NotificationBell |
| `PATCH` | `/notifications/:id/read` | `useMarkRead()` | NotificationBell |
| `PATCH` | `/notifications/read-all` | `useMarkAllRead()` | NotificationBell |

### 1.10 Inteligencia Artificial

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `POST` | `/ai/chat` | `useChat()` | InstitutionPage (asistente IA contextual) |
| `POST` | `/ai/recommendations` | `useAINextSteps()` | DashboardPage (próximos pasos) |
| `POST` | `/ai/recommendations` | `useAIForDependent()` | TutorPage (recomendación por dependiente) |

### 1.11 Panel de Administración

| Método | Ruta | Hook | Usado en |
|--------|------|------|----------|
| `GET` | `/admin/stats` | `useAdminStats()` | AdminPage > OverviewTab |
| `GET` | `/admin/analytics` | `useAdminAnalytics()` | AdminPage > OverviewTab (gráficas) |
| `GET` | `/admin/needs-intelligence` | `useNeedsIntelligence()` | AdminPage > IntelligenceTab |
| `GET` | `/admin/institutions` | `useAllInstitutions()` | AdminPage > InstitutionsTab |
| `GET` | `/admin/institutions/pending` | `usePendingInstitutions()` | AdminPage (badge de pendientes) |
| `POST` | `/admin/institutions/:id/approve` | `useApproveInstitution()` | AdminPage > InstitutionsTab |
| `DELETE` | `/admin/institutions/:id` | `useRejectInstitution()` | AdminPage > InstitutionsTab |
| `PATCH` | `/admin/institutions/:id/verify` | `useToggleVerifyInstitution()` | AdminPage > InstitutionsTab |
| `GET` | `/admin/users` | `useAdminUsers()` | AdminPage > UsersTab |
| `PATCH` | `/admin/users/:id/active` | `useToggleUserActive()` | AdminPage > UsersTab |
| `PATCH` | `/admin/users/:id/role` | `useChangeUserRole()` | AdminPage > UsersTab |
| `GET` | `/admin/reviews` | `useAdminReviews()` | AdminPage > ReviewsTab |
| `DELETE` | `/admin/reviews/:id` | `useDeleteReview()` | AdminPage > ReviewsTab |
| `GET` | `/admin/alerts` | `useAdminAlerts()` | AdminPage > AlertsTab |
| `GET` | `/admin/settings` | `useAdminSettings()` | AdminPage > SettingsTab |
| `PUT` | `/admin/settings` | `useUpdateSettings()` | AdminPage > SettingsTab |

---

## 2. Endpoints Faltantes (Pendientes de Desarrollar/Conectar)

### 2.1 🔴 Críticos — Necesarios para funcionalidad core

#### 2.1.1 Subida de Avatar / Foto de Perfil

**Problema:** El frontend referencia `avatar_url` en el store de sesión (`useSessionVerify.js` línea 55, 65) y en `SocialPage.jsx` (línea 584: `user?.avatar_url`), pero **no existe ningún mecanismo de upload** en el frontend ni endpoint para procesarlo.

```
POST /users/avatar
Content-Type: multipart/form-data

Body:
  file: <File>  (imagen JPG/PNG, máx 2MB recomendado)

Response 200:
{
  "avatar_url": "https://cdn.raices.com/avatars/user-42-abc123.jpg"
}
```

**Notas:**
- El endpoint debe validar tipo MIME (image/jpeg, image/png, image/webp)
- Debe generar un nombre de archivo único (UUID)
- Debe redimensionar/comprimir la imagen server-side
- Almacenar en CDN o bucket (S3, Cloudflare R2, etc.)
- Soporte UTF-8 para nombres de archivo con caracteres especiales

---

#### 2.1.2 Portal de Instituciones (Rol `institution`)

**Problema:** En `useAuth.js` línea 20, al hacer login con `role === 'institution'` se redirige a `/institution-portal`, pero **no existe esa página ni hooks asociados**. La institución no puede gestionar su propio perfil, empleos ni contenido.

**Endpoints necesarios:**

```
GET /institutions/me
Response 200:
{
  "id": "inst_abc123",
  "name": "Centro de Terapia Familiar",
  "description": "...",
  "category": "Terapia",
  "address": "Av. Reforma 123",
  "city": "Ciudad de México",
  "state": "CDMX",
  "phone": "+52 55 1234 5678",
  "email": "contacto@centro.com",
  "website": "https://centro.com",
  "lat": 19.4326,
  "lng": -99.1332,
  "disability_types": ["TEA", "Motriz"],
  "plan_type": "premium",
  "is_verified": true,
  "rating_avg": 4.8,
  "rating_count": 124
}
```

```
PUT /institutions/me
Body:
{
  "name": "string (opcional)",
  "description": "string (opcional)",
  "address": "string (opcional)",
  "city": "string (opcional)",
  "state": "string (opcional)",
  "phone": "string (opcional)",
  "email": "string (opcional)",
  "website": "string (opcional)",
  "lat": "number (opcional)",
  "lng": "number (opcional)",
  "disability_types": ["string"] (opcional)
}

Response 200: { "message": "Institución actualizada", "institution": {...} }
```

---

#### 2.1.3 Gestión de Empleos (para rol `institution`)

**Problema:** Las instituciones no pueden crear, editar ni eliminar vacantes de empleo. Solo existen endpoints de lectura y postulación.

```
POST /jobs
Body:
{
  "title": "string (requerido)",
  "description": "string (requerido)",
  "requirements": "string (opcional)",
  "city": "string (requerido)",
  "state": "string (opcional)",
  "modality": "presencial | remoto | híbrido (requerido)",
  "schedule": "string (opcional)",
  "salary_range": "string (opcional)",
  "disability_inclusive": "boolean",
  "disability_types": ["string"]
}

Response 201: { "id": "job_xyz", "message": "Vacante creada" }
```

```
PUT /jobs/:id
Body: (mismos campos que POST, todos opcionales)

Response 200: { "message": "Vacante actualizada", "job": {...} }
```

```
DELETE /jobs/:id
Response 200: { "message": "Vacante eliminada" }
```

---

### 2.2 🟡 Importantes — Mejoran significativamente la UX

#### 2.2.1 Eliminación y Edición de Publicaciones (Comunidad)

**Problema:** Los usuarios no pueden editar ni eliminar sus propios posts ni comentarios en la comunidad.

```
PUT /community/posts/:postId
Body:
{
  "content": "string (requerido)"
}

Response 200: { "message": "Publicación actualizada", "post": {...} }
```

```
DELETE /community/posts/:postId
Response 200: { "message": "Publicación eliminada" }
```

```
PUT /community/posts/:postId/comments/:commentId
Body:
{
  "content": "string (requerido)"
}

Response 200: { "message": "Comentario actualizado", "comment": {...} }
```

```
DELETE /community/posts/:postId/comments/:commentId
Response 200: { "message": "Comentario eliminado" }
```

---

#### 2.2.2 Gestión de Grupos de la Comunidad

**Problema:** Solo se puede listar y filtrar por grupos, pero los usuarios no pueden unirse, salirse o crear grupos.

```
POST /community/groups
Body:
{
  "name": "string (requerido)",
  "description": "string (opcional)"
}

Response 201: { "id": "grp_abc", "message": "Grupo creado" }
```

```
POST /community/groups/:groupId/join
Response 200: { "message": "Te uniste al grupo" }
```

```
POST /community/groups/:groupId/leave
Response 200: { "message": "Saliste del grupo" }
```

---

#### 2.2.3 Eliminación de Reseñas (Propias)

**Problema:** `useMyReviews()` existe pero no hay hook ni UI para eliminar la reseña propia del usuario.

```
DELETE /reviews/:id
Response 200: { "message": "Reseña eliminada" }
```

```
PUT /reviews/:id
Body:
{
  "rating": "number (1-5, opcional)",
  "comment": "string (opcional)"
}

Response 200: { "message": "Reseña actualizada", "review": {...} }
```

---

#### 2.2.4 Estadísticas de la Comunidad (Datos Hardcoded)

**Problema:** En `SocialPage.jsx` (AboutCommunity), las estadísticas están hardcodeadas:
```javascript
{ label: 'Miembros activos', value: '2,400+' },
{ label: 'Grupos', value: '12' },
{ label: 'Historias compartidas', value: '850+' },
```

```
GET /community/stats
Response 200:
{
  "active_members": 2400,
  "groups_count": 12,
  "posts_count": 850
}
```

---

### 2.3 🟢 Deseables — Funcionalidad extendida

#### 2.3.1 Gestión de Notificaciones

```
DELETE /notifications/:id
Response 200: { "message": "Notificación eliminada" }
```

```
DELETE /notifications
Response 200: { "message": "Todas las notificaciones eliminadas" }
```

---

#### 2.3.2 Gestión de Mensajes

```
DELETE /messages/:messageId
Response 200: { "message": "Mensaje eliminado" }
```

```
PATCH /messages/:messageId/read
Response 200: { "message": "Mensaje marcado como leído" }
```

---

## 3. Inconsistencias de Datos Detectadas

### 3.1 🔴 Campo `name` vs `full_name`

**Archivo:** `SocialPage.jsx` línea 584  
**Código:**
```jsx
<Avatar name={user?.name} src={user?.avatar_url} />
```

**Problema:** El store de autenticación y el endpoint `/auth/me` retornan `full_name`, no `name`. Esto causará que el avatar muestre `?` en lugar de las iniciales del usuario.

**Fix necesario:** Cambiar `user?.name` por `user?.full_name` en `SocialPage.jsx` línea 584.

---

### 3.2 🟡 `useProfile()` definido en dos archivos

**Archivos afectados:**
- `src/hooks/useProfile.js` (línea 4-8)
- `src/hooks/useAuth.js` (línea 70-76)

Ambos exportan `useProfile()` que hace `GET /users/profile`. `ProfilePage.jsx` importa de `useAuth`, mientras que `DashboardPage.jsx` también importa de `useAuth`. El `useProfile.js` parece ser un duplicado no utilizado.

**Recomendación:** Unificar en un solo archivo. Eliminar `useProfile` de `useAuth.js` y que todos importen de `useProfile.js`, o viceversa.

---

### 3.3 🟡 `useUpdateProfile()` también duplicado

**Archivos afectados:**
- `src/hooks/useProfile.js` (línea 11-18)
- `src/hooks/useAuth.js` (línea 78-85)

Ambos hacen `PUT /users/profile` y invalidan las mismas query keys.

---

### 3.4 🟡 Datos hardcoded en AboutCommunity

**Archivo:** `SocialPage.jsx` (AboutCommunity)  
**Líneas:** 185-190

Los miembros de la comunidad están hardcodeados como `COMMUNITY_MEMBERS`. Idealmente deberían provenir de un endpoint:
```
GET /community/members/featured
Response 200: [
  {
    "name": "María García",
    "role": "Madre de familia",
    "city": "Mérida, Yucatán",
    "bio": "...",
    "avatar_url": "..."
  }
]
```

---

### 3.5 🟡 Datos mock en ExplorePage para usuarios guest

**Archivo:** `ExplorePage.jsx` (MOCK_INSTITUTIONS, líneas 21-28)

Cuando el usuario no está autenticado, se usan datos mock. Se recomienda un endpoint público:
```
GET /institutions/public?search=&category=&limit=6
```

---

### 3.6 🟢 Soporte UTF-8 para campos de ubicación

**Consideración:** Los campos `city` y `state` contienen caracteres especiales frecuentemente:
- Mérida, Yucatán
- Guadalajara, Jalisco
- Ciudad de México
- San José del Cabo, Baja California Sur

**Verificar que:**
- La base de datos use codificación `utf8mb4` (MySQL) o `UTF-8` (PostgreSQL)
- Los strings se envíen correctamente codificados en JSON (Axios lo hace por defecto)
- Los filtros de búsqueda (`?search=`) funcionen con acentos ( COLLATION insensitive)

---

## 4. Resumen Ejecutivo

| Categoría | Endpoints existentes | Endpoints faltantes | Prioridad |
|-----------|---------------------|---------------------|-----------|
| Perfil | 3 | 1 (avatar upload) | 🔴 Crítica |
| Portal Institución | 0 | 2 (GET/PUT /institutions/me) | 🔴 Crítica |
| Empleos (CRUD) | 5 (lectura) | 3 (POST/PUT/DELETE) | 🔴 Crítica |
| Comunidad | 6 | 6 (CRUD posts, grupos) | 🟡 Alta |
| Reseñas | 3 | 2 (DELETE/PUT propias) | 🟡 Alta |
| Estadísticas Comunidad | 0 | 1 (GET /community/stats) | 🟡 Media |
| Notificaciones | 3 | 2 (DELETE) | 🟢 Baja |
| Mensajes | 4 | 2 (DELETE, PATCH read) | 🟢 Baja |

### Totales
- **Endpoints existentes consumidos:** 53
- **Endpoints faltantes identificados:** 19
- **Inconsistencias de datos:** 6

### Acciones Inmediatas Recomendadas
1. **Implementar** `POST /users/avatar` — Sin esto, el avatar del usuario nunca se mostrará
2. **Crear** página `InstitutionPortalPage.jsx` y sus hooks — Los usuarios con rol `institution` no tienen a dónde ir
3. **Corregir** `user?.name` → `user?.full_name` en `SocialPage.jsx` — Bug visible ahora
4. **Unificar** `useProfile` y `useUpdateProfile` en un solo archivo — Evitar confusión y duplicación
