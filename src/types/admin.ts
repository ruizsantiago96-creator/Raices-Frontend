/**
 * Tipos de dominio para el Módulo de Administración, Usuarios y Reseñas.
 * Define métricas de panel, logs de auditoría, gestión de roles, alertas y reportes.
 */

// ─── Roles de Usuario en el Panel de Administración ──────────────
export type AdminUserRole = 'admin' | 'pcd' | 'tutor' | 'institution' | 'empresa' | 'user' | string

// ─── Usuario en Panel de Administración ───────────────────────────
export interface UsuarioAdmin {
  id: string | number
  full_name: string
  email: string
  role: AdminUserRole
  is_active: boolean
  created_at?: string
  ciudad?: string
  estado?: string
  nombreCompleto?: string
  nombre?: string
  activo?: boolean
  fechaCreacion?: string
  createdAt?: string
}

export interface RawBackendUsuarioAdmin {
  id?: string | number
  _id?: string | number
  uid?: string | number
  email?: string
  nombreCompleto?: string
  nombre?: string
  full_name?: string
  rol?: AdminUserRole
  role?: AdminUserRole
  ciudad?: string
  estado?: string
  activo?: boolean
  is_active?: boolean
  fechaCreacion?: string
  created_at?: string
  createdAt?: string
}

export interface UpdateUserAdminPayload {
  id: string | number
  full_name?: string
  email?: string
  role?: string
  rol?: string
  is_active?: boolean
  activo?: boolean
  [key: string]: unknown
}

// ─── Reseña en Panel de Administración ───────────────────────────
export interface ReviewAdmin {
  id: string | number
  rating: number
  comment: string
  institution_name?: string
  user_name?: string
  created_at?: string
  calificacion?: number
  comentario?: string
  nombreInstitucion?: string
  institucionNombre?: string
  nombreUsuario?: string
  usuarioNombre?: string
  fechaCreacion?: string
}

export interface RawBackendReviewAdmin {
  id?: string | number
  _id?: string | number
  calificacion?: number
  rating?: number
  comentario?: string
  comment?: string
  nombreInstitucion?: string
  institucionNombre?: string
  institution_name?: string
  institucion?: {
    nombre?: string
  }
  nombreUsuario?: string
  usuarioNombre?: string
  user_name?: string
  usuario?: {
    nombre?: string
  }
  fechaCreacion?: string
  created_at?: string
  createdAt?: string
}

// ─── Alertas de Riesgo ───────────────────────────────────────────
export type AlertSeverity = 'alta' | 'media' | 'info' | string

export interface AdminAlert {
  id: string | number
  title: string
  message: string
  severity: AlertSeverity
  created_at: string
  tipo?: string
  resuelta?: boolean
  fechaCreacion?: string
  titulo?: string
  mensaje?: string
}

// ─── Verificación de Identidad / Documentos ──────────────────────
export type TipoDocumentoIdentidad = 'curp' | 'identificacion_oficial' | string
export type EstadoDocumentoIdentidad = 'pendiente' | 'aprobado' | 'rechazado' | string

export interface DocumentoIdentidadAdmin {
  id: string | number
  usuarioId: string | number
  nombreUsuario?: string
  usuarioNombre?: string
  emailUsuario?: string
  usuarioEmail?: string
  rolUsuario?: string
  tipo: TipoDocumentoIdentidad
  numeroCurp?: string
  urlArchivo?: string
  nombreArchivo?: string
  estado: EstadoDocumentoIdentidad
  fechaSubida?: string
  created_at?: string
  motivoRechazo?: string
  validadoPor?: string | number
  fechaValidacion?: string
  coincideNombre?: boolean
  similitudNombre?: number
}

export interface UsuarioVerificacionGroup {
  usuarioId: string | number
  nombreUsuario: string
  emailUsuario: string
  rolUsuario: string
  documentos: DocumentoIdentidadAdmin[]
}

export interface RechazarVerificacionPayload {
  id: string | number
  motivo?: string
  motivoRechazo?: string
}

