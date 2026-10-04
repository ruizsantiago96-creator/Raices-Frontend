import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Icons, AppFooter, BrandMark, LeafIcon } from '@shared/components/shared'
import { useAuthStore } from '@features/auth'
import type { InfoPageData, InfoIconName } from '../data/infoPages'

/* ── Mapa de íconos disponibles para los pilares ──────────── */
const PILLAR_ICONS: Record<InfoIconName, React.ReactNode> = {
  graduationCap: Icons.graduationCap({ s: 24 }),
  heartPulse: Icons.heartPulse({ s: 24 }),
  briefcase: Icons.briefcase({ s: 24 }),
  users: Icons.users({ s: 24 }),
  shield: Icons.shield({ s: 24 }),
  target: Icons.target({ s: 24 }),
  heart: Icons.heart({ s: 24 }),
  compass: Icons.compass({ s: 24 }),
  check: Icons.check({ s: 24 }),
  sparkles: Icons.sparkles({ s: 24 }),
  mail: Icons.mail({ s: 24 }),
  message: Icons.message({ s: 24 }),
  info: Icons.info({ s: 24 }),
}

/* ── Estilos compartidos de la topbar ─────────────────────── */
const ghostBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.85)',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
}

/* ── HeroSection ──────────────────────────────────────────── */
function HeroSection({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <section
      className="info-hero"
      style={{
        background: 'var(--primary-dark)',
        padding: '140px 48px 80px', /* el padding-top compensa la topbar fija */
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
          borderRadius: 'var(--radius-pill)', padding: '6px 16px',
          fontSize: 13, fontWeight: 600, marginBottom: 24,
        }}>
          <LeafIcon size={14} color="rgba(255,255,255,0.9)" /> {badge}
        </div>
        <h1 className="info-hero-title" style={{
          fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 700,
          color: '#fff', margin: '0 0 20px', lineHeight: 1.15,
        }}>
          {title}
        </h1>
        <p className="info-hero-subtitle" style={{
          fontSize: 19, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: 0,
        }}>
          {subtitle}
        </p>
      </div>
    </section>
  )
}

/* ── ContentSection (intro + 3 pilares) ───────────────────── */
function ContentSection({ data }: { data: InfoPageData }) {
  return (
    <>
      {/* Intro */}
      <section className="info-intro scroll-reveal" style={{ maxWidth: 700, margin: '0 auto', padding: '72px 48px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'var(--fg2)', lineHeight: 1.7, margin: 0 }}>
          {data.intro}
        </p>
      </section>

      {/* Pilares */}
      <section className="info-pillars" style={{ maxWidth: 1060, margin: '0 auto', padding: '56px 48px 24px' }}>
        <h2 className="scroll-reveal" style={{
          fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700,
          color: 'var(--fg1)', margin: '0 0 40px', textAlign: 'center',
        }}>
          {data.pillarsTitle}
        </h2>
        <div className="info-pillars-grid scroll-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {data.pillars.map((pillar) => (
            <article key={pillar.title} style={{
              padding: 28, borderRadius: 16,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50% 50% 50% 14%',
                background: 'var(--primary-subtle)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {PILLAR_ICONS[pillar.icon]}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: 0, lineHeight: 1.3 }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: 14.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.65 }}>
                {pillar.desc}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

/* ── CallToAction ─────────────────────────────────────────── */
function CallToAction({ ctaTitle, ctaDesc }: { ctaTitle: string; ctaDesc: string }) {
  const nav = useNavigate()
  const token = useAuthStore(s => s.token)

  return (
    <section style={{ maxWidth: 800, margin: '0 auto', padding: '48px 48px 88px' }}>
      <div className="info-cta-card scroll-reveal-scale" style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '56px 48px', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50% 50% 50% 14%',
          background: 'var(--primary-subtle)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
        }}>
          {Icons.sparkles({ s: 24 })}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 12px' }}>
          {ctaTitle}
        </h2>
        <p style={{ fontSize: 17, color: 'var(--fg2)', lineHeight: 1.6, maxWidth: 460, margin: '0 auto 28px' }}>
          {ctaDesc}
        </p>
        <button
          onClick={() => nav(token ? '/dashboard' : '/auth?mode=register')}
          className="btn-primary"
          style={{ fontSize: 17, padding: '14px 36px', minHeight: 52 }}
        >
          {token ? 'Ir a mi panel' : 'Crear mi cuenta'} {Icons.arrowRight({ s: 18 })}
        </button>
      </div>
    </section>
  )
}

/* ── Plantilla de página informativa ──────────────────────── */
/**
 * Slot opcional para contenido extra entre los pilares y el CTA final
 * (p. ej. el formulario de la página de contacto).
 */
export function ExtraContentSlot({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export default function InfoLandingTemplate({ data, children }: { data: InfoPageData; children?: ReactNode }) {
  const nav = useNavigate()
  const token = useAuthStore(s => s.token)

  return (
    <div style={{ background: 'var(--bg-warm)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* Topbar fija — azul petróleo, congruente con la landing principal */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'var(--primary-dark)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        <BrandMark onClick={() => nav('/')} light />
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => nav('/')} style={ghostBtnStyle}>
            Inicio
          </button>
          {!token && (
            <>
              <Link to="/auth" style={ghostBtnStyle}>Iniciar sesión</Link>
              <Link to="/auth?mode=register" style={{
                background: 'white', color: 'var(--primary-dark)',
                borderRadius: 'var(--radius-pill)', fontSize: 14, fontWeight: 700,
                padding: '10px 20px', fontFamily: 'var(--font-body)', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center',
              }}>
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </header>

      <main id="main" style={{ outline: 'none' }}>
        <HeroSection badge={data.badge} title={data.title} subtitle={data.subtitle} />
        <ContentSection data={data} />
        {children}
        <CallToAction ctaTitle={data.ctaTitle} ctaDesc={data.ctaDesc} />
      </main>

      <AppFooter />
    </div>
  )
}
