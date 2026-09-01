# 🔍 Análisis de Deficiencias y Mejoras — Verificación de Identidad

**Fecha:** 1 de septiembre de 2026  
**Proyecto:** Raíces  
**Objetivo:** Identificar deficiencias actuales y proponer mejoras para revisión por QA

---

## 🔴 DEFICIENCIAS CRÍTICAS

### D1. No existe `InstitucionVerificadaGuard`

**Ubicación esperada:** `src/features/auth/components/` o como wrapper en `App.jsx`  
**Estado actual:** No existe ningún componente que verifique `institution.is_verified` antes de permitir acciones.

**Problema:**  
Según la documentación del proyecto, una institución no verificada NO debería poder:
- Crear vacantes de empleo
- Aparecer en el directorio público
- Publicar contenido

**Actualmente:** La única protección es el `ProtectedRoute role="institution"` que solo verifica el rol, no el estado de verificación.

**Riesgo:** Una institución recién registrada podría intentar publicar vacantes. Si el backend no valida esto, se crearían vacantes de instituciones no verificadas.

**Mejora propuesta:**
```javascript
// Crear InstitucionVerificadaGuard.jsx
function InstitucionVerificadaGuard({ children, action }) {
  const { data: institution } = useMiInstitucion()
  const { data: identidadStatus } = useEstadoValidacion()
  
  const isVerified = institution?.is_verified
  const hasCsf = /* detectar CSF */;
  const identityApproved = identidadStatus?.estado === 'aprobado'
  
  if (!isVerified) {
    return <VerificationRequiredScreen 
      step={getNextStep(institution, identidadStatus)} 
      action={action} 
    />
  }
  
  return children
}
```

---

### D2. CSF no persiste en el estado global

**Archivo:** `src/features/institutions/pages/EditarInstitucionPage.jsx`  
**Líneas:** 67-71

**Problema:**
```javascript
const [csfResult, setCsfResult] = useState(null) // ← Estado local
const validarCsf = useValidarCsfQr()
```

`csfResult` es un `useState` local. Si el usuario:
1. Valida la CSF exitosamente
2. Navega a otra página
3. Regresa

El resultado de CSF se pierde. No hay forma de saber si ya se validó la CSF anteriormente.

**Mejora propuesta:**
- Agregar endpoint `GET /instituciones/mi-institucion/csf-status` o incluir el estado de CSF en la respuesta de `useMiInstitucion`
- O usar `useQuery` con key `['institution-csf', id]` que persista en cache

---

### D3. Checklist de verificación no detecta completitud real

**Archivo:** `src/features/institutions/pages/InstitutionPortalPage.jsx`  
**Líneas:** 98-162

**Problema:** El paso 2 (CSF) siempre muestra el mismo estado sin importar si ya se subió o no:

```jsx
{/* Step 2: CSF — SIEMPRE muestra lo mismo */}
<div style={{ ... }}>
  <div style={{ ... }}>2</div>
  <div>
    <div>Subir Constancia de Situación Fiscal (CSF)</div>
    <div>Desde Editar institución > Sección CSF</div>  {/* ← No cambia */}
  </div>
  <button onClick={() => navigate('/institution-portal/editar')}>
    Ir a editar
  </button>
</div>
```

**Mejora propuesta:**
```jsx
{/* Step 2: CSF — Detectar estado */}
<div style={{
  background: csfValidated ? 'rgba(16,185,129,0.06)' : 'var(--bg-warm)',
  borderColor: csfValidated ? 'rgba(16,185,129,0.2)' : 'var(--border-color)',
}}>
  <div style={{
    background: csfValidated ? '#10B981' : 'var(--border-color)',
  }}>
    {csfValidated ? Icons.check({ s: 14 }) : '2'}
  </div>
  <div>
    <div>Subir Constancia de Situación Fiscal (CSF)</div>
    <div>
      {csfValidated ? 'CSF validada ✓' : 
       institution?.csf_pendiente ? 'CSF en validación...' :
       'Desde Editar institución > Sección CSF'}
    </div>
  </div>
  {!csfValidated && !institution?.csf_pendiente && (
    <button onClick={() => navigate('/institution-portal/editar')}>
      Ir a editar
    </button>
  )}
</div>
```

