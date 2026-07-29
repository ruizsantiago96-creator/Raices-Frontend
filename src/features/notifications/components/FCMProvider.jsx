/**
 * FCMProvider — Componente que inicializa Firebase Cloud Messaging
 * y lo conecta con el flujo de autenticación.
 *
 * Se coloca en el árbol de componentes DESPUÉS de QueryClientProvider
 * y BrowserRouter, para que tenga acceso a auth store y router.
 *
 * Uso en App.jsx:
 *   <FCMProvider>
 *     <Routes>...</Routes>
 *   </FCMProvider>
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFCM } from '../hooks/useFCM'

/**
 * Escucha eventos custom de FCM en primer plano y refresca
 * la lista de notificaciones del backend.
 */
function useFCMNotificationListener() {
  const qc = useQueryClient()

  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    }

    window.addEventListener('fcm-notification', handler)
    return () => window.removeEventListener('fcm-notification', handler)
  }, [qc])
}

/**
 * Componente provider que activa FCM cuando el usuario tiene sesión.
 * No renderiza nada — solo ejecuta side-effects.
 */
export default function FCMProvider({ children }) {
  const { removeTokenFromBackend } = useFCM()
  useFCMNotificationListener()

  // Cleanup: eliminar token del backend al cerrar sesión
  useEffect(() => {
    return () => {
      removeTokenFromBackend()
    }
  }, [removeTokenFromBackend])

  return children
}
