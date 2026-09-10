/**
 * Inventario completo de endpoints del backend.
 * 
 * Este archivo documenta TODOS los endpoints que el frontend espera,
 * incluyendo mÃ©todo HTTP, ruta, y contrato de respuesta esperado.
 * 
 * Si un endpoint no estÃ¡ implementado, se debe usar BackendFallback.jsx
 * para mostrar un mensaje informativo al usuario.
 */

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AUTENTICACIÃ“N
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
      // Con token: { tokenAcceso, tokenRefresco, usuario } â†’ login automÃ¡tico
      // Sin token: { usuario, requiereInicioSesion: true } â†’ la cuenta se creÃ³,
      // el usuario debe iniciar sesiÃ³n por separado
      // Para institution/empresa: { uid, email, rol, mensaje } (sin token â€” solo registro)
      tokenAcceso: 'string|undefined',
      tokenRefresco: 'string|undefined',
      usuario: 'Usuario|undefined',
      requiereInicioSesion: 'boolean|undefined',
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
  CERRAR_SESION: {
    method: 'POST',
    path: '/autenticacion/cerrar-sesion',
    description: 'Eliminar cookies httpOnly (logout server-side). Llamar ademÃ¡s de limpiar tokens del cliente.',
    response: null, // 204 No Content
  },
  CERRAR_SESION_GLOBAL: {
    method: 'POST',
    path: '/autenticacion/cerrar-sesion-global',
    description: '[FUTURO] Revoca todos los refresh tokens del usuario usando revokeRefreshTokens. CerrarÃ¡ sesiÃ³n en todos los dispositivos.',
    response: null, // 204 No Content
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// USUARIOS / PERFIL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
  SAVE_ESCALAS_VIDA: {
    method: 'POST',
    path: '/usuarios/escalas-vida',
    description: 'Guardar escalas de vida y metadatos del usuario',
    body: {
      nivelAutonomia: 'number (1-4)',
      nivelIndependencia: 'number (1-4)',
      nivelComunicacion: 'number (1-4)',
      nivelComprension: 'number (1-4)',
      nivelEnergia: 'number (1-4)',
      nivelMovilidad: 'number (1-4)',
      nivelSocial: 'number (1-4)',
      nivelEmocional: 'number (1-4)',
      tieneDiagnostico: 'boolean',
      temporalidadOrigen: 'string?',
      preferenciaFormato: 'string?',
      areasInteres: 'string[]?',
      viabilidadEconomica: 'string?',
    },
    response: {
      escalasVida: 'object',
      tieneDiagnostico: 'boolean',
      requiereEvaluacion: 'boolean',
    },
  },
  UPLOAD_DOCUMENTO_IDENTIDAD: {
    method: 'POST',
    path: '/usuarios/documento-identidad',
    description: 'Subir documento de identidad (CURP o identificaciÃ³n oficial)',
    body: 'FormData (tipo, numeroCurp?, documento)',
    response: {
      tipo: 'string',
      urlDocumento: 'string',
      estado: 'string',
      fechaSubida: 'string',
    },
  },
  GET_ESTADO_VALIDACION: {
    method: 'GET',
    path: '/usuarios/estado-validacion-identidad',
    description: 'Estado de validaciÃ³n de identidad del usuario',
    response: {
      estado: 'string',
      tieneCurp: 'boolean',
      tieneIdentificacion: 'boolean',
      motivoRechazo: 'string|null',
    },
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
  GET_PROFILE_PCD: {
    method: 'GET',
    path: '/usuarios/perfil-pcd/:pcdUserId',
    description: 'Ver perfil de PCD (diferenciado por rol: padre_tutor, tutor, institucion, admin)',
    response: 'UsuarioConPerfil',
  },
  GET_ONBOARDING: {
    method: 'GET',
    path: '/usuarios/onboarding',
    description: 'Estado de completitud del onboarding â€” retorna campos faltantes y porcentaje',
    response: { porcentaje: 'number', camposFaltantes: 'string[]' },
  },
  GET_ESPECIALISTAS: {
    method: 'GET',
    path: '/usuarios/especialistas',
    description: 'Especialistas recomendados por matching (edad, discapacidad, ubicaciÃ³n)',
    response: { datos: 'Especialista[]', total: 'number' },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DEPENDIENTES (TUTOR)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const DEPENDENT_ENDPOINTS = {
  LIST: {
    method: 'GET',
    path: '/usuarios/dependientes',
    response: 'Dependiente[]',
  },
  COUNT: {
    method: 'GET',
    path: '/usuarios/dependientes/count',
    response: { total: 'number', limite: 'number', restantes: 'number' },
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
  MIS_PERSONAS: {
    method: 'GET',
    path: '/usuarios/mis-personas',
    params: { pagina: 'number', limite: 'number', ordenarPor: 'string', direccion: 'string', buscar: 'string?' },
    response: {
      datos: [{ id: 'string', nombre: 'string', esCuentaVinculada: 'boolean', features: 'object', fotoUrl: 'string|null', pcdUserId: 'string?', fechaCreacion: 'string' }],
      total: 'number',
      pagina: 'number',
      limite: 'number',
      totalPaginas: 'number',
    },
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
  PATCH_FEATURES: {
    method: 'PATCH',
    path: '/usuarios/dependientes/:dependienteId/features',
    body: 'Features (parcial)',
    response: { id: 'string', features: 'Features' },
  },
  PATCH_FEATURES_PCD_VINCULADO: {
    method: 'PATCH',
    path: '/usuarios/vincular-pcd/:pcdId/features',
    body: 'Features (parcial)',
    response: { id: 'string', features: 'Features' },
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
    response: { desvinculado: 'boolean', pcdUserId: 'string', tutorId: 'string' },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// INSTITUCIONES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
  GET_DETAIL: {
    method: 'GET',
    path: '/instituciones/:id/detalle',
    description: 'Detalle completo (admin o propietario) â€” incluye instituciones pendientes/inactivas',
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
    description: 'Retorna la informaciÃ³n de la instituciÃ³n asociada al usuario autenticado',
    params: null,
    response: {
      id: 'string',
      nombre: 'string',
      descripcion: 'string',
      categoria: 'string (funcional|educativo|laboral|social)',
      subcategoria: 'string',
      direccion: 'string',
      ciudad: 'string',
      estado: 'string',
      lat: 'number',
      lng: 'number',
      telefono: 'number',
      whatsapp: 'number',
      email: 'string',
      sitioWeb: 'string',
      urlLogo: 'string (URL)',
      urlPortada: 'string (URL)',
      tiposDiscapacidad: 'string[]',
      edadMinima: 'number',
      edadMaxima: 'number',
      horarioAtencion: 'string',
      tipoPlan: 'string (gratuito|basico|premium)',
      servicios: 'string[]',
      fotos: 'string[] (URLs)',
      calificacionPromedio: 'number',
      cantidadCalificaciones: 'number',
      activa: 'boolean',
      verificada: 'boolean',
      creadoPor: 'string (UID)',
      fechaCreacion: 'string (ISO)',
      fechaActualizacion: 'string (ISO)',
      fechaEliminacion: 'string (ISO) | null',
    },
    errors: {
      401: 'No autenticado',
      404: 'El usuario no tiene instituciÃ³n registrada',
    },
  },
  UPDATE_MY_INSTITUTION: {
    method: 'PUT',
    path: '/instituciones/mi-institucion',
    body: 'Partial<Institucion>',
    response: 'Institucion',
  },
  DELETE_MY_INSTITUTION: {
    method: 'DELETE',
    path: '/instituciones/mi-institucion',
    description: 'Eliminar mi instituciÃ³n (soft-delete)',
    response: null, // 204 No Content
  },
  VALIDATE_CSF_QR: {
    method: 'POST',
    path: '/instituciones/validar-csf-qr',
    description: 'Validar cÃ³digo QR de Constancia de SituaciÃ³n Fiscal (multipart: PDF o imagen)',
    body: 'FormData (archivo)',
    response: { valido: 'boolean', datos: 'object | null' },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DESCUBRIMIENTO
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const DISCOVERY_ENDPOINTS = {
  SEARCH: {
    method: 'GET',
    path: '/descubrimiento',
    params: { busqueda: 'string?', categoria: 'string?', categorias: 'string? (CSV: laboral,funcional)', ciudad: 'string?', estado: 'string?', tipoDiscapacidad: 'string?', pagina: 'number', limite: 'number' },
    response: { datos: 'Institucion[]', total: 'number', paginas: 'number' },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// INTERACCIONES Y RECOMENDACIONES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const INTERACTION_ENDPOINTS = {
  CREATE: {
    method: 'POST',
    path: '/usuarios/interacciones',
    description: 'Registrar una interacciÃ³n del usuario con una instituciÃ³n',
    body: { institucionId: 'string', tipo: 'guardar | ver_detalle | click_card', categoria: 'string?' },
    response: { id: 'string', tipo: 'string', createdAt: 'string (ISO)' },
  },
  GET_PESOS: {
    method: 'GET',
    path: '/usuarios/interacciones/pesos',
    description: 'Acumulado de puntos de los Ãºltimos 30 dÃ­as (guardar: 10, ver_detalle: 5, click_card: 2)',
    response: { totalPuntos: 'number', desglose: { guardar: 'number', ver_detalle: 'number', click_card: 'number' } },
  },
}

export const RECOMMENDATION_ENDPOINTS = {
  GET: {
    method: 'GET',
    path: '/usuarios/recomendaciones',
    description: 'Instituciones recomendadas (60% coincidencias de perfil + 40% histÃ³rico de comportamiento)',
    response: { datos: 'Institucion[]', total: 'number' },
  },
  GET_PESOS: {
    method: 'GET',
    path: '/usuarios/interacciones/pesos',
    description: 'Pesos de comportamiento por categorÃ­a (Ãºltimos 30 dÃ­as)',
    response: { totalPuntos: 'number', desglose: { guardar: 'number', ver_detalle: 'number', click_card: 'number' } },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// RESEÃ‘AS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// FAVORITOS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COMUNIDAD
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
  // â”€â”€ Foros institucionales (tipo Classroom) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  CREATE_FORO: {
    method: 'POST',
    path: '/comunidad/foros',
    description: 'Crear foro institucional tipo Classroom con preguntas detonantes (solo institucion, admin)',
    body: { titulo: 'string', descripcion: 'string?', preguntasDetonantes: 'string[]', exclusivoPadres: 'boolean' },
    response: 'Foro',
  },
  GET_FOROS: {
    method: 'GET',
    path: '/comunidad/foros',
    description: 'Listar foros activos (pÃºblico)',
    response: { datos: 'Foro[]', total: 'number' },
  },
  GET_FORO_DETAIL: {
    method: 'GET',
    path: '/comunidad/foros/:id',
    description: 'Detalle de foro con respuestas',
    response: 'ForoConRespuestas',
  },
  CREATE_FORO_RESPUESTA: {
    method: 'POST',
    path: '/comunidad/foros/:id/respuestas',
    description: 'Responder pregunta detonante del foro (403 si el foro es exclusivo para padres/tutores)',
    body: { preguntaIndex: 'number', contenido: 'string' },
    response: 'ForoRespuesta',
  },
  // â”€â”€ Conectemos (galerÃ­a pÃºblica) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  GET_CONECTEMOS: {
    method: 'GET',
    path: '/comunidad/conectemos/publicaciones',
    description: 'GalerÃ­a pÃºblica de creaciones de usuarios PCD (Conectemos)',
    params: { categoriaCreativa: 'string?', pagina: 'number?', limite: 'number?' },
    response: { datos: 'Publicacion[]', total: 'number' },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MENSAJES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// EMPLEO
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const JOB_ENDPOINTS = {
  LIST: {
    method: 'GET',
    path: '/empleo',
    description: 'Listar vacantes activas de instituciones activas con paginaciÃ³n',
    params: {
      pagina: 'number (default: 1)',
      limite: 'number (default: 20)',
      ordenarPor: 'string (default: fechaCreacion)',
      direccion: 'string (asc|desc, default: desc)',
      buscar: 'string? (bÃºsqueda por texto en tÃ­tulo, nombre, contenido)',
      ciudad: 'string? (filtrar por ciudad)',
      modalidad: 'string? (presencial|remoto|hÃ­brido)',
    },
    response: {
      datos: [{
        id: 'string',
        institucionId: 'string',
        titulo: 'string',
        descripcion: 'string',
        requisitos: 'string',
        modalidad: 'string',
        horario: 'string',
        rangoSalario: 'string',
        ciudad: 'string',
        estado: 'string',
        inclusivaDiscapacidad: 'boolean',
        tiposDiscapacidad: 'string[]',
        activa: 'boolean',
        fechaCreacion: 'string (ISO)',
        // Datos de la instituciÃ³n embebidos:
        nombreInstitucion: 'string',
        ciudadInstitucion: 'string',
        descripcionInstitucion: 'string',
        telefonoInstitucion: 'number',
        emailInstitucion: 'string',
        sitioWebInstitucion: 'string',
        institucionVerificada: 'boolean',
        institucionOwnerId: 'string',
      }],
      total: 'number',
      pagina: 'number',
      limite: 'number',
      totalPaginas: 'number',
    },
  },
  CREATE: {
    method: 'POST',
    path: '/empleo',
    description: 'Crear vacante (rol instituciÃ³n o admin)',
    body: {
      titulo: 'string (required)',
      descripcion: 'string?',
      requisitos: 'string?',
      modalidad: 'string? (presencial|remoto|hÃ­brido)',
      horario: 'string?',
      rangoSalario: 'string?',
      ciudad: 'string?',
      estado: 'string?',
      inclusivaDiscapacidad: 'boolean?',
      tiposDiscapacidad: 'string[]?',
      institucionId: 'string? (requerido para admin)',
    },
    response: {
      id: 'string',
      institucionId: 'string',
      titulo: 'string',
      activa: 'boolean',
      fechaCreacion: 'string (ISO)',
      // + campos de instituciÃ³n embebidos
    },
  },
  GET: {
    method: 'GET',
    path: '/empleo/:id',
    description: 'Detalle de vacante con informaciÃ³n de instituciÃ³n',
    response: {
      id: 'string',
      institucionId: 'string',
      titulo: 'string',
      descripcion: 'string',
      requisitos: 'string',
      modalidad: 'string',
      horario: 'string',
      rangoSalario: 'string',
      ciudad: 'string',
      estado: 'string',
      inclusivaDiscapacidad: 'boolean',
      tiposDiscapacidad: 'string[]',
      activa: 'boolean',
      fechaCreacion: 'string (ISO)',
      nombreInstitucion: 'string',
      ciudadInstitucion: 'string',
      descripcionInstitucion: 'string',
      telefonoInstitucion: 'number',
      emailInstitucion: 'string',
      sitioWebInstitucion: 'string',
      institucionVerificada: 'boolean',
      institucionOwnerId: 'string',
    },
  },
  UPDATE: {
    method: 'PUT',
    path: '/empleo/:id',
    description: 'Actualizar vacante (debe pertenecer a la instituciÃ³n del usuario)',
    body: {
      titulo: 'string?',
      descripcion: 'string?',
      requisitos: 'string?',
      modalidad: 'string? (presencial|remoto|hÃ­brido)',
      horario: 'string?',
      rangoSalario: 'string?',
      ciudad: 'string?',
      estado: 'string?',
      inclusivaDiscapacidad: 'boolean?',
      tiposDiscapacidad: 'string[]?',
      activa: 'boolean?',
    },
    response: 'Vacante (con datos de instituciÃ³n)',
  },
  DELETE: {
    method: 'DELETE',
    path: '/empleo/:id',
    description: 'Desactivar vacante (204 No Content)',
    response: null,
  },
  GET_POSTULATED: {
    method: 'GET',
    path: '/empleo/postuladas',
    description: 'Retorna IDs de vacantes postuladas por el usuario',
    response: 'string[]',
  },
  GET_MY_APPLICATIONS: {
    method: 'GET',
    path: '/empleo/mis-postulaciones',
    description: 'Postulaciones del usuario con paginaciÃ³n',
    params: {
      pagina: 'number (default: 1)',
      limite: 'number (default: 20)',
      ordenarPor: 'string (default: fechaCreacion)',
      direccion: 'string (asc|desc, default: desc)',
      buscar: 'string? (bÃºsqueda por texto)',
    },
    response: {
      datos: [{
        id: 'string',
        vacanteId: 'string',
        usuarioId: 'string',
        cartaPresentacion: 'string',
        estado: 'string',
        fechaCreacion: 'string (ISO)',
        titulo: 'string',
        modalidad: 'string',
        nombreInstitucion: 'string',
        institucionId: 'string',
        institucionOwnerId: 'string',
      }],
      total: 'number',
      pagina: 'number',
      limite: 'number',
      totalPaginas: 'number',
    },
  },
  APPLY: {
    method: 'POST',
    path: '/empleo/:id/postularse',
    description: 'Postularse a vacante (una vez por usuario)',
    body: { cartaPresentacion: 'string?' },
    response: { id: 'string', estado: 'string (pendiente)' },
  },
  // â”€â”€ Endpoints de postulaciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  GET_POSTULANTES_VACANTE: {
    method: 'GET',
    path: '/empleo/postulantes-vacante',
    description: 'Postulantes de una vacante especÃ­fica (rol institucion o admin)',
    params: { vacanteId: 'string (requerido)' },
    response: {
      datos: [{
        id: 'string',
        usuarioId: 'string',
        nombreUsuario: 'string',
        emailUsuario: 'string',
        cartaPresentacion: 'string',
        estado: 'string',
        fechaCreacion: 'string (ISO)',
      }],
    },
  },
  GET_POSTULACIONES: {
    method: 'GET',
    path: '/empleo/postulantes-institucion',
    description: 'Obtener postulantes de mi instituciÃ³n. Filtrar por vacanteId para ver las de una vacante especÃ­fica.',
    params: { vacanteId: 'string? (opcional, filtrar por vacante)' },
    response: {
      datos: [{
        id: 'string',
        usuarioId: 'string',
        nombreUsuario: 'string',
        emailUsuario: 'string',
        vacanteId: 'string',
        tituloVacante: 'string',
        cartaPresentacion: 'string',
        estado: 'string',
        fechaCreacion: 'string (ISO)',
      }],
    },
  },
  UPDATE_POSTULACION_ESTADO: {
    method: 'PATCH',
    path: '/empleo/postulaciones/:id/estado',
    description: 'Actualizar estado de postulante (aceptada|rechazada)',
    body: { estado: 'aceptada | rechazada' },
    response: { id: 'string', estado: 'string' },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// NOTIFICACIONES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
    description: 'SSE â€” notificaciones en tiempo real (EventSource)',
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// IA
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
  GET_RESUMEN: {
    method: 'POST',
    path: '/ia/resumen',
    description: 'Genera resumen narrativo IA (1 pÃ¡rrafo + 3 pÃ¡rrafos)',
    body: null, // usa el usuario autenticado
    response: {
      resumenUnParrafo: 'string',
      resumenTresParrafos: {
        quienEres: 'string',
        contexto: 'string',
        intereses: 'string',
      },
      simulado: 'boolean',
    },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CATÃLOGOS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const CATALOG_ENDPOINTS = {
  GET_ALL: {
    method: 'GET',
    path: '/catalogos',
    response: {
      parentescos: 'string[]',
      discapacidades: 'string[]',
      etapasVida: 'string[]',
      temporalidadOrigen: '{ id: string, label: string }[]',
      preferenciaFormato: '{ id: string, label: string, description: string }[]',
      areasInteres: '{ id: string, label: string, subcategorias?: object[] }[]',
      viabilidadEconomica: '{ id: string, label: string, description: string }[]',
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
  GET_TEMPORALIDAD_ORIGEN: {
    method: 'GET',
    path: '/catalogos/temporalidad-origen',
    response: '{ id: string, label: string }[]',
  },
  GET_PREFERENCIA_FORMATO: {
    method: 'GET',
    path: '/catalogos/preferencia-formato',
    response: '{ id: string, label: string, description: string }[]',
  },
  GET_AREAS_INTERES: {
    method: 'GET',
    path: '/catalogos/areas-interes',
    response: '{ id: string, label: string, subcategorias?: object[] }[]',
  },
  GET_VIABILIDAD_ECONOMICA: {
    method: 'GET',
    path: '/catalogos/viabilidad-economica',
    response: '{ id: string, label: string, description: string }[]',
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
  GET_SUBCATEGORIAS_COMUNIDAD: {
    method: 'GET',
    path: '/catalogos/subcategorias-comunidad',
    description: 'SubcategorÃ­as de grupos de comunidad',
    response: '{ id: string, label: string }[]',
  },
  GET_TONO_CONTEXTUAL: {
    method: 'GET',
    path: '/catalogos/tono-contextual',
    description: 'Tono contextual de la plataforma (para IA, notificaciones, etc.)',
    response: '{ id: string, label: string, description: string }[]',
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ADMINISTRACIÃ“N
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const ADMIN_ENDPOINTS = {
  GET_STATS: {
    method: 'GET',
    path: '/administracion/estadisticas',
    response: 'EstadisticasAdmin',
  },
  GET_DOCUMENTOS_PENDIENTES: {
    method: 'GET',
    path: '/administracion/documentos-identidad/pendientes',
    description: 'Lista paginada de documentos de identidad pendientes de revisión. SOLO devuelve pendientes.',
    // ⚠️ Contrato real (Swagger): NO existe el param `estado`. Enviar params
    // no documentados provoca 500 en el backend.
    params: {
      pagina: 'number?',     // default 1
      limite: 'number?',     // default 20
      ordenarPor: 'string?', // default fechaCreacion
      direccion: 'asc|desc?', // default desc
      buscar: 'string?',
    },
    response: {
      datos: [{
        id: 'string',
        tipo: 'string',
        urlDocumento: 'string',
        numeroCurp: 'string|null',
        estado: 'string',
        fechaSubida: 'string',
        usuarioId: 'string',
        nombreUsuario: 'string',
        emailUsuario: 'string',
      }],
      total: 'number',
    },
  },
  APROBAR_DOCUMENTO: {
    method: 'POST',
    path: '/administracion/documentos-identidad/:id/aprobar',
    response: null, // 204 No Content
  },
  RECHAZAR_DOCUMENTO: {
    method: 'POST',
    path: '/administracion/documentos-identidad/:id/rechazar',
    body: { motivo: 'string' },
    response: null, // 204 No Content
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
  // â”€â”€ AuditorÃ­a â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  GET_AUDITORIA: {
    method: 'GET',
    path: '/administracion/auditoria',
    description: 'Logs de auditorÃ­a (paginado, con filtros por usuarioId, accion, recurso, fechas)',
    params: { pagina: 'number?', limite: 'number?', usuarioId: 'string?', accion: 'string?', recurso: 'string?', fechaDesde: 'string?', fechaHasta: 'string?' },
    response: { datos: 'AuditoriaLog[]', total: 'number', pagina: 'number', limite: 'number', totalPaginas: 'number' },
  },
  GET_AUDITORIA_ESTADISTICAS: {
    method: 'GET',
    path: '/administracion/auditoria/estadisticas',
    description: 'Resumen de auditorÃ­a (contadores por acciÃ³n, usuarios mÃ¡s activos, etc.)',
    response: 'AuditoriaEstadisticas',
  },
  // â”€â”€ VerificaciÃ³n identidad instituciÃ³n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  GET_INSTITUTION_VERIFICATION: {
    method: 'GET',
    path: '/administracion/instituciones/:id/verificacion-identidad',
    description: 'Estado de verificaciÃ³n de identidad de la instituciÃ³n (CURP + ID del representante legal)',
    response: { estado: 'string', tieneCurp: 'boolean', tieneIdentificacion: 'boolean', verificada: 'boolean' },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MULTIMEDIA / STORAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const MULTIMEDIA_ENDPOINTS = {
  UPLOAD: {
    method: 'POST',
    path: '/multimedia',
    description: 'Subir imagen o video (max 10MB, multipart). Campo: archivo.',
    body: 'FormData (archivo)',
    response: { url: 'string' },
  },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// RUTAS DE DESARROLLO
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const RUTAS_ENDPOINTS = {
  LIST: {
    method: 'GET',
    path: '/rutas-desarrollo',
    params: { estado: 'string?', areaInteres: 'string?' },
    response: [{
      id: 'string',
      usuarioId: 'string',
      areaInteres: 'string',
      nombre: 'string',
      descripcion: 'string',
      metaFinal: 'string',
      estado: 'string',
      prioridad: 'string',
      totalPasos: 'number',
      pasosCompletados: 'number',
      porcentajeProgreso: 'number',
      fechaLimite: 'string|null',
      fechaCreacion: 'string',
    }],
  },
  SUMMARY: {
    method: 'GET',
    path: '/rutas-desarrollo/resumen',
    response: {
      totalRutas: 'number',
      rutasActivas: 'number',
      rutasCompletadas: 'number',
      rutasPausadas: 'number',
      progresoPromedio: 'number',
    },
  },
  GET: {
    method: 'GET',
    path: '/rutas-desarrollo/:id',
    response: '{ /* campos de ruta */ pasos: Paso[] }',
  },
  CREATE: {
    method: 'POST',
    path: '/rutas-desarrollo',
    body: { areaInteres: 'string', nombre: 'string', descripcion: 'string?', metaFinal: 'string?', prioridad: 'string?', fechaLimite: 'string?' },
  },
  UPDATE: {
    method: 'PUT',
    path: '/rutas-desarrollo/:id',
    body: 'Partial<Ruta>',
  },
  DELETE: {
    method: 'DELETE',
    path: '/rutas-desarrollo/:id',
    response: null,
  },
  ADD_PASO: {
    method: 'POST',
    path: '/rutas-desarrollo/:id/pasos',
    body: { titulo: 'string', descripcion: 'string?', orden: 'number?' },
  },
  COMPLETAR_PASO: {
    method: 'PATCH',
    path: '/rutas-desarrollo/:rutaId/pasos/:pasoId/completar',
  },
  DESCOMPLETAR_PASO: {
    method: 'PATCH',
    path: '/rutas-desarrollo/:rutaId/pasos/:pasoId/descompletar',
  },
}
// ——— USUARIOS / SEGURIDAD (futuros) ———
export const USER_SECURITY_ENDPOINTS = {
  DELETE_OWN_ACCOUNT: {
    method: 'DELETE',
    path: '/usuarios/cuenta',
    description: '[FUTURO] Elimina la cuenta del usuario autenticado y todos sus datos en cascada.',
    response: null, // 204 No Content
  },
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// RESUMEN: TODOS LOS ENDPOINTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const ALL_ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...USER_ENDPOINTS,
  ...DEPENDENT_ENDPOINTS,
  ...INSTITUTION_ENDPOINTS,
  ...DISCOVERY_ENDPOINTS,
  ...INTERACTION_ENDPOINTS,
  ...RECOMMENDATION_ENDPOINTS,
  ...REVIEW_ENDPOINTS,
  ...FAVORITE_ENDPOINTS,
  ...COMMUNITY_ENDPOINTS,
  ...MESSAGE_ENDPOINTS,
  ...JOB_ENDPOINTS,
  ...NOTIFICATION_ENDPOINTS,
  ...AI_ENDPOINTS,
  ...CATALOG_ENDPOINTS,
  ...ADMIN_ENDPOINTS,
  ...MULTIMEDIA_ENDPOINTS,
  ...RUTAS_ENDPOINTS,
  ...USER_SECURITY_ENDPOINTS,
}

export interface EndpointInfo {
  method: string
  path: string
  [key: string]: unknown
}

/**
 * Verifica si un endpoint está disponible (para usar en fallbacks).
 * @param {string} endpointKey - Clave del endpoint en ALL_ENDPOINTS
 * @returns {EndpointInfo|null} - Objeto del endpoint o null si no existe
 */
export function getEndpointInfo(endpointKey: string): EndpointInfo | null {
  return ((ALL_ENDPOINTS as Record<string, unknown>)[endpointKey] as EndpointInfo) ?? null
}

