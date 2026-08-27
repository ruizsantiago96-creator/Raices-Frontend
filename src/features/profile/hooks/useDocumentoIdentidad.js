import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'

/**
 * Hook para consultar el estado de validación de identidad del usuario.
 * GET /usuarios/estado-validacion-identidad
 */
export function useEstadoValidacion() {
  const token = useAuthStore(s => s.token)
  return useQuery({
    queryKey: ['documento-identidad', 'estado'],
    queryFn: () => api.get('/usuarios/estado-validacion-identidad').then(r => r.data),
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook para subir un documento de identidad (CURP o identificación oficial).
 * POST /usuarios/documento-identidad (multipart/form-data)
 */
export function useSubirDocumentoIdentidad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tipo, file, numeroCurp }) => {
      const formData = new FormData()
      formData.append('tipo', tipo)
      formData.append('documento', file)
      if (tipo === 'curp' && numeroCurp) {
        formData.append('numeroCurp', numeroCurp)
      }
      return api.post('/usuarios/documento-identidad', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documento-identidad'] })
    },
  })
}
