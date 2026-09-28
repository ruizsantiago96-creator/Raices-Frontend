/**
 * ONBOARDING API TYPES & CONTRACTS
 * =================================
 * Contratos de API según especificación Backend:
 * - GET /api/onboarding/estado
 * - POST /api/onboarding/borrador
 */

export interface OnboardingEstadoResponse {
  onboardingCompleto: boolean
  porcentajeProgreso: number
  porcentaje?: number
  ultimoPasoCompletado: number
  destinatarioPerfil: 'PARA_MI' | 'PARA_MI_HIJO' | string
  nombrePcd: string
  pasosPendientes?: string[]
  camposFaltantes?: string[]
  [key: string]: unknown
}

export type OnboardingBorradorPayload = Record<string, unknown>

export interface OnboardingBorradorResponse {
  mensaje: string
  porcentajeProgreso: number
  ultimoPasoCompletado: number
  onboardingCompleto: boolean
  [key: string]: unknown
}
