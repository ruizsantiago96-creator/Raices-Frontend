import { useNavigate } from 'react-router-dom'
import { LeafIcon, Icons, BrandMark, AppFooter } from '../../../shared/components/shared'
import { useAuthStore } from '@features/auth/store/authStore'

const VALUES = [
  { icon: Icons.heart, title: 'Dignidad', desc: 'Cada persona merece ser tratada con respeto y valorada por quien es.' },
  { icon: Icons.users, title: 'Comunidad', desc: 'Juntos somos más fuertes. Construimos redes de apoyo que transforman vidas.' },
  { icon: Icons.shield, title: 'Confianza', desc: 'Instituciones verificadas, información confiable, transparencia total.' },
  { icon: Icons.target, title: 'Florecimiento', desc: 'No solo conectamos, acompañamos el camino hacia la autonomía.' },
]

export default function AboutPage() {
  const nav = useNavigate()
  const { token } = useAuthStore()

  return (
    <div style={{ background: 'var(--bg-warm)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <style>{`
        @media (max-width: 991px) {
          .about-community-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .about-community-grid > *:first-child {
            order: -1;
          }
          .about-values-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .about-values-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Topbar — dark teal matching the hero */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--primary-dark)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', fontFamily: 'var(--font-body)' }}>
        <BrandMark onClick={() => nav('/')} light />
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Inicio</button>
          {!token && (
            <>
              <button onClick={() => nav('/auth')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Iniciar sesión</button>
              <button onClick={() => nav('/auth?mode=register')} style={{ background: 'white', color: 'var(--primary-dark)', border: 'none', borderRadius: 'var(--radius-pill)', fontSize: 14, fontWeight: 700, padding: '10px 20px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Registrarse</button>
            </>
          )}
        </nav>
      </header>

      {/* Hero — subtle, monochrome teal */}
      <section style={{ background: 'var(--primary-dark)', padding: '140px 48px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', borderRadius: 'var(--radius-pill)', padding: '6px 16px', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <LeafIcon size={14} color="rgba(255,255,255,0.9)" /> Nuestra historia
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: 'white', margin: '0 0 20px', lineHeight: 1.1 }}>
            Quiénes somos
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: 0 }}>
            Somos un equipo de familias, profesionales y personas con discapacidad que construyen un camino más claro hacia el florecimiento.
          </p>
        </div>
      </section>

      {/* Mission — clean, centered */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '80px 48px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 16px' }}>
          Nuestro propósito
        </h2>
        <p style={{ fontSize: 18, color: 'var(--fg2)', lineHeight: 1.7, margin: 0 }}>
          Raíces para florecer nació de la necesidad real de familias que no sabían a dónde acudir. Conectamos personas con discapacidad, tutores e instituciones en un ecosistema digital de confianza, donde cada paso hacia la autonomía es celebrado y acompañado.
        </p>
      </section>

      {/* Values — minimal, same palette */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '72px 48px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 48px', textAlign: 'center' }}>
          Nuestros valores
        </h2>
        <div className="about-values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {VALUES.map(v => (
            <div key={v.title} style={{ padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {v.icon({ s: 20 })}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{v.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quiénes conforman Raíses — two-column layout */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '72px 48px' }}>
        <div className="about-community-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          {/* Left Column: Image */}
          <div style={{
            width: '100%',
            aspectRatio: '4 / 5',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(44, 62, 62, 0.16), 0 8px 24px rgba(44, 62, 62, 0.10)',
            position: 'relative',
          }}>
            <img src="/images/raices.jpg" alt="Comunidad Raíses" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 24 }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '30%',
              background: 'linear-gradient(to top, rgba(44,62,62,0.18), transparent)',
              borderRadius: '0 0 24px 24px',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Right Column: Content */}
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              fontWeight: 700,
              color: 'var(--fg1)',
              margin: 0,
              lineHeight: 1.15,
            }}>
              Quiénes conforman<br />Raíses
            </h2>

            <p style={{
              fontSize: 16,
              color: 'var(--fg2)',
              lineHeight: 1.7,
              margin: 0,
              marginTop: 24,
              fontWeight: 400,
              maxWidth: 460,
            }}>
              Somos familias, cuidadores, profesionales de la salud, educadores y personas
              con discapacidad. Cada uno con su historia, unidos por el mismo objetivo: que
              ningún camino hacia el florecimiento se recorra solo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 32 }} role="list">
              {['Red de apoyo mutuo', 'Acceso a profesionales verificados', 'Recursos educativos especializados'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 14 }} role="listitem">
                  <div style={{
                    width: 24, height: 24, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid var(--primary)', borderRadius: '50%',
                    color: 'var(--primary)',
                  }} aria-hidden="true">
                    {Icons.check({ s: 14 })}
                  </div>
                  <span style={{ fontSize: 16, color: 'var(--fg1)', fontWeight: 500, lineHeight: 1.4 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA — card style, distinct from footer */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 48px 80px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '56px 48px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            {Icons.users({ s: 24 })}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 12px' }}>
            Únete a nuestra comunidad
          </h2>
          <p style={{ fontSize: 17, color: 'var(--fg2)', marginBottom: 28, maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Forma parte de un movimiento que transforma vidas. Sin costo, con dignidad.
          </p>
          <button onClick={() => nav(token ? '/social' : '/auth?mode=register')} className="btn-primary" style={{ fontSize: 17, padding: '14px 36px' }}>
            {token ? 'Ir a Comunidad' : 'Crear mi cuenta'} {Icons.arrowRight({ s: 18 })}
          </button>
        </div>
      </section>

      <AppFooter />
    </div>
  )
}
