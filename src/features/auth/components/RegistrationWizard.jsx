import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { Icons } from '@shared/components/shared'
import { setRememberMe, saveUser } from '@shared/lib/storage'
import { normalizeRole } from '../hooks/useAuth'

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
  'Autismo',
  'TDAH',
  'Dislexia',
  'Dispraxia',
  'Síndrome de Tourette',
  'Altas capacidades/superdotación',
  'Otro',
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
    title: 'DEPORTE / MOVIMIENTO',
    color: '#229B58',
    items: [
      'Actividad física general',
      'Deporte recreativo',
      'Deporte adaptado',
      'Competencia',
      'Rehabilitación funcional',
      'Movimiento / coordinación',
      'Actividades al aire libre',
    ],
  },
  {
    title: 'BIENESTAR / ATENCIÓN ESPECIALIZADA',
    color: '#073B4C',
    items: [
      'Terapias',
      'Salud mental / emocional',
      'Atención médica especializada',
      'Odontología especializada',
      'Rehabilitación',
      'Regulación sensorial',
      'Estética / cuidado personal especializado',
    ],
  },
  {
    title: 'EMPLEO',
    color: '#FF4D68',
    items: [
      'Primer empleo',
      'Reintegración laboral',
      'Capacitación laboral',
      'Empleo adaptado',
      'Empleo profesional',
      'Trabajo flexible',
    ],
  },
  {
    title: 'AUTOEMPLEO',
    color: '#D4944C',
    items: [
      'Emprendimiento',
      'Negocio propio',
      'Venta de productos',
      'Servicios',
      'Marca personal',
      'Economía digital',
    ],
  },
  {
    title: 'ARTE / CULTURA / MÚSICA',
    color: '#9B51E0',
    items: [
      'Música',
      'Danza',
      'Pintura / dibujo',
      'Teatro',
      'Literatura',
      'Manualidades',
      'Cultura / eventos',
    ],
  },
  {
    title: 'INDEPENDENCIA',
    color: '#2F80ED',
    items: [
      'Vida cotidiana',
      'Movilidad',
      'Comunicación',
      'Finanzas personales',
      'Organización diaria',
      'Vida independiente',
    ],
  },
  {
    title: 'VIDA SOCIAL',
    color: '#E14E87',
    items: [
      'Amistades',
      'Eventos',
      'Relaciones',
      'Actividades grupales',
      'Socialización guiada',
      'Citas / vínculos',
      'Espacios recreativos',
    ],
  },
  {
    title: 'EXPLORAR POSIBILIDADES',
    color: '#138A8A',
    items: [
      'Descubrir intereses',
      'Nuevas experiencias',
      'Inspiración',
      'Orientación',
      'Comunidad',
      'Futuro',
    ],
  },
]

const LIST_VIABILIDAD = [
  { id: 'gratuita_becas', label: 'Gratuitas, con becas o apoyos' },
  { id: 'bajo_costo', label: 'Bajo costo' },
  { id: 'moderada', label: 'Inversión moderada' },
  { id: 'sin_restricciones', label: 'Sin restricciones definidas' },
]

// Regex oficial de CURP (Clave Única de Registro de Población)
// Posición 1-4: Iniciales del nombre
// Posición 5-10: Fecha nacimiento (AAMMDD)
// Posición 11: Sexo (H=Mujer, M=Hombre)
// Posición 12-13: Entidad federativa
// Posición 14-16: Primeras consonantes nombre+paterno
// Posición 17: Primera vocal interna apellido paterno
// Posición 18: Diferenciador (número/letra)
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i

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

