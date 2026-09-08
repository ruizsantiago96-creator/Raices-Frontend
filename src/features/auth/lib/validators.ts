/**
 * VALIDADORES COMPARTIDOS (Fase 1 · Migración TS)
 * ===============================================
 * Email y CURP usados por los wizards de registro.
 */

export const EMAIL_REGEX: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Valida si una cadena cumple con el formato estándar de correo electrónico.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  return EMAIL_REGEX.test(email ?? '')
}

// ── CURP ───────────────────────────────────────────────────────────

export const CURP_REGEX: RegExp = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i

/**
 * Valida si una cadena cumple con la estructura y longitud de una CURP mexicana.
 */
export function isValidCurp(curp: string | null | undefined): boolean {
  return typeof curp === 'string' && curp.length === 18 && CURP_REGEX.test(curp)
}

const VOWELS = 'AEIOU'
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'

function normalizeName(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase()
}

/**
 * Obtiene la primera vocal interna (a partir del índice 1) de una cadena.
 */
export function getFirstInternalVowel(str: string): string {
  const normalized = normalizeName(str)
  for (let i = 1; i < normalized.length; i++) {
    if (VOWELS.includes(normalized[i])) return normalized[i]
  }
  return 'X'
}

/**
 * Obtiene la primera consonante interna (a partir del índice 1) de una cadena.
 */
export function getFirstInternalConsonant(str: string | null | undefined): string {
  if (!str) return 'X'
  const normalized = normalizeName(str)
  for (let i = 1; i < normalized.length; i++) {
    if (CONSONANTS.includes(normalized[i])) return normalized[i]
  }
  return 'X'
}

/**
 * Extrae el nombre canónico para el cálculo de CURP ignorando nombres compuestos comunes.
 */
export function getCurpName(fullName: string | null | undefined): string {
  if (!fullName) return ''
  const parts = fullName.trim().toUpperCase().split(/\s+/)
  if (parts.length > 1) {
    const first = parts[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (['MARIA', 'MA', 'MA.', 'JOSE', 'J', 'J.'].includes(first)) return parts[1]
  }
  return parts[0]
}

/** Resultado de validación de concordancia entre CURP y datos personales */
export interface CurpValidationResult {
  valid: boolean
  errors: string[]
  nameIsComplete: boolean
}

/**
 * Valida la concordancia entre los datos de nombre, fecha de nacimiento y la CURP.
 */
export function validateCurpMatch(
  curp?: string | null,
  nombres?: string | null,
  apPat?: string | null,
  apMat?: string | null,
  birthDate?: string | null
): CurpValidationResult {
  if (!curp || curp.length !== 18 || !CURP_REGEX.test(curp)) {
    return { valid: true, errors: [], nameIsComplete: false }
  }
  if (!birthDate) {
    return { valid: true, errors: [], nameIsComplete: false }
  }

  const errors: string[] = []
  const c = curp.toUpperCase()
  const yy = parseInt(c.substring(4, 6), 10)
  const mm = parseInt(c.substring(6, 8), 10)
  const dd = parseInt(c.substring(8, 10), 10)
  const century = /[A-Z]/.test(c[16]) ? 20 : 19
  const curpYear = century * 100 + yy
  const [iY, iM, iD] = birthDate.split('-').map(Number)

  if (curpYear !== iY || mm !== iM || dd !== iD) {
    errors.push(
      'La fecha de nacimiento no coincide con la CURP. En la CURP aparece ' +
        String(dd).padStart(2, '0') +
        '/' +
        String(mm).padStart(2, '0') +
        '/' +
        curpYear +
        '.'
    )
  }

  const p = apPat?.trim().toUpperCase()
  const m = apMat?.trim().toUpperCase()
  const n = nombres?.trim().toUpperCase()

  if (p) {
    if (c[0] !== p[0]) errors.push('La CURP no coincide con el apellido paterno.')
    if (c[1] !== getFirstInternalVowel(p)) errors.push('La CURP no coincide con las iniciales del apellido paterno.')
    if (c[13] !== getFirstInternalConsonant(p)) errors.push('La CURP no coincide con las consonantes del apellido paterno.')
  }
  if (m) {
    if (c[2] !== m[0]) errors.push('La CURP no coincide con el apellido materno.')
    if (c[14] !== getFirstInternalConsonant(m)) errors.push('La CURP no coincide con las consonantes del apellido materno.')
  }
  if (n) {
    const nombre = getCurpName(n)
    if (c[3] !== nombre[0]) errors.push('La CURP no coincide con el nombre.')
    if (c[15] !== getFirstInternalConsonant(nombre)) errors.push('La CURP no coincide con las consonantes del nombre.')
  }

  const nameIsComplete = Boolean(p && m && n)
  return { valid: errors.length === 0, errors, nameIsComplete }
}
