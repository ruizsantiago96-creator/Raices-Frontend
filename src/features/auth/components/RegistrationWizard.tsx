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
import { WizardNavButtons, ScaleCard, CheckChip, WizardProgress, WizardErrorBanner, PasswordField, LocationInputs } from './WizardUI'
import { calcEdad365, calcEtapaVida365 } from '../lib/age'
import { getMaxBirthDate, MIN_BIRTH_DATE, validateBirthDate } from '../lib/validators'
import { saveOnboardingData } from '../lib/onboardingStorage'
import type { User } from '../../../types/auth'

export interface RegistrationWizardProps {
  onBackToRoles?: () => void
  onGoToLogin?: (email?: string) => void
}

export type PcdWizardStep =
  | 'name'
  | 'birthdate'
  | 'location'
  | 'email'
  | 'password'

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
  pais: string
  codigoPostal: string
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
  'name',
  'birthdate',
  'location',
  'email',
  'password',
]
const TOTAL_STEPS = 5

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function RegistrationWizard({ onBackToRoles, onGoToLogin }: RegistrationWizardProps) {
  const { addToast } = useUiStore()
  const { setAuth } = useAuthStore()
  const nav = useNavigate()
  const updateProfile = useUpdateProfile()
  const updateNeedsProfile = useUpdateNeedsProfile()

  const [wizardStep, setWizardStep] = useState<PcdWizardStep>('name')
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
    curp: '', acompanamiento: '', pais: 'MX', codigoPostal: '', estado: '', ciudad: '',
  })

  // ── Helpers ─────────────────────────────────────────────────────
  const scrollTop = () => {
    const col = document.querySelector('.auth-form-column')
    if (col) col.scrollTop = 0
  }

  const stepIndex = STEP_ORDER.indexOf(wizardStep)

  // ── Step handlers ───────────────────────────────────────────────
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
    setWizardStep('password')
    scrollTop()
  }

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
        rol: 'pcd',
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
        role: 'pcd',
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
      <WizardProgress accent="#229B58" title="Registro de Persona con Discapacidad" stepIndex={stepIndex} totalSteps={TOTAL_STEPS} />

      {/* ── Error ── */}
      <WizardErrorBanner error={error} />

      {/* ═══════════════════════════════════════════════════════════
           STEP 1: NOMBRE
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'name' && (
        <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              ¿Cómo te llamas?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Queremos saber cómo dirigirnos a ti.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Nombre(s) <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className="auth-input" required placeholder="Ej. Juan Carlos"
              value={generalForm.nombres}
              onChange={e => setGeneralForm(prev => ({ ...prev, nombres: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Primer apellido <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" className="auth-input" required placeholder="Ej. García"
                value={generalForm.apellidoPaterno}
                onChange={e => setGeneralForm(prev => ({ ...prev, apellidoPaterno: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '') }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Segundo apellido <span style={{ color: 'var(--fg3)', fontWeight: 500, fontSize: 12 }}>(opcional)</span></label>
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
           STEP 2: FECHA DE NACIMIENTO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'birthdate' && (
        <form onSubmit={handleBirthdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              ¿Cuándo naciste?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información nos ayuda a sugerirte recursos para tu etapa de vida.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Fecha de nacimiento <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="date" className="auth-input" required
              max={getMaxBirthDate()}
              min={MIN_BIRTH_DATE}
              value={generalForm.birth_date}
              onChange={e => setGeneralForm(prev => ({ ...prev, birth_date: e.target.value }))} />
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('name'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 3: UBICACIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'location' && (
        <form onSubmit={handleLocationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              ¿Dónde vives?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información nos ayuda a sugerirte recursos cerca de ti.
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

          <WizardNavButtons onBack={() => { setWizardStep('birthdate'); scrollTop() }} submitLabel="Continuar" />
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
              Lo usaremos para que puedas acceder a tu cuenta.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="email" className="auth-input" required placeholder="correo@ejemplo.com"
              value={generalForm.email}
              onChange={e => setGeneralForm(prev => ({ ...prev, email: e.target.value }))} />
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('location'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 5: CONTRASEÑA
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'password' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 4px' }}>
              Crea una contraseña
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Crea credenciales seguras para proteger tu información.
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
            <button className="auth-btn-secondary" type="button" onClick={() => { setWizardStep('email'); scrollTop() }} style={{ flex: 1 }}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" disabled={sending} style={{ flex: 2 }}>
              {sending ? 'Creando cuenta...' : 'Crear Cuenta'} {Icons.check({ s: 18 })}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
