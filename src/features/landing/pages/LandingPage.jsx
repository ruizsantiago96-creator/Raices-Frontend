import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons, AppFooter } from '@shared/components/shared'
import { useAuthStore } from '@features/auth'

const NAV_LINKS = [
  { label: 'Cómo funciona', id: 'como-funciona' },
  { label: 'Conócerte', id: 'conocerte' },
  { label: 'Comunidad', id: 'comunidad' },
]

const STEPS = [
  {
    num: 1,
    title: 'Conocer quién eres',
    desc: 'Conocer quién eres y los apoyos que necesitas nos ayuda a ofrecerte un espacio seguro, respetuoso e incluyente.',
    numBg: '#0C3B4B',
    icon: (
      <svg width="96" height="96" viewBox="0 0 100 100" fill="none">
        {/* Outer warm cream circle */}
        <circle cx="50" cy="50" r="46" fill="#FBF6EE" stroke="#EFE5D8" strokeWidth="2.5" />

        {/* Character Body / Shoulders */}
        <path
          d="M 33 72 C 33 55, 67 55, 67 72"
          fill="#FDE674"
          stroke="#0C3B4B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 43 56 C 46 60, 54 60, 57 56"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Character Head */}
        <circle cx="50" cy="38" r="14.5" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3.5" />

        {/* Eyes & Smile */}
        <circle cx="45" cy="36" r="2.2" fill="#0C3B4B" />
        <circle cx="55" cy="36" r="2.2" fill="#0C3B4B" />
        <path
          d="M 45.5 42 C 47.5 45.5, 52.5 45.5, 54.5 42"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Heart Badge Top-Right */}
        <g transform="translate(74, 32)">
          <circle cx="0" cy="0" r="7.5" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.5" />
          <path
            d="M 0 3.2 C -3 1.2 -4.4 -0.6 -4.4 -2.2 A 1.8 1.8 0 0 1 -1.2 -3.4 L 0 -2.1 L 1.2 -3.4 A 1.8 1.8 0 0 1 4.4 -2.2 C 4.4 -0.6 3 1.2 0 3.2 Z"
            fill="#FFFFFF"
          />
        </g>
        <path d="M 64 34 L 61 35" stroke="#0C3B4B" strokeWidth="2.2" strokeLinecap="round" />

        {/* Green Check Badge Bottom-Left */}
        <g transform="translate(26, 59)">
          <circle cx="0" cy="0" r="7" fill="#10B981" stroke="#0C3B4B" strokeWidth="2.5" />
          <path
            d="M -2.8 0 L -0.5 2.3 L 3.2 -1.8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Sparkle top-left */}
        <path
          d="M 25 25 L 26.2 29.2 L 30.4 30.4 L 26.2 31.6 L 25 35.8 L 23.8 31.6 L 19.6 30.4 L 23.8 29.2 Z"
          fill="#FFB703"
          stroke="#0C3B4B"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    num: 2,
    title: 'Comprender tu contexto',
    desc: 'Conocer tu situación, tus fortalezas y los apoyos que necesitas nos permite acercarte opciones útiles y adecuadas para ti.',
    numBg: '#0C3B4B',
    icon: (
      <svg width="96" height="96" viewBox="0 0 100 100" fill="none">
        {/* Outer warm cream circle */}
        <circle cx="50" cy="50" r="46" fill="#FBF6EE" stroke="#EFE5D8" strokeWidth="2.5" />

        {/* Body / Shoulders */}
        <path
          d="M 33 72 C 33 55, 67 55, 67 72"
          fill="#FDE674"
          stroke="#0C3B4B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 43 56 C 46 60, 54 60, 57 56"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Head */}
        <circle cx="50" cy="38" r="14.5" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3.5" />

        {/* Eyes & Smile */}
        <circle cx="45" cy="36" r="2.2" fill="#0C3B4B" />
        <circle cx="55" cy="36" r="2.2" fill="#0C3B4B" />
        <path
          d="M 45.5 42 C 47.5 45.5, 52.5 45.5, 54.5 42"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Orbit dots with connectors / whiskers */}
        {/* Top-Left Red/Pink */}
        <circle cx="24" cy="34" r="6.5" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.8" />
        <path d="M 31 35 L 34.5 36" stroke="#0C3B4B" strokeWidth="2.5" strokeLinecap="round" />

        {/* Top-Right Blue */}
        <circle cx="76" cy="34" r="6.5" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="2.8" />
        <path d="M 69 35 L 65.5 36" stroke="#0C3B4B" strokeWidth="2.5" strokeLinecap="round" />

        {/* Bottom-Left Green */}
        <circle cx="26" cy="58" r="6.5" fill="#10B981" stroke="#0C3B4B" strokeWidth="2.8" />

        {/* Bottom-Right Orange */}
        <circle cx="74" cy="58" r="6.5" fill="#FB8500" stroke="#0C3B4B" strokeWidth="2.8" />
      </svg>
    ),
  },
  {
    num: 3,
    title: 'Entender lo que te gusta y quieres hacer',
    desc: 'Conocer lo que disfrutas, lo que te gustaría aprender o hacer y cómo prefieres usar tus habilidades y tu tiempo, para acercarte actividades y opciones que se ajustan a ti.',
    numBg: '#0C3B4B',
    icon: (
      <svg width="96" height="96" viewBox="0 0 100 100" fill="none">
        {/* Outer warm cream circle */}
        <circle cx="50" cy="50" r="46" fill="#FBF6EE" stroke="#EFE5D8" strokeWidth="2.5" />

        {/* Body / Shoulders */}
        <path
          d="M 33 72 C 33 55, 67 55, 67 72"
          fill="#FDE674"
          stroke="#0C3B4B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 43 56 C 46 60, 54 60, 57 56"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Head */}
        <circle cx="50" cy="38" r="14.5" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3.5" />

        {/* Happy expression */}
        <circle cx="45" cy="36" r="2.2" fill="#0C3B4B" />
        <circle cx="55" cy="36" r="2.2" fill="#0C3B4B" />
        <path
          d="M 44.5 41.5 C 47 46.5, 53 46.5, 55.5 41.5"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Big Golden Star Top-Right */}
        <polygon
          points="75,22 77.2,28.5 84,29 78.8,33.5 80.5,40 75,36.2 69.5,40 71.2,33.5 66,29 72.8,28.5"
          fill="#FFB703"
          stroke="#0C3B4B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Green Check Badge Bottom-Left */}
        <g transform="translate(26, 58)">
          <circle cx="0" cy="0" r="7" fill="#10B981" stroke="#0C3B4B" strokeWidth="2.5" />
          <path
            d="M -2.8 0 L -0.5 2.3 L 3.2 -1.8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Blue Orb Bottom-Right */}
        <circle cx="74" cy="58" r="5.5" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="2.5" />

        {/* Coral Orb Top-Left */}
        <circle cx="25" cy="32" r="5.5" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.5" />
      </svg>
    ),
  },
]

