# Auditoría rápida del proyecto

**Proyecto:** `raices-frontend`  
**Fecha:** 2026-08-09  
**Alcance:** revisión estática del frontend React/Vite, configuración CI, dependencias, autenticación, notificaciones y pruebas disponibles. No se auditó el backend, la infraestructura desplegada ni reglas de Firebase. Se excluyeron `node_modules`, `dist` y la documentación histórica como fuente de evidencia.

## Resumen ejecutivo

El proyecto tiene una base funcional razonable: separación por features, rutas protegidas por rol, interceptor de refresh, pruebas unitarias y build reproducible en el entorno actual. Sin embargo, no está listo para considerarse endurecido para producción sin atender primero la cadena de dependencias, el almacenamiento de credenciales y la configuración de notificaciones.

**Prioridades inmediatas:**

1. Actualizar `vitest`, `vite`, `postcss`, `nanoid` y las dependencias transitivas vulnerables; hacer que CI falle ante vulnerabilidades de severidad alta/crítica.
2. Migrar tokens de acceso y refresh fuera de `localStorage`/`sessionStorage`, idealmente a cookies `HttpOnly`, `Secure`, `SameSite` emitidas por el backend.
3. Corregir el service worker de Firebase: actualmente el archivo publicado contiene placeholders y no usa la configuración de entorno durante `build`.
4. Corregir el test fallido y revisar el contrato real del endpoint de postulación.
5. Reducir los warnings de lint, especialmente accesos a refs durante render y dependencias incompletas de `useEffect`.

## Hallazgos priorizados

### ALTO - Dependencias con vulnerabilidades conocidas

**Evidencia:** `pnpm audit --audit-level=high` reportó 14 vulnerabilidades: 1 crítica y 6 altas, entre ellas `vitest <3.2.6`, `vite <=6.4.2`, `postcss <=8.5.17`, `brace-expansion` y `nanoid`.

**Impacto:** aunque varias afectan principalmente herramientas de desarrollo, pueden comprometer el equipo/CI y, en el caso de Vite en Windows, exponer archivos durante el servidor de desarrollo. Mantener versiones vulnerables aumenta el riesgo de supply-chain y de filtración local.

**Recomendación:** actualizar dependencias directas y regenerar el único lockfile oficial. Validar compatibilidad de Vitest/Vite y ejecutar `pnpm audit --audit-level=high` sin tolerancia a fallo.

### ALTO - CI ignora vulnerabilidades de dependencias

**Evidencia:** `.github/workflows/ci.yml:23-24` ejecuta `pnpm audit --audit-level=high` con `continue-on-error: true`.

**Impacto:** un pull request puede pasar aunque introduzca vulnerabilidades altas o críticas. El control existe, pero no actúa como gate de seguridad.

**Recomendación:** retirar `continue-on-error`, fijar versiones de Node/pnpm y usar `pnpm install --frozen-lockfile`. Si se requiere una excepción temporal, documentarla por CVE, paquete y fecha de expiración.

### ALTO - Tokens de sesión almacenados en Web Storage

**Evidencia:** `src/shared/lib/storage.js:12-15,43-69,77-88` guarda token de acceso, refresh token y usuario en `localStorage` o `sessionStorage`. `src/shared/lib/api.js:51` los convierte en `Authorization`.

**Impacto:** cualquier XSS ejecutado bajo el origen puede leer ambos tokens y mantener una sesión o renovar credenciales. `sessionStorage` reduce persistencia, pero no elimina el riesgo de XSS.

**Recomendación:** preferir sesión basada en cookies `HttpOnly; Secure; SameSite=Lax/Strict`, con protección CSRF adecuada. Si la arquitectura obliga a usar bearer tokens en el cliente, reducir TTL, rotar refresh tokens, aplicar CSP estricta, no guardar refresh tokens persistentes y revisar toda salida de datos no confiables.

### ALTO - Service worker FCM se publica sin configuración real

**Evidencia:** `public/firebase-messaging-sw.js:27-33` contiene `__FIREBASE_API_KEY__`, `__FIREBASE_AUTH_DOMAIN__` y otros placeholders. El comentario `:23-25` menciona un `prebuild`, pero `package.json` no define dicho script.

**Impacto:** el service worker puede fallar al inicializar Firebase y las notificaciones en segundo plano no funcionar en el build generado. Además, el frontend registra `/firebase-messaging-sw.js` siempre que FCM está configurado (`src/features/notifications/hooks/useFCM.js:82-85`), por lo que el fallo aparece en runtime.

**Recomendación:** generar el service worker durante `build` de forma segura, o registrar un worker generado desde una plantilla. Añadir una prueba/validación que falle si quedan placeholders en `dist/firebase-messaging-sw.js`. Las claves Firebase web son públicas por diseño, pero deben restringirse por dominio y APIs en Google Cloud/Firebase.

### MEDIO - Credenciales presentes en `.env.development` local

