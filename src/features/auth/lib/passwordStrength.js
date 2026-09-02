export const PASSWORD_CRITERIA = [
  {
    id: 'length',
    label: 'Mínimo 8 caracteres',
    missingText: 'mínimo 8 caracteres',
    test: (pwd) => pwd.length >= 8,
  },
  {
    id: 'upper',
    label: 'Una mayúscula',
    missingText: '1 mayúscula (A-Z)',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: 'lower',
    label: 'Una minúscula',
    missingText: '1 minúscula (a-z)',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'Un número',
    missingText: '1 número (0-9)',
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    id: 'special',
    label: 'Un símbolo especial',
    missingText: '1 símbolo especial (!@#$%...*)',
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  },
]

export function checkPasswordCriteria(password = '') {
  const criteria = PASSWORD_CRITERIA.map(item => ({
    ...item,
    met: item.test(password),
  }))
  const missing = criteria.filter(item => !item.met)
  const isValid = missing.length === 0
  return { criteria, missing, isValid }
}

export function getPasswordStrength(password) {
  if (!password) return { label: '', color: 'transparent', score: 0, width: '0%' }
  if (password.length < 8) return { label: 'Débil', color: '#ef4444', score: 1, width: '25%' }
  
  let score = 1
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  
  if (hasUpper) score++
  if (hasLower) score++
  if (hasNumber) score++
  if (hasSpecial) score++
  
  if (score <= 2) {
    return { label: 'Débil', color: '#ef4444', score: 1, width: '33%' }
  } else if (score <= 4) {
    return { label: 'Media', color: '#f97316', score: 2, width: '66%' }
  } else {
    return { label: 'Fuerte', color: '#22c55e', score: 3, width: '100%' }
  }
}
