/**
 * Mensajes y textos estáticos para el módulo de Comunidad/Social.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const SOCIAL_TOAST = {
  // Publicaciones
  POST_UPDATED: '¡Tu publicación se actualizó!',
  POST_UPDATE_FAILED: 'No pudimos actualizar tu publicación. Intenta de nuevo.',
  POST_DELETED: 'Publicación eliminada',
  POST_DELETE_FAILED: 'No pudimos eliminar la publicación. Intenta de nuevo.',
  POST_CREATED: '¡Tu mensaje fue compartido con éxito!',
  POST_CREATE_FAILED: 'No pudimos publicar tu mensaje. ¿Estás unido/a al grupo?',
  
  // Grupos
  GROUP_CREATED: '¡Grupo creado con éxito!',
  GROUP_CREATE_FAILED: 'No pudimos crear el grupo. Intenta de nuevo.',
  GROUP_JOINED: '¡Te uniste al grupo! Bienvenido/a',
  GROUP_JOIN_FAILED: 'No pudimos unirte al grupo. Intenta de nuevo.',
  GROUP_LEFT: 'Saliste del grupo',
  GROUP_LEAVE_FAILED: 'No pudimos sacarte del grupo. Intenta de nuevo.',
}

// ─── Textos de UI ─────────────────────────────────────────
export const SOCIAL_UI = {
  // Tabs
  TAB_COMMUNITY: 'Conectemos',
  TAB_MESSAGES: 'Mensajes ',
  TAB_ABOUT: 'Comunidad',
  
  // Publicación
  POST_PLACEHOLDER: '¿Qué te gustaría compartir con la comunidad?',
  POST_BUTTON: 'Publicar',
  POST_BUTTON_LOADING: 'Publicando…',
  EDIT_BUTTON: 'Guardar',
  EDIT_BUTTON_LOADING: 'Guardando...',
  CANCEL_BUTTON: 'Cancelar',
  
  // Comentarios
  COMMENT_PLACEHOLDER: 'Escribe tu comentario aquí...',
  COMMENTS_LOADING: 'Cargando comentarios...',
  NO_COMMENTS: 'Sé el primero en comentar',
  
  // Grupos
  CREATE_GROUP_TITLE: 'Crear grupo',
  GROUP_NAME_PLACEHOLDER: 'Ej: Familias TEA Mérida',
  GROUP_DESC_PLACEHOLDER: '¿De qué trata el grupo?',
  GROUP_PUBLIC_LABEL: 'Grupo público (visible para todos)',
  CREATE_GROUP_BUTTON: 'Crear grupo',
  CREATE_GROUP_BUTTON_LOADING: 'Creando...',
  JOIN_GROUP: 'Unirse al grupo',
  LEAVE_GROUP: 'Salir del grupo',
  
  // Sidebar
  GROUPS_TITLE: 'Grupos',
  ALL_GROUPS: 'Todos',
  CREATE_GROUP: 'Crear grupo',
  
  // Mensajes
  MESSAGES_TITLE: 'Mensajes',
  MESSAGES_EMPTY: 'Aún no tienes conversaciones',
  MESSAGES_EMPTY_HINT: 'Escribe a alguien desde la comunidad para comenzar',
  MESSAGES_LOADING: 'Cargando…',
  MESSAGE_PLACEHOLDER: 'Escribe tu mensaje aquí...',
  SELECT_CONVERSATION: 'Selecciona una conversación para chatear',
  
  // Estadísticas
  ACTIVE_MEMBERS: 'Miembros activos',
  GROUPS_COUNT: 'Grupos',
  SHARED_STORIES: 'Historias compartidas',
  ABOUT_COMMUNITY_TITLE: 'Nuestra comunidad',
  ABOUT_COMMUNITY_DESC: 'Somos personas con alguna condición, familias, cuidadores y profesionales comprometidos con la inclusión.',
  STATS_LOADING: 'Cargando estadísticas...',
  
  // Relative time
  TIME_NOW: 'hace un momento',
  TIME_PREFIX: 'hace',
  
  // Loading
  LOADING: 'Cargando…',
  
  // Empty states
  EMPTY_POSTS_TITLE: 'Sé el primero en escribir en este grupo',
  EMPTY_POSTS_DESC: 'Comparte experiencias, preguntas o recursos con la comunidad',
  
  // Messages fallback
  USER_FALLBACK: 'Usuario/a',
  
  // Form labels
  FORM_NAME_LABEL: 'Nombre *',
  FORM_DESC_LABEL: 'Descripción',
}

// ─── Confirmaciones ───────────────────────────────────────
export const SOCIAL_CONFIRM = {
  DELETE_POST: '¿Eliminar esta publicación?',
}


