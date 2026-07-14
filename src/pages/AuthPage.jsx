import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useLogin, useRegister } from '../hooks/useAuth'
import { useUiStore } from '../stores/uiStore'
import { Icons, BrandMark, labelStyle, inputStyle } from '../components/shared'
import { VERSION } from '../../version'

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
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'pcd' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const login = useLogin()
  const register = useRegister()
  const { addToast } = useUiStore()

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
      const data = await login.mutateAsync({ email: form.email, password: form.password })
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
      await register.mutateAsync(form)
      nav('/onboarding')
    } catch (err) {
      const msg = err.response?.data?.message ?? 'No se pudo crear la cuenta'
      setError(msg)
      addToast(msg, 'error')
    }
  }

  const s = {
    page: { minHeight: '100vh', background: 'var(--bg-warm)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' },
    inner: { maxWidth: 540, width: '100%', margin: '0 auto', padding: '40px 24px 64px' },
    header: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    title: { fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: 'var(--fg1)', margin: 0, textAlign: 'center' },
    sub: { fontSize: 17, color: 'var(--fg2)', marginTop: 10, textAlign: 'center', lineHeight: 1.5 },
    card: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 28, boxShadow: 'var(--shadow-sm)', marginTop: 28 },
    inputWrap: { marginBottom: 22 },
    roleBtn: (active) => ({
      display: 'flex', alignItems: 'center', gap: 16, padding: 18, width: '100%', textAlign: 'left',
      border: active ? '3px solid var(--primary)' : '2px solid var(--border-color)',
      borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: 44,
      background: active ? 'var(--primary-subtle)' : 'var(--bg-surface)',
      transition: 'all 0.2s ease', marginBottom: 12, fontFamily: 'var(--font-body)',
    }),
    avatar: (active) => ({
      width: 52, height: 52, borderRadius: '50% 50% 50% 14%',
      background: active ? 'var(--primary)' : 'var(--primary-subtle)',
      color: active ? 'white' : 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }),
    progress: { height: 6, background: 'var(--border-color)', borderRadius: 3, marginBottom: 28, overflow: 'hidden' },
    progressBar: (pct) => ({ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.4s ease' }),
    link: { background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: 3, minHeight: 44, padding: '0 8px' },
    actions: { display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 },
    errorBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--color-error) 12%, transparent)', border: '1px solid color-mix(in oklch, var(--color-error) 40%, transparent)', color: 'var(--color-error)', fontSize: 14, fontWeight: 600, marginBottom: 20 },
    passWrap: { position: 'relative' },
    passToggle: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 14, fontWeight: 700, padding: '8px 10px', minHeight: 44, fontFamily: 'var(--font-body)' },
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <header style={s.header}>
          <BrandMark onClick={() => nav('/')} />
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
                  <button className="btn-primary" type="submit" style={{ width: '100%', fontSize: 18, padding: '14px' }} disabled={login.isPending}>
                    {login.isPending ? 'Entrando...' : 'Entrar'} {Icons.arrowRight({ s: 18 })}
                  </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--fg3)' }}>v{VERSION}</p>
              </div>

              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
                  {Icons.shield({ s: 16 })} Cuentas de demostración
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {DEMO_ACCOUNTS.map(c => (
                    <button key={c.email} type="button"
                      onClick={() => { setForm(f => ({ ...f, email: c.email, password: c.pass })); setError('') }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', minHeight: 48, border: '2px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                      <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{Icons.user({ s: 18 })}</span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{c.role}</span>
                        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg3)' }}>{c.email}</span>
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Usar</span>
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
                <p style={{ fontSize: 14, color: 'var(--fg2)', fontWeight: 700, marginBottom: 8 }}>Paso {regStep} de 3</p>
                <div style={s.progress} role="progressbar" aria-valuenow={regStep} aria-valuemin={1} aria-valuemax={3} aria-label={`Paso ${regStep} de 3`}>
                  <div style={s.progressBar((regStep / 3) * 100)} />
                </div>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
                {regStep === 1 ? '¿Cómo te gustaría unirte?' : regStep === 2 ? 'Crea tu cuenta' : 'Validación y seguridad'}
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
                        <span style={{ flex: 1 }}>
                          <span style={{ display: 'block', fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>{r.title}</span>
                          <span style={{ display: 'block', fontSize: 14, color: 'var(--fg2)', marginTop: 2 }}>{r.desc}</span>
                        </span>
                        {form.role === r.id && <span style={{ color: 'var(--primary)' }}>{Icons.check({ s: 22 })}</span>}
                      </button>
                    ))}
                  </fieldset>
                )}

                {regStep === 2 && (
                  <form onSubmit={e => { e.preventDefault(); setRegStep(3) }}>
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
                  </form>
                )}

                {regStep === 3 && (
                  <div>
                    <div style={{ display: 'flex', gap: 12, padding: 16, background: 'color-mix(in oklch, var(--color-success) 10%, transparent)', borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in oklch, var(--color-success) 30%, transparent)', marginBottom: 20 }}>
                      <span style={{ color: 'var(--color-success)', flexShrink: 0 }}>{Icons.shield({ s: 20 })}</span>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)', margin: 0, lineHeight: 1.5 }}>Ecosistema curado. Validamos tu identidad para la seguridad de todos.</p>
                    </div>
                    <label style={labelStyle}>Identificación oficial (INE/Pasaporte)</label>
                    <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--fg2)', marginTop: 6 }}>
                      {Icons.upload({ s: 28 })}
                      <span style={{ fontSize: 15, fontWeight: 700 }}>Cargar documento</span>
                      <span style={{ fontSize: 13 }}>JPG, PNG o PDF — máx. 5MB (opcional en demo)</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={s.actions}>
                {regStep > 1
                  ? <button className="btn-secondary" onClick={() => setRegStep(st => st - 1)}>
                      {Icons.arrowLeft({ s: 18 })} Volver
                    </button>
                  : <span />}
                {regStep < 3
                  ? <button className="btn-primary" onClick={() => setRegStep(st => st + 1)} disabled={regStep === 2 && (!form.full_name || !form.email || form.password.length < 8)}>
                      Continuar {Icons.arrowRight({ s: 18 })}
                    </button>
                  : <button className="btn-primary" onClick={handleRegister} disabled={register.isPending}>
                      {register.isPending ? 'Creando cuenta...' : 'Finalizar registro'} {Icons.arrowRight({ s: 18 })}
                    </button>}
              </div>

              <p style={{ textAlign: 'center', marginTop: 24, fontSize: 16, color: 'var(--fg2)' }}>
                ¿Ya tienes cuenta?{' '}
                <button style={s.link} onClick={() => { setMode('login'); setError('') }}>Inicia sesión</button>
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
