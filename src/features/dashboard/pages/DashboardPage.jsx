import { useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useMe, useProfile } from '@features/auth'
import { useDiscovery } from '@features/institutions'
import { useFavoriteIds, useToggleFavorite } from '../../favorites/hooks/useFavorites'
import { Icons, CATEGORY_COLORS } from '@shared/components/shared'
import BackendFallback from '@shared/components/BackendFallback'
import { DISCOVERY_ENDPOINTS } from '@shared/constants/backendEndpoints'
import { resolveCategoryWeights, getEngagementWeights, trackEngagement } from '@shared/lib/feedPreferences'

/* ═══════════════════════════════════════════════════════════
   Helper: timeAgo
   ═══════════════════════════════════════════════════════════ */
function timeAgo(dateString) {
  if (!dateString) return null
  const now = Date.now()
  const then = new Date(dateString).getTime()
  if (isNaN(then)) return null
  const seconds = Math.floor((now - then) / 1000)
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

/* ═══════════════════════════════════════════════════════════
   Helper: map category → friendly badge
   ═══════════════════════════════════════════════════════════ */
const CATEGORY_BADGE_LABEL = {
  funcional: 'Salud',
  educativo: 'Educación',
  laboral: 'Empleo',
  social: 'Comunidad',
  Salud: 'Salud',
  Terapia: 'Salud',
  Educación: 'Educación',
  Empleo: 'Empleo',
  Comunidad: 'Comunidad',
  Recreación: 'Comunidad',
}

/* ═══════════════════════════════════════════════════════════
   Helper: get emoji by category
   ═══════════════════════════════════════════════════════════ */
const getCategoryEmoji = (category) => {
  const normalized = (category ?? '').toLowerCase()
  if (normalized.includes('salud') || normalized.includes('terapia') || normalized === 'funcional') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
        <path d="M12 19.5 C12 19.5, 5 14, 5 9 C5 5.8, 7 3.5, 9.8 3.5 C11.2 3.5, 11.8 4.2, 12 5 C12.2 4.2, 12.8 3.5, 14.2 3.5 C17 3.5, 19 5.8, 19 9 C19 14, 12 19.5, 12 19.5 Z" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="9.5" cy="8.5" r="1" fill="#0C3B4B" />
        <circle cx="14.5" cy="8.5" r="1" fill="#0C3B4B" />
        <path d="M10 11.5 C11 13, 13 13, 14 11.5" fill="none" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }
  if (normalized.includes('educa') || normalized === 'educativo') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
        <path d="M12 4 L18 8 L18 12" stroke="#FFB703" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="18" cy="13" r="1.5" fill="#FFB703" stroke="#0C3B4B" strokeWidth="1" />
        <path d="M7 10 L7 14 C7 16, 17 16, 17 14 L17 10 Z" fill="#10B981" stroke="#0C3B4B" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="12,3 21,7.5 12,12 3,7.5" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="10" cy="12.5" r="0.8" fill="#FFFFFF" />
        <circle cx="14" cy="12.5" r="0.8" fill="#FFFFFF" />
        <path d="M11 14 C11.5 14.8, 12.5 14.8, 13 14" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )
  }
  if (normalized.includes('empleo') || normalized.includes('laboral')) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
        <path d="M9 5 C9 3.5, 15 3.5, 15 5" fill="none" stroke="#0C3B4B" strokeWidth="2" strokeLinecap="round" />
        <rect x="4" y="6" width="16" height="12" rx="3" fill="#FB8500" stroke="#0C3B4B" strokeWidth="2" />
        <rect x="11" y="9" width="2" height="3" rx="0.5" fill="#FFB703" stroke="#0C3B4B" strokeWidth="1.2" />
        <circle cx="8" cy="11.5" r="0.9" fill="#0C3B4B" />
        <circle cx="16" cy="11.5" r="0.9" fill="#0C3B4B" />
        <path d="M10.5 14 C11.5 15, 12.5 15, 13.5 14" fill="none" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }
  // Default to social/comunidad/recreación
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
      <circle cx="9.5" cy="12" r="6.2" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2" />
      <circle cx="7.5" cy="10.5" r="0.8" fill="#FFFFFF" />
      <circle cx="11.5" cy="10.5" r="0.8" fill="#FFFFFF" />
      <path d="M8.5 13.5 C9 14.5, 10 14.5, 10.5 13.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="15.5" cy="12" r="6.2" fill="#FDE674" stroke="#0C3B4B" strokeWidth="2" />
      <circle cx="13.5" cy="10.5" r="0.8" fill="#0C3B4B" />
      <circle cx="17.5" cy="10.5" r="0.8" fill="#0C3B4B" />
      <path d="M14.5 13.5 C15 14.5, 16 14.5, 16.5 13.5" fill="none" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════
   FeedCard — Reddit/TikTok-style post card
   ═══════════════════════════════════════════════════════════ */
