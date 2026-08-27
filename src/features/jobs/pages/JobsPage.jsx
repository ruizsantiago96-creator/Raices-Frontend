import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJobs, useAppliedJobIds, useMyApplications } from '../hooks/useJobs'
import { useMiInstitucion } from '@features/institutions/hooks/useInstitutions'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons } from '@shared/components/shared'
import { useMe } from '@features/auth'
import { JOBS_UI } from '../constants/jobsMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { JOB_ENDPOINTS } from '@shared/constants/backendEndpoints'
import CreateJobModal from '../components/CreateJobModal'
import ApplicationModal from '../components/ApplicationModal'
import MessageModal from '../components/MessageModal'
import JobCard from '../components/JobCard'
import ApplicationCard from '../components/ApplicationCard'

export default function JobsPage() {

  const { data: user } = useMe()
  const navigate = useNavigate()
  const { data: institution } = useMiInstitucion()
  const [modality, setModality] = useState('Todos')
  const [tab, setTab] = useState('board')
  const [applyTarget, setApplyTarget] = useState(null)
  const [showCreateJob, setShowCreateJob] = useState(false)
  const [messageTarget, setMessageTarget] = useState(null)
  const isInstitution = user?.role === 'institution' || user?.role === 'admin'
  const { data: catalogos } = useCatalogos()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const JOBS_PER_PAGE = 5

  const { data: jobsPage, isLoading, isError: jobsError, refetch: refetchJobs } = useJobs({})
  const { data: appliedIds = [] } = useAppliedJobIds()
  const { data: appsPage } = useMyApplications()

  const jobs = jobsPage?.datos ?? []
  const applications = appsPage?.datos ?? []

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const s = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm ||
        (job.title ?? '').toLowerCase().includes(s) ||
        (job.description ?? '').toLowerCase().includes(s) ||
        (job.institution_name ?? '').toLowerCase().includes(s) ||
        (job.city ?? '').toLowerCase().includes(s) ||
        (job.state ?? '').toLowerCase().includes(s)
      const matchesModality = modality === 'Todos' || job.modality === modality
      return matchesSearch && matchesModality
    })
  }, [jobs, searchTerm, modality])

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const s = searchTerm.toLowerCase()
      const job = app.job || {}
      return !searchTerm ||
        (job.title ?? '').toLowerCase().includes(s) ||
        (job.description ?? '').toLowerCase().includes(s) ||
        (job.institution_name ?? '').toLowerCase().includes(s) ||
        (job.city ?? '').toLowerCase().includes(s) ||
        (job.state ?? '').toLowerCase().includes(s)
    })
  }, [applications, searchTerm])

  const currentItems = tab === 'board' ? filteredJobs : filteredApps
  const totalPages = Math.ceil(currentItems.length / JOBS_PER_PAGE)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { setCurrentPage(1) }, [searchTerm, modality, tab])
  /* eslint-enable react-hooks/set-state-in-effect */

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * JOBS_PER_PAGE
    return currentItems.slice(start, start + JOBS_PER_PAGE)
  }, [currentItems, currentPage])

  const boardCount = jobs.length
  const appsCount = applications.length

  return (
    <>
      <main className="responsive-main" style={{ '--main-max-width': '900px' }}>
        {/* Header */}
        <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>{JOBS_UI.PAGE_TITLE}</h1>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>{JOBS_UI.PAGE_SUBTITLE}</p>
          </div>
          {isInstitution && (
            <button className="btn-primary" onClick={() => setShowCreateJob(true)} style={{ padding: '8px 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8 }}>
              {Icons.plus({ s: 14 })} {JOBS_UI.CREATE_JOB}
            </button>
          )}
        </div>

        {/* Segmented Control */}
        <div className="animate-fade-in-up delay-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: 'var(--bg-cool)', borderRadius: 10, padding: 3, gap: 2 }}>
            {[['board', JOBS_UI.TAB_BOARD, boardCount], ['applications', JOBS_UI.TAB_APPLICATIONS, appsCount]].map(([key, label, count]) => (
              <button key={key} onClick={() => setTab(key)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: tab === key ? 'var(--bg-surface)' : 'transparent', boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', color: tab === key ? 'var(--fg1)' : 'var(--fg3)', cursor: 'pointer', fontWeight: tab === key ? 600 : 500, fontSize: 13.5, fontFamily: 'var(--font-body)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 6 }}>
                {label}
                <span style={{ fontSize: 11, fontWeight: 600, color: tab === key ? 'var(--primary)' : 'var(--fg3)', background: tab === key ? 'var(--primary-subtle)' : 'transparent', padding: '1px 7px', borderRadius: 6 }}>{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="animate-fade-in-up delay-2" style={{ display: 'flex', gap: 12, marginBottom: 20, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 16, alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)', display: 'flex', alignItems: 'center' }}>{Icons.search({ s: 18 })}</span>
            <input type="text" placeholder={tab === 'board' ? "Buscar vacantes por título, empresa, ciudad..." : "Buscar en mis postulaciones..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: 10, border: '1.5px solid var(--border-color)', outline: 'none', fontSize: 14, fontFamily: 'var(--font-body)', background: 'var(--bg-warm)', color: 'var(--fg1)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-subtle)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none' }} />
          </div>
          {tab === 'board' && (
            <div style={{ position: 'relative', minWidth: 180 }}>
              <select value={modality} onChange={e => setModality(e.target.value)}
                style={{ width: '100%', padding: '10px 36px 10px 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', outline: 'none', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)', background: 'var(--bg-warm)', color: 'var(--fg1)', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}>
                <option value="Todos">Modalidad: Todas</option>
                {catalogos?.modalidadesEmpleo?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {tab === 'board' ? (
          <>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => <div key={i} style={{ height: 120, borderRadius: 'var(--radius-md)', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
              </div>
            ) : jobsError ? (
              <BackendFallback method={JOB_ENDPOINTS.LIST.method} endpoint={JOB_ENDPOINTS.LIST.path} onRetry={() => refetchJobs()} />
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--primary)' }}>{Icons.briefcase({ s: 22 })}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg1)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>{JOBS_UI.NO_JOBS}</h3>
                <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0 }}>{JOBS_UI.NO_JOBS_HINT}</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--fg3)', fontSize: 15, margin: 0 }}>No se encontraron vacantes para tu búsqueda. Intenta con otros términos o filtros.</p>
              </div>
            ) : (
              <>
                <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {paginatedItems.map(job => (
                    <div key={job.id} className="animate-fade-in-up">
                      <JobCard job={job} applied={appliedIds.includes(job.id)} onApply={() => setApplyTarget(job)} onMessage={setMessageTarget} userRole={user?.role} institutionId={institution?.id} onNavigateToPortal={(t) => navigate(t ? `/institution-portal?tab=${t}` : '/institution-portal')} onEditJob={(j) => navigate(`/institution-portal/editar?jobId=${j.id}`)} />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
                )}
              </>
            )}
          </>
        ) : (
          <div>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--fg3)', fontSize: 14 }}>{JOBS_UI.NO_APPLICATIONS}</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--fg3)', fontSize: 15, margin: 0 }}>No se encontraron postulaciones para tu búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {paginatedItems.map(app => (
                    <div key={app.id} className="animate-fade-in-up">
                      <ApplicationCard app={app} onMessage={setMessageTarget} />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {applyTarget && <ApplicationModal job={applyTarget} onClose={() => setApplyTarget(null)} />}
      {showCreateJob && <CreateJobModal onClose={() => setShowCreateJob(false)} />}
      {messageTarget && <MessageModal job={messageTarget} onClose={() => setMessageTarget(null)} />}
    </>
  )
}

/* ─── Pagination (duplicated block extracted) ──────────────── */
function Pagination({ currentPage, totalPages, setCurrentPage }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 }}>
      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
        style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', color: currentPage === 1 ? 'var(--fg3)' : 'var(--fg1)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: 13.5, fontWeight: 600, transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: 4 }}>
        {Icons.arrowLeft({ s: 14 })} Anterior
      </button>
      {Array.from({ length: totalPages }).map((_, idx) => {
        const pageNum = idx + 1
        const isCurrent = pageNum === currentPage
        return (
          <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
            style={{ width: 38, height: 38, borderRadius: 8, border: isCurrent ? '1.5px solid var(--primary)' : '1.5px solid var(--border-color)', background: isCurrent ? 'var(--primary)' : 'var(--bg-surface)', color: isCurrent ? '#fff' : 'var(--fg1)', cursor: 'pointer', fontWeight: 600, fontSize: 13.5, transition: 'all 0.15s ease' }}>
            {pageNum}
          </button>
        )
      })}
      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
        style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', color: currentPage === totalPages ? 'var(--fg3)' : 'var(--fg1)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: 13.5, fontWeight: 600, transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: 4 }}>
        Siguiente {Icons.arrowRight({ s: 14 })}
      </button>
    </div>
  )
}
