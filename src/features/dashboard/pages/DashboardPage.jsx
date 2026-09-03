import { useMemo, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMe, useProfile } from '@features/auth'
import { useRecomendaciones, useRecomendacionesEspecialistas, useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import { useInstitutions } from '@features/institutions/hooks/useInstitutions'
import { useFavoriteIds, useToggleFavorite } from '../../favorites/hooks/useFavorites'
import { useRegistrarInteraccion, useInteraccionesPesos } from '@features/institutions/hooks/useInteractions'
import { usePosts, useToggleLike, useForos } from '@features/social'
import { Icons, CATEGORY_COLORS } from '@shared/components/shared'
import { resolveCategoryWeights, getEngagementWeights, trackEngagement } from '@shared/lib/feedPreferences'
import { CommunityPostCard, ForumFeedCard, FeedItemSkeleton } from './FeedCards'
import { NextStepsCard, ProfileSummaryCard } from '../components/AICards'
import ProfileCompletionModal from '../components/ProfileCompletionModal'
import { useEstadoValidacion } from '@features/profile/hooks/useDocumentoIdentidad'

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
   FeedCard — Reddit/TikTok-style institution card
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
            flexShrink: 0, overflow: 'hidden',
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
        {inst.final_score != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 20,
            background: 'rgba(34, 155, 88, 0.08)', color: '#229B58',
            fontSize: 13, fontWeight: 600,
          }}>
            {Icons.sparkles({ s: 13 })} {Math.round(inst.final_score * 100)}% match
          </span>
        )}
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
   Score an item using interest→category mapping + engagement
   ═══════════════════════════════════════════════════════════ */
function scoreItem(item, interests = [], interestWeights = {}, engagementWeights = {}) {
  let score = 0
  const cat = String(item?._category ?? '').toLowerCase()

  // 1. Category match from registration interests
  if (interestWeights?.[cat]) {
    score += interestWeights[cat] * 10
  }

  // 2. Engagement boost from saves/clicks
  if (engagementWeights?.[cat]) {
    score += engagementWeights[cat]
  }

  // 3. Text-level matching (fallback for granular interests)
  const name = String(item?._title ?? item?.name ?? '').toLowerCase()
  const desc = String(item?._description ?? item?.description ?? item?.content ?? item?.preguntaDetonante ?? '').toLowerCase()

  if (Array.isArray(interests)) {
    for (const interest of interests) {
      const i = typeof interest === 'string' ? interest.toLowerCase() : ''
      if (i && name.includes(i)) score += 5
      if (i && desc.includes(i)) score += 3
    }
  }

  // 4. Popularity boost (likes + comments + responses)
  score += (Number(item?._likes) || 0) * 2
  score += (Number(item?._comments) || 0) * 1.5

  // 5. Recency boost (newer = higher score)
  const age = item?._createdAt ? (Date.now() - new Date(item._createdAt).getTime()) / (1000 * 60 * 60) : 999
  if (age < 1) score += 20       // < 1 hour
  else if (age < 24) score += 10  // < 1 day
  else if (age < 72) score += 5   // < 3 days

  return score
}

/* ═══════════════════════════════════════════════════════════
   BehaviorWeightsCard — Pesos de comportamiento por categoría
   ═══════════════════════════════════════════════════════════ */
