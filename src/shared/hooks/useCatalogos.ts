import { useQuery } from '@tanstack/react-query'
import api from '@shared/lib/api'

export interface DiscapacidadOption {
  value: string
  label: string
}

export interface EtapaVidaOption {
  id: string
  label: string
}

export interface FeatureOption {
  id: string
  label: string
  description?: string
}

export interface CategoriaOption {
  id: string
  value: string
  label: string
  color: string
}

export interface CatalogOption {
  id: string
  label: string
  description?: string
  color?: string
  value?: string
}

export interface CatalogosData {
  [key: string]: unknown
  parentescos: string[]
  tiposDiscapacidad: DiscapacidadOption[]
  etapasVida: EtapaVidaOption[]
  features: FeatureOption[]
  categoriasInstitucion: CategoriaOption[]

  // Nuevos catálogos del backend v1.0-v1.5
  temporalidadOrigen: CatalogOption[]
  preferenciaFormato: CatalogOption[]
  areasInteres: CatalogOption[]
  viabilidadEconomica: CatalogOption[]

  necesidades: unknown[]
  metas: unknown[]
  etapasCrecimiento: EtapaVidaOption[]
  modalidadesEmpleo: string[]
}

export interface UseCatalogosResult {
  data: CatalogosData
  isLoading: boolean
  isError: boolean
  error: Error | null
}

// ═══════════════════════════════════════════════════════════
// FALLBACKS LOCALES — cuando el backend no responde
// ═══════════════════════════════════════════════════════════
const FALLBACK_PARENTESCOS: string[] = [
  'Hijo/a', 'Hermano/a', 'Nieto/a', 'Sobrino/a',
  'Cónyuge', 'Tutor legal', 'Otro familiar',
]

const FALLBACK_DISCAPACIDADES: DiscapacidadOption[] = [
  { value: 'motriz', label: 'Motriz' },
  { value: 'visual', label: 'Visual' },
  { value: 'auditiva', label: 'Auditiva' },
  { value: 'intelectual', label: 'Intelectual' },
  { value: 'psicosocial', label: 'Psicosocial' },
  { value: 'tea', label: 'TEA / Autismo' },
  { value: 'down', label: 'Síndrome de Down' },
  { value: 'lenguaje', label: 'Lenguaje' },
  { value: 'multiple', label: 'Múltiple' },
  { value: 'otra', label: 'Otra' },
]

const FALLBACK_ETAPAS_VIDA: EtapaVidaOption[] = [
  { id: 'infancia', label: 'Infancia (0-12)' },
  { id: 'adolescencia', label: 'Adolescencia (13-17)' },
  { id: 'adultoJoven', label: 'Adulto joven (18-29)' },
  { id: 'adulto', label: 'Adulto (30-59)' },
  { id: 'mayor', label: 'Adulto mayor (60+)' },
]

const FALLBACK_FEATURES: FeatureOption[] = [
  { id: 'instituciones', label: 'Instituciones', description: 'Explorar y buscar instituciones' },
  { id: 'empleo', label: 'Empleo', description: 'Ver y postularse a vacantes laborales' },
  { id: 'comunidad', label: 'Comunidad', description: 'Publicar y comentar en la comunidad' },
  { id: 'mensajes', label: 'Mensajes', description: 'Enviar y recibir mensajes' },
  { id: 'favoritos', label: 'Favoritos', description: 'Guardar instituciones favoritas' },
  { id: 'asistenteIa', label: 'Asistente IA', description: 'Usar el asistente de inteligencia artificial' },
  { id: 'notificaciones', label: 'Notificaciones', description: 'Recibir notificaciones' },
]

const FALLBACK_CATEGORIAS: CategoriaOption[] = [
  { id: 'funcional', value: 'funcional', label: 'Funcional', color: '#01ADFF' },
  { id: 'educativo', value: 'educativo', label: 'Educativo', color: '#8B6BAE' },
  { id: 'laboral', value: 'laboral', label: 'Laboral', color: '#D4944C' },
  { id: 'social', value: 'social', label: 'Social', color: '#4BA3A3' },
]

const FALLBACK_TEMPORALIDAD: CatalogOption[] = [
  { id: 'nacimiento', label: 'Desde nacimiento' },
  { id: 'infancia', label: 'Infancia' },
  { id: 'adolescencia', label: 'Adolescencia' },
  { id: 'vida_adulta', label: 'Vida adulta' },
  { id: 'progresiva', label: 'Progresiva' },
  { id: 'en_evaluacion', label: 'En evaluación' },
]

