import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSaveProfiling } from '../hooks/useProfile'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, BrandMark, labelStyle, inputStyle } from '@shared/components/shared'

const STEPS = [
  { title: 'Datos generales', desc: 'Conocer lo básico nos ayuda a personalizar tu entorno.', icon: Icons.user },
  { title: 'Condición y necesidades', desc: 'Adaptar la accesibilidad a tus necesidades específicas.', icon: Icons.activity },
  { title: 'Etapa de vida', desc: 'Identificar tu momento para sugerir apoyos relevantes.', icon: Icons.milestone },
  { title: 'Historial y recorrido', desc: 'Queremos saber qué has hecho para continuar construyendo.', icon: Icons.compass },
  { title: 'Tus objetivos', desc: '¿Hacia dónde vamos? Tus metas de corto y mediano plazo.', icon: Icons.target },
  { title: 'Estado actual', desc: 'Cómo te sientes hoy y en qué necesitas más soporte.', icon: Icons.heartPulse },
]

const NEEDS = ['Movilidad', 'Comunicación', 'Socialización', 'Aprendizaje', 'Autonomía']
const GOALS = ['Encontrar una escuela inclusiva', 'Centros de terapia validados', 'Actividades sociales y comunidad', 'Oportunidades de empleo / capacitación', 'Asesoría legal / trámites']
const STAGES = ['Primera infancia', 'Edad escolar', 'Adolescencia', 'Transición a adultez', 'Adultez', 'Vida independiente']
const DISABILITY_TYPES = ['TEA (Autismo)', 'Discapacidad motriz', 'Discapacidad visual', 'Discapacidad auditiva', 'Discapacidad intelectual', 'Psicosocial', 'Múltiple', 'Otro']

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    disability_types: [], disability_severity: '', communication_modes: [],
    mobility_needs: [], tech_access: [], preferred_zones: [],
    stage: '', goals: [], support_areas: '',
  })
  const saveProfiling = useSaveProfiling()
  const { addToast } = useUiStore()
  const nav = useNavigate()

  const toggle = (key, val) => setData(d => ({
    ...d, [key]: d[key].includes(val) ? d[key].filter(x => x !== val) : [...d[key], val]
  }))

  const handleFinish = async () => {
    try {
      await saveProfiling.mutateAsync(data)
      addToast('¡Perfil completado!', 'success')
      nav('/dashboard')
    } catch {
      nav('/dashboard')
    }
  }

  const cur = STEPS[step - 1]

  const pillBtn = (active, label, onClick) => (
    <button onClick={onClick} style={{
      padding: '10px 18px', borderRadius: 'var(--radius-pill)', fontSize: 15, fontWeight: 600,
      cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
      background: active ? 'var(--primary)' : 'var(--primary-subtle)',
      color: active ? 'white' : 'var(--primary)',
      transition: 'all 0.2s ease',
    }}>
      {label}
    </button>
  )

  const radioCard = (label, name, checked, onChange) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', border: `1px solid ${checked ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', background: checked ? 'var(--primary-subtle)' : 'var(--bg-surface)', transition: 'all 0.2s' }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
      <span style={{ fontWeight: 600, fontSize: 16 }}>{label}</span>
    </label>
  )

  return (
    <div className="onboarding-layout" style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-body)' }}>
      {/* Left panel */}
      <div className="onboarding-sidebar" style={{ width: '35%', background: 'var(--primary-dark)', color: 'white', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <BrandMark onClick={() => nav('/dashboard')} light size={20} />
          <div style={{ marginTop: 32, display: 'inline-block', padding: '6px 14px', background: 'var(--primary)', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            Paso {step} de 6
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, lineHeight: 1.1, margin: '0 0 16px', color: 'white' }}>{cur.title}</h1>
          <p style={{ fontSize: 17, opacity: 0.85, lineHeight: 1.6 }}>{cur.desc}</p>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i + 1 === step ? 1 : i + 1 < step ? 0.6 : 0.25 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i + 1 <= step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i + 1 < step ? <span style={{ color: 'var(--primary-dark)', fontSize: 12 }}>✓</span> : <span style={{ color: i + 1 === step ? 'var(--primary-dark)' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${(step / 6) * 100}%`, background: 'white', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>Puedes actualizar esto en cualquier momento</p>
        </div>
      </div>

      {/* Right content */}
      <div className="onboarding-content" style={{ flex: 1, background: 'var(--bg-surface)', padding: '48px 64px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ flex: 1, maxWidth: 560 }}>
          <div style={{ color: 'var(--fg3)', marginBottom: 28, opacity: 0.3 }}>{cur.icon({ s: 32 })}</div>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div><label style={labelStyle}>Rol en la plataforma</label>
                <select style={inputStyle} value={data.role || ''} onChange={e => setData(d => ({ ...d, role: e.target.value }))}>
                  <option value="">Selecciona tu rol...</option>
                  <option value="pcd">Persona con discapacidad</option>
                  <option value="tutor">Tutor / Familiar</option>
                  <option value="cuidador">Cuidador principal</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={labelStyle}>Edad</label><input type="number" placeholder="Ej. 24" style={inputStyle} value={data.age || ''} onChange={e => setData(d => ({ ...d, age: e.target.value }))} /></div>
                <div><label style={labelStyle}>Ciudad</label><input placeholder="Ej. Mérida, Yucatán" style={inputStyle} value={data.city || ''} onChange={e => setData(d => ({ ...d, city: e.target.value }))} /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>Tipo de discapacidad</label>
                <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>Selecciona todos los que apliquen</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DISABILITY_TYPES.map(t => pillBtn(data.disability_types.includes(t), t, () => toggle('disability_types', t)))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Nivel de apoyo requerido</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {['Bajo', 'Medio', 'Alto'].map(l => radioCard(l, 'severity', data.disability_severity === l, () => setData(d => ({ ...d, disability_severity: l }))))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Necesidades principales</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {NEEDS.map(n => pillBtn(data.mobility_needs.includes(n), n, () => toggle('mobility_needs', n)))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label style={labelStyle}>¿En qué etapa de vida te encuentras?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                {STAGES.map(s => radioCard(s, 'stage', data.stage === s, () => setData(d => ({ ...d, stage: s }))))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div><label style={labelStyle}>Educación</label>
                <select style={inputStyle} value={data.education || ''} onChange={e => setData(d => ({ ...d, education: e.target.value }))}>
                  <option value="">Nivel actual o tipo de escuela...</option>
                  <option>Escuela regular (inclusiva)</option>
                  <option>Centro de educación especial</option>
                  <option>Educación en casa</option>
                  <option>Universidad / preparatoria</option>
                  <option>Graduado</option>
                </select>
              </div>
              <div><label style={labelStyle}>Terapias recibidas</label><input placeholder="Ej. Física, Lenguaje, Ocupacional..." style={inputStyle} value={data.therapies || ''} onChange={e => setData(d => ({ ...d, therapies: e.target.value }))} /></div>
              <div><label style={labelStyle}>Experiencia laboral</label><input placeholder="Ej. Buscando primer empleo, Capacitación..." style={inputStyle} value={data.work || ''} onChange={e => setData(d => ({ ...d, work: e.target.value }))} /></div>
              <div><label style={labelStyle}>Experiencia social</label>
                <textarea placeholder="¿Participa en grupos? ¿Qué actividades disfruta?" style={{ ...inputStyle, height: 80, resize: 'none', padding: '12px 16px' }} value={data.social || ''} onChange={e => setData(d => ({ ...d, social: e.target.value }))} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <label style={labelStyle}>¿Qué estás buscando actualmente?</label>
              <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '4px 0 16px' }}>Selecciona todas las que apliquen</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GOALS.map(g => (
                  <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: `1px solid ${data.goals.includes(g) ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', background: data.goals.includes(g) ? 'var(--primary-subtle)' : 'var(--bg-surface)', transition: 'all 0.2s' }}>
                    <input type="checkbox" checked={data.goals.includes(g)} onChange={() => toggle('goals', g)} style={{ accentColor: 'var(--primary)', width: 20, height: 20 }} />
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div><label style={labelStyle}>¿Dónde sientes que necesitas más apoyo hoy?</label>
                <textarea placeholder="Ej. En manejar la ansiedad, en encontrar apoyo escolar..." style={{ ...inputStyle, height: 90, resize: 'none', padding: '12px 16px' }} value={data.support_areas} onChange={e => setData(d => ({ ...d, support_areas: e.target.value }))} />
              </div>
              <div><label style={labelStyle}>¿Qué te preocupa actualmente?</label>
                <textarea placeholder="Lo que compartas alimentará nuestras recomendaciones de comunidad y contenido." style={{ ...inputStyle, height: 90, resize: 'none', padding: '12px 16px' }} value={data.concerns || ''} onChange={e => setData(d => ({ ...d, concerns: e.target.value }))} />
              </div>
              <div style={{ padding: 16, background: 'var(--primary-subtle)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)', display: 'flex', gap: 12 }}>
                {Icons.sparkles({ s: 20 })}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>Tu perfil está casi listo</p>
                  <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0 }}>Con esta información, nuestro sistema buscará instituciones y comunidades que realmente encajen contigo.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid var(--border-color)', marginTop: 32 }}>
          {step > 1
            ? <button className="btn-secondary" style={{ fontSize: 16, padding: '12px 28px' }} onClick={() => setStep(s => s - 1)}>
                {Icons.arrowLeft({ s: 16 })} Volver
              </button>
            : <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={() => nav('/dashboard')}>
                Completar después
              </button>}
          {step < 6
            ? <button className="btn-primary" style={{ fontSize: 16, padding: '12px 28px' }} onClick={() => setStep(s => s + 1)}>
                Continuar {Icons.arrowRight({ s: 16 })}
              </button>
            : <button className="btn-primary" style={{ fontSize: 16, padding: '12px 28px' }} onClick={handleFinish} disabled={saveProfiling.isPending}>
                {saveProfiling.isPending ? 'Guardando...' : 'Finalizar perfil'} {Icons.arrowRight({ s: 16 })}
              </button>}
        </div>
      </div>
    </div>
  )
}
