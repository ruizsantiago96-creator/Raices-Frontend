import { useNavigate } from 'react-router-dom'
import { LeafIcon, Icons, BrandMark, AppFooter } from '@shared/components/shared'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuthStore } from '@features/auth'

gsap.registerPlugin(ScrollTrigger)

const LANDING_CATEGORIES = [
  { name: 'Salud', value: 'funcional', color: '#229B58', icon: Icons.heartPulse }, // Verde Vivo
  { name: 'Educación', value: 'educativo', color: '#CA918E', icon: Icons.graduationCap }, // Rosa Cálido
  { name: 'Empleo', value: 'laboral', color: '#F4C84A', icon: Icons.briefcase }, // Amarillo Sol
  { name: 'Comunidad', value: 'social', color: '#073B4C', icon: Icons.users }, // Azul Petróleo
  { name: 'Terapia', value: 'funcional', color: '#A8B86B', icon: Icons.activity }, // Verde Matcha
  { name: 'Recreación', value: 'social', color: '#CA918E', icon: Icons.target }, // Rosa Cálido
]

const FEATURES = [
  { icon: Icons.sparkles, title: 'Recomendaciones personalizadas', desc: 'Basadas en tus necesidades, metas y ubicación.', color: '#229B58' },
  { icon: Icons.shield, title: 'Confianza y seguridad', desc: 'Cada institución es verificada para ingresar a la comunidad.', color: '#CA918E' },
  { icon: Icons.users, title: 'Centrado en la familia', desc: 'Diseñado junto a familias, cuidadores y personas con discapacidad.', color: '#073B4C' },
  { icon: Icons.activity, title: 'Seguimiento de tu progreso', desc: 'Celebramos cada logro y compartimos historias que inspiran.', color: '#A8B86B' },
]