function FeedCard({ inst, isFav, onToggleFav }) {
  const color = CATEGORY_COLORS[inst.category] ?? 'var(--primary)'
  const badgeLabel = CATEGORY_BADGE_LABEL[inst.category] ?? inst.category ?? 'Institución'
  const hasImage = inst.cover_url || inst.photos?.[0]

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
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50% 50% 50% 14%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            ...(inst.logo_url ? {
              background: `color-mix(in oklch, ${color} 14%, transparent)`,
              border: 'none',
            } : {
              background: '#FBF6EE',
              border: '1px solid #EFE5D8',
            })
          }}>
            {inst.logo_url ? (
              <img src={inst.logo_url} alt="" style={{ width: 42, height: 42, borderRadius: 'inherit', objectFit: 'cover' }} />
            ) : (
              getCategoryEmoji(inst.category)
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 15, fontWeight: 700, color: 'var(--fg1)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {inst.name}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '2px 8px', borderRadius: 8,
                background: `color-mix(in oklch, ${color} 12%, transparent)`,
                color, fontWeight: 600, fontSize: 11.5,
              }}>
                r/{badgeLabel}
              </span>
              {inst.city && <span style={{ color: 'var(--fg3)' }}>· {inst.city}</span>}
            </div>
          </div>
        </div>
        {inst.created_at && (
          <span style={{ fontSize: 12.5, color: 'var(--fg3)', flexShrink: 0, marginLeft: 8 }}>
            {timeAgo(inst.created_at)}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <Link to={`/institution/${inst.id}`} onClick={() => trackEngagement(inst.id, 'click_card', inst.category)} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{ padding: '4px 24px 18px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
            color: 'var(--fg1)', margin: '0 0 8px', lineHeight: 1.3,
          }}>
            {inst.name}
          </h3>
          {inst.description && (
            <p style={{
              fontSize: 15.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.55,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {inst.description}
            </p>
          )}
        </div>

        {hasImage && (
          <div style={{ padding: '0 24px 18px' }}>
            <div style={{
              borderRadius: 12, overflow: 'hidden',
              background: 'var(--bg-cool)', maxHeight: 280,
            }}>
              <img
                src={inst.cover_url || inst.photos?.[0]}
                alt={inst.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: 280 }}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </Link>

      {/* ── Footer (Interaction) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 24px 20px',
        borderTop: '1px solid var(--border-color)',
      }}>
        {inst.rating_avg != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 20,
            background: 'rgba(212, 148, 76, 0.08)', color: '#D4944C',
            fontSize: 14, fontWeight: 600,
          }}>
            {Icons.star({ s: 15, filled: true })}
            {inst.rating_avg?.toFixed(1) ?? '—'}
            <span style={{ color: 'var(--fg3)', fontWeight: 400 }}>({inst.rating_count ?? 0})</span>
          </span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); onToggleFav() }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 20,
            background: isFav ? 'rgba(255, 77, 104, 0.08)' : 'rgba(7, 59, 76, 0.05)',
            color: isFav ? 'var(--color-coral)' : 'var(--fg2)',
            fontSize: 14, fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'all 0.15s ease',
          }}
        >
          {Icons.heart({ s: 15, filled: isFav })}
          {isFav ? 'Guardado' : 'Guardar'}
        </button>

        {(inst.city || inst.state) && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 20,
            background: 'rgba(7, 59, 76, 0.05)', color: 'var(--fg2)',
            fontSize: 14,
          }}>
            {Icons.mapPin({ s: 15 })}
            {inst.city}{inst.city && inst.state ? ', ' : ''}{inst.state}
          </span>
        )}

        <Link
          to={`/institution/${inst.id}`}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '8px 18px', borderRadius: 20,
            background: 'var(--primary)', color: '#fff',
            fontSize: 14, fontWeight: 700, textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Ver más {Icons.arrowRight({ s: 15 })}
        </Link>
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════
   FeedCard Skeleton
   ═══════════════════════════════════════════════════════════ */
function FeedCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: '60%', height: 15, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', marginTop: 6 }} />
        </div>
      </div>
      <div style={{ width: '85%', height: 20, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ width: '100%', height: 52, borderRadius: 8, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'flex', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
        {[65, 75, 55].map((w, i) => (
          <div key={i} style={{ width: w, height: 32, borderRadius: 20, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Score an item using interest→category mapping + engagement
   ═══════════════════════════════════════════════════════════ */
function scoreItem(item, interests, interestWeights, engagementWeights) {
  let score = 0
  const cat = (item.category ?? '').toLowerCase()

  // 1. Category match from registration interests
  if (interestWeights[cat]) {
    score += interestWeights[cat] * 10
  }

  // 2. Engagement boost from saves/clicks
  if (engagementWeights[cat]) {
    score += engagementWeights[cat]
  }

  // 3. Text-level matching (fallback for granular interests)
  const name = (item.name ?? '').toLowerCase()
  const desc = (item.description ?? '').toLowerCase()
  const services = (item.services ?? []).map(s => typeof s === 'string' ? s.toLowerCase() : '').join(' ')

  for (const interest of interests) {
    const i = interest.toLowerCase()
    if (name.includes(i)) score += 5
    if (desc.includes(i)) score += 3
    if (services.includes(i)) score += 2
  }

  return score
}

/* ═══════════════════════════════════════════════════════════
   DashboardPage — Reddit-style feed
   ═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: profile } = useProfile()
  const { data: recommendations = [], isLoading, isError: discoveryError, refetch: refetchDiscovery } = useDiscovery()
  const { data: favIds = [] } = useFavoriteIds()
  const toggle = useToggleFavorite()

  // ── User interests from localStorage or profile (used silently for sorting)
  const userInterests = (() => {
    try {
      const local = JSON.parse(localStorage.getItem('raices_user_interests') || '[]')
      if (local && local.length > 0) return local
    } catch (_) {}
    return profile?.profiling?.goals || []
  })()

  // ── Interest-based category weights (from registration)
  const interestWeights = useMemo(() => resolveCategoryWeights(userInterests), [userInterests])

  // ── Engagement weights (from saves/clicks tracked locally)
  const engagementWeights = useMemo(() => getEngagementWeights(), [recommendations])

  // ── Feed: sorted by combined interest + engagement relevance
  const feed = useMemo(() => {
    const items = [...recommendations]
    items.sort((a, b) => scoreItem(b, userInterests, interestWeights, engagementWeights) - scoreItem(a, userInterests, interestWeights, engagementWeights))
    return items
  }, [recommendations, userInterests, interestWeights, engagementWeights])

  // ── Track engagement when user saves
  const handleToggleFav = useCallback((inst) => {
    const isFav = favIds.includes(inst.id)
    trackEngagement(inst.id, 'save', inst.category)
    toggle.mutate(inst.id)
  }, [favIds, toggle])

  return (
    <main className="responsive-main" style={{ '--main-max-width': '800px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* ── Feed ── */}
        {discoveryError ? (
          <BackendFallback method={DISCOVERY_ENDPOINTS.SEARCH.method} endpoint={DISCOVERY_ENDPOINTS.SEARCH.path} onRetry={() => refetchDiscovery()} />
        ) : isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0, 1, 2].map(i => <FeedCardSkeleton key={i} />)}
          </div>
        ) : feed.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: 48, textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--primary-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              {Icons.sparkles({ s: 24 })}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
              Tu feed está vacío
            </h3>
            <p style={{ fontSize: 14, color: 'var(--fg2)', marginBottom: 20 }}>
              Completa tu perfil para recibir recomendaciones personalizadas.
            </p>
            <Link to="/profile">
              <button className="btn-primary" style={{ fontSize: 15, padding: '10px 24px' }}>
                Completar perfil {Icons.arrowRight({ s: 16 })}
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {feed.map((inst, i) => (
              <div
                key={inst.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 0.06, 0.4)}s` }}
              >
                <FeedCard
                  inst={inst}
                  isFav={favIds.includes(inst.id)}
                  onToggleFav={() => handleToggleFav(inst)}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Footer hint ── */}
        {!isLoading && feed.length > 0 && (
          <div style={{
            textAlign: 'center', padding: '32px 0 16px',
            fontSize: 13, color: 'var(--fg3)',
          }}>
            Has visto las {feed.length} recomendaciones disponibles
            <br />
            <Link to="/explore" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              Explorar más instituciones {Icons.arrowRight({ s: 12 })}
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}
