/**
 * Feed Preferences — Mapeo de intereses del registro → categorías del backend
 * y tracking de engagement del usuario en localStorage.
 *
 * interestToCategoryMap: conecta los ~50 intereses de INTEREST_SECTIONS
 * con las 4 categorías de instituciones del backend.
 */

export interface CategoryWeights extends Record<string, number> {
  funcional: number
  educativo: number
  laboral: number
  social: number
}

export interface EngagementEntry {
  id: string
  action: 'save' | 'view_detail' | 'click_card' | string
  ts: number
}

/* ═══════════════════════════════════════════════════════════
   INTEREST → CATEGORY MAP
   Basado en INTEREST_SECTIONS de RegistrationWizard.jsx
   ═══════════════════════════════════════════════════════════ */
const INTEREST_TO_CATEGORY: Record<string, keyof CategoryWeights> = {
  // DEPORTE / MOVIMIENTO → funcional (Salud y Terapia)
  'Actividad física general': 'funcional',
  'Deporte recreativo': 'funcional',
  'Deporte adaptado': 'funcional',
  'Competencia': 'funcional',
  'Rehabilitación funcional': 'funcional',
  'Movimiento / coordinación': 'funcional',
  'Actividades al aire libre': 'social',

  // BIENESTAR / ATENCIÓN ESPECIALIZADA → funcional
  'Terapias': 'funcional',
  'Salud mental / emocional': 'funcional',
  'Atención médica especializada': 'funcional',
  'Odontología especializada': 'funcional',
  'Rehabilitación': 'funcional',
  'Regulación sensorial': 'funcional',
  'Estética / cuidado personal especializado': 'funcional',

  // EMPLEO → laboral
  'Primer empleo': 'laboral',
  'Reintegración laboral': 'laboral',
  'Capacitación laboral': 'laboral',
  'Empleo adaptado': 'laboral',
  'Empleo profesional': 'laboral',
  'Trabajo flexible': 'laboral',

  // AUTOEMPLEO → laboral
  'Emprendimiento': 'laboral',
  'Negocio propio': 'laboral',
  'Venta de productos': 'laboral',
  'Servicios': 'laboral',
  'Marca personal': 'laboral',
  'Economía digital': 'laboral',

  // ARTE / CULTURA / MÚSICA → social
  'Música': 'social',
  'Danza': 'social',
  'Pintura / dibujo': 'educativo',
  'Teatro': 'social',
  'Literatura': 'educativo',
  'Manualidades': 'educativo',
  'Cultura / eventos': 'social',

  // INDEPENDENCIA → funcional
  'Vida cotidiana': 'funcional',
  'Movilidad': 'funcional',
  'Comunicación': 'funcional',
  'Finanzas personales': 'educativo',
  'Organización diaria': 'educativo',
  'Vida independiente': 'funcional',

  // VIDA SOCIAL → social
  'Amistades': 'social',
  'Eventos': 'social',
  'Relaciones': 'social',
  'Actividades grupales': 'social',
  'Socialización guiada': 'social',
  'Citas / vínculos': 'social',
  'Espacios recreativos': 'social',

  // EXPLORAR POSIBILIDADES → social
  'Descubrir intereses': 'social',
  'Nuevas experiencias': 'social',
  'Inspiración': 'social',
  'Orientación': 'educativo',
  'Comunidad': 'social',
  'Futuro': 'educativo',
}

/* ═══════════════════════════════════════════════════════════
   Resolve user interests → category weights
   ═══════════════════════════════════════════════════════════ */
export function resolveCategoryWeights(interests: (string | unknown)[]): CategoryWeights {
  const weights: CategoryWeights = { funcional: 0, educativo: 0, laboral: 0, social: 0 }
  for (const item of interests) {
    if (typeof item === 'string') {
      const cat = INTEREST_TO_CATEGORY[item]
      if (cat && weights[cat] !== undefined) {
        weights[cat] += 1
      }
    }
  }
  return weights
}

/* ═══════════════════════════════════════════════════════════
   ENGAGEMENT TRACKING — localStorage
   ═══════════════════════════════════════════════════════════ */
const ENGAGEMENT_KEY = 'raices_engagement'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 días de historial

function loadEngagement(): Record<string, EngagementEntry[]> {
  try {
    const raw = localStorage.getItem(ENGAGEMENT_KEY)
    return raw ? (JSON.parse(raw) as Record<string, EngagementEntry[]>) : {}
  } catch {
    return {}
  }
}

function saveEngagement(data: Record<string, EngagementEntry[]>): void {
  localStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(data))
}

function pruneOldEntries(data: Record<string, EngagementEntry[]>): Record<string, EngagementEntry[]> {
  const now = Date.now()
  const pruned: Record<string, EngagementEntry[]> = {}
  for (const [key, entries] of Object.entries(data)) {
    const fresh = entries.filter(e => now - e.ts < MAX_AGE_MS)
    if (fresh.length > 0) pruned[key] = fresh
  }
  return pruned
}

/**
 * Registrar una interacción del usuario con una institución.
 * @param institutionId
 * @param action — 'save' | 'view_detail' | 'click_card'
 * @param category — categoría de la institución
 */
export function trackEngagement(institutionId: string, action: string, category: string): void {
  if (!institutionId || !category) return
  const data = loadEngagement()
  if (!data[category]) data[category] = []
  data[category].push({ id: institutionId, action, ts: Date.now() })
  saveEngagement(pruneOldEntries(data))
}

/**
 * Obtener pesos de engagement por categoría.
 * Cada acción tiene un peso: save=10, view_detail=5, click_card=2
 */
export function getEngagementWeights(): CategoryWeights {
  const ACTION_WEIGHTS: Record<string, number> = { save: 10, view_detail: 5, click_card: 2 }
  const data = pruneOldEntries(loadEngagement())
  const weights: CategoryWeights = { funcional: 0, educativo: 0, laboral: 0, social: 0 }

  for (const [cat, entries] of Object.entries(data)) {
    const categoryKey = cat as keyof CategoryWeights
    if (weights[categoryKey] === undefined) continue
    for (const entry of entries) {
      weights[categoryKey] += ACTION_WEIGHTS[entry.action] ?? 1
    }
  }
  return weights
}

/**
 * Obtener el ID de las instituciones guardadas (para boost local).
 * Retorna Set<string> de IDs que el usuario guardó.
 */
export function getSavedInstitutionIds(): Set<string> {
  const data = loadEngagement()
  const ids = new Set<string>()
  for (const entries of Object.values(data)) {
    for (const entry of entries) {
      if (entry.action === 'save') ids.add(entry.id)
    }
  }
  return ids
}

/**
 * Limpiar todo el historial de engagement.
 */
export function clearEngagement(): void {
  localStorage.removeItem(ENGAGEMENT_KEY)
}
