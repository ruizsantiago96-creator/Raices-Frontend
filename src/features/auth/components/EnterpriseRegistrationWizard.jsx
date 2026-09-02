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


// ── SUBTIPOS EMPRESA / ECOSISTEMA ─────────────────────────────────
const ENTERPRISE_SUBTYPES = [
  { id: 'institucion_apoyo', label: 'Institución de apoyo', desc: 'Organizaciones que brindan servicios de acompañamiento', icon: '🤝' },
  { id: 'escuela_publica', label: 'Escuela pública', desc: 'Instituciones educativas públicas inclusivas', icon: '🏫' },
  { id: 'escuela_privada', label: 'Escuela privada', desc: 'Instituciones educativas privadas con programas inclusivos', icon: '🎓' },
  { id: 'centro_terapeutico', label: 'Centro terapéutico', desc: 'Centros especializados en terapia y rehabilitación', icon: '🏥' },
  { id: 'especialista', label: 'Especialista', desc: 'Profesionales independientes (terapeutas, psicólogos, etc.)', icon: '👩‍⚕️' },
]

// ── SERVICIOS ESPECÍFICOS DEL ECOSISTEMA ──────────────────────────
const ECOSYSTEM_SERVICES = [
  {
    title: 'TERAPIA / REHABILITACIÓN',
    color: '#073B4C',
    items: ['Fisioterapia', 'Terapia ocupacional', 'Terapia de lenguaje', 'Psicología', 'Neuropsicología', 'Musicoterapia', 'Equinoterapia'],
  },
  {
    title: 'EDUCACIÓN INCLUSIVA',
    color: '#229B58',
    items: ['Educación básica', 'Educación media superior', 'Educación superior', 'Programas de inclusión', 'Adaptaciones curriculares', 'Apoyo escolar'],
  },
  {
    title: 'DESARROLLO PROFESIONAL',
    color: '#FF4D68',
    items: ['Capacitación laboral', 'Habilidades blandas', 'Preparación para empleo', 'Emprendimiento', 'Certificaciones', 'Mentoría'],
  },
  {
    title: 'BIENESTAR INTEGRAL',
    color: '#9B51E0',
    items: ['Salud mental', 'Regulación sensorial', 'Nutrición especializada', 'Deporte adaptado', 'Arte y expresión', 'Vida independiente'],
  },
]

