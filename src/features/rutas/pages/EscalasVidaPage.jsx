import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSaveEscalasVida } from '@features/profile/hooks/useProfile'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'

const SCALES = [
  {
    key: 'nivelAutonomia',
    label: 'Autonomía',
    desc: 'Capacidad para realizar actividades básicas por cuenta propia.',
    icon: '👤',
    options: [
      { val: 4, label: 'Me desenvuelvo con autonomía' },
      { val: 3, label: 'Requiero apoyo en algunas decisiones' },
      { val: 2, label: 'Requiero apoyo frecuente para elegir y decidir' },
      { val: 1, label: 'Requiero acompañamiento constante en mis decisiones' }
    ]
  },
  {
    key: 'nivelIndependencia',
    label: 'Independencia',
    desc: 'Capacidad para tomar decisiones y valerse por sí mismo en el entorno.',
    icon: '🗺️',
    options: [
      { val: 4, label: 'Me desenvuelvo con autonomía' },
      { val: 3, label: 'Requiero apoyo en algunas actividades' },
      { val: 2, label: 'Requiero apoyo frecuente' },
      { val: 1, label: 'Requiero acompañamiento constante' }
    ]
  },
  {
    key: 'nivelComunicacion',
    label: 'Comunicación',
    desc: 'Habilidad para expresar ideas, deseos y necesidades.',
    icon: '💬',
    options: [
      { val: 4, label: 'Me comunico de manera verbal y/o no verbal autónoma' },
      { val: 3, label: 'Me comunico bien con apoyos o adaptaciones sencillas' },
      { val: 2, label: 'Requiero apoyo frecuente para expresarme y comprender' },
      { val: 1, label: 'Requiero acompañamiento constante / Sistemas aumentativos' }
    ]
  },
  {
    key: 'nivelComprension',
    label: 'Comprensión',
    desc: 'Habilidad para entender instrucciones, conceptos y contextos.',
    icon: '🧠',
    options: [
      { val: 4, label: 'Comprendo instrucciones de manera independiente' },
      { val: 3, label: 'Comprendo con explicaciones adicionales o apoyos visuales' },
      { val: 2, label: 'Requiero apoyo frecuente y repetición para comprender' },
      { val: 1, label: 'Requiero apoyo y acompañamiento constante para la comprensión' }
    ]
  },
  {
    key: 'nivelEnergia',
    label: 'Energía',
    desc: 'Nivel diario de vitalidad y resistencia física/mental.',
    icon: '⚡',
    options: [
      { val: 4, label: 'Alta resistencia y energía constante para mis actividades' },
      { val: 3, label: 'Energía moderada con pausas o apoyos puntuales' },
      { val: 2, label: 'Baja energía, requiero dosificar mucho mis actividades' },
      { val: 1, label: 'Fatiga o baja energía constante, requiero asistencia completa' }
    ]
  },
  {
    key: 'nivelMovilidad',
    label: 'Movilidad',
    desc: 'Capacidad física para trasladarse y realizar movimientos corporales.',
    icon: '🏃',
    options: [
      { val: 4, label: 'Movilidad completamente autónoma e independiente' },
      { val: 3, label: 'Movilidad con uso independiente de ayudas técnicas' },
      { val: 2, label: 'Requiero apoyo de otra persona para desplazarme a veces' },
      { val: 1, label: 'Requiero apoyo y asistencia constante para la movilidad' }
    ]
  },
  {
    key: 'nivelSocial',
    label: 'Socialización',
    desc: 'Habilidad para entablar relaciones, participar en grupos e interactuar.',
    icon: '🤝',
    options: [
      { val: 4, label: 'Me relaciono y participo socialmente de manera autónoma' },
      { val: 3, label: 'Participo socialmente con apoyo o mediación en algunos entornos' },
      { val: 2, label: 'Requiero apoyo frecuente para interactuar y socializar' },
      { val: 1, label: 'Requiero acompañamiento constante en interacciones sociales' }
    ]
  },
  {
    key: 'nivelEmocional',
    label: 'Emocional',
    desc: 'Capacidad para procesar emociones, tolerar la frustración y mantener bienestar mental.',
    icon: '❤️',
    options: [
      { val: 4, label: 'Estabilidad emocional autónoma y buen manejo de la frustración' },
      { val: 3, label: 'Estable la mayor parte del tiempo con apoyos emocionales breves' },
      { val: 2, label: 'Fluctuaciones frecuentes, requiero apoyo constante' },
      { val: 1, label: 'Crisis o desregulación frecuente, requiero acompañamiento constante' }
    ]
  }
]

