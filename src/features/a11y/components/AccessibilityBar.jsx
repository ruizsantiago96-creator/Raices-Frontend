import { useEffect, useState, useRef, useCallback } from 'react'
import FocusTrap from 'focus-trap-react'
import EasySpeech from 'easy-speech'
import '@fontsource/atkinson-hyperlegible'
import '@fontsource/atkinson-hyperlegible/700.css'
import { useA11yStore, applyA11yAttributes } from '../store/a11yStore'

/* ── Iconos locales (trazo consistente, decorativos → aria-hidden) ── */
/* Filtros SVG para daltonismo — referenciados por CSS cuando data-colorblind está activo */
function ColorblindFilters() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <filter id="cb-deuteranopia">
          <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.700 0.300 0 0 0  0 0.300 0.700 0 0  0 0 0 1 0" />
        </filter>
        <filter id="cb-protanopia">
          <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
        </filter>
        <filter id="cb-tritanopia">
          <feColorMatrix type="matrix" values="0.950 0.050 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
  )
}

const I = {
  access: (s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M3.5 8.5 8 9.5h8l4.5-1M12 9.5V14m0 0-2.5 6.5M12 14l2.5 6.5"/></svg>,
  close: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  contrast: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" fill="currentColor"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>,
  book: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  motion: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M5 12l4-4M5 12l4 4"/><path d="M19 5v14" strokeDasharray="2 3"/></svg>,
  speaker: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>,
  stop: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>,
  reset: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>,
  darkMode: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  cursor: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/><path d="M4 4l3.24 7.39L12 8" fill="currentColor"/></svg>,
  guide: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/><circle cx="7" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="6" r="1.5" fill="currentColor"/><circle cx="17" cy="18" r="1.5" fill="currentColor"/></svg>,
  link: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  expand: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>,
  flash: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  eye: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  brain: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2a4 4 0 0 1 4 4c0 .73-.2 1.41-.54 2A4 4 0 0 1 18 10a4 4 0 0 1-1.76 3.32A4 4 0 0 1 14 18a4 4 0 0 1-2 .53A4 4 0 0 1 10 18a4 4 0 0 1-2.24-4.68A4 4 0 0 1 6 10a4 4 0 0 1 2.54-3.68A4 4 0 0 1 8 6a4 4 0 0 1 4-4z"/><path d="M12 2v20"/></svg>,
}

/* ── Síntesis de voz (easy-speech) ── */
function useSpeech() {
  const [supported, setSupported] = useState(false)
  const [ready, setReady] = useState(false)
  const voiceRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    EasySpeech.init({ verbose: false })
      .then(() => {
        setSupported(true)
        setReady(true)
        // Seleccionar voz en español
        const voices = EasySpeech.voices()
        const esVoice = voices.find(v => /es(-|_)?(MX|ES|419)?/i.test(v.lang))
        voiceRef.current = esVoice || null
      })
      .catch(() => setSupported(false))
  }, [])

  const speak = useCallback((text) => {
    if (!ready || !text?.trim()) return
    EasySpeech.cancel()
    EasySpeech.speak({
      text: text.trim().slice(0, 4000),
      lang: 'es-MX',
      rate: 0.96,
      pitch: 1,
      volume: 1,
      voice: voiceRef.current,
    })
  }, [ready])

  const stop = useCallback(() => {
    if (ready) EasySpeech.cancel()
  }, [ready])

  return { supported, speak, stop }
}

