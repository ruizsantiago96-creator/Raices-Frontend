export function getPasswordStrength(password) {
  if (!password) return { label: '', color: 'transparent', score: 0, width: '0%' }
  if (password.length < 8) return { label: 'Débil (muy corta)', color: '#ef4444', score: 1, width: '33%' }
  
  let score = 1
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  
  if (hasUpper) score++
  if (hasNumber) score++
  if (hasSpecial) score++
  
  if (score <= 2) {
    return { label: 'Débil', color: '#ef4444', score: 1, width: '33%' }
  } else if (score === 3) {
    return { label: 'Media', color: '#f97316', score: 2, width: '66%' }
  } else {
    return { label: 'Fuerte', color: '#22c55e', score: 3, width: '100%' }
  }
}
