# MANUAL DE AUDITORÍA Y BLINDAJE DE SEGURIDAD (FRONTEND & BACKEND) — RAÍCES
**Protocolo Técnico de Pentesting, Control de Acceso y Análisis de Vulnerabilidades (Entrega Final RC v2.0)**  
*Audiencia:* Equipo de QA, Seguridad (SecOps) y Líderes de Desarrollo | *Alcance:* Todo el Ecosistema

---

## 1. OBJETIVO Y MARCO DE AMENAZAS

El objetivo de este manual es proporcionar al equipo de QA una batería exhaustiva de **pruebas de penetración (pentesting funcional)** y validaciones de seguridad para garantizar que la plataforma RAÍCES sea impenetrable ante ataques comunes (OWASP Top 10 API & Web), proteja la privacidad de datos sensibles (PII de personas con discapacidad, menores y tutores) y cumpla con estrictas normas de control de acceso.

---

## 2. VECTORES DE SEGURIDAD Y CASOS DE PRUEBA (QA PENTESTING)

---

### VECTOR 1: Autenticación, Sesión y Manipulación de Tokens

#### Mecanismos Existentes en el Sistema:
- Emisión de JWT firmados y tokens de Firebase Auth.
- Cookies `httpOnly` seguras (`token_acceso`, `token_refresco`) con `SameSite=Lax`.
- Almacenamiento en el frontend: `localStorage` (cuando "Recordarme" es activo) o `sessionStorage` (sesión temporal).

#### Pruebas Críticas para QA:

##### Prueba SEC-01: Manipulación de Algoritmo JWT (Ataque "alg: none")
- **Objetivo:** Asegurar que el backend no acepte tokens sin firma o con algoritmos vulnerables.
- **Acción:**
  1. Tomar un token válido de usuario `pcd`.
  2. Modificar el header del JWT usando jwt.io: cambiar `"alg": "HS256"` por `"alg": "none"` y remover la firma.
  3. Enviar una petición a cualquier endpoint protegido:
     ```bash
     curl -H "Authorization: Bearer <TOKEN_MODIFICADO>" http://localhost:7000/api/usuarios/perfil
     ```
- **Resultado Esperado:** Respuesta inmediata **`401 Unauthorized`** (JWT invalid / signature required).

##### Prueba SEC-02: Expiración y Rotación de Refresh Tokens
- **Objetivo:** Verificar que un token expirado no pueda realizar acciones y que el token de refresco no sufra reutilización (*replay attack*).
- **Acción:**
  1. Enviar una petición con un token expirado.
  2. Verificar que el interceptor de Axios (`api.ts`) en el frontend captura el 401 y solicita refresco automático a `POST /api/auth/refrescar`.
  3. Si el refresh token es revocado o inválido, debe limpiar el almacenamiento y redirigir inmediatamente a `/auth`.

---

### VECTOR 2: Control de Acceso y Escalada de Privilegios (BOLA / IDOR)

#### Mecanismos Existentes en el Sistema:
- Guards de NestJS: `RolesGuard`, `JwtAuthGuard`, `DependientePropietarioGuard`, `InstitucionVerificadaGuard`.
- Decoradores `@Roles('admin')`, `@Roles('empresa')`, `@Roles('institution')`.

#### Pruebas Críticas para QA:

##### Prueba SEC-03: Escalada Vertical (PCD intentando ejecutar acciones de Admin)
- **Objetivo:** Verificar que un usuario normal no pueda invocar APIs de administración aunque conozca las URLs del backend.
- **Acción:**
  1. Iniciar sesión como usuario con rol `pcd` y obtener su token Bearer.
  2. Enviar las siguientes peticiones con ese token:
     ```bash
     # Intento 1: Aprobar publicación retenida por moderación
     curl -X PATCH -H "Authorization: Bearer <TOKEN_PCD>" \
       -H "Content-Type: application/json" \
       -d '{"decision":"aprobar"}' \
       http://localhost:7000/api/administracion/publicaciones/pub-123/moderacion

     # Intento 2: Consultar palabras prohibidas
     curl -H "Authorization: Bearer <TOKEN_PCD>" \
       http://localhost:7000/api/admin/palabras-prohibidas

     # Intento 3: Listar publicaciones rechazadas
     curl -H "Authorization: Bearer <TOKEN_PCD>" \
       http://localhost:7000/api/administracion/publicaciones-rechazadas
     ```
- **Resultado Esperado:** Todas deben responder estrictamente con **`403 Forbidden`** (Rol insuficiente: se requiere admin).

##### Prueba SEC-04: Escalada Horizontal / IDOR (Edición o Borrado de Contenido Ajeno)
- **Objetivo:** Comprobar que el Usuario A no pueda editar o borrar publicaciones del Usuario B.
- **Acción:**
  1. Con el Usuario B, crear una publicación y anotar su `id` (ej. `pub-999`).
  2. Con el Usuario A (logueado en otra ventana), intentar editar esa publicación:
     ```bash
     curl -X PUT -H "Authorization: Bearer <TOKEN_USUARIO_A>" \
       -H "Content-Type: application/json" \
       -d '{"contenido":"Hackeado por otro usuario"}' \
       http://localhost:7000/api/comunidad/publicaciones/pub-999
     ```
  3. Intentar borrarla con `DELETE /api/comunidad/publicaciones/pub-999`.
