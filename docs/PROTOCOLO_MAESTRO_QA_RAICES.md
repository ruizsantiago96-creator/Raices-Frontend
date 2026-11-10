# PROTOCOLO MAESTRO DE PRUEBAS QA — SISTEMA INTEGRAL RAÍCES
**Documento Técnico de Certificación, Auditoría de Calidad y Entrega Final (Release Candidate v2.0)**  
*Fecha de Emisión:* Noviembre 2026 | *Clasificación:* Manual de Pruebas de Aceptación (UAT / E2E)

---

## 1. ARQUITECTURA DEL SISTEMA Y REGLAS DE ENTORNO

### 1.1 Topología y Stack Técnico
- **Frontend SPA:** React 18.3, TypeScript 5.x, Vite, React Router DOM 6.26, TanStack Query 5.x, Zustand / Context API, Lucide React Icons.
  - **Ubicación en workspace:** `c:\Users\ruizs\Raices\raices-frontend`
  - **Servidor local dev:** `http://localhost:5173`
- **Backend API:** NestJS 10.x, TypeScript, Firebase Admin SDK (Firestore, Auth, Cloud Storage), Google GenAI SDK (Gemini 3.x Flash con thinking `MINIMAL`).
  - **Ubicación en workspace:** `c:\Users\ruizs\Raices\raices-backend`
  - **Base URL:** `http://localhost:7000/api` | **Swagger API Docs:** `http://localhost:7000/docs`
- **Seguridad y Sandbox:**
  - Content Security Policy (CSP) estricta: No se permiten `<iframe>` embebiendo `blob:` para renderizado de PDF en navegadores Chromium.
  - Autenticación híbrida: Firebase Auth / Bearer JWT con tokens de refresco persistentes.

---

## 2. MATRIZ DE CONTROL DE ACCESO (5 ROLES Y PERMISOS)

| Rol del Usuario | Llave interna (`role` / `rol`) | Rutas Permitidas Principales | Rutas Estrictamente Bloqueadas (Debe dar 403 o Redirect) |
|---|---|---|---|
| **PCD** (Persona con Discapacidad) | `pcd` | `/inicio`, `/feed`, `/social`, `/foros`, `/jobs`, `/explore`, `/institution/:id`, `/rutas`, `/profile`, `/mi-identidad`, `/verificacion-identidad` | `/admin`, `/empresa/*`, `/institution-portal/*` |
| **Tutor / Familiar** | `tutor` | Rutas de PCD + `/personas`, `/familia` (gestión de dependientes y foros exclusivos de padres) | `/admin`, `/empresa/*`, `/institution-portal/*` |
| **Institución** | `institution` | `/inicio`, `/explore`, `/institution-portal`, `/institution-portal/editar`, `/institution-portal/registro`, `/social`, `/foros` | `/admin`, `/empresa/*`, `/verificacion-identidad` |
| **Empresa** | `empresa` | `/empresa/dashboard`, `/empresa/editar`, `/empresa/vacantes`, `/jobs`, `/social`, `/foros` | `/admin`, `/verificacion-identidad`, `/personas`, `/rutas` |
| **Administrador** | `admin` | `/admin` (todos sus tabs: `overview`, `institutions`, `users`, `identities`, `reviews`, `moderacion`, `alerts`, `audit`), más toda la app pública | Ninguna |

---

## 3. GUÍA DE EJECUCIÓN DETALLADA POR MÓDULOS

---

### MÓDULO 1: Autenticación, Sesión y Verificación de Identidad

#### Componentes Clave:
- `src/features/auth/pages/AuthPage.tsx`
- `src/features/auth/components/ProtectedRoute.tsx`
- `src/features/profile/pages/IdentityVerificationPage.tsx`
- `src/features/auth/store/authStore.ts`

#### Casos de Prueba Paso a Paso:

