# 📋 Reporte: Algoritmo de Verificación de Identidad e Instituciones

**Fecha:** 1 de septiembre de 2026  
**Proyecto:** Raíces — Plataforma de inclusión  
**Ámbito:** Frontend (React + TanStack Query)  
**Backend:** `https://raices-backend-219843566314.us-central1.run.app`

---

## 1. Vista General del Sistema

El sistema de verificación opera en **3 niveles**:

| Nivel | Descripción | Quién actúa |
|-------|-------------|-------------|
| **Identidad (persona)** | CURP + Identificación oficial | Usuario → Admin aprueba |
| **CSF (institución)** | Constancia de Situación Fiscal con QR | Institución → validación automática |
| **Institución (organización)** | Aprobación + Verificación de la institución | Admin aprueba y verifica |

---

## 2. Flujo de Verificación de Identidad (Persona / PCD / Tutor / Institución)

### 2.1 Componentes involucrados

| Archivo | Rol |
|---------|-----|
| `src/features/profile/hooks/useDocumentoIdentidad.js` | Hooks: `useEstadoValidacion()`, `useSubirDocumentoIdentidad()` |
| `src/features/profile/pages/MiIdentidadPage.jsx` | UI: Formulario de subida + estado de verificación |
| `src/features/admin/hooks/useAdmin.js` | Hooks admin: `useAdminVerificaciones()`, `useAprobarVerificacion()`, `useRechazarVerificacion()` |
| `src/features/admin/components/IdentitiesTab.jsx` | UI admin: Cola de documentos pendientes |

### 2.2 Endpoints consumidos

| Endpoint | Método | Hook | Descripción |
|----------|--------|------|-------------|
| `/usuarios/estado-validacion-identidad` | GET | `useEstadoValidacion` | Consulta estado actual del usuario |
| `/usuarios/documento-identidad` | POST | `useSubirDocumentoIdentidad` | Sube CURP o identificación (multipart/form-data) |
| `/administracion/documentos-identidad/pendientes` | GET | `useAdminVerificaciones` | Lista documentos pendientes (admin) |
| `/administracion/documentos-identidad/{id}/aprobar` | POST | `useAprobarVerificacion` | Aprueba un documento (admin) |
| `/administracion/documentos-identidad/{id}/rechazar` | POST | `useRechazarVerificacion` | Rechaza un documento con motivo (admin) |

### 2.3 Estados posibles

```
sin_documentos → pendiente → aprobado
                          → rechazado → (puede re-subir) → pendiente → ...
```

