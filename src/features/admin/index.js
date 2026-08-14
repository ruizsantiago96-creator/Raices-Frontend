/**
 * Admin Feature — Public API
 *
 * Exports hooks used by other features.
 * Pages (AdminPage) are kept private — imported directly by App.jsx.
 *
 * NOTE: User, Institution, and Review admin hooks have been moved
 * to their respective features (@features/users, @features/institutions,
 * @features/reviews). This file re-exports them for backward compatibility.
 */

// ── Admin Core Hooks ───────────────────────────────────────────────
export { useAdminStats, useAdminAnalytics, useNeedsIntelligence, useAdminAlerts, useAdminSettings, useUpdateSettings, useAdminDetailedAnalytics, useAdminActiveUsersDetail, useAdminVerificaciones, useAprobarVerificacion, useRechazarVerificacion } from './hooks/useAdmin'

// ── Re-exports for backward compatibility ──────────────────────────
// Users (now in @features/users)
export { useAdminUsers, useToggleUserActive, useChangeUserRole, useDeleteUser, useUpdateUserAdmin } from '@features/users'
// Institutions (now in @features/institutions)
export { useAllInstitutions, usePendingInstitutions, useApproveInstitution, useRejectInstitution, useToggleVerifyInstitution, useUpdateAdminInstitution } from '@features/institutions'
// Reviews (now in @features/reviews)
export { useAdminReviews, useDeleteReview } from '@features/reviews'
