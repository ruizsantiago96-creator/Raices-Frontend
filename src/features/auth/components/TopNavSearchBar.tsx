import { useState, useRef, useEffect, FC, MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@shared/components/shared'

/**
 * Buscador global de Raíces con panel de recientes y tendencias.
 *
 * Dos variantes de presentación:
 * - `variant="topnav"` (default): compacta, vive en la barra superior (desktop/tablet).
 * - `variant="drawer"`: expandida, vive dentro del drawer de navegación móvil
 *   (el input ocupa todo el ancho disponible y no se recorta).
 */
export interface TopNavSearchBarProps {
  variant?: 'topnav' | 'drawer'
}

export const TopNavSearchBar: FC<TopNavSearchBarProps> = ({ variant = 'topnav' }) => {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_searches') ?? '[]')
    } catch {
      return []
    }
  })

  // Save recent searches
  const saveRecentSearches = (list: string[]) => {
    setRecentSearches(list)
    localStorage.setItem('recent_searches', JSON.stringify(list))
  }

  // Handle clicking outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  const handleSearchSubmit = (searchVal: string) => {
    const term = searchVal.trim()
    if (!term) return

    // Add to recent searches (limit to 5, unique)
    const filtered = recentSearches.filter((q: string) => q.toLowerCase() !== term.toLowerCase())
    const newList = [term, ...filtered].slice(0, 5)
    saveRecentSearches(newList)

    setIsOpen(false)
    nav(`/explore?q=${encodeURIComponent(term)}`)
  }

  const handleDeleteRecent = (e: ReactMouseEvent, termToDelete: string) => {
    e.stopPropagation()
    const newList = recentSearches.filter((q: string) => q !== termToDelete)
    saveRecentSearches(newList)
  }

  const handleClearAllRecents = (e: ReactMouseEvent) => {
    e.stopPropagation()
    saveRecentSearches([])
  }

  const trendingTopics = [
    { label: 'Salud y Terapia', category: 'funcional' },
    { label: 'Oportunidades de empleo', category: 'laboral' },
    { label: 'Talleres de inclusión', category: 'educativo' },
    { label: 'Grupos de apoyo familiar', category: 'social' },
    { label: 'Actividades recreativas', category: 'social' }
  ]

  const isDrawer = variant === 'drawer'

  return (
    <div
      ref={containerRef}
      className={isDrawer ? 'topnav-search-drawer' : 'topnav-search-wrap'}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: isDrawer ? 'none' : 480,
        minWidth: 0,
        flex: isDrawer ? undefined : '1 1 auto',
        margin: isDrawer ? 0 : '0 16px',
        zIndex: 1000,
      }}
    >
      {/* Search Input Container */}
      <div
        className={isDrawer ? 'topnav-search-field-drawer' : 'topnav-search-field'}
        style={{
          display: 'flex', alignItems: 'center', gap: isDrawer ? 8 : 10,
          background: isOpen ? 'var(--bg-surface)' : 'rgba(7, 59, 76, 0.03)',
          border: isOpen ? '1.5px solid var(--primary)' : '1.5px solid transparent',
          boxShadow: isOpen ? '0 0 0 3px rgba(7, 59, 76, 0.1)' : 'none',
          borderRadius: isDrawer ? 12 : 20,
          height: isDrawer ? 42 : 38,
          padding: isDrawer ? '0 12px' : '0 16px',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ color: 'var(--fg3)', display: 'flex', alignItems: 'center' }}>
          {Icons.search({ s: 16 })}
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSearchSubmit(query)
            }
          }}
          placeholder="Buscar en Raíces..."
          aria-label="Buscar en Raíces"
          style={{
            flex: 1, minWidth: 0, border: 'none', background: 'transparent',
            outline: 'none', boxShadow: 'none', fontSize: 13.5, color: 'var(--fg1)',
            fontFamily: 'var(--font-body)'
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Limpiar búsqueda"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 2, display: 'flex', alignItems: 'center' }}
          >
            {Icons.x({ s: 12 })}
          </button>
        )}
      </div>

      {/* Dropdown Panel (solo variante topnav: en el drawer los resultados
          se muestran en la página /explore al navegar) */}
      {!isDrawer && isOpen && (
        <div className="glass-card animate-scale-in" style={{
          position: 'absolute', top: '100%', marginTop: 6, left: 0, right: 0,
          background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)',
          borderRadius: 16, boxShadow: 'var(--shadow-xl)', padding: '16px 0',
          maxHeight: 400, overflowY: 'auto'
        }}>
          {/* Preguntar Button */}
          <div style={{ padding: '0 16px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 12 }}>
            <button
              onClick={() => {
                setIsOpen(false)
                nav('/social')
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 20, border: '1.5px solid var(--border-color)',
                background: 'transparent', color: 'var(--fg1)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(7, 59, 76, 0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>✨</span> Preguntar en la comunidad
            </button>
          </div>

          {/* Reciente Section */}
          {recentSearches.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px 6px', alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Reciente
                </span>
                <button
                  onClick={handleClearAllRecents}
                  style={{
                    background: 'none', border: 'none', color: 'var(--primary)',
                    fontSize: 11.5, fontWeight: 700, cursor: 'pointer', padding: '2px 6px',
                    borderRadius: 4, transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(7, 59, 76, 0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  Limpiar
                </button>
              </div>

              {recentSearches.map((term: string, i: number) => (
                <div
                  key={i}
                  onClick={() => {
                    setQuery(term)
                    handleSearchSubmit(term)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(7, 59, 76, 0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg1)', fontSize: 13.5 }}>
                    <span style={{ color: 'var(--fg3)', display: 'flex' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </span>
                    <span>{term}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteRecent(e, term)}
                    aria-label={`Eliminar búsqueda reciente: ${term}`}
                    style={{
                      background: 'none', border: 'none', color: 'var(--fg3)',
                      cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
                      borderRadius: '50%', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(7, 59, 76, 0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {Icons.x({ s: 12 })}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* En tendencia Section */}
          <div>
            <div style={{ padding: '0 16px 6px' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                En tendencia
              </span>
            </div>

            {trendingTopics.map((topic, i) => (
              <div
                key={i}
                onClick={() => {
                  setIsOpen(false)
                  nav(`/explore?category=${encodeURIComponent(topic.category)}`)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(7, 59, 76, 0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: 'var(--color-coral)', display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                  </svg>
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg1)' }}>{topic.label}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>Con base en tu comunidad</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
