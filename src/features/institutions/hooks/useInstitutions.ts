import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import api from '@shared/lib/api'
import type {
  Institution,
  RawBackendInstitucion,
  FiltrosInstituciones,
  CrearInstitucionPayload,
  UpdateInstitucionPayload,
  ValidarCsfQrResponse,
} from '@/types/institutions'

/**
 * Limpia un objeto de filtros eliminando claves con valores vacíos, null o undefined.
 */
function limpiarFiltros(filtros: FiltrosInstituciones): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(filtros)) {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value as string | number
    }
  }
  return cleaned
}

/**
 * Mapea los campos en español del response de la API a los campos en inglés
 * que el frontend espera (name, description, category, city, etc.).
 */
export function mapInstitucion(inst: RawBackendInstitucion): Institution {
  if (!inst) return inst as unknown as Institution

  return {
    ...inst,
    id: inst.id ?? inst._id ?? inst.documentId ?? inst.institutionId ?? '',
    // ── Core fields ──────────────────────────────────────
    name: inst.name ?? inst.nombre ?? '',
    description: inst.description ?? inst.descripcion,
    category: inst.category ?? inst.categoria,
    subcategory: inst.subcategory ?? inst.subcategoria,
    city: inst.city ?? inst.ciudad,
    state: inst.state ?? inst.estado,
    address: inst.address ?? inst.direccion,

    // ── Location ─────────────────────────────────────────
    lat: inst.lat,
    lng: inst.lng,

    // ── Contact ──────────────────────────────────────────
    phone: inst.phone ?? inst.telefono,
    whatsapp: inst.whatsapp,
    email: inst.email,
    website: inst.website ?? inst.sitioWeb,

    // ── Media ────────────────────────────────────────────
    logo_url: inst.logo_url ?? inst.urlLogo,
    cover_url: inst.cover_url ?? inst.urlPortada,
    photos: inst.photos ?? inst.fotos,

    // ── Details ──────────────────────────────────────────
    disability_types: inst.disability_types ?? inst.tiposDiscapacidad,
    min_age: inst.min_age ?? inst.edadMinima,
    max_age: inst.max_age ?? inst.edadMaxima,
    business_hours: inst.business_hours ?? inst.horarioAtencion,
    plan_type: inst.plan_type ?? inst.tipoPlan,
    services: inst.services ?? inst.servicios,

    // ── Ratings ──────────────────────────────────────────
    rating_avg: inst.rating_avg ?? inst.calificacionPromedio,
    rating_count: inst.rating_count ?? inst.cantidadCalificaciones,

    // ── Status ───────────────────────────────────────────
    is_active: inst.is_active ?? inst.activa ?? inst.active,
    is_verified: inst.is_verified ?? inst.verificada ?? inst.verified,

    // ── Scores (from recommendation algorithm) ─────────
    score_intereses: inst.score_intereses ?? null,
    score_comportamiento: inst.score_comportamiento ?? null,
    final_score: inst.final_score ?? null,

    // ── Meta ─────────────────────────────────────────────
    owner_id: inst.owner_id ?? inst.creadoPor,
    created_at: inst.created_at ?? inst.fechaCreacion,
    updated_at: inst.updated_at ?? inst.fechaActualizacion,
    deleted_at: inst.deleted_at ?? inst.fechaEliminacion,
  }
}

/**
 * Hook para listar instituciones con filtros opcionales.
 * GET /api/instituciones
 */
export function useInstitutions(filtros: FiltrosInstituciones = {}): UseQueryResult<Institution[]> {
  const params = limpiarFiltros(filtros)
  return useQuery({
    queryKey: ['institutions', params],
    queryFn: async (): Promise<Institution[]> => {
      const r = await api.get('/instituciones', { params })
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return (data as RawBackendInstitucion[]).map(mapInstitucion)
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook para obtener el detalle de una institución por su ID.
 * GET /api/instituciones/:id
 */
export function useInstitution(id?: string | number): UseQueryResult<Institution> {
  return useQuery({
    queryKey: ['institution', id],
    queryFn: async (): Promise<Institution> => {
      const r = await api.get(`/instituciones/${id}`)
      const inst = (r.data?.datos ?? r.data) as RawBackendInstitucion
      return mapInstitucion(inst)
    },
    enabled: !!id,
  })
}

/**
 * Hook para crear una nueva institución.
 * POST /api/instituciones
 */
export function useCrearInstitucion(): UseMutationResult<Institution, Error, CrearInstitucionPayload> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (datosInstitucion: CrearInstitucionPayload): Promise<Institution> => {
      const r = await api.post('/instituciones', datosInstitucion)
      const data = (r.data?.datos ?? r.data) as RawBackendInstitucion
      return mapInstitucion(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}

export function useDiscovery(filtros: FiltrosInstituciones = {}): UseQueryResult<Institution[]> {
  const params = limpiarFiltros(filtros)
  return useQuery({
    queryKey: ['discovery', params],
    queryFn: async (): Promise<Institution[]> => {
      const r = await api.get('/descubrimiento', { params })
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return (data as RawBackendInstitucion[]).map(mapInstitucion)
    },
  })
}

export interface UseMiInstitucionOptions {
  enabled?: boolean
  [key: string]: unknown
}

export function useMiInstitucion(opts?: UseMiInstitucionOptions): UseQueryResult<Institution | null> {
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['mi-institucion'],
    queryFn: async (): Promise<Institution | null> => {
      try {
        const r = await api.get('/instituciones/mi-institucion')
        const inst = (r.data?.datos ?? r.data) as RawBackendInstitucion
        return mapInstitucion(inst)
      } catch (err: unknown) {
        const errorResponse = err as { response?: { status?: number } }
        // 404 = usuario no tiene institución registrada → tratar como null
        if (errorResponse.response?.status === 404) return null
        throw err
      }
    },
    enabled: callerEnabled !== false,
    ...restOpts,
  })
}

export function useUpdateMiInstitucion(): UseMutationResult<unknown, Error, UpdateInstitucionPayload> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateInstitucionPayload) => api.put('/instituciones/mi-institucion', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mi-institucion'] })
      qc.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}

export function useUpdateInstitution(): UseMutationResult<unknown, Error, UpdateInstitucionPayload & { id: string | number }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateInstitucionPayload & { id: string | number }) => api.put(`/instituciones/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}

export function useDeleteInstitution(): UseMutationResult<unknown, Error, string | number> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.delete(`/instituciones/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}

/**
 * Hook para obtener el detalle completo de una institución (admin o propietario).
 * GET /api/instituciones/:id/detalle
 */
export function useInstitutionDetail(id?: string | number): UseQueryResult<Institution> {
  return useQuery({
    queryKey: ['institution-detail', id],
    queryFn: async (): Promise<Institution> => {
      const r = await api.get(`/instituciones/${id}/detalle`)
      const inst = (r.data?.datos ?? r.data) as RawBackendInstitucion
      return mapInstitucion(inst)
    },
    enabled: !!id,
  })
}

/* ═══════════════════════════════════════════════════════════
   CSF QR Validation
   POST /instituciones/validar-csf-qr
   ═══════════════════════════════════════════════════════════ */

export function useValidarCsfQr(): UseMutationResult<ValidarCsfQrResponse, Error, File> {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('archivo', file)
      // skipAuth: el registro aún no tiene sesión → no adjuntar Authorization
      return api.post('/instituciones/validar-csf-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipAuth: true,
      }).then(r => r.data)
    },
  })
}

