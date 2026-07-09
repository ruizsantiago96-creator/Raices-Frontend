import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        localStorage.removeItem('raices_token')
        set({ token: null, user: null })
      },
    }),
    {
      name: 'raices_auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) localStorage.setItem('raices_token', state.token)
      },
    }
  )
)
