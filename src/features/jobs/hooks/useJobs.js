import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/* ─── Normalización de datos ─────────────────────────────────────── */

function mapJob(job) {
  if (!job) return job

  let status = job.status ?? job.estadoPostulacion ?? job.estado ?? 'pending'
  if (status === 'pendiente') status = 'pending'
  if (status === 'en revisión' || status === 'en_revision' || status === 'revision') status = 'reviewed'
  if (status === 'aceptada' || status === 'aceptado') status = 'accepted'
  if (status === 'rechazada' || status === 'rechazado' || status === 'no seleccionado') status = 'rejected'

  return {
    ...job,
    // Normalizar campos vacante → inglés
    title: job.title ?? job.titulo,
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

function mapPostulacion(post) {
  if (!post) return post

  return {
    ...post,
    title: post.title ?? post.titulo,
    modality: post.modality ?? post.modalidad,
    institution_name: post.institution_name ?? post.nombreInstitucion,
    status: post.status ?? post.estado ?? 'pendiente',
    cover_letter: post.cover_letter ?? post.cartaPresentacion ?? post.carta_presentacion,
    created_at: post.created_at ?? post.fechaCreacion,
  }
}

/* ─── Respuesta paginada ─────────────────────────────────────────── */

/**
 * Extrae datos paginados de la respuesta del backend.
 * El backend puede devolver:
 *  - { datos: [...], total, pagina, limite, totalPaginas }
 *  - un array plano [...]
 */
function extractPaginatedData(res) {
  if (Array.isArray(res)) {
    return { datos: res, total: res.length, pagina: 1, limite: res.length, totalPaginas: 1 }
  }
  return {
    datos: res?.datos ?? [],
    total: res?.total ?? 0,
    pagina: res?.pagina ?? 1,
    limite: res?.limite ?? 20,
    totalPaginas: res?.totalPaginas ?? 1,
  }
}

/* ─── Hooks de Vacantes ──────────────────────────────────────────── */

const DEFAULT_PAGE_PARAMS = { pagina: 1, limite: 20, ordenarPor: 'fechaCreacion', direccion: 'desc' }

/**
 * Listar vacantes con filtros y paginación.
 *
 * @param {Object} filters - { buscar?, ciudad?, modalidad?, pagina?, limite?, ordenarPor?, direccion? }
 * @returns {UseQueryResult<{ datos: Vacante[], total, pagina, limite, totalPaginas }>}
 */
export function useJobs(filters = {}) {
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
    queryFn: async () => {
      const { data } = await api.get(`/empleo?${query}`)
      const result = extractPaginatedData(data)
      return { ...result, datos: result.datos.map(mapJob) }
    },
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Detalle de una vacante por ID.
 */
export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data } = await api.get(`/empleo/${id}`)
      // El backend puede devolver directamente el objeto o { datos: {...} }
      const raw = data?.datos ?? data
      return mapJob(raw)
    },
    enabled: !!id,
  })
}

/**
 * IDs de vacantes postuladas por el usuario (para marcar "Ya te postulaste").
 */
export function useAppliedJobIds() {
  return useQuery({
    queryKey: ['jobs', 'applied'],
    queryFn: async () => {
      const { data } = await api.get('/empleo/postuladas')
      return Array.isArray(data) ? data : (data?.datos ?? [])
    },
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Mis postulaciones con paginación.
 *
 * @param {Object} filters - { buscar?, pagina?, limite?, ordenarPor?, direccion? }
 * @returns {UseQueryResult<{ datos: Postulacion[], total, pagina, limite, totalPaginas }>}
 */
export function useMyApplications(filters = {}) {
  const params = { ...DEFAULT_PAGE_PARAMS, ...filters }

  const query = new URLSearchParams()
  if (params.buscar) query.set('buscar', params.buscar)
  query.set('pagina', String(params.pagina))
  query.set('limite', String(params.limite))
  query.set('ordenarPor', params.ordenarPor)
  query.set('direccion', params.direccion)

  return useQuery({
    queryKey: ['jobs', 'my-applications', params],
    queryFn: async () => {
      const { data } = await api.get(`/empleo/mis-postulaciones?${query}`)
      const result = extractPaginatedData(data)
      return { ...result, datos: result.datos.map(mapPostulacion) }
    },
  })
}

/* ─── Mutaciones ─────────────────────────────────────────────────── */

/**
 * Crear una nueva vacante.
 */
export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/empleo', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Editar una vacante existente.
 */
export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/empleo/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Desactivar (eliminar) una vacante.
 */
export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/empleo/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * Postularse a una vacante.
 */
export function useApplyJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, cover_letter, candidateId }) => {
      const payload = { cartaPresentacion: cover_letter }
      if (candidateId) payload.candidateId = candidateId
      return api.post(`/empleo/${jobId}/postularse`, payload).then(r => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs', 'applied'] })
      qc.invalidateQueries({ queryKey: ['jobs', 'my-applications'] })
    },
  })
}
