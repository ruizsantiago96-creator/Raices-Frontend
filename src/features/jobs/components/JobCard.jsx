import { useState } from 'react'
import { Icons } from '@shared/components/shared'
import { JOBS_UI } from '../constants/jobsMessages'

/* ─── JobCard (Apple-style minimal) ─────────────────────── */
export default function JobCard({ job, applied, onApply, onMessage, userRole, institutionId, onNavigateToPortal, onEditJob }) {
  const [expanded, setExpanded] = useState(false)

  // Build single-line info string
  const infoParts = []
  if (job.city) infoParts.push(`${job.city}${job.state ? `, ${job.state}` : ''}`)
  if (job.modality) infoParts.push(job.modality)
  if (job.schedule) infoParts.push(job.schedule)

  return (
    <div 
      onClick={() => setExpanded(v => !v)}
      style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 14, 
        padding: '20px 24px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
    >
      {/* Top row: Title + Salary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--fg1)', margin: 0, lineHeight: 1.3 }}>
              {job.title}
            </h3>
            {job.institution_verified && (
              <span title={JOBS_UI.VERIFIED_BADGE} style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                {Icons.verifiedBadge({ s: 18 })}
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: 'var(--fg2)', fontWeight: 500, margin: '0 0 6px' }}>
            {job.institution_name}
          </p>
        </div>
        {job.salary_range && (
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>
            {job.salary_range}
          </span>
        )}
      </div>

      {/* Info line: City · Modality · Schedule */}
      {infoParts.length > 0 && (
        <div style={{ fontSize: 13, color: 'var(--fg3)', marginBottom: 12, lineHeight: 1.4 }}>
          {infoParts.map((part, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: '0 6px', color: 'var(--border-color)' }}>·</span>}
              {part}
            </span>
          ))}
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Role-based action buttons */}
          {userRole === 'institution' ? (
            /* Institution role: show edit/applicants buttons for own jobs */
            (job.institution_id && String(job.institution_id) === String(institutionId)) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onEditJob?.(job) }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
                    color: 'var(--primary)', border: '1px solid color-mix(in oklch, var(--primary) 20%, transparent)',
                    cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in oklch, var(--primary) 18%, transparent)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'color-mix(in oklch, var(--primary) 10%, transparent)' }}
                >
                  {Icons.edit({ s: 13 })} Editar vacante
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigateToPortal?.('candidatos') }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'color-mix(in oklch, #D4944C 10%, transparent)',
                    color: '#D4944C', border: '1px solid color-mix(in oklch, #D4944C 20%, transparent)',
                    cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in oklch, #D4944C 18%, transparent)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'color-mix(in oklch, #D4944C 10%, transparent)' }}
                >
                  {Icons.users({ s: 13 })} Ver postulantes
                </button>
              </div>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 8, background: 'var(--bg-cool)', color: 'var(--fg3)', fontSize: 13, fontWeight: 500 }}>
                {Icons.building({ s: 13 })} Vacante de otra institución
              </span>
            )
          ) : (
            /* User / Tutor / other roles: show apply button */
            applied ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 8, background: 'color-mix(in oklch, #1F8049 10%, transparent)', color: '#1F8049', fontSize: 13, fontWeight: 600 }}>
                {Icons.check({ s: 13 })} {JOBS_UI.POSTULATED_BADGE}
              </span>
            ) : (
              <button 
                className="btn-primary" 
                onClick={(e) => { e.stopPropagation(); onApply() }} 
                style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, borderRadius: 8, whiteSpace: 'nowrap' }}
              >
                {JOBS_UI.POSTULATE_BUTTON}
              </button>
            )
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {job.institution_owner_id && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMessage(job) }}
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

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
          {job.description && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.DESCRIPTION_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>{job.description}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.REQUIREMENTS_LABEL}</div>
              <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>{job.requirements}</p>
            </div>
          )}
          {job.disability_types?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{JOBS_UI.DISABILITY_WELCOME_LABEL}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.disability_types.map(t => (
                  <span key={t} style={{ padding: '3px 10px', borderRadius: 8, background: 'var(--bg-cool)', color: 'var(--fg2)', fontSize: 12, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