**Evidencia:** el archivo local contiene `VITE_GOOGLE_CLIENT_ID`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_VAPID_KEY` (`.env.development:1-11`). Está ignorado por Git y `git ls-files` confirmó que no está versionado.

**Impacto:** no es una filtración confirmada del repositorio, y las claves web de Firebase/Google no son secretos en sentido estricto. Sí existe riesgo operativo si se comparten logs, capturas o artefactos; una configuración Firebase permisiva podría permitir abuso.

**Recomendación:** mantener el archivo fuera del repositorio, revisar restricciones de dominio/origen y reglas de Firebase, documentar rotación/revocación y añadir un escáner de secretos en CI. Nunca colocar secretos backend en variables `VITE_*`.

### MEDIO - Logs de autenticación y tokens en producción

**Evidencia:** `src/features/auth/hooks/useAuth.js:81-90,137-143`, `src/shared/lib/storage.js:51-61`, `src/features/auth/lib/firebaseBridge.js:99-114` y `src/features/notifications/hooks/useFCM.js:108` escriben información de sesión/identificadores en consola. Aunque no imprimen el token completo, imprimen estados de credenciales, roles y prefijos de tokens FCM.

**Impacto:** logs del navegador pueden quedar expuestos en soporte remoto, grabaciones o herramientas de observabilidad. El logging de roles y flujo de login facilita reconocimiento y genera ruido.

**Recomendación:** eliminar logs de autenticación/storage/FCM del bundle de producción o usar un logger con redacción, niveles y `import.meta.env.DEV`. No registrar ningún identificador de sesión, aunque esté truncado.

### MEDIO - Test suite rota por contrato inconsistente

**Evidencia:** `pnpm test -- --reporter=verbose`: 17 archivos, `345 passed`, `1 failed`. Falla `src/shared/constants/__tests__/backendEndpoints.test.js:126-127` porque `JOB_ENDPOINTS.APPLY.body.cartaPresentacion` vale `'string?'`, mientras el test exige `'string'`; la definición está en `src/shared/constants/backendEndpoints.js:637-641`.

**Impacto:** CI no debería considerarse verde. La discrepancia puede ocultar un cambio accidental en el contrato de postulación o un test desactualizado.

**Recomendación:** decidir si la carta es obligatoria u opcional según el backend y alinear definición, validación de formulario, payload y test. No cambiar solo el test para silenciar el fallo sin confirmar el contrato.

### MEDIO - Acceso y escritura de refs durante render

**Evidencia:** `pnpm run lint` reporta `react-hooks/refs` en `src/features/institutions/pages/ExplorePage.jsx:89-94`: se lee y modifica `prevFilterKeyRef.current` durante render y se llama `setVisibleCount` durante render.

**Impacto:** puede producir renders adicionales, comportamiento no determinista y bugs al cambiar filtros, especialmente con React Strict Mode/compilador. El lint lo clasifica explícitamente como error conceptual aunque el proceso solo emita warnings.

**Recomendación:** mover el reinicio de `visibleCount` a un `useEffect` dependiente de `filterKey`, o derivar el valor sin estado redundante. Añadir prueba de cambio de filtros y paginación visual.

### MEDIO - Efectos con dependencias incompletas

**Evidencia:** lint reporta `AccessibilityBar.jsx:330` (`handleDragEnd`), `JobsPage.jsx:474` (`initializeCandidateData`) y `useFCM.js:174` (`addToast`, `requestPermission`).

**Impacto:** closures obsoletas pueden usar datos o funciones antiguas, y cambios futuros pueden no activar el efecto esperado. En FCM puede quedar una suscripción configurada con callbacks anteriores.

**Recomendación:** corregir dependencias o estabilizar explícitamente callbacks con el patrón ya aceptado por la versión de React del proyecto; verificar cleanup y comportamiento en Strict Mode.

### MEDIO - Inicialización FCM vulnerable a condiciones de ciclo de vida

**Evidencia:** `useFCM.js:136-173` usa `initRef` para evitar duplicados, ejecuta `setup()` sin cancelación y solo asigna `unsubscribe` después de varias operaciones asíncronas.

**Impacto:** si el componente se desmonta o cambia la sesión mientras se solicita permiso/registro, el setup puede continuar y crear suscripciones después del cleanup. Esto puede causar notificaciones duplicadas o registrar el token en una sesión incorrecta.

**Recomendación:** usar una bandera `cancelled`, cancelar/ignorar resultados tardíos y comprobar el token actual antes de enviar FCM o instalar `onMessage`. Añadir pruebas de mount/unmount y cambio de usuario.

### BAJO - Política de dependencias y lockfiles inconsistente

**Evidencia:** `package.json` declara Axios `^1.7.7`, mientras `pnpm-lock.yaml` resuelve `1.18.1`; `package-lock.json` también existe pero `.gitignore:32-34` indica que solo pnpm debe usarse. El package-lock tiene metadatos antiguos (`0.1.0`) frente a `package.json:3` (`1.5.1`).

**Impacto:** distintos desarrolladores o herramientas pueden instalar árboles diferentes y obtener auditorías/builds no reproducibles.

**Recomendación:** conservar solo `pnpm-lock.yaml`, eliminar el lockfile npm si no lo requiere un proceso externo, usar `--frozen-lockfile` y automatizar actualizaciones con revisión.

### BAJO - Bundle inicial excesivo

**Evidencia:** `pnpm run build` genera `dist/assets/index-Ck3aDzxB.js` de aproximadamente 1.78 MB minificado (467 KB gzip) y Vite emite advertencia de chunks mayores a 500 KB.

**Impacto:** mayor tiempo de carga y consumo móvil; Firebase, MapLibre y funcionalidades protegidas parecen contribuir al bundle inicial.

**Recomendación:** aplicar lazy loading de rutas con `React.lazy`, separar librerías pesadas mediante chunks y medir Web Vitals antes/después.

### BAJO - Dependencia externa sin pinning en HTML

**Evidencia:** `index.html:10-11` carga MapLibre CSS desde `unpkg.com` y Google Identity Services desde `accounts.google.com` sin SRI para el recurso CSS.

**Impacto:** dependencia de disponibilidad y de contenido externo en cada carga; un cambio del CDN afectaría el cliente. SRI no es aplicable igual a todos los scripts dinámicos, pero sí al CSS versionado cuando el proveedor lo permite.

**Recomendación:** empaquetar CSS crítico/dependencias controlables, fijar versiones, aplicar SRI donde sea compatible y definir una CSP con `script-src`, `connect-src`, `img-src` y `worker-src` explícitos.

## Áreas de mejora

- Hacer que lint trate como errores los fallos de hooks y reducir progresivamente los 81 warnings actuales.
- Aumentar pruebas de integración para login, refresh concurrente, logout, roles, FCM y rutas protegidas.
- Validar en frontend longitudes, formatos y tamaños de archivos, pero mantener la validación y autorización definitiva en backend.
- Añadir `ErrorBoundary`, métricas de errores y estados de carga/error consistentes para las rutas principales.
- Revisar si `staleTime: 0` y `refetchOnWindowFocus: true` en `src/shared/lib/queryClient.js:3-11` provocan tráfico excesivo; definir políticas por query.
- Añadir headers de seguridad en el hosting: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`.
- Automatizar revisión de bundle, dependencias, secretos y accesibilidad en CI.

