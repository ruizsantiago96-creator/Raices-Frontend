/**
 * Jobs Feature — Public API
 *
 * Exports hooks used by other features.
 * Pages (JobsPage) are kept private — imported directly by App.jsx.
 */

// ── Hooks ──────────────────────────────────────────────────────────
export {
  useJobs,
  useJob,
  useAppliedJobIds,
  useMyApplications,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useApplyJob,
} from './hooks/useJobs'
