# 📋 Estado de Consumo de Endpoints — Raíces para Florecer

> Última actualización: 27 de julio de 2026
> Comparación entre la documentación de la API (Swagger) y el consumo real del frontend.

---

## ✅ Endpoints CONSUMIDOS (con vista funcional)

| Endpoint | Método | Hook | Página | Estado |
|----------|--------|------|--------|--------|
| `/autenticacion/inicio-sesion` | POST | `useAuth` | AuthPage | ✅ Funcional |
| `/autenticacion/registro` | POST | `useRegister` | AuthPage | ✅ Funcional |
| `/autenticacion/renovar-token` | POST | `useSessionVerify` | (automático) | ✅ Funcional |
| `/autenticacion/yo` | GET | `useSessionVerify` | (automático) | ✅ Funcional |
| `/usuarios/perfil` | GET | `useProfile` | ProfilePage | ✅ Funcional |
| `/usuarios/perfil` | PUT | `useUpdateProfile` | ProfilePage | ✅ Funcional |
| `/usuarios/avatar` | POST | `useUploadAvatar` | ProfilePage | ✅ Funcional |
| `/usuarios/avatar` | DELETE | `useDeleteAvatar` | ProfilePage | ✅ Funcional |
| `/usuarios/perfil-necesidades` | POST | `useUpdateNeedsProfile` | OnboardingPage | ✅ Funcional |
| `/usuarios/dependientes` | GET | `useDependientes` | TutorPage | ✅ Funcional |
| `/usuarios/dependientes` | POST | `useAddDependiente` | TutorPage | ✅ Funcional |
| `/usuarios/dependientes/{id}` | GET | `useDependiente` | TutorPage | ✅ Funcional |
| `/usuarios/dependientes/{id}` | PUT | `useUpdateDependent` | TutorPage | ✅ Funcional |
| `/usuarios/dependientes/{id}` | DELETE | `useDeleteDependent` | TutorPage | ✅ Funcional |
| `/instituciones` | GET | `useInstitutionList` | ExplorePage | ✅ Funcional |
| `/instituciones` | POST | `useCreateInstitution` | CrearInstitucionPage | ✅ Funcional |
| `/instituciones/{id}` | GET | `useInstitutionDetail` | InstitutionPage | ✅ Funcional |
| `/instituciones/{id}` | PUT | `useUpdateInstitution` | InstitutionPage | ✅ Funcional |
| `/instituciones/{id}` | DELETE | `useDeleteInstitution` | InstitutionPage | ✅ Funcional |
| `/instituciones/mi-institucion` | GET | `useMyInstitution` | MiInstitucionPage | ⚠️ Hook existe, falta UI |
| `/instituciones/mi-institucion` | PUT | `useUpdateMyInstitution` | MiInstitucionPage | ⚠️ Hook existe, falta UI |
| `/favoritos` | GET | `useFavorites` | FavoritesPage | ✅ Funcional |
| `/favoritos/ids` | GET | `useFavoriteIds` | (global) | ✅ Funcional |
| `/favoritos/{id}/alternar` | POST | `useToggleFavorite` | ExplorePage/InstitutionPage | ✅ Funcional |
| `/resenas/institucion/{id}` | GET | `useReviews` | InstitutionPage | ✅ Funcional |
| `/resenas/institucion/{id}` | POST | `useCreateReview` | InstitutionPage | ✅ Funcional |
| `/resenas/mias` | GET | `useMyReviews` | ⚠️ Pendiente | ❌ Sin UI |
| `/resenas/{id}` | PUT | `useUpdateReview` | InstitutionPage | ✅ Funcional |
| `/resenas/{id}` | DELETE | `useDeleteReview` | InstitutionPage | ✅ Funcional |
| `/descubrimiento` | GET | `useDiscovery` | DashboardPage | ✅ Funcional |
| `/empleo` | GET | `useJobs` | JobsPage | ✅ Funcional |
| `/empleo/{id}` | GET | `useJobDetail` | JobsPage | ✅ Funcional |
| `/empleo` | POST | `useCreateJob` | JobsPage | ✅ Funcional |
| `/empleo/{id}` | PUT | `useUpdateJob` | JobsPage | ✅ Funcional |
| `/empleo/{id}` | DELETE | `useDeleteJob` | JobsPage | ✅ Funcional |
| `/empleo/postuladas` | GET | `useAppliedJobIds` | JobsPage | ✅ Funcional |
| `/empleo/mis-postulaciones` | GET | `useMyApplications` | JobsPage | ✅ Funcional |
| `/empleo/{id}/postularse` | POST | `useApplyToJob` | JobsPage | ✅ Funcional |
| `/comunidad/grupos` | GET | `useGroups` | SocialPage | ✅ Funcional |
| `/comunidad/grupos` | POST | `useCreateGroup` | SocialPage | ✅ Funcional |
| `/comunidad/publicaciones` | GET | `usePosts` | SocialPage | ✅ Funcional |
| `/comunidad/publicaciones` | POST | `useCreatePost` | SocialPage | ✅ Funcional |
| `/comunidad/publicaciones/{id}/comentarios` | GET | `useComments` | SocialPage | ✅ Funcional |
| `/comunidad/publicaciones/{id}/comentarios` | POST | `useCreateComment` | SocialPage | ✅ Funcional |
| `/comunidad/publicaciones/{id}/me-gusta` | POST | `useToggleLike` | SocialPage | ✅ Funcional |
| `/comunidad/publicaciones/{id}` | PUT | `useUpdatePost` | SocialPage | ✅ Funcional |
| `/comunidad/publicaciones/{id}` | DELETE | `useDeletePost` | SocialPage | ✅ Funcional |
| `/comunidad/grupos/{id}/unirse` | POST | `useJoinGroup` | SocialPage | ✅ Funcional |
| `/comunidad/grupos/{id}/salir` | POST | `useLeaveGroup` | SocialPage | ✅ Funcional |
| `/comunidad/estadisticas` | GET | `useCommunityStats` | SocialPage | ✅ Funcional |
| `/notificaciones` | GET | `useNotifications` | NotificationsPage | ✅ Funcional |
| `/notificaciones/{id}/leer` | PATCH | `useMarkRead` | NotificationsPage | ✅ Funcional |
| `/notificaciones/leer-todas` | PATCH | `useMarkAllRead` | NotificationsPage | ✅ Funcional |
| `/ia/conversacion` | POST | `useChat` | TutorPage | ✅ Funcional |
| `/ia/recomendaciones` | POST | `useAINextSteps` | TutorPage | ✅ Funcional |
| `/mensajes/conversaciones` | GET | `useConversations` | SocialPage | ✅ Funcional |
| `/mensajes/con/{userId}` | GET | `useMessagesWith` | SocialPage | ✅ Funcional |
| `/mensajes/no-leidos` | GET | `useUnreadCount` | SocialPage | ✅ Funcional |
| `/mensajes/enviar/{userId}` | POST | `useSendMessage` | SocialPage | ✅ Funcional |
| `/administracion/estadisticas` | GET | `useAdminStats` | AdminPage | ✅ Funcional |
| `/administracion/analiticas` | GET | `useAdminDetailedAnalytics` | AdminPage | ✅ Funcional |
| `/administracion/inteligencia-necesidades` | GET | `useAdminNeedsIntelligence` | AdminPage | ✅ Funcional |
| `/administracion/instituciones` | GET | `useAllInstitutions` | AdminPage | ✅ Funcional |
| `/administracion/instituciones/pendientes` | GET | `usePendingInstitutions` | AdminPage | ✅ Funcional |
| `/administracion/instituciones/{id}/aprobar` | POST | `useApproveInstitution` | AdminPage | ✅ Funcional |
| `/administracion/instituciones/{id}/verificar` | PATCH | `useToggleVerification` | AdminPage | ✅ Funcional |
| `/administracion/instituciones/{id}` | DELETE | `useDeleteInstitution` | AdminPage | ✅ Funcional |
| `/administracion/usuarios` | GET | `useAdminUsers` | AdminPage | ✅ Funcional |
| `/administracion/usuarios/{id}/activo` | PATCH | `useToggleActiveUser` | AdminPage | ✅ Funcional |
| `/administracion/usuarios/{id}/rol` | PATCH | `useChangeUserRole` | AdminPage | ✅ Funcional |
| `/administracion/usuarios/{id}` | DELETE | `useDeleteUser` | AdminPage | ✅ Funcional |
| `/administracion/resenas` | GET | `useAdminReviews` | AdminPage | ✅ Funcional |
| `/administracion/resenas/{id}` | DELETE | `useDeleteReview` | AdminPage | ✅ Funcional |
| `/administracion/alertas` | GET | `useAdminAlerts` | AdminPage | ✅ Funcional |
| `/administracion/configuracion` | GET | `useAdminSettings` | AdminPage | ✅ Funcional |
| `/administracion/configuracion` | PUT | `useUpdateSettings` | AdminPage | ✅ Funcional |

