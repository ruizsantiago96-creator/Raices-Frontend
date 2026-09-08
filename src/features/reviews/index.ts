/**
 * Reviews Feature — Public API
 *
 * This feature handles admin review moderation (list, delete).
 */

// Hooks
export { useAdminReviews, useDeleteReview } from './hooks/useAdminReviews'

// Components
export { default as ReviewsTab } from './components/ReviewsTab'

// Constants
export * from './constants/reviewsMessages'
