import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'
import { setActiveEventSource, closeNotificationStream, isStreamSuspended } from '../lib/notificationStream'

function detectNotificationUrl(n) {
  // 1. Si el backend ya mandó una URL explícita, usarla
  const explicitUrl = n.url ?? n.redirect_url ?? n.redirectUrl ?? n.ruta ?? n.path ?? n.enlace ?? n.link ?? n.redireccion
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

  return useQuery({
    queryKey: ['notifications', userRole],
    queryFn: async () => {
      const r = await api.get('/notificaciones')
      const res = r.data
      const rawList = Array.isArray(res) ? res : (res?.datos ?? [])
      const mapped = rawList.map(n => {
        const normalized = {
          id: n.id,
          title: n.title ?? n.titulo ?? 'Notificación',
          body: n.body ?? n.mensaje ?? n.contenido ?? '',
          is_read: !!(n.is_read ?? n.leido ?? n.es_leido ?? n.leida ?? n.es_leida ?? false),
          type: n.type ?? n.tipo ?? 'info',
          created_at: n.created_at ?? n.creado_at ?? n.fecha ?? new Date().toISOString(),
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
          const statsRes = await api.get('/administracion/estadisticas').catch(() => null)
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
    // 🔒 No ejecutar la petición si no hay token activo.
    //    Esto evita errores 500 del servidor durante el logout,
    //    cuando el token ya fue eliminado del store pero React
    //    aún está procesando el desmontaje de componentes.
    enabled: !!token,
    // Si el token desaparece (logout), no reintentar la query fallida
    retry: false,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/notificaciones/${id}/leer`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notificaciones/leer-todas').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useNotificationStream(onNotification) {
  const { token } = useAuthStore()
  const esRef = useRef(null)

  useEffect(() => {
    // 🔒 FRENO DE MANO: Si el stream está suspendido (logout en curso),
    //    NO crear ningún EventSource. Esto previene la reconexión
    //    huérfana durante la ventana de desmontaje de React.
    if (isStreamSuspended()) {
      closeNotificationStream()
      esRef.current = null
      return
    }

    // Si no hay token, cerrar cualquier conexión existente y salir
    if (!token) {
      closeNotificationStream()
      esRef.current = null
      return
    }

    // Cerrar conexión previa si existiera (evita duplicados)
    closeNotificationStream()

    // ⚠️ SSE temporalmente deshabilitado.
    //    El endpoint /notificaciones/flujo devuelve 401 en el backend actual.
    //    El polling de useNotifications() ya funciona correctamente.
    //    Para reactivar: descomentar el bloque de abajo.
    //
    // const baseUrl = import.meta.env.VITE_API_URL ?? '/api'
    // const es = new EventSource(`${baseUrl}/notificaciones/flujo?token=${token}`)
    // esRef.current = es
    // setActiveEventSource(es)
    //
    // es.onmessage = (e) => {
    //   try {
    //     const data = JSON.parse(e.data)
    //     onNotification?.(data)
    //   } catch { /* ignore malformed data */ }
    // }
    //
    // es.onerror = () => {
    //   closeNotificationStream()
    //   esRef.current = null
    // }

    return () => {
      closeNotificationStream()
      esRef.current = null
    }
  }, [token, onNotification])
}
