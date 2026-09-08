/**
 * TIPOS Y CONTRATOS DE AUTENTICACIÓN Y SESIÓN (Fase 1 · Migración TS)
 * ====================================================================
 */

/** Roles reconocidos por el sistema */
export type AuthRole = 'pcd' | 'padre_tutor' | 'institucion' | 'empresa' | 'admin'

/** Roles en formato interno del frontend */
export type FrontendRole = 'pcd' | 'tutor' | 'institution' | 'empresa' | 'admin'

/** Unión de roles válidos para usuario */
export type UserRole = AuthRole | FrontendRole

/** Flags de funcionalidades / permisos del usuario */
export interface UserFeatures {
  [key: string]: boolean | string | number | undefined
}

/** Entidad de usuario en sesión (formato interno del frontend) */
export interface User {
  id: string
  email: string
  role: UserRole
  full_name: string
  city?: string
  state?: string
  avatar_url?: string | null
  is_active?: boolean
  is_verified?: boolean
  created_at?: string
  features?: UserFeatures
  destinatarioRegistro?: string | null
  curp?: string | null
  telefonoContacto?: string | null
  preferenciasAcompanamiento?: string | null
}

/** Objeto de usuario recibido directamente del backend (español) */
export interface BackendUser {
  id: string
  email: string
  rol: AuthRole | string
  nombreCompleto?: string
  ciudad?: string
  estado?: string
  urlAvatar?: string | null
  activo?: boolean
  verificado?: boolean
  fechaCreacion?: string
  features?: UserFeatures
  curp?: string | null
  telefonoContacto?: string | null
  destinatarioRegistro?: string | null
  preferenciasAcompanamiento?: string | null
}

/** Respuesta estándar de autenticación (login o registro) */
export interface AuthResponse {
  tokenAcceso?: string
  tokenRefresco?: string | null
  usuario?: BackendUser
  requiereInicioSesion?: boolean
  mensaje?: string
  uid?: string
}

/** Estado de sesión en el cliente */
export interface AuthSession {
  token: string | null
  refreshToken: string | null
  user: User | null
}

// ── Payloads de Registro ─────────────────────────────────────────────

export interface PcdRegisterPayload {
  nombreCompleto: string
  email: string
  password: string
  rol: 'pcd'
  curp?: string
  fechaNacimiento: string
  ciudad: string
  estado: string
  [key: string]: unknown
}

export interface TutorRegisterPayload {
  nombreCompleto: string
  email: string
  password: string
  rol: 'padre_tutor'
  curp?: string
  fechaNacimiento: string
  ciudad: string
  estado: string
  [key: string]: unknown
}

export interface InstitutionRegisterPayload {
  nombre?: string
  nombreCompleto?: string
  email: string
  password: string
  rol: 'institucion'
  ciudad: string
  estado: string
  categoria?: string
  tipoInstitucion?: string
  curp?: string
  descripcion?: string
  mision?: string
  nombreContacto?: string
  telefonoContacto?: string
  sitioWeb?: string
  serviciosOfrecidos?: string[]
  comunidadConectada?: string
  [key: string]: unknown
}

export interface EnterpriseRegisterPayload {
  nombre?: string
  nombreCompleto?: string
  email: string
  password: string
  rol: 'empresa'
  ciudad: string
  estado: string
  tipoEcosistema?: string
  descripcion?: string
  especialidades?: string
  nombreContacto?: string
  telefonoContacto?: string
  sitioWeb?: string
  serviciosOfrecidos?: string[]
  comunidadConectada?: string
  [key: string]: unknown
}

export type RegisterPayload =
  | PcdRegisterPayload
  | TutorRegisterPayload
  | InstitutionRegisterPayload
  | EnterpriseRegisterPayload

/** Resultado del proceso de creación de cuenta */
export interface CreateAccountResult {
  success: boolean
  requiresLogin: boolean
  message: string
  user?: User | null
  token?: string
  refreshToken?: string | null
  postStepsResult?: Array<{
    name: string
    success: boolean
    error?: string
    skipped?: boolean
  }> | null
}
