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

function detectNotificationUrl(n: RawBackendNotification & Partial<NotificationItem>, isAdmin = false, isEmpresa = false): string {
  // 1. Si el backend ya mandó una URL explícita, usarla
  const explicitUrl = (n.url ?? n.redirect_url ?? n.redirectUrl ?? n.ruta ?? n.path ?? n.enlace ?? n.link ?? n.redireccion) as string | undefined
  if (explicitUrl) return explicitUrl

  // 2. Mapeo prioritario por tipo formal de notificación
  const type = (n.type ?? n.tipo ?? '').toLowerCase()
  if (type === 'publicacion_rechazada' && isAdmin) {
    return '/admin?tab=moderacion'
  }
  if (type.startsWith('publicacion_') || type === 'nuevo_comentario' || type === 'nuevo_me_gusta') {
    return '/social'
  }
  if (type.startsWith('evento_')) {
    return '/social?tab=eventos'
  }
  if (type === 'respuesta_foro') {
    return '/foros'
  }
  if (type.startsWith('identidad_')) {
    return isAdmin ? '/admin?tab=identities' : '/verificacion-identidad'
  }
  if (type === 'bienvenida') {
    return '/profile'
  }
  if (type.startsWith('postulacion_')) {
    return isEmpresa ? '/empresa/dashboard' : '/jobs'
  }
  if (type.startsWith('institucion_')) {
    return isAdmin ? '/admin?tab=institutions' : '/explore'
  }

  // 3. Deducir según palabras clave en título o mensaje (body)
  const text = `${n.title ?? n.titulo ?? ''} ${n.body ?? n.mensaje ?? n.contenido ?? ''}`.toLowerCase()
  
  if (text.includes('identidad') || text.includes('curp') || text.includes('ine') || text.includes('documento')) {
    return isAdmin ? '/admin?tab=identities' : '/verificacion-identidad'
  }
  if (text.includes('moderaci') || text.includes('palabra prohibida') || text.includes('rechazada') || text.includes('revisión')) {
    return isAdmin ? '/admin?tab=moderacion' : '/social'
  }
  if (text.includes('evento')) {
    return '/social?tab=eventos'
  }
  if (text.includes('foro')) {
    return '/foros'
  }
  if (text.includes('publicaci') || text.includes('mensaje') || text.includes('chat') || text.includes('grupo') || text.includes('comunidad') || text.includes('social') || text.includes('coment') || text.includes('gusta')) {
    return '/social'
  }
  if (text.includes('bienvenid') || text.includes('perfil') || text.includes('onboarding') || text.includes('datos')) {
    return '/profile'
  }
  if (text.includes('empleo') || text.includes('vacante') || text.includes('trabajo') || text.includes('postula') || text.includes('candidat') || text.includes('cv')) {
    return isEmpresa ? '/empresa/dashboard' : '/jobs'
  }
  if (text.includes('instituc') || text.includes('reseñ') || text.includes('opinio')) {
    return isAdmin ? '/admin?tab=institutions' : '/explore'
  }
  if (text.includes('alerta') || text.includes('riesgo') || text.includes('severidad')) {
    return '/admin?tab=alerts'
  }
  if (text.includes('administra') || text.includes('panel admin')) {
    return '/admin'
  }

  // 4. Fallback genérico a la página de notificaciones
  return '/notifications'
}

export function useNotifications() {
  const token = useAuthStore(s => s.token)
  const user = useAuthStore(s => s.user)
  const roleRaw = String(user?.role ?? (user as unknown as Record<string, unknown>)?.rol ?? '').toLowerCase()
  const isAdmin = roleRaw === 'admin' || roleRaw === 'administrador'
  const isEmpresa = roleRaw === 'empresa'

  return useQuery<NotificationItem[]>({
    queryKey: ['notifications', roleRaw],
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
        normalized.url = detectNotificationUrl({ ...n, ...normalized }, isAdmin, isEmpresa)
        return normalized
      })

      // Asegurar que usuarios no admin sean redirigidos a su perfil en lugar de intentar ir a admin
      const filtered = mapped.map(n => {
        if (n.url?.startsWith('/admin') && !isAdmin) {
          return { ...n, url: '/profile' }
        }
        return n
      })

      // Si el usuario es administrador, inyectar dinámicamente avisos de tareas pendientes y alertas
      if (isAdmin) {
        try {
          // 1. Estadísticas de aprobación y verificación
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
                url: '/admin?tab=institutions'
              })
            }
          }

          // 2. Alertas activas de la plataforma
          const alertsRes = await api.get<Record<string, unknown>[]>('/administracion/alertas').catch(() => null)
          const rawAlerts = Array.isArray(alertsRes?.data) ? alertsRes.data : []
          rawAlerts.forEach((a, idx) => {
            const isCritica = String(a.severidad ?? a.severity ?? '').toLowerCase() === 'critica' || String(a.severidad ?? a.severity ?? '').toLowerCase() === 'alta'
            filtered.unshift({
              id: `virtual-admin-alert-${a.id ?? idx}`,
              title: (a.titulo ?? a.title ?? 'Alerta de riesgo') as string,
              body: (a.descripcion ?? a.mensaje ?? a.message ?? 'Atención requerida en el panel de administración') as string,
              is_read: false,
              type: isCritica ? 'error' : 'warning',
              created_at: (a.fechaCreacion ?? a.created_at ?? new Date().toISOString()) as string,
              url: '/admin?tab=alerts',
            })
          })
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