##### Caso 1.1: Persistencia de Sesión ("Recordarme")
- **Paso 1:** Abrir `http://localhost:5173/auth`.
- **Paso 2:** Ingresar credenciales válidas y **marcar** la casilla *"Recordarme"*.
- **Paso 3:** Iniciar sesión. Abrir DevTools (`F12`) → Pestaña *Application* → *Local Storage*.
- **Resultado Esperado:** El token y refresh token están en `localStorage`. Al cerrar la pestaña y volver a entrar a `http://localhost:5173/inicio`, la sesión sigue activa sin pedir login.
- **Paso 4:** Cerrar sesión, volver a iniciar sesión pero **desmarcando** *"Recordarme"*.
- **Resultado Esperado:** El token se almacena en `sessionStorage`. Al cerrar la ventana del navegador, la sesión expira.

##### Caso 1.2: Validación de CURP en Persona Física (`/verificacion-identidad`)
- **Paso 1:** Iniciar sesión como rol `pcd`. Ir a `/verificacion-identidad`.
- **Paso 2:** Ingresar un CURP inválido (ej. `ABCD123456XXXXXX00`).
- **Resultado Esperado:** El validador bloquea el envío indicando formato inválido o dígito verificador erróneo.
- **Paso 3:** Ingresar un CURP estructurado válido (18 caracteres oficiales). Adjuntar imagen de identificación (frontal y reverso).
- **Resultado Esperado:** Se envía a `POST /api/usuarios/verificar-identidad`. El estado de identidad pasa a `"en_revision"`.

##### Caso 1.3: Redirección de Rol Empresa en Verificación de Identidad
- **Paso 1:** Iniciar sesión como rol `empresa`.
- **Paso 2:** Intentar navegar forzadamente por barra de direcciones a `http://localhost:5173/verificacion-identidad`.
- **Resultado Esperado:** `SoloPersonaFisica` intercepta la ruta y redirige automáticamente a `/empresa/dashboard`. Las personas morales no tienen CURP.

---

### MÓDULO 2: Red Social y Comunidad ("Conectemos")

#### Componentes Clave:
- `src/features/social/pages/SocialPage.tsx` (Líneas 1-1968)
- `src/features/social/components/ModeracionFeedbackModal.tsx`
- `src/features/social/components/EventsDiscovery.tsx`
- `src/features/social/hooks/useCommunity.ts`

#### Estructura de Navegación:
El módulo se divide en 5 pestañas principales (`mainTab`):
1. `[ Publicaciones ]` (`mainTab === 'comunidad'`)
2. `[ Grupos ]` (`mainTab === 'grupos'`)
3. `[ Galería Conectemos ]` (`mainTab === 'galeria'`)
4. `[ Eventos ]` (`mainTab === 'eventos'`)
5. `[ Acerca de la comunidad ]` (`mainTab === 'acerca'`)

#### Casos de Prueba Paso a Paso:

##### Caso 2.1: Publicación con Categorías Creativas
- **Paso 1:** Ir a `/social` → Pestaña `Publicaciones`.
- **Paso 2:** En la caja redactora, ubicar el selector de categorías:
  - Botones superiores: `[General]`, `[Arte]`, `[Experiencias]`.
  - Selector desplegable: `General`, `🎨 Arte / Dibujo`, `📖 Experiencias / Vivencias`.
- **Paso 3:** Escribir un texto (ej. *"Mi primera experiencia usando transporte adaptado en la ciudad"*), seleccionar **«Experiencias»** y presionar **«Publicar»**.
- **Resultado Esperado:** La publicación se crea con `categoriaCreativa: 'historia'` en el backend (compatible con la validación de DTOs), pero en la tarjeta del muro y en las etiquetas de la interfaz se muestra la insignia rosa con icono de libro: **`📖 Experiencias`**.

##### Caso 2.2: Filtrado Dinámico del Feed
- **Paso 1:** En la barra *"Filtrar feed"*, hacer clic en `[ Experiencias ]`.
- **Resultado Esperado:** El feed se filtra en memoria mostrando únicamente las publicaciones cuya categoría sea `historia`, `experiencia` o `experiencias`.
- **Paso 2:** Hacer clic en `[ Arte ]`.
- **Resultado Esperado:** Se muestran posts clasificados como `arte` o `dibujo`.
- **Paso 3:** Hacer clic en `[ Todas ]`.
- **Resultado Esperado:** Se restablece el feed completo de la comunidad.

