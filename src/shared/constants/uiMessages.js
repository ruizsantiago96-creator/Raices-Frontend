/**
 * Mensajes compartidos de UI para todo el proyecto.
 * Evita duplicación de strings hardcodeados.
 */

// ─── Mensajes de Loading ──────────────────────────────────
export const LOADING_MESSAGES = {
  GENERIC: 'Cargando...',
  SLOW: 'Cargando, por favor espera...',
  DATA: 'Cargando datos...',
  SAVE: 'Guardando...',
  DELETE: 'Eliminando...',
  SEND: 'Enviando...',
  PROCESS: 'Procesando...',
}

// ─── Mensajes de Éxito ────────────────────────────────────
export const SUCCESS_MESSAGES = {
  SAVED: 'Guardado correctamente',
  UPDATED: 'Actualizado correctamente',
  DELETED: 'Eliminado correctamente',
  CREATED: 'Creado correctamente',
  SENT: 'Enviado correctamente',
}

// ─── Mensajes de Error ────────────────────────────────────
export const ERROR_MESSAGES = {
  GENERIC: 'Ocurrió un error. Intenta de nuevo.',
  NETWORK: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  NOT_FOUND: 'No se encontró el recurso solicitado.',
  VALIDATION: 'Los datos proporcionados no son válidos.',
  SERVER: 'Error del servidor. Intenta más tarde.',
  PERMISSION: 'No tienes permisos para realizar esta acción.',
}

// ─── Mensajes de Confirmación ─────────────────────────────
export const CONFIRM_MESSAGES = {
  DELETE: '¿Estás seguro de que deseas eliminar esta acción?',
  LEAVE: '¿Deseas salir sin guardar los cambios?',
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
  RETRY: 'Reintentar',
  LOAD_MORE: 'Ver más',
  SHOW_ALL: 'Ver todo',
}

// ─── Placeholders de Input ────────────────────────────────
export const INPUT_PLACEHOLDERS = {
  SEARCH: 'Buscar...',
  EMAIL: 'correo@ejemplo.com',
  PASSWORD: '••••••••',
  NAME: 'Nombre completo',
  PHONE: 'Teléfono',
  MESSAGE: 'Escribe un mensaje...',
  COMMENT: 'Escribe un comentario...',
}

// ─── Estados de Página ────────────────────────────────────
export const PAGE_STATES = {
  EMPTY: 'No hay elementos para mostrar',
  NO_DATA: 'No se encontraron datos',
  COMING_SOON: 'Próximamente disponible',
}
