/**
 * StarRow — Componente reutilizable de calificación con estrellas.
 */
import { Icons } from '@shared/components/shared'

export interface StarRowProps {
  rating?: number
  size?: number
  interactive?: boolean
  onPick?: (n: number) => void
  hover?: number | null
  onHover?: (n: number | null) => void
}

export default function StarRow({
  rating = 0,
  size = 16,
  interactive = false,
  onPick,
  hover,
  onHover,
}: StarRowProps) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n: number) => {
        const active = interactive
          ? n <= (hover ?? rating)
          : n <= Math.round(rating ?? 0)
        return (
          <button
            key={n}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onPick ? () => onPick(n) : undefined}
            onMouseEnter={interactive && onHover ? () => onHover(n) : undefined}
            onMouseLeave={interactive && onHover ? () => onHover(null) : undefined}
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
