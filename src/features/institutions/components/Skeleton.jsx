/**
 * Skeleton — Componente de carga reutilizable con efecto shimmer.
 *
 * Props:
 *   w      — Ancho (default: '100%')
 *   h      — Alto (default: 18)
 *   radius — Border radius (default: 6)
 *   mb     — Margin bottom (default: 0)
 */

export default function Skeleton({ w = '100%', h = 18, radius = 6, mb = 0 }) {
  return (
    <div style={{
        width: w, height: h, borderRadius: radius,
        background: 'linear-gradient(90deg, var(--border-color) 25%, color-mix(in oklch, var(--border-color) 60%, white) 50%, var(--border-color) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        marginBottom: mb,
      }} />
  )
}
