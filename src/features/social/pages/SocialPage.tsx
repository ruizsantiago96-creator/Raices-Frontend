import { useState, useMemo, type FormEvent, type ChangeEvent, type CSSProperties } from 'react'
import { useUiStore } from '@shared/stores/uiStore'
import {
  useGroups,
  usePosts,
  useCreatePost,
  useToggleLike,
  useComments,
  useCreateComment,
  useCreateGroup,
  useJoinGroup,
  useLeaveGroup,
  useUpdatePost,
  useDeletePost,
  useCommunityStats,
  useMiembrosDestacados,
  useConectemos,
} from '../hooks/useCommunity'

import { useAuthStore } from '@features/auth'
import { useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import { useUploadMultimedia } from '../hooks/useMultimedia'
import { Icons, RestrictedBlock, CustomSelect } from '@shared/components/shared'
import { SOCIAL_TOAST, SOCIAL_UI, SOCIAL_CONFIRM } from '../constants/socialMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { COMMUNITY_ENDPOINTS } from '@shared/constants/backendEndpoints'
import type { CommunityPost } from '@/types/social'
import { EventsDiscovery } from '../components/EventsDiscovery'

const relativeDate = (d: string | number | Date) => {
  const diff = Date.now() - new Date(d).getTime()
  const h = Math.floor(diff / 3600000)
  return h < 1 ? SOCIAL_UI.TIME_NOW : h < 24 ? `${SOCIAL_UI.TIME_PREFIX} ${h}h` : `${SOCIAL_UI.TIME_PREFIX} ${Math.floor(h / 24)}d`
}

const avatarStyle = (extra: CSSProperties = {}): CSSProperties => ({
  width: 40,
  height: 40,
  borderRadius: '50% 50% 50% 14%',
  background: 'var(--primary-subtle)',
  color: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-display)',
  fontSize: 16,
  fontWeight: 700,
  flexShrink: 0,
  overflow: 'hidden',
  ...extra,
})

interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: number
}

function Avatar({ name, src, size }: AvatarProps) {
  const style = size ? avatarStyle({ width: size, height: size, fontSize: size * 0.4 }) : avatarStyle()
  const decodedSrc = src ? src.replace(/&#x2F;/g, '/').replace(/&#x3D;/g, '=').replace(/&#x26;/g, '&').replace(/&amp;/g, '&') : null;
  
  if (decodedSrc) {
    return (
      <div style={style}>
        <img src={decodedSrc} alt={name ?? 'Avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return <div style={style}>{(name?.[0] ?? '?').toUpperCase()}</div>
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: 20,
        marginBottom: 16,
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    >
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50% 50% 50% 14%', background: 'var(--border-color)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: '40%', background: 'var(--border-color)', borderRadius: 6, marginBottom: 6 }} />
          <div style={{ height: 11, width: '25%', background: 'var(--border-color)', borderRadius: 6 }} />
        </div>
      </div>
      <div style={{ height: 13, background: 'var(--border-color)', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 13, width: '80%', background: 'var(--border-color)', borderRadius: 6 }} />
    </div>
  )
}

interface CurrentUserContext {
  id?: string | number
  name?: string
}

interface CommentSectionProps {
  postId: string | number
  currentUser: CurrentUserContext
}

function CommentSection({ postId, currentUser }: CommentSectionProps) {
  const { data: comments = [], isLoading } = useComments(postId)
  const createComment = useCreateComment(postId)
  const [text, setText] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || createComment.isPending) return
    createComment.mutate(
      { content: text, authorName: currentUser?.name ?? 'Tú', authorId: currentUser?.id },
      { onSuccess: () => setText('') }
    )
  }

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
      {isLoading ? (
        <div style={{ fontSize: 13, color: 'var(--fg3)', marginBottom: 8 }}>{SOCIAL_UI.COMMENTS_LOADING}</div>
      ) : comments.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--fg3)', marginBottom: 8 }}>{SOCIAL_UI.NO_COMMENTS}</div>
      ) : (
        comments.map((c) => (
          <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Avatar name={c.author_name} src={c.author_avatar} size={28} />
            <div style={{ background: 'var(--bg-warm)', borderRadius: 10, padding: '6px 10px', flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--fg1)' }}>{c.author_name} </span>
              <span style={{ fontSize: 13, color: 'var(--fg2)' }}>{c.content}</span>
              <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 2 }}>{relativeDate(c.created_at)}</div>
            </div>
          </div>
        ))
      )}

      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input
          type="text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={SOCIAL_UI.COMMENT_PLACEHOLDER}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 20, fontSize: 13, fontFamily: 'var(--font-body)', background: 'var(--bg-warm)', color: 'var(--fg1)', outline: 'none' }}
        />
        <button
          type="submit" disabled={!text.trim() || createComment.isPending}
          style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: text.trim() && !createComment.isPending ? 'pointer' : 'not-allowed', opacity: text.trim() && !createComment.isPending ? 1 : 0.5, flexShrink: 0 }}
        >
          {Icons.send({ s: 16 })}
        </button>
      </form>
    </div>
  )
}

