import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile } from '../hooks/useAuth'
import { Icons } from '@shared/components/shared'
import { setRememberMe, saveUser } from '@shared/lib/storage'
import { getPasswordStrength, checkPasswordCriteria } from '../lib/passwordStrength'
import PasswordRequirements from './PasswordRequirements'


// ── LISTAS Y CATÁLOGOS ───────────────────────────────────────────
const LIST_ACOMPANAMIENTO = [
  { id: 'cuenta', label: 'Quiero explorar por mi cuenta.', desc: 'Navega libremente por todos los recursos y comunidades' },
  { id: 'paso_a_paso', label: 'Me gustaría recibir recomendaciones paso a paso.', desc: 'Te guiaremos con rutas sugeridas a tu propio ritmo' },
  { id: 'apoyo_necesario', label: 'Prefiero contar con apoyo cuando lo necesite.', desc: 'Acceso directo a acompañamiento y orientación' },
]

const CONDICIONES_PCD = [
  'Intelectual o cognitiva',
  'Motriz o de movilidad física',
  'Visual',
  'Auditiva',
  'Del habla y la comunicación',
  'Neurodivergencia (especificar)',
  'Psicosocial',
  'Prefiero no responder',
]

const NEURODIVERGENCIAS_LIST = [
  'Autismo', 'TDAH', 'Dislexia', 'Dispraxia',
  'Síndrome de Tourette', 'Altas capacidades/superdotación', 'Otro',
]

const LIST_TEMPORALIDAD = [
  { id: 'nacimiento', label: 'Desde el nacimiento' },
  { id: 'infancia', label: 'Se presentó durante la infancia' },
  { id: 'adolescencia', label: 'Se presentó durante la adolescencia' },
  { id: 'vida_adulta', label: 'Se presentó en la vida adulta' },
  { id: 'progresiva', label: 'Ha ido apareciendo o cambiando con el tiempo' },
  { id: 'en_evaluacion', label: 'Actualmente está en proceso de evaluación' },
]

const ESCALAS_OPCIONES = {
  autonomia: [
    { value: 4, label: 'Tomo decisiones con autonomía' },
    { value: 3, label: 'Participo con apoyo ocasional' },
    { value: 2, label: 'Requiero guía frecuente' },
    { value: 1, label: 'Requiero representación o apoyo constante' },
  ],
  independencia: [
    { value: 4, label: 'Me desenvuelvo con autonomía' },
    { value: 3, label: 'Requiero apoyo en algunas actividades' },
    { value: 2, label: 'Requiero apoyo frecuente' },
    { value: 1, label: 'Requiero acompañamiento constante' },
  ],
  comunicacion: [
    { value: 5, label: 'Verbal fluida' },
    { value: 4, label: 'Verbal limitada' },
    { value: 3, label: 'No verbal con comunicación funcional (señas, dispositivos, apoyos visuales)' },
    { value: 2, label: 'No verbal con apoyo constante' },
    { value: 1, label: 'En desarrollo / exploración' },
  ],
  comprension: [
    { value: 4, label: 'Independiente' },
    { value: 3, label: 'Con apoyo ocasional' },
    { value: 2, label: 'Con apoyo frecuente' },
    { value: 1, label: 'Con apoyo total' },
  ],
  energia: [
    { value: 4, label: 'Alta → Participo activamente en la mayoría de actividades' },
    { value: 3, label: 'Media → Participo bien con pausas o equilibrio' },
    { value: 2, label: 'Variable → Depende del día, entorno o condición' },
    { value: 1, label: 'Baja → Requiero actividades de baja demanda o periodos cortos' },
  ],
  movilidad: [
    { value: 4, label: 'Independiente' },
    { value: 3, label: 'Con apoyo ocasional' },
    { value: 2, label: 'Con apoyo frecuente' },
    { value: 1, label: 'Con apoyo total' },
  ],
  social: [
    { value: 4, label: 'Participo con facilidad' },
    { value: 3, label: 'Participo con algunas barreras' },
    { value: 2, label: 'Requiero apoyo frecuente' },
    { value: 1, label: 'Requiero acompañamiento constante' },
  ],
  emocional: [
    { value: 4, label: 'Poco o nada' },
    { value: 3, label: 'Algunas veces' },
    { value: 2, label: 'Frecuentemente' },
    { value: 1, label: 'Requiero apoyo constante' },
  ],
}

