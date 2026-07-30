import { useState } from 'react'
import { useJobs, useAppliedJobIds, useApplyJob, useMyApplications, useCreateJob } from '../hooks/useJobs'
import { useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons } from '@shared/components/shared'
import { AppSidebar, TopNav, useMe } from '@features/auth'
import { JOBS_TOAST, JOBS_UI, STATUS_COLORS } from '../constants/jobsMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { JOB_ENDPOINTS } from '@shared/constants/backendEndpoints'

const STATUS_LABELS = {
  pending: JOBS_UI.STATUS_PENDING,
  reviewed: JOBS_UI.STATUS_REVIEWED,
  accepted: JOBS_UI.STATUS_ACCEPTED,
  rejected: JOBS_UI.STATUS_REJECTED,
}

function CreateJobModal({ onClose }) {
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

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }
  const labelStyle = { fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
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

function ApplicationModal({ job, onClose }) {
  const [letter, setLetter] = useState('')
  const apply = useApplyJob()
  const { addToast } = useUiStore()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await apply.mutateAsync({ jobId: job.id, cover_letter: letter })
      addToast(JOBS_TOAST.APPLICATION_SENT, 'success')
      onClose()
    } catch (err) {
      addToast(err?.response?.data?.message ?? JOBS_TOAST.APPLICATION_FAILED, 'error')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 520, width: '100%', boxShadow: 'var(--shadow-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>
          {JOBS_UI.APPLY_TITLE} {job.title}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '0 0 20px' }}>{job.institution_name}</p>
        <form onSubmit={submit}>
          <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 8 }}>
            {JOBS_UI.COVER_LETTER_LABEL}
          </label>
          <textarea rows={5} value={letter} onChange={e => setLetter(e.target.value)} placeholder={JOBS_UI.COVER_LETTER_PLACEHOLDER} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>{JOBS_UI.CANCEL_BUTTON}</button>
            <button type="submit" className="btn-primary" disabled={apply.isPending} style={{ padding: '10px 24px', fontSize: 14 }}>{apply.isPending ? JOBS_UI.APPLY_BUTTON_LOADING : JOBS_UI.APPLY_BUTTON}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function JobCard({ job, applied, onApply }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              {job.title}
            </h3>
            {job.institution_verified && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'color-mix(in oklch, #1F8049 15%, transparent)', color: '#1F8049' }}>
                {Icons.check({ s: 10 })} {JOBS_UI.VERIFIED_BADGE}
              </span>
            )}
          </div>
          <p style={{ fontSize: 15, color: 'var(--primary)', fontWeight: 600, margin: '0 0 8px' }}>
            {Icons.building({ s: 14 })} {job.institution_name}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--fg3)' }}>
            {job.city && <span>{Icons.mapPin({ s: 13 })} {job.city}{job.state ? `, ${job.state}` : ''}</span>}
            <span style={{ textTransform: 'capitalize', background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 10, fontWeight: 600 }}>
              {job.modality}
            </span>
            {job.schedule && <span>{job.schedule}</span>}
            {job.salary_range && <span style={{ fontWeight: 600, color: 'var(--fg2)' }}>{job.salary_range}</span>}
          </div>
          {job.disability_inclusive && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#4BA3A3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              {Icons.users({ s: 13 })} {JOBS_UI.INCLUSIVE_BADGE}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {applied ? (
            <span style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', background: 'color-mix(in oklch, #1F8049 12%, transparent)', color: '#1F8049', fontSize: 13, fontWeight: 700 }}>
              {Icons.check({ s: 14 })} {JOBS_UI.POSTULATED_BADGE}
            </span>
          ) : (
            <button className="btn-primary" onClick={onApply} style={{ padding: '10px 20px', fontSize: 14, whiteSpace: 'nowrap' }}>
              {JOBS_UI.POSTULATE_BUTTON}
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {expanded ? JOBS_UI.LESS_INFO : JOBS_UI.VIEW_DETAILS} {Icons.arrowRight({ s: 13 })}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          {job.description && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.DESCRIPTION_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.7, margin: 0 }}>{job.description}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.REQUIREMENTS_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.7, margin: 0 }}>{job.requirements}</p>
            </div>
          )}
          {job.disability_types?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.DISABILITY_WELCOME_LABEL}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.disability_types.map(t => (
                  <span key={t} style={{ padding: '2px 12px', borderRadius: 10, background: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function JobsPage() {
  const { logout } = useAuthStore()
  const { data: user } = useMe()
  const [modality, setModality] = useState('Todos')
  const [tab, setTab] = useState('board')
  const [applyTarget, setApplyTarget] = useState(null)
  const [showCreateJob, setShowCreateJob] = useState(false)
  const isInstitution = user?.rol === 'institution' || user?.rol === 'admin'
  const { data: catalogos } = useCatalogos()

  // Catálogos del backend
  const MODALITIES = ['Todos', ...(catalogos?.modalidadesEmpleo ?? [])]

  const { data: jobs = [], isLoading, isError: jobsError, refetch: refetchJobs } = useJobs({ modalidad: modality === 'Todos' ? undefined : modality })
  const { data: appliedIds = [] } = useAppliedJobIds()
  const { data: applications = [], isError: appsError } = useMyApplications()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="jobs" />
      <TopNav user={user} onLogout={logout} currentPage="jobs" />

      <main className="responsive-main" style={{ '--main-max-width': '900px' }}>
        <div className="jobs-header responsive-header animate-fade-in-up" style={{ marginBottom: 28 }}>
          <div>
            <h1 className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>
              {JOBS_UI.PAGE_TITLE}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--fg3)', margin: 0 }}>{JOBS_UI.PAGE_SUBTITLE}</p>
          </div>
          <div className="jobs-tabs" style={{ display: 'flex', gap: 8 }}>
            {isInstitution && (
              <button className="btn-primary" onClick={() => setShowCreateJob(true)} style={{ padding: '10px 18px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                {Icons.plus({ s: 16 })} {JOBS_UI.CREATE_JOB}
              </button>
            )}
            {['board', 'applications'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '10px 18px', borderRadius: 'var(--radius-pill)', border: tab === t ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: tab === t ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: tab === t ? 'var(--primary)' : 'var(--fg2)', cursor: 'pointer', fontWeight: tab === t ? 700 : 500, fontSize: 14, fontFamily: 'var(--font-body)' }}>
                {t === 'board' ? `${JOBS_UI.TAB_BOARD} (${jobs.length})` : `${JOBS_UI.TAB_APPLICATIONS} (${applications.length})`}
              </button>
            ))}
          </div>
        </div>

        {tab === 'board' ? (
          <>
            <div className="jobs-filters animate-fade-in-up delay-2" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {MODALITIES.map(m => (
                <button key={m} onClick={() => setModality(m)}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: modality === m ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: modality === m ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: modality === m ? 'var(--primary)' : 'var(--fg2)', cursor: 'pointer', fontWeight: modality === m ? 700 : 500, fontSize: 13, fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>
                  {m}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 120, borderRadius: 'var(--radius-md)', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : jobsError ? (
              <BackendFallback method={JOB_ENDPOINTS.LIST.method} endpoint={JOB_ENDPOINTS.LIST.path} onRetry={() => refetchJobs()} />
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                  {Icons.briefcase({ s: 24 })}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{JOBS_UI.NO_JOBS}</h3>
                <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0 }}>{JOBS_UI.NO_JOBS_HINT}</p>
              </div>
            ) : (
              <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {jobs.map(job => (
                  <div key={job.id} className="animate-fade-in-up"><JobCard job={job} applied={appliedIds.includes(job.id)} onApply={() => setApplyTarget(job)} /></div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--fg3)', fontSize: 15 }}>{JOBS_UI.NO_APPLICATIONS}</p>
              </div>
            ) : (
              <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {applications.map(app => (
                  <div key={app.id} className="animate-fade-in-up" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--fg1)', marginBottom: 4 }}>{app.title}</div>
                      <div style={{ fontSize: 14, color: 'var(--fg3)' }}>{app.institution_name} · {app.modality}</div>
                    </div>
                    <span style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: `color-mix(in oklch, ${STATUS_COLORS[app.status] ?? '#888'} 15%, transparent)`, color: STATUS_COLORS[app.status] ?? '#888', fontSize: 13, fontWeight: 700 }}>
                      {STATUS_LABELS[app.status] ?? app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {applyTarget && <ApplicationModal job={applyTarget} onClose={() => setApplyTarget(null)} />}
      {showCreateJob && <CreateJobModal onClose={() => setShowCreateJob(false)} />}
    </div>
  )
}
