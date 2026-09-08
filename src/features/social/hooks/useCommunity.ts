import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/lib/api'
import type {
  CommunityGroup,
  CommunityPost,
  CommunityComment,
  CreatePostPayload,
  CreateCommentPayload,
  FeaturedMember,
  CommunityStats,
  ForoItem,
  ForoRespuesta,
  ForoDetalle,
  PreguntaConRespuestas,
} from '@/types/social'

interface RawGroup {
  id?: string | number
  nombre?: string
  name?: string
  descripcion?: string
  description?: string
  esPublico?: boolean
  is_public?: boolean
  esMiembro?: boolean
  es_miembro?: boolean
  isMember?: boolean
  is_member?: boolean
  cantidadMiembros?: number
  member_count?: number
  [key: string]: unknown
}

interface RawPost {
  id?: string | number
  titulo?: string
  title?: string
  contenido?: string
  content?: string
  author_id?: string | number
  autorId?: string | number
  autor_id?: string | number
  nombreCompleto?: string
  author_name?: string
  nombreAutor?: string
  autorNombre?: string
  autor?: { nombre?: string; avatar?: string }
  urlAvatar?: string | null
  author_avatar?: string | null
  avatarAutor?: string | null
  autorAvatar?: string | null
  cantidadMeGustas?: number
  likesCount?: number
  like_count?: number
  usuarioMeGusta?: boolean
  likedByMe?: boolean
  liked_by_me?: boolean
  fechaCreacion?: string
  created_at?: string
  group_name?: string
  nombreGrupo?: string
  grupoId?: string | number
  cantidadComentarios?: number
  comment_count?: number
  [key: string]: unknown
}

interface RawComment {
  id?: string | number
  contenido?: string
  content?: string
  author_id?: string | number
  autorId?: string | number
  autor_id?: string | number
  nombreCompleto?: string
  author_name?: string
  nombreAutor?: string
  autorNombre?: string
  urlAvatar?: string | null
  autorAvatar?: string | null
  autor_avatar?: string | null
  fechaCreacion?: string
  created_at?: string
  _isOptimistic?: boolean
  [key: string]: unknown
}

function mapGroup(g: RawGroup): CommunityGroup {
  return {
    ...g,
    id: g.id ?? '',
    name: g.nombre ?? g.name ?? 'Sin nombre',
    description: g.descripcion ?? g.description,
    is_public: g.esPublico ?? g.is_public,
    is_member: g.esMiembro ?? g.es_miembro ?? g.isMember ?? g.is_member ?? false,
    member_count: g.cantidadMiembros ?? g.member_count ?? 0,
  }
}

function mapPost(p: RawPost): CommunityPost {
  return {
    ...p,
    id: p.id ?? '',
    content: p.content ?? p.contenido ?? '',
    author_id: p.author_id ?? p.autorId ?? p.autor_id,
    author_name: p.author_name ?? p.nombreCompleto ?? p.nombreAutor ?? p.autorNombre ?? p.autor?.nombre ?? 'Anónimo',
    author_avatar: p.author_avatar ?? p.urlAvatar ?? p.avatarAutor ?? p.autorAvatar ?? p.autor?.avatar ?? null,
    created_at: p.created_at ?? p.fechaCreacion ?? new Date().toISOString(),
    group_name: p.group_name ?? p.nombreGrupo,
    like_count: p.like_count ?? p.cantidadMeGustas ?? p.likesCount ?? 0,
    comment_count: p.comment_count ?? p.cantidadComentarios ?? 0,
    liked_by_me: p.liked_by_me ?? p.usuarioMeGusta ?? p.likedByMe ?? false,
  }
}

function mapComment(c: RawComment): CommunityComment {
  return {
    ...c,
    id: c.id ?? '',
    content: c.content ?? c.contenido ?? '',
    author_id: c.author_id ?? c.autorId ?? c.autor_id,
    author_name: c.author_name ?? c.nombreCompleto ?? c.nombreAutor ?? c.autorNombre ?? 'Anónimo',
    author_avatar: c.urlAvatar ?? c.autorAvatar ?? c.autor_avatar ?? null,
    created_at: c.created_at ?? c.fechaCreacion ?? new Date().toISOString(),
  }
}

