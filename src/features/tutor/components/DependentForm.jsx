import { useState } from 'react'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import { TUTOR_UI } from '../constants/tutorMessages'

export default function DependentForm({ initial, onCancel, onSave, saving, relationships = [], disabilities = [] }) {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    id: initial?.id ?? null,
    nombreCompleto: initial?.nombreCompleto ?? initial?.nombre ?? '',
    parentesco: initial?.parentesco ?? initial?.relacion ?? relationships[0] ?? '',
    tiposDiscapacidad: initial?.tiposDiscapacidad ?? initial?.discapacidades ?? [],
    etapaVida: initial?.etapaVida ?? '',
    notas: initial?.notas ?? '',
    birth_date: initial?.id ? localStorage.getItem(`raices_dep_birth_date_${initial.id}`) || '' : '',
    crearCuenta: false,
    email: '',
    password: '',
  })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleDis = (d) => setForm(f => ({ ...f, tiposDiscapacidad: f.tiposDiscapacidad.includes(d) ? f.tiposDiscapacidad.filter(x => x !== d) : [...f.tiposDiscapacidad, d] }))
  
  const submit = (e) => {
    e.preventDefault()
    if (!form.nombreCompleto.trim()) return
    if (!initial?.id) {
      const payload = { nombreCompleto: form.nombreCompleto.trim(), parentesco: form.parentesco, necesidades: form.tiposDiscapacidad, etapaVida: form.etapaVida || null, birth_date: form.birth_date || null, notas: form.notas || '' }
      if (form.crearCuenta && form.email.trim() && form.password) { payload.crearCuenta = true; payload.email = form.email.trim(); payload.password = form.password }
      onSave(payload)
    } else { onSave(form) }
  }

  return (
    <div onClick={onCancel} className="modal-overlay" style={{ zIndex: 1000, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} role="dialog" className="glass-card" aria-modal="true" aria-label={form.id ? 'Editar persona' : 'Agregar persona'} style={{ padding: 28, maxWidth: 540, width: '100%', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{form.id ? TUTOR_UI.EDIT_TITLE : TUTOR_UI.CREATE_TITLE}</h2>
          <button onClick={onCancel} aria-label="Cerrar" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.x({ s: 18 })}</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 18 }}><label htmlFor="dep-name" style={labelStyle}>{TUTOR_UI.NAME_LABEL}</label><input id="dep-name" style={inputStyle} value={form.nombreCompleto} onChange={set('nombreCompleto')} required placeholder={TUTOR_UI.NAME_PLACEHOLDER} autoFocus /></div>
          <div style={{ marginBottom: 18 }}><label htmlFor="dep-rel" style={labelStyle}>{TUTOR_UI.RELATION_LABEL}</label><select id="dep-rel" style={{ ...inputStyle, cursor: 'pointer' }} value={form.parentesco} onChange={set('parentesco')}>{relationships.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-birth-date" style={labelStyle}>Fecha de nacimiento</label>
            <input type="date" id="dep-birth-date" style={inputStyle} max={new Date().toISOString().split('T')[0]} min="1900-01-01" value={form.birth_date || ''} onChange={e => {
              const bdate = e.target.value; let calculatedStage = ''
              if (bdate) { const bd = new Date(bdate); if (!isNaN(bd.getTime())) { const t = new Date(); let age = t.getFullYear() - bd.getFullYear(); const m = t.getMonth() - bd.getMonth(); if (m < 0 || (m === 0 && t.getDate() < bd.getDate())) age--; if (age <= 12) calculatedStage = 'infancia'; else if (age <= 17) calculatedStage = 'adolescencia'; else if (age <= 29) calculatedStage = 'adultoJoven'; else if (age <= 59) calculatedStage = 'adulto'; else calculatedStage = 'mayor' } }
              setForm(f => ({ ...f, birth_date: bdate, etapaVida: calculatedStage }))
            }} />
          </div>
          {(() => {
            const listDis = disabilities.filter(d => { const n = d.toLowerCase(); return n.includes('motriz') || n.includes('visual') || n.includes('auditiva') || n.includes('intelectual') || n.includes('psicosocial') || n.includes('múltiple') || n.includes('multiple') || n.includes('otra') })
            const listCond = disabilities.filter(d => !listDis.includes(d))
            return (<>
              <fieldset style={{ border: 'none', padding: 0, margin: '0 0 18px' }}><legend style={{ ...labelStyle, padding: 0 }}>{TUTOR_UI.DISABILITY_LABEL}</legend><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>{listDis.map(d => { const on = form.tiposDiscapacidad.includes(d); return <button key={d} type="button" onClick={() => toggleDis(d)} aria-pressed={on} style={{ padding: '8px 14px', minHeight: 44, borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, border: on ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: on ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: on ? 'var(--primary)' : 'var(--fg2)' }}>{on && <span aria-hidden="true">✓ </span>}{d}</button> })}</div></fieldset>
              {listCond.length > 0 && <fieldset style={{ border: 'none', padding: 0, margin: '0 0 18px' }}><legend style={{ ...labelStyle, padding: 0 }}>Condición</legend><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>{listCond.map(d => { const on = form.tiposDiscapacidad.includes(d); return <button key={d} type="button" onClick={() => toggleDis(d)} aria-pressed={on} style={{ padding: '8px 14px', minHeight: 44, borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, border: on ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: on ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: on ? 'var(--primary)' : 'var(--fg2)' }}>{on && <span aria-hidden="true">✓ </span>}{d}</button> })}</div></fieldset>}
            </>)
          })()}
          {!initial?.id && (
            <div style={{ marginBottom: 18, padding: 16, borderRadius: 12, background: 'var(--bg-warm)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.crearCuenta} onChange={(e) => setForm(f => ({ ...f, crearCuenta: e.target.checked }))} style={{ width: 20, height: 20, accentColor: 'var(--primary)' }} />
                <div><span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg1)' }}>Crear cuenta de acceso</span><p style={{ fontSize: 13, color: 'var(--fg2)', margin: '2px 0 0' }}>Permite que {form.nombreCompleto || 'esta persona'} inicie sesión en la plataforma</p></div>
              </label>
              {form.crearCuenta && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div><label htmlFor="dep-email" style={labelStyle}>Correo electrónico</label><input id="dep-email" type="email" style={inputStyle} value={form.email} onChange={set('email')} required placeholder="ejemplo@correo.com" /></div>
                  <div><label htmlFor="dep-password" style={labelStyle}>Contraseña</label><div style={{ position: 'relative' }}><input id="dep-password" type={showPassword ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 48 }} value={form.password} onChange={set('password')} required={form.crearCuenta} placeholder="Mínimo 8 caracteres" minLength={8} /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>{showPassword ? Icons.eyeOff({ s: 18 }) : Icons.eye({ s: 18 })}</button></div></div>
                </div>
              )}
            </div>
          )}
          <div style={{ marginBottom: 24 }}><label htmlFor="dep-notes" style={labelStyle}>{TUTOR_UI.NOTES_LABEL}</label><textarea id="dep-notes" value={form.notas} onChange={set('notas')} rows={3} placeholder={TUTOR_UI.NOTES_PLACEHOLDER} style={{ ...inputStyle, height: 'auto', paddingTop: 12, paddingBottom: 12, resize: 'vertical', lineHeight: 1.5 }} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={onCancel} style={{ fontSize: 14.5 }}>{TUTOR_UI.CANCEL_BUTTON}</button>
            <button type="submit" disabled={saving || !form.nombreCompleto.trim()} style={{ fontSize: 14.5, padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: (saving || !form.nombreCompleto.trim()) ? 0.6 : 1 }}>
              {saving ? TUTOR_UI.SAVE_BUTTON_LOADING : form.id ? TUTOR_UI.SAVE_BUTTON : TUTOR_UI.ADD_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
