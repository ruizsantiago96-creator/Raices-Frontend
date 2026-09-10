import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile, useUpdateNeedsProfile } from '../hooks/useAuth'
import { Icons } from '@shared/components/shared'
import { setRememberMe, saveUser } from '@shared/lib/storage'
import { getPasswordStrength, checkPasswordCriteria } from '../lib/passwordStrength'
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
  MERIDA_ZONAS_SUGERIDAS,
  LIST_EDUCACION_TUTOR as LIST_EDUCACION,
  LIST_TERAPIAS,
} from '../constants/registrationCatalogos'
import { WizardNavButtons as NavButtons, ScaleCard, CheckChip, PasswordField, LocationInputs } from './WizardUI'
import { calcEdad, calcEtapaDependiente, calcEtapaVida as calcEtapaPerfil } from '../lib/age'
import { saveOnboardingData } from '../lib/onboardingStorage'
import { isValidEmail, getMaxBirthDate, MIN_BIRTH_DATE, validateBirthDate } from '../lib/validators'
import type { User } from '../../../types/auth'

export interface TutorRegistrationWizardProps {
  onBackToRoles?: () => void
  onGoToLogin?: (email?: string) => void
}

export type TutorWizardStep =
  | 'name'
  | 'birthdate'
  | 'location'
  | 'email'
  | 'password'

interface TutorGeneralFormData {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  birth_date: string
  domicilio: string
  email: string
  password: string
  curp: string
  acompanamiento: string
  pais: string
  codigoPostal: string
  estado: string
  ciudad: string
}

interface TutorConditionData {
  conditions: string[]
  neurodivergencias: string[]
  neuroOtro: string
  tieneDiagnostico: string
  diagnosticoEspecifico: string
  redFlagDiagnostico: boolean
  temporalidad: string
}