export default function LandingPage() {
  const nav = useNavigate()
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') nav('/admin', { replace: true })
      else if (user.role === 'institution') nav('/institution-portal', { replace: true })
      else nav('/dashboard', { replace: true })
    }
  }, [token, user, nav])

  const CATEGORIES = LANDING_CATEGORIES

  const pathRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const pathLength = path.getTotalLength()

    // Configuración inicial del trazado del SVG
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    })

    // Animación de dibujo de la línea con el scroll del usuario
    const scrollAnim = gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    })

    // Microinteracción para seguir y responder suavemente al cursor (mousemove)
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const width = window.innerWidth
      const height = window.innerHeight

      const x = (clientX / width) - 0.5
      const y = (clientY / height) - 0.5

      // Movimiento parallax sutil del contenedor del SVG
      gsap.to(svgRef.current, {
        x: x * 35,
        y: y * 35,
        duration: 1.5,
        ease: 'power3.out',
      })

      // Efecto elástico staggered en los nodos decorativos
      gsap.to('.linea-viva-node', {
        x: x * -30,
        y: y * -30,
        duration: 1.8,
        ease: 'elastic.out(1, 0.3)',
        stagger: 0.05,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      scrollAnim.scrollTrigger?.kill()
      scrollAnim.kill()
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const s = {
    page: {
      background: '#FFF9F2', // 40% Crema
      minHeight: '100vh',
      fontFamily: 'var(--font-body)',
      position: 'relative',
    },
    topbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(255, 249, 242, 0.85)', // Crema translúcido
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(7, 59, 76, 0.1)', // Borde sutil Azul Petróleo
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
    },
    section: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '80px 48px',
      position: 'relative',
      zIndex: 10,
    },
    grid4: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 24,
    },
    catCard: (_color) => ({
      background: 'rgba(255, 249, 242, 0.65)', // Glassmorphism Crema
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(7, 59, 76, 0.1)', // Borde sutil Azul Petróleo
      borderRadius: 'var(--radius-md)',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      cursor: 'pointer',
      boxShadow: '0 8px 32px 0 rgba(7, 59, 76, 0.04)',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    }),
    catIcon: (color) => ({
      width: 48,
      height: 48,
      borderRadius: '50% 50% 50% 14%',
      background: `color-mix(in oklch, ${color} 15%, transparent)`,
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    featCard: {
      background: 'rgba(255, 249, 242, 0.65)', // Glassmorphism Crema
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(7, 59, 76, 0.1)',
      borderRadius: 'var(--radius-md)',
      padding: 28,
      boxShadow: '0 8px 32px 0 rgba(7, 59, 76, 0.04)',
    },
    sectionTitle: {
      fontFamily: 'var(--font-display)',
      fontSize: 36,
      fontWeight: 700,
      color: '#073B4C', // 25% Azul Petróleo
      margin: '0 0 8px',
    },
    sectionSub: {
      fontSize: 18,
      color: 'rgba(7, 59, 76, 0.75)', // Azul Petróleo suave
      marginBottom: 40,
    },
  }

  return (
    <div style={s.page}>
      {/* Línea Viva SVG de Fondo */}
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none z-0 select-none opacity-55"
        viewBox="0 0 1440 3800"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="lineaVivaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#229B58" /> {/* Verde Vivo */}
            <stop offset="25%" stopColor="#A8B86B" /> {/* Verde Matcha */}
            <stop offset="50%" stopColor="#F4C84A" /> {/* Amarillo Sol */}
            <stop offset="75%" stopColor="#CA918E" /> {/* Rosa Cálido */}
            <stop offset="100%" stopColor="#073B4C" /> {/* Azul Petróleo */}
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d="M 1440,200 C 900,380 1100,700 500,900 C -100,1100 100,1650 800,1850 C 1500,2050 1100,2550 300,2850 C -200,3150 200,3550 720,3800"
          fill="none"
          stroke="url(#lineaVivaGradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Nodos de luz decorativos */}
        <circle className="linea-viva-node" cx="1100" cy="500" r="14" fill="#F4C84A" filter="blur(3px)" /> {/* Amarillo Sol */}
        <circle className="linea-viva-node" cx="300" cy="1200" r="18" fill="#CA918E" filter="blur(2px)" /> {/* Rosa Cálido */}
        <circle className="linea-viva-node" cx="950" cy="2100" r="12" fill="#F4C84A" /> {/* Amarillo Sol */}
        <circle className="linea-viva-node" cx="200" cy="2900" r="16" fill="#229B58" filter="blur(4px)" /> {/* Verde Vivo */}
      </svg>

      {/* Topbar */}
      <header className="landing-topbar" style={s.topbar}>
        <BrandMark />
        <nav className="landing-nav" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button onClick={() => nav('/explore')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: '#073B4C' }} className="hover:opacity-80 transition-opacity">Explorar</button>
        </nav>
        <div className="landing-auth" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {token ? (
            <button 
              onClick={() => {
                if (user?.role === 'admin') nav('/admin')
                else if (user?.role === 'institution') nav('/institution-portal')
                else nav('/dashboard')
              }} 
              className="btn-primary hover:scale-[1.05] active:scale-95 transition-all duration-300" 
              style={{ fontSize: 15, padding: '10px 24px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Ir a mi panel
            </button>
          ) : (
            <>
              <button onClick={() => nav('/auth')} className="btn-login-responsive hover:opacity-80 transition-opacity" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'rgba(7, 59, 76, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="auth-text">Iniciar sesión</span>
                <span className="auth-icon" style={{ display: 'none' }}>{Icons.user({ s: 20 })}</span>
              </button>
              <button onClick={() => nav('/auth?mode=register')} className="btn-primary hover:bg-[#FF3352] hover:scale-[1.05] hover:shadow-lg hover:shadow-[#FF4D68]/20 active:scale-95 transition-all duration-300" style={{ fontSize: 15, padding: '10px 24px', background: '#FF4D68', color: '#fff', border: 'none', cursor: 'pointer' }}>Registrarse</button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', margin: '0 auto', maxWidth: 850 }}>
        <div className="hero-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(202, 145, 142, 0.15)', border: '1px solid rgba(202, 145, 142, 0.3)', color: '#073B4C', borderRadius: 'var(--radius-pill)', padding: '6px 16px', fontSize: 13, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#CA918E', display: 'inline-block' }}></span> Ecosistema digital inclusivo
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: '#073B4C', margin: 0, lineHeight: 1.15, maxWidth: '780px' }}>
            Encontramos tu camino<br />
            <span className="relative inline-block text-[#073B4C] z-10">
              para
            </span>{' '}
            <span className="relative inline-block text-[#FF4D68] z-10">
              florecer.
              <span className="absolute -bottom-2 left-0 w-full h-[12px] pointer-events-none select-none -z-10" style={{ transform: 'translateY(2px)' }}>
                <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                  <path d="M 0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5" fill="none" stroke="#F4C84A" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(7, 59, 76, 0.85)', marginTop: 24, lineHeight: 1.6, maxWidth: 680, margin: '24px auto 0' }}>
            Conectamos a personas con discapacidad, tutores e instituciones en México a través de una red accesible, transparente y libre de estereotipos.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => nav('/auth?mode=register')} className="btn-primary hover:bg-[#FF3352] hover:scale-[1.03] hover:shadow-lg hover:shadow-[#FF4D68]/20 active:scale-95 transition-all duration-300" style={{ fontSize: 18, padding: '14px 36px', background: '#FF4D68', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Comenzar camino →
            </button>
            <button onClick={() => nav('/explore')} className="btn-secondary hover:scale-[1.03] active:scale-95 transition-all duration-300" style={{ fontSize: 18, padding: '14px 36px', background: 'rgba(7, 59, 76, 0.08)', color: '#073B4C', border: '1px solid rgba(7, 59, 76, 0.15)', cursor: 'pointer' }}>
              Ver instituciones
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(7, 59, 76, 0.7)', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {Icons.shield({ s: 14 })} Sin costo · Curado y verificado · Privacidad protegida
          </p>
        </div>
      </section>

      {/* Categories */}
      <section style={{ background: 'rgba(255, 249, 242, 0.4)', borderTop: '1px solid rgba(7, 59, 76, 0.1)', borderBottom: '1px solid rgba(7, 59, 76, 0.1)', position: 'relative', zIndex: 10 }}>
        <div className="landing-section" style={{ ...s.section, paddingTop: 64, paddingBottom: 64 }}>
          <div className="scroll-reveal">
            <h2 className="landing-section-title" style={s.sectionTitle}>Caminos hacia el florecimiento</h2>
            <p className="landing-section-sub" style={s.sectionSub}>Explora las áreas donde podemos conectarte con apoyo real</p>
          </div>
          <div style={s.grid4}>
            {CATEGORIES.map((cat, i) => (
              <div key={cat.name} className={`scroll-reveal scroll-reveal-delay-${i + 1} hover:-translate-y-2 hover:scale-[1.015] transition-all duration-500 hover:shadow-lg`} style={s.catCard(cat.color)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(7, 59, 76, 0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(7, 59, 76, 0.1)'; e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(7, 59, 76, 0.04)' }}
                onClick={() => nav(`/explore?category=${encodeURIComponent(cat.value)}`)}
              >
                <div style={s.catIcon(cat.color)}>{cat.icon({ s: 22 })}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#073B4C' }}>{cat.name}</div>
                <div style={{ color: 'rgba(7, 59, 76, 0.7)', fontSize: 13 }} className="group">Ver instituciones <span className="inline-block group-hover:translate-x-1 transition-transform">{Icons.arrowRight({ s: 14 })}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section" style={s.section}>
        <div className="scroll-reveal">
          <h2 className="landing-section-title" style={s.sectionTitle}>¿Por qué Raíces para florecer?</h2>
          <p className="landing-section-sub" style={s.sectionSub}>Un ecosistema que acompaña, no solo informa</p>
        </div>
        <div style={s.grid4}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`scroll-reveal scroll-reveal-delay-${i + 1} hover:-translate-y-2 hover:scale-[1.015] transition-all duration-500 hover:shadow-lg`} style={{ ...s.featCard, border: '1px solid rgba(7, 59, 76, 0.1)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50% 50% 50% 14%', background: `color-mix(in oklch, ${f.color} 15%, transparent)`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {f.icon({ s: 20 })}
              </div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 700, color: '#073B4C', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(7, 59, 76, 0.8)', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-cta scroll-reveal-scale" style={{ background: 'rgba(255, 249, 242, 0.65)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(7, 59, 76, 0.1)', padding: '80px 48px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: '#073B4C', margin: '0 0 16px' }}>
          Empieza hoy, sin costo
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(7, 59, 76, 0.8)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Crea tu perfil, descubre instituciones y conecta con la comunidad en minutos.
        </p>
        <button onClick={() => nav('/auth?mode=register')} className="btn-primary hover:bg-[#FF3352] hover:scale-[1.05] hover:shadow-lg hover:shadow-[#FF4D68]/20 active:scale-95 transition-all duration-300" style={{ fontSize: 18, padding: '14px 40px', background: '#FF4D68', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Crear mi cuenta {Icons.arrowRight({ s: 18 })}
        </button>
        <p style={{ fontSize: 13, color: 'rgba(7, 59, 76, 0.7)', marginTop: 16 }}>
          Demo: demo@raices.mx / Demo1234
        </p>
      </section>

      <AppFooter />
    </div>
  )
}