const LIST_FORMATOS = [
  { id: 'texto', label: 'Leyendo textos', icon: '📖' },
  { id: 'imagenes', label: 'Con imágenes', icon: '🖼️' },
  { id: 'audio', label: 'Con audio', icon: '🎧' },
  { id: 'video', label: 'Con videos', icon: '🎬' },
  { id: 'persona', label: 'Con apoyo de otra persona', icon: '🤝' },
]


const INTEREST_SECTIONS = [
  {
    title: 'DEPORTE / MOVIMIENTO', color: '#229B58',
    items: ['Actividad física general', 'Deporte recreativo', 'Deporte adaptado', 'Competencia', 'Rehabilitación funcional', 'Movimiento / coordinación', 'Actividades al aire libre'],
  },
  {
    title: 'BIENESTAR / ATENCIÓN ESPECIALIZADA', color: '#073B4C',
    items: ['Terapias', 'Salud mental / emocional', 'Atención médica especializada', 'Odontología especializada', 'Rehabilitación', 'Regulación sensorial', 'Estética / cuidado personal especializado'],
  },
  {
    title: 'EMPLEO', color: '#FF4D68',
    items: ['Primer empleo', 'Reintegración laboral', 'Capacitación laboral', 'Empleo adaptado', 'Empleo profesional', 'Trabajo flexible'],
  },
  {
    title: 'AUTOEMPLEO', color: '#D4944C',
    items: ['Emprendimiento', 'Negocio propio', 'Venta de productos', 'Servicios', 'Marca personal', 'Economía digital'],
  },
  {
    title: 'ARTE / CULTURA / MÚSICA', color: '#9B51E0',
    items: ['Música', 'Danza', 'Pintura / dibujo', 'Teatro', 'Literatura', 'Manualidades', 'Cultura / eventos'],
  },
  {
    title: 'INDEPENDENCIA', color: '#2F80ED',
    items: ['Vida cotidiana', 'Movilidad', 'Comunicación', 'Finanzas personales', 'Organización diaria', 'Vida independiente'],
  },
  {
    title: 'VIDA SOCIAL', color: '#E14E87',
    items: ['Amistades', 'Eventos', 'Relaciones', 'Actividades grupales', 'Socialización guiada', 'Citas / vínculos', 'Espacios recreativos'],
  },
  {
    title: 'EXPLORAR POSIBILIDADES', color: '#138A8A',
    items: ['Descubrir intereses', 'Nuevas experiencias', 'Inspiración', 'Orientación', 'Comunidad', 'Futuro'],
  },
]

const LIST_VIABILIDAD = [
  { id: 'gratuita_becas', label: 'Gratuitas, con becas o apoyos' },
  { id: 'bajo_costo', label: 'Bajo costo' },
  { id: 'moderada', label: 'Inversión moderada' },
  { id: 'sin_restricciones', label: 'Sin restricciones definidas' },
]

// ── CURP VALIDATION ──────────────────────────────────────────────
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i
const VOWELS = 'AEIOU'
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'

function getFirstInternalVowel(str) {
  const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
  for (let i = 1; i < normalized.length; i++) {
    if (VOWELS.includes(normalized[i])) return normalized[i]
  }
  return 'X'
}

function getFirstInternalConsonant(str) {
  if (!str) return 'X'
  const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase()
  for (let i = 1; i < normalized.length; i++) {
    if (CONSONANTS.includes(normalized[i])) return normalized[i]
  }
  return 'X'
}