##### Caso 2.3: Galería Conectemos (Filtro Estricto de Multimedia)
- **Paso 1:** Ir a la pestaña `[ Galería Conectemos ]`.
- **Paso 2:** Hacer clic en la píldora `[ Arte ]`.
- **Comportamiento Esperado del Backend:**
  - El backend ejecuta `getConectemosPosts()`. Aplica el filtro `tieneMultimediaGaleria` (debe tener `mediaUrl`, `imagenes[]` con extensiones `.jpg`, `.png`, `.webp`, etc.).
  - **Si no hay publicaciones con foto:** Debe mostrarse el componente de estado vacío interactivo:
    - Icono centrado de paleta de arte `🎨`.
    - Título: *"Aún no hay obras de Arte en la galería"*.
    - Subtítulo: *"Sé el primero en compartir un dibujo, pintura o expresión artística con la comunidad."*
    - Botón de acción: `[ + Compartir obra de arte ]`.
- **Paso 3:** Hacer clic en `[ + Compartir obra de arte ]`.
- **Resultado Esperado:** El sistema cambia automáticamente a la pestaña `Publicaciones`, con el formulario de creación abierto y la categoría `arte` preseleccionada.
- **Paso 4:** Adjuntar una imagen real (PNG/JPG), escribir *"Dibujo al óleo"* y publicar.
- **Paso 5:** Regresar a `Galería Conectemos` → `[ Arte ]`.
- **Resultado Esperado:** Ahora aparece la tarjeta visual con la imagen renderizada y el autor.

---

### MÓDULO 3: Sistema de Moderación Inteligente (Gemini AI + Fallback)

#### Componentes y Servicios Clave:
- Frontend: `src/features/social/components/ModeracionFeedbackModal.tsx`
- Backend: `src/modules/community/moderacion.service.ts`
- Admin Backend: `src/modules/admin/palabras-prohibidas.service.ts`

#### Matriz de Payloads para Pruebas de Moderación:

| Prueba ID | Contenido a Publicar | Categoría Esperada | Resultado de Moderación | UI Esperada en Pantalla |
|---|---|---|---|---|
| **MOD-01** | *"Hoy logré asistir a mi entrevista de trabajo accesible y me sentí muy cómodo con las rampas."* | `logro_personal` / `comunidad` | **Aprobada** (`estado: 'aprobada'`) | La publicación aparece de inmediato en el feed. |
| **MOD-02** | *"Eres un completo pendejo e inútil, los discapacitados no deberían salir a la calle."* | `lenguaje_inapropiado` | **Rechazada** (`estado: 'rechazada'`) | **No se publica en el feed.** Se abre el modal emergente `ModeracionFeedbackModal` en color rojo/coral indicando violación por lenguaje inapropiado y ofreciendo sugerencia en Lectura Fácil. |
| **MOD-03** | *"Gana dinero fácil y rápido sin trabajar, comparte esta cadena a 10 amigos para entrar al esquema multinivel."* | `spam` | **Rechazada** (`estado: 'rechazada'`) | Modal emergente indicando detección de spam y publicidad no autorizada. Pasa a la cola del admin. |
| **MOD-04** | *"Tengo el remedio y medicina milagro para curar el autismo y sanar la parálisis cerebral al 100%."* | `desinformacion` | **Rechazada** (`estado: 'rechazada'`) | Modal emergente indicando advertencia de desinformación médica no avalada científicamente. |
| **MOD-05** | *"Mi número de tarjeta es 4152313412345678 con CVV 123 y contraseña secreto123."* | `datos_sensibles` | **Rechazada** (`estado: 'rechazada'`) | Modal emergente alertando de exposición de datos bancarios o confidenciales. |