| Estado | Significado visual | Color UI |
|--------|-------------------|----------|
| `sin_documentos` | No ha subido nada | Gris (#94a3b8) |
| `pendiente` | Documentos enviados, en espera de revisión | Naranja (#D4944C) |
| `aprobado` | Identidad verificada exitosamente | Verde (#10B981) |
| `rechazado` | Documento rechazado, puede re-subir | Rojo (#DC3545) |

### 2.4 Lógica de la UI de usuario (`MiIdentidadPage.jsx`)

**Pestaña de navegación:** "Verificación de identidad" | "Seguridad"

**Cuando `estado === 'sin_documentos'` o `'rechazado'`:**
1. Muestra formulario para ingresar número de CURP (18 caracteres, input monospace)
2. Muestra `DocumentUploader` para CURP (acepta JPEG, PNG, WebP, PDF — máx 10MB)
3. Muestra `DocumentUploader` para identificación oficial
4. El componente `DocumentUploader`:
   - Valida tipo MIME del archivo en el cliente
   - Valida tamaño máximo (10MB)
   - Muestra preview de imagen si es imagen
   - Muestra nombre y tamaño si es PDF
   - Al subir: llama `useSubirDocumentoIdentidad.mutateAsync({ tipo, file, numeroCurp })`
   - Invalida query `['documento-identidad']` al completar

**Cuando `estado === 'pendiente'`:**
- Muestra spinner animado con mensaje "Documentos en revisión"
- No permite subir más documentos

**Cuando `estado === 'aprobado'`:**
- Muestra check verde con "Identidad verificada"
- No permite subir más documentos

**Cuando `estado === 'rechazado'`:**
- Muestra el motivo de rechazo
- Permite re-subir documentos

**Tarjeta de estado (siempre visible):**
- Muestra badge de estado con color
- Muestra si tiene CURP: ✓ Subido / No subido
- Muestra si tiene identificación: ✓ Subido / No subido
- Muestra CURP declarada (si existe)
- Muestra fecha de última subida

### 2.5 Lógica del admin (`IdentitiesTab.jsx`)

1. **Agrupación por usuario:** Los documentos se agrupan por `usuarioId` usando la función `groupByUser()`
2. **Ordenamiento:** Prioriza usuarios con más documentos pendientes
3. **Filtros:** Pendientes / Aprobados / Rechazados / Todos
4. **Por cada usuario se muestra:**
   - Nombre, email, rol (PCD, Tutor, Institución, Admin)
   - Badges resumen: X pendientes, Y aprobados, Z rechazados
   - Lista de documentos con: tipo, CURP declarada, estado, link "Ver" al documento, botones Aprobar/Rechazar
5. **Acciones por documento:**
   - **Aprobar:** Llama `useAprobarVerificacion.mutateAsync(id)`
   - **Rechazar:** Abre modal que pide motivo (obligatorio), luego llama `useRechazarVerificacion.mutateAsync({ id, motivo })`
6. **Acciones en lote (cuando hay múltiples pendientes por usuario):**
   - "Aprobar todos (N)" → confirma con `window.confirm`, procesa secuencialmente
   - "Rechazar todos (N)" → abre modal con motivo único para todos
7. **Feedback:** Usa `addToast()` para notificar éxito/error de cada operación

---

## 3. Flujo de Institución

### 3.1 Componentes involucrados

| Archivo | Rol |
|---------|-----|
| `src/features/institutions/pages/InstitutionPortalPage.jsx` | Portal principal con checklist de verificación |
| `src/features/institutions/pages/EditarInstitucionPage.jsx` | Edición de institución + sección CSF |
| `src/features/institutions/pages/CrearInstitucionPage.jsx` | Registro de nueva institución (datos básicos) |
| `src/features/institutions/hooks/useInstitutions.js` | Hooks: `useMiInstitucion`, `useUpdateMiInstitucion`, `useValidarCsfQr` |
| `src/features/institutions/hooks/useAdminInstitutions.js` | Hooks admin: `useAllInstitutions`, `usePendingInstitutions`, `useApproveInstitution`, `useRejectInstitution`, `useToggleVerifyInstitution` |
| `src/features/admin/components/InstitutionsTab.jsx` | Panel admin de instituciones |

### 3.2 Endpoints consumidos por la institución

| Endpoint | Método | Hook | Descripción |
|----------|--------|------|-------------|
| `/instituciones/mi-institucion` | GET | `useMiInstitucion` | Obtiene datos de la institución del usuario |
| `/instituciones/mi-institucion` | PUT | `useUpdateMiInstitucion` | Actualiza datos de la institución |
| `/instituciones/validar-csf-qr` | POST | `useValidarCsfQr` | Valida CSF con código QR (multipart) |
| `/usuarios/estado-validacion-identidad` | GET | `useEstadoValidacion` | Consulta estado de documentos de identidad |

### 3.3 Endpoints consumidos por el admin para instituciones

| Endpoint | Método | Hook | Descripción |
|----------|--------|------|-------------|
| `/administracion/instituciones` | GET | `useAllInstitutions` | Lista todas las instituciones |
| `/administracion/instituciones/pendientes` | GET | `usePendingInstitutions` | Lista pendientes de aprobación |
| `/administracion/instituciones/{id}/aprobar` | POST | `useApproveInstitution` | Aprueba institución (is_active = true) |
| `/administracion/instituciones/{id}` | DELETE | `useRejectInstitution` | Elimina institución |
| `/administracion/instituciones/{id}/verificar` | PATCH | `useToggleVerifyInstitution` | Alterna verificación (is_verified) |

### 3.4 Estados de una institución

```
Registro → is_active: false, is_verified: false
    ↓ Admin aprueba
is_active: true, is_verified: false
    ↓ Admin verifica
is_active: true, is_verified: true  ← Puede publicar vacantes
```

**`isActive` en el frontend se calcula como:**
```javascript
const isActive = institution?.is_active && institution?.is_verified
```

### 3.5 Checklist de verificación (`InstitutionPortalPage.jsx`)

Se muestra cuando `institution.is_verified === false`. Muestra 3 pasos:

| Paso | Descripción | Estado detectado | Acción |
|------|-------------|------------------|--------|
| 1 | Subir CURP e Identificación oficial | `identidadStatus?.estado === 'aprobado'` | Botón "Ir a subir" → `/configuracion?tab=verificacion` |
| 2 | Subir Constancia de Situación Fiscal (CSF) | Siempre muestra "Desde Editar institución" | Botón "Ir a editar" → `/institution-portal/editar` |
| 3 | Esperar revisión del administrador | Informativo, sin acción | — |

**Nota:** El paso 2 NO detecta si la CSF ya fue validada. Solo muestra el estado estático.

### 3.6 Sección CSF en Editar Institución (`EditarInstitucionPage.jsx`)

1. Input file oculto acepta `.pdf, .jpg, .jpeg, .png`
2. Al seleccionar archivo, muestra nombre del archivo
3. Botón "Validar CSF" llama `useValidarCsfQr.mutateAsync(csfFile)`
4. Si éxito: muestra "CSF validada exitosamente" con RFC (si viene en la respuesta)
5. Si error: muestra toast con mensaje del backend

**Sección "Estado de verificación" al final del formulario:**
- Muestra estado de CURP + Identificación (con link a subir si no tiene)
- Muestra estado de CSF (validada o pendiente)

---

## 4. Flujo de Registro de Institución (`RegistrationWizard.jsx`)

El wizard de registro tiene **11 pasos**:

1. Tipo de usuario (PCD / Tutor / Institución)
2. Tipo de acompañamiento
3. Condiciones (si es PCD)
4. Temporalidad
5. Escalas de vida (1/2)
6. Escalas de vida (2/2)
7. Formatos de información
8. Intereses
9. Viabilidad económica
10. Resumen / Bienvenida

**Nota:** El wizard NO solicita CURP ni identificación oficial durante el registro. Estos documentos se suben después desde `MiIdentidadPage`.

Para instituciones, después del wizard se redirige a `/institution-portal/registro` (`CrearInstitucionPage.jsx`) donde se capturan:
- Nombre, descripción, categoría
- Email, teléfono, dirección
- Ciudad, estado
- Tipos de discapacidad que atiende
- Datos de verificación (fase 2): RFC, documento legal, sitio web, etc.

---

## 5. Protección de Rutas (`App.jsx`)

| Ruta | Protección | Verificación |
|------|-----------|-------------|
| `/configuracion?tab=verificacion` | `ProtectedRoute` (cualquier rol) | Ninguna adicional |
| `/institution-portal` | `ProtectedRoute role="institution"` | Solo rol institution |
| `/institution-portal/registro` | `ProtectedRoute role="institution"` | Solo rol institution |
| `/institution-portal/editar` | `ProtectedRoute role="institution"` | Solo rol institution |
| `/admin` | `ProtectedRoute role="admin"` | Solo rol admin |
| `/jobs` | `FeatureGuard feature="postulaciones"` | Verifica feature habilitada |

**No existe ningún `InstitucionVerificadaGuard`** en el código actual.

---

## 6. Flujo Completo Conectado

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO SE REGISTRA                   │
│  (RegistrationWizard → rol: institution)                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               REGISTRA INSTITUCIÓN                       │
│  (CrearInstitucionPage → datos básicos)                  │
│  POST /instituciones → is_active: false                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           PORTAL MUESTRA CHECKLIST                       │
│  (InstitutionPortalPage → 3 pasos)                       │
│                                                          │
│  Paso 1: CURP + ID → /configuracion?tab=verificacion    │
│  Paso 2: CSF → /institution-portal/editar                │
│  Paso 3: Esperar admin                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────────┐
   │  CURP    │ │  CSF     │ │  Admin       │
   │  + ID    │ │  Upload  │ │  Revisión    │
   │  upload  │ │  + QR    │ │              │
   └────┬─────┘ └────┬─────┘ └──────┬───────┘
        │            │              │
        ▼            ▼              ▼
   POST /doc-    POST /csf-     POST /instituciones/
   identidad     validar-qr     {id}/aprobar
        │                         │
        ▼                         ▼
   Admin: Tab              Admin: Tab
   "Verificación"          "Instituciones"
   aprueba/rechaza         aprueba + verifica
```

---

## 7. Datos que viajan en cada request

### Subir documento de identidad
```javascript
// POST /usuarios/documento-identidad
// Content-Type: multipart/form-data
{
  tipo: "curp" | "identificacion_oficial",
  documento: File,           // JPEG, PNG, WebP, PDF (max 10MB)
  numeroCurp: "GAPL800101HMCYRL09"  // Solo si tipo = "curp"
}

// Respuesta 201:
{
  tipo: "curp",
  urlDocumento: "https://firebasestorage.googleapis.com/...",
  estado: "pendiente",
  fechaSubida: "2026-08-26T00:00:00.000Z",
  numeroCurp: "GAPL800101HMCYRL09"
}
```

### Validar CSF
```javascript
// POST /instituciones/validar-csf-qr
// Content-Type: multipart/form-data
{
  archivo: File   // PDF, JPG, JPEG, PNG
}

// Respuesta 200 (éxito):
{
  rfc: "...",
  // ... datos fiscales extraídos del QR
}
```

### Estado de validación
```javascript
// GET /usuarios/estado-validacion-identidad
// Respuesta 200:
{
  estado: "sin_documentos" | "pendiente" | "aprobado" | "rechazado",
  tieneCurp: boolean,
  tieneIdentificacion: boolean,
  numeroCurp: "GAPL800101HMCYRL09",
  motivoRechazo: null | string,
  fechaSubida: "2026-08-26T00:00:00.000Z",
  fechaRevision: null | string
}
```

### Aprobar documento
```javascript
// POST /administracion/documentos-identidad/{id}/aprobar
// Respuesta: 204 (sin body) o 404
```

### Rechazar documento
```javascript
// POST /administracion/documentos-identidad/{id}/rechazar
// Body: { motivo: "Imagen borrosa, no se lee la CURP" }
// Respuesta: 204, 400 (sin motivo), o 404
```

---

## 8. Cache y React Query

| Query Key | staleTime | refetchOnWindowFocus |
|-----------|-----------|---------------------|
| `['documento-identidad', 'estado']` | 2 min | No |
| `['admin', 'verificaciones', filters]` | 2 min | No |
| `['admin', 'stats']` | 5 min | No |
| `['admin', 'institutions']` | Default | No |
| `['mi-institucion']` | Default | No |

**Invalidación de cache:**
- Al subir documento: `invalidateQueries(['documento-identidad'])`
- Al aprobar/rechazar documento: `invalidateQueries(['admin', 'verificaciones'])` + `['admin', 'stats']`
- Al aprobar/verificar institución: `invalidateQueries(['admin'])` (completo)
- Al actualizar institución: `invalidateQueries(['admin'])` + `['institutions']`

---

## 9. Validaciones en Frontend

| Validación | Dónde | Detalle |
|------------|-------|---------|
| Tipo MIME del archivo | `MiIdentidadPage.jsx` (DocumentUploader) | Solo JPEG, PNG, WebP, PDF |
| Tamaño máximo | `MiIdentidadPage.jsx` (DocumentUploader) | 10 MB |
| CURP 18 caracteres | `MiIdentidadPage.jsx` | Input maxlength=18, toUpperCase automático |
| Motivo de rechazo obligatorio | `IdentitiesTab.jsx` | Validación HTML `required` + check JS |
| Nombre de institución obligatorio | `CrearInstitucionPage.jsx` | Validación en `handleSubmit` |
| Archivo CSF obligatorio | `EditarInstitucionPage.jsx` | Check `if (!csfFile) return` antes de validar |

---

## 10. Flujos que NO están conectados (gaps conocidos)

| Gap | Descripción | Impacto |
|-----|-------------|---------|
| `InstitucionVerificadaGuard` no existe | No hay guard que bloquee acciones de instituciones no verificadas | La institución puede intentar publicar vacantes sin estar verificada (el backend debería rechazarlo) |
| CSF no persiste en frontend | `useValidarCsfQr` solo valida, pero `csfResult` es estado local del componente | Al recargar la página, se pierde el estado de CSF validada |
| Checklist Paso 2 no detecta CSF | El paso 2 del checklist siempre muestra "Desde Editar institución" sin verificar si ya se subió | No hay feedback visual de completitud |
| CSF no se almacena como estado de verificación | La CSF se valida pero no se conecta al sistema de `is_verified` de la institución | La verificación de la institución depende solo del admin, no del estado de CSF |
| No hay notificaciones push al usuario | Cuando el admin aprueba/rechaza, el usuario no recibe notificación en tiempo real | El usuario debe recargar la página para ver cambios |