// ── COMUNIDADES ────────────────────────────────────────────────────
const COMMUNITIES = [
  { id: 'pcd', label: 'Personas con discapacidad', desc: 'Conectar directamente con quienes buscan apoyo', icon: '♿' },
  { id: 'familias', label: 'Familias y cuidadores', desc: 'Apoyar a las familias que acompañan a una persona PCD', icon: '👨‍👩‍👧‍👦' },
  { id: 'profesionales', label: 'Profesionales y especialistas', desc: 'Conectar con otros expertos del campo', icon: '👩‍⚕️' },
  { id: 'instituciones', label: 'Otras instituciones', desc: 'Colaborar con gobiernos, ONGs y fundaciones', icon: '🏛️' },
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
export default function EnterpriseRegistrationWizard({ onBackToRoles }) {
  const { addToast } = useUiStore()
  const { setAuth } = useAuthStore()
  const nav = useNavigate()

  const [wizardStep, setWizardStep] = useState('subtype')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Step 1: Subtipo
  const [subtipo, setSubtipo] = useState('')

  // Step 2: Info de la organización
  const [orgForm, setOrgForm] = useState({
    nombre: '',
    descripcion: '',
    especialidades: '',
    contactName: '',
    phone: '',
    website: '',
  })

  // Step 3: Servicios
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

  const toggleService = (item) => {
    setSelectedServices(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  // ── Navigation handlers ─────────────────────────────────────────
  const handleSubtypeSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!subtipo) { setError('Selecciona el tipo de organización.'); return }
    setWizardStep('org')
    scrollTop()
  }

  const handleOrgSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!orgForm.nombre) { setError('Ingresa el nombre de la organización.'); return }
    setWizardStep('services')
    scrollTop()
  }

  const handleServicesSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (selectedServices.length === 0) { setError('Selecciona al menos un servicio.'); return }
    setWizardStep('community')
    scrollTop()
  }

  const handleCommunitySubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!selectedCommunity) { setError('Selecciona la comunidad con la que quieres conectar.'); return }
    setWizardStep('account')
    scrollTop()
  }

  // ── Final submit ────────────────────────────────────────────────
  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!accountForm.email || !accountForm.password) {
      setError('Ingresa tu correo electrónico y contraseña.'); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email)) {
      setError('Ingresa un correo electrónico válido.'); return
    }
    const { isValid: isPassValid, missing } = checkPasswordCriteria(accountForm.password)
    if (!isPassValid) {
      setError(`Tu contraseña debe cumplir con todos los requisitos. Te hace falta: ${missing.map(m => m.missingText).join(', ')}.`)
      return
    }
    if (!accountForm.state || !accountForm.city) {
      setError('Selecciona tu estado y municipio.'); return
    }

    setSending(true)
    try {
      const registerPayload = {
        nombre: orgForm.nombre,
        nombreCompleto: orgForm.nombre || orgForm.contactName,
        email: accountForm.email,
        password: accountForm.password,
        rol: 'empresa',
        ciudad: accountForm.city,
        estado: accountForm.state,
        tipoEcosistema: subtipo,
        descripcion: orgForm.descripcion,
        especialidades: orgForm.especialidades,
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
          role: 'empresa',
          full_name: orgForm.nombre,
          enterpriseType: subtipo,
        }
        setRememberMe(true)
        setAuth(token, userObj, authResult.tokenRefresco ?? null, true)
        saveUser(userObj, true)
      }

      // Guardar perfil
      try {
        await api.put('/usuarios/perfil', {
          perfilEcosistema: {
            tipoEcosistema: subtipo,
            nombreOrganizacion: orgForm.nombre,
            descripcion: orgForm.descripcion,
            especialidades: orgForm.especialidades,
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

      addToast('¡Cuenta creada exitosamente!', 'success')
      setWizardStep('thanks')
      scrollTop()
    } catch (err) {
      console.error('Enterprise registration error:', err)
      const msg = err.response?.data?.message || 'No pudimos crear tu cuenta. Intenta de nuevo.'
      setError(msg)
    } finally {
      setSending(false)
    }
  }

  const passStrength = getPasswordStrength(accountForm.password)
  const selectedLabel = ENTERPRISE_SUBTYPES.find(s => s.id === subtipo)?.label || ''

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* ── Progress bar ── */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#D4944C', textTransform: 'uppercase' }}>
            Registro Ecosistema
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)' }}>
            {stepIndex >= 0 ? `Paso ${stepIndex + 1} de ${TOTAL_STEPS}` : 'Completado ✓'}
          </span>
        </div>
        <div style={{ height: 5, background: '#E5DCD2', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #D4944C 0%, #073B4C 100%)',
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
           STEP 1: TIPO DE ORGANIZACIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'subtype' && (
        <form onSubmit={handleSubtypeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              ¿Qué tipo de organización representas?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Conecta tu experiencia con las personas que más la necesitan.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ENTERPRISE_SUBTYPES.map(st => (
              <button key={st.id} type="button" onClick={() => setSubtipo(st.id)}
                style={{
                  padding: '14px 16px', borderRadius: 12,
                  border: `2px solid ${subtipo === st.id ? '#D4944C' : '#E5DCD2'}`,
                  background: subtipo === st.id ? 'rgba(212,148,76,0.08)' : '#ffffff',
                  textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.2s ease',
                }}>
                <div style={{ fontSize: 28, width: 44, height: 44, borderRadius: '50%', background: subtipo === st.id ? 'rgba(212,148,76,0.12)' : 'var(--bg-cool)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {st.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: subtipo === st.id ? '#073B4C' : 'var(--fg1)' }}>{st.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{st.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${subtipo === st.id ? '#D4944C' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {subtipo === st.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4944C' }} />}
                </div>
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
              Cuéntanos sobre tu {selectedLabel.toLowerCase()}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información ayuda a la comunidad a conocerte.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Nombre <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className="auth-input" required placeholder={subtipo === 'especialista' ? 'Ej. Dra. María López' : 'Ej. Centro Terapéutico Raíces'}
              value={orgForm.nombre}
              onChange={e => setOrgForm({ ...orgForm, nombre: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>¿Qué hacen? <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea className="auth-input" rows={3} required placeholder="Describe brevemente tus servicios o especialidades..."
              value={orgForm.descripcion}
              onChange={e => setOrgForm({ ...orgForm, descripcion: e.target.value })}
              style={{ resize: 'vertical', minHeight: 70 }} />
          </div>

          {(subtipo === 'centro_terapeutico' || subtipo === 'especialista') && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Especialidades</label>
              <input type="text" className="auth-input" placeholder="Ej. Terapia de lenguaje, Psicología infantil"
                value={orgForm.especialidades}
                onChange={e => setOrgForm({ ...orgForm, especialidades: e.target.value })} />
            </div>
          )}

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
           STEP 3: SERVICIOS
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'services' && (
        <form onSubmit={handleServicesSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              ¿Qué servicios ofreces?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Selecciona las áreas en las que puedes apoyar. La IA conectará a las personas según lo que necesiten.
            </p>
          </div>

          {ECOSYSTEM_SERVICES.map(cat => (
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
              Conecta tu experiencia con quienes más la necesitan.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {COMMUNITIES.map(c => (
              <button key={c.id} type="button" onClick={() => setSelectedCommunity(c.id)}
                style={{
                  padding: '16px 18px', borderRadius: 12,
                  border: `2px solid ${selectedCommunity === c.id ? '#D4944C' : '#E5DCD2'}`,
                  background: selectedCommunity === c.id ? 'rgba(212,148,76,0.08)' : '#ffffff',
                  textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.2s ease',
                }}>
                <div style={{ fontSize: 28, width: 44, height: 44, borderRadius: '50%', background: selectedCommunity === c.id ? 'rgba(212,148,76,0.12)' : 'var(--bg-cool)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedCommunity === c.id ? '#073B4C' : 'var(--fg1)' }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{c.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedCommunity === c.id ? '#D4944C' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedCommunity === c.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4944C' }} />}
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
              Crea tu cuenta
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Estos datos son para acceder a tu panel.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="email" className="auth-input" required placeholder="contacto@organizacion.com"
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
          <div style={{ fontSize: 48 }}>🚀</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#073B4C', margin: 0 }}>
            ¡Bienvenido/a, {selectedLabel}!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg2)', maxWidth: 380, lineHeight: 1.5 }}>
            Tu cuenta está lista. Ya puedes acceder a tu panel y conectar con la comunidad de Raíces.
          </p>
          <button className="auth-btn-primary" onClick={() => nav('/dashboard')} style={{ marginTop: 16 }}>
            Ir a mi panel {Icons.arrowRight({ s: 18 })}
          </button>
        </div>
      )}
    </div>
  )
}