export function useGroups() {
  return useQuery<CommunityGroup[]>({
    queryKey: ['groups'],
    queryFn: () => api.get('/comunidad/grupos').then(r => {
      const res = r.data
      const arr: RawGroup[] = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapGroup)
    }),
  })
}

function mapPostFromBackend(p: RawPost): CommunityPost {
  return {
    ...p,
    id: p.id ?? '',
    title: p.titulo ?? p.title ?? '',
    content: p.contenido ?? p.content ?? '',
    author_id: p.author_id ?? p.autorId ?? p.autor_id,
    author_name: p.nombreCompleto ?? p.author_name ?? p.nombreAutor ?? p.autorNombre ?? p.autor?.nombre ?? 'Anónimo',
    author_avatar: p.urlAvatar ?? p.author_avatar ?? p.avatarAutor ?? p.autorAvatar ?? p.autor?.avatar ?? null,
    like_count: p.cantidadMeGustas ?? p.likesCount ?? p.like_count ?? 0,
    liked_by_me: p.usuarioMeGusta ?? p.likedByMe ?? p.liked_by_me ?? false,
    created_at: p.fechaCreacion ?? p.created_at ?? new Date().toISOString(),
    group_name: p.group_name ?? p.nombreGrupo,
    comment_count: p.comment_count ?? p.cantidadComentarios ?? 0,
  }
}

export interface UsePostsOptions {
  grupoId?: string | number
  pagina?: number
  limite?: number
  buscar?: string
}

export function usePosts(groupIdOrOptions?: string | UsePostsOptions) {
  const opts: UsePostsOptions = typeof groupIdOrOptions === 'string'
    ? { grupoId: groupIdOrOptions }
    : (groupIdOrOptions ?? {})

  const { grupoId, pagina = 1, limite = 10, buscar } = opts

  return useQuery<CommunityPost[]>({
    queryKey: ['posts', grupoId, pagina, limite, buscar],
    queryFn: () => {
      const params: Record<string, unknown> = {}
      if (grupoId) params.grupoId = grupoId
      if (pagina > 1) params.pagina = pagina
      if (limite !== 10) params.limite = limite
      if (buscar?.trim()) params.buscar = buscar.trim()
      return api.get('/comunidad/publicaciones', { params }).then(r => {
        const res = r.data
        const arr: RawPost[] = Array.isArray(res) ? res : (res?.datos ?? [])
        return arr.map(mapPostFromBackend)
      })
    },
  })
}

