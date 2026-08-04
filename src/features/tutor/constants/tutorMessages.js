/**
 * Mensajes y textos estáticos para el módulo de Tutor/Familia.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const TUTOR_TOAST = {
  // Dependientes
  DEPENDENT_CREATED: 'Persona y cuenta creadas',
  DEPENDENT_CREATED_WITH_ACCOUNT_WARNING: 'Persona creada, pero error al crear cuenta: ',
  DEPENDENT_ADDED: 'Persona agregada',
  DEPENDENT_UPDATED: 'Datos actualizados',
  DEPENDENT_DELETED: 'Persona eliminada',
  DEPENDENT_LINKED: 'Persona vinculada exitosamente',
  
  // Errores
  SAVE_ERROR: 'Error al guardar',
  DELETE_ERROR: 'Error al eliminar',
  PERMISSIONS_ERROR: 'Error al guardar permisos',
  LINK_ERROR: 'Error al vincular',
  
  // Permisos
  PERMISSIONS_UPDATED: 'Permisos actualizados',
}

// ─── Textos de UI ─────────────────────────────────────────
export const TUTOR_UI = {
  // Header
  PAGE_TITLE: 'Mis personas',
  SUBTITLE: 'Personas a tu cuidado y sus necesidades',
  ADD_PERSON: 'Agregar persona',
  LINK_PERSON: 'Vincular persona',
  
  // Botones
  SAVE_BUTTON: 'Guardar',
  SAVE_BUTTON_LOADING: 'Guardando...',
  SAVE_PERMISSIONS: 'Guardar permisos',
  ADD_BUTTON: 'Agregar',
  ADD_BUTTON_LOADING: 'Agregando...',
  ADD_FIRST_PERSON: 'Agregar la primera persona',
  CANCEL_BUTTON: 'Cancelar',
  EDIT_BUTTON: 'Editar',
  DELETE_BUTTON: 'Eliminar',
  CONFIRM_DELETE_BUTTON: 'Sí, eliminar',
  CONFIGURE_FEATURES: 'Configurar features',
  MANAGE_PERMISSIONS: 'Gestionar permisos',
  FEATURES_BUTTON: 'Features',
  PERMISSIONS_BUTTON: 'Permisos',
  
  // IA
  SHOW_AI: 'Recomendaciones IA',
  HIDE_AI: 'Ocultar IA',
  AI_ERROR: 'No se pudo cargar. Intenta de nuevo.',
  AI_STEPS_TITLE: 'Próximos pasos para',
  
  // Estados vacíos
  EMPTY_TITLE: 'Aún no agregas a nadie',
  EMPTY_DESCRIPTION: 'Registra a las personas que cuidas para guardar sus necesidades y encontrar instituciones adecuadas para cada una.',
  
  // Modales
  CREATE_TITLE: 'Agregar persona',
  EDIT_TITLE: 'Editar persona',
  LINK_TITLE: 'Vincular persona',
  LINK_MODAL_SUBTITLE: 'Conecta una cuenta existente a tu cuidado',
  LINK_BUTTON: 'Vincular',
  LINK_BUTTON_LOADING: 'Vinculando...',
  FEATURES_TITLE: 'Configurar features',
  FEATURES_MODAL_DESC: 'Controla qué secciones puede ver esta persona',
  PERMISSIONS_TITLE: 'Gestionar permisos',
  CONFIRM_DELETE_TITLE: 'Eliminar persona',
  
  // Formularios
  NAME_PLACEHOLDER: 'Ej. Mateo Pérez',
  NAME_LABEL: 'Nombre completo',
  RELATION_LABEL: 'Relación contigo',
  LIFE_STAGE_LABEL: 'Etapa de vida',
  LIFE_STAGE_NONE: 'Sin especificar',
  DISABILITY_LABEL: 'Tipo(s) de discapacidad',
  NOTES_LABEL: 'Notas (opcional)',
  NOTES_PLACEHOLDER: 'Información útil: terapias actuales, intereses, lo que necesita...',
  PCD_ID_LABEL: 'ID de usuario PCD',
  PCD_ID_PLACEHOLDER: 'Pega el ID del usuario',
  PCD_ID_HINT: 'La persona con discapacidad debe proporcionarte su ID de usuario.',
  
  // Estados
  NO_NAME: 'Sin nombre',
  FAMILY_RELATION: 'Familiar',
  
  // Confirmación
  CONFIRM_DELETE: '¿Estás seguro de que deseas eliminar esta persona?',
}
