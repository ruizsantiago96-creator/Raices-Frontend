/**
 * Inventario completo de endpoints del backend.
 * 
 * Este archivo documenta TODOS los endpoints que el frontend espera,
 * incluyendo método HTTP, ruta, y contrato de respuesta esperado.
 * 
 * Si un endpoint no está implementado, se debe usar BackendFallback.jsx
 * para mostrar un mensaje informativo al usuario.
 */

// ═══════════════════════════════════════════════════════════
// AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════
export const AUTH_ENDPOINTS = {
  LOGIN: {
    method: 'POST',
    path: '/autenticacion/inicio-sesion',
    body: { email: 'string', password: 'string' },
    response: { tokenAcceso: 'string', tokenRefresco: 'string', usuario: 'Usuario' },
  },
  REGISTER: {
    method: 'POST',
    path: '/autenticacion/registro',
    body: { email: 'string', password: 'string', nombreCompleto: 'string', rol: 'pcd|tutor|institution', ciudad: 'string', estado: 'string' },
    response: {
      // Para pcd/tutor: { tokenAcceso, tokenRefresco, usuario }
      // Para institution: { uid, email, rol, mensaje } (sin token — solo registro)
      tokenAcceso: 'string|undefined',
      tokenRefresco: 'string|undefined',
      usuario: 'Usuario|undefined',
      uid: 'string|undefined',
      mensaje: 'string|undefined',
    },
  },
  REFRESH_TOKEN: {
    method: 'POST',
    path: '/autenticacion/renovar-token',
    body: { tokenRefresco: 'string' },
    response: { tokenAcceso: 'string', tokenRefresco: 'string' },
  },
  GET_CURRENT_USER: {
    method: 'GET',
    path: '/autenticacion/yo',
    response: { id: 'string', email: 'string', nombreCompleto: 'string', rol: 'string', ciudad: 'string', estado: 'string', urlAvatar: 'string|null', verificado: 'boolean' },
  },
}

// ═══════════════════════════════════════════════════════════
// USUARIOS / PERFIL
// ═══════════════════════════════════════════════════════════
export const USER_ENDPOINTS = {
  GET_PROFILE: {
    method: 'GET',
    path: '/usuarios/perfil',
    response: 'UsuarioConPerfil',
  },
  UPDATE_PROFILE: {
    method: 'PUT',
    path: '/usuarios/perfil',
    body: { nombreCompleto: 'string', ciudad: 'string', estado: 'string', urlAvatar: 'string?', profesion: 'string?', bio: 'string?' },
    response: 'Usuario',
  },
  UPLOAD_AVATAR: {
    method: 'POST',
    path: '/usuarios/avatar',
    body: 'FormData (campo: avatar)',
    response: { mensaje: 'string', urlAvatar: 'string' },
  },
  DELETE_AVATAR: {
    method: 'DELETE',
    path: '/usuarios/avatar',
    response: { exito: 'boolean', mensaje: 'string' },
  },
  SAVE_PROFILING: {
    method: 'POST',
    path: '/usuarios/perfil-necesidades',
    body: 'PerfilNecesidades',
    response: 'PerfilNecesidades',
  },
}

