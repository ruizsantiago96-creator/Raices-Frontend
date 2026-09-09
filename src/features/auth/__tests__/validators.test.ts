import { describe, it, expect } from 'vitest'
import { validateBirthDate, getMaxBirthDate, MIN_BIRTH_DATE } from '../lib/validators'
import { calcEdad, calcEdad365, calcEtapaVida, calcEtapaDependiente } from '../lib/age'

describe('Birth date validators and age calculations', () => {
  describe('getMaxBirthDate and MIN_BIRTH_DATE', () => {
    it('returns today as YYYY-MM-DD', () => {
      const maxDate = getMaxBirthDate()
      expect(maxDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)

      const now = new Date()
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      expect(maxDate).toBe(expected)
    })

    it('has MIN_BIRTH_DATE set to 1900-01-01', () => {
      expect(MIN_BIRTH_DATE).toBe('1900-01-01')
    })
  })

  describe('validateBirthDate', () => {
    it('rejects empty or null input', () => {
      expect(validateBirthDate('')).toEqual({
        valid: false,
        error: 'Por favor, ingresa tu fecha de nacimiento.',
      })
      expect(validateBirthDate(null)).toEqual({
        valid: false,
        error: 'Por favor, ingresa tu fecha de nacimiento.',
      })
      expect(validateBirthDate(undefined)).toEqual({
        valid: false,
        error: 'Por favor, ingresa tu fecha de nacimiento.',
      })
    })

    it('rejects invalid format', () => {
      expect(validateBirthDate('abc')).toEqual({
        valid: false,
        error: 'Por favor, ingresa una fecha de nacimiento válida.',
      })
      expect(validateBirthDate('28/06/2027')).toEqual({
        valid: false,
        error: 'Por favor, ingresa una fecha de nacimiento válida.',
      })
    })

    it('rejects dates prior to 1900', () => {
      expect(validateBirthDate('1899-12-31')).toEqual({
        valid: false,
        error: 'El año de nacimiento no puede ser anterior a 1900.',
      })
    })

    it('rejects nonexistent calendar dates', () => {
      expect(validateBirthDate('2021-02-30')).toEqual({
        valid: false,
        error: 'La fecha de nacimiento ingresada no es válida.',
      })
    })

    it('rejects future dates (e.g. 2028 or tomorrow)', () => {
      expect(validateBirthDate('2028-06-28')).toEqual({
        valid: false,
        error: 'La fecha de nacimiento no puede ser una fecha futura.',
      })

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
      expect(validateBirthDate(tomorrowStr)).toEqual({
        valid: false,
        error: 'La fecha de nacimiento no puede ser una fecha futura.',
      })
    })

    it('accepts valid past dates and today', () => {
      expect(validateBirthDate('1990-05-15')).toEqual({ valid: true })
      expect(validateBirthDate(getMaxBirthDate())).toEqual({ valid: true })
    })
  })

  describe('Age calculation guards against future dates', () => {
    it('returns null for future dates in calcEdad and calcEdad365', () => {
      expect(calcEdad('2099-01-01')).toBeNull()
      expect(calcEdad365('2099-01-01')).toBeNull()
    })

    it('returns null for future dates in stage calculations', () => {
      expect(calcEtapaVida('2099-01-01')).toBeNull()
      expect(calcEtapaDependiente('2099-01-01')).toBeNull()
    })

    it('correctly calculates age for valid past dates', () => {
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
      const dateStr = `${tenYearsAgo.getFullYear()}-${String(tenYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(tenYearsAgo.getDate()).padStart(2, '0')}`
      expect(calcEdad(dateStr)).toBe(10)
    })
  })
})
