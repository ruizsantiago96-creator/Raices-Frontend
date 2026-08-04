import { useState } from 'react'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { useMyJobPostings, useCreateJobPosting, useDeleteJobPosting, useToggleJobStatus } from '../hooks/useInstitutionJobs'
import { PORTAL_UI, PORTAL_TOAST } from '../constants/institutionPortalMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { JOB_ENDPOINTS } from '@shared/constants/backendEndpoints'

/* ─── CreateJobModal ──────────────────────────────────────── */
function CreateJobModal({ onClose }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', requisitos: '', modalidad: 'presencial', horario: '', rangoSalario: '', ciudad: '', estado: '', inclusivaDiscapacidad: true })
  const createJob = useCreateJobPosting()
  const { addToast } = useUiStore()

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createJob.mutateAsync(form)
      addToast(PORTAL_TOAST.JOB_CREATED, 'success')
      onClose()
    } catch (err) {
      addToast(err?.response?.data?.message ?? PORTAL_TOAST.JOB_CREATE_FAILED, 'error')
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }
  const labelStyle = { fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Icons.briefcase({ s: 20 })}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{PORTAL_UI.CREATE_JOB_TITLE}</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={labelStyle}>{PORTAL_UI.JOB_TITLE_LABEL}</label><input required value={form.titulo} onChange={e => update('titulo', e.target.value)} placeholder={PORTAL_UI.JOB_TITLE_PLACEHOLDER} style={inputStyle} /></div>
          <div><label style={labelStyle}>{PORTAL_UI.JOB_DESC_LABEL}</label><textarea rows={3} value={form.descripcion} onChange={e => update('descripcion', e.target.value)} placeholder={PORTAL_UI.JOB_DESC_PLACEHOLDER} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div><label style={labelStyle}>{PORTAL_UI.JOB_REQUIREMENTS_LABEL}</label><textarea rows={2} value={form.requisitos} onChange={e => update('requisitos', e.target.value)} placeholder={PORTAL_UI.JOB_REQUIREMENTS_PLACEHOLDER} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>{PORTAL_UI.MODALITY_LABEL}</label>
              <select value={form.modalidad} onChange={e => update('modalidad', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="presencial">{PORTAL_UI.MODALITY_PRESENCIAL}</option><option value="remoto">{PORTAL_UI.MODALITY_REMOTO}</option><option value="híbrido">{PORTAL_UI.MODALITY_HYBRID}</option>
              </select></div>
            <div><label style={labelStyle}>{PORTAL_UI.SCHEDULE_LABEL}</label><input value={form.horario} onChange={e => update('horario', e.target.value)} placeholder={PORTAL_UI.SCHEDULE_PLACEHOLDER} style={inputStyle} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>{PORTAL_UI.CITY_LABEL}</label><input value={form.ciudad} onChange={e => update('ciudad', e.target.value)} placeholder={PORTAL_UI.CITY_PLACEHOLDER} style={inputStyle} /></div>
            <div><label style={labelStyle}>{PORTAL_UI.STATE_LABEL}</label><input value={form.estado} onChange={e => update('estado', e.target.value)} placeholder={PORTAL_UI.STATE_PLACEHOLDER} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>{PORTAL_UI.SALARY_LABEL}</label><input value={form.rangoSalario} onChange={e => update('rangoSalario', e.target.value)} placeholder={PORTAL_UI.SALARY_PLACEHOLDER} style={inputStyle} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--fg2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.inclusivaDiscapacidad} onChange={e => update('inclusivaDiscapacidad', e.target.checked)} style={{ width: 18, height: 18 }} />
            {PORTAL_UI.INCLUSIVE_CHECKBOX}
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>{PORTAL_UI.CANCEL_BUTTON}</button>
            <button type="submit" className="btn-primary" disabled={!form.titulo.trim() || createJob.isPending} style={{ padding: '10px 24px', fontSize: 14 }}>{createJob.isPending ? PORTAL_UI.CREATE_JOB_LOADING : PORTAL_UI.CREATE_JOB}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── DeleteConfirmModal ─────────────────────────────────── */
function DeleteConfirmModal({ job, onClose, onConfirm }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 420, width: '100%', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-error) 14%, transparent)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Icons.shieldAlert({ s: 20 })}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{PORTAL_UI.DELETE_CONFIRM_TITLE}</h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>
          {PORTAL_UI.DELETE_CONFIRM_MESSAGE}
        </p>
        <p style={{ fontSize: 14, color: 'var(--fg1)', fontWeight: 600, margin: '0 0 20px' }}>
          "{job.title}"
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={onClose}>{PORTAL_UI.CANCEL_BUTTON}</button>
          <button onClick={onConfirm} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-error)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{PORTAL_UI.CONFIRM_DELETE}</button>
        </div>
      </div>
    </div>
  )
}

