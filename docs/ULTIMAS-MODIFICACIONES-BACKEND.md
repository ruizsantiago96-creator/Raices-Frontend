# Últimas modificaciones en el backend

**Autor de los commits:** Mauricio Martinez (maubeckam05@gmail.com)
**Período cubierto:** septiembre – 14 de octubre de 2026
**Repositorio:** `raices-backend`

> Documento generado a partir del historial de Git (commits no-merge del autor en las ramas `dev` y `main`). Se excluyen los commits de merge puro y los commits de otros autores.

---

## Resumen general

Durante septiembre y octubre Mauricio trabajó en cinco grandes frentes:

1. **Instituciones**: servicios públicos en el detalle, inscripciones con flujo de aprobación, subida de **CSF** (Constancia de Situación Fiscal) en sustitución de la CURP obligatoria.
2. **Mensajería**: borrado lógico de conversaciones, manejo de "usuarios fantasma", marcar conversaciones como leídas.
3. **Comunidad y rutas**: endpoint de feed mixto, guard de admin en analytics, nuevo prompt clínico para Gemini basado en guías CENETEC/OMS.
4. **Empleo (vacantes)**: endpoint `mis-vacantes` para que la institución vea también sus vacantes pausadas/inactivas.
5. **Infraestructura y CI**: instalación de dependencias nativas de `canvas`, overrides de pnpm, correcciones de TypeScript y reparación del pipeline de CI.

---

## Detalle por fecha

### 14 de octubre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `2461030` | fix: ci reparado | Corrección en `institutions.service.ts` y su spec para que la CI vuelva a pasar. |
| `f519bcd` | fix: implementacion de la inscripcion del servicio de institucion | Ajustes en la lógica de inscripción a servicios de la institución y sus pruebas unitarias. |
| `d7e02a8` | Fix TypeScript compilation errors | Corrige errores de compilación en `knowledge-base.service.ts` (rutas) y `seed-institutions.service.ts`. |
| `ec4a81e` | Fix TypeScript syntax error en prompt de Gemini | Elimina un salto de línea embebido y una coma huérfana en `routes.service.ts` que rompían el parseo del array `prompt[]` (TS1137). |
| `fed5f62` | feat: prompt clínico estricto CENETEC/OMS para Gemini | Reemplaza el prompt de generación de rutas por uno médico-pedagógico experto que obliga al modelo a basar las rutas en guías oficiales (CENETEC, OMS), prohíbe alucinaciones/pasos inventados y fuerza el orden clínico: **evaluación → intervención → integración social/laboral**. Agrega la plantilla `RUTA_TEAC_I` (TEA temprana) en `knowledge-base.service.ts` y el campo `recursosLocales` al DTO `RutaDesarrollo`. |
| `44d1275` | feat(instituciones): servicios públicos e inscripciones con aprobación | El mayor commit del período (~1,235 líneas añadidas). Incluye: |

- `GET /instituciones/:id` ahora puebla la colección `servicios` (parseados) y devuelve solo los de estado **Activo**.
- Nueva colección **`inscripcionesServicio`** con flujo completo: solicitar inscripción, cancelarla, consultar el estado propio, aprobar/rechazar (dueño/admin) y listar inscripciones enriquecidas con nombre, correo y avatar del solicitante, más un resumen por servicio.
- Nuevos DTOs y documentación Swagger (`ServicioPublicoDto`, `InscripcionServicioDto`, etc.) y actualización de `docs/API-ENDPOINTS.md`.
- Tests unitarios de parseo/filtrado de servicios y del flujo de inscripciones + test e2e HTTP completo (`test/institutions.e2e-spec.ts`).

**Archivos clave:** `institutions.controller.ts`, `institutions.service.ts`, `respuestas-institucion.dto.ts`, `firestore.constants.ts`, `firestore-documents.interface.ts`.

