/* Raíces para Florecer — Shared Components (React module version) */
import { useNavigate } from 'react-router-dom'

export const LeafIcon = ({ size = 16, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity="0.8" style={style}>
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
  </svg>
)

// eslint-disable-next-line react-refresh/only-export-components
export const Icons = {
  home: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  search: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  heart: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill={p?.filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  message: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>,
  user: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
  sparkles: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  shield: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>,
  users: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  activity: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  mapPin: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>,
  star: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill={p?.filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  arrowRight: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  arrowLeft: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
  building: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  brain: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/></svg>,
  send: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>,
  x: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  check: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>,
  filter: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  bookmark: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill={p?.filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>,
  phone: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mail: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  globe: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  upload: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  target: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  logout: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  plus: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  edit: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>,
  shieldAlert: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>,
  barChart: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>,
  compass: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  milestone: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"/><path d="M12 13v8"/><path d="M12 3v3"/></svg>,
  heartPulse: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>,
  bell: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  briefcase: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>,
  graduationCap: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>,
  grid: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  list: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>,
  loader: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  camera: (p) => <svg aria-hidden="true" focusable="false" width={p?.s||20} height={p?.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
}

export const CategoryTag = ({ label, color }) => (
  <span style={{
    padding: '4px 12px',
    borderRadius: '16px 16px 16px 5px',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: `color-mix(in oklch, ${color} 15%, transparent)`,
    color,
  }}>
    <LeafIcon size={10} color={color} />
    {label}
  </span>
)

// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORY_COLORS = {
  'funcional': '#01ADFF',
  'educativo': '#8B6BAE',
  'laboral': '#D4944C',
  'social': '#4BA3A3',
}

export const BrandMark = ({ onClick, size = 22, light = false }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-block', verticalAlign: 'baseline', whiteSpace: 'nowrap', padding: 0 }}>
    <span style={{
      fontFamily: 'var(--font-display)', fontSize: size, fontWeight: 700,
      color: light ? 'white' : 'var(--fg1)',
      textDecoration: 'underline',
      textDecorationColor: light ? 'rgba(255,255,255,0.5)' : 'var(--primary)',
      textUnderlineOffset: 3, textDecorationThickness: 2,
      marginRight: 4,
    }}>
      Raíces
    </span>
    <span style={{ fontFamily: 'var(--font-display)', fontSize: size, fontWeight: 700, color: light ? 'rgba(255,255,255,0.85)' : 'var(--fg1)' }}>
      {' para florecer.'}
    </span>
  </button>
)

// eslint-disable-next-line react-refresh/only-export-components
export function hashColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  const colors = ['#01ADFF', '#C4789A', '#8B6BAE', '#D4944C', '#7BA05B', '#4BA3A3', '#5A6C8C']
  return colors[Math.abs(h) % colors.length]
}

export const TopNav = ({ currentPage: _currentPage, user, onLogout }) => {
  const nav = useNavigate()
  const hasSidebar = !!user
  const avatarColor = hashColor(user?.full_name ?? '')
  const initials = (user?.full_name ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const hasAvatar = !!user?.avatar_url

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: hasAvatar ? 'transparent' : avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {hasAvatar ? (
                <img src={user.avatar_url} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : initials}
            </div>
            <span className="topnav-username" style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg2)' }}>
              {user.full_name?.split(' ')[0]}
            </span>
          </div>
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

// eslint-disable-next-line react-refresh/only-export-components
export const labelStyle = {
  display: 'block', fontFamily: 'var(--font-body)', fontSize: 14,
  fontWeight: 700, color: 'var(--fg2)', marginBottom: 6, letterSpacing: '0.02em',
}

// eslint-disable-next-line react-refresh/only-export-components
export const inputStyle = {
  width: '100%', height: 48, padding: '0 16px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
  fontSize: 16, color: 'var(--fg1)', background: 'var(--bg-surface)',
  outline: 'none', boxSizing: 'border-box',
}

/* ── Footer columns data ──────────────────────────── */
const FOOTER_COLUMNS = [
  { title: 'Caminos', items: ['Salud y bienestar', 'Educación', 'Empleo', 'Comunidad'] },
  { title: 'Florece', items: ['Acerca de nosotros', 'Nuestro propósito', 'Privacidad', 'Contacto'] },
]

export const AppFooter = () => (
  <footer className="app-footer-main" style={{ background: '#2E3B46', padding: '40px 48px 20px', fontFamily: 'var(--font-body)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }} className="responsive-footer-grid">
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#FBF7F0', margin: 0, lineHeight: 1.2 }}>
          <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(251,247,240,0.3)', textUnderlineOffset: 3 }}>Raíces</span>
          <br />
          para florecer.
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(251,247,240,0.7)', marginTop: 10, lineHeight: 1.5, maxWidth: 240 }}>
          Conectamos caminos claros, dignos y confiables para el desarrollo, la autonomía y el florecimiento.
        </p>
      </div>
      {FOOTER_COLUMNS.map((col, i) => (
        <div key={i}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#FBF7F0', margin: '0 0 14px' }}>{col.title}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {col.items.map((item, j) => <li key={j} style={{ fontSize: 14, color: 'rgba(251,247,240,0.6)', cursor: 'pointer' }}>{item}</li>)}
          </ul>
        </div>
      ))}
    </div>
    <div style={{ maxWidth: 1100, margin: '28px auto 0', borderTop: '1px solid rgba(251,247,240,0.1)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(251,247,240,0.4)' }} className="app-footer-bottom footer-bottom">
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <LeafIcon size={14} color="rgba(251,247,240,0.4)" />
        2026. Raíces para florecer. Construida con dignidad y cuidado
      </span>
      <span>Privacidad · Accesibilidad</span>
    </div>
  </footer>
)
