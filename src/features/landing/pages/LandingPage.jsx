import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { AppFooter } from '@shared/components/shared'
import { useAuthStore } from '@features/auth'
import { STEPS } from '../data/steps'
import { FEATURES } from '../data/features'

const NAV_LINKS = [
  { label: 'Cómo funciona', id: 'como-funciona' },
  { label: 'Conócerte', id: 'conocerte' },
  { label: 'Comunidad', id: 'comunidad' },
]

export default function LandingPage() {
  const nav = useNavigate()
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)
  const [activeNav, setActiveNav] = useState('como-funciona')

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') nav('/admin', { replace: true })
      else if (user.role === 'institution') nav('/institution-portal', { replace: true })
      else nav('/dashboard', { replace: true })
    }
  }, [token, user, nav])

  // Redireccionar de inmediato en el render si ya hay sesión activa
  if (token) {
    if (user) {
      if (user.role === 'admin') return <Navigate to="/admin" replace />
      if (user.role === 'institution') return <Navigate to="/institution-portal" replace />
      return <Navigate to="/dashboard" replace />
    }
    return null
  }

  return (
    <div style={{ background: 'var(--bg-warm)', minHeight: '100vh', fontFamily: 'var(--font-body)', color: 'var(--fg1)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <style>{`
        @keyframes iconJumpBounce {
          0% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-20px) scale(1.12, 0.9); }
          45% { transform: translateY(0) scale(0.92, 1.08); }
          65% { transform: translateY(-8px) scale(1.04, 0.98); }
          85% { transform: translateY(0) scale(0.98, 1.02); }
          100% { transform: translateY(0) scale(1); }
        }

        .step-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease !important;
          cursor: pointer;
        }
        .step-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 12px 32px rgba(7, 59, 76, 0.16) !important;
        }
        .step-card:hover .step-icon-wrapper {
          animation: iconJumpBounce 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes floatWave {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-6px) rotate(4deg) scale(1.08); }
        }
        @keyframes plantSway {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-7deg) scale(1.05); }
          75% { transform: rotate(7deg) scale(1.05); }
        }
        @keyframes cloverSpinPulse {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(90deg) scale(1.12); }
          100% { transform: rotate(180deg) scale(1); }
        }
        @keyframes infinityHeartBeat {
          0%, 100% { transform: scale(1); }
          20% { transform: scale(1.12) rotate(-2deg); }
          40% { transform: scale(1.02) rotate(2deg); }
          60% { transform: scale(1.15) rotate(0deg); }
          80% { transform: scale(1.04); }
        }
        @keyframes networkEcosystemSpin {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(14deg); }
        }

        .feature-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease !important;
          cursor: pointer;
        }
        .feature-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 12px 30px rgba(1, 43, 41, 0.12) !important;
        }
        .feature-card:hover .feat-icon-anim-1 {
          animation: floatWave 0.85s ease-in-out infinite;
        }
        .feature-card:hover .feat-icon-anim-2 {
          animation: plantSway 1s ease-in-out infinite;
        }
        .feature-card:hover .feat-icon-anim-3 {
          animation: cloverSpinPulse 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }
        .feature-card:hover .feat-icon-anim-4 {
          animation: infinityHeartBeat 0.9s ease-in-out infinite;
        }
        .feature-card:hover .feat-icon-anim-5 {
          animation: networkEcosystemSpin 1.1s ease-in-out infinite;
        }
      `}</style>
      {/* ── TOPBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--landing-bg-topbar)', borderBottom: '1px solid var(--landing-border-topbar)',
        backdropFilter: 'blur(25px) saturate(180%)', WebkitBackdropFilter: 'blur(25px) saturate(180%)',
        height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 32px', boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        boxShadow: 'inset 0 -1px 0 0 rgba(255, 255, 255, 0.3), 0 4px 20px 0 rgba(31, 38, 135, 0.04)',
      }}>
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--landing-title)', letterSpacing: '-0.03em' }}>
            Raíces<span style={{ color: '#FF4D68' }}>.</span>
          </span>
        </button>

        {/* Nav pills */}
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              onClick={() => { setActiveNav(link.id); scrollToSection(link.id) }}
              style={{
                background: activeNav === link.id ? 'var(--landing-title)' : 'transparent',
                color: activeNav === link.id ? 'var(--bg-warm)' : 'var(--landing-text-topbar)',
                border: '1.5px solid var(--landing-title)',
                borderRadius: 20, padding: '6px 16px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s ease',
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Auth button */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {token ? (
            <button
              onClick={() => {
                if (user?.role === 'admin') nav('/admin')
                else if (user?.role === 'institution') nav('/institution-portal')
                else nav('/dashboard')
              }}
              style={{ background: '#FF4D68', color: '#f6eddf', border: 'none', borderRadius: 20, padding: '8px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Ir a mi panel
            </button>
          ) : (
            <button
              onClick={() => nav('/auth')}
              style={{
                background: '#FF4D68',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: '8px 24px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FF3352'; e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FF4D68'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{ background: 'var(--landing-hero-bg, #f6eddf)', transition: 'background-color 0.3s ease' }}>
      <section
        id="como-funciona"
        style={{
          maxWidth: 1140,
          margin: '0 auto',
          padding: '130px 32px 85px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <style>{`
          @keyframes heroSunFloat {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(6deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes heroPlantSway {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(-4deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes heroStarPulse {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.08) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes heroFlowerBob {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-7px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          .hero-doodle {
            position: absolute;
            cursor: pointer;
            user-select: none;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
            z-index: 2;
          }
          .hero-doodle:hover {
            filter: drop-shadow(0 12px 20px rgba(7, 59, 76, 0.18));
          }
          .hero-doodle-sun {
            top: 85px;
            left: 4%;
            animation: heroSunFloat 4.2s ease-in-out infinite;
          }
          .hero-doodle-sun:hover {
            transform: scale(1.3) rotate(35deg) !important;
          }
          .hero-doodle-plant {
            bottom: 20px;
            left: 5%;
            animation: heroPlantSway 3.8s ease-in-out infinite;
          }
          .hero-doodle-plant:hover {
            transform: scale(1.3) translateY(-12px) rotate(-10deg) !important;
          }
          .hero-doodle-star {
            top: 90px;
            right: 4%;
            animation: heroStarPulse 3.5s ease-in-out infinite;
          }
          .hero-doodle-star:hover {
            transform: scale(1.35) rotate(45deg) !important;
          }
          .hero-doodle-flower {
            bottom: 20px;
            right: 5%;
            animation: heroFlowerBob 4s ease-in-out infinite;
          }
          .hero-doodle-flower:hover {
            transform: scale(1.3) translateY(-10px) rotate(14deg) !important;
          }
          @media (max-width: 900px) {
            .hero-doodle {
              opacity: 0.85;
              transform: scale(0.8);
            }
            .hero-doodle-sun { left: 1%; top: 75px; }
            .hero-doodle-plant { left: 1%; bottom: 10px; }
            .hero-doodle-star { right: 1%; top: 80px; }
            .hero-doodle-flower { right: 1%; bottom: 10px; }
          }
        `}</style>

        {/* ── DOODLE 1: SOL RADIANTE (Top-Left) ── */}
        <div className="hero-doodle hero-doodle-sun" title="¡Hola sol!">
          <svg width="76" height="76" viewBox="0 0 74 74" fill="none">
            {/* Sun rays */}
            <g stroke="#0C3B4B" strokeWidth="2.8" strokeLinecap="round">
              <line x1="37" y1="6" x2="37" y2="12" />
              <line x1="37" y1="62" x2="37" y2="68" />
              <line x1="6" y1="37" x2="12" y2="37" />
              <line x1="62" y1="37" x2="68" y2="37" />
              <line x1="15" y1="15" x2="19.5" y2="19.5" />
              <line x1="54.5" y1="54.5" x2="59" y2="59" />
              <line x1="15" y1="59" x2="19.5" y2="54.5" />
              <line x1="54.5" y1="19.5" x2="59" y2="15" />
            </g>
            {/* Sun circle */}
            <circle cx="37" cy="37" r="18" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3.2" />
            {/* Cute face */}
            <circle cx="31.5" cy="34.5" r="2" fill="#0C3B4B" />
            <circle cx="42.5" cy="34.5" r="2" fill="#0C3B4B" />
            <path d="M32 41 C34.5 44.5, 39.5 44.5, 42 41" fill="none" stroke="#0C3B4B" strokeWidth="2.4" strokeLinecap="round" />
            {/* Rosy cheeks */}
            <ellipse cx="28" cy="38" rx="2.5" ry="1.5" fill="#FF4D68" opacity="0.45" />
            <ellipse cx="46" cy="38" rx="2.5" ry="1.5" fill="#FF4D68" opacity="0.45" />
          </svg>
        </div>

        {/* ── DOODLE 2: PLANTA TIERNA (Bottom-Left) ── */}
        <div className="hero-doodle hero-doodle-plant" title="¡Creciendo juntos!">
          <svg width="72" height="78" viewBox="0 0 72 78" fill="none">
            {/* Pot */}
            <path d="M22 47 L25 69 C25.5 71, 46.5 71, 47 69 L50 47 Z" fill="#CA918E" stroke="#0C3B4B" strokeWidth="3.2" strokeLinejoin="round" />
            <rect x="20" y="42" width="32" height="6" rx="3" fill="#CA918E" stroke="#0C3B4B" strokeWidth="3" />
            {/* Pot Face */}
            <circle cx="32" cy="57" r="1.5" fill="#0C3B4B" />
            <circle cx="40" cy="57" r="1.5" fill="#0C3B4B" />
            <path d="M34 61 Q36 63 38 61" stroke="#0C3B4B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Stem */}
            <path d="M36 42 C36 30, 36 22, 36 15" stroke="#0C3B4B" strokeWidth="3.2" strokeLinecap="round" />
            {/* Left Leaf */}
            <path d="M36 30 C24 30, 18 20, 24 14 C32 14, 36 24, 36 30 Z" fill="#229B58" stroke="#0C3B4B" strokeWidth="3" strokeLinejoin="round" />
            {/* Right Leaf */}
            <path d="M36 22 C46 22, 52 14, 48 8 C40 8, 36 16, 36 22 Z" fill="#A8B86B" stroke="#0C3B4B" strokeWidth="3" strokeLinejoin="round" />
            {/* Little flower bud top */}
            <circle cx="36" cy="13" r="3.5" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2" />
          </svg>
        </div>

        {/* ── DOODLE 3: ESTRELLA MÁGICA (Top-Right) ── */}
        <div className="hero-doodle hero-doodle-star" title="¡Brilla!">
          <svg width="72" height="72" viewBox="0 0 70 70" fill="none">
            {/* Main star */}
            <path d="M35 12 L38.5 27.5 L54 31 L38.5 34.5 L35 50 L31.5 34.5 L16 31 L31.5 27.5 Z" fill="#FFB703" stroke="#0C3B4B" strokeWidth="3" strokeLinejoin="round" />
            {/* Small secondary pink star */}
            <path d="M52 10 L53.5 16.5 L60 18 L53.5 19.5 L52 26 L50.5 19.5 L44 18 L50.5 16.5 Z" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2" strokeLinejoin="round" />
            {/* Orbit sparkle dots */}
            <circle cx="16" cy="18" r="3.5" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="1.8" />
            <circle cx="48" cy="52" r="3" fill="#10B981" stroke="#0C3B4B" strokeWidth="1.6" />
          </svg>
        </div>

        {/* ── DOODLE 4: FLOR SONRIENTE (Bottom-Right) ── */}
        <div className="hero-doodle hero-doodle-flower" title="¡Florecer!">
          <svg width="74" height="76" viewBox="0 0 72 74" fill="none">
            {/* Stem & leaf */}
            <path d="M36 44 C36 55, 34 68, 36 70" stroke="#0C3B4B" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M36 56 C46 54, 52 62, 48 66 C40 68, 36 62, 36 56 Z" fill="#229B58" stroke="#0C3B4B" strokeWidth="2.5" />
            {/* Petals */}
            <g fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.8">
              <circle cx="36" cy="18" r="10" />
              <circle cx="48" cy="27" r="10" />
              <circle cx="44" cy="41" r="10" />
              <circle cx="28" cy="41" r="10" />
              <circle cx="24" cy="27" r="10" />
            </g>
            {/* Center */}
            <circle cx="36" cy="31" r="11" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3" />
            {/* Face */}
            <circle cx="32" cy="29" r="1.5" fill="#0C3B4B" />
            <circle cx="40" cy="29" r="1.5" fill="#0C3B4B" />
            <path d="M33 34 C34.5 36.5, 37.5 36.5, 39 34" fill="none" stroke="#0C3B4B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* ── HERO TEXT (Centered) ── */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 5.5vw, 58px)',
          fontWeight: 800,
          color: 'var(--landing-title)',
          lineHeight: 1.15,
          margin: '0 0 20px',
          maxWidth: 760,
          position: 'relative',
          zIndex: 2,
        }}>
          Tu historia abre{' '}
          <span style={{ color: '#FF4D68' }}>nuevos caminos.</span>
        </h1>

        <p style={{
          fontSize: 18,
          color: 'var(--landing-text-muted)',
          lineHeight: 1.6,
          maxWidth: 600,
          margin: 0,
          position: 'relative',
          zIndex: 2,
        }}>
          Un espacio para conocerte, descubrir posibilidades y conectar con personas con quienes puedas compartir lo que te importa.
        </p>
      </section>
      </div>

      {/* ── SECTION 1: PRIMERO TE CONOCEMOS ── */}
      <div id="conocerte" style={{ position: 'relative' }}>
        {/* Top Wave: transition from var(--landing-hero-bg) to var(--landing-sec1-bg) */}
        <div style={{ lineHeight: 0, width: '100%', overflow: 'hidden', background: 'var(--landing-hero-bg, #f6eddf)', transition: 'background-color 0.3s ease' }}>
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            preserveAspectRatio="none"
            style={{ width: '100%', height: 'clamp(32px, 4.5vw, 60px)', display: 'block' }}
          >
            <path
              d="M0,0 C380,60 1060,60 1440,0 L1440,60 L0,60 Z"
              fill="var(--landing-sec1-bg)"
            />
          </svg>
        </div>

        <section
          style={{
            background: 'var(--landing-sec1-bg)',
            padding: '40px 32px 48px',
            transition: 'background-color 0.3s ease',
          }}
        >
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{
              fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
              color: 'var(--landing-text-topbar)', textTransform: 'uppercase', marginBottom: 12,
            }}>
              PRIMERO, TE CONOCEMOS
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800, color: 'var(--landing-title)',
              margin: '0 0 48px', lineHeight: 1.2, maxWidth: 560,
            }}>
              Tres pasos para comprender qué es importante para ti
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}>
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className="step-card"
                  style={{
                    background: 'var(--landing-card-bg)',
                    borderRadius: 16,
                    padding: '28px 24px',
                    boxShadow: 'var(--landing-card-shadow)',
                    border: '1px solid var(--landing-card-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                    textAlign: 'center',
                  }}
                >
                  {/* Number badge above icon */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    {/* Number circle floating top-center */}
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 32, height: 32, borderRadius: '50%',
                      background: step.numBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: 15,
                      fontFamily: 'var(--font-display)',
                      zIndex: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}>
                      {step.num}
                    </div>
                    {/* Icon wrapper with jump bounce on hover */}
                    <div className="step-icon-wrapper" style={{ marginTop: 8, display: 'inline-block', transformOrigin: 'bottom center' }}>
                      {step.icon}
                    </div>
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 15, fontWeight: 700,
                    color: 'var(--landing-title)', margin: 0, lineHeight: 1.3,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--landing-text-muted)', margin: 0, lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Wave: transition from var(--landing-sec1-bg) to var(--landing-sec2-bg) */}
        <div style={{ lineHeight: 0, width: '100%', overflow: 'hidden', background: 'var(--landing-sec1-bg)', transition: 'background-color 0.3s ease' }}>
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            preserveAspectRatio="none"
            style={{ width: '100%', height: 'clamp(32px, 4.5vw, 60px)', display: 'block' }}
          >
            <path
              d="M0,0 C380,60 1060,60 1440,0 L1440,60 L0,60 Z"
              fill="var(--landing-sec2-bg)"
            />
          </svg>
        </div>
      </div>

      {/* ── SECTION 2: DESPUÉS AVANZAMOS ── */}
      <section
        id="comunidad"
        style={{ background: 'var(--landing-sec2-bg, #fff9f2)', padding: '72px 32px', transition: 'background-color 0.3s ease' }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{
            fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
            color: '#CA918E', textTransform: 'uppercase', marginBottom: 12,
          }}>
            DESPUÉS, AVANZAMOS CONTIGO
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800, color: 'var(--landing-title)',
            margin: '0 0 12px', lineHeight: 1.2, maxWidth: 560,
          }}>
            Lo que recibes para seguir tu camino
          </h2>
          <p style={{ fontSize: 16, color: 'var(--landing-text-muted)', margin: '0 0 48px', maxWidth: 520, lineHeight: 1.6 }}>
            A partir de lo que conocemos de ti, acercamos opciones, acompañamiento y conexiones que pueden crecer y cambiar contigo.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}>
            {FEATURES.slice(0, 3).map((feat) => (
              <div
                key={feat.title}
                className="feature-card"
                style={{
                  background: 'var(--landing-card-bg)',
                  border: '1px solid var(--landing-card-border)',
                  borderRadius: 20,
                  padding: '32px 24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'center',
                  boxShadow: 'var(--landing-card-shadow)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 88 }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--landing-title)', margin: 0, lineHeight: 1.3 }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--landing-text-muted)', margin: 0, lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom row - 2 centered cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20,
            maxWidth: 680,
            margin: '20px auto 0',
          }}>
            {FEATURES.slice(3).map((feat) => (
              <div
                key={feat.title}
                className="feature-card"
                style={{
                  background: 'var(--landing-card-bg)',
                  border: '1px solid var(--landing-card-border)',
                  borderRadius: 20,
                  padding: '32px 24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'center',
                  boxShadow: 'var(--landing-card-shadow)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 88 }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--landing-title)', margin: 0, lineHeight: 1.3 }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--landing-text-muted)', margin: 0, lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  )
}
