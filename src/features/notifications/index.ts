/**
 * Notifications Feature — Public API
 *
 * Exports components, hooks, and lib used by other features.
 */

// ── Components ─────────────────────────────────────────────────────
export { default as NotificationBell } from './components/NotificationBell'
export { default as FCMProvider } from './components/FCMProvider'

// ── Hooks ──────────────────────────────────────────────────────────
export { useNotifications, useMarkRead, useMarkAllRead } from './hooks/useNotifications'
export { useFCM } from './hooks/useFCM'

// ── Lib (SSE stream — used by auth store for cleanup) ──────────────
export { closeNotificationStream, suspendStream, resumeStream } from './lib/notificationStream'

// ── Lib (Firebase Messaging — used by useFCM) ─────────────────────
export { getFirebaseMessaging, isFCMConfigured } from './lib/firebase'
