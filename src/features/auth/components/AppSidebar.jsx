import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Icons, LeafIcon } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'

export const AppSidebar = ({ currentPage }) => {
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUiStore()
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

  const items = [
    { id: 'dashboard', label: 'Inicio', icon: Icons.home, path: '/dashboard' },
    { id: 'explore', label: 'Explorar', icon: Icons.search, path: '/explore' },
    { id: 'jobs', label: 'Oportunidades', icon: Icons.briefcase, path: '/jobs' },
    { id: 'favorites', label: 'Guardados', icon: Icons.heart, path: '/favorites' },
    { id: 'social', label: 'Comunidad', icon: Icons.message, path: '/social' },
  ]
  if (user?.role === 'tutor') {
    items.push({ id: 'tutor', label: 'Mis personas', icon: Icons.users, path: '/personas' })
  }
  if (user?.role === 'institution') {
    items.push({ id: 'institution-portal', label: 'Panel', icon: Icons.shield, path: '/institution-portal' })
  }
  if (user?.role === 'admin') {
    items.push({ id: 'admin', label: 'Admin', icon: Icons.shield, path: '/admin' })
  }

  // Bottom nav items (mobile) — show only the 5 main ones
  const bottomItems = items.slice(0, 5)

  return (
    <>
      {/* Desktop sidebar */}
      <nav aria-label="Navegación principal" className="responsive-sidebar" style={{
        display: 'flex', flexDirection: 'column',
        padding: '20px 0 20px 12px', gap: 4,
      }}>
        {/* Brand logo at top — icon changes by role */}
        <div className="sidebar-logo-container" style={{ padding: '8px 0 24px 0', display: 'flex', justifyContent: 'center', width: 'var(--sidebar-width)', marginLeft: '-12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.role === 'admin' ? Icons.shield({ s: 18, color: 'rgba(255,255,255,0.9)' }) :
             user?.role === 'institution' ? Icons.building({ s: 18, color: 'rgba(255,255,255,0.9)' }) :
             user?.role === 'tutor' ? Icons.users({ s: 18, color: 'rgba(255,255,255,0.9)' }) :
             <LeafIcon size={18} color="rgba(255,255,255,0.9)" />}
          </div>
        </div>
        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {items.map((item) => {
            const isActive = currentPage === item.id
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
          aria-label="Navegación móvil lateral"
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
                {user?.role === 'admin' ? Icons.shield({ s: 16, color: 'rgba(255,255,255,0.9)' }) :
                 user?.role === 'institution' ? Icons.building({ s: 16, color: 'rgba(255,255,255,0.9)' }) :
                 user?.role === 'tutor' ? Icons.users({ s: 16, color: 'rgba(255,255,255,0.9)' }) :
                 <LeafIcon size={16} color="rgba(255,255,255,0.9)" />}
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Raíces</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {items.map((item) => {
              const isActive = currentPage === item.id
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
            })}
          </div>

          {/* User profile at bottom */}
          <div style={{ padding: '16px 8px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700 }}>
                {(user?.full_name ?? '?')[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name ?? 'Usuario'}</span>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}
