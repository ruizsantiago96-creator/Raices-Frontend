/**
 * Tutor Feature — Public API
 *
 * Exports hooks used by other features.
 * Pages (TutorPage) are kept private — imported directly by App.jsx.
 */

// ── Hooks ──────────────────────────────────────────────────────────
export { useChat, useAINextSteps, useAIForDependent } from './hooks/useAI'
export {
  useDependientes,
  useAddDependiente,
  useUpdateDependent,
  useDeleteDependent,
  useMisPersonas,
  useDependientesCount,
  useVincularPCD,
  useUnlinkPCD,
  useUpdateDependentFeatures,
  useUpdateDependentFeaturesPatch,
  useUpdatePCDLinkedFeaturesPatch,
} from './hooks/useDependientes'
export { usePermisos, useUpdatePermisos, useRegisterDependiente, DEFAULT_PERMISOS, PERMISOS_CONFIG } from './hooks/usePermisos'

// ── Components ─────────────────────────────────────────────────────
export { default as PermissionsModal } from './components/PermissionsModal'
