/**
 * Tipos de dominio para el Módulo de Tutor, Dependientes y Asistencia de IA.
 */

// ─── Features / Permisos del Dependiente ──────────────────────────
export interface DependentFeatures {
  chat?: boolean
  postulaciones?: boolean
  rutas?: boolean
  foros?: boolean
  social?: boolean
  [key: string]: boolean | undefined
}

// ─── Entidad Dependiente / Persona Vinculada ─────────────────────
export interface Dependiente {
  id: string | number
  tutorId?: string | number
  nombreCompleto: string
  nombre?: string
  parentesco: string
  etapaVida?: string
  etapa_vida?: string
  tiposDiscapacidad: string[]
  necesidades?: string[]
  notas?: string
  fechaNacimiento?: string
  birth_date?: string
  rol?: string
  esCuentaVinculada?: boolean
  pcdUserId?: string | number
  pcdId?: string | number
  features?: DependentFeatures
  fechaCreacion?: string
  created_at?: string
  [key: string]: unknown
}

export interface RawBackendDependiente {
  id?: string | number
  _id?: string | number
  tutorId?: string | number
  nombreCompleto?: string
  nombre?: string
  parentesco?: string
  etapaVida?: string
  etapa_vida?: string
  necesidades?: string[]
  tiposDiscapacidad?: string[]
  notas?: string
  fechaNacimiento?: string
  birth_date?: string
  rol?: string
  esCuentaVinculada?: boolean
  pcdUserId?: string | number
  pcdId?: string | number
  features?: DependentFeatures
  fechaCreacion?: string
  created_at?: string
  [key: string]: unknown
}

// ─── Payloads de Creación y Edición ───────────────────────────────
export interface CrearDependientePayload {
  nombreCompleto: string
  parentesco: string
  etapaVida?: string
  necesidades?: string[]
  tiposDiscapacidad?: string[]
  birth_date?: string
  fechaNacimiento?: string
  notas?: string
  crearCuenta?: boolean
  email?: string
  password?: string
  [key: string]: unknown
}

export interface UpdateDependentPayload {
  id: string | number
  nombreCompleto?: string
  parentesco?: string
  etapaVida?: string
  necesidades?: string[]
  tiposDiscapacidad?: string[]
  birth_date?: string
  fechaNacimiento?: string
  notas?: string
  features?: DependentFeatures
  [key: string]: unknown
}

// ─── Mis Personas (Lista consolidada) ─────────────────────────────
export interface MisPersonasParams {
  pagina?: number
  limite?: number
  ordenarPor?: string
  direccion?: 'asc' | 'desc' | string
  buscar?: string
  [key: string]: unknown
}

export interface MisPersonasResponse {
  datos: Dependiente[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

// ─── Conteo de Dependientes ──────────────────────────────────────
export interface DependientesCountResponse {
  total: number
  limite: number | null
  restantes: number | null
}

// ─── Asistencia IA (Conversaciones y Recomendaciones) ────────────
export interface AIChatMessage {
  rol?: 'usuario' | 'asistente' | string
  role?: 'user' | 'assistant' | 'system' | string
  contenido?: string
  content?: string
}

export interface AIChatPayload {
  mensaje: string
  historial?: AIChatMessage[]
  dependienteId?: string | number
  [key: string]: unknown
}

export interface AIChatResponse {
  respuesta: string
  simulado?: boolean
  proximosPasos?: string[]
  razonamiento?: string
  [key: string]: unknown
}

export interface AINextStepsResponse {
  proximosPasos: string[]
  razonamiento?: string
  sugerenciasInstitucion?: Array<{ id?: string | number; nombre?: string; descripcion?: string }>
  simulado?: boolean
  [key: string]: unknown
}

export interface AIResumenResponse {
  resumenUnParrafo: string
  resumenTresParrafos?: {
    bienvenida?: string
    situacion?: string
    proyeccion?: string
    [key: string]: string | undefined
  }
  simulado?: boolean
  [key: string]: unknown
}
