# Consumo de Endpoints API - Raíces para Florecer
**Fecha:** 27 de Julio, 2026  
**Backend:** https://raices-backend-219843566314.us-central1.run.app

---

## Resumen de Cambios

Se actualizaron **10 archivos de hooks** y **3 páginas de UI** para alinear todos los paths de la API con la documentación Swagger (paths en español).

---

## Archivos Modificados

### Hooks (Corrección de paths + nuevos endpoints)

| Archivo | Cambios Realizados |
|---------|-------------------|
| `useFavorites.js` | `/favorites` → `/favoritos`, toggle a `/favoritos/{id}/alternar` |
| `useReviews.js` | `/reviews` → `/resenas`, + `useUpdateReview`, `useDeleteReview` |
| `useCommunity.js` | `/community` → `/comunidad`, + `useCreateGroup`, `useJoinGroup`, `useLeaveGroup`, `useUpdatePost`, `useDeletePost`, `useCommunityStats` |
| `useNotifications.js` | `/notifications` → `/notificaciones`, stream a `/notificaciones/flujo` |
| `useAdmin.js` | `/admin/*` → `/administracion/*`, + `useDeleteUser`, `useAdminDetailedAnalytics` |
| `useAI.js` | `/ai` → `/ia`, body `dependienteId` |
| `useJobs.js` | `/jobs` → `/empleo`, + `useCreateJob`, `useUpdateJob`, `useDeleteJob` |
| `useMessages.js` | `/messages` → `/mensajes`, body `contenido` |
| `useInstitutions.js` | `/discovery` → `/descubrimiento`, + `useMiInstitucion`, `useUpdateMiInstitucion`, `useUpdateInstitution`, `useDeleteInstitution` |
| `useDependientes.js` | + `useDependiente` (GET `/usuarios/dependientes/{id}`) |

### UI (Nuevos componentes)

| Archivo | Nuevos Features |
|---------|----------------|
| `SocialPage.jsx` | Modal crear grupo, editar/eliminar posts, botón unirse/salir grupo |
| `InstitutionPage.jsx` | Editar/eliminar reseñas (para el autor) |
| `JobsPage.jsx` | Modal crear vacante (para instituciones/admin) |

---

## Mapeo de Endpoints

### ✅ Endpoints Corregidos

| API Endpoint | Path Anterior (Frontend) | Path Correcto |
|---|---|---|
| `GET /api/favoritos` | `/favorites` | `/favoritos` |
| `GET /api/favoritos/ids` | `/favorites/ids` | `/favoritos/ids` |
| `POST /api/favoritos/{id}/alternar` | `/favorites/{id}` | `/favoritos/{id}/alternar` |
| `GET /api/resenas/institucion/{id}` | `/reviews/institution/{id}` | `/resenas/institucion/{id}` |
| `GET /api/resenas/mias` | `/reviews/mine` | `/resenas/mias` |
| `GET /api/comunidad/grupos` | `/community/groups` | `/comunidad/grupos` |
| `GET /api/comunidad/publicaciones` | `/community/posts` | `/comunidad/publicaciones` |
| `POST /api/comunidad/publicaciones/{id}/me-gusta` | `/community/posts/{id}/like` | `/comunidad/publicaciones/{id}/me-gusta` |
| `GET /api/notificaciones` | `/notifications` | `/notificaciones` |
| `PATCH /api/notificaciones/{id}/leer` | `/notifications/{id}/read` | `/notificaciones/{id}/leer` |
| `GET /api/administracion/instituciones/pendientes` | `/administracion/instituciones/pending` | `/administracion/instituciones/pendientes` |
| `POST /api/administracion/instituciones/{id}/aprobar` | `/administracion/instituciones/{id}/approve` | `/administracion/instituciones/{id}/aprobar` |
| `PATCH /api/administracion/instituciones/{id}/verificar` | `/administracion/instituciones/{id}/verify` | `/administracion/instituciones/{id}/verificar` |
| `GET /api/administracion/resenas` | `/admin/reviews` | `/administracion/resenas` |
| `GET /api/administracion/alertas` | `/admin/alerts` | `/administracion/alertas` |
| `GET /api/administracion/configuracion` | `/admin/settings` | `/administracion/configuracion` |
| `POST /api/ia/conversacion` | `/ai/chat` | `/ia/conversacion` |
| `POST /api/ia/recomendaciones` | `/ai/recommendations` | `/ia/recomendaciones` |
| `GET /api/empleo` | `/jobs` | `/empleo` |
| `GET /api/empleo/postuladas` | `/jobs/applied` | `/empleo/postuladas` |
| `GET /api/empleo/mis-postulaciones` | `/jobs/my-applications` | `/empleo/mis-postulaciones` |
| `POST /api/empleo/{id}/postularse` | `/jobs/{id}/apply` | `/empleo/{id}/postularse` |
| `GET /api/mensajes/conversaciones` | `/messages/conversations` | `/mensajes/conversaciones` |
| `GET /api/mensajes/no-leidos` | `/messages/unread-count` | `/mensajes/no-leidos` |
| `GET /api/mensajes/con/{userId}` | `/messages/with/{partnerId}` | `/mensajes/con/{userId}` |
| `POST /api/mensajes/enviar/{userId}` | `/messages/send/{toId}` | `/mensajes/enviar/{userId}` |
| `GET /api/descubrimiento` | `/discovery` | `/descubrimiento` |