function getCurpName(fullName) {
  if (!fullName) return ''
  const parts = fullName.trim().toUpperCase().split(/\s+/)
  if (parts.length > 1) {
    const first = parts[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (['MARIA', 'MA', 'MA.', 'JOSE', 'J', 'J.'].includes(first)) return parts[1]
  }
  return parts[0]
}

function validateCurpMatch(curp, nombres, apPat, apMat, birthDate) {
  if (!curp || curp.length !== 18 || !CURP_REGEX.test(curp)) return { valid: true, errors: [], nameIsComplete: false }
  if (!birthDate) return { valid: true, errors: [], nameIsComplete: false }
  const errors = []
  const c = curp.toUpperCase()
  const yy = parseInt(c.substring(4, 6), 10)
  const mm = parseInt(c.substring(6, 8), 10)
  const dd = parseInt(c.substring(8, 10), 10)
  const century = /[A-Z]/.test(c[16]) ? 20 : 19
  const curpYear = century * 100 + yy
  const [iY, iM, iD] = birthDate.split('-').map(Number)
  if (curpYear !== iY || mm !== iM || dd !== iD) {
    errors.push('La fecha de nacimiento no coincide con la CURP. En la CURP aparece ' + String(dd).padStart(2, '0') + '/' + String(mm).padStart(2, '0') + '/' + curpYear + '.')
  }
  const p = apPat?.trim().toUpperCase()
  const m = apMat?.trim().toUpperCase()
  const n = nombres?.trim().toUpperCase()

  if (p) {
    if (c[0] !== p[0]) errors.push('La CURP no coincide con el apellido paterno.')
    if (c[1] !== getFirstInternalVowel(p)) errors.push('La CURP no coincide con las iniciales del apellido paterno.')
    if (c[13] !== getFirstInternalConsonant(p)) errors.push('La CURP no coincide con las consonantes del apellido paterno.')
  }
  if (m) {
    if (c[2] !== m[0]) errors.push('La CURP no coincide con el apellido materno.')
    if (c[14] !== getFirstInternalConsonant(m)) errors.push('La CURP no coincide con las consonantes del apellido materno.')
  }
  if (n) {
    const nombre = getCurpName(n)
    if (c[3] !== nombre[0]) errors.push('La CURP no coincide con el nombre.')
    if (c[15] !== getFirstInternalConsonant(nombre)) errors.push('La CURP no coincide con las consonantes del nombre.')
  }

  const nameIsComplete = !!(p && m && n)
  return { valid: errors.length === 0, errors, nameIsComplete }
}

function CurpIndicator(props) {
  const { curp, nombres, apPat, apMat, birthDate } = props
  if (!curp || curp.length === 0) {
    return <p style={{ fontSize: 11, margin: '4px 0 0', color: 'var(--fg3)' }}>18 caracteres alfanuméricos (ej. GARC850101HDFRL09)</p>
  }
  const fmt = CURP_REGEX.test(curp)
  const full = curp.length === 18
  const cr = fmt ? validateCurpMatch(curp, nombres, apPat, apMat, birthDate) : { valid: false, errors: [], nameIsComplete: false }
  const col = !full ? 'var(--fg3)' : !fmt ? '#ef4444' : !cr.valid ? '#f97316' : cr.nameIsComplete ? '#22c55e' : 'var(--fg3)'
  const ico = !full ? '' : !fmt ? '\u2717' : !cr.valid ? '\u26a0' : cr.nameIsComplete ? '\u2713' : '\u2139'

  let txt = ''
  if (!full) txt = curp.length + '/18 caracteres'
  else if (!fmt) txt = 'Formato de CURP no válido'
  else if (!cr.valid) txt = cr.errors[0]
  else if (cr.nameIsComplete) txt = 'CURP válida y coincide con nombre y fecha'
  else txt = 'CURP válida (completa tu nombre y apellidos para verificar)'
  return <p style={{ fontSize: 12, margin: '4px 0 0', color: col }}>{ico} {txt}</p>
}

// ── SCALE CARD (compact helper) ──────────────────────────────────
function ScaleCard({ title, desc, options, value, onChange }) {
  return (
    <div style={{ background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 12, padding: 14 }}>
      <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#073B4C', margin: '0 0 3px' }}>{title}</h3>
      <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>{desc}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map(opt => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 8,
                border: `1.5px solid ${isSelected ? '#229B58' : '#E5DCD2'}`,
                background: isSelected ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                fontWeight: isSelected ? 700 : 500,
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
                color: isSelected ? '#073B4C' : 'var(--fg1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{opt.label}</span>
              {isSelected && (
                <span style={{ color: '#229B58', fontWeight: 800, fontSize: 13, flexShrink: 0, marginLeft: 6 }}>
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── STEP ORDER ───────────────────────────────────────────────────
const STEP_ORDER = [
  'identity',     // 1: Nombres, apellidos, fecha nacimiento
  'security',     // 2: Email, contraseña
  'accommodation',// 3: Preferencia de acompañamiento
  'condition',    // 4: Condición PCD
  'origin',       // 5: Neurodivergencia, diagnóstico, temporalidad
  'scales1',      // 6: Escalas A-D
  'scales2',      // 7: Escalas E-H
  'formats',      // 8: Formatos de información
  'interests',    // 9: Intereses
  'viability',    // 10: Viabilidad económica
]
const TOTAL_STEPS = STEP_ORDER.length

// ── NAV BUTTONS (outside render to avoid re-creation) ───────────
function NavButtons({ onBack, submitLabel, submitDisabled, submitIcon }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 14, flexShrink: 0 }}>
      <button className="auth-btn-secondary" type="button" onClick={onBack} style={{ flex: 1 }}>
        {Icons.arrowLeft({ s: 16 })} Volver
      </button>
      <button className="auth-btn-primary" type="submit" disabled={submitDisabled} style={{ flex: 2 }}>
        {submitLabel} {submitIcon || Icons.arrowRight({ s: 18 })}
      </button>
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function RegistrationWizard({ onBackToRoles, onGoToLogin }) {
  const { addToast } = useUiStore()
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const updateProfile = useUpdateProfile()

  const [wizardStep, setWizardStep] = useState('identity')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [docFile, setDocFile] = useState(null)
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
  const [generalForm, setGeneralForm] = useState({
    nombres: '', apellidoPaterno: '', apellidoMaterno: '',
    birth_date: '', domicilio: '', email: '', password: '',
    curp: '', acompanamiento: '',
  })

  // Step 5–6: Condición y diagnóstico
  const [conditionData, setConditionData] = useState({
    conditions: [], neurodivergencias: [], neuroOtro: '',
    tieneDiagnostico: '', diagnosticoEspecifico: '',
    redFlagDiagnostico: false, temporalidad: '',
  })

  // Step 7–8: Escalas de vida
  const [scales, setScales] = useState({
    autonomia: null, independencia: null, comunicacion: null, comprension: null,
    energia: null, movilidad: null, social: null, emocional: null,
  })

  // Step 9: Formatos
  const [formatos, setFormatos] = useState([])

  // Step 10–11: Intereses y viabilidad
  const [selectedInterests, setSelectedInterests] = useState([])
  const [otrosIntereses, setOtrosIntereses] = useState('')
  const [viabilidad, setViabilidad] = useState('')

  // AI summary
  const [aiNarrative, setAiNarrative] = useState(null)

  // ── Helpers ─────────────────────────────────────────────────────
  const scrollTop = () => {
    const col = document.querySelector('.auth-form-column')
    if (col) col.scrollTop = 0
  }

  const stepIndex = STEP_ORDER.indexOf(wizardStep)
  const progressPct = stepIndex >= 0 ? ((stepIndex + 1) / TOTAL_STEPS) * 100 : 100

  // ── Toggle handlers ─────────────────────────────────────────────
  const toggleCondition = (cond) => {
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

  const toggleNeuro = (item) => {
    setConditionData(prev => ({
      ...prev,
      neurodivergencias: prev.neurodivergencias.includes(item)
        ? prev.neurodivergencias.filter(x => x !== item)
        : [...prev.neurodivergencias, item],
    }))
  }

  const toggleFormato = (id) => {
    setFormatos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleInterest = (item) => {
    setError('')
    setSelectedInterests(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  // ── Navigation handlers ─────────────────────────────────────────
  // Step 1 → 2: Identity → Security
  const handleIdentitySubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!generalForm.nombres || !generalForm.apellidoPaterno || !generalForm.apellidoMaterno) {
      setError('Por favor, completa tu nombre y apellidos.')
      return
    }
    if (!generalForm.birth_date) {
      setError('Por favor, ingresa tu fecha de nacimiento.')
      return
    }
    setWizardStep('security')
    scrollTop()
  }

  // Step 3 → 4: Security → Accommodation
  const handleSecuritySubmit = (e) => {
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
  const handleAccommodationSubmit = (e) => {
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
  const handleConditionSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (conditionData.conditions.length === 0) {
      setError('Selecciona al menos una opción que describa tu condición.')
      return
    }
    setWizardStep('origin')
    scrollTop()
  }

  // Step 5 → 6: Origin → Scales1
  const handleOriginSubmit = (e) => {
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
    setWizardStep('scales1')
    scrollTop()
  }

  // Step 7 → 8: Scales1 → Scales2
  const handleScales1Submit = (e) => {
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
  const handleScales2Submit = (e) => {
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
  const handleFormatsSubmit = (e) => {
    e.preventDefault()
    if (formatos.length === 0) {
      setError('Selecciona al menos un formato en el que prefieres recibir información.')
      return
    }
    setWizardStep('interests')
    scrollTop()
  }

  // Step 10 → 11: Interests → Viability
  const handleInterestsSubmit = (e) => {
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

    const tempoMap = {
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

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const registerPayload = {
        nombreCompleto: (generalForm.nombres + ' ' + generalForm.apellidoPaterno + ' ' + generalForm.apellidoMaterno).trim(),
        email: generalForm.email,
        password: generalForm.password,
        rol: 'pcd',
        ...(generalForm.curp ? { curp: generalForm.curp } : {}),
        fechaNacimiento: generalForm.birth_date,
      }

      let authResult = null
      try {
        const regRes = await api.post('/autenticacion/registro', registerPayload)
        authResult = regRes.data
      } catch (regErr) { console.warn('Registro warning:', regErr) }

      if (authResult?.tokenAcceso) {
        const token = authResult.tokenAcceso
        const userObj = {
          id: authResult.usuario?.id,
          email: authResult.usuario?.email || generalForm.email,
          role: 'pcd',
          full_name: (generalForm.nombres + ' ' + generalForm.apellidoPaterno + ' ' + generalForm.apellidoMaterno).trim(),
        }
        setRememberMe(true)
        setAuth(token, userObj, authResult.tokenRefresco ?? null, true)
        saveUser(userObj, true)
      }

      const scalesPayload = {
        nivelAutonomia: scales.autonomia ?? 3, nivelIndependencia: scales.independencia ?? 3,
        nivelComunicacion: scales.comunicacion ?? 3, nivelComprension: scales.comprension ?? 3,
        nivelEnergia: scales.energia ?? 3, nivelMovilidad: scales.movilidad ?? 3,
        nivelSocial: scales.social ?? 3, nivelEmocional: scales.emocional ?? 3,
        tieneDiagnostico: conditionData.tieneDiagnostico === 'si',
        diagnosticoEspecifico: conditionData.diagnosticoEspecifico,
        temporalidadOrigen: conditionData.temporalidad,
        preferenciaFormato: formatos[0] || 'texto',
        areasInteres: selectedInterests,
        viabilidadEconomica: viabilidad,
      }
      try { await api.post('/usuarios/escalas-vida', scalesPayload) } catch (scErr) { console.warn('Scales save notice:', scErr) }

      // Guardar perfil de necesidades (reemplaza el flujo del onboarding)
      // Calcular etapa de vida desde fecha de nacimiento
      const calcLifeStage = (birthDate) => {
        if (!birthDate) return null
        const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        if (age <= 5) return 'infancia_temprana'
        if (age <= 12) return 'infancia'
        if (age <= 17) return 'adolescencia'
        if (age <= 29) return 'juventud'
        if (age <= 59) return 'adultez'
        return 'adulto_mayor'
      }
      const calcAge = (birthDate) => {
        if (!birthDate) return null
        return Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      }
      const disabilityTypes = conditionData.conditions.filter(c => c !== 'Prefiero no responder')
      const allConditions = [...disabilityTypes, ...conditionData.neurodivergencias]
      try {
        await updateProfile.mutateAsync({
          full_name: registerPayload.nombreCompleto,
          profiling: {
            disability_types: allConditions.length > 0 ? allConditions : disabilityTypes,
            severity: conditionData.conditions.includes('Prefiero no responder') ? null : conditionData.conditions.join(', '),
            communication_modes: formatos.filter(f => f !== 'Prefiero no responder'),
            mobility_needs: scales.movilidad >= 4 ? [] : ['Movilidad reducida'],
            tech_access: formatos,
            preferred_zones: [],
            needs: [],
            goals: selectedInterests,
            support_areas: [],
            education_history: [],
            therapy_history: [],
            life_stage: calcLifeStage(generalForm.birth_date),
            current_concerns: conditionData.diagnosticoEspecifico || null,
            support_level: scales.comunicacion >= 4 ? 'independiente' : scales.comunicacion >= 2 ? 'con_apoyo' : 'necesita_apoyo_intensivo',
            birth_date: generalForm.birth_date,
            age: calcAge(generalForm.birth_date),
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

      localStorage.setItem('raices_user_interests', JSON.stringify(selectedInterests))
      localStorage.setItem('raices_user_viability', viabilidad)
      localStorage.setItem('raices_user_formatos', JSON.stringify(formatos))

      const narrative = generateNarrative()
      setAiNarrative(narrative)
      localStorage.setItem('raices_ai_narrative', JSON.stringify(narrative))

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
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#229B58', textTransform: 'uppercase' }}>
            Registro de Persona con Discapacidad
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)' }}>
            {stepIndex >= 0 ? `Paso ${stepIndex + 1} de ${TOTAL_STEPS}` : 'Completado ✓'}
          </span>
        </div>
        <div style={{ height: 5, background: '#E5DCD2', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #229B58 0%, #073B4C 100%)',
            borderRadius: 3,
            transition: 'width 0.4s ease',
            width: `${progressPct}%`,
          }} />
        </div>
      </div>

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
           STEP 1: IDENTIDAD (Nombres, apellidos, fecha nacimiento)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'identity' && (
        <form onSubmit={handleIdentitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
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
              value={generalForm.birth_date}
              onChange={e => setGeneralForm({ ...generalForm, birth_date: e.target.value })} />
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
           STEP 2: SEGURIDAD (Email, contraseña)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'security' && (
        <form onSubmit={handleSecuritySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
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
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} className="auth-input" required
                placeholder="Mínimo 8 caracteres"
                value={generalForm.password}
                onChange={e => setGeneralForm({ ...generalForm, password: e.target.value })}
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)' }}>
                {showPass ? Icons.eyeOff({ s: 18 }) : Icons.eye({ s: 18 })}
              </button>
            </div>
            {generalForm.password && (
              <div style={{ marginTop: 5 }}>
                <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: passStrength.width, background: passStrength.color, transition: 'all 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: passStrength.color, fontWeight: 600 }}>{passStrength.label}</span>
                </div>
                <PasswordRequirements password={generalForm.password} />
              </div>
            )}
          </div>

          <NavButtons onBack={() => { setWizardStep('identity'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 4: ACOMPAÑAMIENTO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'accommodation' && (
        <form onSubmit={handleAccommodationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
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
                    background: isSelected ? 'rgba(34,155,88,0.08)' : '#ffffff',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.2s ease',
                  }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? '#229B58' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isSelected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#229B58' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? '#073B4C' : 'var(--fg1)' }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>

          <NavButtons onBack={() => { setWizardStep('security'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 5: CONDICIÓN PCD
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'condition' && (
        <form onSubmit={handleConditionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
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
                    background: isChecked ? 'rgba(34,155,88,0.08)' : '#ffffff',
                    color: isChecked ? '#073B4C' : 'var(--fg1)',
                    fontWeight: isChecked ? 700 : 500, fontSize: 13,
                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${isChecked ? '#229B58' : '#9ca3af'}`, background: isChecked ? '#229B58' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    {isChecked && Icons.check({ s: 10 })}
                  </div>
                  <span>{cond}</span>
                </button>
              )
            })}
          </div>

          <NavButtons onBack={() => { setWizardStep('accommodation'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 6: ORIGEN Y DIAGNÓSTICO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'origin' && (
        <form onSubmit={handleOriginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ marginBottom: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Origen y diagnóstico
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información nos ayuda a personalizar tu experiencia.
            </p>
          </div>

          {/* Neurodivergencia (condicional) */}
          {conditionData.conditions.includes('Neurodivergencia (especificar)') && (
            <div style={{ background: '#FFF9F2', border: '1.5px solid #F4C84A', borderRadius: 12, padding: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#073B4C', marginBottom: 10 }}>Especificar neurodivergencia:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
                {NEURODIVERGENCIAS_LIST.map(nd => {
                  const isChecked = conditionData.neurodivergencias.includes(nd)
                  return (
                    <button key={nd} type="button" onClick={() => toggleNeuro(nd)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${isChecked ? '#073B4C' : '#E5DCD2'}`, background: isChecked ? '#073B4C' : '#ffffff', color: isChecked ? '#ffffff' : 'var(--fg1)', fontWeight: 600, fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
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
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#073B4C', marginBottom: 8 }}>¿Tienes algún diagnóstico en específico?</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <button type="button" onClick={() => setConditionData({ ...conditionData, tieneDiagnostico: 'si', redFlagDiagnostico: false })}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${conditionData.tieneDiagnostico === 'si' ? '#229B58' : '#E5DCD2'}`, background: conditionData.tieneDiagnostico === 'si' ? 'rgba(34,155,88,0.08)' : '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                Sí (especificar)
              </button>
              <button type="button" onClick={() => setConditionData({ ...conditionData, tieneDiagnostico: 'no', diagnosticoEspecifico: '', redFlagDiagnostico: true })}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${conditionData.tieneDiagnostico === 'no' ? '#FF4D68' : '#E5DCD2'}`, background: conditionData.tieneDiagnostico === 'no' ? 'rgba(255,77,104,0.08)' : '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                No
              </button>
            </div>
            {conditionData.tieneDiagnostico === 'si' ? (
              <input type="text" className="auth-input" placeholder="Escribe tu diagnóstico formal o clínico"
                value={conditionData.diagnosticoEspecifico}
                onChange={e => setConditionData({ ...conditionData, diagnosticoEspecifico: e.target.value })} />
            ) : conditionData.tieneDiagnostico === 'no' ? (
              <div style={{ background: 'rgba(255,77,104,0.08)', border: '1px solid rgba(255,77,104,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#073B4C', lineHeight: 1.5 }}>
                💡 <strong>Nota:</strong> Al no contar con un diagnóstico formal, te abriremos un camino especializado para conectar con especialistas.
              </div>
            ) : null}
          </div>

          {/* Temporalidad */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#073B4C', marginBottom: 8 }}>¿En qué momento comenzó esta condición?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {LIST_TEMPORALIDAD.map(t => {
                const isSelected = conditionData.temporalidad === t.id
                return (
                  <button key={t.id} type="button" onClick={() => setConditionData({ ...conditionData, temporalidad: t.id })}
                    style={{
                      padding: '9px 12px', borderRadius: 8,
                      border: `1.5px solid ${isSelected ? '#073B4C' : '#E5DCD2'}`,
                      background: isSelected ? '#073B4C' : '#ffffff',
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

          <NavButtons onBack={() => { setWizardStep('condition'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 7: ESCALAS A-D
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'scales1' && (
        <form onSubmit={handleScales1Submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Escalas de Vida (1/2)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Selecciona la opción que mejor represente tu situación actual.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <ScaleCard title="A. Autonomía" desc="¿Qué tanto participas en decisiones?" options={ESCALAS_OPCIONES.autonomia} value={scales.autonomia} onChange={v => setScales({ ...scales, autonomia: v })} />
            <ScaleCard title="B. Independencia" desc="¿Qué nivel de apoyo necesitas?" options={ESCALAS_OPCIONES.independencia} value={scales.independencia} onChange={v => setScales({ ...scales, independencia: v })} />
            <ScaleCard title="C. Comunicación" desc="¿Cómo expresas necesidades?" options={ESCALAS_OPCIONES.comunicacion} value={scales.comunicacion} onChange={v => setScales({ ...scales, comunicacion: v })} />
            <ScaleCard title="D. Comprensión" desc="¿Sigues instrucciones o decisiones?" options={ESCALAS_OPCIONES.comprension} value={scales.comprension} onChange={v => setScales({ ...scales, comprension: v })} />
          </div>

          <NavButtons onBack={() => { setWizardStep('origin'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 8: ESCALAS E-H
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'scales2' && (
        <form onSubmit={handleScales2Submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Escalas de Vida (2/2)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Continúa evaluando tu día a día en estas áreas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <ScaleCard title="E. Energía / Resistencia" desc="¿Cómo impactan tu energía y regulación?" options={ESCALAS_OPCIONES.energia} value={scales.energia} onChange={v => setScales({ ...scales, energia: v })} />
            <ScaleCard title="F. Movilidad" desc="¿Cómo interactúas físicamente con tu entorno?" options={ESCALAS_OPCIONES.movilidad} value={scales.movilidad} onChange={v => setScales({ ...scales, movilidad: v })} />
            <ScaleCard title="G. Social" desc="¿Cómo participas con personas o grupos?" options={ESCALAS_OPCIONES.social} value={scales.social} onChange={v => setScales({ ...scales, social: v })} />
            <ScaleCard title="H. Emocional" desc="¿Cómo impacta tu bienestar emocional?" options={ESCALAS_OPCIONES.emocional} value={scales.emocional} onChange={v => setScales({ ...scales, emocional: v })} />
          </div>

          <NavButtons onBack={() => { setWizardStep('scales1'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 9: FORMATOS DE INFORMACIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'formats' && (
        <form onSubmit={handleFormatsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
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
                    background: isChecked ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s ease',
                  }}>
                  <span style={{ fontSize: 32 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isChecked ? '#073B4C' : 'var(--fg1)' }}>{f.label}</span>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isChecked ? '#229B58' : '#9ca3af'}`, background: isChecked ? '#229B58' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {isChecked && Icons.check({ s: 11 })}
                  </div>
                </button>
              )
            })}
          </div>

          <NavButtons onBack={() => { setWizardStep('scales2'); scrollTop() }} submitLabel="Continuar" />
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
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#073B4C', margin: '0 0 6px', lineHeight: 1.2 }}>
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
                            padding: '6px 13px', borderRadius: 18,
                            border: isSelected ? `2px solid ${sec.color}` : '1.5px solid #E5DCD2',
                            background: isSelected ? sec.color : '#ffffff',
                            color: isSelected ? '#ffffff' : 'var(--fg1)',
                            fontSize: 12.5, fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                            transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                            transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Viabilidad económica
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esto nos ayuda a recomendarte opciones acordes a tu presupuesto.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 14, padding: '16px' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#073B4C', marginBottom: 10 }}>¿Qué tipo de opciones son más viables para ti hoy?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {LIST_VIABILIDAD.map((v) => {
                const isSelected = viabilidad === v.id
                return (
                  <button key={v.id} type="button" onClick={() => setViabilidad(v.id)}
                    style={{
                      padding: '12px 14px', borderRadius: 10,
                      border: `1.5px solid ${isSelected ? '#229B58' : '#E5DCD2'}`,
                      background: isSelected ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                      color: isSelected ? '#073B4C' : 'var(--fg1)',
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
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#073B4C', marginBottom: 5 }}>Otros temas que te gustaría explorar</label>
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
