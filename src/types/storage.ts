/**
 * TIPOS Y CONTRATOS DE STORAGE (Fase 1 · Migración TS)
 * ====================================================
 */

/** Claves estáticas de localStorage / sessionStorage */
export type StaticStorageKey =
  | 'raices_token'
  | 'raices_refresh'
  | 'raices_user'
  | 'raices_remember'
  | 'raices_auth'
  | 'raices_user_interests'
  | 'raices_user_viability'
  | 'raices_user_formatos'
  | 'raices_ai_narrative'
  | 'sidebar_collapsed'
  | 'recent_searches'
  | 'admin-tab'
  | 'inst-portal-tab'
  | 'raices_engagement'

/** Prefijos o patrones de claves dinámicas por ID */
export type DynamicStorageKey =
  | `raices_birth_date_${string | number}`
  | `raices_age_${string | number}`
  | `raices_dep_birth_date_${string | number}`
  | `raices_user_cv_${string | number}`
  | `raices_user_cp_${string | number}`
  | `raices_user_address_${string | number}`
  | `raices_user_phone_${string | number}`

/** Todas las claves válidas de storage */
export type StorageKey = StaticStorageKey | DynamicStorageKey

/** Contrato estricto del objeto STORAGE_KEYS */
export interface StorageKeysContract {
  readonly AUTH_TOKEN: 'raices_token'
  readonly AUTH_REFRESH: 'raices_refresh'
  readonly AUTH_USER: 'raices_user'
  readonly AUTH_REMEMBER: 'raices_remember'
  readonly AUTH_LEGACY: 'raices_auth'

  readonly USER_INTERESTS: 'raices_user_interests'
  readonly USER_VIABILITY: 'raices_user_viability'
  readonly USER_FORMATOS: 'raices_user_formatos'
  readonly AI_NARRATIVE: 'raices_ai_narrative'

  readonly userBirthDate: (userId: string | number) => `raices_birth_date_${string | number}`
  readonly userAge: (userId: string | number) => `raices_age_${string | number}`
  readonly depBirthDate: (dependienteId: string | number) => `raices_dep_birth_date_${string | number}`

  readonly userCv: (candidateId: string | number) => `raices_user_cv_${string | number}`
  readonly userCp: (candidateId: string | number) => `raices_user_cp_${string | number}`
  readonly userAddress: (candidateId: string | number) => `raices_user_address_${string | number}`
  readonly userPhone: (candidateId: string | number) => `raices_user_phone_${string | number}`

  readonly SIDEBAR_COLLAPSED: 'sidebar_collapsed'
  readonly RECENT_SEARCHES: 'recent_searches'
  readonly ADMIN_TAB: 'admin-tab'
  readonly INST_PORTAL_TAB: 'inst-portal-tab'

  readonly ENGAGEMENT: 'raices_engagement'
}

/** Estructura de la narrativa generada por IA */
export interface AiNarrativeData {
  quienEres?: string
  contexto?: string
  loQueTeGusta?: string
}

/** Estructura de los datos temporales del onboarding */
export interface OnboardingData {
  interests?: string[]
  viability?: string
  formatos?: string[]
  narrative?: AiNarrativeData
}
