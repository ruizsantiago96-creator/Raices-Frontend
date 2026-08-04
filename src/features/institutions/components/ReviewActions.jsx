/**
 * ReviewActions — Botones de editar/eliminar reseña (solo visible para el autor).
 *
 * Props:
 *   review        — Objeto de la reseña actual
 *   institutionId — ID de la institución
 */

import { useState } from 'react'
import { useUpdateReview, useDeleteReview } from '../hooks/useReviews'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import StarRow from './StarRow'

export default function ReviewActions({ review, institutionId }) {
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(review.rating)
  const [comment, setComment] = useState(review.comment ?? '')
  const updateReview = useUpdateReview(review.id, institutionId)
  const deleteReview = useDeleteReview(review.id, institutionId)
  const { addToast } = useUiStore()

  const handleSave = () => {
    updateReview.mutate({ calificacion: Number(rating), comentario: comment }, {
      onSuccess: () => { setEditing(false); addToast('Reseña actualizada', 'success') },
      onError: () => addToast('No se pudo actualizar', 'error'),
    })
  }

  const handleDelete = () => {
    if (!window.confirm('¿Eliminar esta reseña?')) return
    deleteReview.mutate(undefined, {
      onSuccess: () => addToast('Reseña eliminada', 'success'),
      onError: () => addToast('No se pudo eliminar', 'error'),
    })
  }

  if (editing) {
    return (
      <div style={{ marginTop: 12, paddingLeft: 46 }}>
        <StarRow rating={rating} size={20} interactive onPick={setRating} />
        <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none', marginTop: 8 }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button onClick={() => setEditing(false)} style={{ padding: '5px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)' }}>Cancelar</button>
          <button onClick={handleSave} disabled={updateReview.isPending} className="btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}>{updateReview.isPending ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingLeft: 46 }}>
      <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {Icons.edit({ s: 12 })} Editar
      </button>
      <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D46A6A', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {Icons.trash({ s: 12 })} Eliminar
      </button>
    </div>
  )
}
