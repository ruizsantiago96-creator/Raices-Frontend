import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Icons } from '../../../shared/components/shared'

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

  return (
    <nav aria-label="Navegación principal" className="responsive-sidebar" style={{
      background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '16px 6px', gap: 6, boxShadow: 'var(--shadow-sm)',
    }}>
      {items.map((item) => {
        const isActive = currentPage === item.id
        return (
          <Link
            key={item.id}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            style={{
              width: 76, minHeight: 60, textDecoration: 'none',
              background: isActive ? 'var(--primary-subtle)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              border: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              color: isActive ? 'var(--primary)' : 'var(--fg2)',
              transition: 'all 0.2s ease', padding: '8px 4px',
              fontFamily: 'var(--font-body)', fontWeight: isActive ? 800 : 600,
            }}
          >
            {item.icon({ s: 24 })}
            <span style={{ fontSize: 12, lineHeight: 1.1, textAlign: 'center' }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
