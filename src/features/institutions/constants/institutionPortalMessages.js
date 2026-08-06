/**
 * Mensajes y textos estáticos para el Portal de Institución.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const PORTAL_TOAST = {
  // Vacantes
  JOB_CREATED: '¡Vacante publicada con éxito!',
  JOB_CREATE_FAILED: 'No pudimos publicar la vacante. Intenta de nuevo.',
  JOB_UPDATED: '¡Vacante actualizada!',
  JOB_UPDATE_FAILED: 'No pudimos actualizar la vacante. Intenta de nuevo.',
  JOB_DELETED: 'Vacante eliminada',
  JOB_DELETE_FAILED: 'No pudimos eliminar la vacante. Intenta de nuevo.',
  STATUS_CHANGED: 'Estado de la vacante actualizado',
  STATUS_CHANGE_FAILED: 'No pudimos cambiar el estado. Intenta de nuevo.',
  
  // Candidatos
  APPLICATION_UPDATED: 'Estado del candidato actualizado',
  APPLICATION_UPDATE_FAILED: 'No pudimos actualizar el estado. Intenta de nuevo.',
}

// ─── Textos de UI ─────────────────────────────────────────
export const PORTAL_UI = {
  // Título
  PAGE_TITLE: 'Tu espacio de gestión',
  PAGE_SUBTITLE: 'Administra tus vacantes y candidatos',
  
  // Tabs
  TAB_POSTULACIONES: 'Mis Vacantes',
  TAB_CANDIDATOS: 'Personas interesadas',
  
  // Botones
  CREATE_JOB: 'Publicar nueva oportunidad',
  CREATE_JOB_LOADING: 'Publicando...',
  VIEW_APPLICANTS: 'Ver personas interesadas',
  EDIT_JOB: 'Editar',
  DELETE_JOB: 'Eliminar',
  TOGGLE_STATUS: 'Cambiar estado',
  CANCEL_BUTTON: 'Cancelar',
  SAVE_BUTTON: 'Guardar',
  CONFIRM_DELETE: 'Eliminar vacante',
  
  // Formularios - Crear vacante
  CREATE_JOB_TITLE: 'Publicar nueva oportunidad',
  JOB_TITLE_LABEL: 'Título *',
  JOB_TITLE_PLACEHOLDER: 'Ej: Terapeuta Ocupacional',
  JOB_DESC_LABEL: 'Descripción',
  JOB_DESC_PLACEHOLDER: 'Describe la oportunidad...',
  JOB_REQUIREMENTS_LABEL: 'Requisitos',
  JOB_REQUIREMENTS_PLACEHOLDER: '¿Qué se necesita para esta oportunidad?',
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
  INCLUSIVE_CHECKBOX: 'Oportunidad inclusiva para personas con alguna condición',
  
  // Estados de vacante
  STATUS_ACTIVE: 'Activa',
  STATUS_PAUSED: 'Pausada',
  
  // Estados de candidato
  APP_STATUS_PENDING: 'Pendiente',
  APP_STATUS_REVIEWED: 'En revisión',
  APP_STATUS_ACCEPTED: 'Aceptado/a',
  APP_STATUS_REJECTED: 'No seleccionado/a',
  
  // Filtros de candidatos
  FILTER_ALL: 'Todas',
  FILTER_PENDING: 'Pendientes',
  FILTER_REVIEWED: 'En revisión',
  FILTER_ACCEPTED: 'Aceptados/as',
  
  // Tabla de candidatos
  COL_NAME: 'Nombre',
  COL_JOB: 'Vacante',
  COL_DATE: 'Fecha de postulación',
  COL_STATUS: 'Estado',
  COL_ACTIONS: 'Acciones',
  COL_CANDIDATES: 'Personas interesadas',
  
  // Tabla de postulaciones
  COL_TITLE: 'Título',
  COL_MODALITY: 'Modalidad',
  COL_SALARY: 'Salario',
  COL_POSTULANTS: 'Postulantes',
  COL_CREATED: 'Fecha de publicación',
  COL_STATE: 'Estado',
  
  // Confirmaciones
  DELETE_CONFIRM_TITLE: 'Eliminar vacante',
  DELETE_CONFIRM_MESSAGE: '¿Eliminar esta vacante? Esta acción no se puede deshacer.',
  
  // Vacío
  NO_POSTULACIONES: 'Aún no has publicado vacantes',
  NO_POSTULACIONES_HINT: 'Crea tu primera oportunidad para empezar a recibir candidatos',
  NO_CANDIDATES: 'No hay personas interesadas aún',
  NO_CANDIDATES_HINT: 'Cuando alguien se postule a tus vacantes, aparecerá aquí',
  
  // Búsqueda
  SEARCH_PLACEHOLDER: '¿Qué vacante buscas?',
  SEARCH_CANDIDATES_PLACEHOLDER: '¿Qué candidato buscas?',
  
  // Estadísticas
  STAT_ACTIVE: 'Vacantes activas',
  STAT_TOTAL_POSTULANTS: 'Total de candidatos',
  STAT_PENDING: 'Pendientes de revisión',
  STAT_ACCEPTED: 'Aceptados/as',
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
