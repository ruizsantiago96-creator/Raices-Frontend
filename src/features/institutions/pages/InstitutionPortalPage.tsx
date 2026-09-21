import { useNavigate } from 'react-router-dom'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { useMiInstitucion } from '../hooks/useInstitutions'
import ServiciosTab from '../components/ServiciosTab'
import ResenasTab from '../components/ResenasTab'
import { ForosExplorer } from '@features/social/pages/ForosPage'
import { PORTAL_UI } from '../constants/institutionPortalMessages'

const TAB_TITLES: Record<string, string> = {
  servicios: 'Catálogo de Servicios y Programas',
  resenas: 'Reputación y Reseñas',
  foros: PORTAL_UI.TAB_FOROS,
}

export default function InstitutionPortalPage() {
  const navigate = useNavigate()
  const tab = useUiStore(s => s.instPortalTab)

  const { data: institution, isLoading: loadingInst } = useMiInstitucion()

  const hasInstitution = !loadingInst && !!institution

  const currentTab = (tab && TAB_TITLES[tab]) ? tab : 'servicios'

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '1100px' } as Record<string, string>}>
      {/* Loading */}
      {loadingInst && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: 'var(--fg3)', fontSize: 15, gap: 10 }}>
          {Icons.loader({ s: 20 })} Cargando información de la institución...
        </div>
      )}

      {/* No institution — auto-redirect to registration */}
      {!loadingInst && !institution && (
        <div className="animate-fade-in-up" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '48px 32px', maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {Icons.building({ s: 28 })}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>Completa el registro de tu institución</h2>
          <p style={{ fontSize: 15, color: 'var(--fg3)', marginBottom: 8, lineHeight: 1.6 }}>Tu cuenta de usuario fue creada correctamente, pero aún falta registrar los datos de tu institución.</p>
          <p style={{ fontSize: 13, color: 'var(--fg3)', marginBottom: 24, lineHeight: 1.5 }}>Esto es un paso necesario para difundir servicios y participar en la comunidad.</p>
          <button onClick={() => navigate('/institution-portal/registro')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {Icons.plus({ s: 18 })} Registrar datos de mi institución
          </button>
        </div>
      )}

      {/* Institution exists - show dashboard */}
      {hasInstitution && (
        <>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 key={currentTab} className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', margin: 0, letterSpacing: '-0.02em' }}>
                {TAB_TITLES[currentTab]}
              </h1>
              <span style={{ fontSize: 14, color: 'var(--fg3)', fontWeight: 500 }}>
                {institution.name} {institution.is_verified && '✓ Verificada'}
              </span>
            </div>

            <button
              onClick={() => navigate(`/explore`)}
              style={{
                padding: '10px 18px', borderRadius: 10, border: '1.5px solid var(--border-color)',
                background: 'var(--bg-surface)', color: 'var(--primary)', fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: 'var(--shadow-xs)', transition: 'all 0.15s ease',
              }}
            >
              👁️ Vista Previa de Perfil Público
            </button>
          </div>

          <div key={`content-${currentTab}`} className="animate-tab-in">
            {currentTab === 'servicios' && <ServiciosTab />}
            {currentTab === 'resenas' && <ResenasTab />}
            {currentTab === 'foros' && <ForosExplorer showHeader={false} />}
          </div>
        </>
      )}
    </main>
  )
}
