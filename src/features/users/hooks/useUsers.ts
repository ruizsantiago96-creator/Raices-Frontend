import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import type { AdminUserRole, UsuarioAdmin, RawBackendUsuarioAdmin, UpdateUserAdminPayload } from '@/types/admin'

/**
 * Mapea campos en español del response de la API a los campos normalizados.
 */
function mapUsuarioAdmin(u: RawBackendUsuarioAdmin): UsuarioAdmin {
  const rawRole = String(u.rol ?? u.role ?? 'user').toLowerCase()
  let normalizedRole = rawRole
  if (rawRole === 'institucion') normalizedRole = 'institution'
  if (rawRole === 'padre_tutor') normalizedRole = 'tutor'
  if (rawRole === 'persona_discapacidad') normalizedRole = 'pcd'

  return {
    ...u,
    id: (u.id ?? u._id ?? u.uid ?? '') as string | number,
    full_name: u.nombreCompleto ?? u.full_name ?? u.nombre ?? 'Sin nombre',
    email: u.email ?? '',
    role: normalizedRole as AdminUserRole,
    is_active: (u.activo ?? u.is_active ?? true) as boolean,
    created_at: u.fechaCreacion ?? u.created_at ?? u.createdAt,
  }
}

/**
 * Hook para listar todos los usuarios (panel admin).
 * GET /api/administracion/usuarios
 */
export function useAdminUsers() {
  return useQuery<UsuarioAdmin[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/administracion/usuarios').then(r => {
      const res = r.data
      const data: RawBackendUsuarioAdmin[] = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapUsuarioAdmin)
    }),
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.patch<{ is_active: boolean }>(`/administracion/usuarios/${id}/activo`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useChangeUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string | number; role: string }) =>
      api.patch(`/administracion/usuarios/${id}/rol`, { rol: role, role: role }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => api.delete(`/administracion/usuarios/${id}`).then(r => r.data),
    onMutate: async (id: string | number) => {
      await qc.cancelQueries({ queryKey: ['admin', 'users'] })
      const previousUsers = qc.getQueryData<UsuarioAdmin[]>(['admin', 'users'])
      qc.setQueryData<UsuarioAdmin[]>(['admin', 'users'], (old = []) =>
        old.filter(u => String(u.id) !== String(id))
      )
      return { previousUsers }
    },
    onError: (_err, _id, context) => {
      if (context?.previousUsers) {
        qc.setQueryData(['admin', 'users'], context.previousUsers)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useUpdateUserAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserAdminPayload) =>
      api.put(`/administracion/usuarios/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
