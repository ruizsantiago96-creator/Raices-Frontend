import { Link } from 'react-router-dom'
import { Icons } from '@shared/components/shared'

export default function MobileInstitutionDrawer({ isOpen, onClose, tab, onTab, stats }) {
  const NAV = [
    { key: 'postulaciones', label: 'Mis Postulaciones', icon: Icons.briefcase, badge: stats?.activeJobs },
    { key: 'candidatos', label: 'Candidatos', icon: Icons.users, badge: stats?.pendingApplicants },
  ]

  return (
    <div className="mobile-sidebar-container">
      <div
        className="mobile-sidebar-overlay"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.25s ease, visibility 0.25s ease',
        }}
      />
      <nav
        aria-label="Navegación portal institución móvil"
        className="mobile-sidebar-drawer"
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0,
          width: 270, background: '#001D26', zIndex: 1000,
          display: 'flex', flexDirection: 'column',
          padding: '20px 16px', boxSizing: 'border-box',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons.building({ s: 16 })}
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Institución</span>
          </div>
          <button onClick={onClose} aria-label="Cerrar menú"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV.map(item => {
            const active = tab === item.key
            return (
              <button key={item.key} onClick={() => { onTab(item.key); onClose() }}
                aria-current={active ? 'page' : undefined}
                style={{
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.2s ease', padding: '12px 14px',
                  fontFamily: 'var(--font-body)', fontWeight: active ? 700 : 500, fontSize: 15, textAlign: 'left',
                }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{item.icon({ s: 20 })}</span>
                <span style={{ lineHeight: 1.2 }}>{item.label}</span>
                {(item.badge > 0) && (
                  <span style={{ marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9, background: '#D4944C', color: '#fff', fontSize: 10, fontWeight: 700, padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge > 9 ? '9+' : item.badge}</span>
                )}
              </button>
            )
          })}
        </div>
        <div style={{ padding: '16px 8px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }}>
          <Link to="/dashboard" onClick={onClose} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{Icons.arrowRight({ s: 20 })}</span>
            <span>Ir a app</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
