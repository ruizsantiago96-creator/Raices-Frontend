import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { Icons } from '@shared/components/shared'
import { setRememberMe, saveUser } from '@shared/lib/storage'


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

const BookDoodle = () => (
  <svg width="34" height="34" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    {/* Book Cover */}
    <path
      d="M 6 12 Q 22 16 38 12 L 38 32 Q 22 36 6 32 Z"
      fill="#FF4D68"
      stroke="#0C3B4B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Left Page */}
    <path
      d="M 8 13 Q 22 17 22 14 L 22 30 Q 22 33 8 29 Z"
      fill="#FFFFFF"
      stroke="#0C3B4B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Right Page */}
    <path
      d="M 36 13 Q 22 17 22 14 L 22 30 Q 22 33 36 29 Z"
      fill="#FFFFFF"
      stroke="#0C3B4B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Spine */}
    <path d="M 22 14 L 22 32" stroke="#0C3B4B" strokeWidth="1.5" />
    {/* Text Lines */}
    <path d="M 11 18 H 19" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M 11 22 H 17" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M 11 26 H 18" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M 25 18 H 33" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M 27 22 H 33" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M 25 26 H 31" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const ImagesDoodle = () => (
  <svg width="34" height="34" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    {/* Frame */}
    <rect x="9" y="11" width="26" height="22" rx="3" fill="#FFFFFF" stroke="#0C3B4B" strokeWidth="2.2" />
    {/* Left Mountain */}
    <path
      d="M 9 32 L 18 23 L 27 32 Z"
      fill="#10B981"
      stroke="#0C3B4B"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right Mountain */}
    <path
      d="M 19 32 L 27 19 L 35 32 Z"
      fill="#A8B86B"
      stroke="#0C3B4B"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Sun */}
    <circle cx="28" cy="16" r="3" fill="#FDE674" stroke="#0C3B4B" strokeWidth="1.5" />
  </svg>
)

const AudioDoodle = () => (
  <svg width="34" height="34" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    {/* Arc Headband */}
    <path
      d="M 12 24 C 12 13 32 13 32 24"
      stroke="#0C3B4B"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Left Cup */}
    <rect x="8" y="21" width="6" height="9" rx="2" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="1.8" />
    {/* Right Cup */}
    <rect x="30" y="21" width="6" height="9" rx="2" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="1.8" />
    {/* Connectors */}
    <path d="M 11 21 L 11 24" stroke="#0C3B4B" strokeWidth="1.8" />
    <path d="M 33 21 L 33 24" stroke="#0C3B4B" strokeWidth="1.8" />
    {/* Sound waves */}
    <path d="M 5 21 C 3 23 3 27 5 29" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <path d="M 39 21 C 41 23 41 27 39 29" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </svg>
)

const VideoDoodle = () => (
  <svg width="34" height="34" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    {/* Lower Board */}
    <rect x="9" y="19" width="26" height="15" rx="2" fill="#2F80ED" stroke="#0C3B4B" strokeWidth="2" />
    {/* Play Button inside Board */}
    <path d="M 20 23 L 26 26.5 L 20 30 Z" fill="#FFFFFF" stroke="#0C3B4B" strokeWidth="1.2" strokeLinejoin="round" />
    {/* Upper Clapper Bar (open) */}
    <path
      d="M 9 18 L 35 13 L 36 17 L 10 22 Z"
      fill="#FF4D68"
      stroke="#0C3B4B"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Stripes on clapper bar */}
    <path d="M 14 17.2 L 17 20.8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 20 16.2 L 23 19.8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 26 15.2 L 29 18.8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 32 14.2 L 35 17.8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    {/* Hinge */}
    <circle cx="10" cy="19" r="1.2" fill="#0C3B4B" />
  </svg>
)

