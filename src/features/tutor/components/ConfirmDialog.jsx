import { Icons } from '@shared/components/shared'
import { TUTOR_UI } from '../constants/tutorMessages'

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel }) {
  return (
    <div onClick={onCancel} className="modal-overlay" style={{ zIndex: 1100 }}>
      <div onClick={e => e.stopPropagation()} role="alertdialog" className="glass-card" aria-modal="true" aria-label={title} style={{ padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-error) 15%, transparent)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icons.shieldAlert({ s: 20 })}</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 15, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" onClick={onCancel}>{TUTOR_UI.CANCEL_BUTTON}</button>
          <button onClick={onConfirm} style={{ fontSize: 17, padding: '12px 24px', minHeight: 48, borderRadius: 'var(--radius-pill)', border: '2px solid var(--color-error)', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)', background: 'var(--color-error)', color: '#fff' }}>{confirmLabel || TUTOR_UI.CONFIRM_DELETE_BUTTON}</button>
        </div>
      </div>
    </div>
  )
}