#### Verificación del Flujo de Administración:
- **Paso 1:** Al producirse un rechazo (ej. `MOD-02`), iniciar sesión como `admin`.
- **Paso 2:** Ir a `http://localhost:5173/admin` → Pestaña `Moderación de publicaciones`.
- **Paso 3:** Verificar que la publicación rechazada aparece en la lista con su autor, fecha, fragmento del texto y causa detectada.
- **Paso 4:** Probar el botón **«Aprobar»** (ej. si fue un falso positivo):
  - Enviar solicitud `PATCH /api/administracion/publicaciones/:id/moderacion` con `{ decision: 'aprobar' }`.
  - El post sale de la cola de pendientes y se vuelve visible en el feed comunitario.
- **Paso 5:** Probar el botón **«Rechazar»**:
  - Se confirma el rechazo y permanece oculto permanentemente.

---

### MÓDULO 4: Bolsa de Empleo, Portal Empresa y Visor de CV

#### Componentes Clave:
- `src/features/empresa/pages/EmpresaDashboard.tsx`
- `src/features/empresa/components/PerfilPostulanteModal.tsx`
- `src/features/jobs/components/CvDocumentPreview.tsx`
- `src/features/jobs/components/CvModal.tsx`
- `src/features/jobs/components/ApplicationModal.tsx`
- `src/features/jobs/pages/JobsPage.tsx`

#### Casos de Prueba Paso a Paso:

##### Caso 4.1: Publicación de Vacante Adaptada (Rol Empresa)
- **Paso 1:** Iniciar sesión como rol `empresa`. Entrar a `/empresa/dashboard`.
- **Paso 2:** Ir a la pestaña *«Bolsa de Trabajo»* y hacer clic en *«Nueva Vacante»*.
- **Paso 3:** Llenar formulario: Título (*"Auxiliar Administrativo"*), Sueldo, Modalidad (Híbrido), y seleccionar adaptaciones requeridas (Rampa de acceso, Software lector de pantalla NVDA, Horario flexible).
- **Paso 4:** Guardar. Comprobar que aparece en la lista de vacantes activas.

##### Caso 4.2: Postulación con CV (Rol PCD)
- **Paso 1:** Iniciar sesión como rol `pcd`. Entrar a `/jobs`.
- **Paso 2:** Localizar la vacante creada en el Caso 4.1 y presionar `[ Postularme ]`.
- **Paso 3:** En `ApplicationModal`:
  - Escribir carta de presentación.
  - Cargar un archivo PDF de CV (ej. `curriculum_vitae.pdf`).
  - **Verificación:** Comprobar que en la caja de vista previa se dibuja la hoja A4 limpia con el nombre del archivo, fecha, peso y texto de la carta sin errores en la consola.
- **Paso 4:** Presionar `[ Enviar Postulación ]`.

##### Caso 4.3: Revisión de Postulantes y Visor de CV (Anti-Regresión CSP)
- **Paso 1:** Regresar a la sesión de `empresa` en `/empresa/dashboard` → Pestaña `[ Postulantes ]`.
- **Paso 2:** Localizar al candidato recién postulado en la tabla.
- **Paso 3:** Probar los controles de la columna **CV**:
  - **Prueba 4.3.A — Descarga Rápida:** Hacer clic en el botón circular `[ 📥 ]`.
    - *Resultado Esperado:* Se descarga el archivo PDF en la computadora del usuario.
  - **Prueba 4.3.B — Visor Modal interactivo:** Hacer clic en `[ 📄 Ver CV ]`.
    - *Resultado Esperado:* Se abre `CvModal`.
    - **Inspección de Consola (F12):** Asegurar que **NO** exista el error `ERR_BLOCKED_BY_CSP: SE BLOQUEÓ`.
    - **Controles de Zoom:** Probar los botones `[-]`, `[100%]` y `[+]`. El documento debe escalar nítidamente (0.75x a 1.5x).
    - **Impresión Directa:** Presionar `[ Imprimir ]`. Debe invocarse el diálogo nativo de impresión del sistema operativo con el formato de currículum formateado.
    - **Enlace a Documento Original:** Si el postulante subió un archivo físico, hacer clic en `[ ↗ Abrir PDF original ]` y verificar que abre en pestaña externa.
