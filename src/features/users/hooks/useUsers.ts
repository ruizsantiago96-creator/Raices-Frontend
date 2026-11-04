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
export interface AdminUsersQueryOptions {
  pagina?: number
  limite?: number
  buscar?: string
  ordenarPor?: string
  direccion?: 'asc' | 'desc'
}

export interface PaginatedAdminUsers {
  datos: UsuarioAdmin[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export function useAdminUsers(params: AdminUsersQueryOptions = {}) {
  const { pagina = 1, limite = 10, buscar, ordenarPor, direccion } = params
  return useQuery<PaginatedAdminUsers>({
    queryKey: ['admin', 'users', pagina, limite, buscar, ordenarPor, direccion],
    queryFn: () => {
      const q: Record<string, unknown> = { pagina, limite }
      if (buscar && buscar.trim()) q.buscar = buscar.trim()
      if (ordenarPor) q.ordenarPor = ordenarPor
      if (direccion) q.direccion = direccion
      return api.get('/administracion/usuarios', { params: q }).then(r => {
        const res = r.data
        const rawList: RawBackendUsuarioAdmin[] = Array.isArray(res) ? res : (res?.datos ?? [])
        return {
          datos: rawList.map(mapUsuarioAdmin),
          total: Number(res?.total ?? rawList.length),
          pagina: Number(res?.pagina ?? pagina),
          limite: Number(res?.limite ?? limite),
          totalPaginas: Number(res?.totalPaginas ?? Math.max(1, Math.ceil((res?.total ?? rawList.length) / limite))),
        }
      })
    },
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
    mutationFn: async ({ id, ...data }: UpdateUserAdminPayload) => {
      if (!id || id === 'undefined') {
        throw new Error('ID de usuario no proporcionado')
      }
      const nombreCompleto = data.nombreCompleto ?? data.full_name ?? ''
      const payload: Record<string, unknown> = {
        nombreCompleto,
        full_name: nombreCompleto,
        email: data.email,
      }
      if (data.role || data.rol) {
        payload.rol = data.rol ?? data.role
        payload.role = data.role ?? data.rol
      }

      try {
        const res = await api.patch(`/administracion/usuarios/${id}`, payload)
        return res.data
      } catch (err: unknown) {
        const errRes = err as { response?: { status?: number } }
        if (errRes.response?.status === 404) {
          try {
            const resAlt = await api.put(`/administracion/usuarios/${id}`, payload)
            return resAlt.data
          } catch (err2: unknown) {
            const err2Res = err2 as { response?: { status?: number } }
            if (err2Res.response?.status === 404) {
              const resAlt2 = await api.put(`/usuarios/${id}`, payload)
              return resAlt2.data
            }
            throw err2
          }
        }
        throw err
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.setQueryData<UsuarioAdmin[]>(['admin', 'users'], (old = []) => {
        return old.map(u => {
          if (String(u.id) === String(variables.id)) {
            const newName = (variables.nombreCompleto ?? variables.full_name ?? u.full_name) as string
            const newEmail = (variables.email ?? u.email) as string
            return {
              ...u,
              full_name: newName,
              nombreCompleto: newName,
              email: newEmail,
            }
          }
          return u
        })
      })
    },
  })
}
