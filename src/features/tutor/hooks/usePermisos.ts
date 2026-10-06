import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'

/**
 * Hook: obtiene los permisos de un dependiente específico.
 *
 * Cache key: ['permisos', dependienteId]
 *
 * @param {string} dependienteId - ID del dependiente
 * @returns {{ data: Object|null, isLoading: boolean, isError: boolean, error: Error|null }}
 */
export function usePermisos(dependienteId: string | number) {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ['permisos', String(dependienteId)],
    queryFn: async () => {
      try {
        const res = await api.get(`/tutores/dependientes/${dependienteId}/permisos`)
        return res.data
      } catch {
        const res = await api.get(`/usuarios/dependientes/${dependienteId}/permisos`)
        return res.data
      }
    },
    enabled: !!token && !!dependienteId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1,
  })
}

/**
 * Mutación: actualiza los permisos de un dependiente.
 *
 * PATCH /api/tutores/dependientes/:id/permisos o /api/usuarios/dependientes/:id/permisos
 * Body esperado: { acciones, permisos, puedeComentar, puedeInteractuar, ... }
 *
 * Al tener éxito, invalida la caché de permisos y dependientes.
 *
 * @returns {UseMutationResult}
 */
export function useUpdatePermisos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { id: string | number; permisos?: Record<string, boolean> }) => {
      const payload = {
        acciones: variables.permisos,
        permisos: variables.permisos,
        modulos: variables.permisos,
        ...(variables.permisos ?? {}),
      }
      try {
        const res = await api.put(`/tutores/dependientes/${variables.id}/permisos`, payload)
        return res.data
      } catch {
        try {
          const res = await api.patch(`/tutores/dependientes/${variables.id}/permisos`, payload)
          return res.data
        } catch {
          try {
            const res = await api.put(`/usuarios/dependientes/${variables.id}/permisos`, payload)
            return res.data
          } catch {
            const res = await api.patch(`/usuarios/dependientes/${variables.id}/permisos`, payload)
            return res.data
          }
        }
      }
    },
    onSuccess: (_data, variables: { id: string | number; permisos?: Record<string, boolean> }) => {
      qc.invalidateQueries({ queryKey: ['permisos', String(variables.id)] })
      qc.invalidateQueries({ queryKey: ['dependiente', String(variables.id)] })
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      qc.invalidateQueries({ queryKey: ['mis-personas'] })
    },
  })
}

/**
 * Mutación: registra una cuenta para el dependiente (email + password).
 *
 * POST /api/usuarios/dependientes/registro
 * Body: { email, password, dependienteId }
 *
 * Esto crea la cuenta real en Firebase para que el dependiente pueda iniciar sesión.
 *
 * @returns {UseMutationResult}
 */
export function useRegisterDependiente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post('/usuarios/dependientes/registro', payload).then(r => r.data),
    onSuccess: (_data, variables: { dependienteId?: string | number }) => {
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      if (variables?.dependienteId) {
        qc.invalidateQueries({ queryKey: ['dependiente', variables.dependienteId] })
      }
    },
  })
}

/**
 * Valores por defecto de permisos cuando no hay datos del backend.
 */
export const DEFAULT_PERMISOS = {
  puedeComentar: true,
  puedeInteractuar: true,
  accesoMultimedia: true,
  accesoChat: false,
  puedePublicar: false,
}

/**
 * Definición de los permisos disponibles para mostrar en la UI.
 * Cada uno tiene un label descriptivo, un ícono y una descripción.
 */
export const PERMISOS_CONFIG = [
  {
    key: 'puedeComentar',
    label: 'Puede comentar',
    description: 'Permite dejar comentarios en publicaciones y reseñas',
    icon: 'message',
  },
  {
    key: 'puedeInteractuar',
    label: 'Puede interactuar',
    description: 'Permite dar "me gusta" y reaccionar a contenido',
    icon: 'heart',
  },
  {
    key: 'accesoMultimedia',
    label: 'Acceso a contenido multimedia',
    description: 'Permite ver fotos, videos y contenido visual',
    icon: 'eye',
  },
  {
    key: 'accesoChat',
    label: 'Acceso al chat',
    description: 'Permite enviar y recibir mensajes directos',
    icon: 'message',
  },
  {
    key: 'puedePublicar',
    label: 'Puede publicar',
    description: 'Permite crear publicaciones en la comunidad',
    icon: 'plus',
  },
]