- **Paso 4:** Abrir el botón `[ Ver perfil ]` del postulante (`PerfilPostulanteModal`):
  - Ir a la parte inferior del modal.
  - Verificar que existe la tarjeta dedicada *"Currículum Vitae (CV)"* con el nombre del archivo adjunto y los botones `[ Ver CV ]` y `[ Descargar PDF ]`.
- **Paso 5:** Cambiar el estado del candidato a **«Aceptar»** o **«Rechazar»**. Verificar que el estado cambie en tiempo real sin recargar la página.

---

### MÓDULO 5: Directorio de Instituciones y Búsqueda por CP

#### Componentes Clave:
- `src/features/institutions/pages/InstitucionesPage.tsx`
- `src/features/institutions/pages/InstitutionPage.tsx`
- `src/shared/lib/postalCodeLookup.ts`

#### Casos de Prueba Paso a Paso:

##### Caso 5.1: Búsqueda por Código Postal
- **Paso 1:** Ir a `/explore` (Directorio de Instituciones).
- **Paso 2:** En el campo de ubicación o filtro por CP:
  - Ingresar un código postal mexicano válido (ej. `06000` o `64000`).
  - *Resultado Esperado:* El sistema autocompleta el estado, municipio/alcaldía y colonias disponibles sin error.
  - Probar formato español con espacio (ej. `28 001`).
  - *Resultado Esperado:* Reconoce el formato y resuelve la provincia correspondiente.

##### Caso 5.2: Ficha Detallada y Reseñas
- **Paso 1:** Abrir cualquier institución del listado (ej. `/institution/inst-1`).
- **Paso 2:** Verificar visualización de datos: Dirección física, mapa, teléfono de contacto y lista de servicios inclusivos.
- **Paso 3:** Dejar una reseña: Calificar con 5 estrellas, redactar comentario (*"Excelente atención del personal capacitado en lengua de señas"*) y enviar.
- **Resultado Esperado:** La reseña se suma al promedio de calificación y se lista inmediatamente en la pestaña de opiniones.

---

### MÓDULO 6: Panel de Administración (`/admin`)

#### Componentes Clave:
- `src/features/admin/pages/AdminPage.tsx`
- `src/features/admin/components/OverviewTab.tsx`
- `src/features/admin/components/InstitutionsTab.tsx`
- `src/features/admin/components/UsersTab.tsx`
- `src/features/admin/components/ModeracionTab.tsx`
- `src/features/admin/components/AlertsTab.tsx`

#### Casos de Prueba Paso a Paso:

##### Caso 6.1: Navegación Profunda por URL (`?tab=`)
- **Paso 1:** Estando logueado como `admin`, navegar directamente a `http://localhost:5173/admin?tab=alerts`.
- **Resultado Esperado:* Se abre directamente la pestaña de **Alertas de riesgo**.
- **Paso 2:** Cambiar la URL en la barra del navegador a `http://localhost:5173/admin?tab=moderacion`.
- **Resultado Esperado:** Cambia automáticamente a la pestaña de **Moderación de publicaciones**.
- **Paso 3:** Cambiar a `http://localhost:5173/admin?tab=institutions`.
- **Resultado Esperado:** Cambia a **Gestión de instituciones**.

##### Caso 6.2: Gestión de Palabras Prohibidas (Filtros en Backend)
- **Paso 1:** En `/admin?tab=moderacion`, ubicarse en la sección *«Diccionario de palabras prohibidas»*.
- **Paso 2:** En el buscador de términos, escribir un fragmento (ej. `"guey"` o `"güey"`).
- **Resultado Esperado:** El backend ejecuta `GET /api/admin/palabras-prohibidas?buscar=guey` y normaliza acentos y diéresis devolviendo las coincidencias exactas.
- **Paso 3:** Probar agregar un nuevo término ofensivo local y guardar.
- **Resultado Esperado:** Se añade a Firestore y al caché en memoria. Al intentar publicar esa palabra en `/social`, el motor de moderación la detecta y la retiene.

---

### MÓDULO 7: Notificaciones y Navegación Dinámica