- **Resultado Esperado:** **`403 Forbidden`** o **`404 Not Found`**. Solo el autor legítimo o un administrador con auditoría activa pueden modificarla.

##### Prueba SEC-05: Protección de Dependientes (Tutor Privilegiado)
- **Objetivo:** Verificar que el Tutor X no pueda consultar o asociar dependientes del Tutor Y.
- **Acción:** Enviar solicitud con `dependienteId` ajeno a `GET /api/tutores/dependientes/:id`.
- **Resultado Esperado:** `DependientePropietarioGuard` bloquea el acceso con **`403 Forbidden`**.

---

### VECTOR 3: Inyección de Código y Cross-Site Scripting (XSS)

#### Mecanismos Existentes en el Sistema:
- Sanitización de HTML en backend: `sanitizeHtml(value)` en `CrearPublicacionDto`.
- React DOM por defecto escapa strings al renderizar (`{text}`).
- Eliminación de scripts y eventos en línea (`onerror`, `onload`).

#### Pruebas Críticas para QA:

##### Prueba SEC-06: Inyección XSS en Publicaciones y Comentarios
- **Objetivo:** Verificar que payloads maliciosos no se ejecuten en el navegador de otros usuarios.
- **Payloads a probar:**
  ```html
  <script>alert('XSS-1')</script>
  <img src="invalido" onerror="alert('XSS-2')">
  <a href="javascript:alert('XSS-3')">Haz clic aquí para ganar un premio</a>
  <svg/onload=alert('XSS-4')>
  <iframe src="https://sitio-malicioso.com"></iframe>
  ```
- **Acción:**
  1. Ir a `/social` y pegar cada uno de los payloads anteriores en el formulario de publicación y en la caja de comentarios.
  2. Publicar.
  3. Revisar el DOM resultante en el navegador:
     - En el frontend: El texto debe renderizarse como texto plano visible (`<script>...`), o bien las etiquetas peligrosas deben haber sido desinfectadas por `sanitizeHtml`.
     - **Verificación:** Bajo ninguna circunstancia debe ejecutarse la ventana emergente `alert()`.

---

### VECTOR 4: Seguridad en Carga de Archivos (Multimedia y Currículums)

#### Mecanismos Existentes en el Sistema:
- Validación de **Magic Bytes** (`magic-bytes.ts`): Verifica la cabecera binaria real del archivo en memoria, no solo la extensión `.jpg` o `.pdf`.
- Validadores NestJS: `MultimediaMagicBytesValidator`.
- Límites de tamaño en Multer (5 MB para imágenes, 10 MB para PDFs).

#### Pruebas Críticas para QA:

##### Prueba SEC-07: Ataque de Archivo Falso / Extensión Disfrazada (Polyglot)
- **Objetivo:** Evitar que un atacante suba un script ejecutable o PHP renombrado a `.pdf` o `.png`.
- **Acción:**
  1. Crear un archivo de texto con contenido malicioso (ej. `malware.sh` o `shell.php`).
  2. Renombrarlo manualmente a `curriculum.pdf` o `foto.png`.
  3. Intentar subirlo en:
     - La postulación de vacantes (`/jobs` → Subir CV).
     - La creación de publicaciones (`/social` → Adjuntar multimedia).
- **Resultado Esperado:** El validador `MultimediaMagicBytesValidator` inspecciona los primeros bytes del búfer binario. Si no coinciden con `25 50 44 46` (`%PDF`) o `FF D8 FF` (`JPEG`) o `89 50 4E 47` (`PNG`), la petición es rechazada con **`400 Bad Request: Formato de archivo corrupto o inválido`**.

##### Prueba SEC-08: Inyección XSS mediante Archivos SVG
- **Objetivo:** Los archivos SVG pueden contener código JavaScript embebido (`<script>`).
- **Acción:** Subir un archivo `.svg` que contenga `<script>alert('SVG-XSS')</script>`.
- **Resultado Esperado:** El backend rechaza el archivo si no está en la lista blanca de extensiones seguras o desinfecta los tags XML activos antes de almacenarlo.

---

### VECTOR 5: Aislamiento CSP y Visor de Documentos (Prevención de Ejecución de PDF)

#### ¿Por qué es un punto crítico en RAÍCES?
Chromium y navegadores modernos aplican políticas estrictas de seguridad (CSP). Si un sistema intenta cargar un PDF en un `<iframe src="blob:...">`, el visor nativo de Chromium puede bloquear la ejecución (`ERR_BLOCKED_BY_CSP: SE BLOQUEÓ`), o peor aún, si el PDF contiene JavaScript malicioso (Adobe Acrobat JS injection), podría ejecutarse en el contexto del origen.

