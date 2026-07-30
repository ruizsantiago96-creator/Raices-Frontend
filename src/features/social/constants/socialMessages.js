/**
 * Mensajes y textos estáticos para el módulo de Comunidad/Social.
 * Evita hardcoding de strings en JSX.
 */

// ─── Mensajes de Toast ────────────────────────────────────
export const SOCIAL_TOAST = {
  // Publicaciones
  POST_UPDATED: 'Publicación actualizada',
  POST_UPDATE_FAILED: 'No se pudo actualizar',
  POST_DELETED: 'Publicación eliminada',
  POST_DELETE_FAILED: 'No se pudo eliminar',
  POST_CREATED: 'Mensaje publicado con éxito',
  POST_CREATE_FAILED: 'No se pudo publicar el mensaje. Asegúrate de estar unido al grupo.',
  
  // Grupos
  GROUP_CREATED: 'Grupo creado',
  GROUP_CREATE_FAILED: 'No se pudo crear el grupo',
  GROUP_JOINED: 'Te uniste al grupo',
  GROUP_JOIN_FAILED: 'No se pudo unir al grupo',
  GROUP_LEFT: 'Saliste del grupo',
  GROUP_LEAVE_FAILED: 'No se pudo salir del grupo',
}

// ─── Textos de UI ─────────────────────────────────────────
export const SOCIAL_UI = {
  // Tabs
  TAB_COMMUNITY: 'Comunidad',
  TAB_MESSAGES: 'Mensajes directos',
  TAB_ABOUT: 'Quiénes somos',
  
  // Publicación
  POST_PLACEHOLDER: '¿Qué quieres compartir con la comunidad?',
  POST_BUTTON: 'Publicar',
  POST_BUTTON_LOADING: 'Publicando…',
  EDIT_BUTTON: 'Guardar',
  EDIT_BUTTON_LOADING: 'Guardando...',
  CANCEL_BUTTON: 'Cancelar',
  
  // Comentarios
  COMMENT_PLACEHOLDER: 'Escribe un comentario…',
  COMMENTS_LOADING: 'Cargando comentarios...',
  NO_COMMENTS: 'Sin comentarios aún.',
  
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
  MESSAGES_EMPTY: 'Sin conversaciones aún.',
  MESSAGES_EMPTY_HINT: 'Escribe a alguien desde la comunidad.',
  MESSAGES_LOADING: 'Cargando…',
  MESSAGE_PLACEHOLDER: 'Escribe un mensaje…',
  SELECT_CONVERSATION: 'Selecciona una conversación para chatear',
  
  // Estadísticas
  ACTIVE_MEMBERS: 'Miembros activos',
  GROUPS_COUNT: 'Grupos',
  SHARED_STORIES: 'Historias compartidas',
  ABOUT_COMMUNITY_TITLE: 'Quiénes forman parte de nuestra comunidad',
  ABOUT_COMMUNITY_DESC: 'Somos personas con discapacidad, familias, cuidadores y profesionales comprometidos con la inclusión.',
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
  USER_FALLBACK: 'Usuario',
  
  // Form labels
  FORM_NAME_LABEL: 'Nombre *',
  FORM_DESC_LABEL: 'Descripción',
}

// ─── Confirmaciones ───────────────────────────────────────
export const SOCIAL_CONFIRM = {
  DELETE_POST: '¿Eliminar esta publicación?',
}