function BehaviorWeightsCard() {
  const { data, isLoading } = useInteraccionesPesos()
  const pesos = data?.pesos ?? {}
  const hasAny = Object.values(pesos).some(v => v > 0)

  if (isLoading) return null
  if (!hasAny) return null

  const CATEGORY_CONFIG = {
    funcional: { label: 'Salud', color: '#FF4D68', icon: '❤️' },
    educativo: { label: 'Educación', color: '#3A86FF', icon: '📚' },
    laboral: { label: 'Empleo', color: '#FB8500', icon: '💼' },
    social: { label: 'Comunidad', color: '#FDE674', icon: '🤝' },
  }

  const maxWeight = Math.max(...Object.values(pesos), 1)

  return (
    <div
      className="animate-fade-in-up"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 38, height: 38, borderRadius: '50% 50% 50% 14%',
            background: 'color-mix(in oklch, #FB8500 12%, transparent)',
            color: '#FB8500',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
          {Icons.barChart({ s: 18 })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>
            Tus intereses
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
            Basado en tu actividad de los últimos 30 días
          </div>
        </div>
      </div>

      {/* Weight bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const weight = pesos[key] ?? 0
          const pct = Math.round((weight / maxWeight) * 100)
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{config.icon}</span>
                  {config.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: config.color }}>
                  {weight} pts
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: config.color,
                    borderRadius: 3,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sort tabs configuration
   ═══════════════════════════════════════════════════════════ */
const SORT_TABS = [
  { key: 'relevantes', label: '🔥 Relevantes' },
  { key: 'recientes', label: '🕐 Recientes' },
  { key: 'populares', label: '⭐ Populares' },
]

function sortFeed(items, mode) {
  const sorted = [...items]
  switch (mode) {
    case 'recientes':
      sorted.sort((a, b) => {
        const da = a._createdAt ? new Date(a._createdAt).getTime() : 0
        const db = b._createdAt ? new Date(b._createdAt).getTime() : 0
        return db - da
      })
      break
    case 'populares':
      sorted.sort((a, b) => (b._likes + b._comments * 1.5) - (a._likes + a._comments * 1.5))
      break
    case 'relevantes':
    default:
      sorted.sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
      break
  }
  return sorted
}

/* ═══════════════════════════════════════════════════════════
   DashboardPage — Reddit-style mixed feed
   ═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: profile } = useProfile()
  const { data: onboardingStatus } = useOnboardingStatus()
  const { data: recomendacionesData, isLoading: instLoading, refetch: refetchDiscovery } = useRecomendaciones()
  const { data: allInstitutions = [] } = useInstitutions({})
  // Si las recomendaciones fallan (500), usar TODAS las instituciones como fallback
  const discoveryError = recomendacionesData?._backendError === true
  const recommendations = discoveryError ? allInstitutions : (recomendacionesData?.instituciones ?? [])
  const { data: especialistasData, isLoading: especialistasLoading } = useRecomendacionesEspecialistas()
  const especialistas = especialistasData?.especialistas ?? []
  const { data: posts = [], isLoading: postsLoading } = usePosts({ limite: 20 })
  const { data: foros = [], isLoading: forosLoading } = useForos()
  const { data: favIds = [] } = useFavoriteIds()
  const toggle = useToggleFavorite()
  const toggleLike = useToggleLike()
  const trackInteraccion = useRegistrarInteraccion()
  const [sortMode, setSortMode] = useState('relevantes')
  const { data: user } = useMe()
  const { data: identidadStatus } = useEstadoValidacion()

  // Verificación y validación de identidad
  const isVerified = Boolean(user?.is_verified || identidadStatus?.estado === 'aprobado')
  const isRejected = Boolean(identidadStatus?.estado === 'rechazado')
  const isIncomplete = Boolean(onboardingStatus && !onboardingStatus.onboardingCompleto)

  // Debe salir si fue rechazado por el admin, o si aún no está verificado y su perfil está incompleto.
  // Estado en memoria de componente: al recargar la página vuelve a aparecer si le dio a "Más tarde".
  const [modalDismissed, setModalDismissed] = useState(false)
  const shouldShowProfileModal = !modalDismissed && (isRejected || (!isVerified && isIncomplete))

  const handleDismissModal = () => {
    setModalDismissed(true)
  }

  // ── User interests from localStorage or profile (used silently for sorting)
  const userInterests = (() => {
    try {
      const local = JSON.parse(localStorage.getItem('raices_user_interests') || '[]')
      if (Array.isArray(local) && local.length > 0) return local
    } catch (_) {}
    const profileGoals = profile?.profiling?.goals
    if (Array.isArray(profileGoals)) return profileGoals
    return []
  })()

  // ── Interest-based category weights (from registration)
  const interestWeights = useMemo(() => resolveCategoryWeights(userInterests), [userInterests])

  // ── Engagement weights (from saves/clicks tracked locally)
  const engagementWeights = useMemo(() => getEngagementWeights(), [recommendations])

  // ── Active categories from user's registration interests
  const activeCategories = useMemo(() => {
    const cats = new Set()
    for (const [cat, weight] of Object.entries(interestWeights || {})) {
      if (weight > 0) cats.add(cat)
    }
    return cats
  }, [interestWeights])

  const hasPreferences = activeCategories.size > 0 || userInterests.length > 0

  // ── Build unified feed: normalize all items to a common shape
  const unifiedFeed = useMemo(() => {
    const items = []
    const recs = Array.isArray(recommendations) ? recommendations : []
    const postList = Array.isArray(posts) ? posts : []
    const forumList = Array.isArray(foros) ? foros : []

    // Institutions → filtered by active categories from user interests
    for (const inst of recs) {
      if (!inst) continue
      // If user has preferences, only show institutions matching their categories
      if (hasPreferences && !activeCategories.has(inst.category)) continue

      items.push({
        _type: 'institution',
        _id: `inst-${inst.id}`,
        _score: inst.final_score != null ? inst.final_score * 100 : 0,
        _createdAt: inst.created_at,
        _category: inst.category,
        _title: inst.name,
        _description: inst.description,
        _likes: 0,
        _comments: 0,
        _raw: inst,
      })
    }

    // Community posts → always shown (community is social, everyone sees it)
    // But boost posts if user has social interest
    for (const post of postList) {
      if (!post) continue
      items.push({
        _type: 'post',
        _id: `post-${post.id}`,
        _score: 0,
        _createdAt: post.created_at,
        _category: 'social',
        _title: post.title || '',
        _description: post.content,
        _likes: post.like_count ?? 0,
        _comments: post.comment_count ?? 0,
        _raw: post,
      })
    }

    // Forums → always shown (community content)
    for (const forum of forumList) {
      if (!forum) continue
      items.push({
        _type: 'forum',
        _id: `forum-${forum.id}`,
        _score: 0,
        _createdAt: forum.fechaCreacion,
        _category: 'social',
        _title: forum.titulo,
        _description: forum.preguntaDetonante,
        _likes: 0,
        _comments: forum.respuestasCount ?? 0,
        _raw: forum,
      })
    }

    // Score each item
    for (const item of items) {
      item._score = scoreItem(item, userInterests, interestWeights, engagementWeights)
    }

    return items
  }, [recommendations, posts, foros, userInterests, interestWeights, engagementWeights, activeCategories, hasPreferences])

  // ── Sort the feed
  const feed = useMemo(() => sortFeed(unifiedFeed, sortMode), [unifiedFeed, sortMode])

  // ── Tracking helpers ─────────────────────────────────────────────
  const trackClick = useCallback((inst) => {
    if (inst?.id) {
      trackInteraccion.mutate({ institucionId: inst.id, tipo: 'click_card', categoria: inst.category })
    }
  }, [trackInteraccion])

  const trackVerDetalle = useCallback((inst) => {
    if (inst?.id) {
      trackInteraccion.mutate({ institucionId: inst.id, tipo: 'ver_detalle', categoria: inst.category })
    }
  }, [trackInteraccion])

  const isLoading = (instLoading && !discoveryError) || postsLoading || forosLoading || especialistasLoading
  const hasAnyContent = feed.length > 0

  // ── Track engagement when user saves
  const handleToggleFav = useCallback((inst) => {
    trackEngagement(inst.id, 'save', inst.category)
    toggle.mutate(inst.id)
  }, [toggle])

  return (
    <main className="responsive-main" style={{ '--main-max-width': '800px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* ── Sort Tabs ── */}
        {!isLoading && hasAnyContent && (
          <div className="animate-fade-in-up" style={{
            display: 'inline-flex', background: 'var(--bg-cool)',
            borderRadius: 10, padding: 3, gap: 2, marginBottom: 20,
          }}>
            {SORT_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setSortMode(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 8, border: 'none',
                  background: sortMode === tab.key ? 'var(--bg-surface)' : 'transparent',
                  boxShadow: sortMode === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  color: sortMode === tab.key ? 'var(--fg1)' : 'var(--fg3)',
                  cursor: 'pointer',
                  fontWeight: sortMode === tab.key ? 600 : 500,
                  fontSize: 13.5, fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ── AI Cards ── */}
        {!isLoading && (
          <div style={{ marginBottom: 4 }}>
            <NextStepsCard />
            <ProfileSummaryCard />
            <BehaviorWeightsCard />
          </div>
        )}

        {/* ── Modal popup para completar perfil al iniciar sesión ── */}
        <ProfileCompletionModal
          isOpen={shouldShowProfileModal}
          onboardingStatus={onboardingStatus}
          isRejected={isRejected}
          identidadStatus={identidadStatus}
          onClose={handleDismissModal}
        />

        {/* ── Especialistas Recomendados ── */}
        {!especialistasLoading && especialistas.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                  Especialistas para ti
                </h2>
                <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '2px 0 0' }}>
                  Basados en tu perfil y ubicación
                </p>
              </div>
              <Link to="/explore" style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Ver todos {Icons.arrowRight({ s: 13 })}
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {especialistas.slice(0, 5).map((esp) => (
                <div
                  key={esp.id}
                  onClick={() => trackClick(esp)}
                  style={{
                    minWidth: 200, maxWidth: 240, flex: '0 0 auto',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                    borderRadius: 12, padding: 16,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--primary-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: 'var(--primary)',
                    }}>
                      {esp.nombre?.[0] ?? '?'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {esp.nombre}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {Icons.mapPin({ s: 11 })} {esp.ciudad ?? 'Online'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    {esp.calificacionPromedio != null && esp.calificacionPromedio > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#D4944C' }}>
                        {Icons.star({ s: 12, filled: true })} {esp.calificacionPromedio?.toFixed(1)}
                      </span>
                    )}
                    {esp.modalidad && (
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--bg-cool)', color: 'var(--fg3)', fontSize: 11 }}>
                        {esp.modalidad}
                      </span>
                    )}
                  </div>
                  {esp.final_score != null && (
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--fg3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span>Compatibilidad</span>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{Math.round(esp.final_score * 100)}%</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${esp.final_score * 100}%`, background: 'var(--primary)', borderRadius: 2 }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Institutions Error Banner ── */}
        {discoveryError && (
          <div style={{
            background: 'rgba(220, 53, 69, 0.06)',
            border: '1px solid rgba(220, 53, 69, 0.2)',
            borderRadius: 12, padding: '14px 20px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#DC3545' }}>No se pudieron cargar las recomendaciones</div>
              <div style={{ fontSize: 12, color: 'var(--fg3)' }}>El feed de comunidades sigue disponible más abajo.</div>
            </div>
            <button onClick={() => refetchDiscovery()} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #DC3545', background: 'transparent', color: '#DC3545', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Reintentar
            </button>
          </div>
        )}

        {/* ── Feed ── */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0, 1, 2].map(i => <FeedItemSkeleton key={i} />)}
          </div>
        ) : !hasAnyContent ? (
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
              {!hasPreferences ? 'Personaliza tu feed' : 'Tu feed está vacío'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--fg2)', marginBottom: 20 }}>
              {!hasPreferences
                ? 'Selecciona tus preferencias para ver contenido relevante: instituciones, publicaciones de la comunidad y foros de discusión.'
                : 'No hay contenido que coincida con tus preferencias en este momento.'
              }
            </p>
            <Link to="/profile">
              <button className="btn-primary" style={{ fontSize: 15, padding: '10px 24px' }}>
                {!hasPreferences ? 'Configurar preferencias' : 'Actualizar preferencias'} {Icons.arrowRight({ s: 16 })}
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {feed.map((item, i) => {
              const delay = `${Math.min(i * 0.06, 0.4)}s`

              if (item._type === 'institution') {
                const inst = item._raw
                return (
                  <div key={item._id} className="animate-fade-in-up" style={{ animationDelay: delay }}>
                    <FeedCard
                      inst={inst}
                      isFav={favIds.includes(inst.id)}
                      onToggleFav={() => handleToggleFav(inst)}
                    />
                  </div>
                )
              }

              if (item._type === 'post') {
                return (
                  <div key={item._id} className="animate-fade-in-up" style={{ animationDelay: delay }}>
                    <CommunityPostCard post={item._raw} />
                  </div>
                )
              }

              if (item._type === 'forum') {
                return (
                  <div key={item._id} className="animate-fade-in-up" style={{ animationDelay: delay }}>
                    <ForumFeedCard forum={item._raw} />
                  </div>
                )
              }

              return null
            })}
          </div>
        )}

        {/* ── Footer hint ── */}
        {!isLoading && hasAnyContent && (
          <div style={{
            textAlign: 'center', padding: '32px 0 16px',
            fontSize: 13, color: 'var(--fg3)',
          }}>
            Has visto las {feed.length} publicaciones disponibles
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
