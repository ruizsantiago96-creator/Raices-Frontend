# Análisis de Rutas y Datos — Backend vs Frontend

**Proyecto:** Raíces para Florecer
**Fecha:** 15 de octubre de 2026
**Alcance:** Rutas/endpoints del backend (NestJS), rutas del frontend (React Router), su correspondencia, y los datos actualmente inyectados en el backend (seed + knowledge base).

> Este documento responde a tres preguntas:
> 1. ¿Cómo funcionan las rutas en el **backend** y en el **frontend**?
> 2. ¿Lo que existe en el backend **coincide** con lo que consume el frontend?
> 3. ¿Qué **datos** tiene el backend hoy, en especial los inyectados para "entrenar" el motor de rutas/IA?

---

## 0. Resumen ejecutivo

| Aspecto | Resultado |
|---|---|
| Arquitectura de comunicación | El frontend **nunca** toca Firestore: todo pasa por la API REST de NestJS (`/api/*`). |
| Rutas backend | 22 controladores agrupados en ~20 módulos, **todas prefijadas con `/api`**. |
| Rutas frontend | 43 `Route` en `App.tsx` (11 públicas + 32 protegidas/redirects) + catch-all `*` → `/`. |
| Correspondencia general | **Alta.** Cada pantalla/función del frontend apunta a un endpoint real del backend. |
| Feature "Rutas de Desarrollo" | **Coincide al 100%** (11 de los 12 endpoints son consumidos por el frontend; solo `analytics` es exclusivo de admin, aún sin UI). |
| Discrepancias detectadas | 3 relevantes: llaves de `escalasVida` (prefijo `nivel*`), endpoints FCM inexistentes en backend, y `/rutas` + `/escalas-vida` sin guard de rol en el frontend. |
| Datos inyectados | 3 cuentas, 12 instituciones, 7 vacantes, 5 grupos, 8 configuraciones y **6 rutas expertas** (`rutasExpertos`) = el "dataset de entrenamiento". |

---

## 1. Panorama general

```
┌──────────────────────────┐        HTTPS + cookies httpOnly        ┌──────────────────────────┐
│  Frontend (React + Vite) │  ───────────────────────────────────▶  │  Backend (NestJS REST)   │
│  React Router + Axios    │  ◀───────────────────────────────────  │  prefijo global: /api    │
│  (navegador)             │        JSON (sin envoltorio)           │  Swagger en /docs         │
└──────────────────────────┘                                        └────────────┬─────────────┘
                                                                                 │ Admin SDK
                                                                                 ▼
                                                        ┌──────────────────────────────────────┐
                                                        │ Firebase: Auth · Firestore · Storage  │
                                                        │ Gemini/Vertex AI (IA) · FCM (previsto)│
                                                        └──────────────────────────────────────┘
```

- **Backend** = el cerebro. Única puerta a los datos. Aplica guards, validación, rate limiting, ETag y reglas de negocio.
- **Frontend** = React + Vite. Renderiza pantallas vía React Router y consume la API con un cliente Axios central (`src/shared/lib/api.ts`).

---

## 2. Rutas del backend (NestJS)

### 2.1 Cómo funcionan

1. **Punto de entrada** (`src/main.ts`):
   - `app.setGlobalPrefix('api')` → **toda** ruta queda bajo `/api`. Ej: el controlador `@Controller('rutas-desarrollo')` con `@Get()` se expone como `GET /api/rutas-desarrollo`.
   - `ValidationPipe({ whitelist: true, transform: true })` → valida y descarta campos no declarados en los DTOs.
   - `cookieParser()` + CORS con `credentials: true` → sesiones por cookie httpOnly.
   - `GlobalExceptionFilter` → errores con logs estructurados (JSON) para Cloud Logging.
   - Swagger en `/docs` (fuera de `/api`) y archivos estáticos en `/uploads`.
   - Puerto por defecto: **7000**.

2. **Composición por módulos** (`src/app.module.ts`): cada feature es un módulo NestJS con su `Controller` → `Service` → Firestore. Los guards globales de rate limiting (`CustomThrottlerGuard`) se aplican a todo.

3. **Guards y decoradores de ruta** (se aplican por controlador/endpoint):
   - `JwtAuthGuard` → exige JWT válido (Bearer o cookie).
   - `RolesGuard` + `@Roles('admin' | 'tutor' | 'institution' | 'empresa' | ...)` → autorización por rol.
   - `FeatureGuard` → habilita/deshabilita features por usuario (chat, comunidad, favoritos, etc.).
   - `@Throttle(...)` → límites por endpoint (los sensibles usan límites propios).
   - `@UseETag()` → caché condicional (respuestas `304`) sobre GETs costosos.
   - `throttlePorEntorno(...)` → límite distinto en prod vs dev.