// ═══════════════════════════════════════════════════════════
// DEPENDIENTES (TUTOR)
// ═══════════════════════════════════════════════════════════
export const DEPENDENT_ENDPOINTS = {
  LIST: {
    method: 'GET',
    path: '/usuarios/dependientes',
    response: 'Dependiente[]',
  },
  GET: {
    method: 'GET',
    path: '/usuarios/dependientes/:id',
    response: 'Dependiente',
  },
  CREATE: {
    method: 'POST',
    path: '/usuarios/dependientes',
    body: { nombreCompleto: 'string', parentesco: 'string', tiposDiscapacidad: 'string[]', rangoEdad: 'string?', etapaVida: 'string?', notas: 'string?' },
    response: {
      id: 'string',
      tutorId: 'string',
      nombreCompleto: 'string',
      parentesco: 'string',
      tiposDiscapacidad: 'string[]',
      rangoEdad: 'string',
      etapaVida: 'string',
      notas: 'string',
      rol: 'pcd',
      fechaCreacion: 'string',
    },
  },
  UPDATE: {
    method: 'PUT',
    path: '/usuarios/dependientes/:id',
    body: 'Partial<Dependiente>',
    response: 'Dependiente',
  },
  DELETE: {
    method: 'DELETE',
    path: '/usuarios/dependientes/:id',
    response: { exito: 'boolean' },
  },
  LINK_PCD: {
    method: 'POST',
    path: '/usuarios/vincular-pcd',
    body: { email: 'string' },
    response: 'Dependiente',
  },
  REGISTER_DEPENDENT: {
    method: 'POST',
    path: '/usuarios/dependientes/registro',
    body: { email: 'string', password: 'string', nombreCompleto: 'string', dependienteId: 'string?' },
    response: 'Dependiente',
  },
  GET_PERMISSIONS: {
    method: 'GET',
    path: '/usuarios/dependientes/:id/permisos',
    response: 'Permisos',
  },
  UPDATE_PERMISSIONS: {
    method: 'PATCH',
    path: '/usuarios/dependientes/:id/permisos',
    body: 'Permisos',
    response: 'Permisos',
  },
  UPDATE_FEATURES: {
    method: 'PUT',
    path: '/usuarios/dependientes/:id/features',
    body: 'Features',
    response: 'Features',
  },
  UPDATE_FEATURES_PCD_VINCULADO: {
    method: 'PUT',
    path: '/usuarios/pcd-vinculado/:pcdUserId/features',
    body: 'Features',
    response: 'Features',
  },
  UNLINK_PCD: {
    method: 'DELETE',
    path: '/usuarios/pcd-vinculado/:pcdUserId/desvincular',
    response: { exito: 'boolean' },
  },
}

// ═══════════════════════════════════════════════════════════
// INSTITUCIONES
// ═══════════════════════════════════════════════════════════
export const INSTITUTION_ENDPOINTS = {
  LIST: {
    method: 'GET',
    path: '/instituciones',
    params: { pagina: 'number', limite: 'number', busqueda: 'string?', categoria: 'string?', ciudad: 'string?', estado: 'string?' },
    response: { datos: 'Institucion[]', total: 'number', paginas: 'number' },
  },
  GET: {
    method: 'GET',
    path: '/instituciones/:id',
    response: 'Institucion',
  },
  CREATE: {
    method: 'POST',
    path: '/instituciones',
    body: 'InstitucionForm',
    response: 'Institucion',
  },
  UPDATE: {
    method: 'PUT',
    path: '/instituciones/:id',
    body: 'Partial<Institucion>',
    response: 'Institucion',
  },
  DELETE: {
    method: 'DELETE',
    path: '/instituciones/:id',
    response: { exito: 'boolean' },
  },
  GET_MY_INSTITUTION: {
    method: 'GET',
    path: '/instituciones/mi-institucion',
    response: 'Institucion',
  },
  UPDATE_MY_INSTITUTION: {
    method: 'PUT',
    path: '/instituciones/mi-institucion',
    body: 'Partial<Institucion>',
    response: 'Institucion',
  },
}

// ═══════════════════════════════════════════════════════════
// DESCUBRIMIENTO
// ═══════════════════════════════════════════════════════════
export const DISCOVERY_ENDPOINTS = {
  SEARCH: {
    method: 'GET',
    path: '/descubrimiento',
    params: { busqueda: 'string?', categoria: 'string?', ciudad: 'string?', estado: 'string?', tipoDiscapacidad: 'string?', pagina: 'number', limite: 'number' },
    response: { datos: 'Institucion[]', total: 'number', paginas: 'number' },
  },
}

// ═══════════════════════════════════════════════════════════
// RESEÑAS
// ═══════════════════════════════════════════════════════════
export const REVIEW_ENDPOINTS = {
  GET_BY_INSTITUTION: {
    method: 'GET',
    path: '/resenas/institucion/:institutionId',
    params: { pagina: 'number', limite: 'number' },
    response: { datos: 'Resena[]', total: 'number', paginas: 'number' },
  },
  GET_MY_REVIEWS: {
    method: 'GET',
    path: '/resenas/mias',
    response: 'Resena[]',
  },
  CREATE: {
    method: 'POST',
    path: '/resenas/institucion/:institutionId',
    body: { calificacion: 'number', comentario: 'string' },
    response: 'Resena',
  },
  UPDATE: {
    method: 'PUT',
    path: '/resenas/:reviewId',
    body: { calificacion: 'number', comentario: 'string' },
    response: 'Resena',
  },
  DELETE: {
    method: 'DELETE',
    path: '/resenas/:reviewId',
    response: { exito: 'boolean' },
  },
}

