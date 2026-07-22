/**
 * Notifications Feature — Public API
 *
 * Exports components, hooks, and lib used by other features.
 */

// ── Components ─────────────────────────────────────────────────────
export { default as NotificationBell } from './components/NotificationBell'

// ── Hooks ──────────────────────────────────────────────────────────
export { useNotifications } from './hooks/useNotifications'

// ── Lib (SSE stream — used by auth store for cleanup) ──────────────
export { closeNotificationStream, suspendStream, resumeStream } from './lib/notificationStream'
