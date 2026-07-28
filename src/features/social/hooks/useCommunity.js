import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

function mapGroup(g) {
  return {
    ...g,
    name: g.nombre ?? g.name ?? 'Sin nombre',
    description: g.descripcion ?? g.description,
    is_public: g.esPublico ?? g.is_public,
    is_member: g.esMiembro ?? g.is_member,
    member_count: g.cantidadMiembros ?? g.member_count ?? 0,
  }
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/comunidad/grupos').then(r => {
      const res = r.data
      const arr = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapGroup)
    }),
  })
}

export function usePosts(groupId) {
  return useQuery({
    queryKey: ['posts', groupId],
    queryFn: () => api.get('/comunidad/publicaciones', { params: groupId ? { grupoId: groupId } : {} }).then(r => {
      const res = r.data
      return Array.isArray(res) ? res : (res?.datos ?? [])
    }),
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/comunidad/publicaciones', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId) => api.post(`/comunidad/publicaciones/${postId}/me-gusta`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useComments(postId) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => api.get(`/comunidad/publicaciones/${postId}/comentarios`).then(r => {
      const res = r.data
      return Array.isArray(res) ? res : (res?.datos ?? [])
    }),
    enabled: !!postId,
  })
}

export function useCreateComment(postId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post(`/comunidad/publicaciones/${postId}/comentarios`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/comunidad/grupos', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useJoinGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (groupId) => api.post(`/comunidad/grupos/${groupId}/unirse`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useLeaveGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (groupId) => api.post(`/comunidad/grupos/${groupId}/salir`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useUpdatePost(postId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put(`/comunidad/publicaciones/${postId}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useDeletePost(postId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete(`/comunidad/publicaciones/${postId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useCommunityStats() {
  return useQuery({
    queryKey: ['communityStats'],
    queryFn: () => api.get('/comunidad/estadisticas').then(r => r.data),
  })
}
