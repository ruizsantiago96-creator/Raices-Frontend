import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useLogin, useRegister } from '../hooks/useAuth'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, BrandMark, labelStyle, inputStyle } from '@shared/components/shared'
import { getRememberMe } from '@shared/lib/storage'
import { VERSION } from '../../../../version'
import { STATES, getMunicipalities } from '@shared/lib/mexicoLocations'

const ROLES = [
  { id: 'pcd', icon: Icons.heart, title: 'Persona con discapacidad', desc: 'Accede a tu ecosistema personalizado' },
  { id: 'tutor', icon: Icons.users, title: 'Tutor o familiar', desc: 'Apoya el desarrollo de quien cuidas' },
  { id: 'institution', icon: Icons.building, title: 'Institución', desc: 'Ofrece servicios, terapia o educación' },
]

const DEMO_ACCOUNTS = [
  { role: 'Persona con discapacidad', email: 'demo@raices.mx', pass: 'Demo1234' },
  { role: 'Tutor o familiar', email: 'tutor@raices.mx', pass: 'Tutor1234' },
  { role: 'Administrador', email: 'admin@raices.mx', pass: 'Admin1234' },
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setError('') }

  const doLogin = async () => {
    setError('')
    if (!form.email || !form.password) {
      const msg = 'Ingresa tu correo y contraseña'
      setError(msg)
      addToast(msg, 'error')
      return
    }
    try {
      const data = await login.mutateAsync({ email: form.email, password: form.password, _rememberMe: rememberMe })
      // Token guardado en onSuccess del hook
      addToast('¡Bienvenido!', 'success')
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Correo o contraseña incorrectos'
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
      addToast('¡Cuenta creada!', 'success')
    } catch (err) {
      const msg = err.response?.data?.message ?? 'No se pudo crear la cuenta'
      setError(msg)
      addToast(msg, 'error')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.email) {
      const msg = 'Ingresa tu correo para recuperar la contraseña';
      setError(msg);
      addToast(msg, 'error');
      return;
    }

    setSending(true);
    try {
      const url = 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyBWG0VGwewzap1Ls3HVH-yGsNE323XYxLc';
      await axios.post(url, {
        requestType: "PASSWORD_RESET",
        email: form.email
      });
      
      addToast('Enlace enviado. Revisa tu bandeja de entrada.', 'success');
      setMode('login'); 
    } catch (err) {
      const msg = 'No pudimos enviar el correo. Verifica tu dirección e intenta de nuevo.';
      setError(msg);
      addToast(msg, 'error');
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
    passToggle: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 14, fontWeight: 700, padding: '8px 10px', minHeight: 44, fontFamily: 'var(--font-body)' },
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <header style={{ display: 'block', textAlign: 'center', marginBottom: '40px', width: '100%' }}>
          {loading ? (
            <div style={{ display: 'block', textAlign: 'center', padding: '8px 0' }}>
              <span style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} aria-label="Cargando" role="status" />
            </div>
          ) : (
            <BrandMark onClick={() => nav('/')} />
          )}
        </header>

        <main id="main">
          {mode === 'login' && (
            <>
              <h1 style={s.title}>Iniciar sesión</h1>
              <p style={s.sub}>Ingresa con tu correo electrónico</p>

              <div style={s.card}>
                <form onSubmit={handleLogin} noValidate>
                  {error && (
                    <div style={s.errorBox} role="alert" aria-live="assertive">
                      {Icons.shieldAlert({ s: 18 })} {error}
                    </div>
                  )}
                  <div style={s.inputWrap}>
                    <label htmlFor="login-email" style={labelStyle}>Correo electrónico</label>
                    <input id="login-email" name="email" type="email" autoComplete="email"
                      style={inputStyle} value={form.email} onChange={set('email')} required
                      placeholder="correo@ejemplo.com" />
                  </div>
                  <div style={s.inputWrap}>
                    <label htmlFor="login-pass" style={labelStyle}>Contraseña</label>
                    <div style={s.passWrap}>
                      <input id="login-pass" name="password" type={showPass ? 'text' : 'password'} autoComplete="current-password"
                        style={{ ...inputStyle, paddingRight: 80 }} value={form.password} onChange={set('password')} required />
                      <button type="button" onClick={() => setShowPass(v => !v)} style={s.passToggle}
                        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPass}>
                        {showPass ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'block', marginBottom: 20 }}>
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer', verticalAlign: 'middle', marginRight: 8 }}
                    />
                    <label htmlFor="remember-me" style={{ display: 'inline-block', fontSize: 14, fontWeight: 600, color: 'var(--fg2)', cursor: 'pointer', userSelect: 'none', verticalAlign: 'middle' }}>
                      Mantener sesión iniciada
                    </label>
                  </div>
                  <div style={{ display: 'block', textAlign: 'right', marginTop: '-12px', marginBottom: '20px' }}>
                    <button 
                      type="button" 
                      style={{ ...s.link, fontSize: 14, minHeight: 'auto', padding: 0 }} 
                      onClick={() => { setMode('forgot'); setError(''); }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <button className="btn-primary" type="submit" style={{ width: '100%', fontSize: 18, padding: '14px' }} disabled={login.isPending}>
                    {login.isPending ? 'Entrando...' : 'Entrar'} {Icons.arrowRight({ s: 18 })}
                  </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--fg3)' }}>v{VERSION}</p>
              </div>

              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'block', textAlign: 'center', marginBottom: 14 }}>
                  <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}>{Icons.shield({ s: 16 })}</span> Cuentas de demostración
                </p>
                <div style={{ display: 'block' }}>
                  {DEMO_ACCOUNTS.map(c => (
                    <button key={c.email} type="button"
                      onClick={() => { setForm(f => ({ ...f, email: c.email, password: c.pass })); setError('') }}
                      style={{ display: 'block', width: '100%', padding: '12px 16px', minHeight: 48, border: '2px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', marginBottom: 8 }}>
                      <span style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 12, color: 'var(--primary)' }}>{Icons.user({ s: 18 })}</span>
                      <span style={{ display: 'inline-block', verticalAlign: 'middle', width: 'calc(100% - 100px)' }}>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{c.role}</span>
                        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg3)' }}>{c.email}</span>
                      </span>
                      <span style={{ display: 'inline-block', verticalAlign: 'middle', fontSize: 13, fontWeight: 700, color: 'var(--primary)', textAlign: 'right' }}>Usar</span>
                    </button>
                  ))}
                </div>
              </div>

              <p style={{ textAlign: 'center', marginTop: 28, fontSize: 16, color: 'var(--fg2)' }}>
                ¿No tienes cuenta?{' '}
                <button style={s.link} onClick={() => { setMode('register'); setError('') }}>Regístrate aquí</button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <>
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 14, color: 'var(--fg2)', fontWeight: 700, marginBottom: 8 }}>Paso {regStep} de 2</p>
                <div style={s.progress} role="progressbar" aria-valuenow={regStep} aria-valuemin={1} aria-valuemax={2} aria-label={`Paso ${regStep} de 2`}>
                  <div style={s.progressBar((regStep / 2) * 100)} />
                </div>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
                {regStep === 1 ? '¿Cómo te gustaría unirte?' : 'Crea tu cuenta'}
              </h1>

              {error && (
                <div style={{ ...s.errorBox, marginTop: 16 }} role="alert" aria-live="assertive">
                  {Icons.shieldAlert({ s: 18 })} {error}
                </div>
              )}

              <div style={{ ...s.card, padding: regStep === 1 ? 20 : 28 }}>
                {regStep === 1 && (
                  <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                    <legend className="sr-only">Selecciona tu tipo de cuenta</legend>
                    {ROLES.map(r => (
                      <button key={r.id} type="button" onClick={() => setForm(f => ({ ...f, role: r.id }))}
                        aria-pressed={form.role === r.id} style={s.roleBtn(form.role === r.id)}>
                        <span style={s.avatar(form.role === r.id)}>{r.icon({ s: 24 })}</span>
                        <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 16, width: 'calc(100% - 116px)' }}>
                          <span style={{ display: 'block', fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>{r.title}</span>
                          <span style={{ display: 'block', fontSize: 14, color: 'var(--fg2)', marginTop: 2 }}>{r.desc}</span>
                        </span>
                        {form.role === r.id && <span style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--primary)' }}>{Icons.check({ s: 22 })}</span>}
                      </button>
                    ))}
                  </fieldset>
                )}

                {regStep === 2 && (
                  <form onSubmit={e => { e.preventDefault(); handleRegister(e) }}>
                    <div style={s.inputWrap}>
                      <label htmlFor="reg-name" style={labelStyle}>Nombre completo</label>
                      <input id="reg-name" name="name" autoComplete="name" style={inputStyle} value={form.full_name} onChange={set('full_name')} required placeholder="Ej. Ana Pérez" />
                    </div>
                    <div style={s.inputWrap}>
                      <label htmlFor="reg-email" style={labelStyle}>Correo electrónico</label>
                      <input id="reg-email" name="email" type="email" autoComplete="email" style={inputStyle} value={form.email} onChange={set('email')} required placeholder="correo@ejemplo.com" />
                    </div>
                    <div style={s.inputWrap}>
                      <label htmlFor="reg-pass" style={labelStyle}>Contraseña</label>
                      <div style={s.passWrap}>
                        <input id="reg-pass" name="new-password" type={showPass ? 'text' : 'password'} autoComplete="new-password" style={{ ...inputStyle, paddingRight: 80 }} value={form.password} onChange={set('password')} required minLength={8} />
                        <button type="button" onClick={() => setShowPass(v => !v)} style={s.passToggle} aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPass}>
                          {showPass ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '6px 0 0' }}>Mínimo 8 caracteres</p>
                    </div>
                    <div style={{ display: 'block' }}>
                      <div style={{ display: 'inline-block', width: 'calc(50% - 8px)', verticalAlign: 'top', marginRight: 16 }}>
                        <div style={s.inputWrap}>
                          <label htmlFor="reg-state" style={labelStyle}>Estado</label>
                          <select
                            id="reg-state"
                            name="state"
                            autoComplete="address-level1"
                            style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
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
                      </div>
                      <div style={{ display: 'inline-block', width: 'calc(50% - 8px)', verticalAlign: 'top' }}>
                        <div style={s.inputWrap}>
                          <label htmlFor="reg-city" style={labelStyle}>Municipio</label>
                          <select
                            id="reg-city"
                            name="city"
                            autoComplete="address-level2"
                            style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
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
                    </div>
                  </form>
                )}

                
              </div>

              <div style={s.actions}>
                {regStep > 1 && (
                  <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setRegStep(st => st - 1)}>
                    {Icons.arrowLeft({ s: 18 })} Volver
                  </button>
                )}
                {regStep === 1
                  ? <button className="btn-primary" style={{ width: '100%' }} onClick={() => setRegStep(st => st + 1)}>
                      Continuar {Icons.arrowRight({ s: 18 })}
                    </button>
                  : <button className="btn-primary" type="button" style={{ width: '100%' }} onClick={handleRegister} disabled={register.isPending || !form.full_name || !form.email || form.password.length < 8 || !form.city || !form.state}>
                      {register.isPending ? 'Creando cuenta...' : 'Finalizar registro'} {Icons.arrowRight({ s: 18 })}
                    </button>}
              </div>

              <p style={{ textAlign: 'center', marginTop: 24, fontSize: 16, color: 'var(--fg2)' }}>
                ¿Ya tienes cuenta?{' '}
                <button style={s.link} onClick={() => { setMode('login'); setError('') }}>Inicia sesión</button>
              </p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h1 style={s.title}>Recuperar contraseña</h1>
              <p style={s.sub}>Ingresa tu correo y te enviaremos un enlace seguro</p>

              <div style={s.card}>
                <form onSubmit={handleForgotPassword} noValidate>
                  {error && (
                    <div style={s.errorBox} role="alert" aria-live="assertive">
                      {Icons.shieldAlert({ s: 18 })} {error}
                    </div>
                  )}
                  
                  <div style={s.inputWrap}>
                    <label htmlFor="forgot-email" style={labelStyle}>Correo electrónico</label>
                    <input 
                      id="forgot-email" 
                      name="email" 
                      type="email" 
                      autoComplete="email"
                      style={inputStyle} 
                      value={form.email} 
                      onChange={set('email')} 
                      required 
                      placeholder="correo@ejemplo.com" 
                    />
                  </div>
                  
                  <div style={{ display: 'block', textAlign: 'center', marginTop: '24px' }}>
                    <button className="btn-primary" type="submit" style={{ display: 'inline-block', width: '100%', fontSize: 18, padding: '14px' }} disabled={sending}>
                      {sending ? 'Enviando...' : 'Enviar enlace'} {Icons.arrowRight({ s: 18 })}
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ display: 'block', textAlign: 'center', marginTop: 28 }}>
                <p style={{ display: 'inline-block', fontSize: 16, color: 'var(--fg2)', margin: 0 }}>
                  <button style={s.link} onClick={() => { setMode('login'); setError(''); }}>
                    {Icons.arrowLeft({ s: 16 })} Volver al inicio de sesión
                  </button>
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
