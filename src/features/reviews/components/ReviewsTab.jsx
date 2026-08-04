import { useState } from 'react'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { useAdminReviews, useDeleteReview } from '../hooks/useAdminReviews'
import { REVIEWS_UI } from '../constants/reviewsMessages'

const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }

function Card({ children, style, className }) {
  return <div className={className} style={{ ...card, padding: 24, ...style }}>{children}</div>
}

function Skeleton({ w = '100%', h = 16, r = 6, style }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', ...style }} />
}

function EmptyState({ icon, title, sub }) {
  return (
    <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ color: 'var(--fg3)', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg2)', margin: 0 }}>{title}</p>
      {sub && <p style={{ fontSize: 13, color: 'var(--fg3)', marginTop: 4 }}>{sub}</p>}
    </Card>
  )
}

function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...card, padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: danger ? 'color-mix(in oklch, var(--color-error) 14%, transparent)' : 'var(--primary-subtle)', color: danger ? 'var(--color-error)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {danger ? Icons.shieldAlert({ s: 20 }) : Icons.shield({ s: 20 })}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={onCancel}>Cancelar</button>
          <button onClick={onConfirm} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: danger ? 'var(--color-error)' : 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

function btn(color) {
  return {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
    border: `1px solid ${color}`, background: 'transparent', color,
    cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 0.15s'
  }
}

/* ════════════════════ TAB: Reseñas ════════════════════ */
export default function ReviewsTab() {
  const { addToast } = useUiStore()
  const { data: reviews = [], isLoading } = useAdminReviews()
  const del = useDeleteReview()
  const [confirm, setConfirm] = useState(null)

  const doDelete = () => del.mutate(confirm.id, { onSuccess: () => { addToast('Reseña eliminada', 'success'); setConfirm(null) } })

  return (
    <div>
      {isLoading ? (
        <Card><Skeleton h={60} style={{ marginBottom: 12 }} /><Skeleton h={60} /></Card>
      ) : reviews.length === 0 ? (
        <EmptyState icon={Icons.star({ s: 32 })} title={REVIEWS_UI.EMPTY_STATE} sub={REVIEWS_UI.EMPTY_HINT} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ ...card, padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ display: 'flex', gap: 1, color: 'var(--color-empleo)' }}>
                    {[1, 2, 3, 4, 5].map(n => Icons.star({ s: 14, filled: n <= r.rating }))}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>{r.institution_name ?? 'Institución eliminada'}</span>
                </div>
                {r.comment && <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 8px', lineHeight: 1.5 }}>"{r.comment}"</p>}
                <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
                  {r.user_name ?? 'Anónimo'} · {r.created_at ? new Date(r.created_at).toLocaleDateString('es-MX') : ''}
                </div>
              </div>
              <button onClick={() => setConfirm(r)} style={btn('var(--color-error)')}>{Icons.x({ s: 14 })} Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={REVIEWS_UI.DELETE_TITLE}
          message={REVIEWS_UI.DELETE_MESSAGE}
          confirmLabel={REVIEWS_UI.DELETE_CONFIRM}
          danger
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
