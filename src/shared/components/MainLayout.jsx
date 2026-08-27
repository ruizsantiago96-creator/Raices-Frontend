import { useState, useRef, useEffect } from 'react'
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
  const floatingChatMaximized = useUiStore(s => s.floatingChatMaximized)

  // Draggable and Resizable Chat Logic
  const [position, setPosition] = useState({ right: 24, bottom: 0 })
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 })
  const [isDragging, setIsDragging] = useState(false)
  
  const dragStartRef = useRef({ startX: 0, startY: 0, startRight: 24, startBottom: 0 })
  const resizeStartRef = useRef({ startX: 0, startY: 0, startWidth: 640, startHeight: 480, direction: 'n' })

  const handleDragStart = (e) => {
    if (floatingChatMaximized) return
    if (e.target.closest('button, input, select, textarea, a')) return

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    setIsDragging(true)
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      startRight: position.right,
      startBottom: position.bottom
    }

    if (e.touches) {
      document.addEventListener('touchmove', handleDragMove, { passive: false })
      document.addEventListener('touchend', handleDragEnd)
    } else {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
    }
  }

  const handleDragMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const { startX, startY, startRight, startBottom } = dragStartRef.current

    const dx = clientX - startX
    const dy = clientY - startY

    const newRight = Math.max(-100, Math.min(window.innerWidth - 100, startRight - dx))
    const newBottom = Math.max(-300, Math.min(window.innerHeight - 100, startBottom - dy))

    setPosition({ right: newRight, bottom: newBottom })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('touchend', handleDragEnd)
  }

  const handleResizeStart = (e, direction) => {
    if (floatingChatMaximized) return
    e.preventDefault()
    e.stopPropagation()

    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    resizeStartRef.current = {
      startX: clientX,
      startY: clientY,
      startWidth: dimensions.width,
      startHeight: dimensions.height,
      direction
    }

    if (e.touches) {
      document.addEventListener('touchmove', handleResizeMove, { passive: false })
      document.addEventListener('touchend', handleResizeEnd)
    } else {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
    }
  }

  const handleResizeMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const { startX, startY, startWidth, startHeight, direction } = resizeStartRef.current

    const dx = clientX - startX
    const dy = clientY - startY

    let newWidth = startWidth
    let newHeight = startHeight

    if (direction.includes('w')) {
      newWidth = Math.max(400, Math.min(window.innerWidth - 100, startWidth - dx))
    }

    if (direction.includes('n')) {
      newHeight = Math.max(300, Math.min(window.innerHeight - 100, startHeight - dy))
    }

    setDimensions({ width: newWidth, height: newHeight })
  }

  const handleResizeEnd = () => {
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
    document.removeEventListener('touchmove', handleResizeMove)
    document.removeEventListener('touchend', handleResizeEnd)
  }

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('touchmove', handleDragMove)
      document.removeEventListener('touchend', handleDragEnd)
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
      document.removeEventListener('touchmove', handleResizeMove)
      document.removeEventListener('touchend', handleResizeEnd)
    }
  }, [])

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
            position: 'fixed',
            bottom: floatingChatMaximized ? 24 : position.bottom,
            right: floatingChatMaximized ? 24 : position.right,
            width: floatingChatMaximized ? 'calc(100vw - 48px)' : dimensions.width,
            height: floatingChatMaximized ? 'calc(100vh - 100px)' : dimensions.height,
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-color)',
            borderBottom: floatingChatMaximized ? '1.5px solid var(--border-color)' : 'none',
            borderRadius: floatingChatMaximized ? '16px' : '16px 16px 0 0',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
            zIndex: 4000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {!floatingChatMaximized && (
              <>
                {/* Top Resize Handle */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'n')}
                  onTouchStart={(e) => handleResizeStart(e, 'n')}
                  style={{
                    position: 'absolute', top: -3, left: 0, right: 0, height: 6,
                    cursor: 'ns-resize', zIndex: 4010
                  }}
                />
                {/* Left Resize Handle */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'w')}
                  onTouchStart={(e) => handleResizeStart(e, 'w')}
                  style={{
                    position: 'absolute', top: 0, bottom: 0, left: -3, width: 6,
                    cursor: 'ew-resize', zIndex: 4010
                  }}
                />
                {/* Top-Left Resize Handle */}
                <div
                  onMouseDown={(e) => handleResizeStart(e, 'nw')}
                  onTouchStart={(e) => handleResizeStart(e, 'nw')}
                  style={{
                    position: 'absolute', top: -5, left: -5, width: 10, height: 10,
                    cursor: 'nwse-resize', zIndex: 4020
                  }}
                />
              </>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <DirectMessages 
                currentUserId={user?.id} 
                isFloating={true} 
                onClose={() => setFloatingChatOpen(false)} 
                dragHandleProps={{
                  onMouseDown: handleDragStart,
                  onTouchStart: handleDragStart,
                  style: { cursor: isDragging ? 'grabbing' : 'grab' }
                }}
              />
            </div>
          </div>
        )
      )}
    </div>
  )
}
