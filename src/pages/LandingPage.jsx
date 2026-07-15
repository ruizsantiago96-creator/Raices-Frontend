import { useNavigate, Navigate } from 'react-router-dom'
import { LeafIcon, Icons, BrandMark, AppFooter } from '../components/shared'
import { useAuthStore } from '../stores/authStore'

const CATEGORIES = [
  { name: 'Salud', color: '#C4789A', icon: Icons.heartPulse },
  { name: 'Educación', color: '#8B6BAE', icon: Icons.graduationCap },
  { name: 'Empleo', color: '#D4944C', icon: Icons.briefcase },
  { name: 'Comunidad', color: '#4BA3A3', icon: Icons.users },
  { name: 'Terapia', color: '#2B7A84', icon: Icons.activity },
  { name: 'Recreación', color: '#7BA05B', icon: Icons.target },
]

const FEATURES = [
  { icon: Icons.sparkles, title: 'Recomendaciones personalizadas', desc: 'Basadas en tus necesidades, metas y ubicación.', color: '#C4789A' },
  { icon: Icons.shield, title: 'Confianza y seguridad', desc: 'Cada institución es verificada para ingresar a la comunidad.', color: '#8B6BAE' },
  { icon: Icons.users, title: 'Centrado en la familia', desc: 'Diseñado junto a familias, cuidadores y personas con discapacidad.', color: '#4BA3A3' },
  { icon: Icons.activity, title: 'Seguimiento de tu progreso', desc: 'Celebramos cada logro y compartimos historias que inspiran.', color: '#7BA05B' },
]

export default function LandingPage() {
  const nav = useNavigate()
  const { token, user } = useAuthStore()

  // Si ya inició sesión, no mostrar la landing: llevar a su espacio
  if (token) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  const s = {
    page: { background: 'var(--bg-warm)', minHeight: '100vh', fontFamily: 'var(--font-body)' },
    topbar: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' },
    hero: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '120px 10% 80px', maxWidth: 680, position: 'relative' },
    h1: { fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 700, color: 'var(--fg1)', margin: 0, lineHeight: 1.1 },
    sub: { fontSize: 20, color: 'var(--fg2)', marginTop: 20, lineHeight: 1.6, maxWidth: 520 },
    ctas: { display: 'flex', gap: 16, marginTop: 36 },
    section: { maxWidth: 1100, margin: '0 auto', padding: '80px 48px' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 },
    catCard: (color) => ({
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)', padding: '24px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
      cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: 'var(--shadow-sm)',
    }),
    catIcon: (color) => ({
      width: 48, height: 48, borderRadius: '50% 50% 50% 14%',
      background: `color-mix(in oklch, ${color} 15%, transparent)`,
      color, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }),
    featCard: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 28, boxShadow: 'var(--shadow-sm)' },
    sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' },
    sectionSub: { fontSize: 18, color: 'var(--fg2)', marginBottom: 40 },
  }

  return (
    <div style={s.page}>
      {/* Topbar */}
      <header style={s.topbar}>
        <BrandMark />
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button onClick={() => nav('/about')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'var(--fg1)' }}>Comunidad</button>
          <button onClick={() => nav('/explore')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'var(--fg1)' }}>Explorar</button>
        </nav>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => nav('/auth')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'var(--fg2)' }}>Iniciar sesión</button>
          <button onClick={() => nav('/auth?mode=register')} className="btn-primary" style={{ fontSize: 15, padding: '10px 24px' }}>Registrarse</button>
        </div>
      </header>
vu
      {/* Hero */}
      <section style={s.hero}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary-subtle)', color: 'var(--primary)', borderRadius: 'var(--radius-pill)', padding: '6px 16px', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          <LeafIcon size={14} color="var(--primary)" /> Ecosistema digital para personas con discapacidad
        </div>
        <h1 style={s.h1}>
          Encontramos<br />
          <span style={{ color: 'var(--primary)' }}>tu camino</span><br />
          hacia florecer.
        </h1>
        <p style={s.sub}>
          Conectamos a personas con discapacidad, tutores y familias con instituciones confiables, comunidad de apoyo y contenido relevante en México.
        </p>
        <div style={s.ctas}>
          <button onClick={() => nav('/auth?mode=register')} className="btn-primary" style={{ fontSize: 18, padding: '14px 36px' }}>
            Comenzar gratis {Icons.arrowRight({ s: 18 })}
          </button>
          <button onClick={() => nav('/explore')} className="btn-secondary" style={{ fontSize: 18, padding: '14px 36px' }}>
            Ver instituciones {Icons.arrowRight({ s: 18 })}
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--fg3)', marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.shield({ s: 14 })} Sin costo · Curado y verificado · Privacidad protegida
        </p>
      </section>

      {/* Categories */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ ...s.section, paddingTop: 64, paddingBottom: 64 }}>
          <h2 style={s.sectionTitle}>Caminos hacia el florecimiento</h2>
          <p style={s.sectionSub}>Explora las áreas donde podemos conectarte con apoyo real</p>
          <div style={s.grid4}>
            {CATEGORIES.map(cat => (
              <div key={cat.name} style={s.catCard(cat.color)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = cat.color }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
                onClick={() => nav(`/explore?category=${encodeURIComponent(cat.name)}`)}
              >
                <div style={s.catIcon(cat.color)}>{cat.icon({ s: 22 })}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--fg1)' }}>{cat.name}</div>
                <div style={{ color: 'var(--fg3)', fontSize: 13 }}>Ver instituciones {Icons.arrowRight({ s: 14 })}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>¿Por qué Raíces para florecer?</h2>
        <p style={s.sectionSub}>Un ecosistema que acompaña, no solo informa</p>
        <div style={s.grid4}>
          {FEATURES.map(f => (
            <div key={f.title} style={s.featCard}>
              <div style={{ width: 44, height: 44, borderRadius: '50% 50% 50% 14%', background: `color-mix(in oklch, ${f.color} 15%, transparent)`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {f.icon({ s: 20 })}
              </div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section style={{ background: 'var(--primary)', padding: '64px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'white', margin: '0 0 16px' }}>
          Empieza hoy, sin costo
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Crea tu perfil, descubre instituciones y conecta con la comunidad en minutos.
        </p>
        <button onClick={() => nav('/auth?mode=register')} style={{ background: 'white', color: 'var(--primary-dark)', border: 'none', borderRadius: 'var(--radius-pill)', fontSize: 18, fontWeight: 700, padding: '14px 40px', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Crear mi cuenta {Icons.arrowRight({ s: 18 })}
        </button>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
          Demo: demo@raices.mx / Demo1234
        </p>
      </section>

      <AppFooter />
    </div>
  )
}
