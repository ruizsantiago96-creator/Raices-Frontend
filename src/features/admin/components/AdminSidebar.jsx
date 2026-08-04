import { Link } from 'react-router-dom'
import { Icons } from '@shared/components/shared'

export default function AdminSidebar({ tab, onTab, pendingCount, alertCritical }) {
  const NAV = [
    { key: 'overview',      label: 'Inicio',         icon: Icons.home },
    { key: 'intelligence',  label: 'Inteligencia',   icon: Icons.brain },
    { key: 'institutions',  label: 'Instituciones',  icon: Icons.building,   badge: pendingCount,  badgeColor: 'var(--color-empleo)' },
    { key: 'users',         label: 'Usuarios',       icon: Icons.users },
    { key: 'reviews',       label: 'Reseñas',        icon: Icons.star },
    { key: 'alerts',        label: 'Alertas',        icon: Icons.shieldAlert, badge: alertCritical, badgeColor: 'var(--color-error)' },
    { key: 'settings',      label: 'Config',         icon: Icons.target },
  ]

  return (
    <nav aria-label="Panel de administración" className="responsive-sidebar" style={{
      background: '#001D26',
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px', gap: 4,
    }}>
      {/* Brand logo at top */}
      <div style={{ padding: '8px 12px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icons.shield({ s: 18 })}
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Admin</span>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map(item => {
          const active = tab === item.key
          return (
            <button key={item.key} onClick={() => onTab(item.key)}
              aria-current={active ? 'page' : undefined}
              style={{
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.2s ease', padding: '10px 12px',
                fontFamily: 'var(--font-body)', fontWeight: active ? 700 : 500,
                fontSize: 14, textAlign: 'left', position: 'relative',
              }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{item.icon({ s: 20 })}</span>
              <span style={{ lineHeight: 1.2 }}>{item.label}</span>
              {(item.badge > 0) && (
                <span aria-label={`${item.badge} pendientes`} style={{
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
      </div>

      {/* Volver a la app */}
      <div style={{ padding: '12px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }}>
        <Link to="/dashboard" style={{
          textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 12,
          color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          transition: 'all 0.15s',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{Icons.arrowRight({ s: 20 })}</span>
          <span>Ir a app</span>
        </Link>
      </div>
    </nav>
  )
}
