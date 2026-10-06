import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icons } from './shared'

export interface CsfRequiredModalProps {
  isOpen: boolean
  message?: string | null
  onClose: () => void
  redirectPath?: string
}

export function CsfRequiredModal({
  isOpen,
  message,
  onClose,
  redirectPath = '/mi-identidad?tab=verificacion',
}: CsfRequiredModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const displayMessage =
    message && message.trim().length > 0
      ? message
      : 'Tu cuenta requiere cargar la Constancia de Situación Fiscal (CSF) para publicar vacantes.'

  const handleNavigate = () => {
    onClose()
    navigate(redirectPath)
  }

  return createPortal(
    <div
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--modal-backdrop, rgba(15, 23, 42, 0.65))',
        backdropFilter: 'blur(4px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="glass-card animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--bg-surface)',
          borderRadius: 20,
          padding: '32px 28px 28px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            color: 'var(--fg3)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icons.x({ s: 18 })}
        </button>

        {/* Icon Header */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'color-mix(in oklch, var(--amber, #f59e0b) 15%, transparent)',
            color: 'var(--amber, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1px solid color-mix(in oklch, var(--amber, #f59e0b) 30%, transparent)',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--fg1)',
            margin: '0 0 12px',
            lineHeight: 1.3,
          }}
        >
          Verificación de CSF requerida
        </h3>

        <p
          style={{
            fontSize: 14.5,
            color: 'var(--fg2)',
            margin: '0 0 24px',
            lineHeight: 1.6,
            padding: '0 8px',
          }}
        >
          {displayMessage}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: 12,
              border: '1.5px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--fg2)',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleNavigate}
            className="btn-primary"
            style={{
              flex: 1.3,
              padding: '11px 18px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'var(--font-body)',
            }}
          >
            Subir CSF (Fiscal)
            {Icons.arrowRight({ s: 16 })}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
