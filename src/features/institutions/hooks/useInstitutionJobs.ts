import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import type { Job, RawBackendJob } from '@/types/jobs'
import type { InstitutionJobApplicant, RawBackendJobApplicant } from '@/types/institutions'

/* ── Map helpers ─────────────────────────────────────────── */

function mapJob(job: RawBackendJob): Job {
  if (!job) return job as unknown as Job

  let status = job.status ?? job.estadoPostulacion ?? job.estado ?? 'active'
  if (status === 'activa' || status === 'Activa') status = 'active'
  if (status === 'pausada' || status === 'Pausada') status = 'paused'

  return {
    ...job,
    id: (job.id ?? (job as { _id?: string | number })._id ?? (job as { vacanteId?: string | number }).vacanteId ?? '') as string | number,
    title: job.title ?? job.titulo ?? '',
    description: job.description ?? job.descripcion,
    requirements: job.requirements ?? job.requisitos,
    modality: job.modality ?? job.modalidad,
    schedule: job.schedule ?? job.horario,
    salary_range: job.salary_range ?? job.rangoSalario,
    city: job.city ?? job.ciudad,
    state: job.state ?? job.estado,
    disability_inclusive: job.disability_inclusive ?? job.inclusivaDiscapacidad,
    applicants_count: (job.applicants_count ?? job.numPostulantes ?? job.postulantesCount ?? job.cantidadPostulantes ?? 0) as number,
    created_at: (job.created_at ?? job.fechaCreacion ?? (job as { createdAt?: string }).createdAt) as string | undefined,
    updated_at: (job.updated_at ?? job.fechaActualizacion ?? (job as { updatedAt?: string }).updatedAt) as string | undefined,
    status,
    is_active: (job.is_active ?? job.activa ?? status === 'active') as boolean,
  }
}

function mapApplicant(app: RawBackendJobApplicant): InstitutionJobApplicant {
  if (!app) return app as unknown as InstitutionJobApplicant

  let status = app.status ?? app.estadoPostulacion ?? app.estado ?? 'pending'
  if (status === 'pendiente' || status === 'Pendiente') status = 'pending'
  if (status === 'en revisión' || status === 'en_revision' || status === 'En revisión' || status === 'En Revisión') status = 'reviewed'
  if (status === 'aceptada' || status === 'aceptado' || status === 'Aceptada' || status === 'Aceptado') status = 'accepted'
  if (status === 'rechazada' || status === 'rechazado' || status === 'Rechazada' || status === 'Rechazado') status = 'rejected'

  return {
    ...app,
    id: app.id ?? app._id ?? app.postulacionId ?? '',
    user_id: app.user_id ?? app.usuarioId ?? app.usuario?.id,
    user_name: app.user_name ?? app.nombreUsuario ?? app.usuario?.nombreCompleto,
    user_email: app.user_email ?? app.emailUsuario ?? app.usuario?.email,
    job_id: app.job_id ?? app.vacanteId ?? app.vacante?.id,
    job_title: app.job_title ?? app.tituloVacante ?? app.vacante?.titulo ?? app.titulo,
    cover_letter: app.cover_letter ?? app.cartaPresentacion ?? app.carta_presentacion,
    created_at: app.created_at ?? app.fechaCreacion ?? app.createdAt,
    status,
  }
}

/* ── Institution Job Postings ────────────────────────────── */

/** Helper: returns true only if the current user has the institution role. */
const useIsInstitution = () => useAuthStore(s => s.user?.role === 'institution')

export interface UseInstitutionJobsOptions {
  enabled?: boolean
  [key: string]: unknown
}

/**
 * Fetch all job postings created by the current institution.
 */
export function useMyJobPostings(opts?: UseInstitutionJobsOptions): UseQueryResult<Job[]> {
  const isInstitution = useIsInstitution()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['institution', 'job-postings'],
    queryFn: async (): Promise<Job[]> => {
      const r = await api.get('/empleo', { params: { mias: true } })
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return (data as RawBackendJob[]).map(mapJob)
    },
    staleTime: 1000 * 60 * 2,
    enabled: isInstitution && callerEnabled !== false,
    ...restOpts,
  })
}

