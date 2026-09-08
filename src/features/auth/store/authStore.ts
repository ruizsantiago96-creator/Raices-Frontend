import { create } from 'zustand'
import type { User } from '../../../types/auth'
import {
  getToken,
  getRefreshToken,
  getUser,
  saveToken,
  saveRefreshToken,
  saveUser,
  clearAllAuth,
} from '../../../shared/lib/storage'
import { closeNotificationStream, suspendStream, resumeStream } from '@features/notifications'

/**
 * STORE GLOBAL DE AUTENTICACIÓN (Fase 3 · Migración TS)
 * ====================================================
 */

export interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  setAuth: (
    token: string,
    user?: User | null,
    refresh?: string | null,
    rememberMe?: boolean
  ) => void
  logout: () => void
}

// Restaurar estado desde storage al iniciar la app
const initialToken = getToken()
const initialRefresh = getRefreshToken()
const initialUser = getUser()

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  refreshToken: initialRefresh,
  user: initialUser as User | null,
  setAuth: (token: string, user?: User | null, refresh?: string | null, rememberMe = true) => {
    // Al hacer login, reactivar el stream de notificaciones
    resumeStream()
    saveToken(token, rememberMe)
    saveRefreshToken(refresh, rememberMe)
    saveUser(user, rememberMe)
    set({ token, user: user ?? null, refreshToken: refresh ?? null })
  },
  logout: () => {
    // 🛡️ Evitar bucles infinitos de redirección si ya estamos deslogueados (solo en el navegador real)
    if (process.env.NODE_ENV !== 'test' && !useAuthStore.getState().token && !getToken()) return

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

    // PASO 5: Redirección inmediata y segura a la landing page.
    //    Evita colisiones de estado en renders y limpia cachés pesadas de React Query.
    if (typeof window !== 'undefined' && window.location && process.env.NODE_ENV !== 'test') {
      window.location.replace('/')
    }
  },
}))
