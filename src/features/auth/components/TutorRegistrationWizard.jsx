import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile, useUpdateNeedsProfile } from '../hooks/useAuth'
import { Icons } from '@shared/components/shared'
import { setRememberMe, saveUser } from '@shared/lib/storage'
import { STATES, getMunicipalities } from '@shared/lib/mexicoLocations'
import { getPasswordStrength, checkPasswordCriteria } from '../lib/passwordStrength'
import PasswordRequirements from './PasswordRequirements'

// ── LISTAS Y CATÁLOGOS ───────────────────────────────────────────
const DESTINATARIOS = [
  { id: 'hijo', label: 'Para mi hijo/a', desc: 'Acompañamiento enfocado en su desarrollo integral y futuro' },
  { id: 'familiar', label: 'Para un familiar', desc: 'Apoyo para hermano/a, sobrino/a, padre/madre u otro familiar' },
  { id: 'otro', label: 'Para una persona a mi cuidado', desc: 'Rol de tutor/a legal, cuidador/a formal o acompañante' },
]

const LIST_ACOMPANAMIENTO = [
  { id: 'explorar_solo', label: 'Quiero explorar por mi cuenta.', desc: 'Navega libremente por todos los recursos, comunidades y oportunidades' },
  { id: 'recomendaciones_paso', label: 'Me gustaría recibir sugerencias paso a paso.', desc: 'Te guiaremos con rutas y recomendaciones al ritmo de tu familia' },
  { id: 'apoyo_necesite', label: 'Prefiero contar con apoyo cuando lo necesitemos.', desc: 'Acceso directo a acompañamiento, especialistas y orientación' },
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
    { value: 4, label: 'Toma decisiones con autonomía' },
    { value: 3, label: 'Participa con apoyo ocasional' },
    { value: 2, label: 'Requiere guía frecuente' },
    { value: 1, label: 'Requiere representación o apoyo constante' },
  ],
  independencia: [
    { value: 4, label: 'Se desenvuelve con autonomía' },
    { value: 3, label: 'Requiere apoyo en algunas actividades' },
    { value: 2, label: 'Requiere apoyo frecuente' },
    { value: 1, label: 'Requiere acompañamiento constante' },
  ],
  comunicacion: [
    { value: 4, label: 'Verbal fluida' },
    { value: 3, label: 'Verbal con apoyos / limitada' },
    { value: 2, label: 'No verbal (funcional / con apoyos)' },
    { value: 1, label: 'En desarrollo o exploración' },
  ],
  comprension: [
    { value: 4, label: 'Independiente' },
    { value: 3, label: 'Con apoyo ocasional' },
    { value: 2, label: 'Con apoyo frecuente' },
    { value: 1, label: 'Con apoyo total' },
  ],
  energia: [
    { value: 4, label: 'Alta → Participa activamente en la mayoría de actividades' },
    { value: 3, label: 'Media → Participa bien con pausas o equilibrio' },
    { value: 2, label: 'Variable → Depende del día, entorno o condición' },
    { value: 1, label: 'Baja → Requiere actividades de baja demanda o periodos cortos' },
  ],
  movilidad: [
    { value: 4, label: 'Independiente' },
    { value: 3, label: 'Con apoyo ocasional' },
    { value: 2, label: 'Con apoyo frecuente' },
    { value: 1, label: 'Con apoyo total' },
  ],
  social: [
    { value: 4, label: 'Participa con facilidad' },
    { value: 3, label: 'Participa con algunas barreras' },
    { value: 2, label: 'Requiere apoyo frecuente' },
    { value: 1, label: 'Requiere acompañamiento constante' },
  ],
  emocional: [
    { value: 4, label: 'Poco o nada' },
    { value: 3, label: 'Algunas veces' },
    { value: 2, label: 'Frecuentemente' },
    { value: 1, label: 'Requiere apoyo constante' },
  ],
}

