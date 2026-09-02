import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { Icons } from '@shared/components/shared'
import { setRememberMe, saveUser } from '@shared/lib/storage'
import { getPasswordStrength, checkPasswordCriteria } from '../lib/passwordStrength'
import PasswordRequirements from './PasswordRequirements'
import { STATES, getMunicipalities } from '@shared/lib/mexicoLocations'


// ── SUBTIPOS INSTITUCIONALES ──────────────────────────────────────
const INSTITUTION_SUBTYPES = [
  { id: 'gobierno', label: 'Gobierno', desc: 'Dependencias o programas públicos de atención', icon: '🏛️' },
  { id: 'ong', label: 'ONG', desc: 'Organizaciones sin fines de lucro dedicadas a la inclusión', icon: '💚' },
  { id: 'fundacion', label: 'Fundación', desc: 'Fundaciones que apoyan a personas con discapacidad', icon: '🌟' },
  { id: 'donante', label: 'Donante', desc: 'Personas o entidades que apoyan económicamente', icon: '💝' },
]

// ── CATEGORÍAS DE SERVICIO ────────────────────────────────────────
const SERVICE_CATEGORIES = [
  {
    title: 'DEPORTE / MOVIMIENTO',
    color: '#229B58',
    items: ['Actividad física general', 'Deporte recreativo', 'Deporte adaptado', 'Competencia', 'Rehabilitación funcional', 'Movimiento / coordinación', 'Actividades al aire libre'],
  },
  {
    title: 'BIENESTAR / ATENCIÓN ESPECIALIZADA',
    color: '#073B4C',
    items: ['Terapias', 'Salud mental / emocional', 'Atención médica especializada', 'Odontología especializada', 'Rehabilitación', 'Regulación sensorial', 'Estética / cuidado personal especializado'],
  },
  {
    title: 'EMPLEO',
    color: '#FF4D68',
    items: ['Primer empleo', 'Reintegración laboral', 'Capacitación laboral', 'Empleo adaptado', 'Empleo profesional', 'Trabajo flexible'],
  },
  {
    title: 'ARTE / CULTURA / MÚSICA',
    color: '#9B51E0',
    items: ['Música', 'Danza', 'Pintura / dibujo', 'Teatro', 'Literatura', 'Manualidades', 'Cultura / eventos'],
  },
  {
    title: 'INDEPENDENCIA',
    color: '#2F80ED',
    items: ['Vida cotidiana', 'Movilidad', 'Comunicación', 'Finanzas personales', 'Organización diaria', 'Vida independiente'],
  },
  {
    title: 'VIDA SOCIAL',
    color: '#E14E87',
    items: ['Amistades', 'Eventos', 'Relaciones', 'Actividades grupales', 'Socialización guiada', 'Citas / vínculos', 'Espacios recreativos'],
  },
]

// ── COMUNIDADES A CONECTAR ────────────────────────────────────────
const COMMUNITIES = [
  { id: 'pcd', label: 'Personas con discapacidad', desc: 'Conectar directamente con personas que buscan apoyo', icon: '♿' },
  { id: 'familias', label: 'Familias y cuidadores', desc: 'Apoyar a las familias que acompañan a una persona PCD', icon: '👨‍👩‍👧‍👦' },
  { id: 'profesionales', label: 'Profesionales y especialistas', desc: 'Conectar con terapeutas, doctores y expertos', icon: '👩‍⚕️' },
  { id: 'todos', label: 'Toda la comunidad', desc: 'Estar disponible para todos los que necesiten apoyo', icon: '🌍' },
]


// ── NAV BUTTONS ───────────────────────────────────────────────────
function NavButtons({ onBack, submitLabel, submitDisabled }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 14, flexShrink: 0 }}>
      <button className="auth-btn-secondary" type="button" onClick={onBack} style={{ flex: 1 }}>
        {Icons.arrowLeft({ s: 16 })} Volver
      </button>
      <button className="auth-btn-primary" type="submit" disabled={submitDisabled} style={{ flex: 2 }}>
        {submitLabel} {Icons.arrowRight({ s: 18 })}
      </button>
    </div>
  )
}


// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function InstitutionRegistrationWizard({ onBackToRoles }) {
  const { addToast } = useUiStore()
  const { setAuth } = useAuthStore()
  const nav = useNavigate()

  const [wizardStep, setWizardStep] = useState('subtype')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Step 1: Subtipo institucional
  const [subtipo, setSubtipo] = useState('')

  // Step 2: Info de la organización
  const [orgForm, setOrgForm] = useState({
    nombre: '',
    descripcion: '',
    mision: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    website: '',
  })

  // Step 3: Servicios que ofrece
  const [selectedServices, setSelectedServices] = useState([])

  // Step 4: Comunidad a conectar
  const [selectedCommunity, setSelectedCommunity] = useState('')

  // Step 5: Cuenta y ubicación
  const [accountForm, setAccountForm] = useState({
    email: '',
    password: '',
    state: '',
    city: '',
  })

  const scrollTop = () => {
    const col = document.querySelector('.auth-form-column')
    if (col) col.scrollTop = 0
  }

  const TOTAL_STEPS = 5
  const stepIndex = ['subtype', 'org', 'services', 'community', 'account'].indexOf(wizardStep)
  const progressPct = stepIndex >= 0 ? ((stepIndex + 1) / TOTAL_STEPS) * 100 : 100

  // ── Toggle service ──────────────────────────────────────────────
  const toggleService = (item) => {
    setSelectedServices(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  // ── Navigation handlers ─────────────────────────────────────────
  const handleSubtypeSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!subtipo) {
      setError('Selecciona el tipo de institución.')
      return
    }
    setWizardStep('org')
    scrollTop()
  }

  const handleOrgSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!orgForm.nombre) {
      setError('Ingresa el nombre de la institución.')
      return
    }
    setWizardStep('services')
    scrollTop()
  }

  const handleServicesSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (selectedServices.length === 0) {
      setError('Selecciona al menos un servicio o área de apoyo.')
      return
    }
    setWizardStep('community')
    scrollTop()
  }

  const handleCommunitySubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!selectedCommunity) {
      setError('Selecciona la comunidad con la que quieres conectar.')
      return
    }
    setWizardStep('account')
    scrollTop()
  }

  // ── Final submit ────────────────────────────────────────────────
  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!accountForm.email || !accountForm.password) {
      setError('Ingresa tu correo electrónico y contraseña.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    const { isValid: isPassValid, missing } = checkPasswordCriteria(accountForm.password)
    if (!isPassValid) {
      setError(`Tu contraseña debe cumplir con todos los requisitos. Te hace falta: ${missing.map(m => m.missingText).join(', ')}.`)
      return
    }
    if (!accountForm.state || !accountForm.city) {
      setError('Selecciona tu estado y municipio.')
      return
    }

    setSending(true)
    try {
      // 1. Registrar la cuenta
      const registerPayload = {
        nombre: orgForm.nombre,
        nombreCompleto: orgForm.nombre || orgForm.contactName,
        email: accountForm.email,
        password: accountForm.password,
        rol: 'institucion',
        ciudad: accountForm.city,
        estado: accountForm.state,
        // Datos institucionales
        tipoInstitucion: subtipo,
        descripcion: orgForm.descripcion,
        mision: orgForm.mision,
        nombreContacto: orgForm.contactName,
        telefonoContacto: orgForm.phone,
        sitioWeb: orgForm.website,
        serviciosOfrecidos: selectedServices,
        comunidadConectada: selectedCommunity,
      }

      const regRes = await api.post('/autenticacion/registro', registerPayload)
      const authResult = regRes.data

      if (authResult?.tokenAcceso) {
        const token = authResult.tokenAcceso
        const userObj = {
          id: authResult.usuario?.id,
          email: authResult.usuario?.email || accountForm.email,
          role: 'institution',
          full_name: orgForm.nombre,
          institutionType: subtipo,
        }
        setRememberMe(true)
        setAuth(token, userObj, authResult.tokenRefresco ?? null, true)
        saveUser(userObj, true)
      }

      // 2. Guardar perfil institucional
      try {
        await api.put('/usuarios/perfil', {
          perfilInstitucional: {
            tipoInstitucion: subtipo,
            nombreInstitucion: orgForm.nombre,
            descripcion: orgForm.descripcion,
            mision: orgForm.mision,
            nombreContacto: orgForm.contactName,
            telefonoContacto: orgForm.phone,
            sitioWeb: orgForm.website,
            serviciosOfrecidos: selectedServices,
            comunidadConectada: selectedCommunity,
          },
        })
      } catch (profErr) {
        console.warn('Profile save notice:', profErr)
      }

      addToast('¡Institución registrada exitosamente!', 'success')
      setWizardStep('thanks')
      scrollTop()
    } catch (err) {
      console.error('Institution registration error:', err)
      const msg = err.response?.data?.message || 'No pudimos registrar tu institución. Intenta de nuevo.'
      setError(msg)
    } finally {
      setSending(false)
    }
  }

  const passStrength = getPasswordStrength(accountForm.password)

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* ── Progress bar ── */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#2F80ED', textTransform: 'uppercase' }}>
            Registro Institucional
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)' }}>
            {stepIndex >= 0 ? `Paso ${stepIndex + 1} de ${TOTAL_STEPS}` : 'Completado ✓'}
          </span>
        </div>
        <div style={{ height: 5, background: '#E5DCD2', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #2F80ED 0%, #073B4C 100%)',
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
           STEP 1: TIPO DE INSTITUCIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'subtype' && (
        <form onSubmit={handleSubtypeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              ¿Qué tipo de institución representas?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esto nos ayuda a personalizar tu experiencia en Raíces.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {INSTITUTION_SUBTYPES.map(st => (
              <button key={st.id} type="button" onClick={() => setSubtipo(st.id)}
                style={{
                  padding: '16px 14px', borderRadius: 12,
                  border: `2px solid ${subtipo === st.id ? '#2F80ED' : '#E5DCD2'}`,
                  background: subtipo === st.id ? 'rgba(47,128,237,0.08)' : '#ffffff',
                  textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6,
                  transition: 'all 0.2s ease',
                }}>
                <div style={{ fontSize: 24 }}>{st.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: subtipo === st.id ? '#073B4C' : 'var(--fg1)' }}>{st.label}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.3 }}>{st.desc}</div>
              </button>
            ))}
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
           STEP 2: INFO DE LA ORGANIZACIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'org' && (
        <form onSubmit={handleOrgSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Cuéntanos sobre tu institución
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información ayuda a la comunidad a conocerte mejor.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Nombre de la institución <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className="auth-input" required placeholder="Ej. Fundación Inclusión México"
              value={orgForm.nombre}
              onChange={e => setOrgForm({ ...orgForm, nombre: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>¿Qué hacen? <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea className="auth-input" rows={3} required placeholder="Describe brevemente los servicios o programas que ofrecen..."
              value={orgForm.descripcion}
              onChange={e => setOrgForm({ ...orgForm, descripcion: e.target.value })}
              style={{ resize: 'vertical', minHeight: 70 }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Misión (opcional)</label>
            <textarea className="auth-input" rows={2} placeholder="¿Cuál es su misión o propósito principal?"
              value={orgForm.mision}
              onChange={e => setOrgForm({ ...orgForm, mision: e.target.value })}
              style={{ resize: 'vertical', minHeight: 50 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Persona de contacto</label>
              <input type="text" className="auth-input" placeholder="Nombre del contacto"
                value={orgForm.contactName}
                onChange={e => setOrgForm({ ...orgForm, contactName: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Teléfono</label>
              <input type="tel" className="auth-input" placeholder="Ej. 33 1234 5678"
                value={orgForm.phone}
                onChange={e => setOrgForm({ ...orgForm, phone: e.target.value })} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Sitio web (opcional)</label>
            <input type="url" className="auth-input" placeholder="https://ejemplo.org"
              value={orgForm.website}
              onChange={e => setOrgForm({ ...orgForm, website: e.target.value })} />
          </div>

          <NavButtons onBack={() => { setWizardStep('subtype'); scrollTop() }} submitLabel="Continuar a servicios" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 3: SERVICIOS QUE OFRECE
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'services' && (
        <form onSubmit={handleServicesSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              ¿Cómo ayudas a la comunidad?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Selecciona las áreas en las que tu institución ofrece apoyo. Esto conecta directamente a las personas que buscan lo que tú ofreces.
            </p>
          </div>

          {SERVICE_CATEGORIES.map(cat => (
            <div key={cat.title}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                {cat.title}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cat.items.map(item => {
                  const isSel = selectedServices.includes(item)
                  return (
                    <button key={item} type="button" onClick={() => toggleService(item)}
                      style={{
                        padding: '7px 12px', borderRadius: 8,
                        border: `1.5px solid ${isSel ? cat.color : '#E5DCD2'}`,
                        background: isSel ? `${cat.color}15` : '#ffffff',
                        color: isSel ? '#073B4C' : 'var(--fg1)',
                        fontWeight: isSel ? 700 : 500, fontSize: 12,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <NavButtons onBack={() => { setWizardStep('org'); scrollTop() }} submitLabel="Continuar a comunidad" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 4: COMUNIDAD A CONECTAR
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'community' && (
        <form onSubmit={handleCommunitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              ¿Con quién quieres conectar?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              La comunidad de Raíces se beneficia cuando las instituciones se conectan con quienes más necesitan apoyo.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {COMMUNITIES.map(c => (
              <button key={c.id} type="button" onClick={() => setSelectedCommunity(c.id)}
                style={{
                  padding: '16px 18px', borderRadius: 12,
                  border: `2px solid ${selectedCommunity === c.id ? '#2F80ED' : '#E5DCD2'}`,
                  background: selectedCommunity === c.id ? 'rgba(47,128,237,0.08)' : '#ffffff',
                  textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.2s ease',
                }}>
                <div style={{ fontSize: 28, width: 44, height: 44, borderRadius: '50%', background: selectedCommunity === c.id ? 'rgba(47,128,237,0.12)' : 'var(--bg-cool)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedCommunity === c.id ? '#073B4C' : 'var(--fg1)' }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{c.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedCommunity === c.id ? '#2F80ED' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedCommunity === c.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2F80ED' }} />}
                </div>
              </button>
            ))}
          </div>

          <NavButtons onBack={() => { setWizardStep('services'); scrollTop() }} submitLabel="Continuar a cuenta" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 5: CUENTA Y UBICACIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'account' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Crea tu cuenta institucional
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Estos datos son para acceder a tu panel institucional.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Correo electrónico institucional <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="email" className="auth-input" required placeholder="contacto@institucion.org"
              value={accountForm.email}
              onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Contraseña segura <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} className="auth-input" required
                placeholder="Mínimo 8 caracteres"
                value={accountForm.password}
                onChange={e => setAccountForm({ ...accountForm, password: e.target.value })}
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)' }}>
                {showPass ? Icons.eyeOff({ s: 18 }) : Icons.eye({ s: 18 })}
              </button>
            </div>
            {accountForm.password && (
              <div style={{ marginTop: 5 }}>
                <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: passStrength.width, background: passStrength.color, transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: 11, color: passStrength.color, fontWeight: 600 }}>{passStrength.label}</span>
                <PasswordRequirements password={accountForm.password} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Estado <span style={{ color: '#ef4444' }}>*</span></label>
              <select className="auth-input auth-select" required
                value={accountForm.state}
                onChange={e => setAccountForm({ ...accountForm, state: e.target.value, city: '' })}>
                <option value="" disabled>Selecciona un estado</option>
                {STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Municipio <span style={{ color: '#ef4444' }}>*</span></label>
              <select className="auth-input auth-select" required disabled={!accountForm.state}
                value={accountForm.city}
                onChange={e => setAccountForm({ ...accountForm, city: e.target.value })}>
                <option value="" disabled>{accountForm.state ? 'Selecciona un municipio' : 'Primero elige un estado'}</option>
                {accountForm.state && getMunicipalities(accountForm.state).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <NavButtons onBack={() => { setWizardStep('community'); scrollTop() }} submitLabel={sending ? 'Creando cuenta...' : 'Finalizar registro'} submitDisabled={sending} />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           THANKS STEP
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'thanks' && (
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ fontSize: 48 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#073B4C', margin: 0 }}>
            ¡Bienvenida, {INSTITUTION_SUBTYPES.find(s => s.id === subtipo)?.label || 'institución'}!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg2)', maxWidth: 380, lineHeight: 1.5 }}>
            Tu cuenta institucional está lista. Ya puedes acceder a tu panel para conectar con la comunidad de Raíces.
          </p>
          <button className="auth-btn-primary" onClick={() => nav('/institution-portal')} style={{ marginTop: 16 }}>
            Ir a mi panel {Icons.arrowRight({ s: 18 })}
          </button>
        </div>
      )}
    </div>
  )
}