#### Componentes Clave:
- `src/features/auth/components/TopNav.tsx`
- `src/features/notifications/pages/NotificationsPage.tsx`
- `src/features/notifications/hooks/useNotifications.ts`

#### Casos de Prueba Paso a Paso:

##### Caso 7.1: Badge Numérico en la Campana Superior
- **Paso 1:** Iniciar sesión con un usuario que tenga notificaciones pendientes (o como `admin` con instituciones pendientes de verificar).
- **Resultado Esperado:** La campana superior muestra un badge rojo circular con el número exacto (`1`, `2` o `9+` si son más de 9).
- **Paso 2:** Hacer clic en la campana. Se despliega el menú flotante con las notificaciones más recientes.

##### Caso 7.2: Redirección al Hacer Clic en Notificaciones
- **Prueba 7.2.A (Alerta de Riesgo Admin):** Hacer clic en una notificación de tipo alerta de riesgo.
  - *Resultado Esperado:* Se cierra el menú y redirige a `http://localhost:5173/admin?tab=alerts`.
- **Prueba 7.2.B (Institución por Aprobar):** Hacer clic en *"Tareas administrativas pendientes"*.
  - *Resultado Esperado:* Redirige a `http://localhost:5173/admin?tab=institutions`.
- **Prueba 7.2.C (Publicación o Comentario):** Hacer clic en notificación de nuevo comentario o publicación.
  - *Resultado Esperado:* Redirige a `http://localhost:5173/social`.
- **Prueba 7.2.D (Postulación Laboral):** Si es rol empresa, redirige a `http://localhost:5173/empresa/dashboard`. Si es candidato, a `http://localhost:5173/jobs`.
- **Prueba 7.2.E (Página Completa de Notificaciones):** Ir a `/notifications`.
  - Hacer clic en cualquier tarjeta de notificación o en el enlace `Ir a la sección →`.
  - *Resultado Esperado:* La notificación se marca como leída y navega al destino correspondiente.
  - Probar las pestañas de filtro: `Todas`, `No leídas`, `Inteligencia`, `Riesgos`.

---

### MÓDULO 8: Accesibilidad Universal (A11y Bar)

#### Componentes Clave:
- `src/features/a11y/components/AccessibilityBar.tsx`
- `src/features/a11y/store/a11yStore.ts`

#### Casos de Prueba Paso a Paso:

##### Caso 8.1: Escala Tipográfica Dinámica
- **Paso 1:** Abrir la barra de accesibilidad (icono flotante o botón en el pie de página).
- **Paso 2:** Presionar el botón de aumento de tamaño de texto `[ +A ]` 3 veces.
- **Resultado Esperado:** Todos los textos de la interfaz aumentan de tamaño proporcionalmente mediante variables CSS (`--font-size-base`), sin desbordamientos de cajas, encimamientos de botones ni pérdida de legibilidad.
- **Paso 3:** Presionar `[ -A ]` hasta volver al tamaño normal (100%).

##### Caso 8.2: Modo de Alto Contraste
- **Paso 1:** Activar el interruptor *"Alto Contraste"*.
- **Resultado Esperado:** Los fondos se convierten en negro puro / blanco puro con bordes marcados de 2px de alto contraste, garantizando un ratio superior a 7:1 (cumplimiento WCAG AAA).

##### Caso 8.3: Tipografía para Dislexia
- **Paso 1:** Activar la opción *"Fuente para dislexia"*.
- **Resultado Esperado:** La fuente global cambia a `OpenDyslexic` con mayor peso en la base de los caracteres para evitar la rotación visual involuntaria de letras.

##### Caso 8.4: Reducción de Animaciones
- **Paso 1:** Activar *"Reducir movimiento"*.
- **Resultado Esperado:** Todas las animaciones CSS (`fade-in-up`, transiciones de modales y efectos de hover) se detienen inmediatamente.

---

## 4. MATRIZ RÁPIDA DE CREDENCIALES Y AMBIENTE DE PRUEBA

