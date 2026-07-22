import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useInstitution } from '../hooks/useInstitutions'
import { useFavoriteIds, useToggleFavorite } from '../../favorites/hooks/useFavorites'
import { useReviews, useSubmitReview } from '../hooks/useReviews'
import { useChat } from '../../tutor/hooks/useAI'
import { useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { CategoryTag, Icons, CATEGORY_COLORS } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const AVATAR_COLORS = [
  '#C4789A', '#8B6BAE', '#D4944C', '#7BA05B',
  '#4BA3A3', '#01ADFF', '#5A6C8C',
]

function avatarColor(name = '') {
  const code = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function StarRow({ rating, size = 16, interactive = false, onPick, hover, onHover }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const active = interactive
          ? n <= (hover ?? rating)
          : n <= Math.round(rating ?? 0)
        return (
          <button
            key={n}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onPick(n) : undefined}
            onMouseEnter={interactive ? () => onHover(n) : undefined}
            onMouseLeave={interactive ? () => onHover(null) : undefined}
            style={{
              background: 'none',
              border: 'none',
              padding: 2,
              cursor: interactive ? 'pointer' : 'default',
              color: active ? '#D4944C' : 'var(--border-color)',
              fontSize: 0,
              lineHeight: 0,
              display: 'inline-flex',
            }}
          >
            {Icons.star({ s: size, filled: active })}
          </button>
        )
      })}
    </div>
  )
}

/* ─── loading skeleton ────────────────────────────────────────────────────── */

function Skeleton({ w = '100%', h = 18, radius = 6, mb = 0 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--border-color) 25%, color-mix(in oklch, var(--border-color) 60%, white) 50%, var(--border-color) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      marginBottom: mb,
    }} />
  )
}

const shimmerStyle = `
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`

/* ─── InstitutionPage ─────────────────────────────────────────────────────── */

