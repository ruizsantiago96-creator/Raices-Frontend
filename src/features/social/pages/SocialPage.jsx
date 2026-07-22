import { useState, useRef, useEffect } from 'react' // useRef/useEffect used in DirectMessages
import {
  useGroups,
  usePosts,
  useCreatePost,
  useToggleLike,
  useComments,
  useCreateComment,
} from '../hooks/useCommunity'
import { useConversations, useMessages, useSendMessage } from '../hooks/useMessages'
import { useAuthStore } from '@features/auth'
import { Icons } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'

const relativeDate = (d) => {
  const diff = Date.now() - new Date(d)
  const h = Math.floor(diff / 3600000)
  return h < 1 ? 'hace un momento' : h < 24 ? `hace ${h}h` : `hace ${Math.floor(h / 24)}d`
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
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50% 50% 50% 14%',
            background: 'var(--border-color)',
            flexShrink: 0,
          }}
        />
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
        <div style={{ fontSize: 13, color: 'var(--fg3)', marginBottom: 8 }}>Cargando comentarios...</div>
      ) : comments.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--fg3)', marginBottom: 8 }}>Sin comentarios aún.</div>
      ) : (
        comments.map((c) => (
          <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {(c.author_name?.[0] ?? '?').toUpperCase()}
            </div>
            <div
              style={{
                background: 'var(--bg-warm)',
                borderRadius: 10,
                padding: '6px 10px',
                flex: 1,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--fg1)' }}>{c.author_name} </span>
              <span style={{ fontSize: 13, color: 'var(--fg2)' }}>{c.content}</span>
              <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 2 }}>{relativeDate(c.created_at)}</div>
            </div>
          </div>
        ))
      )}

      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario…"
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: 20,
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            background: 'var(--bg-warm)',
            color: 'var(--fg1)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || createComment.isPending}
          style={{
            background: 'var(--primary)',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: text.trim() && !createComment.isPending ? 'pointer' : 'not-allowed',
            opacity: text.trim() && !createComment.isPending ? 1 : 0.5,
            flexShrink: 0,
          }}
        >
          {Icons.send({ s: 16 })}
        </button>
      </form>
    </div>
  )
}

function PostCard({ post, onLike }) {
  const [showComments, setShowComments] = useState(false)

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <Avatar name={post.author_name} src={post.author_avatar} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg1)' }}>{post.author_name}</div>
          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
            {relativeDate(post.created_at)}
            {post.group_name ? <span style={{ marginLeft: 6 }}>· {post.group_name}</span> : null}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 15, color: 'var(--fg1)', lineHeight: 1.6, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
        {post.content}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          paddingTop: 12,
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <button
          onClick={onLike}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: post.liked_by_me ? '#e04e6e' : 'var(--fg3)',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
            fontFamily: 'var(--font-body)',
            transition: 'color 0.15s',
          }}
        >
          {Icons.heart({ s: 16, filled: !!post.liked_by_me })}
          {post.like_count ?? 0}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: showComments ? 'var(--primary)' : 'var(--fg3)',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
            fontFamily: 'var(--font-body)',
            transition: 'color 0.15s',
          }}
        >
          {Icons.message({ s: 16 })}
          {post.comment_count ?? 0}
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </div>
  )
}

/* ─── Quiénes somos la comunidad ─────────────────────────── */
const COMMUNITY_MEMBERS = [
  { name: 'María García', role: 'Madre de familia', city: 'Mérida, Yucatán', bio: 'Mamá de Santiago (8 años, TEA). Comparte experiencias sobre terapia ABA y escuela inclusiva.', color: '#C4789A' },
  { name: 'Carlos Hernández', role: 'Persona con discapacidad motriz', city: 'Ciudad de México', bio: 'Ingeniero en sistemas. Busca oportunidades de empleo inclusivo y compartió su experiencia con accesibilidad urbana.', color: '#01ADFF' },
  { name: 'Ana Luisa Pérez', role: 'Tutora y cuidadora', city: 'Guadalajara, Jalisco', bio: 'Cuida a su hermano menor (22 años, discapacidad intelectual). Participa en el grupo de Terapia y Empleo.', color: '#8B6BAE' },
  { name: 'Roberto Díaz', role: 'Psicólogo', city: 'Monterrey, Nuevo León', bio: 'Psicólogo especializado en discapacidad psicosocial. Conecta familias con terapeutas verificados.', color: '#D4944C' },
  { name: 'Lucía Martínez', role: 'Maestra de educación especial', city: 'Puebla, Puebla', bio: '15 años de experiencia. Comparte recursos didácticos y estrategias de inclusión escolar.', color: '#7BA05B' },
  { name: 'Fernando Ruiz', role: 'Persona con discapacidad visual', city: 'Oaxaca, Oaxaca', bio: 'Abogado defensor de derechos. Comparte información sobre trámites y apoyos legales para personas con discapacidad.', color: '#4BA3A3' },
  { name: 'Patricia López', role: 'Madre de familia', city: 'Querétaro, Querétaro', bio: 'Mamá de gemelos (6 años). Comparte experiencias sobre vida independiente y actividades recreativas.', color: '#5A6C8C' },
  { name: 'Jorge Morales', role: 'Tutor legal', city: 'León, Guanajuato', bio: 'Tutor de su sobrino (15 años, TEA). Comparte su recorrido por el sistema de educación especial.', color: '#D46A6A' },
]

