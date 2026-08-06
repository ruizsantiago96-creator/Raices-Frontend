/**
 * Mensajes y textos estáticos para el módulo de Perfil.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const PROFILE_TOAST = {
  // Avatar
  AVATAR_INVALID_FORMAT: 'Formato no reconocido. Usa PNG, JPG o JPEG',
  AVATAR_TOO_LARGE: 'La imagen es muy grande. Intenta con una de menos de 5MB',
  AVATAR_UPDATED: '¡Foto de perfil actualizada!',
  AVATAR_UPDATE_ERROR: 'No pudimos subir la foto. Intenta de nuevo.',
  AVATAR_DELETED: 'Foto eliminada',
  AVATAR_DELETE_ERROR: 'No pudimos eliminar la foto. Intenta de nuevo.',
  
  // Perfil
  PROFILE_UPDATED: '¡Tu perfil se actualizó correctamente!',
  PROFILE_UPDATE_ERROR: 'No pudimos guardar los cambios. Intenta de nuevo.',
  
  // Onboarding
  ONBOARDING_COMPLETED: '¡Tu perfil está completo!',
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
  EDIT_TITLE: 'Editar mis datos',
  NAME_LABEL: 'Nombre completo',
  CITY_LABEL: 'Ciudad',
  STATE_LABEL: 'Estado',
  CITY_PLACEHOLDER: 'Mérida',
  STATE_PLACEHOLDER: 'Yucatán',
  
  // Estados de rol
  ROLE_PCD: 'Persona con condición',
  ROLE_TUTOR: 'Cuidador/a',
  ROLE_INSTITUTION: 'Institución',
  ROLE_ADMIN: 'Administrador',
  ROLE_USER: 'Usuario',
  
  // Estadísticas
  DISABILITY_STAT_LABEL: 'condición(es)',
  NEEDS_STAT_LABEL: 'perfil de necesidades',
  VERIFIED_STAT_LABEL: 'identidad verificada',
  
  // Perfil de necesidades
  NEEDS_PROFILE_TITLE: 'Cuéntanos sobre ti',
  UPDATE_LINK: 'Actualizar mi perfil',
  RETAKE_TEST_LINK: 'Volver a hacer el cuestionario',
  LIFE_STAGE_LABEL: 'Etapa de vida',
  DISABILITY_TYPES_LABEL: 'Condición o situación',
  COMMUNICATION_MODES_LABEL: 'Cómo te comunicas',
  MOBILITY_NEEDS_LABEL: 'Necesidades de movilidad',
  
  // Estado vacío
  EMPTY_TITLE: 'Cuéntanos más sobre ti',
  EMPTY_DESCRIPTION: 'Con esta información podemos recomendarte opciones que realmente se ajusten a lo que necesitas',
  COMPLETE_NOW_BUTTON: 'Completar ahora',
  RETAKE_TEST_BUTTON: 'Volver a hacer el cuestionario',
  
  // Error
  ERROR_TITLE: 'No pudimos cargar tu perfil',
  ERROR_DESCRIPTION: '¿Puedes verificar tu conexión e intentar de nuevo?',
  
  // Confirmación
  CONFIRM_DELETE_AVATAR: '¿Eliminar tu foto de perfil?',
  
  // Onboarding - Pasos
  ONBOARDING_STEPS: [
    { title: 'Datos generales', desc: 'Conocerte un poco nos ayuda a personalizar tu experiencia.' },
    { title: 'Tu condición y necesidades', desc: 'Para adaptar todo a lo que realmente necesitas.' },
    { title: 'Etapa de vida', desc: 'Para sugerirte apoyos que realmente te sirvan.' },
    { title: 'Tu recorrido', desc: 'Queremos saber qué has intentado para continuar desde ahí.' },
    { title: 'Tus metas', desc: '¿Qué te gustaría lograr? Tus objetivos nos guían.' },
    { title: 'Cómo te sientes', desc: 'Hoy y en general, en qué necesitas más acompañamiento.' },
  ],
  
  // Severidad
  SEVERITY_OPTIONS: ['Leve', 'Moderado', 'Significativo'],
  
  // Onboarding - Botones
  ONBOARDING_NEXT: 'Siguiente',
  ONBOARDING_BACK: 'Volver',
  ONBOARDING_FINISH: 'Finalizar',
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
