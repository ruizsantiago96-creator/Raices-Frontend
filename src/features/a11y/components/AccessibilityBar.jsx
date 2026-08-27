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
  
  // Posicion del boton flotante y estado de arrastre (Draggable accessibility button)
  const [position, setPosition] = useState({ right: 20, bottom: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const wasDraggingRef = useRef(false)
  const dragStartRef = useRef({ startX: 0, startY: 0, startRight: 0, startBottom: 0 })

  const { supported: ttsSupported, speak, stop } = useSpeech()

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setPosition(pos => ({
        ...pos,
        bottom: mobile ? 80 : 20
      }))
    }
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

  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    isDraggingRef.current = true
    wasDraggingRef.current = false
    setIsDragging(true)
    
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      startRight: position.right,
      startBottom: position.bottom
    }

    if (e.touches) {
      document.addEventListener('touchmove', handleDragMove, { passive: false })
      document.addEventListener('touchend', handleDragEnd)
    } else {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
    }
  }

  const handleDragMove = (e) => {
    if (!isDraggingRef.current) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const { startX, startY, startRight, startBottom } = dragStartRef.current

    const dx = clientX - startX
    const dy = clientY - startY

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      wasDraggingRef.current = true
    }

    const newRight = Math.max(10, Math.min(window.innerWidth - 58, startRight - dx))
    const newBottom = Math.max(10, Math.min(window.innerHeight - 58, startBottom - dy))

    setPosition({
      right: newRight,
      bottom: newBottom
    })

    if (e.cancelable) {
      e.preventDefault()
    }
  }

  const handleDragEnd = () => {
    isDraggingRef.current = false
    setIsDragging(false)
    
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('touchend', handleDragEnd)

    if (wasDraggingRef.current) {
      setTimeout(() => {
        wasDraggingRef.current = false
      }, 50)
    }
  }

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('touchmove', handleDragMove)
      document.removeEventListener('touchend', handleDragEnd)
    }
  }, [])

  const getPanelStyle = () => {
    const isTopHalf = position.bottom > window.innerHeight / 2
    const isLeftHalf = position.right > window.innerWidth / 2

    const panelStyle = {
      position: 'fixed',
      zIndex: 1500,
      width: 320,
      maxWidth: 'calc(100vw - 40px)',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      borderRadius: '24px',
      padding: 20,
      fontFamily: 'var(--font-body)',
      animation: 'slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }

    if (isTopHalf) {
      panelStyle.top = window.innerHeight - position.bottom + 12
    } else {
      panelStyle.bottom = position.bottom + 58
    }

    if (isLeftHalf) {
      panelStyle.left = Math.max(20, window.innerWidth - position.right - 320 + 24)
    } else {
      panelStyle.right = position.right
    }

    return panelStyle
  }

  const scaleLabels = { base: 'A', lg: 'A+', xl: 'A++' }

  return (
    <>
      <ColorblindFilters />
      {/* Botón flotante y su pestaña colapsable */}
      <div ref={triggerRef} style={{
        position: 'fixed',
        right: minimized ? 0 : position.right,
        bottom: position.bottom,
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        transition: isDragging ? 'none' : 'right 0.3s ease, bottom 0.3s ease, transform 0.3s ease',
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
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={(e) => {
            if (wasDraggingRef.current) {
              e.preventDefault()
              e.stopPropagation()
              return
            }
            if (minimized) {
              setMinimized(false)
            } else {
              setOpen(o => !o)
            }
          }}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Opciones de accesibilidad"
          className="liquid-glass-trigger"
          style={{
            width: 48, height: 48, borderRadius: '50%',
            color: '#fff', cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: minimized ? 0.7 : 1,
            touchAction: 'none'
          }}
        >
          {open ? I.close(20) : I.access(22)}
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
          className="liquid-glass-panel"
          style={getPanelStyle()}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--color-coral, #FF4D68)' }}>{I.access(22)}</span> Accesibilidad
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
                    className={`glass-button ${active ? 'active' : ''}`}
                    style={{
                      flex: 1, minHeight: 48, borderRadius: '12px', cursor: 'pointer',
                      fontWeight: 800,
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
                    className={`glass-button ${active ? 'active' : ''}`}
                    style={{
                      minHeight: 40, borderRadius: '10px', cursor: 'pointer',
                      fontSize: 12, fontWeight: active ? 700 : 500,
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
                <button onClick={readPage} className="glass-button" style={{ flex: 1, fontSize: 14, padding: '10px', minHeight: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--fg1)', fontWeight: 700 }}>
                  {I.speaker(16)} Leer página
                </button>
                <button onClick={stop} aria-label="Detener lectura"
                  className="glass-button"
                  style={{ minHeight: 44, minWidth: 44, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg2)' }}>
                  {I.stop()}
                </button>
              </div>
            </>
          )}

          {/* Restablecer */}
          <button onClick={() => { a11y.reset(); stop() }}
            className="glass-button"
            style={{ marginTop: 16, width: '100%', minHeight: 44, borderRadius: '12px', color: 'var(--fg3)', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
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
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .liquid-glass-panel {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.45);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
            0 12px 40px 0 rgba(31, 38, 135, 0.08),
            0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        html[data-theme="dark"] .liquid-glass-panel {
          background: rgba(20, 32, 32, 0.65);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
            0 12px 40px 0 rgba(0, 0, 0, 0.45),
            0 1px 2px 0 rgba(0, 0, 0, 0.15);
        }
        
        .glass-button {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.3);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.35);
          border-color: rgba(0, 0, 0, 0.1);
          transform: translateY(-1.5px);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
            0 6px 15px rgba(0, 0, 0, 0.04);
        }
        
        .glass-button:active {
          transform: translateY(0);
        }
        
        .glass-button.active {
          background: color-mix(in srgb, var(--color-coral, #FF4D68) 15%, rgba(255, 255, 255, 0.45));
          border-color: var(--color-coral, #FF4D68);
          border-width: 1.5px;
          color: var(--color-coral, #FF4D68) !important;
          font-weight: 800 !important;
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
            0 4px 12px rgba(255, 77, 104, 0.15);
        }
        
        .glass-button.active:hover {
          background: color-mix(in srgb, var(--color-coral, #FF4D68) 22%, rgba(255, 255, 255, 0.55));
        }
        
        html[data-theme="dark"] .glass-button {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
        }
        
        html[data-theme="dark"] .glass-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
            0 6px 15px rgba(0, 0, 0, 0.2);
        }
        
        html[data-theme="dark"] .glass-button.active {
          background: color-mix(in srgb, var(--color-coral, #FF4D68) 25%, rgba(255, 255, 255, 0.02));
          border-color: var(--color-coral, #FF4D68);
          color: var(--color-coral, #FF4D68) !important;
          box-shadow: 
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
            0 4px 12px rgba(255, 77, 104, 0.2);
        }
        
        html[data-theme="dark"] .glass-button.active:hover {
          background: color-mix(in srgb, var(--color-coral, #FF4D68) 35%, rgba(255, 255, 255, 0.04));
        }

        .liquid-glass-trigger {
          background: #4d7e55 !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 
            inset 0 1.5px 0 0 rgba(255, 255, 255, 0.3),
            0 8px 30px rgba(77, 126, 85, 0.25);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .liquid-glass-trigger:hover {
          transform: translateY(-2px) scale(1.04);
          background: #3c6b44 !important;
          box-shadow: 
            inset 0 1.5px 0 0 rgba(255, 255, 255, 0.4),
            0 12px 35px rgba(77, 126, 85, 0.35);
        }

        .liquid-glass-trigger:active {
          transform: translateY(0) scale(0.96);
        }

        html[data-theme="dark"] .liquid-glass-trigger {
          box-shadow: 
            inset 0 1.5px 0 0 rgba(255, 255, 255, 0.15),
            0 8px 30px rgba(0, 0, 0, 0.5);
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .glass-switch {
          width: 46px;
          height: 26px;
          border-radius: 13px;
          background: rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.04);
          position: relative;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
        }

        .glass-switch.active {
          background: var(--color-coral, #FF4D68);
          border-color: var(--color-coral, #FF4D68);
        }

        .glass-switch-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }

        .glass-switch.active .glass-switch-thumb {
          left: 22px;
          box-shadow: 0 2px 6px rgba(255, 77, 104, 0.3);
        }

        html[data-theme="dark"] .glass-switch {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.08);
        }

        html[data-theme="dark"] .glass-switch.active .glass-switch-thumb {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }
      `}</style>
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
        className={`glass-button ${on ? 'active' : ''}`}
        style={{
          width: '100%', minHeight: 52, padding: '8px 14px', borderRadius: '14px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)',
        }}>
        <span style={{ color: on ? 'var(--color-coral, #FF4D68)' : OFF_COLOR, flexShrink: 0, transition: 'color 0.25s' }}>{icon}</span>
        <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>{label}</span>
        <span aria-hidden="true" className={`glass-switch ${on ? 'active' : ''}`}>
          <span className="glass-switch-thumb" />
        </span>
      </button>
      {hint && <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '4px 0 0 40px', lineHeight: 1.4 }}>{hint}</p>}
    </div>
  )
}
