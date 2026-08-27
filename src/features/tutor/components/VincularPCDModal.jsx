import { useState } from 'react'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import { TUTOR_UI } from '../constants/tutorMessages'

export default function VincularPCDModal({ onVincular, onCancel, saving }) {
  const [pcdEmail, setPcdEmail] = useState('')
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pcdEmail)
  const submit = (e) => { e.preventDefault(); if (!isValidEmail) return; onVincular(pcdEmail.trim()) }

  return (
    <div onClick={onCancel} className="modal-overlay" style={{ zIndex: 1000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} role="dialog" className="glass-card" aria-modal="true" aria-label="Vincular persona" style={{ padding: 28, maxWidth: 440, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icons.link({ s: 20 })}</div>
          <div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{TUTOR_UI.LINK_TITLE}</h2><p style={{ fontSize: 13, color: 'var(--fg2)', margin: '2px 0 0' }}>{TUTOR_UI.LINK_MODAL_SUBTITLE}</p></div>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 20 }}><label htmlFor="pcd-email" style={labelStyle}>{TUTOR_UI.PCD_EMAIL_LABEL}</label><input id="pcd-email" type="email" style={{ ...inputStyle, opacity: saving ? 0.6 : 1 }} value={pcdEmail} onChange={e => setPcdEmail(e.target.value)} required placeholder={TUTOR_UI.PCD_EMAIL_PLACEHOLDER} autoFocus disabled={saving} /><p style={{ fontSize: 12, color: 'var(--fg3)', margin: '6px 0 0' }}>{TUTOR_UI.PCD_EMAIL_HINT}</p></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={onCancel} style={{ fontSize: 14.5 }}>{TUTOR_UI.CANCEL_BUTTON}</button>
            <button type="submit" disabled={saving || !isValidEmail} style={{ fontSize: 14.5, padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: (saving || !isValidEmail) ? 0.6 : 1 }}>
              {saving ? TUTOR_UI.LINK_BUTTON_LOADING : TUTOR_UI.LINK_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