const PersonSupportDoodle = () => (
  <svg width="34" height="34" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    {/* Helper Face */}
    <circle cx="17" cy="23" r="8" fill="#FDE674" stroke="#0C3B4B" strokeWidth="2.2" />
    <circle cx="14.5" cy="21.5" r="1" fill="#0C3B4B" />
    <circle cx="19.5" cy="21.5" r="1" fill="#0C3B4B" />
    <path d="M 14.5 25 Q 17 27.5 19.5 25" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" fill="none" />

    {/* Supported Person Face */}
    <circle cx="28" cy="25" r="6" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2" />
    <circle cx="26" cy="24.2" r="0.8" fill="#0C3B4B" />
    <circle cx="30" cy="24.2" r="0.8" fill="#0C3B4B" />
    <path d="M 26 26.8 Q 28 28.3 30 26.8" stroke="#0C3B4B" strokeWidth="1" strokeLinecap="round" fill="none" />

    {/* Heart Floating */}
    <path
      d="M 22.5 13.5 C 21.5 11.5 19.5 11.5 19.5 13 C 19.5 15 22.5 17 22.5 17 C 22.5 17 25.5 15 25.5 13 C 25.5 11.5 23.5 11.5 22.5 13.5 Z"
      fill="#3A86FF"
      stroke="#0C3B4B"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
)

const LIST_FORMATOS = [
  { id: 'texto', label: 'Leyendo textos', icon: BookDoodle },
  { id: 'imagenes', label: 'Con imágenes', icon: ImagesDoodle },
  { id: 'audio', label: 'Con audio', icon: AudioDoodle },
  { id: 'video', label: 'Con videos', icon: VideoDoodle },
  { id: 'persona', label: 'Con apoyo de otra persona', icon: PersonSupportDoodle },
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

function getPasswordStrength(password) {
  if (!password) return { label: '', color: 'transparent', score: 0, width: '0%' }
  if (password.length < 8) return { label: 'Débil (mínimo 8 caracteres)', color: '#ef4444', score: 1, width: '33%' }
  let score = 1
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return { label: 'Débil', color: '#ef4444', score: 1, width: '33%' }
  if (score === 3) return { label: 'Media', color: '#f97316', score: 2, width: '66%' }
  return { label: 'Fuerte', color: '#22c55e', score: 3, width: '100%' }
}

// ── SCALE CARD (compact helper) ──────────────────────────────────
function ScaleCard({ title, desc, options, value, onChange }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 12, padding: 14 }}>
      <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#073B4C', margin: '0 0 3px' }}>{title}</h3>
      <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>{desc}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '7px 11px', borderRadius: 8,
              border: `1.5px solid ${value === opt.value ? '#229B58' : '#E5DCD2'}`,
              background: value === opt.value ? 'rgba(34,155,88,0.08)' : '#ffffff',
              fontWeight: value === opt.value ? 700 : 500,
              fontSize: 12, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-body)', color: value === opt.value ? '#073B4C' : 'var(--fg1)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── STEP ORDER ───────────────────────────────────────────────────
