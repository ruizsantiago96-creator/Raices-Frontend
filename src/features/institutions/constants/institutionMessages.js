/**
 * Mensajes y textos estáticos para el módulo de Instituciones.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const INSTITUTION_TOAST = {
  // Reseñas
  REVIEW_UPDATED: '¡Tu reseña se actualizó!',
  REVIEW_UPDATE_FAILED: 'No pudimos actualizar tu reseña. Intenta de nuevo.',
  REVIEW_DELETED: 'Reseña eliminada',
  REVIEW_DELETE_FAILED: 'No pudimos eliminar la reseña. Intenta de nuevo.',
  REVIEW_CREATED: '¡Gracias por compartir tu experiencia!',
  REVIEW_CREATE_FAILED: 'No pudimos publicar tu reseña. Intenta de nuevo.',
  REVIEW_LOGIN_REQUIRED: 'Necesitas iniciar sesión para dejar una reseña.',
  
  // Institución
  INSTITUTION_CREATED: '¡Institución registrada con éxito!',
  INSTITUTION_CREATE_FAILED: 'No pudimos registrar la institución. Intenta de nuevo.',
  INSTITUTION_NAME_REQUIRED: 'El nombre de la institución es necesario para continuar.',
}

// ─── Textos de UI ─────────────────────────────────────────
export const INSTITUTION_UI = {
  // Botones
  SAVE_BUTTON: 'Guardar',
  SAVE_BUTTON_LOADING: 'Guardando...',
  PUBLISH_BUTTON: 'Publicar reseña',
  PUBLISH_BUTTON_LOADING: 'Publicando...',
  FAVORITE_SAVED: 'Guardado',
  FAVORITE: 'Guardar',
  
  // Formularios
  REVIEW_PLACEHOLDER: 'Comparte tu experiencia con esta institución (opcional)',
  SEARCH_PLACEHOLDER: '¿Qué institución o servicio buscas?',
  
  // Estados
  LOADING: 'Buscando...',
  NO_RESULTS: 'No encontramos resultados',
  NO_ADDRESS: 'Dirección no disponible',
  ANONYMOUS: 'Anónimo',
  
  // AI Assistant
  AI_ERROR: 'No pudimos conectar con el asistente. Intenta de nuevo.',
  
  // Categorías
  CATEGORIES: [
    { value: 'funcional', label: 'Salud y Terapia' },
    { value: 'educativo', label: 'Educación' },
    { value: 'laboral', label: 'Empleo' },
    { value: 'social', label: 'Comunidad y Recreación' },
  ],
  
  // Filtros
  ALL_FILTER: 'Todas',
  
  // Vista
  GRID_VIEW: 'Vista cuadrícula',
  LIST_VIEW: 'Vista lista',
  
  // Crear institución
  CREATE_TITLE: 'Registrar institución',
  CREATE_NAME_PLACEHOLDER: 'Ej. Centro de Terapia Familiar',
  CREATE_DESC_PLACEHOLDER: 'Describe brevemente la institución y sus servicios...',
  CREATE_CITY_PLACEHOLDER: 'Ej. Monterrey',
  CREATE_STATE_PLACEHOLDER: 'Ej. Nuevo León',
  CREATE_ADDRESS_PLACEHOLDER: 'Ej. Av. Universidad 1234',
  CREATE_PHONE_PLACEHOLDER: 'Ej. 81 1234 5678',
  CREATE_EMAIL_PLACEHOLDER: 'Ej. contacto@institucion.org',
  CREATE_WEBSITE_PLACEHOLDER: 'Ej. https://www.institucion.org',
  CREATE_LOGIN_REQUIRED: 'Necesitas iniciar sesión para registrar una institución',
  CREATE_REGISTER: 'Registrarse',
}
