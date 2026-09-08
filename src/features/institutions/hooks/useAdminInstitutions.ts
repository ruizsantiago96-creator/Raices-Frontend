import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import type { Institution, RawBackendInstitucion, UpdateInstitucionPayload } from '@/types/institutions'

/**
 * Mapea campos en español del response de la API a los campos en inglés
 * que el componente InstitutionsTab espera.
 */
function mapInstitucionAdmin(inst: RawBackendInstitucion): Institution {
  return {
    ...inst,
    id: inst.id ?? inst._id ?? inst.documentId ?? inst.institutionId ?? '',
    name: inst.nombre ?? inst.name ?? 'Sin nombre',
    category: inst.categoria ?? inst.category,
    city: inst.ciudad ?? inst.city,
    email: inst.email ?? inst.emailContacto ?? inst.correo ?? inst.correoElectronico,
    is_active: inst.activa ?? inst.is_active,
    is_verified: inst.verificada ?? inst.is_verified,
    rating_avg: inst.calificacionPromedio ?? inst.rating_avg,
    rating_count: inst.cantidadCalificaciones ?? inst.rating_count,
    created_at: inst.fechaCreacion ?? inst.created_at,
  }
}

/* ── Instituciones ── */
/** Helper: returns true only if the current user is an admin. */
const useIsAdmin = () => useAuthStore(s => s.user?.role === 'admin')

export interface UseAdminInstitutionsOptions {
  enabled?: boolean
  [key: string]: unknown
}

export function useAllInstitutions(opts?: UseAdminInstitutionsOptions): UseQueryResult<Institution[]> {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['admin', 'institutions'],
    queryFn: async (): Promise<Institution[]> => {
      const r = await api.get('/administracion/instituciones')
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      const mapped = (data as RawBackendInstitucion[]).map(mapInstitucionAdmin)
      // Deduplicar por ID para evitar instituciones repetidas del backend
      const seen = new Map<string | number, Institution>()
      for (const inst of mapped) {
        if (!seen.has(inst.id)) seen.set(inst.id, inst)
      }
      return [...seen.values()]
    },
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

/**
 * Hook para listar instituciones pendientes de aprobación.
 * GET /api/administracion/instituciones/pending
 */
export function usePendingInstitutions(opts?: UseAdminInstitutionsOptions): UseQueryResult<Institution[]> {
  const isAdmin = useIsAdmin()
  const { enabled: callerEnabled, ...restOpts } = opts ?? {}
  return useQuery({
    queryKey: ['admin', 'pending'],
    queryFn: async (): Promise<Institution[]> => {
      const r = await api.get('/administracion/instituciones/pendientes')
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      const mapped = (data as RawBackendInstitucion[]).map(mapInstitucionAdmin)
      // Deduplicar por ID para evitar instituciones repetidas del backend
      const seen = new Map<string | number, Institution>()
      for (const inst of mapped) {
        if (!seen.has(inst.id)) seen.set(inst.id, inst)
      }
      return [...seen.values()]
    },
    enabled: isAdmin && callerEnabled !== false,
    ...restOpts,
  })
}

export function useApproveInstitution(): UseMutationResult<unknown, Error, string | number> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.post(`/administracion/instituciones/${id}/aprobar`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useRejectInstitution(): UseMutationResult<unknown, Error, string | number> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.delete(`/administracion/instituciones/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useToggleVerifyInstitution(): UseMutationResult<unknown, Error, string | number> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.patch(`/administracion/instituciones/${id}/verificar`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useUpdateAdminInstitution(): UseMutationResult<unknown, Error, UpdateInstitucionPayload & { id: string | number }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateInstitucionPayload & { id: string | number }) =>
      api.put(`/administracion/instituciones/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['institutions'] })
    },
  })
}
