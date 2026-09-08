import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import api from '@shared/lib/api'
import type {
  Job,
  RawBackendJob,
  JobApplication,
  RawBackendPostulacion,
  JobFilters,
  PaginatedResponse,
  CreateJobPayload,
  UpdateJobPayload,
  ApplyJobPayload,
  JobApplicationStatus,
} from '@/types/jobs'

/* ─── Normalización de datos ─────────────────────────────────────── */

function mapJob(job: RawBackendJob): Job {
  if (!job) return job as unknown as Job

  let status: JobApplicationStatus | string = job.status ?? job.estadoPostulacion ?? job.estado ?? 'pending'
  if (status === 'pendiente') status = 'pending'
  if (status === 'en revisión' || status === 'en_revision' || status === 'revision') status = 'reviewed'
  if (status === 'aceptada' || status === 'aceptado') status = 'accepted'
  if (status === 'rechazada' || status === 'rechazado' || status === 'no seleccionado') status = 'rejected'

  return {
    ...job,
    id: job.id ?? '',
    // Normalizar campos vacante → inglés
    title: job.title ?? job.titulo ?? '',
    description: job.description ?? job.descripcion,
    requirements: job.requirements ?? job.requisitos,
    modality: job.modality ?? job.modalidad,
    schedule: job.schedule ?? job.horario,
    salary_range: job.salary_range ?? job.rangoSalario,
    city: job.city ?? job.ciudad,
    state: job.state ?? job.estado,
    disability_inclusive: job.disability_inclusive ?? job.inclusivaDiscapacidad,
    disability_types: job.disability_types ?? job.tiposDiscapacidad,
    is_active: job.is_active ?? job.activa ?? true,
    created_at: job.created_at ?? job.fechaCreacion,
    // Institución embebida
    institution_id: job.institution_id ?? job.institucionId,
    institution_name: job.institution_name ?? job.nombreInstitucion ?? job.institucionNombre ?? job.institucion?.nombre ?? job.nombre_institucion,
    institution_city: job.institution_city ?? job.ciudadInstitucion,
    institution_description: job.institution_description ?? job.descripcionInstitucion,
    institution_phone: job.institution_phone ?? job.telefonoInstitucion,
    institution_email: job.institution_email ?? job.emailInstitucion,
    institution_website: job.institution_website ?? job.sitioWebInstitucion,
    institution_verified: job.institution_verified ?? job.verificada ?? job.institucionVerificada ?? job.institucion?.verificada,
    institution_owner_id: job.institution_owner_id ?? job.institucionOwnerId ?? job.institucion?.owner_id ?? job.institucion?.propietarioId,
    // Postulación
    cover_letter: job.cover_letter ?? job.cartaPresentacion ?? job.carta_presentacion ?? job.mensaje,
    application_id: job.application_id ?? job.id,
    status,
  }
}

function mapPostulacion(post: RawBackendPostulacion): JobApplication {
  if (!post) return post as unknown as JobApplication

  return {
    ...post,
    id: post.id ?? '',
    title: post.title ?? post.titulo,
    modality: post.modality ?? post.modalidad,
    institution_name: post.institution_name ?? post.nombreInstitucion,
    status: post.status ?? post.estado ?? 'pending',
    cover_letter: post.cover_letter ?? post.cartaPresentacion ?? post.carta_presentacion,
    created_at: post.created_at ?? post.fechaCreacion,
    job: post.job ? mapJob(post.job) : undefined,
  }
}

/* ─── Respuesta paginada ─────────────────────────────────────────── */

interface RawBackendPaginatedResponse<T> {
  datos?: T[]
  total?: number
  pagina?: number
  limite?: number
  totalPaginas?: number
  paginas?: number
}

/**
 * Extrae datos paginados de la respuesta del backend.
 * El backend puede devolver:
 *  - { datos: [...], total, pagina, limite, totalPaginas }
 *  - un array plano [...]
 */
function extractPaginatedData<T>(res: RawBackendPaginatedResponse<T> | T[] | undefined): PaginatedResponse<T> {
  if (Array.isArray(res)) {
    return { datos: res, total: res.length, pagina: 1, limite: res.length, totalPaginas: 1 }
  }
  return {
    datos: res?.datos ?? [],
    total: res?.total ?? 0,
    pagina: res?.pagina ?? 1,
    limite: res?.limite ?? 20,
    totalPaginas: res?.totalPaginas ?? res?.paginas ?? 1,
  }
}