/* ═══════════════════════════════════════════════════════════
   Documentos de verificación (persona moral)
   POST /instituciones/verificacion/documentos
   ═══════════════════════════════════════════════════════════ */

export type TipoDocumentoVerificacion = 'csf' | 'identificacion_representante'

export interface DocumentoVerificacionSubido {
  tipo: TipoDocumentoVerificacion | 'identificacion_oficial'
  urlDocumento: string
  estado: 'pendiente'
  fechaSubida: string
}

/**
 * Sube la CSF (o la identificación del representante legal) de una persona moral.
 *
 * OJO con el endpoint: NO es `/usuarios/documento-identidad`. Ese solo admite
 * `curp | identificacion_oficial | certificado_discapacidad` y rechaza cualquier
 * otra cosa con 400, incluida la CSF. Además, un documento guardado ahí no
 * alimenta `instituciones/{id}.documentoCsf`, que es el campo que el admin
 * lee (`puedeAprobarse = tieneCsf`) para decidir si la empresa puede aprobarse.
 *
 * Este endpoint sí acepta `csf` y la persiste donde el flujo de aprobación la
 * espera.
 */
export function useSubirDocumentoVerificacion(): UseMutationResult<
  unknown,
  Error,
  { tipo: TipoDocumentoVerificacion; file: File }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tipo, file }: { tipo: TipoDocumentoVerificacion; file: File }) => {
      const formData = new FormData()
      formData.append('tipo', tipo)
      formData.append('documento', file)
      return api
        .post('/instituciones/verificacion/documentos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(r => r.data as DocumentoVerificacionSubido)
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['estado-verificacion-institucion'] })
      qc.invalidateQueries({ queryKey: ['mi-institucion'] })
      // El INE del representante legal acaba en la colección de documentos de
      // identidad, así que el estado de usuario también se ve afectado.
      if (vars.tipo === 'identificacion_representante') {
        qc.invalidateQueries({ queryKey: ['documento-identidad'] })
      }
    },
  })
}

/* ═══════════════════════════════════════════════════════════
   Estado de verificación de mi institución/empresa
   GET /instituciones/mi-institucion/estado-verificacion
   ═══════════════════════════════════════════════════════════ */

export interface PasoVerificacion {
  clave: 'csf' | 'aprobacion_admin' | 'identificacion_representante' | string
  titulo: string
  obligatorio: boolean
  completado: boolean
  descripcion?: string
}

export interface EstadoVerificacionInstitucion {
  institucionId: string
  nombre: string | null
  verificada: boolean
  porcentaje: number
  pasos: PasoVerificacion[]
  pasosPendientes: string[]
  documentosFaltantes: string[]
}

/**
 * Estado de verificación de la persona moral. Es la única fuente fiable de
 * `tieneCsf`: el endpoint de identidad de usuario ni siquiera menciona la CSF
 * (no aplica a personas morales), así que consultarla devolvía siempre
 * "sin CSF" aunque la empresa ya la hubiera subido.
 *
 * Devuelve `null` cuando el usuario no tiene institución registrada (404).
 */
export function useEstadoVerificacionInstitucion(opts?: {
  enabled?: boolean
}): UseQueryResult<EstadoVerificacionInstitucion | null> {
  return useQuery({
    queryKey: ['estado-verificacion-institucion'],
    queryFn: async (): Promise<EstadoVerificacionInstitucion | null> => {
      try {
        const r = await api.get('/instituciones/mi-institucion/estado-verificacion')
        return r.data as EstadoVerificacionInstitucion
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) return null
        throw err
      }
    },
    enabled: opts?.enabled !== false,
    retry: false,
  })
}

/* ═══════════════════════════════════════════════════════════
   Delete My Institution
   DELETE /instituciones/mi-institucion
   ═══════════════════════════════════════════════════════════ */

export function useDeleteMyInstitution(): UseMutationResult<unknown, Error, void> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete('/instituciones/mi-institucion').then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mi-institucion'] })
    },
  })
}
