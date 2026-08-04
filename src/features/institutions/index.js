/**
 * Institutions Feature — Public API
 *
 * Exports components and hooks used by other features.
 * Pages (ExplorePage, InstitutionPage) are kept private — imported directly by App.jsx.
 */

// ── Components ─────────────────────────────────────────────────────
export { default as MapView } from './components/MapView'

// ── Hooks ──────────────────────────────────────────────────────────
export { useInstitutions, useDiscovery, useCrearInstitucion } from './hooks/useInstitutions'
export { useReviews } from './hooks/useReviews'

// ── Admin Hooks ────────────────────────────────────────────────────
export { useAllInstitutions, usePendingInstitutions, useApproveInstitution, useRejectInstitution, useToggleVerifyInstitution, useUpdateAdminInstitution } from './hooks/useAdminInstitutions'
