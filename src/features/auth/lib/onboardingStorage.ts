/**
 * ONBOARDING STORAGE (Fase 1 · Migración TS)
 * =========================================
 * Centraliza la lectura/escritura de las claves de onboarding:
 *   - raices_user_interests (JSON array)
 *   - raices_user_viability (string crudo)
 *   - raices_user_formatos  (JSON array)
 *   - raices_ai_narrative   (JSON { quienEres, contexto, loQueTeGusta })
 */

import { STORAGE_KEYS } from '@shared/lib/storageKeys'
import type { OnboardingData, AiNarrativeData } from '../../../types/storage'

/**
 * Guarda los datos de onboarding en localStorage. Solo escribe las claves definidas.
 */
export function saveOnboardingData({ interests, viability, formatos, narrative }: OnboardingData): void {
  if (interests !== undefined) {
    localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(interests))
  }
  if (viability !== undefined) {
    localStorage.setItem(STORAGE_KEYS.USER_VIABILITY, viability)
  }
  if (formatos !== undefined) {
    localStorage.setItem(STORAGE_KEYS.USER_FORMATOS, JSON.stringify(formatos))
  }
  if (narrative !== undefined) {
    localStorage.setItem(STORAGE_KEYS.AI_NARRATIVE, JSON.stringify(narrative))
  }
}

/**
 * Lee los intereses seleccionados. Devuelve [] si no hay datos o el JSON es inválido.
 */
export function getOnboardingInterests(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_INTERESTS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Lee la viabilidad económica (string). Devuelve '' si no hay datos.
 */
export function getOnboardingViability(): string {
  return localStorage.getItem(STORAGE_KEYS.USER_VIABILITY) ?? ''
}

/**
 * Lee los formatos de accesibilidad seleccionados. Devuelve [] si no hay datos o el JSON es inválido.
 */
export function getOnboardingFormatos(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_FORMATOS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Lee la narrativa generada por IA. Devuelve null si no hay datos o el JSON es inválido.
 */
export function getOnboardingNarrative(): AiNarrativeData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_NARRATIVE)
    if (!raw) return null
    return JSON.parse(raw) as AiNarrativeData
  } catch {
    return null
  }
}

/**
 * Elimina las 4 claves de onboarding del localStorage.
 */
export function clearOnboardingData(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_INTERESTS)
  localStorage.removeItem(STORAGE_KEYS.USER_VIABILITY)
  localStorage.removeItem(STORAGE_KEYS.USER_FORMATOS)
  localStorage.removeItem(STORAGE_KEYS.AI_NARRATIVE)
}