export function usePostsLegacy(groupId?: string | number) {
  return useQuery<CommunityPost[]>({
    queryKey: ['posts', groupId],
    queryFn: () => api.get('/comunidad/publicaciones', { params: groupId ? { grupoId: groupId } : {} }).then(r => {
      const res = r.data
      const arr: RawPost[] = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapPost)
    }),
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, CreatePostPayload>({
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
  return useMutation<unknown, Error, string | number>({
    mutationFn: (postId) => api.post(`/comunidad/publicaciones/${postId}/me-gusta`).then(r => r.data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      qc.invalidateQueries({ queryKey: ['conectemos'] })
    },
  })
}

export function useComments(postId: string | number | null | undefined) {
  return useQuery<CommunityComment[]>({
    queryKey: ['comments', postId],
    queryFn: () => api.get(`/comunidad/publicaciones/${postId}/comentarios`).then(r => {
      const res = r.data
      const arr: RawComment[] = Array.isArray(res) ? res : (res?.datos ?? [])
      return arr.map(mapComment)
    }),
    enabled: !!postId,
  })
}

export function useCreateComment(postId: string | number) {
  const qc = useQueryClient()
  return useMutation<unknown, Error, CreateCommentPayload, { previous?: CommunityComment[] }>({
    mutationFn: (data) => {
      const payload = {
        contenido: data.content ?? data.contenido,
      }
      return api.post(`/comunidad/publicaciones/${postId}/comentarios`, payload).then(r => r.data)
    },
    onMutate: (data) => {
      const content = data.content ?? data.contenido ?? ''
      const newComment: CommunityComment = {
        id: `temp-${Date.now()}`,
        content,
        author_name: data.authorName ?? 'Tú',
        author_id: data.authorId,
        created_at: new Date().toISOString(),
        _isOptimistic: true,
      }
      const previous = qc.getQueryData<CommunityComment[]>(['comments', postId])
      qc.setQueryData<CommunityComment[]>(['comments', postId], (old) => {
        if (!old) return [newComment]
        return [...old, newComment]
      })
      return { previous }
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        qc.setQueryData(['comments', postId], context.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, Partial<CommunityGroup>>({
    mutationFn: (data) => api.post('/comunidad/grupos', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useJoinGroup() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, string | number>({
    mutationFn: (groupId) => api.post(`/comunidad/grupos/${groupId}/unirse`).then(r => r.data),
    onSuccess: (_, groupId) => {
      qc.setQueryData<CommunityGroup[]>(['groups'], (old) => {
        if (!Array.isArray(old)) return old
        return old.map(g => g.id === groupId ? { ...g, is_member: true, member_count: g.member_count + 1 } : g)
      })
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useLeaveGroup() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, string | number>({
    mutationFn: (groupId) => api.post(`/comunidad/grupos/${groupId}/salir`).then(r => r.data),
    onSuccess: (_, groupId) => {
      qc.setQueryData<CommunityGroup[]>(['groups'], (old) => {
        if (!Array.isArray(old)) return old
        return old.map(g => g.id === groupId ? { ...g, is_member: false, member_count: Math.max(0, g.member_count - 1) } : g)
      })
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useUpdatePost(postId: string | number) {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { content?: string; contenido?: string }>({
    mutationFn: (data) => {
      const payload = {
        contenido: data.content ?? data.contenido,
      }
      return api.put(`/comunidad/publicaciones/${postId}`, payload).then(r => r.data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useDeletePost(postId: string | number) {
  const qc = useQueryClient()
  return useMutation<unknown, Error, void>({
    mutationFn: () => api.delete(`/comunidad/publicaciones/${postId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useCommunityStats() {
  return useQuery<CommunityStats>({
    queryKey: ['communityStats'],
    queryFn: () => api.get('/comunidad/estadisticas').then(r => r.data),
  })
}

export function useMiembrosDestacados(limite = 6) {
  return useQuery<FeaturedMember[]>({
    queryKey: ['miembrosDestacados', limite],
    queryFn: () => api.get('/comunidad/miembros', { params: { limite } }).then(r => {
      const res = r.data
      const arr: Array<{
        id?: string | number
        nombreCompleto?: string
        nombre_completo?: string
        full_name?: string
        rol?: string
        role?: string
        ciudad?: string
        city?: string
        estado?: string
        state?: string
        urlAvatar?: string | null
        url_avatar?: string | null
        avatar_url?: string | null
        bio?: string
        biografia?: string
      }> = res?.datos ?? res?.miembros ?? (Array.isArray(res) ? res : [])
      return arr.map(m => ({
        id: m.id ?? '',
        nombreCompleto: m.nombreCompleto ?? m.nombre_completo ?? m.full_name ?? 'Sin nombre',
        rol: m.rol ?? m.role ?? '',
        ciudad: m.ciudad ?? m.city ?? '',
        estado: m.estado ?? m.state ?? '',
        urlAvatar: m.urlAvatar ?? m.url_avatar ?? m.avatar_url ?? null,
        biografia: m.bio ?? m.biografia ?? '',
      }))
    }),
  })
}

/* ═══════════════════════════════════════════════════════════
   FOROS INSTITUCIONALES
   ═══════════════════════════════════════════════════════════ */

interface RawForo {
  id?: string | number
  titulo?: string
  title?: string
  descripcion?: string
  description?: string
  preguntasDetonantes?: string[] | string
  preguntaDetonante?: string[] | string
  nombreInstitucion?: string
  autorNombre?: string
  autor_nombre?: string
  creadoPorNombre?: string
  creadorId?: string | number
  autorId?: string | number
  autor_id?: string | number
  creadoPor?: string | number
  respuestasCount?: number
  respuestas_count?: number
  fechaCreacion?: string
  fecha_creacion?: string
  created_at?: string
  exclusivoPadres?: boolean
  activo?: boolean
  preguntasConRespuestas?: Array<{ respuestas?: RawRespuesta[] }>
  respuestas?: RawRespuesta[]
  [key: string]: unknown
}

interface RawRespuesta {
  id?: string | number
  contenido?: string
  content?: string
  preguntaIndex?: number
  nombreCompleto?: string
  autorNombre?: string
  autor_nombre?: string
  autorId?: string | number
  autor_id?: string | number
  urlAvatar?: string | null
  autorAvatar?: string | null
  autor_avatar?: string | null
  fechaCreacion?: string
  fecha_creacion?: string
  created_at?: string
  [key: string]: unknown
}

function mapForo(f: RawForo): ForoItem {
  const preguntas = f.preguntasDetonantes ?? f.preguntaDetonante ?? []
  const preguntaDetonante = Array.isArray(preguntas) ? preguntas[0] ?? '' : preguntas
  return {
    id: f.id ?? '',
    titulo: f.titulo ?? f.title ?? '',
    descripcion: f.descripcion ?? f.description ?? '',
    preguntaDetonante,
    preguntasDetonantes: Array.isArray(preguntas) ? preguntas : [preguntas],
    autorNombre: f.nombreInstitucion ?? f.autorNombre ?? f.autor_nombre ?? f.creadoPorNombre ?? '',
    autorId: f.creadorId ?? f.autorId ?? f.autor_id ?? f.creadoPor ?? '',
    respuestasCount: f.respuestasCount ?? f.respuestas_count ?? 0,
    fechaCreacion: f.fechaCreacion ?? f.fecha_creacion ?? f.created_at ?? '',
    exclusivoPadres: f.exclusivoPadres ?? false,
    activo: f.activo ?? true,
  }
}

function mapRespuesta(r: RawRespuesta, fallbackIndex: number): ForoRespuesta {
  return {
    id: r.id ?? '',
    contenido: r.contenido ?? r.content ?? '',
    preguntaIndex: r.preguntaIndex ?? fallbackIndex,
    autorNombre: r.nombreCompleto ?? r.autorNombre ?? r.autor_nombre ?? 'Anónimo',
    autorId: r.autorId ?? r.autor_id ?? '',
    autorAvatar: r.urlAvatar ?? r.autorAvatar ?? r.autor_avatar ?? null,
    fechaCreacion: r.fechaCreacion ?? r.fecha_creacion ?? r.created_at ?? '',
  }
}

function mapForoDetalle(f: RawForo): ForoDetalle {
  const foro = mapForo(f)
  const preguntasDetonantes = foro.preguntasDetonantes
  const preguntasCrudo = f.preguntasConRespuestas ?? []

  const preguntasConRespuestas: PreguntaConRespuestas[] = preguntasDetonantes.map((pregunta, idx) => {
    const bloque = Array.isArray(preguntasCrudo) ? (preguntasCrudo[idx] ?? {}) : {}
    const respuestas = (Array.isArray(bloque.respuestas) ? bloque.respuestas : [])
      .map((r: RawRespuesta) => mapRespuesta(r, idx))
    return { pregunta, respuestas }
  })

  const respuestasLegacy = (Array.isArray(f.respuestas) ? f.respuestas : [])
    .map((r: RawRespuesta) => mapRespuesta(r, r.preguntaIndex ?? 0))
  if (respuestasLegacy.length > 0 && preguntasConRespuestas.every(pcr => pcr.respuestas.length === 0)) {
    respuestasLegacy.forEach(r => {
      const idx = Math.min(r.preguntaIndex ?? 0, preguntasConRespuestas.length - 1)
      preguntasConRespuestas[idx]?.respuestas.push(r)
    })
  }

  const respuestas = preguntasConRespuestas.flatMap(pcr => pcr.respuestas)

  return { ...foro, respuestas, preguntasConRespuestas }
}

export interface ForosResult {
  foros: ForoItem[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export function useForos(opts: { pagina?: number; limite?: number; buscar?: string; ordenarPor?: string; direccion?: string } = {}) {
  const { pagina = 1, limite = 20, buscar, ordenarPor, direccion } = opts
  return useQuery<ForosResult>({
    queryKey: ['foros', pagina, limite, buscar, ordenarPor, direccion],
    queryFn: () => {
      const params: Record<string, unknown> = {}
      if (pagina > 1) params.pagina = pagina
      if (limite !== 20) params.limite = limite
      if (buscar?.trim()) params.buscar = buscar.trim()
      if (ordenarPor) params.ordenarPor = ordenarPor
      if (direccion) params.direccion = direccion
      return api.get('/comunidad/foros', { params }).then(r => {
        const res = r.data
        const arr: RawForo[] = Array.isArray(res) ? res : (res?.datos ?? [])
        return {
          foros: arr.map(mapForo),
          total: res?.total ?? arr.length,
          pagina: res?.pagina ?? pagina,
          limite: res?.limite ?? limite,
          totalPaginas: res?.totalPaginas ?? 1,
        }
      })
    },
  })
}

export function useForoDetail(foroId: string | number | null | undefined) {
  return useQuery<ForoDetalle>({
    queryKey: ['foro', foroId],
    queryFn: () => api.get(`/comunidad/foros/${foroId}`).then(r => mapForoDetalle(r.data)),
    enabled: !!foroId,
  })
}

export function useCreateForo() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { titulo: string; descripcion: string; preguntasDetonantes?: string[]; preguntaDetonante?: string; exclusivoPadres?: boolean }>({
    mutationFn: (data) => api.post('/comunidad/foros', {
      titulo: data.titulo,
      descripcion: data.descripcion,
      preguntasDetonantes: data.preguntasDetonantes ?? (data.preguntaDetonante ? [data.preguntaDetonante] : []),
      exclusivoPadres: data.exclusivoPadres ?? false,
    }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foros'] }),
  })
}

export function useCreateForoRespuesta(foroId: string | number) {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { preguntaIndex?: number; contenido: string }>({
    mutationFn: (data) => api.post(`/comunidad/foros/${foroId}/respuestas`, {
      preguntaIndex: data.preguntaIndex ?? 0,
      contenido: data.contenido,
    }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['foro', foroId] }),
  })
}

/* ═══════════════════════════════════════════════════════════
   CONECTEMOS (Galería pública)
   ═══════════════════════════════════════════════════════════ */

export interface ConectemosResult {
  posts: CommunityPost[]
  total: number
}

export function useConectemos(opts: { categoriaCreativa?: string; buscar?: string; pagina?: number; limite?: number; enabled?: boolean } = {}) {
  const { categoriaCreativa, buscar, pagina = 1, limite = 20, enabled = true } = opts
  return useQuery<ConectemosResult>({
    queryKey: ['conectemos', categoriaCreativa, buscar, pagina, limite],
    enabled,
    queryFn: () => {
      const params: Record<string, unknown> = {}
      if (categoriaCreativa) params.categoriaCreativa = categoriaCreativa
      if (buscar?.trim()) params.buscar = buscar.trim()
      if (pagina > 1) params.pagina = pagina
      if (limite !== 20) params.limite = limite
      return api.get('/comunidad/conectemos/publicaciones', { params }).then(r => {
        const res = r.data
        const arr: RawPost[] = Array.isArray(res) ? res : (res?.datos ?? [])
        return { posts: arr.map(mapPostFromBackend), total: res?.total ?? arr.length }
      })
    },
  })
}
