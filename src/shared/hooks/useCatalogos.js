import { useQuery } from '@tanstack/react-query'
import api from '@shared/lib/api'

// ═══════════════════════════════════════════════════════════
// FALLBACKS LOCALES — cuando el backend no responde
// ═══════════════════════════════════════════════════════════
const FALLBACK_PARENTESCOS = [
  'Hijo/a', 'Hermano/a', 'Nieto/a', 'Sobrino/a',
  'Cónyuge', 'Tutor legal', 'Otro familiar',
]

const FALLBACK_DISCAPACIDADES = [
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

const FALLBACK_ETAPAS_VIDA = [
  { id: 'infancia', label: 'Infancia (0-12)' },
  { id: 'adolescencia', label: 'Adolescencia (13-17)' },
  { id: 'adultoJoven', label: 'Adulto joven (18-29)' },
  { id: 'adulto', label: 'Adulto (30-59)' },
  { id: 'mayor', label: 'Adulto mayor (60+)' },
]

const FALLBACK_FEATURES = [
  { id: 'instituciones', label: 'Instituciones', description: 'Explorar y buscar instituciones' },
  { id: 'empleo', label: 'Empleo', description: 'Ver y postularse a vacantes laborales' },
  { id: 'comunidad', label: 'Comunidad', description: 'Publicar y comentar en la comunidad' },
  { id: 'mensajes', label: 'Mensajes', description: 'Enviar y recibir mensajes' },
  { id: 'favoritos', label: 'Favoritos', description: 'Guardar instituciones favoritas' },
  { id: 'asistenteIa', label: 'Asistente IA', description: 'Usar el asistente de inteligencia artificial' },
  { id: 'notificaciones', label: 'Notificaciones', description: 'Recibir notificaciones' },
]

const FALLBACK_CATEGORIAS = [
  { id: 'funcional', label: 'Funcional', color: '#01ADFF' },
  { id: 'educativo', label: 'Educativo', color: '#8B6BAE' },
  { id: 'laboral', label: 'Laboral', color: '#D4944C' },
  { id: 'social', label: 'Social', color: '#4BA3A3' },
]

/**
 * Normaliza los strings del backend a objetos {value, label}
 * para que los componentes que esperan objetos funcionen correctamente.
 * @param {string[]} strings - Array de strings desde el backend
 * @returns {Array<{value: string, label: string}>}
 */
function normalizeDiscapacidades(strings) {
  if (!Array.isArray(strings)) return FALLBACK_DISCAPACIDADES
  return strings.map(s => ({ value: s, label: s }))
}

/**
 * Normaliza categorías del backend: mapea `id` → `value` para compatibilidad
 * con componentes que esperan {value, label}.
 * @param {Array<{id: string, label: string, color: string}>} cats
 * @returns {Array<{id: string, value: string, label: string, color: string}>}
 */
function normalizeCategorias(cats) {
  if (!Array.isArray(cats)) return FALLBACK_CATEGORIAS
  return cats.map(c => ({
    id: c.id,
    value: c.id,
    label: c.label,
    color: c.color,
  }))
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
export function useCatalogos() {
  // ── Endpoint consolidado (nuevo backend) ─────────────
  const consolidatedQ = useQuery({
    queryKey: ['catalogos'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos')
        // El backend consolidado devuelve arrays simples de strings.
        // Normalizamos cada uno al formato que los componentes esperan.
        const parentescos = Array.isArray(data?.parentescos) ? data.parentescos : null
        const discapacidades = Array.isArray(data?.discapacidades)
          ? normalizeDiscapacidades(data.discapacidades)
          : null
        const etapasVida = Array.isArray(data?.etapasVida)
          ? data.etapasVida.map(e => typeof e === 'string' ? { id: e, label: e } : e)
          : null
        const features = Array.isArray(data?.features) ? data.features : null
        const categorias = Array.isArray(data?.categorias)
          ? data.categorias.map(c => typeof c === 'string'
              ? { id: c, value: c, label: c, color: '#01ADFF' }
              : { id: c.id, value: c.id, label: c.label, color: c.color ?? '#01ADFF' })
          : null
        return { parentescos, discapacidades, etapasVida, features, categorias }
      } catch {
        return null
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  })

  // ── Fallback: endpoints individuales (si el consolidado falla) ──
  const parentescosQ = useQuery({
    queryKey: ['catalogos', 'parentescos'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos/parentescos')
        return Array.isArray(data) ? data : FALLBACK_PARENTESCOS
      } catch {
        return FALLBACK_PARENTESCOS
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !consolidatedQ.data?.parentescos,
  })

  const discapacidadesQ = useQuery({
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

  const etapasVidaQ = useQuery({
    queryKey: ['catalogos', 'etapas-vida'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos/etapas-vida')
        return Array.isArray(data) ? data : FALLBACK_ETAPAS_VIDA
      } catch {
        return FALLBACK_ETAPAS_VIDA
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !consolidatedQ.data?.etapasVida,
  })

  const featuresQ = useQuery({
    queryKey: ['catalogos', 'features'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/catalogos/features')
        return Array.isArray(data) ? data : FALLBACK_FEATURES
      } catch {
        return FALLBACK_FEATURES
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !consolidatedQ.data?.features,
  })

  const categoriasQ = useQuery({
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

      necesidades: [],
      metas: [],
      etapasCrecimiento: c?.etapasVida ?? etapasVidaQ.data ?? FALLBACK_ETAPAS_VIDA,
      modalidadesEmpleo: [],
    },
    isLoading,
    isError: hasAnyError,
    error: consolidatedQ.error ?? parentescosQ.error ?? discapacidadesQ.error ?? etapasVidaQ.error ?? featuresQ.error ?? categoriasQ.error,
  }
}
