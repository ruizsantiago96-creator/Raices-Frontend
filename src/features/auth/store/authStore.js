import { create } from 'zustand'
import { getToken, getRefreshToken, getUser, saveToken, saveRefreshToken, saveUser, clearAllAuth } from '../../../shared/lib/storage'
import { closeNotificationStream, suspendStream, resumeStream } from '@features/notifications'

// Restaurar estado desde storage al iniciar la app
const initialToken = getToken()
const initialRefresh = getRefreshToken()
const initialUser = getUser()

export const useAuthStore = create((set) => ({
  token: initialToken,
  refreshToken: initialRefresh,
  user: initialUser,
  setAuth: (token, user, refresh, rememberMe) => {
    // Al hacer login, reactivar el stream de notificaciones
    resumeStream()
    saveToken(token, rememberMe)
    saveRefreshToken(refresh, rememberMe)
    saveUser(user, rememberMe)
    set({ token, user, refreshToken: refresh ?? null })
  },
  logout: () => {
    // 🔒 PASO 1: Activar freno de mano — bloquea TODA creación de EventSource
    //    Esto debe ser lo PRIMERO que se ejecuta, antes de cualquier
    //    cambio de estado que pueda provocar re-renders en React.
    suspendStream()

    // PASO 2: Cerrar la conexión SSE activa
    closeNotificationStream()

    // PASO 3: Limpiar tokens de localStorage / sessionStorage
    clearAllAuth()

    // PASO 4: Resetear el store de Zustand (dispara re-render)
    //    Con el freno activo, ningún useEffect creará un nuevo
    //    EventSource durante el proceso de desmontaje.
    set({ token: null, user: null, refreshToken: null })
  },
}))
