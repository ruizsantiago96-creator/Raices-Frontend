import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSaveProfiling } from '../hooks/useProfile'
import { useUiStore } from '@shared/stores/uiStore'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons, BrandMark, labelStyle, inputStyle } from '@shared/components/shared'

const STEPS = [
  { title: 'Fecha de nacimiento', desc: 'Conocer tu cumpleaños nos ayuda a personalizar tu entorno y calcular tu etapa de vida.', icon: Icons.user },
  { title: 'Condición y necesidades', desc: 'Adaptar la accesibilidad a tus necesidades específicas.', icon: Icons.activity },
  { title: 'Historial y recorrido', desc: 'Queremos saber qué has hecho para continuar construyendo.', icon: Icons.compass },
  { title: 'Tus objetivos', desc: '¿Hacia dónde vamos? Tus metas de corto y mediano plazo.', icon: Icons.target },
  { title: 'Estado actual', desc: 'Cómo te sientes hoy y en qué necesitas más soporte.', icon: Icons.heartPulse },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    disability_types: [], disability_severity: '', communication_modes: [],
    mobility_needs: [], tech_access: [], preferred_zones: [],
    stage: '', goals: [], support_areas: '',
    birth_date: '', age: '',
  })
  const saveProfiling = useSaveProfiling()
  const { addToast } = useUiStore()
  const nav = useNavigate()
  const { data: catalogos } = useCatalogos()

  // Catálogos del backend + fallbacks locales
  const NEEDS_FALLBACK = [
    'Acceso a educación inclusiva',
    'Apoyo psicológico / emocional',
    'Terapia de lenguaje',
    'Terapia física / rehabilitación',
    'Accesibilidad en espacios públicos',
    'Apoyo para empleo',
    'Asistencia técnica / tecnológica',
    'Servicios de salud especializados',
    'Apoyo legal / derechos',
    'Transporte accesible',
    'Ayuda para trámites gubernamentales',
    'Red de apoyo familiar',
    'Grupos de apoyo entre pares',
  ]

  const GOALS_FALLBACK = [
    // 💼 Empleo
    'Buscar mi primer empleo',
    'Encontrar empleo inclusivo o adaptado',
    'Capacitarme para insertarme laboralmente',
    'Mejorar mi CV o perfil profesional',
    // 🎉 Eventos y actividades
    'Asistir a eventos inclusivos en mi zona',
    'Encontrar talleres o cursos para mí / mi familiar',
    'Conocer ferias de empleo accesibles',
    'Participar en actividades recreativas inclusivas',
    // 🤝 Comunidad y apoyo
    'Conocer personas en situaciones similares',
    'Encontrar grupos de apoyo familiar',
    'Conectarme con otras familias o tutores',
    'Compartir mi experiencia y ayudar a otros',
    // 🏛️ Instituciones y servicios
    'Encontrar instituciones especializadas cerca de mí',
    'Conocer servicios de salud, terapia o rehabilitación',
    'Acceder a programas educativos inclusivos',
  ]

  const NEEDS = catalogos?.necesidades?.length ? catalogos.necesidades : NEEDS_FALLBACK
  const GOALS = catalogos?.metas?.length ? catalogos.metas : GOALS_FALLBACK
  const STAGES = catalogos?.etapasCrecimiento ?? []

  // Helpers para catálogos que pueden ser strings u objetos {id, label}
  const getLabel = (item) => typeof item === 'string' ? item : item?.label ?? ''
  const getValue = (item) => typeof item === 'string' ? item : item?.id ?? ''
  
  // Tipos de condición inclusivos y politically correct (términos OMS/CONADIS)
  const DISABILITY_TYPES = [
    'Discapacidad física / Motriz',
    'Discapacidad visual',
    'Discapacidad auditiva',
    'Discapacidad intelectual',
    'Condición del espectro autista (TEA)',
    'Discapacidad psicosocial',
    'Síndrome de Down',
    'Discapacidad del lenguaje',
    'Discapacidad del aprendizaje',
    'Condición neurológica',
    'Movilidad reducida',
    'Condición crónica',
    'Enfermedad rara',
    'Condición invisible',
    'Discapacidad múltiple',
    'Otra',
    'No tengo ninguna condición'
  ]

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
    <button 
      onClick={onClick} 
      type="button"
      className="onboarding-option-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: '12px',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
        background: active ? 'var(--primary-subtle)' : 'var(--bg-surface)',
        color: active ? 'var(--primary)' : 'var(--fg2)',
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: active ? '0 4px 12px rgba(0, 78, 82, 0.08)' : 'none',
      }}
    >
      <div 
        data-active={active}
        className="onboarding-option-checkbox"
        style={{
          width: 18,
          height: 18,
          borderRadius: '4px',
          border: `1.5px solid ${active ? 'var(--primary)' : 'rgba(0, 0, 0, 0.2)'}`,
          background: active ? 'var(--primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        {active && Icons.check({ s: 12 })}
      </div>
      <span style={{ lineHeight: 1.3, flex: 1 }}>{label}</span>
    </button>
  )

  const radioCard = (label, name, checked, onChange) => (
    <label 
      className="onboarding-radio-card"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        padding: '14px 18px', 
        border: `1.5px solid ${checked ? 'var(--primary)' : 'var(--border-color)'}`, 
        borderRadius: '12px', 
        cursor: 'pointer', 
        background: checked ? 'var(--primary-subtle)' : 'var(--bg-surface)', 
        color: checked ? 'var(--primary)' : 'var(--fg2)',
        fontWeight: 500,
        fontSize: 15,
        boxShadow: checked ? '0 4px 12px rgba(0, 78, 82, 0.08)' : 'none',
      }}
    >
      <input 
        type="radio" 
        name={name} 
        checked={checked} 
        onChange={onChange} 
        style={{ accentColor: 'var(--primary)', width: 18, height: 18, margin: 0 }} 
      />
      <span style={{ lineHeight: 1.2 }}>{label}</span>
    </label>
  )

  return (
    <div className="onboarding-layout" style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-body)', background: 'var(--bg-warm)' }}>
      <style>{`
        .onboarding-input {
          width: 100%;
          padding: 15px 22px;
          border: 1.5px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          font-size: 15px;
          box-sizing: border-box;
          font-family: var(--font-body);
          color: var(--fg1);
          background: var(--bg-surface);
          outline: none;
          transition: all 0.2s ease;
        }
        html[data-theme="dark"] .onboarding-input {
          border-color: rgba(255, 255, 255, 0.15);
        }
        .onboarding-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px var(--primary-subtle) !important;
        }
        .onboarding-btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          padding: 16px 28px;
          cursor: pointer;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .onboarding-btn-primary:hover {
          background: var(--primary-dark);
        }
        .onboarding-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .onboarding-btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--fg2);
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          padding: 14px 20px;
          cursor: pointer;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .onboarding-btn-secondary:hover {
          background: var(--bg-warm);
        }
        .onboarding-option-card {
          border: 1.5px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--fg2);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .onboarding-option-card:hover {
          border-color: var(--primary) !important;
          background: var(--primary-subtle) !important;
          color: var(--primary) !important;
        }
        .onboarding-option-card:hover .onboarding-option-checkbox {
          border-color: var(--primary) !important;
        }
        html[data-theme="dark"] .onboarding-option-checkbox {
          border-color: rgba(255, 255, 255, 0.25) !important;
        }
        html[data-theme="dark"] .onboarding-option-checkbox[data-active="true"] {
          border-color: var(--primary) !important;
        }
        .onboarding-radio-card {
          border: 1.5px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--fg2);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .onboarding-radio-card:hover {
          border-color: var(--primary) !important;
          background: var(--primary-subtle) !important;
          color: var(--primary) !important;
        }
        @media (max-width: 820px) {
          .onboarding-brand-column {
            display: none !important;
          }
          .onboarding-form-column {
            padding: 40px 24px !important;
          }
        }
      `}</style>

      {/* Left column: Formulario */}
      <div className="onboarding-form-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 64px', boxSizing: 'border-box', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>

          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--fg3)', fontWeight: 700, marginBottom: 6 }}>Paso {step} de 5</p>
            <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, marginBottom: 28, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(step / 5) * 100}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.4s ease' }} />
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{cur.title}</h1>
          <p style={{ fontSize: 16, color: 'var(--fg2)', margin: '0 0 28px', lineHeight: 1.5 }}>{cur.desc}</p>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>Ingresa tu fecha de nacimiento</label>
                <input 
                  type="date" 
                  className="onboarding-input" 
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  value={data.birth_date || ''} 
                  onChange={e => {
                    const bdate = e.target.value
                    let calculatedAge = ''
                    let calculatedStage = ''
                    if (bdate) {
                      const birthDate = new Date(bdate)
                      if (!isNaN(birthDate.getTime())) {
                        const today = new Date()
                        let age = today.getFullYear() - birthDate.getFullYear()
                        const m = today.getMonth() - birthDate.getMonth()
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                          age--
                        }
                        calculatedAge = String(age)
                        if (age <= 12) calculatedStage = 'infancia'
                        else if (age <= 17) calculatedStage = 'adolescencia'
                        else if (age <= 29) calculatedStage = 'adultoJoven'
                        else if (age <= 59) calculatedStage = 'adulto'
                        else calculatedStage = 'mayor'
                      }
                    }
                    setData(d => ({
                      ...d,
                      birth_date: bdate,
                      age: calculatedAge,
                      stage: calculatedStage
                    }))
                  }} 
                />
              </div>
              
              {data.birth_date && data.age && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '14px 18px', 
                  background: 'var(--primary-subtle)', 
                  borderLeft: '4px solid var(--primary)', 
                  borderRadius: '0 8px 8px 0',
                  marginTop: 10
                }}>
                  <div style={{ color: 'var(--primary)' }}>
                    {Icons.sparkles({ s: 20 })}
                  </div>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', display: 'block' }}>
                      Edad e intervalo de vida calculados
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--fg2)' }}>
                      Tienes <strong>{data.age} años</strong>, correspondiente a la etapa de{' '}
                      <strong>
                        {data.stage === 'infancia' && 'Infancia (0-12)'}
                        {data.stage === 'adolescencia' && 'Adolescencia (13-17)'}
                        {data.stage === 'adultoJoven' && 'Adulto joven (18-29)'}
                        {data.stage === 'adulto' && 'Adulto (30-59)'}
                        {data.stage === 'mayor' && 'Adulto mayor (60+)'}
                      </strong>.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>Tipo de discapacidad</label>
                <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>Selecciona todos los que apliquen</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                  {DISABILITY_TYPES.map(t => <div key={t}>{pillBtn(data.disability_types.includes(t), t, () => toggle('disability_types', t))}</div>)}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>Nivel de apoyo requerido</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {['Bajo', 'Medio', 'Alto'].map(l => <div key={l}>{radioCard(l, 'severity', data.disability_severity === l, () => setData(d => ({ ...d, disability_severity: l })))}</div>)}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>Necesidades principales</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                  {NEEDS.map((n, i) => {
                    const val = getValue(n)
                    return <div key={val || i}>{pillBtn(data.mobility_needs.includes(val), getLabel(n), () => toggle('mobility_needs', val))}</div>
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div><label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>Educación</label>
                <select className="onboarding-input" value={data.education || ''} onChange={e => setData(d => ({ ...d, education: e.target.value }))}>
                  <option value="">Nivel actual o tipo de escuela...</option>
                  <option>Escuela regular (inclusiva)</option>
                  <option>Centro de educación especial</option>
                  <option>Educación en casa</option>
                  <option>Universidad / preparatoria</option>
                  <option>Graduado</option>
                </select>
              </div>
              <div><label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>Terapias recibidas</label><input placeholder="Ej. Física, Lenguaje, Ocupacional..." className="onboarding-input" value={data.therapies || ''} onChange={e => setData(d => ({ ...d, therapies: e.target.value }))} /></div>
              <div><label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>Experiencia laboral</label><input placeholder="Ej. Buscando primer empleo, Capacitación..." className="onboarding-input" value={data.work || ''} onChange={e => setData(d => ({ ...d, work: e.target.value }))} /></div>
              <div><label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>Experiencia social</label>
                <textarea placeholder="¿Participa en grupos? ¿Qué actividades disfruta?" className="onboarding-input" style={{ height: 80, resize: 'none' }} value={data.social || ''} onChange={e => setData(d => ({ ...d, social: e.target.value }))} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>¿Qué estás buscando actualmente?</label>
              <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '4px 0 16px' }}>Selecciona todas las que apliquen</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GOALS.map((g, i) => {
                  const val = getValue(g)
                  const checked = data.goals.includes(val);
                  return (
                    <label 
                      key={val || i} 
                      className="onboarding-radio-card"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12, 
                        padding: '16px', 
                        border: `1.5px solid ${checked ? 'var(--primary)' : 'var(--border-color)'}`, 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        background: checked ? 'var(--primary-subtle)' : 'var(--bg-surface)', 
                        color: checked ? 'var(--primary)' : 'var(--fg2)',
                        boxShadow: checked ? '0 4px 12px rgba(0, 78, 82, 0.08)' : 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={() => toggle('goals', val)} 
                        style={{ accentColor: 'var(--primary)', width: 18, height: 18, margin: 0 }} 
                      />
                      <span style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.2 }}>{getLabel(g)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div><label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>¿Dónde sientes que necesitas más apoyo hoy?</label>
                <textarea placeholder="Ej. En manejar la ansiedad, en encontrar apoyo escolar..." className="onboarding-input" style={{ height: 90, resize: 'none' }} value={data.support_areas} onChange={e => setData(d => ({ ...d, support_areas: e.target.value }))} />
              </div>
              <div><label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>¿Qué te preocupa actualmente?</label>
                <textarea placeholder="Lo que compartas alimentará nuestras recomendaciones de comunidad y contenido." className="onboarding-input" style={{ height: 90, resize: 'none' }} value={data.concerns || ''} onChange={e => setData(d => ({ ...d, concerns: e.target.value }))} />
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          {step > 1
            ? <button className="onboarding-btn-primary" type="button" onClick={() => setStep(s => s - 1)}>
                {Icons.arrowLeft({ s: 16 })} Volver
              </button>
            : <button className="onboarding-btn-secondary" type="button" onClick={() => nav('/dashboard')}>
                Completar después
              </button>}
          {step < 5
            ? <button 
                className="onboarding-btn-primary" 
                type="button" 
                disabled={step === 1 && !data.birth_date}
                onClick={() => setStep(s => s + 1)}
              >
                Continuar {Icons.arrowRight({ s: 18 })}
              </button>
            : <button className="onboarding-btn-primary" type="button" onClick={handleFinish} disabled={saveProfiling.isPending}>
                {saveProfiling.isPending ? 'Guardando...' : 'Finalizar perfil'} {Icons.arrowRight({ s: 18 })}
              </button>}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--fg3)' }}>Puedes actualizar esto en cualquier momento</p>
      </div>

      {/* Right column: Branding */}
      <div className="onboarding-brand-column" style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #001D21 0%, #004E52 100%)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        color: 'white', 
        padding: 48,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Grid pattern overlay */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.05, 
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} />
        
        {/* Decorative subtle circles */}
        <div className="animate-bubble-1" style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: '-100px', right: '-100px' }} />
        <div className="animate-bubble-2" style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', bottom: '-50px', left: '-50px' }} />

        <div style={{ textAlign: 'center', zIndex: 2, maxWidth: 460 }}>
          <BrandMark onClick={() => nav('/dashboard')} light size={22} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, margin: '24px 0 12px', color: 'white', letterSpacing: '-0.02em' }}>
            {cur.title}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: '0 0 32px', fontWeight: 500 }}>
            {cur.desc}
          </p>
          
          {/* Step indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', maxWidth: 300, margin: '0 auto' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: i + 1 === step ? 1 : i + 1 < step ? 0.7 : 0.3 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i + 1 <= step ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i + 1 < step ? <span style={{ color: 'var(--primary-dark)', fontSize: 13 }}>✓</span> : <span style={{ color: i + 1 === step ? 'var(--primary-dark)' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