---

## ❌ Endpoints NO CONSUMIDOS (faltan en el frontend)

| Endpoint | Método | Descripción | Prioridad |
|----------|--------|-------------|-----------|
| `/usuarios/perfil-necesidades` (GET) | GET | Obtener perfil de necesidades guardado | Media |
| `/resenas/mias` | GET | Ver mis reseñas con paginación | Media |
| `/empleo/{id}` | DELETE | Eliminar vacante (el frontend usa soft-delete) | Baja |
| `/comunidad/grupos/{id}` | DELETE | Eliminar grupo | Baja |
| `/comunidad/publicaciones/{id}` | DELETE | Ya existe pero sin UI de confirmación | Baja |

---

## ⚠️ Endpoints CON CONEXIÓN pero SIN VISTA/ UI

| Endpoint | Hook | Página necesaria | Prioridad |
|----------|------|------------------|-----------|
| `/instituciones/mi-institucion` (GET/PUT) | `useMyInstitution` | **MiInstitucionPage** — Panel para que la institución gestione su perfil | Alta |
| `/resenas/mias` | `useMyReviews` | **MyReviewsPage** — Ver/editar/eliminar reseñas propias | Media |
| `/notificaciones/flujo` | `useNotificationStream` | Deshabilitado (backend devuelve 401) | Baja |

