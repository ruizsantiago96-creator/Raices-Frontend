import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * Hook para registrar una interacción del usuario con una institución.
 * POST /api/usuarios/interacciones
 *
 * @param {'guardar' | 'ver_detalle' | 'click_card'} tipo
 * @param {string} institucionId
 * @param {string} [categoria]
 *
 * Pesos del backend:
 * - guardar: 10 puntos
 * - ver_detalle: 5 puntos
 * - click_card: 2 puntos
 */
export function registrarInteraccion(institucionId, tipo, categoria) {
  return api.post('/usuarios/interacciones', { institucionId, tipo, categoria })
}

/**
 * Hook mutación para registrar interacciones.
 * Invalida automáticamente las queries de recomendaciones para mantener la UI sincronizada.
 */
export function useRegistrarInteraccion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ institucionId, tipo, categoria }) =>
      registrarInteraccion(institucionId, tipo, categoria).then(r => r.data),
    onSuccess: () => {
      // Invalidar recomendaciones para que se recalculen con la nueva interacción
      qc.invalidateQueries({ queryKey: ['recomendaciones'] })
      qc.invalidateQueries({ queryKey: ['recomendaciones-especialistas'] })
    },
  })
}

/**
 * Hook para consultar pesos de interacción acumulados del usuario (últimos 30 días).
 * GET /api/usuarios/interacciones/pesos
 */
export function useInteraccionesPesos() {
  return useQuery({
    queryKey: ['interacciones', 'pesos'],
    queryFn: () =>
      api
        .get('/usuarios/interacciones/pesos')
        .then(r => r.data)
        .catch(() => ({})),
    staleTime: 1000 * 60 * 5,
  })
}
