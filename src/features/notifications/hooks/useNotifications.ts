import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import { closeNotificationStream, isStreamSuspended } from '../lib/notificationStream'
import type {
  NotificationItem,
  RawBackendNotification,
  MarkReadResponse,
} from '@/types/notifications'

interface StatsData {
  aprobacionPendiente?: number
  totalInstituciones?: number
  institucionesVerificadas?: number
}

function detectNotificationUrl(n: RawBackendNotification & Partial<NotificationItem>): string {
  // 1. Si el backend ya mandó una URL explícita, usarla
  const explicitUrl = (n.url ?? n.redirect_url ?? n.redirectUrl ?? n.ruta ?? n.path ?? n.enlace ?? n.link ?? n.redireccion) as string | undefined
  if (explicitUrl) return explicitUrl

  // 2. Si no, deducir según las palabras clave en título o mensaje (body)
  const text = `${n.title ?? n.titulo ?? ''} ${n.body ?? n.mensaje ?? n.contenido ?? ''}`.toLowerCase()
  
  if (text.includes('administra') || text.includes('admin') || text.includes('aprob') || text.includes('rechaz') || text.includes('pendiente')) {
    return '/admin'
  }
  if (text.includes('mensaje') || text.includes('chat') || text.includes('grupo') || text.includes('comunidad') || text.includes('social')) {
    return '/social'
  }
  if (text.includes('empleo') || text.includes('vacante') || text.includes('trabajo') || text.includes('postula')) {
    return '/jobs'
  }
  if (text.includes('perfil') || text.includes('onboarding') || text.includes('datos')) {
    return '/profile'
  }
  if (text.includes('instituc') || text.includes('reseñ') || text.includes('opinio')) {
    return '/explore'
  }

  // 3. Fallback genérico a la página de notificaciones
  return '/notifications'
}

export function useNotifications() {
  const { token, user } = useAuthStore()
  const userRole = user?.role

  return useQuery<NotificationItem[]>({
    queryKey: ['notifications', userRole],
    queryFn: async () => {
      const r = await api.get('/notificaciones')
      const res = r.data
      const rawList: RawBackendNotification[] = Array.isArray(res) ? res : (res?.datos ?? [])
      const mapped: NotificationItem[] = rawList.map(n => {
        const normalized: NotificationItem = {
          id: n.id ?? '',
          title: (n.title ?? n.titulo ?? 'Notificación') as string,
          body: (n.body ?? n.mensaje ?? n.contenido ?? '') as string,
          is_read: !!(n.is_read ?? n.leido ?? n.es_leido ?? n.leida ?? n.es_leida ?? false),
          type: (n.type ?? n.tipo ?? 'info') as string,
          created_at: (n.created_at ?? n.creado_at ?? n.fecha ?? new Date().toISOString()) as string,
        }
        normalized.url = detectNotificationUrl({ ...n, ...normalized })
        return normalized
      })

      // Filtrar para que solo el rol 'admin' vea notificaciones destinadas al panel de administración
      const filtered = mapped.filter(n => {
        if (n.url === '/admin' && userRole !== 'admin') {
          return false
        }
        return true
      })

      // Si el usuario es administrador, inyectar dinámicamente avisos de tareas pendientes
      if (userRole === 'admin') {
        try {
          const statsRes = await api.get<StatsData>('/administracion/estadisticas').catch(() => null)
          if (statsRes?.data) {
            const pendingApproval = statsRes.data.aprobacionPendiente ?? 0
            // Excluir las que ya se contaron como pendientes de aprobación (no activas)
            const pendingVerification = Math.max(0, (statsRes.data.totalInstituciones ?? 0) - (statsRes.data.institucionesVerificadas ?? 0) - (statsRes.data.aprobacionPendiente ?? 0))
            const totalPending = pendingApproval + pendingVerification

            if (totalPending > 0) {
              let bodyText = ''
              if (pendingApproval > 0 && pendingVerification > 0) {
                bodyText = `Tienes ${pendingApproval} institución(es) por aprobar y ${pendingVerification} por verificar.`
              } else if (pendingApproval > 0) {
                bodyText = `Tienes ${pendingApproval} institución(es) por aprobar.`
              } else {
                bodyText = `Tienes ${pendingVerification} institución(es) por verificar.`
              }

              filtered.unshift({
                id: 'virtual-admin-pending',
                title: 'Tareas administrativas pendientes',
                body: bodyText,
                is_read: false,
                type: 'warning',
                created_at: new Date().toISOString(),
                url: '/admin'
              })
            }
          }
        } catch (e) {
          console.error('[Notifications] Error generating virtual admin notification:', e)
        }
      }

      return filtered
    },
    enabled: !!token,
    retry: false,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation<MarkReadResponse, Error, string | number>({
    mutationFn: (id) => api.patch<MarkReadResponse>(`/notificaciones/${id}/leer`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation<MarkReadResponse, Error, void>({
    mutationFn: () => api.patch<MarkReadResponse>('/notificaciones/leer-todas').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useNotificationStream(onNotification?: (data: unknown) => void) {
  const { token } = useAuthStore()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (isStreamSuspended()) {
      closeNotificationStream()
      esRef.current = null
      return
    }

    if (!token) {
      closeNotificationStream()
      esRef.current = null
      return
    }

    closeNotificationStream()

    return () => {
      closeNotificationStream()
      esRef.current = null
    }
  }, [token, onNotification])
}