const FALLBACK_FORMATO: CatalogOption[] = [
  { id: 'texto', label: 'Texto', description: 'Artículos, guías y documentos' },
  { id: 'imagenes', label: 'Imágenes', description: 'Infografías y fotos' },
  { id: 'audio', label: 'Audio', description: 'Podcasts y audiolibros' },
  { id: 'video', label: 'Video', description: 'Tutoriales y videos' },
  { id: 'presencial', label: 'Presencial', description: 'Actividades en persona' },
]

const FALLBACK_VIABILIDAD: CatalogOption[] = [
  { id: 'gratuita_becas', label: 'Gratuita o con becas' },
  { id: 'bajo_costo', label: 'Bajo costo' },
  { id: 'moderada', label: 'Costo moderado' },
  { id: 'sin_restricciones', label: 'Sin restricciones' },
]

const FALLBACK_AREAS: CatalogOption[] = [
  { id: 'salud', label: 'Salud y Terapia' },
  { id: 'educacion', label: 'Educación' },
  { id: 'empleo', label: 'Empleo' },
  { id: 'comunidad', label: 'Comunidad y Recreación' },
]

/**
 * Normaliza los strings del backend a objetos {value, label}
 * para que los componentes que esperan objetos funcionen correctamente.
 */
function normalizeDiscapacidades(strings: unknown): DiscapacidadOption[] {
  if (!Array.isArray(strings)) return FALLBACK_DISCAPACIDADES
  return strings.map(s => typeof s === 'string' ? { value: s, label: s } : (s as DiscapacidadOption))
}

/**
 * Normaliza categorías del backend: mapea `id` → `value` para compatibilidad
 * con componentes que esperan {value, label}.
 */
function normalizeCategorias(cats: unknown): CategoriaOption[] {
  if (!Array.isArray(cats)) return FALLBACK_CATEGORIAS
  return cats.map(c => {
    if (typeof c === 'string') {
      return { id: c, value: c, label: c, color: '#01ADFF' }
    }
    const item = c as { id?: string; value?: string; label?: string; color?: string }
    const key = item.id ?? item.value ?? ''
    return {
      id: key,
      value: key,
      label: item.label ?? key,
      color: item.color ?? '#01ADFF',
    }
  })
}

function normalizeCatalogOptions(items: unknown, fallback: CatalogOption[]): CatalogOption[] {
  if (!Array.isArray(items)) return fallback
  return items.map(item => {
    if (typeof item === 'string') {
      return { id: item, label: item }
    }
    const obj = item as { id?: string; label?: string; description?: string; color?: string; value?: string }
    const id = obj.id ?? obj.value ?? ''
    return {
      id,
      label: obj.label ?? id,
      description: obj.description,
      color: obj.color,
      value: obj.value ?? id,
    }
  })
}

interface ConsolidatedData {
  parentescos: string[] | null
  discapacidades: DiscapacidadOption[] | null
  etapasVida: EtapaVidaOption[] | null
  features: FeatureOption[] | null
  categorias: CategoriaOption[] | null
  temporalidadOrigen: CatalogOption[] | null
  preferenciaFormato: CatalogOption[] | null
  areasInteres: CatalogOption[] | null
  viabilidadEconomica: CatalogOption[] | null
}

/**
 * Hook: consulta todos los catálogos del backend via endpoint consolidado.
 *
 * Devuelve un objeto con todas las listas de opciones que el frontend necesita
 * para formularios, filtros, etc. Los catálogos se cachean por 24 horas ya que
 * son datos que cambian muy raramente.
 *
 * Endpoint consumido:
 *   GET /catalogos → { parentescos, discapacidades, etapasVida, features, categorias }
 *
 * Fallback: Si el endpoint consolidado falla, intenta los endpoints individuales.
 */