#### Pruebas Críticas para QA:
1. **Prueba SEC-09:** Abrir el modal de postulante en `/empresa/dashboard` y hacer clic en `[ 📄 Ver CV ]`.
2. **Inspección de Consola (`F12`):**
   - Verificar que no hay advertencias de CSP violadas.
   - Verificar que el documento se renderiza mediante el visor visual A4 (`CvDocumentPreview`), sin incrustar plugins de terceros no sanitizados.
   - Probar los botones de `Zoom`, `Impresión` y `Descarga`.

---

### VECTOR 6: Rate Limiting y Prevención de Denegación de Servicio (DoS)

#### Mecanismos Existentes en el Sistema:
- `CustomThrottlerGuard` configurado en `AppModule`.
- Límites estrictos por endpoint:
  - Creación de publicaciones: Máximo 5 por minuto.
  - Resolución de moderación admin: Máximo 20 por minuto.
  - Llamadas a Gemini AI: Rate limit y control de concurrencia.

#### Pruebas Críticas para QA:

##### Prueba SEC-10: Inundación de Peticiones (Spamming DoS)
- **Acción:** Ejecutar un script rápido (o 10 peticiones consecutivas en bucle) a `POST /api/comunidad/publicaciones`.
- **Resultado Esperado:** Al llegar a la 6ª petición en menos de un minuto, el servidor debe responder con **`429 Too Many Requests: Has superado el límite de publicaciones permitidas por minuto. Por favor, espera un momento.`**.

---

### VECTOR 7: Fuga de Datos Confidenciales (PII / Data Leakage)

#### Pruebas Críticas para QA:

##### Prueba SEC-11: Sanitización de Errores y Stack Traces
- **Acción:** Enviar peticiones malformadas a propósito (ej. JSON con sintaxis rota `{ "invalido": }`, o IDs con caracteres especiales `null`, `[object Object]`, `../../etc/passwd`).
- **Resultado Esperado:**
  - `GlobalExceptionFilter` captura la excepción.
  - La respuesta HTTP devuelve un JSON limpio: `{ "statusCode": 400, "message": "...", "timestamp": "..." }`.
  - **Inspección:** Bajo ninguna circunstancia la respuesta al cliente debe contener rutas internas de carpetas del servidor (`C:\Users\ruizs\...`), variables de entorno, contraseñas de base de datos ni stack traces de Node.js.

---

## 3. RECOMENDACIONES DE BLINDAJE PARA EL EQUIPO DE DESARROLLO

Para la entrega final a producción, se recomienda aplicar el siguiente checklist de endurecimiento (*hardening*):

### 1. Cabeceras HTTP de Seguridad (Helmet en Backend)
Asegurar que `helmet()` esté activo en `main.ts` con las siguientes directivas:
```ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https://storage.googleapis.com"],
      connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://firestore.googleapis.com"],
      frameAncestors: ["'none'"], // Evita ataques de Clickjacking (iframes en sitios de terceros)
    },
  },
  crossOriginEmbedderPolicy: false, // Permite cargar recursos multimedia externos
}))
```

### 2. Reglas de Seguridad en Firestore (`firestore.rules`)
Garantizar que la base de datos Firestore tenga reglas estrictas para que ningún usuario pueda escribir directamente sin pasar por las validaciones de NestJS:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Por defecto, lectura y escritura bloqueadas
    match /{document=**} {
      allow read, write: if false; // Solo el backend vía Firebase Admin SDK tiene acceso
    }
  }
}
```

### 3. Mascarado de PII en Auditoría
En `AuditInterceptor`: Asegurarse de que campos sensibles como `password`, `token`, `curp`, `cvv` y `tarjeta` sean reemplazados por `***` antes de persistirse en la colección `auditoria`.

---

## 4. CHECKLIST DE DICTAMEN DE SEGURIDAD QA

| Control de Seguridad | Vector Evaluado | Estado Esperado | Verificado (P / F) |
|---|---|---|---|
| **CORS Restringido** | Orígenes no autorizados bloqueados | Rechazado con error de CORS | [ ] PASS |
| **Protección XSS** | Scripts en posts y comentarios | Texto escapado, sin ejecución de script | [ ] PASS |
| **BOLA / IDOR Posts** | Edición de post con usuario ajeno | `403 Forbidden` | [ ] PASS |
| **BOLA / IDOR Admin** | Invocación de `/admin/*` con token PCD | `403 Forbidden` | [ ] PASS |
| **Magic Bytes** | Subida de `.exe` o `.php` renombrado a `.pdf` | `400 Bad Request` | [ ] PASS |
| **CSP Visor CV** | Renderizado de CV en rol empresa | 0 errores en consola Chromium | [ ] PASS |
| **Rate Limit** | > 5 posts por minuto | `429 Too Many Requests` | [ ] PASS |
| **Stack Trace Leak** | Errores 500 intencionales | Sin rutas de servidor ni código fuente | [ ] PASS |
| **Protección CURP** | Redirección de rol Empresa en identidad | Redirigido a `/empresa/dashboard` | [ ] PASS |

