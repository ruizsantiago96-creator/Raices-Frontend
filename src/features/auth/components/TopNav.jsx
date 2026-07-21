import { useNavigate } from 'react-router-dom'
import { Icons, BrandMark } from '../../../shared/components/shared'

export const TopNav = ({ currentPage, user, onLogout }) => {
  const nav = useNavigate()
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg2)' }}>
            {user.full_name?.split(' ')[0]}
          </span>
        )}
        {onLogout && (
          <button onClick={onLogout} style={{ background: 'none', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', color: 'var(--fg2)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)', padding: '8px 18px', minHeight: 44 }}>
            {Icons.logout({ s: 18 })} Salir
          </button>
        )}
      </div>
    </header>
  )
}
