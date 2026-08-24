import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth/store/authStore'
import { useUiStore } from '@shared/stores/uiStore'

export function useProfile() {
  const { token } = useAuthStore()
  const addToast = useUiStore(s => s.addToast)

  const query = useQuery({
    queryKey: ['perfil'],
    queryFn: () => api.get('/usuarios/perfil').then(r => r.data),
    enabled: !!token,
  })

  // Error handling con useEffect (v5 ya no soporta onError en useQuery)
  useEffect(() => {
    if (query.isError) {
      const message = query.error?.response?.data?.message
        || 'No se pudo cargar la información del perfil'
      addToast(message, 'error')
    }
  }, [query.isError, query.error, addToast])

  return query
}

export default useProfile

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/usuarios/perfil', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['yo'] })
    },
  })
}

/**
 * Guarda las escalas de vida del usuario.
 * POST /api/usuarios/escalas-vida
 *
 * @param {Object} payload - { nivelAutonomia, nivelIndependencia, ..., tieneDiagnostico, temporalidadOrigen, preferenciaFormato, areasInteres, viabilidadEconomica }
 */
export function useSaveEscalasVida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.post('/usuarios/escalas-vida', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