4. **Convención de datos:** las respuestas van **sin envoltorio** `{ exito, mensaje, datos }`; se devuelve el recurso directo. Excepción: el módulo `seed` y algún endpoint legacy devuelven `{ success, message, data }`.

### 2.2 Módulos y prefijos de ruta

| Módulo | Prefijo (`/api` + …) | Notas |
|---|---|---|
| Auth | `/autenticacion` | registro, login, renovar token, logout, `yo` |
| Users | `/usuarios` | perfil, dependientes, escalas, documentos, avatar |
| Tutores | `/tutores` | permisos de dependientes (rol tutor) |
| Institutions | `/instituciones` | CRUD, CSF-QR, verificación, servicios/inscripciones |
| Discovery | `/descubrimiento` | búsqueda inteligente |
| Jobs | `/empleo` | vacantes, postulaciones, postulantes |
| Community | `/comunidad` | posts, grupos, foros, eventos, galería |
| Messages | `/mensajes` | conversaciones, envío, no leídos |
| Favorites | `/favoritos` | toggle + listado |
| Reviews | `/resenas` | CRUD + recálculo de promedio |
| Notifications | `/notificaciones` | listar, marcar leído |
| Admin | `/administracion` | estadísticas, usuarios, instituciones, auditoría, config |
| AI | `/ia` | chat, recomendaciones, resumen, validación de usuario |
| Recommendations | `/usuarios` | `interacciones`, `recomendaciones`, `onboarding`, `especialistas` |
| Catalogs | `/catalogos` | catálogos públicos de referencia |
| Storage | `/multimedia` | subida de archivos (magic bytes) |
| **Routes** | **`/rutas-desarrollo`** | **rutas de desarrollo + pasos + progreso** |
| Onboarding | `/onboarding` | estado, borrador, completar |
| Contacto | `/contacto` | formulario de contacto |
| Health | `/health` | healthcheck Cloud Run (+ `simular-error-500`) |
| Seed | `/seed` | siembra de instituciones desde CSV |

### 2.3 Inventario completo de endpoints (191 handlers)

<details>
<summary>Ver inventario por controlador</summary>

**`/api/autenticacion` (6):** `POST registro`, `POST inicio-sesion`, `POST renovar-token`, `POST cerrar-sesion`, `POST cerrar-sesion-global`, `GET yo`

**`/api/usuarios` (Users ~24):** `GET perfil`, `GET buscar`, `GET perfil-pcd/:pcdUserId`, `PUT perfil`, `PUT perfil-necesidades`, `PATCH perfil-necesidades`, `PUT :id`, `POST avatar`, `DELETE avatar`, `POST perfil-necesidades`, **`POST escalas-vida`**, `POST documento-identidad`, `GET estado-validacion-identidad`, `GET dependientes/count`, `GET dependientes`, `GET mis-personas`, `POST dependientes`, `GET dependientes/:dependienteId/permisos`, `GET dependientes/:id`, `PUT dependientes/:id`, `DELETE dependientes/:id`, `POST vincular-pcd`, `PATCH dependientes/:dependienteId/features`, `PUT/PATCH dependientes/:dependienteId/permisos`, `PATCH vincular-pcd/:pcdId/features`, `PUT dependientes/:id/features`, `PUT pcd-vinculado/:pcdUserId/features`, `DELETE pcd-vinculado/:pcdUserId/desvincular`, `DELETE cuenta`

**`/api/usuarios` (Recommendations, 5):** `POST interacciones`, `GET interacciones/pesos`, `GET recomendaciones`, `GET onboarding`, `GET especialistas`

**`/api/tutores` (3):** `GET/PUT/PATCH dependientes/:dependienteId/permisos`

**`/api/instituciones` (~21):** `POST validar-csf-qr`, `POST verificacion/documentos`, `GET mi-institucion/estado-verificacion`, `GET/PUT/DELETE mi-institucion`, `GET` (catálogo), `GET :id/detalle`, `GET :id`, `GET mi-institucion/servicios/inscripciones/resumen`, `GET :id/mis-inscripciones`, `POST/GET/DELETE :id/servicios/:servicioId/inscripcion`, `GET :id/servicios/:servicioId/inscripciones`, `POST .../:inscripcionId/aprobar`, `POST .../:inscripcionId/rechazar`, `POST`, `PUT :id`, `DELETE :id`

