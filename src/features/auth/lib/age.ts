/**
 * CÁLCULO DE EDAD Y ETAPA DE VIDA (Fase 1 · Migración TS)
 * =======================================================
 * Centraliza las funciones de cálculo de edad y etapas de vida.
 *
 * ⚠️ DIVERGENCIA PRESERVADA:
 *   El wizard PCD usa la fórmula legacy de 365.25 días (calcEdad365/calcEtapaVida365)
 *   y el Tutor usa aritmética calendario (calcEdad/calcEtapaVida).
 *   Se preservan AMBAS para no alterar el comportamiento actual.
 */

/** Etapa de vida para el perfil de necesidades (backend, modelo 16 campos) */
export type EtapaVida =
  | 'infancia_temprana'
  | 'infancia'
  | 'adolescencia'
  | 'juventud'
  | 'adultez'
  | 'adulto_mayor'

/** Etapa del catálogo de dependientes (flujo Tutor) */
export type EtapaDependiente =
  | 'infancia'
  | 'adolescencia'
  | 'adultoJoven'
  | 'adulto'
  | 'mayor'

/**
 * Edad con aritmética calendario (correcta en años bisiestos).
 * Usada por el flujo TUTOR. Devuelve null si la fecha es inválida o vacía.
 * @param birthDate - Formato 'YYYY-MM-DD'
 */
export function calcEdad(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null
  const bd = new Date(birthDate)
  if (isNaN(bd.getTime())) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - bd.getFullYear()
  const m = hoy.getMonth() - bd.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < bd.getDate())) edad--
  return edad
}

/**
 * Etapa de vida para el perfil de necesidades (backend, modelo 16 campos):
 * infancia_temprana | infancia | adolescencia | juventud | adultez | adulto_mayor.
 * @param birthDate - Formato 'YYYY-MM-DD'
 */
export function calcEtapaVida(birthDate: string | null | undefined): EtapaVida | null {
  const edad = calcEdad(birthDate)
  if (edad === null) return null
  if (edad <= 5) return 'infancia_temprana'
  if (edad <= 12) return 'infancia'
  if (edad <= 17) return 'adolescencia'
  if (edad <= 29) return 'juventud'
  if (edad <= 59) return 'adultez'
  return 'adulto_mayor'
}

/**
 * Etapa del catálogo de dependientes (Tutor):
 * infancia | adolescencia | adultoJoven | adulto | mayor.
 * @param birthDate - Formato 'YYYY-MM-DD'
 */
export function calcEtapaDependiente(birthDate: string | null | undefined): EtapaDependiente | null {
  const edad = calcEdad(birthDate)
  if (edad === null) return null
  if (edad <= 12) return 'infancia'
  if (edad <= 17) return 'adolescencia'
  if (edad <= 29) return 'adultoJoven'
  if (edad <= 59) return 'adulto'
  return 'mayor'
}

/**
 * Edad con la fórmula legacy de 365.25 días. Usada por el flujo PCD.
 * @param birthDate - Formato 'YYYY-MM-DD'
 */
export function calcEdad365(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null
  const time = new Date(birthDate).getTime()
  if (isNaN(time)) return null
  return Math.floor((Date.now() - time) / (365.25 * 24 * 60 * 60 * 1000))
}

/**
 * Etapa de vida legacy (fórmula 365.25 días). Usada por el flujo PCD.
 * @param birthDate - Formato 'YYYY-MM-DD'
 */
export function calcEtapaVida365(birthDate: string | null | undefined): EtapaVida | null {
  if (!birthDate) return null
  const age = calcEdad365(birthDate)
  if (age === null || isNaN(age)) return null
  if (age <= 5) return 'infancia_temprana'
  if (age <= 12) return 'infancia'
  if (age <= 17) return 'adolescencia'
  if (age <= 29) return 'juventud'
  if (age <= 59) return 'adultez'
  return 'adulto_mayor'
}