interface PostCardProps {
  post: CommunityPost
  onLike: () => void
  currentUserId?: string | number
  currentUserName?: string
}

function decodeAndExtract(content: string) {
  if (!content) return { text: '', imageUrl: null, originalDecoded: '' }
  const decoded = content
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")

  const urlRegex = /(https:\/\/firebasestorage\.googleapis\.com[^\s]+)/
  const match = decoded.match(urlRegex)
  
  if (match) {
    const imageUrl = match[1]
    const text = decoded.replace(imageUrl, '').trim()
    return { text, imageUrl, originalDecoded: decoded }
  }
  
  return { text: decoded, imageUrl: null, originalDecoded: decoded }
}

const CATEGORY_MAP: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  arte: { label: 'Arte', icon: '🎨', bg: '#FEF3C7', color: '#92400E' },
  dibujo: { label: 'Dibujo', icon: '✏️', bg: '#E0E7FF', color: '#3730A3' },
  historia: { label: 'Historia', icon: '📖', bg: '#FCE7F3', color: '#9D174D' },
  general: { label: 'General', icon: '💬', bg: 'var(--primary-subtle)', color: 'var(--primary)' },
}

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General', icon: '💬' },
  { value: 'arte', label: 'Arte', icon: '🎨' },
  { value: 'dibujo', label: 'Dibujo', icon: '✏️' },
  { value: 'historia', label: 'Historia', icon: '📖' },
]

