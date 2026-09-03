import { useState, useRef, useEffect } from 'react'
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
import { useUploadMultimedia } from '../hooks/useMultimedia'
import { Icons } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'
import { SOCIAL_TOAST, SOCIAL_UI, SOCIAL_CONFIRM } from '../constants/socialMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { COMMUNITY_ENDPOINTS } from '@shared/constants/backendEndpoints'

const relativeDate = (d) => {
  const diff = Date.now() - new Date(d)
  const h = Math.floor(diff / 3600000)
  return h < 1 ? SOCIAL_UI.TIME_NOW : h < 24 ? `${SOCIAL_UI.TIME_PREFIX} ${h}h` : `${SOCIAL_UI.TIME_PREFIX} ${Math.floor(h / 24)}d`
}

const avatarStyle = (extra = {}) => ({
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

function Avatar({ name, src }) {
  if (src) {
    return (
      <div style={avatarStyle()}>
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return <div style={avatarStyle()}>{(name?.[0] ?? '?').toUpperCase()}</div>
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

function CommentSection({ postId, currentUser }) {
  const { data: comments = [], isLoading } = useComments(postId)
  const createComment = useCreateComment(postId)
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim() || createComment.isPending) return
    createComment.mutate(
      { content: text, authorName: currentUser?.name ?? currentUser?.full_name ?? 'Tú', authorId: currentUser?.id },
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
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--primary-subtle)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}
            >
              {(c.author_name?.[0] ?? '?').toUpperCase()}
            </div>
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

function PostCard({ post, onLike, currentUserId, currentUserName }) {
  const [showComments, setShowComments] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [liked, setLiked] = useState(!!post.liked_by_me)
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0)
  const updatePost = useUpdatePost(post.id)
  const deletePost = useDeletePost(post.id)
  const { addToast } = useUiStore()
  const isAuthor = post.author_id === currentUserId

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(prev => prev + (newLiked ? 1 : -1))
    // Llamar al backend en background, sin bloquear la UI
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg1)' }}>{post.author_name}</div>
              <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
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
            <button onClick={() => { setEditing(false); setEditContent(post.content) }} style={{ padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>{SOCIAL_UI.CANCEL_BUTTON}</button>
            <button onClick={handleSaveEdit} disabled={updatePost.isPending} className="btn-primary" style={{ padding: '6px 14px', fontSize: 13 }}>{updatePost.isPending ? SOCIAL_UI.EDIT_BUTTON_LOADING : SOCIAL_UI.EDIT_BUTTON}</button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 15, color: 'var(--fg1)', lineHeight: 1.6, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>
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
function CreateGroupModal({ onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const createGroup = useCreateGroup()
  const { addToast } = useUiStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    createGroup.mutate({ nombre: name, descripcion: description, esPublico: isPublic }, {
      onSuccess: () => { addToast(SOCIAL_TOAST.GROUP_CREATED, 'success'); onClose() },
      onError: () => addToast(SOCIAL_TOAST.GROUP_CREATE_FAILED, 'error'),
    })
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }

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

const ROLE_LABELS = { pcd: 'Persona con discapacidad', tutor: 'Tutor / familiar', institution: 'Institución' }

function AboutCommunity() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useCommunityStats()
  const { data: miembros = [], isLoading: miembrosLoading, isError: miembrosError } = useMiembrosDestacados(6)
  const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)' }

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
                    <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{ROLE_LABELS[m.rol] ?? m.rol}</div>
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



/* ═══════════════════════════════════════════════════════════ */
/* ═══ SocialPage (main) ════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════ */

export default function SocialPage() {
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [newPost, setNewPost] = useState('')
  const [pendingFile, setPendingFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const uploadMedia = useUploadMultimedia()
  const [mainTab, setMainTab] = useState('community')
  const [conectemosCategoria, setConectemosCategoria] = useState(null)
  const { data: conectemosData } = useConectemos({ categoriaCreativa: conectemosCategoria, enabled: mainTab === 'conectemos' })
  const conectemosPosts = conectemosData?.posts ?? []
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const { addToast } = useUiStore()

  const { user, logout } = useAuthStore()
  const { data: groups = [], isError: groupsError, refetch: refetchGroups } = useGroups()
  const { data: posts = [], isLoading: postsLoading, isError: postsError, refetch: refetchPosts } = usePosts(activeGroupId)
  const createPost = useCreatePost()
  const toggleLike = useToggleLike()
  const joinGroup = useJoinGroup()
  const leaveGroup = useLeaveGroup()

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      addToast('El archivo excede 10 MB', 'error')
      return
    }
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
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

    const content = mediaUrl
      ? `${newPost}${newPost.trim() ? '\n\n' : ''}${mediaUrl}`
      : newPost

    createPost.mutate(
      { content, grupoId: activeGroupId ?? undefined },
      {
        onSuccess: () => {
          setNewPost('')
          setPendingFile(null)
          setPreviewUrl(null)
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
      <main className="responsive-main" style={{ '--main-max-width': '1060px' }}>

        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>Conectemos</h1>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>Conecta, comparte y crece junto a otros</p>
        </div>

        {/* iOS-style Segmented Control */}
        <div className="animate-fade-in-up delay-1" style={{ display: 'inline-flex', background: 'var(--bg-cool)', borderRadius: 10, padding: 3, gap: 2, marginBottom: 24 }}>
          {[
            { key: 'community', label: SOCIAL_UI.TAB_COMMUNITY, icon: Icons.users },
            { key: 'conectemos', label: 'Conectemos', icon: Icons.sparkles },
            { key: 'about', label: SOCIAL_UI.TAB_ABOUT, icon: Icons.heart },
          ].map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: mainTab === t.key ? 'var(--bg-surface)' : 'transparent', boxShadow: mainTab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', color: mainTab === t.key ? 'var(--fg1)' : 'var(--fg3)', cursor: 'pointer', fontWeight: mainTab === t.key ? 600 : 500, fontSize: 13.5, fontFamily: 'var(--font-body)', transition: 'all 0.2s ease' }}>
              {t.icon({ s: 15 })} <span>{t.label}</span>
            </button>
          ))}
        </div>

        {mainTab === 'about' ? (
          <AboutCommunity />
        ) : mainTab === 'conectemos' ? (
          <div>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {[null, 'arte', 'dibujo', 'historia', 'general'].map(cat => (
                <button
                  key={cat ?? 'all'}
                  onClick={() => setConectemosCategoria(cat)}
                  style={{
                    padding: '7px 16px', borderRadius: 20, border: '1px solid',
                    borderColor: conectemosCategoria === cat ? 'var(--primary)' : 'var(--border-color)',
                    background: conectemosCategoria === cat ? 'var(--primary-subtle)' : 'transparent',
                    color: conectemosCategoria === cat ? 'var(--primary)' : 'var(--fg2)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Todos'}
                </button>
              ))}
            </div>
            {conectemosPosts.length === 0 ? (
              <div style={{
                background: 'var(--bg-surface)', border: '1px dashed var(--border-color)',
                borderRadius: 14, padding: 48, textAlign: 'center',
              }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {Icons.sparkles({ s: 24 })}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Aún no hay creaciones</h3>
                <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0 }}>Las creaciones de la comunidad aparecerán aquí.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {conectemosPosts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={() => toggleLike.mutate(post.id)} currentUserId={user?.id} currentUserName={user?.name} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid-sidebar-main">
            {/* ── Sidebar ── */}
            {groupsError ? (
              <BackendFallback method={COMMUNITY_ENDPOINTS.GET_GROUPS.method} endpoint={COMMUNITY_ENDPOINTS.GET_GROUPS.path} onRetry={() => refetchGroups()} />
            ) : (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 24, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                {SOCIAL_UI.GROUPS_TITLE} <span style={{ fontWeight: 400, fontSize: 12 }}>({groups.length})</span>
              </div>

              <button onClick={() => setShowCreateGroup(true)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px dashed var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                {Icons.plus({ s: 14 })} {SOCIAL_UI.CREATE_GROUP}
              </button>

              <button onClick={() => setActiveGroupId(null)}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', background: activeGroupId === null ? 'var(--primary-subtle)' : 'transparent', color: activeGroupId === null ? 'var(--primary)' : 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontWeight: activeGroupId === null ? 700 : 400, marginBottom: 4, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icons.users({ s: 16 })} {SOCIAL_UI.ALL_GROUPS}
              </button>

              {groups.map((g) => (
                <button key={g.id} onClick={() => setActiveGroupId(g.id)} title={g.description}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', background: activeGroupId === g.id ? 'var(--primary-subtle)' : 'transparent', color: activeGroupId === g.id ? 'var(--primary)' : 'var(--fg2)', cursor: 'pointer', marginBottom: 2, fontFamily: 'var(--font-body)' }}>
                  <div style={{ fontSize: 14, fontWeight: activeGroupId === g.id ? 700 : 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.name}
                  </div>
                  <div style={{ fontSize: 11, color: activeGroupId === g.id ? 'var(--primary)' : 'var(--fg3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.85 }}>
                    {g.member_count} miembro{g.member_count !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}

              {activeGroupId && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => {
                      const group = groups.find(g => g.id === activeGroupId)
                      if (group?.is_member) {
                        leaveGroup.mutate(activeGroupId, {
                          onSuccess: () => { addToast(SOCIAL_TOAST.GROUP_LEFT, 'success'); setActiveGroupId(null) },
                          onError: () => addToast(SOCIAL_TOAST.GROUP_LEAVE_FAILED, 'error'),
                        })
                      } else {
                        joinGroup.mutate(activeGroupId, {
                          onSuccess: () => addToast(SOCIAL_TOAST.GROUP_JOINED, 'success'),
                          onError: () => addToast(SOCIAL_TOAST.GROUP_JOIN_FAILED, 'error'),
                        })
                      }
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: groups.find(g => g.id === activeGroupId)?.is_member ? 'color-mix(in oklch, #D46A6A 10%, transparent)' : 'var(--primary-subtle)', color: groups.find(g => g.id === activeGroupId)?.is_member ? '#D46A6A' : 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                    {groups.find(g => g.id === activeGroupId)?.is_member ? SOCIAL_UI.LEAVE_GROUP : SOCIAL_UI.JOIN_GROUP}
                  </button>
                </div>
              )}
            </div>
            )}

            {/* ── Main column ── */}
            <div>
              <div className="animate-fade-in-up delay-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Avatar name={user?.name} src={user?.avatar_url} />
                  <form onSubmit={handleSubmit} style={{ flex: 1 }}>
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'var(--fg3)', fontSize: 13, fontWeight: 600 }}>
                        {Icons.camera({ s: 18 })}
                        <span>Adjuntar</span>
                        <input type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                      </label>
                      <button type="submit" className="btn-primary" disabled={(!newPost.trim() && !pendingFile) || createPost.isPending || uploadMedia.isPending}
                        style={{ fontSize: 15, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {createPost.isPending || uploadMedia.isPending ? SOCIAL_UI.POST_BUTTON_LOADING : SOCIAL_UI.POST_BUTTON}
                        {Icons.send({ s: 16 })}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

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
                  <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0 }}>{SOCIAL_UI.EMPTY_POSTS_DESC}</p>
                </div>
              ) : (
                <div className="stagger-children">
                {posts.map((post) => (
                  <div key={post.id} className="animate-fade-in-up"><PostCard post={post} onLike={() => toggleLike.mutate(post.id)} currentUserId={user?.id} /></div>
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
