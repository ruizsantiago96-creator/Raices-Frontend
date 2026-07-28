import { useQuery } from '@tanstack/react-query'
import api from '@shared/lib/api'

/**
 * Hook: consulta todos los catálogos del backend.
 *
 * Devuelve un objeto con todas las listas de opciones que el frontend necesita
 * para formularios, filtros, etc. Los catálogos se cachean por 24 horas ya que
 * son datos que cambian muy raramente.
 */
export function useCatalogos() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['catalogos'],
    queryFn: async () => {
      const { data } = await api.get('/catalogos')
      return data
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas - los catálogos cambian poco
    retry: 2,
  })

  return {
    data: data ?? {},
    isLoading,
    isError,
    error,
  }
}
