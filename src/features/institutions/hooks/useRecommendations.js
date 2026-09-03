import { useQuery } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { mapInstitucion } from './useInstitutions'

/**
 * Hook para obtener instituciones recomendadas personalizadas.
 * GET /api/usuarios/recomendaciones
 *
 * Algoritmo nuevo (server-side):
 * - Score de intereses (60%): coincidencia por tokens entre metasActuales + areasInteres
 *   del usuario y nombre, descripción, categoría, servicios de la institución.
 * - Score de comportamiento (40%): basado en interacciones de los últimos 30 días.
 *   Pesos: guardar=10, ver_detalle=5, click_card=2
 *
 * Retorna instituciones priorizadas con final_score (0–1) y paginación.
 */
export function useRecomendaciones({ pagina = 1, limite = 20 } = {}) {
  return useQuery({
    queryKey: ['recomendaciones', { pagina, limite }],
    queryFn: async () => {
      try {
        const r = await api.get('/usuarios/recomendaciones', { params: { pagina, limite } })
        const res = r.data
        const data = Array.isArray(res) ? res : (res?.datos ?? [])
        return {
          instituciones: data.map(mapInstitucion),
          paginacion: res?.paginacion ?? { total: data.length, pagina, limite, totalPaginas: 1 },
        }
      } catch (err) {
        // Si el backend devuelve 500 (faltan metasActuales/escalasVida/areasInteres),
        // devolver resultado vacío en vez de lanzar error
        console.warn('[Recomendaciones] Backend error:', err.response?.status, err.message)
        return {
          instituciones: [],
          paginacion: { total: 0, pagina, limite, totalPaginas: 0 },
          _backendError: true,
        }
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutos — las recomendaciones no cambian tan rápido
    retry: false, // No reintentar — el error es por datos faltantes, no por red
  })
}

/**
 * Hook para obtener especialistas recomendados personalizados.
 * GET /api/usuarios/especialistas
 *
 * Algoritmo nuevo (server-side):
 * - Tipo de discapacidad (40%): coincidencia entre tipos del usuario y especialista
 * - Rango de edad (30%): si la edad está dentro del rango aceptado
 * - Reputación (20%): calificacionPromedio (escala 0–5)
 * - Ubicación (10%): coincidencia de ciudad; +0.5 si virtual/online
 *
 * Retorna especialistas priorizados con final_score (0–1) y paginación.
 */
export function useRecomendacionesEspecialistas({ pagina = 1, limite = 20 } = {}) {
  return useQuery({
    queryKey: ['recomendaciones-especialistas', { pagina, limite }],
    queryFn: async () => {
      const r = await api.get('/usuarios/especialistas', { params: { pagina, limite } })
      const res = r.data
      const data = Array.isArray(res) ? res : (res?.datos ?? [])
      return {
        especialistas: data,
        paginacion: res?.paginacion ?? { total: data.length, pagina: 1, limite: 20, totalPaginas: 1 },
      }
    },
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * Hook para verificar el estado de onboarding del usuario.
 * GET /api/usuarios/onboarding
 *
 * Retorna:
 * - onboardingCompleto: boolean
 * - camposFaltantes: string[]
 * - porcentaje: number (0–100)
 */
export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: async () => {
      const r = await api.get('/usuarios/onboarding')
      return r.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
