import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useInstitutions } from '../hooks/useInstitutions'
import { useFavoriteIds, useToggleFavorite } from '../../favorites/hooks/useFavorites'
import { useRegistrarInteraccion } from '../hooks/useInteractions'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons, CategoryTag, CATEGORY_COLORS } from '@shared/components/shared'
import { useAuthStore } from '@features/auth'
import { getToken } from '@shared/lib/storage'
import { initScrollReveal } from '@shared/lib/scrollReveal'
import type { Institution } from '@/types/institutions'

/**
 * InstitucionesPage — Índice público de instituciones.
 * =====================================================
 * Es la ruta padre `/instituciones`: renderiza un grid de tarjetas con todas
 * las instituciones. El detalle (ubicación completa, reseñas, Asistente IA)
 * vive en la ruta paramétrica hija `/instituciones/:id` (InstitutionPage).
 */

const PAGE_SIZE = 50

const MOCK_INSTITUTIONS: Institution[] = [
  { id: 1, name: 'Centro de Terapia Familiar', category: 'funcional', city: 'Ciudad de México', state: 'CDMX', description: 'Servicios de terapia familiar y de pareja con profesionales certificados.', rating_avg: 4.8, rating_count: 124 },
  { id: 2, name: 'Instituto de Educación Inclusiva', category: 'educativo', city: 'Guadalajara', state: 'Jalisco', description: 'Programas educativos adaptados para niños y jóvenes con capacidades diferentes.', rating_avg: 4.6, rating_count: 89 },
  { id: 3, name: 'Empleo Digno A.C.', category: 'laboral', city: 'Monterrey', state: 'Nuevo León', description: 'Conectamos personas con discapacidad con empresas inclusivas.', rating_avg: 4.9, rating_count: 203 },
  { id: 4, name: 'Red de Comunidad Autismo', category: 'social', city: 'Puebla', state: 'Puebla', description: 'Espacios de encuentro y apoyo para familias del espectro autista.', rating_avg: 4.7, rating_count: 156 },
  { id: 5, name: 'Clínica de Bienestar Integral', category: 'funcional', city: 'Querétaro', state: 'Querétaro', description: 'Atención médica integral con enfoque en salud mental y física.', rating_avg: 4.5, rating_count: 78 },
  { id: 6, name: 'Deporte y Recreación Adaptada', category: 'social', city: 'Cancún', state: 'Quintana Roo', description: 'Actividades deportivas y recreativas para todas las capacidades.', rating_avg: 4.8, rating_count: 91 },
]

interface CategoryOption {
  value: string
  label: string
}

