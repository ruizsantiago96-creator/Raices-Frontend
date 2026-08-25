import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Icons, BrandMark, hashColor } from '@shared/components/shared'
import { useA11yStore } from '@features/a11y/store/a11yStore'
import { useNotifications, useMarkRead } from '@features/notifications'
import { useUiStore } from '@shared/stores/uiStore'

function formatTimeAgo(dateString) {
  try {
    const d = new Date(dateString)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours} h`
    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays} d`
  } catch {
    return ''
  }
}


const TopNavSearchBar = () => {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Load recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_searches') ?? '[]')
    } catch {
      return []
    }
  })

  // Save recent searches
  const saveRecentSearches = (list) => {
    setRecentSearches(list)
    localStorage.setItem('recent_searches', JSON.stringify(list))
  }

  // Handle clicking outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  const handleSearchSubmit = (searchVal) => {
    const term = searchVal.trim()
    if (!term) return
    
    // Add to recent searches (limit to 5, unique)
    const filtered = recentSearches.filter(q => q.toLowerCase() !== term.toLowerCase())
    const newList = [term, ...filtered].slice(0, 5)
    saveRecentSearches(newList)

    setIsOpen(false)
    nav(`/explore?q=${encodeURIComponent(term)}`)
  }

  const handleDeleteRecent = (e, termToDelete) => {
    e.stopPropagation()
    const newList = recentSearches.filter(q => q !== termToDelete)
    saveRecentSearches(newList)
  }

  const handleClearAllRecents = (e) => {
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

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '0 16px', zIndex: 1000 }}>
      {/* Search Input Container */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: isOpen ? 'var(--bg-surface)' : 'rgba(7, 59, 76, 0.03)',
        border: isOpen ? '1.5px solid var(--primary)' : '1.5px solid transparent',
        boxShadow: isOpen ? '0 0 0 3px rgba(7, 59, 76, 0.1)' : 'none',
        borderRadius: 20, height: 38, padding: '0 16px',
        transition: 'all 0.15s ease',
      }}>
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
          style={{
            flex: 1, border: 'none', background: 'transparent',
            outline: 'none', boxShadow: 'none', fontSize: 13.5, color: 'var(--fg1)',
            fontFamily: 'var(--font-body)'
          }}
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 2, display: 'flex', alignItems: 'center' }}
          >
            {Icons.x({ s: 12 })}
          </button>
        )}
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
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

              {recentSearches.map((term, i) => (
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

export const TopNav = ({ currentPage: _currentPage, user, onLogout }) => {
  const nav = useNavigate()
  const { darkMode, toggleDarkMode } = useA11yStore()
  const { toggleSidebar, setFloatingChatOpen, setFloatingChatMinimized } = useUiStore()
  const hasSidebar = !!user

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const notifDropdownRef = useRef(null)

  const { data: notificationsRaw } = useNotifications()
  const notifications = notificationsRaw ?? []
  const unreadCount = notifications.filter(n => !n.is_read).length
  const { mutate: markRead } = useMarkRead()

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [dropdownOpen])

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false)
      }
    }
    if (notifDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [notifDropdownOpen])

  return (
    <header className={hasSidebar ? 'responsive-topnav' : 'responsive-topnav guest-topbar'} style={{
      ...(hasSidebar ? {} : {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }),
    }}>
      <div className="topnav-left-section" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {hasSidebar && (
          <button
            className="mobile-hamburger-btn"
            onClick={toggleSidebar}
            aria-label="Abrir menú de navegación"
            style={{
              display: 'none', // Managed by responsive CSS
              alignItems: 'center',
              justifyContent: 'center',
              width: 40, height: 40,
              borderRadius: 'var(--radius-sm)',
              background: '#001D26',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
          </button>
        )}
        <BrandMark onClick={() => nav('/')} />
      </div>

      {user && <TopNavSearchBar />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme toggle button — circular, with border */}
        {user && (
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            className="topnav-icon-btn"
          >
            {darkMode ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill="#FFB703" stroke="#0C3B4B" strokeWidth="2.5" />
                <path d="M12 2 L12 4 M12 20 L12 22 M2 12 L4 12 M20 12 L22 12 M5 5 L6.5 6.5 M17.5 17.5 L19 19 M5 19 L6.5 17.5 M17.5 6.5 L19 5" stroke="#0C3B4B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M20 4 L20.5 5.5 L22 6 L20.5 6.5 L20 8 L19.5 6.5 L18 6 L19.5 5.5 Z" fill="#FDE674" stroke="#0C3B4B" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 3a7.5 7.5 0 0 0 7.5 7.5 7.5 7.5 0 1 1-7.5-7.5Z" fill="#FDE674" stroke="#0C3B4B" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M21 3 L21.6 4.8 L23.5 5.5 L21.6 6.2 L21 8 L20.4 6.2 L18.5 5.5 L20.4 4.8 Z" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        {/* Messages button — circular, with border */}
        {user && (
          <button
            onClick={() => {
              setFloatingChatOpen(true)
              setFloatingChatMinimized(false)
            }}
            aria-label="Mensajes"
            title="Mensajes"
            className="topnav-icon-btn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M 17 14.5 C 19 14.5, 20.5 13, 20.5 11 L 20.5 6.5 C 20.5 4.5, 19 3, 17 3 L 7 3 C 5 3, 3.5 4.5, 3.5 6.5 L 3.5 11 C 3.5 13, 5 14.5, 7 14.5 L 8 14.5 L 5.5 18.5 L 9.5 14.5 Z" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="9" cy="8.5" r="1.5" fill="#fff" />
              <circle cx="15" cy="8.5" r="1.5" fill="#fff" />
            </svg>
          </button>
        )}

        {/* Notifications button — circular, with border & dropdown */}
        {user && (
          <div style={{ position: 'relative' }} ref={notifDropdownRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              aria-label="Notificaciones"
              title="Notificaciones"
              className="topnav-icon-btn"
              style={{ position: 'relative' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 4 A 2.2 2.2 0 0 1 12 1" stroke="#0C3B4B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx="12" cy="18" r="2.8" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.2" />
                <path d="M12 3.5 C9 3.5, 7 5.5, 7 9.5 L7 13.5 C7 14.5, 5 15.5, 5 15.5 L19 15.5 C19 15.5, 17 14.5, 17 13.5 L17 9.5 C17 5.5, 15 3.5, 12 3.5 Z" fill="#F4C84A" stroke="#0C3B4B" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#ef4444',
                }} />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="glass-card" style={{
                position: 'absolute', right: -60, top: 'calc(100% + 8px)',
                width: 320, zIndex: 100,
                display: 'flex', flexDirection: 'column',
                animation: 'fade-in 0.15s ease-out'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--fg1)' }}>Notificaciones</span>
                  <button
                    onClick={() => setNotifDropdownOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', display: 'flex', alignItems: 'center', padding: 4 }}
                  >
                    {Icons.x({ s: 14 })}
                  </button>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--fg3)', fontSize: 13.5 }}>
                      Sin notificaciones nuevas
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(n => {
                      const timeStr = formatTimeAgo(n.created_at)
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifDropdownOpen(false)
                            markRead(n.id)
                            nav(n.url)
                          }}
                          className="notif-item"
                          style={{
                            display: 'flex', gap: 12, padding: '14px 18px',
                            borderBottom: '1px solid var(--border-color)',
                            cursor: 'pointer', background: n.is_read ? 'transparent' : 'color-mix(in oklch, var(--primary) 4%, var(--bg-surface))',
                          }}
                        >
                          {/* Avatar block with status dot */}
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%',
                              background: 'var(--primary-subtle)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--primary)', fontWeight: 700, fontSize: 13
                            }}>
                              {n.title.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{
                              position: 'absolute', bottom: 0, right: 0,
                              width: 8, height: 8, borderRadius: '50%',
                              border: '1.5px solid var(--bg-surface)',
                              background: n.is_read ? '#9ca3af' : '#10b981',
                            }} />
                          </div>

                          {/* Content block */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ fontSize: 13, color: 'var(--fg1)', lineHeight: 1.4, fontWeight: n.is_read ? 500 : 600 }}>
                              <span style={{ fontWeight: 700 }}>{n.title}</span> {n.body}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--fg3)' }}>{timeStr}</div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Footer button */}
                <div style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex' }}>
                  <Link
                    to="/notifications"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="dropdown-item text-center"
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700
                    }}
                  >
                    Ver todas las notificaciones
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User profile dropdown trigger */}
        {user && (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '4px 8px', borderRadius: 'var(--radius-md)',
                transition: 'background-color 0.2s',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="36" height="36" viewBox="0 0 36 36" style={{ display: 'block' }}>
                    <circle cx="18" cy="18" r="16.5" fill="#FDE674" stroke="#0C3B4B" strokeWidth="2.5" />
                    <circle cx="13" cy="16" r="1.8" fill="#0C3B4B" />
                    <circle cx="23" cy="16" r="1.8" fill="#0C3B4B" />
                    <path d="M13 21 C15 24.5, 21 24.5, 23 21" fill="none" stroke="#0C3B4B" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--fg2)' }} className="topnav-username">
                {user.full_name?.split(' ')[0]}
              </span>
              <span style={{ color: 'var(--fg3)', display: 'flex', alignItems: 'center', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>
                {Icons.chevronDown({ s: 14 })}
              </span>
            </button>

            {dropdownOpen && (
              <div className="glass-card" style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: 240, zIndex: 100,
                display: 'flex', flexDirection: 'column',
                padding: '16px 0',
                animation: 'fade-in 0.15s ease-out'
              }}>
                {/* User info header */}
                <div style={{ padding: '0 20px 14px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--fg1)' }}>{user.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2, wordBreak: 'break-all' }}>{user.email}</div>
                </div>

                {/* Options list */}
                <div style={{ padding: '8px 8px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="dropdown-item"
                  >
                    <span style={{ display: 'flex', color: 'var(--fg3)' }}>{Icons.user({ s: 18 })}</span>
                    Ver perfil
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="dropdown-item"
                  >
                    <span style={{ display: 'flex', color: 'var(--fg3)' }}>{Icons.sliders({ s: 18 })}</span>
                    Configuración
                  </Link>

                  {/* Horizontal line divider */}
                  <div style={{ height: 1, background: 'var(--border-color)', margin: '8px 12px' }} />

                  {onLogout && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        onLogout()
                      }}
                      className="dropdown-item dropdown-logout"
                    >
                      <span style={{ display: 'flex', color: 'var(--fg3)' }}>{Icons.logout({ s: 18 })}</span>
                      Cerrar sesión
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => nav('/auth?mode=login')} className="btn-secondary btn-login-responsive" style={{ padding: '8px 18px', fontSize: 14, fontWeight: 600, borderRadius: 10, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span className="auth-text">Iniciar sesión</span>
              <span className="auth-icon" style={{ display: 'none' }}>{Icons.user({ s: 20 })}</span>
            </button>
            <button onClick={() => nav('/auth?mode=register')} className="btn-primary" style={{ padding: '8px 18px', fontSize: 14, fontWeight: 600, borderRadius: 10, minHeight: 40 }}>
              Registrarse
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
