import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useUpdateProfile, useUpdateNeedsProfile, useMe, useAuthStore } from '@features/auth'
import { mapErrorMessage } from '@features/auth/lib/mapErrorMessage'
import { useOnboardingStatus, useSaveOnboardingBorrador } from '@features/institutions/hooks/useRecommendations'
import { useEstadoValidacion } from '../hooks/useDocumentoIdentidad'
import {
  LIST_ACOMPANAMIENTO_TUTOR as LIST_ACOMPANAMIENTO,
  CONDICIONES_PCD,
  NEURODIVERGENCIAS_LIST,
  LIST_TEMPORALIDAD,
  ESCALAS_OPCIONES_TUTOR as ESCALAS_OPCIONES,
  LIST_FORMATOS_TUTOR as LIST_FORMATOS,
  INTEREST_SECTIONS_TUTOR as INTEREST_SECTIONS,
  LIST_VIABILIDAD,
  LIST_NECESIDADES_TUTOR as LIST_NECESIDADES,
  LIST_AREAS_APOYO_TUTOR as LIST_AREAS_APOYO,
  LIST_EDUCACION_TUTOR as LIST_EDUCACION,
  LIST_TERAPIAS,
  LIST_GRADO_ESTUDIOS,
  LIST_TEMAS_EXPLORAR,
  LIST_BARRERAS_SOCIALES,
} from '@features/auth/constants/registrationCatalogos'
import { WizardNavButtons, ScaleCard, CheckChip, VerticalCheckCard, WizardProgress, WizardErrorBanner } from '@features/auth/components/WizardUI'
import { CatalogIcon } from '@features/auth/components/CatalogIcon'
import { FluentEmoji } from '@features/auth/constants/fluentEmojis'
import { calcEdad, calcEtapaDependiente, calcEtapaVida as calcEtapaPerfil } from '@features/auth/lib/age'
import { saveOnboardingData, saveOnboardingStepProgress, getOnboardingStepProgress } from '@features/auth/lib/onboardingStorage'
import { getMaxBirthDate, MIN_BIRTH_DATE } from '@features/auth/lib/validators'
import { useQueryClient } from '@tanstack/react-query'
import { ProfileSummaryCard } from '@features/dashboard/components/AICards'
import { CustomSelect } from '@shared/components/CustomSelect'
import { Icons } from '@shared/components/shared'
import OnboardingStageCover from './OnboardingStageCover'
import { useEffect } from 'react'

const DESTINATARIOS = [
  { id: 'hijo', label: 'Para mi hijo/a', desc: 'Acompañamiento enfocado en su desarrollo integral y futuro' },
  { id: 'familiar', label: 'Para un familiar', desc: 'Apoyo para hermano/a, sobrino/a, padre/madre u otro familiar' },
  { id: 'otro', label: 'Para una persona a mi cuidado', desc: 'Rol de tutor/a legal, cuidador/a formal o acompañante' },
]

