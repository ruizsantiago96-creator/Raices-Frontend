/**
 * Mensajes y textos estáticos para el módulo de autenticación.
 * Evita hardcoding de strings en JSX.
 */

// ─── Firebase Config ──────────────────────────────────────
export const FIREBASE_PASSWORD_RESET_URL = 
  import.meta.env.VITE_FIREBASE_PASSWORD_RESET_URL ?? 
  'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode'

// ─── Mensajes de Error ────────────────────────────────────
export const AUTH_MESSAGES = {
  // Login
  LOGIN_FIELDS_REQUIRED: 'Necesitamos tu correo y contraseña para continuar',
  LOGIN_INVALID_CREDENTIALS: 'El correo o la contraseña no coinciden. ¿Puedes verificar?',
  LOGIN_SUCCESS: '¡Qué bueno verte de nuevo!',
  
  // Registro
  REGISTER_SUCCESS: '¡Tu cuenta está lista!',
  REGISTER_FAILED: 'No pudimos crear tu cuenta. Intentemos de nuevo.',
  
  // Recuperar contraseña
  FORGOT_EMAIL_REQUIRED: 'Escribe tu correo para ayudarte a recuperar tu contraseña',
  FORGOT_SEND_SUCCESS: 'Te enviamos un correo con instrucciones. Revisa tu bandeja.',
  FORGOT_SEND_FAILED: 'No pudimos enviar el correo. ¿Puedes verificar tu dirección?',
  
  // Errores genéricos
  GENERIC_ERROR: 'Algo no salió bien. Vamos a intentarlo de nuevo.',
}

// ─── Textos de UI ─────────────────────────────────────────
export const AUTH_UI = {
  // Login
  LOGIN_TITLE: 'Bienvenido/a de vuelta',
  LOGIN_SUBTITLE: 'Ingresa con tu correo electrónico',
  LOGIN_BUTTON: 'Entrar',
  LOGIN_BUTTON_LOADING: 'Un momento...',
  LOGIN_NO_ACCOUNT: '¿Aún no tienes cuenta?',
  LOGIN_REGISTER_LINK: 'Créala aquí',
  LOGIN_REMEMBER_ME: 'Mantener sesión iniciada',
  LOGIN_FORGOT_PASSWORD: '¿Olvidaste tu contraseña?',
  
  // Registro
  REGISTER_TITLE_1: '¿Cómo te gustaría unirte?',
  REGISTER_TITLE_2: 'Crea tu cuenta',
  REGISTER_STEP_LABEL: 'Paso {step} de 2',
  REGISTER_CONTINUE: 'Continuar',
  REGISTER_FINISH: 'Finalizar registro',
  REGISTER_FINISH_LOADING: 'Creando tu cuenta...',
  REGISTER_HAS_ACCOUNT: '¿Ya tienes cuenta?',
  REGISTER_LOGIN_LINK: 'Inicia sesión',
  REGISTER_BACK: 'Volver',
  REGISTER_NAME_PLACEHOLDER: 'Ej. Ana Pérez',
  REGISTER_EMAIL_PLACEHOLDER: 'correo@ejemplo.com',
  REGISTER_PASSWORD_MIN: 'Mínimo 8 caracteres',
  REGISTER_STATE_PLACEHOLDER: 'Selecciona tu estado',
  REGISTER_CITY_PLACEHOLDER: 'Selecciona tu municipio',
  REGISTER_CITY_DISABLED: 'Primero elige tu estado',
  
  // Recuperar contraseña
  FORGOT_TITLE: 'Recuperar contraseña',
  FORGOT_SUBTITLE: 'Escribe tu correo y te enviaremos un enlace seguro para crear una nueva contraseña',
  FORGOT_BUTTON: 'Enviar enlace',
  FORGOT_BUTTON_LOADING: 'Enviando...',
  FORGOT_BACK: 'Volver al inicio de sesión',
  FORGOT_EMAIL_PLACEHOLDER: 'correo@ejemplo.com',
  
  // Roles
  ROLE_PCD_TITLE: 'Usuario con discapacidad',
  ROLE_PCD_DESC: 'Accede a tu espacio personalizado con recomendaciones para ti',
  ROLE_TUTOR_TITLE: 'Usuario tutor',
  ROLE_TUTOR_DESC: 'Ayuda a la persona que cuidas a encontrar lo que necesita',
  ROLE_INSTITUTION_TITLE: 'Usuario institución',
  ROLE_INSTITUTION_DESC: 'Comparte los servicios, terapias o programas que ofrecen',
  ROLE_EMPRESA_TITLE: 'Usuario empresarial y/o empresa',
  ROLE_EMPRESA_DESC: 'Publica oportunidades inclusivas, programas o colaboraciones',
}

// ─── Configuración de Validación ──────────────────────────
export const AUTH_VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}
