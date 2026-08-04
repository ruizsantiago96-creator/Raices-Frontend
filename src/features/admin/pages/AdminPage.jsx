import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMe, useAuthStore } from '@features/auth'
import { Icons, BrandMark } from '@shared/components/shared'
import { useA11yStore } from '@features/a11y/store/a11yStore'
import { useNotifications, useMarkRead } from '@features/notifications'
import { useAllInstitutions, usePendingInstitutions } from '@features/institutions'
import { useAdminAlerts } from '../hooks/useAdmin'
import { UsersTab } from '@features/users'
import { ReviewsTab } from '@features/reviews'
import OverviewTab from '../components/OverviewTab'
import IntelligenceTab from '../components/IntelligenceTab'
import InstitutionsTab from '../components/InstitutionsTab'
import SettingsTab from '../components/SettingsTab'
import AlertsTab from '../components/AlertsTab'
import AdminSidebar from '../components/AdminSidebar'
import MobileAdminDrawer from '../components/MobileAdminDrawer'

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

export default function AdminPage() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const { data: user } = useMe()
  const { darkMode, toggleDarkMode } = useA11yStore()
  const [tab, setTab] = useState(() => localStorage.getItem('admin-tab') ?? 'overview')
  const onTab = (t) => { setTab(t); localStorage.setItem('admin-tab', t) }
  const { data: pending = [] } = usePendingInstitutions()
  const { data: all = [] } = useAllInstitutions()
  const { data: alerts = [] } = useAdminAlerts()

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const notifDropdownRef = useRef(null)

  const { data: notificationsRaw } = useNotifications()
  const notifications = notificationsRaw ?? []
  const unreadCount = notifications.filter(n => !n.is_read).length
  const { mutate: markRead } = useMarkRead()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  // Deduplicar por ID para que el badge coincida con el listado de la pestaña
  // Deduplicar por ID para que el badge coincida con el listado de la pestaña
  const pendingVerification = all.filter(inst => !inst.is_verified && inst.is_active)
  const pendingBadgeMap = new Map()
  for (const inst of [...pending, ...pendingVerification]) {
    if (!pendingBadgeMap.has(inst.id)) pendingBadgeMap.set(inst.id, inst)
  }
  const totalPendingCount = pendingBadgeMap.size
  const criticalCount = alerts.filter(a => a.severity === 'critica').length

  const TAB_TITLES = {
    overview: 'Resumen del ecosistema',
    intelligence: 'Inteligencia de necesidades',
    institutions: 'Gestión de instituciones',
    users: 'Gestión de usuarios',
    reviews: 'Moderación de reseñas',
    alerts: 'Alertas de riesgo',
    settings: 'Configuración de plataforma',
  }

  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)', display: 'flex' }}>
      <AdminSidebar tab={tab} onTab={onTab} pendingCount={totalPendingCount} alertCritical={criticalCount} />
      <MobileAdminDrawer isOpen={adminDrawerOpen} onClose={() => setAdminDrawerOpen(false)} tab={tab} onTab={onTab} pendingCount={totalPendingCount} criticalCount={criticalCount} />


      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <header className="admin-topbar responsive-topnav" style={{
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="mobile-hamburger-btn"
              onClick={() => setAdminDrawerOpen(true)}
              aria-label="Abrir menú de administración"
              style={{
                display: 'none',
                alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40,
                borderRadius: 'var(--radius-sm)',
                background: '#001D26', border: 'none',
                color: '#fff', cursor: 'pointer', padding: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
            </button>
            {/* Brand mark logo */}
            <BrandMark onClick={() => onTab('overview')} />
            {criticalCount > 0 && (
              <button onClick={() => onTab('alerts')}
                className="admin-alert-badge"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: '1.5px solid #D46A6A', background: 'color-mix(in oklch, #D46A6A 10%, transparent)', color: '#D46A6A', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                {Icons.shieldAlert({ s: 15 })} <span className="admin-alert-text">{criticalCount} alerta{criticalCount !== 1 ? 's' : ''} crítica</span>
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Theme toggle button */}
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'transparent',
                border: '1px solid var(--border-color)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--fg2)',
                transition: 'all 0.2s ease',
              }}
            >
              {darkMode ? (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              )}
            </button>

            {/* Notifications button — circular, with border & dropdown */}
            <div style={{ position: 'relative' }} ref={notifDropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                aria-label="Notificaciones"
                title="Notificaciones"
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'transparent',
                  border: '1px solid var(--border-color)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--fg2)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {Icons.bell({ s: 18 })}
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#ef4444',
                  }} />
                )}
              </button>

              {notifDropdownOpen && (
                <div style={{
                  position: 'absolute', right: -60, top: 'calc(100% + 8px)',
                  width: 320, background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)', zIndex: 100,
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
                              navigate(n.url)
                            }}
                            style={{
                              display: 'flex', gap: 12, padding: '14px 18px',
                              borderBottom: '1px solid var(--border-color)',
                              cursor: 'pointer', background: n.is_read ? 'transparent' : 'color-mix(in oklch, var(--primary) 4%, var(--bg-surface))',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-cool)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.is_read ? 'transparent' : 'color-mix(in oklch, var(--primary) 4%, var(--bg-surface))'}
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
                      style={{
                        width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)', background: 'transparent',
                        color: 'var(--fg2)', fontSize: 13.5, fontWeight: 700,
                        textAlign: 'center', textDecoration: 'none', transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-cool)'
                        e.currentTarget.style.color = 'var(--fg1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--fg2)'
                      }}
                    >
                      Ver todas las notificaciones
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
                    background: user.avatar_url ? 'transparent' : hashColor(user.full_name ?? ''),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)',
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (user.full_name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                    )}
                  </div>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--fg2)' }} className="topnav-username">
                    {user.full_name?.split(' ')[0] ?? 'Admin'}
                  </span>
                  <span style={{ color: 'var(--fg3)', display: 'flex', alignItems: 'center', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>
                    {Icons.chevronDown({ s: 14 })}
                  </span>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 240, background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)', zIndex: 100,
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
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                          textDecoration: 'none', color: 'var(--fg2)',
                          fontSize: 14, fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-cool)'
                          e.currentTarget.style.color = 'var(--fg1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--fg2)'
                        }}
                      >
                        <span style={{ display: 'flex', color: 'var(--fg3)' }}>{Icons.user({ s: 18 })}</span>
                        Ver perfil
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                          textDecoration: 'none', color: 'var(--fg2)',
                          fontSize: 14, fontWeight: 600,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-cool)'
                          e.currentTarget.style.color = 'var(--fg1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--fg2)'
                        }}
                      >
                        <span style={{ display: 'flex', color: 'var(--fg3)' }}>{Icons.sliders({ s: 18 })}</span>
                        Configuración
                      </Link>

                      {/* Horizontal line divider */}
                      <div style={{ height: 1, background: 'var(--border-color)', margin: '8px 12px' }} />

                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          logout()
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                          border: 'none', background: 'transparent',
                          color: 'var(--fg2)', cursor: 'pointer',
                          fontSize: 14, fontWeight: 600, textAlign: 'left',
                          width: '100%', transition: 'all 0.2s',
                          fontFamily: 'var(--font-body)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-cool)'
                          e.currentTarget.style.color = 'var(--color-error)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--fg2)'
                        }}
                      >
                        <span style={{ display: 'flex', color: 'var(--fg3)' }}>{Icons.logout({ s: 18 })}</span>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main id="main" className="responsive-main" style={{ '--main-max-width': '1200px' }}>
          {/* Section Title */}
          <h1 key={tab} className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginBottom: 28, letterSpacing: '-0.02em' }}>
            {TAB_TITLES[tab]}
          </h1>

          <div key={`content-${tab}`} className="animate-tab-in">
            {tab === 'overview' && <OverviewTab onNavigate={onTab} />}
            {tab === 'intelligence' && <IntelligenceTab />}
            {tab === 'institutions' && <InstitutionsTab />}
            {tab === 'users' && <UsersTab currentUserId={user?.id} />}
            {tab === 'reviews' && <ReviewsTab />}
            {tab === 'alerts' && <AlertsTab alerts={alerts} onNavigate={onTab} />}
            {tab === 'settings' && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  )
}
