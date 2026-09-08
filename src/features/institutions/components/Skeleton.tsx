/**
 * Skeleton — Componente de carga reutilizable con efecto shimmer.
 */
export interface SkeletonProps {
  w?: string | number
  h?: string | number
  radius?: string | number
  mb?: string | number
}

export default function Skeleton({ w = '100%', h = 18, radius = 6, mb = 0 }: SkeletonProps) {
  return (
    <div style={{
        width: typeof w === 'number' ? `${w}px` : w,
        height: typeof h === 'number' ? `${h}px` : h,
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
        background: 'linear-gradient(90deg, var(--border-color) 25%, color-mix(in oklch, var(--border-color) 60%, white) 50%, var(--border-color) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        marginBottom: typeof mb === 'number' ? `${mb}px` : mb,
      }} />
  )
}