interface TutorScalesState {
  autonomia: number
  independencia: number
  comunicacion: number
  comprension: number
  energia: number
  movilidad: number
  social: number
  emocional: number
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

// ── LISTAS Y CATÁLOGOS ───────────────────────────────────────────
const DESTINATARIOS = [
  { id: 'hijo', label: 'Para mi hijo/a', desc: 'Acompañamiento enfocado en su desarrollo integral y futuro' },
  { id: 'familiar', label: 'Para un familiar', desc: 'Apoyo para hermano/a, sobrino/a, padre/madre u otro familiar' },
  { id: 'otro', label: 'Para una persona a mi cuidado', desc: 'Rol de tutor/a legal, cuidador/a formal o acompañante' },
]

// ── Mapeos para el alta del dependiente ───────────────────────────
const normText = (s?: string) => (s || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

/** Mapea las frases del wizard a los códigos de discapacidad que el backend espera en dependientes. */
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
  const phrases = [...conditions, ...neurodivergencias]
    .filter(p => p && normText(p) !== 'prefiero no responder')
  const codes: string[] = []
  for (const phrase of phrases) {
    const n = normText(phrase)
    if (n.includes('neurodivergencia')) continue
    const hit = DEP_DISABILITY_KEYWORDS.find(({ keywords }) => keywords.some(k => n.includes(k)))
    if (hit && !codes.includes(hit.code)) codes.push(hit.code)
  }
  return codes
}

/** Elige el parentesco del catálogo del backend; si no responde, usa el valor por defecto previo. */
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

// ── STEP ORDER (13 pasos homologados con PCD) ─────────────────────
const STEP_ORDER: TutorWizardStep[] = [
  'name',
  'birthdate',
  'location',
  'email',
  'password',
]
const TOTAL_STEPS = STEP_ORDER.length

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function TutorRegistrationWizard({ onBackToRoles, onGoToLogin }: TutorRegistrationWizardProps) {
  const { addToast } = useUiStore()
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const updateProfile = useUpdateProfile()
  const updateNeedsProfile = useUpdateNeedsProfile()

  const [wizardStep, setWizardStep] = useState<TutorWizardStep>('name')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [aiNarrative, setAiNarrative] = useState<AiNarrativeData | null>(null)

  // Step 1–2: Datos personales del tutor
  const [generalForm, setGeneralForm] = useState<TutorGeneralFormData>({
    nombres: '', apellidoPaterno: '', apellidoMaterno: '',
    birth_date: '', domicilio: '', email: '', password: '',
    curp: '', acompanamiento: 'recomendaciones_paso',
    pais: 'MX', codigoPostal: '', estado: '', ciudad: '',
  })

  // Step 3: ¿Para quién es el perfil?
  const [destinatario, setDestinatario] = useState('hijo')
  const [nombreDependiente, setNombreDependiente] = useState('')
  // Fecha de nacimiento de la persona a cargo (para calcular su edad y etapa
  // reales en lugar de usar las del tutor)
  const [fechaNacimientoDependiente, setFechaNacimientoDependiente] = useState('')

  // Step 5–6: Condición y diagnóstico de la persona a cargo
  const [conditionData, setConditionData] = useState<TutorConditionData>({
    conditions: [], neurodivergencias: [], neuroOtro: '',
    tieneDiagnostico: 'si', diagnosticoEspecifico: '',
    redFlagDiagnostico: false, temporalidad: 'nacimiento',
  })

  // Step 9–10: Escalas de vida de la persona a cargo
  const [scales, setScales] = useState<TutorScalesState>({
    autonomia: 3, independencia: 3, comunicacion: 4, comprension: 3,
    energia: 3, movilidad: 3, social: 3, emocional: 3,
  })

  // Step 11: Formatos
  const [formatos, setFormatos] = useState<string[]>(['texto', 'imagenes'])

  // Step 12–13: Intereses y viabilidad
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [otrosIntereses, setOtrosIntereses] = useState('')
  const [viabilidad, setViabilidad] = useState('sin_restricciones')

  // Step 7: Historial educativo y terapias
  const [educacionHistory, setEducacionHistory] = useState<string[]>([])
  const [terapiaHistory, setTerapiaHistory] = useState<string[]>([])

  // Step 8: Zonas de preferencia, necesidades y áreas de apoyo
  const [preferredZones, setPreferredZones] = useState<string[]>([])
  const [zonaInput, setZonaInput] = useState('')
  const [needsList, setNeedsList] = useState<string[]>([])
  const [supportAreas, setSupportAreas] = useState<string[]>([])

  // Nombre de referencia para títulos y preguntas
  const personName = nombreDependiente.trim() || (destinatario === 'hijo' ? 'tu hijo/a' : destinatario === 'familiar' ? 'tu familiar' : 'la persona a tu cuidado')

  // ── Helpers ─────────────────────────────────────────────────────
  const scrollTop = () => {
    const col = document.querySelector('.auth-form-column')
    if (col) col.scrollTop = 0
  }

  const handleFinishToLogin = () => {
    try {
      useAuthStore.setState({ token: null, user: null, refreshToken: null })
      localStorage.removeItem('raices_token')
      sessionStorage.removeItem('raices_token')
      localStorage.removeItem('raices_user')
      sessionStorage.removeItem('raices_user')
    } catch {
      // ignore
    }

    if (onGoToLogin) {
      onGoToLogin(generalForm.email)
    } else {
      nav('/auth?mode=login', { replace: true })
    }
  }

  const stepIndex = STEP_ORDER.indexOf(wizardStep)
  const progressPct = stepIndex >= 0 ? ((stepIndex + 1) / TOTAL_STEPS) * 100 : 100

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
    setSelectedInterests(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleEducacionHistory = (item: string) => {
    setEducacionHistory(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleTerapiaHistory = (item: string) => {
    setTerapiaHistory(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleSuggestedZone = (zone: string) => {
    setPreferredZones(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone])
  }

  const addManualZone = () => {
    const val = zonaInput.trim()
    if (!val) return
    if (!preferredZones.includes(val)) {
      setPreferredZones(prev => [...prev, val])
    }
    setZonaInput('')
  }

  const removePreferredZone = (zone: string) => {
    setPreferredZones(prev => prev.filter(z => z !== zone))
  }

  const toggleNeedsList = (item: string) => {
    setNeedsList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleSupportAreas = (item: string) => {
    setSupportAreas(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  // ── Step validation & transitions ────────────────────────────────
  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!generalForm.nombres || !generalForm.apellidoPaterno) {
      setError('Por favor, ingresa tu nombre y tu primer apellido.')
      return
    }
    setWizardStep('birthdate')
    scrollTop()
  }

  const handleBirthdateSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const birthValidation = validateBirthDate(generalForm.birth_date)
    if (!birthValidation.valid) {
      setError(birthValidation.error || 'Por favor, selecciona tu fecha de nacimiento.')
      return
    }
    setWizardStep('location')
    scrollTop()
  }

  const handleLocationSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!generalForm.pais || !generalForm.codigoPostal || !generalForm.estado || !generalForm.ciudad) {
      setError('Por favor, ingresa un código postal válido, estado y ciudad.')
      return
    }
    setWizardStep('email')
    scrollTop()
  }

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!generalForm.email) {
      setError('Por favor, ingresa tu correo electrónico.')
      return
    }
    if (!isValidEmail(generalForm.email)) {
      setError('Por favor, ingresa un correo electrónico válido.')
      return
    }
    setWizardStep('password')
    scrollTop()
  }

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!checkPasswordCriteria(generalForm.password)) {
      setError('La contraseña no cumple con los requisitos de seguridad.')
      return
    }
    setWizardStep('relationship_type')
    scrollTop()
  }

  const handleRelationshipTypeSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!destinatario) {
      setError('Por favor, selecciona una opción.')
      return
    }
    setWizardStep('relationship_name')
    scrollTop()
  }

  const handleRelationshipNameSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!nombreDependiente.trim()) {
      setError('Por favor, ingresa el nombre de la persona a tu cuidado.')
      return
    }
    setWizardStep('relationship_birthdate')
    scrollTop()
  }

  const handleRelationshipBirthdateSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const depBirthValidation = validateBirthDate(fechaNacimientoDependiente)
    if (!depBirthValidation.valid) {
      setError(depBirthValidation.error || 'Por favor, ingresa la fecha de nacimiento de la persona a tu cuidado.')
      return
    }
    setWizardStep('accommodation')
    scrollTop()
  }

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

  const handleConditionSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (conditionData.conditions.length === 0) {
      setError('Selecciona al menos una opción que describa la condición o "Prefiero no responder".')
      return
    }
    if (conditionData.conditions.includes('Neurodivergencia (especificar)')) {
      setWizardStep('neurodivergence')
    } else {
      setWizardStep('diagnosis')
    }
    scrollTop()
  }

  const handleNeurodivergenceSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (conditionData.neurodivergencias.length === 0) {
      setError('Por favor, selecciona al menos un tipo de neurodivergencia.')
      return
    }
    setWizardStep('diagnosis')
    scrollTop()
  }

  const handleDiagnosisSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setWizardStep('history_edu')
    scrollTop()
  }

  const handleHistoryEduSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setWizardStep('history_therapy')
    scrollTop()
  }

  const handleHistoryTherapySubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setWizardStep('support_zones')
    scrollTop()
  }

  const handleSupportZonesSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setWizardStep('support_needs')
    scrollTop()
  }

  const handleSupportNeedsSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setWizardStep('support_areas')
    scrollTop()
  }

  const handleSupportAreasSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setWizardStep('scales1')
    scrollTop()
  }

  const handleSupportSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setWizardStep('scales1')
    scrollTop()
  }

  const handleScales1Submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!scales.autonomia || !scales.independencia || !scales.comunicacion || !scales.comprension) {
      setError('Por favor, responde las 4 escalas de esta sección.')
      return
    }
    setWizardStep('scales2')
    scrollTop()
  }

  const handleScales2Submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!scales.energia || !scales.movilidad || !scales.social || !scales.emocional) {
      setError('Por favor, responde las 4 escalas de esta sección.')
      return
    }
    setWizardStep('formats')
    scrollTop()
  }

  const handleFormatsSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (formatos.length === 0) {
      setError('Selecciona al menos un formato en el que se comprenda mejor la información.')
      return
    }
    setWizardStep('interests')
    scrollTop()
  }

  const handleInterestsSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (selectedInterests.length === 0) {
      setError('Por favor, selecciona al menos un interés o actividad.')
      return
    }
    setWizardStep('viability')
    scrollTop()
  }

  // ── Generación de narrativa con IA ──────────────────────────────
  const generateNarrative = () => {
    const name = nombreDependiente.trim() || 'tu ser querido'
    const condList = conditionData.conditions.filter(c => c !== 'Prefiero no responder').join(', ') || 'diversidad de fortalezas'
    const neuroList = conditionData.neurodivergencias.length > 0 ? ` con rasgos de ${conditionData.neurodivergencias.join(', ')}` : ''
    const quienEres = `Como tutor/a y cuidador/a de ${name}, reconoces su valor integral (${condList}${neuroList}) y buscas los mejores caminos para su autonomía y bienestar. Tu acompañamiento y dedicación son el pilar de su desarrollo.`

    const tempoMap: Record<string, string> = {
      nacimiento: 'desde su nacimiento', infancia: 'durante su infancia',
      adolescencia: 'durante su adolescencia', vida_adulta: 'en su vida adulta',
      progresiva: 'de forma evolutiva a lo largo del tiempo',
      en_evaluacion: 'en un proceso activo de exploración y evaluación',
    }
    const temporalidadTxt = tempoMap[conditionData.temporalidad] || 'en su recorrido de vida'
    const diagnosticoTxt = conditionData.tieneDiagnostico === 'si' && conditionData.diagnosticoEspecifico
      ? `${name} cuenta con un diagnóstico específico (${conditionData.diagnosticoEspecifico}) que orienta sus apoyos.`
      : `están en un momento de búsqueda donde conectar con especialistas clave abrirá nuevas oportunidades.`
    const contexto = `La vivencia de ${name} se ha forjado ${temporalidadTxt}. En su día a día, se equilibra su independencia con los apoyos necesarios, y ${diagnosticoTxt} Adaptamos cada interacción para que reciban la información de la forma más accesible y oportuna.`

    const interesesTxt = selectedInterests.length > 0
      ? `${name} muestra gran entusiasmo por áreas como ${selectedInterests.slice(0, 4).join(', ')}${selectedInterests.length > 4 ? ` y otras ${selectedInterests.length - 4} actividades más` : ''}.`
      : `${name} tiene una mente curiosa lista para descubrir nuevas experiencias y pasiones.`
    const loQueTeGusta = `${interesesTxt} En Raíces te acompañaremos a ti y a ${name} con opciones útiles, dignas y a la medida para alcanzar cada meta de su plan de vida.`

    return { quienEres, contexto, loQueTeGusta }
  }

  // ── Envío final ─────────────────────────────────────────────────
  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const nombreCompleto = (generalForm.nombres + ' ' + generalForm.apellidoPaterno + ' ' + generalForm.apellidoMaterno).trim().replace(/\s+/g, ' ')
      const registerPayload = {
        nombreCompleto,
        email: generalForm.email,
        password: generalForm.password,
        rol: 'padre_tutor',
        ...(generalForm.curp ? { curp: generalForm.curp } : {}),
        fechaNacimiento: generalForm.birth_date,
        ciudad: generalForm.ciudad,
        estado: generalForm.estado,
        ...(generalForm.pais ? { pais: generalForm.pais } : {}),
        ...(generalForm.codigoPostal ? { codigoPostal: generalForm.codigoPostal } : {}),
      }

      const regRes = await api.post('/autenticacion/registro', registerPayload)
      const authResult = regRes.data

      if (authResult?.requiereInicioSesion) {
         addToast('Registro exitoso. Inicia sesión para continuar.', 'success')
         nav('/auth?mode=login', { replace: true })
         return
      }

      if (!authResult || !authResult.tokenAcceso) throw new Error('No se pudo completar el registro.')

      const userObj: User = {
        id: String(authResult.usuario?.id ?? ''),
        email: authResult.usuario?.email || generalForm.email,
        role: 'tutor',
        full_name: nombreCompleto,
      }
      setRememberMe(true)
      setAuth(authResult.tokenAcceso, userObj, authResult.tokenRefresco ?? null, true)
      saveUser(userObj, true)
      
      addToast('¡Cuenta creada exitosamente!', 'success')
      setWizardStep('thanks')
    } catch (err: any) {
       const msg = err.response?.data?.message || err.response?.data?.mensaje || 'Error al registrar.'
       setError(msg)
       addToast(msg, 'error')
    } finally {
       setSending(false)
    }
  }

  const passStrength = getPasswordStrength(generalForm.password)

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* ── Progress bar ── */}
      {wizardStep !== 'thanks' && wizardStep !== 'summary' && (
        <div style={{ marginBottom: 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7C3AED', textTransform: 'uppercase' }}>
              Registro de Tutor / Cuidador
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)' }}>
              {stepIndex >= 0 ? `Paso ${stepIndex + 1} de ${TOTAL_STEPS}` : 'Completado ✓'}
            </span>
          </div>
          <div style={{ height: 5, background: '#E5DCD2', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #7C3AED 0%, #3A86FF 100%)',
              borderRadius: 3,
              transition: 'width 0.4s ease',
              width: `${progressPct}%`,
            }} />
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)',
          color: '#ef4444', padding: '10px 14px', borderRadius: 10, fontSize: 13,
          fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0,
        }}>
          {Icons.shieldAlert({ s: 16 })} {error}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 1: NOMBRE DEL TUTOR
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'name' && (
        <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Tus datos (Tutor / Cuidador)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Como tutor/a o cuidador/a, necesitamos tus datos para crear tu cuenta y conectarte con tu comunidad.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Nombre(s) (como tutor/cuidador) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className="auth-input" required placeholder="Ej. Ana Laura"
              value={generalForm.nombres}
              onChange={e => setGeneralForm({ ...generalForm, nombres: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Primer apellido (como tutor/cuidador) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" className="auth-input" required placeholder="Ej. García"
                value={generalForm.apellidoPaterno}
                onChange={e => setGeneralForm({ ...generalForm, apellidoPaterno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Segundo apellido (como tutor/cuidador) <span style={{ color: 'var(--fg3)', fontWeight: 500, fontSize: 12 }}>(opcional)</span></label>
              <input type="text" className="auth-input" placeholder="Ej. López"
                value={generalForm.apellidoMaterno}
                onChange={e => setGeneralForm({ ...generalForm, apellidoMaterno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') })} />
            </div>
          </div>

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
           STEP 2: FECHA DE NACIMIENTO DEL TUTOR
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'birthdate' && (
        <form onSubmit={handleBirthdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Tu fecha de nacimiento
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información es tuya, no de la persona a tu cuidado.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Fecha de nacimiento (como tutor/cuidador) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="date" className="auth-input" required
              max={getMaxBirthDate()}
              min={MIN_BIRTH_DATE}
              value={generalForm.birth_date}
              onChange={e => setGeneralForm({ ...generalForm, birth_date: e.target.value })} />
          </div>

          <NavButtons onBack={() => { setWizardStep('name'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 3: UBICACIÓN DEL TUTOR
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'location' && (
        <form onSubmit={handleLocationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Tu ubicación
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información nos ayuda a sugerir recursos cerca de ti.
            </p>
          </div>

          <LocationInputs
            country={generalForm.pais}
            postalCode={generalForm.codigoPostal}
            state={generalForm.estado}
            city={generalForm.ciudad}
            onCountryChange={p => setGeneralForm(prev => ({ ...prev, pais: p }))}
            onPostalCodeChange={cp => setGeneralForm(prev => ({ ...prev, codigoPostal: cp }))}
            onStateChange={st => setGeneralForm(prev => ({ ...prev, estado: st }))}
            onCityChange={c => setGeneralForm(prev => ({ ...prev, ciudad: c }))}
          />

          <NavButtons onBack={() => { setWizardStep('birthdate'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 4: CORREO ELECTRÓNICO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'email' && (
        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Tu correo electrónico
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Lo usaremos para que puedas acceder a tu cuenta de tutor.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="email" className="auth-input" required placeholder="correo@ejemplo.com"
              value={generalForm.email}
              onChange={e => setGeneralForm({ ...generalForm, email: e.target.value })} />
          </div>

          <NavButtons onBack={() => { setWizardStep('location'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 5: CONTRASEÑA
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'password' && (
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Seguridad de tu cuenta
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Crea credenciales seguras para proteger la información de tu familia.
            </p>
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

          <NavButtons onBack={() => { setWizardStep('email'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 6: RELACIÓN / ¿Para quién es el perfil?
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'relationship_type' && (
        <form onSubmit={handleRelationshipTypeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              ¿Para quién es el perfil?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esto nos ayudará a personalizar cada recomendación y el acompañamiento para tu ser querido.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DESTINATARIOS.map(opt => {
              const isSelected = destinatario === opt.id
              return (
                <button key={opt.id} type="button" onClick={() => setDestinatario(opt.id)}
                  style={{
                    padding: '14px 16px', borderRadius: 12,
                    border: `1.5px solid ${isSelected ? '#229B58' : '#E5DCD2'}`,
                    background: isSelected ? 'rgba(34, 155, 88, 0.08)' : 'var(--bg-surface)',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${isSelected ? '#229B58' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

          <NavButtons onBack={() => { setWizardStep('password'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 7: NOMBRE DE LA PERSONA A CARGO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'relationship_name' && (
        <form onSubmit={handleRelationshipNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Nombre de la persona con discapacidad
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Indica el nombre de la persona a tu cuidado.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Nombre de {destinatario === 'hijo' ? 'tu hijo/a' : destinatario === 'familiar' ? 'tu familiar' : 'la persona a tu cuidado'} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" className="auth-input" required
              placeholder={destinatario === 'hijo' ? 'Ej. Mateo' : destinatario === 'familiar' ? 'Ej. Sofía' : 'Ej. Carlos'}
              value={nombreDependiente}
              onChange={e => setNombreDependiente(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''))} />
          </div>

          <NavButtons onBack={() => { setWizardStep('relationship_type'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 8: FECHA DE NACIMIENTO DE LA PERSONA A CARGO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'relationship_birthdate' && (
        <form onSubmit={handleRelationshipBirthdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Fecha de nacimiento
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Indica la fecha de nacimiento de {personName}.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Fecha de nacimiento de {personName} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              className="auth-input"
              required
              max={getMaxBirthDate()}
              min={MIN_BIRTH_DATE}
              value={fechaNacimientoDependiente}
              onChange={e => setFechaNacimientoDependiente(e.target.value)}
            />
            {fechaNacimientoDependiente && (() => {
              const edad = calcEdad(fechaNacimientoDependiente)
              const etapaId = calcEtapaDependiente(fechaNacimientoDependiente)
              if (edad === null) return null
              const etapaLabel = etapaId
                ? ({
                    infancia: 'Infancia', adolescencia: 'Adolescencia',
                    adultoJoven: 'Adulto joven', adulto: 'Adulto', mayor: 'Adulto mayor',
                  } as Record<string, string>)[etapaId]
                : null
              return (
                <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '5px 0 0' }}>
                  {edad} años{etapaLabel ? ` · ${etapaLabel}` : ''} — lo usaremos para personalizar sus recomendaciones
                </p>
              )
            })()}
          </div>

          <NavButtons onBack={() => { setWizardStep('relationship_name'); scrollTop() }} submitLabel="Continuar" />
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
              ¿Cómo prefieres que Raíces te acompañe en el camino de {personName}?
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LIST_ACOMPANAMIENTO.map(opt => {
              const isSelected = generalForm.acompanamiento === opt.id
              return (
                <button key={opt.id} type="button" onClick={() => setGeneralForm({ ...generalForm, acompanamiento: opt.id })}
                  style={{
                    padding: '14px 16px', borderRadius: 12,
                    border: `1.5px solid ${isSelected ? '#229B58' : '#E5DCD2'}`,
                    background: isSelected ? 'rgba(34, 155, 88, 0.08)' : 'var(--bg-surface)',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${isSelected ? '#229B58' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

          <NavButtons onBack={() => { setWizardStep('relationship_birthdate'); scrollTop() }} submitLabel="Continuar a condición" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 5: CONDICIÓN PCD (de la persona a cargo)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'condition' && (
        <form onSubmit={handleConditionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Condición de {personName}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              ¿Qué condición o situación describe mejor a {personName}? (Puedes seleccionar más de una.)
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {CONDICIONES_PCD.map(cond => (
              <CheckChip
                key={cond}
                label={cond}
                selected={conditionData.conditions.includes(cond)}
                onToggle={() => toggleCondition(cond)}
                accent="#229B58"
              />
            ))}
          </div>

          <NavButtons onBack={() => { setWizardStep('accommodation'); scrollTop() }} submitLabel="Continuar a diagnóstico" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 11: NEURODIVERGENCIA (Condicional)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'neurodivergence' && (
        <form onSubmit={handleNeurodivergenceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ marginBottom: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Especificar neurodivergencia
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              ¿Qué tipo de neurodivergencia describe a {personName}?
            </p>
          </div>

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

          <NavButtons onBack={() => { setWizardStep('condition'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 12: DIAGNÓSTICO Y TEMPORALIDAD
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'diagnosis' && (
        <form onSubmit={handleDiagnosisSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ marginBottom: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Diagnóstico de {personName}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información nos ayuda a sugerir especialistas, programas y recursos adaptados.
            </p>
          </div>

          {/* Diagnóstico */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', marginBottom: 8 }}>¿Cuenta {personName} con algún diagnóstico formal o clínico?</label>
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
              <input type="text" className="auth-input" placeholder="Escribe el diagnóstico formal o clínico"
                value={conditionData.diagnosticoEspecifico}
                onChange={e => setConditionData({ ...conditionData, diagnosticoEspecifico: e.target.value })} />
            ) : conditionData.tieneDiagnostico === 'no' ? (
              <div style={{ background: 'rgba(255,77,104,0.08)', border: '1px solid rgba(255,77,104,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--fg1)', lineHeight: 1.5 }}>
                💡 <strong>Nota:</strong> Al no contar con un diagnóstico formal, te abriremos un camino especializado para conectar con profesionales de evaluación.
              </div>
            ) : null}
          </div>

          {/* Temporalidad */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', marginBottom: 8 }}>¿En qué momento comenzó o se identificó la condición?</label>
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

          <NavButtons
            onBack={() => {
              if (conditionData.conditions.includes('Neurodivergencia (especificar)')) {
                setWizardStep('neurodivergence')
              } else {
                setWizardStep('condition')
              }
              scrollTop()
            }}
            submitLabel="Continuar a historial"
          />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 13: HISTORIAL EDUCATIVO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'history_edu' && (
        <form onSubmit={handleHistoryEduSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Historial educativo
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              ¿Qué tipo de escuela o modalidad ha cursado {personName}? (Opcional, puedes elegir varias)
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
              {LIST_EDUCACION.map(op => (
                <CheckChip key={op} label={op} selected={educacionHistory.includes(op)} onToggle={() => toggleEducacionHistory(op)} />
              ))}
            </div>
          </div>

          <NavButtons onBack={() => { setWizardStep('diagnosis'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 14: HISTORIAL DE TERAPIAS
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'history_therapy' && (
        <form onSubmit={handleHistoryTherapySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Terapias recibidas
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              ¿Con qué terapias cuenta o ha contado {personName}? (Opcional, puedes elegir varias)
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
              {LIST_TERAPIAS.map(op => (
                <CheckChip key={op} label={op} selected={terapiaHistory.includes(op)} onToggle={() => toggleTerapiaHistory(op)} />
              ))}
            </div>
          </div>

          <NavButtons onBack={() => { setWizardStep('history_edu'); scrollTop() }} submitLabel="Continuar a zonas" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 15: ZONAS DE PREFERENCIA
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'support_zones' && (
        <form onSubmit={handleSupportZonesSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Zonas de preferencia
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Agrega las zonas donde les sea más fácil acudir a actividades, terapias o servicios para {personName}. (Opcional)
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
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

              {/* Agregar otra zona manualmente */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Escribe otra zona, distrito o vecindario"
                  value={zonaInput}
                  onChange={e => setZonaInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addManualZone() } }}
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button
                  type="button"
                  onClick={addManualZone}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    background: '#229B58', color: '#fff', border: 'none',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  }}
                >
                  Agregar
                </button>
              </div>

              {/* Zonas seleccionadas */}
              {preferredZones.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {preferredZones.map(z => (
                    <span key={z} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'rgba(34, 155, 88, 0.12)', color: 'var(--fg1)',
                      border: '1.5px solid #229B58', borderRadius: 8,
                      padding: '4px 10px', fontSize: 12, fontWeight: 700,
                    }}>
                      📍 {z}
                      <button
                        type="button"
                        onClick={() => removePreferredZone(z)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: 0, color: '#6b7280', fontSize: 14, lineHeight: 1,
                          fontWeight: 700, display: 'flex', alignItems: 'center',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          <NavButtons onBack={() => { setWizardStep('history_therapy'); scrollTop() }} submitLabel="Continuar a necesidades" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 16: NECESIDADES A CUBRIR
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'support_needs' && (
        <form onSubmit={handleSupportNeedsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Necesidades a cubrir
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              ¿Cuáles son los apoyos más importantes para ustedes hoy? (Opcional, puedes elegir varias)
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
              {LIST_NECESIDADES.map(op => (
                <CheckChip key={op} label={op} selected={needsList.includes(op)} onToggle={() => toggleNeedsList(op)} />
              ))}
            </div>
          </div>

          <NavButtons onBack={() => { setWizardStep('support_zones'); scrollTop() }} submitLabel="Continuar a áreas de apoyo" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 17: ÁREAS DE APOYO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'support_areas' && (
        <form onSubmit={handleSupportAreasSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Áreas donde {personName} requiere apoyo
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              ¿En qué aspectos de la vida diaria les gustaría contar con más acompañamiento? (Opcional, puedes elegir varias)
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
              {LIST_AREAS_APOYO.map(op => (
                <CheckChip key={op} label={op} selected={supportAreas.includes(op)} onToggle={() => toggleSupportAreas(op)} />
              ))}
            </div>
          </div>

          <NavButtons onBack={() => { setWizardStep('support_needs'); scrollTop() }} submitLabel="Continuar a escalas" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 9: ESCALAS A-D (1/2)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'scales1' && (
        <form onSubmit={handleScales1Submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Escalas de Vida de {personName} (1/2)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Selecciona la opción que mejor represente la situación actual de {personName}.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <ScaleCard title="A. Autonomía" desc="¿Qué tanto participa en decisiones?" options={ESCALAS_OPCIONES.autonomia} value={scales.autonomia} onChange={v => setScales({ ...scales, autonomia: Number(v) })} />
            <ScaleCard title="B. Independencia" desc="¿Qué nivel de apoyo necesita?" options={ESCALAS_OPCIONES.independencia} value={scales.independencia} onChange={v => setScales({ ...scales, independencia: Number(v) })} />
            <ScaleCard title="C. Comunicación" desc="¿Cómo expresa sus necesidades?" options={ESCALAS_OPCIONES.comunicacion} value={scales.comunicacion} onChange={v => setScales({ ...scales, comunicacion: Number(v) })} />
            <ScaleCard title="D. Comprensión" desc="¿Sigue instrucciones o decisiones?" options={ESCALAS_OPCIONES.comprension} value={scales.comprension} onChange={v => setScales({ ...scales, comprension: Number(v) })} />
          </div>

          <NavButtons onBack={() => { setWizardStep('support_areas'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 10: ESCALAS E-H (2/2)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'scales2' && (
        <form onSubmit={handleScales2Submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Escalas de Vida de {personName} (2/2)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Continúa evaluando el desenvolvimiento de {personName} en estas áreas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <ScaleCard title="E. Energía / Resistencia" desc="¿Cómo impactan su energía y regulación?" options={ESCALAS_OPCIONES.energia} value={scales.energia} onChange={v => setScales({ ...scales, energia: Number(v) })} />
            <ScaleCard title="F. Movilidad" desc="¿Cómo interactúa físicamente con su entorno?" options={ESCALAS_OPCIONES.movilidad} value={scales.movilidad} onChange={v => setScales({ ...scales, movilidad: Number(v) })} />
            <ScaleCard title="G. Social" desc="¿Cómo participa con otras personas o grupos?" options={ESCALAS_OPCIONES.social} value={scales.social} onChange={v => setScales({ ...scales, social: Number(v) })} />
            <ScaleCard title="H. Emocional" desc="¿Qué tanta estabilidad y regulación emocional vive?" options={ESCALAS_OPCIONES.emocional} value={scales.emocional} onChange={v => setScales({ ...scales, emocional: Number(v) })} />
          </div>

          <NavButtons onBack={() => { setWizardStep('scales1'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 11: FORMATOS DE INFORMACIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'formats' && (
        <form onSubmit={handleFormatsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Formatos de información para {personName}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              ¿En qué formatos comprende mejor o le resulta más cómodo recibir información?
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIST_FORMATOS.map(fmt => {
              const isChecked = formatos.includes(fmt.id)
              return (
                <button key={fmt.id} type="button" onClick={() => toggleFormato(fmt.id)}
                  style={{
                    padding: '12px 14px', borderRadius: 10,
                    border: `1.5px solid ${isChecked ? '#229B58' : '#E5DCD2'}`,
                    background: isChecked ? 'rgba(34, 155, 88, 0.08)' : 'var(--bg-surface)',
                    color: isChecked ? 'var(--primary)' : 'var(--fg1)',
                    fontWeight: isChecked ? 700 : 500, fontSize: 13,
                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s ease',
                  }}>
                  <span style={{ fontSize: 18 }}>{fmt.icon}</span>
                  <span style={{ flex: 1 }}>{fmt.label}</span>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${isChecked ? '#229B58' : '#9ca3af'}`, background: isChecked ? '#229B58' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    {isChecked && Icons.check({ s: 10 })}
                  </div>
                </button>
              )
            })}
          </div>

          <NavButtons onBack={() => { setWizardStep('scales2'); scrollTop() }} submitLabel="Continuar a intereses" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 12: INTERESES
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'interests' && (
        <form onSubmit={handleInterestsSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 12, flexShrink: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Intereses y actividades de {personName}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Selecciona las áreas y temas que más le apasionan o en las que busca nuevas oportunidades.
            </p>
          </div>

          {/* Scrollable interest tags */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {INTEREST_SECTIONS.map((sec) => (
                <div key={sec.title} style={{
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 14,
                  padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: sec.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: sec.color, letterSpacing: '0.07em' }}>
                      {sec.title}
                    </span>
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
           STEP 13: VIABILIDAD ECONÓMICA
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'viability' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Viabilidad económica familiar
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esto nos ayuda a recomendarles opciones acordes a su presupuesto familiar.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 14, padding: '16px' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', marginBottom: 10 }}>¿Qué tipo de opciones son más viables para su familia hoy?</label>
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
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Otros temas o actividades que le gustaría explorar a {personName}</label>
            <input type="text" className="auth-input" placeholder="Ej. Arte terapia, natación adaptada, música, robótica..."
              value={otrosIntereses}
              onChange={e => setOtrosIntereses(e.target.value)} />
          </div>

          <NavButtons
            onBack={() => { setWizardStep('interests'); scrollTop() }}
            submitLabel={sending ? 'Completando registro...' : 'Finalizar registro'}
            submitDisabled={sending}
            submitIcon={Icons.sparkles({ s: 18 })}
          />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           THANKS SCREEN (Confirmación)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'thanks' && (
        <div style={{
          background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 24,
          padding: '36px 28px', textAlign: 'center', boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInUp 0.4s ease both',
        }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED 0%, #3A86FF 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32, boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)' }}>
            🎉
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px' }}>
            ¡Gracias por ser el apoyo de {personName}!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: '0 auto 24px', maxWidth: 360 }}>
            Hemos registrado tu perfil de tutor/a y las necesidades de {personName}. Estamos listos para acompañarlos con las mejores oportunidades.
          </p>
          <div style={{ background: 'var(--bg-cool)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, textAlign: 'left', fontSize: 13, color: 'var(--fg2)', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--fg1)' }}>
              🔒 Tu información está protegida
            </p>
            <p style={{ margin: 0, fontWeight: 500, color: 'var(--fg1)' }}>
              Cada dato ingresado nos permite conectar a {personName} con instituciones seguras, actividades accesibles y una comunidad confiable.
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
           SUMMARY / BIENVENIDA GENERADO POR IA
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
            A través de nuestra inteligencia artificial hemos captado la esencia y necesidades de {personName} para acompañarlos:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'var(--bg-cool)', border: '1.5px solid var(--primary)', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🌟</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', margin: 0 }}>1. Su identidad y fortalezas</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg1)', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.quienEres || `Como tutor/a de ${personName}, buscas los mejores caminos para su desarrollo y bienestar.`}
              </p>
            </div>
            <div style={{ background: 'var(--bg-cool)', border: '1.5px solid var(--color-amarillo)', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🧭</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', margin: 0 }}>2. Su contexto</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg1)', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.contexto || `Su entorno y experiencia marcan el rumbo para adaptar cada herramienta y apoyo.`}
              </p>
            </div>
            <div style={{ background: 'var(--bg-cool)', border: '1.5px solid var(--color-coral)', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🎯</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: 'var(--fg1)', margin: 0 }}>3. Sus intereses y metas</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg1)', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.loQueTeGusta || `Sus pasiones guían el camino hacia nuevas conexiones y oportunidades.`}
              </p>
            </div>
          </div>

          <button className="auth-btn-primary" type="button" onClick={handleFinishToLogin}
            style={{ width: '100%', padding: '14px 20px', fontSize: 15 }}>
            Comencemos su camino en Raíces   {Icons.arrowRight({ s: 18 })}
          </button>
        </div>
      )}
    </div>
  )
}
