/**
 * MAPEO Y TRADUCCIÓN DE ERRORES DE LA PLATAFORMA RAÍCES
 * ====================================================
 * Traduce respuestas de API, códigos de error en inglés y mensajes técnicos 
 * a explicaciones específicas, humanas y amigables en español.
 */

export function mapErrorMessage(msg: string | null | undefined | unknown): string {
  if (!msg) return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'

  let rawMsg = ''
  if (typeof msg === 'string') {
    rawMsg = msg
  } else if (msg && typeof msg === 'object') {
    const errObj = msg as {
      response?: {
        data?: {
          message?: string
          mensaje?: string
          error?: string
          detail?: string
        }
      }
      message?: string
    }
    rawMsg =
      errObj.response?.data?.message ||
      errObj.response?.data?.mensaje ||
      errObj.response?.data?.error ||
      errObj.response?.data?.detail ||
      errObj.message ||
      String(msg)
  } else {
    rawMsg = String(msg)
  }

  const lower = rawMsg.toLowerCase().trim()

  // ── CREDENCIALES Y AUTENTICACIÓN ──────────────────────────────
  if (
    lower.includes('invalid_password') ||
    lower.includes('invalid_credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('incorrect password') ||
    lower.includes('wrong password') ||
    lower.includes('bad credentials') ||
    lower.includes('contraseña incorrecta') ||
    lower.includes('el correo o la contraseña no coinciden')
  ) {
    return 'El correo electrónico o la contraseña ingresados son incorrectos. Por favor, verifica tus datos.'
  }

  if (
    lower.includes('user not found') ||
    lower.includes('account not found') ||
    lower.includes('email_not_found') ||
    lower.includes('usuario no encontrado') ||
    lower.includes('no existe una cuenta')
  ) {
    return 'No encontramos ninguna cuenta registrada con este correo electrónico. ¿Deseas registrarte?'
  }

  if (
    lower.includes('email_exists') ||
    lower.includes('email already exists') ||
    lower.includes('email ya registrado') ||
    lower.includes('already in use') ||
    lower.includes('duplicate key') ||
    lower.includes('registrado con este correo')
  ) {
    return 'Este correo electrónico ya se encuentra registrado. Intenta iniciar sesión o recuperar tu contraseña.'
  }

  if (
    lower.includes('user_disabled') ||
    lower.includes('account disabled') ||
    lower.includes('desactivada') ||
    lower.includes('deshabilit') ||
    lower.includes('bloqueada') ||
    lower.includes('inactiva') ||
    lower.includes('suspende')
  ) {
    return 'Tu cuenta ha sido deshabilitada o suspendida. Por favor, ponte en contacto con nuestro equipo de soporte.'
  }

  if (
    lower.includes('unauthorized') ||
    lower.includes('session expired') ||
    lower.includes('token expired') ||
    lower.includes('jwt expired') ||
    lower.includes('token no válido') ||
    lower.includes('no refresh token')
  ) {
    return 'Tu sesión ha expirado o las credenciales no son válidas. Por favor, inicia sesión de nuevo.'
  }

  if (
    lower.includes('forbidden') ||
    lower.includes('permission denied') ||
    lower.includes('access denied') ||
    lower.includes('no tienes permisos')
  ) {
    return 'No tienes los permisos suficientes para realizar esta acción.'
  }

  if (
    lower.includes('too_many_attempts') ||
    lower.includes('too many') ||
    lower.includes('rate limit') ||
    lower.includes('demasiados')
  ) {
    return 'Has realizado demasiados intentos en poco tiempo. Por favor, espera un momento e inténtalo de nuevo.'
  }

  // ── VALIDACIONES DE CAMPOS ──────────────────────────────────
  if (
    lower.includes('password') &&
    (lower.includes('weak') || lower.includes('débil'))
  ) {
    return 'La contraseña es muy débil. Debe tener al menos 8 caracteres e incluir letras y números.'
  }

  if (
    lower.includes('password') &&
    (lower.includes('short') || lower.includes('mínimo') || lower.includes('length'))
  ) {
    return 'La contraseña debe tener una longitud mínima de 8 caracteres.'
  }

  if (
    lower.includes('curp') &&
    (lower.includes('invalid') || lower.includes('inválid') || lower.includes('formato'))
  ) {
    return 'La CURP no cumple con la estructura requerida. Debe tener 18 caracteres en el formato oficial de RENAPO.'
  }

  if (
    lower.includes('curp') &&
    (lower.includes('exists') || lower.includes('registrada') || lower.includes('duplicad'))
  ) {
    return 'Esta CURP ya se encuentra vinculada a otra cuenta registrada en Raíces.'
  }

  if (
    lower.includes('rfc') &&
    (lower.includes('invalid') || lower.includes('inválid') || lower.includes('formato'))
  ) {
    return 'El RFC ingresado no tiene un formato válido (12 caracteres para persona moral o 13 para persona física).'
  }

  if (
    lower.includes('email') &&
    (lower.includes('invalid') || lower.includes('inválid') || lower.includes('formato'))
  ) {
    return 'Por favor, ingresa un correo electrónico válido (ejemplo: correo@dominio.com).'
  }

  if (
    lower.includes('nombre') &&
    (lower.includes('required') || lower.includes('obligatorio') || lower.includes('falta'))
  ) {
    return 'El nombre completo es un campo obligatorio.'
  }

  if (
    lower.includes('ciudad') &&
    (lower.includes('required') || lower.includes('obligatorio'))
  ) {
    return 'Por favor, selecciona o ingresa tu ciudad.'
  }

  if (
    lower.includes('estado') &&
    (lower.includes('required') || lower.includes('must be') || lower.includes('obligatorio'))
  ) {
    return 'Por favor, selecciona tu estado o entidad federativa.'
  }

  // ── ARCHIVOS Y MULTIMEDIA ─────────────────────────────────────────
  if (
    lower.includes('file too large') ||
    lower.includes('max file size') ||
    lower.includes('supera el tamaño') ||
    lower.includes('10 mb') ||
    lower.includes('excede el límite')
  ) {
    return 'El archivo seleccionado supera el tamaño máximo permitido de 10 MB.'
  }

  if (
    lower.includes('unsupported file') ||
    lower.includes('tipo de archivo no') ||
    lower.includes('invalid file type') ||
    lower.includes('solo se permiten')
  ) {
    return 'El formato del archivo no es soportado. Únicamente se aceptan imágenes (PNG, JPG, WebP) o documentos PDF.'
  }

  if (lower.includes('csf') || lower.includes('constancia')) {
    return 'Es necesario adjuntar la Constancia de Situación Fiscal (CSF) en formato PDF o imagen válida.'
  }

  // ── RED, CONEXIÓN Y SERVIDOR ─────────────────────────────────────
  if (
    lower.includes('network error') ||
    lower.includes('failed to fetch') ||
    lower.includes('err_connection') ||
    lower.includes('error de red') ||
    lower.includes('networkerror')
  ) {
    return 'No fue posible conectar con el servidor. Por favor, verifica tu conexión a internet.'
  }

  if (lower.includes('timeout') || lower.includes('tiempos de espera')) {
    return 'La respuesta del servidor tardó demasiado. Por favor, verifica tu conexión e inténtalo de nuevo.'
  }

  if (
    lower.includes('500') ||
    lower.includes('internal server error') ||
    lower.includes('error interno')
  ) {
    return 'Ocurrió un inconveniente temporal en nuestros servidores. Por favor, intenta de nuevo en unos momentos.'
  }

  if (
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('504') ||
    lower.includes('service unavailable')
  ) {
    return 'El servicio de Raíces no se encuentra disponible momentáneamente. Por favor, intenta más tarde.'
  }

  if (lower.includes('404') || lower.includes('not found')) {
    return 'La información o el recurso solicitado no fue encontrado.'
  }

  // Si ya es un mensaje traducido y específico en español, se devuelve tal cual
  return rawMsg
}
