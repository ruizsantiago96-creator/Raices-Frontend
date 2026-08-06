/**
 * Mensajes y textos estáticos para el módulo de Notificaciones.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const NOTIFICATION_TOAST = {
  MARK_READ: 'Notificación marcada como leída',
  MARK_READ_FAILED: 'No pudimos marcarla como leída. Intenta de nuevo.',
  MARK_ALL_READ: '¡Todas las notificaciones marcadas como leídas!',
  MARK_ALL_READ_FAILED: 'No pudimos marcar todas como leídas. Intenta de nuevo.',
}

// ─── Textos de UI ─────────────────────────────────────────
export const NOTIFICATION_UI = {
  // Título
  PAGE_TITLE: 'Notificaciones',
  UNREAD_SUFFIX: 'sin leer',
  ALL_READ: '¡Todo al día!',

  // Botones
  MARK_ALL_READ: 'Marcar todas como leídas',

  // Filtros
  FILTER_ALL: 'Todas',
  FILTER_UNREAD: 'Sin leer',

  // Estados vacíos
  EMPTY_ALL_TITLE: 'No hay notificaciones nuevas',
  EMPTY_ALL_DESC: 'Cuando haya actividad en tu cuenta te avisaremos aquí',
  EMPTY_UNREAD_TITLE: '¡Todo leído!',
  EMPTY_UNREAD_DESC: 'No tienes notificaciones pendientes. ¡Buen trabajo!',

  // Relative time
  TIME_NOW: 'Ahora mismo',
  TIME_MINUTES: 'Hace',
  TIME_HOURS: 'Hace',
  TIME_DAYS: 'Hace',
}
