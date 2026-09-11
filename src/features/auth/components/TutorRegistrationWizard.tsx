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

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    if (!checkPasswordCriteria(generalForm.password)) {
      setError('La contraseña no cumple con los requisitos de seguridad.')
      setSending(false)
      return
    }

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
      nav('/dashboard', { replace: true })
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
      {(

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
              onChange={e => setGeneralForm(prev => ({ ...prev, nombres: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Primer apellido (como tutor/cuidador) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" className="auth-input" required placeholder="Ej. García"
                value={generalForm.apellidoPaterno}
                onChange={e => setGeneralForm(prev => ({ ...prev, apellidoPaterno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Segundo apellido (como tutor/cuidador) <span style={{ color: 'var(--fg3)', fontWeight: 500, fontSize: 12 }}>(opcional)</span></label>
              <input type="text" className="auth-input" placeholder="Ej. López"
                value={generalForm.apellidoMaterno}
                onChange={e => setGeneralForm(prev => ({ ...prev, apellidoMaterno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') }))} />
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
              onChange={e => setGeneralForm(prev => ({ ...prev, birth_date: e.target.value }))} />
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
              onChange={e => setGeneralForm(prev => ({ ...prev, email: e.target.value }))} />
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
              onChange={v => setGeneralForm(prev => ({ ...prev, password: v }))}
              showPass={showPass}
              onToggleShow={() => setShowPass(!showPass)}
              strength={passStrength}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="auth-btn-secondary" type="button" onClick={() => { setWizardStep('email'); scrollTop() }} style={{ flex: 1 }} disabled={sending}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" style={{ flex: 2 }} disabled={sending}>
              {sending ? 'Creando cuenta...' : 'Crear cuenta'} {Icons.check({ s: 18 })}
            </button>
          </div>
        </form>
      )}

\n    </div>
  )
}
