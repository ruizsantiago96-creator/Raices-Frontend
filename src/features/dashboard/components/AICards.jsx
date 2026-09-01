import { useState } from 'react'
import { useAINextSteps, useAIResumen, normalizeAIRecommendations } from '@features/tutor'
import { Icons } from '@shared/components/shared'

/* ═══════════════════════════════════════════════════════════
   NextStepsCard — Próximos pasos personalizados con IA
   ═══════════════════════════════════════════════════════════ */
export function NextStepsCard() {
  const { data, isLoading, canFetch, fetch, isRateLimited } = useAINextSteps()
  const normalized = data ? normalizeAIRecommendations(data) : null

  if (!canFetch() && !data) return null

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
        <div style={{
          width: 38, height: 38, borderRadius: '50% 50% 50% 14%',
          background: 'color-mix(in oklch, var(--primary) 12%, transparent)',
          color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {Icons.sparkles({ s: 18 })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>
            Tus próximos pasos
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
            Recomendaciones personalizadas por IA
          </div>
        </div>
        {normalized?.isMock && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'color-mix(in oklch, #D4944C 12%, transparent)', color: '#D4944C' }}>
            Demo
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 44, borderRadius: 10, background: 'var(--border-color)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : normalized?.steps?.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {normalized.steps.map((paso, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px', borderRadius: 10,
              background: 'var(--bg-warm)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--primary-subtle)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 14, color: 'var(--fg1)', lineHeight: 1.5 }}>{paso}</span>
            </div>
          ))}
          {normalized.reasoning && (
            <div style={{ fontSize: 12, color: 'var(--fg3)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5 }}>
              💡 {normalized.reasoning}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={fetch}
          disabled={isRateLimited}
          style={{
            width: '100%', padding: '12px 20px', borderRadius: 12,
            border: '1px dashed var(--primary)',
            background: 'transparent', color: 'var(--primary)',
            cursor: isRateLimited ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: isRateLimited ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          {Icons.sparkles({ s: 16 })} Generar mis próximos pasos
        </button>
      )}

      {isRateLimited && (
        <div style={{ fontSize: 12, color: '#D4944C', marginTop: 8 }}>
          Espera unos minutos antes de generar de nuevo.
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ProfileSummaryCard — Resumen narrativo del perfil
   ═══════════════════════════════════════════════════════════ */
export function ProfileSummaryCard() {
  const { data, isLoading, canFetch, fetch, isRateLimited } = useAIResumen()
  const [expanded, setExpanded] = useState(false)

  if (!canFetch() && !data) return null

  return (
    <div
      className="animate-fade-in-up delay-1"
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
        <div style={{
          width: 38, height: 38, borderRadius: '50% 50% 50% 14%',
          background: 'color-mix(in oklch, #6366f1 12%, transparent)',
          color: '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {Icons.user({ s: 18 })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>
            Tu historia
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
            Resumen narrativo de tu perfil
          </div>
        </div>
        {data?.simulado && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'color-mix(in oklch, #D4944C 12%, transparent)', color: '#D4944C' }}>
            Demo
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 18, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : data?.resumenUnParrafo ? (
        <div>
          <p style={{ fontSize: 15, color: 'var(--fg1)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
            &ldquo;{data.resumenUnParrafo}&rdquo;
          </p>

          {expanded && data.resumenTresParrafos && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'quienEres', label: 'Quién eres', icon: '👤' },
                { key: 'contexto', label: 'Tu contexto', icon: '🌍' },
                { key: 'intereses', label: 'Intereses y aspiraciones', icon: '✨' },
              ].map(({ key, label, icon }) => (
                data.resumenTresParrafos[key] ? (
                  <div key={key} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-warm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      {icon} {label}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.55 }}>
                      {data.resumenTresParrafos[key]}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}

          {data.resumenTresParrafos && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                marginTop: 12, background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--primary)', fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-body)', padding: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {expanded ? 'Ver menos' : 'Leer historia completa'}
              {Icons.arrowRight({ s: 13 })}
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={fetch}
          disabled={isRateLimited}
          style={{
            width: '100%', padding: '12px 20px', borderRadius: 12,
            border: '1px dashed #6366f1',
            background: 'transparent', color: '#6366f1',
            cursor: isRateLimited ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: isRateLimited ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          {Icons.user({ s: 16 })} Generar mi resumen
        </button>
      )}

      {isRateLimited && (
        <div style={{ fontSize: 12, color: '#D4944C', marginTop: 8 }}>
          Espera unos minutos antes de generar de nuevo.
        </div>
      )}
    </div>
  )
}