**`/api/empleo` (~13):** `GET`, `GET postuladas`, `GET mis-postulaciones`, `POST`, `PUT :id`, `DELETE :id`, `GET postulantes-institucion`, `GET postulantes-vacante`, `GET mis-vacantes`, `GET postulaciones`, `GET :id`, `POST :id/postularse`, `PATCH postulaciones/:id/estado`

**`/api/comunidad` (~24):** grupos, publicaciones (GET/POST/PUT/DELETE), `feed-mixto`, comentarios, `me-gusta`, `grupos` (+ unirse/salir), `estadisticas`, `miembros`, `foros` (+ respuestas), `eventos` (+ asistir), `conectemos/publicaciones`, `galeria`

**`/api/mensajes` (6):** `GET conversaciones`, `GET no-leidos`, `GET con/:userId`, `POST enviar/:userId`, `PATCH leer/:userId`, `DELETE conversaciones/:userId`

**`/api/favoritos` (3):** `GET`, `GET ids`, `POST :institutionId/alternar`

**`/api/resenas` (5):** `GET institucion/:id`, `GET mias`, `PUT :id`, `DELETE :id`, `POST institucion/:id`

**`/api/notificaciones` (3):** `GET`, `PATCH :id/leer`, `PATCH leer-todas`
> ⚠️ No existe `POST/DELETE /notificaciones/fcm-token` (ver §4.4).

**`/api/administracion` (~30):** estadísticas, analíticas, inteligencia-necesidades, visitantes-activos, auditoría (+estadísticas), instituciones (listar/pendientes/verificación/aprobar/verificar/eliminar), usuarios (listar/activo/rol/editar/eliminar/purgar), reseñas (+eliminar), alertas, configuración (GET/PUT), documentos-identidad (pendientes/aprobar/rechazar)

**`/api/ia` (6):** `POST conversacion`, `POST recomendaciones`, `POST resumen`, `POST validar-usuario/:id`, `PATCH validar-usuario/:id/override`, `GET validar-usuario/:id/historial`

**`/api/catalogos` (12):** `GET` (agregado), `parentescos`, `discapacidades`, `etapas-vida`, `features`, `categorias`, `temporalidad-origen`, `preferencia-formato`, `areas-interes`, `viabilidad-economica`, `subcategorias-comunidad`, `tono-contextual`

**`/api/multimedia` (1):** `POST` (upload)

**`/api/rutas-desarrollo` (11):** ver §2.4

**`/api/onboarding` (3):** `GET estado`, `POST borrador`, `POST completar`

**`/api/contacto` (1):** `POST`

**`/api/health` (2):** `GET`, `GET simular-error-500`

**`/api/seed` (1):** `GET institutions`

</details>

### 2.4 Módulo "Rutas de Desarrollo" (foco del análisis)

Controlador: `src/modules/routes/routes.controller.ts` · Servicios: `routes.service.ts`, `knowledge-base.service.ts`, `routes-analytics.service.ts`.

Guards: nivel controlador `@UseGuards(JwtAuthGuard)` → **todos** los endpoints requieren sesión.

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| GET | `/api/rutas-desarrollo` | Listar mis rutas (filtros `estado`, `areaInteres`) | autenticado |
| GET | `/api/rutas-desarrollo/resumen` | KPIs: total, activas, completadas, pausadas, progreso promedio | autenticado |
| GET | `/api/rutas-desarrollo/mi-ruta` | Ruta activa + paso actual + entidades locales (instituciones/vacantes) | autenticado |
| GET | `/api/rutas-desarrollo/analytics` | Métricas agregadas | **admin** |
| GET | `/api/rutas-desarrollo/:id` | Detalle de una ruta con sus pasos | autenticado (dueño) |
| POST | `/api/rutas-desarrollo` | Crear ruta | autenticado |
| PUT | `/api/rutas-desarrollo/:id` | Actualizar ruta | autenticado (dueño) |
| DELETE | `/api/rutas-desarrollo/:id` | Eliminar ruta + pasos | autenticado (dueño) |
| POST | `/api/rutas-desarrollo/generar-personalizada` | Genera (o retorna) la ruta personalizada | autenticado |
| POST | `/api/rutas-desarrollo/:id/pasos` | Agregar paso/hito | autenticado (dueño) |
| PATCH | `/api/rutas-desarrollo/:rutaId/pasos/:pasoId/completar` | Marcar paso completado | autenticado (dueño) |
| PATCH | `/api/rutas-desarrollo/:rutaId/pasos/:pasoId/descompletar` | Desmarcar paso | autenticado (dueño) |

> **Nota de implementación:** `analytics` está declarado **antes** de `:id` a propósito (Nest registra por orden; si `:id` fuera primero, capturaría `/analytics` y respondería 404).

