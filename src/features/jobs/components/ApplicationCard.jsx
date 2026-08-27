import { useState } from 'react'
import { Icons } from '@shared/components/shared'
import { JOBS_UI, STATUS_COLORS } from '../constants/jobsMessages'

const STATUS_LABELS = {
  pending: JOBS_UI.STATUS_PENDING,
  reviewed: JOBS_UI.STATUS_REVIEWED,
  accepted: JOBS_UI.STATUS_ACCEPTED,
  rejected: JOBS_UI.STATUS_REJECTED,
}

export default function ApplicationCard({ app, onMessage }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div 
      onClick={() => setExpanded(v => !v)}
      style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 14, 
        padding: '18px 22px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg1)', marginBottom: 2, fontFamily: 'var(--font-display)' }}>{app.title}</div>
          <div style={{ fontSize: 13, color: 'var(--fg3)' }}>{app.institution_name} · {app.modality}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ padding: '5px 12px', borderRadius: 8, background: `color-mix(in oklch, ${STATUS_COLORS[app.status] ?? '#888'} 10%, transparent)`, color: STATUS_COLORS[app.status] ?? '#888', fontSize: 12, fontWeight: 600 }}>
            {STATUS_LABELS[app.status] ?? app.status}
          </span>
          {app.institution_owner_id && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMessage(app) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg3)'}
              title="Enviar mensaje"
            >
              {Icons.message({ s: 16 })}
            </button>
          )}
          <span style={{ color: 'var(--fg3)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
            {Icons.arrowRight({ s: 14 })}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 14 }} onClick={e => e.stopPropagation()}>
          {app.description && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.DESCRIPTION_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>{app.description}</p>
            </div>
          )}
          {app.requirements && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.REQUIREMENTS_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>{app.requirements}</p>
            </div>
          )}
          <div style={{ background: 'var(--bg-cool)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Mi carta de presentación</div>
            <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              {app.cover_letter || 'No adjuntaste carta de presentación.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