## Fortalezas observadas

- Uso de `ProtectedRoute` con restricciones explícitas para roles sensibles en `src/App.jsx:155-170`.
- Interceptor de refresh con cola de peticiones y prevención de reintentos infinitos en `src/shared/lib/api.js:33-153`.
- Limpieza de tokens en ambos storages durante logout en `src/shared/lib/storage.js:94-110`.
- Tests unitarios presentes para autenticación, almacenamiento, hooks, stores, componentes y utilidades.
- Build de producción exitoso en la auditoría.
- Uso general de renderizado React escapado; no se encontraron usos productivos de `dangerouslySetInnerHTML`, `eval` o `innerHTML` fuera de tests.

## Resultados de verificación

| Comando | Resultado |
|---|---|
| `pnpm run lint` | Pasa con código 0, pero reporta 81 warnings |
| `pnpm test -- --reporter=verbose` | Falla: 345/346 tests pasan; 1 falla |
| `pnpm run build` | Pasa; warnings de bundle grande/import dinámico |
| `pnpm audit --audit-level=high` | Falla: 14 vulnerabilidades, 1 crítica y 6 altas |

## Plan recomendado

### Inmediato

1. Actualizar dependencias vulnerables y bloquear CI ante auditoría alta/crítica.
2. Reparar el pipeline del service worker y validar el artefacto generado.
3. Resolver el contrato `cartaPresentacion` y recuperar la suite completamente verde.
4. Eliminar logs de autenticación y tokens FCM del build de producción.

### Corto plazo

1. Diseñar migración de Web Storage a cookies `HttpOnly` con backend.
2. Corregir warnings de hooks y el setState durante render.
3. Añadir pruebas de expiración/refresh concurrente, logout durante requests y FCM lifecycle.
4. Consolidar `pnpm-lock.yaml` como único lockfile.

### Medio plazo

1. Aplicar code splitting por ruta y medir Web Vitals.
2. Establecer CSP y headers de seguridad en el hosting.
3. Incorporar SAST, secret scanning, dependency review y auditoría de accesibilidad al CI.

## Limitaciones

- No se verificaron permisos reales del backend, reglas de Firebase, CORS, CSRF, rate limiting ni validación de subida de archivos.
- La presencia de valores `VITE_*` no implica por sí sola un secreto filtrado; requieren revisión de restricciones y configuración del proveedor.
- Los hallazgos funcionales se basan en código y tests locales; faltan pruebas E2E en navegador real y contra un backend representativo.