const FEATURES = [
  {
    title: 'Caminos con opciones',
    desc: 'Rutas y alternativas que se ajustan a ti.',
    color: '#CA918E',
    icon: (
      <svg width="108" height="72" viewBox="0 0 108 72" fill="none" className="feat-icon-anim-1" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Shadow / ground guide line */}
        <path
          d="M 14 58 C 30 42, 42 22, 60 28 C 72 32, 80 18, 94 14"
          stroke="rgba(7, 59, 76, 0.12)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Curving blue path line */}
        <path
          d="M 14 58 C 30 42, 42 22, 60 28 C 72 32, 80 18, 94 14"
          stroke="#2F80ED"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Forward Arrow Head on the path */}
        <path
          d="M 82 10 L 98 13 L 93 28"
          stroke="#2F80ED"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Milestone nodes along the route */}
        <circle cx="14" cy="58" r="7" fill="#F4C84A" stroke="#073B4C" strokeWidth="2.5" />
        <circle cx="36" cy="38" r="6" fill="#A8B86B" stroke="#073B4C" strokeWidth="2" />
        <circle cx="60" cy="28" r="7.5" fill="#2F80ED" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="76" cy="25" r="6" fill="#F4A836" stroke="#073B4C" strokeWidth="2" />
        <circle cx="95" cy="14" r="5" fill="#FF4D68" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Acompañamiento en cada etapa',
    desc: 'Apoyo para avanzar y adaptarnos contigo.',
    color: '#229B58',
    icon: (
      <svg width="78" height="82" viewBox="0 0 78 82" fill="none" className="feat-icon-anim-2" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Ground ellipse shadow */}
        <ellipse cx="39" cy="72" rx="24" ry="4" fill="rgba(7, 59, 76, 0.08)" />
        {/* Golden-orange stem */}
        <path d="M 39 68 L 39 30" stroke="#D4944C" strokeWidth="5.5" strokeLinecap="round" />
        {/* Golden-orange base circle node */}
        <circle cx="39" cy="68" r="7" fill="#F4C84A" stroke="#073B4C" strokeWidth="2.2" />
        {/* Center bud node */}
        <circle cx="39" cy="32" r="5" fill="#FF4D68" stroke="#ffffff" strokeWidth="2" />
        {/* Left emerald leaf */}
        <path
          d="M 39 32 C 30 16, 16 8, 20 2 C 28 2, 37 16, 39 32 Z"
          fill="#138A8A"
          stroke="#073B4C"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Right matcha leaf */}
        <path
          d="M 39 32 C 48 16, 62 8, 58 2 C 50 2, 41 16, 39 32 Z"
          fill="#A8B86B"
          stroke="#073B4C"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Lower side leaf */}
        <path
          d="M 39 48 C 30 40, 20 44, 22 50 C 28 52, 37 50, 39 48 Z"
          fill="#229B58"
          stroke="#073B4C"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Comunidades según tus intereses',
    desc: 'Conexiones para compartir y hacer crecer tu red de apoyo.',
    color: '#073B4C',
    icon: (
      <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="feat-icon-anim-3" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Dashed outer relationship triangle */}
        <path d="M 42 16 L 16 48 L 68 48 Z" stroke="#073B4C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" opacity="0.35" />
        {/* Connecting spokes */}
        <path d="M 42 44 L 42 16" stroke="#073B4C" strokeWidth="3" strokeLinecap="round" />
        <path d="M 42 44 L 16 48" stroke="#073B4C" strokeWidth="3" strokeLinecap="round" />
        <path d="M 42 44 L 68 48" stroke="#073B4C" strokeWidth="3" strokeLinecap="round" />
        <path d="M 42 44 L 42 70" stroke="#073B4C" strokeWidth="3" strokeLinecap="round" />

        {/* Center hub */}
        <circle cx="42" cy="44" r="10" fill="#F4C84A" stroke="#073B4C" strokeWidth="3" />

        {/* Top: Teal/Green */}
        <circle cx="42" cy="16" r="9" fill="#138A8A" stroke="#073B4C" strokeWidth="2.8" />
        {/* Left: Coral */}
        <circle cx="16" cy="48" r="9" fill="#FF4D68" stroke="#073B4C" strokeWidth="2.8" />
        {/* Right: Blue */}
        <circle cx="68" cy="48" r="9" fill="#2F80ED" stroke="#073B4C" strokeWidth="2.8" />
        {/* Bottom: Matcha */}
        <circle cx="42" cy="70" r="8" fill="#A8B86B" stroke="#073B4C" strokeWidth="2.8" />
      </svg>
    ),
  },
  {
    title: 'Continuidad para tu historia',
    desc: 'Un lugar para documentarla y seguir trazando tu camino.',
    color: '#229B58',
    icon: (
      <svg width="108" height="66" viewBox="0 0 108 66" fill="none" className="feat-icon-anim-4" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Shadow infinity */}
        <path
          d="M 54 33 C 44 13, 18 13, 18 33 C 18 53, 44 53, 54 33 C 64 13, 90 13, 90 33 C 90 53, 64 53, 54 33 Z"
          stroke="rgba(7, 59, 76, 0.12)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Thick green infinity symbol */}
        <path
          d="M 54 33 C 44 13, 18 13, 18 33 C 18 53, 44 53, 54 33 C 64 13, 90 13, 90 33 C 90 53, 64 53, 54 33 Z"
          stroke="#138A8A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Small coral heart in center crossing */}
        <g transform="translate(54, 33)">
          <circle cx="0" cy="0" r="9" fill="#FF4D68" stroke="#ffffff" strokeWidth="2" />
          <path
            d="M 0 3.2 C -3 1.2 -4.2 -0.6 -4.2 -2 A 1.6 1.6 0 0 1 -1.2 -3.2 L 0 -2.1 L 1.2 -3.2 A 1.6 1.6 0 0 1 4.2 -2 C 4.2 -0.6 3 1.2 0 3.2 Z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    ),
  },
  {
    title: 'Un ecosistema que te acompaña',
    desc: 'Personas y organizaciones que pueden apoyar tu camino.',
    color: '#073B4C',
    icon: (
      <svg width="88" height="82" viewBox="0 0 88 82" fill="none" className="feat-icon-anim-5" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Outer dashed triangular connecting lines */}
        <line x1="44" y1="14" x2="18" y2="64" stroke="#073B4C" strokeWidth="2" strokeDasharray="4 4" opacity="0.35" />
        <line x1="44" y1="14" x2="70" y2="64" stroke="#073B4C" strokeWidth="2" strokeDasharray="4 4" opacity="0.35" />
        <line x1="18" y1="64" x2="70" y2="64" stroke="#073B4C" strokeWidth="2" strokeDasharray="4 4" opacity="0.35" />

        {/* Solid inner blue spokes */}
        <line x1="44" y1="44" x2="44" y2="14" stroke="#2F80ED" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="44" y1="44" x2="18" y2="64" stroke="#2F80ED" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="44" y1="44" x2="70" y2="64" stroke="#2F80ED" strokeWidth="3.5" strokeLinecap="round" />

        {/* Top vertex: Emerald circle */}
        <circle cx="44" cy="14" r="8" fill="#138A8A" stroke="#073B4C" strokeWidth="2.5" />
        {/* Bottom-left vertex: Coral circle */}
        <circle cx="18" cy="64" r="8" fill="#FF4D68" stroke="#073B4C" strokeWidth="2.5" />
        {/* Bottom-right vertex: Sun yellow circle */}
        <circle cx="70" cy="64" r="8" fill="#F4C84A" stroke="#073B4C" strokeWidth="2.5" />

        {/* Center hub node: Vibrant Blue circle with white center */}
        <circle cx="44" cy="44" r="9.5" fill="#2F80ED" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="44" cy="44" r="3.5" fill="#ffffff" />
      </svg>
    ),
  },
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

  return (
    <div style={{ background: '#f6eddf', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
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
        background: '#f6eddf', borderBottom: '1px solid #E5DCD2',
        height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 32px', boxSizing: 'border-box',
      }}>
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#012b29', letterSpacing: '-0.03em' }}>
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
                background: activeNav === link.id ? '#012b29' : 'transparent',
                color: activeNav === link.id ? '#fff' : '#012b29',
                border: '1.5px solid #012b29',
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
          color: '#012b29',
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
          color: '#4A5C5C',
          lineHeight: 1.6,
          maxWidth: 600,
          margin: 0,
          position: 'relative',
          zIndex: 2,
        }}>
          Un espacio para conocerte, descubrir posibilidades y conectar con personas con quienes puedas compartir lo que te importa.
        </p>
      </section>

      {/* ── SECTION 1: PRIMERO TE CONOCEMOS ── */}
      <div id="conocerte" style={{ position: 'relative' }}>
        {/* Top Wave: transition from #f6eddf to #b6c6cf */}
        <div style={{ lineHeight: 0, width: '100%', overflow: 'hidden', background: '#f6eddf' }}>
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            preserveAspectRatio="none"
            style={{ width: '100%', height: 'clamp(32px, 4.5vw, 60px)', display: 'block' }}
          >
            <path
              d="M0,0 C380,60 1060,60 1440,0 L1440,60 L0,60 Z"
              fill="#b6c6cf"
            />
          </svg>
        </div>

        <section
          style={{
            background: '#b6c6cf',
            padding: '40px 32px 48px',
          }}
        >
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <p style={{
              fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
              color: '#073B4C', textTransform: 'uppercase', marginBottom: 12,
            }}>
              PRIMERO, TE CONOCEMOS
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800, color: '#082a42ff',
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
                    background: '#fff',
                    borderRadius: 16,
                    padding: '28px 24px',
                    boxShadow: '0 4px 16px rgba(7, 59, 76, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
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
                    color: '#012b29', margin: 0, lineHeight: 1.3,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#4A5C5C', margin: 0, lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Wave: transition from #b6c6cf to #FFF9F2 */}
        <div style={{ lineHeight: 0, width: '100%', overflow: 'hidden', background: '#b6c6cf' }}>
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            preserveAspectRatio="none"
            style={{ width: '100%', height: 'clamp(32px, 4.5vw, 60px)', display: 'block' }}
          >
            <path
              d="M0,0 C380,60 1060,60 1440,0 L1440,60 L0,60 Z"
              fill="#FFF9F2"
            />
          </svg>
        </div>
      </div>

      {/* ── SECTION 2: DESPUÉS AVANZAMOS ── */}
      <section
        id="comunidad"
        style={{ background: '#FFF9F2', padding: '72px 32px' }}
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
            fontWeight: 800, color: '#012b29',
            margin: '0 0 12px', lineHeight: 1.2, maxWidth: 560,
          }}>
            Lo que recibes para seguir tu camino
          </h2>
          <p style={{ fontSize: 16, color: '#4A5C5C', margin: '0 0 48px', maxWidth: 520, lineHeight: 1.6 }}>
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
                  background: '#fff',
                  border: '1px solid #E5DCD2',
                  borderRadius: 20,
                  padding: '32px 24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'center',
                  boxShadow: '0 1px 6px rgba(1,43,41,0.05)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 88 }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#012b29', margin: 0, lineHeight: 1.3 }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: 13.5, color: '#4A5C5C', margin: 0, lineHeight: 1.6 }}>
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
                  background: '#fff',
                  border: '1px solid #E5DCD2',
                  borderRadius: 20,
                  padding: '32px 24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'center',
                  boxShadow: '0 1px 6px rgba(1,43,41,0.05)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 88 }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#012b29', margin: 0, lineHeight: 1.3 }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: 13.5, color: '#4A5C5C', margin: 0, lineHeight: 1.6 }}>
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
