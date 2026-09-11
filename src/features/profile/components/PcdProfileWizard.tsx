import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useUpdateProfile, useUpdateNeedsProfile } from '@features/auth/hooks/useAuth'
import {
  LIST_ACOMPANAMIENTO,
  CONDICIONES_PCD,
  NEURODIVERGENCIAS_LIST,
  LIST_TEMPORALIDAD,
  ESCALAS_OPCIONES,
  LIST_FORMATOS,
  INTEREST_SECTIONS,
  LIST_VIABILIDAD,
  LIST_NECESIDADES,
  LIST_AREAS_APOYO,
  MERIDA_ZONAS_SUGERIDAS,
  LIST_EDUCACION,
  LIST_TERAPIAS,
} from '@features/auth/constants/registrationCatalogos'
import { WizardNavButtons, ScaleCard, CheckChip, WizardProgress, WizardErrorBanner } from '@features/auth/components/WizardUI'
import { CatalogIcon } from '@features/auth/components/CatalogIcon'
import { FluentEmoji } from '@features/auth/constants/fluentEmojis'
import { calcEdad365, calcEtapaVida365 } from '@features/auth/lib/age'
import { saveOnboardingData } from '@features/auth/lib/onboardingStorage'
import { useQueryClient } from '@tanstack/react-query'
import { ProfileSummaryCard } from '@features/dashboard/components/AICards'
import { Icons } from '@shared/components/shared'

// ── Step types ───────────────────────────────────────────────────
type ProfileStep =
  | 'accommodation'
  | 'condition'
  | 'neurodivergence'
  | 'diagnosis'
  | 'history_edu'
  | 'history_therapy'
  | 'support_needs'
  | 'support_areas'
  | 'scales1'
  | 'scales2'
  | 'formats'
  | 'interests'
  | 'viability'
  | 'done'

const STEP_ORDER: ProfileStep[] = [
  'accommodation',
  'condition',
  'neurodivergence',
  'diagnosis',
  'history_edu',
  'history_therapy',
  'support_needs',
  'support_areas',
  'scales1',
  'scales2',
  'formats',
  'interests',
  'viability',
]
const TOTAL_STEPS = STEP_ORDER.length

// ── Interfaces ───────────────────────────────────────────────────
interface ConditionData {
  conditions: string[]
  neurodivergencias: string[]
  neuroOtro: string
  tieneDiagnostico: string
  diagnosticoEspecifico: string
  redFlagDiagnostico: boolean
  temporalidad: string
}

interface ScalesState {
  autonomia: number
  independencia: number
  comunicacion: number
  comprension: number
  energia: number
  movilidad: number
  social: number
  emocional: number
}

interface PcdProfileWizardProps {
  birthDate?: string
  onDone?: () => void
}