---

## 🔧 Problemas conocidos y fixes pendientes

| Problema | Archivo | Estado |
|----------|---------|--------|
| `reviews.map is not a function` — API devuelve paginado `{datos:[]}` | useReviews.js, useAdmin.js | ✅ Corregido |
| `jobs.map is not a function` — API devuelve paginado | useJobs.js | ✅ Corregido |
| Grupos no aparecen — campos en español vs inglés | useCommunity.js | ✅ Corregido |
| SSE stream 401 — endpoint no implementado en backend | useNotifications.js | ✅ Deshabilitado |
| `staleTime: 5min` — datos no refrescan al navegar | queryClient.js | ✅ Corregido (staleTime: 0) |
| Settings keys — API usa español, frontend usa inglés | useAdminSettings | ⚠️ Pendiente |

---

## 📊 Resumen

| Métrica | Cantidad |
|---------|----------|
| Endpoints totales en API | ~65 |
| Endpoints consumidos en frontend | 58 |
| Endpoints sin UI propia | 3 |
| Endpoints no consumidos | 5 |
| **Cobertura total** | **~89%** |

---

## 🎯 Próximos pasos recomendados

1. **Crear MiInstitucionPage** — Para que las instituciones gestionen su propio perfil
2. **Crear MyReviewsPage** — Para que los usuarios vean y administren sus reseñas
3. **Corregir mapeo de campos** — Normalizar español ↔ inglés en todos los hooks (como se hizo con `mapGroup`)
4. **Crear función helper `extractArray`** — Para eliminar la duplicación del patrón `Array.isArray`
5. **Reactivar SSE** — Cuando el backend implemente `/notificaciones/flujo` correctamente
6. **Manejo de paginación** — Agregar UI de paginación cuando hay más de 20 resultados
