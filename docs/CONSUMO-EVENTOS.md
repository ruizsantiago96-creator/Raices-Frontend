# Consumo de Endpoints de Eventos

Esta documentación describe los endpoints del backend que el frontend debe consumir para funcionalidades relacionadas con eventos, y qué operaciones debe realizar el frontend con cada uno.

## Endpoints Disponibles

### 1. Listar Eventos Públicos/Autenticados

**Método:** `GET /api/eventos`  
**Descripción:** Lista eventos con filtros opcionales: ciudad, categoría, modalidad, proximos, paginación.

**Parámetros de Consulta (Query):**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `pagina` | number | No | Número de página (default: 1) |
| `limite` | number | No | Elementos por página (default: 20) |
| `ciudad` | string | No | Filtrar por ciudad |
| `categoria` | enum | No | Filtrar por categoría: `taller`, `deporte`, `cultural`, `encuentro`, `voluntariado`, `otro` |
| `modalidad` | enum | No | Filtrar por modalidad: `presencial`, `virtual`, `hibrido` |
| `proximos` | boolean | No | Solo eventos con fecha >= hoy (default: true) |
| `buscar` | string | No | Buscar por título o descripción |

**Respuesta Esperada:** `Promise<RespuestaPaginada<EventoDoc>>`

**Uso en el Frontend:**
- El componente `EventsDiscovery` debe llamar a este endpoint para poblar la grilla de eventos
- Los parámetros de filtros (ciudad, categoria, modalidad, proximos) deben poder enviarse al backend
- La paginación debe manejarse con los parámetros `pagina` y `limite`
- El parámetro `buscar` debe soportar búsquedas libres por título/descripción

---

### 2. Obtener Detalle de un Evento

**Método:** `GET /api/eventos/:id`  
**Descripción:** Retorna el evento con su organizador y datos completos.

**Parámetros de Ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | string | ID del evento |

**Respuesta Esperada:** `Promise<EventoDoc | null>`

**Uso en el Frontend:**
- Al hacer clic en un evento de la lista, navegar al detalle del evento
- Mostrar la información completa del evento (descripción, fecha, ubicación, organizador, etc.)
- Si el evento no existe, manejar el caso 404 (mostrar mensaje de "evento no encontrado")

---

### 3. Crear un Nuevo Evento

**Método:** `POST /api/eventos`  
**Descripción:** Crea un nuevo evento. Solo permitido a roles: `institucion`, `empresa`, `admin`.

**Autenticación:** Requiere JWT auth guard y roles guard  
**Roles Permitidos:** `institucion`, `empresa`, `admin`

**Cuerpo de Solicitud (CrearEventoDto):**
El DTO incluye campos para crear el evento (ver `src/modules/community/dto/crear-evento.dto.ts`). Los campos principales típicamente incluyen:
- título/nombre del evento
- descripción
- fecha/hora
- categoría
- modalidad (presencial/virtual/hibrido)
- ciudad
- capacidad/limitación
- otros campos específicos del tipo de evento

**Respuesta Esperada:** `Promise<EventoDoc>`

**Uso en el Frontend:**
- Solo usuarios con rol `institucion`, `empresa` o `admin` pueden crear eventos
- El formulario de creación debe estar protegido y verificarse el rol del usuario
- Al crear exitosamente, recargar la lista de eventos o mostrar un mensaje de éxito
- Manejar errores de validación (fechas inválidas, categoría no permitida, etc.)

---

## Estructura de Datos del Evento (EventoDoc)

Basado en la interfaz del backend, un evento tiene típicamente:

```typescript
interface EventoDoc {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Date | string;
  ciudad: string;
  categoria: string;
  modalidad: 'presencial' | 'virtual' | 'hibrido';
  organizador: {
    id: string;
    nombre: string;
    avatar: string | null;
  };
  capacidad?: number;
  inscritos?: number;
  asistentesConfirmados?: number; // Campo mantenido por toggleAsistencia
  creadoEn: Date;
  actualizadoEn: Date;
  // ... otros campos
}
```

## Operaciones que el Frontend Debe Realizar

### 1. Cargar Events Discovery

```typescript
// Ejemplo de carga de eventos con filtros
const loadEvents = async (filtros = {}) => {
  const response = await api.get('/api/eventos', { params: filtros });
  setEventos(response.data.datos || response.data);
  setTotal(response.data.meta?.total ?? response.data.length);
};
```

### 2. Manejo de Filtros por Región/Ciudad

- Permitir al usuario filtrar eventos por ciudad seleccionada
- El parámetro `ciudad` se envía como query param
- Al cambiar de región, refetch con los nuevos filtros

### 3. Búsqueda de Eventos

- Implementar campo de búsqueda que envía el término al parámetro `buscar`
- Filtrar resultados en cliente también si la respuesta es grande

### 4. Paginación

- Mostrar controles de "siguiente/página anterior"
- Mantener el estado de la página actual
- Enviir `pagina` y `limite` en cada petición

### 5. Obtener Detalle y Navegación

```typescript
const irADetalle = async (eventoId: string) => {
  const evento = await api.get(`/api/eventos/${eventoId}`).then(r => r.data);
  navegarA('evento-detalle', { id: eventoId, datos: evento });
};
```

### 6. Crear Evento (solo roles autorizados)

```typescript
const crearEvento = async (dto: CrearEventoDto) => {
  const response = await api.post('/api/eventos', dto);
  await loadEvents(); // Refrescar lista
  mostrarToast('Evento creado exitosamente', 'success');
};
```

### 7. Mantenimiento de `cantidadAsistentes`

El servicio backend ahora mantiene `cantidadAsistentes: 0` por defecto y el `toggleAsistencia` mantiene el contador atómicamente. El frontend debe:

- Mostrar el contador de asistentes en el detalle del evento
- Permitir a los usuarios togglear su asistencia (usando el endpoint correspondiente)
- Actualizar la UI cuando el contador cambia

## Notas Importantes

1. **Build CI:** Los endpoints fueron verificados y el build `pnpm build` pasa con `tsc` exit 0.

2. **Tests:** 932 unit tests y 498 E2E tests pasan después de los fixes de CI.

3. **Backend fixes aplicados:**
   - `@ApiResponse({ type: EventoDoc })` — se quitó `type: EventoDoc` del decorator (era una interfaz, no un valor runtime)
   - `crearEvento` inicializa `cantidadAsistentes: 0` (el servicio ahora lo mantiene atómicamente con `toggleAsistencia`)
   - El filtro "próximos" no se aplica cuando hay `fecha` exacta o `desde` explícito (permite ver historial)

4. **Frontend actual:** El componente `EventsDiscovery` usa datos MOCK. Se deben reemplazar las llamadas a datos reales con los endpoints above.

5. **Roles:** El endpoint `POST /api/eventos` requiere authentication y roles `institucion`, `empresa` o `admin`. El frontend debe verificar el rol del usuario antes de mostrar el formulario de creación.