### 9 de octubre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `51e2f4b` | fix(onboarding): progreso por rol para que el Tutor alcance el 100% | `calcularProgreso` ahora recibe `{ rol, cierreExplicito }`: el rol **Tutor** usa `SECCIONES_ONBOARDING_TUTOR` (solo los campos que su wizard realmente recopila) y devuelve 100% si el cierre fue confirmado por el backend; el rol **PCD** conserva `SECCIONES_ONBOARDING` sin cambios. Se aplica en `obtenerEstado`, `saveDraft` y `consolidarInterno`, con tests nuevos para ambos roles. |

### 7 de octubre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `16f354a` | chore(deps): mover `canvas` al `pnpm-workspace.yaml` | Elimina el bloque `pnpm.overrides` de `package.json` (pnpm 9+ no lo lee) y mueve el alias `canvas: npm:@napi-rs/canvas@^0.1.100` al `pnpm-workspace.yaml`, regenerando el lockfile. |

### 6 de octubre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `23197e9` | feat(comunidad, rutas): guard admin + feed mixto | Aplica `@Roles('admin')` sobre `GET /api/rutas-desarrollo/analytics` para restringir el acceso. Agrega el método `getMixtoFeed()` en `community.service.ts`, que devuelve un feed combinado con 50% publicaciones de comunidad + 50% entidades de la ruta activa (instituciones/vacantes). |

### 2 de octubre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `abccf60` | fix(instituciones): permitir a la empresa subir su CSF | El rol `empresa` comparte la entidad `institucion` (`instituciones/{uid}` con `tipo: 'empresa'`), por lo que el guard de `POST /instituciones/verificacion/documentos` le devolvía 403 y no tenía forma de subir su CSF. Se corrige el guard en `institutions.controller.ts`. |
| `7e64c36` | feat(mensajes): borrado lógico de conversaciones y usuarios fantasma | Cambio grande (~691 líneas añadidas): |

- Nuevo `DELETE /api/mensajes/conversacion/:userId` con **borrado lógico por usuario**: escribe `eliminadoPor` con `FieldValue.arrayUnion` en cada documento (lotes de 450) en vez de destruir los mensajes, de modo que la contraparte conserva su historial. Idempotente, siempre responde 200.
- `GET /conversaciones` devuelve `isDeleted` y `destinatarioActivo`; cuando el perfil del socio no existe, está eliminado o desactivado, el historial se conserva pero se **sanitiza el PII** ("Usuario Eliminado" + `urlAvatar` null).
- `POST /enviar/:userId` responde 403 para cuentas eliminadas o desactivadas.
- El filtro de `eliminadoPor` se propaga a `getMessages`, `getUnreadCount` y `marcarConversacionLeida` para que lo oculto no reaparezca ni cuente como no leído.
- `getMessages` mantiene la protección **IDOR**: si no queda ningún mensaje visible tras el borrado lógico, responde 403.
- Corrige `ultimoMensaje`: ahora toma el mensaje más reciente y no el primero encontrado.
- Tests: 35 unitarios con Firestore falso persistente y 24 e2e; `setup-e2e` soporta `arrayUnion` y se agrega el helper `sembrarMensaje`.

### 28 de septiembre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `49fe26a` | feat: envío de información en el formulario de contacto | Módulo **Contacto** nuevo (~419 líneas): `contacto.controller.ts`, `contacto.service.ts`, `contacto.module.ts`, DTOs (`crear-mensaje-contacto.dto.ts`, `resultado-mensaje-contacto.dto.ts`) y persistencia en Firestore (nueva constante de colección). Incluye tests unitarios de controller y service. |

