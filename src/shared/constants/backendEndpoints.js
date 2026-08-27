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
  CERRAR_SESION: {
    method: 'POST',
    path: '/autenticacion/cerrar-sesion',
    description: 'Eliminar cookies httpOnly (logout server-side). Llamar además de limpiar tokens del cliente.',
    response: null, // 204 No Content
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
    description: 'Subir documento de identidad (CURP o identificación oficial)',
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
    description: 'Estado de validación de identidad del usuario',
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
    description: 'Estado de completitud del onboarding — retorna campos faltantes y porcentaje',
    response: { porcentaje: 'number', camposFaltantes: 'string[]' },
  },
  GET_ESPECIALISTAS: {
    method: 'GET',
    path: '/usuarios/especialistas',
    description: 'Especialistas recomendados por matching (edad, discapacidad, ubicación)',
    response: { datos: 'Especialista[]', total: 'number' },
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
  GET_DETAIL: {
    method: 'GET',
    path: '/instituciones/:id/detalle',
    description: 'Detalle completo (admin o propietario) — incluye instituciones pendientes/inactivas',
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
    description: 'Retorna la información de la institución asociada al usuario autenticado',
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
      404: 'El usuario no tiene institución registrada',
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
    description: 'Eliminar mi institución (soft-delete)',
    response: null, // 204 No Content
  },
  VALIDATE_CSF_QR: {
    method: 'POST',
    path: '/instituciones/validar-csf-qr',
    description: 'Validar código QR de Constancia de Situación Fiscal (multipart: PDF o imagen)',
    body: 'FormData (archivo)',
    response: { valido: 'boolean', datos: 'object | null' },
  },
}

// ═══════════════════════════════════════════════════════════
// DESCUBRIMIENTO
// ═══════════════════════════════════════════════════════════
export const DISCOVERY_ENDPOINTS = {
  SEARCH: {
    method: 'GET',
    path: '/descubrimiento',
    params: { busqueda: 'string?', categoria: 'string?', categorias: 'string? (CSV: laboral,funcional)', ciudad: 'string?', estado: 'string?', tipoDiscapacidad: 'string?', pagina: 'number', limite: 'number' },
    response: { datos: 'Institucion[]', total: 'number', paginas: 'number' },
  },
}

// ═══════════════════════════════════════════════════════════
// INTERACCIONES Y RECOMENDACIONES
// ═══════════════════════════════════════════════════════════
export const INTERACTION_ENDPOINTS = {
  CREATE: {
    method: 'POST',
    path: '/usuarios/interacciones',
    description: 'Registrar una interacción del usuario con una institución',
    body: { institucionId: 'string', tipo: 'guardar | ver_detalle | click_card', categoria: 'string?' },
    response: { id: 'string', tipo: 'string', createdAt: 'string (ISO)' },
  },
  GET_PESOS: {
    method: 'GET',
    path: '/usuarios/interacciones/pesos',
    description: 'Acumulado de puntos de los últimos 30 días (guardar: 10, ver_detalle: 5, click_card: 2)',
    response: { totalPuntos: 'number', desglose: { guardar: 'number', ver_detalle: 'number', click_card: 'number' } },
  },
}