**Flujo de `generar-personalizada` (Día Cero + Algoritmo Evolutivo):**
1. Carga perfil extendido + registro del usuario.
2. Si ya hay una ruta `activa`, la retorna tal cual (idempotencia).
3. Obtiene la **ruta experta base** (knowledge base) según los tipos de discapacidad.
4. Busca **perfiles similares** (misma discapacidad + etapa de vida, con rutas completadas).
5. Si Gemini/Vertex AI está configurado, **genera pasos con IA** (prompt tipo "Comité Médico y Pedagógico", salida JSON); si falla, usa la plantilla experta.
6. Enriquece con "sabiduría comunitaria" si hay ≥2 perfiles similares.
7. Persiste la ruta en `rutasDesarrollo` y sus pasos en `pasosRuta`.

---

## 3. Rutas del frontend (React Router)

### 3.1 Cómo funcionan

- **`src/App.tsx`** envuelve todo en `QueryClientProvider` (React Query) → `BrowserRouter` → `Routes`.
- **`<ProtectedRoute>`** (de `@features/auth`) protege un bloque: si no hay sesión, redirige; `<MainLayout>` provee el shell (sidebar/header).
- **`<FeatureGuard feature="…">`** oculta/bloquea una página si el usuario no tiene esa feature habilitada (`comunidad`, `favoritos`, `postulaciones`).
- **`<ProtectedRoute role="tutor|institution|empresa|admin">`** restringe por rol.
- **`<SoloPersonaFisica>`** redirige a personas morales fuera de vistas con CURP.
- **`RouteFocus`** mueve el foco a `<main>` y sube el scroll en cada cambio de ruta (accesibilidad).
- Redirects legacy con `<Navigate replace>` (`/dashboard`, `/explore`, `/empresa-portal`, …) y un **catch-all** `*` → `/`.

### 3.2 Tabla de rutas del frontend

**Públicas (fuera de `ProtectedRoute`):**

| Ruta | Componente |
|---|---|
| `/` | `LandingPage` |
| `/auth` | `AuthPage` |
| `/salud-y-bienestar` | `SaludBienestarPage` |
| `/educacion` | `EducacionPage` |
| `/empleo` | `EmpleoPage` |
| `/comunidad` | `ComunidadPage` |
| `/acerca-de-nosotros` | `AcercaDeNosotrosPage` |
| `/nuestro-proposito` | `NuestroPropositoPage` |
| `/privacidad` | `PrivacidadPage` |
| `/contacto` | `ContactoPage` |
| `/design-preview` | `DesignPreview` |

**Protegidas (dentro de `ProtectedRoute` + `MainLayout`):**

| Ruta | Componente | Guard extra |
|---|---|---|
| `/inicio` | `HomeRedirect` (según rol) | — |
| `/feed` | `FeedPage` | — |
| `/dashboard` | → `/feed` | redirect |
| `/social`, `/foros`, `/messages` | Social / Foros / Messages | `FeatureGuard feature="comunidad"` |
| `/favorites` | `FavoritesPage` | `FeatureGuard feature="favoritos"` |
| `/jobs` | `JobsPage` | `FeatureGuard feature="postulaciones"` |
| `/institution/nueva`, `/institution/:id` | Crear / Institution | — |
| `/instituciones`, `/instituciones/:id` | Instituciones / detalle | — |
| `/explore` | → `/instituciones` | redirect |
| `/profile` | `ProfilePage` | — |
| `/mi-identidad` | `MiIdentidadPage` | — |
| `/verificacion-identidad` | `IdentityVerificationPage` | `SoloPersonaFisica` |
| `/completar-perfil` | `CompleteProfilePage` | — |
| `/familia`, `/personas` | `TutorPage` | `role="tutor"` |
| `/notifications` | `NotificationsPage` | — |
| `/institution-portal` (+ `/registro`, `/editar`) | Portal institución | `role="institution"` |
| `/empresa/dashboard`, `/empresa/editar`, `/empresa/vacantes` | Portal empresa | `role="empresa"` |
| `/empresa-portal`, `/empresa-portal/editar` | redirects legacy | redirect |
| `/admin` | `AdminPage` | `role="admin"` |
| **`/rutas`** | `RutasPage` | — |
| **`/rutas/mis`** | `MisRutasPage` | — |
| **`/escalas-vida`** | `EscalasVidaPage` | — |
| `*` | → `/` | catch-all |

### 3.3 Cliente API (Axios) — `src/shared/lib/api.ts`