| Rol | Correo Sugerido | Contraseña Genérica | Enfoque Principal de Certificación |
|---|---|---|---|
| **PCD** | `usuario.pcd@raices.mx` | `Raices2026!` | Onboarding, rutas de vida, muro social, galería y postulación laboral con CV. |
| **Tutor** | `familiar.tutor@raices.mx` | `Raices2026!` | Dependientes a cargo y foros restringidos de padres/tutores. |
| **Empresa** | `empresa.ejemplo@raices.mx` | `Raices2026!` | Creación de vacantes accesibles, evaluación de candidatos y visor interactivo de CV. |
| **Institución** | `institucion.test@raices.mx` | `Raices2026!` | Servicios terapéuticos/educativos, eventos y respuesta a opiniones. |
| **Admin** | `admin@raices.mx` | `Raices2026!` | Mando global, auditoría, resolución de alertas de riesgo y moderación IA. |

---

## 5. TABLA DE CONTROL DE EJECUCIÓN (HOJA DE RESULTADOS QA)

| ID Caso | Módulo | Ruta Evaluada | Rol Ejecutante | Acción Clave | Resultado Esperado | Dictamen (Pass/Fail) |
|---|---|---|---|---|---|---|
| **TC-01** | Sesión | `/auth` | Cualquiera | Login con opción "Recordarme" | Token en localStorage y persistente tras recarga. | [ ] PASS |
| **TC-02** | Seguridad | `/admin` | `pcd` | Navegación directa por URL | Redirige fuera (403/Forbidden o `/inicio`). | [ ] PASS |
| **TC-03** | Identidad | `/verificacion-identidad` | `empresa` | Acceso persona moral | Redirige automáticamente a `/empresa/dashboard`. | [ ] PASS |
| **TC-04** | CV | `/empresa/dashboard` | `empresa` | Clic en `[ 📄 Ver CV ]` | Modal interactivo con zoom e impresión sin error CSP. | [ ] PASS |
| **TC-05** | CV | `/empresa/dashboard` | `empresa` | Clic en `[ 📥 ]` (Descargar) | Descarga el archivo PDF sin excepciones de red. | [ ] PASS |
| **TC-06** | Comunidad | `/social` | `pcd` | Filtro feed: `Experiencias` | Filtra posts de tipo historia y vivencias. | [ ] PASS |
| **TC-07** | Galería | `/social` (tab galería) | `pcd` | Clic en categoría sin foto | Estado vacío con botón `[ + Compartir ]` que precarga la categoría. | [ ] PASS |
| **TC-08** | Galería | `/social` (tab galería) | `pcd` | Post con imagen adjunta | Aparece en la cuadrícula visual de creaciones. | [ ] PASS |
| **TC-09** | Moderación | `/social` | `pcd` | Post con insultos o capacitismo | Retenido en cola; modal explicativo en Lectura Fácil. | [ ] PASS |
| **TC-10** | Moderación | `/social` | `pcd` | Post con cadena o spam | Retenido por spam; enviado a `/admin?tab=moderacion`. | [ ] PASS |
| **TC-11** | Admin | `/admin?tab=moderacion` | `admin` | Aprobar post retenido | Se publica y se vuelve visible en `/social`. | [ ] PASS |
| **TC-12** | Admin | `/admin?tab=moderacion` | `admin` | Búsqueda palabra prohibida | Normaliza acentos y encuentra términos en memoria. | [ ] PASS |
| **TC-13** | Notificaciones | Global (`TopNav`) | `admin` | Clic en alerta de riesgo | Redirige y abre directamente `/admin?tab=alerts`. | [ ] PASS |
| **TC-14** | Notificaciones | `/notifications` | Cualquiera | Clic en `Ir a la sección →` | Marca leída y navega al destino correspondiente. | [ ] PASS |
| **TC-15** | Directorio | `/explore` | Cualquiera | Búsqueda por CP (06000) | Resuelve estado y colonias de forma reactiva. | [ ] PASS |
| **TC-16** | A11y | Barra Accesibilidad | Cualquiera | Aumentar fuente (+A) | Escala tipografía sin romper componentes visuales. | [ ] PASS |