function PostCard({ post, onLike, currentUserId, currentUserName }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [editing, setEditing] = useState(false)
  const { text, imageUrl, originalDecoded } = decodeAndExtract(post.content)
  const displayImage = post.mediaUrl || imageUrl
  const [editContent, setEditContent] = useState(originalDecoded)
  const [liked, setLiked] = useState(!!post.liked_by_me)
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0)
  const updatePost = useUpdatePost(post.id)
  const deletePost = useDeletePost(post.id)
  const { addToast } = useUiStore()
  const isAuthor = post.author_id === currentUserId

  const categoryMeta = post.categoriaCreativa ? CATEGORY_MAP[post.categoriaCreativa.toLowerCase()] : null

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(prev => prev + (newLiked ? 1 : -1))
    onLike()
  }

  const handleSaveEdit = () => {
    if (!editContent.trim()) return
    updatePost.mutate({ content: editContent }, {
      onSuccess: () => { setEditing(false); addToast(SOCIAL_TOAST.POST_UPDATED, 'success') },
      onError: () => addToast(SOCIAL_TOAST.POST_UPDATE_FAILED, 'error'),
    })
  }

  const handleDelete = () => {
    if (!window.confirm(SOCIAL_CONFIRM.DELETE_POST)) return
    deletePost.mutate(undefined, {
      onSuccess: () => addToast(SOCIAL_TOAST.POST_DELETED, 'success'),
      onError: () => addToast(SOCIAL_TOAST.POST_DELETE_FAILED, 'error'),
    })
  }

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <Avatar name={post.author_name} src={post.author_avatar} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg1)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span>{post.author_name}</span>
                {categoryMeta && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: categoryMeta.bg, color: categoryMeta.color }}>
                    {categoryMeta.icon} {categoryMeta.label}
                  </span>
                )}
                {post.exclusivoPadres && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: '#FEE2E2', color: '#991B1B' }}>
                    🔒 Solo Padres/Tutores
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>
                {relativeDate(post.created_at)}
                {post.group_name ? <span style={{ marginLeft: 6 }}>· {post.group_name}</span> : null}
              </div>
            </div>
            {isAuthor && !editing && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4, borderRadius: 4 }} title="Editar">
                  {Icons.edit({ s: 14 })}
                </button>
                <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D46A6A', padding: 4, borderRadius: 4 }} title="Eliminar">
                  {Icons.trash({ s: 14 })}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing ? (
        <div style={{ marginBottom: 16 }}>
          <textarea rows={3} value={editContent} onChange={e => setEditContent(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 15, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => { setEditing(false); setEditContent(originalDecoded) }} style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>{SOCIAL_UI.CANCEL_BUTTON}</button>
            <button onClick={handleSaveEdit} disabled={updatePost.isPending} className="btn-primary" style={{ padding: '6px 14px', fontSize: 13 }}>{updatePost.isPending ? SOCIAL_UI.EDIT_BUTTON_LOADING : SOCIAL_UI.EDIT_BUTTON}</button>
          </div>
        </div>
      ) : (
        <>
          {text && (
            <p style={{ fontSize: 15, color: 'var(--fg1)', lineHeight: 1.6, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
              {text}
            </p>
          )}
          {displayImage && (
            <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-cool)', display: 'flex', justifyContent: 'center' }}>
              <img src={displayImage} alt="" style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain', display: 'block' }} loading="lazy" />
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#e04e6e' : 'var(--fg3)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: 'var(--font-body)', transition: 'all 0.15s', transform: liked ? 'scale(1.1)' : 'scale(1)' }}>
          {Icons.heart({ s: 16, filled: liked })}
          {likeCount}
        </button>
        <button onClick={() => setShowComments((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showComments ? 'var(--primary)' : 'var(--fg3)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: 'var(--font-body)', transition: 'color 0.15s' }}>
          {Icons.message({ s: 16 })}
          {post.comment_count ?? 0}
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} currentUser={{ id: currentUserId, name: currentUserName }} />}
    </div>
  )
}

/* ─── Create Group Modal ────────────────────────────────── */
interface CreateGroupModalProps {
  onClose: () => void
}

function CreateGroupModal({ onClose }: CreateGroupModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const createGroup = useCreateGroup()
  const { addToast } = useUiStore()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createGroup.mutate({ nombre: name, descripcion: description, esPublico: isPublic }, {
      onSuccess: () => { addToast(SOCIAL_TOAST.GROUP_CREATED, 'success'); onClose() },
      onError: () => addToast(SOCIAL_TOAST.GROUP_CREATE_FAILED, 'error'),
    })
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    boxSizing: 'border-box',
    fontFamily: 'var(--font-body)',
    color: 'var(--fg1)',
    background: 'var(--bg-warm)',
    outline: 'none',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px' }}>{SOCIAL_UI.CREATE_GROUP_TITLE}</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>{SOCIAL_UI.FORM_NAME_LABEL}</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={SOCIAL_UI.GROUP_NAME_PLACEHOLDER} required style={{ ...inputStyle, marginBottom: 14 }} />
          <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>{SOCIAL_UI.FORM_DESC_LABEL}</label>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder={SOCIAL_UI.GROUP_DESC_PLACEHOLDER} style={{ ...inputStyle, resize: 'vertical', marginBottom: 14 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--fg2)', cursor: 'pointer', marginBottom: 16 }}>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ width: 18, height: 18 }} />
            {SOCIAL_UI.GROUP_PUBLIC_LABEL}
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>{SOCIAL_UI.CANCEL_BUTTON}</button>
            <button type="submit" className="btn-primary" disabled={!name.trim() || createGroup.isPending} style={{ padding: '10px 24px', fontSize: 14 }}>{createGroup.isPending ? SOCIAL_UI.CREATE_GROUP_BUTTON_LOADING : SOCIAL_UI.CREATE_GROUP_BUTTON}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function hashColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  const colors = ['var(--primary)', 'color-mix(in oklch, var(--primary) 85%, white)', 'color-mix(in oklch, var(--primary) 70%, white)', 'color-mix(in oklch, var(--primary) 55%, white)', 'color-mix(in oklch, var(--primary) 40%, white)', 'color-mix(in oklch, var(--primary) 25%, white)', 'var(--fg3)']
  return colors[Math.abs(h) % colors.length]
}

const ROLE_LABELS: Record<string, string> = {
  pcd: 'Persona con discapacidad',
  tutor: 'Tutor / familiar',
  institution: 'Institución',
}

function AboutCommunity() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useCommunityStats()
  const { data: miembros = [], isLoading: miembrosLoading, isError: miembrosError } = useMiembrosDestacados(6)
  const card: CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="animate-fade-in-up" style={{ ...card, padding: 32, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          {Icons.users({ s: 28 })}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{SOCIAL_UI.ABOUT_COMMUNITY_TITLE}</h2>
        <p style={{ fontSize: 15, color: 'var(--fg2)', margin: 0, lineHeight: 1.6, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          {SOCIAL_UI.ABOUT_COMMUNITY_DESC}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 24 }}>
          {statsLoading ? (
            <span style={{ fontSize: 14, color: 'var(--fg3)' }}>{SOCIAL_UI.STATS_LOADING}</span>
          ) : statsError ? (
            <BackendFallback method={COMMUNITY_ENDPOINTS.GET_STATS.method} endpoint={COMMUNITY_ENDPOINTS.GET_STATS.path} />
          ) : (
            [
              { label: SOCIAL_UI.ACTIVE_MEMBERS, value: stats?.totalMiembros ?? 0 },
              { label: SOCIAL_UI.GROUPS_COUNT, value: stats?.totalGrupos ?? 0 },
              { label: SOCIAL_UI.SHARED_STORIES, value: stats?.totalPublicaciones ?? 0 },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{s.value.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Miembros destacados */}
      {miembrosLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ ...card, padding: 20, animation: 'pulse 1.5s infinite' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--border-color)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 16, width: '60%', background: 'var(--border-color)', borderRadius: 6, marginBottom: 6 }} />
                  <div style={{ height: 12, width: '40%', background: 'var(--border-color)', borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ height: 12, background: 'var(--border-color)', borderRadius: 6, marginBottom: 6 }} />
              <div style={{ height: 12, width: '80%', background: 'var(--border-color)', borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : miembrosError ? (
        <BackendFallback method={COMMUNITY_ENDPOINTS.GET_MIEMBROS.method} endpoint={COMMUNITY_ENDPOINTS.GET_MIEMBROS.path} />
      ) : miembros.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {miembros.map(m => {
            const color = hashColor(m.nombreCompleto)
            const initials = m.nombreCompleto.split(' ').map(w => w?.[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
            return (
              <div key={m.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {m.urlAvatar ? (
                    <div style={{ width: 48, height: 48, borderRadius: '50% 50% 50% 14%', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={m.urlAvatar} alt={m.nombreCompleto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50% 50% 50% 14%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                      {initials}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg1)' }}>{m.nombreCompleto}</div>
                    <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{(m.rol && ROLE_LABELS[m.rol]) ?? m.rol}</div>
                  </div>
                </div>
                {m.biografia && <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>{m.biografia}</p>}
                {(m.ciudad || m.estado) && (
                  <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Icons.mapPin({ s: 12 })} {[m.ciudad, m.estado].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

/* ─── Groups View ────────────────────────────────────────── */
interface GroupsViewProps {
  onSelectGroup: (groupId: string | number) => void
  onCreateGroupClick: () => void
}

function GroupsView({ onSelectGroup, onCreateGroupClick }: GroupsViewProps) {
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'my'>('all')
  const { user } = useAuthStore()
  const canCreateGroup = user?.role === 'institution' || user?.role === 'admin'
  const { data: groups = [], isLoading, isError, refetch } = useGroups(search)
  const joinGroup = useJoinGroup()
  const leaveGroup = useLeaveGroup()
  const { addToast } = useUiStore()

  const joinedGroups = groups.filter(g => g.is_member)
  const displayedGroups = filterMode === 'my' ? joinedGroups : groups

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Grupos y Foros Institucionales</h2>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '4px 0 0' }}>Espacios oficiales de orientación, apoyo y consulta organizados por instituciones</p>
        </div>
        {canCreateGroup && (
          <button
            type="button"
            onClick={onCreateGroupClick}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {Icons.plus({ s: 16 })} Crear Grupo Institucional
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-pill)',
              border: filterMode === 'all' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: filterMode === 'all' ? 'var(--primary)' : 'var(--bg-surface)',
              color: filterMode === 'all' ? '#FFFFFF' : 'var(--fg2)',
              fontWeight: filterMode === 'all' ? 700 : 500,
              cursor: 'pointer',
              fontSize: 13,
              transition: 'all 0.15s ease',
            }}
          >
            🌐 Todos los foros ({groups.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('my')}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-pill)',
              border: filterMode === 'my' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: filterMode === 'my' ? 'var(--primary)' : 'var(--bg-surface)',
              color: filterMode === 'my' ? '#FFFFFF' : 'var(--fg2)',
              fontWeight: filterMode === 'my' ? 700 : 500,
              cursor: 'pointer',
              fontSize: 13,
              transition: 'all 0.15s ease',
            }}
          >
            ✅ Mis foros unidos ({joinedGroups.length})
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar foros por institución, nombre o tema..."
          style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg1)', outline: 'none', fontSize: 14 }}
        />
      </div>

      {/* Fast access banner for joined groups */}
      {joinedGroups.length > 0 && filterMode === 'all' && (
        <div style={{
          background: 'var(--primary-subtle)',
          border: '1.5px solid var(--primary)',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⭐ Tus foros unidos ({joinedGroups.length}):</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {joinedGroups.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelectGroup(g.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#FFFFFF',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span>🏛️ {g.name}</span>
                <span style={{ fontSize: 11, color: 'var(--fg3)', fontWeight: 500 }}>→ Ver publicaciones</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isError ? (
        <BackendFallback method={COMMUNITY_ENDPOINTS.GET_GROUPS.method} endpoint={COMMUNITY_ENDPOINTS.GET_GROUPS.path} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, height: 140, animation: 'pulse 1.4s infinite' }} />
          ))}
        </div>
      ) : filterMode === 'my' && joinedGroups.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--fg3)', margin: '0 0 12px', fontSize: 14 }}>Aún no te has unido a ningún foro institucional.</p>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            style={{ padding: '8px 18px', borderRadius: 'var(--radius-pill)', border: 'none', background: 'var(--primary)', color: '#FFF', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Explorar foros disponibles
          </button>
        </div>
      ) : displayedGroups.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--fg3)', margin: 0 }}>No se encontraron foros institucionales disponibles.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {displayedGroups.map(g => (
            <div key={g.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{g.name}</h3>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                      🏛️ Institucional
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: 'var(--bg-warm)', color: 'var(--fg3)' }}>
                      {g.is_public ? '🌐 Público' : '🔒 Privado'}
                    </span>
                  </div>
                </div>

                {/* Owner Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, background: 'var(--bg-warm)', padding: '4px 10px', borderRadius: 8, width: 'fit-content' }}>
                  <Avatar name={g.owner_name} src={g.owner_avatar} size={20} />
                  <span style={{ fontSize: 12, color: 'var(--fg2)', fontWeight: 600 }}>
                    Organizado por: <strong>{g.owner_name || 'Institución Oficial'}</strong>
                  </span>
                </div>

                {g.description && <p style={{ fontSize: 13, color: 'var(--fg2)', margin: '0 0 12px', lineHeight: 1.4 }}>{g.description}</p>}
                <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span>👥 {g.member_count} miembro{g.member_count !== 1 ? 's' : ''}</span>
                  {g.is_member && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>• ¡Estás unido!</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                {g.is_member ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onSelectGroup(g.id)}
                      style={{ flex: 1, padding: '7px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--primary)', background: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                    >
                      Entrar al Foro →
                    </button>
                    <button
                      type="button"
                      onClick={() => leaveGroup.mutate(g.id, { onSuccess: () => addToast('Saliste del grupo', 'info') })}
                      disabled={leaveGroup.isPending}
                      style={{ padding: '6px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg3)', fontSize: 12, cursor: 'pointer' }}
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => joinGroup.mutate(g.id, { onSuccess: () => addToast('¡Te has unido al grupo!', 'success') })}
                    disabled={joinGroup.isPending}
                    style={{ flex: 1, padding: '7px 12px', borderRadius: 'var(--radius-pill)', border: 'none', background: 'var(--primary)', color: '#FFF', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                  >
                    + Unirse al Foro
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Conectemos Gallery View ────────────────────────────── */
function ConectemosGalleryView({ currentUserId, currentUserName }: { currentUserId?: string | number; currentUserName?: string }) {
  const [categoria, setCategoria] = useState<string | null>(null)
  const [buscarInput, setBuscarInput] = useState('')
  const [buscar, setBuscar] = useState('')
  const { data: conectemosData, isLoading, isError, refetch } = useConectemos({
    categoriaCreativa: categoria ?? undefined,
    buscar: buscar,
    enabled: true,
  })
  const posts = conectemosData?.posts ?? []
  const toggleLike = useToggleLike()

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setBuscar(buscarInput)
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
          Galería Conectemos
        </h2>
        <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0 }}>
          Explora obras de arte, dibujos e historias compartidas por la comunidad
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          value={buscarInput}
          onChange={e => setBuscarInput(e.target.value)}
          placeholder="Buscar publicaciones creativas..."
          style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg1)', outline: 'none', fontSize: 14 }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-pill)', fontSize: 14 }}>
          Buscar
        </button>
      </form>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20, justifyContent: 'center' }}>
        {[
          { label: 'Todas las creaciones', icon: '🎨', value: null },
          { label: 'Arte', icon: '🎨', value: 'arte' },
          { label: 'Dibujo', icon: '✏️', value: 'dibujo' },
          { label: 'Historia', icon: '📖', value: 'historia' },
          { label: 'General', icon: '💬', value: 'general' },
        ].map(cat => (
          <button
            key={cat.value ?? 'all'}
            type="button"
            onClick={() => setCategoria(cat.value)}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-pill)',
              border: categoria === cat.value ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: categoria === cat.value ? 'var(--primary)' : 'var(--bg-surface)',
              color: categoria === cat.value ? '#FFF' : 'var(--fg2)',
              fontWeight: categoria === cat.value ? 700 : 500,
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {isError ? (
        <BackendFallback method={COMMUNITY_ENDPOINTS.GET_CONECTEMOS.method} endpoint={COMMUNITY_ENDPOINTS.GET_CONECTEMOS.path} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, height: 200, animation: 'pulse 1.4s infinite' }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--fg3)', margin: 0 }}>No hay creaciones disponibles en esta categoría.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} onLike={() => toggleLike.mutate(post.id)} currentUserId={currentUserId} currentUserName={currentUserName} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/* ═══ SocialPage (main) ════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════ */

export default function SocialPage() {
  const [activeGroupId, setActiveGroupId] = useState<string | number | null>(null)
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<string | null>(null)
  const [feedGroupFilter, setFeedGroupFilter] = useState<string | number | null>(null)
  const [feedAlgorithmMode, setFeedAlgorithmMode] = useState<'parati' | 'recientes' | 'mis_grupos'>('parati')

  // Creation form state
  const [newPost, setNewPost] = useState('')
  const [postCategory, setPostCategory] = useState<string>('general')
  const [exclusivoPadres, setExclusivoPadres] = useState<boolean>(false)
  const [postGroupId, setPostGroupId] = useState<string | number | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data: onboardingStatus } = useOnboardingStatus()
  const isIncomplete = Boolean(onboardingStatus && !(onboardingStatus as { onboardingCompleto?: boolean }).onboardingCompleto)

  const uploadMedia = useUploadMultimedia()
  const [mainTab, setMainTab] = useState<'comunidad' | 'grupos' | 'galeria' | 'eventos' | 'acerca'>('comunidad')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const { addToast } = useUiStore()

  const { user } = useAuthStore()
  const { data: groups = [] } = useGroups()

  const joinedGroupIds = useMemo(() => {
    return new Set(groups.filter(g => g.is_member).map(g => String(g.id)))
  }, [groups])

  const [nowTimestamp] = useState(() => Date.now())

  const userInterests = (() => {
    try {
      const local = JSON.parse(localStorage.getItem('raices_user_interests') || '[]')
      if (Array.isArray(local)) return local.map((s: string) => String(s).toLowerCase())
    } catch (_) {}
    return []
  })()

  const effectiveGroupId = feedGroupFilter ?? activeGroupId ?? undefined

  const selectedGroupObj = useMemo(() => {
    if (!effectiveGroupId) return null
    return groups.find(g => String(g.id) === String(effectiveGroupId)) ?? null
  }, [groups, effectiveGroupId])
  const { data: rawPosts = [], isLoading: postsLoading, isError: postsError, refetch: refetchPosts } = usePosts({
    grupoId: effectiveGroupId ? String(effectiveGroupId) : undefined,
    categoriaCreativa: feedCategoryFilter ? feedCategoryFilter : undefined,
  })

  const posts = useMemo(() => {
    let list = rawPosts

    if (feedCategoryFilter) {
      list = list.filter(p => (p.categoriaCreativa || '').toLowerCase() === feedCategoryFilter.toLowerCase())
    }

    if (feedAlgorithmMode === 'mis_grupos') {
      list = list.filter(p => p.group_id && joinedGroupIds.has(String(p.group_id)))
    }

    const copy = [...list]
    if (feedAlgorithmMode === 'parati') {
      const scorePost = (p: CommunityPost) => {
        let score = 100
        if (p.group_id && joinedGroupIds.has(String(p.group_id))) score += 50
        if (p.categoriaCreativa && userInterests.some(i => i.includes(p.categoriaCreativa!.toLowerCase()) || p.categoriaCreativa!.toLowerCase().includes(i))) {
          score += 30
        }
        score += (p.like_count ?? 0) * 2 + (p.comment_count ?? 0) * 3
        if (p.created_at) {
          const hours = (nowTimestamp - new Date(p.created_at).getTime()) / 3600000
          if (!isNaN(hours) && hours > 0) score -= Math.min(hours * 1.5, 60)
        }
        return score
      }
      copy.sort((a, b) => scorePost(b) - scorePost(a))
    } else if (feedAlgorithmMode === 'recientes') {
      copy.sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0
        const db = b.created_at ? new Date(b.created_at).getTime() : 0
        return db - da
      })
    }

    return copy
  }, [rawPosts, feedCategoryFilter, feedAlgorithmMode, joinedGroupIds, userInterests, nowTimestamp])

  const createPost = useCreatePost()
  const toggleLike = useToggleLike()

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      addToast('El archivo excede 10 MB', 'error')
      return
    }
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!newPost.trim() && !pendingFile) return
    if (createPost.isPending || uploadMedia.isPending) return

    let mediaUrl = ''
    if (pendingFile) {
      try {
        const result = await uploadMedia.mutateAsync(pendingFile)
        mediaUrl = result?.url ?? ''
      } catch {
        addToast('Error al subir el archivo', 'error')
        return
      }
    }

    createPost.mutate(
      {
        content: newPost,
        grupoId: postGroupId ?? activeGroupId ?? undefined,
        mediaUrl: mediaUrl || undefined,
        categoriaCreativa: postCategory,
        exclusivoPadres: exclusivoPadres,
      },
      {
        onSuccess: () => {
          setNewPost('')
          setPendingFile(null)
          setPreviewUrl(null)
          setExclusivoPadres(false)
          addToast(SOCIAL_TOAST.POST_CREATED, 'success')
        },
        onError: () => {
          addToast(SOCIAL_TOAST.POST_CREATE_FAILED, 'error')
        }
      }
    )
  }

  return (
    <>
      <main className="responsive-main" style={{ '--main-max-width': '1060px' } as CSSProperties}>

        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>Conectemos</h1>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>Conecta, comparte y crece junto a otros</p>
        </div>

        {/* Segmented Control Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--bg-warm)', padding: 4, borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', width: 'fit-content', overflowX: 'auto', maxWidth: '100%' }}>
          <button
            type="button"
            onClick={() => setMainTab('comunidad')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mainTab === 'comunidad' ? 'var(--bg-surface)' : 'transparent',
              color: mainTab === 'comunidad' ? 'var(--primary)' : 'var(--fg2)',
              fontWeight: mainTab === 'comunidad' ? 700 : 500,
              boxShadow: mainTab === 'comunidad' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {Icons.message({ s: 16 })} Publicaciones
          </button>
          <button
            type="button"
            onClick={() => setMainTab('grupos')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mainTab === 'grupos' ? 'var(--bg-surface)' : 'transparent',
              color: mainTab === 'grupos' ? 'var(--primary)' : 'var(--fg2)',
              fontWeight: mainTab === 'grupos' ? 700 : 500,
              boxShadow: mainTab === 'grupos' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {Icons.users({ s: 16 })} Grupos ({groups.length})
          </button>
          <button
            type="button"
            onClick={() => setMainTab('galeria')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mainTab === 'galeria' ? 'var(--bg-surface)' : 'transparent',
              color: mainTab === 'galeria' ? 'var(--primary)' : 'var(--fg2)',
              fontWeight: mainTab === 'galeria' ? 700 : 500,
              boxShadow: mainTab === 'galeria' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            🎨 Galería Conectemos
          </button>
          <button
            type="button"
            onClick={() => setMainTab('eventos')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mainTab === 'eventos' ? 'var(--bg-surface)' : 'transparent',
              color: mainTab === 'eventos' ? 'var(--primary)' : 'var(--fg2)',
              fontWeight: mainTab === 'eventos' ? 700 : 500,
              boxShadow: mainTab === 'eventos' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {Icons.calendar({ s: 16 })} Eventos
          </button>
          <button
            type="button"
            onClick={() => setMainTab('acerca')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mainTab === 'acerca' ? 'var(--bg-surface)' : 'transparent',
              color: mainTab === 'acerca' ? 'var(--primary)' : 'var(--fg2)',
              fontWeight: mainTab === 'acerca' ? 700 : 500,
              boxShadow: mainTab === 'acerca' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            ℹ️ Acerca de la comunidad
          </button>
        </div>

        {mainTab === 'grupos' ? (
          <GroupsView
            onSelectGroup={groupId => {
              setActiveGroupId(groupId)
              setMainTab('comunidad')
            }}
            onCreateGroupClick={() => setShowCreateGroup(true)}
          />
        ) : mainTab === 'galeria' ? (
          <ConectemosGalleryView currentUserId={user?.id} currentUserName={user?.full_name} />
        ) : mainTab === 'eventos' ? (
          <EventsDiscovery />
        ) : mainTab === 'acerca' ? (
          <AboutCommunity />
        ) : (
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            {/* ── Main column ── */}
            <div>
              {isIncomplete ? (
                <div style={{ marginBottom: 20 }}>
                  <RestrictedBlock
                    title="Comunidad restringida"
                    message="Completa tu perfil para poder publicar y compartir experiencias con la comunidad."
                    height={160}
                  />
                </div>
              ) : (
              <div className="animate-fade-in-up delay-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', marginBottom: 20, position: 'relative', zIndex: 20 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Avatar name={user?.full_name} src={user?.avatar_url} />
                  <form onSubmit={handleSubmit} style={{ flex: 1 }}>

                    {/* Category Selection Before Posting */}
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>
                        Categoría de tu publicación:
                      </span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {CATEGORY_OPTIONS.map(cat => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setPostCategory(cat.value)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 'var(--radius-pill)',
                              border: postCategory === cat.value ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                              background: postCategory === cat.value ? 'var(--primary-subtle)' : 'var(--bg-warm)',
                              color: postCategory === cat.value ? 'var(--primary)' : 'var(--fg2)',
                              fontWeight: postCategory === cat.value ? 700 : 500,
                              cursor: 'pointer',
                              fontSize: 13,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{cat.icon}</span> {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea rows={3} value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder={SOCIAL_UI.POST_PLACEHOLDER}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 15, resize: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }} />

                    {/* File preview */}
                    {previewUrl && (
                      <div style={{ position: 'relative', marginTop: 10, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                        {pendingFile?.type?.startsWith('video/') ? (
                          <video src={previewUrl} style={{ maxWidth: '100%', maxHeight: 160, display: 'block', borderRadius: 10 }} controls />
                        ) : (
                          <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 160, display: 'block', borderRadius: 10, objectFit: 'cover' }} />
                        )}
                        <button
                          type="button"
                          onClick={() => { setPendingFile(null); setPreviewUrl(null) }}
                          style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Options Bar: Group & Audience */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                        {/* Group Selection */}
                        {groups.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>Grupo:</span>
                            <CustomSelect
                              options={[
                                { value: '', label: 'General / Público' },
                                ...groups.map(g => ({ value: String(g.id), label: `${g.name}${g.is_member ? ' (Unido)' : ''}` })),
                              ]}
                              value={postGroupId !== null && postGroupId !== undefined ? String(postGroupId) : ''}
                              onChange={val => setPostGroupId(val ? val : null)}
                              minWidth={170}
                            />
                          </div>
                        )}

                        {/* Exclusive Parents Checkbox */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg1)', cursor: 'pointer', fontWeight: 600, userSelect: 'none' }}>
                          <input
                            type="checkbox"
                            checked={exclusivoPadres}
                            onChange={e => setExclusivoPadres(e.target.checked)}
                          />
                          <span>🔒 Solo para Padres/Tutores</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--fg3)', fontSize: 13, fontWeight: 600 }}>
                          {Icons.camera({ s: 18 })}
                          <span>Adjuntar</span>
                          <input type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                        </label>
                        <button type="submit" className="btn-primary" disabled={(!newPost.trim() && !pendingFile) || createPost.isPending || uploadMedia.isPending}
                          style={{ fontSize: 15, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {createPost.isPending || uploadMedia.isPending ? SOCIAL_UI.POST_BUTTON_LOADING : SOCIAL_UI.POST_BUTTON}
                          {Icons.send({ s: 16 })}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              )}

              {/* ── Feed Algorithm Mode Selector ── */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFeedAlgorithmMode('parati')}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-pill)',
                    border: feedAlgorithmMode === 'parati' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: feedAlgorithmMode === 'parati' ? 'var(--primary)' : 'var(--bg-surface)',
                    color: feedAlgorithmMode === 'parati' ? '#FFFFFF' : 'var(--fg2)',
                    fontWeight: feedAlgorithmMode === 'parati' ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: 13.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: feedAlgorithmMode === 'parati' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ✨ Para ti (Algoritmo)
                </button>
                <button
                  type="button"
                  onClick={() => setFeedAlgorithmMode('recientes')}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-pill)',
                    border: feedAlgorithmMode === 'recientes' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: feedAlgorithmMode === 'recientes' ? 'var(--primary)' : 'var(--bg-surface)',
                    color: feedAlgorithmMode === 'recientes' ? '#FFFFFF' : 'var(--fg2)',
                    fontWeight: feedAlgorithmMode === 'recientes' ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: 13.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: feedAlgorithmMode === 'recientes' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ⏱️ Más recientes
                </button>
                <button
                  type="button"
                  onClick={() => setFeedAlgorithmMode('mis_grupos')}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-pill)',
                    border: feedAlgorithmMode === 'mis_grupos' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: feedAlgorithmMode === 'mis_grupos' ? 'var(--primary)' : 'var(--bg-surface)',
                    color: feedAlgorithmMode === 'mis_grupos' ? '#FFFFFF' : 'var(--fg2)',
                    fontWeight: feedAlgorithmMode === 'mis_grupos' ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: 13.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: feedAlgorithmMode === 'mis_grupos' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  👥 De mis foros unidos
                </button>
              </div>

              {/* ── Feed Filter Bar ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: 16,
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginRight: 2 }}>
                    Filtrar feed:
                  </span>
                  <button
                    type="button"
                    onClick={() => setFeedCategoryFilter(null)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: feedCategoryFilter === null ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: feedCategoryFilter === null ? 'var(--primary)' : 'var(--bg-warm)',
                      color: feedCategoryFilter === null ? '#FFFFFF' : 'var(--fg2)',
                      fontWeight: feedCategoryFilter === null ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    ☀️ Todas
                  </button>
                  {CATEGORY_OPTIONS.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFeedCategoryFilter(cat.value)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: feedCategoryFilter === cat.value ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: feedCategoryFilter === cat.value ? 'var(--primary)' : 'var(--bg-warm)',
                        color: feedCategoryFilter === cat.value ? '#FFFFFF' : 'var(--fg2)',
                        fontWeight: feedCategoryFilter === cat.value ? 700 : 500,
                        cursor: 'pointer',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>

                {/* Filter by Group dropdown */}
                {groups.length > 0 && (
                  <CustomSelect
                    options={[
                      { value: '', label: 'Todos los grupos' },
                      ...groups.map(g => ({ value: String(g.id), label: `${g.name}${g.is_member ? ' (Unido)' : ''}` })),
                    ]}
                    value={effectiveGroupId ? String(effectiveGroupId) : ''}
                    onChange={val => {
                      setFeedGroupFilter(val ? val : null)
                      if (activeGroupId && !val) setActiveGroupId(null)
                    }}
                    minWidth={160}
                  />
                )}
              </div>

              {/* Group Space Hero Banner */}
              {selectedGroupObj && (
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '2px solid var(--primary)',
                  borderRadius: 16,
                  padding: '18px 20px',
                  marginBottom: 20,
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                          🏛️ Foro Institucional Oficial
                        </span>
                        {selectedGroupObj.is_member && (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: '#DCFCE7', color: '#166534' }}>
                            ✓ Eres miembro de este foro
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
                        {selectedGroupObj.name}
                      </h2>
                      {selectedGroupObj.description && (
                        <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: '0 0 10px', lineHeight: 1.4 }}>
                          {selectedGroupObj.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: 'var(--fg3)', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar name={selectedGroupObj.owner_name} src={selectedGroupObj.owner_avatar} size={22} />
                          <span>Organizado por: <strong style={{ color: 'var(--fg1)' }}>{selectedGroupObj.owner_name || 'Institución Oficial'}</strong></span>
                        </div>
                        <span>•</span>
                        <span>👥 {selectedGroupObj.member_count} Miembro{selectedGroupObj.member_count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setActiveGroupId(null); setFeedGroupFilter(null) }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-warm)',
                        color: 'var(--fg2)',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ← Ver feed general
                    </button>
                  </div>
                </div>
              )}

              {postsError ? (
                <BackendFallback method={COMMUNITY_ENDPOINTS.GET_POSTS.method} endpoint={COMMUNITY_ENDPOINTS.GET_POSTS.path} onRetry={() => refetchPosts()} />
              ) : postsLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : posts.length === 0 ? (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 48, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    {Icons.message({ s: 24 })}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{SOCIAL_UI.EMPTY_POSTS_TITLE}</h3>
                  <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0 }}>
                    {SOCIAL_UI.EMPTY_POSTS_DESC}
                  </p>
                </div>
              ) : (
                <div className="stagger-children">
                {posts.map((post) => (
                  <div key={post.id} className="animate-fade-in-up"><PostCard post={post} onLike={() => toggleLike.mutate(post.id)} currentUserId={user?.id} currentUserName={user?.full_name} /></div>
                ))}
              </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
    </>
  )
}