export function useCatalogos(): UseCatalogosResult {
  // ── Endpoint consolidado (nuevo backend) ─────────────
  const consolidatedQ = useQuery<ConsolidatedData | null>({
    queryKey: ['catalogos'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos')
        // El backend consolidado devuelve arrays simples de strings.
        // Normalizamos cada uno al formato que los componentes esperan.
        const parentescos = Array.isArray(data?.parentescos) ? (data.parentescos as string[]) : null
        const discapacidades = Array.isArray(data?.discapacidades)
          ? normalizeDiscapacidades(data.discapacidades)
          : null
        const etapasVida = Array.isArray(data?.etapasVida)
          ? (data.etapasVida as Array<string | EtapaVidaOption>).map(e => typeof e === 'string' ? { id: e, label: e } : e)
          : null
        const features = Array.isArray(data?.features) ? (data.features as FeatureOption[]) : null
        const categorias = Array.isArray(data?.categorias)
          ? normalizeCategorias(data.categorias)
          : null
        // Nuevos catálogos del v1.0-v1.5 del backend
        const temporalidadOrigen = normalizeCatalogOptions(data?.temporalidadOrigen, FALLBACK_TEMPORALIDAD)
        const preferenciaFormato = normalizeCatalogOptions(data?.preferenciaFormato, FALLBACK_FORMATO)
        const areasInteres = normalizeCatalogOptions(data?.areasInteres, FALLBACK_AREAS)
        const viabilidadEconomica = normalizeCatalogOptions(data?.viabilidadEconomica, FALLBACK_VIABILIDAD)
        return {
          parentescos, discapacidades, etapasVida, features, categorias,
          temporalidadOrigen, preferenciaFormato, areasInteres, viabilidadEconomica,
        }
      } catch {
        return null
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  })

  // ── Fallback: endpoints individuales (si el consolidado falla) ──
  const parentescosQ = useQuery<string[]>({
    queryKey: ['catalogos', 'parentescos'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos/parentescos')
        return Array.isArray(data) ? (data as string[]) : FALLBACK_PARENTESCOS
      } catch {
        return FALLBACK_PARENTESCOS
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !consolidatedQ.data?.parentescos,
  })

  const discapacidadesQ = useQuery<DiscapacidadOption[]>({
    queryKey: ['catalogos', 'discapacidades'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos/discapacidades')
        return normalizeDiscapacidades(data)
      } catch {
        return FALLBACK_DISCAPACIDADES
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !consolidatedQ.data?.discapacidades,
  })

  const etapasVidaQ = useQuery<EtapaVidaOption[]>({
    queryKey: ['catalogos', 'etapas-vida'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos/etapas-vida')
        return Array.isArray(data) ? (data as EtapaVidaOption[]) : FALLBACK_ETAPAS_VIDA
      } catch {
        return FALLBACK_ETAPAS_VIDA
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !consolidatedQ.data?.etapasVida,
  })

  const featuresQ = useQuery<FeatureOption[]>({
    queryKey: ['catalogos', 'features'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos/features')
        return Array.isArray(data) ? (data as FeatureOption[]) : FALLBACK_FEATURES
      } catch {
        return FALLBACK_FEATURES
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !consolidatedQ.data?.features,
  })

  const categoriasQ = useQuery<CategoriaOption[]>({
    queryKey: ['catalogos', 'categorias'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos/categorias')
        return normalizeCategorias(data)
      } catch {
        return FALLBACK_CATEGORIAS
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !consolidatedQ.data?.categorias,
  })

  const c = consolidatedQ.data // cache del consolidado
  const isLoading = consolidatedQ.isLoading
  const hasAnyError = consolidatedQ.isError && parentescosQ.isError && discapacidadesQ.isError && etapasVidaQ.isError && featuresQ.isError && categoriasQ.isError

  return {
    data: {
      parentescos: c?.parentescos ?? parentescosQ.data ?? FALLBACK_PARENTESCOS,
      tiposDiscapacidad: c?.discapacidades ?? discapacidadesQ.data ?? FALLBACK_DISCAPACIDADES,
      etapasVida: c?.etapasVida ?? etapasVidaQ.data ?? FALLBACK_ETAPAS_VIDA,
      features: c?.features ?? featuresQ.data ?? FALLBACK_FEATURES,
      categoriasInstitucion: c?.categorias ?? categoriasQ.data ?? FALLBACK_CATEGORIAS,

      // Nuevos catálogos del backend v1.0-v1.5
      temporalidadOrigen: c?.temporalidadOrigen ?? FALLBACK_TEMPORALIDAD,
      preferenciaFormato: c?.preferenciaFormato ?? FALLBACK_FORMATO,
      areasInteres: c?.areasInteres ?? FALLBACK_AREAS,
      viabilidadEconomica: c?.viabilidadEconomica ?? FALLBACK_VIABILIDAD,

      necesidades: [],
      metas: [],
      etapasCrecimiento: c?.etapasVida ?? etapasVidaQ.data ?? FALLBACK_ETAPAS_VIDA,
      modalidadesEmpleo: ['presencial', 'remoto', 'hibrido'],
    },
    isLoading,
    isError: hasAnyError,
    error: (consolidatedQ.error ?? parentescosQ.error ?? discapacidadesQ.error ?? etapasVidaQ.error ?? featuresQ.error ?? categoriasQ.error) as Error | null,
  }
}
