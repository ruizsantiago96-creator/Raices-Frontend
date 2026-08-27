export function mapErrorMessage(msg) {
  if (!msg) return 'Ocurrió un error inesperado.'
  const lower = msg.toLowerCase()
  if (lower.includes('invalid') || lower.includes('incorrect') || lower.includes('wrong')) {
    return 'Correo electrónico o contraseña incorrectos.'
  }
  if (lower.includes('not found') || lower.includes('user not found')) {
    return 'No se encontró una cuenta con este correo electrónico.'
  }
  if (lower.includes('too many') || lower.includes('rate limit') || lower.includes('demasiados')) {
    return 'Demasiados intentos. Por favor, espera un momento e intenta de nuevo.'
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Error de conexión. Verifica tu internet e intenta de nuevo.'
  }
  if (lower.includes('disabled') || lower.includes('bloqueada') || lower.includes('inactiva')) {
    return 'Tu cuenta está deshabilitada. Contacta soporte para más información.'
  }
  if (lower.includes('password') && lower.includes('weak')) {
    return 'La contraseña es muy débil. Usa al menos 8 caracteres con mayúsculas, números y símbolos.'
  }
  if (lower.includes('password') && (lower.includes('short') || lower.includes('mínimo'))) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }
  if (lower.includes('nombre') && lower.includes('required')) {
    return 'El nombre completo es obligatorio.'
  }
  if (lower.includes('email') && lower.includes('invalid')) {
    return 'El correo electrónico no es válido.'
  }
  if (lower.includes('ciudad') && lower.includes('required')) {
    return 'La ciudad es obligatoria.'
  }
  if (lower.includes('estado') && lower.includes('required')) {
    return 'El estado es obligatorio.'
  }
  if (lower.includes('estado must be') || lower.includes('estado is required')) {
    return 'El estado es obligatorio.'
  }
  if (lower.includes('email already exists') || lower.includes('email ya registrado') || lower.includes('already in use')) {
    return 'Este correo electrónico ya está registrado.'
  }
  return msg
}