/**
 * Filtros de GET /administracion/documentos-identidad/pendientes (según Swagger del backend).
 * ⚠️ El backend NO acepta `estado`: el endpoint devuelve únicamente documentos pendientes.
 * Enviar params no documentados (ej. `estado`) provoca un 500 en el backend.
 */
export interface VerificacionesFilters {
  pagina?: number
  limite?: number
  ordenarPor?: string
  direccion?: 'asc' | 'desc'
  buscar?: string
  [key: string]: unknown
}

// ─── Estadísticas y Métricas de Administración ───────────────────
export interface AdminStats {
  totalUsuarios?: number
  usuariosActivos?: number
  totalInstituciones?: number
  institucionesVerificadas?: number
  totalVacantes?: number
  totalPostulaciones?: number
  verificacionesPendientes?: number
  alertasPendientes?: number
  usuariosPorRol?: Record<string, number>
  institucionesPorCategoria?: Record<string, number>
  usuarios?: {
    total?: number
    activos?: number
    pcd?: number
    tutores?: number
    instituciones?: number
    empresas?: number
  }
  [key: string]: unknown
}

export interface ActiveVisitorsDetail {
  live: number
  historialMinutos: Array<{ time?: string; count?: number } | number>
  promedioDiario: number
  promedioSemanal: number
  promedioMensual: number
}

export interface RawActiveVisitors {
  personasActivas?: number
  enVivo?: number
  live?: number
  activos?: number
  active?: number
  historialMinutos?: Array<{ time?: string; count?: number } | number>
  history?: Array<{ time?: string; count?: number } | number>
  timeline?: Array<{ time?: string; count?: number } | number>
  promedioDiario?: number
  promedioSemanal?: number
  promedioMensual?: number
}

export interface NeedsIntelligenceData {
  categoriasMasBuscadas?: Array<{ categoria: string; total: number }>
  municipiosConMayorDemanda?: Array<{ municipio: string; estado: string; total: number }>
  coberturaPorDiscapacidad?: Record<string, number>
  [key: string]: unknown
}

// ─── Configuración de la Plataforma ──────────────────────────────
export interface AdminSettings {
  mantenimiento?: boolean
  registroAbierto?: boolean
  verificacionManualObligatoria?: boolean
  notificacionesSistema?: boolean
  limiteSubidaMb?: number
  [key: string]: unknown
}

// ─── Logs de Auditoría ───────────────────────────────────────────
export interface AuditoriaLog {
  id: string | number
  usuarioId?: string | number
  usuarioNombre?: string
  accion: string
  entidad?: string
  entidadId?: string | number
  detalles?: Record<string, unknown> | string
  ip?: string
  fechaCreacion?: string
  created_at?: string
}

export interface AuditoriaStats {
  totalEventos?: number
  eventosHoy?: number
  accionesFrecuentes?: Array<{ accion: string; total: number }>
  /** Alias del backend para el total de registros. */
  totalRegistros?: number
  total?: number
  /** Alias del backend para eventos de hoy. */
  accionesHoy?: number
  /**
   * ⚠️ El backend devuelve aquí un ranking `Array<{ usuario: string; cantidad: number }>`
   * (usuarios más activos), NO un número. No renderizar directamente.
   */
  usuariosActivos?: number | Array<{ usuario: string; cantidad: number }>
  [key: string]: unknown
}

/**
 * Filtros de GET /administracion/auditoria.
 * ⚠️ El backend espera `fechaDesde`/`fechaHasta` (no `desde`/`hasta`);
 * el hook normaliza los nombres heredados automáticamente.
 */
export interface AuditoriaFilters {
  usuarioId?: string | number
  accion?: string
  recurso?: string
  fechaDesde?: string
  fechaHasta?: string
  /** @deprecated usar fechaDesde — el hook lo mapea */
  desde?: string
  /** @deprecated usar fechaHasta — el hook lo mapea */
  hasta?: string
  pagina?: number
  limite?: number
  [key: string]: unknown
}
