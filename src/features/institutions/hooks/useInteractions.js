import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * Hook para registrar una interacción del usuario con una institución.
 * POST /api/usuarios/interacciones
 *
 * @param {'guardar' | 'ver_detalle' | 'click_card'} tipo
 * @param {string} institucionId
 * @param {string} [categoria]
 */
export function registrarInteraccion(institucionId, tipo, categoria) {
  return api.post('/usuarios/interacciones', { institucionId, tipo, categoria })
}

/**
 * Hook mutación para registrar interacciones.
 * Invalida automáticamente la query de pesos para mantener la UI sincronizada.
 */
export function useRegistrarInteraccion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ institucionId, tipo, categoria }) =>
      registrarInteraccion(institucionId, tipo, categoria).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interacciones-pesos'] })
    },
  })
}

/**
 * Hook para obtener el acumulado de puntos de interacciones (últimos 30 días).
 * GET /api/usuarios/interacciones/pesos
 *
 * Pesos: guardar=10, ver_detalle=5, click_card=2
 */
export function useInteraccionesPesos() {
  return useQuery({
    queryKey: ['interacciones-pesos'],
    queryFn: () => api.get('/usuarios/interacciones/pesos').then(r => r.data),
    staleTime: 1000 * 60 * 5, // 5 minutos — no necesita refetch frecuente
  })
}
