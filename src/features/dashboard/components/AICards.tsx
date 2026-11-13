import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useAINextSteps,
  useAIResumen,
  normalizeAIRecommendations,
  normalizeAIResumen,
  useDependientes,
} from '@features/tutor'
import { useAuthStore } from '@features/auth'
import { useProfile } from '@features/profile/hooks/useProfile'
import { STEPS } from '@features/landing/data/steps'
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
      ) : (normalized && normalized.steps && normalized.steps.length > 0) ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {normalized.steps.map((paso: string, i: number) => (
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
              <span style={{ fontSize: 14, color: 'var(--fg1)', lineHeight: 1.5 }}>
                {typeof paso === 'string' ? paso : String(paso)}
              </span>
            </div>
          ))}
          {normalized.reasoning && (
            <div style={{ fontSize: 12, color: 'var(--fg3)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5 }}>
              💡 {typeof normalized.reasoning === 'string' ? normalized.reasoning : ''}
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
   Ilustración SVG estilo Landing — Planta Tierna, Sol y Estrella
   ═══════════════════════════════════════════════════════════ */
function RaicesGrowthSvg() {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes raicesDoodleSway {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-3deg); }
        }
        @keyframes raicesSunPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.07) rotate(8deg); }
        }
      `}</style>
      <svg
        width="104"
        height="104"
        viewBox="0 0 104 104"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Círculo crema cálido idéntico a los pasos de la Landing */}
        <circle cx="52" cy="52" r="46" fill="#FBF6EE" stroke="#EFE5D8" strokeWidth="2.5" />

        {/* Sol Radiante sonriente (arriba a la derecha, estilo Landing) */}
        <g style={{ transformOrigin: '77px 26px', animation: 'raicesSunPulse 4s ease-in-out infinite' }}>
          <g stroke="#0C3B4B" strokeWidth="2.2" strokeLinecap="round">
            <line x1="77" y1="9" x2="77" y2="13" />
            <line x1="77" y1="39" x2="77" y2="43" />
            <line x1="60" y1="26" x2="64" y2="26" />
            <line x1="90" y1="26" x2="94" y2="26" />
            <line x1="65" y1="14" x2="68" y2="17" />
            <line x1="86" y1="35" x2="89" y2="38" />
            <line x1="65" y1="38" x2="68" y2="35" />
            <line x1="86" y1="17" x2="89" y2="14" />
          </g>
          <circle cx="77" cy="26" r="10.5" fill="#FDE674" stroke="#0C3B4B" strokeWidth="2.6" />
          <circle cx="74" cy="24.5" r="1.3" fill="#0C3B4B" />
          <circle cx="80" cy="24.5" r="1.3" fill="#0C3B4B" />
          <path d="M74.2 28.2 C75.8 30.2, 78.2 30.2, 79.8 28.2" fill="none" stroke="#0C3B4B" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="72" cy="26.8" rx="1.6" ry="1" fill="#FF4D68" opacity="0.45" />
          <ellipse cx="82" cy="26.8" rx="1.6" ry="1" fill="#FF4D68" opacity="0.45" />
        </g>

        {/* Estrella mágica (arriba a la izquierda, estilo Landing) */}
        <path
          d="M 24 20 L 25.6 25.4 L 31 27 L 25.6 28.6 L 24 34 L 22.4 28.6 L 17 27 L 22.4 25.4 Z"
          fill="#FFB703"
          stroke="#0C3B4B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="19" cy="46" r="3" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="2" />
        <circle cx="82" cy="58" r="3.2" fill="#10B981" stroke="#0C3B4B" strokeWidth="2" />

        {/* Planta Tierna en maceta sonriente (centro, idéntica al Doodle 2 de la Landing) */}
        <g transform="translate(14, 14)" style={{ transformOrigin: '36px 55px', animation: 'raicesDoodleSway 3.8s ease-in-out infinite' }}>
          {/* Maceta terracota sonriente */}
          <path d="M22 47 L25 69 C25.5 71, 46.5 71, 47 69 L50 47 Z" fill="#CA918E" stroke="#0C3B4B" strokeWidth="3.2" strokeLinejoin="round" />
          <rect x="20" y="42" width="32" height="6" rx="3" fill="#CA918E" stroke="#0C3B4B" strokeWidth="3" />
          <circle cx="32" cy="57" r="1.6" fill="#0C3B4B" />
          <circle cx="40" cy="57" r="1.6" fill="#0C3B4B" />
          <path d="M33.5 61 C35 63.2, 37 63.2, 38.5 61" stroke="#0C3B4B" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="29.5" cy="59" rx="2" ry="1.2" fill="#FF4D68" opacity="0.45" />
          <ellipse cx="42.5" cy="59" rx="2" ry="1.2" fill="#FF4D68" opacity="0.45" />

          {/* Tallo y hojas */}
          <path d="M36 42 C36 30, 36 22, 36 15" stroke="#0C3B4B" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M36 30 C24 30, 18 20, 24 14 C32 14, 36 24, 36 30 Z" fill="#229B58" stroke="#0C3B4B" strokeWidth="3" strokeLinejoin="round" />
          <path d="M36 22 C46 22, 52 14, 48 8 C40 8, 36 16, 36 22 Z" fill="#A8B86B" stroke="#0C3B4B" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="36" cy="13" r="4" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.4" />
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Doodle de Flor Sonriente (Header de Tu historia, estilo Landing)
   ═══════════════════════════════════════════════════════════ */
function RaicesHeaderFlowerDoodle() {
  return (
    <svg width="46" height="46" viewBox="0 0 72 74" fill="none" aria-hidden="true" style={{ flexShrink: 0, display: 'block' }}>
      <circle cx="36" cy="37" r="34" fill="#FBF6EE" stroke="#EFE5D8" strokeWidth="3" />
      <path d="M36 44 C36 54, 34 63, 36 65" stroke="#0C3B4B" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M36 54 C45 52, 50 59, 46 63 C39 65, 36 59, 36 54 Z" fill="#229B58" stroke="#0C3B4B" strokeWidth="2.6" />
      <g fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.8">
        <circle cx="36" cy="19" r="9.5" />
        <circle cx="47" cy="27" r="9.5" />
        <circle cx="43" cy="40" r="9.5" />
        <circle cx="29" cy="40" r="9.5" />
        <circle cx="25" cy="27" r="9.5" />
      </g>
      <circle cx="36" cy="31" r="10.5" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3" />
      <circle cx="32.2" cy="29.2" r="1.6" fill="#0C3B4B" />
      <circle cx="39.8" cy="29.2" r="1.6" fill="#0C3B4B" />
      <path d="M33 34 C34.5 36.5, 37.5 36.5, 39 34" fill="none" stroke="#0C3B4B" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════
   ProfileSummaryCard — Resumen narrativo del perfil
   ═══════════════════════════════════════════════════════════ */
export function ProfileSummaryCard({ autoGenerate = false }: { autoGenerate?: boolean } = {}) {
  const navigate = useNavigate()
  const { data: rawData, isLoading, canFetch, fetch, isRateLimited } = useAIResumen()
  const [expanded, setExpanded] = useState(false)
  const user = useAuthStore(s => s.user)
  const { data: profile } = useProfile()
  const { data: dependents = [] } = useDependientes()

  useEffect(() => {
    if (autoGenerate && !rawData && !isLoading && canFetch()) {
      fetch()
    }
  }, [autoGenerate, rawData, isLoading, canFetch, fetch])

  const isPcd = user?.role === 'pcd' || user?.rol === 'pcd'
  const isTutor = !isPcd && (user?.role === 'tutor' || user?.role === 'padre_tutor' || user?.rol === 'padre_tutor' || Boolean(localStorage.getItem('raices_dep_name')))
  const depName = dependents[0]?.nombreCompleto || dependents[0]?.nombre || localStorage.getItem('raices_dep_name') || ''
  const dest = dependents[0]?.parentesco || localStorage.getItem('raices_destinatario') || 'hijo'

  // Detectar diagnóstico formal desde el perfil o desde escalas guardadas
  let profileDiagName = ''
  let profileHasDiag = false
  try {
    const rawProfile = profile as unknown as Record<string, unknown> | undefined
    const profiling = (rawProfile?.profiling || rawProfile?.perfilNecesidades) as Record<string, unknown> | undefined
    if (profiling?.tieneDiagnostico === true || rawProfile?.tieneDiagnostico === true) {
      profileHasDiag = true
    }
    const spec = (profiling?.diagnosticoEspecifico || profiling?.diagnostico_especifico || profiling?.preocupacionesActuales || profiling?.current_concerns) as string | undefined
    if (typeof spec === 'string' && spec.trim()) {
      profileHasDiag = true
      profileDiagName = spec.trim()
    }
    const rawScales = localStorage.getItem('raices_user_scales')
    if (rawScales) {
      const parsed = JSON.parse(rawScales) as Record<string, unknown>
      if (parsed?.tieneDiagnostico === true) profileHasDiag = true
      if (typeof parsed?.diagnosticoEspecifico === 'string' && parsed.diagnosticoEspecifico.trim()) {
        profileHasDiag = true
        profileDiagName = parsed.diagnosticoEspecifico.trim()
      }
    }
  } catch {}

  const data = normalizeAIResumen(rawData, {
    tutorName: user?.full_name,
    dependentName: depName,
    parentesco: dest,
    isTutor,
    tieneDiagnostico: profileHasDiag,
    diagnosticoEspecifico: profileDiagName,
  })

  const isInsufficient = Boolean(
    data?.resumenUnParrafo?.toLowerCase().includes('datos insuficientes') ||
    data?.resumenUnParrafo?.toLowerCase().includes('completa tu perfil') ||
    data?.resumenUnParrafo?.toLowerCase().includes('insuficiente')
  )

  const handleForceRefresh = () => {
    localStorage.removeItem('ai_resumen_last_fetch_ts')
    fetch()
  }

  if (!canFetch() && !data) return null

  return (
    <div
      className="animate-fade-in-up delay-1"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#B6C6CF',
        border: '1px solid rgba(12, 59, 75, 0.14)',
        borderRadius: 20,
        padding: '22px 24px 20px',
        boxShadow: '0 8px 24px rgba(12, 59, 75, 0.1)',
        marginBottom: 18,
      }}
    >
      {/* Header con insignia de Crecimiento de Raíces */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RaicesHeaderFlowerDoodle />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#0C3B4B', letterSpacing: '-0.01em' }}>
                Tu historia en Raíces
              </span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D68', display: 'inline-block' }} />
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(12, 59, 75, 0.82)', fontWeight: 600 }}>
              Resumen narrativo de tu camino y crecimiento personal
            </div>
          </div>
        </div>

        {data?.simulado && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6, background: 'color-mix(in oklch, #D4944C 12%, transparent)', color: '#D4944C' }}>
            Demo
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '18px 20px',
            borderRadius: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 999,
                background: 'rgba(34, 155, 88, 0.12)',
                border: '1px solid rgba(34, 155, 88, 0.28)',
                color: '#197A43',
                fontSize: 12.5,
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: '2.2px solid rgba(34, 155, 88, 0.3)',
                  borderTopColor: '#229B58',
                  display: 'inline-block',
                  animation: 'raicesSpin 0.85s linear infinite',
                }}
              />
              <span>Construyendo tu historia en Raíces...</span>
            </div>

            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0C3B4B', marginBottom: 12, lineHeight: 1.45 }}>
              Por favor no cierres esta ventana mientras preparamos tu resumen personalizado. Toma solo unos segundos.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[100, 92, 76].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: `${w}%`,
                    height: 12,
                    borderRadius: 6,
                    background: 'var(--border-color)',
                    animation: 'pulse 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <RaicesGrowthSvg />
          <style>{`
            @keyframes raicesSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : data?.resumenUnParrafo ? (
        <div>
          {/* Bloque principal con ilustración SVG de Crecimiento de Raíces + narrativa */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '16px 18px',
              borderRadius: 16,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 14.5,
                  color: 'var(--fg1)',
                  lineHeight: 1.7,
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                &ldquo;{data.resumenUnParrafo}&rdquo;
              </p>
            </div>
            <RaicesGrowthSvg />
          </div>

          {isInsufficient ? (
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                onClick={() => navigate('/completar-perfil')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-btn, 10px)',
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 3px 10px rgba(34, 155, 88, 0.25)',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '0.94'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span>Contestar preguntas de mi perfil</span>
                {Icons.arrowRight({ s: 15 })}
              </button>
            </div>
          ) : (
            <>
              {expanded && data.resumenTresParrafos && (
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {[
                    { key: 'quienEres', label: 'Raíces · Quién eres', accent: '#229B58', stepIdx: 0 },
                    { key: 'contexto', label: 'Entorno · Tu contexto', accent: '#0C3B4B', stepIdx: 1 },
                    { key: 'intereses', label: 'Florecer · Tus metas', accent: '#FF4D68', stepIdx: 2 },
                  ].map(({ key, label, accent, stepIdx }) => {
                    const parrafos = data.resumenTresParrafos as Record<string, string | undefined>
                    return parrafos && parrafos[key] ? (
                      <div
                        key={key}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 14,
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          {STEPS[stepIdx]?.icon && (
                            <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <div style={{ transform: 'scale(0.35)', transformOrigin: 'center', display: 'flex' }}>
                                {STEPS[stepIdx].icon}
                              </div>
                            </div>
                          )}
                          <div style={{ fontSize: 11.5, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {label}
                          </div>
                        </div>
                        <div style={{ fontSize: 13.5, color: 'var(--fg2)', lineHeight: 1.58 }}>
                          {parrafos[key]}
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              )}

              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                {data.resumenTresParrafos ? (
                  <button
                    type="button"
                    onClick={() => setExpanded(v => !v)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(12, 59, 75, 0.16)',
                      borderRadius: 10,
                      cursor: 'pointer',
                      color: '#0C3B4B',
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: 'var(--font-body)',
                      padding: '7px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 6px rgba(12, 59, 75, 0.08)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {expanded ? 'Ver resumen breve' : 'Leer historia completa'}
                    {Icons.arrowRight({ s: 13 })}
                  </button>
                ) : <span />}

                <button
                  type="button"
                  onClick={handleForceRefresh}
                  disabled={isLoading || isRateLimited}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: isLoading || isRateLimited ? 'not-allowed' : 'pointer',
                    color: '#0C3B4B',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    padding: '4px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    opacity: isRateLimited ? 0.5 : 0.88,
                  }}
                >
                  {Icons.sparkles({ s: 13 })} Actualizar historia
                </button>
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: 'rgba(12, 59, 75, 0.78)', fontWeight: 500, lineHeight: 1.4 }}>
                Resumen construido únicamente con la información que compartiste en tu perfil. Raíces no emite diagnósticos médicos.
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '14px 18px',
            borderRadius: 14,
            background: 'color-mix(in oklch, #229B58 6%, var(--bg-surface))',
            border: '1px dashed #229B58',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 4 }}>
              Descubre tu historia en Raíces
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--fg2)', marginBottom: 12 }}>
              Generamos un resumen cálido y personalizado a partir de tu condición, diagnóstico e intereses.
            </div>
            <button
              type="button"
              onClick={fetch}
              disabled={isRateLimited}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: '#229B58',
                color: '#ffffff',
                cursor: isRateLimited ? 'not-allowed' : 'pointer',
                fontSize: 13.5,
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                opacity: isRateLimited ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(34, 155, 88, 0.25)',
                transition: 'all 0.2s',
              }}
            >
              {Icons.sparkles({ s: 15 })} Generar mi historia
            </button>
          </div>
          <RaicesGrowthSvg />
        </div>
      )}

      {isRateLimited && (
        <div style={{ fontSize: 12, color: '#D4944C', marginTop: 8 }}>
          Espera unos minutos antes de generar de nuevo.
        </div>
      )}
    </div>
  )
}
