import { useState, useEffect, useRef } from 'react'

/* ════════════════════ Componentes UI base ════════════════════ */
const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }

export function Card({ children, style, className }) {
  return <div className={className} style={{ ...card, padding: 24, ...style }}>{children}</div>
}

export function SectionTitle({ icon, children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ color: 'var(--primary)' }}>{icon}</span>}
        {children}
      </h2>
      {right}
    </div>
  )
}

export function Skeleton({ w = '100%', h = 16, r = 6, style }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', ...style }} />
}

export function EmptyState({ icon, title, sub }) {
  return (
    <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ color: 'var(--fg3)', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg2)', margin: 0 }}>{title}</p>
      {sub && <p style={{ fontSize: 13, color: 'var(--fg3)', marginTop: 4 }}>{sub}</p>}
    </Card>
  )
}

/* ════════════════════ Animated Counter ════════════════════ */
export function AnimatedCounter({ value, duration = 800, style }) {
  const numVal = typeof value === 'number' ? value : parseInt(value, 10)
  const safeVal = (value == null || value === 0) ? 0 : (isNaN(numVal) ? 0 : numVal)
  const [display, setDisplay] = useState(safeVal)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (safeVal === 0) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true
        const start = performance.now()
        const animate = (now) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(eased * safeVal))
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      }
    }, { threshold: 0.3 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [safeVal, duration])

  return <span ref={ref} style={style} className="animate-counter">{display}</span>
}

/* ── Barra horizontal con etiqueta ── */
export function HBar({ label, value, max, color = 'var(--primary)', suffix }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: 'var(--fg2)', fontWeight: 600, textTransform: 'capitalize' }}>{label}</span>
        <span style={{ color: 'var(--fg1)', fontWeight: 700 }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...card, padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: danger ? 'color-mix(in oklch, var(--color-error) 14%, transparent)' : 'var(--primary-subtle)', color: danger ? 'var(--color-error)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {danger ? '⚠️' : '🛡️'}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={onCancel}>Cancelar</button>
          <button onClick={onConfirm} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: danger ? 'var(--color-error)' : 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
