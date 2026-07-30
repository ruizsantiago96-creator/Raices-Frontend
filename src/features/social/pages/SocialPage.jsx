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
} from '../hooks/useCommunity'
import { useConversations, useMessages, useSendMessage } from '../hooks/useMessages'
import { useAuthStore } from '@features/auth'
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

function CommentSection({ postId }) {
  const { data: comments = [], isLoading } = useComments(postId)
  const createComment = useCreateComment(postId)
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim() || createComment.isPending) return
    createComment.mutate({ content: text }, { onSuccess: () => setText('') })
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

function PostCard({ post, onLike, currentUserId }) {
  const [showComments, setShowComments] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const updatePost = useUpdatePost(post.id)
  const deletePost = useDeletePost(post.id)
  const { addToast } = useUiStore()
  const isAuthor = post.author_id === currentUserId

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
        <button onClick={onLike} style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.liked_by_me ? '#e04e6e' : 'var(--fg3)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: 'var(--font-body)', transition: 'color 0.15s' }}>
          {Icons.heart({ s: 16, filled: !!post.liked_by_me })}
          {post.like_count ?? 0}
        </button>
        <button onClick={() => setShowComments((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showComments ? 'var(--primary)' : 'var(--fg3)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: 'var(--font-body)', transition: 'color 0.15s' }}>
          {Icons.message({ s: 16 })}
          {post.comment_count ?? 0}
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
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
      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 480, width: '100%', boxShadow: 'var(--shadow-xl)' }}>
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



function AboutCommunity() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useCommunityStats()
  const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ ...card, padding: 32, textAlign: 'center' }}>
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
    </div>
  )
}

/* ─── Direct Messages ───────────────────────────────────── */
function DirectMessages({ currentUserId }) {
  const [activePartnerId, setActivePartnerId] = useState(null)
  const [text, setText] = useState('')
  const chatEndRef = useRef(null)
  const { data: conversations = [], isLoading: convsLoading } = useConversations()
  const { data: messages = [] } = useMessages(activePartnerId)
  const sendMessage = useSendMessage()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim() || !activePartnerId || sendMessage.isPending) return
    sendMessage.mutate({ toId: activePartnerId, content: text }, { onSuccess: () => setText('') })
  }

  const activeConv = conversations.find(c => c.partner?.id === activePartnerId)

  return (
    <div className="grid-messages" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ borderRight: '1px solid var(--border-color)', overflowY: 'auto' }}>
        <div style={{ padding: '16px 16px 12px', fontWeight: 700, fontSize: 13, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>              {SOCIAL_UI.MESSAGES_TITLE}
        </div>
        {convsLoading ? (
          <div style={{ padding: 20, color: 'var(--fg3)', fontSize: 13 }}>{SOCIAL_UI.LOADING}</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg3)', fontSize: 13 }}>
            <div style={{ marginBottom: 8 }}>{Icons.message({ s: 24 })}</div>
            {SOCIAL_UI.MESSAGES_EMPTY}<br />{SOCIAL_UI.MESSAGES_EMPTY_HINT}
          </div>
        ) : (
          conversations.filter(conv => conv.partner).map(conv => (
            <button key={conv.partner.id} onClick={() => setActivePartnerId(conv.partner.id)}
              style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', borderBottom: '1px solid var(--border-color)', background: activePartnerId === conv.partner.id ? 'var(--primary-subtle)' : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {(conv.partner.full_name?.[0] ?? '?').toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg1)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.partner.full_name}</span>
                  {conv.unread > 0 && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 6px', flexShrink: 0, marginLeft: 6 }}>{conv.unread}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message}</div>
              </div>
            </button>
          ))
        )}
      </div>

      {activePartnerId ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: 15, color: 'var(--fg1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
              {(activeConv?.partner.full_name?.[0] ?? '?').toUpperCase()}
            </div>
            {activeConv?.partner.full_name ?? SOCIAL_UI.USER_FALLBACK}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg => {
              const mine = msg.from_id === currentUserId
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                  <span style={{ background: mine ? 'var(--primary)' : 'var(--bg-warm)', color: mine ? '#fff' : 'var(--fg1)', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', fontSize: 14, maxWidth: '72%', border: mine ? 'none' : '1px solid var(--border-color)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {msg.content}
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, textAlign: mine ? 'right' : 'left' }}>
                      {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </span>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder={SOCIAL_UI.MESSAGE_PLACEHOLDER}
              style={{ flex: 1, height: 42, padding: '0 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-pill)', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }} />
            <button type="submit" disabled={!text.trim() || sendMessage.isPending}
              style={{ width: 42, height: 42, borderRadius: '50%', background: text.trim() ? 'var(--primary)' : 'var(--border-color)', border: 'none', color: '#fff', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {Icons.send({ s: 18 })}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--fg3)', fontSize: 14 }}>
          {Icons.message({ s: 32 })}
          <span>{SOCIAL_UI.SELECT_CONVERSATION}</span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/* ═══ SocialPage (main) ════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════ */

export default function SocialPage() {
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [newPost, setNewPost] = useState('')
  const [mainTab, setMainTab] = useState('community')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const { addToast } = useUiStore()

  const { user, logout } = useAuthStore()
  const { data: groups = [], isError: groupsError, refetch: refetchGroups } = useGroups()
  const { data: posts = [], isLoading: postsLoading, isError: postsError, refetch: refetchPosts } = usePosts(activeGroupId)
  const createPost = useCreatePost()
  const toggleLike = useToggleLike()
  const joinGroup = useJoinGroup()
  const leaveGroup = useLeaveGroup()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newPost.trim() || createPost.isPending) return
    createPost.mutate(
      { content: newPost, grupoId: activeGroupId ?? undefined },
      {
        onSuccess: () => {
          setNewPost('')
          addToast(SOCIAL_TOAST.POST_CREATED, 'success')
        },
        onError: () => {
          addToast(SOCIAL_TOAST.POST_CREATE_FAILED, 'error')
        }
      }
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="social" />
      <TopNav user={user} onLogout={logout} currentPage="social" />

      <main className="responsive-main" style={{ '--main-max-width': '1060px' }}>

        {/* Tab selector */}
        <div className="social-tabs" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'community', label: SOCIAL_UI.TAB_COMMUNITY, icon: Icons.users },
            { key: 'messages', label: SOCIAL_UI.TAB_MESSAGES, icon: Icons.message },
            { key: 'about', label: SOCIAL_UI.TAB_ABOUT, icon: Icons.heart },
          ].map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 'var(--radius-pill)', border: mainTab === t.key ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: mainTab === t.key ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: mainTab === t.key ? 'var(--primary)' : 'var(--fg2)', cursor: 'pointer', fontWeight: mainTab === t.key ? 700 : 500, fontSize: 14, fontFamily: 'var(--font-body)' }}>
              {t.icon({ s: 16 })} <span>{t.label}</span>
            </button>
          ))}
        </div>

        {mainTab === 'about' ? (
          <AboutCommunity />
        ) : mainTab === 'messages' ? (
          <DirectMessages currentUserId={user?.id} />
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
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Avatar name={user?.name} src={user?.avatar_url} />
                  <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                    <textarea rows={3} value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder={SOCIAL_UI.POST_PLACEHOLDER}
                      style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 15, resize: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                      <button type="submit" className="btn-primary" disabled={!newPost.trim() || createPost.isPending}
                        style={{ fontSize: 15, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {createPost.isPending ? SOCIAL_UI.POST_BUTTON_LOADING : SOCIAL_UI.POST_BUTTON}
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
                posts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={() => toggleLike.mutate(post.id)} currentUserId={user?.id} />
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
    </div>
  )
}