// ── Component ───────────────────────────────────────────────────
export default function PcdProfileWizard({ birthDate, onDone }: PcdProfileWizardProps) {
  const { addToast } = useUiStore()
  const nav = useNavigate()
  const updateProfile = useUpdateProfile()
  const updateNeedsProfile = useUpdateNeedsProfile()
  const qc = useQueryClient()

  const [step, setStep] = useState<ProfileStep>('accommodation')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // ── State ─────────────────────────────────────────────────────
  const [acompanamiento, setAcompanamiento] = useState('recomendaciones_paso')
  const [conditionData, setConditionData] = useState<ConditionData>({
    conditions: [], neurodivergencias: [], neuroOtro: '',
    tieneDiagnostico: 'si', diagnosticoEspecifico: '',
    redFlagDiagnostico: false, temporalidad: 'nacimiento',
  })
  const [scales, setScales] = useState<ScalesState>({
    autonomia: 3, independencia: 3, comunicacion: 4, comprension: 3,
    energia: 3, movilidad: 3, social: 3, emocional: 3,
  })
  const [formatos, setFormatos] = useState<string[]>(['texto', 'imagenes'])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [otrosIntereses, setOtrosIntereses] = useState('')
  const [viabilidad, setViabilidad] = useState('sin_restricciones')
  const [educacionHistory, setEducacionHistory] = useState<string[]>([])
  const [terapiaHistory, setTerapiaHistory] = useState<string[]>([])
  const [preferredZones, setPreferredZones] = useState<string[]>([])
  const [zonaInput, setZonaInput] = useState('')
  const [needsList, setNeedsList] = useState<string[]>([])
  const [supportAreas, setSupportAreas] = useState<string[]>([])

  // ── Helpers ────────────────────────────────────────────────────
  const scrollTop = () => {
    const el = document.querySelector('.profile-wizard-scroll') || document.querySelector('main')
    if (el) el.scrollTop = 0
  }

  const stepIndex = STEP_ORDER.indexOf(step)
  const progressPct = stepIndex >= 0 ? ((stepIndex + 1) / TOTAL_STEPS) * 100 : 100

  // ── Toggle handlers ───────────────────────────────────────────
  const toggleCondition = (cond: string) => {
    setConditionData(prev => {
      let next = [...prev.conditions]
      if (cond === 'Prefiero no responder') {
        next = next.includes(cond) ? [] : [cond]
      } else {
        next = next.filter(c => c !== 'Prefiero no responder')
        next = next.includes(cond) ? next.filter(c => c !== cond) : [...next, cond]
      }
      return { ...prev, conditions: next }
    })
  }

  const toggleNeuro = (item: string) => {
    setConditionData(prev => ({
      ...prev,
      neurodivergencias: prev.neurodivergencias.includes(item)
        ? prev.neurodivergencias.filter(x => x !== item)
        : [...prev.neurodivergencias, item],
    }))
  }

  const toggleFormato = (id: string) => setFormatos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleInterest = (item: string) => setSelectedInterests(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  const toggleEducacion = (item: string) => setEducacionHistory(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  const toggleTerapia = (item: string) => setTerapiaHistory(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  const toggleSuggestedZone = (zone: string) => setPreferredZones(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone])
  const toggleNeed = (item: string) => setNeedsList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  const toggleSupport = (item: string) => setSupportAreas(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])

  const addManualZone = () => {
    const val = zonaInput.trim()
    if (!val) return
    if (!preferredZones.includes(val)) setPreferredZones(prev => [...prev, val])
    setZonaInput('')
  }

  const removeZone = (zone: string) => setPreferredZones(prev => prev.filter(z => z !== zone))

  // ── Step navigation ───────────────────────────────────────────
  const goNext = (nextStep: ProfileStep) => { setError(''); setStep(nextStep); scrollTop() }
  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step)
    if (idx > 0) { setStep(STEP_ORDER[idx - 1]); scrollTop() }
  }

  // ── Submit handlers ───────────────────────────────────────────
  const handleAccommodationSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!acompanamiento) { setError('Por favor, selecciona cómo prefieres que Raíces te acompañe.'); return }
    goNext('condition')
  }

  const handleConditionSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (conditionData.conditions.length === 0) {
      setError('Selecciona al menos una opción que describa tu condición o "Prefiero no responder".')
      return
    }
    if (conditionData.conditions.includes('Neurodivergencia (especificar)')) {
      goNext('neurodivergence')
    } else {
      goNext('diagnosis')
    }
  }

  const handleNeuroSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (conditionData.neurodivergencias.length === 0) {
      setError('Por favor, selecciona al menos un tipo de neurodivergencia.')
      return
    }
    goNext('diagnosis')
  }

  const handleDiagnosisSubmit = (e: FormEvent) => { e.preventDefault(); goNext('history_edu') }
  const handleHistoryEduSubmit = (e: FormEvent) => { e.preventDefault(); goNext('history_therapy') }
  const handleHistoryTherapySubmit = (e: FormEvent) => { e.preventDefault(); goNext('support_needs') }
  const handleSupportNeedsSubmit = (e: FormEvent) => { e.preventDefault(); goNext('support_areas') }
  const handleSupportAreasSubmit = (e: FormEvent) => { e.preventDefault(); goNext('scales1') }

  const handleScales1Submit = (e: FormEvent) => {
    e.preventDefault()
    if (!scales.autonomia || !scales.independencia || !scales.comunicacion || !scales.comprension) {
      setError('Por favor, responde las 4 escalas de esta sección.')
      return
    }
    goNext('scales2')
  }

  const handleScales2Submit = (e: FormEvent) => {
    e.preventDefault()
    if (!scales.energia || !scales.movilidad || !scales.social || !scales.emocional) {
      setError('Por favor, responde las 4 escalas de esta sección.')
      return
    }
    goNext('formats')
  }

  const handleFormatsSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (formatos.length === 0) { setError('Selecciona al menos un formato.'); return }
    goNext('interests')
  }

  const handleInterestsSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (selectedInterests.length === 0) { setError('Por favor, selecciona al menos un interés.'); return }
    goNext('viability')
  }

  // ── Final submit ──────────────────────────────────────────────
  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const edad = birthDate ? calcEdad365(birthDate) : undefined
      const etapa = birthDate ? calcEtapaVida365(birthDate) : undefined
      const disabilityTypes = conditionData.conditions.filter(c => c !== 'Prefiero no responder')
      const allConditions = [...disabilityTypes, ...conditionData.neurodivergencias]

      // 1. Save scales
      const scalesPayload = {
        nivelAutonomia: scales.autonomia ?? 3, nivelIndependencia: scales.independencia ?? 3,
        nivelComunicacion: scales.comunicacion ?? 3, nivelComprension: scales.comprension ?? 3,
        nivelEnergia: scales.energia ?? 3, nivelMovilidad: scales.movilidad ?? 3,
        nivelSocial: scales.social ?? 3, nivelEmocional: scales.emocional ?? 3,
        tieneDiagnostico: conditionData.tieneDiagnostico === 'si',
        temporalidadOrigen: conditionData.temporalidad,
        preferenciaFormato: formatos[0] || 'texto',
        areasInteres: selectedInterests,
        viabilidadEconomica: viabilidad,
      }
      try { await api.post('/usuarios/escalas-vida', scalesPayload) } catch (err) { console.warn('Scales save notice:', err) }

      // 2. Save profile and needs
      try {
        await updateProfile.mutateAsync({})
        await updateNeedsProfile.mutateAsync({
          profiling: {
            disability_types: allConditions.length > 0 ? allConditions : disabilityTypes,
            severity: conditionData.conditions.includes('Prefiero no responder') ? null : conditionData.conditions.join(', '),
            communication_modes: formatos.filter(f => f !== 'Prefiero no responder'),
            mobility_needs: scales.movilidad >= 4 ? [] : ['Movilidad reducida'],
            tech_access: formatos,
            preferred_zones: preferredZones,
            needs: needsList,
            goals: selectedInterests,
            support_areas: supportAreas,
            education_history: educacionHistory,
            therapy_history: terapiaHistory,
            life_stage: etapa || null,
            current_concerns: conditionData.diagnosticoEspecifico || null,
            support_level: scales.comunicacion >= 4 ? 'independiente' : scales.comunicacion >= 2 ? 'con_apoyo' : 'necesita_apoyo_intensivo',
            ...(birthDate ? { birth_date: birthDate, age: edad } : {}),
          },
        })
      } catch (profErr) { console.warn('Profile save notice:', profErr) }

      // 3. Save local data
      saveOnboardingData({ interests: selectedInterests, viability: viabilidad, formatos })

      // 4. Invalidate queries to refresh dashboard
      qc.invalidateQueries({ queryKey: ['onboarding-status'] })
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['profile'] })

      addToast('¡Perfil completado! Ahora tienes acceso completo a Raíces.', 'success')
      setStep('done')
      onDone?.()
    } catch (err) {
      console.error('Profile completion error:', err)
      setError('Hubo un error al guardar tu perfil. Inténtalo de nuevo.')
      addToast('Error al guardar perfil.', 'error')
    } finally {
      setSending(false)
    }
  }

  // ── Shared styles ─────────────────────────────────────────────
  const headingStyle = { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 as const, color: 'var(--fg1)', margin: '0 0 4px' }
  const descStyle = { fontSize: 13 as const, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }
  const formStyle = { display: 'flex' as const, flexDirection: 'column' as const, gap: 14, flex: 1, minHeight: 0 }
  const chipContainerStyle = { display: 'flex' as const, flexWrap: 'wrap' as const, gap: 8 }

  // ── RENDER ────────────────────────────────────────────────────

  return (
    <div className="profile-wizard-scroll" style={{ width: '100%', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <WizardProgress accent="#229B58" title="Completa tu perfil" stepIndex={stepIndex} totalSteps={TOTAL_STEPS} />
      <WizardErrorBanner error={error} />

      {/* ── STEP: ACOMPAÑAMIENTO ── */}
      {step === 'accommodation' && (
        <form onSubmit={handleAccommodationSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Cómo te gustaría que Raíces te acompañe?</h2><p style={descStyle}>Elige la forma en que prefieres recibir apoyo y recursos.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIST_ACOMPANAMIENTO.map(opt => (
              <label key={opt.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                border: acompanamiento === opt.id ? '2px solid #229B58' : '1.5px solid var(--border-color)',
                background: acompanamiento === opt.id ? 'rgba(34,155,88,0.06)' : 'var(--bg-surface)',
              }}>
                <input type="radio" name="acomp" value={opt.id} checked={acompanamiento === opt.id} onChange={() => setAcompanamiento(opt.id)} style={{ marginTop: 3, accentColor: '#229B58' }} />
                <div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg1)' }}>{opt.label}</div><div style={{ fontSize: 12.5, color: 'var(--fg3)', marginTop: 2 }}>{opt.desc}</div></div>
              </label>
            ))}
          </div>
          <WizardNavButtons onBack={() => nav('/feed')} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: CONDICIÓN ── */}
      {step === 'condition' && (
        <form onSubmit={handleConditionSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Cómo describirías tu condición?</h2><p style={descStyle}>Selecciona una o varias opciones. Esta información nos ayuda a personalizar tu experiencia.</p></div>
          <div style={chipContainerStyle}>
            {CONDICIONES_PCD.map(cond => (
              <CheckChip key={cond} label={cond} selected={conditionData.conditions.includes(cond)} onToggle={() => toggleCondition(cond)} />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: NEURODIVERGENCIA ── */}
      {step === 'neurodivergence' && (
        <form onSubmit={handleNeuroSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Qué tipo de neurodivergencia?</h2><p style={descStyle}>Selecciona las que apliquen.</p></div>
          <div style={chipContainerStyle}>
            {NEURODIVERGENCIAS_LIST.map(item => (
              <CheckChip key={item} label={item} selected={conditionData.neurodivergencias.includes(item)} onToggle={() => toggleNeuro(item)} />
            ))}
          </div>
          {conditionData.neurodivergencias.includes('Otro') && (
            <input type="text" className="auth-input" placeholder="Especifica..." value={conditionData.neuroOtro} onChange={e => setConditionData({ ...conditionData, neuroOtro: e.target.value })} />
          )}
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: DIAGNÓSTICO ── */}
      {step === 'diagnosis' && (
        <form onSubmit={handleDiagnosisSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Tienes un diagnóstico formal?</h2><p style={descStyle}>Esto nos ayuda a sugerirte recursos más específicos.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{ id: 'si', label: 'Sí, tengo un diagnóstico' }, { id: 'no', label: 'No, aún no' }, { id: 'en_proceso', label: 'Estoy en proceso de evaluación' }].map(opt => (
              <label key={opt.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                borderRadius: 12, cursor: 'pointer',
                border: conditionData.tieneDiagnostico === opt.id ? '2px solid #229B58' : '1.5px solid var(--border-color)',
                background: conditionData.tieneDiagnostico === opt.id ? 'rgba(34,155,88,0.06)' : 'var(--bg-surface)',
              }}>
                <input type="radio" name="diag" value={opt.id} checked={conditionData.tieneDiagnostico === opt.id} onChange={() => setConditionData({ ...conditionData, tieneDiagnostico: opt.id })} style={{ accentColor: '#229B58' }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</span>
              </label>
            ))}
          </div>
          {conditionData.tieneDiagnostico === 'si' && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Diagnóstico específico <span style={{ color: 'var(--fg3)', fontWeight: 500, fontSize: 12 }}>(opcional)</span></label>
              <input type="text" className="auth-input" placeholder="Ej. Trastorno del Espectro Autista (TEA)" value={conditionData.diagnosticoEspecifico} onChange={e => setConditionData({ ...conditionData, diagnosticoEspecifico: e.target.value })} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>¿Desde cuándo vives con esta condición?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {LIST_TEMPORALIDAD.map(t => (
                <CheckChip key={t.id} label={t.label} selected={conditionData.temporalidad === t.id} onToggle={() => setConditionData({ ...conditionData, temporalidad: t.id })} />
              ))}
            </div>
          </div>
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: HISTORIAL EDUCATIVO ── */}
      {step === 'history_edu' && (
        <form onSubmit={handleHistoryEduSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>Tu historial educativo</h2><p style={descStyle}>¿Qué tipos de educación has recibido? (Selecciona las que apliquen)</p></div>
          <div style={chipContainerStyle}>
            {LIST_EDUCACION.map(item => <CheckChip key={item} label={item} selected={educacionHistory.includes(item)} onToggle={() => toggleEducacion(item)} />)}
          </div>
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: HISTORIAL DE TERAPIAS ── */}
      {step === 'history_therapy' && (
        <form onSubmit={handleHistoryTherapySubmit} style={formStyle}>
          <div><h2 style={headingStyle}>Terapias y apoyos</h2><p style={descStyle}>¿Qué terapias o apoyos has recibido o recibes actualmente?</p></div>
          <div style={chipContainerStyle}>
            {LIST_TERAPIAS.map(item => <CheckChip key={item} label={item} selected={terapiaHistory.includes(item)} onToggle={() => toggleTerapia(item)} />)}
          </div>
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: NECESIDADES ── */}
      {step === 'support_needs' && (
        <form onSubmit={handleSupportNeedsSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Qué necesitas ahora mismo?</h2><p style={descStyle}>Selecciona tus necesidades más importantes en este momento.</p></div>
          <div style={chipContainerStyle}>
            {LIST_NECESIDADES.map(item => <CheckChip key={item} label={item} selected={needsList.includes(item)} onToggle={() => toggleNeed(item)} />)}
          </div>
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: ÁREAS DE APOYO ── */}
      {step === 'support_areas' && (
        <form onSubmit={handleSupportAreasSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>Áreas de apoyo</h2><p style={descStyle}>¿En qué áreas te gustaría recibir más apoyo?</p></div>
          <div style={chipContainerStyle}>
            {LIST_AREAS_APOYO.map(item => <CheckChip key={item} label={item} selected={supportAreas.includes(item)} onToggle={() => toggleSupport(item)} />)}
          </div>
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: ESCALAS 1 ── */}
      {step === 'scales1' && (
        <form onSubmit={handleScales1Submit} style={formStyle}>
          <div><h2 style={headingStyle}>Tu día a día (parte 1)</h2><p style={descStyle}>Responde del 1 al 5 según tu experiencia actual.</p></div>
          <ScaleCard title="A. Autonomía" desc="¿Qué tanto participas en decisiones?" options={ESCALAS_OPCIONES.autonomia} value={scales.autonomia} onChange={v => setScales(prev => ({ ...prev, autonomia: Number(v) }))} />
          <ScaleCard title="B. Independencia" desc="¿Qué nivel de apoyo necesitas?" options={ESCALAS_OPCIONES.independencia} value={scales.independencia} onChange={v => setScales(prev => ({ ...prev, independencia: Number(v) }))} />
          <ScaleCard title="C. Comunicación" desc="¿Cómo expresas necesidades?" options={ESCALAS_OPCIONES.comunicacion} value={scales.comunicacion} onChange={v => setScales(prev => ({ ...prev, comunicacion: Number(v) }))} />
          <ScaleCard title="D. Comprensión" desc="¿Sigues instrucciones o decisiones?" options={ESCALAS_OPCIONES.comprension} value={scales.comprension} onChange={v => setScales(prev => ({ ...prev, comprension: Number(v) }))} />
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: ESCALAS 2 ── */}
      {step === 'scales2' && (
        <form onSubmit={handleScales2Submit} style={formStyle}>
          <div><h2 style={headingStyle}>Tu día a día (parte 2)</h2><p style={descStyle}>Continúa respondiendo del 1 al 5.</p></div>
          <ScaleCard title="E. Energía / Resistencia" desc="¿Cómo impactan tu energía y regulación?" options={ESCALAS_OPCIONES.energia} value={scales.energia} onChange={v => setScales(prev => ({ ...prev, energia: Number(v) }))} />
          <ScaleCard title="F. Movilidad" desc="¿Cómo interactúas físicamente con tu entorno?" options={ESCALAS_OPCIONES.movilidad} value={scales.movilidad} onChange={v => setScales(prev => ({ ...prev, movilidad: Number(v) }))} />
          <ScaleCard title="G. Social" desc="¿Cómo participas con personas o grupos?" options={ESCALAS_OPCIONES.social} value={scales.social} onChange={v => setScales(prev => ({ ...prev, social: Number(v) }))} />
          <ScaleCard title="H. Emocional" desc="¿Cómo impacta tu bienestar emocional?" options={ESCALAS_OPCIONES.emocional} value={scales.emocional} onChange={v => setScales(prev => ({ ...prev, emocional: Number(v) }))} />
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: FORMATOS ── */}
      {step === 'formats' && (
        <form onSubmit={handleFormatsSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Cómo prefieres recibir la información?</h2><p style={descStyle}>Selecciona los formatos que mejor se adaptan a ti.</p></div>
          <div style={chipContainerStyle}>
            {LIST_FORMATOS.map(f => <CheckChip key={f.id} label={f.label} selected={formatos.includes(f.id)} onToggle={() => toggleFormato(f.id)} />)}
          </div>
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: INTERESES ── */}
      {step === 'interests' && (
        <form onSubmit={handleInterestsSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Qué te interesa?</h2><p style={descStyle}>Selecciona actividades, intereses o áreas que te gusten.</p></div>
          {INTEREST_SECTIONS.map(section => (
            <div key={section.title}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', margin: '8px 0 6px' }}>{section.title}</h3>
              <div style={chipContainerStyle}>
                {section.items.map(item => <CheckChip key={item} label={item} selected={selectedInterests.includes(item)} onToggle={() => toggleInterest(item)} />)}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)' }}>Otros intereses</label>
            <input type="text" className="auth-input" placeholder="Escribe otros intereses..." value={otrosIntereses} onChange={e => setOtrosIntereses(e.target.value)} />
          </div>
          <WizardNavButtons onBack={goBack} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: VIABILIDAD ── */}
      {step === 'viability' && (
        <form onSubmit={handleFinalSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>Viabilidad económica</h2><p style={descStyle}>Esto nos ayuda a sugerirte opciones accesibles.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIST_VIABILIDAD.map(opt => (
              <label key={opt.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                borderRadius: 12, cursor: 'pointer',
                border: viabilidad === opt.id ? '2px solid #229B58' : '1.5px solid var(--border-color)',
                background: viabilidad === opt.id ? 'rgba(34,155,88,0.06)' : 'var(--bg-surface)',
              }}>
                <input type="radio" name="viab" value={opt.id} checked={viabilidad === opt.id} onChange={() => setViabilidad(opt.id)} style={{ accentColor: '#229B58' }} />
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>{('desc' in opt) && <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{(opt as any).desc}</div>}</div>
              </label>
            ))}
          </div>
          <WizardNavButtons
            onBack={goBack}
            submitLabel={sending ? 'Guardando...' : '¡Completar perfil!'}
            submitIcon={sending ? null : <CatalogIcon icon={FluentEmoji.destello} size={14} />}
            submitDisabled={sending}
          />
        </form>
      )}

      {/* ── STEP: DONE ── */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeIn 0.4s ease-out' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={headingStyle}>¡Tu perfil está completo!</h2>
          <p style={descStyle}>Raíces ha analizado tus preferencias y personalizado tu experiencia.</p>
          
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <ProfileSummaryCard />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button
              type="button"
              onClick={() => nav('/feed')}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 24,
                background: 'linear-gradient(135deg, #229B58 0%, #073B4C 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 14.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(34, 155, 88, 0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.08)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none'
                e.currentTarget.style.transform = 'none'
              }}
            >
              Ir a mi Dashboard {Icons.arrowRight({ s: 18 })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