export default function RegistrationWizard({ onBackToRoles }) {
  const { addToast } = useUiStore()
  const { setAuth } = useAuthStore()
  const nav = useNavigate()

  // Wizard Sub-steps: 'general' -> 'condition' -> 'scales' -> 'formats' -> 'interests' -> 'thanks' -> 'summary'
  const [wizardStep, setWizardStep] = useState('general')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [docFile, setDocFile] = useState(null)
  const [showPass, setShowPass] = useState(false)

  // Step 1: General Info
  const [generalForm, setGeneralForm] = useState({
    full_name: '',
    birth_date: '',
    domicilio: '',
    email: '',
    password: '',
    telefono: '',
    curp: '',
    acompanamiento: 'paso_a_paso',
  })

  // Step 2: Condition & Diagnosis
  const [conditionData, setConditionData] = useState({
    conditions: [],
    neurodivergencias: [],
    neuroOtro: '',
    tieneDiagnostico: 'si',
    diagnosticoEspecifico: '',
    redFlagDiagnostico: false,
    temporalidad: 'nacimiento',
  })

  // Step 3: Life Scales (A to H)
  const [scales, setScales] = useState({
    autonomia: 3,
    independencia: 3,
    comunicacion: 4,
    comprension: 3,
    energia: 3,
    movilidad: 3,
    social: 3,
    emocional: 3,
  })

  // Step 4: Information Format
  const [formatos, setFormatos] = useState(['texto', 'imagenes'])

  // Step 5: Interests & Viability
  const [selectedInterests, setSelectedInterests] = useState([])
  const [otrosIntereses, setOtrosIntereses] = useState('')
  const [viabilidad, setViabilidad] = useState('sin_restricciones')

  // Step 7: AI Summary Narrative
  const [aiNarrative, setAiNarrative] = useState(null)

  // --- Handlers ---
  const handleGeneralSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!generalForm.full_name || !generalForm.email || !generalForm.password) {
      setError('Por favor, completa los campos requeridos.')
      return
    }
    if (generalForm.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    // Validación CURP: si se proporciona, debe cumplir el formato oficial
    if (generalForm.curp && !CURP_REGEX.test(generalForm.curp)) {
      setError('La CURP no tiene un formato válido. Debe contener 18 caracteres alfanuméricos con el formato oficial.')
      return
    }
    setWizardStep('condition')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleCondition = (cond) => {
    setConditionData(prev => {
      let nextConds = [...prev.conditions]
      if (cond === 'Prefiero no responder') {
        nextConds = nextConds.includes(cond) ? [] : [cond]
      } else {
        nextConds = nextConds.filter(c => c !== 'Prefiero no responder')
        if (nextConds.includes(cond)) {
          nextConds = nextConds.filter(c => c !== cond)
        } else {
          nextConds.push(cond)
        }
      }
      return { ...prev, conditions: nextConds }
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

  const handleConditionSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (conditionData.conditions.length === 0) {
      setError('Selecciona al menos una opción que describa tu condición.')
      return
    }
    if (conditionData.conditions.includes('Neurodivergencia (especificar)') && conditionData.neurodivergencias.length === 0) {
      setError('Por favor, selecciona al menos un tipo de neurodivergencia.')
      return
    }
    setWizardStep('scales')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleScalesSubmit = (e) => {
    e.preventDefault()
    setError('')
    setWizardStep('formats')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFormato = (id) => {
    setFormatos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleFormatsSubmit = (e) => {
    e.preventDefault()
    if (formatos.length === 0) {
      setError('Selecciona al menos un formato en el que prefieres recibir información.')
      return
    }
    setError('')
    setWizardStep('interests')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleInterest = (item) => {
    setSelectedInterests(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  // Generate empathetic 3-paragraph summary based on the answers
  const generateNarrative = () => {
    const name = generalForm.full_name.split(' ')[0] || 'Tú'
    
    // Párrafo 1: ¿Quién eres?
    const condList = conditionData.conditions.filter(c => c !== 'Prefiero no responder').join(', ') || 'diversidad de fortalezas'
    const neuroList = conditionData.neurodivergencias.length > 0 ? ` con rasgos de ${conditionData.neurodivergencias.join(', ')}` : ''
    const quienEres = `${name}, eres una persona única, guiada por tu autenticidad y tu deseo de construir tu propio camino. Reconocemos tu valor integral (${condList}${neuroList}), valorando tus talentos individuales y tu perspectiva invaluable dentro de nuestra comunidad.`

    // Párrafo 2: Tu contexto
    const tempoMap = {
      nacimiento: 'desde tu nacimiento',
      infancia: 'durante tu infancia',
      adolescencia: 'durante tu adolescencia',
      vida_adulta: 'en tu vida adulta',
      progresiva: 'de forma evolutiva a lo largo del tiempo',
      en_evaluacion: 'en un proceso activo de exploración y evaluación',
    }
    const temporalidadTxt = tempoMap[conditionData.temporalidad] || 'en tu recorrido de vida'
    const diagnosticoTxt = conditionData.tieneDiagnostico === 'si' && conditionData.diagnosticoEspecifico
      ? `cuentas con un diagnóstico específico (${conditionData.diagnosticoEspecifico}) que orienta tus apoyos.`
      : `estás en un momento de búsqueda donde conectar con especialistas clave abrirá nuevas oportunidades.`
    const contexto = `Tu vivencia se ha forjado ${temporalidadTxt}. En tu día a día, equilibras tu autonomía y tus actividades cotidianas con los apoyos necesarios, y ${diagnosticoTxt} Adaptamos cada interacción para que recibas información de la forma más accesible para ti.`

    // Párrafo 3: Lo que te gusta
    const interesesTxt = selectedInterests.length > 0 
      ? `destacas un gran entusiasmo por áreas como ${selectedInterests.slice(0, 4).join(', ')}${selectedInterests.length > 4 ? ` y otras ${selectedInterests.length - 4} pasiones más` : ''}.`
      : 'tienes una mente curiosa lista para descubrir nuevas experiencias y pasiones.'
    const loQueTeGusta = `Te apasiona aprender, participar y conectar con tu entorno: ${interesesTxt} En Raíces te acompañaremos exactamente como lo prefieres, acercándote opciones útiles, dignas y a tu medida para que alcances cada una de tus metas.`

    return { quienEres, contexto, loQueTeGusta }
  }

  // Final submission of all data: register user + save profile & scales
  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      // 1. Registro de cuenta
      const registerPayload = {
        nombreCompleto: generalForm.full_name,
        email: generalForm.email,
        password: generalForm.password,
        rol: 'pcd',
        telefonoContacto: generalForm.telefono,
        curp: generalForm.curp,
        domicilio: generalForm.domicilio,
        fechaNacimiento: generalForm.birth_date,
      }

      let authResult = null
      try {
        const regRes = await api.post('/autenticacion/registro', registerPayload)
        authResult = regRes.data
      } catch (regErr) {
        // If user already exists or mock mode
        console.warn('Registro warning:', regErr)
      }

      // 2. Si se obtuvo token, guardarlo
      if (authResult?.tokenAcceso) {
        const token = authResult.tokenAcceso
        const userObj = {
          id: authResult.usuario?.id,
          email: authResult.usuario?.email || generalForm.email,
          role: 'pcd',
          full_name: generalForm.full_name,
        }
        setRememberMe(true)
        setAuth(token, userObj, authResult.tokenRefresco ?? null, true)
        saveUser(userObj, true)
      }

      // 3. Guardar escalas de vida y preferencias de intereses
      const scalesPayload = {
        nivelAutonomia: scales.autonomia,
        nivelIndependencia: scales.independencia,
        nivelComunicacion: scales.comunicacion,
        nivelComprension: scales.comprension,
        nivelEnergia: scales.energia,
        nivelMovilidad: scales.movilidad,
        nivelSocial: scales.social,
        nivelEmocional: scales.emocional,
        tieneDiagnostico: conditionData.tieneDiagnostico === 'si',
        diagnosticoEspecifico: conditionData.diagnosticoEspecifico,
        temporalidadOrigen: conditionData.temporalidad,
        preferenciaFormato: formatos[0] || 'texto',
        areasInteres: selectedInterests,
        viabilidadEconomica: viabilidad,
      }

      try {
        await api.post('/usuarios/escalas-vida', scalesPayload)
      } catch (scErr) {
        console.warn('Scales save notice:', scErr)
      }

      // 4. Guardar documento de identidad si se subió
      if (docFile) {
        try {
          const fd = new FormData()
          fd.append('tipo', 'identificacion_oficial')
          fd.append('documento', docFile)
          await api.post('/usuarios/documento-identidad', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } catch (docErr) {
          console.warn('Doc upload notice:', docErr)
        }
      }

      // Guardar intereses localmente para que el Dashboard los filtre y muestre de inmediato
      localStorage.setItem('raices_user_interests', JSON.stringify(selectedInterests))
      localStorage.setItem('raices_user_viability', viabilidad)
      localStorage.setItem('raices_user_formatos', JSON.stringify(formatos))

      // 5. Generar y almacenar la narrativa empática
      const narrative = generateNarrative()
      setAiNarrative(narrative)
      localStorage.setItem('raices_ai_narrative', JSON.stringify(narrative))

      addToast('¡Registro y perfilado completados exitosamente!', 'success')
      setWizardStep('thanks')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Final submit error:', err)
      const narrative = generateNarrative()
      setAiNarrative(narrative)
      setWizardStep('thanks')
    } finally {
      setSending(false)
    }
  }

  const handleFinishAndEnterDashboard = () => {
    nav('/dashboard', { replace: true })
  }

  const passStrength = getPasswordStrength(generalForm.password)

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', maxWidth: 640, margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      {/* Barra de progreso superior */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#229B58', textTransform: 'uppercase' }}>
            Registro de Persona con Discapacidad
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)' }}>
            {wizardStep === 'general' && 'Paso 1 de 5'}
            {wizardStep === 'condition' && 'Paso 2 de 5'}
            {wizardStep === 'scales' && 'Paso 3 de 5'}
            {wizardStep === 'formats' && 'Paso 4 de 5'}
            {wizardStep === 'interests' && 'Paso 5 de 5'}
            {(wizardStep === 'thanks' || wizardStep === 'summary') && 'Completado ✓'}
          </span>
        </div>
        <div style={{ height: 6, background: '#E5DCD2', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #229B58 0%, #073B4C 100%)',
            borderRadius: 3,
            transition: 'width 0.4s ease',
            width: 
              wizardStep === 'general' ? '20%' :
              wizardStep === 'condition' ? '40%' :
              wizardStep === 'scales' ? '60%' :
              wizardStep === 'formats' ? '80%' :
              wizardStep === 'interests' ? '95%' : '100%',
          }} />
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1.5px solid rgba(239, 68, 68, 0.4)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {Icons.shieldAlert({ s: 18 })} {error}
        </div>
      )}

      {/* ── PASO 1: INFORMACIÓN GENERAL ── */}
      {wizardStep === 'general' && (
        <form onSubmit={handleGeneralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ marginBottom: 6 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#073B4C', margin: '0 0 6px' }}>
              Comparte tu información general
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
              Estos datos nos permiten crear tu cuenta protegida y validar tu identidad de forma segura.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Nombre completo PCD <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="auth-input"
              required
              placeholder="Nombre y apellidos"
              value={generalForm.full_name}
              onChange={e => setGeneralForm({ ...generalForm, full_name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                Fecha de nacimiento <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                className="auth-input"
                required
                value={generalForm.birth_date}
                onChange={e => setGeneralForm({ ...generalForm, birth_date: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                CURP
              </label>
              <input
                type="text"
                className="auth-input"
                maxLength={18}
                style={{ textTransform: 'uppercase', borderColor: generalForm.curp && generalForm.curp.length === 18 ? (CURP_REGEX.test(generalForm.curp) ? '#22c55e' : '#ef4444') : undefined }}
                placeholder="ABCD123456HDFXX09"
                value={generalForm.curp}
                onChange={e => setGeneralForm({ ...generalForm, curp: e.target.value.toUpperCase() })}
              />
              {generalForm.curp && generalForm.curp.length > 0 && (
                <p style={{ fontSize: 12, margin: '4px 0 0', color: generalForm.curp.length === 18 ? (CURP_REGEX.test(generalForm.curp) ? '#22c55e' : '#ef4444') : 'var(--fg3)' }}>
                  {generalForm.curp.length < 18
                    ? `${generalForm.curp.length}/18 caracteres`
                    : CURP_REGEX.test(generalForm.curp)
                      ? '✓ CURP válida'
                      : '✗ Formato de CURP no válido'
                  }
                </p>
              )}
              {!generalForm.curp && (
                <p style={{ fontSize: 11, margin: '4px 0 0', color: 'var(--fg3)' }}>
                  18 caracteres alfanuméricos (ej. GARC850101HDFRL09)
                </p>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Domicilio (Ciudad, Estado o Dirección)
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder="Ej. Calle Morelos #123, Guadalajara, Jalisco"
              value={generalForm.domicilio}
              onChange={e => setGeneralForm({ ...generalForm, domicilio: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                Correo electrónico <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                className="auth-input"
                required
                placeholder="correo@ejemplo.com"
                value={generalForm.email}
                onChange={e => setGeneralForm({ ...generalForm, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
                Teléfono, WhatsApp
              </label>
              <input
                type="tel"
                className="auth-input"
                placeholder="Ej. 33 1234 5678"
                value={generalForm.telefono}
                onChange={e => setGeneralForm({ ...generalForm, telefono: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Contraseña segura <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="auth-input"
                required
                placeholder="Mínimo 8 caracteres"
                value={generalForm.password}
                onChange={e => setGeneralForm({ ...generalForm, password: e.target.value })}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)' }}
              >
                {showPass ? Icons.eyeOff({ s: 18 }) : Icons.eye({ s: 18 })}
              </button>
            </div>
            {generalForm.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: passStrength.width, background: passStrength.color, transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: 12, color: passStrength.color, fontWeight: 600 }}>{passStrength.label}</span>
              </div>
            )}
          </div>

          {/* Subida de documento de identidad */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6 }}>
              Identificación oficial PCD (Opcional o para validación prioritaria)
            </label>
            <div
              onClick={() => document.getElementById('pcd-doc-input').click()}
              style={{
                border: '2px dashed #CA918E',
                borderRadius: 12,
                padding: '20px 16px',
                textAlign: 'center',
                background: '#FFF9F2',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>🪪</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#073B4C' }}>
                {docFile ? docFile.name : 'Subir archivo (INE, credencial de discapacidad o acta)'}
              </span>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '4px 0 0' }}>Formatos permitidos: PDF, JPG, PNG (Máx 5MB)</p>
              <input
                id="pcd-doc-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={e => setDocFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* ¿Cómo prefieres que Raíces te acompañe? */}
          <div style={{ marginTop: 10 }}>
            <label style={{ display: 'block', fontSize: 15, fontWeight: 800, color: '#073B4C', marginBottom: 10 }}>
              ¿Cómo prefieres que Raíces te acompañe?
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LIST_ACOMPANAMIENTO.map(opt => {
                const isSelected = generalForm.acompanamiento === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGeneralForm({ ...generalForm, acompanamiento: opt.id })}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 12,
                      border: `2px solid ${isSelected ? '#229B58' : '#E5DCD2'}`,
                      background: isSelected ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#229B58' : '#9ca3af'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
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
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <button className="auth-btn-secondary" type="button" onClick={onBackToRoles} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" style={{ flex: 2 }}>
              Continuar a mi condición {Icons.arrowRight({ s: 18 })}
            </button>
          </div>
        </form>
      )}

      {/* ── PASO 2: CONDICIÓN Y DIAGNÓSTICO ── */}
      {wizardStep === 'condition' && (
        <form onSubmit={handleConditionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#073B4C', margin: '0 0 6px' }}>
              1. Háblanos de tu condición
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
              ¿Qué condición o situación te describe mejor o describe a la persona? (Puedes seleccionar más de una opción.)
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {CONDICIONES_PCD.map(cond => {
              const isChecked = conditionData.conditions.includes(cond)
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => toggleCondition(cond)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `1.5px solid ${isChecked ? '#229B58' : '#E5DCD2'}`,
                    background: isChecked ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    color: isChecked ? '#073B4C' : 'var(--fg1)',
                    fontWeight: isChecked ? 700 : 500,
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: `1.5px solid ${isChecked ? '#229B58' : '#9ca3af'}`,
                    background: isChecked ? '#229B58' : '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    {isChecked && Icons.check({ s: 12 })}
                  </div>
                  <span>{cond}</span>
                </button>
              )
            })}
          </div>

          {/* Si seleccionó Neurodivergencia */}
          {conditionData.conditions.includes('Neurodivergencia (especificar)') && (
            <div style={{
              background: '#FFF9F2',
              border: '1.5px solid #F4C84A',
              borderRadius: 14,
              padding: '20px',
              animation: 'fadeInUp 0.3s ease both',
            }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#073B4C', marginBottom: 12 }}>
                Especificar neurodivergencia:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {NEURODIVERGENCIAS_LIST.map(nd => {
                  const isChecked = conditionData.neurodivergencias.includes(nd)
                  return (
                    <button
                      key={nd}
                      type="button"
                      onClick={() => toggleNeuro(nd)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: `1.5px solid ${isChecked ? '#073B4C' : '#E5DCD2'}`,
                        background: isChecked ? '#073B4C' : '#ffffff',
                        color: isChecked ? '#ffffff' : 'var(--fg1)',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {nd}
                    </button>
                  )
                })}
              </div>

              {conditionData.neurodivergencias.includes('Otro') && (
                <div style={{ marginTop: 12 }}>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="¿Cuál neurodivergencia?"
                    value={conditionData.neuroOtro}
                    onChange={e => setConditionData({ ...conditionData, neuroOtro: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. Diagnóstico específico */}
          <div style={{ borderTop: '1px solid #E5DCD2', paddingTop: 20 }}>
            <label style={{ display: 'block', fontSize: 15, fontWeight: 800, color: '#073B4C', marginBottom: 8 }}>
              2. ¿Tienes algún diagnóstico en específico?
            </label>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setConditionData({ ...conditionData, tieneDiagnostico: 'si', redFlagDiagnostico: false })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: `2px solid ${conditionData.tieneDiagnostico === 'si' ? '#229B58' : '#E5DCD2'}`,
                  background: conditionData.tieneDiagnostico === 'si' ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sí (especificar)
              </button>
              <button
                type="button"
                onClick={() => setConditionData({ ...conditionData, tieneDiagnostico: 'no', diagnosticoEspecifico: '', redFlagDiagnostico: true })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: `2px solid ${conditionData.tieneDiagnostico === 'no' ? '#FF4D68' : '#E5DCD2'}`,
                  background: conditionData.tieneDiagnostico === 'no' ? 'rgba(255, 77, 104, 0.08)' : '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                No
              </button>
            </div>

            {conditionData.tieneDiagnostico === 'si' ? (
              <input
                type="text"
                className="auth-input"
                placeholder="Escribe tu diagnóstico formal o clínico"
                value={conditionData.diagnosticoEspecifico}
                onChange={e => setConditionData({ ...conditionData, diagnosticoEspecifico: e.target.value })}
              />
            ) : (
              <div style={{
                background: 'rgba(255, 77, 104, 0.08)',
                border: '1px solid rgba(255, 77, 104, 0.25)',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 13,
                color: '#073B4C',
                lineHeight: 1.5,
              }}>
                💡 <strong>Nota de acompañamiento:</strong> Al no contar con un diagnóstico formal, te abriremos un camino especializado dentro de la plataforma para conectar con especialistas que te brinden una evaluación oportuna.
              </div>
            )}
          </div>

          {/* 3. Temporalidad / Origen */}
          <div style={{ borderTop: '1px solid #E5DCD2', paddingTop: 20 }}>
            <label style={{ display: 'block', fontSize: 15, fontWeight: 800, color: '#073B4C', marginBottom: 8 }}>
              3. Temporalidad / origen: ¿En qué momento de tu vida comenzó esta condición? (una opción)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LIST_TEMPORALIDAD.map(t => {
                const isSelected = conditionData.temporalidad === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setConditionData({ ...conditionData, temporalidad: t.id })}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? '#073B4C' : '#E5DCD2'}`,
                      background: isSelected ? '#073B4C' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--fg1)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 13.5,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#ffffff' : '#9ca3af'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff' }} />}
                    </div>
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button className="auth-btn-secondary" type="button" onClick={() => setWizardStep('general')} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" style={{ flex: 2 }}>
              Continuar a Escalas de Vida {Icons.arrowRight({ s: 18 })}
            </button>
          </div>
        </form>
      )}

      {/* ── PASO 3: ESCALAS DE VIDA A-H ── */}
      {wizardStep === 'scales' && (
        <form onSubmit={handleScalesSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#073B4C', margin: '0 0 6px' }}>
              4. ¿Cómo vives hoy? (Escalas de Vida)
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
              Selecciona la opción que mejor represente tu situación actual en cada área clave.
            </p>
          </div>

          {/* A. Autonomía */}
          <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              A. Autonomía: En su vida cotidiana
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>¿Qué tanto participas en decisiones sobre tu vida?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ESCALAS_OPCIONES.autonomia.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScales({ ...scales, autonomia: opt.value })}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${scales.autonomia === opt.value ? '#229B58' : '#E5DCD2'}`,
                    background: scales.autonomia === opt.value ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    fontWeight: scales.autonomia === opt.value ? 700 : 500,
                    fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* B. Independencia */}
          <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              B. Independencia
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>¿Qué nivel de apoyo necesitas para realizar actividades cotidianas?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ESCALAS_OPCIONES.independencia.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScales({ ...scales, independencia: opt.value })}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${scales.independencia === opt.value ? '#229B58' : '#E5DCD2'}`,
                    background: scales.independencia === opt.value ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    fontWeight: scales.independencia === opt.value ? 700 : 500,
                    fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* C. Comunicación */}
          <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              C. Comunicación
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>¿Cómo comprendes y表达 expresas necesidades o ideas?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ESCALAS_OPCIONES.comunicacion.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScales({ ...scales, comunicacion: opt.value })}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${scales.comunicacion === opt.value ? '#229B58' : '#E5DCD2'}`,
                    background: scales.comunicacion === opt.value ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    fontWeight: scales.comunicacion === opt.value ? 700 : 500,
                    fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* D. Comprensión */}
          <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              D. Comprensión
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>¿Qué tan fácilmente sigues instrucciones o decisiones?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ESCALAS_OPCIONES.comprension.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScales({ ...scales, comprension: opt.value })}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${scales.comprension === opt.value ? '#229B58' : '#E5DCD2'}`,
                    background: scales.comprension === opt.value ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    fontWeight: scales.comprension === opt.value ? 700 : 500,
                    fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* E. Energía / Resistencia */}
          <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              E. Energía / Resistencia
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>¿Cómo impactan tu energía, concentración o regulación en el día a día?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ESCALAS_OPCIONES.energia.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScales({ ...scales, energia: opt.value })}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${scales.energia === opt.value ? '#229B58' : '#E5DCD2'}`,
                    background: scales.energia === opt.value ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    fontWeight: scales.energia === opt.value ? 700 : 500,
                    fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* F. Movilidad */}
          <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              F. Movilidad
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>¿Cómo interactúas físicamente con tu entorno?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ESCALAS_OPCIONES.movilidad.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScales({ ...scales, movilidad: opt.value })}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${scales.movilidad === opt.value ? '#229B58' : '#E5DCD2'}`,
                    background: scales.movilidad === opt.value ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    fontWeight: scales.movilidad === opt.value ? 700 : 500,
                    fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* G. Social */}
          <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              G. Social
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>¿Cómo participas o te relacionas con otras personas, grupos o comunidades?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ESCALAS_OPCIONES.social.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScales({ ...scales, social: opt.value })}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${scales.social === opt.value ? '#229B58' : '#E5DCD2'}`,
                    background: scales.social === opt.value ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    fontWeight: scales.social === opt.value ? 700 : 500,
                    fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* H. Emocional */}
          <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              H. Emocional
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 12px' }}>¿Cómo impacta tu bienestar emocional en el día a día?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ESCALAS_OPCIONES.emocional.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScales({ ...scales, emocional: opt.value })}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1.5px solid ${scales.emocional === opt.value ? '#229B58' : '#E5DCD2'}`,
                    background: scales.emocional === opt.value ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    fontWeight: scales.emocional === opt.value ? 700 : 500,
                    fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button className="auth-btn-secondary" type="button" onClick={() => setWizardStep('condition')} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" style={{ flex: 2 }}>
              Continuar a Formatos {Icons.arrowRight({ s: 18 })}
            </button>
          </div>
        </form>
      )}

      {/* ── PASO 4: PREFERENCIA DE FORMATO DE INFORMACIÓN ── */}
      {wizardStep === 'formats' && (
        <form onSubmit={handleFormatsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#073B4C', margin: '0 0 6px' }}>
              ¿Cómo prefieres recibir información?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
              Para adaptar mejor la forma en que te acompañamos, cuéntanos cómo te resulta más cómodo aprender y comunicarte. (Opción múltiple)
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {LIST_FORMATOS.map(f => {
              const isChecked = formatos.includes(f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFormato(f.id)}
                  style={{
                    padding: '20px 18px',
                    borderRadius: 14,
                    border: `2px solid ${isChecked ? '#229B58' : '#E5DCD2'}`,
                    background: isChecked ? 'rgba(34, 155, 88, 0.08)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: 32 }}>{f.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: isChecked ? '#073B4C' : 'var(--fg1)' }}>
                    {f.label}
                  </span>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${isChecked ? '#229B58' : '#9ca3af'}`,
                    background: isChecked ? '#229B58' : '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginTop: 4,
                  }}>
                    {isChecked && Icons.check({ s: 12 })}
                  </div>
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <button className="auth-btn-secondary" type="button" onClick={() => setWizardStep('scales')} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" style={{ flex: 2 }}>
              Explorar mis temas favoritos {Icons.arrowRight({ s: 18 })}
            </button>
          </div>
        </form>
      )}

      {/* ── PASO 5: INTERESES ESTILO TIKTOK ("¿Qué caminos te gustaría explorar?") ── */}
      {wizardStep === 'interests' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FF4D68', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              ✨ Explora tus pasiones
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#073B4C', margin: '0 0 8px', lineHeight: 1.2 }}>
              ¿Qué caminos te gustaría explorar?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
              Toca todos los temas que te llamen la atención. Personalizaremos tu feed y actividades recomendadas con lo que elijas.
            </p>
          </div>

          {/* Categorías con chips interactivos estilo TikTok */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {INTEREST_SECTIONS.map((sec) => (
              <div
                key={sec.title}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E5DCD2',
                  borderRadius: 16,
                  padding: '20px 18px',
                  boxShadow: '0 2px 8px rgba(7, 59, 76, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: sec.color }} />
                  <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', color: sec.color, margin: 0, textTransform: 'uppercase' }}>
                    {sec.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sec.items.map((item) => {
                    const isSelected = selectedInterests.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 20,
                          border: isSelected ? `2px solid ${sec.color}` : '1.5px solid #E5DCD2',
                          background: isSelected ? sec.color : '#F6EDDF',
                          color: isSelected ? '#ffffff' : '#073B4C',
                          fontFamily: 'var(--font-body)',
                          fontSize: 13.5,
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                          transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <span>{item}</span>
                        {isSelected && Icons.check({ s: 13 })}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Campo libre de Otros intereses */}
          <div style={{ background: '#ffffff', border: '1px solid #E5DCD2', borderRadius: 16, padding: '18px' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#073B4C', marginBottom: 6 }}>
              Otros temas: Escríbenos qué otro tema te gustaría explorar
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder="Ej. Robótica accesible, astronomía, ajedrez adaptado..."
              value={otrosIntereses}
              onChange={e => setOtrosIntereses(e.target.value)}
            />
          </div>

          {/* Viabilidad Económica */}
          <div style={{ background: '#FFF9F2', border: '1.5px solid #CA918E', borderRadius: 16, padding: '20px' }}>
            <label style={{ display: 'block', fontSize: 15, fontWeight: 800, color: '#073B4C', marginBottom: 12 }}>
              ¿Qué tipo de opciones son más viables para ti hoy?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {LIST_VIABILIDAD.map((v) => {
                const isSelected = viabilidad === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setViabilidad(v.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `2px solid ${isSelected ? '#073B4C' : '#E5DCD2'}`,
                      background: isSelected ? '#073B4C' : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--fg1)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 13.5,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#ffffff' : '#9ca3af'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff' }} />}
                    </div>
                    <span>{v.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <button className="auth-btn-secondary" type="button" onClick={() => setWizardStep('formats')} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" disabled={sending} style={{ flex: 2 }}>
              {sending ? 'Guardando mi perfil...' : 'Guardar y continuar'} {Icons.check({ s: 18 })}
            </button>
          </div>
        </form>
      )}

      {/* ── PASO 6: VALIDACIÓN DE IDENTIDAD Y MENSAJE DE AGRADECIMIENTO ── */}
      {wizardStep === 'thanks' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #E5DCD2',
          borderRadius: 24,
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(7, 59, 76, 0.08)',
          animation: 'fadeInUp 0.4s ease both',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(34, 155, 88, 0.12)', color: '#229B58',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 36,
          }}>
            🌱
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#073B4C', margin: '0 0 16px', lineHeight: 1.25 }}>
            Muchas gracias por tu confianza y tu apertura para conocerte.
          </h2>

          <div style={{ color: 'var(--fg2)', fontSize: 15, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32, maxWidth: 520, margin: '0 auto 32px' }}>
            <p style={{ margin: 0 }}>
              Esta información nos permitirá darte opciones claras y personalizadas.
            </p>
            <p style={{ margin: 0, fontWeight: 500, color: '#073B4C' }}>
              Una vez que validemos tu identidad, te haremos llegar un correo para que puedas encontrar nuevas posibilidades, caminos para tu desarrollo y formar parte de esta gran comunidad.
            </p>
          </div>

          <button
            className="auth-btn-primary"
            type="button"
            onClick={() => {
              setWizardStep('summary')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            style={{ minWidth: 260, padding: '14px 28px', fontSize: 16 }}
          >
            Ver mi Resumen de Bienvenida {Icons.sparkles({ s: 18 })}
          </button>
        </div>
      )}

      {/* ── PASO 7: PANTALLA DE BIENVENIDA CON RESUMEN IA EN 3 PÁRRAFOS ── */}
      {wizardStep === 'summary' && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #E5DCD2',
          borderRadius: 24,
          padding: '36px 30px',
          boxShadow: '0 8px 30px rgba(7, 59, 76, 0.08)',
          animation: 'fadeInUp 0.4s ease both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#FF4D68', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Narrativa de Identidad
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#073B4C', margin: '4px 0 0' }}>
                Bienvenido a Raíces
              </h2>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #073B4C 0%, #229B58 100%)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              {Icons.sparkles({ s: 14 })} Generado por IA
            </div>
          </div>

          <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 24px', lineHeight: 1.5 }}>
            A través de nuestra inteligencia artificial hemos captado tu esencia para acompañarte en tu desarrollo:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {/* 1. ¿Quién eres? */}
            <div style={{
              background: '#F0F7F6',
              border: '1.5px solid #229B58',
              borderRadius: 16,
              padding: '20px',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>🌟</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#073B4C', margin: 0 }}>
                  1. ¿Quién eres?
                </h3>
              </div>
              <p style={{ fontSize: 14, color: '#073B4C', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.quienEres || 'Eres una persona única con grandes fortalezas, talentos y metas por cumplir.'}
              </p>
            </div>

            {/* 2. Tu contexto */}
            <div style={{
              background: '#FFF9F2',
              border: '1.5px solid #F4C84A',
              borderRadius: 16,
              padding: '20px',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>🧭</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#073B4C', margin: 0 }}>
                  2. Tu contexto
                </h3>
              </div>
              <p style={{ fontSize: 14, color: '#073B4C', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.contexto || 'Tu entorno y experiencias han formado tu historia, y adaptamos cada herramienta para ti.'}
              </p>
            </div>

            {/* 3. Lo que te gusta */}
            <div style={{
              background: '#FFF5F6',
              border: '1.5px solid #FF4D68',
              borderRadius: 16,
              padding: '20px',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#073B4C', margin: 0 }}>
                  3. Lo que te gusta
                </h3>
              </div>
              <p style={{ fontSize: 14, color: '#073B4C', margin: 0, lineHeight: 1.6 }}>
                {aiNarrative?.loQueTeGusta || 'Tus intereses guían tu camino hacia nuevas conexiones, oportunidades y desarrollo.'}
              </p>
            </div>
          </div>

          <button
            className="auth-btn-primary"
            type="button"
            onClick={handleFinishAndEnterDashboard}
            style={{ width: '100%', padding: '16px 24px', fontSize: 16 }}
          >
            Ir a mi Dashboard personalizado {Icons.arrowRight({ s: 18 })}
          </button>
        </div>
      )}
    </div>
  )
}
