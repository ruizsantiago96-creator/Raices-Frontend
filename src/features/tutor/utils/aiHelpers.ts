/**
 * Utilidades para normalización y generación contextual de recomendaciones IA.
 */
import type { Dependiente } from '@/types/tutor'

export interface NormalizedAIRecommendations {
  steps: string[]
  reasoning: string
  isMock: boolean
  isFallback: boolean
}

/**
 * Normaliza las respuestas de recomendaciones de IA de diferentes estructuras posibles
 * (español, inglés, arrays, objetos anidados, etc.) y provee fallback inteligente si es necesario.
 */
export function normalizeAIRecommendations(
  data: unknown,
  dependent: Dependiente | null = null
): NormalizedAIRecommendations {
  let steps: unknown[] = []
  let reasoning = ''
  let isMock = false

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    // 1. Detección de lista de próximos pasos / sugerencias
    if (Array.isArray(record.proximosPasos)) {
      steps = record.proximosPasos
    } else if (Array.isArray(record.next_steps)) {
      steps = record.next_steps
    } else if (Array.isArray(record.nextSteps)) {
      steps = record.nextSteps
    } else if (Array.isArray(record.sugerencias)) {
      steps = record.sugerencias
    } else if (Array.isArray(record.recomendaciones)) {
      steps = record.recomendaciones
    } else if (Array.isArray(record.pasos)) {
      steps = record.pasos
    } else if (Array.isArray(record.items)) {
      steps = record.items
    } else if (Array.isArray(data)) {
      steps = data
    } else if (typeof record.respuesta === 'string') {
      // Si la IA devolvió un bloque de texto formateado con saltos de línea
      steps = record.respuesta
        .split('\n')
        .map((s: string) => s.replace(/^[-*•\d.)\]\s]+/, '').trim())
        .filter((s: string) => s.length > 2)
    } else if (typeof record.mensaje === 'string') {
      steps = record.mensaje
        .split('\n')
        .map((s: string) => s.replace(/^[-*•\d.)\]\s]+/, '').trim())
        .filter((s: string) => s.length > 2)
    }

    // 2. Extracción de razonamiento / justificación
    reasoning =
      (typeof record.razonamiento === 'string' ? record.razonamiento : '') ||
      (typeof record.reasoning === 'string' ? record.reasoning : '') ||
      (typeof record.explicacion === 'string' ? record.explicacion : '') ||
      (typeof record.descripcion === 'string' ? record.descripcion : '') ||
      (typeof record.justificacion === 'string' ? record.justificacion : '') ||
      ''

    // 3. Indicador de modo simulado / demo
    isMock = Boolean(record.simulado ?? record.mock ?? record.isMock ?? false)
  }

  // Filtrar y limpiar los textos de cada paso
  const cleanSteps = (steps || [])
    .map((item: unknown) => {
      if (typeof item === 'string') return item.trim()
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>
        return String(obj.titulo || obj.descripcion || obj.texto || obj.name || obj.paso || '')
      }
      return ''
    })
    .filter(Boolean)

  // Si no se obtuvieron pasos o la lista está vacía, y tenemos el dependiente, generar recomendaciones contextuales
  if (cleanSteps.length === 0 && dependent) {
    const contextual = generateContextualRecommendations(dependent)
    return {
      steps: contextual,
      reasoning: reasoning || `Sugerencias prácticas orientadas al perfil y necesidades de ${dependent.nombreCompleto || dependent.nombre || 'esta persona'}.`,
      isMock: true,
      isFallback: true,
    }
  }

  return {
    steps: cleanSteps,
    reasoning,
    isMock,
    isFallback: false,
  }
}

/**
 * Genera recomendaciones contextuales inteligentes basadas en discapacidad, etapa de vida y notas.
 */
