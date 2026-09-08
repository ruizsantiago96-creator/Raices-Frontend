/**
 * Tipos de dominio para el Módulo de Rutas de Desarrollo y Escalas de Vida.
 */

// ─── Rutas de Desarrollo e Hitos ──────────────────────────────────
export interface PasoRuta {
  id: string | number
  rutaId?: string | number
  ruta_id?: string | number
  titulo: string
  descripcion?: string
  completado: boolean
  fechaCompletado?: string
  orden?: number
  [key: string]: unknown
}

export type RutaPrioridad = 'baja' | 'media' | 'alta' | string
export type RutaEstado = 'activa' | 'completada' | 'pausada' | 'cancelada' | string

export interface RutaDesarrollo {
  id: string | number
  usuarioId?: string | number
  nombre: string
  descripcion?: string
  metaFinal?: string
  areaInteres: string
  prioridad: RutaPrioridad
  estado: RutaEstado
  fechaLimite?: string
  porcentajeProgreso?: number
  totalPasos?: number
  pasosCompletados?: number
  pasos?: PasoRuta[]
  fechaCreacion?: string
  created_at?: string
  [key: string]: unknown
}

export interface RutasFilters {
  estado?: string
  areaInteres?: string
  [key: string]: unknown
}

export interface RutasSummary {
  totalRutas: number
  rutasActivas: number
  rutasCompletadas: number
  rutasPausadas?: number
  rutasCanceladas?: number
  progresoPromedio: number
  [key: string]: unknown
}

export interface CreateRutaPayload {
  nombre: string
  descripcion?: string
  metaFinal?: string
  areaInteres: string
  prioridad?: RutaPrioridad
  fechaLimite?: string
  [key: string]: unknown
}

export interface UpdateRutaPayload {
  nombre?: string
  descripcion?: string
  metaFinal?: string
  areaInteres?: string
  prioridad?: RutaPrioridad
  estado?: RutaEstado
  fechaLimite?: string
  [key: string]: unknown
}

export interface CreatePasoPayload {
  titulo: string
  descripcion?: string
  orden?: number
  [key: string]: unknown
}

// ─── Escalas de Vida ──────────────────────────────────────────────
export type EscalaVidaKey =
  | 'nivelAutonomia'
  | 'nivelIndependencia'
  | 'nivelComunicacion'
  | 'nivelComprension'
  | 'nivelEnergia'
  | 'nivelMovilidad'
  | 'nivelSocial'
  | 'nivelEmocional'

export interface EscalasVidaValues {
  nivelAutonomia: number
  nivelIndependencia: number
  nivelComunicacion: number
  nivelComprension: number
  nivelEnergia: number
  nivelMovilidad: number
  nivelSocial: number
  nivelEmocional: number
  tieneDiagnostico?: boolean
  temporalidadOrigen?: string
  preferenciaFormato?: string
  areasInteres?: string[]
  viabilidadEconomica?: string
  [key: string]: unknown
}

export interface EscalaVidaOption {
  val: number
  label: string
}

export interface EscalaVidaItem {
  key: EscalaVidaKey
  label: string
  desc: string
  icon: string
  options: EscalaVidaOption[]
}