- **baseURL:** `import.meta.env.VITE_API_URL` o `/api` (con salvavidas para el bug POSIX→Windows de Git Bash).
- **Interceptor de request:** adjunta `Authorization: Bearer <token>` desde el store/storage; soporta `skipAuth`; envía `If-None-Match` si hay ETag en caché.
- **Interceptor de response (ETag):** guarda ETag de GETs 200 y resuelve `304` desde caché LRU (100 entradas) como si fuera 200.
- **Interceptor de refresh:** en `401` hace `POST /autenticacion/renovar-token` con `{ tokenRefresco }`, encola peticiones concurrentes y reintenta; solo fuerza logout si el refresh devuelve 401.

---

## 4. Correspondencia Backend ↔ Frontend

### 4.1 Mapa "pantalla/función → endpoints"

| Pantalla / función (frontend) | Endpoint(s) backend | Estado |
|---|---|---|
| Auth (`useAuth`, `useSessionVerify`) | `/autenticacion/*` | ✅ |
| Perfil (`useProfile`, `useUpdateProfile`) | `GET/PUT /usuarios/perfil`, `/usuarios/avatar` | ✅ |
| **Escalas de Vida** (`useSaveEscalasVida`) | `POST /usuarios/escalas-vida` | ⚠️ ver §4.3 |
| Instituciones | `/instituciones*`, `/descubrimiento` | ✅ |
| Vacantes / postulaciones | `/empleo*` | ✅ |
| Comunidad / foros / eventos | `/comunidad*` | ✅ |
| Mensajes | `/mensajes*` | ✅ |
| Favoritos | `/favoritos*` | ✅ |
| Reseñas | `/resenas*` | ✅ |
| Admin | `/administracion*` | ✅ |
| IA (`useAI`) | `/ia/conversacion`, `/ia/recomendaciones`, `/ia/resumen` | ✅ |
| Recomendaciones / onboarding | `/usuarios/recomendaciones`, `/onboarding/*` | ✅ |
| **Rutas de Desarrollo** | `/rutas-desarrollo*` | ✅ (ver §4.2) |
| Notificaciones | `/notificaciones*` | ⚠️ FCM (ver §4.4) |
| Catálogos | `/catalogos*` | ✅ |

### 4.2 Feature "Rutas de Desarrollo" — corresponde al 100%

El hook `src/features/rutas/hooks/useRutas.ts` consume **todos** los endpoints disponibles para usuario:

| Hook frontend | Llamada | Endpoint backend |
|---|---|---|
| `useRutas` | GET | `/rutas-desarrollo` |
| `useRutasSummary` | GET | `/rutas-desarrollo/resumen` |
| `useRutaDetail` | GET | `/rutas-desarrollo/:id` |
| `useMiRuta` | GET | `/rutas-desarrollo/mi-ruta` |
| `useGenerarRutaPersonalizada` | POST | `/rutas-desarrollo/generar-personalizada` |
| `useCreateRuta` | POST | `/rutas-desarrollo` |
| `useUpdateRuta` | PUT | `/rutas-desarrollo/:id` |
| `useDeleteRuta` | DELETE | `/rutas-desarrollo/:id` |
| `useAddPaso` | POST | `/rutas-desarrollo/:id/pasos` |
| `useCompletarPaso` | PATCH | `/rutas-desarrollo/:rutaId/pasos/:pasoId/completar` |
| `useDescompletarPaso` | PATCH | `/rutas-desarrollo/:rutaId/pasos/:pasoId/descompletar` |

- El único endpoint backend sin consumo en frontend es `GET /rutas-desarrollo/analytics` (es de **admin**, y el panel admin aún no lo usa).
- Los tipos `RutaDesarrollo`, `PasoRuta`, `RutasSummary` (`src/types/rutas.ts`) son compatibles con los campos que devuelve el servicio (`porcentajeProgreso`, `totalPasos`, `pasosCompletados`, `origen`, `pasos[]`, etc.).
- La respuesta de `mi-ruta` (`{ ruta, pasos, pasoActual, entidadesLocales, origen }`) coincide exactamente con la interfaz `MiRutaResponse` del frontend, incluido `entidadesLocales.instituciones/vacantes`.
- `RutasPage` y `MisRutasPage` **autogeneran** la ruta (`generar-personalizada`) cuando el usuario no tiene ninguna activa → flujo end-to-end correcto.

**Conclusión: para la feature de Rutas, backend y frontend coinciden sin discrepancias.**

### 4.3 Escalas de Vida — coincide en POST y GET (✅ Resuelto en Frontend)

