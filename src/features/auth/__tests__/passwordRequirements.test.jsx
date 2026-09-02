import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { checkPasswordCriteria, getPasswordStrength } from '../lib/passwordStrength'
import PasswordRequirements from '../components/PasswordRequirements'

describe('Password validation & strength utilities', () => {
  it('detects missing special character in "Tecnm1234"', () => {
    const result = checkPasswordCriteria('Tecnm1234')
    expect(result.isValid).toBe(false)
    expect(result.missing.map(m => m.id)).toEqual(['special'])
    expect(result.missing[0].missingText).toContain('símbolo especial')
  })

  it('validates a complete password like "Tecnm1234!"', () => {
    const result = checkPasswordCriteria('Tecnm1234!')
    expect(result.isValid).toBe(true)
    expect(result.missing.length).toBe(0)
  })

  it('calculates password strength correctly', () => {
    expect(getPasswordStrength('').score).toBe(0)
    expect(getPasswordStrength('abc').score).toBe(1) // short
    expect(getPasswordStrength('Tecnm1234').label).toBe('Media')
    expect(getPasswordStrength('Tecnm1234!').label).toBe('Fuerte')
  })
})

describe('<PasswordRequirements /> Component', () => {
  it('renders nothing if password is empty', () => {
    const { container } = render(<PasswordRequirements password="" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows missing character feedback for "Tecnm1234"', () => {
    render(<PasswordRequirements password="Tecnm1234" />)
    expect(screen.getByText(/Te falta:/i)).toBeDefined()
    expect(screen.getByText(/1 símbolo especial/i)).toBeDefined()
  })

  it('renders nothing when all criteria are met to keep the UI clean', () => {
    const { container } = render(<PasswordRequirements password="Tecnm1234!" />)
    expect(container.firstChild).toBeNull()
  })
})
