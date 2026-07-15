import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useInstitutions } from '../hooks/useInstitutions'
import { useFavoriteIds, useToggleFavorite } from '../hooks/useFavorites'
import { AppSidebar, TopNav, Icons, CategoryTag, CATEGORY_COLORS } from '../components/shared'
import { useMe } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'
import MapView from '../components/MapView'

const CATEGORIES = Object.keys(CATEGORY_COLORS)
const PAGE_SIZE = 6

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
  const [view, setView] = useState('grid') // 'grid' | 'list'
  const [showMap, setShowMap] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const { data: user } = useMe()
  const { logout } = useAuthStore()

  const debouncedSearch = useDebounce(search, 400)

  const filters = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(category ? { category } : {}),
  }

  // Cuando cambian los filtros, volvemos a mostrar solo la primera página
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [debouncedSearch, category])

  const { data: institutions = [], isLoading, error } = useInstitutions(filters)
  const { data: favIds = new Set() } = useFavoriteIds()
  const toggle = useToggleFavorite()

  const favSet = favIds instanceof Set ? favIds : new Set(Array.isArray(favIds) ? favIds : [])

  const visible = institutions.slice(0, visibleCount)
  const remaining = institutions.length - visibleCount

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="explore" />
      <TopNav user={user} onLogout={logout} currentPage="explore" />

      <main className="responsive-main">
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 30,
          fontWeight: 700,
          color: 'var(--text-main)',
          margin: '0 0 24px',
        }}>
          Explorar instituciones
        </h1>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex',
            }}>
              {Icons.search({ s: 18 })}
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar instituciones, servicios, ciudades..."
              style={{
                width: '100%', height: 48, paddingLeft: 48, paddingRight: 16,
                border: '1px solid var(--border-light)',
                borderRadius: 9999,
                fontFamily: 'var(--font-body)', fontSize: 15,
                background: 'white', color: 'var(--text-main)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Category pills + view toggles */}
        <div className="responsive-header" style={{ flexWrap: 'wrap', marginBottom: 32 }}>
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

          {/* View controls (right-aligned) */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {/* Map toggle */}
            <button
              onClick={() => setShowMap(v => !v)}
              title="Vista mapa"
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center',
                justifyContent: 'center', borderRadius: 8, cursor: 'pointer',
                border: '1px solid var(--border-light)',
                background: showMap ? 'var(--primary)' : 'white',
                color: showMap ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {Icons.mapPin({ s: 16 })}
            </button>
            {/* Grid / List toggle */}
            {['grid', 'list'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={v === 'grid' ? 'Vista cuadrícula' : 'Vista lista'}
                style={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', border: '1px solid var(--border-light)',
                  borderRadius: 8,
                  background: view === v && !showMap ? '#E8F4F6' : 'white',
                  color: view === v && !showMap ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {v === 'grid' ? Icons.grid({ s: 16 }) : Icons.list({ s: 16 })}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          {isLoading
            ? 'Buscando...'
            : institutions.length === 0
              ? 'Sin resultados'
              : `Mostrando ${Math.min(visibleCount, institutions.length)} de ${institutions.length} institución${institutions.length !== 1 ? 'es' : ''}`}
          {category && (
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}> · {category}</span>
          )}
        </div>

        {/* Map view */}
        {showMap && (
          <div style={{ marginBottom: 28 }}>
            <MapView institutions={institutions} height="420px" />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <SkeletonGrid />
        ) : error ? (
          <ErrorState />
        ) : institutions.length === 0 ? (
          <EmptyState />
        ) : view === 'grid' || showMap ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {visible.map(inst => (
                <InstitutionCard
                  key={inst.id}
                  inst={inst}
                  isFav={favSet.has(String(inst.id))}
                  onToggleFav={() => toggle.mutate(inst.id)}
                />
              ))}
            </div>
            {remaining > 0 && (
              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="btn-secondary"
                  style={{ fontSize: 15, padding: '12px 32px', minHeight: 48 }}
                >
                  Ver más ({remaining} {remaining === 1 ? 'institución' : 'instituciones'})
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visible.map(inst => (
                <InstitutionRow
                  key={inst.id}
                  inst={inst}
                  isFav={favSet.has(String(inst.id))}
                  onToggleFav={() => toggle.mutate(inst.id)}
                />
              ))}
            </div>
            {remaining > 0 && (
              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="btn-secondary"
                  style={{ fontSize: 15, padding: '12px 32px', minHeight: 48 }}
                >
                  Ver más ({remaining} {remaining === 1 ? 'institución' : 'instituciones'})
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

/* ── Skeleton ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border-light)',
      borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: 90, height: 26, borderRadius: 9999, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} />
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} />
      </div>
      <div style={{ width: '80%', height: 20, borderRadius: 6, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ width: '100%', height: 14, borderRadius: 6, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ width: '65%', height: 14, borderRadius: 6, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ width: '50%', height: 13, borderRadius: 6, background: '#EEE', animation: 'pulse 1.4s ease-in-out infinite', marginTop: 4 }} />
    </div>
  )
}

function SkeletonGrid() {
  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    </>
  )
}

/* ── Empty & Error states ─────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border-light)',
      borderRadius: 12, padding: 60, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#E8F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', color: 'var(--primary)',
      }}>
        {Icons.search({ s: 24 })}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>
        Sin resultados
      </h3>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
        Intenta con otro término o categoría
      </p>
    </div>
  )
}

function ErrorState() {
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border-light)',
      borderRadius: 12, padding: 48, textAlign: 'center',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
        Ocurrió un error al cargar las instituciones. Intenta de nuevo.
      </p>
    </div>
  )
}

/* ── InstitutionCard (grid) ───────────────────────────────────────────── */
function InstitutionCard({ inst, isFav, onToggleFav }) {
  const color = CATEGORY_COLORS[inst.category] ?? 'var(--primary)'
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border-light)',
      borderRadius: 12, padding: 20,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <CategoryTag label={inst.category} color={color} />
        <button
          onClick={onToggleFav}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: isFav ? '#C4789A' : 'var(--text-muted)',
            padding: 0, display: 'flex',
          }}
        >
          {Icons.heart({ s: 18, filled: isFav })}
        </button>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
        color: 'var(--text-main)', lineHeight: 1.3,
      }}>
        {inst.name}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
        {inst.description?.slice(0, 80)}{inst.description?.length > 80 ? '…' : ''}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
        {Icons.mapPin({ s: 14 })} {inst.city}{inst.state ? `, ${inst.state}` : ''}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 8, borderTop: '1px solid var(--border-light)',
      }}>
        <span style={{ fontSize: 13, color: '#D4944C', display: 'flex', alignItems: 'center', gap: 4 }}>
          {Icons.star({ s: 14, filled: true })} {inst.rating_avg?.toFixed(1) ?? '—'}
          <span style={{ color: 'var(--text-muted)' }}>({inst.rating_count ?? 0})</span>
        </span>
        <Link
          to={`/institution/${inst.id}`}
          style={{
            fontSize: 13, fontWeight: 600, color: 'var(--primary)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          Ver más {Icons.arrowRight({ s: 14 })}
        </Link>
      </div>
    </div>
  )
}

/* ── InstitutionRow (list) ────────────────────────────────────────────── */
function InstitutionRow({ inst, isFav, onToggleFav }) {
  const color = CATEGORY_COLORS[inst.category] ?? 'var(--primary)'
  return (
    <div style={{
      background: 'white', border: '1px solid var(--border-light)',
      borderRadius: 12, padding: '16px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50% 50% 50% 14%',
        background: `color-mix(in oklch, ${color} 15%, transparent)`,
        color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700,
      }}>
        {inst.name?.[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
            {inst.name}
          </span>
          <CategoryTag label={inst.category} color={color} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {Icons.mapPin({ s: 13 })} {inst.city}{inst.state ? `, ${inst.state}` : ''}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D4944C' }}>
            {Icons.star({ s: 13, filled: true })} {inst.rating_avg?.toFixed(1) ?? '—'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onToggleFav}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: isFav ? '#C4789A' : 'var(--text-muted)',
            padding: 4, display: 'flex',
          }}
        >
          {Icons.heart({ s: 18, filled: isFav })}
        </button>
        <Link
          to={`/institution/${inst.id}`}
          style={{
            fontSize: 14, fontWeight: 600, color: 'var(--primary)',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', border: '1px solid var(--border-light)',
            borderRadius: 8,
          }}
        >
          Ver más {Icons.arrowRight({ s: 14 })}
        </Link>
      </div>
    </div>
  )
}
