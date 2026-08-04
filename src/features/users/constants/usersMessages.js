/**
 * Mensajes y textos estáticos para el módulo de Gestión de Usuarios (Admin).
 */

export const USERS_TOAST = {
  USER_UPDATED: 'Usuario actualizado',
  USER_UPDATE_FAILED: 'Error al actualizar el usuario',
  USER_ACTIVATED: 'Usuario activado',
  USER_DEACTIVATED: 'Usuario desactivado',
  USER_TOGGLE_FAILED: 'Error al cambiar estado del usuario',
  ROLE_UPDATED: 'Rol actualizado',
  ROLE_UPDATE_FAILED: 'Error al cambiar el rol',
  USER_DELETED: 'Usuario eliminado',
  USER_DELETE_FAILED: 'Error al eliminar el usuario',
}

export const USERS_UI = {
  TITLE: 'Gestión de usuarios',
  SEARCH_PLACEHOLDER: 'Buscar por nombre o email...',
  FILTER_ALL: 'Todos los roles',
  FILTER_ADMIN: 'Admin',
  FILTER_INSTITUTION: 'Institución',
  FILTER_TUTOR: 'Tutor',
  FILTER_PCD: 'Persona c/ disc.',
  EMPTY_STATE: 'No se encontraron usuarios',
  TABLE_HEADERS: {
    USER: 'Usuario',
    ROLE: 'Rol',
    STATUS: 'Estado',
    REGISTERED: 'Registrado',
    ACTIONS: 'Acciones',
  },
  STATUS_ACTIVE: 'Activo',
  STATUS_INACTIVE: 'Inactivo',
  EDIT_TITLE: 'Editar usuario',
  EDIT_NAME_LABEL: 'Nombre completo',
  EDIT_EMAIL_LABEL: 'Correo electrónico',
  EDIT_SAVE: 'Guardar',
  EDIT_CANCEL: 'Cancelar',
  DELETE_TITLE: 'Eliminar usuario',
  DELETE_MESSAGE: '¿Eliminar este usuario? Esta acción no se puede deshacer.',
  DELETE_CONFIRM: 'Sí, eliminar',
  ROLE_TITLE: 'Cambiar rol',
  ROLE_CONFIRM_MESSAGE: 'Selecciona el nuevo rol para',
  ROLE_CHANGE_CONFIRM_TITLE: 'Confirmar cambio de rol',
  ROLE_CHANGE_CONFIRM_MESSAGE: '¿Seguro que quieres cambiar el rol de',
  ROLE_CHANGE_CONFIRM_FROM: 'de',
  ROLE_CHANGE_CONFIRM_TO: 'a',
  SELF_BADGE: '(tú)',
}

export const ROLE_LABELS = {
  admin: 'Admin',
  institution: 'Institución',
  tutor: 'Tutor',
  pcd: 'Persona c/ disc.',
  user: 'Usuario',
}
