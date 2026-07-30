/**
 * BackendFallback - Componente reutilizable para mostrar cuando el backend no está disponible.
 * 
 * Cumple con la regla: "Si la API no está disponible, el endpoint falla (404/501) 
 * o faltan variables de entorno, NUNCA romper la aplicación ni dejar pantallas en blanco."
 * 
 * Renderiza un mensaje informativo especificando exactamente qué ruta, método 
 * o contrato requiere implementar el equipo de Backend.
 */

import { Icons } from './shared'

// ─── Estilos del fallback ─────────────────────────────────
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '48px 24px',
    textAlign: 'center',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'color-mix(in oklch, var(--color-warning) 15%, transparent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--fg1)',
    margin: '0 0 12px',
  },
  message: {
    fontSize: 15,
    color: 'var(--fg2)',
    margin: '0 0 24px',
    lineHeight: 1.6,
    maxWidth: 500,
  },
  endpointBox: {
    background: 'var(--bg-cool)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '16px 20px',
    maxWidth: '100%',
    width: 'fit-content',
    marginBottom: 24,
  },
  endpointLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--fg3)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 8,
  },
  methodBadge: (method) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'monospace',
    background: method === 'GET' 
      ? 'color-mix(in oklch, var(--color-info) 15%, transparent)'
      : method === 'POST'
      ? 'color-mix(in oklch, var(--color-success) 15%, transparent)'
      : method === 'PUT' || method === 'PATCH'
      ? 'color-mix(in oklch, var(--color-warning) 15%, transparent)'
      : 'color-mix(in oklch, var(--color-error) 15%, transparent)',
    color: method === 'GET' 
      ? 'var(--color-info)'
      : method === 'POST'
      ? 'var(--color-success)'
      : method === 'PUT' || method === 'PATCH'
      ? 'var(--color-warning)'
      : 'var(--color-error)',
    marginRight: 8,
  }),
  endpointPath: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--fg1)',
  },
  contractBox: {
    background: 'var(--bg-warm)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '16px 20px',
    maxWidth: '100%',
    width: 'fit-content',
    textAlign: 'left',
    marginBottom: 24,
  },
  contractLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--fg3)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 8,
  },
  contractCode: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: 'var(--fg2)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  retryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: 44,
  },
}

/**
 * @param {Object} props
 * @param {string} props.method - Método HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param {string} props.endpoint - Ruta del endpoint (ej: /api/usuarios)
 * @param {string} [props.title] - Título personalizado del fallback
 * @param {string} [props.message] - Mensaje personalizado
 * @param {string} [props.contract] - Descripción del contrato esperado
 * @param {Function} [props.onRetry] - Callback para reintentar
 * @param {string} [props.retryLabel] - Texto del botón de reintento
 */
export default function BackendFallback({
  method = 'GET',
  endpoint = '/api/endpoint',
  title = 'Backend no disponible',
  message = 'Este servicio aún no está implementado en el backend. El equipo de desarrollo debe crear este endpoint para que la funcionalidad esté disponible.',
  contract,
  onRetry,
  retryLabel = 'Reintentar',
}) {
  return (
    <div style={styles.container} role="alert" aria-live="polite">
      {/* Icono de advertencia */}
      <div style={styles.iconContainer}>
        {Icons.shieldAlert({ s: 32 })}
      </div>

      {/* Título */}
      <h2 style={styles.title}>{title}</h2>

      {/* Mensaje descriptivo */}
      <p style={styles.message}>{message}</p>

      {/* Información del endpoint */}
      <div style={styles.endpointBox}>
        <div style={styles.endpointLabel}>Endpoint requerido</div>
        <div>
          <span style={styles.methodBadge(method)}>{method}</span>
          <span style={styles.endpointPath}>{endpoint}</span>
        </div>
      </div>

      {/* Contrato esperado (opcional) */}
      {contract && (
        <div style={styles.contractBox}>
          <div style={styles.contractLabel}>Contrato esperado</div>
          <code style={styles.contractCode}>{contract}</code>
        </div>
      )}

      {/* Botón de reintento */}
      {onRetry && (
        <button
          onClick={onRetry}
          style={styles.retryButton}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--primary-dark)'
            e.target.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--primary)'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}

/**
 * Componente inline para mostrar fallback en-loading states
 */
export function BackendFallbackInline({ method, endpoint, compact = false }) {
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        background: 'color-mix(in oklch, var(--color-warning) 8%, transparent)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 13,
        color: 'var(--fg2)',
      }}>
        {Icons.shieldAlert({ s: 14 })}
        <span>
          <span style={styles.methodBadge(method)}>{method}</span>
          <code style={{ fontFamily: 'monospace' }}>{endpoint}</code> no disponible
        </span>
      </div>
    )
  }

  return <BackendFallback method={method} endpoint={endpoint} />
}
