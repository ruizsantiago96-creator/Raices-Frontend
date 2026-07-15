import { useNavigate } from 'react-router-dom'
import { LeafIcon, Icons, BrandMark, AppFooter } from '../components/shared'
import { useAuthStore } from '../stores/authStore'





const VALUES = [
  { icon: Icons.heart, title: 'Dignidad', desc: 'Cada persona merece ser tratada con respeto y valorada por quien es.' },
  { icon: Icons.users, title: 'Comunidad', desc: 'Juntos somos más fuertes. Construimos redes de apoyo que transforman vidas.' },
  { icon: Icons.shield, title: 'Confianza', desc: 'Instituciones verificadas, información confiable, transparencia total.' },
  { icon: Icons.target, title: 'Florecimiento', desc: 'No solo conectamos, acompañamos el camino hacia la autonomía.' },
]

export default function AboutPage() {
  const nav = useNavigate()
  const { token } = useAuthStore()

  const s = {
    page: { background: 'var(--bg-warm)', minHeight: '100vh', fontFamily: 'var(--font-body)' },
    topbar: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' },
    hero: { background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', padding: '140px 48px 80px', textAlign: 'center' },
    section: { maxWidth: 1000, margin: '0 auto', padding: '80px 48px' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 },
  }

  return (
    <div style={s.page}>
      {/* Topbar */}
      <header style={s.topbar}>
        <BrandMark onClick={() => nav('/')} />
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--fg2)' }}>Inicio</button>
          {!token && (
            <>
              <button onClick={() => nav('/auth')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--fg2)' }}>Iniciar sesión</button>
              <button onClick={() => nav('/auth?mode=register')} className="btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>Registrarse</button>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section style={s.hero}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 'var(--radius-pill)', padding: '6px 16px', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <LeafIcon size={14} color="white" /> Nuestra historia
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: 'white', margin: '0 0 20px', lineHeight: 1.1 }}>
            Quiénes somos
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: 0 }}>
            Somos un equipo de familias, profesionales y personas con discapacidad que construyen un camino más claro hacia el florecimiento.
          </p>
        </div>
      </section>



      {/* Mission */}
      <section style={s.section}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 16px' }}>
            Nuestro propósito
          </h2>
          <p style={{ fontSize: 18, color: 'var(--fg2)', lineHeight: 1.7, margin: 0 }}>
            Raíces para florecer nació de la necesidad real de familias que no sabían a dónde acudir. Conectamos personas con discapacidad, tutores e instituciones en un ecosistema digital de confianza, donde cada paso hacia la autonomía es celebrado y acompañado.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ ...s.section, padding: '64px 48px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 40px', textAlign: 'center' }}>
            Nuestros valores
          </h2>
          <div style={s.grid4}>
            {VALUES.map(v => (
              <div key={v.title} style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {v.icon({ s: 24 })}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section style={s.section}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 16px' }}>
            Quiénes conforman Raíces
          </h2>
          <p style={{ fontSize: 17, color: 'var(--fg2)', lineHeight: 1.7, margin: 0 }}>
            Somos familias, cuidadores, profesionales de la salud, educadores y personas con discapacidad. Cada uno con su historia, unidos por el mismo objetivo: que ningún camino hacia el florecimiento se recorra solo.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--primary-dark)', padding: '64px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'white', margin: '0 0 16px' }}>
          Únete a nuestra comunidad
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Forma parte de un movimiento que transforma vidas. Sin costo, con dignidad.
        </p>
        <button onClick={() => nav(token ? '/social' : '/auth?mode=register')} style={{ background: 'white', color: 'var(--primary-dark)', border: 'none', borderRadius: 'var(--radius-pill)', fontSize: 18, fontWeight: 700, padding: '14px 40px', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {token ? 'Ir a Comunidad' : 'Crear mi cuenta'} {Icons.arrowRight({ s: 18 })}
        </button>
      </section>

      <AppFooter />
    </div>
  )
}
