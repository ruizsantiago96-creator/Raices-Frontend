import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useUpdateProfile, useUpdateNeedsProfile, useMe } from '@features/auth/hooks/useAuth'
import { mapErrorMessage } from '@features/auth/lib/mapErrorMessage'
import { useOnboardingStatus, useSaveOnboardingBorrador } from '@features/institutions/hooks/useRecommendations'
import { formatOnboardingQuestion } from '../lib/onboardingInterpolation'
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
  LIST_GRADO_ESTUDIOS,
  LIST_TEMAS_EXPLORAR,
  LIST_BARRERAS_SOCIALES,
} from '@features/auth/constants/registrationCatalogos'
import { WizardNavButtons, ScaleCard, CheckChip, VerticalCheckCard, WizardProgress, WizardErrorBanner } from '@features/auth/components/WizardUI'
import { CatalogIcon } from '@features/auth/components/CatalogIcon'
import { FluentEmoji } from '@features/auth/constants/fluentEmojis'
import { calcEdad365, calcEtapaVida365 } from '@features/auth/lib/age'
import { saveOnboardingData, saveOnboardingStepProgress, getOnboardingStepProgress } from '@features/auth/lib/onboardingStorage'
import { useQueryClient } from '@tanstack/react-query'
import { ProfileSummaryCard } from '@features/dashboard/components/AICards'
import { CustomSelect } from '@shared/components/CustomSelect'
import { Icons } from '@shared/components/shared'
import OnboardingStageCover from './OnboardingStageCover'
import { useEffect } from 'react'

// ── Step types ───────────────────────────────────────────────────
type ProfileStep =
  | 'cover'
  | 'accommodation'
  | 'condition'
  | 'neurodivergence'
  | 'diagnosis'
  | 'history_edu'
  | 'history_therapy'
  | 'support_needs'
  | 'scales1'
  | 'scales2'
  | 'formats'
  | 'interests'
  | 'viability'
  | 'identity_curp'
  | 'done'

