import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/* ── Map helpers ─────────────────────────────────────────── */

function mapJob(job) {
  if (!job) return job

  let status = job.status ?? job.estadoPostulacion ?? job.estado ?? 'active'
  if (status === 'activa' || status === 'Activa') status = 'active'
  if (status === 'pausada' || status === 'Pausada') status = 'paused'

  return {
    ...job,
    id: job.id ?? job._id ?? job.vacanteId,
    title: job.title ?? job.titulo,
    description: job.description ?? job.descripcion,
    requirements: job.requirements ?? job.requisitos,
    modality: job.modality ?? job.modalidad,
    schedule: job.schedule ?? job.horario,
    salary_range: job.salary_range ?? job.rangoSalario,
    city: job.city ?? job.ciudad,
    state: job.state ?? job.estado,
    disability_inclusive: job.disability_inclusive ?? job.inclusivaDiscapacidad,
    applicants_count: job.applicants_count ?? job.numPostulantes ?? job.postulantesCount ?? job.cantidadPostulantes ?? 0,
    created_at: job.created_at ?? job.fechaCreacion ?? job.createdAt,
    updated_at: job.updated_at ?? job.fechaActualizacion ?? job.updatedAt,
    status,
    is_active: job.is_active ?? job.activa ?? status === 'active',
  }
}

function mapApplicant(app) {
  if (!app) return app

  let status = app.status ?? app.estadoPostulacion ?? app.estado ?? 'pending'
  if (status === 'pendiente' || status === 'Pendiente') status = 'pending'
  if (status === 'en revisión' || status === 'en_revision' || status === 'En revisión' || status === 'En Revisión') status = 'reviewed'
  if (status === 'aceptada' || status === 'aceptado' || status === 'Aceptada' || status === 'Aceptado') status = 'accepted'
  if (status === 'rechazada' || status === 'rechazado' || status === 'Rechazada' || status === 'Rechazado') status = 'rejected'

  return {
    ...app,
    id: app.id ?? app._id ?? app.postulacionId,
    user_id: app.user_id ?? app.usuarioId ?? app.usuario?.id,
    user_name: app.user_name ?? app.nombreUsuario ?? app.usuario?.nombreCompleto ?? app.nombreCompleto,
    user_email: app.user_email ?? app.emailUsuario ?? app.usuario?.email ?? app.email,
    job_id: app.job_id ?? app.vacanteId ?? app.vacante?.id,
    job_title: app.job_title ?? app.tituloVacante ?? app.vacante?.titulo ?? app.titulo,
    cover_letter: app.cover_letter ?? app.cartaPresentacion ?? app.carta_presentacion,
    created_at: app.created_at ?? app.fechaCreacion ?? app.createdAt,
    status,
  }
}

/* ── Institution Job Postings ────────────────────────────── */

/**
 * Fetch all job postings created by the current institution.
 * Uses /empleo with a filter to get only the institution's own jobs.
 */
export function useMyJobPostings() {
  return useQuery({
    queryKey: ['institution', 'job-postings'],
    queryFn: async () => {
      const r = await api.get('/empleo', { params: { mias: true } })
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapJob)
    },
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Get a single job posting detail for the institution.
 */
export function useJobPosting(id) {
  return useQuery({
    queryKey: ['institution', 'job-posting', id],
    queryFn: async () => {
      const r = await api.get(`/empleo/${id}`)
      const inst = r.data?.datos ?? r.data
      return mapJob(inst)
    },
    enabled: !!id,
  })
}

/**
 * Create a new job posting.
 */
export function useCreateJobPosting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/empleo', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'job-postings'] })
    },
  })
}

/**
 * Update a job posting (e.g., toggle active/paused).
 */
export function useUpdateJobPosting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/empleo/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'job-postings'] })
    },
  })
}

/**
 * Delete a job posting.
 */
export function useDeleteJobPosting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/empleo/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'job-postings'] })
    },
  })
}

/**
 * Toggle job posting between active and paused.
 */
export function useToggleJobStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }) =>
      api.patch(`/empleo/${id}/estado`, { activa: is_active }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'job-postings'] })
    },
  })
}

/* ── Job Applicants ──────────────────────────────────────── */

/**
 * Fetch all applicants to a specific job posting.
 * Endpoint: GET /api/empleo/postulaciones?vacanteId=xxx
 */
export function useJobApplicants(jobId) {
  return useQuery({
    queryKey: ['institution', 'job-applicants', jobId],
    queryFn: async () => {
      try {
        const r = await api.get('/empleo/postulaciones', { params: { vacanteId: jobId } })
        const res = r.data
        const data = Array.isArray(res) ? res : (res?.datos ?? [])
        return data.map(mapApplicant)
      } catch (err) {
        if (err.response?.status === 404) return []
        throw err
      }
    },
    enabled: !!jobId,
  })
}

/**
 * Fetch all applicants across all of the institution's job postings.
 * Endpoint: GET /api/empleo/postulaciones (all for current institution)
 */
export function useAllJobApplicants() {
  return useQuery({
    queryKey: ['institution', 'all-applicants'],
    queryFn: async () => {
      try {
        // Try to fetch all postulaciones for the institution
        const r = await api.get('/empleo/postulaciones')
        const res = r.data
        const data = Array.isArray(res) ? res : (res?.datos ?? [])
        return data.map(mapApplicant)
      } catch {
        // Fallback: aggregate from individual jobs
        const jobsRes = await api.get('/empleo', { params: { mias: true } })
        const jobsRaw = jobsRes.data
        const jobs = Array.isArray(jobsRaw) ? jobsRaw : (jobsRaw?.datos ?? [])
        
        const allApplicants = []
        for (const job of jobs) {
          const jobId = job.id ?? job._id
          if (!jobId) continue
          try {
            const appRes = await api.get('/empleo/postulaciones', { params: { vacanteId: jobId } })
            const appsRaw = appRes.data
            const apps = Array.isArray(appsRaw) ? appsRaw : (appsRaw?.datos ?? [])
            allApplicants.push(...apps.map(a => ({
              ...a,
              job_title: a.job_title ?? a.tituloVacante ?? job.titulo ?? job.title,
              job_id: a.job_id ?? a.vacanteId ?? jobId,
            })))
          } catch {
            // Skip jobs where postulaciones endpoint fails
          }
        }
        return allApplicants.map(mapApplicant)
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}

// Map frontend status values to backend values
const STATUS_MAP = {
  accepted: 'aceptada',
  rejected: 'rechazada',
}

/**
 * Update the status of an applicant to a job posting.
 * Endpoint: PATCH /api/empleo/postulaciones/:id/estado
 */
export function useUpdateApplicationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ applicantId, status }) => {
      const backendStatus = STATUS_MAP[status] ?? status
      return api.patch(`/empleo/postulaciones/${applicantId}/estado`, { estado: backendStatus }).then(r => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'all-applicants'] })
      qc.invalidateQueries({ queryKey: ['institution', 'job-applicants'] })
    },
  })
}
