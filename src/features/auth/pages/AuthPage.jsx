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
import { ROLES } from '../constants/roles'
import { getPasswordStrength } from '../lib/passwordStrength'
import { mapErrorMessage } from '../lib/mapErrorMessage'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login')
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

  const doLogin = async () => {
    setError('')
    if (!form.email || !form.password) {
      setError(AUTH_MESSAGES.LOGIN_FIELDS_REQUIRED)
      addToast(AUTH_MESSAGES.LOGIN_FIELDS_REQUIRED, 'error')
      return
    }
    if (!EMAIL_REGEX.test(form.email)) {
      setError('Por favor, ingresa un correo electrónico válido.')
      addToast('Por favor, ingresa un correo electrónico válido.', 'error')
      return
    }
    try {
      didLoginRef.current = true
      const result = await login.mutateAsync({ email: form.email, password: form.password, _rememberMe: rememberMe })
      addToast(AUTH_MESSAGES.LOGIN_SUCCESS, 'success')
      const role = result?.data?.user?.role
      if (role === 'admin') nav('/admin', { replace: true })
      else if (role === 'institution') nav('/institution-portal', { replace: true })
      else nav('/dashboard', { replace: true })
    } catch (err) {
      didLoginRef.current = false
      const msg = err.response?.data?.message ?? AUTH_MESSAGES.LOGIN_INVALID_CREDENTIALS
      const translatedMsg = mapErrorMessage(msg)
      setError(translatedMsg)
      addToast(translatedMsg, 'error')
    }
  }

  const handleLogin = async e => { e.preventDefault(); await doLogin() }

  const handleRegister = async e => {
    e.preventDefault()
    setError('')
    if (!EMAIL_REGEX.test(form.email)) {
      setError('Por favor, ingresa un correo electrónico válido.')
      addToast('Por favor, ingresa un correo electrónico válido.', 'error')
      return
    }
    try {
      await register.mutateAsync({ ...form, _rememberMe: rememberMe })
      addToast(AUTH_MESSAGES.REGISTER_SUCCESS, 'success')
    } catch (err) {
      const msg = err.response?.data?.message ?? AUTH_MESSAGES.REGISTER_FAILED
      const translatedMsg = mapErrorMessage(msg)
      setError(translatedMsg)
      addToast(translatedMsg, 'error')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault(); setError('');
    if (!form.email) { setError(AUTH_MESSAGES.FORGOT_EMAIL_REQUIRED); addToast(AUTH_MESSAGES.FORGOT_EMAIL_REQUIRED, 'error'); return; }
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
  const isPasswordValid = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^A-Za-z0-9]/.test(form.password);

  const s = {
    page: { minHeight: '100vh', background: 'var(--bg-warm)', display: 'block', fontFamily: 'var(--font-body)' },
    inner: { maxWidth: 540, width: '100%', margin: '0 auto', padding: '40px 24px 64px' },
    title: { fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--fg1)', margin: 0, textAlign: 'center' },
    sub: { fontSize: 17, color: 'var(--fg2)', marginTop: 10, textAlign: 'center', lineHeight: 1.5 },
    card: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 28, boxShadow: 'var(--shadow-sm)', marginTop: 28 },
    inputWrap: { marginBottom: 22 },
    roleBtn: (active) => ({ display: 'block', padding: 18, width: '100%', textAlign: 'left', border: active ? '3px solid var(--primary)' : '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: 44, background: active ? 'var(--primary-subtle)' : 'var(--bg-surface)', transition: 'all 0.2s ease', marginBottom: 12, fontFamily: 'var(--font-body)' }),
    avatar: (active) => ({ width: 52, height: 52, borderRadius: '50%', background: 'var(--bg-cool)', border: active ? '3px solid var(--primary)' : '1.5px solid var(--border-color)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }),
    progress: { height: 6, background: 'var(--border-color)', borderRadius: 3, marginBottom: 28, overflow: 'hidden' },
    progressBar: (pct) => ({ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.4s ease' }),
    link: { background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: 3, minHeight: 44, padding: '0 8px' },
    actions: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 },
    errorBox: { display: 'block', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--color-error) 12%, transparent)', border: '1px solid color-mix(in oklch, var(--color-error) 40%, transparent)', color: 'var(--color-error)', fontSize: 14, fontWeight: 600, marginBottom: 20 },
    passWrap: { position: 'relative' },
  }

  return (
    <div className="auth-page-container">
      <style>{`
        .auth-page-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg-warm);
          padding: 40px 20px;
          box-sizing: border-box;
          font-family: var(--font-body);
          transition: background-color 0.3s ease;
        }
        .auth-card {
          display: flex;
          width: 100%;
          max-width: 1060px;
          height: min(88vh, 720px);
          max-height: 720px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(7, 59, 76, 0.08);
          position: relative;
          transition: all 0.3s ease;
        }
        html[data-theme="dark"] .auth-card {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
        }
        .auth-form-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 48px 54px;
          box-sizing: border-box;
          background: var(--bg-surface);
          color: var(--fg1);
          overflow-y: auto;
          scrollbar-color: var(--border-color) var(--bg-surface);
          scrollbar-width: thin;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        .auth-form-column::-webkit-scrollbar { width: 8px; }
        .auth-form-column::-webkit-scrollbar-track { background: var(--bg-surface); }
        .auth-form-column::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        .auth-brand-column {
          flex: 1;
          background: #213052;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: white;
          padding: 52px 48px 20px;
          position: relative;
          overflow: hidden;
          transition: background-color 0.3s ease;
        }
        html[data-theme="dark"] .auth-brand-column {
          background: #131c31;
        }
        .auth-brand-curve {
          fill: #213052;
          transition: fill 0.3s ease;
        }
        html[data-theme="dark"] .auth-brand-curve {
          fill: #131c31;
        }
        .auth-brand-illustration {
          z-index: 2;
          width: 100%;
          max-width: 360px;
          margin: 24px auto 0;
        }
        .auth-input {
          width: 100%;
          padding: 14px 20px;
          border: 1.5px solid var(--border-color);
          border-radius: 8px;
          font-size: 15px;
          box-sizing: border-box;
          font-family: var(--font-body);
          color: var(--fg1);
          background: var(--bg-cool);
          outline: none;
          transition: all 0.2s ease;
        }
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus,
        select:-webkit-autofill,
        select:-webkit-autofill:hover,
        select:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--fg1) !important;
          -webkit-box-shadow: 0 0 0px 1000px var(--bg-cool) inset !important;
          box-shadow: 0 0 0px 1000px var(--bg-cool) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .auth-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px var(--primary-subtle) !important;
        }
        .auth-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 18px center;
          padding-right: 42px;
        }
        .auth-btn-primary {
          width: 100%;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          padding: 15px 24px;
          cursor: pointer;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .auth-btn-primary:hover {
          background: var(--primary-dark);
        }
        .auth-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-btn-secondary {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--fg2);
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          padding: 12px 20px;
          cursor: pointer;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .auth-btn-secondary:hover {
          background: var(--bg-warm);
        }
        .auth-pass-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--fg2);
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          z-index: 2;
          transition: all 0.15s ease;
        }
        .auth-pass-toggle:hover {
          color: var(--fg1);
          background: color-mix(in oklch, var(--primary) 10%, transparent);
        }
        @media (max-height: 780px) {
          .auth-page-container { padding: 16px 20px; align-items: flex-start; }
          .auth-card { height: min(90vh, 640px); max-height: 640px; }
          .auth-form-column { padding: 28px 44px; }
          .auth-brand-column { padding: 36px 36px 20px; }
          .auth-brand-illustration { max-width: 280px; margin: 16px auto 0; }
        }
        @media (max-height: 680px) {
          .auth-page-container { padding: 8px 12px; align-items: flex-start; }
          .auth-card { height: min(92vh, 560px); max-height: 560px; }
          .auth-form-column { padding: 20px 32px; }
          .auth-brand-column { padding: 24px 24px 16px; }
          .auth-brand-illustration { max-width: 200px; margin: 8px auto 0; }
        }
        @media (max-height: 600px) {
          .auth-brand-illustration { display: none; }
        }
        @media (max-width: 900px) {
          .auth-card { flex-direction: column; min-height: auto; border-radius: 20px; }
          .auth-brand-column { display: none !important; }
          .auth-form-column { padding: 36px 24px !important; }
        }
      `}</style>

      <div className="auth-card">
        {/* Columna izquierda: Formulario */}
        <div className="auth-form-column" style={regStep === 'pcd_wizard' ? { justifyContent: 'flex-start' } : undefined}>
          <div style={{ maxWidth: 440, width: '100%', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
              <BrandMark size={24} onClick={() => nav('/')} />
            </div>
            <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 24, fontFamily: 'var(--font-body)' }}>
              {Icons.arrowLeft({ s: 15 })} Volver al inicio
            </button>
            
            <main id="main">
              {mode === 'login' && (
                <>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bienvenido a tu nuevo camino</p>
                  <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {error && <div style={s.errorBox} role="alert" aria-live="assertive">{Icons.shieldAlert({ s: 18 })} {error}</div>}
                    <div>
                      <label htmlFor="login-email" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg1)', marginBottom: 8 }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label>
                      <input id="login-email" name="email" type="email" autoComplete="email" className="auth-input" value={form.email} onChange={set('email')} required placeholder="ejemplo@correo.com" />
                    </div>
                    <div>
                      <label htmlFor="login-pass" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg1)', marginBottom: 8 }}>Contraseña <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={s.passWrap}>
                        <input id="login-pass" name="password" type={showPass ? 'text' : 'password'} autoComplete="current-password" className="auth-input" style={{ paddingRight: 48 }} value={form.password} onChange={set('password')} required placeholder="Ingresa tu contraseña" />
                        <button type="button" onClick={() => setShowPass(v => !v)} className="auth-pass-toggle" aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPass}>
                          {showPass ? Icons.eyeOff({ s: 20 }) : Icons.eye({ s: 20 })}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: 'var(--fg2)', cursor: 'pointer', userSelect: 'none' }}>
                        <input type="checkbox" id="remember-me" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                        Recordarme
                      </label>
                      <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--primary)', padding: 0 }} onClick={() => { setMode('forgot'); setError(''); }}>¿Olvidaste tu contraseña?</button>
                    </div>
                    <button className="auth-btn-primary" type="submit" disabled={login.isPending} style={{ marginTop: 8 }}>{login.isPending ? 'Entrando...' : 'INICIAR SESIÓN'}</button>
                  </form>
                  <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--fg2)' }}>¿No tienes una cuenta?{' '}<button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--primary)', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('register'); setError('') }}>Regístrate</button></p>
                </>
              )}

              {mode === 'register' && (
                <>
                  {regStep === 1 && (
                    <>
                      <div style={{ marginBottom: 12 }}><p style={{ fontSize: 13, color: 'var(--fg3)', fontWeight: 700, marginBottom: 6 }}>Paso 1 de 2</p><div style={s.progress} role="progressbar" aria-valuenow={1} aria-valuemin={1} aria-valuemax={2} aria-label="Paso 1 de 2"><div style={s.progressBar(50)} /></div></div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>¿Cómo te gustaría unirte?</h1>
                      <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 20px', lineHeight: 1.5 }}>Selecciona el tipo de cuenta que mejor se adapte a ti</p>
                      {error && <div style={{ ...s.errorBox, marginBottom: 20 }} role="alert" aria-live="assertive">{Icons.shieldAlert({ s: 18 })} {error}</div>}
                      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 20px' }}>
                        <legend className="sr-only">Selecciona tu tipo de cuenta</legend>
                        {ROLES.map(r => (
                          <button key={r.id} type="button" onClick={() => setForm(f => ({ ...f, role: r.id }))} aria-pressed={form.role === r.id} style={s.roleBtn(form.role === r.id)}>
                            <span style={s.avatar(form.role === r.id)}>{r.icon({ active: false })}</span>
                            <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 14, width: 'calc(100% - 100px)' }}>
                              <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>{r.title}</span>
                              <span style={{ display: 'block', fontSize: 12, color: 'var(--fg2)', marginTop: 2 }}>{r.desc}</span>
                            </span>
                            {form.role === r.id && <span style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--primary)', marginLeft: 'auto' }}>{Icons.check({ s: 20 })}</span>}
                          </button>
                        ))}
                      </fieldset>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><button className="auth-btn-primary" type="button" onClick={() => setRegStep('consent')}>Continuar {Icons.arrowRight({ s: 18 })}</button></div>
                    </>
                  )}

                  {regStep === 'consent' && (
                    <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{Icons.shieldCheck ? Icons.shieldCheck({ s: 28 }) : Icons.shield({ s: 28 })}</div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 14px', textAlign: 'center', lineHeight: 1.3 }}>Verificamos y protegemos tu identidad para un camino seguro y confidencial.</h1>
                      <div style={{ background: 'var(--bg-cool)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, color: 'var(--fg2)', fontSize: 14, lineHeight: 1.5 }}>
                        <p style={{ margin: 0 }}>Tu registro nos permite confirmar tu identidad, proteger tu seguridad y ofrecerte caminos más confiables, personalizados y dignos dentro de la plataforma.</p>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--fg1)' }}>🔒 Tus datos son confidenciales, están protegidos y nunca serán compartidos sin tu autorización.</p>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20, fontSize: 14, color: 'var(--fg1)', userSelect: 'none', padding: '4px 8px' }}>
                        <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }} />
                        <span>Acepto los términos de confidencialidad y protección de datos</span>
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <button className="auth-btn-primary" type="button" disabled={!consentChecked} onClick={() => { if (form.role === 'pcd') setRegStep('pcd_wizard'); else setRegStep(2) }} style={{ padding: '15px 20px', fontSize: 15 }}>De acuerdo y continuar {Icons.arrowRight({ s: 18 })}</button>
                        <button className="auth-btn-secondary" type="button" onClick={() => setRegStep(1)}>{Icons.arrowLeft({ s: 16 })} Cambiar tipo de cuenta</button>
                      </div>
                    </div>
                  )}

                  {regStep === 'pcd_wizard' && <RegistrationWizard onBackToRoles={() => setRegStep(1)} />}

                  {regStep === 2 && (
                    <>
                      <div style={{ marginBottom: 12 }}><p style={{ fontSize: 13, color: 'var(--fg3)', fontWeight: 700, marginBottom: 6 }}>Paso 2 de 2</p><div style={s.progress} role="progressbar" aria-valuenow={2} aria-valuemin={1} aria-valuemax={2} aria-label="Paso 2 de 2"><div style={s.progressBar(100)} /></div></div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Crea tu cuenta {form.role === 'institution' ? 'institucional' : form.role === 'empresa' ? 'empresarial' : 'de tutor'}</h1>
                      <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 20px', lineHeight: 1.5 }}>Ingresa tus datos personales para completar el registro</p>
                      {error && <div style={{ ...s.errorBox, marginBottom: 20 }} role="alert" aria-live="assertive">{Icons.shieldAlert({ s: 18 })} {error}</div>}
                      <form onSubmit={e => { e.preventDefault(); handleRegister(e) }} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                        <div><label htmlFor="reg-name" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>{form.role === 'institution' ? 'Nombre de la institución' : form.role === 'empresa' ? 'Nombre de la empresa o contacto' : 'Nombre completo'} <span style={{ color: '#ef4444' }}>*</span></label><input id="reg-name" name="name" autoComplete="name" className="auth-input" value={form.full_name} onChange={set('full_name')} required placeholder={form.role === 'institution' ? 'Ej. Centro de Inclusión Raíces' : form.role === 'empresa' ? 'Ej. Empresa Inclusiva S.A.' : 'Ej. Ana Pérez'} /></div>
                        <div><label htmlFor="reg-email" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label><input id="reg-email" name="email" type="email" autoComplete="email" className="auth-input" value={form.email} onChange={set('email')} required placeholder="ejemplo@correo.com" /></div>
                        <div>
                          <label htmlFor="reg-pass" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>Contraseña <span style={{ color: '#ef4444' }}>*</span></label>
                          <div style={s.passWrap}><input id="reg-pass" name="new-password" type={showPass ? 'text' : 'password'} autoComplete="new-password" className="auth-input" style={{ paddingRight: 48 }} value={form.password} onChange={set('password')} required minLength={8} placeholder="Crea una contraseña segura" /><button type="button" onClick={() => setShowPass(v => !v)} className="auth-pass-toggle" aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPass}>{showPass ? Icons.eyeOff({ s: 20 }) : Icons.eye({ s: 20 })}</button></div>
                          {form.password && <div style={{ marginTop: 6 }}><div style={{ display: 'flex', gap: 4, height: 4, background: 'var(--border-color)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}><div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s ease' }} /></div><span style={{ fontSize: 11, fontWeight: 600, color: strength.color }}>Seguridad: {strength.label}</span></div>}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ flex: 1 }}><label htmlFor="reg-state" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>Estado <span style={{ color: '#ef4444' }}>*</span></label><select id="reg-state" name="state" autoComplete="address-level1" className="auth-input auth-select" value={form.state} onChange={e => { setForm(f => ({ ...f, state: e.target.value, city: '' })); setError('') }} required><option value="" disabled>Selecciona un estado</option>{STATES.map(st => <option key={st} value={st}>{st}</option>)}</select></div>
                          <div style={{ flex: 1 }}><label htmlFor="reg-city" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>Municipio <span style={{ color: '#ef4444' }}>*</span></label><select id="reg-city" name="city" autoComplete="address-level2" className="auth-input auth-select" value={form.city} onChange={set('city')} required disabled={!form.state}><option value="" disabled>{form.state ? 'Selecciona un municipio' : 'Primero elige un estado'}</option>{form.state && getMunicipalities(form.state).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                        </div>
                      </form>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button className="auth-btn-primary" type="button" onClick={handleRegister} disabled={register.isPending || !form.full_name || !form.email || !isPasswordValid || !form.city || !form.state}>{register.isPending ? 'Creando cuenta...' : 'Finalizar registro'} {Icons.arrowRight({ s: 18 })}</button>
                        <button className="auth-btn-secondary" type="button" onClick={() => setRegStep('consent')}>{Icons.arrowLeft({ s: 16 })} Volver</button>
                      </div>
                    </>
                  )}

                  {regStep !== 'pcd_wizard' && <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--fg2)' }}>¿Ya tienes cuenta?{' '}<button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--primary)', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('login'); setError('') }}>Inicia sesión</button></p>}
                </>
              )}

              {mode === 'forgot' && (
                <>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>¿Olvidaste tu contraseña?</h1>
                  <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 24px', lineHeight: 1.5 }}>Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecerla</p>
                  <form onSubmit={handleForgotPassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {error && <div style={s.errorBox} role="alert" aria-live="assertive">{Icons.shieldAlert({ s: 18 })} {error}</div>}
                    <div><label htmlFor="forgot-email" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg1)', marginBottom: 8 }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label><input id="forgot-email" name="email" type="email" autoComplete="email" className="auth-input" value={form.email} onChange={set('email')} required placeholder="ejemplo@correo.com" /></div>
                    <button className="auth-btn-primary" type="submit" disabled={sending} style={{ marginTop: 8 }}>{sending ? 'Enviando...' : 'Enviar enlace'} {Icons.arrowRight({ s: 18 })}</button>
                  </form>
                  <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--fg2)' }}>¿Recordaste tu contraseña?{' '}<button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--primary)', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('login'); setError(''); }}>Inicia sesión aquí</button></p>
                </>
              )}
            </main>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--fg3)', fontSize: 12, fontWeight: 800, letterSpacing: '0.05em', marginTop: 36 }}>POWERED BY <img src="/images/Techmaleon_Logo.png" alt="Techmaleon" style={{ height: 18, width: 'auto', objectFit: 'contain' }} /></div>
            <div style={{ fontSize: 11, color: 'var(--fg3)', opacity: 0.7, fontWeight: 500, marginTop: 4 }}>v{VERSION}</div>
          </div>
        </div>
        
        {/* Columna derecha: Branding */}
        <div className="auth-brand-column">
          <svg style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 70, height: '100%', transform: 'translateX(-99%)', pointerEvents: 'none', zIndex: 1 }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M100 0 C30 20, 20 70, 100 100 Z" className="auth-brand-curve" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div style={{ zIndex: 2, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100%' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', display: 'block' }}>Raíces<span style={{ color: '#FF4D68' }}>.</span></span>
          </div>
          <div className="auth-brand-illustration">
            <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
              <circle cx="320" cy="60" r="8" fill="#F4C84A" opacity="0.9"/><circle cx="90" cy="90" r="5" fill="#FF4D68" opacity="0.8"/><circle cx="360" cy="110" r="4" fill="#CA918E" opacity="0.7"/>
              <path d="M0 220 Q60 160 120 200 Q200 240 280 180 Q350 130 420 160 L420 280 L0 280 Z" fill="#1a5c3a" opacity="0.4"/>
              <path d="M-20 250 Q80 170 180 210 Q300 255 440 195 L440 280 L-20 280 Z" fill="#229B58"/>
              <path d="M-20 255 Q80 180 180 215 Q300 258 440 200 L440 260 Q300 230 180 240 Q80 205 -20 275 Z" fill="#2db36b" opacity="0.4"/>
              <path d="M30 268 Q120 238 220 248 Q310 258 400 235" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeDasharray="10 8" strokeLinecap="round" fill="none"/>
              <g transform="translate(75, 210)"><line x1="0" y1="30" x2="0" y2="8" stroke="#A8B86B" strokeWidth="2.5" strokeLinecap="round"/><path d="M0 18 Q-10 8 -14 2" stroke="#229B58" strokeWidth="2.5" strokeLinecap="round" fill="none"/><path d="M0 22 Q10 12 14 6" stroke="#229B58" strokeWidth="2.5" strokeLinecap="round" fill="none"/><ellipse cx="-14" cy="2" rx="5" ry="4" fill="#229B58" transform="rotate(-30 -14 2)"/><ellipse cx="14" cy="6" rx="5" ry="4" fill="#A8B86B" transform="rotate(30 14 6)"/></g>
              <g transform="translate(230, 195)"><ellipse cx="16" cy="52" rx="14" ry="4" fill="rgba(0,0,0,0.15)"/><path d="M6 30 Q4 42 5 50 Q10 54 16 54 Q22 54 27 50 Q28 42 26 30 Z" fill="#F4C84A"/><circle cx="16" cy="18" r="16" fill="#F4C84A"/><circle cx="11" cy="16" r="2" fill="#073B4C"/><circle cx="21" cy="16" r="2" fill="#073B4C"/><path d="M11 22 Q16 27 21 22" stroke="#073B4C" strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="8" cy="20" r="3" fill="#FF4D68" opacity="0.4"/><circle cx="24" cy="20" r="3" fill="#FF4D68" opacity="0.4"/></g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