### 25 de septiembre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `db31eb8` | feat(jobs, mensajes): `mis-vacantes` y marcar conversación como leída | Nuevo `GET /mis-vacantes` en jobs: retorna todas las vacantes de la institución del usuario autenticado, **incluyendo pausadas/inactivas** para poder reactivarlas (los admins deben indicar `institucionId`). Nuevo `PATCH /leer/:userId` en mensajes: marca como leídos los mensajes recibidos de un socio mediante escritura atómica en lotes (paginado de 450 por el límite de Firestore) e impide marcar la propia conversación. Tests unitarios de ambos. |
| `7f132d6` | feat: integración del rol empresa | Los DTOs de login, registro y actualización de perfil (`login.dto.ts`, `register.dto.ts`, `actualizar-perfil.dto.ts`) soportan el rol **empresa**. `recommendations.service.ts` filtra a las empresas del feed público; `users.service.ts` lee el subtipo empresa. Test que valida la exclusión de empresas. |

### 21 de septiembre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `1f44fbd` | test: CURP ya no obligatoria para instituciones/empresas | Actualiza `test/verificacion-institucion.e2e-spec.ts` a las nuevas reglas de verificación (CURP opcional, CSF sustituta). |

### 18 de septiembre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `52f4e51` | feat(auth): CSF adjunta al registro sustituye CURP obligatoria | `POST /autenticacion/registro` acepta `multipart/form-data` con el campo opcional `csf` (PDF/imagen ≤10MB); el JSON sigue soportado igual. `registerWithCsf` sube el archivo a Storage (carpeta `csf/`) y persiste la URL como `documentoCsf` en la institución, visible para el admin en las pendientes. Se elimina la exigencia de CURP del representante legal en el alta de instituciones. Agrega utilidad `image-filter.ts` y dependencias de subida de archivos. |
| `047c6ee` | chore(deps): eliminar override de canvas | El override `canvas → @napi-rs/canvas` ya no era necesario (el alias directo en dependencies hace el trabajo) y quedaba inconsistente: pnpm 11 lo leía en local pero pnpm 9 en el docker build no, rompiendo `pnpm install --frozen-lockfile`. Alinea con `335c2d7`. |

### 15 de septiembre de 2026

| Commit | Título | Resumen |
|---|---|---|
| `701dd07` | feat: recepción de archivos CSF en registro | Primera entrega de la funcionalidad CSF (~926 líneas): guards (`firebase-auth.guard.ts`), límites de tamaño en `main.ts`, endpoint de registro con archivo, nuevos `csf-qr.service.ts`, cambios en `institutions.controller.ts` y ajustes de dependencias/lockfile. |
| `a0a3e05` | fix: resolución de errores de TypeScript post-merge | Corrige errores de TS en `auth.controller.ts`, `register.dto.ts` e `institutions.controller.ts` tras el merge; reorganiza `pnpm-lock.yaml` y `package.json`. |
| `c7e0c70` | ci: instalar librerías del sistema para compilar canvas | Agrega a `.github/workflows/ci.yml` la instalación de librerías nativas necesarias para compilar `canvas` en CI. |
| `ed6e58f` | test: actualizar datos de prueba | Ajusta los fixtures de `auth.e2e-spec.ts`, `rate-limit.e2e-spec.ts`, `security.e2e-spec.ts` y `verificacion-institucion.e2e-spec.ts` para cumplir las validaciones vigentes de los DTOs. |
| `ad5af68` | test: manejar ECONNRESET en fuerza bruta | La simulación de ataques de fuerza bruta de rate limit podría cerrar la conexión (ECONNRESET); el test ahora tolera ese caso en `test/rate-limit.e2e-spec.ts`. |

---

## Estadísticas

- **Commits no-merge del autor:** 25 (12 en octubre, 13 en septiembre)
- **Módulos más tocados:** `institutions`, `messages`, `auth`, `community`, `routes`, `jobs`, `contacto`, `onboarding`
- **Temas transversales:** verificación de identidades vía **CSF** (sustituye la CURP obligatoria), borrado lógico seguro de mensajes, restricción de endpoints por rol y robustez de CI/pnpm.

*Documento generado el 16 de octubre de 2026.*