const LIST_FORMATOS = [
  { id: 'texto', label: 'Leyendo textos', icon: '📖' },
  { id: 'imagenes', label: 'Con imágenes y pictogramas', icon: '🖼️' },
  { id: 'audio', label: 'Con explicaciones en audio', icon: '🎧' },
  { id: 'video', label: 'Con videos demostrativos', icon: '🎬' },
  { id: 'persona', label: 'Con apoyo y mediación de otra persona', icon: '🤝' },
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
    title: 'EMPLEO / FORMACIÓN', color: '#FF4D68',
    items: ['Primer empleo', 'Reintegración laboral', 'Capacitación laboral', 'Empleo adaptado', 'Empleo profesional', 'Trabajo flexible'],
  },
  {
    title: 'AUTOEMPLEO / PROYECTOS', color: '#D4944C',
    items: ['Emprendimiento', 'Negocio propio', 'Venta de productos', 'Servicios', 'Marca personal', 'Economía digital'],
  },
  {
    title: 'ARTE / CULTURA / MÚSICA', color: '#9B51E0',
    items: ['Música', 'Danza', 'Pintura / dibujo', 'Teatro', 'Literatura', 'Manualidades', 'Cultura / eventos'],
  },
  {
    title: 'INDEPENDENCIA / VIDA DIARIA', color: '#2F80ED',
    items: ['Vida cotidiana', 'Movilidad', 'Comunicación', 'Finanzas personales', 'Organización diaria', 'Vida independiente'],
  },
  {
    title: 'VIDA SOCIAL / COMUNIDAD', color: '#E14E87',
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

const LIST_NECESIDADES = [
  'Transporte accesible',
  'Accesibilidad en espacios públicos',
  'Apoyo en la comunicación',
  'Acompañamiento a actividades o citas',
  'Apoyo con trámites y documentos',
  'Apoyo económico / becas',
  'Atención en salud y terapias',
  'Apoyo emocional o psicológico familiar',
  'Ajustes razonables en escuela o trabajo',
  'Tecnología de apoyo / asistiva',
]

const LIST_AREAS_APOYO = [
  'Movilidad y traslados',
  'Cuidado personal y autocuidado',
  'Comunicación',
  'Actividades de la vida diaria',
  'Ámbito educativo / escolar',
  'Ámbito laboral / formativo',
  'Trámites y gestiones',
  'Vida social y participación',
  'Tareas del hogar',
  'Tecnología y dispositivos',
  'Salud y bienestar integral',
]

const MERIDA_ZONAS_SUGERIDAS = [
  'Centro (97000)',
  'Altabrisa (97130)',
  'Francisco de Montejo (97203)',
  'Ciudad Caucel (97314)',
  'Las Américas (97302)',
  'García Ginerés (97070)',
  'Campestre (97120)',
  'Chuburná (97205)',
  'Montebello (97113)',
  'Itzimná (97100)',
  'Pensiones (97217)',
  'Los Héroes (97306)',
]

const LIST_EDUCACION = [
  'Escuela regular',
  'Escuela con apoyos (inclusiva)',
  'Escuela de educación especial (CAM)',
  'Educación en casa (homeschool)',
  'Educación para adultos (INEA)',
  'Estudios técnicos o de oficio',
  'Universidad',
  'No ha asistido a la escuela',
]

const LIST_TERAPIAS = [
  'Física / rehabilitación',
  'Ocupacional',
  'De lenguaje / comunicación',
  'Psicológica o emocional',
  'Conductual (ABA)',
  'Integración sensorial',
  'Neuropsicología',
  'Ninguna hasta ahora',
]

// ── Mapeos para el alta del dependiente ───────────────────────────
const normText = (s) => (s || '')
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
function wizardConditionsToCodes(conditions = [], neurodivergencias = []) {
  const phrases = [...conditions, ...neurodivergencias]
    .filter(p => p && normText(p) !== 'prefiero no responder')
  const codes = []
  for (const phrase of phrases) {
    const n = normText(phrase)
    if (n.includes('neurodivergencia')) continue
    const hit = DEP_DISABILITY_KEYWORDS.find(({ keywords }) => keywords.some(k => n.includes(k)))
    if (hit && !codes.includes(hit.code)) codes.push(hit.code)
  }
  return codes
}

/** Elige el parentesco del catálogo del backend; si no responde, usa el valor por defecto previo. */
function resolveParentesco(parentescos, destinatario) {
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

// ── CHECK CHIP (multi-select compact helper) ─────────────────────
function CheckChip({ label, selected, onToggle, accent = '#229B58' }) {
  return (
    <button type="button" onClick={onToggle}
      style={{
        padding: '9px 12px', borderRadius: 8,
        border: `1.5px solid ${selected ? accent : '#E5DCD2'}`,
        background: selected ? `color-mix(in oklch, ${accent} 8%, white)` : '#ffffff',
        color: selected ? '#073B4C' : 'var(--fg1)',
        fontWeight: selected ? 700 : 500, fontSize: 12.5,
        cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9,
        fontFamily: 'var(--font-body)', transition: 'all 0.15s ease',
      }}>
      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${selected ? accent : '#9ca3af'}`, background: selected ? accent : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
        {selected && Icons.check({ s: 10 })}
      </div>
      <span>{label}</span>
    </button>
  )
}

// ── NAV BUTTONS ──────────────────────────────────────────────────
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

// ── STEP ORDER (13 pasos homologados con PCD) ─────────────────────
const STEP_ORDER = [
  'identity',        // 1: Nombres, apellidos, fecha nacimiento, estado, municipio
  'security',        // 2: Email, contraseña
  'relationship',    // 3: ¿Para quién es el perfil?
  'accommodation',   // 4: Preferencia de acompañamiento
  'condition',       // 5: Condición PCD de la persona a cargo
  'origin',          // 6: Neurodivergencia, diagnóstico, temporalidad
  'history',         // 7: Historial educativo y terapias
  'support',         // 8: Zonas preferidas, necesidades y áreas de apoyo
  'scales1',         // 9: Escalas A-D
  'scales2',         // 10: Escalas E-H
  'formats',         // 11: Formatos de información
  'interests',       // 12: Intereses
  'viability',       // 13: Viabilidad económica
]
const TOTAL_STEPS = STEP_ORDER.length

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function TutorRegistrationWizard({ onBackToRoles, onGoToLogin }) {
  const { addToast } = useUiStore()
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const updateProfile = useUpdateProfile()
  const updateNeedsProfile = useUpdateNeedsProfile()

  const [wizardStep, setWizardStep] = useState('identity')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [aiNarrative, setAiNarrative] = useState(null)

  // Step 1–2: Datos personales del tutor
  const [generalForm, setGeneralForm] = useState({
    nombres: '', apellidoPaterno: '', apellidoMaterno: '',
    birth_date: '', domicilio: '', email: '', password: '',
    curp: '', acompanamiento: 'recomendaciones_paso',
    estado: '', ciudad: '',
  })

  // Step 3: ¿Para quién es el perfil?
  const [destinatario, setDestinatario] = useState('hijo')
  const [nombreDependiente, setNombreDependiente] = useState('')
  // Fecha de nacimiento de la persona a cargo (para calcular su edad y etapa
  // reales en lugar de usar las del tutor)
  const [fechaNacimientoDependiente, setFechaNacimientoDependiente] = useState('')

  // Step 5–6: Condición y diagnóstico de la persona a cargo
  const [conditionData, setConditionData] = useState({
    conditions: [], neurodivergencias: [], neuroOtro: '',
    tieneDiagnostico: 'si', diagnosticoEspecifico: '',
    redFlagDiagnostico: false, temporalidad: 'nacimiento',
  })

  // Step 9–10: Escalas de vida de la persona a cargo
  const [scales, setScales] = useState({
    autonomia: 3, independencia: 3, comunicacion: 4, comprension: 3,
    energia: 3, movilidad: 3, social: 3, emocional: 3,
  })

  // Step 11: Formatos
  const [formatos, setFormatos] = useState(['texto', 'imagenes'])

  // Step 12–13: Intereses y viabilidad
  const [selectedInterests, setSelectedInterests] = useState([])
  const [otrosIntereses, setOtrosIntereses] = useState('')
  const [viabilidad, setViabilidad] = useState('sin_restricciones')

  // Step 7: Historial educativo y terapias
  const [educacionHistory, setEducacionHistory] = useState([])
  const [terapiaHistory, setTerapiaHistory] = useState([])

  // Step 8: Zonas/colonias preferidas, necesidades y áreas de apoyo
  const [preferredZones, setPreferredZones] = useState([])
  const [zonaInput, setZonaInput] = useState('')
  const [needsList, setNeedsList] = useState([])
  const [supportAreas, setSupportAreas] = useState([])

  // Nombre de referencia para títulos y preguntas
  const personName = nombreDependiente.trim() || (destinatario === 'hijo' ? 'tu hijo/a' : destinatario === 'familiar' ? 'tu familiar' : 'la persona a tu cuidado')

  // ── Cálculo de edad y etapa de la persona a cargo ────────────────
  const calcEdad = (birthDate) => {
    if (!birthDate) return null
    const bd = new Date(birthDate)
    if (isNaN(bd.getTime())) return null
    const hoy = new Date()
    let edad = hoy.getFullYear() - bd.getFullYear()
    const m = hoy.getMonth() - bd.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < bd.getDate())) edad--
    return edad
  }

  // Etapas homologadas con el catálogo de dependientes (ver DependentForm)
  const calcEtapaDependiente = (birthDate) => {
    const edad = calcEdad(birthDate)
    if (edad === null) return null
    if (edad <= 12) return 'infancia'
    if (edad <= 17) return 'adolescencia'
    if (edad <= 29) return 'adultoJoven'
    if (edad <= 59) return 'adulto'
    return 'mayor'
  }

  // Etapas del perfil de necesidades (modelo de 16 campos del backend)
  const calcEtapaPerfil = (birthDate) => {
    const edad = calcEdad(birthDate)
    if (edad === null) return null
    if (edad <= 5) return 'infancia_temprana'
    if (edad <= 12) return 'infancia'
    if (edad <= 17) return 'adolescencia'
    if (edad <= 29) return 'juventud'
    if (edad <= 59) return 'adultez'
    return 'adulto_mayor'
  }

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

  const toggleEducacionHistory = (item) => {
    setEducacionHistory(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleTerapiaHistory = (item) => {
    setTerapiaHistory(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleSuggestedZone = (zone) => {
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

  const removePreferredZone = (zone) => {
    setPreferredZones(prev => prev.filter(z => z !== zone))
  }

  const toggleNeedsList = (item) => {
    setNeedsList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleSupportAreas = (item) => {
    setSupportAreas(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  // ── Step validation & transitions ────────────────────────────────
  const handleIdentitySubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!generalForm.nombres || !generalForm.apellidoPaterno || !generalForm.apellidoMaterno) {
      setError('Por favor, ingresa tu nombre completo y apellidos.')
      return
    }
    if (!generalForm.birth_date) {
      setError('Por favor, selecciona tu fecha de nacimiento.')
      return
    }
    if (!generalForm.estado || !generalForm.ciudad) {
      setError('Por favor, selecciona tu estado y municipio.')
      return
    }
    setWizardStep('security')
    scrollTop()
  }

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
    if (!checkPasswordCriteria(generalForm.password)) {
      setError('La contraseña no cumple con los requisitos de seguridad.')
      return
    }
    setWizardStep('relationship')
    scrollTop()
  }

  const handleRelationshipSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!nombreDependiente.trim()) {
      setError('Por favor, ingresa el nombre de la persona a tu cuidado.')
      return
    }
    if (!fechaNacimientoDependiente) {
      setError('Por favor, ingresa la fecha de nacimiento de la persona a tu cuidado.')
      return
    }
    setWizardStep('accommodation')
    scrollTop()
  }

  const handleAccommodationSubmit = (e) => {
    e.preventDefault()
    setError('')
    setWizardStep('condition')
    scrollTop()
  }

  const handleConditionSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (conditionData.conditions.length === 0) {
      setError('Selecciona al menos una opción que describa la condición o "Prefiero no responder".')
      return
    }
    setWizardStep('origin')
    scrollTop()
  }

  const handleOriginSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (conditionData.conditions.includes('Neurodivergencia (especificar)') && conditionData.neurodivergencias.length === 0) {
      setError('Por favor, selecciona al menos un tipo de neurodivergencia.')
      return
    }
    setWizardStep('history')
    scrollTop()
  }

  const handleHistorySubmit = (e) => {
    e.preventDefault()
    setError('')
    setWizardStep('support')
    scrollTop()
  }

  const handleSupportSubmit = (e) => {
    e.preventDefault()
    setError('')
    setWizardStep('scales1')
    scrollTop()
  }

  const handleScales1Submit = (e) => {
    e.preventDefault()
    setError('')
    if (!scales.autonomia || !scales.independencia || !scales.comunicacion || !scales.comprension) {
      setError('Por favor, responde las 4 escalas de esta sección.')
      return
    }
    setWizardStep('scales2')
    scrollTop()
  }

  const handleScales2Submit = (e) => {
    e.preventDefault()
    setError('')
    if (!scales.energia || !scales.movilidad || !scales.social || !scales.emocional) {
      setError('Por favor, responde las 4 escalas de esta sección.')
      return
    }
    setWizardStep('formats')
    scrollTop()
  }

  const handleFormatsSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (formatos.length === 0) {
      setError('Selecciona al menos un formato en el que se comprenda mejor la información.')
      return
    }
    setWizardStep('interests')
    scrollTop()
  }

  const handleInterestsSubmit = (e) => {
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

    const tempoMap = {
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
  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const nombreCompleto = (generalForm.nombres + ' ' + generalForm.apellidoPaterno + ' ' + generalForm.apellidoMaterno).trim().replace(/\s+/g, ' ')

      // 1. Registrar tutor en backend
      const registerPayload = {
        nombreCompleto,
        email: generalForm.email,
        password: generalForm.password,
        rol: 'padre_tutor',
        ...(generalForm.curp ? { curp: generalForm.curp } : {}),
        domicilio: generalForm.domicilio,
        fechaNacimiento: generalForm.birth_date,
        ciudad: generalForm.ciudad,
        estado: generalForm.estado,
        destinatarioRegistro: destinatario === 'hijo' ? 'para_hijo' : 'para_familiar',
        telefonoContacto: '',
        preferenciasAcompanamiento: generalForm.acompanamiento,
      }

      let authResult = null
      let regError = null
      try {
        const regRes = await api.post('/autenticacion/registro', registerPayload)
        authResult = regRes.data
      } catch (regErr) {
        console.warn('Registro warning:', regErr)
        regError = regErr
      }

      // 2. Obtener sesión para poder guardar el perfil de la persona a cargo
      //    y registrarla como dependiente. El backend puede responder de
      //    varias formas tras crear la cuenta:
      //      - con token (login automático)
      //      - sin token con bandera requiereInicioSesion
      //      - sin token ni bandera (p. ej. { uid, mensaje } como en otros roles)
      //    En todos los casos sin token intentamos iniciar sesión con las
      //    mismas credenciales que el usuario acaba de crear.
      if (!authResult) {
        // El POST de registro falló (HTTP error): no hay cuenta ni nada que guardar.
        const msg = regError?.response?.data?.message
          ?? regError?.response?.data?.mensaje
          ?? 'No se pudo completar el registro. Inténtalo de nuevo.'
        setError(msg)
        addToast(msg, 'error')
        return
      }

      let token = authResult?.tokenAcceso ?? null
      let refreshToken = authResult?.tokenRefresco ?? null
      let usuario = authResult?.usuario ?? null

      if (!token) {
        try {
          const loginRes = await api.post('/autenticacion/inicio-sesion', {
            email: generalForm.email,
            password: generalForm.password,
          })
          const lr = loginRes.data
          token = lr?.tokenAcceso ?? null
          refreshToken = lr?.tokenRefresco ?? null
          usuario = lr?.usuario ?? null
        } catch (loginErr) {
          console.warn('Auto login tras registro (sin token) falló:', loginErr)
        }
      }

      if (!token) {
        // No pudimos obtener sesión: no se puede guardar perfil ni dependiente.
        // Mostramos la narrativa y un aviso claro de qué falta completar.
        localStorage.setItem('raices_user_interests', JSON.stringify(selectedInterests))
        localStorage.setItem('raices_user_viability', viabilidad)
        localStorage.setItem('raices_user_formatos', JSON.stringify(formatos))
        const narrative = generateNarrative()
        setAiNarrative(narrative)
        localStorage.setItem('raices_ai_narrative', JSON.stringify(narrative))
        addToast(
          'Tu cuenta fue creada, pero no pudimos guardar el perfil de ' + (nombreDependiente.trim() || 'la persona a tu cuidado') + '. Inicia sesión y agrégala en "Mis personas".',
          'warning'
        )
        setWizardStep('thanks')
        scrollTop()
        return
      }

      const userObj = {
        id: usuario?.id,
        email: usuario?.email || generalForm.email,
        role: 'tutor',
        full_name: nombreCompleto,
      }
      setRememberMe(true)
      setAuth(token, userObj, refreshToken, true)
      saveUser(userObj, true)

      // Fecha de nacimiento de la persona a cargo: el perfil que guardamos
      // describe a {personName}, así que edad/etapa se calculan con SU fecha.
      const dependienteDOB = fechaNacimientoDependiente || generalForm.birth_date
      const dependienteEdad = calcEdad(dependienteDOB)
      const dependienteEtapaDep = calcEtapaDependiente(dependienteDOB)
      const dependienteEtapaPerfil = calcEtapaPerfil(dependienteDOB)

      // 3. Guardar escalas de vida
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

      // 4. Guardar perfil y necesidades (describen a la persona a cargo)
      const disabilityTypes = conditionData.conditions.filter(c => c !== 'Prefiero no responder')
      const allConditions = [...disabilityTypes, ...conditionData.neurodivergencias]
      try {
        await updateProfile.mutateAsync({
          full_name: nombreCompleto,
          city: generalForm.ciudad,
          state: generalForm.estado,
        })
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
            life_stage: dependienteEtapaPerfil,
            current_concerns: conditionData.diagnosticoEspecifico || null,
            support_level: scales.comunicacion >= 4 ? 'independiente' : scales.comunicacion >= 2 ? 'con_apoyo' : 'necesita_apoyo_intensivo',
            birth_date: dependienteDOB,
            age: dependienteEdad,
          },
        })
      } catch (profErr) { console.warn('Profiling save notice:', profErr) }

      // 5. Registrar persona a cargo (dependiente) con los datos capturados
      //    en el wizard. Si falla, se avisa con claridad (ya no se traga el error).
      let catParentescos = []
      try {
        const catRes = await api.get('/catalogos')
        catParentescos = catRes?.data?.parentescos ?? []
      } catch { /* sin catálogo usamos los valores por defecto */ }

      const depPayload = {
        nombreCompleto: nombreDependiente.trim() || (generalForm.nombres + ' ' + generalForm.apellidoPaterno).trim(),
        parentesco: resolveParentesco(catParentescos, destinatario),
        tiposDiscapacidad: wizardConditionsToCodes(disabilityTypes, conditionData.neurodivergencias),
        ...(dependienteEtapaDep ? { etapaVida: dependienteEtapaDep } : {}),
        notas: conditionData.diagnosticoEspecifico || null,
      }
      try {
        const depRes = await api.post('/usuarios/dependientes', depPayload)
        if (depRes?.data?.id && dependienteDOB) {
          // La edad se muestra en la tarjeta de "Mis personas" desde localStorage
          localStorage.setItem(`raices_dep_birth_date_${depRes.data.id}`, dependienteDOB)
        }
      } catch (depErr) {
        const depMsg = depErr?.response?.data?.message
          ?? depErr?.response?.data?.mensaje
          ?? 'inténtalo de nuevo desde "Mis personas"'
        addToast(
          `Tu cuenta se creó, pero no pudimos agregar a ${nombreDependiente.trim() || 'la persona a tu cuidado'} a tus personas: ${depMsg}`,
          'warning'
        )
      }

      // 6. Guardar localmente (intereses y narrativa de bienvenida)
      localStorage.setItem('raices_user_interests', JSON.stringify(selectedInterests))
      localStorage.setItem('raices_user_viability', viabilidad)
      localStorage.setItem('raices_user_formatos', JSON.stringify(formatos))

      const narrative = generateNarrative()
      setAiNarrative(narrative)
      localStorage.setItem('raices_ai_narrative', JSON.stringify(narrative))

      addToast(
        `¡Registro completado! ${nombreDependiente.trim() || 'La persona a tu cuidado'} ya aparece en "Mis personas".`,
        'success'
      )
      setWizardStep('thanks')
      scrollTop()
    } catch (err) {
      console.error('Final submit error:', err)
      const narrative = generateNarrative()
      setAiNarrative(narrative)
      localStorage.setItem('raices_ai_narrative', JSON.stringify(narrative))
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
           STEP 1: IDENTIDAD (Datos del tutor y ubicación)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'identity' && (
        <form onSubmit={handleIdentitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Cuéntanos sobre ti
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Como tutor/a o cuidador/a, necesitamos tus datos para crear tu cuenta y conectarte con tu comunidad.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Nombre(s) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className="auth-input" required placeholder="Ej. Ana Laura"
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

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Estado <span style={{ color: '#ef4444' }}>*</span></label>
              <select className="auth-input auth-select" required
                value={generalForm.estado}
                onChange={e => setGeneralForm({ ...generalForm, estado: e.target.value, ciudad: '' })}>
                <option value="" disabled>Selecciona un estado</option>
                {STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Municipio <span style={{ color: '#ef4444' }}>*</span></label>
              <select className="auth-input auth-select" required disabled={!generalForm.estado}
                value={generalForm.ciudad}
                onChange={e => setGeneralForm({ ...generalForm, ciudad: e.target.value })}>
                <option value="" disabled>{generalForm.estado ? 'Selecciona un municipio' : 'Primero elige un estado'}</option>
                {generalForm.estado && getMunicipalities(generalForm.estado).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
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
           STEP 2: SEGURIDAD (Email, contraseña)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'security' && (
        <form onSubmit={handleSecuritySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Seguridad de tu cuenta
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Crea credenciales seguras para proteger la información de tu familia.
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
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="auth-pass-toggle"
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPass}
              >
                {showPass ? Icons.eyeOff({ s: 20 }) : Icons.eye({ s: 20 })}
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
           STEP 3: RELACIÓN / ¿Para quién es el perfil?
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'relationship' && (
        <form onSubmit={handleRelationshipSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
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
                    background: isSelected ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${isSelected ? '#229B58' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Nombre de {destinatario === 'hijo' ? 'tu hijo/a' : destinatario === 'familiar' ? 'tu familiar' : 'la persona a tu cuidado'} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" className="auth-input" required
              placeholder={destinatario === 'hijo' ? 'Ej. Mateo' : destinatario === 'familiar' ? 'Ej. Sofía' : 'Ej. Carlos'}
              value={nombreDependiente}
              onChange={e => setNombreDependiente(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''))} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Fecha de nacimiento de {personName} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              className="auth-input"
              required
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
              value={fechaNacimientoDependiente}
              onChange={e => setFechaNacimientoDependiente(e.target.value)}
            />
            {fechaNacimientoDependiente && (() => {
              const edad = calcEdad(fechaNacimientoDependiente)
              const etapaId = calcEtapaDependiente(fechaNacimientoDependiente)
              if (edad === null) return null
              const etapaLabel = {
                infancia: 'Infancia', adolescencia: 'Adolescencia',
                adultoJoven: 'Adulto joven', adulto: 'Adulto', mayor: 'Adulto mayor',
              }[etapaId]
              return (
                <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '5px 0 0' }}>
                  {edad} años{etapaLabel ? ` · ${etapaLabel}` : ''} — lo usaremos para personalizar sus recomendaciones
                </p>
              )
            })()}
          </div>

          <NavButtons onBack={() => { setWizardStep('security'); scrollTop() }} submitLabel="Continuar" />
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
                    background: isSelected ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${isSelected ? '#229B58' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

          <NavButtons onBack={() => { setWizardStep('relationship'); scrollTop() }} submitLabel="Continuar a condición" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 5: CONDICIÓN PCD (de la persona a cargo)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'condition' && (
        <form onSubmit={handleConditionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
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
           STEP 6: ORIGEN Y DIAGNÓSTICO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'origin' && (
        <form onSubmit={handleOriginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ marginBottom: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Origen y diagnóstico de {personName}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información nos ayuda a sugerir especialistas, programas y recursos adaptados.
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
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#073B4C', marginBottom: 8 }}>¿Cuenta {personName} con algún diagnóstico formal o clínico?</label>
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
              <input type="text" className="auth-input" placeholder="Escribe el diagnóstico formal o clínico"
                value={conditionData.diagnosticoEspecifico}
                onChange={e => setConditionData({ ...conditionData, diagnosticoEspecifico: e.target.value })} />
            ) : conditionData.tieneDiagnostico === 'no' ? (
              <div style={{ background: 'rgba(255,77,104,0.08)', border: '1px solid rgba(255,77,104,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#073B4C', lineHeight: 1.5 }}>
                💡 <strong>Nota:</strong> Al no contar con un diagnóstico formal, te abriremos un camino especializado para conectar con profesionales de evaluación.
              </div>
            ) : null}
          </div>

          {/* Temporalidad */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#073B4C', marginBottom: 8 }}>¿En qué momento comenzó o se identificó la condición?</label>
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
           STEP 7: HISTORIAL EDUCATIVO Y TERAPIAS
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'history' && (
        <form onSubmit={handleHistorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Historial educativo y terapias de {personName}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Cuéntanos su recorrido escolar y los apoyos terapéuticos que ha recibido. (Opcional)
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 14, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#073B4C', margin: '0 0 3px' }}>🎓 Educación</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>¿Qué tipo de escuela o modalidad ha cursado? (Puedes elegir varias.)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
                {LIST_EDUCACION.map(op => (
                  <CheckChip key={op} label={op} selected={educacionHistory.includes(op)} onToggle={() => toggleEducacionHistory(op)} />
                ))}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 14, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#073B4C', margin: '0 0 3px' }}>🩺 Terapias recibidas</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>¿Con qué terapias cuenta o ha contado {personName}? (Puedes elegir varias.)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
                {LIST_TERAPIAS.map(op => (
                  <CheckChip key={op} label={op} selected={terapiaHistory.includes(op)} onToggle={() => toggleTerapiaHistory(op)} />
                ))}
              </div>
            </div>
          </div>

          <NavButtons onBack={() => { setWizardStep('origin'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 8: ZONAS, NECESIDADES Y ÁREAS DE APOYO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'support' && (
        <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Zonas y apoyos para {personName}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Cuéntanos en qué colonias prefieres encontrar opciones y en qué áreas les gustaría recibir más apoyo. (Opcional)
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 12, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#073B4C', margin: '0 0 3px' }}>📍 Colonias o zonas de preferencia</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>
                Selecciona las zonas en {generalForm.ciudad || 'Mérida'} donde les sea más fácil acudir a actividades, terapias o servicios.
              </p>

              {(!generalForm.ciudad || generalForm.ciudad.toLowerCase().includes('m') || generalForm.estado === 'Yucatán') && (
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
                            background: isSelected ? 'color-mix(in oklch, #229B58 8%, white)' : '#ffffff',
                            color: isSelected ? '#073B4C' : 'var(--fg1)',
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
                            background: isSelected ? '#229B58' : '#ffffff',
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

              {/* Agregar otra colonia o C.P. */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Escribe otra colonia, fraccionamiento o C.P."
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

              {/* Badges de colonias seleccionadas */}
              {preferredZones.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {preferredZones.map(z => (
                    <span key={z} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'rgba(34, 155, 88, 0.12)', color: '#073B4C',
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

            <div style={{ background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 14, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#073B4C', margin: '0 0 3px' }}>📋 Necesidades principales</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>¿Cuáles son los apoyos más importantes para ustedes hoy?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
                {LIST_NECESIDADES.map(op => (
                  <CheckChip key={op} label={op} selected={needsList.includes(op)} onToggle={() => toggleNeedsList(op)} />
                ))}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 14, padding: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#073B4C', margin: '0 0 3px' }}>🤝 Áreas donde {personName} requiere apoyo</h3>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>¿En qué aspectos de la vida diaria les gustaría contar con más acompañamiento?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
                {LIST_AREAS_APOYO.map(op => (
                  <CheckChip key={op} label={op} selected={supportAreas.includes(op)} onToggle={() => toggleSupportAreas(op)} />
                ))}
              </div>
            </div>
          </div>

          <NavButtons onBack={() => { setWizardStep('history'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 9: ESCALAS A-D (1/2)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'scales1' && (
        <form onSubmit={handleScales1Submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Escalas de Vida de {personName} (1/2)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Selecciona la opción que mejor represente la situación actual de {personName}.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <ScaleCard title="A. Autonomía" desc="¿Qué tanto participa en decisiones?" options={ESCALAS_OPCIONES.autonomia} value={scales.autonomia} onChange={v => setScales({ ...scales, autonomia: v })} />
            <ScaleCard title="B. Independencia" desc="¿Qué nivel de apoyo necesita?" options={ESCALAS_OPCIONES.independencia} value={scales.independencia} onChange={v => setScales({ ...scales, independencia: v })} />
            <ScaleCard title="C. Comunicación" desc="¿Cómo expresa sus necesidades?" options={ESCALAS_OPCIONES.comunicacion} value={scales.comunicacion} onChange={v => setScales({ ...scales, comunicacion: v })} />
            <ScaleCard title="D. Comprensión" desc="¿Sigue instrucciones o decisiones?" options={ESCALAS_OPCIONES.comprension} value={scales.comprension} onChange={v => setScales({ ...scales, comprension: v })} />
          </div>

          <NavButtons onBack={() => { setWizardStep('support'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 10: ESCALAS E-H (2/2)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'scales2' && (
        <form onSubmit={handleScales2Submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Escalas de Vida de {personName} (2/2)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Continúa evaluando el desenvolvimiento de {personName} en estas áreas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <ScaleCard title="E. Energía / Resistencia" desc="¿Cómo impactan su energía y regulación?" options={ESCALAS_OPCIONES.energia} value={scales.energia} onChange={v => setScales({ ...scales, energia: v })} />
            <ScaleCard title="F. Movilidad" desc="¿Cómo interactúa físicamente con su entorno?" options={ESCALAS_OPCIONES.movilidad} value={scales.movilidad} onChange={v => setScales({ ...scales, movilidad: v })} />
            <ScaleCard title="G. Social" desc="¿Cómo participa con otras personas o grupos?" options={ESCALAS_OPCIONES.social} value={scales.social} onChange={v => setScales({ ...scales, social: v })} />
            <ScaleCard title="H. Emocional" desc="¿Qué tanta estabilidad y regulación emocional vive?" options={ESCALAS_OPCIONES.emocional} value={scales.emocional} onChange={v => setScales({ ...scales, emocional: v })} />
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
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
                    background: isChecked ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    color: isChecked ? '#073B4C' : 'var(--fg1)',
                    fontWeight: isChecked ? 700 : 500, fontSize: 13,
                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s ease',
                  }}>
                  <span style={{ fontSize: 18 }}>{fmt.icon}</span>
                  <span style={{ flex: 1 }}>{fmt.label}</span>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${isChecked ? '#229B58' : '#9ca3af'}`, background: isChecked ? '#229B58' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
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
                  background: '#ffffff',
                  border: '1.5px solid #E5DCD2',
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
                            background: isSelected ? sec.color : '#ffffff',
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Viabilidad económica familiar
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esto nos ayuda a recomendarles opciones acordes a su presupuesto familiar.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1.5px solid #E5DCD2', borderRadius: 14, padding: '16px' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#073B4C', marginBottom: 10 }}>¿Qué tipo de opciones son más viables para su familia hoy?</label>
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
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#073B4C', marginBottom: 5 }}>Otros temas o actividades que le gustaría explorar a {personName}</label>
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
