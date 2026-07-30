import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import axios from 'axios';
import { useLogin, useRegister } from '../hooks/useAuth'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { Icons, BrandMark, labelStyle, inputStyle } from '@shared/components/shared'
import { getRememberMe } from '@shared/lib/storage'
import { VERSION } from '../../../../version'
import { STATES, getMunicipalities } from '@shared/lib/mexicoLocations'
import { AUTH_MESSAGES, AUTH_UI, FIREBASE_PASSWORD_RESET_URL } from '../constants/authMessages'

const ROLES = [
  { id: 'pcd', icon: Icons.heart, title: AUTH_UI.ROLE_PCD_TITLE, desc: AUTH_UI.ROLE_PCD_DESC },
  { id: 'tutor', icon: Icons.users, title: AUTH_UI.ROLE_TUTOR_TITLE, desc: AUTH_UI.ROLE_TUTOR_DESC },
  { id: 'institution', icon: Icons.building, title: AUTH_UI.ROLE_INSTITUTION_TITLE, desc: AUTH_UI.ROLE_INSTITUTION_DESC },
]



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
  const login = useLogin()
  const register = useRegister()
  const { addToast } = useUiStore()
  const { token, user } = useAuthStore()

  
  // Si el usuario ya está logueado, redirigir a su página principal
  if (token) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    if (user?.role === 'institution') return <Navigate to="/institution-portal" replace />
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setError('') }

  const doLogin = async () => {
    setError('')
    if (!form.email || !form.password) {
      setError(AUTH_MESSAGES.LOGIN_FIELDS_REQUIRED)
      addToast(AUTH_MESSAGES.LOGIN_FIELDS_REQUIRED, 'error')
      return
    }
    try {
      await login.mutateAsync({ email: form.email, password: form.password, _rememberMe: rememberMe })
      addToast(AUTH_MESSAGES.LOGIN_SUCCESS, 'success')
    } catch (err) {
      const msg = err.response?.data?.message ?? AUTH_MESSAGES.LOGIN_INVALID_CREDENTIALS
      setError(msg)
      addToast(msg, 'error')
    }
  }

  const handleLogin = async e => {
    e.preventDefault()
    await doLogin()
  }

  const handleRegister = async e => {
    e.preventDefault()
    setError('')
    try {
      await register.mutateAsync({ ...form, _rememberMe: rememberMe })
      addToast(AUTH_MESSAGES.REGISTER_SUCCESS, 'success')
    } catch (err) {
      const msg = err.response?.data?.message ?? AUTH_MESSAGES.REGISTER_FAILED
      setError(msg)
      addToast(msg, 'error')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.email) {
      setError(AUTH_MESSAGES.FORGOT_EMAIL_REQUIRED);
      addToast(AUTH_MESSAGES.FORGOT_EMAIL_REQUIRED, 'error');
      return;
    }

    setSending(true);
    try {
      const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;
      if (!firebaseKey) {
        throw new Error('Firebase API key not configured');
      }
      const url = `${FIREBASE_PASSWORD_RESET_URL}?key=${firebaseKey}`;
      await axios.post(url, {
        requestType: "PASSWORD_RESET",
        email: form.email
      });
      
      addToast(AUTH_MESSAGES.FORGOT_SEND_SUCCESS, 'success');
      setMode('login'); 
    } catch {
      setError(AUTH_MESSAGES.FORGOT_SEND_FAILED);
      addToast(AUTH_MESSAGES.FORGOT_SEND_FAILED, 'error');
    } finally {
      setSending(false);
    }
  };

  const s = {
    page: { minHeight: '100vh', background: 'var(--bg-warm)', display: 'block', fontFamily: 'var(--font-body)' },
    inner: { maxWidth: 540, width: '100%', margin: '0 auto', padding: '40px 24px 64px' },
    title: { fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--fg1)', margin: 0, textAlign: 'center' },
    sub: { fontSize: 17, color: 'var(--fg2)', marginTop: 10, textAlign: 'center', lineHeight: 1.5 },
    card: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 28, boxShadow: 'var(--shadow-sm)', marginTop: 28 },
    inputWrap: { marginBottom: 22 },
    roleBtn: (active) => ({
      display: 'block', padding: 18, width: '100%', textAlign: 'left',
      border: active ? '3px solid var(--primary)' : '2px solid var(--border-color)',
      borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: 44,
      background: active ? 'var(--primary-subtle)' : 'var(--bg-surface)',
      transition: 'all 0.2s ease', marginBottom: 12, fontFamily: 'var(--font-body)',
    }),
    avatar: (active) => ({
      width: 52, height: 52, borderRadius: '50% 50% 50% 14%',
      background: active ? 'var(--primary)' : 'var(--primary-subtle)',
      color: active ? 'white' : 'var(--primary)',
      display: 'inline-block', verticalAlign: 'middle', textAlign: 'center', lineHeight: '52px'
    }),
    progress: { height: 6, background: 'var(--border-color)', borderRadius: 3, marginBottom: 28, overflow: 'hidden' },
    progressBar: (pct) => ({ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.4s ease' }),
    link: { background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: 3, minHeight: 44, padding: '0 8px' },
    actions: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 },
    errorBox: { display: 'block', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--color-error) 12%, transparent)', border: '1px solid color-mix(in oklch, var(--color-error) 40%, transparent)', color: 'var(--color-error)', fontSize: 14, fontWeight: 600, marginBottom: 20 },
    passWrap: { position: 'relative' },
  }

  return (
    <div className="auth-split-layout" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)', background: 'var(--bg-warm)' }}>
      <style>{`
        .auth-brand-column {
          display: flex;
        }
        .auth-input {
          width: 100%;
          padding: 15px 22px;
          border: 1.5px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          font-size: 15px;
          box-sizing: border-box;
          font-family: var(--font-body);
          color: var(--fg1);
          background: var(--bg-surface);
          outline: none;
          transition: all 0.2s ease;
        }
        html[data-theme="dark"] .auth-input {
          border-color: rgba(255, 255, 255, 0.15);
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
          padding: 16px 24px;
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
          padding: 14px 20px;
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
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--fg3);
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .auth-pass-toggle:hover {
          color: var(--fg2);
        }
        @media (max-width: 820px) {
          .auth-brand-column {
            display: none !important;
          }
          .auth-form-column {
            padding: 40px 24px !important;
          }
        }
      `}</style>

      {/* Columna izquierda: Formulario */}
      <div className="auth-form-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 64px', boxSizing: 'border-box', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}>
          
          {/* Volver al inicio */}
          <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 36, fontFamily: 'var(--font-body)' }}>
            {Icons.arrowLeft({ s: 16 })} Volver al inicio
          </button>
          
          <main id="main">
            {mode === 'login' && (
              <>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                  Iniciar sesión
                </h1>
                <p style={{ fontSize: 16, color: 'var(--fg2)', margin: '0 0 32px', lineHeight: 1.5 }}>
                  Ingresa tu correo y contraseña para entrar a la plataforma
                </p>

                <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {error && (
                    <div style={s.errorBox} role="alert" aria-live="assertive">
                      {Icons.shieldAlert({ s: 18 })} {error}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="login-email" style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>
                      Correo electrónico <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input id="login-email" name="email" type="email" autoComplete="email"
                      className="auth-input" value={form.email} onChange={set('email')} required
                      placeholder="ejemplo@correo.com" />
                  </div>
                  
                  <div>
                    <label htmlFor="login-pass" style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 10 }}>
                      Contraseña <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={s.passWrap}>
                      <input id="login-pass" name="password" type={showPass ? 'text' : 'password'} autoComplete="current-password"
                        className="auth-input" style={{ paddingRight: 48 }} value={form.password} onChange={set('password')} required placeholder="Ingresa tu contraseña" />
                      <button type="button" onClick={() => setShowPass(v => !v)} className="auth-pass-toggle"
                        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPass}>
                        {showPass ? Icons.eyeOff({ s: 20 }) : Icons.eye({ s: 20 })}
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 500, color: 'var(--fg2)', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        id="remember-me"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        style={{ width: 20, height: 20, accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      Mantener sesión iniciada
                    </label>
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--primary)', padding: 0 }} 
                      onClick={() => { setMode('forgot'); setError(''); }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  
                  <button className="auth-btn-primary" type="submit" disabled={login.isPending} style={{ marginTop: 8 }}>
                    {login.isPending ? 'Entrando...' : 'Entrar'} {Icons.arrowRight({ s: 18 })}
                  </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 32, fontSize: 16, color: 'var(--fg2)' }}>
                  ¿No tienes cuenta?{' '}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--primary)', padding: 0 }} onClick={() => { setMode('register'); setError('') }}>Regístrate aquí</button>
                </p>
                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--fg3)' }}>v{VERSION}</p>
              </>
            )}

            {mode === 'register' && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 13, color: 'var(--fg3)', fontWeight: 700, marginBottom: 6 }}>Paso {regStep} de 2</p>
                  <div style={s.progress} role="progressbar" aria-valuenow={regStep} aria-valuemin={1} aria-valuemax={2} aria-label={`Paso ${regStep} de 2`}>
                    <div style={s.progressBar((regStep / 2) * 100)} />
                  </div>
                </div>
                
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  {regStep === 1 ? '¿Cómo te gustaría unirte?' : 'Crea tu cuenta'}
                </h1>
                <p style={{ fontSize: 15, color: 'var(--fg2)', margin: '0 0 24px', lineHeight: 1.5 }}>
                  {regStep === 1 ? 'Selecciona el tipo de cuenta que mejor se adapte a ti' : 'Ingresa tus datos personales para completar el registro'}
                </p>

                {error && (
                  <div style={{ ...s.errorBox, marginBottom: 20 }} role="alert" aria-live="assertive">
                    {Icons.shieldAlert({ s: 18 })} {error}
                  </div>
                )}

                {regStep === 1 && (
                  <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px' }}>
                    <legend className="sr-only">Selecciona tu tipo de cuenta</legend>
                    {ROLES.map(r => (
                      <button key={r.id} type="button" onClick={() => setForm(f => ({ ...f, role: r.id }))}
                        aria-pressed={form.role === r.id} style={s.roleBtn(form.role === r.id)}>
                        <span style={s.avatar(form.role === r.id)}>{r.icon({ s: 24 })}</span>
                        <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 16, width: 'calc(100% - 116px)' }}>
                          <span style={{ display: 'block', fontSize: 16, fontWeight: 700, color: 'var(--fg1)' }}>{r.title}</span>
                          <span style={{ display: 'block', fontSize: 13, color: 'var(--fg2)', marginTop: 2 }}>{r.desc}</span>
                        </span>
                        {form.role === r.id && <span style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--primary)', marginLeft: 'auto' }}>{Icons.check({ s: 22 })}</span>}
                      </button>
                    ))}
                  </fieldset>
                )}

                {regStep === 2 && (
                  <form onSubmit={e => { e.preventDefault(); handleRegister(e) }} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                    <div>
                      <label htmlFor="reg-name" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>Nombre completo <span style={{ color: '#ef4444' }}>*</span></label>
                      <input id="reg-name" name="name" autoComplete="name" className="auth-input" value={form.full_name} onChange={set('full_name')} required placeholder="Ej. Ana Pérez" />
                    </div>
                    <div>
                      <label htmlFor="reg-email" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label>
                      <input id="reg-email" name="email" type="email" autoComplete="email" className="auth-input" value={form.email} onChange={set('email')} required placeholder="ejemplo@correo.com" />
                    </div>
                    <div>
                      <label htmlFor="reg-pass" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>Contraseña <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={s.passWrap}>
                        <input id="reg-pass" name="new-password" type={showPass ? 'text' : 'password'} autoComplete="new-password" className="auth-input" style={{ paddingRight: 48 }} value={form.password} onChange={set('password')} required minLength={8} placeholder="Crea una contraseña segura" />
                        <button type="button" onClick={() => setShowPass(v => !v)} className="auth-pass-toggle" aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPass}>
                          {showPass ? Icons.eyeOff({ s: 20 }) : Icons.eye({ s: 20 })}
                        </button>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '6px 0 0' }}>Mínimo 8 caracteres</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label htmlFor="reg-state" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>Estado <span style={{ color: '#ef4444' }}>*</span></label>
                        <select
                          id="reg-state"
                          name="state"
                          autoComplete="address-level1"
                          className="auth-input auth-select"
                          value={form.state}
                          onChange={e => { setForm(f => ({ ...f, state: e.target.value, city: '' })); setError('') }}
                          required
                        >
                          <option value="" disabled>Selecciona un estado</option>
                          {STATES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label htmlFor="reg-city" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>Municipio <span style={{ color: '#ef4444' }}>*</span></label>
                        <select
                          id="reg-city"
                          name="city"
                          autoComplete="address-level2"
                          className="auth-input auth-select"
                          value={form.city}
                          onChange={set('city')}
                          required
                          disabled={!form.state}
                        >
                          <option value="" disabled>{form.state ? 'Selecciona un municipio' : 'Primero elige un estado'}</option>
                          {form.state && getMunicipalities(form.state).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {regStep === 1 ? (
                    <button className="auth-btn-primary" type="button" onClick={() => setRegStep(2)}>
                      Continuar {Icons.arrowRight({ s: 18 })}
                    </button>
                  ) : (
                    <>
                      <button className="auth-btn-primary" type="button" onClick={handleRegister} disabled={register.isPending || !form.full_name || !form.email || form.password.length < 8 || !form.city || !form.state}>
                        {register.isPending ? 'Creando cuenta...' : 'Finalizar registro'} {Icons.arrowRight({ s: 18 })}
                      </button>
                      <button className="auth-btn-secondary" type="button" onClick={() => setRegStep(1)}>
                        {Icons.arrowLeft({ s: 16 })} Volver al paso 1
                      </button>
                    </>
                  )}
                </div>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: 'var(--fg2)' }}>
                  ¿Ya tienes cuenta?{' '}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: 'var(--primary)', padding: 0 }} onClick={() => { setMode('login'); setError('') }}>Inicia sesión</button>
                </p>
              </>
            )}

            {mode === 'forgot' && (
              <>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  ¿Olvidaste tu contraseña?
                </h1>
                <p style={{ fontSize: 15, color: 'var(--fg2)', margin: '0 0 28px', lineHeight: 1.5 }}>
                  Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecerla
                </p>

                <form onSubmit={handleForgotPassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {error && (
                    <div style={s.errorBox} role="alert" aria-live="assertive">
                      {Icons.shieldAlert({ s: 18 })} {error}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="forgot-email" style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 8 }}>
                      Correo electrónico <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      id="forgot-email" 
                      name="email" 
                      type="email" 
                      autoComplete="email"
                      className="auth-input" 
                      value={form.email} 
                      onChange={set('email')} 
                      required 
                      placeholder="ejemplo@correo.com" 
                    />
                  </div>
                  
                  <button className="auth-btn-primary" type="submit" disabled={sending} style={{ marginTop: 8 }}>
                    {sending ? 'Enviando...' : 'Enviar enlace'} {Icons.arrowRight({ s: 18 })}
                  </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 32, fontSize: 15, color: 'var(--fg2)' }}>
                  ¿Recordaste tu contraseña?{' '}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: 'var(--primary)', padding: 0 }} onClick={() => { setMode('login'); setError(''); }}>Inicia sesión aquí</button>
                </p>
              </>
            )}
          </main>
        </div>
      </div>
      
      {/* Columna derecha: Branding y Gráfico */}
      <div className="auth-brand-column" style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #001D21 0%, #004E52 100%)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        color: 'white', 
        padding: 48,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Grid pattern overlay */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.05, 
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} />
        
        {/* Decorative subtle circles */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: '-100px', right: '-100px' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', bottom: '-50px', left: '-50px' }} />

        <div style={{ textAlign: 'center', zIndex: 2, maxWidth: 460 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50% 50% 50% 14%', background: 'rgba(255,255,255,0.15)', color: 'white', marginBottom: 24, fontSize: 32 }}>
            🌱
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, margin: '0 0 12px', color: 'white', letterSpacing: '-0.02em' }}>
            Raíces para florecer
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            Conectando personas con discapacidad, tutores e instituciones en un ecosistema digital de confianza, donde cada paso hacia la autonomía es celebrado y acompañado.
          </p>
        </div>
      </div>
    </div>
  )
}
