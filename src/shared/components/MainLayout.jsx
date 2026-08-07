import { Outlet, useLocation } from 'react-router-dom'
import { useAuthStore, useMe, AppSidebar, TopNav } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { usePendingInstitutions, useMyJobPostings, useAllJobApplicants } from '@features/institutions'
import { useAdminAlerts } from '@features/admin'

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
  const { data: pendingInsts = [] } = usePendingInstitutions(undefined, { enabled: isAdmin })
  const { data: adminAlerts = [] } = useAdminAlerts(undefined, { enabled: isAdmin })
  const totalPendingCount = pendingInsts.length
  const criticalCount = adminAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length

  const { data: jobs = [] } = useMyJobPostings(undefined, { enabled: isInstPortal })
  const { data: applicants = [] } = useAllJobApplicants(undefined, { enabled: isInstPortal })
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
    </div>
  )
}
