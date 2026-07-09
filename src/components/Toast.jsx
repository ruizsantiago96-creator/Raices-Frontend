import { useUiStore } from '../stores/uiStore'

const colors = {
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useUiStore()
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 1400, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 'min(380px, calc(100vw - 48px))' }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          role={t.type === 'error' ? 'alert' : 'status'}
          style={{
            background: colors[t.type] ?? colors.info, color: 'white',
            padding: '14px 18px', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)', fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 12, lineHeight: 1.4,
            animation: 'slideUp 0.2s ease',
          }}
        >
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Cerrar notificación"
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, minWidth: 28, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