- **Escritura ✅:** `EscalasVidaPage` envía `nivelAutonomia`, `nivelIndependencia`, … `nivelEmocional` + metadata. El DTO backend `GuardarEscalasVidaDto` espera **exactamente** esos nombres. El backend luego **transforma** a `{ autonomia, independencia, comunicacion, comprension, energia, movilidad, social, emocional }` antes de guardar en `perfilesExtendidos.escalasVida`.
- **Lectura ✅ (resuelto):** el cliente frontend (`useProfile.ts` y `EscalasVidaSection.tsx`) normaliza automáticamente las llaves recibidas del backend mapeando tanto `autonomia` como `nivelAutonomia`. Ya no se pierden las escalas al recargar o entrar desde otro dispositivo.

### 4.4 Discrepancias detectadas (resumen)

| # | Severidad | Descripción | Evidencia |
|---|---|---|---|
| 1 | Resuelta | **`escalasVida` normalización en cliente:** resuelto en `useProfile.ts` y `EscalasVidaSection.tsx` (mapea llaves con y sin prefijo `nivel`). | `useProfile.ts` / `EscalasVidaSection.tsx` |
| 2 | Media | **Endpoints FCM inexistentes:** el frontend llama `POST/DELETE /notificaciones/fcm-token` (montado globalmente en `FCMProvider`), pero el backend no los implementa → 404. Las push no se registran. | `useFCM.ts` vs `notifications.controller.ts` |
| 3 | Baja | **`POST /usuarios/dependientes/registro`** se llama en `usePermisos.ts` pero no existe en el backend. | `usePermisos.ts` vs `users.controller.ts` |
| 4 | Baja | **`/rutas` y `/escalas-vida` sin guard de rol** en el frontend (accesibles a cualquier autenticado; el sidebar las oculta por feature, pero la URL directa entra). | `App.tsx` |
| 5 | Info | `GET /rutas-desarrollo/analytics` (admin) sin consumo en el panel admin. | — |
| 6 | Info | El backend devuelve datos **sin** envoltorio; un par de endpoints legacy (p. ej. `seed`) sí usan `{ success, message, data }`. El frontend tolera ambos con `res?.datos ?? res`. | `api.ts` / hooks |

---

## 5. Datos actuales del backend (inyectados)

El "dataset" del backend proviene de **dos fuentes**:

1. **`src/database/seed/seed.ts`** — script de siembra que **limpia y repuebla** Firestore (se ejecuta manualmente).
2. **`src/modules/routes/knowledge-base.service.ts`** — plantillas expertas **hardcodeadas** (fallback) que replican el contenido de `rutasExpertos`.

Además existe `src/database/seed/instituciones_base.csv` (12 filas) usado por el endpoint `GET /api/seed/institutions`.

### 5.1 Cuentas de usuario (UIDs fijos de Firebase Auth)

| Email | Password | Rol | UID | Ciudad |
|---|---|---|---|---|
| `admin@raices.mx` | `Admin1234` | admin | `nawu8fPdhIORVtUgv8eCrF86s923` | Mérida, Yucatán |
| `tutor@raices.mx` | `Tutor1234` | tutor | `kTs7a3PFVWSBaEbzokt1vw3pKG03` | Mérida, Yucatán |
| `usuario@raices.com` | `Usuario1234` | beneficiario | `39y7Wmk5umhdnmedPMsGSDXiERu1` | Mérida, Yucatán |

Todos con `features` por defecto: `chat, postulaciones, comunidad, resenas, descubrimiento, favoritos, multimedia` (todos `true`). Solo el admin queda `verificado: true`.

### 5.2 Instituciones (12) — todas en Mérida

| # | Nombre | Categoría | Discapacidades | Edades | Plan |
|---|---|---|---|---|---|
| 1 | Centro de Rehabilitación DIF Mérida | funcional | motriz, intelectual, tea | 0–99 | gratuito |
| 2 | CREE Yucatán – IMSS | funcional | motriz, visual, auditiva, intelectual, múltiple | 0–99 | gratuito |
| 3 | CEDIS – Estimulación Temprana | funcional | intelectual, múltiple | 0–6 | gratuito |
| 4 | Clínica Voces – Fonoaudiología | funcional | tea, auditiva, intelectual | 2–70 | gratuito |
| 5 | Escuela de Educación Especial No. 5 | educativo | intelectual, tea | 3–22 | gratuito |
| 6 | Colegio Futuros Brillantes | educativo | tea, intelectual | 3–18 | gratuito |
| 7 | Talleres Inclusivos Yucatán | laboral | intelectual, motriz | 18–60 | gratuito |
| 8 | Tech Accesible MX | laboral | visual, auditiva, motriz | 18–55 | gratuito |
| 9 | Fundación Alas y Raíces Mérida | social | tea | 2–30 | gratuito |
| 10 | Grupo de Apoyo TEA Familias | social | tea | 0–99 | gratuito |
| 11 | ASPADEM | social | intelectual, múltiple | 18–99 | gratuito |
| 12 | Atletismo Paralímpico Yucatán | social | motriz | 8–50 | gratuito |

