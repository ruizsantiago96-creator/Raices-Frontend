import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import axios from 'axios';
import { useLogin, useRegister } from '../hooks/useAuth'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { Icons, BrandMark } from '@shared/components/shared'
import { getRememberMe } from '@shared/lib/storage'
import { VERSION } from '../../../../version'
import { STATES, getMunicipalities } from '@shared/lib/mexicoLocations'
import { AUTH_MESSAGES, AUTH_UI, FIREBASE_PASSWORD_RESET_URL } from '../constants/authMessages'
import RegistrationWizard from '../components/RegistrationWizard'
import TutorRegistrationWizard from '../components/TutorRegistrationWizard'
import InstitutionRegistrationWizard from '../components/InstitutionRegistrationWizard'
import EnterpriseRegistrationWizard from '../components/EnterpriseRegistrationWizard'
import { ROLES } from '../constants/roles'
import { getPasswordStrength, checkPasswordCriteria } from '../lib/passwordStrength'
import PasswordRequirements from '../components/PasswordRequirements'
import { mapErrorMessage } from '../lib/mapErrorMessage'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [mode, setMode] = useState(() => {
    const m = params.get('mode')
    return m === 'login' || m === 'register' ? m : 'login'
  })
  const [regStep, setRegStep] = useState(1)
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'pcd', city: '', state: '' })
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(getRememberMe)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [consentChecked, setConsentChecked] = useState(false)
  const login = useLogin()
  const register = useRegister()
  const { addToast } = useUiStore()
  const { token, user } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const goToLogin = (email = '') => {
    if (email) setForm(f => ({ ...f, email }))
    setMode('login')
    setRegStep(1)
    nav('/auth?mode=login', { replace: true })
  }

  const didLoginRef = useRef(false)
  useEffect(() => { return () => { didLoginRef.current = false } }, [])

  if (token && !login.isPending && !didLoginRef.current) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    if (user?.role === 'institution') return <Navigate to="/institution-portal" replace />
    return <Navigate to="/dashboard" replace />
  }

  const set = k => e => {
    let val = e.target.value
    if (k === 'full_name' && form.role !== 'institution') {
      val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
    }
    setForm(f => ({ ...f, [k]: val }))
    setError('')
  }


  const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', padding: '20px 16px', position: 'relative', overflow: 'hidden' },
    logoWrap: { marginBottom: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' },
    card: { width: '100%', maxWidth: 440, background: 'var(--card)', borderRadius: 20, padding: '36px 32px', boxShadow: '0 4px 32px rgba(0,0,0,.12), 0 1.5px 6px rgba(0,0,0,.08)', position: 'relative' },
    title: { fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 6, color: 'var(--fg)' },
    subtitle: { fontSize: 14, textAlign: 'center', color: 'var(--fg2)', marginBottom: 24 },
    label: { fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 },
    input: { width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 15, background: 'var(--bg)', color: 'var(--fg)', outline: 'none', marginBottom: 16 },
    inputFocus: { borderColor: 'var(--primary)' },
    btnPrimary: { width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8, transition: 'opacity .2s' },
    btnSecondary: { width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--fg)', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8, transition: 'background .2s' },
    link: { color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' },
    error: { color: '#dc2626', fontSize: 13, marginBottom: 12, textAlign: 'center' },
    divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--fg2)', fontSize: 13 },
    dividerLine: { flex: 1, height: 1, background: 'var(--border)' },
  }

  const handleLogin = async () => {
    setError('')
    if (!form.email || !form.password) { setError('Ingresa correo y contraseña.'); return }
    if (!EMAIL_REGEX.test(form.email)) { setError('Correo electrónico no válido.'); return }
    setSending(true)
    try {
      await login.mutateAsync({ email: form.email, password: form.password, rememberMe })
    } catch (err) {
      setError(mapErrorMessage(err))
    } finally { setSending(false) }
  }

  const handleForgotPassword = async () => {
    setError('')
    if (!EMAIL_REGEX.test(form.email)) { setError('Por favor, ingresa un correo electrónico válido.'); addToast('Por favor, ingresa un correo electrónico válido.', 'error'); return; }
    setSending(true);
    try {
      const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;
      if (!firebaseKey) throw new Error('Firebase API key not configured');
      await axios.post(`${FIREBASE_PASSWORD_RESET_URL}?key=${firebaseKey}`, { requestType: "PASSWORD_RESET", email: form.email });
      addToast(AUTH_MESSAGES.FORGOT_SEND_SUCCESS, 'success'); setMode('login');
    } catch { setError(AUTH_MESSAGES.FORGOT_SEND_FAILED); addToast(AUTH_MESSAGES.FORGOT_SEND_FAILED, 'error'); }
    finally { setSending(false); }
  };

  const strength = getPasswordStrength(form.password);
  const { isValid: isPasswordValid } = checkPasswordCriteria(form.password);


  if (loading) {
    return (
      <div style={s.page}>
        <BrandMark size={48} />
      </div>
    )
  }

  // ─── Login ───────────────────────────────────────────────────────
  if (mode === 'login') {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logoWrap}><BrandMark size={40} /></div>
          <div style={s.title}>Iniciar Sesión</div>
          <div style={s.subtitle}>Bienvenido de vuelta</div>

          {error && <div style={s.error}>{error}</div>}

          <label style={s.label}>Correo electrónico</label>
          <input
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={form.email}
            onChange={set('email')}
            style={s.input}
          />

          <label style={s.label}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ ...s.input, paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg2)' }}
              aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPass ? Icons.eyeOff({ s: 18 }) : Icons.eye({ s: 18 })}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              Recordarme
            </label>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--primary)', padding: 0 }} onClick={() => { setMode('forgot'); setError(''); }}>¿Olvidaste tu contraseña?</button>
          </div>

          <button
            onClick={handleLogin}
            disabled={sending}
            style={{ ...s.btnPrimary, opacity: sending ? 0.6 : 1 }}
          >
            {sending ? 'Ingresando…' : 'Iniciar Sesión'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--fg2)' }}>¿No tienes una cuenta?{' '}<button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--primary)', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('register'); setError('') }}>Regístrate</button></p>
        </div>
      </div>
    )
  }

  // ─── Register ────────────────────────────────────────────────────
  if (mode === 'register') {
    return (
      <div style={s.page}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={s.logoWrap}><BrandMark size={40} /></div>

          {regStep === 1 && (
            <div style={s.card}>
              <div style={s.title}>Crea tu cuenta</div>
              <div style={s.subtitle}>Elige el tipo de cuenta que deseas crear</div>

              <label style={s.label}>Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={form.full_name}
                onChange={set('full_name')}
                style={s.input}
              />

              <label style={s.label}>Correo electrónico</label>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={form.email}
                onChange={set('email')}
                style={s.input}
              />

              <label style={s.label}>Tipo de cuenta</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    style={{
                      ...s.btnSecondary,
                      background: form.role === r.value ? 'var(--primary)' : 'transparent',
                      color: form.role === r.value ? '#fff' : 'var(--fg)',
                      borderColor: form.role === r.value ? 'var(--primary)' : 'var(--border)',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 16px',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.label}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{r.description}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><button className="auth-btn-primary" type="button" onClick={() => setRegStep('consent')}>Continuar {Icons.arrowRight({ s: 18 })}</button></div>

            </div>
          )}

                  {regStep === 'consent' && (
                    <div style={s.card}>
                      <div style={s.title}>Consentimiento Informado</div>
                      <div style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, marginBottom: 20 }}>
                        <p style={{ marginBottom: 12 }}>Al continuar, aceptas que:</p>
                        <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
                          <li>Tus datos serán tratados conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</li>
                          <li>La información que proporciones será utilizada únicamente para los fines de esta plataforma.</li>
                          <li>Puedes ejercer tus derechos ARCO en cualquier momento.</li>
                        </ul>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={e => setConsentChecked(e.target.checked)}
                            style={{ accentColor: 'var(--primary)', marginTop: 3 }}
                          />
                          <span style={{ fontSize: 13 }}>He leído y acepto los términos y condiciones de uso de mis datos personales.</span>
                        </label>
                      </div>
                        <button className="auth-btn-primary" type="button" disabled={!consentChecked} onClick={() => { if (form.role === 'pcd') setRegStep('pcd_wizard'); else if (form.role === 'tutor') setRegStep('tutor_wizard'); else if (form.role === 'institution') setRegStep('institution_wizard'); else if (form.role === 'empresa') setRegStep('empresa_wizard'); else setRegStep(2) }} style={{ padding: '15px 20px', fontSize: 15 }}>De acuerdo y continuar {Icons.arrowRight({ s: 18 })}</button>
                        <button className="auth-btn-secondary" type="button" onClick={() => setRegStep(1)}>{Icons.arrowLeft({ s: 16 })} Cambiar tipo de cuenta</button>
                    </div>
                  )}

                  {regStep === 'pcd_wizard' && <RegistrationWizard onBackToRoles={() => setRegStep(1)} onGoToLogin={goToLogin} />}
                  {regStep === 'tutor_wizard' && <TutorRegistrationWizard onBackToRoles={() => setRegStep(1)} onGoToLogin={goToLogin} />}
                  {regStep === 'institution_wizard' && <InstitutionRegistrationWizard onBackToRoles={() => setRegStep(1)} />}
                  {regStep === 'empresa_wizard' && <EnterpriseRegistrationWizard onBackToRoles={() => setRegStep(1)} />}

                  {regStep === 2 && (
                    <div style={s.card}>
                      <div style={s.title}>Crea tu contraseña</div>
                      <div style={s.subtitle}>Elige una contraseña segura</div>

                      <label style={s.label}>Contraseña</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={form.password}
                          onChange={set('password')}
                          style={{ ...s.input, paddingRight: 40 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(v => !v)}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg2)' }}
                          aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPass ? Icons.eyeOff({ s: 18 }) : Icons.eye({ s: 18 })}
                        </button>
                      </div>

                      <PasswordRequirements criteria={checkPasswordCriteria(form.password)} strength={strength} />

                      <label style={s.label}>Ciudad</label>
                      <input
                        type="text"
                        placeholder="Tu ciudad"
                        value={form.city}
                        onChange={set('city')}
                        style={s.input}
                      />

                      <label style={s.label}>Estado</label>
                      <select
                        value={form.state}
                        onChange={set('state')}
                        style={{ ...s.input, cursor: 'pointer' }}
                      >
                        <option value="">Selecciona tu estado</option>
                        {STATES.map(st => (
                          <option key={st.key} value={st.key}>{st.name}</option>
                        ))}
                      </select>

                      <button
                        onClick={async () => {
                          setError('')
                          if (!form.password) { setError('Ingresa una contraseña.'); return }
                          if (!isPasswordValid) { setError('La contraseña no cumple los requisitos.'); return }
                          if (!form.city || !form.state) { setError('Selecciona ciudad y estado.'); return }
                          setSending(true)
                          try {
                            await register.mutateAsync({
                              email: form.email,
                              password: form.password,
                              full_name: form.full_name,
                              role: form.role,
                              city: form.city,
                              state: form.state,
                            })
                          } catch (err) {
                            setError(mapErrorMessage(err))
                          } finally { setSending(false) }
                        }}
                        disabled={sending}
                        style={{ ...s.btnPrimary, opacity: sending ? 0.6 : 1 }}
                      >
                        {sending ? 'Creando cuenta…' : 'Crear Cuenta'}
                      </button>

                      <button className="auth-btn-secondary" type="button" onClick={() => setRegStep('consent')}>{Icons.arrowLeft({ s: 16 })} Volver</button>
                    </div>
                  )}
                  {regStep !== 'pcd_wizard' && regStep !== 'tutor_wizard' && regStep !== 'institution_wizard' && regStep !== 'empresa_wizard' && <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--fg2)' }}>¿Ya tienes cuenta?{' '}<button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--primary)', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('login'); setError('') }}>Inicia sesión</button></p>}
        </div>
      </div>
    )
  }

  // ─── Forgot Password ─────────────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logoWrap}><BrandMark size={40} /></div>
          <div style={s.title}>Recuperar Contraseña</div>
          <div style={s.subtitle}>Ingresa tu correo electrónico y te enviaremos las instrucciones</div>

          {error && <div style={s.error}>{error}</div>}

          <label style={s.label}>Correo electrónico</label>
          <input
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={form.email}
            onChange={set('email')}
            onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
            style={s.input}
          />

          <button
            onClick={handleForgotPassword}
            disabled={sending}
            style={{ ...s.btnPrimary, opacity: sending ? 0.6 : 1 }}
          >
            {sending ? 'Enviando…' : 'Enviar Instrucciones'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--fg2)' }}>¿Recordaste tu contraseña?{' '}<button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--primary)', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('login'); setError(''); }}>Inicia sesión aquí</button></p>
        </div>
      </div>
    )
  }

  return null
}
