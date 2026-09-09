import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile, useUpdateNeedsProfile } from '../hooks/useAuth'
import { Icons } from '@shared/components/shared'
import { setRememberMe, saveUser } from '@shared/lib/storage'
import { getPasswordStrength, checkPasswordCriteria } from '../lib/passwordStrength'
import { LIST_ACOMPANAMIENTO, CONDICIONES_PCD, NEURODIVERGENCIAS_LIST, LIST_TEMPORALIDAD, ESCALAS_OPCIONES, LIST_FORMATOS, INTEREST_SECTIONS, LIST_VIABILIDAD, LIST_NECESIDADES, LIST_AREAS_APOYO, MERIDA_ZONAS_SUGERIDAS, LIST_EDUCACION, LIST_TERAPIAS } from '../constants/registrationCatalogos'
import { WizardNavButtons, ScaleCard, CheckChip, WizardProgress, WizardErrorBanner, PasswordField, StateCitySelects } from './WizardUI'
import { calcEdad365, calcEtapaVida365 } from '../lib/age'
import { getMaxBirthDate, MIN_BIRTH_DATE, validateBirthDate } from '../lib/validators'
import { saveOnboardingData } from '../lib/onboardingStorage'
import type { User } from '../../../types/auth'

export interface RegistrationWizardProps {
  onBackToRoles?: () => void
  onGoToLogin?: (email?: string) => void
}

export type PcdWizardStep =
  | 'identity'
  | 'security'
  | 'accommodation'
  | 'condition'
  | 'origin'
  | 'history'
  | 'support'
  | 'scales1'
  | 'scales2'
  | 'formats'
  | 'interests'
  | 'viability'
  | 'summary'
  | 'thanks'

interface GeneralFormData {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  birth_date: string
  domicilio: string
  email: string
  password: string
  curp: string
  acompanamiento: string
  estado: string
  ciudad: string
}

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
  autonomia: number | null
  independencia: number | null
  comunicacion: number | null
  comprension: number | null
  energia: number | null
  movilidad: number | null
  social: number | null
  emocional: number | null
}

interface AiNarrativeData {
  quienEres: string
  contexto: string
  loQueTeGusta: string
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string
      mensaje?: string
    }
  }
}

