import { useNavigate } from 'react-router-dom'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { useAllJobApplicants, useMyJobPostings } from '../hooks/useInstitutionJobs'
import { useMiInstitucion } from '../hooks/useInstitutions'
import PostulacionesTab from '../components/PostulacionesTab'
import CandidatosTab from '../components/CandidatosTab'
import { PORTAL_UI } from '../constants/institutionPortalMessages'

const TAB_TITLES = {
  postulaciones: PORTAL_UI.TAB_POSTULACIONES,
  candidatos: PORTAL_UI.TAB_CANDIDATOS,
}

export default function InstitutionPortalPage() {
  const navigate = useNavigate()
  const tab = useUiStore(s => s.instPortalTab)
  const onTab = useUiStore(s => s.setInstPortalTab)

  const { data: institution, isLoading: loadingInst } = useMiInstitucion()

  const hasInstitution = !loadingInst && !!institution
  const isActive = institution?.is_active && institution?.is_verified

  const { data: jobs = [] } = useMyJobPostings({ enabled: hasInstitution })
  const { data: applicants = [] } = useAllJobApplicants({ enabled: hasInstitution })

  const activeJobs = jobs.filter(j => j.is_active).length
  const pendingApplicants = applicants.filter(a => a.status === 'pending').length

  const handleViewCandidates = () => onTab('candidatos')

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '1100px' }}>
      {/* Loading */}
      {loadingInst && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: 'var(--fg3)', fontSize: 15, gap: 10 }}>
          {Icons.loader({ s: 20 })} Cargando información de la institución...
        </div>
      )}

      {/* No institution */}
      {!loadingInst && !institution && (
        <div className="animate-fade-in-up" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '48px 32px', maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {Icons.building({ s: 28 })}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>Registra tu institución</h2>
          <p style={{ fontSize: 15, color: 'var(--fg3)', marginBottom: 24, lineHeight: 1.6 }}>Para comenzar a gestionar vacantes y postulaciones, primero necesitas registrar tu institución.</p>
          <button onClick={() => navigate('/institution-portal/registro')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {Icons.plus({ s: 18 })} Registrar institución
          </button>
        </div>
      )}

      {/* Institution exists - always show dashboard */}
      {hasInstitution && (
        <>
          {/* Non-blocking status banner */}
          {!isActive && (
            <div className="animate-fade-in-up" style={{
              background: !institution.is_verified
                ? 'color-mix(in oklch, #D4944C 10%, var(--bg-surface))'
                : 'color-mix(in oklch, var(--primary) 8%, var(--bg-surface))',
              border: '1px solid',
              borderColor: !institution.is_verified
                ? 'color-mix(in oklch, #D4944C 30%, var(--border-color))'
                : 'color-mix(in oklch, var(--primary) 20%, var(--border-color))',
              borderRadius: 12, padding: '14px 20px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!institution.is_verified ? (
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#D4944C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ) : (
                  Icons.building({ s: 18 })
                )}
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg2)' }}>
                  {!institution.is_verified
                    ? 'Tu institución está en proceso de verificación'
                    : 'Completa el perfil para activar tu institución'}
                </span>
              </div>
              <button onClick={() => navigate('/institution-portal/editar')} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)', color: 'var(--primary)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {Icons.edit({ s: 14 })} Editar
              </button>
            </div>
          )}

          <h1 key={tab} className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginBottom: 28, letterSpacing: '-0.02em' }}>
            {TAB_TITLES[tab]}
          </h1>

          {/* Stats */}
          <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--color-artes) 14%, transparent)', color: 'var(--color-artes)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.briefcase({ s: 18 })}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg1)', lineHeight: 1 }}>{activeJobs}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>{PORTAL_UI.STAT_ACTIVE}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--primary) 14%, transparent)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.users({ s: 18 })}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg1)', lineHeight: 1 }}>{applicants.length}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>{PORTAL_UI.STAT_TOTAL_POSTULANTS}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, #D4944C 14%, transparent)', color: '#D4944C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg1)', lineHeight: 1 }}>{pendingApplicants}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>{PORTAL_UI.STAT_PENDING}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, #1F8049 14%, transparent)', color: '#1F8049', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.check({ s: 18 })}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg1)', lineHeight: 1 }}>{applicants.filter(a => a.status === 'accepted').length}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>{PORTAL_UI.STAT_ACCEPTED}</div>
              </div>
            </div>
          </div>

          <div key={`content-${tab}`} className="animate-tab-in">
            {tab === 'postulaciones' && <PostulacionesTab onViewCandidates={handleViewCandidates} />}
            {tab === 'candidatos' && <CandidatosTab />}
          </div>
        </>
      )}
    </main>
  )
}
