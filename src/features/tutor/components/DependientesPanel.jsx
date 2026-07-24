import { useDependientes } from '../hooks/useDependientes'
import { Icons } from '@shared/components/shared'

/**
 * Panel que muestra la lista de dependientes del usuario.
 *
 * Estados de UI:
 * - Loading: skeleton shimmer
 * - Error: mensaje estilizado con error.message si disponible
 * - Empty: estado vacío orientativo
 * - Data: grid de tarjetas con datos seguros (optional chaining)
 */
export default function DependientesPanel() {
  const { data, isLoading, isError, error } = useDependientes()

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {[0, 1].map(i => (
          <div key={i} style={skeletonCard}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--border-color)', animation: 'pulse 1.5s infinite', marginBottom: 14 }} />
            <div style={{ width: '60%', height: 18, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s infinite', marginBottom: 10 }} />
            <div style={{ width: '40%', height: 14, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>
    )
  }

  /* ── Error ── */
  if (isError) {
    return (
      <div style={errorBox}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-error) 15%, transparent)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Icons.shieldAlert({ s: 18 })}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--color-error)', margin: 0 }}>
            Error al cargar dependientes
          </h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
          {error?.message || 'No se pudieron obtener los datos. Intenta de nuevo más tarde.'}
        </p>
      </div>
    )
  }

  /* ── Empty State ── */
  if (data?.length === 0) {
    return (
      <div style={emptyBox}>
        <div style={{ width: 64, height: 64, borderRadius: '50% 50% 50% 18%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          {Icons.users({ s: 30 })}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>No hay dependientes registrados</h2>
        <p style={{ fontSize: 15, color: 'var(--fg2)', marginBottom: 0, maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>
          Registra a las personas que cuidas para guardar sus necesidades y encontrar las mejores instituciones para cada una.
        </p>
      </div>
    )
  }

  /* ── Data ── */
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
      {data?.map((dep, i) => (
        <DependienteCard key={dep?.id ?? `dep-${i}`} dep={dep} />
      ))}
    </div>
  )
}

/* ── Tarjeta individual ── */
function DependienteCard({ dep }) {
  const nombre = dep?.full_name || dep?.nombre || 'Sin nombre'
  const relacion = dep?.relationship || dep?.relacion || ''
  const discapacidades = dep?.disability_types ?? dep?.discapacidades ?? []

  const initials = nombre.split(' ').map(w => w?.[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50% 50% 50% 16%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{nombre}</h3>
          {relacion && <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '2px 0 0' }}>{relacion}</p>}
        </div>
      </div>

      {discapacidades?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {discapacidades.map((d, i) => (
            <span key={i} style={{ padding: '4px 12px', borderRadius: 16, fontSize: 12.5, fontWeight: 600, background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              {d}
            </span>
          ))}
        </div>
      )}

      {dep?.notes && (
        <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5, background: 'var(--bg-warm)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
          {dep.notes}
        </p>
      )}
    </div>
  )
}

/* ── Estilos reutilizables ── */
const cardBase = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }

const skeletonCard = { ...cardBase, padding: 22 }

const cardStyle = { ...cardBase, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }

const errorBox = {
  ...cardBase,
  padding: '28px 24px',
  border: '2px solid color-mix(in oklch, var(--color-error) 30%, transparent)',
  background: 'color-mix(in oklch, var(--color-error) 4%, var(--bg-surface))',
}

const emptyBox = {
  ...cardBase,
  padding: '56px 24px',
  textAlign: 'center',
}