### ✅ Nuevos Endpoints Agregados

| API Endpoint | Hook | Estado |
|---|---|---|
| `PUT /api/resenas/{id}` | `useUpdateReview` | ✅ Implementado |
| `DELETE /api/resenas/{id}` | `useDeleteReview` | ✅ Implementado |
| `POST /api/comunidad/grupos` | `useCreateGroup` | ✅ Implementado |
| `POST /api/comunidad/grupos/{id}/unirse` | `useJoinGroup` | ✅ Implementado |
| `POST /api/comunidad/grupos/{id}/salir` | `useLeaveGroup` | ✅ Implementado |
| `PUT /api/comunidad/publicaciones/{id}` | `useUpdatePost` | ✅ Implementado |
| `DELETE /api/comunidad/publicaciones/{id}` | `useDeletePost` | ✅ Implementado |
| `GET /api/comunidad/estadisticas` | `useCommunityStats` | ✅ Implementado |
| `DELETE /api/administracion/usuarios/{id}` | `useDeleteUser` | ✅ Implementado |
| `GET /api/administracion/analiticas` | `useAdminDetailedAnalytics` | ✅ Implementado |
| `POST /api/empleo` | `useCreateJob` | ✅ Implementado |
| `PUT /api/empleo/{id}` | `useUpdateJob` | ✅ Implementado |
| `DELETE /api/empleo/{id}` | `useDeleteJob` | ✅ Implementado |
| `GET /api/instituciones/mi-institucion` | `useMiInstitucion` | ✅ Implementado |
| `PUT /api/instituciones/mi-institucion` | `useUpdateMiInstitucion` | ✅ Implementado |
| `PUT /api/instituciones/{id}` | `useUpdateInstitution` | ✅ Implementado |
| `DELETE /api/instituciones/{id}` | `useDeleteInstitution` | ✅ Implementado |
| `GET /api/usuarios/dependientes/{id}` | `useDependiente` | ✅ Implementado |

---

## Recomendaciones de Mejora

### 🔴 Prioridad Alta

1. **Verificar nombres de campos en la API**
   - `group.is_member` podría ser `group.es_miembro` (patrón español)
   - `post.author_id` podría ser `post.autor_id` o `post.usuario_id`
   - **Acción:** Hacer un `console.log` de la respuesta real de la API para verificar

2. **Agregar manejo de errores consistente**
   - Algunos hooks usan `onError` y otros no
   - Crear un interceptor centralizado en `api.js` para manejar errores comunes
   - **Acción:** Agregar toast de error automático en el interceptor de axios

3. **Validación de formularios**
   - Los modales de crear grupo y crear vacante no tienen validación robusta
   - Agregar validación con `yup` o `zod` para formularios complejos
   - **Acción:** Instalar `zod` y crear schemas de validación

### 🟡 Prioridad Media

4. **Optimistic Updates**
   - Los mutations podrían usar optimistic updates para mejor UX
   - Ejemplo: al crear un post, agregarlo inmediatamente al feed sin esperar la respuesta
   - **Acción:** Implementar `onMutate` en los hooks de creación

5. **Paginación en listas**
   - `useReviews`, `usePosts`, `useCommunityStats` no implementan paginación
   - La API soporta `pagina` y `limite` como query params
   - **Acción:** Agregar infinite scroll o paginación por botones

