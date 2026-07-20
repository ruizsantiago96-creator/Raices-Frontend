import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useInstitutions } from '../hooks/useInstitutions'
import { useFavoriteIds, useToggleFavorite } from '../hooks/useFavorites'
import { Icons, CategoryTag, CATEGORY_COLORS } from '../components/shared'
import { useMe } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'
import MapView from '../components/MapView'

const CATEGORIES = Object.keys(CATEGORY_COLORS)
const PAGE_SIZE = 6

/* Mock data for blurred background cards */
const MOCK_INSTITUTIONS = [
  { id: 1, name: 'Centro de Terapia Familiar', category: 'Terapia', city: 'Ciudad de México', state: 'CDMX', description: 'Servicios de terapia familiar y de pareja con profesionales certificados.', rating_avg: 4.8, rating_count: 124 },
  { id: 2, name: 'Instituto de Educación Inclusiva', category: 'Educación', city: 'Guadalajara', state: 'Jalisco', description: 'Programas educativos adaptados para niños y jóvenes con capacidades diferentes.', rating_avg: 4.6, rating_count: 89 },
  { id: 3, name: 'Empleo Digno A.C.', category: 'Empleo', city: 'Monterrey', state: 'Nuevo León', description: 'Conectamos personas con discapacidad con empresas inclusivas.', rating_avg: 4.9, rating_count: 203 },
  { id: 4, name: 'Red de Comunidad Autismo', category: 'Comunidad', city: 'Puebla', state: 'Puebla', description: 'Espacios de encuentro y apoyo para familias del espectro autista.', rating_avg: 4.7, rating_count: 156 },
  { id: 5, name: 'Clínica de Bienestar Integral', category: 'Salud', city: 'Querétaro', state: 'Querétaro', description: 'Atención médica integral con enfoque en salud mental y física.', rating_avg: 4.5, rating_count: 78 },
  { id: 6, name: 'Deporte y Recreación Adaptada', category: 'Recreación', city: 'Cancún', state: 'Quintana Roo', description: 'Actividades deportivas y recreativas para todas las capacidades.', rating_avg: 4.8, rating_count: 91 },
]

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function ExplorePage() {
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState(params.get('category') ?? '')
  const [view, setView] = useState('grid')
  const [showMap, setShowMap] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const { data: user, isLoading } = useMe()
  const { token } = useAuthStore()
  const navigate = useNavigate()

  const isAuthenticated = !!token && (isLoading || !!user)
  const debouncedSearch = useDebounce(search, 400)

  const filters = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(category ? { category } : {}),
  }

  // Reset visibleCount when filters change (without useEffect to avoid cascading renders)
  const prevFilterRef = useRef(`${debouncedSearch}|${category}`)
  const currentFilterKey = `${debouncedSearch}|${category}`
  if (prevFilterRef.current !== currentFilterKey) {
    prevFilterRef.current = currentFilterKey
    setVisibleCount(PAGE_SIZE)
  }

  // Only call API when authenticated
  const { data: apiInstitutions = [], isLoading: loadingInstitutions, error } = useInstitutions(filters)
  const { data: favIds = new Set() } = useFavoriteIds()
  const toggle = useToggleFavorite()

  const favSet = favIds instanceof Set ? favIds : new Set(Array.isArray(favIds) ? favIds : [])

  // Use mock data for unauthenticated users, real data for authenticated
  const mockInstitutions = MOCK_INSTITUTIONS.filter(inst => {
    const matchesSearch = !debouncedSearch || inst.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || inst.city.toLowerCase().includes(debouncedSearch.toLowerCase()) || inst.description.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchesCategory = !category || inst.category === category
    return matchesSearch && matchesCategory
  })
  const institutions = isAuthenticated ? apiInstitutions : mockInstitutions
  const visible = institutions.slice(0, visibleCount)
  const remaining = institutions.length - visibleCount

  /* ── Guest view: blurred cards with registration overlay ────────────── */
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 32px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #5B9A8B 0%, #4A8B7A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)',
            }}>R</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>Raíces</span>
          </Link>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, borderRadius: 10 }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, borderRadius: 10 }}
            >
              Registrarse
            </button>
          </div>
        </header>

        <main className="responsive-main" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 24px' }}>
            Explorar instituciones
          </h1>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>{Icons.search({ s: 18 })}</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar instituciones, servicios, ciudades..."
                style={{
                  width: '100%', height: 48, paddingLeft: 48, paddingRight: 16,
                  border: '1px solid var(--border-light)', borderRadius: 9999,
                  fontFamily: 'var(--font-body)', fontSize: 15,
                  background: 'white', color: 'var(--text-main)',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            <button
              onClick={() => setCategory('')}
              style={{
                padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                border: !category ? 'none' : '1px solid var(--border-light)',
                background: !category ? 'var(--primary)' : 'white',
                color: !category ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              Todos
            </button>
            {CATEGORIES.map(cat => {
              const active = category === cat
              const color = CATEGORY_COLORS[cat] ?? 'var(--primary)'
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(active ? '' : cat)}
                  style={{
                    padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    border: active ? 'none' : '1px solid var(--border-light)',
                    background: active ? color : 'white',
                    color: active ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Blurred content container */}
          <div style={{ position: 'relative' }}>
            {/* Blurred cards */}
            <div style={{
              filter: 'blur(6px)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {MOCK_INSTITUTIONS.slice(0, visibleCount).map(inst => (
                  <InstitutionCard key={inst.id} inst={inst} />
                ))}
              </div>
            </div>

            {/* Registration overlay */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, rgba(251,247,240,0.3) 0%, rgba(251,247,240,0.8) 100%)',
              borderRadius: 16,
            }}>
              <div style={{
                background: 'white',
                borderRadius: 20,
                padding: '48px 56px',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                maxWidth: 480,
                width: '100%',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5B9A8B 0%, #4A8B7A 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                  color: 'white',
                }}>
                  {Icons.search({ s: 32 })}
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: '0 0 12px',
                }}>
                  Para seguir explorando
                </h2>
                <p style={{
                  fontSize: 16,
                  color: 'var(--text-muted)',
                  margin: '0 0 32px',
                  lineHeight: 1.6,
                }}>
                  Regístrate gratis para descubrir instituciones, guardar favoritos y conectar con la comunidad.
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/auth?mode=login')}
                className="btn-secondary"
                style={{ padding: '14px 32px', fontSize: 15, fontWeight: 600, borderRadius: 12, minWidth: 140 }}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate('/auth?mode=register')}
                className="btn-primary"
                style={{ padding: '14px 32px', fontSize: 15, fontWeight: 600, borderRadius: 12, minWidth: 140 }}
              >
                Registrarse
              </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ── Authenticated view: full experience ──────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <main className="responsive-main">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 24px' }}>
          Explorar instituciones
        </h1>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>{Icons.search({ s: 18 })}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar instituciones, servicios, ciudades..." style={{ width: '100%', height: 48, paddingLeft: 48, paddingRight: 16, border: '1px solid var(--border-light)', borderRadius: 9999, fontFamily: 'var(--font-body)', fontSize: 15, background: 'white', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div className="responsive-header" style={{ flexWrap: 'wrap', marginBottom: 32 }}>
          <button onClick={() => setCategory('')} style={{ padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', border: !category ? 'none' : '1px solid var(--border-light)', background: !category ? 'var(--primary)' : 'white', color: !category ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>Todos</button>
          {CATEGORIES.map(cat => {
            const active = category === cat
            const color = CATEGORY_COLORS[cat] ?? 'var(--primary)'
            return <button key={cat} onClick={() => setCategory(active ? '' : cat)} style={{ padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', border: active ? 'none' : '1px solid var(--border-light)', background: active ? color : 'white', color: active ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>{cat}</button>
          })}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button onClick={() => setShowMap(v => !v)} title="Vista mapa" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border-light)', background: showMap ? 'var(--primary)' : 'white', color: showMap ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>{Icons.mapPin({ s: 16 })}</button>
            {['grid', 'list'].map(v => <button key={v} onClick={() => setView(v)} title={v === 'grid' ? 'Vista cuadrícula' : 'Vista lista'} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)', borderRadius: 8, background: view === v && !showMap ? '#E8F4F6' : 'white', color: view === v && !showMap ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}>{v === 'grid' ? Icons.grid({ s: 16 }) : Icons.list({ s: 16 })}</button>)}
          </div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>{loadingInstitutions ? 'Buscando...' : institutions.length === 0 ? 'Sin resultados' : `Mostrando ${Math.min(visibleCount, institutions.length)} de ${institutions.length} institución${institutions.length !== 1 ? 'es' : ''}`}{category && <span style={{ color: 'var(--primary)', fontWeight: 600 }}> · {category}</span>}</div>
        {showMap && <div style={{ marginBottom: 28 }}><MapView institutions={institutions} height="420px" /></div>}
        {loadingInstitutions ? <SkeletonGrid /> : error ? <ErrorState /> : institutions.length === 0 ? <EmptyState /> : view === 'grid' || showMap ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>{visible.map(inst => <InstitutionCard key={inst.id} inst={inst} isFav={favSet.has(String(inst.id))} onToggleFav={() => toggle.mutate(inst.id)} />)}</div>
            {remaining > 0 && <div style={{ textAlign: 'center', marginTop: 28 }}><button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} className="btn-secondary" style={{ fontSize: 15, padding: '12px 32px', minHeight: 48 }}>Ver más ({remaining} {remaining === 1 ? 'institución' : 'instituciones'})</button></div>}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{visible.map(inst => <InstitutionRow key={inst.id} inst={inst} isFav={favSet.has(String(inst.id))} onToggleFav={() => toggle.mutate(inst.id)} />)}</div>
            {remaining > 0 && <div style={{ textAlign: 'center', marginTop: 28 }}><button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} className="btn-secondary" style={{ fontSize: 15, padding: '12px 32px', minHeight: 48 }}>Ver más ({remaining} {remaining === 1 ? 'institución' : 'instituciones'})</button></div>}
          </>
        )}
      </main>
    </div>
  )
}

