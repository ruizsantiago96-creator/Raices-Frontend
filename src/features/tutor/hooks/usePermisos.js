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
export function usePermisos(dependienteId) {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ['permisos', dependienteId],
    queryFn: () =>
      api.get(`/usuarios/dependientes/${dependienteId}/permisos`).then(r => r.data),
    enabled: !!token && !!dependienteId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1,
  })
}

/**
 * Mutación: actualiza los permisos de un dependiente.
 *
 * PATCH /api/usuarios/dependientes/:id/permisos
 * Body esperado: { puedeComentar, puedeInteractuar, accesoMultimedia, ... }
 *
 * Al tener éxito, invalida la caché de permisos y dependientes.
 *
 * @returns {UseMutationResult}
 */
export function useUpdatePermisos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permisos }) =>
      api.patch(`/usuarios/dependientes/${id}/permisos`, permisos).then(r => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['permisos', variables.id] })
      qc.invalidateQueries({ queryKey: ['dependientes'] })
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
    mutationFn: (payload) =>
      api.post('/usuarios/dependientes/registro', payload).then(r => r.data),
    onSuccess: (_data, variables) => {
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