/* ─── Hooks de Vacantes ──────────────────────────────────────────── */

const DEFAULT_PAGE_PARAMS: Required<Pick<JobFilters, 'pagina' | 'limite' | 'ordenarPor' | 'direccion'>> = {
  pagina: 1,
  limite: 20,
  ordenarPor: 'fechaCreacion',
  direccion: 'desc',
}

/**
 * Listar vacantes con filtros y paginación.
 */
export function useJobs(filters: JobFilters = {}): UseQueryResult<PaginatedResponse<Job>> {
  const params = { ...DEFAULT_PAGE_PARAMS, ...filters }

  const query = new URLSearchParams()
  if (params.buscar) query.set('buscar', params.buscar)
  if (params.ciudad) query.set('ciudad', params.ciudad)
  if (params.modalidad) query.set('modalidad', params.modalidad)
  query.set('pagina', String(params.pagina))
  query.set('limite', String(params.limite))
  query.set('ordenarPor', params.ordenarPor)
  query.set('direccion', params.direccion)

  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async (): Promise<PaginatedResponse<Job>> => {
      const { data } = await api.get(`/empleo?${query.toString()}`)
      const result = extractPaginatedData<RawBackendJob>(data)
      return { ...result, datos: result.datos.map(mapJob) }
    },
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Detalle de una vacante por ID.
 */
export function useJob(id?: string | number): UseQueryResult<Job> {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async (): Promise<Job> => {
      const { data } = await api.get(`/empleo/${id}`)
      // El backend puede devolver directamente el objeto o { datos: {...} }
      const raw = (data?.datos ?? data) as RawBackendJob
      return mapJob(raw)
    },
    enabled: !!id,
  })
}

/**
 * IDs de vacantes postuladas por el usuario (para marcar "Ya te postulaste").
 */
export function useAppliedJobIds(): UseQueryResult<(string | number)[]> {
  return useQuery({
    queryKey: ['jobs', 'applied'],
    queryFn: async (): Promise<(string | number)[]> => {
      const { data } = await api.get('/empleo/postuladas')
      return Array.isArray(data) ? data : (data?.datos ?? [])
    },
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Mis postulaciones con paginación.
 */
export function useMyApplications(filters: JobFilters = {}): UseQueryResult<PaginatedResponse<JobApplication>> {
  const params = { ...DEFAULT_PAGE_PARAMS, ...filters }

  const query = new URLSearchParams()
  if (params.buscar) query.set('buscar', params.buscar)
  query.set('pagina', String(params.pagina))
  query.set('limite', String(params.limite))
  query.set('ordenarPor', params.ordenarPor)
  query.set('direccion', params.direccion)

  return useQuery({
    queryKey: ['jobs', 'my-applications', params],
    queryFn: async (): Promise<PaginatedResponse<JobApplication>> => {
      const { data } = await api.get(`/empleo/mis-postulaciones?${query.toString()}`)
      const result = extractPaginatedData<RawBackendPostulacion>(data)
      return { ...result, datos: result.datos.map(mapPostulacion) }
    },
  })
}

/* ─── Mutaciones ─────────────────────────────────────────────────── */

/**
 * Crear una nueva vacante.
 */
export function useCreateJob(): UseMutationResult<unknown, Error, CreateJobPayload> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateJobPayload) => api.post('/empleo', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Editar una vacante existente.
 */
export function useUpdateJob(): UseMutationResult<unknown, Error, UpdateJobPayload> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateJobPayload) => api.put(`/empleo/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Desactivar (eliminar) una vacante.
 */
export function useDeleteJob(): UseMutationResult<unknown, Error, string | number> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.delete(`/empleo/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Postularse a una vacante.
 */
export function useApplyJob(): UseMutationResult<unknown, Error, ApplyJobPayload> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, cover_letter, candidateId }: ApplyJobPayload) => {
      const payload: { cartaPresentacion?: string; candidateId?: string | number } = { cartaPresentacion: cover_letter }
      if (candidateId) payload.candidateId = candidateId
      return api.post(`/empleo/${jobId}/postularse`, payload).then(r => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs', 'applied'] })
      qc.invalidateQueries({ queryKey: ['jobs', 'my-applications'] })
    },
  })
}
