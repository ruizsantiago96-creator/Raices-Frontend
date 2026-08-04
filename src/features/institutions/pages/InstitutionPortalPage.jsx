import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMe, useAuthStore } from '@features/auth'
import { Icons, BrandMark, hashColor } from '@shared/components/shared'
import { useA11yStore } from '@features/a11y/store/a11yStore'
import { useNotifications, useMarkRead } from '@features/notifications'
import { useAllJobApplicants, useMyJobPostings } from '../hooks/useInstitutionJobs'
import InstitutionPortalSidebar from '../components/InstitutionPortalSidebar'
import MobileInstitutionDrawer from '../components/MobileInstitutionDrawer'
import PostulacionesTab from '../components/PostulacionesTab'
import CandidatosTab from '../components/CandidatosTab'
import { PORTAL_UI } from '../constants/institutionPortalMessages'

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

const TAB_TITLES = {
  postulaciones: PORTAL_UI.TAB_POSTULACIONES,
  candidatos: PORTAL_UI.TAB_CANDIDATOS,
}

export default function InstitutionPortalPage() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const { data: user } = useMe()
  const { darkMode, toggleDarkMode } = useA11yStore()
  const [tab, setTab] = useState(() => localStorage.getItem('inst-portal-tab') ?? 'postulaciones')
  const onTab = (t) => { setTab(t); localStorage.setItem('inst-portal-tab', t) }

  // Data for stats in sidebar
  const { data: jobs = [] } = useMyJobPostings()
  const { data: applicants = [] } = useAllJobApplicants()

  const activeJobs = jobs.filter(j => j.is_active).length
  const pendingApplicants = applicants.filter(a => a.status === 'pending').length
  const stats = { activeJobs, pendingApplicants }

  // Notifications
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const notifDropdownRef = useRef(null)
  const { data: notificationsRaw } = useNotifications()
  const notifications = notificationsRaw ?? []
  const unreadCount = notifications.filter(n => !n.is_read).length
  const { mutate: markRead } = useMarkRead()

  // User dropdown
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

  const [drawerOpen, setDrawerOpen] = useState(false)

  // Handler to switch to candidates tab and optionally filter by job
  const handleViewCandidates = () => {
    setTab('candidatos')
    localStorage.setItem('inst-portal-tab', 'candidatos')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)', display: 'flex' }}>
      <InstitutionPortalSidebar tab={tab} onTab={onTab} stats={stats} />
      <MobileInstitutionDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} tab={tab} onTab={onTab} stats={stats} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <header className="admin-topbar responsive-topnav" style={{
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="mobile-hamburger-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú de portal"
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
            <BrandMark onClick={() => onTab('postulaciones')} />
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

            {/* Notifications button */}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--fg1)' }}>Notificaciones</span>
                    <button
                      onClick={() => setNotifDropdownOpen(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', display: 'flex', alignItems: 'center', padding: 4 }}
                    >
                      {Icons.x({ s: 14 })}
                    </button>
                  </div>

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
                              if (n.url) navigate(n.url)
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
                </div>
              )}
            </div>

            {/* User profile dropdown */}
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
                    {user.full_name?.split(' ')[0] ?? 'Institución'}
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
                    <div style={{ padding: '0 20px 14px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--fg1)' }}>{user.full_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2, wordBreak: 'break-all' }}>{user.email}</div>
                    </div>

                    <div style={{ padding: '8px 8px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        onClick={() => { setDropdownOpen(false); navigate('/profile') }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                          border: 'none', background: 'transparent',
                          cursor: 'pointer', color: 'var(--fg2)',
                          fontSize: 14, fontWeight: 600, textAlign: 'left',
                          width: '100%', transition: 'all 0.2s',
                          fontFamily: 'var(--font-body)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-cool)'; e.currentTarget.style.color = 'var(--fg1)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg2)' }}
                      >
                        <span style={{ display: 'flex', color: 'var(--fg3)' }}>{Icons.user({ s: 18 })}</span>
                        Ver perfil
                      </button>

                      <div style={{ height: 1, background: 'var(--border-color)', margin: '8px 12px' }} />

                      <button
                        onClick={() => { setDropdownOpen(false); logout() }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                          border: 'none', background: 'transparent',
                          color: 'var(--fg2)', cursor: 'pointer',
                          fontSize: 14, fontWeight: 600, textAlign: 'left',
                          width: '100%', transition: 'all 0.2s',
                          fontFamily: 'var(--font-body)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-cool)'; e.currentTarget.style.color = 'var(--color-error)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg2)' }}
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

        <main id="main" className="responsive-main" style={{ '--main-max-width': '1100px' }}>
          {/* Section Title */}
          <h1 key={tab} className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginBottom: 28, letterSpacing: '-0.02em' }}>
            {TAB_TITLES[tab]}
          </h1>

          {/* Quick Stats */}
          <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--color-artes) 14%, transparent)', color: 'var(--color-artes)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.briefcase({ s: 18 })}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg1)', lineHeight: 1 }}>{activeJobs}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>{PORTAL_UI.STAT_ACTIVE}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--primary) 14%, transparent)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.users({ s: 18 })}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg1)', lineHeight: 1 }}>{applicants.length}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>{PORTAL_UI.STAT_TOTAL_POSTULANTS}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, #D4944C 14%, transparent)', color: '#D4944C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg1)', lineHeight: 1 }}>{pendingApplicants}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>{PORTAL_UI.STAT_PENDING}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, #1F8049 14%, transparent)', color: '#1F8049', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.check({ s: 18 })}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg1)', lineHeight: 1 }}>{applicants.filter(a => a.status === 'accepted').length}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>{PORTAL_UI.STAT_ACCEPTED}</div>
              </div>
            </div>
          </div>

          <div key={`content-${tab}`} className="animate-tab-in">
            {tab === 'postulaciones' && <PostulacionesTab onViewCandidates={handleViewCandidates} />}
            {tab === 'candidatos' && <CandidatosTab />}
          </div>
        </main>
      </div>
    </div>
  )
}
