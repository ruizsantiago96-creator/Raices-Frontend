/**
 * Profile Feature — Public API
 *
 * Exports hooks used by other features.
 * Pages (ProfilePage, OnboardingPage) are kept private — imported directly by App.jsx.
 */

// ── Hooks ──────────────────────────────────────────────────────────
export { default as useProfile, useUpdateProfile } from './hooks/useProfile'
