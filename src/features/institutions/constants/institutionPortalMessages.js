/**
 * Mensajes y textos estáticos para el Portal de Institución.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const PORTAL_TOAST = {
  // Vacantes
  JOB_CREATED: 'Vacante publicada con éxito',
  JOB_CREATE_FAILED: 'No se pudo crear la vacante',
  JOB_UPDATED: 'Vacante actualizada',
  JOB_UPDATE_FAILED: 'No se pudo actualizar la vacante',
  JOB_DELETED: 'Vacante eliminada',
  JOB_DELETE_FAILED: 'No se pudo eliminar la vacante',
  STATUS_CHANGED: 'Estado de la vacante actualizado',
  STATUS_CHANGE_FAILED: 'No se pudo cambiar el estado',
  
  // Candidatos
  APPLICATION_UPDATED: 'Estado del candidato actualizado',
  APPLICATION_UPDATE_FAILED: 'No se pudo actualizar el estado',
}

// ─── Textos de UI ─────────────────────────────────────────
export const PORTAL_UI = {
  // Título
  PAGE_TITLE: 'Portal de Institución',
  PAGE_SUBTITLE: 'Gestiona tus vacantes y candidatos',
  
  // Tabs
  TAB_POSTULACIONES: 'Mis Postulaciones',
  TAB_CANDIDATOS: 'Candidatos Postulados',
  
  // Botones
  CREATE_JOB: 'Publicar nueva oferta',
  CREATE_JOB_LOADING: 'Publicando...',
  VIEW_APPLICANTS: 'Ver candidatos',
  EDIT_JOB: 'Editar',
  DELETE_JOB: 'Eliminar',
  TOGGLE_STATUS: 'Cambiar estado',
  CANCEL_BUTTON: 'Cancelar',
  SAVE_BUTTON: 'Guardar',
  CONFIRM_DELETE: 'Eliminar vacante',
  
  // Formularios - Crear vacante
  CREATE_JOB_TITLE: 'Publicar nueva vacante',
  JOB_TITLE_LABEL: 'Título *',
  JOB_TITLE_PLACEHOLDER: 'Ej: Terapeuta Ocupacional',
  JOB_DESC_LABEL: 'Descripción',
  JOB_DESC_PLACEHOLDER: 'Describe la vacante...',
  JOB_REQUIREMENTS_LABEL: 'Requisitos',
  JOB_REQUIREMENTS_PLACEHOLDER: 'Requisitos del puesto...',
  MODALITY_LABEL: 'Modalidad',
  MODALITY_PRESENCIAL: 'Presencial',
  MODALITY_REMOTO: 'Remoto',
  MODALITY_HYBRID: 'Híbrido',
  SCHEDULE_LABEL: 'Horario',
  SCHEDULE_PLACEHOLDER: 'Lun-Vie 8:00-15:00',
  CITY_LABEL: 'Ciudad',
  CITY_PLACEHOLDER: 'Mérida',
  STATE_LABEL: 'Estado',
  STATE_PLACEHOLDER: 'Yucatán',
  SALARY_LABEL: 'Rango salarial',
  SALARY_PLACEHOLDER: '$15,000 - $20,000 MXN',
  INCLUSIVE_CHECKBOX: 'Vacante inclusiva para personas con discapacidad',
  
  // Estados de vacante
  STATUS_ACTIVE: 'Activa',
  STATUS_PAUSED: 'Pausada',
  
  // Estados de candidato
  APP_STATUS_PENDING: 'Pendiente',
  APP_STATUS_REVIEWED: 'En Revisión',
  APP_STATUS_ACCEPTED: 'Aceptado',
  APP_STATUS_REJECTED: 'Rechazado',
  
  // Filtros de candidatos
  FILTER_ALL: 'Todos',
  FILTER_PENDING: 'Pendientes',
  FILTER_REVIEWED: 'En Revisión',
  FILTER_ACCEPTED: 'Aceptados',
  
  // Tabla de candidatos
  COL_NAME: 'Nombre',
  COL_JOB: 'Vacante',
  COL_DATE: 'Fecha de postulación',
  COL_STATUS: 'Estado',
  COL_ACTIONS: 'Acciones',
  COL_CANDIDATES: 'Candidatos',
  
  // Tabla de postulaciones
  COL_TITLE: 'Título',
  COL_MODALITY: 'Modalidad',
  COL_SALARY: 'Salario',
  COL_POSTULANTS: 'Postulantes',
  COL_CREATED: 'Fecha de publicación',
  COL_STATE: 'Estado',
  
  // Confirmaciones
  DELETE_CONFIRM_TITLE: 'Eliminar vacante',
  DELETE_CONFIRM_MESSAGE: '¿Estás seguro de que deseas eliminar esta vacante? Esta acción no se puede deshacer.',
  
  // Vacío
  NO_POSTULACIONES: 'No tienes vacantes publicadas',
  NO_POSTULACIONES_HINT: 'Crea tu primera vacante para empezar a recibir candidatos',
  NO_CANDIDATES: 'No hay candidatos registrados',
  NO_CANDIDATES_HINT: 'Cuando los candidatos se postulen a tus vacantes, aparecerán aquí',
  
  // Búsqueda
  SEARCH_PLACEHOLDER: 'Buscar por título, ciudad o categoría...',
  SEARCH_CANDIDATES_PLACEHOLDER: 'Buscar por nombre, vacante o email...',
  
  // Estadísticas
  STAT_ACTIVE: 'Vacantes activas',
  STAT_TOTAL_POSTULANTS: 'Total de candidatos',
  STAT_PENDING: 'Pendientes de revisión',
  STAT_ACCEPTED: 'Aceptados',
}

// ─── Colores de estado ────────────────────────────────────
export const JOB_STATUS_COLORS = {
  active: 'var(--color-artes)',
  paused: 'var(--color-empleo)',
}

export const APPLICATION_STATUS_COLORS = {
  pending: '#D4944C',
  reviewed: '#01ADFF',
  accepted: '#1F8049',
  rejected: '#B0434B',
}