const STEP_ORDER = [
  'identity',     // 1: Nombres, apellidos, fecha nacimiento
  'contact',      // 2: CURP, domicilio
  'security',     // 3: Email, contraseña
  'accommodation',// 4: Preferencia de acompañamiento
  'condition',    // 5: Condición PCD
  'origin',       // 6: Neurodivergencia, diagnóstico, temporalidad
  'scales1',      // 7: Escalas A-D
  'scales2',      // 8: Escalas E-H
  'formats',      // 9: Formatos de información
  'interests',    // 10: Intereses
  'viability',    // 11: Viabilidad económica
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
export default function RegistrationWizard({ onBackToRoles }) {
  const { addToast } = useUiStore()
  const { setAuth } = useAuthStore()
  const nav = useNavigate()

  const [wizardStep, setWizardStep] = useState('identity')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [docFile, setDocFile] = useState(null)
  const [showPass, setShowPass] = useState(false)

  // Step 1–3: Datos personales, identificación, cuenta
  const [generalForm, setGeneralForm] = useState({
    nombres: '', apellidoPaterno: '', apellidoMaterno: '',
    birth_date: '', domicilio: '', email: '', password: '',
    curp: '', acompanamiento: 'paso_a_paso',
  })

  // Step 5–6: Condición y diagnóstico
  const [conditionData, setConditionData] = useState({
    conditions: [], neurodivergencias: [], neuroOtro: '',
    tieneDiagnostico: 'si', diagnosticoEspecifico: '',
    redFlagDiagnostico: false, temporalidad: 'nacimiento',
  })

  // Step 7–8: Escalas de vida
  const [scales, setScales] = useState({
    autonomia: 3, independencia: 3, comunicacion: 4, comprension: 3,
    energia: 3, movilidad: 3, social: 3, emocional: 3,
  })

  // Step 9: Formatos
  const [formatos, setFormatos] = useState(['texto', 'imagenes'])

  // Step 10–11: Intereses y viabilidad
  const [selectedInterests, setSelectedInterests] = useState([])
  const [otrosIntereses, setOtrosIntereses] = useState('')
  const [viabilidad, setViabilidad] = useState('sin_restricciones')

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
    setSelectedInterests(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  // ── Navigation handlers ─────────────────────────────────────────
  // Step 1 → 2: Identity → Contact
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
    setWizardStep('contact')
    scrollTop()
  }

  // Step 2 → 3: Contact → Security
  const handleContactSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (generalForm.curp && !CURP_REGEX.test(generalForm.curp)) {
      setError('La CURP no tiene un formato válido.')
      return
    }
    if (generalForm.curp) {
      const r = validateCurpMatch(generalForm.curp, generalForm.nombres, generalForm.apellidoPaterno, generalForm.apellidoMaterno, generalForm.birth_date)
      if (!r.valid) { setError(r.errors[0]); return }
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
    if (!generalForm.password || generalForm.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setWizardStep('accommodation')
    scrollTop()
  }

  // Step 4 → 5: Accommodation → Condition
  const handleAccommodationSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!docFile) {
      setError('Por favor, sube tu identificación oficial PCD o acta de nacimiento.')
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

  // Step 6 → 7: Origin → Scales1
  const handleOriginSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (conditionData.conditions.includes('Neurodivergencia (especificar)') && conditionData.neurodivergencias.length === 0) {
      setError('Por favor, selecciona al menos un tipo de neurodivergencia.')
      return
    }
    setWizardStep('scales1')
    scrollTop()
  }

  // Step 7 → 8: Scales1 → Scales2
  const handleScales1Submit = (e) => { e.preventDefault(); setWizardStep('scales2'); scrollTop() }

  // Step 8 → 9: Scales2 → Formats
  const handleScales2Submit = (e) => { e.preventDefault(); setWizardStep('formats'); scrollTop() }

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
        curp: generalForm.curp,
        domicilio: generalForm.domicilio,
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
        nivelAutonomia: scales.autonomia, nivelIndependencia: scales.independencia,
        nivelComunicacion: scales.comunicacion, nivelComprension: scales.comprension,
        nivelEnergia: scales.energia, nivelMovilidad: scales.movilidad,
        nivelSocial: scales.social, nivelEmocional: scales.emocional,
        tieneDiagnostico: conditionData.tieneDiagnostico === 'si',
        diagnosticoEspecifico: conditionData.diagnosticoEspecifico,
        temporalidadOrigen: conditionData.temporalidad,
        preferenciaFormato: formatos[0] || 'texto',
        areasInteres: selectedInterests,
        viabilidadEconomica: viabilidad,
      }
      try { await api.post('/usuarios/escalas-vida', scalesPayload) } catch (scErr) { console.warn('Scales save notice:', scErr) }

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

  const handleFinishAndEnterDashboard = () => { nav('/dashboard', { replace: true }) }

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
           STEP 2: CONTACTO (CURP, domicilio)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'contact' && (
        <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Identificación y ubicación
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Tu CURP nos ayuda a validar tu identidad. El domicilio es opcional.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>CURP (opcional)</label>
            <input
              type="text" className="auth-input" maxLength={18}
              style={{ textTransform: 'uppercase', borderColor: (() => {
                if (!generalForm.curp || generalForm.curp.length < 18) return undefined;
                if (!CURP_REGEX.test(generalForm.curp)) return '#ef4444';
                const match = validateCurpMatch(generalForm.curp, generalForm.nombres, generalForm.apellidoPaterno, generalForm.apellidoMaterno, generalForm.birth_date);
                if (!match.valid) return '#f97316';
                if (match.nameIsComplete) return '#22c55e';
                return undefined;
              })() }}
              placeholder="ABCD123456HDFXX09"
              value={generalForm.curp}
              onChange={e => setGeneralForm({ ...generalForm, curp: e.target.value.toUpperCase() })}
            />
            <CurpIndicator curp={generalForm.curp} nombres={generalForm.nombres} apPat={generalForm.apellidoPaterno} apMat={generalForm.apellidoMaterno} birthDate={generalForm.birth_date} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Domicilio (Ciudad, Estado o Dirección)</label>
            <input type="text" className="auth-input" placeholder="Ej. Calle Morelos #123, Guadalajara, Jalisco"
              value={generalForm.domicilio}
              onChange={e => setGeneralForm({ ...generalForm, domicilio: e.target.value })} />
          </div>

          <NavButtons onBack={() => { setWizardStep('identity'); scrollTop() }} submitLabel="Continuar a mi cuenta" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 3: SEGURIDAD (Email, contraseña)
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
                <span style={{ fontSize: 11, color: passStrength.color, fontWeight: 600 }}>{passStrength.label}</span>
              </div>
            )}
          </div>

          <NavButtons onBack={() => { setWizardStep('contact'); scrollTop() }} submitLabel="Continuar a preferencias" />
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

          {/* Document upload */}
          <div style={{ marginTop: 4 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Identificación oficial PCD <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div onClick={() => document.getElementById('pcd-doc-input').click()}
              style={{ border: '2px dashed #CA918E', borderRadius: 12, padding: '16px 14px', textAlign: 'center', background: '#FFF9F2', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🪪</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#073B4C' }}>
                {docFile ? docFile.name : 'Subir archivo (INE, credencial de discapacidad o acta)'}
              </span>
              <p style={{ fontSize: 11, color: 'var(--fg3)', margin: '3px 0 0' }}>PDF, JPG, PNG (Máx 5MB)</p>
              <input id="pcd-doc-input" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                onChange={e => setDocFile(e.target.files[0])} />
            </div>
            
            <p style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 8, lineHeight: 1.4, textAlign: 'left' }}>
              ¿No tienes tu credencial de discapacidad? Puedes ver cómo conseguirla en la{' '}
              <a
                href="https://www.gob.mx/difnacional/acciones-y-programas/credencializacion-de-las-personas-con-discapacidad"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
              >
                página credencialización para personas con discapacidad
              </a>.
            </p>
          </div>

          <NavButtons onBack={() => { setWizardStep('security'); scrollTop() }} submitLabel="Continuar a mi condición" />
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

          <NavButtons onBack={() => { setWizardStep('accommodation'); scrollTop() }} submitLabel="Continuar a diagnóstico" />
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
            ) : (
              <div style={{ background: 'rgba(255,77,104,0.08)', border: '1px solid rgba(255,77,104,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#073B4C', lineHeight: 1.5 }}>
                💡 <strong>Nota:</strong> Al no contar con un diagnóstico formal, te abriremos un camino especializado para conectar con especialistas.
              </div>
            )}
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

          <NavButtons onBack={() => { setWizardStep('condition'); scrollTop() }} submitLabel="Continuar a Escalas de Vida" />
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

          <NavButtons onBack={() => { setWizardStep('origin'); scrollTop() }} submitLabel="Continuar a Escalas E-H" />
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

          <NavButtons onBack={() => { setWizardStep('scales1'); scrollTop() }} submitLabel="Continuar a formatos" />
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {LIST_FORMATOS.map(f => {
              const isChecked = formatos.includes(f.id)
              return (
                <button key={f.id} type="button" onClick={() => toggleFormato(f.id)}
                  style={{
                    padding: '16px 14px', borderRadius: 14,
                    border: `2px solid ${isChecked ? '#229B58' : '#E5DCD2'}`,
                    background: isChecked ? 'rgba(34,155,88,0.08)' : '#ffffff',
                    cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s ease',
                  }}>
                  <span style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#f6eddf',
                    border: isChecked ? '3px solid #229B58' : '2px solid #0C3B4B',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    transition: 'all 0.2s ease',
                    marginBottom: 4,
                  }}>
                    <f.icon />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isChecked ? '#073B4C' : 'var(--fg1)' }}>{f.label}</span>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isChecked ? '#229B58' : '#9ca3af'}`, background: isChecked ? '#229B58' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {isChecked && Icons.check({ s: 11 })}
                  </div>
                </button>
              )
            })}
          </div>

          <NavButtons onBack={() => { setWizardStep('scales2'); scrollTop() }} submitLabel="Explorar mis temas favoritos" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 10: INTERESES (scrollable internally)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'interests' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FF4D68', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                ✨ Explora tus pasiones
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#073B4C', margin: '0 0 6px', lineHeight: 1.2 }}>
                ¿Qué caminos te gustaría explorar?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
                Toca todos los temas que te llamen la atención. Personalizaremos tu feed y actividades recomendadas.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {INTEREST_SECTIONS.map((sec) => (
                <div key={sec.title} style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 14, padding: '14px 14px' }}>
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
                            background: isSelected ? sec.color : '#F6EDDF',
                            color: isSelected ? '#ffffff' : '#073B4C',
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
            <button className="auth-btn-secondary" type="button" onClick={() => { setWizardStep('scales2'); scrollTop() }} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="button" onClick={() => { setWizardStep('viability'); scrollTop() }} style={{ flex: 2 }}>
              Continuar a viabilidad {Icons.arrowRight({ s: 18 })}
            </button>
          </div>
        </div>
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

          <div style={{ background: '#FFF9F2', border: '1.5px solid #CA918E', borderRadius: 14, padding: '16px' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#073B4C', marginBottom: 10 }}>¿Qué tipo de opciones son más viables para ti hoy?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {LIST_VIABILIDAD.map((v) => {
                const isSelected = viabilidad === v.id
                return (
                  <button key={v.id} type="button" onClick={() => setViabilidad(v.id)}
                    style={{
                      padding: '10px 12px', borderRadius: 10,
                      border: `2px solid ${isSelected ? '#073B4C' : '#E5DCD2'}`,
                      background: isSelected ? '#073B4C' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--fg1)',
                      fontWeight: isSelected ? 700 : 500, fontSize: 12.5,
                      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${isSelected ? '#ffffff' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isSelected && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff' }} />}
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
          background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 24,
          padding: '36px 28px', textAlign: 'center',
          boxShadow: '0 8px 30px rgba(7,59,76,0.08)', animation: 'fadeInUp 0.4s ease both',
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,155,88,0.12)', color: '#229B58', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>🌱</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#073B4C', margin: '0 0 14px', lineHeight: 1.25 }}>
            Muchas gracias por tu confianza y tu apertura para conocerte.
          </h2>
          <div style={{ color: 'var(--fg2)', fontSize: 14, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto 28px' }}>
            <p style={{ margin: 0 }}>Esta información nos permitirá darte opciones claras y personalizadas.</p>
            <p style={{ margin: 0, fontWeight: 500, color: '#073B4C' }}>
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
          background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 24,
          padding: '30px 26px', boxShadow: '0 8px 30px rgba(7,59,76,0.08)',
          animation: 'fadeInUp 0.4s ease both', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#FF4D68', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Narrativa de Identidad</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#073B4C', margin: '4px 0 0' }}>Bienvenido a Raíces</h2>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #073B4C 0%, #229B58 100%)', color: '#ffffff', padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              {Icons.sparkles({ s: 13 })} Generado por IA
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--fg2)', margin: '0 0 20px', lineHeight: 1.5 }}>
            A través de nuestra inteligencia artificial hemos captado tu esencia para acompañarte en tu desarrollo:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div style={{ background: '#F0F7F6', border: '1.5px solid #229B58', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🌟</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#073B4C', margin: 0 }}>1. ¿Quién eres?</h3>
              </div>
              <p style={{ fontSize: 13, color: '#073B4C', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.quienEres || 'Eres una persona única con grandes fortalezas, talentos y metas por cumplir.'}
              </p>
            </div>
            <div style={{ background: '#FFF9F2', border: '1.5px solid #F4C84A', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🧭</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#073B4C', margin: 0 }}>2. Tu contexto</h3>
              </div>
              <p style={{ fontSize: 13, color: '#073B4C', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.contexto || 'Tu entorno y experiencias han formado tu historia, y adaptamos cada herramienta para ti.'}
              </p>
            </div>
            <div style={{ background: '#FFF5F6', border: '1.5px solid #FF4D68', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🎯</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#073B4C', margin: 0 }}>3. Lo que te gusta</h3>
              </div>
              <p style={{ fontSize: 13, color: '#073B4C', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.loQueTeGusta || 'Tus intereses guían tu camino hacia nuevas conexiones, oportunidades y desarrollo.'}
              </p>
            </div>
          </div>

          <button className="auth-btn-primary" type="button" onClick={handleFinishAndEnterDashboard}
            style={{ width: '100%', padding: '14px 20px', fontSize: 15 }}>
            Ir a mi Dashboard personalizado {Icons.arrowRight({ s: 18 })}
          </button>
        </div>
      )}
    </div>
  )
}
