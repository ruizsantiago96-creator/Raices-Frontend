/**
 * useFCM — Hook para Firebase Cloud Messaging Push Notifications
 *
 * Funcionalidades:
 *  1. Solicita permiso de notificaciones al usuario
 *  2. Obtiene el Token FCM del dispositivo
 *  3. Envía el token al backend para asociarlo al usuario autenticado
 *  4. Escucha notificaciones en primer plano (onMessage)
 *  5. Integra con el sistema de Toasts globales (useUiStore)
 *
 * Uso:
 *   Dentro de App.jsx o ProtectedRoute:
 *     const { token, permissionStatus } = useFCM()
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import api from '@shared/lib/api'
import { getFirebaseMessaging, isFCMConfigured, VAPID_KEY } from '../lib/firebase'

export function useFCM() {
  const { token: authToken } = useAuthStore()
  const addToast = useUiStore(s => s.addToast)
  const [fcmToken, setFcmToken] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  // Ref para evitar duplicados en el efecto
  const initRef = useRef(false)

  /**
   * Envía el token FCM al backend para asociarlo al usuario.
   */
  const sendTokenToBackend = useCallback(async (tokenFcm) => {
    if (!authToken || !tokenFcm) return

    try {
      await api.post('/notificaciones/fcm-token', { token: tokenFcm })
      console.log('[FCM] Token enviado al backend correctamente.')
    } catch (err) {
      console.error('[FCM] Error al enviar token al backend:', err)
    }
  }, [authToken])

  /**
   * Solicita permiso y obtiene el token FCM, luego lo envía al backend.
   */
  const requestPermission = useCallback(async () => {
    if (!isFCMConfigured()) {
      console.warn('[FCM] Variables de Firebase no configuradas. Se omiten push notifications.')
      return null
    }

    if (!authToken) {
      console.warn('[FCM] No hay sesión activa. Se omite registro FCM.')
      return null
    }

    // Verificar soporte del navegador
    if (typeof Notification === 'undefined' || typeof navigator === 'undefined') {
      console.warn('[FCM] El navegador no soporta notificaciones.')
      return null
    }

    try {
      // 1. Solicitar permiso
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)

      if (permission !== 'granted') {
        console.log('[FCM] Permiso de notificaciones denegado por el usuario.')
        return null
      }

      // 2. Obtener el Service Worker registration
      if (!('serviceWorker' in navigator)) {
        console.warn('[FCM] Service Workers no soportados.')
        return null
      }

      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      })
      console.log('[FCM] Service Worker registrado:', swRegistration.scope)

      // 3. Obtener el messaging instance
      const messaging = await getFirebaseMessaging()
      if (!messaging) {
        console.warn('[FCM] No se pudo inicializar Firebase Messaging.')
        return null
      }

      // 4. Importar getToken dinámicamente (Firebase modular SDK)
      const { getToken } = await import('firebase/messaging')

      // 5. Obtener el token
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      })

      if (!currentToken) {
        console.warn('[FCM] No se pudo obtener el token FCM.')
        return null
      }

      console.log('[FCM] Token obtenido:', currentToken.substring(0, 20) + '...')
      setFcmToken(currentToken)

      // 6. Enviar el token al backend
      await sendTokenToBackend(currentToken)

      return currentToken
    } catch (err) {
      console.error('[FCM] Error al solicitar permiso/obtener token:', err)
      return null
    }
  }, [authToken, sendTokenToBackend])

  /**
   * Elimina el token FCM del backend al cerrar sesión.
   */
  const removeTokenFromBackend = useCallback(async () => {
    if (!fcmToken) return

    try {
      await api.delete('/notificaciones/fcm-token', { data: { token: fcmToken } })
      console.log('[FCM] Token eliminado del backend.')
    } catch (err) {
      console.error('[FCM] Error al eliminar token del backend:', err)
    }
    setFcmToken(null)
  }, [fcmToken])

  // ─── Efecto: Registrar token al tener sesión + escuchar mensajes en primer plano ──
  useEffect(() => {
    if (!authToken || !isFCMConfigured()) return
    if (initRef.current) return // Evitar doble inicialización en StrictMode
    initRef.current = true

    let unsubscribe = null

    const setup = async () => {
      // Registrar token FCM
      await requestPermission()

      // Escuchar notificaciones en primer plano
      const messaging = await getFirebaseMessaging()
      if (!messaging) return

      const { onMessage } = await import('firebase/messaging')

      unsubscribe = onMessage(messaging, (payload) => {
        console.log('[FCM] Mensaje en primer plano:', payload)

        const title = payload.notification?.title ?? 'Nueva notificación'
        const body = payload.notification?.body ?? ''

        // Integrar con el sistema de toasts globales
        addToast(`${title}${body ? ': ' + body : ''}`, 'info')

        // Disparar evento custom para que NotificationBell refresque la lista
        window.dispatchEvent(new CustomEvent('fcm-notification', { detail: payload }))
      })
    }

    setup()

    return () => {
      if (unsubscribe) unsubscribe()
      initRef.current = false
    }
  }, [authToken]) // Solo depender de authToken — addToast y requestPermission son estables

  return {
    fcmToken,
    permissionStatus,
    requestPermission,
    removeTokenFromBackend,
    isConfigured: isFCMConfigured(),
  }
}
