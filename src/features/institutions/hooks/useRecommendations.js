import { useQuery } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { mapInstitucion } from './useInstitutions'

/**
 * Hook para obtener instituciones recomendadas personalizadas.
 * GET /api/usuarios/recomendaciones
 *
 * Algoritmo: 60% coincidencias de perfil en perfilesExtendidos + 40% histórico de comportamiento.
 * Retorna instituciones priorizadas según el perfil y las interacciones del usuario.
 */
export function useRecomendaciones() {
  return useQuery({
    queryKey: ['recomendaciones'],
    queryFn: async () => {
      const r = await api.get('/usuarios/recomendaciones')
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return data.map(mapInstitucion)
    },
    staleTime: 1000 * 60 * 10, // 10 minutos — las recomendaciones no cambian tan rápido
  })
}