export default function AccessibilityBar() {
  const a11y = useA11yStore()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { supported: ttsSupported, speak, stop } = useSpeech()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const btnRef = useRef(null)
  const readingGuideRef = useRef(null)
  const flashRef = useRef(null)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)

  /* Cerrar panel al hacer click o tap fuera de él */
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      if (
        panelRef.current && !panelRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [open])

  /* Aplica preferencias al <html> cada vez que cambian */
  useEffect(() => { applyA11yAttributes(a11y) }, [a11y])

  /* Aplicar Atkinson Hyperlegible cuando easyRead está activo */
  useEffect(() => {
    const root = document.documentElement
    if (a11y.easyRead) {
      root.style.setProperty('--font-body', "'Atkinson Hyperlegible', system-ui, sans-serif")
      root.style.setProperty('--font-display', "'Atkinson Hyperlegible', system-ui, sans-serif")
    } else {
      root.style.removeProperty('--font-body')
      root.style.removeProperty('--font-display')
    }
  }, [a11y.easyRead])

  /* Guía de lectura: sigue la posición Y del mouse */
  useEffect(() => {
    if (!a11y.readingGuide) return
    const guide = readingGuideRef.current
    if (!guide) return

    const onMouseMove = (e) => {
      guide.style.top = `${e.clientY - 15}px`
      guide.style.opacity = '1'
    }
    const onMouseLeave = () => {
      guide.style.opacity = '0'
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [a11y.readingGuide])

  /* Cerrar con Escape (focus-trap maneja el foco automáticamente) */
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  /* Alertas visuales: flash en pantalla cuando hay notificaciones */
  useEffect(() => {
    if (!a11y.visualAlerts) return
    const flash = flashRef.current
    if (!flash) return

    const showFlash = () => {
      flash.style.opacity = '1'
      setTimeout(() => { flash.style.opacity = '0' }, 300)
    }

    // Escuchar eventos de notificación custom
    window.addEventListener('a11y-notify', showFlash)
    return () => window.removeEventListener('a11y-notify', showFlash)
  }, [a11y.visualAlerts])

  /* Leer al pasar el cursor por elementos interactivos o encabezados */
  useEffect(() => {
    if (!a11y.ttsEnabled || !ttsSupported) return

    let hoverTimer = null

    const getReadableText = (el) => {
      // Prioridad: aria-label → title → alt → texto visible
      const label = el.getAttribute('aria-label')
      if (label) return label
      const title = el.getAttribute('title')
      if (title) return title
      if (el.tagName === 'IMG') return el.getAttribute('alt') ?? ''
      // Para inputs/selects, leer su label asociado + placeholder
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
        const labelEl = el.id ? document.querySelector(`label[for="${el.id}"]`) : null
        const labelText = labelEl?.textContent?.trim() ?? ''
        const placeholder = el.getAttribute('placeholder') ?? ''
        return [labelText, placeholder].filter(Boolean).join(': ') || (el.getAttribute('name') ?? '')
      }
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ')
      return text.slice(0, 200)
    }

    const TARGETS = 'button, a, [role="button"], [role="link"], [role="switch"], [role="tab"], [role="menuitem"], [role="option"], input, select, textarea, h1, h2, h3, h4, label, [aria-label]'

    const onEnter = (e) => {
      const el = e.target.closest(TARGETS)
      if (!el) return
      const text = getReadableText(el)
      if (!text?.trim()) return
      clearTimeout(hoverTimer)
      hoverTimer = setTimeout(() => speak(text), 400)
    }

    const onLeave = () => clearTimeout(hoverTimer)

    document.addEventListener('mouseover', onEnter)
    document.addEventListener('mouseout', onLeave)
    return () => {
      clearTimeout(hoverTimer)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout', onLeave)
    }
  }, [a11y.ttsEnabled, ttsSupported, speak])

  const readPage = () => {
    const main = document.querySelector('main') || document.getElementById('a11y-root')
    if (main) speak(main.innerText)
  }

  const scaleLabels = { base: 'A', lg: 'A+', xl: 'A++' }

  return (
    <>
      <ColorblindFilters />
      {/* Botón flotante y su pestaña colapsable */}
      <div ref={triggerRef} style={{
        position: 'fixed',
        right: minimized ? 0 : 20,
        bottom: isMobile ? 80 : 20,
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: minimized ? 'translateX(50%)' : 'none',
      }}>
        {/* Botón de minimizar/maximizar (solo visible en móvil) */}
        {isMobile && (
          <button
            onClick={() => setMinimized(!minimized)}
            aria-label={minimized ? 'Mostrar botón de accesibilidad' : 'Ocultar botón de accesibilidad'}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--primary-dark)',
              border: '2px solid #fff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginRight: minimized ? 4 : -8,
              boxShadow: 'var(--shadow-sm)',
              zIndex: 1510,
              padding: 0,
            }}
          >
            {minimized ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}
          </button>
        )}

        <button
          ref={btnRef}
          onClick={() => {
            if (minimized) {
              setMinimized(false)
            } else {
              setOpen(o => !o)
            }
          }}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Opciones de accesibilidad"
          style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'var(--primary)', color: '#fff', border: '3px solid #fff',
            boxShadow: 'var(--shadow-lg)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: minimized ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {open ? I.close(26) : I.access(28)}
        </button>
      </div>

      {/* Panel con FocusTrap */}
      {open && (
        <FocusTrap
          focusTrapOptions={{
            returnFocusOnDeactivate: true,
            clickOutsideDeactivates: true,
            escapeDeactivates: false,
          }}
          onDeactivate={() => { setOpen(false); btnRef.current?.focus() }}
        >
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Opciones de accesibilidad"
          style={{
            position: 'fixed', right: 20, bottom: 92, zIndex: 1500,
            width: 320, maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            background: 'var(--bg-surface)', border: '2px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)',
            padding: 20, fontFamily: 'var(--font-body)',
            animation: 'slideUp 0.2s ease',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--primary)' }}>{I.access(22)}</span> Accesibilidad
          </h2>

          {/* ═══ SECCIÓN VISUAL ═══ */}
          <SectionHeader icon={I.eye()} label="Visual" color="var(--color-salud)" />

          <Toggle icon={I.darkMode()} label="Modo oscuro" on={a11y.darkMode} onToggle={a11y.toggleDarkMode} />

          <Group label="Tamaño de texto">
            <div role="group" aria-label="Tamaño de texto" style={{ display: 'flex', gap: 8 }}>
              {['base', 'lg', 'xl'].map(sz => {
                const active = a11y.textScale === sz
                return (
                  <button key={sz} onClick={() => a11y.setTextScale(sz)} aria-pressed={active}
                    style={{
                      flex: 1, minHeight: 48, borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      border: active ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                      background: active ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                      color: active ? 'var(--primary)' : 'var(--fg2)', fontWeight: 800,
                      fontSize: sz === 'base' ? 16 : sz === 'lg' ? 19 : 22, fontFamily: 'var(--font-body)',
                    }}>
                    {scaleLabels[sz]}
                  </button>
                )
              })}
            </div>
          </Group>

          <Toggle icon={I.contrast()} label="Alto contraste" on={a11y.highContrast} onToggle={a11y.toggleHighContrast} />

          <Group label="Modo daltónico">
            <div role="group" aria-label="Modo daltónico" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { value: 'none', label: 'Ninguno' },
                { value: 'deuteranopia', label: 'Deuteranopía' },
                { value: 'protanopia', label: 'Protanopía' },
                { value: 'tritanopia', label: 'Tritanopía' },
              ].map(m => {
                const active = (a11y.colorblindMode ?? 'none') === m.value
                return (
                  <button key={m.value} onClick={() => a11y.setColorblindMode(m.value)} aria-pressed={active}
                    style={{
                      minHeight: 40, borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      border: active ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                      background: active ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                      color: active ? 'var(--primary)' : 'var(--fg2)',
                      fontWeight: active ? 700 : 500, fontSize: 12,
                      fontFamily: 'var(--font-body)', padding: '6px 4px',
                    }}>
                    {m.label}
                  </button>
                )
              })}
            </div>
            {(a11y.colorblindMode ?? 'none') !== 'none' && (
              <p style={{ fontSize: 11, color: 'var(--fg3)', margin: '6px 0 0', lineHeight: 1.4 }}>
                Filtro activo: ajusta los colores para mayor distinción visual
              </p>
            )}
          </Group>

          <Toggle icon={I.cursor()} label="Cursor gigante" on={a11y.largeCursor} onToggle={a11y.toggleLargeCursor}
            hint="Cursor de alto contraste fosforescente para mejor visibilidad" />
          <Toggle icon={I.guide()} label="Guía de lectura" on={a11y.readingGuide} onToggle={a11y.toggleReadingGuide}
            hint="Barra horizontal que sigue el cursor para ayudar a leer" />
          <Toggle icon={I.link()} label="Resaltar enlaces" on={a11y.highlightLinks} onToggle={a11y.toggleHighlightLinks}
            hint="Subrayado grueso y bordes marcados en elementos clicables" />
          <Toggle icon={I.flash()} label="Alertas visuales" on={a11y.visualAlerts} onToggle={a11y.toggleVisualAlerts}
            hint="Convierte sonidos de notificación en destellos visuales" />

          {/* ═══ SECCIÓN COGNITIVA ═══ */}
          <SectionHeader icon={I.brain()} label="Cognitiva" color="var(--color-educacion)" />

          <Toggle icon={I.book()} label="Lectura fácil" on={a11y.easyRead} onToggle={a11y.toggleEasyRead}
            hint="Tipografía Atkinson Hyperlegible con mayor espaciado" />
          <Toggle icon={I.motion()} label="Reducir movimiento" on={a11y.reducedMotion} onToggle={a11y.toggleReducedMotion} />

          {/* ═══ SECCIÓN MOTOR ═══ */}
          <SectionHeader icon={I.expand()} label="Motor" color="var(--color-empleo)" />

          <Toggle icon={I.expand()} label="Espaciado motriz" on={a11y.motorSpacing} onToggle={a11y.toggleMotorSpacing}
            hint="Amplía áreas de clic/touch para facilitar la interacción" />

          {/* ═══ AUDITIVA ═══ */}
          {ttsSupported && (
            <>
              <SectionHeader icon={I.speaker()} label="Auditiva" color="var(--color-comunidad)" />
              <Toggle icon={I.speaker()} label="Leer al pasar el cursor" on={a11y.ttsEnabled} onToggle={a11y.toggleTts}
                hint="Pasa el cursor sobre botones, títulos o campos para escucharlos" />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={readPage} className="btn-secondary" style={{ flex: 1, fontSize: 14, padding: '10px', minHeight: 44 }}>
                  {I.speaker(16)} Leer página
                </button>
                <button onClick={stop} aria-label="Detener lectura"
                  style={{ minHeight: 44, minWidth: 44, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {I.stop()}
                </button>
              </div>
            </>
          )}

          {/* Restablecer */}
          <button onClick={() => { a11y.reset(); stop() }}
            style={{ marginTop: 16, width: '100%', minHeight: 44, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg3)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {I.reset()} Restablecer todo
          </button>
        </div>
        </FocusTrap>
      )}
      {/* Guía de lectura visual */}
      {a11y.readingGuide && (
        <div
          ref={readingGuideRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            height: '30px',
            background: 'linear-gradient(180deg, rgba(0,78,82,0.15) 0%, rgba(0,78,82,0.08) 50%, rgba(0,78,82,0.15) 100%)',
            borderTop: '2px solid rgba(0,78,82,0.4)',
            borderBottom: '2px solid rgba(0,78,82,0.4)',
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: 0,
            transition: 'opacity 0.15s ease',
          }}
        />
      )}
      {/* Flash de alerta visual */}
      {a11y.visualAlerts && (
        <div
          ref={flashRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            border: '6px solid var(--color-warning)',
            boxShadow: 'inset 0 0 80px rgba(241,250,63,0.4)',
            pointerEvents: 'none',
            zIndex: 10000,
            opacity: 0,
            transition: 'opacity 0.15s ease',
          }}
        />
      )}
    </>
  )
}

function SectionHeader({ icon, label, color = 'var(--primary)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 12px', paddingBottom: 6, borderBottom: `2px solid ${color}` }}>
      <span style={{ color, display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  )
}

function Group({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      {children}
    </div>
  )
}

function Toggle({ icon, label, on, onToggle, hint }) {
  const OFF_COLOR = '#556678'
  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={onToggle} role="switch" aria-checked={on}
        style={{
          width: '100%', minHeight: 52, padding: '8px 14px', borderRadius: 'var(--radius-sm)',
          border: on ? '2px solid var(--primary)' : `2px solid ${OFF_COLOR}`,
          background: on ? 'var(--primary-subtle)' : 'var(--bg-surface)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)',
          transition: 'border-color 0.2s',
        }}>
        <span style={{ color: on ? 'var(--primary)' : OFF_COLOR, flexShrink: 0, transition: 'color 0.2s' }}>{icon}</span>
        <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>{label}</span>
        <span aria-hidden="true" style={{ width: 44, height: 26, borderRadius: 13, background: on ? 'var(--primary)' : OFF_COLOR, position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
          <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
        </span>
      </button>
      {hint && <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '4px 0 0 40px', lineHeight: 1.4 }}>{hint}</p>}
    </div>
  )
}
