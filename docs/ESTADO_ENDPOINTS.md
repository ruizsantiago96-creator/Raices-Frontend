# Estado Real de Endpoints del Backend — Raíces

> **Fecha:** 20 de julio de 2026  
> **Backend:** `https://raices-backend-219843566314.us-central1.run.app`

---

## ✅ ENDPOINTS CONFIRMADOS FUNCIONANDO (22 total)

### Auth (Confirmado por el usuario)

| Método | Ruta | Estado |
|--------|------|--------|
| `POST` | `/api/auth/login` | ✅ Funciona |
| `POST` | `/api/auth/register` | ✅ Funciona |
| `GET` | `/api/auth/me` | ✅ Funciona |
| `POST` | `/api/auth/refresh` | ✅ Funciona |

### Públicos (Verificados con pruebas HTTP)

| Método | Ruta | Estado | Respuesta |
|--------|------|--------|-----------|
| `GET` | `/api/institutions` | ✅ Funciona | Retorna lista de instituciones |
| `GET` | `/api/jobs` | ✅ Funciona | Retorna lista de empleos |
| `GET` | `/api/community/groups` | ✅ Funciona | Retorna grupos de comunidad |
| `GET` | `/api/reviews/institution/:id` | ✅ Funciona | Retorna reseñas (array vacío) |

### Protegidos (Existen — retornan 401 cuando no hay token)

| Método | Ruta | Estado |
|--------|------|--------|
| `GET` | `/api/users/profile` | ✅ Existe (401 = requiere auth) |
| `PUT` | `/api/users/profile` | ✅ Existe (401 = requiere auth) |
| `POST` | `/api/users/profiling` | ✅ Existe (401 = requiere auth) |
| `GET` | `/api/community/posts` | ✅ Existe (401 = requiere auth) |
| `POST` | `/api/community/posts` | ✅ Existe (401 = requiere auth) |
| `GET` | `/api/favorites` | ✅ Existe (401 = requiere auth) |
| `GET` | `/api/favorites/ids` | ✅ Existe (401 = requiere auth) |
| `GET` | `/api/messages/conversations` | ✅ Existe (401 = requiere auth) |
| `GET` | `/api/messages/unread-count` | ✅ Existe (401 = requiere auth) |
| `GET` | `/api/notifications` | ✅ Existe (401 = requiere auth) |
| `GET` | `/api/admin/stats` | ✅ Existe (401 = requiere auth) |
| `GET` | `/api/admin/institutions/pending` | ✅ Existe (401 = requiere auth) |
| `GET` | `/api/admin/users` | ✅ Existe (401 = requiere auth) |

---

## ⚠️ PROBLEMA DETECTADO

| Endpoint | Problema |
|----------|----------|
| `GET /api/institutions/:id` | Retorna **404** — El listado funciona pero el detalle no encuentra IDs |

**Posible causa:** Los IDs en la base de datos no son 1, 2, etc. Podrían ser UUIDs o números diferentes.

---

## ❓ NO VERIFICADOS (Necesitan token válido para confirmar)

