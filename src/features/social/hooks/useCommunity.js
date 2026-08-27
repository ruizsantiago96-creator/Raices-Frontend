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

/**
 * Normaliza un post del backend con autor anidado.
 *
 * Backend: { id, titulo, contenido, autor: { id, nombre, avatar }, likesCount, likedByMe, fechaCreacion }
 * Frontend: { id, content, author_id, author_name, author_avatar, like_count, liked_by_me, created_at, title }
 */
function mapPostFromBackend(p) {
  const autor = p.autor ?? {}
  return {
    ...p,
    title: p.titulo ?? p.title ?? '',
    content: p.contenido ?? p.content ?? '',
    author_id: autor.id ?? p.author_id ?? p.autorId ?? p.autor_id,
    author_name: autor.nombre ?? p.author_name ?? p.nombreAutor ?? p.autorNombre ?? 'Anónimo',
    author_avatar: autor.avatar ?? p.author_avatar ?? p.avatarAutor ?? p.autorAvatar ?? null,
    like_count: p.likesCount ?? p.like_count ?? p.cantidadMeGusta ?? 0,
    liked_by_me: p.likedByMe ?? p.liked_by_me ?? p.meGustaUsuario ?? false,
    created_at: p.fechaCreacion ?? p.created_at,
    group_name: p.group_name ?? p.nombreGrupo,
    comment_count: p.comment_count ?? p.cantidadComentarios ?? 0,
  }
}

/**
 * Hook: consulta publicaciones de la comunidad con paginación y búsqueda.
 *
 * GET /api/comunidad/publicaciones
 * Params: { grupoId?, pagina?, limite?, buscar? }
 * Response: { datos: Publicacion[], meta: { total, pagina, limite, totalPaginas } }
 *
 * @param {Object} options
 * @param {string} [options.grupoId] - Filtrar por grupo
 * @param {number} [options.pagina=1] - Página actual
 * @param {number} [options.limite=10] - Elementos por página
 * @param {string} [options.buscar] - Término de búsqueda
 */
export function usePosts(groupIdOrOptions) {
  // Soporte backward-compatible: si se pasa un string, es grupoId
  const opts = typeof groupIdOrOptions === 'string'
    ? { grupoId: groupIdOrOptions }
    : (groupIdOrOptions ?? {})

  const { grupoId, pagina = 1, limite = 10, buscar } = opts

  return useQuery({
    queryKey: ['posts', grupoId, pagina, limite, buscar],
    queryFn: () => {
      const params = {}
      if (grupoId) params.grupoId = grupoId
      if (pagina > 1) params.pagina = pagina
      if (limite !== 10) params.limite = limite
      if (buscar?.trim()) params.buscar = buscar.trim()
      return api.get('/comunidad/publicaciones', { params }).then(r => {
        const res = r.data
        const meta = res?.meta ?? null
        const arr = Array.isArray(res) ? res.map(mapPostFromBackend) : (res?.datos ?? []).map(mapPostFromBackend)
        return { posts: arr, meta }
      })
    },
    // Mantener compatibilidad: si el caller espera un array plano, lo desempaquetamos
    select: (data) => data.posts,
  })
}

/**
 * Hook: consulta publicaciones de la comunidad (legacy, sin paginación).
 * Mantiene compatibilidad con componentes que esperan un array simple.
 */
export function usePostsLegacy(groupId) {
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

export function useMiembrosDestacados(limite = 6) {
  return useQuery({
    queryKey: ['miembrosDestacados', limite],
    queryFn: () => api.get('/comunidad/miembros', { params: { limite } }).then(r => {
      const res = r.data
      const arr = res?.miembros ?? (Array.isArray(res) ? res : [])
      return arr.map(m => ({
        id: m.id,
        nombreCompleto: m.nombreCompleto ?? m.nombre_completo ?? m.full_name ?? 'Sin nombre',
        rol: m.rol ?? m.role ?? '',
        ciudad: m.ciudad ?? m.city ?? '',
        estado: m.estado ?? m.state ?? '',
        urlAvatar: m.urlAvatar ?? m.url_avatar ?? m.avatar_url ?? null,
        biografia: m.biografia ?? m.bio ?? '',
      }))
    }),
  })
}

/* ═══════════════════════════════════════════════════════════
   FOROS INSTITUCIONALES
   ═══════════════════════════════════════════════════════════ */

function mapForo(f) {
  return {
    id: f.id,
    titulo: f.titulo ?? f.title ?? '',
    descripcion: f.descripcion ?? f.description ?? '',
    preguntaDetonante: f.preguntaDetonante ?? f.pregunta_detonante ?? '',
    autorNombre: f.autorNombre ?? f.autor_nombre ?? f.creadoPorNombre ?? '',
    autorId: f.autorId ?? f.autor_id ?? f.creadoPor ?? '',
    respuestasCount: f.respuestasCount ?? f.respuestas_count ?? 0,
    fechaCreacion: f.fechaCreacion ?? f.fecha_creacion ?? f.created_at ?? '',
  }
}

function mapForoDetalle(f) {
  const foro = mapForo(f)
  const respuestas = (f.respuestas ?? []).map(r => ({
    id: r.id,
    contenido: r.contenido ?? r.content ?? '',
    autorNombre: r.autorNombre ?? r.autor_nombre ?? r.nombreAutor ?? 'Anónimo',
    autorId: r.autorId ?? r.autor_id ?? '',
    autorAvatar: r.autorAvatar ?? r.autor_avatar ?? null,
    fechaCreacion: r.fechaCreacion ?? r.fecha_creacion ?? r.created_at ?? '',
  }))
  return { ...foro, respuestas }
}

export function useForos() {
  return useQuery({
    queryKey: ['foros'],
    queryFn: () => api.get('/comunidad/foros').then(r => {
      const res = r.data
      const arr = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapForo)
    }),
  })
}

export function useForoDetail(foroId) {
  return useQuery({
    queryKey: ['foro', foroId],
    queryFn: () => api.get(`/comunidad/foros/${foroId}`).then(r => mapForoDetalle(r.data)),
    enabled: !!foroId,
  })
}

export function useCreateForo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/comunidad/foros', {
      titulo: data.titulo,
      descripcion: data.descripcion,
      preguntaDetonante: data.preguntaDetonante,
    }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foros'] }),
  })
}

export function useCreateForoRespuesta(foroId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post(`/comunidad/foros/${foroId}/respuestas`, {
      contenido: data.contenido,
    }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foro', foroId] }),
  })
}

/* ═══════════════════════════════════════════════════════════
   CONECTEMOS (Galería pública)
   ═══════════════════════════════════════════════════════════ */

export function useConectemos(opts = {}) {
  const { categoriaCreativa, pagina = 1, limite = 20 } = opts
  return useQuery({
    queryKey: ['conectemos', categoriaCreativa, pagina, limite],
    queryFn: () => {
      const params = {}
      if (categoriaCreativa) params.categoriaCreativa = categoriaCreativa
      if (pagina > 1) params.pagina = pagina
      if (limite !== 20) params.limite = limite
      return api.get('/comunidad/conectemos/publicaciones', { params }).then(r => {
        const res = r.data
        const arr = Array.isArray(res) ? res : (res?.datos ?? [])
        return { posts: arr.map(mapPostFromBackend), total: res?.total ?? arr.length }
      })
    },
  })
}
