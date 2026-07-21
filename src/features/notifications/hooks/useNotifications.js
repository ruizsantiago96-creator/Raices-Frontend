import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import api from '../../../shared/lib/api'
import { useAuthStore } from '@features/auth/store/authStore'
import { setActiveEventSource, closeNotificationStream, isStreamSuspended } from '../lib/notificationStream'

export function useNotifications() {
  const { token } = useAuthStore()

  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
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
    mutationFn: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all').then(r => r.data),
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

    // Use full backend URL for EventSource (relative URLs go to FileZilla, not the API)
    const baseUrl = import.meta.env.VITE_API_URL ?? '/api'
    const es = new EventSource(`${baseUrl}/notifications/stream?token=${token}`)
    esRef.current = es
    setActiveEventSource(es)

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        onNotification?.(data)
      } catch { /* ignore malformed data */ }
    }

    es.onerror = () => {
      // Cerrar en cualquier error (token inválido, 401, o red).
      // Esto evita reconexiones infinitas con tokens obsoletos.
      // Trade-off: un corte de red temporal requiere refrescar la página.
      closeNotificationStream()
      esRef.current = null
    }

    return () => {
      closeNotificationStream()
      esRef.current = null
    }
  }, [token])
}