export function generateContextualRecommendations(dep: Dependiente | null | undefined): string[] {
  if (!dep) return []

  const nombre = dep.nombreCompleto || dep.nombre || 'esta persona'
  const disabilities: string[] = Array.isArray(dep.tiposDiscapacidad)
    ? dep.tiposDiscapacidad
    : Array.isArray((dep as Record<string, unknown>).discapacidades)
      ? ((dep as Record<string, unknown>).discapacidades as string[])
      : []
  const stage = dep.etapaVida || ''
  const recs: string[] = []

  const disStr = disabilities.join(' ').toLowerCase()

  // 1. Recomendaciones basadas en discapacidad / condición
  if (disStr.includes('tea') || disStr.includes('autis') || disStr.includes('neurodiverg')) {
    recs.push(`Establecer rutinas estructuradas y apoyos visuales para anticipar cambios de actividad con ${nombre}.`)
    recs.push('Explorar instituciones y talleres con enfoque sensorial y de comunicación adaptativa en Raíces.')
    recs.push('Identificar y respetar espacios de regulación sensorial durante salidas o actividades sociales.')
  } else if (disStr.includes('motriz') || disStr.includes('físic') || disStr.includes('movilidad')) {
    recs.push('Verificar la accesibilidad arquitectónica y adaptaciones ergonómicas en espacios cotidianos.')
    recs.push('Vincularse con centros de rehabilitación física, terapia ocupacional o deporte adaptado.')
    recs.push('Evaluar herramientas de tecnología asistiva y movilidad que aumenten su autonomía personal.')
  } else if (disStr.includes('visual') || disStr.includes('ceguera') || disStr.includes('baja visión')) {
    recs.push('Configurar herramientas digitales accesibles (lectores de pantalla, contraste adecuado y audiolibros).')
    recs.push('Fomentar actividades guiadas de orientación, movilidad y reconocimiento del entorno.')
    recs.push('Conectar con organizaciones aliadas en Raíces que brindan materiales en Braille o macrotipo.')
  } else if (disStr.includes('auditiva') || disStr.includes('sord') || disStr.includes('hipoacusia')) {
    recs.push('Incorporar apoyos visuales continuos y promover el aprendizaje de Lengua de Señas si aplica.')
    recs.push('Explorar comunidades inclusivas y actividades culturales con accesibilidad y mediación comunicativa.')
  } else if (disStr.includes('intelectual') || disStr.includes('cognitiv') || disStr.includes('psicosocial')) {
    recs.push('Desglosar actividades complejas en metas cotidianas sencillas con refuerzo positivo constante.')
    recs.push('Fomentar la participación en talleres de habilidades sociales, arte o actividades vocacionales inclusivas.')
    recs.push('Fortalecer la red de apoyo compartida entre familiares, educadores y especialistas.')
  }

  // 2. Recomendaciones basadas en etapa de vida
  if (stage === 'primera_infancia' || stage === 'ninez') {
    if (recs.length < 3) recs.push(`Fomentar el juego interactivo y actividades de estimulación temprana adaptadas para ${nombre}.`)
    if (recs.length < 3) recs.push('Vincularse con centros educativos y de estimulación con modelo de inclusión activa.')
  } else if (stage === 'adolescencia' || stage === 'juventud') {
    if (recs.length < 3) recs.push(`Promover la toma de decisiones cotidianas y el desarrollo de autonomía en ${nombre}.`)
    if (recs.length < 3) recs.push('Explorar programas de formación vocacional, habilidades sociolaborales o talleres artísticos.')
  } else if (stage === 'adultez' || stage === 'adulto_mayor') {
    if (recs.length < 3) recs.push('Mantener redes de convivencia activa, bienestar emocional y controles integrales de salud.')
    if (recs.length < 3) recs.push('Consultar oportunidades de empleo accesible y programas comunitarios de participación.')
  }

  // 3. Fallbacks genéricos si no se alcanzaron al menos 3 sugerencias
  if (recs.length === 0) {
    recs.push(`Explorar las oportunidades e instituciones recomendadas en la plataforma para ${nombre}.`)
    recs.push('Definir objetivos de desarrollo y bienestar acordes a sus intereses y habilidades individuales.')
    recs.push('Mantener actualizado su perfil en Raíces para acceder a mejores opciones personalizadas.')
  } else if (recs.length < 3) {
    recs.push('Consultar el directorio de instituciones aliadas en Raíces para acceder a servicios especializados.')
  }

  return recs.slice(0, 4)
}