// ── STEP ORDER ───────────────────────────────────────────────────
const STEP_ORDER: PcdWizardStep[] = [
  'identity',     // 1: Nombres, apellidos, fecha nacimiento
  'security',     // 2: Email, contraseña
  'accommodation',// 3: Preferencia de acompañamiento
  'condition',    // 4: Condición PCD
  'origin',       // 5: Neurodivergencia, diagnóstico, temporalidad
  'history',      // 6: Historial educativo y terapias
  'support',      // 7: Zonas preferidas, necesidades y áreas de apoyo
  'scales1',      // 8: Escalas A-D
  'scales2',      // 9: Escalas E-H
  'formats',      // 10: Formatos de información
  'interests',    // 11: Intereses
  'viability',    // 12: Viabilidad económica
]
const TOTAL_STEPS = STEP_ORDER.length

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function RegistrationWizard({ onBackToRoles, onGoToLogin }: RegistrationWizardProps) {
  const { addToast } = useUiStore()
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const updateProfile = useUpdateProfile()
  const updateNeedsProfile = useUpdateNeedsProfile()

  const [wizardStep, setWizardStep] = useState<PcdWizardStep>('identity')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [docFile] = useState<File | null>(null)
  const [showPass, setShowPass] = useState(false)

  const handleFinishToLogin = () => {
    try {
      useAuthStore.setState({ token: null, user: null, refreshToken: null })
      localStorage.removeItem('raices_token')
      sessionStorage.removeItem('raices_token')
      localStorage.removeItem('raices_user')
      sessionStorage.removeItem('raices_user')
    } catch (_) {}

    if (onGoToLogin) {
      onGoToLogin(generalForm.email)
    } else {
      nav('/auth?mode=login', { replace: true })
    }
  }

  // Step 1–3: Datos personales, identificación, cuenta
  const [generalForm, setGeneralForm] = useState<GeneralFormData>({
    nombres: '', apellidoPaterno: '', apellidoMaterno: '',
    birth_date: '', domicilio: '', email: '', password: '',
    curp: '', acompanamiento: '', estado: '', ciudad: '',
  })

  // Step 5–6: Condición y diagnóstico
  const [conditionData, setConditionData] = useState<ConditionData>({
    conditions: [], neurodivergencias: [], neuroOtro: '',
    tieneDiagnostico: '', diagnosticoEspecifico: '',
    redFlagDiagnostico: false, temporalidad: '',
  })

  // Step 7–8: Escalas de vida
  const [scales, setScales] = useState<ScalesState>({
    autonomia: null, independencia: null, comunicacion: null, comprension: null,
    energia: null, movilidad: null, social: null, emocional: null,
  })

  // Step 9: Formatos
  const [formatos, setFormatos] = useState<string[]>([])

  // Step 10–11: Intereses y viabilidad
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [otrosIntereses, setOtrosIntereses] = useState('')
  const [viabilidad, setViabilidad] = useState('')

  // Step 6: Historial educativo y terapias
  const [educacionHistory, setEducacionHistory] = useState<string[]>([])
  const [terapiaHistory, setTerapiaHistory] = useState<string[]>([])

  // Step 7: Zonas/colonias preferidas, necesidades y áreas de apoyo
  const [preferredZones, setPreferredZones] = useState<string[]>([])
  const [zonaInput, setZonaInput] = useState('')
  const [needsList, setNeedsList] = useState<string[]>([])
  const [supportAreas, setSupportAreas] = useState<string[]>([])

  // AI summary
  const [aiNarrative, setAiNarrative] = useState<AiNarrativeData | null>(null)

  // ── Helpers ─────────────────────────────────────────────────────
  const scrollTop = () => {
    const col = document.querySelector('.auth-form-column')
    if (col) col.scrollTop = 0
  }

  const stepIndex = STEP_ORDER.indexOf(wizardStep)

  // ── Toggle handlers ─────────────────────────────────────────────
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

  const toggleFormato = (id: string) => {
    setFormatos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleInterest = (item: string) => {
    setError('')
    setSelectedInterests(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleEducacionHistory = (item: string) => {
    setEducacionHistory(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleTerapiaHistory = (item: string) => {
    setTerapiaHistory(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleNeedsList = (item: string) => {
    setNeedsList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleSupportAreas = (item: string) => {
    setSupportAreas(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  // Zonas/colonias de preferencia (texto libre + chips)
  const addPreferredZone = () => {
    const z = zonaInput.trim()
    if (!z) return
    setPreferredZones(prev => prev.some(x => x.toLowerCase() === z.toLowerCase()) ? prev : [...prev, z])
    setZonaInput('')
  }

  const removePreferredZone = (z: string) => {
    setPreferredZones(prev => prev.filter(x => x !== z))
  }

  const toggleSuggestedZone = (z: string) => {
    if (preferredZones.includes(z)) {
      removePreferredZone(z)
    } else {
      setPreferredZones(prev => [...prev, z])
    }
  }

  // ── Navigation handlers ─────────────────────────────────────────
  // Step 1 → 2: Identity → Security
  const handleIdentitySubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!generalForm.nombres || !generalForm.apellidoPaterno || !generalForm.apellidoMaterno) {
      setError('Por favor, completa tu nombre y apellidos.')
      return
    }
    const birthValidation = validateBirthDate(generalForm.birth_date)
    if (!birthValidation.valid) {
      setError(birthValidation.error || 'Por favor, ingresa una fecha de nacimiento válida.')
      return
    }
    if (!generalForm.estado || !generalForm.ciudad) {
      setError('Por favor, selecciona tu estado y municipio.')
      return
    }
    setWizardStep('security')
    scrollTop()
  }

  // Step 3 → 4: Security → Accommodation
  const handleSecuritySubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!generalForm.email) {
      setError('Por favor, ingresa tu correo electrónico.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(generalForm.email)) {
      setError('Por favor, ingresa un correo electrónico válido.')
      return
    }
    const { isValid: isPassValid, missing: missingPassCriteria } = checkPasswordCriteria(generalForm.password)
    if (!isPassValid) {
      setError(`Tu contraseña debe cumplir con todos los requisitos. Te hace falta: ${missingPassCriteria.map(m => m.missingText).join(', ')}.`)
      return
    }
    setWizardStep('accommodation')
    scrollTop()
  }

  // Step 3 → 4: Accommodation → Condition
  const handleAccommodationSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!generalForm.acompanamiento) {
      setError('Por favor, selecciona cómo prefieres que Raíces te acompañe.')
      return
    }
    setWizardStep('condition')
    scrollTop()
  }

  // Step 5 → 6: Condition → Origin
  const handleConditionSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (conditionData.conditions.length === 0) {
      setError('Selecciona al menos una opción que describa tu condición.')
      return
    }
    setWizardStep('origin')
    scrollTop()
  }

  // Step 5 → 6: Origin → History
  const handleOriginSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (conditionData.conditions.includes('Neurodivergencia (especificar)') && conditionData.neurodivergencias.length === 0) {
      setError('Por favor, selecciona al menos un tipo de neurodivergencia.')
      return
    }
    if (!conditionData.tieneDiagnostico) {
      setError('Por favor, indica si cuentas con un diagnóstico específico.')
      return
    }
    if (!conditionData.temporalidad) {
      setError('Por favor, indica en qué momento comenzó esta condición.')
      return
    }
    setWizardStep('history')
    scrollTop()
  }

  // Step 6 → 7: History → Support
  const handleHistorySubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setWizardStep('support')
    scrollTop()
  }

  // Step 7 → 8: Support → Scales1
  const handleSupportSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setWizardStep('scales1')
    scrollTop()
  }

  // Step 7 → 8: Scales1 → Scales2
  const handleScales1Submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (scales.autonomia === null || scales.independencia === null || scales.comunicacion === null || scales.comprension === null) {
      setError('Por favor, selecciona una opción en cada una de las 4 áreas.')
      return
    }
    setWizardStep('scales2')
    scrollTop()
  }

  // Step 8 → 9: Scales2 → Formats
  const handleScales2Submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (scales.energia === null || scales.movilidad === null || scales.social === null || scales.emocional === null) {
      setError('Por favor, selecciona una opción en cada una de las 4 áreas.')
      return
    }
    setWizardStep('formats')
    scrollTop()
  }

  // Step 9 → 10: Formats → Interests
  const handleFormatsSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (formatos.length === 0) {
      setError('Selecciona al menos un formato en el que prefieres recibir información.')
      return
    }
    setWizardStep('interests')
    scrollTop()
  }

  // Step 10 → 11: Interests → Viability
  const handleInterestsSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    if (selectedInterests.length === 0) {
      setError('Por favor, selecciona al menos un tema que te gustaría explorar para continuar.')
      return
    }
    setWizardStep('viability')
    scrollTop()
  }



  // ── Final submit ────────────────────────────────────────────────
  const generateNarrative = () => {
    const name = generalForm.nombres?.split(' ')[0] || 'Tú'
    const condList = conditionData.conditions.filter(c => c !== 'Prefiero no responder').join(', ') || 'diversidad de fortalezas'
    const neuroList = conditionData.neurodivergencias.length > 0 ? ` con rasgos de ${conditionData.neurodivergencias.join(', ')}` : ''
    const quienEres = `${name}, eres una persona única, guiada por tu autenticidad y tu deseo de construir tu propio camino. Reconocemos tu valor integral (${condList}${neuroList}), valorando tus talentos individuales y tu perspectiva invaluable dentro de nuestra comunidad.`

    const tempoMap: Record<string, string> = {
      nacimiento: 'desde tu nacimiento', infancia: 'durante tu infancia',
      adolescencia: 'durante tu adolescencia', vida_adulta: 'en tu vida adulta',
      progresiva: 'de forma evolutiva a lo largo del tiempo',
      en_evaluacion: 'en un proceso activo de exploración y evaluación',
    }
    const temporalidadTxt = tempoMap[conditionData.temporalidad] || 'en tu recorrido de vida'
    const diagnosticoTxt = conditionData.tieneDiagnostico === 'si' && conditionData.diagnosticoEspecifico
      ? `cuentas con un diagnóstico específico (${conditionData.diagnosticoEspecifico}) que orienta tus apoyos.`
      : `estás en un momento de búsqueda donde conectar con especialistas clave abrirá nuevas oportunidades.`
    const contexto = `Tu vivencia se ha forjado ${temporalidadTxt}. En tu día a día, equilibras tu autonomía y tus actividades cotidianas con los apoyos necesarios, y ${diagnosticoTxt} Adaptamos cada interacción para que recibas información de la forma más accesible para ti.`

    const interesesTxt = selectedInterests.length > 0
      ? `destacas un gran entusiasmo por áreas como ${selectedInterests.slice(0, 4).join(', ')}${selectedInterests.length > 4 ? ` y otras ${selectedInterests.length - 4} pasiones más` : ''}.`
      : 'tienes una mente curiosa lista para descubrir nuevas experiencias y pasiones.'
    const loQueTeGusta = `Te apasiona aprender, participar y conectar con tu entorno: ${interesesTxt} En Raíces te acompañaremos exactamente como lo prefieres, acercándote opciones útiles, dignas y a tu medida para que alcances cada una de tus metas.`

    return { quienEres, contexto, loQueTeGusta }
  }

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const nombreCompleto = (generalForm.nombres + ' ' + generalForm.apellidoPaterno + ' ' + generalForm.apellidoMaterno).trim().replace(/\s+/g, ' ')
      const registerPayload = {
        nombreCompleto,
        email: generalForm.email,
        password: generalForm.password,
        rol: 'pcd',
        ...(generalForm.curp ? { curp: generalForm.curp } : {}),
        fechaNacimiento: generalForm.birth_date,
        ciudad: generalForm.ciudad,
        estado: generalForm.estado,
      }

      let authResult: { tokenAcceso?: string; tokenRefresco?: string | null; requiereInicioSesion?: boolean; usuario?: { id: number | string; email: string } } | null = null
      let regError: unknown = null
      try {
        const regRes = await api.post('/autenticacion/registro', registerPayload)
        authResult = regRes.data
      } catch (regErr) {
        console.warn('Registro warning:', regErr)
        regError = regErr
      }

      // El backend puede devolver tokenAcceso (login automático) o indicar que la
      // cuenta se creó pero el usuario debe iniciar sesión (requiereInicioSesion: true).
      const requiereInicioSesion = authResult?.requiereInicioSesion === true

      // Si el registro falló y no se creó la cuenta, abortamos: los llamados siguientes
      // (perfil, perfil-necesidades, escalas…) requieren autenticación y fallarían
      // con 401 "Token de autenticación requerido".
      if (!authResult?.tokenAcceso && !requiereInicioSesion) {
        const typedRegErr = regError as ApiErrorResponse | null
        const msg = typedRegErr?.response?.data?.message
          ?? typedRegErr?.response?.data?.mensaje
          ?? 'No se pudo completar el registro. Inténtalo de nuevo.'
        setError(msg)
        addToast(msg, 'error')
        return
      }

      // Cuenta creada sin token: mostramos el resumen de bienvenida generado por IA
      // y después el usuario inicia sesión para continuar.
      if (requiereInicioSesion) {
        const narrative = generateNarrative()
        setAiNarrative(narrative)
        saveOnboardingData({ interests: selectedInterests, viability: viabilidad, formatos, narrative })
        addToast('Registro exitoso. Inicia sesión para continuar.', 'success')
        setWizardStep('thanks')
        scrollTop()
        return
      }

      if (!authResult || !authResult.tokenAcceso) return
      const token = authResult.tokenAcceso
      const userObj: User = {
        id: String(authResult.usuario?.id ?? ''),
        email: authResult.usuario?.email || generalForm.email,
        role: 'pcd',
        full_name: nombreCompleto,
      }
      setRememberMe(true)
      setAuth(token, userObj, authResult.tokenRefresco ?? null, true)
      saveUser(userObj, true)

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
      try { await api.post('/usuarios/escalas-vida', scalesPayload) } catch (scErr) { console.warn('Scales save notice:', scErr) }

      // Guardar perfil de necesidades (reemplaza el flujo del onboarding)
      // Etapa de vida y edad: fórmulas legacy de 365.25 días (ver lib/age.js)
      const disabilityTypes = conditionData.conditions.filter(c => c !== 'Prefiero no responder')
      const allConditions = [...disabilityTypes, ...conditionData.neurodivergencias]
      try {
        await updateProfile.mutateAsync({
          full_name: registerPayload.nombreCompleto,
          city: generalForm.ciudad,
          state: generalForm.estado,
        })
        await updateNeedsProfile.mutateAsync({
          profiling: {
            disability_types: allConditions.length > 0 ? allConditions : disabilityTypes,
            severity: conditionData.conditions.includes('Prefiero no responder') ? null : conditionData.conditions.join(', '),
            communication_modes: formatos.filter(f => f !== 'Prefiero no responder'),
            mobility_needs: (scales.movilidad ?? 3) >= 4 ? [] : ['Movilidad reducida'],
            tech_access: formatos,
            preferred_zones: preferredZones,
            needs: needsList,
            goals: selectedInterests,
            support_areas: supportAreas,
            education_history: educacionHistory,
            therapy_history: terapiaHistory,
            life_stage: calcEtapaVida365(generalForm.birth_date),
            current_concerns: conditionData.diagnosticoEspecifico || null,
            support_level: (scales.comunicacion ?? 3) >= 4 ? 'independiente' : (scales.comunicacion ?? 3) >= 2 ? 'con_apoyo' : 'necesita_apoyo_intensivo',
            birth_date: generalForm.birth_date,
            age: calcEdad365(generalForm.birth_date),
          },
        })
      } catch (profErr) { console.warn('Profiling save notice:', profErr) }

      if (docFile) {
        try {
          const fd = new FormData()
          fd.append('tipo', 'identificacion_oficial')
          fd.append('documento', docFile)
          await api.post('/usuarios/documento-identidad', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        } catch (docErr) { console.warn('Doc upload notice:', docErr) }
      }

      const narrative = generateNarrative()
      setAiNarrative(narrative)
      saveOnboardingData({ interests: selectedInterests, viability: viabilidad, formatos, narrative })

      addToast('¡Registro y perfilado completados exitosamente!', 'success')
      setWizardStep('thanks')
      scrollTop()
    } catch (err) {
      console.error('Final submit error:', err)
      const narrative = generateNarrative()
      setAiNarrative(narrative)
      setWizardStep('thanks')
    } finally {
      setSending(false)
    }
  }

  const passStrength = getPasswordStrength(generalForm.password)



  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* ── Progress bar ── */}
      <WizardProgress accent="#229B58" title="Registro de Persona con Discapacidad" stepIndex={stepIndex} totalSteps={TOTAL_STEPS} />

      {/* ── Error ── */}
      <WizardErrorBanner error={error} />

      {/* ═══════════════════════════════════════════════════════════
           STEP 1: IDENTIDAD (Nombres, apellidos, fecha nacimiento)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'identity' && (
        <form onSubmit={handleIdentitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Cuéntanos sobre ti
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Comienza con tu nombre completo y fecha de nacimiento.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Nombre(s) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className="auth-input" required placeholder="Ej. Juan Carlos"
              value={generalForm.nombres}
              onChange={e => setGeneralForm({ ...generalForm, nombres: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Apellido paterno <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" className="auth-input" required placeholder="Ej. García"
                value={generalForm.apellidoPaterno}
                onChange={e => setGeneralForm({ ...generalForm, apellidoPaterno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Apellido materno <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" className="auth-input" required placeholder="Ej. López"
                value={generalForm.apellidoMaterno}
                onChange={e => setGeneralForm({ ...generalForm, apellidoMaterno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') })} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Fecha de nacimiento <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="date" className="auth-input" required
              max={getMaxBirthDate()}
              min={MIN_BIRTH_DATE}
              value={generalForm.birth_date}
              onChange={e => setGeneralForm({ ...generalForm, birth_date: e.target.value })} />
          </div>

          <StateCitySelects
            state={generalForm.estado}
            city={generalForm.ciudad}
            onStateChange={st => setGeneralForm({ ...generalForm, estado: st, ciudad: '' })}
            onCityChange={c => setGeneralForm({ ...generalForm, ciudad: c })}
          />

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="auth-btn-secondary" type="button" onClick={onBackToRoles} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" style={{ flex: 2 }}>
              Continuar {Icons.arrowRight({ s: 18 })}
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 2: SEGURIDAD (Email, contraseña)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'security' && (
        <form onSubmit={handleSecuritySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Seguridad de tu cuenta
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Crea credenciales seguras para proteger tu información.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="email" className="auth-input" required placeholder="correo@ejemplo.com"
              value={generalForm.email}
              onChange={e => setGeneralForm({ ...generalForm, email: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Contraseña segura <span style={{ color: '#ef4444' }}>*</span></label>
            <PasswordField
              value={generalForm.password}
              onChange={v => setGeneralForm({ ...generalForm, password: v })}
              showPass={showPass}
              onToggleShow={() => setShowPass(!showPass)}
              strength={passStrength}
            />
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('identity'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 4: ACOMPAÑAMIENTO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'accommodation' && (
        <form onSubmit={handleAccommodationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Preferencia de acompañamiento
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              ¿Cómo prefieres que Raíces te acompañe en tu camino?
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIST_ACOMPANAMIENTO.map(opt => {
              const isSelected = generalForm.acompanamiento === opt.id
              return (
                <button key={opt.id} type="button" onClick={() => setGeneralForm({ ...generalForm, acompanamiento: opt.id })}
                  style={{
                    padding: '14px 16px', borderRadius: 12,
                    border: `2px solid ${isSelected ? '#229B58' : '#E5DCD2'}`,
                    background: isSelected ? 'rgba(34,155,88,0.08)' : 'var(--bg-surface)',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.2s ease',
                  }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? '#229B58' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isSelected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#229B58' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--fg1)' }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('security'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 5: CONDICIÓN PCD
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'condition' && (
        <form onSubmit={handleConditionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Háblanos de tu condición
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              ¿Qué condición o situación te describe mejor? (Puedes seleccionar más de una.)
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {CONDICIONES_PCD.map(cond => {
              const isChecked = conditionData.conditions.includes(cond)
              return (
                <button key={cond} type="button" onClick={() => toggleCondition(cond)}
                  style={{
                    padding: '12px 14px', borderRadius: 10,
                    border: `1.5px solid ${isChecked ? '#229B58' : '#E5DCD2'}`,
                    background: isChecked ? 'rgba(34,155,88,0.08)' : 'var(--bg-surface)',
                    color: isChecked ? 'var(--primary)' : 'var(--fg1)',
                    fontWeight: isChecked ? 700 : 500, fontSize: 13,
                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${isChecked ? '#229B58' : '#9ca3af'}`, background: isChecked ? '#229B58' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    {isChecked && Icons.check({ s: 10 })}
                  </div>
                  <span>{cond}</span>
                </button>
              )
            })}
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('accommodation'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 6: ORIGEN Y DIAGNÓSTICO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'origin' && (
        <form onSubmit={handleOriginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ marginBottom: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Origen y diagnóstico
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información nos ayuda a personalizar tu experiencia.
            </p>
          </div>

          {/* Neurodivergencia (condicional) */}
          {conditionData.conditions.includes('Neurodivergencia (especificar)') && (
            <div style={{ background: '#FFF9F2', border: '1.5px solid #F4C84A', borderRadius: 12, padding: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--fg1)', marginBottom: 10 }}>Especificar neurodivergencia:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
                {NEURODIVERGENCIAS_LIST.map(nd => {
                  const isChecked = conditionData.neurodivergencias.includes(nd)
                  return (
                    <button key={nd} type="button" onClick={() => toggleNeuro(nd)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${isChecked ? 'var(--primary)' : '#E5DCD2'}`, background: isChecked ? 'var(--primary)' : 'var(--bg-surface)', color: isChecked ? '#ffffff' : 'var(--fg1)', fontWeight: 600, fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                      {nd}
                    </button>
                  )
                })}
              </div>
              {conditionData.neurodivergencias.includes('Otro') && (
                <input type="text" className="auth-input" placeholder="¿Cuál neurodivergencia?" style={{ marginTop: 10 }}
                  value={conditionData.neuroOtro} onChange={e => setConditionData({ ...conditionData, neuroOtro: e.target.value })} />
              )}
            </div>
          )}

          {/* Diagnóstico */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', marginBottom: 8 }}>¿Tienes algún diagnóstico en específico?</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <button type="button" onClick={() => setConditionData({ ...conditionData, tieneDiagnostico: 'si', redFlagDiagnostico: false })}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${conditionData.tieneDiagnostico === 'si' ? '#229B58' : '#E5DCD2'}`, background: conditionData.tieneDiagnostico === 'si' ? 'rgba(34,155,88,0.08)' : 'var(--bg-surface)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                Sí (especificar)
              </button>
              <button type="button" onClick={() => setConditionData({ ...conditionData, tieneDiagnostico: 'no', diagnosticoEspecifico: '', redFlagDiagnostico: true })}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${conditionData.tieneDiagnostico === 'no' ? '#FF4D68' : '#E5DCD2'}`, background: conditionData.tieneDiagnostico === 'no' ? 'rgba(255,77,104,0.08)' : 'var(--bg-surface)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                No
              </button>
            </div>
            {conditionData.tieneDiagnostico === 'si' ? (
              <input type="text" className="auth-input" placeholder="Escribe tu diagnóstico formal o clínico"
                value={conditionData.diagnosticoEspecifico}
                onChange={e => setConditionData({ ...conditionData, diagnosticoEspecifico: e.target.value })} />
            ) : conditionData.tieneDiagnostico === 'no' ? (
              <div style={{ background: 'rgba(255,77,104,0.08)', border: '1px solid rgba(255,77,104,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--fg1)', lineHeight: 1.5 }}>
                💡 <strong>Nota:</strong> Al no contar con un diagnóstico formal, te abriremos un camino especializado para conectar con especialistas.
              </div>
            ) : null}
          </div>

          {/* Temporalidad */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', marginBottom: 8 }}>¿En qué momento comenzó esta condición?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {LIST_TEMPORALIDAD.map(t => {
                const isSelected = conditionData.temporalidad === t.id
                return (
                  <button key={t.id} type="button" onClick={() => setConditionData({ ...conditionData, temporalidad: t.id })}
                    style={{
                      padding: '9px 12px', borderRadius: 8,
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : '#E5DCD2'}`,
                      background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                      color: isSelected ? '#ffffff' : 'var(--fg1)',
                      fontWeight: isSelected ? 700 : 500, fontSize: 12, cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${isSelected ? '#ffffff' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isSelected && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff' }} />}
                    </div>
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('condition'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP: HISTORIAL EDUCATIVO Y TERAPIAS
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'history' && (
        <form onSubmit={handleHistorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Historial educativo y terapias
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Cuéntanos tu recorrido escolar y las terapias que has recibido. (Opcional)
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 3px' }}>🎓 Educación</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>¿Qué tipo de escuela o estudios has cursado? (Puedes elegir varias.)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
                {LIST_EDUCACION.map(op => (
                  <CheckChip key={op} label={op} selected={educacionHistory.includes(op)} onToggle={() => toggleEducacionHistory(op)} />
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 3px' }}>🩺 Terapias recibidas</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>¿Con qué terapias cuentas o has contado? (Puedes elegir varias.)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
                {LIST_TERAPIAS.map(op => (
                  <CheckChip key={op} label={op} selected={terapiaHistory.includes(op)} onToggle={() => toggleTerapiaHistory(op)} />
                ))}
              </div>
            </div>
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('origin'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP: ZONAS, NECESIDADES Y ÁREAS DE APOYO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'support' && (
        <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Zonas y apoyos que te sirven
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Cuéntanos dónde prefieres encontrar opciones y en qué te gustaría recibir ayuda. (Opcional)
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 12, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 3px' }}>📍 Colonias o zonas de preferencia</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>
                Selecciona las zonas en {generalForm.ciudad || 'Mérida'} donde te sea más fácil acudir a servicios o actividades.
              </p>

              {/* Sugerencias de colonias y C.P. en Mérida */}
              {generalForm.ciudad === 'Mérida' && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>
                    Sugerencias frecuentes en Mérida:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 7 }}>
                    {MERIDA_ZONAS_SUGERIDAS.map(sug => {
                      const isSelected = preferredZones.includes(sug)
                      return (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => toggleSuggestedZone(sug)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: `1.5px solid ${isSelected ? '#229B58' : '#E5DCD2'}`,
                            background: isSelected ? 'color-mix(in oklch, #229B58 8%, white)' : 'var(--bg-surface)',
                            color: isSelected ? 'var(--primary)' : 'var(--fg1)',
                            fontSize: 12.5,
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                            fontFamily: 'var(--font-body)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{
                            width: 16, height: 16, borderRadius: 4,
                            border: `1.5px solid ${isSelected ? '#229B58' : '#9ca3af'}`,
                            background: isSelected ? '#229B58' : 'var(--bg-surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', flexShrink: 0
                          }}>
                            {isSelected && Icons.check({ s: 10 })}
                          </div>
                          <span>{sug}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Campo para agregar otra colonia que no esté en la lista */}
              <div style={{ borderTop: '1px solid #f1ece5', paddingTop: 10, marginTop: 4 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--fg2)', marginBottom: 5 }}>
                  ¿Tu colonia o zona no está en la lista? Escríbela aquí:
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text" className="auth-input"
                    style={{ flex: 1, minWidth: 0, background: 'var(--bg-surface)', borderRadius: 8, border: '1.5px solid var(--border-color)' }}
                    placeholder="Ej. García Ginerés, 97070, Kanasín…"
                    value={zonaInput}
                    onChange={e => setZonaInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPreferredZone() } }}
                  />
                  <button
                    type="button"
                    onClick={addPreferredZone}
                    className="auth-btn-primary"
                    style={{ width: 'auto', padding: '0 18px', flexShrink: 0, height: 48, fontSize: 13.5, borderRadius: 8 }}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Zonas seleccionadas (chips activos) */}
              {preferredZones.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1ece5' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#229B58', display: 'block', marginBottom: 6 }}>
                    Zonas seleccionadas ({preferredZones.length}):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {preferredZones.map(z => (
                      <span
                        key={z}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 10px',
                          borderRadius: 8,
                          background: 'rgba(34,155,88,0.1)',
                          border: '1.5px solid rgba(34,155,88,0.45)',
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: 'var(--fg1)',
                        }}
                      >
                        📍 {z}
                        <button
                          type="button"
                          onClick={() => removePreferredZone(z)}
                          aria-label={`Quitar ${z}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--fg1)',
                            fontWeight: 800,
                            padding: 0,
                            fontSize: 14,
                            lineHeight: 1,
                            marginLeft: 2,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 3px' }}>🧩 Necesidades generales</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>¿Qué necesidades o barreras enfrentas en tu día a día?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
                {LIST_NECESIDADES.map(op => (
                  <CheckChip key={op} label={op} selected={needsList.includes(op)} onToggle={() => toggleNeedsList(op)} />
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 14, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 3px' }}>🤝 Áreas donde requieres apoyo</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>¿En cuáles áreas te gustaría contar con más ayuda?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
                {LIST_AREAS_APOYO.map(op => (
                  <CheckChip key={op} label={op} selected={supportAreas.includes(op)} onToggle={() => toggleSupportAreas(op)} />
                ))}
              </div>
            </div>
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('history'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 7: ESCALAS A-D
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'scales1' && (
        <form onSubmit={handleScales1Submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Escalas de Vida (1/2)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Selecciona la opción que mejor represente tu situación actual.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <ScaleCard title="A. Autonomía" desc="¿Qué tanto participas en decisiones?" options={ESCALAS_OPCIONES.autonomia} value={scales.autonomia} onChange={v => setScales({ ...scales, autonomia: Number(v) })} />
            <ScaleCard title="B. Independencia" desc="¿Qué nivel de apoyo necesitas?" options={ESCALAS_OPCIONES.independencia} value={scales.independencia} onChange={v => setScales({ ...scales, independencia: Number(v) })} />
            <ScaleCard title="C. Comunicación" desc="¿Cómo expresas necesidades?" options={ESCALAS_OPCIONES.comunicacion} value={scales.comunicacion} onChange={v => setScales({ ...scales, comunicacion: Number(v) })} />
            <ScaleCard title="D. Comprensión" desc="¿Sigues instrucciones o decisiones?" options={ESCALAS_OPCIONES.comprension} value={scales.comprension} onChange={v => setScales({ ...scales, comprension: Number(v) })} />
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('support'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 8: ESCALAS E-H
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'scales2' && (
        <form onSubmit={handleScales2Submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Escalas de Vida (2/2)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Continúa evaluando tu día a día en estas áreas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <ScaleCard title="E. Energía / Resistencia" desc="¿Cómo impactan tu energía y regulación?" options={ESCALAS_OPCIONES.energia} value={scales.energia} onChange={v => setScales({ ...scales, energia: Number(v) })} />
            <ScaleCard title="F. Movilidad" desc="¿Cómo interactúas físicamente con tu entorno?" options={ESCALAS_OPCIONES.movilidad} value={scales.movilidad} onChange={v => setScales({ ...scales, movilidad: Number(v) })} />
            <ScaleCard title="G. Social" desc="¿Cómo participas con personas o grupos?" options={ESCALAS_OPCIONES.social} value={scales.social} onChange={v => setScales({ ...scales, social: Number(v) })} />
            <ScaleCard title="H. Emocional" desc="¿Cómo impacta tu bienestar emocional?" options={ESCALAS_OPCIONES.emocional} value={scales.emocional} onChange={v => setScales({ ...scales, emocional: Number(v) })} />
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('scales1'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 9: FORMATOS DE INFORMACIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'formats' && (
        <form onSubmit={handleFormatsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              ¿Cómo prefieres recibir información?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Cuéntanos cómo te resulta más cómodo aprender y comunicarte. (Opción múltiple)
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {LIST_FORMATOS.map(f => {
              const isChecked = formatos.includes(f.id)
              return (
                <button key={f.id} type="button" onClick={() => toggleFormato(f.id)}
                  style={{
                    padding: '16px 14px', borderRadius: 14,
                    border: `2px solid ${isChecked ? '#229B58' : '#E5DCD2'}`,
                    background: isChecked ? 'rgba(34, 155, 88, 0.08)' : 'var(--bg-surface)',
                    cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s ease',
                  }}>
                  <span style={{ fontSize: 32 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isChecked ? 'var(--primary)' : 'var(--fg1)' }}>{f.label}</span>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isChecked ? '#229B58' : '#9ca3af'}`, background: isChecked ? '#229B58' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {isChecked && Icons.check({ s: 11 })}
                  </div>
                </button>
              )
            })}
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('scales2'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 10: INTERESES (scrollable internally)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'interests' && (
        <form onSubmit={handleInterestsSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FF4D68', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                ✨ Explora tus pasiones
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 6px', lineHeight: 1.2 }}>
                ¿Qué caminos te gustaría explorar? <span style={{ color: '#ef4444' }}>*</span>
              </h2>
              <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
                Selecciona al menos un tema que te llame la atención para continuar. Personalizaremos tu feed y actividades recomendadas.
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {INTEREST_SECTIONS.map((sec) => (
                <div key={sec.title} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '14px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: sec.color }} />
                    <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: sec.color, margin: 0, textTransform: 'uppercase' }}>{sec.title}</h3>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sec.items.map((item) => {
                      const isSelected = selectedInterests.includes(item)
                      return (
                        <button key={item} type="button" onClick={() => toggleInterest(item)}
                          style={{
                            padding: '7px 13px', borderRadius: 8,
                            border: isSelected ? `2px solid ${sec.color}` : '1.5px solid #E5DCD2',
                            background: isSelected ? sec.color : 'var(--bg-surface)',
                            color: isSelected ? '#ffffff' : 'var(--fg1)',
                            fontSize: 12.5, fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.15s ease',
                          }}>
                          <span>{item}</span>
                          {isSelected && Icons.check({ s: 11 })}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 16 }} />
          </div>

          {/* Fixed nav at bottom */}
          <div style={{ display: 'flex', gap: 12, marginTop: 10, paddingTop: 10, borderTop: '1px solid #E5DCD2', flexShrink: 0 }}>
            <button className="auth-btn-secondary" type="button" onClick={() => { setError(''); setWizardStep('formats'); scrollTop() }} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" style={{ flex: 2 }}>
              Continuar {Icons.arrowRight({ s: 18 })}
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 11: VIABILIDAD ECONÓMICA
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'viability' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Viabilidad económica
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esto nos ayuda a recomendarte opciones acordes a tu presupuesto.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 14, padding: '16px' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', marginBottom: 10 }}>¿Qué tipo de opciones son más viables para ti hoy?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {LIST_VIABILIDAD.map((v) => {
                const isSelected = viabilidad === v.id
                return (
                  <button key={v.id} type="button" onClick={() => setViabilidad(v.id)}
                    style={{
                      padding: '12px 14px', borderRadius: 10,
                      border: `1.5px solid ${isSelected ? '#229B58' : '#E5DCD2'}`,
                      background: isSelected ? 'rgba(34, 155, 88, 0.08)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary)' : 'var(--fg1)',
                      fontWeight: isSelected ? 700 : 500, fontSize: 12.5,
                      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'all 0.15s ease',
                    }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${isSelected ? '#229B58' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#229B58' }} />}
                    </div>
                    <span>{v.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Otros temas que te gustaría explorar</label>
            <input type="text" className="auth-input" placeholder="Ej. Robótica accesible, astronomía, ajedrez adaptado..."
              value={otrosIntereses} onChange={e => setOtrosIntereses(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="auth-btn-secondary" type="button" onClick={() => { setWizardStep('interests'); scrollTop() }} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" disabled={sending} style={{ flex: 2 }}>
              {sending ? 'Guardando mi perfil...' : 'Guardar y continuar'} {Icons.check({ s: 18 })}
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           THANKS SCREEN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'thanks' && (
        <div style={{
          background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 24,
          padding: '36px 28px', textAlign: 'center',
          boxShadow: 'var(--shadow-lg)', animation: 'fadeInUp 0.4s ease both',
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>🌱</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 14px', lineHeight: 1.25 }}>
            Muchas gracias por tu confianza y tu apertura para conocerte.
          </h2>
          <div style={{ color: 'var(--fg2)', fontSize: 14, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto 28px' }}>
            <p style={{ margin: 0 }}>Esta información nos permitirá darte opciones claras y personalizadas.</p>
            <p style={{ margin: 0, fontWeight: 500, color: 'var(--fg1)' }}>
              Una vez que validemos tu identidad, te haremos llegar un correo para que puedas encontrar nuevas posibilidades, caminos para tu desarrollo y formar parte de esta gran comunidad.
            </p>
          </div>
          <button className="auth-btn-primary" type="button"
            onClick={() => { setWizardStep('summary'); scrollTop() }}
            style={{ minWidth: 240, padding: '14px 24px', fontSize: 15 }}>
            Ver mi Resumen de Bienvenida {Icons.sparkles({ s: 18 })}
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           SUMMARY / BIENVENIDA
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'summary' && (
        <div style={{
          background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 24,
          padding: '30px 26px', boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInUp 0.4s ease both', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-coral)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Narrativa de Identidad</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--fg1)', margin: '4px 0 0' }}>Bienvenido a Raíces</h2>
            </div>
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: '#ffffff', padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              {Icons.sparkles({ s: 13 })} Generado por IA
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--fg2)', margin: '0 0 20px', lineHeight: 1.5 }}>
            A través de nuestra inteligencia artificial hemos captado tu esencia para acompañarte en tu desarrollo:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--bg-cool)', border: '1.5px solid var(--primary)', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🌟</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', margin: 0 }}>1. ¿Quién eres?</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg1)', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.quienEres || 'Eres una persona única con grandes fortalezas, talentos y metas por cumplir.'}
              </p>
            </div>
            <div style={{ background: 'var(--bg-cool)', border: '1.5px solid var(--color-amarillo)', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🧭</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', margin: 0 }}>2. Tu contexto</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg1)', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.contexto || 'Tu entorno y experiencias han formado tu historia, y adaptamos cada herramienta para ti.'}
              </p>
            </div>
            <div style={{ background: 'var(--bg-cool)', border: '1.5px solid var(--color-coral)', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🎯</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', margin: 0 }}>3. Lo que te gusta</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg1)', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.loQueTeGusta || 'Tus intereses guían tu camino hacia nuevas conexiones, oportunidades y desarrollo.'}
              </p>
            </div>
          </div>

          <button className="auth-btn-primary" type="button" onClick={handleFinishToLogin}
            style={{ width: '100%', padding: '14px 20px', fontSize: 15 }}>
            Comencemos tu camino en Raíces   {Icons.arrowRight({ s: 18 })}
          </button>
        </div>
      )}
    </div>
  )
}