// ═══════════════════════════════════════════════════════════
// FAVORITOS
// ═══════════════════════════════════════════════════════════
export const FAVORITE_ENDPOINTS = {
  LIST: {
    method: 'GET',
    path: '/favoritos',
    response: 'Institucion[]',
  },
  GET_IDS: {
    method: 'GET',
    path: '/favoritos/ids',
    response: 'string[]',
  },
  TOGGLE: {
    method: 'POST',
    path: '/favoritos/:institutionId/alternar',
    response: { esFavorito: 'boolean' },
  },
}

// ═══════════════════════════════════════════════════════════
// COMUNIDAD
// ═══════════════════════════════════════════════════════════
export const COMMUNITY_ENDPOINTS = {
  GET_GROUPS: {
    method: 'GET',
    path: '/comunidad/grupos',
    response: 'Grupo[]',
  },
  CREATE_GROUP: {
    method: 'POST',
    path: '/comunidad/grupos',
    body: { nombre: 'string', descripcion: 'string', esPublico: 'boolean' },
    response: 'Grupo',
  },
  JOIN_GROUP: {
    method: 'POST',
    path: '/comunidad/grupos/:groupId/unirse',
    response: { exito: 'boolean' },
  },
  LEAVE_GROUP: {
    method: 'POST',
    path: '/comunidad/grupos/:groupId/salir',
    response: { exito: 'boolean' },
  },
  GET_POSTS: {
    method: 'GET',
    path: '/comunidad/publicaciones',
    params: { grupoId: 'string?', pagina: 'number?', limite: 'number?', buscar: 'string?' },
    response: {
      datos: [{
        id: 'string',
        titulo: 'string',
        contenido: 'string',
        autor: { id: 'string', nombre: 'string', avatar: 'string|null' },
        likesCount: 'number',
        likedByMe: 'boolean',
        fechaCreacion: 'string (ISO)',
      }],
      meta: { total: 'number', pagina: 'number', limite: 'number', totalPaginas: 'number' },
    },
  },
  CREATE_POST: {
    method: 'POST',
    path: '/comunidad/publicaciones',
    body: { contenido: 'string', grupoId: 'string?' },
    response: 'Publicacion',
  },
  UPDATE_POST: {
    method: 'PUT',
    path: '/comunidad/publicaciones/:postId',
    body: { contenido: 'string' },
    response: 'Publicacion',
  },
  DELETE_POST: {
    method: 'DELETE',
    path: '/comunidad/publicaciones/:postId',
    response: { exito: 'boolean' },
  },
  TOGGLE_LIKE: {
    method: 'POST',
    path: '/comunidad/publicaciones/:postId/me-gusta',
    response: { meGusta: 'boolean' },
  },
  GET_COMMENTS: {
    method: 'GET',
    path: '/comunidad/publicaciones/:postId/comentarios',
    response: 'Comentario[]',
  },
  CREATE_COMMENT: {
    method: 'POST',
    path: '/comunidad/publicaciones/:postId/comentarios',
    body: { contenido: 'string' },
    response: 'Comentario',
  },
  GET_STATS: {
    method: 'GET',
    path: '/comunidad/estadisticas',
    response: { totalMiembros: 'number', totalGrupos: 'number', totalPublicaciones: 'number' },
  },
  GET_MIEMBROS: {
    method: 'GET',
    path: '/comunidad/miembros',
    params: { limite: 'number?' },
    response: { miembros: 'UsuarioComunidad[]' },
  },
}

// ═══════════════════════════════════════════════════════════
// MENSAJES
// ═══════════════════════════════════════════════════════════
export const MESSAGE_ENDPOINTS = {
  GET_CONVERSATIONS: {
    method: 'GET',
    path: '/mensajes/conversaciones',
    response: [{
      socio: { id: 'string', email: 'string', rol: 'string', nombreCompleto: 'string', ciudad: 'string', estado: 'string', urlAvatar: 'string|null', activo: 'boolean', features: 'object' },
      ultimoMensaje: 'string',
      ultimoEn: 'string (ISO)',
      noLeidos: 'number',
    }],
  },
  GET_MESSAGES: {
    method: 'GET',
    path: '/mensajes/con/:partnerId',
    response: [{ id: 'string', emisorId: 'string', receptorId: 'string', contenido: 'string', fechaCreacion: 'string (ISO)', leido: 'boolean' }],
  },
  SEND_MESSAGE: {
    method: 'POST',
    path: '/mensajes/enviar/:institucionOwnerId',
    body: { contenido: 'string' },
    response: { id: 'string', emisorId: 'string', receptorId: 'string', contenido: 'string', fechaCreacion: 'string (ISO)' },
  },
  GET_UNREAD: {
    method: 'GET',
    path: '/mensajes/no-leidos',
    response: 'number (plain text, no JSON object)',
  },
}

