/**
 * Auth Feature — Public API
 *
 * Exports components, hooks, and state used by other features.
 * Pages (AuthPage) are kept private — imported directly by App.jsx.
 */

// ── Components (reusable UI used across features) ──────────────────
export { AppSidebar } from './components/AppSidebar'
export { default as ProtectedRoute } from './components/ProtectedRoute'
export { default as FeatureGuard } from './components/FeatureGuard'
export { default as SoloPersonaFisica } from './components/SoloPersonaFisica'
export { TopNav } from './components/TopNav'

// ── Hooks (business logic used by other features) ─────────────────
export { useLogin, useRegister, useMe, useProfile, useUpdateProfile, useUpdateNeedsProfile, useActualizarAvatar, useEliminarAvatar, getHomePathByRole } from './hooks/useAuth'
export { useSessionVerify } from './hooks/useSessionVerify'

// ── Store (auth state consumed by multiple features) ───────────────
export { useAuthStore } from './store/authStore'

// ── Lib (Firebase bridge — used internally and by api.js) ──────────
export { firebaseBridgeLogin, isBridgeAvailable } from './lib/firebaseBridge'

// ── Lib (persona moral / gating de empresa) ────────────────────────
export {
  esEmpresa,
  esRutaEmpresa,
  useEsEmpresa,
  EMPRESA_HOME,
  EMPRESA_EDITAR,
  RUTAS_EMPRESA,
} from './lib/empresaRole'
