# Especificación de Endpoints — Mensajería desde Empleo

## Contexto

El frontend ya implementó un botón "Enviar mensaje" en la página de empleo (`/jobs`) para que los usuarios puedan contactar directamente a la institución que publicó una vacante. Sin embargo, para que esto funcione, **el backend necesita devolver el ID del usuario propietario de la institución** en los endpoints de empleo.

El sistema de mensajería directa ya existe y funciona:
- `POST /mensajes/enviar/:toId` — envía un mensaje al usuario con ID `:toId`
- `GET /mensajes/conversaciones` — lista conversaciones
- `GET /mensajes/con/:partnerId` — obtiene mensajes con un usuario

**El problema actual**: El frontend no sabe a quién enviar el mensaje porque los endpoints de empleo no incluyen el `institution_owner_id`.

---

## Cambio Requerido

### Endpoint: `GET /empleo` (listar vacantes)

**Response actual** (ejemplo):
```json
{
  "datos": [
    {
      "id": "vac-001",
      "titulo": "Terapeuta Ocupacional",
      "descripcion": "...",
      "nombre_institucion": "Fundación Esperanza",
      "verificada": true,
      "ciudad": "Mérida",
      "estado": "Yucatán",
      "modalidad": "presencial"
    }
  ]
}
```

**Response necesario** — agregar dos campos:
```json
{
  "datos": [
    {
      "id": "vac-001",
      "titulo": "Terapeuta Ocupacional",
      "descripcion": "...",
      "nombre_institucion": "Fundación Esperanza",
      "verificada": true,
      "ciudad": "Mérida",
      "estado": "Yucatán",
      "modalidad": "presencial",
      "institucion_id": "inst-001",
      "institucion_owner_id": "user-123"
    }
  ]
}
```

### Endpoint: `GET /empleo/:id` (detalle de vacante)

Mismo cambio: agregar `institucion_id` y `institucion_owner_id` al response.

### Endpoint: `GET /empleo/mis-postulaciones` (solicitudes del usuario)

Mismo cambio: agregar `institucion_id` y `institucion_owner_id` al response de cada postulación.

---

## Campos a Agregar

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `institucion_id` | `string` | ID del registro de la institución en `p_institutions` (o equivalente) |
| `institucion_owner_id` | `string` | ID del **usuario** propietario/admin de la institución (el `user_id` de la tabla `u_profiles` o equivalente) |

> **Nota importante**: `institucion_owner_id` es el ID del **usuario** (no de la institución), porque el endpoint de mensajes `POST /mensajes/enviar/:toId` espera el ID de un **usuario**.

---

## Cómo Obtener `institucion_owner_id`

Depende de cómo esté estructurado el backend:

### Opción A: Si `p_institutions` tiene un campo `owner_id` / `user_id` / `propietario_id`
```sql
-- En el servicio de empleo, al construir la respuesta:
SELECT v.*, i.owner_id AS institucion_owner_id
FROM p_jobs v
JOIN p_institutions i ON v.institucion_id = i.id
```

### Opción B: Si la relación está en otra tabla
```sql
-- Ejemplo con tabla de relación usuarios_instituciones
SELECT v.*, ui.usuario_id AS institucion_owner_id
FROM p_jobs v
JOIN usuarios_instituciones ui ON v.institucion_id = ui.institucion_id
WHERE ui.rol = 'owner' OR ui.rol = 'admin'
```

### Opción C: Si cada institución tiene un solo usuario creador
```sql
-- Si al crear la institución se guardó el user_id del creador
SELECT v.*, i.creado_por AS institucion_owner_id
FROM p_jobs v
JOIN p_institutions i ON v.institucion_id = i.id
```

---

## Lógica de Negocio

### Flujo del usuario:
1. Usuario ve una vacante en `/jobs`
2. Hace clic en "💬 Enviar mensaje"
3. Se abre un modal con la info de la vacante
4. Escribe un mensaje
5. El frontend llama `POST /mensajes/enviar/{institucion_owner_id}` con el contenido
6. El mensaje llega a la bandeja de mensajes de la institución

### Seguridad:
- Solo usuarios autenticados pueden enviar mensajes (ya protegido por el guard JWT)
- El `institucion_owner_id` se expone en el listado de vacantes (no es información sensible, es el ID público del usuario dueño de la institución)
- No hay riesgo de spam porque ya existe rate limiting en el endpoint de mensajes

---

## Resumen de Cambios para el Backend

```
Archivos a modificar:
├── src/modules/jobs/jobs.service.ts (o equivalente)
│   └── Modificar queries para JOIN con p_institutions y devolver:
│       - institucion_id
│       - institucion_owner_id
│
├── src/modules/institutions/institutions.service.ts (opcional)
│   └── Si se quiere agregar un endpoint dedicado:
│       GET /instituciones/:id/propietario → { owner_user_id: string }
│
└── Documentación Swagger
    └── Actualizar schema de Vacante con los nuevos campos
```

### Query SQL sugerida (empleo listing):

```sql
-- Para el listado de vacantes
SELECT 
  v.*,
  i.id AS institucion_id,
  i.owner_id AS institucion_owner_id
FROM p_jobs v
LEFT JOIN p_institutions i ON v.institucion_id = i.id
WHERE v.activo = true
ORDER BY v.created_at DESC;
```

### Query SQL sugerida (mis postulaciones):

```sql
-- Para las postulaciones del usuario
SELECT 
  p.*,
  v.titulo,
  v.descripcion,
  v.modalidad,
  i.id AS institucion_id,
  i.owner_id AS institucion_owner_id
FROM u_job_applications p
JOIN p_jobs v ON p.job_id = v.id
LEFT JOIN p_institutions i ON v.institucion_id = i.id
WHERE p.user_id = :userId;
```

---

## Testing

### Probar que funciona:
1. Login como usuario normal (rol: pcd o tutor)
2. Ir a `/jobs`
3. Verificar que las vacantes muestran el botón "Enviar mensaje"
4. Hacer clic y enviar un mensaje
5. Verificar que el mensaje aparece en `/social` → Mensajes
6. Login como usuario de la institución
7. Verificar que recibió el mensaje en su bandeja

### Validar respuestas:
```bash
# Listar vacantes - verificar que incluye los nuevos campos
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/empleo | jq '.datos[0] | {institucion_id, institucion_owner_id}'

# Detalle de vacante
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/empleo/VAC_ID | jq '{institucion_id, institucion_owner_id}'
```

---

## Frontend - Estado de Implementación

El frontend ya está listo para consumir estos campos:

| Archivo | Cambio | Estado |
|---------|--------|--------|
| `src/features/jobs/hooks/useJobs.js` | Mapea `institution_owner_id` del response | ✅ Implementado |
| `src/features/jobs/pages/JobsPage.jsx` | Botón "Enviar mensaje" en JobCard y ApplicationCard | ✅ Implementado |
| `src/features/jobs/pages/JobsPage.jsx` | Modal `MessageModal` con chat simplificado | ✅ Implementado |
| `src/features/jobs/constants/jobsMessages.js` | Textos de UI para mensajería | ✅ Implementado |

**Una vez que el backend devuelva `institucion_owner_id`, el botón aparecerá automáticamente.**
