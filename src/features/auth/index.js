/**
 * Auth Feature — Public API
 *
 * Exports components, hooks, and state used by other features.
 * Pages (AuthPage) are kept private — imported directly by App.jsx.
 */

// ── Components (reusable UI used across features) ──────────────────
export { AppSidebar } from './components/AppSidebar'
export { default as ProtectedRoute } from './components/ProtectedRoute'
export { TopNav } from './components/TopNav'

// ── Hooks (business logic used by other features) ─────────────────
export { useLogin, useRegister, useMe, useProfile, useUpdateProfile, useActualizarAvatar } from './hooks/useAuth'
export { useSessionVerify } from './hooks/useSessionVerify'

// ── Store (auth state consumed by multiple features) ───────────────
export { useAuthStore } from './store/authStore'

// ── Lib (Firebase bridge — used internally and by api.js) ──────────
export { firebaseBridgeLogin, isBridgeAvailable } from './lib/firebaseBridge'
