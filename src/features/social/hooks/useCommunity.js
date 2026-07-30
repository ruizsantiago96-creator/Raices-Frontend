import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'

function mapGroup(g) {
  return {
    ...g,
    name: g.nombre ?? g.name ?? 'Sin nombre',
    description: g.descripcion ?? g.description,
    is_public: g.esPublico ?? g.is_public,
    is_member: g.esMiembro ?? g.es_miembro ?? g.isMember ?? g.is_member ?? false,
    member_count: g.cantidadMiembros ?? g.member_count ?? 0,
  }
}

function mapPost(p) {
  return {
    ...p,
    content: p.content ?? p.contenido,
    author_id: p.author_id ?? p.autorId ?? p.autor_id,
    author_name: p.author_name ?? p.nombreAutor ?? p.autorNombre,
    author_avatar: p.author_avatar ?? p.avatarAutor ?? p.autorAvatar,
    created_at: p.created_at ?? p.fechaCreacion,
    group_name: p.group_name ?? p.nombreGrupo,
    like_count: p.like_count ?? p.cantidadMeGusta ?? 0,
    comment_count: p.comment_count ?? p.cantidadComentarios ?? 0,
    liked_by_me: p.liked_by_me ?? p.meGustaUsuario,
  }
}

function mapComment(c) {
  return {
    ...c,
    content: c.content ?? c.contenido,
    author_id: c.author_id ?? c.autorId ?? c.autor_id,
    author_name: c.author_name ?? c.nombreAutor ?? c.autorNombre,
    created_at: c.created_at ?? c.fechaCreacion,
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
      const arr = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapPost)
    }),
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => {
      const payload = {
        contenido: data.content ?? data.contenido,
        grupoId: data.grupoId,
      }
      return api.post('/comunidad/publicaciones', payload).then(r => r.data)
    },
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
      const arr = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapComment)
    }),
    enabled: !!postId,
  })
}

export function useCreateComment(postId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => {
      const payload = {
        contenido: data.content ?? data.contenido,
      }
      return api.post(`/comunidad/publicaciones/${postId}/comentarios`, payload).then(r => r.data)
    },
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
    onSuccess: (_, groupId) => {
      qc.setQueryData(['groups'], (old) => {
        if (!Array.isArray(old)) return old
        return old.map(g => g.id === groupId ? { ...g, is_member: true, member_count: g.member_count + 1 } : g)
      })
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useLeaveGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (groupId) => api.post(`/comunidad/grupos/${groupId}/salir`).then(r => r.data),
    onSuccess: (_, groupId) => {
      qc.setQueryData(['groups'], (old) => {
        if (!Array.isArray(old)) return old
        return old.map(g => g.id === groupId ? { ...g, is_member: false, member_count: Math.max(0, g.member_count - 1) } : g)
      })
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useUpdatePost(postId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => {
      const payload = {
        contenido: data.content ?? data.contenido,
      }
      return api.put(`/comunidad/publicaciones/${postId}`, payload).then(r => r.data)
    },
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
