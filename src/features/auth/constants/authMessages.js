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
  LOGIN_FIELDS_REQUIRED: 'Ingresa tu correo y contraseña',
  LOGIN_INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  LOGIN_SUCCESS: '¡Bienvenido!',
  
  // Registro
  REGISTER_SUCCESS: '¡Cuenta creada!',
  REGISTER_FAILED: 'No se pudo crear la cuenta',
  
  // Recuperar contraseña
  FORGOT_EMAIL_REQUIRED: 'Ingresa tu correo para recuperar la contraseña',
  FORGOT_SEND_SUCCESS: 'Enlace enviado. Revisa tu bandeja de entrada.',
  FORGOT_SEND_FAILED: 'No pudimos enviar el correo. Verifica tu dirección e intenta de nuevo.',
  
  // Errores genéricos
  GENERIC_ERROR: 'Ocurrió un error. Intenta de nuevo.',
}

// ─── Textos de UI ─────────────────────────────────────────
export const AUTH_UI = {
  // Login
  LOGIN_TITLE: 'Iniciar sesión',
  LOGIN_SUBTITLE: 'Ingresa con tu correo electrónico',
  LOGIN_BUTTON: 'Entrar',
  LOGIN_BUTTON_LOADING: 'Entrando...',
  LOGIN_NO_ACCOUNT: '¿No tienes cuenta?',
  LOGIN_REGISTER_LINK: 'Regístrate aquí',
  LOGIN_REMEMBER_ME: 'Mantener sesión iniciada',
  LOGIN_FORGOT_PASSWORD: '¿Olvidaste tu contraseña?',
  
  // Registro
  REGISTER_TITLE_1: '¿Cómo te gustaría unirte?',
  REGISTER_TITLE_2: 'Crea tu cuenta',
  REGISTER_STEP_LABEL: 'Paso {step} de 2',
  REGISTER_CONTINUE: 'Continuar',
  REGISTER_FINISH: 'Finalizar registro',
  REGISTER_FINISH_LOADING: 'Creando cuenta...',
  REGISTER_HAS_ACCOUNT: '¿Ya tienes cuenta?',
  REGISTER_LOGIN_LINK: 'Inicia sesión',
  REGISTER_BACK: 'Volver',
  REGISTER_NAME_PLACEHOLDER: 'Ej. Ana Pérez',
  REGISTER_EMAIL_PLACEHOLDER: 'correo@ejemplo.com',
  REGISTER_PASSWORD_MIN: 'Mínimo 8 caracteres',
  REGISTER_STATE_PLACEHOLDER: 'Selecciona un estado',
  REGISTER_CITY_PLACEHOLDER: 'Selecciona un municipio',
  REGISTER_CITY_DISABLED: 'Primero elige un estado',
  
  // Recuperar contraseña
  FORGOT_TITLE: 'Recuperar contraseña',
  FORGOT_SUBTITLE: 'Ingresa tu correo y te enviaremos un enlace seguro',
  FORGOT_BUTTON: 'Enviar enlace',
  FORGOT_BUTTON_LOADING: 'Enviando...',
  FORGOT_BACK: 'Volver al inicio de sesión',
  FORGOT_EMAIL_PLACEHOLDER: 'correo@ejemplo.com',
  
  // Roles
  ROLE_PCD_TITLE: 'Persona con discapacidad',
  ROLE_PCD_DESC: 'Accede a tu ecosistema personalizado',
  ROLE_TUTOR_TITLE: 'Tutor o familiar',
  ROLE_TUTOR_DESC: 'Apoya el desarrollo de quien cuidas',
  ROLE_INSTITUTION_TITLE: 'Institución',
  ROLE_INSTITUTION_DESC: 'Ofrece servicios, terapia o educación',
}

// ─── Configuración de Validación ──────────────────────────
export const AUTH_VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}
