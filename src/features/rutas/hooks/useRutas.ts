import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import type {
  RutaDesarrollo,
  RutasSummary,
  RutasFilters,
  CreateRutaPayload,
  UpdateRutaPayload,
  PasoRuta,
  CreatePasoPayload,
} from '@/types/rutas'

/**
 * Hook to retrieve all developmental routes.
 * GET /api/rutas-desarrollo
 */
export function useRutas(filters: RutasFilters = {}) {
  return useQuery<RutaDesarrollo[]>({
    queryKey: ['rutas', filters],
    queryFn: () => api.get<RutaDesarrollo[]>('/rutas-desarrollo', { params: filters }).then(r => r.data),
  })
}

/**
 * Hook to retrieve developmental routes summary.
 * GET /api/rutas-desarrollo/resumen
 */
export function useRutasSummary() {
  return useQuery<RutasSummary>({
    queryKey: ['rutas', 'resumen'],
    queryFn: () => api.get<RutasSummary>('/rutas-desarrollo/resumen').then(r => r.data),
  })
}

/**
 * Hook to retrieve a single developmental route's detail including steps.
 * GET /api/rutas-desarrollo/:id
 */
export function useRutaDetail(id: string | number | null | undefined) {
  return useQuery<RutaDesarrollo>({
    queryKey: ['rutas', 'detail', id],
    queryFn: () => api.get<RutaDesarrollo>(`/rutas-desarrollo/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

/**
 * Hook to create a new developmental route.
 * POST /api/rutas-desarrollo
 */
export function useCreateRuta() {
  const qc = useQueryClient()
  return useMutation<RutaDesarrollo, Error, CreateRutaPayload>({
    mutationFn: (body) => api.post<RutaDesarrollo>('/rutas-desarrollo', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
    },
  })
}

/**
 * Hook to update a developmental route.
 * PUT /api/rutas-desarrollo/:id
 */
export function useUpdateRuta(id: string | number | null | undefined) {
  const qc = useQueryClient()
  return useMutation<RutaDesarrollo, Error, UpdateRutaPayload>({
    mutationFn: (body) => api.put<RutaDesarrollo>(`/rutas-desarrollo/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
      if (id) {
        qc.invalidateQueries({ queryKey: ['rutas', 'detail', id] })
      }
    },
  })
}

/**
 * Hook to delete a developmental route.
 * DELETE /api/rutas-desarrollo/:id
 */
export function useDeleteRuta(id: string | number | null | undefined) {
  const qc = useQueryClient()
  return useMutation<{ exito?: boolean }, Error, void>({
    mutationFn: () => api.delete<{ exito?: boolean }>(`/rutas-desarrollo/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
    },
  })
}

/**
 * Hook to add a step to a developmental route.
 * POST /api/rutas-desarrollo/:id/pasos
 */
export function useAddPaso(rutaId: string | number) {
  const qc = useQueryClient()
  return useMutation<PasoRuta, Error, CreatePasoPayload>({
    mutationFn: (body) => api.post<PasoRuta>(`/rutas-desarrollo/${rutaId}/pasos`, body).then(r => r.data),
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
export function useCompletarPaso(rutaId: string | number) {
  const qc = useQueryClient()
  return useMutation<PasoRuta, Error, string | number>({
    mutationFn: (pasoId) => api.patch<PasoRuta>(`/rutas-desarrollo/${rutaId}/pasos/${pasoId}/completar`).then(r => r.data),
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
export function useDescompletarPaso(rutaId: string | number) {
  const qc = useQueryClient()
  return useMutation<PasoRuta, Error, string | number>({
    mutationFn: (pasoId) => api.patch<PasoRuta>(`/rutas-desarrollo/${rutaId}/pasos/${pasoId}/descompletar`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
      qc.invalidateQueries({ queryKey: ['rutas', 'detail', rutaId] })
    },
  })
}
