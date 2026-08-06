import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
function mapJob(job) {
  if (!job) return job

  let status = job.status ?? job.estadoPostulacion ?? job.estado ?? 'pending'
  if (status === 'pendiente') status = 'pending'
  if (status === 'en revisión' || status === 'en_revision' || status === 'revision') status = 'reviewed'
  if (status === 'aceptada' || status === 'aceptado') status = 'accepted'
  if (status === 'rechazada' || status === 'rechazado' || status === 'no seleccionado') status = 'rejected'

  return {
    ...job,
    title: job.title ?? job.titulo,
    description: job.description ?? job.descripcion,
    requirements: job.requirements ?? job.requisitos,
    modality: job.modality ?? job.modalidad,
    schedule: job.schedule ?? job.horario,
    salary_range: job.salary_range ?? job.rangoSalario,
    city: job.city ?? job.ciudad,
    state: job.state ?? job.estado,
    disability_inclusive: job.disability_inclusive ?? job.inclusivaDiscapacidad,
    institution_name: job.institution_name ?? job.nombreInstitucion ?? job.institucionNombre ?? job.institucion?.nombre ?? job.nombre_institucion,
    institution_verified: job.institution_verified ?? job.verificada ?? job.institucionVerificada ?? job.institucion?.verificada,
    institution_id: job.institution_id ?? job.institucionId ?? job.institucion?.id,
    institution_owner_id: job.institution_owner_id ?? job.institucionOwnerId ?? job.institucion?.owner_id ?? job.institucion?.propietarioId,
    disability_types: job.disability_types ?? job.tiposDiscapacidad,
    cover_letter: job.cover_letter ?? job.cartaPresentacion ?? job.carta_presentacion ?? job.mensaje,
    status,
  }
}

export function useJobs(filters = {}) {
  const params = new URLSearchParams()
  if (filters.buscar) params.set('buscar', filters.buscar)
  if (filters.ciudad) params.set('ciudad', filters.ciudad)
  if (filters.modalidad) params.set('modalidad', filters.modalidad)
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.get(`/empleo?${params}`).then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapJob)
    }),
    staleTime: 1000 * 60 * 2,
  })
}

export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/empleo/${id}`).then(r => {
      const inst = r.data?.datos ?? r.data
      return mapJob(inst)
    }),
    enabled: !!id,
  })
}

export function useAppliedJobIds() {
  return useQuery({
    queryKey: ['jobs', 'applied'],
    queryFn: () => api.get('/empleo/postuladas').then(r => {
      const res = r.data
      return Array.isArray(res) ? res : (res?.datos ?? [])
    }),
    staleTime: 1000 * 60 * 5,
  })
}

export function useMyApplications() {
  return useQuery({
    queryKey: ['jobs', 'my-applications'],
    queryFn: () => api.get('/empleo/mis-postulaciones').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapJob)
    }),
  })
}

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

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/empleo', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/empleo/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/empleo/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
