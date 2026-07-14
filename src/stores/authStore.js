import { create } from 'zustand'
import { getToken, getRefreshToken, getUser, saveToken, saveRefreshToken, saveUser, clearAllAuth } from '../lib/storage'

// Restaurar estado desde storage al iniciar la app
const initialToken = getToken()
const initialRefresh = getRefreshToken()
const initialUser = getUser()

export const useAuthStore = create((set) => ({
  token: initialToken,
  refreshToken: initialRefresh,
  user: initialUser,
  setAuth: (token, user, refresh, rememberMe) => {
    saveToken(token, rememberMe)
    saveRefreshToken(refresh, rememberMe)
    saveUser(user, rememberMe)
    set({ token, user, refreshToken: refresh ?? null })
  },
  logout: () => {
    clearAllAuth()
    set({ token: null, user: null, refreshToken: null })
  },
}))