export default function InstitucionesPage() {
  const { token } = useAuthStore()
  const { data: catalogos } = useCatalogos() as {
    data?: {
      categoriasInstitucion?: Array<{ value?: string; label?: string } | string>
      tiposDiscapacidad?: Array<{ id?: string; value?: string; label?: string } | string>
      [key: string]: unknown
    }
  }

  // Soporte de params de URL: el buscador del TopNav navega a
  // /instituciones?q=... y /instituciones?category=...
  const [params] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const urlCategory = params.get('category') ?? ''

  const [search, setSearch] = useState(urlQuery)
  const [category, setCategory] = useState(urlCategory)

  // La URL se refleja en el estado DENTRO de un efecto (nunca durante el
  // render): al escribir, la URL no cambia y el input no debe revertirse.
  useEffect(() => {
    setSearch(urlQuery)
    setCategory(urlCategory)
  }, [urlQuery, urlCategory])
  const [tipoDiscapacidad, setTipoDiscapacidad] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Catálogos del backend (únicos por su valor de filtro)
  const CATEGORIES: CategoryOption[] = []
  const seenCats = new Set<string>()
  const rawCats = catalogos?.categoriasInstitucion ?? [
    { value: 'funcional', label: 'Salud y Terapia' },
    { value: 'educativo', label: 'Educación' },
    { value: 'laboral', label: 'Empleo' },
    { value: 'social', label: 'Comunidad y Recreación' },
  ]
  for (const c of rawCats) {
    const val = typeof c === 'string' ? c : (c.value ?? '')
    const lbl = typeof c === 'string' ? c.charAt(0).toUpperCase() + c.slice(1) : (c.label ?? val)
    if (val && !seenCats.has(val)) {
      seenCats.add(val)
      CATEGORIES.push({ value: val, label: lbl })
    }
  }
  const DISABILITY_TYPES = [
    { value: '', label: 'Todos' },
    ...(catalogos?.tiposDiscapacidad ?? []).map(d => {
      if (typeof d === 'string') return { value: d, label: d }
      return { value: d.id ?? d.value ?? '', label: d.label ?? d.value ?? '' }
    }),
  ]

  const isAuthenticated = !!token || !!getToken()

  const filters = useMemo(() => ({
    ...(search.trim() ? { busqueda: search.trim() } : {}),
    ...(category ? { categoria: category } : {}),
    ...(tipoDiscapacidad ? { tipoDiscapacidad } : {}),
    ...(ciudad ? { ciudad } : {}),
  }), [search, category, tipoDiscapacidad, ciudad])

  // Solo pedir al API cuando hay sesión; invitados ven el catálogo demo
  const { data: apiInstitutions = [], isLoading, error, refetch } = useInstitutions(
    isAuthenticated ? filters : {}
  )
  const { data: rawFavIds = [] } = useFavoriteIds() as { data?: unknown }
  const toggle = useToggleFavorite() as unknown as { mutate: (inst: Institution) => void }
  const trackInteraccion = useRegistrarInteraccion() as unknown as {
    mutate: (payload: { institucionId: string | number; tipo: string; categoria?: string }) => void
  }

  // Normaliza favoriteIds — el API puede devolver array o Set
  const favSet = useMemo(() => {
    const arr = Array.isArray(rawFavIds)
      ? rawFavIds
      : (rawFavIds instanceof Set ? Array.from(rawFavIds) : (Array.isArray((rawFavIds as { datos?: unknown[] })?.datos) ? (rawFavIds as { datos: unknown[] }).datos : []))
    return new Set(arr.map(String))
  }, [rawFavIds])

  const institutions: Institution[] = isAuthenticated
    ? (apiInstitutions as Institution[])
    : MOCK_INSTITUTIONS.filter(inst => {
        const s = search.trim().toLowerCase()
        const matchesSearch = !s ||
          inst.name.toLowerCase().includes(s) ||
          (inst.city ?? '').toLowerCase().includes(s) ||
          (inst.description ?? '').toLowerCase().includes(s)
        const matchesCategory = !category || inst.category === category
        return matchesSearch && matchesCategory
      })
  const visible = institutions.slice(0, visibleCount)
  const remaining = institutions.length - visibleCount

  const trackClick = (inst: Institution) => {
    if (isAuthenticated && inst?.id) {
      trackInteraccion.mutate({ institucionId: inst.id, tipo: 'click_card', categoria: inst.category })
    }
  }
  const trackGuardar = (inst: Institution) => {
    if (isAuthenticated && inst?.id) {
      trackInteraccion.mutate({ institucionId: inst.id, tipo: 'guardar', categoria: inst.category })
    }
  }

  useEffect(() => {
    const cleanup = initScrollReveal()
    return () => {
      if (cleanup) cleanup()
    }
  }, [visible])

  // Reset de paginación cuando cambian los filtros
  const filterKey = JSON.stringify(filters)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filterKey])

  if (isAuthenticated && error) {
    return (
      <main className="responsive-main" style={{ '--main-max-width': '1200px' } as Record<string, string>}>
        <BackendErrorState onRetry={() => refetch()} />
      </main>
    )
  }

  return (
    <main className="responsive-main" style={{ '--main-max-width': '1200px' } as Record<string, string>}>
      {/* ── Encabezado ── */}
      <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>Instituciones</h1>
        <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>Instituciones que valoran la diversidad</p>
      </div>

      {/* ── Buscador (controlado correcto) ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)', pointerEvents: 'none', display: 'flex' }}>{Icons.search({ s: 18 })}</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar instituciones, servicios, ciudades..."
            aria-label="Buscar instituciones"
            style={{ width: '100%', height: 48, paddingLeft: 48, paddingRight: 16, border: '1px solid var(--border-color)', borderRadius: 9999, fontFamily: 'var(--font-body)', fontSize: 15, background: 'var(--bg-surface)', color: 'var(--fg1)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button onClick={() => setShowFilters(v => !v)} className={`btn-filter-banner ${showFilters || category || tipoDiscapacidad || ciudad ? 'is-active' : ''}`} title="Filtros avanzados">
          <span className="btn-filter-left">{Icons.sliders({ s: 18 })}</span>
          <span className="btn-filter-center">FILTRAR</span>
          <span className={`btn-filter-right ${showFilters ? 'is-open' : ''}`}>{Icons.chevronDown({ s: 16 })}</span>
        </button>
      </div>

      {/* ── Filtros avanzados ── */}
      {showFilters && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg2)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>Categoría</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button onClick={() => setCategory('')} style={{ padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', border: !category ? 'none' : '1px solid var(--border-color)', background: !category ? 'var(--primary)' : 'var(--bg-warm)', color: !category ? 'white' : 'var(--fg3)', transition: 'all 0.2s' }}>Todos</button>
              {CATEGORIES.map(cat => {
                const active = category === cat.value
                const color = CATEGORY_COLORS[cat.value] ?? 'var(--primary)'
                return (<button key={cat.value} onClick={() => setCategory(active ? '' : cat.value)} style={{ padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', border: active ? 'none' : '1px solid var(--border-color)', background: active ? color : 'var(--bg-warm)', color: active ? 'white' : 'var(--fg3)', transition: 'all 0.2s' }}>{cat.label}</button>)
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', width: '100%' }}>
            <div style={{ flex: '1 1 180px', minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg2)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Tipo de discapacidad</label>
              <select value={tipoDiscapacidad} onChange={e => setTipoDiscapacidad(e.target.value)} style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                {DISABILITY_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 180px', minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg2)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Ciudad</label>
              <input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ej. Monterrey" style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {(category || tipoDiscapacidad || ciudad) && (
              <button onClick={() => { setCategory(''); setTipoDiscapacidad(''); setCiudad('') }} style={{ height: 40, padding: '0 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-warm)', color: 'var(--fg3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, transition: 'all 0.2s' }}>{Icons.x({ s: 14 })} Limpiar</button>
            )}
          </div>
        </div>
      )}

      {/* ── Contador + toggle grid/lista ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--fg3)' }}>
          {isLoading ? 'Cargando...' : `${institutions.length} instituciones${category ? ` · ${CATEGORIES.find(c => c.value === category)?.label ?? category}` : ''}`}
        </span>
        <div style={{ display: 'inline-flex', background: 'var(--bg-cool)', borderRadius: 10, padding: 3, gap: 2 }}>
          <button onClick={() => setView('grid')} title="Vista de cuadrícula" style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8, border: 'none', background: view === 'grid' ? 'var(--bg-surface)' : 'transparent', boxShadow: view === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', color: view === 'grid' ? 'var(--fg1)' : 'var(--fg3)', cursor: 'pointer' }}>{Icons.grid({ s: 16 })}</button>
          <button onClick={() => setView('list')} title="Vista de lista" style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8, border: 'none', background: view === 'list' ? 'var(--bg-surface)' : 'transparent', boxShadow: view === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', color: view === 'list' ? 'var(--fg1)' : 'var(--fg3)', cursor: 'pointer' }}>{Icons.list({ s: 16 })}</button>
        </div>
      </div>

      {/* ── Grid de tarjetas ── */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[0, 1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {Icons.building({ s: 24 })}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>No encontramos instituciones</h3>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0 }}>Prueba con otros términos de búsqueda o limpia los filtros.</p>
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {visible.map(inst => (
            <InstitucionCard
              key={inst.id}
              inst={inst}
              isFav={isAuthenticated ? favSet.has(String(inst.id)) : undefined}
              onToggleFav={isAuthenticated ? () => { trackGuardar(inst); toggle.mutate(inst) } : undefined}
              onClick={() => trackClick(inst)}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map(inst => (
            <InstitucionRow
              key={inst.id}
              inst={inst}
              isFav={isAuthenticated ? favSet.has(String(inst.id)) : undefined}
              onToggleFav={isAuthenticated ? () => { trackGuardar(inst); toggle.mutate(inst) } : undefined}
              onClick={() => trackClick(inst)}
            />
          ))}
        </div>
      )}

      {/* ── Cargar más ── */}
      {!isLoading && remaining > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} style={{ padding: '10px 24px', borderRadius: 9999, border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg1)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Ver más ({remaining})
          </button>
        </div>
      )}
    </main>
  )
}

/* ═══════════════════════════════════════════════════════════
   Tarjeta de institución (grid) — info resumida + CTA
   ═══════════════════════════════════════════════════════════ */

interface CardProps {
  inst: Institution
  isFav?: boolean
  onToggleFav?: () => void
  onClick?: () => void
}

export function InstitucionCard({ inst, isFav, onToggleFav, onClick }: CardProps) {
  const color = (inst.category && CATEGORY_COLORS[inst.category]) ?? 'var(--primary)'
  return (
    <div className="card-hover" style={{ height: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <CategoryTag label={inst.category ?? ''} color={color} />
        {onToggleFav && (
          <button onClick={onToggleFav} aria-label={`Guardar ${inst.name}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? '#C4789A' : 'var(--fg3)', padding: 0, display: 'flex' }}>
            {Icons.heart({ s: 18, filled: isFav })}
          </button>
        )}
      </div>

      {/* Nombre */}
      <Link to={`/instituciones/${inst.id}`} onClick={onClick} style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', lineHeight: 1.3, textDecoration: 'none' }}>
        {inst.name}
      </Link>

      {/* Descripción corta */}
      <div style={{ fontSize: 14, color: 'var(--fg3)', lineHeight: 1.5, flex: 1 }}>
        {inst.description?.slice(0, 80)}{inst.description && inst.description.length > 80 ? '...' : ''}
      </div>

      {/* Ubicación */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg3)' }}>
        {Icons.mapPin({ s: 14 })} {inst.city}{inst.state ? `, ${inst.state}` : ''}
      </div>

      {/* Calificación + CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {inst.final_score != null && (
            <span style={{ fontSize: 12, color: '#229B58', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              {Icons.sparkles({ s: 12 })} {Math.round(inst.final_score * 100)}%
            </span>
          )}
          <span style={{ fontSize: 13, color: '#D4944C', display: 'flex', alignItems: 'center', gap: 4 }}>
            {Icons.star({ s: 14, filled: true })} {inst.rating_avg?.toFixed(1) ?? '—'}<span style={{ color: 'var(--fg3)' }}>({inst.rating_count ?? 0})</span>
          </span>
        </div>
        <Link
          to={`/instituciones/${inst.id}`}
          onClick={onClick}
          style={{ padding: '7px 14px', borderRadius: 9999, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 6px rgba(34,155,88,0.25)' }}
        >
          Ver detalles {Icons.arrowRight({ s: 14 })}
        </Link>
      </div>
    </div>
  )
}

/* ── Variante fila (vista de lista) ── */

export function InstitucionRow({ inst, isFav, onToggleFav, onClick }: CardProps) {
  const color = (inst.category && CATEGORY_COLORS[inst.category]) ?? 'var(--primary)'
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50% 50% 50% 14%', background: `color-mix(in oklch, ${color} 15%, transparent)`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{inst.name?.[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--fg1)' }}>{inst.name}</span>
          <CategoryTag label={inst.category ?? ''} color={color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'var(--fg3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.mapPin({ s: 13 })} {inst.city}{inst.state ? `, ${inst.state}` : ''}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D4944C' }}>{Icons.star({ s: 13, filled: true })} {inst.rating_avg?.toFixed(1) ?? '—'} <span style={{ color: 'var(--fg3)' }}>({inst.rating_count ?? 0})</span></span>
        </div>
      </div>
      {onToggleFav && (
        <button onClick={onToggleFav} aria-label={`Guardar ${inst.name}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? '#C4789A' : 'var(--fg3)', padding: 4, display: 'flex' }}>
          {Icons.heart({ s: 18, filled: isFav })}
        </button>
      )}
      <Link
        to={`/instituciones/${inst.id}`}
        onClick={onClick}
        style={{ padding: '8px 16px', borderRadius: 9999, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}
      >
        Ver detalles {Icons.arrowRight({ s: 14 })}
      </Link>
    </div>
  )
}

/* ── Skeleton de carga ── */

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 72, height: 20, borderRadius: 9999, background: 'var(--bg-cool)' }} />
      <div style={{ width: '70%', height: 18, borderRadius: 6, background: 'var(--bg-cool)' }} />
      <div style={{ width: '100%', height: 12, borderRadius: 6, background: 'var(--bg-cool)' }} />
      <div style={{ width: '90%', height: 12, borderRadius: 6, background: 'var(--bg-cool)' }} />
      <div style={{ width: '55%', height: 12, borderRadius: 6, background: 'var(--bg-cool)', marginTop: 'auto' }} />
    </div>
  )
}

/* ── Estado de error con reintento ── */

function BackendErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 48, textAlign: 'center', maxWidth: 520, margin: '40px auto' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>No se pudieron cargar las instituciones</h3>
      <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '0 0 20px' }}>Ocurrió un problema de conexión. Inténtalo de nuevo.</p>
      <button onClick={onRetry} style={{ padding: '10px 22px', borderRadius: 9999, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        Reintentar
      </button>
    </div>
  )
}
