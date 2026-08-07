import { useUiStore } from '@shared/stores/uiStore'

const icons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
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
            background: `color-mix(in srgb, var(--color-${t.type === 'success' || t.type === 'error' || t.type === 'warning' || t.type === 'info' ? t.type : 'info'}) 8%, var(--bg-surface))`,
            border: `1px solid color-mix(in srgb, var(--color-${t.type === 'success' || t.type === 'error' || t.type === 'warning' || t.type === 'info' ? t.type : 'info'}) 40%, transparent)`,
            color: 'var(--fg1)',
            padding: '14px 18px', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)', fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 12, lineHeight: 1.4,
            animation: 'slideUp 0.2s ease',
          }}
        >
          {icons[t.type] ?? icons.info}
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Cerrar notificación"
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              minWidth: 28,
              color: 'var(--fg2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 16,
              lineHeight: 1,
              transition: 'background-color 0.2s, color 0.2s'
            }}
            onMouseEnter={(e) => {
              const typeColor = t.type === 'success' || t.type === 'error' || t.type === 'warning' || t.type === 'info' ? t.type : 'info';
              e.currentTarget.style.backgroundColor = `color-mix(in srgb, var(--color-${typeColor}) 12%, transparent)`;
              e.currentTarget.style.color = 'var(--fg1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--fg2)';
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
