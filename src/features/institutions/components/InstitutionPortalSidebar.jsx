import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icons } from '@shared/components/shared'

export default function InstitutionPortalSidebar({ tab, onTab, stats }) {
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

  const navigate = useNavigate()

  const NAV = [
    { key: 'postulaciones', label: 'Mis Postulaciones', icon: Icons.briefcase, badge: stats?.activeJobs, badgeColor: 'var(--color-artes)' },
    { key: 'candidatos', label: 'Candidatos', icon: Icons.users, badge: stats?.pendingApplicants, badgeColor: 'var(--color-empleo)' },
    { key: 'editar', label: 'Editar institución', icon: Icons.edit, action: () => navigate('/institution-portal/editar') },
  ]

  return (
    <nav aria-label="Portal de institución" className="responsive-sidebar" style={{
      display: 'flex', flexDirection: 'column',
      padding: '20px 0 20px 12px', gap: 4,
    }}>
      {/* Brand logo at top */}
      <div className="sidebar-logo-container" style={{ padding: '8px 0 24px 0', display: 'flex', justifyContent: 'center', width: 'var(--sidebar-width)', marginLeft: '-12px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icons.building({ s: 18 })}
        </div>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map(item => {
          const active = tab === item.key
          return (
            <button key={item.key} onClick={() => item.action ? item.action() : onTab(item.key)}
              aria-current={active ? 'page' : undefined}
              className={`sidebar-desktop-nav-item ${active ? 'active' : ''}`}
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

      {/* Volver a la app */}
      <div className="sidebar-user-container" style={{ padding: '12px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }}>
        <Link to="/dashboard" style={{
          textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 12,
          color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          transition: 'all 0.15s',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{Icons.arrowRight({ s: 20 })}</span>
          <span className="sidebar-text">Ir a app</span>
        </Link>
      </div>
    </nav>
  )
}