// ═══════════════════════════════════════════════════════════
// EMPLEO
// ═══════════════════════════════════════════════════════════
export const JOB_ENDPOINTS = {
  LIST: {
    method: 'GET',
    path: '/empleo',
    params: { busqueda: 'string?', categoria: 'string?', ciudad: 'string?', pagina: 'number', limite: 'number' },
    response: { datos: 'Vacante[]', total: 'number', paginas: 'number' },
  },
  GET: {
    method: 'GET',
    path: '/empleo/:id',
    response: 'Vacante',
  },
  GET_MY_APPLICATIONS: {
    method: 'GET',
    path: '/empleo/mis-postulaciones',
    response: 'Postulacion[]',
  },
  GET_POSTULATED: {
    method: 'GET',
    path: '/empleo/postuladas',
    response: 'string[]',
  },
  APPLY: {
    method: 'POST',
    path: '/empleo/:jobId/postularse',
    body: { cartaPresentacion: 'string' },
    response: 'Postulacion',
  },
  CREATE: {
    method: 'POST',
    path: '/empleo',
    body: 'VacanteForm',
    response: 'Vacante',
  },
  UPDATE: {
    method: 'PUT',
    path: '/empleo/:id',
    body: 'Partial<Vacante>',
    response: 'Vacante',
  },
  DELETE: {
    method: 'DELETE',
    path: '/empleo/:id',
    response: { exito: 'boolean' },
  },
}

// ═══════════════════════════════════════════════════════════
// NOTIFICACIONES
// ═══════════════════════════════════════════════════════════
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: {
    method: 'GET',
    path: '/notificaciones',
    response: 'Notificacion[]',
  },
  MARK_READ: {
    method: 'PATCH',
    path: '/notificaciones/:id/leer',
    response: { exito: 'boolean' },
  },
  MARK_ALL_READ: {
    method: 'PATCH',
    path: '/notificaciones/leer-todas',
    response: { exito: 'boolean' },
  },
  SAVE_FCM_TOKEN: {
    method: 'POST',
    path: '/notificaciones/fcm-token',
    body: { token: 'string' },
    response: { exito: 'boolean' },
  },
  DELETE_FCM_TOKEN: {
    method: 'DELETE',
    path: '/notificaciones/fcm-token',
    body: { token: 'string' },
    response: { exito: 'boolean' },
  },
  STREAM: {
    method: 'GET',
    path: '/notificaciones/flujo',
    description: 'SSE — notificaciones en tiempo real (EventSource)',
  },
}

// ═══════════════════════════════════════════════════════════
// IA
// ═══════════════════════════════════════════════════════════
export const AI_ENDPOINTS = {
  CHAT: {
    method: 'POST',
    path: '/ia/conversacion',
    body: { mensaje: 'string', dependienteId: 'string?' },
    response: { respuesta: 'string' },
  },
  GET_RECOMMENDATIONS: {
    method: 'POST',
    path: '/ia/recomendaciones',
    body: { dependienteId: 'string?' },
    response: 'Recomendacion[]',
  },
}

// ═══════════════════════════════════════════════════════════
// CATÁLOGOS
// ═══════════════════════════════════════════════════════════
export const CATALOG_ENDPOINTS = {
  GET_ALL: {
    method: 'GET',
    path: '/catalogos',
    response: {
      parentescos: 'string[]',
      discapacidades: 'string[]',
      etapasVida: 'string[]',
      features: 'string[]',
      categorias: 'string[]',
    },
  },
  GET_PARENTESCOS: {
    method: 'GET',
    path: '/catalogos/parentescos',
    response: 'string[]',
  },
  GET_DISCAPACIDADES: {
    method: 'GET',
    path: '/catalogos/discapacidades',
    response: 'string[]',
  },
  GET_ETAPAS_VIDA: {
    method: 'GET',
    path: '/catalogos/etapas-vida',
    response: '{ id: string, label: string }[]',
  },
  GET_FEATURES: {
    method: 'GET',
    path: '/catalogos/features',
    response: '{ id: string, label: string, description: string }[]',
  },
  GET_CATEGORIAS: {
    method: 'GET',
    path: '/catalogos/categorias',
    response: '{ id: string, label: string, color: string }[]',
  },
}

