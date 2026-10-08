import type { Institution } from '../../../types/institutions'
import { useMiInstitucion } from '@features/institutions'

/** Catálogos de categorías y políticas de inclusión para onboarding de empresa. */

/**
 * Categorías-empresa. Los `value` son EXACTAMENTE el enum que valida
 * `UpdateInstitucionDto.categoria` en el backend (`@IsIn`), por lo que no
 * pueden cambiarse sin cambiar el DTO.
 */
export const CATEGORIAS_EMPRESA = [
  { value: 'laboral', label: 'Empleo y bolsa de trabajo', desc: 'Contratación, capacitación y colocación laboral inclusiva.' },
  { value: 'educativo', label: 'Educación y capacitación', desc: 'Formación, educación inclusiva y capacitación técnica.' },
  { value: 'social', label: 'Atención social y comunidad', desc: 'Apoyo social, rehabilitación y acompañamiento comunitario.' },
  { value: 'funcional', label: 'Servicios e inclusión funcional', desc: 'Servicios accesibles, infraestructura adaptada y atención directa.' },
] as const

export type CategoriaEmpresa = (typeof CATEGORIAS_EMPRESA)[number]['value']

/** Políticas/adaptaciones de inclusión que la empresa declara aplicar. */
export const POLITICAS_INCLUSION = [
  { id: 'accesibilidad_infraestructura', label: 'Infraestructura accesible', desc: 'Rampas, baños adaptados, señalética y rutas peatonales sin barreras.' },
  { id: 'flexibilidad_laboral', label: 'Flexibilidad laboral', desc: 'Jornadas flexibles, trabajo remoto o híbrido y horarios adaptados.' },
  { id: 'ajuste_razonable', label: 'Ajustes razonables en el puesto', desc: 'Adaptación de funciones, herramientas y ritmo de trabajo.' },
  { id: 'capacitacion_inclusiva', label: 'Capacitación en inclusión', desc: 'Personal capacitado en atención y acompañamiento de personas con discapacidad.' },
  { id: 'proceso_seleccion_inclusivo', label: 'Proceso de selección inclusivo', desc: 'Entrevistas accesibles y evaluación sin discriminación por discapacidad.' },
  { id: 'acompañamiento_laboral', label: 'Acompañamiento laboral', desc: 'Tutoría, mentoría y seguimiento durante la adaptación al puesto.' },
  { id: 'empresa_sostenible', label: 'Empresa social y sostenible', desc: 'Políticas internas de bienestar, diversidad e inclusión.' },
] as const

/* ═══════════════════════════════════════════════════════════════════
   Utilidades de lectura del estado actual
   ═══════════════════════════════════════════════════════════════════ */

const ETIQUETA_CAMPO: Record<string, string> = {
  laboral: 'Empleo y bolsa de trabajo',
  educativo: 'Educación y capacitación',
  social: 'Atención social y comunidad',
  funcional: 'Servicios e inclusión funcional',
}

/** Lee la categoría aceptando el alias en español que devuelve el backend. */
export function leerCategoria(inst: Institution | null | undefined): string {
  const raw = inst?.category ?? inst?.categoria
  return typeof raw === 'string' ? raw : ''
}

/** Normaliza `servicios` (string[] u objetos) a etiquetas de texto. */
export function leerServicios(inst: Institution | null | undefined): string[] {
  const raw = inst?.servicios
  if (!Array.isArray(raw)) return []
  return raw
    .map((s) => (typeof s === 'string' ? s : (s?.nombre ?? s?.name ?? '')))
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
}

function esCategoriaValida(valor: string): valor is CategoriaEmpresa {
  return CATEGORIAS_EMPRESA.some(c => c.value === valor)
}

/**
 * Determina qué falta para que el onboarding de la empresa esté completo.
 *
 * Nota de diseño: la CSF no tiene endpoint de persistencia (el único endpoint
 * actual, `POST /instituciones/validar-csf-qr`, solo lee el QR y no guarda el
 * archivo), así que la señal de completitud se apoya únicamente en estado de
 * servidor: `categoria` + políticas de inclusión. La CSF se exige al presentar
 * el alta, pero no vuelve a bloquear el modal después.
 */
export function getCamposOnboardingFaltantes(
  institucion: Institution | null | undefined,
): string[] {
  const faltan: string[] = []
  if (!esCategoriaValida(leerCategoria(institucion))) faltan.push('categoria')
  if (leerServicios(institucion).length === 0) faltan.push('politicasInclusión')
  return faltan
}

export function useEmpresaOnboardingPendiente(): { pendiente: boolean; cargando: boolean } {
  const { data: institucion, isLoading } = useMiInstitucion()
  return {
    pendiente: getCamposOnboardingFaltantes(institucion).length > 0,
    cargando: isLoading,
  }
}