/* ── Skeleton ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ width: 90, height: 26, borderRadius: 9999, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} /><div style={{ width: 20, height: 20, borderRadius: '50%', background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} /></div><div style={{ width: '80%', height: 20, borderRadius: 6, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} /><div style={{ width: '100%', height: 14, borderRadius: 6, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} /><div style={{ width: '65%', height: 14, borderRadius: 6, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} /><div style={{ width: '50%', height: 13, borderRadius: 6, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite', marginTop: 4 }} /></div>
}

function SkeletonGrid() {
  return <><style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div></>
}

/* ── Empty & Error states ─────────────────────────────────────────────── */
function EmptyState() {
  return <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 12, padding: 60, textAlign: 'center' }}><div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>{Icons.search({ s: 24 })}</div><h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>Sin resultados</h3><p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>Intenta con otro término o categoría</p></div>
}

function ErrorState() {
  return <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 12, padding: 48, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Ocurrió un error al cargar las instituciones. Intenta de nuevo.</p></div>
}

/* ── InstitutionCard (grid) ───────────────────────────────────────────── */
function InstitutionCard({ inst, isFav, onToggleFav }) {
  const color = CATEGORY_COLORS[inst.category] ?? 'var(--primary)'
  return (
    <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <CategoryTag label={inst.category} color={color} />
        {onToggleFav && (
          <button onClick={onToggleFav} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? '#C4789A' : 'var(--text-muted)', padding: 0, display: 'flex' }}>
            {Icons.heart({ s: 18, filled: isFav })}
          </button>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>{inst.name}</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>{inst.description?.slice(0, 80)}{inst.description?.length > 80 ? '...' : ''}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>{Icons.mapPin({ s: 14 })} {inst.city}{inst.state ? `, ${inst.state}` : ''}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: 13, color: '#D4944C', display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.star({ s: 14, filled: true })} {inst.rating_avg?.toFixed(1) ?? '—'}<span style={{ color: 'var(--text-muted)' }}>({inst.rating_count ?? 0})</span></span>
        {isFav !== undefined && (
          <Link to={`/institution/${inst.id}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>Ver más {Icons.arrowRight({ s: 14 })}</Link>
        )}
      </div>
    </div>
  )
}

/* ── InstitutionRow (list) ────────────────────────────────────────────── */
function InstitutionRow({ inst, isFav, onToggleFav }) {
  const color = CATEGORY_COLORS[inst.category] ?? 'var(--primary)'
  return (
    <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50% 50% 50% 14%', background: `color-mix(in oklch, ${color} 15%, transparent)`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{inst.name?.[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{inst.name}</span>
          <CategoryTag label={inst.category} color={color} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.mapPin({ s: 13 })} {inst.city}{inst.state ? `, ${inst.state}` : ''}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D4944C' }}>{Icons.star({ s: 13, filled: true })} {inst.rating_avg?.toFixed(1) ?? '—'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onToggleFav && (
          <button onClick={onToggleFav} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? '#C4789A' : 'var(--text-muted)', padding: 4, display: 'flex' }}>
            {Icons.heart({ s: 18, filled: isFav })}
          </button>
        )}
        <Link to={`/institution/${inst.id}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid var(--border-light)', borderRadius: 8 }}>Ver más {Icons.arrowRight({ s: 14 })}</Link>
      </div>
    </div>
  )
}
