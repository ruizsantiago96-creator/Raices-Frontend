import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import api from '@shared/lib/api'

/* ═══════════════════════════════════════════════════════════════════════
   Inscripciones a servicios/programas de una institución (con aprobación)

   Flujo: el usuario solicita → estado `pendiente` → la institución aprueba
   (`activa`) o rechaza (`rechazada`); la persona puede cancelar su propia
   inscripción (`cancelada`).
   ═══════════════════════════════════════════════════════════════════════ */

export type EstadoInscripcion = 'pendiente' | 'activa' | 'rechazada' | 'cancelada'

export interface EstadoInscripcionServicio {
  institucionId: string
  servicioId: string
  estado: EstadoInscripcion | null
  inscrito: boolean
  solicitado: boolean
}

export interface UsuarioInscripcion {
  id: string
  nombre: string
  email: string
  urlAvatar?: string | null
}

export interface InscripcionServicio {
  id: string
  institucionId: string
  servicioId: string
  servicioNombre?: string | null
  usuarioId: string
  estado: EstadoInscripcion
  fechaCreacion?: string | null
  fechaActualizacion?: string | null
  fechaResolucion?: string | null
  usuario?: UsuarioInscripcion
}

export interface ListadoInscripcionesServicio {
  institucionId: string
  servicioId: string
  datos: InscripcionServicio[]
  total: number
  pendientes: number
  activas: number
  rechazadas: number
}

export interface ResumenServicio {
  servicioId: string
  servicioNombre: string | null
  pendientes: number
  activas: number
  rechazadas: number
  total: number
}

export interface RespuestaSolicitud {
  id: string
  institucionId: string
  servicioId: string
  servicioNombre?: string | null
  usuarioId: string
  estado: EstadoInscripcion
  fechaCreacion?: string | null
  fechaActualizacion?: string | null
  fechaResolucion?: string | null
}

/* ═══ Público (persona que visita el detalle) ═════════════════════════ */

/**
 * Estados de MIS inscripciones en los servicios de una institución.
 * GET /api/instituciones/:id/mis-inscripciones
 */
export function useMisInscripcionesServicio(
  institucionId?: string | number,
  opts?: { enabled?: boolean },
): UseQueryResult<{ institucionId: string; datos: { institucionId: string; servicioId: string; estado: EstadoInscripcion }[] }> {
  return useQuery({
    queryKey: ['mis-inscripciones-servicio', institucionId],
    queryFn: async () => {
      const r = await api.get(`/instituciones/${institucionId}/mis-inscripciones`)
      return r.data
    },
    enabled: Boolean(institucionId) && opts?.enabled !== false,
  })
}

/** Solicito mi inscripción a un servicio (queda pendiente de aprobación). */
export function useInscribirServicio(institucionId?: string | number): UseMutationResult<RespuestaSolicitud, Error, string> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (servicioId: string) =>
      api.post(`/instituciones/${institucionId}/servicios/${servicioId}/inscripcion`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mis-inscripciones-servicio', institucionId] })
      qc.invalidateQueries({ queryKey: ['inscripciones-servicio'] })
      qc.invalidateQueries({ queryKey: ['resumen-inscripciones-servicio'] })
    },
  })
}

/** Cancelo mi inscripción (pendiente o activa) sin borrar el historial. */
export function useCancelarInscripcionServicio(institucionId?: string | number): UseMutationResult<RespuestaSolicitud, Error, string> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (servicioId: string) =>
      api.delete(`/instituciones/${institucionId}/servicios/${servicioId}/inscripcion`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mis-inscripciones-servicio', institucionId] })
      qc.invalidateQueries({ queryKey: ['inscripciones-servicio'] })
      qc.invalidateQueries({ queryKey: ['resumen-inscripciones-servicio'] })
    },
  })
}

/* ═══ Panel de la institución (dueña o admin) ═════════════════════════ */

/**
 * Personas inscritas/solicitantes de un servicio, con nombre, correo y avatar
 * para que la institución las ubique (foros, publicaciones, mensajes).
 * GET /api/instituciones/:id/servicios/:servicioId/inscripciones
 */
export function useInscripcionesDeServicio(
  institucionId?: string | number,
  servicioId?: string,
  opts?: { enabled?: boolean },
): UseQueryResult<ListadoInscripcionesServicio> {
  return useQuery({
    queryKey: ['inscripciones-servicio', institucionId, servicioId],
    queryFn: async () => {
      const r = await api.get(`/instituciones/${institucionId}/servicios/${servicioId}/inscripciones`)
      return r.data
    },
    enabled: Boolean(institucionId && servicioId) && opts?.enabled !== false,
  })
}

/**
 * Aprobar (`activa`) o rechazar (`rechazada`) una solicitud pendiente.
 * POST /api/instituciones/:id/servicios/:servicioId/inscripciones/:inscripcionId/{aprobar|rechazar}
 */
export function useResolverInscripcionServicio(institucionId?: string | number): UseMutationResult<
  InscripcionServicio,
  Error,
  { servicioId: string; inscripcionId: string; accion: 'aprobar' | 'rechazar' }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ servicioId, inscripcionId, accion }) =>
      api.post(`/instituciones/${institucionId}/servicios/${servicioId}/inscripciones/${inscripcionId}/${accion}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inscripciones-servicio'] })
      qc.invalidateQueries({ queryKey: ['resumen-inscripciones-servicio'] })
    },
  })
}

/**
 * Conteo de pendientes/activas por servicio de MI institución (badges del panel).
 * GET /api/instituciones/mi-institucion/servicios/inscripciones/resumen
 */
export function useResumenInscripcionesServicio(opts?: { enabled?: boolean }): UseQueryResult<{
  institucionId: string
  datos: ResumenServicio[]
}> {
  return useQuery({
    queryKey: ['resumen-inscripciones-servicio'],
    queryFn: async () => {
      const r = await api.get('/instituciones/mi-institucion/servicios/inscripciones/resumen')
      return r.data
    },
    enabled: opts?.enabled !== false,
  })
}