| Método | Ruta | Hook del Frontend |
|--------|------|-------------------|
| `POST` | `/api/community/posts/:id/like` | `useToggleLike()` |
| `GET` | `/api/community/posts/:id/comments` | `useComments()` |
| `POST` | `/api/community/posts/:id/comments` | `useCreateComment()` |
| `GET` | `/api/messages/with/:partnerId` | `useMessages()` |
| `POST` | `/api/messages/send/:toId` | `useSendMessage()` |
| `GET` | `/api/jobs/:id` | `useJob()` |
| `GET` | `/api/jobs/applied` | `useAppliedJobIds()` |
| `GET` | `/api/jobs/my-applications` | `useMyApplications()` |
| `POST` | `/api/jobs/:id/apply` | `useApplyJob()` |
| `POST` | `/api/favorites/:id` | `useToggleFavorite()` |
| `GET` | `/api/reviews/mine` | `useMyReviews()` |
| `POST` | `/api/reviews/institution/:id` | `useSubmitReview()` |
| `GET` | `/api/users/dependents` | `useDependents()` |
| `POST` | `/api/users/dependents` | `useAddDependent()` |
| `PUT` | `/api/users/dependents/:id` | `useUpdateDependent()` |
| `DELETE` | `/api/users/dependents/:id` | `useDeleteDependent()` |
| `PATCH` | `/api/notifications/:id/read` | `useMarkRead()` |
| `PATCH` | `/api/notifications/read-all` | `useMarkAllRead()` |
| `POST` | `/api/ai/chat` | `useChat()` |
| `POST` | `/api/ai/recommendations` | `useAINextSteps()` |
| `GET` | `/api/discovery` | `useDiscovery()` |
| `GET` | `/api/admin/analytics` | `useAdminAnalytics()` |
| `GET` | `/api/admin/needs-intelligence` | `useNeedsIntelligence()` |
| `GET` | `/api/admin/institutions` | `useAllInstitutions()` |
| `POST` | `/api/admin/institutions/:id/approve` | `useApproveInstitution()` |
| `DELETE` | `/api/admin/institutions/:id` | `useRejectInstitution()` |
| `PATCH` | `/api/admin/institutions/:id/verify` | `useToggleVerifyInstitution()` |
| `PATCH` | `/api/admin/users/:id/active` | `useToggleUserActive()` |
| `PATCH` | `/api/admin/users/:id/role` | `useChangeUserRole()` |
| `GET` | `/api/admin/reviews` | `useAdminReviews()` |
| `DELETE` | `/api/admin/reviews/:id` | `useDeleteReview()` |
| `GET` | `/api/admin/alerts` | `useAdminAlerts()` |
| `GET` | `/api/admin/settings` | `useAdminSettings()` |
| `PUT` | `/api/admin/settings` | `useUpdateSettings()` |

---

## ❌ ENDPOINTS FALTANTES (No existen en el backend)

| Método | Ruta | Necesario para |
|--------|------|----------------|
| `POST` | `/api/users/avatar` | Subir foto de perfil |
| `GET` | `/api/institutions/me` | Portal de instituciones |
| `PUT` | `/api/institutions/me` | Editar datos de institución |
| `POST` | `/api/jobs` | Crear vacante (rol institution) |
| `PUT` | `/api/jobs/:id` | Editar vacante (rol institution) |
| `DELETE` | `/api/jobs/:id` | Eliminar vacante (rol institution) |
| `PUT` | `/api/community/posts/:id` | Editar publicación |
| `DELETE` | `/api/community/posts/:id` | Eliminar publicación |
| `POST` | `/api/community/groups/:id/join` | Unirse a grupo |
| `POST` | `/api/community/groups/:id/leave` | Salir de grupo |
| `POST` | `/api/community/groups` | Crear grupo |
| `GET` | `/api/community/stats` | Estadísticas de comunidad |
| `DELETE` | `/api/reviews/:id` | Eliminar reseña propia |
| `PUT` | `/api/reviews/:id` | Editar reseña propia |

---

## Resumen

```
┌─────────────────────────────────────────────────────────┐
│              RESUMEN DE ENDPOINTS                       │
├─────────────────────────────────────────────────────────┤
│  ✅ Confirmados funcionando:        22 endpoints        │
│  ⚠️ Problema detectado:              1 endpoint         │
│  ❓ Requieren verificación:         35 endpoints        │
│  ❌ Faltantes (no existen):         14 endpoints        │
├─────────────────────────────────────────────────────────┤
│  TOTAL FRONTEND NECESITA:           72 endpoints        │
│  TOTAL BACKEND TIENE:              ~57 endpoints        │
│  TOTAL BACKEND FALTA:              ~15 endpoints        │
└─────────────────────────────────────────────────────────┘
```