function AboutCommunity() {
  const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, boxShadow: 'var(--shadow-sm)' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ ...card, padding: 32, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          {Icons.users({ s: 28 })}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Quiénes forman parte de nuestra comunidad</h2>
        <p style={{ fontSize: 15, color: 'var(--fg2)', margin: 0, lineHeight: 1.6, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          Somos personas con discapacidad, familias, cuidadores y profesionales comprometidos con la inclusión. Juntos construimos un ecosistema de apoyo real.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 24 }}>
          {[
            { label: 'Miembros activos', value: '2,400+' },
            { label: 'Grupos', value: '12' },
            { label: 'Historias compartidas', value: '850+' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Members grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {COMMUNITY_MEMBERS.map(m => (
          <div key={m.name} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50% 50% 50% 14%', background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                {m.name[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg1)' }}>{m.name}</div>
                <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{m.role}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>{m.bio}</p>
            <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {Icons.mapPin({ s: 12 })} {m.city}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Mensajes directos ─────────────────────────────────── */
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

  const activeConv = conversations.find(c => c.partner.id === activePartnerId)

  return (
    <div className="grid-messages" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      {/* Lista conversaciones */}
      <div style={{ borderRight: '1px solid var(--border-color)', overflowY: 'auto' }}>
        <div style={{ padding: '16px 16px 12px', fontWeight: 700, fontSize: 13, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>
          Mensajes
        </div>
        {convsLoading ? (
          <div style={{ padding: 20, color: 'var(--fg3)', fontSize: 13 }}>Cargando…</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg3)', fontSize: 13 }}>
            <div style={{ marginBottom: 8 }}>{Icons.message({ s: 24 })}</div>
            Sin conversaciones aún.<br />Escribe a alguien desde la comunidad.
          </div>
        ) : (
          conversations.map(conv => (
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

      {/* Panel de chat */}
      {activePartnerId ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: 15, color: 'var(--fg1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
              {(activeConv?.partner.full_name?.[0] ?? '?').toUpperCase()}
            </div>
            {activeConv?.partner.full_name ?? 'Usuario'}
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
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Escribe un mensaje…"
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
          <span>Selecciona una conversación para chatear</span>
        </div>
      )}
    </div>
  )
}

export default function SocialPage() {
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [newPost, setNewPost] = useState('')
  const [mainTab, setMainTab] = useState('community') // community | messages | about

  const { user, logout } = useAuthStore()
  const { data: groups = [] } = useGroups()
  const { data: posts = [], isLoading: postsLoading } = usePosts(activeGroupId)
  const createPost = useCreatePost()
  const toggleLike = useToggleLike()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newPost.trim() || createPost.isPending) return
    createPost.mutate(
      { content: newPost, group_id: activeGroupId ?? undefined },
      { onSuccess: () => setNewPost('') }
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="social" />
      <TopNav user={user} onLogout={logout} currentPage="social" />

      <main className="responsive-main" style={{ maxWidth: 1060 }}>

        {/* Selector de vista: Comunidad vs Mensajes */}
        <div className="social-tabs" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'community', label: 'Comunidad', icon: Icons.users },
            { key: 'messages', label: 'Mensajes directos', icon: Icons.message },
            { key: 'about', label: 'Quiénes somos', icon: Icons.heart },
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
        {/* ── Left sidebar ── */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: 24,
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--fg3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 12,
            }}
          >
            Grupos <span style={{ fontWeight: 400, fontSize: 12 }}>({groups.length})</span>
          </div>

          {/* "Todos" pseudo-group */}
          <button
            onClick={() => setActiveGroupId(null)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              background: activeGroupId === null ? 'var(--primary-subtle)' : 'transparent',
              color: activeGroupId === null ? 'var(--primary)' : 'var(--fg2)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeGroupId === null ? 700 : 400,
              marginBottom: 4,
              fontFamily: 'var(--font-body)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {Icons.users({ s: 16 })} Todos
          </button>

          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroupId(g.id)}
              title={g.description}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                background: activeGroupId === g.id ? 'var(--primary-subtle)' : 'transparent',
                color: activeGroupId === g.id ? 'var(--primary)' : 'var(--fg2)',
                cursor: 'pointer',
                marginBottom: 2,
                fontFamily: 'var(--font-body)',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: activeGroupId === g.id ? 700 : 500,
                  marginBottom: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {g.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: activeGroupId === g.id ? 'var(--primary)' : 'var(--fg3)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  opacity: 0.85,
                }}
              >
                {g.member_count} miembro{g.member_count !== 1 ? 's' : ''}
                {g.description ? ` · ${g.description}` : ''}
              </div>
            </button>
          ))}
        </div>

        {/* ── Main column ── */}
        <div>
          {/* Compose box */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
              boxShadow: 'var(--shadow-sm)',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <Avatar name={user?.name} src={user?.avatar_url} />
              <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                <textarea
                  rows={3}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="¿Qué quieres compartir con la comunidad?"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 15,
                    resize: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--fg1)',
                    background: 'var(--bg-warm)',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!newPost.trim() || createPost.isPending}
                    style={{ fontSize: 15, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {createPost.isPending ? 'Publicando…' : 'Publicar'}
                    {Icons.send({ s: 16 })}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Post feed */}
          {postsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : posts.length === 0 ? (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: 48,
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                {Icons.message({ s: 24 })}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
                Sé el primero en escribir en este grupo
              </h3>
              <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0 }}>
                Comparte experiencias, preguntas o recursos con la comunidad
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => toggleLike.mutate(post.id)}
              />
            ))
          )}
        </div>
        </div>
        )}
      </main>
    </div>
  )
}