---

## 🟡 DEFICIENCIAS FUNCIONALES

### D4. No hay notificaciones de cambios de estado

**Archivo:** `src/features/profile/pages/MiIdentidadPage.jsx`  
**Problema:** Cuando el admin aprueba o rechaza documentos, el usuario no recibe ninguna notificación. Debe navegar manualmente a la página de verificación para ver el cambio.

**Impacto:** El usuario no sabe que sus documentos fueron revisados.

**Mejora propuesta:**
- Implementar notificaciones push (ya existe `useFCM.js` en el proyecto)
- Agregar un badge de notificación en la sidebar/navegación cuando hay cambios de estado
- Mostrar toast automático al detectar cambio de estado (polling o WebSocket)

---

### D5. La validación de CURP es solo de longitud, no de formato

**Archivo:** `src/features/profile/pages/MiIdentidadPage.jsx`  
**Línea:** ~267

**Problema:**
```javascript
onChange={e => setCurpNumber(e.target.value.toUpperCase().slice(0, 18))}
```

Solo valida que sean 18 caracteres. No valida:
- Que tenga el formato correcto de CURP mexicana
- Que los primeros 6 sean dígitos (fecha de nacimiento)
- Que la posición 11 sea una vocal (sexo)
- Que los últimos 4 sean alfanuméricos

**Mejora propuesta:**
```javascript
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/

// En handleUpload:
if (!CURP_REGEX.test(numeroCurp)) {
  addToast('El formato de la CURP no es válido. Debe ser 18 caracteres alfanuméricos.', 'error')
  return
}
```

---

### D6. El upload de documentos no tiene retry automático

**Archivo:** `src/features/profile/hooks/useDocumentoIdentidad.js`  
**Problema:** Si la subida falla (error de red, timeout), el usuario debe intentar manualmente. No hay retry automático.

**Mejora propuesta:**
```javascript
export function useSubirDocumentoIdentidad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tipo, file, numeroCurp }) => { /* ... */ },
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documento-identidad'] })
    },
  })
}
```

---

### D7. El admin no puede pre-llenar motivo de rechazo con plantillas

**Archivo:** `src/features/admin/components/IdentitiesTab.jsx`  
**Líneas:** ~440-480

**Problema:** El admin debe escribir el motivo del rechazo desde cero cada vez. No hay plantillas ni sugerencias.

**Mejora propuesta:**
```javascript
const REJECT_TEMPLATES = [
  'Imagen borrosa, no se lee la CURP',
  'Documento vencido',
  'No corresponde al titular',
  'CURP con formato incorrecto',
  'Archivo corrupto o ilegible',
  'Documento parcialmente visible',
]

// En el modal de rechazo, agregar botones de sugerencia:
{REJECT_TEMPLATES.map(t => (
  <button key={t} onClick={() => setRejectReason(t)}
    style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, ... }}>
    {t}
  </button>
))}
```

---

### D8. No hay paginación en la cola de documentos del admin

**Archivo:** `src/features/admin/components/IdentitiesTab.jsx`  
**Problema:** La cola muestra todos los documentos sin paginación. Si hay muchos documentos pendientes, la UI puede volverse lenta.

**Nota:** La API soporta paginación (`?pagina=1&limite=20`) pero el frontend no la usa:
```javascript
// useAdmin.js
queryFn: () => api.get('/administracion/documentos-identidad/pendientes', { params: filters })
// No envía pagina ni limite
```

**Mejora propuesta:** Agregar paginación similar a la de `InstitutionsTab.jsx` que ya tiene paginación implementada.

---

### D9. No hay confirmación antes de aprobar un solo documento

**Archivo:** `src/features/admin/components/IdentitiesTab.jsx`  
**Línea:** ~338-341

**Problema:**
```javascript
const handleApproveOne = useCallback(async (id) => {
  const ok = await processDoc(id, 'approve')  // ← Sin confirmación
  addToast(ok ? 'Documento aprobado' : 'Error al aprobar', ok ? 'success' : 'error')
}, [processDoc, addToast])
```

Al aprobar un documento individual no hay `window.confirm()` como sí lo hay en el batch (`handleApproveOne` batch sí usa confirm). Un clic accidental puede aprobar un documento.

