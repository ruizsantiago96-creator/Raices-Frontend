import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * Hook to retrieve all developmental routes.
 * GET /api/rutas-desarrollo
 */
export function useRutas(filters = {}) {
  return useQuery({
    queryKey: ['rutas', filters],
    queryFn: () => api.get('/rutas-desarrollo', { params: filters }).then(r => r.data),
  })
}

/**
 * Hook to retrieve developmental routes summary.
 * GET /api/rutas-desarrollo/resumen
 */
export function useRutasSummary() {
  return useQuery({
    queryKey: ['rutas', 'resumen'],
    queryFn: () => api.get('/rutas-desarrollo/resumen').then(r => r.data),
  })
}

/**
 * Hook to retrieve a single developmental route's detail including steps.
 * GET /api/rutas-desarrollo/:id
 */
export function useRutaDetail(id) {
  return useQuery({
    queryKey: ['rutas', 'detail', id],
    queryFn: () => api.get(`/rutas-desarrollo/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

/**
 * Hook to create a new developmental route.
 * POST /api/rutas-desarrollo
 */
export function useCreateRuta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post('/rutas-desarrollo', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
    },
  })
}

/**
 * Hook to update a developmental route.
 * PUT /api/rutas-desarrollo/:id
 */
export function useUpdateRuta(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.put(`/rutas-desarrollo/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
      qc.invalidateQueries({ queryKey: ['rutas', 'detail', id] })
    },
  })
}

/**
 * Hook to delete a developmental route.
 * DELETE /api/rutas-desarrollo/:id
 */
export function useDeleteRuta(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/rutas-desarrollo/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
    },
  })
}

/**
 * Hook to add a step to a developmental route.
 * POST /api/rutas-desarrollo/:id/pasos
 */
export function useAddPaso(rutaId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post(`/rutas-desarrollo/${rutaId}/pasos`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
      qc.invalidateQueries({ queryKey: ['rutas', 'detail', rutaId] })
    },
  })
}

/**
 * Hook to complete a step.
 * PATCH /api/rutas-desarrollo/:rutaId/pasos/:pasoId/completar
 */
export function useCompletarPaso(rutaId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pasoId) => api.patch(`/rutas-desarrollo/${rutaId}/pasos/${pasoId}/completar`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
      qc.invalidateQueries({ queryKey: ['rutas', 'detail', rutaId] })
    },
  })
}

/**
 * Hook to uncomplete a step.
 * PATCH /api/rutas-desarrollo/:rutaId/pasos/:pasoId/descompletar
 */
export function useDescompletarPaso(rutaId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pasoId) => api.patch(`/rutas-desarrollo/${rutaId}/pasos/${pasoId}/descompletar`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
      qc.invalidateQueries({ queryKey: ['rutas', 'detail', rutaId] })
    },
  })
}
