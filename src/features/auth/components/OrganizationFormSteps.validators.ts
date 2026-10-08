import type { AccountFormData, ValidationResult } from './OrganizationFormSteps'
import { checkPasswordCriteria } from '../lib/passwordStrength'

export function validateAccountForm(accountForm: Partial<AccountFormData>): ValidationResult {
  const errors: string[] = []

  if (!accountForm.email?.trim()) {
    errors.push('Ingresa tu correo electrónico.')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email)) {
    errors.push('Ingresa un correo electrónico válido.')
  }

  if (!accountForm.password) {
    errors.push('Ingresa una contraseña.')
  } else {
    const { isValid, missing } = checkPasswordCriteria(accountForm.password)
    if (!isValid) {
      errors.push(`Tu contraseña debe cumplir con todos los requisitos. Te hace falta: ${missing.map(m => m.missingText).join(', ')}.`)
    }
  }

  if (!accountForm.country) {
    errors.push('Ingresa tu país.')
  }

  if (!accountForm.state) {
    errors.push('Ingresa tu estado, región o provincia.')
  }

  if (!accountForm.city) {
    errors.push('Ingresa tu ciudad.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
