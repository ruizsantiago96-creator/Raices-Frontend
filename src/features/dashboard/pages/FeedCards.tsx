import { Link } from 'react-router-dom'
import { Icons, TextToSpeechButton } from '@shared/components/shared'
import type { CommunityPost } from '@/types/social'

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */
function timeAgo(dateString?: string | number | null) {
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
   Helper: Extract image from content
   ═══════════════════════════════════════════════════════════ */
function decodeAndExtract(content: string) {
  if (!content) return { text: '', imageUrl: null }
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
    return { text, imageUrl }
  }
  
  return { text: decoded, imageUrl: null }
}

/* ═══════════════════════════════════════════════════════════
   CommunityPostCard — Reddit-style post card
   ═══════════════════════════════════════════════════════════ */
export function CommunityPostCard({ post }: { post: CommunityPost }) {
  const { text, imageUrl } = decodeAndExtract(post.content)

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
          {text && (
            <p style={{
              fontSize: 15, color: 'var(--fg2)', margin: 0, lineHeight: 1.55,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              whiteSpace: 'pre-wrap'
            }}>
              {text}
            </p>
          )}
          {imageUrl && (
            <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-cool)', display: 'flex', justifyContent: 'center' }}>
              <img src={imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: 350, objectFit: 'contain', display: 'block' }} loading="lazy" />
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
        <Link to="/social" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8,
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
          padding: '7px 14px', borderRadius: 8,
          background: 'rgba(7, 59, 76, 0.05)', color: 'var(--fg2)',
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          {Icons.message({ s: 14 })}
          {post.comment_count ?? 0}
        </Link>

        {text && <TextToSpeechButton text={`${post.title ? post.title + '. ' : ''}${text}`} size="sm" />}

        <Link
          to="/social"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 16px', borderRadius: 'var(--radius-btn)',
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
export interface ForumFeedCardItem {
  id?: string | number
  titulo: string
  autorNombre?: string
  fechaCreacion?: string
  preguntaDetonante?: string
  respuestasCount?: number
  [key: string]: unknown
}

export function ForumFeedCard({ forum }: { forum: ForumFeedCardItem }) {
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
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary, #6366f1)', fontWeight: 600, fontSize: 11,
              }}>
                {Icons.message({ s: 12 })} Foro
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
          padding: '7px 14px', borderRadius: 8,
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
            padding: '7px 16px', borderRadius: 'var(--radius-btn)',
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
          <div key={i} style={{ width: w, height: 30, borderRadius: 8, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   RouteRecommendationCard — Cards recommended by user's active route
   ═══════════════════════════════════════════════════════════ */
export interface RouteRecommendationItem {
  tipo: 'institucion' | 'vacante' | string
  id: string | number
  titulo: string
  categoria?: string
  categoriaLabel?: string
  distancia?: string
  modalidad?: string
  ciudad?: string
  pasoActualTitulo?: string
  [key: string]: unknown
}

export function RouteRecommendationCard({ item }: { item: RouteRecommendationItem }) {
  const isInst = item.tipo === 'institucion'
  const isVac = item.tipo === 'vacante'
  const link = isInst ? `/instituciones/${item.id}` : `/empleo`

  return (
    <article
      className="card-hover"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderLeft: '5px solid var(--primary)',
        borderRadius: 16,
        padding: '20px 22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 8,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {Icons.milestone({ s: 13, color: 'var(--primary)' })} Recomendado por tu Ruta activa
          </span>
          {item.pasoActualTitulo && (
            <span style={{ fontSize: 13, color: 'var(--fg2)', fontWeight: 600 }}>
              Paso actual: <strong style={{ color: 'var(--fg1)' }}>{item.pasoActualTitulo}</strong>
            </span>
          )}
        </div>
        <span style={{ fontSize: 12.5, color: 'var(--fg3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {isInst ? (
            <>{Icons.building({ s: 13 })} Institución aliada</>
          ) : (
            <>{Icons.briefcase({ s: 13 })} Empleo inclusivo</>
          )}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', lineHeight: 1.3 }}>
            {item.titulo}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--fg2)' }}>
            {isInst && (
              <>
                <span style={{ padding: '3px 9px', borderRadius: 6, background: 'var(--bg-warm)', fontWeight: 600 }}>
                  {item.categoriaLabel ?? item.categoria ?? 'General'}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {Icons.mapPin({ s: 12 })} {item.distancia ?? 'en tu ciudad'}
                </span>
              </>
            )}
            {isVac && (
              <>
                <span style={{ padding: '3px 9px', borderRadius: 6, background: 'var(--bg-warm)', fontWeight: 600 }}>
                  Modalidad: {item.modalidad ?? 'Presencial'}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {Icons.mapPin({ s: 12 })} {item.ciudad ?? 'En tu zona'}
                </span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TextToSpeechButton
            text={`${item.titulo}. Recomendado por tu ruta de desarrollo. ${item.pasoActualTitulo ? 'Paso actual: ' + item.pasoActualTitulo + '. ' : ''}${isInst ? (item.categoriaLabel || item.categoria || '') + ' en tu ciudad' : 'Vacante ' + (item.modalidad || '')}`}
            size="sm"
          />
          <Link
            to={link}
            aria-label={`${isInst ? 'Ver Institución' : 'Ver Vacante'} ${item.titulo}`}
            style={{
              minHeight: 44,
              padding: '9px 18px',
              borderRadius: 'var(--radius-btn)',
              background: 'var(--primary)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 3px 10px rgba(34,155,88,0.2)',
            }}
          >
            {isInst ? 'Ver Institución' : 'Ver Vacante'} {Icons.arrowRight({ s: 13 })}
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════
   CommunityHighlightCard — Accessible invitation to Conectemos
   ═══════════════════════════════════════════════════════════ */
export function CommunityHighlightCard({ postCount }: { postCount?: number }) {
  return (
    <article
      className="card-hover animate-fade-in-up"
      style={{
        background: 'linear-gradient(135deg, rgba(7, 59, 76, 0.04) 0%, rgba(34, 155, 88, 0.08) 100%)',
        border: '1px solid var(--border-color)',
        borderLeft: '5px solid #073B4C',
        borderRadius: 16,
        padding: '22px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 10,
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260, flex: 1 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50% 50% 50% 14%',
            background: 'rgba(7, 59, 76, 0.1)',
            color: '#073B4C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {Icons.message({ s: 22 })}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>
              Comunidad Conectemos
            </h3>
            {postCount && postCount > 0 ? (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                {postCount} aportes
              </span>
            ) : null}
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg2)', lineHeight: 1.4 }}>
            Comparte tus experiencias, creaciones artísticas, únete a foros de apoyo con la comunidad y descubre eventos inclusivos.
          </p>
        </div>
      </div>

      <Link
        to="/social"
        aria-label="Ir al espacio social Conectemos"
        style={{
          minHeight: 44,
          padding: '10px 20px',
          borderRadius: 'var(--radius-btn)',
          background: '#073B4C',
          color: '#fff',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 3px 10px rgba(7, 59, 76, 0.2)',
          whiteSpace: 'nowrap',
        }}
      >
        Ir a Conectemos {Icons.arrowRight({ s: 14 })}
      </Link>
    </article>
  )
}
