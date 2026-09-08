/**
 * CLAVES DE STORAGE — CONGELADAS (Fase 0 · Red de seguridad)
 * ============================================================
 *
 * Este módulo es la ÚNICA fuente de verdad para las claves de
 * localStorage / sessionStorage del proyecto. Objetivo: congelar el
 * contrato de persistencia antes de refactorizar el flujo de registro,
 * para que los tests de contrato y las futuras migraciones sepan
 * EXACTAMENTE qué claves existen, qué formato tienen y quién las escribe.
 *
 * ⚠️ REGLAS:
 *   1. NO cambiar el valor de una clave existente: hay datos reales de
 *      usuarios en producción. Si hace falta una clave nueva, añadirla
 *      aquí con su documentación y migrar su uso a este módulo.
 *   2. NO escribir claves sueltas con strings mágicos fuera de los
 *      módulos de storage/onboarding.
 *   3. Las claves dinámicas (por userId / candidateId) se generan con
 *      los builders de abajo.
 */

import type { StorageKeysContract } from '../../types/storage'

export const STORAGE_KEYS: StorageKeysContract = {
  // ── Sesión / Auth (src/shared/lib/storage.js, authStore) ─────────
  /** Token de acceso Bearer. Se guarda en localStorage (rememberMe=true)
   *  o sessionStorage (rememberMe=false). */
  AUTH_TOKEN: 'raices_token',
  /** Token de refresco para renovar la sesión (renovar-token). */
  AUTH_REFRESH: 'raices_refresh',
  /** Usuario serializado en JSON (id, email, role, full_name…). */
  AUTH_USER: 'raices_user',
  /** Preferencia "Recordarme": 'true' | 'false'. SIEMPRE en localStorage. */
  AUTH_REMEMBER: 'raices_remember',
  /** Clave legacy de auth que clearAllAuth() también limpia. */
  AUTH_LEGACY: 'raices_auth',

  // ── Onboarding / narrativa IA (wizards de registro) ──────────────
  /** Array JSON de intereses seleccionados durante el registro. */
  USER_INTERESTS: 'raices_user_interests',
  /** id de viabilidad económica (gratuita_becas | bajo_costo | …). */
  USER_VIABILITY: 'raices_user_viability',
  /** Array JSON de formatos de información (texto, imagenes…). */
  USER_FORMATOS: 'raices_user_formatos',
  /** JSON { quienEres, contexto, loQueTeGusta } generado por la IA. */
  AI_NARRATIVE: 'raices_ai_narrative',

  // ── Perfil derivado por usuario (useAuth.js / useUpdateNeedsProfile)
  /** Fecha de nacimiento (YYYY-MM-DD) cacheada por usuario autenticado. */
  userBirthDate: (userId: string | number) => `raices_birth_date_${userId}`,
  /** Edad (número) cacheada por usuario autenticado. */
  userAge: (userId: string | number) => `raices_age_${userId}`,
  /** Fecha de nacimiento del dependiente (Tutor wizard → dependientes). */
  depBirthDate: (dependienteId: string | number) => `raices_dep_birth_date_${dependienteId}`,

  // ── CV / postulaciones (ApplicationModal.jsx), por candidato ─────
  /** Archivo de CV en JSON (fileData). */
  userCv: (candidateId: string | number) => `raices_user_cv_${candidateId}`,
  /** Código postal del candidato. */
  userCp: (candidateId: string | number) => `raices_user_cp_${candidateId}`,
  /** Dirección del candidato. */
  userAddress: (candidateId: string | number) => `raices_user_address_${candidateId}`,
  /** Teléfono del candidato. */
  userPhone: (candidateId: string | number) => `raices_user_phone_${candidateId}`,

  // ── UI / preferencias ────────────────────────────────────────────
  /** 'true' | 'false' — sidebar colapsada (AppSidebar.jsx). */
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  /** JSON array de búsquedas recientes (TopNav.jsx). */
  RECENT_SEARCHES: 'recent_searches',
  /** Tab activo del panel admin (uiStore.js). */
  ADMIN_TAB: 'admin-tab',
  /** Tab activo del portal institucional (uiStore.js). */
  INST_PORTAL_TAB: 'inst-portal-tab',

  // ── Feed / engagement ────────────────────────────────────────────
  /** Interacciones de engagement del feed (feedPreferences.js). */
  ENGAGEMENT: 'raices_engagement',
}

/**
 * Inventario plano de TODAS las claves (estáticas) para usarlo en tests
 * que verifican el estado final del storage.
 */
export const ALL_STORAGE_KEYS: readonly string[] = Object.freeze(
  Object.values(STORAGE_KEYS).filter((v): v is string => typeof v === 'string')
)

/**
 * Verifica que una clave pertenezca al inventario congelado (estático).
 * Útil en tests de contrato para detectar keys mágicas nuevas.
 */
export function isFrozenStorageKey(key: string): boolean {
  return (
    ALL_STORAGE_KEYS.includes(key) ||
    /^raices_(birth_date|age|dep_birth_date|user_cv|user_cp|user_address|user_phone)_/.test(key)
  )
}
