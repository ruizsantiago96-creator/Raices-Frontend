import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/community/groups').then(r => r.data),
  })
}

export function usePosts(groupId) {
  return useQuery({
    queryKey: ['posts', groupId],
    queryFn: () => api.get('/community/posts', { params: groupId ? { group_id: groupId } : {} }).then(r => r.data),
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/community/posts', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId) => api.post(`/community/posts/${postId}/like`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useComments(postId) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => api.get(`/community/posts/${postId}/comments`).then(r => r.data),
    enabled: !!postId,
  })
}

export function useCreateComment(postId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post(`/community/posts/${postId}/comments`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  })
}
