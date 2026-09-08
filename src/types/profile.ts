import { UserRole } from './auth'

/**
 * Estados de validación de identidad del usuario
 */
export type DocumentoIdentidadEstado =
  | 'sin_documentos'
  | 'pendiente'
  | 'aprobado'
  | 'rechazado'

/**
 * Información del estado de validación de identidad (CURP / INE)
 */
export interface EstadoValidacionIdentidad {
  estado: DocumentoIdentidadEstado
  tieneCurp?: boolean
  tieneIdentificacion?: boolean
  numeroCurp?: string
  fechaSubida?: string
  fechaRevision?: string
  motivoRechazo?: string
  archivos?: {
    curp?: string
    identificacion?: string
  }
  [key: string]: unknown
}

/**
 * Payload para subir documentos de identidad
 */
export interface SubirDocumentoPayload {
  tipo: 'curp' | 'identificacion_oficial'
  file: File
  numeroCurp?: string
}

/**
 * Datos de perfilado del usuario
 */
export interface UserProfiling {
  goals?: string[]
  challenges?: string[]
  interests?: string[]
  age_stage?: string
  [key: string]: unknown
}

/**
 * Modelo completo del perfil del usuario (GET /usuarios/perfil)
 */
export interface UserProfile {
  id?: string | number
  email?: string
  full_name?: string
  nombreCompleto?: string
  firstName?: string
  lastName?: string
  role?: UserRole | string
  rol?: UserRole | string
  city?: string
  ciudad?: string
  state?: string
  estado?: string
  country?: string
  pais?: string
  phone?: string
  telefono?: string
  bio?: string
  avatar_url?: string | null
  is_verified?: boolean
  interests?: string[]
  goals?: string[]
  profiling?: UserProfiling
  features?: Record<string, boolean> | string[]
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

/**
 * Payload para actualizar el perfil del usuario (PUT /usuarios/perfil)
 */
export interface UpdateProfilePayload {
  nombreCompleto?: string
  full_name?: string
  city?: string
  state?: string
  phone?: string
  bio?: string
  interests?: string[]
  profiling?: UserProfiling
  [key: string]: unknown
}

/**
 * Payload para guardar escalas de vida (POST /usuarios/escalas-vida)
 */
export interface EscalasVidaPayload {
  nivelAutonomia?: number
  nivelIndependencia?: number
  tieneDiagnostico?: boolean
  temporalidadOrigen?: string
  preferenciaFormato?: string
  areasInteres?: string[]
  viabilidadEconomica?: string
  [key: string]: unknown
}

/**
 * Modelo de dependiente (flujo tutor)
 */
export interface Dependiente {
  id: string | number
  nombre: string
  fechaNacimiento?: string
  edad?: number
  parentesco?: string
  curp?: string
  diagnostico?: string
  notas?: string
  [key: string]: unknown
}
