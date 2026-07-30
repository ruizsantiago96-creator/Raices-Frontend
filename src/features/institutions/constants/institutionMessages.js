/**
 * Mensajes y textos estáticos para el módulo de Instituciones.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const INSTITUTION_TOAST = {
  // Reseñas
  REVIEW_UPDATED: 'Reseña actualizada',
  REVIEW_UPDATE_FAILED: 'No se pudo actualizar',
  REVIEW_DELETED: 'Reseña eliminada',
  REVIEW_DELETE_FAILED: 'No se pudo eliminar',
  REVIEW_CREATED: '¡Reseña publicada con éxito!',
  REVIEW_CREATE_FAILED: 'No se pudo publicar la reseña. Intenta de nuevo.',
  REVIEW_LOGIN_REQUIRED: 'Debes iniciar sesión para dejar una reseña.',
  
  // Institución
  INSTITUTION_CREATED: 'Institución creada con éxito',
  INSTITUTION_CREATE_FAILED: 'Error al crear la institución. Intenta de nuevo.',
  INSTITUTION_NAME_REQUIRED: 'El nombre de la institución es obligatorio.',
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
  SEARCH_PLACEHOLDER: 'Buscar instituciones, servicios, ciudades...',
  
  // Estados
  LOADING: 'Buscando...',
  NO_RESULTS: 'Sin resultados',
  NO_ADDRESS: 'Dirección no disponible',
  ANONYMOUS: 'Anónimo',
  
  // AI Assistant
  AI_ERROR: 'Hubo un error al conectar con el asistente. Intenta de nuevo.',
  
  // Categorías
  CATEGORIES: [
    { value: 'funcional', label: 'Salud y Terapia' },
    { value: 'educativo', label: 'Educación' },
    { value: 'laboral', label: 'Empleo' },
    { value: 'social', label: 'Comunidad y Recreación' },
  ],
  
  // Filtros
  ALL_FILTER: 'Todos',
  
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
  CREATE_LOGIN_REQUIRED: 'Inicia sesión para registrar una institución',
  CREATE_REGISTER: 'Registrarse',
}