/* ─── PostulacionesTab ───────────────────────────────────── */
export default function PostulacionesTab({ onViewCandidates }) {
  const { addToast } = useUiStore()
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: jobs = [], isLoading, isError, refetch } = useMyJobPostings()
  const toggleStatus = useToggleJobStatus()
  const deleteJob = useDeleteJobPosting()

  const filteredJobs = search.trim()
    ? jobs.filter(j => {
        const q = search.toLowerCase()
        return (j.title ?? '').toLowerCase().includes(q) ||
               (j.city ?? '').toLowerCase().includes(q) ||
               (j.modality ?? '').toLowerCase().includes(q)
      })
    : jobs

  const handleToggleStatus = (job) => {
    toggleStatus.mutate(
      { id: job.id, is_active: !job.is_active },
      {
        onSuccess: () => addToast(PORTAL_TOAST.STATUS_CHANGED, 'success'),
        onError: () => addToast(PORTAL_TOAST.STATUS_CHANGE_FAILED, 'error'),
      }
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteJob.mutate(deleteTarget.id, {
      onSuccess: () => {
        addToast(PORTAL_TOAST.JOB_DELETED, 'success')
        setDeleteTarget(null)
      },
      onError: () => addToast(PORTAL_TOAST.JOB_DELETE_FAILED, 'error'),
    })
  }

  const inputStyle = { height: 40, padding: '0 12px 0 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)', width: '100%' }

  if (isError) {
    return <BackendFallback method={JOB_ENDPOINTS.LIST.method} endpoint={JOB_ENDPOINTS.LIST.path} onRetry={() => refetch()} />
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ padding: '10px 18px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus({ s: 16 })} {PORTAL_UI.CREATE_JOB}
        </button>
        <div style={{ position: 'relative', flex: 1, minWidth: 220, marginLeft: 'auto' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)' }}>{Icons.search({ s: 16 })}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={PORTAL_UI.SEARCH_PLACEHOLDER}
            style={inputStyle} />
        </div>
      </div>

      {/* Job Cards */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 140, borderRadius: 'var(--radius-md)', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
            {Icons.briefcase({ s: 24 })}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{PORTAL_UI.NO_POSTULACIONES}</h3>
          <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0 }}>{PORTAL_UI.NO_POSTULACIONES_HINT}</p>
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredJobs.map(job => (
            <div key={job.id} className="animate-fade-in-up" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                      {job.title}
                    </h3>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: job.is_active ? 'color-mix(in oklch, var(--color-artes) 14%, transparent)' : 'color-mix(in oklch, var(--color-empleo) 14%, transparent)',
                      color: job.is_active ? 'var(--color-artes)' : 'var(--color-empleo)' }}>
                      {job.is_active ? PORTAL_UI.STATUS_ACTIVE : PORTAL_UI.STATUS_PAUSED}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--fg3)' }}>
                    {job.city && <span>{Icons.mapPin({ s: 13 })} {job.city}{job.state ? `, ${job.state}` : ''}</span>}
                    <span style={{ textTransform: 'capitalize', background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 10, fontWeight: 600 }}>
                      {job.modality}
                    </span>
                    {job.salary_range && <span style={{ fontWeight: 600, color: 'var(--fg2)' }}>{job.salary_range}</span>}
                  </div>
                  {job.disability_inclusive && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#4BA3A3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {Icons.users({ s: 13 })} Inclusiva
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                    {Icons.users({ s: 16 })}
                    <span>{job.applicants_count}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg3)' }}>candidatos</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
                    {job.created_at ? new Date(job.created_at).toLocaleDateString('es-MX') : '—'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <button onClick={() => onViewCandidates(job.id)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-subtle)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)' }}>
                      {Icons.users({ s: 12 })} {PORTAL_UI.VIEW_APPLICANTS}
                    </button>
                    <button onClick={() => handleToggleStatus(job)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-cool)'; e.currentTarget.style.color = 'var(--fg1)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--fg2)' }}>
                      {job.is_active ? (
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      ) : (
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      )} {PORTAL_UI.TOGGLE_STATUS}
                    </button>
                    <button onClick={() => setDeleteTarget(job)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--color-error)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in oklch, var(--color-error) 8%, var(--bg-surface))' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)' }}>
                      {Icons.trash({ s: 12 })} {PORTAL_UI.DELETE_JOB}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} />}
      {deleteTarget && <DeleteConfirmModal job={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </div>
  )
}
