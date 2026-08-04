/**
 * Mensajes y textos estáticos para el módulo de Perfil.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const PROFILE_TOAST = {
  // Avatar
  AVATAR_INVALID_FORMAT: 'Formato no permitido. Usa PNG, JPG o JPEG',
  AVATAR_TOO_LARGE: 'La imagen no puede superar 5MB',
  AVATAR_UPDATED: 'Avatar actualizado correctamente',
  AVATAR_UPDATE_ERROR: 'Error al subir la foto',
  AVATAR_DELETED: 'Foto de perfil eliminada correctamente',
  AVATAR_DELETE_ERROR: 'Error al eliminar la foto',
  
  // Perfil
  PROFILE_UPDATED: 'Perfil actualizado',
  PROFILE_UPDATE_ERROR: 'Error al guardar',
  
  // Onboarding
  ONBOARDING_COMPLETED: '¡Perfil completado!',
}

// ─── Textos de UI ─────────────────────────────────────────
export const PROFILE_UI = {
  // Título de página
  PAGE_TITLE: 'Mi perfil',
  
  // Botones
  SAVE_BUTTON: 'Guardar cambios',
  SAVE_BUTTON_LOADING: 'Guardando...',
  CANCEL_BUTTON: 'Cancelar',
  EDIT_BUTTON: 'Editar',
  UPLOAD_PHOTO: 'Subir foto',
  DELETE_PHOTO: 'Eliminar foto',
  
  // Editar formulario
  EDIT_TITLE: 'Editar datos personales',
  NAME_LABEL: 'Nombre completo',
  CITY_LABEL: 'Ciudad',
  STATE_LABEL: 'Estado',
  CITY_PLACEHOLDER: 'Mérida',
  STATE_PLACEHOLDER: 'Yucatán',
  
  // Estados de rol
  ROLE_PCD: 'Persona con discapacidad',
  ROLE_TUTOR: 'Tutor o familiar',
  ROLE_INSTITUTION: 'Institución',
  ROLE_ADMIN: 'Administrador',
  ROLE_USER: 'Usuario',
  
  // Estadísticas
  DISABILITY_STAT_LABEL: 'tipo(s) de discapacidad',
  NEEDS_STAT_LABEL: 'perfil de necesidades',
  VERIFIED_STAT_LABEL: 'identidad verificada',
  
  // Perfil de necesidades
  NEEDS_PROFILE_TITLE: 'Perfil de necesidades',
  UPDATE_LINK: 'Actualizar perfil',
  RETAKE_TEST_LINK: 'Volver a hacer el test',
  LIFE_STAGE_LABEL: 'Etapa de vida',
  DISABILITY_TYPES_LABEL: 'Tipos de discapacidad',
  COMMUNICATION_MODES_LABEL: 'Modos de comunicación',
  MOBILITY_NEEDS_LABEL: 'Necesidades de movilidad',
  
  // Estado vacío
  EMPTY_TITLE: 'Completa tu perfil de necesidades',
  EMPTY_DESCRIPTION: 'Con esta información la IA puede recomendarte instituciones que realmente encajen contigo',
  COMPLETE_NOW_BUTTON: 'Completar ahora',
  RETAKE_TEST_BUTTON: 'Volver a hacer el test',
  
  // Error
  ERROR_TITLE: 'No se pudo cargar el perfil',
  ERROR_DESCRIPTION: 'Verifica tu conexión e intenta de nuevo',
  
  // Confirmación
  CONFIRM_DELETE_AVATAR: '¿Estás seguro de que deseas eliminar tu foto de perfil?',
  
  // Onboarding - Pasos
  ONBOARDING_STEPS: [
    { title: 'Datos generales', desc: 'Conocer lo básico nos ayuda a personalizar tu entorno.' },
    { title: 'Condición y necesidades', desc: 'Adaptar la accesibilidad a tus necesidades específicas.' },
    { title: 'Etapa de vida', desc: 'Identificar tu momento para sugerir apoyos relevantes.' },
    { title: 'Historial y recorrido', desc: 'Queremos saber qué has hecho para continuar construyendo.' },
    { title: 'Tus objetivos', desc: '¿Hacia dónde vamos? Tus metas de corto y mediano plazo.' },
    { title: 'Estado actual', desc: 'Cómo te sientes hoy y en qué necesitas más soporte.' },
  ],
  
  // Severidad
  SEVERITY_OPTIONS: ['Bajo', 'Medio', 'Alto'],
  
  // Onboarding - Botones
  ONBOARDING_NEXT: 'Siguiente',
  ONBOARDING_BACK: 'Volver',
  ONBOARDING_FINISH: 'Finalizar perfil',
  ONBOARDING_FINISH_LOADING: 'Guardando...',
}

// ─── Validación ───────────────────────────────────────────
export const PROFILE_VALIDATION = {
  MAX_AVATAR_SIZE_MB: 5,
  ALLOWED_AVATAR_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
}

// ─── Labels de rol (mapa para badge) ─────────────────────
export const ROLE_LABELS = {
  pcd: PROFILE_UI.ROLE_PCD,
  tutor: PROFILE_UI.ROLE_TUTOR,
  institution: PROFILE_UI.ROLE_INSTITUTION,
  admin: PROFILE_UI.ROLE_ADMIN,
  user: PROFILE_UI.ROLE_USER,
}
