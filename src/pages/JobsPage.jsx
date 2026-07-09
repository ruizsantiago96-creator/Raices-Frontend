import { useState } from 'react'
import { useJobs, useAppliedJobIds, useApplyJob, useMyApplications } from '../hooks/useJobs'
import { useAuthStore } from '../stores/authStore'
import { useUiStore } from '../stores/uiStore'
import { AppSidebar, TopNav, Icons } from '../components/shared'
import { useMe } from '../hooks/useAuth'

const MODALITIES = ['Todos', 'presencial', 'remoto', 'híbrido']

const STATUS_LABELS = { pending: 'Enviada', reviewed: 'En revisión', accepted: 'Aceptada', rejected: 'No seleccionado' }
const STATUS_COLORS = { pending: '#D4944C', reviewed: '#2B7A84', accepted: '#1F8049', rejected: '#B0434B' }

function ApplicationModal({ job, onClose }) {
  const [letter, setLetter] = useState('')
  const apply = useApplyJob()
  const { addToast } = useUiStore()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await apply.mutateAsync({ jobId: job.id, cover_letter: letter })
      addToast('¡Solicitud enviada con éxito!', 'success')
      onClose()
    } catch (err) {
      addToast(err?.response?.data?.message ?? 'No se pudo enviar la solicitud', 'error')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 520, width: '100%', boxShadow: 'var(--shadow-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>
          Postularte a {job.title}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '0 0 20px' }}>{job.institution_name}</p>
        <form onSubmit={submit}>
          <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 8 }}>
            Carta de presentación (opcional)
          </label>
          <textarea
            rows={5}
            value={letter}
            onChange={e => setLetter(e.target.value)}
            placeholder="Cuéntanos por qué eres el candidato ideal para esta vacante…"
            style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={apply.isPending}
              style={{ padding: '10px 24px', fontSize: 14 }}>
              {apply.isPending ? 'Enviando…' : 'Enviar solicitud'}
            </button>
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
                {Icons.check({ s: 10 })} Verificado
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
              {Icons.users({ s: 13 })} Empresa inclusiva para personas con discapacidad
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {applied ? (
            <span style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', background: 'color-mix(in oklch, #1F8049 12%, transparent)', color: '#1F8049', fontSize: 13, fontWeight: 700 }}>
              {Icons.check({ s: 14 })} Postulado
            </span>
          ) : (
            <button className="btn-primary" onClick={onApply} style={{ padding: '10px 20px', fontSize: 14, whiteSpace: 'nowrap' }}>
              Postularme
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {expanded ? 'Menos info' : 'Ver detalles'} {Icons.arrowRight({ s: 13 })}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          {job.description && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Descripción</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.7, margin: 0 }}>{job.description}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Requisitos</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.7, margin: 0 }}>{job.requirements}</p>
            </div>
          )}
          {job.disability_types?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Discapacidades bienvenidas</div>
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
  const [tab, setTab] = useState('board') // board | applications
  const [applyTarget, setApplyTarget] = useState(null)

  const { data: jobs = [], isLoading } = useJobs({ modality: modality === 'Todos' ? undefined : modality })
  const { data: appliedIds = [] } = useAppliedJobIds()
  const { data: applications = [] } = useMyApplications()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="jobs" />
      <TopNav user={user} onLogout={logout} currentPage="jobs" />

      <main style={{ marginLeft: 88, padding: '32px 40px', maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Bolsa de Trabajo Inclusiva
            </h1>
            <p style={{ fontSize: 15, color: 'var(--fg3)', margin: 0 }}>Vacantes en empresas que valoran la diversidad</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['board', 'applications'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '10px 18px', borderRadius: 'var(--radius-pill)', border: tab === t ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: tab === t ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: tab === t ? 'var(--primary)' : 'var(--fg2)', cursor: 'pointer', fontWeight: tab === t ? 700 : 500, fontSize: 14, fontFamily: 'var(--font-body)' }}>
                {t === 'board' ? `Vacantes (${jobs.length})` : `Mis solicitudes (${applications.length})`}
              </button>
            ))}
          </div>
        </div>

        {tab === 'board' ? (
          <>
            {/* Filtros modalidad */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
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
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
                  {Icons.briefcase({ s: 24 })}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>No hay vacantes disponibles</h3>
                <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0 }}>Pronto las instituciones publicarán sus oportunidades de empleo</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} applied={appliedIds.includes(job.id)} onApply={() => setApplyTarget(job)} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--fg3)', fontSize: 15 }}>Aún no has enviado ninguna solicitud</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {applications.map(app => (
                  <div key={app.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
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
    </div>
  )
}
