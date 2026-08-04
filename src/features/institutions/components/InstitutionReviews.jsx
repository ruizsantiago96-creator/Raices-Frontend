/**
 * InstitutionReviews — Sección de reseñas con formulario y lista.
 *
 * Props:
 *   institutionId — ID de la institución
 *   reviews       — Array de reseñas
 *   reviewsLoading — Estado de carga
 *   user          — Usuario actual (puede ser null)
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubmitReview } from '../hooks/useReviews'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import StarRow from './StarRow'
import ReviewActions from './ReviewActions'
import Skeleton from './Skeleton'

const AVATAR_COLORS = [
  '#C4789A', '#8B6BAE', '#D4944C', '#7BA05B',
  '#4BA3A3', '#01ADFF', '#5A6C8C',
]

function avatarColor(name = '') {
  const code = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

export default function InstitutionReviews({ institutionId, reviews, reviewsLoading, user }) {
  const [rating, setRating] = useState(5)
  const [starHover, setStarHover] = useState(null)
  const [comment, setComment] = useState('')
  const submitReview = useSubmitReview(institutionId)
  const { addToast } = useUiStore()

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      addToast('Debes iniciar sesión para dejar una reseña.', 'warning')
      return
    }
    try {
      await submitReview.mutateAsync({ calificacion: Number(rating), comentario: comment })
      setRating(5)
      setComment('')
      addToast('¡Reseña publicada con éxito!', 'success')
    } catch {
      addToast('No se pudo publicar la reseña. Intenta de nuevo.', 'error')
    }
  }

  return (
    <div className="animate-fade-in-up delay-3" style={{
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

      {/* Review form */}
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

      {/* Review list */}
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
              {user && r.user_id === user.id && (
                <ReviewActions review={r} institutionId={institutionId} />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
