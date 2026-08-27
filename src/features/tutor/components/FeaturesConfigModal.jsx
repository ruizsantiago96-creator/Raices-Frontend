import { useState } from 'react'
import { Icons } from '@shared/components/shared'
import { TUTOR_UI } from '../constants/tutorMessages'

export default function FeaturesConfigModal({ dependent, features = [], onSave, onCancel, saving }) {
  const nombre = dependent?.nombreCompleto || dependent?.nombre || 'esta persona'
  const depFeatures = dependent?.features || {}
  const [form, setForm] = useState(() => { const initial = {}; features.forEach(f => { initial[f.id] = depFeatures[f.id] ?? true }); return initial })
  const toggleFeature = (id) => setForm(f => ({ ...f, [id]: !f[id] }))
  const submit = (e) => { e.preventDefault(); onSave({ id: dependent.isLinked ? (dependent.pcdUserId || dependent.id) : dependent.id, features: form, isLinked: !!dependent.isLinked }) }

  return (
    <div onClick={onCancel} className="modal-overlay" style={{ zIndex: 1000, padding: 16, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} role="dialog" className="glass-card" aria-modal="true" aria-label="Configurar features" style={{ padding: 28, maxWidth: 480, width: '100%', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icons.shield({ s: 22 })}</div>
            <div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{TUTOR_UI.FEATURES_TITLE} {nombre}</h2><p style={{ fontSize: 13, color: 'var(--fg2)', margin: '2px 0 0' }}>{TUTOR_UI.FEATURES_MODAL_DESC}</p></div>
          </div>
          <button onClick={onCancel} aria-label="Cerrar" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.x({ s: 18 })}</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxHeight: '260px', overflowY: 'auto', paddingRight: '6px' }}>
            {features.map(f => {
              const enabled = form[f.id]
              return (
                <button key={f.id} type="button" onClick={() => toggleFeature(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: '12px', border: enabled ? '2px solid var(--primary)' : '1.5px solid var(--border-color)', background: enabled ? 'var(--primary-subtle)' : 'var(--bg-surface)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: enabled ? '2.5px solid var(--primary)' : '2.5px solid var(--border-color)', background: enabled ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s ease', color: '#fff' }}>{enabled && <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>✓</span>}</div>
                  <div><p style={{ fontSize: 15, fontWeight: 700, color: enabled ? 'var(--primary)' : 'var(--fg1)', margin: 0 }}>{f.label}</p><p style={{ fontSize: 12.5, color: 'var(--fg2)', margin: '2px 0 0' }}>{f.description}</p></div>
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={onCancel} style={{ fontSize: 14.5 }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ fontSize: 14.5, padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: saving ? 0.6 : 1 }}>
              {saving ? TUTOR_UI.SAVE_BUTTON_LOADING : 'Guardar permisos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