export default function InstitutionPage() {
  const { id } = useParams()
  const { data: institution, isLoading } = useInstitution(id)
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id)
  const { data: rawFavIds } = useFavoriteIds()
  const toggle = useToggleFavorite()
  const submitReview = useSubmitReview(id)
  const chat = useChat()
  const { user, logout } = useAuthStore()
  const { addToast } = useUiStore()

  // Normalise favoriteIds — API may return an array or a Set
  const favoriteIds = rawFavIds instanceof Set
    ? rawFavIds
    : new Set(Array.isArray(rawFavIds) ? rawFavIds.map(String) : [])

  // Review form state
  const [rating, setRating] = useState(5)
  const [starHover, setStarHover] = useState(null)
  const [comment, setComment] = useState('')

  // AI chat state
  const [aiInput, setAiInput] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, chat.isPending])

  /* ── handlers ── */

  const handleSendAi = async (e) => {
    e.preventDefault()
    const msg = aiInput.trim()
    if (!msg || chat.isPending) return
    setAiInput('')
    const userMsg = { role: 'user', content: msg }
    const nextHistory = [...chatHistory, userMsg]
    setChatHistory(nextHistory)
    try {
      const res = await chat.mutateAsync({ message: msg, history: chatHistory })
      const aiMsg = { role: 'assistant', content: res.response ?? res.reply ?? '...' }
      setChatHistory(h => [...h, aiMsg])
    } catch {
      setChatHistory(h => [
        ...h,
        { role: 'assistant', content: 'Hubo un error al conectar con el asistente. Intenta de nuevo.' },
      ])
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      addToast('Debes iniciar sesión para dejar una reseña.', 'warning')
      return
    }
    try {
      await submitReview.mutateAsync({ rating, comment })
      setRating(5)
      setComment('')
      addToast('¡Reseña publicada con éxito!', 'success')
    } catch {
      addToast('No se pudo publicar la reseña. Intenta de nuevo.', 'error')
    }
  }

  /* ── loading / not-found states ── */

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
        <style>{shimmerStyle}</style>
        <AppSidebar currentPage="explore" />
        <TopNav user={user} onLogout={logout} currentPage="explore" />
        <main className="responsive-main" style={{ maxWidth: 860 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 32, boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
            <Skeleton w={80} h={24} radius={12} mb={20} />
            <Skeleton w="60%" h={36} mb={12} />
            <Skeleton w={140} h={16} mb={10} />
            <Skeleton w="90%" h={16} mb={6} />
            <Skeleton w="75%" h={16} mb={20} />
            <div style={{ display: 'flex', gap: 12 }}>
              <Skeleton w={100} h={32} radius={16} />
              <Skeleton w={120} h={32} radius={16} />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!institution) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--fg2)', marginBottom: 16, fontSize: 16 }}>Institución no encontrada.</p>
          <Link to="/explore">
            <button className="btn-primary">Volver a explorar</button>
          </Link>
        </div>
      </div>
    )
  }

  const categoryColor = CATEGORY_COLORS[institution.category] ?? 'var(--primary)'
  const isFav = favoriteIds.has(String(institution.id))

  /* ── render ── */

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <style>{shimmerStyle}</style>
      <AppSidebar currentPage="explore" />
      <TopNav user={user} onLogout={logout} currentPage="explore" />

      <main className="responsive-main" style={{ maxWidth: 860 }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14, color: 'var(--fg3)' }}>
          <Link to="/explore" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Explorar
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--fg2)' }}>{institution.name}</span>
        </div>

        {/* ── 1. Header card ── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: 32,
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 24,
        }}>
          {/* Top row: tags + save button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <CategoryTag label={institution.category} color={categoryColor} />
              {institution.plan_type === 'premium' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                  background: 'color-mix(in oklch, #D4944C 15%, transparent)',
                  color: '#D4944C', fontSize: 12, fontWeight: 700,
                }}>
                  {Icons.star({ s: 12, filled: true })} Premium
                </span>
              )}
            </div>
            <button
              onClick={() => toggle.mutate(institution.id)}
              disabled={toggle.isPending}
              style={{
                background: isFav
                  ? 'color-mix(in oklch, #C4789A 12%, transparent)'
                  : 'var(--bg-warm)',
                border: `1px solid ${isFav ? '#C4789A' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-pill)',
                cursor: toggle.isPending ? 'wait' : 'pointer',
                color: isFav ? '#C4789A' : 'var(--fg3)',
                padding: '8px 18px',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s ease',
              }}
            >
              {Icons.heart({ s: 16, filled: isFav })}
              {isFav ? 'Guardado' : 'Guardar'}
            </button>
          </div>

          {/* Name */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30, fontWeight: 700,
            color: 'var(--fg1)', margin: '0 0 8px',
          }}>
            {institution.name}
          </h1>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--fg3)', marginBottom: 12 }}>
            {Icons.mapPin({ s: 16 })}
            {institution.address ? `${institution.address}, ` : ''}
            {institution.city}{institution.state ? `, ${institution.state}` : ''}
          </div>

          {/* Rating summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <StarRow rating={institution.rating_avg ?? 0} size={16} />
            <span style={{ color: 'var(--fg1)', fontWeight: 700, fontSize: 15 }}>
              {institution.rating_avg?.toFixed(1) ?? '—'}
            </span>
            <span style={{ color: 'var(--fg3)', fontSize: 13 }}>
              ({institution.rating_count ?? 0} reseñas)
            </span>
          </div>

          {/* Description */}
          {institution.description && (
            <p style={{ fontSize: 15, color: 'var(--fg2)', lineHeight: 1.7, margin: '0 0 20px' }}>
              {institution.description}
            </p>
          )}

          {/* Disability types */}
          {institution.disability_types?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {institution.disability_types.map(type => (
                <span key={type} style={{
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 12, fontWeight: 600,
                  background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
                  color: 'var(--primary)',
                  border: '1px solid color-mix(in oklch, var(--primary) 25%, transparent)',
                }}>
                  {type}
                </span>
              ))}
            </div>
          )}

          {/* Contact info */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {institution.phone && (
              <a href={`tel:${institution.phone}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 14, color: 'var(--fg2)', textDecoration: 'none',
              }}>
                {Icons.phone({ s: 16 })} {institution.phone}
              </a>
            )}
            {institution.email && (
              <a href={`mailto:${institution.email}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 14, color: 'var(--fg2)', textDecoration: 'none',
              }}>
                {Icons.mail({ s: 16 })} {institution.email}
              </a>
            )}
            {institution.website && (
              <a href={institution.website} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 14, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none',
              }}>
                {Icons.globe({ s: 16 })} Sitio web
              </a>
            )}
          </div>

          {/* Mapa y cómo llegar */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {Icons.mapPin({ s: 18 })} Ubicación
              </span>
              <a
                href={institution.lat && institution.lng
                  ? `https://www.google.com/maps/dir/?api=1&destination=${institution.lat},${institution.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([institution.address, institution.city, institution.state, 'México'].filter(Boolean).join(', '))}`
                }
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--primary)', color: '#fff',
                  padding: '10px 20px', borderRadius: 'var(--radius-pill)',
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                }}
              >
                {Icons.mapPin({ s: 15 })} Cómo llegar
              </a>
            </div>
            {institution.lat && institution.lng ? (
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', height: 220 }}>
                <iframe
                  title={`Mapa de ${institution.name}`}
                  width="100%"
                  height="220"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${institution.lng - 0.01},${institution.lat - 0.01},${institution.lng + 0.01},${institution.lat + 0.01}&layer=mapnik&marker=${institution.lat},${institution.lng}`}
                />
              </div>
            ) : (
              <div style={{ padding: '12px 16px', background: 'var(--bg-warm)', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icons.mapPin({ s: 15 })}
                {[institution.address, institution.city, institution.state].filter(Boolean).join(', ') || 'Dirección no disponible'}
              </div>
            )}
          </div>
        </div>

        {/* ── 2. AI Chat panel ── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 24,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 38, height: 38,
              borderRadius: '50% 50% 50% 14%',
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {Icons.sparkles({ s: 18 })}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>
                Asistente IA
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
                Pregunta sobre {institution.name}
              </div>
            </div>
          </div>

          {/* Message area */}
          <div style={{
            background: 'var(--bg-warm)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            height: 240,
            overflowY: 'auto',
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {chatHistory.length === 0 && !chat.isPending && (
              <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Prueba: &ldquo;¿Atienden TEA?&rdquo;, &ldquo;¿Cuáles son sus horarios?&rdquo;, &ldquo;¿Tienen transporte accesible?&rdquo;
              </p>
            )}

            {chatHistory.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <span style={{
                  background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
                  color: m.role === 'user' ? 'white' : 'var(--fg1)',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '10px 16px',
                  fontSize: 14,
                  maxWidth: '78%',
                  border: m.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  lineHeight: 1.55,
                  wordBreak: 'break-word',
                }}>
                  {m.content}
                </span>
              </div>
            ))}

            {chat.isPending && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg3)', fontSize: 13 }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-flex' }}>
                  {Icons.loader({ s: 14 })}
                </span>
                Pensando...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendAi} style={{ display: 'flex', gap: 10 }}>
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              style={{
                flex: 1, height: 44,
                padding: '0 16px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 15,
                fontFamily: 'var(--font-body)',
                color: 'var(--fg1)',
                outline: 'none',
                background: 'var(--bg-surface)',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0 20px', fontSize: 15, display: 'flex', alignItems: 'center' }}
              disabled={chat.isPending || !aiInput.trim()}
            >
              {Icons.send({ s: 18 })}
            </button>
          </form>
        </div>

        {/* ── 3 & 4. Reviews section ── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20, fontWeight: 700,
            color: 'var(--fg1)',
            margin: '0 0 20px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {Icons.star({ s: 20, filled: true })} Reseñas
            <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--fg3)' }}>
              ({reviews.length})
            </span>
          </h2>

          {/* ── 3. Review form ── */}
          <form
            onSubmit={handleSubmitReview}
            style={{
              marginBottom: 28,
              paddingBottom: 28,
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 8 }}>
                Tu calificación
              </label>
              <StarRow
                rating={rating}
                size={28}
                interactive
                hover={starHover}
                onPick={setRating}
                onHover={setStarHover}
              />
            </div>

            <textarea
              rows={3}
              placeholder="Comparte tu experiencia con esta institución (opcional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'var(--font-body)',
                color: 'var(--fg1)',
                outline: 'none',
                background: 'var(--bg-surface)',
                lineHeight: 1.55,
              }}
            />

            {!user && (
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--fg3)' }}>
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Inicia sesión
                </Link>{' '}
                para publicar una reseña.
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ fontSize: 15, padding: '10px 24px' }}
                disabled={submitReview.isPending || !user}
              >
                {submitReview.isPending ? 'Publicando...' : 'Publicar reseña'}
              </button>
            </div>
          </form>

          {/* ── 4. Review list ── */}
          {reviewsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[1, 2].map(k => (
                <div key={k} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Skeleton w={36} h={36} radius={18} />
                  <div style={{ flex: 1 }}>
                    <Skeleton w={120} h={14} mb={6} />
                    <Skeleton w="80%" h={14} mb={4} />
                    <Skeleton w="60%" h={14} />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--fg3)', fontSize: 14 }}>
              Sé el primero en escribir una reseña
            </div>
          ) : (
            reviews.map((r, idx) => {
              const name = r.full_name || r.reviewer_name || 'Anónimo'
              const bgColor = avatarColor(name)
              const isLast = idx === reviews.length - 1
              return (
                <div
                  key={r.id}
                  style={{
                    marginBottom: isLast ? 0 : 20,
                    paddingBottom: isLast ? 0 : 20,
                    borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: '50% 50% 50% 14%',
                        background: `color-mix(in oklch, ${bgColor} 20%, white)`,
                        color: bgColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontSize: 15, fontWeight: 700,
                        flexShrink: 0,
                        border: `1.5px solid color-mix(in oklch, ${bgColor} 30%, transparent)`,
                      }}>
                        {name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg1)' }}>{name}</div>
                        <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
                          {new Date(r.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <StarRow rating={r.rating} size={14} />
                  </div>
                  {r.comment && (
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      color: 'var(--fg2)',
                      lineHeight: 1.6,
                      paddingLeft: 46,
                    }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
