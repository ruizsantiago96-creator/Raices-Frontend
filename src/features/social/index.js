/**
 * Social Feature — Public API
 *
 * Exports hooks used by other features.
 * Pages (SocialPage) are kept private — imported directly by App.jsx.
 */

// ── Hooks ──────────────────────────────────────────────────────────
export { useGroups, usePosts, useCreatePost, useToggleLike, useComments, useCreateComment, useCreateGroup, useJoinGroup, useLeaveGroup, useUpdatePost, useDeletePost, useCommunityStats, useMiembrosDestacados, useForos, useForoDetail, useCreateForo, useCreateForoRespuesta, useConectemos } from './hooks/useCommunity'
export { useMessages } from './hooks/useMessages'