// ═══════════════════════════════════════════════════════════
// ADMINISTRACIÓN
// ═══════════════════════════════════════════════════════════
export const ADMIN_ENDPOINTS = {
  GET_STATS: {
    method: 'GET',
    path: '/administracion/estadisticas',
    response: 'EstadisticasAdmin',
  },
  GET_INTELLIGENCE: {
    method: 'GET',
    path: '/administracion/inteligencia-necesidades',
    response: 'InteligenciaNecesidades',
  },
  LIST_INSTITUTIONS: {
    method: 'GET',
    path: '/administracion/instituciones',
    response: 'InstitucionAdmin[]',
  },
  GET_PENDING_INSTITUTIONS: {
    method: 'GET',
    path: '/administracion/instituciones/pendientes',
    response: 'InstitucionAdmin[]',
  },
  APPROVE_INSTITUTION: {
    method: 'POST',
    path: '/administracion/instituciones/:id/aprobar',
    response: { exito: 'boolean' },
  },
  DELETE_INSTITUTION: {
    method: 'DELETE',
    path: '/administracion/instituciones/:id',
    response: { exito: 'boolean' },
  },
  VERIFY_INSTITUTION: {
    method: 'PATCH',
    path: '/administracion/instituciones/:id/verificar',
    response: { exito: 'boolean' },
  },
  LIST_USERS: {
    method: 'GET',
    path: '/administracion/usuarios',
    response: 'UsuarioAdmin[]',
  },
  TOGGLE_USER_ACTIVE: {
    method: 'PATCH',
    path: '/administracion/usuarios/:id/activo',
    response: { exito: 'boolean' },
  },
  UPDATE_USER_ROLE: {
    method: 'PATCH',
    path: '/administracion/usuarios/:id/rol',
    body: { rol: 'string' },
    response: { exito: 'boolean' },
  },
  DELETE_USER: {
    method: 'DELETE',
    path: '/administracion/usuarios/:id',
    response: { exito: 'boolean' },
  },
  LIST_REVIEWS: {
    method: 'GET',
    path: '/administracion/resenas',
    response: 'ResenaAdmin[]',
  },
  DELETE_REVIEW: {
    method: 'DELETE',
    path: '/administracion/resenas/:id',
    response: { exito: 'boolean' },
  },
  GET_ALERTS: {
    method: 'GET',
    path: '/administracion/alertas',
    response: 'Alerta[]',
  },
  GET_SETTINGS: {
    method: 'GET',
    path: '/administracion/configuracion',
    response: 'Configuracion',
  },
  UPDATE_SETTINGS: {
    method: 'PUT',
    path: '/administracion/configuracion',
    body: 'Configuracion',
    response: 'Configuracion',
  },
  GET_ANALYTICS: {
    method: 'GET',
    path: '/administracion/analiticas',
    response: 'Analiticas',
  },
  GET_ACTIVE_VISITORS: {
    method: 'GET',
    path: '/administracion/visitantes-activos',
    response: {
      visitantesActivos: 'number',
      ultimaActualizacion: 'string (ISO)',
    },
  },
}

// ═══════════════════════════════════════════════════════════
// RESUMEN: TODOS LOS ENDPOINTS
// ═══════════════════════════════════════════════════════════
export const ALL_ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...USER_ENDPOINTS,
  ...DEPENDENT_ENDPOINTS,
  ...INSTITUTION_ENDPOINTS,
  ...DISCOVERY_ENDPOINTS,
  ...REVIEW_ENDPOINTS,
  ...FAVORITE_ENDPOINTS,
  ...COMMUNITY_ENDPOINTS,
  ...MESSAGE_ENDPOINTS,
  ...JOB_ENDPOINTS,
  ...NOTIFICATION_ENDPOINTS,
  ...AI_ENDPOINTS,
  ...CATALOG_ENDPOINTS,
  ...ADMIN_ENDPOINTS,
}

/**
 * Verifica si un endpoint está disponible (para usar en fallbacks).
 * @param {string} endpointKey - Clave del endpoint en ALL_ENDPOINTS
 * @returns {Object|null} - Objeto del endpoint o null si no existe
 */
export function getEndpointInfo(endpointKey) {
  return ALL_ENDPOINTS[endpointKey] ?? null
}
