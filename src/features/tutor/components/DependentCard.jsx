import { useState } from 'react'
import { Icons, hashColor } from '@shared/components/shared'
import { useAIForDependent } from '../hooks/useAI'
import { TUTOR_UI } from '../constants/tutorMessages'
import { normalizeAIRecommendations } from '../utils/aiHelpers'

const minimalBadge = {
  display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
  borderRadius: 6, fontSize: 12, fontWeight: 500,
  background: 'var(--bg-cool)', color: 'var(--fg2)',
}

const EllipsisHorizontalIcon = ({ s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
  </svg>
)

export default function DependentCard({ dep, lifeStages = [], isLinked = false, onEdit, onDelete, onUnlink, onConfigureFeatures, onPermissions, activeMenuId, setActiveMenuId }) {
  const nombre = dep?.nombreCompleto || dep?.nombre || TUTOR_UI.NO_NAME
  const color = hashColor(nombre)
  const initials = nombre.split(' ').map(w => w?.[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
  const stage = lifeStages.find(l => l.id === dep?.etapaVida)
  
  const localBirthDate = localStorage.getItem(`raices_dep_birth_date_${dep?.id}`)
  let dependentAge = ''
  if (localBirthDate) {
    const birthDate = new Date(localBirthDate)
    if (!isNaN(birthDate.getTime())) {
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
      dependentAge = `${age} años`
    }
  }

  const [showAI, setShowAI] = useState(false)
  const aiRec = useAIForDependent()

  const handleAIToggle = () => {
    if (!showAI && !aiRec.data && !aiRec.isPending) {
      aiRec.mutate(dep?.id)
    }
    setShowAI(s => !s)
  }

  const handleAIRefresh = (e) => {
    e?.stopPropagation?.()
    aiRec.mutate(dep?.id)
    if (!showAI) setShowAI(true)
  }

  const isMenuOpen = activeMenuId === (dep?.id || dep?.pcdUserId)
  const handleMenuClick = (e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : (dep?.id || dep?.pcdUserId)) }
  const hasPhoto = dep?.fotoUrl

  // Obtener recomendaciones normalizadas (incluye fallback contextual si la IA falló o está offline)
  const normalized = (showAI || aiRec.data) ? normalizeAIRecommendations(aiRec.data, dep) : null

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {hasPhoto ? (
          <img src={dep.fotoUrl} alt={nombre} aria-hidden="true" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
        )}
        <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>{nombre}</h3>
            {isLinked && <span style={{ ...minimalBadge, fontSize: 10, padding: '2px 6px' }}>{TUTOR_UI.LINKED_BADGE}</span>}
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '2px 0 0' }}>{dep?.parentesco || TUTOR_UI.FAMILY_RELATION}{stage ? ` · ${stage.label}` : ''}{dependentAge ? ` · ${dependentAge}` : ''}</p>
        </div>
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button type="button" onClick={handleMenuClick} aria-label="Acciones de persona" style={{ background: 'transparent', border: 'none', color: 'var(--fg3)', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-cool)'; e.currentTarget.style.color = 'var(--fg1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg3)' }}>
            <EllipsisHorizontalIcon s={16} />
          </button>
          {isMenuOpen && (
            <div style={{ position: 'absolute', top: 34, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '4px', zIndex: 100, width: 200, animation: 'fade-in 0.1s ease-out' }} onClick={e => e.stopPropagation()}>
              <button type="button" className="tutor-dropdown-item" onClick={() => { handleAIToggle(); setActiveMenuId(null) }}><span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.sparkles({ s: 14 })}</span><span>{showAI ? 'Ocultar recomendaciones' : 'Recomendaciones IA'}</span></button>
              <button type="button" className="tutor-dropdown-item" onClick={() => { onConfigureFeatures(); setActiveMenuId(null) }}><span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.shield({ s: 14 })}</span><span>Opciones</span></button>
              <button type="button" className="tutor-dropdown-item" onClick={() => { onPermissions({ id: dep?.id, nombreCompleto: dep?.nombreCompleto || dep?.nombre }); setActiveMenuId(null) }}><span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.shieldCheck({ s: 14 })}</span><span>Permisos</span></button>
              <button type="button" className="tutor-dropdown-item" onClick={() => { onEdit(); setActiveMenuId(null) }}><span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.edit({ s: 14 })}</span><span>Editar</span></button>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
              {isLinked && onUnlink && <button type="button" className="tutor-dropdown-item danger" onClick={() => { onUnlink(); setActiveMenuId(null) }}><span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.link({ s: 14 })}</span><span>{TUTOR_UI.UNLINK_BUTTON}</span></button>}
              <button type="button" className="tutor-dropdown-item danger" onClick={() => { onDelete(); setActiveMenuId(null) }}><span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.x({ s: 14 })}</span><span>Eliminar</span></button>
            </div>
          )}
        </div>
      </div>
      {dep?.tiposDiscapacidad?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{dep.tiposDiscapacidad.map((d, i) => <span key={i} style={{ ...minimalBadge, fontSize: 11, padding: '3px 8px' }}>{d}</span>)}</div>}
      {dep?.notas && <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0, lineHeight: 1.5, background: 'var(--bg-cool)', padding: '10px 12px', borderRadius: 8 }}>{dep.notas}</p>}

      {/* Botón de acceso directo a sugerencias en la tarjeta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <button
          type="button"
          onClick={handleAIToggle}
          style={{
            background: showAI ? 'var(--primary-subtle)' : 'transparent',
            border: '1px solid',
            borderColor: showAI ? 'var(--primary)' : 'var(--border-color)',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: showAI ? 'var(--primary)' : 'var(--fg2)',
            transition: 'all 0.2s ease',
          }}
        >
          {Icons.sparkles({ s: 13 })}
          <span>{showAI ? 'Ocultar sugerencias' : 'Sugerencias IA'}</span>
        </button>

        {showAI && (
          <button
            type="button"
            onClick={handleAIRefresh}
            disabled={aiRec.isPending}
            title="Actualizar sugerencias con IA"
            style={{
              background: 'none',
              border: 'none',
              cursor: aiRec.isPending ? 'not-allowed' : 'pointer',
              color: 'var(--fg3)',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            <span style={{ display: 'inline-block', animation: aiRec.isPending ? 'spin 1s linear infinite' : 'none' }}>
              {Icons.refresh ? Icons.refresh({ s: 12 }) : '↻'}
            </span>
            <span>{aiRec.isPending ? 'Consultando...' : 'Regenerar'}</span>
          </button>
        )}
      </div>

      {showAI && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              {Icons.sparkles({ s: 13 })} {TUTOR_UI.AI_STEPS_TITLE} {nombre}
            </p>
            {normalized?.isFallback ? (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-cool)', color: 'var(--fg3)' }}>
                Modo asistido
              </span>
            ) : normalized?.isMock ? (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'color-mix(in oklch, #D4944C 12%, transparent)', color: '#D4944C' }}>
                Demo
              </span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                IA Activa
              </span>
            )}
          </div>

          {aiRec.isPending ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '6px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg3)' }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-flex' }}>{Icons.loader ? Icons.loader({ s: 13 }) : '⏳'}</span>
                <span>Generando sugerencias inteligentes para {nombre}...</span>
              </div>
              {[100, 85, 90].map((w, i) => (
                <div key={i} style={{ height: 16, width: `${w}%`, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : (
            <>
              {aiRec.isError && (
                <div style={{ padding: '8px 10px', borderRadius: 6, background: 'color-mix(in oklch, var(--color-error) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--color-error) 25%, transparent)', fontSize: 11, color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span>{TUTOR_UI.AI_ERROR}</span>
                  <button
                    type="button"
                    onClick={handleAIRefresh}
                    style={{ background: 'var(--color-error)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {normalized?.steps?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {normalized.steps.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: 'var(--bg-warm)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span style={{ fontSize: 12.5, color: 'var(--fg1)', lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                  {normalized.reasoning && (
                    <p style={{ fontSize: 11, color: 'var(--fg3)', margin: '4px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>
                      💡 {normalized.reasoning}
                    </p>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  )
}

