import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import api from '@shared/lib/api'
import { getLazyMessaging, isFCMConfigured, VAPID_KEY } from '../lib/firebase'

export function useFCM() {
  // Selector atómico estricto: el hook SOLO se suscribe a cambios en token
  const token = useAuthStore((state) => state.token)
  const addToast = useUiStore((state) => state.addToast)

  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  const isSubscribedRef = useRef(false)

  const sendTokenToBackend = useCallback(async (tokenFcm: string) => {
    if (!token || !tokenFcm) return
    try {
      await api.post('/notificaciones/fcm-token', { token: tokenFcm })
      console.log('[FCM] Token enviado al backend correctamente.')
    } catch (err) {
      console.error('[FCM] Error al enviar token al backend:', err)
    }
  }, [token])

  const requestPermission = useCallback(async () => {
    if (!isFCMConfigured() || !token) return null
    if (typeof Notification === 'undefined' || typeof navigator === 'undefined') return null

    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)

      if (permission !== 'granted') return null
      if (!('serviceWorker' in navigator)) return null

      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      })

      const messaging = await getLazyMessaging()
      if (!messaging) return null

      const { getToken } = await import('firebase/messaging')

      const currentFcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      })

      if (!currentFcmToken) return null

      setFcmToken(currentFcmToken)
      await sendTokenToBackend(currentFcmToken)

      return currentFcmToken
    } catch (err) {
      console.error('[FCM] Error al solicitar permiso/obtener token:', err)
      return null
    }
  }, [token, sendTokenToBackend])

  const removeTokenFromBackend = useCallback(async () => {
    if (!fcmToken) return
    try {
      await api.delete('/notificaciones/fcm-token', { data: { token: fcmToken } })
    } catch (err) {
      console.error('[FCM] Error al eliminar token del backend:', err)
    }
    setFcmToken(null)
  }, [fcmToken])

  useEffect(() => {
    if (!token || !isFCMConfigured()) {
      isSubscribedRef.current = false
      return
    }

    if (isSubscribedRef.current) return

    let unsubscribeMessage: (() => void) | undefined
    let isCancelled = false

    async function setupNotifications() {
      const messaging = await getLazyMessaging()
      if (!messaging || isCancelled) return

      try {
        const { onMessage } = await import('firebase/messaging')

        await requestPermission()

        unsubscribeMessage = onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? 'Nueva notificación'
          const body = payload.notification?.body ?? ''

          addToast(`${title}${body ? ': ' + body : ''}`, 'info')
          window.dispatchEvent(new CustomEvent('fcm-notification', { detail: payload }))
        })

        if (!isCancelled) {
          isSubscribedRef.current = true
        }
      } catch (error) {
        console.error('Error al inicializar FCM:', error)
      }
    }

    void setupNotifications()

    return () => {
      isCancelled = true
      if (unsubscribeMessage) {
        unsubscribeMessage()
      }
      isSubscribedRef.current = false
    }
  }, [token, addToast, requestPermission])

  return {
    fcmToken,
    permissionStatus,
    requestPermission,
    removeTokenFromBackend,
    isConfigured: isFCMConfigured(),
  }
}
