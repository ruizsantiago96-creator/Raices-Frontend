import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Icons, LeafIcon } from '@shared/components/shared'

export const AppSidebar = ({ currentPage }) => {
  const { user } = useAuthStore()
  const items = [
    { id: 'dashboard', label: 'Inicio', icon: Icons.home, path: '/dashboard' },
    { id: 'explore', label: 'Explorar', icon: Icons.search, path: '/explore' },
    { id: 'jobs', label: 'Empleo', icon: Icons.briefcase, path: '/jobs' },
    { id: 'favorites', label: 'Guardados', icon: Icons.heart, path: '/favorites' },
    { id: 'social', label: 'Comunidad', icon: Icons.message, path: '/social' },
  ]
  if (user?.role === 'tutor') {
    items.push({ id: 'tutor', label: 'Mi familia', icon: Icons.users, path: '/familia' })
  }
  items.push({ id: 'profile', label: 'Mi perfil', icon: Icons.user, path: '/profile' })
  if (user?.role === 'admin') {
    items.push({ id: 'admin', label: 'Admin', icon: Icons.shield, path: '/admin' })
  }

  // Bottom nav items (mobile) — show only the 5 main ones
  const bottomItems = items.slice(0, 5)

  return (
    <>
      {/* Desktop sidebar */}
      <nav aria-label="Navegación principal" className="responsive-sidebar" style={{
        background: '#001D26',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px', gap: 4,
      }}>
        {/* Brand logo at top */}
        <div style={{ padding: '8px 12px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LeafIcon size={18} color="rgba(255,255,255,0.9)" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Raíces</span>
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
                style={{
                  textDecoration: 'none',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.2s ease', padding: '10px 12px',
                  fontFamily: 'var(--font-body)', fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{item.icon({ s: 20 })}</span>
                <span style={{ lineHeight: 1.2 }}>{item.label}</span>
              </Link>
            )
          })}
        </div>
        {/* Bottom section */}
        <div style={{ padding: '12px 12px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700 }}>
              {(user?.full_name ?? '?')[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name ?? 'Usuario'}</span>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav aria-label="Navegación principal móvil" className="mobile-bottom-nav">
        {bottomItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <Link
              key={item.id}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon({ s: 20 })}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
