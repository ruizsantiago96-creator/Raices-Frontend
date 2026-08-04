/**
 * StarRow — Componente reutilizable de calificación con estrellas.
 *
 * Props:
 *   rating     — Número de estrellas activas (0-5)
 *   size       — Tamaño del ícono de estrella (default: 16)
 *   interactive — Si es true, permite seleccionar estrellas (default: false)
 *   onPick     — Callback al hacer clic en una estrella
 *   hover      — Estado de hover actual
 *   onHover    — Callback al hacer hover sobre una estrella
 */

import { Icons } from '@shared/components/shared'

export default function StarRow({ rating, size = 16, interactive = false, onPick, hover, onHover }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const active = interactive
          ? n <= (hover ?? rating)
          : n <= Math.round(rating ?? 0)
        return (
          <button
            key={n}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onPick(n) : undefined}
            onMouseEnter={interactive ? () => onHover(n) : undefined}
            onMouseLeave={interactive ? () => onHover(null) : undefined}
            style={{
              background: 'none',
              border: 'none',
              padding: 2,
              cursor: interactive ? 'pointer' : 'default',
              color: active ? '#D4944C' : 'var(--border-color)',
              fontSize: 0,
              lineHeight: 0,
              display: 'inline-flex',
            }}
          >
            {Icons.star({ s: size, filled: active })}
          </button>
        )
      })}
    </div>
  )
}
