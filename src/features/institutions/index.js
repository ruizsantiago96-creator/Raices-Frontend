/**
 * Institutions Feature — Public API
 *
 * Exports components and hooks used by other features.
 * Pages (ExplorePage, InstitutionPage, InstitutionPortalPage) are kept private — imported directly by App.jsx.
 */

// ── Components ─────────────────────────────────────────────────────
export { default as MapView } from './components/MapView'

// ── Hooks ──────────────────────────────────────────────────────────
export { useInstitutions, useDiscovery, useCrearInstitucion, useMiInstitucion, useUpdateMiInstitucion } from './hooks/useInstitutions'
export { useReviews } from './hooks/useReviews'

// ── Admin Hooks ────────────────────────────────────────────────────
export { useAllInstitutions, usePendingInstitutions, useApproveInstitution, useRejectInstitution, useToggleVerifyInstitution, useUpdateAdminInstitution } from './hooks/useAdminInstitutions'

// ── Institution Portal Hooks ───────────────────────────────────────
export { useMyJobPostings, useAllJobApplicants, useCreateJobPosting, useUpdateJobPosting, useDeleteJobPosting, useToggleJobStatus, useUpdateApplicationStatus } from './hooks/useInstitutionJobs'
