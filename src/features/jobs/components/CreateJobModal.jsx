import { useState } from 'react'
import { useCreateJob } from '../hooks/useJobs'
import { useUiStore } from '@shared/stores/uiStore'
import { JOBS_TOAST, JOBS_UI } from '../constants/jobsMessages'

const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }
const labelStyle = { fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }

export default function CreateJobModal({ onClose }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', requisitos: '', modalidad: 'presencial', horario: '', rangoSalario: '', ciudad: '', estado: '', inclusivaDiscapacidad: true })
  const createJob = useCreateJob()
  const { addToast } = useUiStore()

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createJob.mutateAsync(form)
      addToast(JOBS_TOAST.JOB_CREATED, 'success')
      onClose()
    } catch (err) {
      addToast(err?.response?.data?.message ?? JOBS_TOAST.JOB_CREATE_FAILED, 'error')
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="animate-scale-in glass-card" style={{ padding: 28, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px' }}>{JOBS_UI.CREATE_JOB_TITLE}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={labelStyle}>{JOBS_UI.JOB_TITLE_LABEL}</label><input required value={form.titulo} onChange={e => update('titulo', e.target.value)} placeholder={JOBS_UI.JOB_TITLE_PLACEHOLDER} style={inputStyle} /></div>
          <div><label style={labelStyle}>{JOBS_UI.JOB_DESC_LABEL}</label><textarea rows={3} value={form.descripcion} onChange={e => update('descripcion', e.target.value)} placeholder={JOBS_UI.JOB_DESC_PLACEHOLDER} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div><label style={labelStyle}>{JOBS_UI.JOB_REQUIREMENTS_LABEL}</label><textarea rows={2} value={form.requisitos} onChange={e => update('requisitos', e.target.value)} placeholder={JOBS_UI.JOB_REQUIREMENTS_PLACEHOLDER} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>{JOBS_UI.MODALITY_LABEL}</label>
              <select value={form.modalidad} onChange={e => update('modalidad', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="presencial">{JOBS_UI.MODALITY_PRESENCIAL}</option><option value="remoto">{JOBS_UI.MODALITY_REMOTO}</option><option value="híbrido">{JOBS_UI.MODALITY_HYBRID}</option>
              </select></div>
            <div><label style={labelStyle}>{JOBS_UI.SCHEDULE_LABEL}</label><input value={form.horario} onChange={e => update('horario', e.target.value)} placeholder={JOBS_UI.SCHEDULE_PLACEHOLDER} style={inputStyle} /></div>
          </div>
          <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>{JOBS_UI.CITY_LABEL}</label><input value={form.ciudad} onChange={e => update('ciudad', e.target.value)} placeholder={JOBS_UI.CITY_PLACEHOLDER} style={inputStyle} /></div>
            <div><label style={labelStyle}>{JOBS_UI.STATE_LABEL}</label><input value={form.estado} onChange={e => update('estado', e.target.value)} placeholder={JOBS_UI.STATE_PLACEHOLDER} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>{JOBS_UI.SALARY_LABEL}</label><input value={form.rangoSalario} onChange={e => update('rangoSalario', e.target.value)} placeholder={JOBS_UI.SALARY_PLACEHOLDER} style={inputStyle} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--fg2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.inclusivaDiscapacidad} onChange={e => update('inclusivaDiscapacidad', e.target.checked)} style={{ width: 18, height: 18 }} />
            {JOBS_UI.INCLUSIVE_CHECKBOX}
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>{JOBS_UI.CANCEL_BUTTON}</button>
            <button type="submit" className="btn-primary" disabled={!form.titulo.trim() || createJob.isPending} style={{ padding: '10px 24px', fontSize: 14 }}>{createJob.isPending ? JOBS_UI.CREATE_JOB_LOADING : JOBS_UI.CREATE_JOB}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
