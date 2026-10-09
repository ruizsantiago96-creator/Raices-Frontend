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
export interface OnboardingStatusQueryOptions {
  /** Rol del usuario en sesión (crudo o normalizado): aplica las reglas de tutor/empresa. */
  rol?: string | null
  /** `true` si la cuenta es empresa (misma regla que aplica el hook). */
  esEmpresa?: boolean
}

/**
 * Clave local que registra que el TUTOR ya finalizó el wizard (200 OK).
 * Solo se lee para el rol Tutor y NO declare completo a otros roles: evita
 * que el modal "Completa tu perfil" y el banner del Feed vuelvan a pedir el
 * formulario cuando el backend desplegado aún reporta un porcentaje parcial.
 */
export const CLAVE_CIERRE_ONBOARDING_TUTOR = 'raices_onboarding_tutor_completado'

/**
 * Estado de onboarding + validación de identidad de la sesión actual.
 * GET /api/onboarding/estado (con fallback a /api/usuarios/onboarding)
 *
 * Es la MISMA consulta que ejecuta `useOnboardingStatus`, extraída para poder
 * precargarla desde el registro con auto-login ANTES de redirigir al Feed:
 * así la caché de React Query ya contiene el progreso real del perfil y el
 * modal "Completa tu perfil" reacciona desde el primer render.
 *
 * Si AMBAS rutas de onboarding fallan se propaga el error en vez de devolver
 * `{}`: un fallo no debe cachearse como un estado vacío válido durante
 * `staleTime` (5 min), porque el Feed entonces lee "sin datos" y el modal queda
 * oculto aunque el perfil esté incompleto. React Query lo trata como error y
 * reintenta en el próximo mount.
 */
export async function fetchOnboardingStatus(
  { rol = null, esEmpresa = false }: OnboardingStatusQueryOptions = {},
): Promise<OnboardingEstadoResponse> {
  // Obtenemos estado de onboarding y de validación de identidad en paralelo
  const [onboardingRes, identidadRes] = await Promise.all([
    api.get('/onboarding/estado')
      .catch(() => api.get('/usuarios/onboarding')),
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

  // NOTA: la visibilidad del modal "Completa tu perfil" y los candados del Feed
  // dependen ÚNICAMENTE de la validación real del backend. No se usa ninguna
  // bandera local (localStorage) que declare el onboarding como completo: una
  // bandera persistente sobrevive a recargas y sesiones y ocultaba el modal
  // aunque el perfil siguiera incompleto.
  const isTutor = rol === 'tutor' || rol === 'padre_tutor' || destinatarioPerfil === 'PARA_MI_HIJO'

  // Normalización para tutores: acreditacionTutor es una verificación secundaria/opcional que NO debe estancar el 75%
  pasosPendientes = pasosPendientes.filter((f: string) => f !== 'acreditacionTutor' && (esEmpresa ? f !== 'curp' && f !== 'fechaNacimiento' : true))

  if (esEmpresa && pasosPendientes.length === 0) {
    onboardingCompleto = true
    porcentajeProgreso = 100
  }

  if (isTutor && (porcentajeProgreso >= 75 || pasosPendientes.length === 0)) {
    onboardingCompleto = true
    porcentajeProgreso = 100
    pasosPendientes = []
  }

  // TUTOR que ya finalizó el wizard en este navegador: el cierre local manda
  // (solo para tutor) para que el formulario no vuelva a aparecer aunque el
  // backend (p. ej. un despliegue anterior) responda todavía un % parcial.
  if (
    isTutor &&
    typeof window !== 'undefined' &&
    localStorage.getItem(CLAVE_CIERRE_ONBOARDING_TUTOR) === 'true'
  ) {
    onboardingCompleto = true
    porcentajeProgreso = 100
    pasosPendientes = []
  }

  // Si los documentos están en revisión o aprobados, asumimos el onboarding como completo 
  // para desbloquear todas las vistas globalmente.
  if (estado === 'aprobado' || estado === 'pendiente') {
    onboardingCompleto = true
    porcentajeProgreso = 100
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
  } as OnboardingEstadoResponse
}

export function useOnboardingStatus() {
  const rol = useAuthStore(s => s.user?.role)
  const token = useAuthStore(s => s.token)
  const esEmpresa = rol === 'empresa'

  return useQuery<OnboardingEstadoResponse>({
    queryKey: ['onboarding-status', esEmpresa],
    queryFn: () => fetchOnboardingStatus({ rol, esEmpresa }),
    // Solo con sesión: sin token las rutas responden 401 y, al tragar ese
    // error, se cacheaba un estado vacío que dejaba al Feed sin datos de
    // progreso (el modal "Completa tu perfil" dejaba de aparecer).
    enabled: Boolean(token),
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