const LEVEL_LABELS = {
  1: { title: 'Nivel 1: Apoyo total', desc: 'Requiere asistencia constante y directa en esta área.' },
  2: { title: 'Nivel 2: Apoyo sustancial', desc: 'Realiza actividades con supervisión o asistencia parcial frecuente.' },
  3: { title: 'Nivel 3: Apoyo moderado', desc: 'Es mayormente autónomo, requiere apoyos puntuales o recordatorios.' },
  4: { title: 'Nivel 4: Completamente autónomo', desc: 'Se desenvuelve de manera fluida sin necesidad de asistencia.' },
}

export default function EscalasVidaPage() {
  const navigate = useNavigate()
  const { addToast } = useUiStore()
  const saveEscalas = useSaveEscalasVida()
  const { data: catalogos } = useCatalogos()

  const [form, setForm] = useState({
    nivelAutonomia: 3,
    nivelIndependencia: 3,
    nivelComunicacion: 3,
    nivelComprension: 3,
    nivelEnergia: 3,
    nivelMovilidad: 3,
    nivelSocial: 3,
    nivelEmocional: 3,
    tieneDiagnostico: true,
    temporalidadOrigen: '',
    preferenciaFormato: '',
    areasInteres: [],
    viabilidadEconomica: '',
  })

  const [activeStep, setActiveStep] = useState(1) // 1: Scales, 2: Metadata

  const handleToggleArea = (id) => {
    setForm(f => ({
      ...f,
      areasInteres: f.areasInteres.includes(id)
        ? f.areasInteres.filter(a => a !== id)
        : [...f.areasInteres, id]
    }))
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        nivelAutonomia: Number(form.nivelAutonomia),
        nivelIndependencia: Number(form.nivelIndependencia),
        nivelComunicacion: Number(form.nivelComunicacion),
        nivelComprension: Number(form.nivelComprension),
        nivelEnergia: Number(form.nivelEnergia),
        nivelMovilidad: Number(form.nivelMovilidad),
        nivelSocial: Number(form.nivelSocial),
        nivelEmocional: Number(form.nivelEmocional),
      }
      await saveEscalas.mutateAsync(payload)
      addToast('¡Evaluación guardada con éxito!', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.message || 'No se pudo guardar la evaluación. Intenta de nuevo.', 'error')
    }
  }

  // Get catalogs options
  const listTemporalidad = catalogos?.temporalidadOrigen ?? [
    { id: 'nacimiento', label: 'Desde nacimiento' },
    { id: 'infancia', label: 'Infancia' },
    { id: 'adolescencia', label: 'Adolescencia' },
    { id: 'vida_adulta', label: 'Vida adulta' },
    { id: 'progresiva', label: 'Progresiva' },
    { id: 'en_evaluacion', label: 'En evaluación' },
  ]
  const listFormatos = catalogos?.preferenciaFormato ?? [
    { id: 'texto', label: 'Texto', description: 'Artículos, guías y documentos' },
    { id: 'imagenes', label: 'Imágenes', description: 'Infografías y fotos' },
    { id: 'audio', label: 'Audio', description: 'Podcasts y audiolibros' },
    { id: 'video', label: 'Video', description: 'Tutoriales y videos' },
    { id: 'presencial', label: 'Presencial', description: 'Actividades en persona' },
  ]
  const listViabilidad = catalogos?.viabilidadEconomica ?? [
    { id: 'gratuita_becas', label: 'Gratuita o con becas' },
    { id: 'bajo_costo', label: 'Bajo costo' },
    { id: 'moderada', label: 'Costo moderado' },
    { id: 'sin_restricciones', label: 'Sin restricciones' },
  ]
  const listAreas = catalogos?.areasInteres ?? [
    { id: 'salud', label: 'Salud y Terapia' },
    { id: 'educacion', label: 'Educación' },
    { id: 'empleo', label: 'Empleo' },
    { id: 'comunidad', label: 'Comunidad y Recreación' },
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '12px 16px 64px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, animation: 'fadeInUp 0.5s ease both' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 16, fontFamily: 'var(--font-body)' }}>
          {Icons.arrowLeft({ s: 16 })} Volver al inicio
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Cómo vives hoy
        </h1>
        <p style={{ fontSize: 16, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
          Esta evaluación nos permite comprender tus escalas de vida para sugerir recomendaciones y rutas de desarrollo adaptadas a tu realidad.
        </p>
      </div>

      {/* Stepper progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{ flex: 1, height: 6, background: activeStep >= 1 ? 'var(--primary)' : 'var(--border-color)', borderRadius: 3, transition: 'all 0.3s' }} />
        <div style={{ flex: 1, height: 6, background: activeStep >= 2 ? 'var(--primary)' : 'var(--border-color)', borderRadius: 3, transition: 'all 0.3s' }} />
      </div>

      {activeStep === 1 && (
        <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', marginBottom: 20 }}>1. Evalúa tus escalas de vida (Niveles del 1 al 4)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {SCALES.map((scale) => {
              const currentLevel = form[scale.key]
              return (
                <div key={scale.key} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 14,
                  padding: 24,
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}>
                  {/* Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <span style={{ fontSize: 24, padding: 8, background: 'var(--bg-warm)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {scale.icon}
                    </span>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>{scale.label}</h3>
                      <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: 0 }}>{scale.desc}</p>
                    </div>
                  </div>

                  {/* Level Slider / Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    {scale.options.map(opt => {
                      const isSelected = currentLevel === opt.val
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, [scale.key]: opt.val }))}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 10,
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                            background: isSelected ? 'rgba(33, 48, 82, 0.04)' : '#ffffff',
                            color: isSelected ? 'var(--primary)' : 'var(--fg2)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 600,
                            fontSize: 13.5,
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: '1.5px solid rgba(0,0,0,0.2)',
                            background: isSelected ? 'var(--primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            flexShrink: 0
                          }}>
                            {isSelected && Icons.check({ s: 12 })}
                          </div>
                          <span style={{ flex: 1 }}>{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Level Explanation Card */}
                  <div style={{
                    background: 'var(--bg-warm)',
                    borderLeft: '4px solid var(--primary)',
                    padding: '12px 16px',
                    borderRadius: '0 8px 8px 0',
                    fontSize: 13,
                  }}>
                    <strong style={{ color: 'var(--fg1)', display: 'block', marginBottom: 2 }}>
                      {LEVEL_LABELS[currentLevel].title}
                    </strong>
                    <span style={{ color: 'var(--fg2)' }}>
                      {LEVEL_LABELS[currentLevel].desc}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button className="auth-btn-primary" onClick={() => setActiveStep(2)} style={{ width: 'auto', padding: '14px 28px' }}>
              Siguiente Paso {Icons.arrowRight({ s: 16 })}
            </button>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', marginBottom: 24 }}>2. Detalles clínicos y preferencias</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow-sm)' }}>
            {/* Tiene Diagnóstico */}
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 12 }}>¿Cuentas con un diagnóstico formal?</label>
              <div style={{ display: 'flex', gap: 14 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                  border: `1.5px solid ${form.tieneDiagnostico ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: form.tieneDiagnostico ? 'var(--primary-subtle)' : 'transparent',
                  borderRadius: 10, cursor: 'pointer', flex: 1, fontWeight: 600, color: form.tieneDiagnostico ? 'var(--primary)' : 'var(--fg2)'
                }}>
                  <input type="radio" checked={form.tieneDiagnostico === true} onChange={() => setForm(f => ({ ...f, tieneDiagnostico: true }))} style={{ accentColor: 'var(--primary)' }} />
                  Sí, tengo un diagnóstico formal
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                  border: `1.5px solid ${!form.tieneDiagnostico ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: !form.tieneDiagnostico ? 'var(--primary-subtle)' : 'transparent',
                  borderRadius: 10, cursor: 'pointer', flex: 1, fontWeight: 600, color: !form.tieneDiagnostico ? 'var(--primary)' : 'var(--fg2)'
                }}>
                  <input type="radio" checked={form.tieneDiagnostico === false} onChange={() => setForm(f => ({ ...f, tieneDiagnostico: false }))} style={{ accentColor: 'var(--primary)' }} />
                  No, me encuentro en proceso o no tengo
                </label>
              </div>
            </div>

            {/* Temporalidad */}
            <div>
              <label htmlFor="select-temporalidad" style={labelStyle}>Origen / Temporalidad de la condición</label>
              <select id="select-temporalidad" className="onboarding-input auth-select" value={form.temporalidadOrigen} onChange={e => setForm(f => ({ ...f, temporalidadOrigen: e.target.value }))} style={{ marginTop: 8 }}>
                <option value="">Selecciona una opción...</option>
                {listTemporalidad.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Formato Preferido */}
            <div>
              <label htmlFor="select-formato" style={labelStyle}>Formato de contenido preferido</label>
              <select id="select-formato" className="onboarding-input auth-select" value={form.preferenciaFormato} onChange={e => setForm(f => ({ ...f, preferenciaFormato: e.target.value }))} style={{ marginTop: 8 }}>
                <option value="">Selecciona...</option>
                {listFormatos.map(f => (
                  <option key={f.id} value={f.id}>{f.label} — {f.description || ''}</option>
                ))}
              </select>
            </div>

            {/* Viabilidad Económica */}
            <div>
              <span style={{ ...labelStyle, display: 'block', marginBottom: 12 }}>Presupuesto / Viabilidad económica</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {listViabilidad.map(v => {
                  const isChecked = form.viabilidadEconomica === v.id
                  return (
                    <button key={v.id} type="button" onClick={() => setForm(f => ({ ...f, viabilidadEconomica: v.id }))} style={{
                      padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: isChecked ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: isChecked ? 'var(--primary)' : 'var(--fg2)',
                      fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, border: '1.5px solid rgba(0,0,0,0.2)',
                        background: isChecked ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                      }}>
                        {isChecked && Icons.check({ s: 12 })}
                      </div>
                      {v.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Áreas de Interés */}
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 12 }}>Áreas de interés principales</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {listAreas.map(area => {
                  const isChecked = form.areasInteres.includes(area.id)
                  return (
                    <button key={area.id} type="button" onClick={() => handleToggleArea(area.id)} style={{
                      padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: isChecked ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: isChecked ? 'var(--primary)' : 'var(--fg2)',
                      fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, border: '1.5px solid rgba(0,0,0,0.2)',
                        background: isChecked ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                      }}>
                        {isChecked && Icons.check({ s: 12 })}
                      </div>
                      {area.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button className="auth-btn-secondary" onClick={() => setActiveStep(1)} style={{ width: 'auto', padding: '14px 28px' }}>
              {Icons.arrowLeft({ s: 16 })} Volver atrás
            </button>
            <button className="auth-btn-primary" onClick={handleSave} disabled={saveEscalas.isPending} style={{ width: 'auto', padding: '14px 28px' }}>
              {saveEscalas.isPending ? 'Guardando...' : 'Finalizar Evaluación'} {Icons.check({ s: 16 })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
