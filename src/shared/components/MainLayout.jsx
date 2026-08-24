import { Outlet, useLocation } from 'react-router-dom'
import { useAuthStore, useMe, AppSidebar, TopNav } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { usePendingInstitutions, useMyJobPostings, useAllJobApplicants, useMiInstitucion } from '@features/institutions'
import { useAdminAlerts } from '@features/admin'
import { DirectMessages } from '@features/social/pages/MessagesPage'

export default function MainLayout() {
  const { logout } = useAuthStore()
  const { data: user } = useMe()
  const location = useLocation()
  
  // Tab and UI store subscriptions
  const adminTab = useUiStore(s => s.adminTab)
  const setAdminTab = useUiStore(s => s.setAdminTab)
  const instPortalTab = useUiStore(s => s.instPortalTab)
  const setInstPortalTab = useUiStore(s => s.setInstPortalTab)

  // Determinar el modo según la ruta
  const isAdmin = location.pathname.startsWith('/admin')
  const isInstPortal = location.pathname.startsWith('/institution-portal')
  const sidebarMode = isAdmin ? 'admin' : isInstPortal ? 'institution' : 'app'

  // Consultas de React Query para los contadores de la barra lateral (seguras según el modo)
  const { data: pendingInsts = [] } = usePendingInstitutions({ enabled: isAdmin })
  const { data: adminAlerts = [] } = useAdminAlerts({ enabled: isAdmin })
  const totalPendingCount = pendingInsts.length
  const criticalCount = adminAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length

  // Solo buscar la institución del usuario cuando estamos en el portal
  const { data: myInstitution, isLoading: loadingMyInst } = useMiInstitucion({ enabled: isInstPortal })
  const hasInstitution = isInstPortal && !loadingMyInst && !!myInstitution

  // Solo buscar vacantes y postulantes si ya existe una institución
  const { data: jobs = [] } = useMyJobPostings({ enabled: hasInstitution })
  const { data: applicants = [] } = useAllJobApplicants({ enabled: hasInstitution })
  const activeJobs = jobs.filter(j => j.is_active).length
  const pendingApplicants = applicants.filter(a => a.status === 'pending').length
  const instStats = { activeJobs, pendingApplicants }

  // Determinar la página/pestaña actual para resaltar el elemento correcto
  let currentPage = ''
  if (sidebarMode === 'app') {
    if (location.pathname.startsWith('/dashboard')) currentPage = 'dashboard'
    else if (location.pathname.startsWith('/explore')) currentPage = 'explore'
    else if (location.pathname.startsWith('/jobs')) currentPage = 'jobs'
    else if (location.pathname.startsWith('/favorites')) currentPage = 'favorites'
    else if (location.pathname.startsWith('/social')) currentPage = 'social'
    else if (location.pathname.startsWith('/personas') || location.pathname.startsWith('/familia')) currentPage = 'tutor'
    else if (location.pathname.startsWith('/profile')) currentPage = 'profile'
    else if (location.pathname.startsWith('/notifications')) currentPage = 'notifications'
  }

  // Resolver props de pestañas según el modo
  const activeTab = sidebarMode === 'admin' ? adminTab : sidebarMode === 'institution' ? instPortalTab : undefined
  const handleTabChange = sidebarMode === 'admin' ? setAdminTab : sidebarMode === 'institution' ? setInstPortalTab : undefined

  // Floating chat states
  const floatingChatOpen = useUiStore(s => s.floatingChatOpen)
  const setFloatingChatOpen = useUiStore(s => s.setFloatingChatOpen)
  const floatingChatMinimized = useUiStore(s => s.floatingChatMinimized)
  const setFloatingChatMinimized = useUiStore(s => s.setFloatingChatMinimized)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      {/* 1. Barra Lateral Global */}
      <AppSidebar 
        mode={sidebarMode} 
        currentPage={currentPage}
        tab={activeTab}
        onTab={handleTabChange}
        pendingCount={totalPendingCount}
        alertCritical={criticalCount}
        stats={instStats}
      />

      {/* 2. Barra Superior Global */}
      <TopNav user={user} onLogout={logout} currentPage={currentPage} />

      {/* 3. Contenido Principal */}
      <Outlet />

      {/* 4. Chat Flotante estilo Reddit */}
      {floatingChatOpen && (
        floatingChatMinimized ? (
          <div 
            onClick={() => setFloatingChatMinimized(false)}
            style={{
              position: 'fixed', bottom: 0, right: 24,
              width: 180, height: 42,
              background: '#0F172A', color: '#fff',
              borderRadius: '12px 12px 0 0',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.15)',
              zIndex: 4000, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 16px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5,
              transition: 'transform 0.2s, background-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor = '#1E293B';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#0F172A';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💬</span>
              <span>Chats</span>
            </div>
            <span style={{ fontSize: 10 }}>▲</span>
          </div>
        ) : (
          <div className="animate-scale-in" style={{
            position: 'fixed', bottom: 0, right: 24,
            width: 640, height: 480,
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-color)',
            borderBottom: 'none',
            borderRadius: '16px 16px 0 0',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
            zIndex: 4000,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}>
            <DirectMessages 
              currentUserId={user?.id} 
              isFloating={true} 
              onClose={() => setFloatingChatOpen(false)} 
            />
          </div>
        )
      )}
    </div>
  )
}