const STEP_ORDER: ProfileStep[] = [
  'accommodation',
  'condition',
  'neurodivergence',
  'diagnosis',
  'history_edu',
  'history_therapy',
  'support_needs',
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
  const { data: me } = useMe()

  // Contract hooks
  const { data: onboardingStatus } = useOnboardingStatus()
  const saveBorradorMutation = useSaveOnboardingBorrador()

  const destinatarioPerfil = onboardingStatus?.destinatarioPerfil || 'PARA_MI'
  const nombrePcd = onboardingStatus?.nombrePcd || me?.full_name || 'Diego'

  const savedProgress = getOnboardingStepProgress('pcd')
  const savedData = (savedProgress?.data as Record<string, unknown>) || {}

  const [step, setStep] = useState<ProfileStep>(() => (savedProgress?.step && savedProgress.step !== 'done' ? (savedProgress.step as ProfileStep) : 'cover'))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // ── State ─────────────────────────────────────────────────────
  const [curpInput, setCurpInput] = useState<string>(() => (savedData.curpInput as string) || '')
  const [acompanamiento, setAcompanamiento] = useState<string>(() => (savedData.acompanamiento as string) || 'recomendaciones_paso')
  const [conditionData, setConditionData] = useState<ConditionData>(() => (savedData.conditionData as ConditionData) || {
    conditions: [], neurodivergencias: [], neuroOtro: '',
    tieneDiagnostico: 'si', diagnosticoEspecifico: '',
    redFlagDiagnostico: false, temporalidad: 'nacimiento',
  })
  const [scales, setScales] = useState<ScalesState>(() => (savedData.scales as ScalesState) || {
    autonomia: 3, independencia: 3, comunicacion: 4, comprension: 3,
    energia: 3, movilidad: 3, social: 3, emocional: 3,
  })
  const [formatos, setFormatos] = useState<string[]>(() => (savedData.formatos as string[]) || ['texto', 'imagenes'])
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => (savedData.selectedInterests as string[]) || [])
  const [selectedTemas, setSelectedTemas] = useState<string[]>(() => (savedData.selectedTemas as string[]) || [])
  const [experienciaPorTema, setExperienciaPorTema] = useState<Record<string, string>>(() => (savedData.experienciaPorTema as Record<string, string>) || {})
  const [otrosIntereses, setOtrosIntereses] = useState<string>(() => (savedData.otrosIntereses as string) || '')
  const [viabilidad, setViabilidad] = useState<string>(() => (savedData.viabilidad as string) || 'sin_restricciones')
  const [educacionHistory, setEducacionHistory] = useState<string[]>(() => (savedData.educacionHistory as string[]) || [])
  const [gradoEstudios, setGradoEstudios] = useState<string>(() => (savedData.gradoEstudios as string) || '')
  const [terapiaHistory, setTerapiaHistory] = useState<string[]>(() => (savedData.terapiaHistory as string[]) || [])
  const [preferredZones, setPreferredZones] = useState<string[]>(() => (savedData.preferredZones as string[]) || [])
  const [zonaInput, setZonaInput] = useState('')
  const [needsList, setNeedsList] = useState<string[]>(() => (savedData.needsList as string[]) || [])
  const [supportAreas, setSupportAreas] = useState<string[]>(() => (savedData.supportAreas as string[]) || [])
  const [barrerasSociales, setBarrerasSociales] = useState<string[]>(() => (savedData.barrerasSociales as string[]) || [])
  const [otraBarreraSocial, setOtraBarreraSocial] = useState<string>(() => (savedData.otraBarreraSocial as string) || '')

  const hasNeurodivergence = conditionData.conditions.some(c => c.toLowerCase().includes('neurodivergencia'))
  const activeSteps: ProfileStep[] = STEP_ORDER.filter(s => s !== 'neurodivergence' || hasNeurodivergence)
  const stepIndex = activeSteps.indexOf(step)
  const totalSteps = activeSteps.length

  // Reanudación automática en ultimoPasoCompletado + 1
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.onboardingCompleto && typeof onboardingStatus.ultimoPasoCompletado === 'number') {
      const targetStepIdx = onboardingStatus.ultimoPasoCompletado
      if (targetStepIdx >= 0 && targetStepIdx < activeSteps.length) {
        const nextStep = activeSteps[targetStepIdx]
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStep(prev => (prev === 'cover' ? nextStep : prev))
      }
    }
  }, [onboardingStatus, activeSteps])

  const handleSaveLater = async () => {
    try {
      const currentStepNumber = Math.max(1, stepIndex + 1)
      const porcentaje = Math.min(100, Math.round((currentStepNumber / Math.max(1, totalSteps)) * 100))

      const stepData = {
        acompanamiento, conditionData, scales, formatos,
        selectedInterests, selectedTemas, experienciaPorTema, otrosIntereses, viabilidad,
        educacionHistory, gradoEstudios, terapiaHistory, preferredZones,
        needsList, supportAreas, curpInput, barrerasSociales, otraBarreraSocial,
      }
      saveOnboardingStepProgress('pcd', step, stepData)

      // POST /api/onboarding/borrador según contrato API
      try {
        await saveBorradorMutation.mutateAsync({
          ultimoPasoCompletado: currentStepNumber,
          porcentajeProgreso: porcentaje,
          destinatarioPerfil,
          nombrePcd,
          tipoCondicion: conditionData.conditions,
          tipoNeurodivergencia: conditionData.neurodivergencias,
          tieneDiagnostico: conditionData.tieneDiagnostico === 'si',
          diagnosticoEspecifico: conditionData.diagnosticoEspecifico,
          gradoEstudios,
          terapias: terapiaHistory,
          necesidades: needsList,
          formatos,
          intereses: selectedInterests,
        })
      } catch (err) {
        console.warn('[PcdProfileWizard] Error al guardar borrador en backend:', err)
      }

      addToast('Progreso guardado', 'info')
      nav('/feed')
    } catch (err) {
      console.error('Error saving progress:', err)
      addToast('Progreso guardado', 'info')
      nav('/feed')
    }
  }

  // ── Helpers ────────────────────────────────────────────────────
  const scrollTop = () => {
    const el = document.querySelector('.profile-wizard-scroll') || document.querySelector('main')
    if (el) el.scrollTop = 0
  }

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
  const toggleBarreraSocial = (barrera: string) => setBarrerasSociales(prev => prev.includes(barrera) ? prev.filter(b => b !== barrera) : [...prev, barrera])

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
    const idx = activeSteps.indexOf(step)
    if (idx > 0) { setStep(activeSteps[idx - 1]); scrollTop() }
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
    if (hasNeurodivergence) {
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
  const handleSupportNeedsSubmit = (e: FormEvent) => { e.preventDefault(); goNext('scales1') }

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

      const finalBarrerasSociales = scales.social === 3
        ? Array.from(new Set([...barrerasSociales, ...(otraBarreraSocial.trim() ? [otraBarreraSocial.trim()] : [])]))
        : []

      // 1. Save scales
      const scalesPayload = {
        nivelAutonomia: scales.autonomia ?? 3, nivelIndependencia: scales.independencia ?? 3,
        nivelComunicacion: scales.comunicacion ?? 3, nivelComprension: scales.comprension ?? 3,
        nivelEnergia: scales.energia ?? 3, nivelMovilidad: scales.movilidad ?? 3,
        nivelSocial: scales.social ?? 3, nivelEmocional: scales.emocional ?? 3,
        barrerasSociales: finalBarrerasSociales,
        tieneDiagnostico: conditionData.tieneDiagnostico === 'si',
        diagnosticoEspecifico: conditionData.tieneDiagnostico === 'si' ? (conditionData.diagnosticoEspecifico.trim() || null) : null,
        temporalidadOrigen: conditionData.temporalidad,
        preferenciaFormato: formatos[0] || 'texto',
        areasInteres: selectedInterests,
        viabilidadEconomica: viabilidad,
      }
      try { await api.post('/usuarios/escalas-vida', scalesPayload) } catch (err) { console.warn('Scales save notice:', err) }

      // 2. Save profile and needs
      try {
        await updateProfile.mutateAsync({
          ...(curpInput.trim() ? { curp: curpInput.trim() } : {}),
        })
        const combinedGoals = Array.from(new Set([...selectedInterests, ...selectedTemas, ...(otrosIntereses.trim() ? [otrosIntereses.trim()] : [])]))
        const specDiag = conditionData.tieneDiagnostico === 'si' ? (conditionData.diagnosticoEspecifico.trim() || null) : null
        await updateNeedsProfile.mutateAsync({
          profiling: {
            disability_types: allConditions.length > 0 ? allConditions : disabilityTypes,
            severity: conditionData.conditions.includes('Prefiero no responder') ? null : conditionData.conditions.join(', '),
            communication_modes: formatos.filter(f => f !== 'Prefiero no responder'),
            mobility_needs: scales.movilidad >= 4 ? [] : ['Movilidad reducida'],
            tech_access: formatos,
            preferred_zones: preferredZones,
            needs: needsList,
            goals: combinedGoals,
            support_areas: supportAreas,
            education_history: educacionHistory,
            grado_estudios: gradoEstudios,
            gradoEstudios: gradoEstudios,
            therapy_history: terapiaHistory,
            life_stage: etapa || null,
            current_concerns: specDiag ? [specDiag] : [],
            diagnostico_especifico: specDiag,
            diagnosticoEspecifico: specDiag,
            barreras_sociales: finalBarrerasSociales,
            barrerasSociales: finalBarrerasSociales,
            support_level: scales.comunicacion >= 4 ? 'independiente' : scales.comunicacion >= 2 ? 'con_apoyo' : 'necesita_apoyo_intensivo',
            ...(birthDate ? { birth_date: birthDate, age: edad } : {}),
          } as Record<string, unknown>,
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
      const errorMsg = mapErrorMessage(err)
      setError(errorMsg)
      addToast(errorMsg, 'error')
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
      {step !== 'cover' && <WizardProgress accent="#229B58" title="Completa tu perfil" stepIndex={stepIndex} totalSteps={totalSteps} />}
      <WizardErrorBanner error={error} />

      {/* ── STEP: COVER (PORTADA DE ETAPA 1) ── */}
      {step === 'cover' && (
        <OnboardingStageCover
          onStart={() => goNext('accommodation')}
          stageNumber={1}
          stageTitle="1. Conocer quién eres."
          subtitle="Tres pasos para conocerte mejor"
        />
      )}

      {/* ── STEP: ACOMPAÑAMIENTO ── */}
      {step === 'accommodation' && (
        <form onSubmit={handleAccommodationSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Cómo te gustaría que Raíces te acompañe?</h2><p style={descStyle}>Elige la forma en que prefieres recibir apoyo y recursos.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIST_ACOMPANAMIENTO.map(opt => (
              <VerticalCheckCard
                key={opt.id}
                type="radio"
                label={opt.label}
                description={opt.desc}
                selected={acompanamiento === opt.id}
                onSelect={() => setAcompanamiento(opt.id)}
              />
            ))}
          </div>
          <WizardNavButtons onBack={() => nav('/feed')} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: CONDICIÓN ── */}
      {step === 'condition' && (
        <form onSubmit={handleConditionSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Cómo describirías tu condición?</h2><p style={descStyle}>Selecciona una o varias opciones. Esta información nos ayuda a personalizar tu experiencia.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CONDICIONES_PCD.map(cond => (
              <VerticalCheckCard
                key={cond}
                type="checkbox"
                label={cond}
                selected={conditionData.conditions.includes(cond)}
                onSelect={() => toggleCondition(cond)}
              />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: NEURODIVERGENCIA ── */}
      {step === 'neurodivergence' && (
        <form onSubmit={handleNeuroSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Qué tipo de neurodivergencia?</h2><p style={descStyle}>Selecciona las que apliquen.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {NEURODIVERGENCIAS_LIST.map(item => (
              <VerticalCheckCard
                key={item}
                type="checkbox"
                label={item}
                selected={conditionData.neurodivergencias.includes(item)}
                onSelect={() => toggleNeuro(item)}
              />
            ))}
          </div>
          {conditionData.neurodivergencias.includes('Otro') && (
            <input type="text" className="auth-input" placeholder="Especifica..." value={conditionData.neuroOtro} onChange={e => setConditionData({ ...conditionData, neuroOtro: e.target.value })} />
          )}
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: DIAGNÓSTICO ── */}
      {step === 'diagnosis' && (
        <form onSubmit={handleDiagnosisSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Tienes un diagnóstico formal?</h2><p style={descStyle}>Esto nos ayuda a sugerirte recursos más específicos.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{ id: 'si', label: 'Sí' }, { id: 'no', label: 'No, aún no' }, { id: 'en_proceso', label: 'En proceso de evaluación' }].map(opt => (
              <VerticalCheckCard
                key={opt.id}
                type="radio"
                label={opt.label}
                selected={conditionData.tieneDiagnostico === opt.id}
                onSelect={() => setConditionData({
                  ...conditionData,
                  tieneDiagnostico: opt.id,
                  ...(opt.id !== 'si' ? { diagnosticoEspecifico: '' } : {}),
                })}
              />
            ))}
          </div>
          {conditionData.tieneDiagnostico === 'si' && (
            <div style={{ marginTop: 14, animation: 'fadeInUp 0.3s ease both' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                Diagnóstico específico <span style={{ color: 'var(--fg3)', fontWeight: 500, fontSize: 12 }}>(opcional)</span>
              </label>
              <textarea
                className="auth-input"
                rows={3}
                style={{ width: '100%', resize: 'vertical', minHeight: 74, fontFamily: 'var(--font-body)', padding: '10px 14px', borderRadius: 10 }}
                placeholder="Describir el diagnóstico específico..."
                value={conditionData.diagnosticoEspecifico || ''}
                onChange={e => setConditionData({ ...conditionData, diagnosticoEspecifico: e.target.value })}
              />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>¿Desde cuándo vives con esta condición?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LIST_TEMPORALIDAD.map(t => (
                <VerticalCheckCard
                  key={t.id}
                  type="radio"
                  label={t.label}
                  selected={conditionData.temporalidad === t.id}
                  onSelect={() => setConditionData({ ...conditionData, temporalidad: t.id })}
                />
              ))}
            </div>
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: HISTORIAL EDUCATIVO ── */}
      {step === 'history_edu' && (
        <form onSubmit={handleHistoryEduSubmit} style={formStyle}>
          <div>
            <h2 style={headingStyle}>Tu nivel educativo</h2>
            <p style={descStyle}>Selecciona tu grado de estudios alcanzado.</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Grado / Nivel de estudios alcanzado
            </label>
            <CustomSelect
              options={LIST_GRADO_ESTUDIOS.map(g => ({ value: g.id, label: g.label }))}
              value={gradoEstudios}
              onChange={val => setGradoEstudios(String(val))}
              placeholder="Selecciona el grado o nivel de estudios..."
              minWidth="100%"
            />
          </div>

          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: HISTORIAL DE TERAPIAS ── */}
      {step === 'history_therapy' && (
        <form onSubmit={handleHistoryTherapySubmit} style={formStyle}>
          <div><h2 style={headingStyle}>Terapias y apoyos</h2><p style={descStyle}>¿Qué terapias o apoyos has recibido o recibes actualmente?</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIST_TERAPIAS.map(item => (
              <VerticalCheckCard key={item} type="checkbox" label={item} selected={terapiaHistory.includes(item)} onSelect={() => toggleTerapia(item)} />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: NECESIDADES ── */}
      {step === 'support_needs' && (
        <form onSubmit={handleSupportNeedsSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Qué necesitas ahora mismo?</h2><p style={descStyle}>Selecciona tus necesidades más importantes en este momento.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIST_NECESIDADES.map(item => (
              <VerticalCheckCard key={item} type="checkbox" label={item} selected={needsList.includes(item)} onSelect={() => toggleNeed(item)} />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
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
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: ESCALAS 2 ── */}
      {step === 'scales2' && (
        <form onSubmit={handleScales2Submit} style={formStyle}>
          <div><h2 style={headingStyle}>Tu día a día (parte 2)</h2><p style={descStyle}>Continúa respondiendo del 1 al 5.</p></div>
          <ScaleCard title="E. Energía / Resistencia" desc="¿Cómo impactan tu energía y regulación?" options={ESCALAS_OPCIONES.energia} value={scales.energia} onChange={v => setScales(prev => ({ ...prev, energia: Number(v) }))} />
          <ScaleCard title="F. Movilidad y desplazamiento" desc="¿Cómo interactúas físicamente con tu entorno?" options={ESCALAS_OPCIONES.movilidad} value={scales.movilidad} onChange={v => setScales(prev => ({ ...prev, movilidad: Number(v) }))} />
          <ScaleCard title="G. Social" desc="¿Cómo participas con personas o grupos?" options={ESCALAS_OPCIONES.social} value={scales.social} onChange={v => setScales(prev => ({ ...prev, social: Number(v) }))} />
          {scales.social === 3 && (
            <div style={{ marginTop: 10, padding: 14, borderRadius: 12, border: '1.5px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)', display: 'block', marginBottom: 4 }}>
                ¿Qué barreras enfrentas principalmente en entornos sociales?
              </label>
              <p style={{ fontSize: 12, color: 'var(--fg3)', marginBottom: 10 }}>
                Selecciona todas las opciones que correspondan:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {LIST_BARRERAS_SOCIALES.map(barrera => (
                  <VerticalCheckCard
                    key={barrera}
                    type="checkbox"
                    label={barrera}
                    selected={barrerasSociales.includes(barrera)}
                    onSelect={() => toggleBarreraSocial(barrera)}
                  />
                ))}
              </div>
              <input
                type="text"
                placeholder="Otra barrera específica (opcional)"
                value={otraBarreraSocial}
                onChange={e => setOtraBarreraSocial(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  fontSize: 13,
                  color: 'var(--fg1)',
                  fontFamily: 'var(--font-body)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
          <ScaleCard title="H. Emocional" desc="¿Cómo impacta tu bienestar emocional?" options={ESCALAS_OPCIONES.emocional} value={scales.emocional} onChange={v => setScales(prev => ({ ...prev, emocional: Number(v) }))} />
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: FORMATOS ── */}
      {step === 'formats' && (
        <form onSubmit={handleFormatsSubmit} style={formStyle}>
          <div>
            <h2 style={headingStyle}>¿Qué opciones te ayudan a entender mejor la información?</h2>
            <p style={descStyle}>Selecciona las opciones que mejor se adaptan a ti.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIST_FORMATOS.map(f => (
              <VerticalCheckCard key={f.id} type="checkbox" label={f.label} selected={formatos.includes(f.id)} onSelect={() => toggleFormato(f.id)} />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: INTERESES Y CAMINOS A EXPLORAR ── */}
      {step === 'interests' && (
        <form onSubmit={handleInterestsSubmit} style={formStyle}>
          <div>
            <h2 style={headingStyle}>¿Qué caminos te gustaría explorar?</h2>
            <p style={descStyle}>Selecciona temas de tu interés. Al elegir opciones en cada área, podrás compartir tu experiencia previa e instituciones que has conocido.</p>
          </div>
          {INTEREST_SECTIONS.map(section => {
            const hasSelectedInSection = section.items.some(item => selectedInterests.includes(item))
            return (
              <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '12px 0 4px' }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 700, color: section.color || 'var(--fg1)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {section.title}
                  </h3>
                  {hasSelectedInSection && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: section.color || '#229B58', background: 'rgba(34, 155, 88, 0.1)', padding: '2px 8px', borderRadius: 12 }}>
                      Seleccionado
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {section.items.map(item => (
                    <VerticalCheckCard
                      key={item}
                      type="checkbox"
                      label={item}
                      selected={selectedInterests.includes(item)}
                      onSelect={() => toggleInterest(item)}
                    />
                  ))}
                </div>

                {hasSelectedInSection && (
                  <div style={{
                    marginTop: 6,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'var(--bg-card, #F8FAFC)',
                    border: `1.5px dashed ${section.color || '#CBD5E1'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    animation: 'fadeIn 0.25s ease-out'
                  }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fg1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🏛️ Experiencia o instituciones previas en {section.title.toLowerCase()} <span style={{ color: 'var(--fg3)', fontWeight: 500, fontSize: 11 }}>(opcional)</span>
                    </label>
                    <textarea
                      rows={2}
                      className="auth-input"
                      style={{ width: '100%', resize: 'vertical', minHeight: 56, fontFamily: 'var(--font-body)', fontSize: 12.5, padding: '8px 12px', borderRadius: 8 }}
                      placeholder={`¿Qué has hecho a la fecha o a qué instituciones / centros has acudido en ${section.title.toLowerCase()}?`}
                      value={experienciaPorTema[section.title] || ''}
                      onChange={e => setExperienciaPorTema({ ...experienciaPorTema, [section.title]: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )
          })}
          {selectedInterests.includes('Por tema') && (
            <div style={{
              marginTop: 16,
              padding: '16px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
              border: '1.5px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                  💬 ¿Qué temas te gustaría explorar con otras personas?
                </h4>
                <p style={{ fontSize: 12.5, color: 'var(--fg2)', margin: '4px 0 0 0' }}>
                  Elige los 3 más importantes ({selectedTemas.length}/3)
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LIST_TEMAS_EXPLORAR.map(tema => {
                  const isSelected = selectedTemas.includes(tema)
                  return (
                    <VerticalCheckCard
                      key={tema}
                      type="checkbox"
                      label={tema}
                      selected={isSelected}
                      onSelect={() => {
                        if (isSelected) {
                          setSelectedTemas(prev => prev.filter(t => t !== tema))
                        } else {
                          if (selectedTemas.length >= 3) {
                            setError('Puedes elegir máximo 3 temas.')
                            return
                          }
                          setError('')
                          setSelectedTemas(prev => [...prev, tema])
                        }
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )}
          <div style={{ marginTop: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)' }}>Otros intereses</label>
            <input type="text" className="auth-input" placeholder="Escribe otros intereses..." value={otrosIntereses} onChange={e => setOtrosIntereses(e.target.value)} />
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: VIABILIDAD ── */}
      {step === 'viability' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Viabilidad económica de apoyos</h2>
            <p style={descStyle}>Esto nos ayuda a priorizar programas, subsidios o servicios acordes a tus posibilidades.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIST_VIABILIDAD.map(opt => (
              <VerticalCheckCard
                key={opt.id}
                type="radio"
                label={opt.label}
                description={'desc' in opt && typeof opt.desc === 'string' ? opt.desc : undefined}
                selected={viabilidad === opt.id}
                onSelect={() => setViabilidad(opt.id)}
              />
            ))}
          </div>
          <WizardNavButtons
            onBack={goBack}
            onSaveLater={handleSaveLater}
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