const normText = (s?: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const DEP_DISABILITY_KEYWORDS = [
  { keywords: ['tea', 'autismo'], code: 'tea' },
  { keywords: ['motriz', 'movilidad'], code: 'motriz' },
  { keywords: ['visual'], code: 'visual' },
  { keywords: ['auditiv'], code: 'auditiva' },
  { keywords: ['intelectual', 'cognitiv'], code: 'intelectual' },
  { keywords: ['habla', 'comunicaci', 'lenguaje'], code: 'lenguaje' },
  { keywords: ['psicosocial'], code: 'psicosocial' },
  { keywords: ['down'], code: 'down' },
  { keywords: ['multipl'], code: 'multiple' },
]

function wizardConditionsToCodes(conditions: string[] = [], neurodivergencias: string[] = []): string[] {
  const phrases = [...conditions, ...neurodivergencias].filter(p => p && normText(p) !== 'prefiero no responder')
  const codes: string[] = []
  for (const phrase of phrases) {
    const n = normText(phrase)
    if (n.includes('neurodivergencia')) continue
    const hit = DEP_DISABILITY_KEYWORDS.find(({ keywords }) => keywords.some(k => n.includes(k)))
    if (hit && !codes.includes(hit.code)) codes.push(hit.code)
  }
  return codes
}

function resolveParentesco(parentescos: string[], destinatario: string): string {
  if (Array.isArray(parentescos) && parentescos.length > 0) {
    const keywords = destinatario === 'hijo'
      ? ['hij']
      : destinatario === 'familiar'
        ? ['famili', 'herman', 'niet', 'sobrin', 'conyug', 'abuel', 'padre', 'madre']
        : ['cuid', 'tutor', 'legal', 'otro']
    const found = parentescos.find(p => keywords.some(k => normText(p).includes(k)))
    if (found) return found
  }
  return destinatario === 'hijo' ? 'Hijo/a' : destinatario === 'familiar' ? 'Familiar' : 'Persona a mi cuidado'
}

type TutorProfileStep =
  | 'cover'
  | 'relationship'
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

const STEP_ORDER: TutorProfileStep[] = [
  'relationship', 'accommodation', 'condition', 'neurodivergence', 'diagnosis', 'history_edu', 'history_therapy',
  'support_needs', 'scales1', 'scales2', 'formats', 'interests', 'viability', 'identity_curp'
]
const TOTAL_STEPS = STEP_ORDER.length

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

export interface TutorProfileWizardProps {
  onDone?: () => void
}

export default function TutorProfileWizard({ onDone }: TutorProfileWizardProps) {
  const { addToast } = useUiStore()
  const nav = useNavigate()
  const updateProfile = useUpdateProfile()
  const updateNeedsProfile = useUpdateNeedsProfile()
  const qc = useQueryClient()

  // Contract hooks
  const { data: me } = useMe()
  const { data: onboardingStatus } = useOnboardingStatus()
  const saveBorradorMutation = useSaveOnboardingBorrador()

  const destinatarioPerfil = onboardingStatus?.destinatarioPerfil || 'PARA_MI_HIJO'

  const savedProgress = getOnboardingStepProgress('tutor')
  const savedData = (savedProgress?.data as Record<string, unknown>) || {}

  const [step, setStep] = useState<TutorProfileStep>(() => (savedProgress?.step && savedProgress.step !== 'done' ? (savedProgress.step as TutorProfileStep) : 'cover'))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const meRecord = me as Record<string, unknown> | undefined
  const onboardingRecord = onboardingStatus as Record<string, unknown> | undefined
  const [curpInput, setCurpInput] = useState<string>(() => (savedData.curpInput as string) || (meRecord?.curp as string) || '')
  const [destinatario, setDestinatario] = useState<string>(() => (savedData.destinatario as string) || 'hijo')
  const [nombreDependiente, setNombreDependiente] = useState<string>(() => {
    return (
      (savedData.nombreDependiente as string) ||
      (onboardingRecord?.nombrePcd as string) ||
      (meRecord?.nombrePcd as string) ||
      (meRecord?.nombre_pcd as string) ||
      localStorage.getItem('raices_dep_name') ||
      ''
    )
  })
  const [fechaNacimientoDependiente, setFechaNacimientoDependiente] = useState<string>(() => {
    return (
      (savedData.fechaNacimientoDependiente as string) ||
      (onboardingRecord?.fechaNacimientoPcd as string) ||
      (meRecord?.fechaNacimientoPcd as string) ||
      (meRecord?.fecha_nacimiento_pcd as string) ||
      localStorage.getItem('raices_dep_birth_date') ||
      ''
    )
  })
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

  const effectiveNombrePcd = onboardingStatus?.nombrePcd || nombreDependiente.trim() || 'Diego'
  const personName = nombreDependiente.trim() || (destinatario === 'hijo' ? 'tu hijo/a' : destinatario === 'familiar' ? 'tu familiar' : 'la persona a tu cuidado')

  const hasNeurodivergence = conditionData.conditions.some(c => c.toLowerCase().includes('neurodivergencia'))
  const { data: estadoValidacion } = useEstadoValidacion()
  const storeUser = useAuthStore(s => s.user)
  const userCurp = me?.curp || storeUser?.curp
  const hasDocUploaded = Boolean(
    estadoValidacion?.documentoSubido ||
    estadoValidacion?.curpValidada ||
    (estadoValidacion?.estado && (estadoValidacion.estado as string) !== 'sin_documentos')
  )
  const hasCurp = Boolean(
    userCurp ||
    me?.curpSubida ||
    hasDocUploaded ||
    localStorage.getItem('raices_curp_uploaded') === 'true' ||
    localStorage.getItem('raices_user_curp_uploaded') === 'true' ||
    (curpInput && curpInput.trim().length === 18) ||
    (savedData.curpInput && (savedData.curpInput as string).length === 18)
  )

  const activeSteps: TutorProfileStep[] = STEP_ORDER.filter(s =>
    (s !== 'neurodivergence' || hasNeurodivergence) &&
    (s !== 'identity_curp' || !hasCurp)
  )
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
        destinatario, nombreDependiente, fechaNacimientoDependiente,
        acompanamiento, conditionData, scales, formatos,
        selectedInterests, selectedTemas, experienciaPorTema, otrosIntereses, viabilidad,
        educacionHistory, gradoEstudios, terapiaHistory, preferredZones,
        needsList, supportAreas, curpInput, barrerasSociales, otraBarreraSocial,
      }
      saveOnboardingStepProgress('tutor', step, stepData)

      // POST /api/onboarding/borrador según contrato API
      try {
        await saveBorradorMutation.mutateAsync({
          ultimoPasoCompletado: currentStepNumber,
          porcentajeProgreso: porcentaje,
          destinatarioPerfil: destinatarioPerfil || 'PARA_MI_HIJO',
          nombrePcd: effectiveNombrePcd,
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
        console.warn('[TutorProfileWizard] Error al guardar borrador en backend:', err)
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
  const toggleNeuro = (item: string) => setConditionData(prev => ({ ...prev, neurodivergencias: prev.neurodivergencias.includes(item) ? prev.neurodivergencias.filter(x => x !== item) : [...prev.neurodivergencias, item] }))
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
  const goNext = (nextStep: TutorProfileStep) => { setError(''); setStep(nextStep); scrollTop() }
  const goBack = () => { const idx = activeSteps.indexOf(step); if (idx > 0) { setStep(activeSteps[idx - 1]); scrollTop() } }

  // ── Submit handlers ───────────────────────────────────────────
  const handleRelationshipSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!nombreDependiente.trim()) { setError(`Escribe el nombre de ${destinatario === 'hijo' ? 'tu hijo/a' : 'tu familiar'}.`); return }
    if (!fechaNacimientoDependiente) { setError('Ingresa la fecha de nacimiento.'); return }
    goNext('accommodation')
  }
  const handleAccommodationSubmit = (e: FormEvent) => { e.preventDefault(); goNext('condition') }
  const handleConditionSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (conditionData.conditions.length === 0) { setError('Selecciona al menos una opción.'); return }
    if (hasNeurodivergence) goNext('neurodivergence')
    else goNext('diagnosis')
  }
  const handleNeuroSubmit = (e: FormEvent) => { e.preventDefault(); if (conditionData.neurodivergencias.length === 0) { setError('Selecciona al menos una.'); return } goNext('diagnosis') }
  const handleDiagnosisSubmit = (e: FormEvent) => { e.preventDefault(); goNext('history_edu') }
  const handleHistoryEduSubmit = (e: FormEvent) => { e.preventDefault(); goNext('history_therapy') }
  const handleHistoryTherapySubmit = (e: FormEvent) => { e.preventDefault(); goNext('support_needs') }
  const handleSupportNeedsSubmit = (e: FormEvent) => { e.preventDefault(); goNext('scales1') }
  const handleScales1Submit = (e: FormEvent) => { e.preventDefault(); goNext('scales2') }
  const handleScales2Submit = (e: FormEvent) => { e.preventDefault(); goNext('formats') }
  const handleFormatsSubmit = (e: FormEvent) => { e.preventDefault(); if (formatos.length === 0) { setError('Selecciona al menos uno.'); return } goNext('interests') }
  const handleInterestsSubmit = (e: FormEvent) => { e.preventDefault(); if (selectedInterests.length === 0) { setError('Selecciona al menos uno.'); return } goNext('viability') }

  // ── Final submit ──────────────────────────────────────────────
  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const dependienteDOB = fechaNacimientoDependiente
      const dependienteEdad = calcEdad(dependienteDOB)
      const dependienteEtapaDep = calcEtapaDependiente(dependienteDOB)
      const dependienteEtapaPerfil = calcEtapaPerfil(dependienteDOB)
      const disabilityTypes = conditionData.conditions.filter(c => c !== 'Prefiero no responder')
      const allConditions = [...disabilityTypes, ...conditionData.neurodivergencias]

      const specDiag = conditionData.tieneDiagnostico === 'si' ? (conditionData.diagnosticoEspecifico.trim() || null) : null

      const finalBarrerasSociales = scales.social === 3
        ? Array.from(new Set([...barrerasSociales, ...(otraBarreraSocial.trim() ? [otraBarreraSocial.trim()] : [])]))
        : []

      // 1. Guardar escalas
      const scalesPayload = {
        nivelAutonomia: scales.autonomia ?? 3, nivelIndependencia: scales.independencia ?? 3,
        nivelComunicacion: scales.comunicacion ?? 3, nivelComprension: scales.comprension ?? 3,
        nivelEnergia: scales.energia ?? 3, nivelMovilidad: scales.movilidad ?? 3,
        nivelSocial: scales.social ?? 3, nivelEmocional: scales.emocional ?? 3,
        barrerasSociales: finalBarrerasSociales,
        tieneDiagnostico: conditionData.tieneDiagnostico === 'si',
        diagnosticoEspecifico: conditionData.diagnosticoEspecifico.trim() || null,
        temporalidadOrigen: conditionData.temporalidad,
        preferenciaFormato: formatos[0] || 'texto',
        areasInteres: selectedInterests,
        viabilidadEconomica: viabilidad,
      }
      try { await api.post('/usuarios/escalas-vida', scalesPayload) } catch (err) { console.warn('Scales err:', err) }

      // 2. Actualizar perfil y necesidades del tutor
      try {
        if (curpInput.trim()) {
          await updateProfile.mutateAsync({ curp: curpInput.trim() })
        }
        const combinedGoals = Array.from(new Set([...selectedInterests, ...selectedTemas, ...(otrosIntereses.trim() ? [otrosIntereses.trim()] : [])]))
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
            therapy_history: terapiaHistory,
            life_stage: dependienteEtapaPerfil,
            barreras_sociales: finalBarrerasSociales,
            barrerasSociales: finalBarrerasSociales,
            support_level: scales.comunicacion >= 4 ? 'independiente' : scales.comunicacion >= 2 ? 'con_apoyo' : 'necesita_apoyo_intensivo',
            birth_date: dependienteDOB,
            age: dependienteEdad,
          } as Record<string, unknown>,
        })
      } catch (err) { console.warn('Profile err:', err) }

      // 3. Registrar a la persona dependiente
      let catParentescos: string[] = []
      try { const catRes = await api.get('/catalogos'); catParentescos = catRes?.data?.parentescos ?? [] } catch { }

      const depPayload = {
        nombreCompleto: nombreDependiente.trim(),
        parentesco: resolveParentesco(catParentescos, destinatario),
        tiposDiscapacidad: wizardConditionsToCodes(disabilityTypes, conditionData.neurodivergencias),
        ...(dependienteEtapaDep ? { etapaVida: dependienteEtapaDep } : {}),
        notas: specDiag,
        diagnosticoEspecifico: specDiag,
      }
      try {
        const depRes = await api.post('/usuarios/dependientes', depPayload)
        if (depRes?.data?.id && dependienteDOB) {
          localStorage.setItem(`raices_dep_birth_date_${depRes.data.id}`, dependienteDOB)
        }
      } catch (err) {
        addToast(`Perfil guardado, pero no se pudo agregar a ${nombreDependiente}. Agrégalo luego en "Mis personas".`, 'warning')
      }

      // 4. Invalidate queries and set completion flag
      localStorage.setItem('raices_onboarding_completed_tutor', 'true')
      qc.invalidateQueries({ queryKey: ['onboarding-status'] })
      qc.invalidateQueries({ queryKey: ['perfil'] })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['dependientes'] })
      saveOnboardingData({ interests: selectedInterests, viability: viabilidad, formatos })

      addToast('¡Perfil completado! Tienes acceso completo a Raíces.', 'success')
      if (onDone) onDone()
      nav('/feed', { replace: true })
    } catch (err) {
      console.error('Final submit error:', err)
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

  return (
    <div className="profile-wizard-scroll" style={{ width: '100%', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {step !== 'cover' && <WizardProgress accent="#229B58" title="Completa tu perfil" stepIndex={stepIndex} totalSteps={totalSteps} />}
      <WizardErrorBanner error={error} />

      {/* ── STEP: COVER (PORTADA DE ETAPA 1) ── */}
      {step === 'cover' && (
        <OnboardingStageCover
          onStart={() => goNext('relationship')}
          stageNumber={1}
          stageTitle="1. Conocer quién eres."
          subtitle="Tres pasos para conocerte mejor"
        />
      )}

      {/* ── STEP: RELATIONSHIP ── */}
      {step === 'relationship' && (
        <form onSubmit={handleRelationshipSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Para quién es el perfil?</h2><p style={descStyle}>Esto nos ayuda a personalizar las recomendaciones para tu ser querido.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DESTINATARIOS.map(opt => (
              <VerticalCheckCard
                key={opt.id}
                type="radio"
                label={opt.label}
                description={opt.desc}
                selected={destinatario === opt.id}
                onSelect={() => setDestinatario(opt.id)}
              />
            ))}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Nombre de {destinatario === 'hijo' ? 'tu hijo/a' : destinatario === 'familiar' ? 'tu familiar' : 'la persona a tu cuidado'} <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className="auth-input" required placeholder="Ej. Mateo" value={nombreDependiente} onChange={e => setNombreDependiente(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Fecha de nacimiento de {personName} <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="date" className="auth-input" required max={getMaxBirthDate()} min={MIN_BIRTH_DATE} value={fechaNacimientoDependiente} onChange={e => setFechaNacimientoDependiente(e.target.value)} />
          </div>
          <WizardNavButtons onBack={() => nav('/feed')} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: ACCOMMODATION ── */}
      {step === 'accommodation' && (
        <form onSubmit={handleAccommodationSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Cómo te gustaría que Raíces los acompañe a ti y a {personName}?</h2><p style={descStyle}>Elige la forma en que prefieres recibir apoyo.</p></div>
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
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: CONDITION ── */}
      {step === 'condition' && (
        <form onSubmit={handleConditionSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Cómo describirías la condición de {personName}?</h2><p style={descStyle}>Selecciona una o varias opciones.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CONDICIONES_PCD.map(cond => (
              <VerticalCheckCard key={cond} type="checkbox" label={cond} selected={conditionData.conditions.includes(cond)} onSelect={() => toggleCondition(cond)} />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: NEURODIVERGENCE ── */}
      {step === 'neurodivergence' && (
        <form onSubmit={handleNeuroSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Qué tipo de neurodivergencia tiene {personName}?</h2><p style={descStyle}>Selecciona las que apliquen.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {NEURODIVERGENCIAS_LIST.map(item => (
              <VerticalCheckCard key={item} type="checkbox" label={item} selected={conditionData.neurodivergencias.includes(item)} onSelect={() => toggleNeuro(item)} />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: DIAGNOSIS ── */}
      {step === 'diagnosis' && (
        <form onSubmit={handleDiagnosisSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿{personName} tiene un diagnóstico formal?</h2><p style={descStyle}>Esto nos ayuda a sugerir recursos específicos.</p></div>
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
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: HISTORY EDU ── */}
      {step === 'history_edu' && (
        <form onSubmit={handleHistoryEduSubmit} style={formStyle}>
          <div>
            <h2 style={headingStyle}>Nivel educativo de {personName}</h2>
            <p style={descStyle}>Selecciona el grado de estudios alcanzado.</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Grado / Nivel de estudios alcanzado
            </label>              <CustomSelect
              options={LIST_GRADO_ESTUDIOS.map(g => ({ value: g.id, label: g.label }))}
              value={gradoEstudios}
              onChange={val => setGradoEstudios(String(val))}
            />
          </div>

          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: HISTORY THERAPY ── */}
      {step === 'history_therapy' && (
        <form onSubmit={handleHistoryTherapySubmit} style={formStyle}>
          <div><h2 style={headingStyle}>Terapias y apoyos de {personName}</h2><p style={descStyle}>¿Qué apoyos o terapias recibe o ha recibido?</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIST_TERAPIAS.map(item => (
              <VerticalCheckCard key={item} type="checkbox" label={item} selected={terapiaHistory.includes(item)} onSelect={() => toggleTerapia(item)} />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: SUPPORT NEEDS ── */}
      {step === 'support_needs' && (
        <form onSubmit={handleSupportNeedsSubmit} style={formStyle}>
          <div><h2 style={headingStyle}>¿Qué necesitan para {personName} ahora mismo?</h2><p style={descStyle}>Selecciona sus necesidades principales.</p></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIST_NECESIDADES.map(item => (
              <VerticalCheckCard key={item} type="checkbox" label={item} selected={needsList.includes(item)} onSelect={() => toggleNeed(item)} />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: SCALES 1 ── */}
      {step === 'scales1' && (
        <form onSubmit={handleScales1Submit} style={formStyle}>
          <div><h2 style={headingStyle}>El día a día de {personName} (parte 1)</h2></div>
          <ScaleCard title="A. Autonomía" desc={`¿Qué tanto participa ${personName} en sus decisiones?`} options={ESCALAS_OPCIONES.autonomia} value={scales.autonomia} onChange={v => setScales(prev => ({ ...prev, autonomia: Number(v) }))} />
          <ScaleCard title="B. Independencia" desc={`¿Qué nivel de apoyo necesita ${personName}?`} options={ESCALAS_OPCIONES.independencia} value={scales.independencia} onChange={v => setScales(prev => ({ ...prev, independencia: Number(v) }))} />
          <ScaleCard title="C. Comunicación" desc={`¿De qué manera se comunica mejor ${personName}?`} options={ESCALAS_OPCIONES.comunicacion} value={scales.comunicacion} onChange={v => setScales(prev => ({ ...prev, comunicacion: Number(v) }))} />
          <ScaleCard title="D. Comprensión" desc={`¿Cómo sigue instrucciones o decisiones ${personName}?`} options={ESCALAS_OPCIONES.comprension} value={scales.comprension} onChange={v => setScales(prev => ({ ...prev, comprension: Number(v) }))} />
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: SCALES 2 ── */}
      {step === 'scales2' && (
        <form onSubmit={handleScales2Submit} style={formStyle}>
          <div><h2 style={headingStyle}>El día a día de {personName} (parte 2)</h2></div>
          <ScaleCard title="E. Energía / Resistencia" desc={`¿Cómo impactan su energía y regulación?`} options={ESCALAS_OPCIONES.energia} value={scales.energia} onChange={v => setScales(prev => ({ ...prev, energia: Number(v) }))} />
          <ScaleCard title="F. Movilidad y desplazamiento" desc={`¿Cómo interactúa físicamente ${personName} con su entorno?`} options={ESCALAS_OPCIONES.movilidad} value={scales.movilidad} onChange={v => setScales(prev => ({ ...prev, movilidad: Number(v) }))} />
          <ScaleCard title="G. Social" desc={`¿Cómo participa ${personName} con otras personas?`} options={ESCALAS_OPCIONES.social} value={scales.social} onChange={v => setScales(prev => ({ ...prev, social: Number(v) }))} />
          {scales.social === 3 && (
            <div style={{ marginTop: 10, padding: 14, borderRadius: 12, border: '1.5px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)', display: 'block', marginBottom: 4 }}>
                ¿Qué barreras enfrenta {personName} principalmente en entornos sociales?
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
          <ScaleCard title="H. Emocional" desc={`¿Cómo impacta su bienestar emocional?`} options={ESCALAS_OPCIONES.emocional} value={scales.emocional} onChange={v => setScales(prev => ({ ...prev, emocional: Number(v) }))} />
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: FORMATOS ── */}
      {step === 'formats' && (
        <form onSubmit={handleFormatsSubmit} style={formStyle}>
          <div>
            <h2 style={headingStyle}>¿Qué opciones le ayudan a entender mejor la información a {personName}?</h2>
            <p style={descStyle}>Selecciona las opciones que mejor se adaptan a sus necesidades.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIST_FORMATOS.map(f => (
              <VerticalCheckCard key={f.id} type="checkbox" label={f.label} selected={formatos.includes(f.id)} onSelect={() => toggleFormato(f.id)} />
            ))}
          </div>
          <WizardNavButtons onBack={goBack} onSaveLater={handleSaveLater} submitLabel="Continuar" />
        </form>
      )}

      {/* ── STEP: INTERESTS Y CAMINOS A EXPLORAR ── */}
      {step === 'interests' && (
        <form onSubmit={handleInterestsSubmit} style={formStyle}>
          <div>
            <h2 style={headingStyle}>¿Qué caminos te gustaría explorar con {personName}?</h2>
            <p style={descStyle}>Selecciona los temas de su interés. Al elegir opciones de cada área, podrás compartir la experiencia previa e instituciones que han conocido.</p>
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
                      placeholder={`¿Qué han hecho a la fecha o a qué instituciones / centros han acudido en ${section.title.toLowerCase()}?`}
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

      {/* ── STEP: VIABILITY ── */}
      {step === 'viability' && (
        <form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(e) }} style={formStyle}>
          <div><h2 style={headingStyle}>Viabilidad económica</h2><p style={descStyle}>Esto nos ayuda a priorizar programas o recursos convenientes para ti y {personName}.</p></div>
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
            submitLabel={sending ? 'Guardando...' : '¡Finalizar perfil!'}
            submitIcon={sending ? null : <CatalogIcon icon={FluentEmoji.destello} size={14} />}
            submitDisabled={sending}
          />
        </form>
      )}

      {/* ── STEP: IDENTIDAD Y CURP ── */}
      {step === 'identity_curp' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={headingStyle}>Verificación de Identidad del Tutor (CURP)</h2>
            <p style={descStyle}>Ingresa tu CURP para validar tu cuenta de tutor y alcanzar el 100% de tu perfil.</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Clave Única de Registro de Población (CURP) <span style={{ color: 'var(--fg3)', fontWeight: 500, fontSize: 12 }}>(18 caracteres)</span>
            </label>
            <input
              type="text"
              className="auth-input"
              maxLength={18}
              placeholder="Ej. GAPL800101HMCYRL09"
              value={curpInput}
              onChange={e => setCurpInput(e.target.value.toUpperCase())}
              style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
            />
            <p style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 5 }}>
              Tu CURP valida tu identidad como tutor/a ante la comunidad e instituciones.
            </p>
          </div>
          <WizardNavButtons
            onBack={goBack}
            onSaveLater={handleSaveLater}
            submitLabel={sending ? 'Guardando...' : '¡Finalizar perfil al 100%!'}
            submitIcon={sending ? null : <CatalogIcon icon={FluentEmoji.destello} size={14} />}
            submitDisabled={sending}
          />
        </form>
      )}

      {/* ── STEP: DONE ── */}
      {(step as string) === 'done' && (
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