**Mejora propuesta:** Agregar `window.confirm('¿Aprobar este documento?')` o usar un modal de confirmación más elegante.

---

## 🟠 DEFICIENCIAS DE UX

### D10. No se muestra el documento actual cuando el estado es "pendiente"

**Archivo:** `src/features/profile/pages/MiIdentidadPage.jsx`  
**Problema:** Cuando el estado es `pendiente`, solo se muestra un spinner. El usuario no puede ver qué documentos subió ni descargarlos.

**Mejora propuesta:** Mostrar las URLs de los documentos subidos (con link "Ver documento") incluso en estado pendiente, tal como el admin los ve.

---

### D11. El botón "Eliminar cuenta" no tiene doble confirmación

**Archivo:** `src/features/profile/pages/MiIdentidadPage.jsx`  
**Líneas:** ~545-555

**Problema:** El botón "Eliminar cuenta" en la pestaña de Seguridad no tiene ninguna confirmación. Un clic accidental eliminaría la cuenta.

**Mejora propuesta:**
```javascript
const handleDeleteAccount = () => {
  if (!window.confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.')) return
  // Mostrar segundo modal con input de confirmación
}
```

---

### D12. La CSF se valida pero no se muestra el RFC en ningún sitio persistente

**Archivo:** `src/features/institutions/pages/EditarInstitucionPage.jsx`  
**Línea:** ~508-514

**Problema:** Si la CSF se valida y el backend retorna el RFC, solo se muestra en la sección de CSF del formulario de edición. No se almacena en el perfil de la institución ni se muestra en el portal.

**Mejora propuesta:** 
- Almacenar el RFC validado en los datos de la institución
- Mostrar el RFC en la tarjeta de información del portal
- Incluir el RFC en el panel de admin para referencia

---

### D13. El wizard de registro no menciona la verificación de identidad

**Archivo:** `src/features/auth/components/RegistrationWizard.jsx`  
**Problema:** El paso final del wizard ("Gracias por tu confianza") menciona:

```javascript
'Una vez que validemos tu identidad, te haremos llegar un correo...'
```

Pero no explica CÓMO ni DÓNDE subir los documentos de identidad. El usuario queda con la idea de que alguien validará algo, pero no sabe que debe ir a Configuración > Verificación de identidad.

**Mejora propuesta:** Agregar un paso o mensaje explícito que diga:

```
Siguiente paso: Ve a Configuración > Verificación de identidad 
para subir tu CURP e identificación oficial.
```

---

## 🔵 DEFICIENCIAS TÉCNICAS

### D14. No hay testing unitario para hooks de verificación

**Archivos:** `src/features/profile/hooks/useDocumentoIdentidad.js`, `src/features/admin/hooks/useAdmin.js`

**Problema:** No existen archivos de test para estos hooks. Solo hay tests para `ProtectedRoute`.

**Mejora propuesta:**
```javascript
// useDocumentoIdentidad.test.js
describe('useEstadoValidacion', () => {
  it('returns sin_documentos when no documents uploaded', async () => { ... })
  it('returns pendiente after upload', async () => { ... })
  it('handles 401 gracefully', async () => { ... })
})

describe('useSubirDocumentoIdentidad', () => {
  it('sends FormData with correct fields', async () => { ... })
  it('includes numeroCurp only for CURP type', async () => { ... })
  it('invalidates query on success', async () => { ... })
})
```

---

### D15. Hay código duplicado entre `useAdmin.js` y `useAdminInstitutions.js`

**Archivos:** 
- `src/features/admin/hooks/useAdmin.js`
- `src/features/institutions/hooks/useAdminInstitutions.js`

**Problema:** Ambos archivos definen hooks admin con la misma lógica de `useIsAdmin()` y patrones de query/mutation. La función `useIsAdmin` está duplicada.

**Mejora propuesta:** Extraer `useIsAdmin` a un archivo compartido o consolidar los hooks admin en un solo módulo.

---

### D16. Las keys de React Query para institución son inconsistentes

**Problema:** Se usan múltiples keys diferentes para datos de la misma institución:

