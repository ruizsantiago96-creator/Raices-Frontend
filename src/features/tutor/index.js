/**
 * Tutor Feature — Public API
 *
 * Exports hooks used by other features.
 * Pages (TutorPage) are kept private — imported directly by App.jsx.
 */

// ── Hooks ──────────────────────────────────────────────────────────
export { useAI } from './hooks/useAI'
export { useDependientes, useAddDependiente, useUpdateDependent, useDeleteDependent } from './hooks/useDependientes'
export { usePermisos, useUpdatePermisos, useRegisterDependiente, DEFAULT_PERMISOS, PERMISOS_CONFIG } from './hooks/usePermisos'

// ── Components ─────────────────────────────────────────────────────
export { default as PermissionsModal } from './components/PermissionsModal'
