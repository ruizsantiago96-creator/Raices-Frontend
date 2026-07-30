/**
 * Mensajes y textos estáticos para el módulo de Empleo.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const JOBS_TOAST = {
  // Vacantes
  JOB_CREATED: 'Vacante creada con éxito',
  JOB_CREATE_FAILED: 'No se pudo crear la vacante',
  
  // Postulaciones
  APPLICATION_SENT: '¡Solicitud enviada con éxito!',
  APPLICATION_FAILED: 'No se pudo enviar la solicitud',
}

// ─── Textos de UI ─────────────────────────────────────────
export const JOBS_UI = {
  // Título
  PAGE_TITLE: 'Bolsa de Trabajo Inclusiva',
  PAGE_SUBTITLE: 'Vacantes en empresas que valoran la diversidad',
  
  // Tabs
  TAB_BOARD: 'Vacantes',
  TAB_APPLICATIONS: 'Mis solicitudes',
  
  // Botones
  CREATE_JOB: 'Crear vacante',
  CREATE_JOB_LOADING: 'Creando...',
  APPLY_BUTTON: 'Enviar solicitud',
  APPLY_BUTTON_LOADING: 'Enviando…',
  POSTULATE_BUTTON: 'Postularme',
  POSTULATED_BADGE: 'Postulado',
  VIEW_DETAILS: 'Ver detalles',
  LESS_INFO: 'Menos info',
  CANCEL_BUTTON: 'Cancelar',
  
  // Formularios - Crear vacante
  CREATE_JOB_TITLE: 'Crear vacante',
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
  
  // Formularios - Postularme
  APPLY_TITLE: 'Postularte a',
  COVER_LETTER_LABEL: 'Carta de presentación (opcional)',
  COVER_LETTER_PLACEHOLDER: 'Cuéntanos por qué eres el candidato ideal para esta vacante…',
  
  // Detalles de vacante
  DESCRIPTION_LABEL: 'Descripción',
  REQUIREMENTS_LABEL: 'Requisitos',
  DISABILITY_WELCOME_LABEL: 'Discapacidades bienvenidas',
  INCLUSIVE_BADGE: 'Empresa inclusiva para personas con discapacidad',
  VERIFIED_BADGE: 'Verificado',
  
  // Estados de postulación
  STATUS_PENDING: 'Enviada',
  STATUS_REVIEWED: 'En revisión',
  STATUS_ACCEPTED: 'Aceptada',
  STATUS_REJECTED: 'No seleccionado',
  
  // Vacío
  NO_JOBS: 'No hay vacantes disponibles',
  NO_JOBS_HINT: 'Pronto las instituciones publicarán sus oportunidades de empleo',
  NO_APPLICATIONS: 'Aún no has enviado ninguna solicitud',
  
  // Modalidad filter
  ALL_MODALITIES: 'Todos',
}

// ─── Colores de estado ────────────────────────────────────
export const STATUS_COLORS = {
  pending: '#D4944C',
  reviewed: '#01ADFF',
  accepted: '#1F8049',
  rejected: '#B0434B',
}
