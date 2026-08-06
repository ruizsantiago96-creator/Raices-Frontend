/**
 * Mensajes compartidos de UI para todo el proyecto.
 * Evita duplicación de strings hardcodeados.
 */

// ─── Mensajes de Loading ──────────────────────────────────
export const LOADING_MESSAGES = {
  GENERIC: 'Un momento...',
  SLOW: 'Esto está tardando un poco más, gracias por tu paciencia...',
  DATA: 'Preparando tu información...',
  SAVE: 'Guardando tus cambios...',
  DELETE: 'Procesando...',
  SEND: 'Enviando tu mensaje...',
  PROCESS: 'Trabajando en ello...',
}

// ─── Mensajes de Éxito ────────────────────────────────────
export const SUCCESS_MESSAGES = {
  SAVED: '¡Listo! Todo guardado',
  UPDATED: '¡Perfecto! Tus cambios se guardaron',
  DELETED: 'Eliminado con éxito',
  CREATED: '¡Creado con éxito!',
  SENT: '¡Tu mensaje fue enviado!',
}

// ─── Mensajes de Error ────────────────────────────────────
export const ERROR_MESSAGES = {
  GENERIC: 'Algo no salió como esperábamos. Vamos a intentarlo de nuevo.',
  NETWORK: 'Parece que hay un problema con tu conexión. ¿Puedes verificar tu internet?',
  UNAUTHORIZED: 'Tu sesión terminó. Vuelve a iniciar sesión para continuar.',
  NOT_FOUND: 'No encontramos lo que buscabas.',
  VALIDATION: 'Revisa los datos que ingresaste, algo no coincide.',
  SERVER: 'Nuestro servicio está teniendo problemas. Intenta en unos minutos.',
  PERMISSION: 'No tienes acceso a esta sección.',
}

// ─── Mensajes de Confirmación ─────────────────────────────
export const CONFIRM_MESSAGES = {
  DELETE: '¿Estás segura/o de que quieres eliminar esto?',
  LEAVE: '¿Salir sin guardar tus cambios?',
  LOGOUT: '¿Cerrar sesión?',
}

// ─── Textos de Botones Comunes ────────────────────────────
export const BUTTON_TEXT = {
  SAVE: 'Guardar',
  CANCEL: 'Cancelar',
  DELETE: 'Eliminar',
  EDIT: 'Editar',
  CLOSE: 'Cerrar',
  BACK: 'Volver',
  NEXT: 'Siguiente',
  PREVIOUS: 'Anterior',
  SUBMIT: 'Enviar',
  CONFIRM: 'Confirmar',
  ACCEPT: 'Aceptar',
  REJECT: 'Rechazar',
  RETRY: 'Intentar de nuevo',
  LOAD_MORE: 'Ver más',
  SHOW_ALL: 'Ver todo',
}

// ─── Placeholders de Input ────────────────────────────────
export const INPUT_PLACEHOLDERS = {
  SEARCH: '¿Qué estás buscando?',
  EMAIL: 'correo@ejemplo.com',
  PASSWORD: '••••••••',
  NAME: 'Tu nombre completo',
  PHONE: 'Tu teléfono',
  MESSAGE: 'Escribe tu mensaje aquí...',
  COMMENT: 'Comparte tu opinión...',
}

// ─── Estados de Página ────────────────────────────────────
export const PAGE_STATES = {
  EMPTY: 'Aquí aparecerá contenido pronto',
  NO_DATA: 'No encontramos información por el momento',
  COMING_SOON: 'Esto estará disponible muy pronto',
}
