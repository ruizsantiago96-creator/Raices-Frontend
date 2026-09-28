import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { mapInstitucion } from './useInstitutions'
import type { OnboardingEstadoResponse, OnboardingBorradorPayload, OnboardingBorradorResponse } from '@/types/onboarding'
import { useAuthStore } from '@features/auth/store/authStore'

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
      } catch (err: unknown) {
        // Si el backend devuelve 500 (faltan metasActuales/escalasVida/areasInteres),
        // devolver resultado vacío en vez de lanzar error
        const errorObj = err as { response?: { status?: number }; message?: string }
        console.warn('[Recomendaciones] Backend error:', errorObj.response?.status, errorObj.message)
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
 * GET /api/onboarding/estado (con fallback a /api/usuarios/onboarding)
 *
 * Retorna:
 * - onboardingCompleto: boolean
 * - porcentajeProgreso: number (0–100)
 * - porcentaje: number (alias)
 * - ultimoPasoCompletado: number
 * - destinatarioPerfil: 'PARA_MI' | 'PARA_MI_HIJO' | string
 * - nombrePcd: string
 * - pasosPendientes: string[]
 */
export function useOnboardingStatus() {
  const rol = useAuthStore(s => s.user?.role)
  const esEmpresa = rol === 'empresa'

  return useQuery<OnboardingEstadoResponse>({
    queryKey: ['onboarding-status', esEmpresa],
    queryFn: async () => {
      // Obtenemos estado de onboarding y de validación de identidad en paralelo
      const [onboardingRes, identidadRes] = await Promise.all([
        api.get('/onboarding/estado')
          .catch(() => api.get('/usuarios/onboarding'))
          .catch(() => ({ data: {} })),
        api.get('/usuarios/estado-validacion-identidad')
          .catch(() => ({ data: { estado: 'no_subido' } }))
      ])

      const rawData = onboardingRes.data || {}
      const estado = identidadRes.data?.estado

      let porcentajeProgreso = typeof rawData.porcentajeProgreso === 'number'
        ? rawData.porcentajeProgreso
        : typeof rawData.porcentaje === 'number'
          ? rawData.porcentaje
          : 0

      const ultimoPasoCompletado = typeof rawData.ultimoPasoCompletado === 'number'
        ? rawData.ultimoPasoCompletado
        : 0

      const destinatarioPerfil = rawData.destinatarioPerfil || 'PARA_MI'
      const nombrePcd = rawData.nombrePcd || ''
      let pasosPendientes = Array.isArray(rawData.pasosPendientes)
        ? rawData.pasosPendientes
        : Array.isArray(rawData.camposFaltantes)
          ? rawData.camposFaltantes
          : []

      let onboardingCompleto = Boolean(rawData.onboardingCompleto)

      // Normalización para empresas: excluir CURP/fechaNacimiento del cálculo
      if (esEmpresa) {
        pasosPendientes = pasosPendientes.filter(f => f !== 'curp' && f !== 'fechaNacimiento')
        if (pasosPendientes.length === 0) {
          onboardingCompleto = true
          porcentajeProgreso = 100
        }
      }

      // Si los documentos están en revisión o aprobados, asumimos el onboarding como completo 
      // para desbloquear todas las vistas globalmente.
      if (estado === 'aprobado' || estado === 'pendiente') {
        onboardingCompleto = true
      }

      return {
        ...rawData,
        onboardingCompleto,
        porcentajeProgreso,
        porcentaje: porcentajeProgreso,
        ultimoPasoCompletado,
        destinatarioPerfil,
        nombrePcd,
        pasosPendientes,
        camposFaltantes: pasosPendientes,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para guardar avance o pausar el onboarding (Guardar Borrador).
 * POST /api/onboarding/borrador
 */
export function useSaveOnboardingBorrador() {
  const queryClient = useQueryClient()

  return useMutation<OnboardingBorradorResponse, Error, OnboardingBorradorPayload>({
    mutationFn: async (payload) => {
      const response = await api.post('/onboarding/borrador', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] })
    },
  })
}