export const RECOMMENDATION_ENDPOINTS = {
  GET: {
    method: 'GET',
    path: '/usuarios/recomendaciones',
    description: 'Instituciones recomendadas (60% coincidencias de perfil + 40% histórico de comportamiento)',
    response: { datos: 'Institucion[]', total: 'number' },
  },
  GET_PESOS: {
    method: 'GET',
    path: '/usuarios/interacciones/pesos',
    description: 'Pesos de comportamiento por categoría (últimos 30 días)',
    response: { totalPuntos: 'number', desglose: { guardar: 'number', ver_detalle: 'number', click_card: 'number' } },
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
  // ── Foros institucionales (tipo Classroom) ──────────────
  CREATE_FORO: {
    method: 'POST',
    path: '/comunidad/foros',
    description: 'Crear foro institucional con pregunta detonante (solo institucion, admin)',
    body: { titulo: 'string', descripcion: 'string?', preguntaDetonante: 'string' },
    response: 'Foro',
  },
  GET_FOROS: {
    method: 'GET',
    path: '/comunidad/foros',
    description: 'Listar foros activos (público)',
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
    description: 'Responder pregunta detonante del foro',
    body: { contenido: 'string' },
    response: 'ForoRespuesta',
  },
  // ── Conectemos (galería pública) ──────────────────────
  GET_CONECTEMOS: {
    method: 'GET',
    path: '/comunidad/conectemos/publicaciones',
    description: 'Galería pública de creaciones de usuarios PCD (Conectemos)',
    params: { categoriaCreativa: 'string?', pagina: 'number?', limite: 'number?' },
    response: { datos: 'Publicacion[]', total: 'number' },
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
    description: 'Listar vacantes activas de instituciones activas con paginación',
    params: {
      pagina: 'number (default: 1)',
      limite: 'number (default: 20)',
      ordenarPor: 'string (default: fechaCreacion)',
      direccion: 'string (asc|desc, default: desc)',
      buscar: 'string? (búsqueda por texto en título, nombre, contenido)',
      ciudad: 'string? (filtrar por ciudad)',
      modalidad: 'string? (presencial|remoto|híbrido)',
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
        // Datos de la institución embebidos:
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
    description: 'Crear vacante (rol institución o admin)',
    body: {
      titulo: 'string (required)',
      descripcion: 'string?',
      requisitos: 'string?',
      modalidad: 'string? (presencial|remoto|híbrido)',
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
      // + campos de institución embebidos
    },
  },
  GET: {
    method: 'GET',
    path: '/empleo/:id',
    description: 'Detalle de vacante con información de institución',
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
    description: 'Actualizar vacante (debe pertenecer a la institución del usuario)',
    body: {
      titulo: 'string?',
      descripcion: 'string?',
      requisitos: 'string?',
      modalidad: 'string? (presencial|remoto|híbrido)',
      horario: 'string?',
      rangoSalario: 'string?',
      ciudad: 'string?',
      estado: 'string?',
      inclusivaDiscapacidad: 'boolean?',
      tiposDiscapacidad: 'string[]?',
      activa: 'boolean?',
    },
    response: 'Vacante (con datos de institución)',
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
    description: 'Postulaciones del usuario con paginación',
    params: {
      pagina: 'number (default: 1)',
      limite: 'number (default: 20)',
      ordenarPor: 'string (default: fechaCreacion)',
      direccion: 'string (asc|desc, default: desc)',
      buscar: 'string? (búsqueda por texto)',
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
  // ── Endpoints de postulaciones ──────────────────────
  GET_POSTULANTES_VACANTE: {
    method: 'GET',
    path: '/empleo/postulantes-vacante',
    description: 'Postulantes de una vacante específica (rol institucion o admin)',
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
    description: 'Obtener postulantes de mi institución. Filtrar por vacanteId para ver las de una vacante específica.',
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
  GET_RESUMEN: {
    method: 'POST',
    path: '/ia/resumen',
    description: 'Genera resumen narrativo IA (1 párrafo + 3 párrafos)',
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
    description: 'Subcategorías de grupos de comunidad',
    response: '{ id: string, label: string }[]',
  },
  GET_TONO_CONTEXTUAL: {
    method: 'GET',
    path: '/catalogos/tono-contextual',
    description: 'Tono contextual de la plataforma (para IA, notificaciones, etc.)',
    response: '{ id: string, label: string, description: string }[]',
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
  GET_DOCUMENTOS_PENDIENTES: {
    method: 'GET',
    path: '/administracion/documentos-identidad/pendientes',
    description: 'Lista de documentos de identidad pendientes de revisión',
    params: { estado: 'string?' },
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
  // ── Auditoría ──────────────────────
  GET_AUDITORIA: {
    method: 'GET',
    path: '/administracion/auditoria',
    description: 'Logs de auditoría (paginado, con filtros por usuarioId, accion, recurso, fechas)',
    params: { pagina: 'number?', limite: 'number?', usuarioId: 'string?', accion: 'string?', recurso: 'string?', fechaDesde: 'string?', fechaHasta: 'string?' },
    response: { datos: 'AuditoriaLog[]', total: 'number', pagina: 'number', limite: 'number', totalPaginas: 'number' },
  },
  GET_AUDITORIA_ESTADISTICAS: {
    method: 'GET',
    path: '/administracion/auditoria/estadisticas',
    description: 'Resumen de auditoría (contadores por acción, usuarios más activos, etc.)',
    response: 'AuditoriaEstadisticas',
  },
  // ── Verificación identidad institución ──────────────
  GET_INSTITUTION_VERIFICATION: {
    method: 'GET',
    path: '/administracion/instituciones/:id/verificacion-identidad',
    description: 'Estado de verificación de identidad de la institución (CURP + ID del representante legal)',
    response: { estado: 'string', tieneCurp: 'boolean', tieneIdentificacion: 'boolean', verificada: 'boolean' },
  },
}

// ═══════════════════════════════════════════════════════════
// MULTIMEDIA / STORAGE
// ═══════════════════════════════════════════════════════════
export const MULTIMEDIA_ENDPOINTS = {
  UPLOAD: {
    method: 'POST',
    path: '/multimedia',
    description: 'Subir imagen o video (max 10MB, multipart). Campo: archivo.',
    body: 'FormData (archivo)',
    response: { url: 'string' },
  },
}

// ═══════════════════════════════════════════════════════════
// RUTAS DE DESARROLLO
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// RESUMEN: TODOS LOS ENDPOINTS
// ═══════════════════════════════════════════════════════════
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
}

/**
 * Verifica si un endpoint está disponible (para usar en fallbacks).
 * @param {string} endpointKey - Clave del endpoint en ALL_ENDPOINTS
 * @returns {Object|null} - Objeto del endpoint o null si no existe
 */
export function getEndpointInfo(endpointKey) {
  return ALL_ENDPOINTS[endpointKey] ?? null
}