Cada una con dirección, lat/lng, teléfono, WhatsApp, email, `verificada` (todas `true` salvo la 10 → `false`), `calificacionPromedio` (4.0–4.9) y `cantidadCalificaciones`.

### 5.3 Vacantes de empleo (7)

| Título | Institución | Modalidad | Salario | Discapacidades |
|---|---|---|---|---|
| Carpintero/a Artesanal | Talleres Inclusivos Yucatán | presencial | $4,000–$6,000 | intelectual, motriz |
| Asistente de Soporte Técnico | Tech Accesible MX | remoto | $8,000–$12,000 | visual, auditiva, motriz |
| Desarrollador/a Frontend Junior | Tech Accesible MX | remoto | $12,000–$18,000 | visual, auditiva, motriz |
| Asistente Terapéutico | Fundación Alas y Raíces | presencial | $6,000–$9,000 | tea |
| Auxiliar de Cocina | Talleres Inclusivos Yucatán | presencial | $4,500–$6,500 | intelectual, múltiple |
| Educador/a de Estimulación Temprana | CEDIS | presencial | $9,000–$13,000 | intelectual, múltiple |
| Terapeuta Ocupacional | Centro DIF Mérida | presencial | $12,000–$16,000 | motriz, intelectual |

Todas con `inclusivaDiscapacidad: true` y `activa: true`.

### 5.4 Grupos, publicaciones y actividad social

- **Grupos (5):** *Feed general* (social), *TEA – Primera infancia*, *Adultos con TDAH*, *Inclusión laboral*, *Trámites y derechos*. Todos `esPublico: true`.
- **Miembros de grupo (5):** el admin como miembro `admin` de cada grupo.
- **Publicaciones (3):** bienvenida (feed general), recursos ABA (TEA), feria de empleo inclusivo (inclusión laboral).
- **Comentarios (2):** del admin y del beneficiario.
- **Me gustas (1):** del tutor.
- **Reseñas (3):** 2 sobre *Centro DIF Mérida* (5★) y 1 sobre *CREE Yucatán* (5★).
- **Favoritos (2):** beneficiario → Centro DIF; tutor → CEDIS.
- **Postulaciones (2):** beneficiario → Carpintero/a y Soporte Técnico (estado `pendiente`).
- **Mensaje directo (1):** admin → beneficiario (bienvenida).
- **Notificaciones (2):** bienvenida y "nueva institución pendiente" (ambas para el beneficiario, `leida: false`).

### 5.5 Configuraciones de plataforma (8)

`nombrePlataforma` = "Raices para Florecer" · `emailSoporte` = soporte@raices.mx · `permitirRegistro` = true · `aprobacionInstitucionRequerida` = true · `iaHabilitada` = true · `modoMantenimiento` = false · `maxResenasPorUsuario` = 10 · `ciudadPorDefecto` = "Merida".

### 5.6 Knowledge base — `rutasExpertos` (los "datos de entrenamiento") 🧠

Estos son los datos que alimentan el motor de rutas (Día Cero). **6 rutas expertas**, una por tipo de discapacidad, cada una con **6 pasos** ordenados (evaluación → terapia → integración social → inserción laboral):

| ID (= discapacidad) | Nombre de la ruta | Área de interés | Pasos |
|---|---|---|---|
| `habla` | Desarrollo de Comunicación y Habla | terapia | 6 (evaluación → terapia → práctica → integración → prep. laboral → empleo) |
| `motricidad` | Fortalecimiento Motricidad y Movilidad | funcional | 6 (eval. motora → fisio → terapia ocupacional → adaptación → deporte → empleo) |
| `visual` | Independencia Visual y Accesibilidad | funcional | 6 (diagnóstico → movilidad → tecnología asistiva → educación → habilidades → empleo) |
| `auditiva` | Comunicación Auditiva e Inclusión | educacion | 6 (audiología → tecnología → LSM → educación → comunidad sorda → empleo) |
| `tea` | Desarrollo Social y Habilidades de Vida | funcional | 6 (perfil TEA → conductual → habilidades sociales → vida independiente → talentos → empleo con apoyo) |
| `cognitiva` | Desarrollo Cognitivo y Educativo | educacion | 6 (eval. cognitiva → estimulación → educación adaptada → vida diaria → social → orientación vocacional) |