6. **Cache de React Query**
   - Algunos hooks tienen `staleTime` y otros no
   - Establecer tiempos de caché consistentes según el tipo de dato:
     - Datos estáticos: 10 minutos
     - Datos semi-estáticos: 5 minutos
     - Datos dinámicos: 1 minuto
   - **Acción:** Crear un archivo de configuración de cache

7. **Loading States consistentes**
   - Algunos modales muestran "Creando..." pero no tienen spinner
   - Agregar componentes de loading reutilizables
   - **Acción:** Crear `components/LoadingSpinner.jsx`

### 🟢 Prioridad Baja

8. **Testing**
   - No hay tests para los nuevos hooks
   - Crear tests unitarios para cada hook con `@testing-library/react-hooks`
   - **Acción:** Instalar `@testing-library/react-hooks` y crear tests

9. **Documentación de hooks**
   - Los hooks nuevos no tienen JSDoc
   - Agregar documentación con `@param` y `@returns`
   - **Acción:** Agregar JSDoc a cada hook nuevo

10. **Tipado (TypeScript)**
    - El proyecto usa JavaScript pero podría beneficiarse de TypeScript
    - Al menos agregar `@types` para los props de los componentes
    - **Acción:** Evaluar migración a TypeScript gradual

---

## Deficiencias Encontradas

### 1. **Duplicación de código**
- `useAdminAnalytics` estaba duplicado (corregido)
- Los mapeadores de datos (`mapInstitucionAdmin`, `mapUsuarioAdmin`) están en `useAdmin.js` pero no son reutilizables
- **Solución:** Mover mapeadores a un archivo `utils/dataMappers.js`

### 2. **Inconsistencia en patrones de hooks**
- Algunos hooks reciben ID como parámetro: `useDeletePost(postId)`
- Otros lo reciben en `mutate()`: `useDeleteReview()`
- **Solución:** Estandarizar: ID siempre en `mutate()` para mayor flexibilidad

### 3. **Falta de validación de permisos en frontend**
- Cualquier usuario podría intentar editar/eliminar posts de otros
- El backend debería rechazar, pero el frontend debería ocultar los botones
- **Solución:** Verificar `author_id === user.id` antes de mostrar acciones (ya implementado parcialmente)

### 4. **Sin loading states en mutaciones**
- Algunos botones muestran "Creando..." pero otros no
- Falta deshabilitar botones durante mutaciones
- **Solución:** Usar `isPending` de React Query consistentemente

### 5. **Error handling inconsistente**
- Algunos `onError` muestran toast, otros no
- No hay retry automático en errores de red
- **Solución:** Crear wrapper `useMutationWithFeedback` que maneje todo automáticamente

### 6. **Sin optimistic updates**
- Al crear un post, el usuario espera a que el servidor responda
- Experiencia percibida lenta
- **Solución:** Implementar `onMutate` para actualizaciones optimistas

---

## Endpoints Pendientes (Sin UI)

| Endpoint | Hook | UI Necesaria |
|---|---|---|
| `PUT /api/instituciones/{id}` | `useUpdateInstitution` | Formulario de edición en InstitutionPage |
| `DELETE /api/instituciones/{id}` | `useDeleteInstitution` | Botón de eliminar con confirmación |
| `GET /api/instituciones/mi-institucion` | `useMiInstitucion` | Página "Mi Institución" |
| `PUT /api/instituciones/mi-institucion` | `useUpdateMiInstitucion` | Formulario de edición |
| `GET /api/comunidad/estadisticas` | `useCommunityStats` | Widget de estadísticas en sidebar |
| `DELETE /api/administracion/usuarios/{id}` | `useDeleteUser` | Botón en UsersTab del AdminPage |
| `GET /api/administracion/analiticas` | `useAdminDetailedAnalytics` | Pestaña de analíticas en AdminPage |

---

## Comandos Útiles

```bash
# Verificar build
npx vite build

# Iniciar servidor de desarrollo
npx vite --host

# Verificar lint
npx eslint src/

# Buscar imports no usados
npx eslint src/ --rule 'no-unused-vars: error'
```

---

## Configuración de Vite

```js
// vite.config.js
export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@features': '/src/features',
      '@shared': '/src/shared',
    },
  },
})
```
