import { Link } from 'react-router-dom'
import { Icons, CATEGORY_COLORS } from '@shared/components/shared'

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */
function timeAgo(dateString) {
  if (!dateString) return null
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  return `${months}mes`
}

const avatarStyle = (extra = {}) => ({
  width: 38, height: 38,
  borderRadius: '50% 50% 50% 14%',
  background: 'var(--primary-subtle)',
  color: 'var(--primary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
  flexShrink: 0, overflow: 'hidden',
  ...extra,
})

/* ═══════════════════════════════════════════════════════════
   CommunityPostCard — Reddit-style post card
   ═══════════════════════════════════════════════════════════ */
export function CommunityPostCard({ post }) {
  return (
    <article
      className="card-hover"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {post.author_avatar ? (
            <div style={avatarStyle()}>
              <img src={post.author_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={avatarStyle()}>
              {(post.author_name?.[0] ?? '?').toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.author_name || 'Anónimo'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '2px 8px', borderRadius: 8,
                background: 'rgba(7, 59, 76, 0.08)',
                color: 'var(--color-comunidad, #073B4C)', fontWeight: 600, fontSize: 11,
              }}>
                r/Comunidad
              </span>
              {post.group_name && <span style={{ color: 'var(--fg3)' }}>· {post.group_name}</span>}
            </div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--fg3)', flexShrink: 0, marginLeft: 8 }}>
          {timeAgo(post.created_at)}
        </span>
      </div>

      {/* Body */}
      <Link to="/social" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{ padding: '4px 22px 16px' }}>
          {post.title && (
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
              color: 'var(--fg1)', margin: '0 0 6px', lineHeight: 1.3,
            }}>
              {post.title}
            </h3>
          )}
          <p style={{
            fontSize: 15, color: 'var(--fg2)', margin: 0, lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.content}
          </p>
        </div>
      </Link>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 22px 16px',
        borderTop: '1px solid var(--border-color)',
      }}>
        <Link to="/social" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 20,
          background: post.liked_by_me ? 'rgba(255, 77, 104, 0.08)' : 'rgba(7, 59, 76, 0.05)',
          color: post.liked_by_me ? '#e04e6e' : 'var(--fg2)',
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
          transition: 'all 0.15s ease',
        }}>
          {Icons.heart({ s: 14, filled: !!post.liked_by_me })}
          {post.like_count ?? 0}
        </Link>

        <Link to="/social" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 20,
          background: 'rgba(7, 59, 76, 0.05)', color: 'var(--fg2)',
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          {Icons.message({ s: 14 })}
          {post.comment_count ?? 0}
        </Link>

        <Link
          to="/social"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 16px', borderRadius: 20,
            background: 'var(--primary)', color: '#fff',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Ver post {Icons.arrowRight({ s: 13 })}
        </Link>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════
   ForumFeedCard — Reddit-style forum/discussion card
   ═══════════════════════════════════════════════════════════ */
export function ForumFeedCard({ forum }) {
  return (
    <article
      className="card-hover"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50% 50% 50% 14%',
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--primary, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {Icons.message({ s: 18 })}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {forum.autorNombre || 'Institución'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '2px 8px', borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary, #6366f1)', fontWeight: 600, fontSize: 11,
              }}>
                💬 Foro
              </span>
            </div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--fg3)', flexShrink: 0, marginLeft: 8 }}>
          {timeAgo(forum.fechaCreacion)}
        </span>
      </div>

      {/* Body */}
      <Link to="/foros" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{ padding: '4px 22px 16px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
            color: 'var(--fg1)', margin: '0 0 8px', lineHeight: 1.3,
          }}>
            {forum.titulo}
          </h3>
          {forum.preguntaDetonante && (
            <div style={{
              padding: '12px 16px', background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.12)', borderRadius: 10,
              fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5,
              fontStyle: 'italic',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              💬 {forum.preguntaDetonante}
            </div>
          )}
        </div>
      </Link>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 22px 16px',
        borderTop: '1px solid var(--border-color)',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 20,
          background: 'rgba(99, 102, 241, 0.08)',
          color: 'var(--primary, #6366f1)',
          fontSize: 13, fontWeight: 600,
        }}>
          {Icons.message({ s: 14 })}
          {forum.respuestasCount} respuesta{forum.respuestasCount !== 1 ? 's' : ''}
        </span>

        <Link
          to="/foros"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 16px', borderRadius: 20,
            background: 'var(--primary)', color: '#fff',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Participar {Icons.arrowRight({ s: 13 })}
        </Link>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════
   FeedCardSkeleton — shared loading skeleton
   ═══════════════════════════════════════════════════════════ */
export function FeedItemSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '55%', height: 14, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '35%', height: 11, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', marginTop: 6 }} />
        </div>
      </div>
      <div style={{ width: '80%', height: 18, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '100%', height: 44, borderRadius: 8, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'flex', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
        {[60, 70, 50].map((w, i) => (
          <div key={i} style={{ width: w, height: 30, borderRadius: 20, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  )
}