Cada paso tiene `titulo`, `descripcion`, `categoria` y `orden`. Documento `rutasExpertos/{id}` con `activa: true`.

### 5.7 Plantillas hardcodeadas (fallback sin Firestore)

En `knowledge-base.service.ts` existe el mismo mapa `RUTAS_EXPERTAS_POR_DISCAPACIDAD` (los 6 de arriba) más:

- **`RUTA_TEAC_I`** — "Desarrollo Temprano TEA" (3 pasos: evaluación neurológica → terapia ocupacional/integración sensorial → lenguaje y comunicación alternativa). Para primera infancia con TEA.
- **`RUTA_GENERICA`** — "Desarrollo Integral y Vida Independiente" (6 pasos) para usuarios sin discapacidad registrada.

> El servicio **primero** intenta leer de Firestore (`rutasExpertos`) y, si no existe o falla, cae a estas plantillas en memoria. Es decir, el contenido es redundante a propósito para resiliencia.

### 5.8 Colecciones que **NO** se siembran (se crean en runtime)

- **`rutasDesarrollo` y `pasosRuta`** — no forman parte del seed. Se crean on-demand con `POST /rutas-desarrollo/generar-personalizada` (o al crear manualmente). Por eso, en una base recién sembrada, "Mis Rutas" arranca vacío y el frontend dispara la generación automática.
- **`especialistas`**, **`interacciones`**, **`documentosIdentidad`**, **`validacionesIA`**, **`borradoresOnboarding`**, **`inscripcionesServicio`**, **`eventos`**, **`foros`**, etc. — vacías hasta que el usuario interactúa.
- El seed **sí limpia** (borra) un listado amplio de colecciones, incluidas muchas legacy en inglés (`users`, `profiles`, `jobs`, `u_*`, `p_*`, …), y la colección `rutasExpertos` antes de repoblarla. **Ojo:** `rutasDesarrollo`/`pasosRuta` no están en la lista de limpieza, por lo que **no se borran** al re-sembrar.

---

## 6. Conclusiones y recomendaciones

**Coincidencia backend ↔ frontend: alta.** El contrato de la feature central (Rutas de Desarrollo) coincide al 100%, y el resto de los módulos tienen su consumidor en el frontend. La API es el único punto de acceso a datos, como manda la arquitectura.

**Acciones sugeridas (por prioridad):**
1. **Unificar las llaves de `escalasVida`** entre backend y frontend (recomendado: que el `GET /usuarios/perfil` exponga también `nivelAutonomia…nivelEmocional`, o que el frontend lea `autonomia…emocional`). Es el bug funcional más visible.
2. **Implementar (o retirar) los endpoints FCM** `/notificaciones/fcm-token` para que el registro de push deje de dar 404, o quitar la llamada del `FCMProvider`.
3. **Alinear `POST /usuarios/dependientes/registro`** (crear la cuenta o eliminar el hook muerto).
4. **Añadir guard de rol** a `/rutas` y `/escalas-vida` si deben ser exclusivas de ciertos roles (hoy cualquier autenticado entra por URL).
5. **Exponer el endpoint `analytics`** de rutas en el panel admin (o documentarlo como reservado).
6. Al **re-sembrar**, decidir si `rutasDesarrollo`/`pasosRuta` deben limpiarse para un demo reproducible.

---

### Anexo — Archivos clave consultados

| Tema | Archivo |
|---|---|
| Arranque backend / prefijo `/api` | `raices-backend/src/main.ts` |
| Composición de módulos | `raices-backend/src/app.module.ts` |
| Rutas backend (feature) | `raices-backend/src/modules/routes/routes.controller.ts`, `routes.service.ts`, `knowledge-base.service.ts` |
| Colecciones Firestore | `raices-backend/src/database/firestore.constants.ts` |
| Datos inyectados | `raices-backend/src/database/seed/seed.ts`, `instituciones_base.csv` |
| Rutas frontend | `Raices-Frontend/src/App.tsx` |
| Cliente API / interceptores | `Raices-Frontend/src/shared/lib/api.ts` |
| Hooks de rutas | `Raices-Frontend/src/features/rutas/hooks/useRutas.ts` |
| Tipos de rutas | `Raices-Frontend/src/types/rutas.ts` |
| Escalas de vida (frontend) | `Raices-Frontend/src/features/rutas/pages/EscalasVidaPage.tsx` |
| Escalas de vida (backend) | `raices-backend/src/modules/users/dto/guardar-escalas-vida.dto.ts` |
