/**
 * Mensajes y textos estáticos para el módulo de Empleo.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const JOBS_TOAST = {
  // Vacantes
  JOB_CREATED: '¡Vacante publicada con éxito!',
  JOB_CREATE_FAILED: 'No pudimos crear la vacante. Intenta de nuevo.',
  
  // Postulaciones
  APPLICATION_SENT: '¡Tu postulación fue enviada con éxito!',
  APPLICATION_FAILED: 'No pudimos enviar tu postulación. Intenta de nuevo.',
}

// ─── Textos de UI ─────────────────────────────────────────
export const JOBS_UI = {
  // Título
  PAGE_TITLE: 'Oportunidades',
  PAGE_SUBTITLE: 'Empresas que valoran la diversidad',
  
  // Tabs
  TAB_BOARD: 'Oportunidades',
  TAB_APPLICATIONS: 'Mis postulaciones',
  
  // Botones
  CREATE_JOB: 'Crear oportunidad',
  CREATE_JOB_LOADING: 'Creando...',
  APPLY_BUTTON: 'Postularme',
  APPLY_BUTTON_LOADING: 'Enviando…',
  POSTULATE_BUTTON: 'Postularme',
  POSTULATED_BADGE: 'Ya te postulaste',
  VIEW_DETAILS: 'Ver más',
  LESS_INFO: 'Ver menos',
  CANCEL_BUTTON: 'Cancelar',
  
  // Formularios - Crear vacante
  CREATE_JOB_TITLE: 'Crear nueva oportunidad',
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
  
  // Formularios - Postularme
  APPLY_TITLE: 'Postularme a',
  APPLY_TITLE_TUTOR: 'Postular a',
  COVER_LETTER_LABEL: 'Cuéntanos sobre ti (opcional)',
  COVER_LETTER_PLACEHOLDER: '¿Por qué eres buena opción para esta oportunidad?',
  
  // Selector de candidato (tutor)
  CANDIDATE_SECTION_TITLE: '¿Quién se va a postular?',
  CANDIDATE_ME: 'Yo mismo/a',
  CANDIDATE_ME_DESCRIPTION: 'Postular con mi perfil personal',
  CANDIDATE_MANAGED: 'Mis personas',
  CANDIDATE_MANAGED_DESCRIPTION: 'Personas a tu cuidado sin cuenta propia',
  CANDIDATE_LINKED: 'Cuentas vinculadas',
  CANDIDATE_LINKED_DESCRIPTION: 'Personas con su propia cuenta',
  CANDIDATE_SELECT_PLACEHOLDER: 'Selecciona a quien postular...',
  CANDIDATE_LOADING: 'Cargando personas...',
  CANDIDATE_NO_MANAGED: 'No hay personas registradas aún',
  CANDIDATE_NO_LINKED: 'No hay cuentas vinculadas',
  CANDIDATE_CONFIRM: 'Confirmar postulación',
  CANDIDATE_CONFIRM_LOADING: 'Enviando postulación...',
  
  // Detalles de vacante
  DESCRIPTION_LABEL: 'Descripción',
  REQUIREMENTS_LABEL: 'Requisitos',
  DISABILITY_WELCOME_LABEL: 'Condiciones bienvenidas',
  INCLUSIVE_BADGE: 'Oportunidad inclusiva para personas con alguna condición',
  VERIFIED_BADGE: 'Verificado',
  
  // Estados de postulación
  STATUS_PENDING: 'Enviada',
  STATUS_REVIEWED: 'En revisión',
  STATUS_ACCEPTED: '¡Aceptado/a!',
  STATUS_REJECTED: 'No seleccionado/a',
  
  // Mensajería
  MESSAGE_BUTTON: 'Enviar mensaje',
  MESSAGE_TITLE: 'Mensaje a',
  MESSAGE_PLACEHOLDER: 'Escribe tu mensaje...',
  MESSAGE_SEND: 'Enviar',
  MESSAGE_SENT: '¡Mensaje enviado!',
  MESSAGE_FAILED: 'No pudimos enviar el mensaje. Intenta de nuevo.',
  MESSAGE_MODAL_HINT: 'Conversa directamente con la institución sobre esta oportunidad',
  MESSAGE_NO_OWNER: 'No pudimos identificar al responsable de la institución',
  
  // Vacío
  NO_JOBS: 'No hay oportunidades disponibles aún',
  NO_JOBS_HINT: 'Pronto las instituciones publicarán oportunidades de empleo',
  NO_APPLICATIONS: 'Aún no te has postulado a ninguna oportunidad',
  
  // Modalidad filter
  ALL_MODALITIES: 'Todas',
  
  // Paginación
  PAGINATION_SHOWING: 'Mostrando',
  PAGINATION_OF: 'de',
  PAGINATION_PREV: 'Anterior',
  PAGINATION_NEXT: 'Siguiente',
  PAGINATION_PAGE: 'Página',
}

// ─── Colores de estado ────────────────────────────────────
export const STATUS_COLORS = {
  pending: '#D4944C',
  reviewed: '#01ADFF',
  accepted: '#1F8049',
  rejected: '#B0434B',
}
