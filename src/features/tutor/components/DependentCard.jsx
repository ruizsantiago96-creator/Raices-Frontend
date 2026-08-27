import { useState } from 'react'
import { Icons, hashColor } from '@shared/components/shared'
import { useAIForDependent } from '../hooks/useAI'
import { TUTOR_UI } from '../constants/tutorMessages'

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
  const handleAIToggle = () => { if (!showAI && !aiRec.data && !aiRec.isPending) aiRec.mutate(dep?.id); setShowAI(s => !s) }
  const isMenuOpen = activeMenuId === (dep?.id || dep?.pcdUserId)
  const handleMenuClick = (e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : (dep?.id || dep?.pcdUserId)) }
  const hasPhoto = dep?.fotoUrl

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
      {showAI && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.sparkles({ s: 12 })} {TUTOR_UI.AI_STEPS_TITLE} {nombre}</p>
          {aiRec.isPending && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{[100, 85, 90].map((w, i) => <div key={i} style={{ height: 12, width: `${w}%`, borderRadius: 4, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}</div>}
          {aiRec.isError && <p style={{ fontSize: 12, color: 'var(--color-error)', margin: 0 }}>{TUTOR_UI.AI_ERROR}</p>}
          {aiRec.data && <><ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>{aiRec.data.next_steps?.map((step, i) => <li key={i} style={{ fontSize: 13, color: 'var(--fg1)', lineHeight: 1.5 }}>{step}</li>)}</ol>{aiRec.data.reasoning && <p style={{ fontSize: 11, color: 'var(--fg3)', margin: '8px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>{aiRec.data.reasoning}{aiRec.data.mock && ' (modo demo)'}</p>}</>}
        </div>
      )}
    </div>
  )
}
