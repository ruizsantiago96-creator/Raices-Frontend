import { useNavigate, Link } from 'react-router-dom'
import { Icons, BrandMark, hashColor } from '@shared/components/shared'
import { useA11yStore } from '@features/a11y/store/a11yStore'

export const TopNav = ({ currentPage, user, onLogout }) => {
  const nav = useNavigate()
  const { darkMode, toggleDarkMode } = useA11yStore()
  const hasSidebar = !!user
  return (
    <header className={hasSidebar ? 'responsive-topnav' : undefined} style={{
      ...(hasSidebar ? {} : {
        position: 'sticky', top: 0, zIndex: 50, width: '100%',
        borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', fontFamily: 'var(--font-body)',
      }),
    }}>
      <BrandMark onClick={() => nav('/')} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme toggle button */}
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          style={{
            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
            background: darkMode ? 'rgba(255,255,255,0.1)' : 'var(--primary-subtle)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: darkMode ? '#F1FA3F' : 'var(--primary)',
            transition: 'all 0.2s ease',
          }}
        >
          {darkMode ? (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          ) : (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          )}
        </button>
        {user && (
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
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
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg2)' }} className="topnav-username">
              {user.full_name?.split(' ')[0]}
            </span>
          </Link>
        )}
        {onLogout && (
          <button onClick={onLogout} style={{ background: 'none', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', color: 'var(--fg2)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)', padding: '8px 18px', minHeight: 44 }}>
            {Icons.logout({ s: 18 })} Salir
          </button>
        )}
        {!user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => nav('/auth?mode=login')} className="btn-secondary" style={{ padding: '8px 18px', fontSize: 14, fontWeight: 600, borderRadius: 10, minHeight: 40 }}>
              Iniciar sesión
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