| Key | Archivo |
|-----|---------|
| `['mi-institucion']` | `useInstitutions.js` |
| `['admin', 'institutions']` | `useAdminInstitutions.js` |
| `['institution-detail', id]` | `useInstitutions.js` |
| `['admin', 'institution-detail', id]` | `InstitutionsTab.jsx` |

**Riesgo:** Invalidar una key no invalida las demás, lo que puede causar datos stale.

**Mejora propuesta:** Establecer un esquema de keys consistente:
```javascript
const institutionKeys = {
  all: ['instituciones'],
  mine: () => [...institutionKeys.all, 'mi'],
  detail: (id) => [...institutionKeys.all, 'detalle', id],
  admin: {
    all: () => [...institutionKeys.all, 'admin'],
    pending: () => [...institutionKeys.admin.all(), 'pendientes'],
  }
}
```

---

### D17. El componente `DocumentUploader` tiene mucha lógica inline

**Archivo:** `src/features/profile/pages/MiIdentidadPage.jsx`  
**Líneas:** 39-190

**Problema:** El componente `DocumentUploader` maneja:
- Selección de archivo
- Validación de tipo MIME y tamaño
- Preview de imagen
- Llamada al mutation
- Estados de loading/error
- UI de drag & drop (parcial)

Todo en un solo componente de ~150 líneas con lógica de negocio mezclada con UI.

**Mejora propuesta:** Separar en:
- `useFileUpload()` — hook con validación y mutation
- `FilePreview` — componente de preview
- `DocumentUploader` — componente de orquestación

---

## 📊 RESUMEN DE PRIORIDADES

| # | Deficiencia | Prioridad | Esfuerzo | Impacto |
|---|------------|-----------|----------|---------|
| D1 | Falta `InstitucionVerificadaGuard` | 🔴 Crítica | Alto | Seguridad |
| D2 | CSF no persiste | 🔴 Crítica | Medio | UX |
| D3 | Checklist no detecta completitud | 🔴 Crítica | Bajo | UX |
| D4 | Sin notificaciones de estado | 🟡 Alta | Alto | Retención |
| D5 | Validación CURP solo de longitud | 🟡 Alta | Bajo | Datos |
| D6 | Sin retry automático en uploads | 🟡 Media | Bajo | Confiabilidad |
| D7 | Sin plantillas de rechazo | 🟡 Media | Bajo | Productividad admin |
| D8 | Sin paginación en cola admin | 🟡 Media | Medio | Performance |
| D9 | Sin confirmación al aprobar individual | 🟠 Media | Bajo | Seguridad |
| D10 | No muestra docs en estado pendiente | 🟠 Media | Bajo | UX |
| D11 | Sin doble confirmación eliminar cuenta | 🟠 Alta | Bajo | Seguridad |
| D12 | RFC no se almacena | 🟠 Media | Medio | Datos |
| D13 | Wizard no menciona verificación | 🟠 Media | Bajo | Onboarding |
| D14 | Sin tests para hooks | 🔵 Media | Alto | Calidad |
| D15 | Código duplicado admin hooks | 🔵 Baja | Medio | Mantenibilidad |
| D16 | Keys de React Query inconsistentes | 🔵 Media | Bajo | Cache |
| D17 | DocumentUploader con mucha lógica | 🔵 Baja | Medio | Mantenibilidad |

---

## ✅ LO QUE SÍ FUNCIONA BIEN

| Aspecto | Detalle |
|---------|---------|
| **Validación de archivos en cliente** | Tipo MIME, tamaño, preview de imagen |
| **UI de estados** | Badges con colores consistentes, descripciones claras |
| **Agrupación por usuario en admin** | Los documentos se agrupan y priorizan correctamente |
| **Acciones en lote** | El admin puede aprobar/rechazar múltiples documentos de un usuario |
| **Rechazo con motivo** | Modal obligatorio con textarea, se muestra al usuario |
| **Re-subida de documentos** | Cuando se rechaza, el formulario vuelve a aparecer para re-subir |
| **Invalidación de cache** | React Query se invalida correctamente tras mutaciones |
| **Separación de concerns** | Hooks separados de UI, endpoints centralizados en api.js |
| **Protección de rutas** | `ProtectedRoute` con roles funciona correctamente |
