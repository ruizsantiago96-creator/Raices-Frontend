import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * @typedef {Object} UsuarioAdmin
 * @property {string} id - ID del usuario
 * @property {string} email - Correo electrónico
 * @property {string} nombreCompleto - Nombre completo
 * @property {'admin'|'pcd'|'tutor'|'institution'} rol - Rol del usuario
 * @property {string} [ciudad] - Ciudad del usuario
 * @property {string} [estado] - Estado del usuario
 * @property {boolean} activo - Si el usuario está activo
 * @property {string} fechaCreacion - Fecha de creación (ISO)
 */

/**
 * Mapea campos en español del response de la API a los campos en inglés
 * que el componente UsersTab espera.
 * @param {UsuarioAdmin} u - Objeto crudo del API
 * @returns {Object} Usuario con campos normalizados
 */
function mapUsuarioAdmin(u) {
  return {
    ...u,
    id: u.id ?? u._id ?? u.uid,
    full_name: u.nombreCompleto ?? u.full_name ?? u.nombre ?? 'Sin nombre',
    role: u.rol ?? u.role ?? 'user',
    is_active: u.activo ?? u.is_active ?? true,
    created_at: u.fechaCreacion ?? u.created_at ?? u.createdAt,
  }
}

/**
 * Hook para listar todos los usuarios (panel admin).
 * GET /api/administracion/usuarios
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/administracion/usuarios').then(r => {
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapUsuarioAdmin)
    }),
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/administracion/usuarios/${id}/activo`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useChangeUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => api.patch(`/administracion/usuarios/${id}/rol`, { rol: role, role: role }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/administracion/usuarios/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useUpdateUserAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/administracion/usuarios/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
