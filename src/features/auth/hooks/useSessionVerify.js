import { useState, useEffect } from 'react'
import api from '@shared/lib/api'
import { useAuthStore } from '../store/authStore'
import { getToken } from '@shared/lib/storage'

/**
 * Hook que verifica la sesión del usuario al montar la aplicación.
 *
 * Flujo:
 * 1. Al montar, busca `raices_token` en localStorage (o sessionStorage).
 * 2. Si no existe → el usuario NO está autenticado.
 * 3. Si existe → llama a `GET /api/auth/me` para validar el token.
 * 4. Si la respuesta es exitosa → actualiza el store con los datos del perfil.
 * 5. Si falla → limpia el token y marca al usuario como no autenticado.
 *
 * @returns {{ isVerified: boolean, isChecking: boolean, error: string | null }}
 *
 * Uso típico en App.jsx:
 *   const { isVerified, isChecking, error } = useSessionVerify()
 *   if (isChecking) return <LoadingScreen />
 *   // Continuar con las rutas...
 */
export function useSessionVerify() {
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState(null)
  const [isVerified, setIsVerified] = useState(false)

  const { logout } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    async function verifySession() {
      // 1. Verificar si existe un token en storage
      const storedToken = getToken()

      if (!storedToken) {
        // No hay token → sesión no válida
        if (!cancelled) {
          setIsChecking(false)
          setIsVerified(false)
          // Asegurar que el store esté limpio
          logout()
        }
        return
      }

      // 2. Token existe → validar contra el servidor
      try {
        const response = await api.get('/auth/me')
        const userData = response.data

        if (!cancelled) {
          // 3. Mapear la respuesta del servidor al store
          // El servidor retorna: { id, email, role, full_name, city, state, avatar_url, is_verified }
          // Actualizamos el store con la información fresca del servidor
          useAuthStore.setState({
            user: {
              id: userData.id,
              email: userData.email,
              role: userData.role,
              full_name: userData.full_name,
              city: userData.city,
              state: userData.state,
              avatar_url: userData.avatar_url,
              is_verified: userData.is_verified,
            },
          })

          console.log('[SessionVerify] Session valid:', userData.email)
          setIsVerified(true)
          setIsChecking(false)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          // 4. Error en la validación → limpiar token y marcar como no autenticado
          console.error('[SessionVerify] Error validating session:', err.message)

          // Limpiar el store (logout() ya llama clearAllAuth() internamente)
          logout()

          setIsVerified(false)
          setIsChecking(false)

          // Capturar mensaje de error útil
          if (err.response?.status === 401) {
            setError('Sesión expirada. Por favor, inicia sesión novamente.')
          } else if (err.response?.status === 403) {
            setError('Acceso denegado.')
          } else if (!err.response) {
            setError('Error de conexión. Verifica tu conexión a internet.')
          } else {
            setError('Error al verificar la sesión. Por favor, inicia sesión.')
          }
        }
      }
    }

    verifySession()

    // Cleanup: evitar actualizaciones de estado si el componente se desmonta
    return () => {
      cancelled = true
    }
  }, []) // ← Array de dependencias vacío: solo se ejecuta al montar

  return { isVerified, isChecking, error }
}
