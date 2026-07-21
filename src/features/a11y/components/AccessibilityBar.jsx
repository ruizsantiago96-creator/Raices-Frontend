import { useEffect, useState, useRef, useCallback } from 'react'
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
}

/* ── Síntesis de voz (Web Speech API) ── */
function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const speak = useCallback((text) => {
    if (!supported || !text?.trim()) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text.trim().slice(0, 4000))
    u.lang = 'es-MX'
    u.rate = 0.96
    const voices = window.speechSynthesis.getVoices()
    const es = voices.find(v => /es(-|_)?(MX|ES|419)?/i.test(v.lang))
    if (es) u.voice = es
    window.speechSynthesis.speak(u)
  }, [supported])
  const stop = useCallback(() => { if (supported) window.speechSynthesis.cancel() }, [supported])
  return { supported, speak, stop }
}

export default function AccessibilityBar() {
  const a11y = useA11yStore()
  const [open, setOpen] = useState(false)
  const { supported: ttsSupported, speak, stop } = useSpeech()
  const panelRef = useRef(null)
  const btnRef = useRef(null)

  /* Aplica preferencias al <html> cada vez que cambian */
  useEffect(() => { applyA11yAttributes(a11y) }, [a11y.textScale, a11y.highContrast, a11y.easyRead, a11y.reducedMotion, a11y.colorblindMode])

  /* Cerrar con Escape y clic fuera */
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus() } }
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !btnRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [open])

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
      {/* Botón flotante */}
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Opciones de accesibilidad"
        style={{
          position: 'fixed', right: 20, bottom: 20, zIndex: 1500,
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--primary)', color: '#fff', border: '3px solid #fff',
          boxShadow: 'var(--shadow-lg)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {open ? I.close(26) : I.access(28)}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Opciones de accesibilidad"
          style={{
            position: 'fixed', right: 20, bottom: 92, zIndex: 1500,
            width: 320, maxWidth: 'calc(100vw - 40px)',
            background: 'var(--bg-surface)', border: '2px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)',
            padding: 20, fontFamily: 'var(--font-body)',
            animation: 'slideUp 0.2s ease',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--primary)' }}>{I.access(22)}</span> Accesibilidad
          </h2>

          {/* Tamaño de texto */}
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

          {/* Toggles */}
          <Toggle icon={I.contrast()} label="Alto contraste" on={a11y.highContrast} onToggle={a11y.toggleHighContrast} />

          {/* Modo daltónico */}
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
          <Toggle icon={I.book()} label="Lectura fácil" on={a11y.easyRead} onToggle={a11y.toggleEasyRead} />
          <Toggle icon={I.motion()} label="Reducir movimiento" on={a11y.reducedMotion} onToggle={a11y.toggleReducedMotion} />

          {/* Lectura en voz */}
          {ttsSupported && (
            <>
              <Toggle icon={I.speaker()} label="Leer al pasar el cursor" on={a11y.ttsEnabled} onToggle={a11y.toggleTts}
                hint="Al activar, pasa el cursor sobre botones, títulos o campos para escucharlos" />
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
      )}
    </>
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
  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={onToggle} role="switch" aria-checked={on}
        style={{
          width: '100%', minHeight: 52, padding: '8px 14px', borderRadius: 'var(--radius-sm)',
          border: on ? '2px solid var(--primary)' : '2px solid var(--border-color)',
          background: on ? 'var(--primary-subtle)' : 'var(--bg-surface)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-body)',
        }}>
        <span style={{ color: on ? 'var(--primary)' : 'var(--fg3)', flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>{label}</span>
        <span aria-hidden="true" style={{ width: 44, height: 26, borderRadius: 13, background: on ? 'var(--primary)' : 'var(--border-strong)', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
          <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
        </span>
      </button>
      {hint && <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '4px 0 0 40px', lineHeight: 1.4 }}>{hint}</p>}
    </div>
  )
}
