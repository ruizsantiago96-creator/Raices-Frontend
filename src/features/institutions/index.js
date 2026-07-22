/**
 * Institutions Feature — Public API
 *
 * Exports components and hooks used by other features.
 * Pages (ExplorePage, InstitutionPage) are kept private — imported directly by App.jsx.
 */

// ── Components ─────────────────────────────────────────────────────
export { default as MapView } from './components/MapView'

// ── Hooks ──────────────────────────────────────────────────────────
export { useInstitutions, useDiscovery } from './hooks/useInstitutions'
export { useReviews } from './hooks/useReviews'