/**
 * Get a single job posting detail for the institution.
 */
export function useJobPosting(id?: string | number): UseQueryResult<Job> {
  return useQuery({
    queryKey: ['institution', 'job-posting', id],
    queryFn: async (): Promise<Job> => {
      const r = await api.get(`/empleo/${id}`)
      const inst = (r.data?.datos ?? r.data) as RawBackendJob
      return mapJob(inst)
    },
    enabled: !!id,
  })
}

export interface CreateJobPostingPayload {
  titulo: string
  descripcion?: string
  requisitos?: string
  modalidad?: string
  horario?: string
  rangoSalario?: string
  ciudad?: string
  estado?: string
  inclusivaDiscapacidad?: boolean
  [key: string]: unknown
}

export function useCreateJobPosting(): UseMutationResult<unknown, Error, CreateJobPostingPayload> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateJobPostingPayload) => api.post('/empleo', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'job-postings'] })
    },
  })
}

export function useUpdateJobPosting(): UseMutationResult<unknown, Error, Partial<CreateJobPostingPayload> & { id: string | number }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<CreateJobPostingPayload> & { id: string | number }) => api.put(`/empleo/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'job-postings'] })
    },
  })
}

export function useDeleteJobPosting(): UseMutationResult<unknown, Error, string | number> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.delete(`/empleo/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'job-postings'] })
    },
  })
}

export function useToggleJobStatus(): UseMutationResult<unknown, Error, { id: string | number; is_active: boolean }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string | number; is_active: boolean }) =>
      api.patch(`/empleo/${id}/estado`, { activa: is_active }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'job-postings'] })
    },
  })
}

/* ── Job Applicants ──────────────────────────────────────── */

export function useJobApplicants(jobId?: string | number, opts?: UseInstitutionJobsOptions): UseQueryResult<InstitutionJobApplicant[]> {
  const isInstitution = useIsInstitution()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['institution', 'job-applicants', jobId],
    queryFn: async (): Promise<InstitutionJobApplicant[]> => {
      try {
        const r = await api.get('/empleo/postulantes-vacante', { params: { vacanteId: jobId } })
        const res = r.data
        const data = Array.isArray(res) ? res : (res?.datos ?? [])
        return (data as RawBackendJobApplicant[]).map(mapApplicant)
      } catch (err: unknown) {
        const errorResponse = err as { response?: { status?: number } }
        if (errorResponse.response?.status === 404) return []
        throw err
      }
    },
    enabled: isInstitution && !!jobId && callerEnabled !== false,
    ...restOpts,
  })
}

export function useAllJobApplicants(opts?: UseInstitutionJobsOptions): UseQueryResult<InstitutionJobApplicant[]> {
  const isInstitution = useIsInstitution()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['institution', 'all-applicants'],
    queryFn: async (): Promise<InstitutionJobApplicant[]> => {
      try {
        const r = await api.get('/empleo/postulantes-institucion')
        const res = r.data
        const data = Array.isArray(res) ? res : (res?.datos ?? [])
        return (data as RawBackendJobApplicant[]).map(mapApplicant)
      } catch (err: unknown) {
        const errorResponse = err as { response?: { status?: number } }
        if (errorResponse.response?.status === 404) return []
        throw err
      }
    },
    staleTime: 1000 * 60 * 2,
    enabled: isInstitution && callerEnabled !== false,
    ...restOpts,
  })
}

const STATUS_MAP: Record<string, string> = {
  accepted: 'aceptada',
  rejected: 'rechazada',
}

export function useUpdateApplicationStatus(): UseMutationResult<unknown, Error, { applicantId: string | number; status: string }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ applicantId, status }: { applicantId: string | number; status: string }) => {
      const backendStatus = STATUS_MAP[status] ?? status
      return api.patch(`/empleo/postulaciones/${applicantId}/estado`, { estado: backendStatus }).then(r => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution', 'all-applicants'] })
      qc.invalidateQueries({ queryKey: ['institution', 'job-applicants'] })
    },
  })
}
