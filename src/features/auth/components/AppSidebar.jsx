import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useMe } from '../hooks/useAuth'
import { Icons, LeafIcon } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'

export const AppSidebar = ({ currentPage, mode = 'app', tab, onTab, pendingCount, alertCritical, stats }) => {
  const { user } = useAuthStore()
  const { data: meData, isFetching } = useMe()
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true'
  })

  useEffect(() => {
    if (isCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed')
    } else {
      document.documentElement.classList.remove('sidebar-collapsed')
    }
  }, [isCollapsed])

  const handleCollapseToggle = () => {
    const nextVal = !isCollapsed
    setIsCollapsed(nextVal)
    localStorage.setItem('sidebar_collapsed', String(nextVal))
  }

  let items = []
  let logoIcon = null
  let title = 'Raíces'

  if (mode === 'admin') {
    logoIcon = Icons.shield({ s: 18, color: 'rgba(255,255,255,0.9)' })
    title = 'Admin'
    items = [
      { id: 'overview',      label: 'Inicio',         icon: Icons.home },
      { id: 'intelligence',  label: 'Inteligencia',   icon: Icons.brain },
      { id: 'institutions',  label: 'Instituciones',  icon: Icons.building,   badge: pendingCount,  badgeColor: 'var(--color-empleo)' },
      { id: 'users',         label: 'Usuarios',       icon: Icons.users },
      { id: 'identities',    label: 'Identidades',    icon: Icons.shieldCheck },
      { id: 'reviews',       label: 'Reseñas',        icon: Icons.star },
      { id: 'alerts',        label: 'Alertas',        icon: Icons.shieldAlert, badge: alertCritical, badgeColor: 'var(--color-error)' },
      { id: 'settings',      label: 'Config',         icon: Icons.target },
    ]
  } else if (mode === 'institution') {
    logoIcon = Icons.building({ s: 18, color: 'rgba(255,255,255,0.9)' })
    title = 'Panel'
    items = [
      { id: 'postulaciones', label: 'Mis Postulaciones', icon: Icons.briefcase, badge: stats?.activeJobs, badgeColor: 'var(--color-artes)' },
      { id: 'candidatos', label: 'Candidatos', icon: Icons.users, badge: stats?.pendingApplicants, badgeColor: 'var(--color-empleo)' },
      { id: 'editar', label: 'Editar institución', icon: Icons.edit, path: '/institution-portal/editar' },
    ]
  } else {
    logoIcon = user?.role === 'admin' ? Icons.shield({ s: 18, color: 'rgba(255,255,255,0.9)' }) :
               user?.role === 'institution' ? Icons.building({ s: 18, color: 'rgba(255,255,255,0.9)' }) :
               user?.role === 'tutor' ? Icons.users({ s: 18, color: 'rgba(255,255,255,0.9)' }) :
               <LeafIcon size={18} color="rgba(255,255,255,0.9)" />
    title = 'Raíces'
    // ── Filtrar items según features del usuario ────────────────────
    const features = user?.features ?? {}
    const hasFeature = (name) => {
      if (Array.isArray(features)) return features.includes(name)
      return features[name] !== false
    }

    items = [
      { id: 'dashboard', label: 'Inicio', icon: Icons.home, path: '/dashboard' },
      { id: 'jobs', label: 'Oportunidades', icon: Icons.briefcase, path: '/jobs', hidden: !hasFeature('postulaciones') },
      { id: 'favorites', label: 'Guardados', icon: Icons.heart, path: '/favorites', hidden: !hasFeature('favoritos') },
      { id: 'social', label: 'Comunidad', icon: Icons.users, path: '/social', hidden: !hasFeature('comunidad') },
    ].filter(item => !item.hidden)
    if (user?.role === 'pcd') {
      items.push({ id: 'rutas', label: 'Mis Rutas', icon: Icons.compass, path: '/rutas' })
    }
    if (user?.role === 'tutor') {
      items.push({ id: 'tutor', label: 'Mis personas', icon: Icons.users, path: '/personas' })
    }
    if (user?.role === 'institution') {
      items.push({ id: 'institution-portal', label: 'Panel', icon: Icons.shield, path: '/institution-portal' })
    }
    if (user?.role === 'admin') {
      items.push({ id: 'admin', label: 'Admin', icon: Icons.shield, path: '/admin' })
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav aria-label={mode === 'admin' ? "Panel de administración" : mode === 'institution' ? "Portal de institución" : "Navegación principal"} className="responsive-sidebar" style={{
        display: 'flex', flexDirection: 'column',
        padding: '20px 0 20px 12px', gap: 4,
      }}>
        {/* Brand logo at top */}
        <div className="sidebar-logo-container" style={{ padding: '8px 0 24px 0', display: 'flex', justifyContent: 'center', width: 'var(--sidebar-width)', marginLeft: '-12px' }}>
          <div style={{ position: 'relative', width: 36, height: 36 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {logoIcon}
            </div>
            {/* Indicador de sincronización cuando se refrescan permisos */}
            {isFetching && mode === 'app' && (
              <div
                aria-label="Actualizando permisos"
                title="Sincronizando permisos..."
                style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 14, height: 14,
                  borderRadius: '50%',
                  background: 'var(--color-warning)',
                  border: '2px solid var(--bg-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'spin 1s linear infinite',
                }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflow: 'visible' }}>
          {items.map((item) => {
            let isActive = false
            if (mode === 'app') {
              isActive = currentPage === item.id
            } else if (mode === 'admin') {
              isActive = tab === item.id
            } else if (mode === 'institution') {
              if (item.id === 'editar') {
                isActive = location.pathname === '/institution-portal/editar'
              } else {
                isActive = location.pathname === '/institution-portal' && tab === item.id
              }
            }
            const isLink = !!item.path

            if (isLink) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`sidebar-desktop-nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{item.icon({ s: 20 })}</span>
                  <span className="sidebar-text" style={{ lineHeight: 1.2 }}>{item.label}</span>
                </Link>
              )
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTab?.(item.id)
                  if (mode === 'institution' && location.pathname !== '/institution-portal') {
                    navigate('/institution-portal')
                  }
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`sidebar-desktop-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  alignSelf: 'stretch',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{item.icon({ s: 20 })}</span>
                <span className="sidebar-text" style={{ lineHeight: 1.2 }}>{item.label}</span>
                {(item.badge > 0) && (
                  <span className="sidebar-badge" aria-label={`${item.badge} pendientes`} style={{
                    marginLeft: 'auto',
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: item.badgeColor, color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '0 4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{item.badge > 9 ? '9+' : item.badge}</span>
                )}
              </button>
            )
          })}

          {/* Toggle collapse button */}
          <button
            type="button"
            onClick={handleCollapseToggle}
            className="sidebar-desktop-nav-item"
            aria-label={isCollapsed ? "Mostrar menú" : "Ocultar menú"}
            style={{
              marginTop: 'auto',
              marginBottom: 4,
              alignSelf: 'stretch',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>
              {isCollapsed ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              )}
            </span>
            <span className="sidebar-text" style={{ lineHeight: 1.2 }}>Contraer menú</span>
          </button>
        </div>

        {/* Volver a la app link for sub-portals */}
        {mode !== 'app' && (
          <div className="sidebar-user-container" style={{ padding: '12px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, width: 'var(--sidebar-width)', marginLeft: '-12px' }}>
            <Link to="/dashboard" className="sidebar-desktop-nav-item" style={{
              textDecoration: 'none',
              color: 'rgba(255,255,255,0.45)',
              marginRight: 0,
            }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{Icons.arrowRight({ s: 20 })}</span>
              <span className="sidebar-text">Ir a app</span>
            </Link>
          </div>
        )}

        {/* User profile (only main app) */}
        {mode === 'app' && user && (
          <div className="sidebar-user-container" style={{ padding: '12px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, width: 'var(--sidebar-width)', marginLeft: '-12px' }}>
            <Link to="/profile" className="sidebar-desktop-nav-item" style={{
              textDecoration: 'none',
              marginRight: 0,
            }}>
              <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700 }}>
                  {(user.full_name ?? '?')[0]?.toUpperCase()}
                </div>
                {/* Dot de sincronización en el avatar */}
                {isFetching && (
                  <div
                    aria-label="Actualizando"
                    title="Sincronizando..."
                    style={{
                      position: 'absolute', bottom: -1, right: -1,
                      width: 8, height: 8,
                      borderRadius: '50%',
                      background: 'var(--color-warning)',
                      border: '1.5px solid rgba(0,29,38,0.92)',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                )}
              </div>
              <span className="sidebar-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name ?? 'Usuario'}</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile drawer navigation */}
      <div className={`mobile-sidebar-container ${sidebarOpen ? 'is-open' : ''}`}>
        {/* Dark overlay */}
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            opacity: sidebarOpen ? 1 : 0,
            visibility: sidebarOpen ? 'visible' : 'hidden',
            transition: 'opacity 0.25s ease, visibility 0.25s ease',
          }}
        />
        {/* Drawer panel */}
        <nav
          aria-label={mode === 'admin' ? "Navegación móvil administración" : mode === 'institution' ? "Navegación móvil portal" : "Navegación móvil lateral"}
          className="mobile-sidebar-drawer"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: 270,
            background: '#001D26',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 16px',
            boxSizing: 'border-box',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s ease',
            boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header with logo & close button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {logoIcon}
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{title}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflow: 'hidden' }}>
            {items.map((item) => {
              let isActive = false
              if (mode === 'app') {
                isActive = currentPage === item.id
              } else if (mode === 'admin') {
                isActive = tab === item.id
              } else if (mode === 'institution') {
                if (item.id === 'editar') {
                  isActive = location.pathname === '/institution-portal/editar'
                } else {
                  isActive = location.pathname === '/institution-portal' && tab === item.id
                }
              }
              const isLink = !!item.path

              if (isLink) {
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      textDecoration: 'none',
                      background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex', alignItems: 'center', gap: 12,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                      transition: 'all 0.2s ease', padding: '12px 14px',
                      fontFamily: 'var(--font-body)', fontWeight: isActive ? 700 : 500,
                      fontSize: 15,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{item.icon({ s: 20 })}</span>
                    <span style={{ lineHeight: 1.2 }}>{item.label}</span>
                  </Link>
                )
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTab?.(item.id)
                    setSidebarOpen(false)
                    if (mode === 'institution' && location.pathname !== '/institution-portal') {
                      navigate('/institution-portal')
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    border: 'none',
                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                    transition: 'all 0.2s ease', padding: '12px 14px',
                    fontFamily: 'var(--font-body)', fontWeight: isActive ? 700 : 500,
                    fontSize: 15,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{item.icon({ s: 20 })}</span>
                  <span style={{ flex: 1, lineHeight: 1.2 }}>{item.label}</span>
                  {(item.badge > 0) && (
                    <span style={{
                      minWidth: 18, height: 18, borderRadius: 9,
                      background: item.badgeColor, color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '0 4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{item.badge > 9 ? '9+' : item.badge}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Bottom user / portal controls */}
          {mode === 'app' ? (
            <div style={{ padding: '16px 8px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700 }}>
                    {(user?.full_name ?? '?')[0]?.toUpperCase()}
                  </div>
                  {isFetching && (
                    <div
                      aria-label="Actualizando"
                      style={{
                        position: 'absolute', bottom: -1, right: -1,
                        width: 10, height: 10,
                        borderRadius: '50%',
                        background: 'var(--color-warning)',
                        border: '2px solid #001D26',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                  )}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name ?? 'Usuario'}</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px 8px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }}>
              <Link to="/dashboard" onClick={() => setSidebarOpen(false)} style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 12,
                color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500,
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{Icons.arrowRight({ s: 20 })}</span>
                <span>Ir a app</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  )
}
