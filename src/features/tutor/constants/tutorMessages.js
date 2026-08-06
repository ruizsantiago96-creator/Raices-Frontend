/**
 * Mensajes y textos estáticos para el módulo de Tutor/Familia.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const TUTOR_TOAST = {
  // Dependientes
  DEPENDENT_CREATED: '¡Persona y cuenta creadas con éxito!',
  DEPENDENT_CREATED_WITH_ACCOUNT_WARNING: 'Persona creada, pero hubo un problema al crear la cuenta: ',
  DEPENDENT_ADDED: '¡Persona agregada!',
  DEPENDENT_UPDATED: '¡Datos actualizados!',
  DEPENDENT_DELETED: 'Persona eliminada',
  DEPENDENT_LINKED: '¡Persona vinculada exitosamente!',
  DEPENDENT_UNLINKED: 'Persona desvinculada',
  
  // Errores
  SAVE_ERROR: 'No pudimos guardar. Intenta de nuevo.',
  DELETE_ERROR: 'No pudimos eliminar. Intenta de nuevo.',
  PERMISSIONS_ERROR: 'No pudimos guardar los permisos. Intenta de nuevo.',
  LINK_ERROR: 'No pudimos vincular. Verifica el correo e intenta de nuevo.',
  UNLINK_ERROR: 'No pudimos desvincular. Intenta de nuevo.',
  
  // Permisos
  PERMISSIONS_UPDATED: '¡Permisos actualizados!',
  FEATURES_UPDATED: '¡Opciones actualizadas!',
}

// ─── Textos de UI ─────────────────────────────────────────
export const TUTOR_UI = {
  // Header
  PAGE_TITLE: 'Las personas que cuidas',
  ADD_PERSON: 'Agregar persona',
  LINK_PERSON: 'Vincular persona',
  
  // Conteo / Límite
  COUNT_TITLE: 'registradas',
  COUNT_SEPARATOR: 'de',
  COUNT_REMAINING: 'disponibles',
  COUNT_LIMIT_REACHED: 'Límite alcanzado',
  COUNT_LIMIT_HINT: 'Has alcanzado el límite de personas. Puedes eliminar alguna para agregar otra.',
  
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
  CONFIGURE_FEATURES: 'Configurar opciones',
  MANAGE_PERMISSIONS: 'Gestionar permisos',
  FEATURES_BUTTON: 'Opciones',
  PERMISSIONS_BUTTON: 'Permisos',
  UNLINK_BUTTON: 'Desvincular',
  UNLINK_BUTTON_LOADING: 'Desvinculando...',
  
  // IA
  SHOW_AI: 'Recomendaciones personalizadas',
  HIDE_AI: 'Ocultar recomendaciones',
  AI_ERROR: 'No pudimos cargar las recomendaciones. Intenta de nuevo.',
  AI_STEPS_TITLE: 'Sugerencias para',
  
  // Estados vacíos
  EMPTY_TITLE: 'Aún no has agregado a nadie',
  EMPTY_DESCRIPTION: 'Registra a las personas que cuidas para guardar su información y encontrar opciones adecuadas para cada una.',
  
  // Secciones de lista
  MANAGED_SECTION_TITLE: 'Registradas',
  LINKED_SECTION_TITLE: 'Cuentas vinculadas',
  LINKED_BADGE: 'Cuenta vinculada',
  LINKED_HINT: 'Esta persona tiene su propia cuenta en la plataforma',
  
  // Modales
  CREATE_TITLE: 'Agregar persona',
  EDIT_TITLE: 'Editar persona',
  LINK_TITLE: 'Vincular persona',
  LINK_MODAL_SUBTITLE: 'Conecta una cuenta existente para cuidarla',
  LINK_BUTTON: 'Vincular',
  LINK_BUTTON_LOADING: 'Vinculando...',
  FEATURES_TITLE: 'Configurar opciones',
  FEATURES_MODAL_DESC: 'Elige qué puede ver y hacer esta persona',
  PERMISSIONS_TITLE: 'Gestionar permisos',
  CONFIRM_DELETE_TITLE: 'Eliminar persona',
  CONFIRM_UNLINK_TITLE: 'Desvincular persona',
  CONFIRM_UNLINK_MESSAGE: (name) => `¿Eliminar el vínculo con "${name}"? Ya no aparecerá en tu lista de personas a tu cuidado.`,
  
  // Formularios
  NAME_PLACEHOLDER: 'Ej. Mateo Pérez',
  NAME_LABEL: 'Nombre completo',
  RELATION_LABEL: '¿Cómo se relaciona contigo?',
  LIFE_STAGE_LABEL: 'Etapa de vida',
  LIFE_STAGE_NONE: 'Sin especificar',
  DISABILITY_LABEL: 'Condición o situación',
  NOTES_LABEL: 'Notas (opcional)',
  NOTES_PLACEHOLDER: 'Cualquier información relevante: terapias, intereses, preferencias...',
  PCD_EMAIL_LABEL: 'Correo de la persona',
  PCD_EMAIL_PLACEHOLDER: 'ejemplo@correo.com',
  PCD_EMAIL_HINT: 'Escribe el correo con el que está registrada en la plataforma.',
  
  // Estados
  NO_NAME: 'Sin nombre',
  FAMILY_RELATION: 'Familiar',
  
  // Confirmación
  CONFIRM_DELETE: '¿Eliminar esta persona de tu lista? Se perderán los datos guardados.',
}
