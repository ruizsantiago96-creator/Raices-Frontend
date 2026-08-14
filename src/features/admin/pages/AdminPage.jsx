import { useNavigate } from 'react-router-dom'
import { useMe } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { useAdminAlerts } from '../hooks/useAdmin'
import { UsersTab } from '@features/users'
import { ReviewsTab } from '@features/reviews'
import OverviewTab from '../components/OverviewTab'
import IntelligenceTab from '../components/IntelligenceTab'
import InstitutionsTab from '../components/InstitutionsTab'
import IdentitiesTab from '../components/IdentitiesTab'
import SettingsTab from '../components/SettingsTab'
import AlertsTab from '../components/AlertsTab'

export default function AdminPage() {
  const navigate = useNavigate()
  const { data: user } = useMe()
  const tab = useUiStore(s => s.adminTab)
  const onTab = useUiStore(s => s.setAdminTab)
  const { data: alerts = [] } = useAdminAlerts()

  const TAB_TITLES = {
    overview: 'Resumen del ecosistema',
    intelligence: 'Inteligencia de necesidades',
    institutions: 'Gestión de instituciones',
    users: 'Gestión de usuarios',
    identities: 'Verificación de identidad',
    reviews: 'Moderación de reseñas',
    alerts: 'Alertas de riesgo',
    settings: 'Configuración de plataforma',
  }

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '1200px' }}>
      {/* Section Title */}
      <h1 key={tab} className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginBottom: 28, letterSpacing: '-0.02em' }}>
        {TAB_TITLES[tab]}
      </h1>

      <div key={`content-${tab}`} className="animate-tab-in">
        {tab === 'overview' && <OverviewTab onNavigate={onTab} />}
        {tab === 'intelligence' && <IntelligenceTab />}
        {tab === 'institutions' && <InstitutionsTab />}
        {tab === 'users' && <UsersTab currentUserId={user?.id} />}
        {tab === 'identities' && <IdentitiesTab />}
        {tab === 'reviews' && <ReviewsTab />}
        {tab === 'alerts' && <AlertsTab alerts={alerts} onNavigate={onTab} />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </main>
  )
}
