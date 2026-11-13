import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useLogin, getHomePathByRole } from '../hooks/useAuth'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '../store/authStore'
import { Icons, BrandMark } from '@shared/components/shared'
import { getRememberMe } from '@shared/lib/storage'
import { VERSION } from '../../../../version'
import { AUTH_MESSAGES, FIREBASE_PASSWORD_RESET_URL } from '../constants/authMessages'
import { normalizeEmail } from '../lib/validators'
import RegistrationWizard from '../components/RegistrationWizard'
import TutorRegistrationWizard from '../components/TutorRegistrationWizard'
import InstitutionRegistrationWizard from '../components/InstitutionRegistrationWizard'
import EnterpriseRegistrationWizard from '../components/EnterpriseRegistrationWizard'
import { ROLES } from '../constants/roles'
import { mapErrorMessage } from '../lib/mapErrorMessage'
import { CatalogIcon } from '../components/CatalogIcon'
import { FluentEmoji } from '../constants/fluentEmojis'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type AuthMode = 'login' | 'register' | 'forgot'
export type AuthRegStep = number | 'consent' | 'pcd_wizard' | 'tutor_wizard' | 'institution_wizard' | 'empresa_wizard'

interface AuthFormData {
  email: string
  password: string
  role: string
  full_name?: string
  [key: string]: string | undefined
}

export default function AuthPage() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [mode, setMode] = useState<AuthMode>(params.get('mode') === 'register' ? 'register' : 'login')
  const [regStep, setRegStep] = useState<AuthRegStep>(1)
  const [form, setForm] = useState<AuthFormData>({ email: '', password: '', role: 'pcd' })
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(getRememberMe)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const login = useLogin()
  const { addToast } = useUiStore()
  const { token, user } = useAuthStore()

  const urlMode = params.get('mode')
  const [prevUrlMode, setPrevUrlMode] = useState(urlMode)

  if (prevUrlMode !== urlMode) {
    setPrevUrlMode(urlMode)
    if (urlMode === 'login') {
      setMode('login')
      setRegStep(1)
    } else if (urlMode === 'register') {
      setMode('register')
    }
  }

  const goToLogin = (email = '') => {
    if (email) setForm(f => ({ ...f, email }))
    setMode('login')
    setRegStep(1)
    nav('/auth?mode=login', { replace: true })
  }

  if (token && !login.isPending) {
    return <Navigate to={getHomePathByRole(user?.role)} replace />
  }

  const set = (k: string) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let val = e.target.value
    if (k === 'full_name' && form.role !== 'institution') {
      val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
    }
    // El correo siempre se normaliza a minúsculas al escribirlo
    if (k === 'email') {
      val = normalizeEmail(val)
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
      const result = await login.mutateAsync({ email: form.email, password: form.password, _rememberMe: rememberMe })
      addToast(AUTH_MESSAGES.LOGIN_SUCCESS, 'success')
      const role = result?.data?.user?.role
      nav(getHomePathByRole(role), { replace: true })
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      const msg = apiErr.response?.data?.message ?? AUTH_MESSAGES.LOGIN_INVALID_CREDENTIALS
      const translatedMsg = mapErrorMessage(msg)
      setError(translatedMsg)
      addToast(translatedMsg, 'error')
    }
  }

  const handleLogin = async (e: FormEvent) => { e.preventDefault(); await doLogin() }

  const handleForgotPassword = async (e: FormEvent) => {
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

  const s = {
    roleBtn: (active: boolean) => ({ display: 'block', padding: 'clamp(10px, 1.6vh, 16px)', width: '100%', textAlign: 'left' as const, border: active ? '3px solid var(--primary)' : '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: 44, background: active ? 'var(--primary-subtle)' : 'var(--bg-surface)', transition: 'all 0.2s ease', marginBottom: 'clamp(8px, 1.2vh, 12px)', fontFamily: 'var(--font-body)' }),
    avatar: (active: boolean) => ({ width: 'clamp(38px, 5vh, 48px)', height: 'clamp(38px, 5vh, 48px)', borderRadius: '50%', background: 'var(--bg-cool)', border: active ? '3px solid var(--primary)' : '1.5px solid var(--border-color)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', transition: 'all 0.2s ease', position: 'relative' as const, overflow: 'hidden' }),
    progress: { height: 6, background: 'var(--border-color)', borderRadius: 3, marginBottom: 'clamp(10px, 2vh, 22px)', overflow: 'hidden' },
    progressBar: (pct: number) => ({ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width 0.4s ease' }),
    errorBox: { display: 'block', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--color-error) 12%, transparent)', border: '1px solid color-mix(in oklch, var(--color-error) 40%, transparent)', color: 'var(--color-error)', fontSize: 13.5, fontWeight: 600, marginBottom: 14 },
    passWrap: { position: 'relative' as const },
  }

  return (
    <div className="auth-page-container">
      <style>{`
        .auth-page-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          background: #dbcfc2;
          padding: clamp(28px, 6vh, 64px) clamp(32px, 7vw, 96px);
          box-sizing: border-box;
          font-family: var(--font-body);
          transition: background-color 0.3s ease;
        }
        html[data-theme="dark"] .auth-page-container {
          background: color-mix(in oklch, #dbcfc2 10%, var(--bg-warm));
        }
        html[data-text-scale="lg"] .auth-page-container {
          height: calc(100dvh / 1.15);
          max-height: calc(100dvh / 1.15);
          padding: 20px 36px;
        }
        html[data-text-scale="lg"] .auth-card {
          max-width: min(800px, calc(74vw / 1.15));
          max-height: 100%;
        }
        html[data-text-scale="xl"] .auth-page-container {
          height: calc(100dvh / 1.32);
          max-height: calc(100dvh / 1.32);
          padding: 16px 28px;
        }
        html[data-text-scale="xl"] .auth-card {
          max-width: min(760px, calc(74vw / 1.32));
          max-height: 100%;
        }
        .auth-card {
          display: flex;
          width: 100%;
          max-width: min(860px, 74vw);
          height: 100%;
          max-height: 580px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(7, 59, 76, 0.08);
          position: relative;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        html[data-theme="dark"] .auth-card {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
        }
        .auth-form-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: clamp(18px, 3vh, 36px) clamp(22px, 3vw, 44px);
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
          background: linear-gradient(165deg, #24355b 0%, #1c2947 55%, #16203a 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: white;
          padding: clamp(28px, 4.5vh, 48px) 0 0;
          position: relative;
          overflow: hidden;
          transition: background-color 0.3s ease;
        }
        html[data-theme="dark"] .auth-brand-column {
          background: linear-gradient(165deg, #162038 0%, #11192c 60%, #0d1424 100%);
        }
        .auth-brand-curve {
          fill: #213052;
          transition: fill 0.3s ease;
        }
        html[data-theme="dark"] .auth-brand-curve {
          fill: #131c31;
        }
        .auth-brand-header {
          z-index: 2;
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 36px;
          text-align: center;
          gap: 14px;
        }
        .auth-brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(6px);
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.88);
          letter-spacing: 0.02em;
          animation: authFloatSlow 5s ease-in-out infinite;
        }
        .auth-brand-pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #229B58;
          box-shadow: 0 0 8px #229B58;
          animation: authPulseDot 2.2s ease-in-out infinite;
        }
        .auth-brand-glow {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34, 155, 88, 0.22) 0%, rgba(244, 200, 74, 0.08) 45%, transparent 72%);
          top: 32%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
          animation: authGlowPulse 7s ease-in-out infinite;
        }
        .auth-brand-grid {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          background-image: linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px);
          background-size: 26px 26px;
          animation: authGridDrift 24s linear infinite;
          pointer-events: none;
        }
        .auth-brand-illustration {
          z-index: 2;
          width: 100%;
          margin: auto 0 0;
          line-height: 0;
        }
        .auth-anim-float-1 {
          animation: authFloat 4.5s ease-in-out infinite;
        }
        .auth-anim-float-2 {
          animation: authFloat 5.6s ease-in-out 0.8s infinite;
        }
        .auth-anim-float-3 {
          animation: authFloat 3.9s ease-in-out 1.4s infinite;
        }
        .auth-anim-cloud-1 {
          animation: authCloudDrift 16s ease-in-out infinite alternate;
        }
        .auth-anim-cloud-2 {
          animation: authCloudDrift 20s ease-in-out 2s infinite alternate-reverse;
        }
        .auth-anim-sprout {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: authSway 4.2s ease-in-out infinite;
        }
        .auth-anim-mascot {
          transform-box: fill-box;
          transform-origin: bottom center;
          animation: authMascotBob 2.4s ease-in-out infinite;
        }
        .auth-anim-shadow {
          transform-box: fill-box;
          transform-origin: center;
          animation: authShadowScale 2.4s ease-in-out infinite;
        }
        .auth-anim-eyes {
          transform-box: fill-box;
          transform-origin: center;
          animation: authBlink 4.8s ease-in-out infinite;
        }
        .auth-anim-path {
          stroke-dasharray: 10 8;
          animation: authPathFlow 2.6s linear infinite;
        }
        @keyframes authFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.85; }
          50% { transform: translateY(-9px) scale(1.12); opacity: 1; }
        }
        @keyframes authFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes authPulseDot {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.35); opacity: 1; }
        }
        @keyframes authGlowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.75; }
          50% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
        }
        @keyframes authGridDrift {
          0% { background-position: 0 0; }
          100% { background-position: 26px 26px; }
        }
        @keyframes authCloudDrift {
          0% { transform: translateX(-10px); }
          100% { transform: translateX(14px); }
        }
        @keyframes authSway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes authMascotBob {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-6px) rotate(1.5deg); }
        }
        @keyframes authShadowScale {
          0%, 100% { transform: scaleX(1); opacity: 0.2; }
          50% { transform: scaleX(0.82); opacity: 0.12; }
        }
        @keyframes authBlink {
          0%, 44%, 48%, 100% { transform: scaleY(1); }
          46% { transform: scaleY(0.1); }
        }
        @keyframes authPathFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -36; }
        }
        @media (prefers-reduced-motion: reduce) {
          .auth-brand-pill,
          .auth-brand-pill-dot,
          .auth-brand-glow,
          .auth-brand-grid,
          .auth-anim-float-1,
          .auth-anim-float-2,
          .auth-anim-float-3,
          .auth-anim-cloud-1,
          .auth-anim-cloud-2,
          .auth-anim-sprout,
          .auth-anim-mascot,
          .auth-anim-shadow,
          .auth-anim-eyes,
          .auth-anim-path {
            animation: none !important;
          }
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
          border-color: var(--fg2) !important;
          box-shadow: none !important;
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
          z-index: 10;
          transition: all 0.15s ease;
        }
        .auth-pass-toggle:hover {
          color: var(--fg1);
          background: color-mix(in oklch, var(--primary) 10%, transparent);
        }
        input::-ms-reveal,
        input::-ms-clear {
          display: none !important;
        }
        @media (max-height: 780px), (max-width: 1380px) {
          .auth-page-container { padding: clamp(24px, 5vh, 48px) clamp(28px, 6vw, 72px); align-items: center; }
          .auth-card { max-width: min(800px, 72vw); max-height: 530px; border-radius: 24px; }
          .auth-form-column { padding: 18px 30px; }
          .auth-form-column .auth-input { padding: 10px 14px; font-size: 13.5px; }
          .auth-form-column .auth-btn-primary { padding: 11px 18px; font-size: 14px; }
          .auth-brand-column { padding: 16px 0 0; }
        }
        @media (max-height: 680px) {
          .auth-page-container { padding: clamp(20px, 4.5vh, 40px) clamp(24px, 6vw, 64px); align-items: center; }
          .auth-card { max-width: min(760px, 72vw); max-height: 480px; border-radius: 22px; }
          .auth-form-column { padding: 14px 26px; }
          .auth-form-column .auth-input { padding: 9px 13px; font-size: 13px; }
          .auth-form-column .auth-btn-primary { padding: 10px 16px; font-size: 13.5px; }
          .auth-brand-column { padding: 12px 0 0; }
        }
        @media (max-height: 600px) {
          .auth-brand-illustration { display: none; }
        }
        @media (max-width: 900px) {
          .auth-page-container { height: auto !important; max-height: none !important; min-height: 100dvh; overflow: auto; padding: 16px; }
          .auth-card { flex-direction: column; max-width: 480px; height: auto; max-height: none; min-height: auto; border-radius: 20px; }
          .auth-brand-column { display: none !important; }
          .auth-form-column { padding: 32px 24px !important; }
        }
      `}</style>

      <div className="auth-card">
        {/* Columna izquierda: Formulario */}
        <div className="auth-form-column" style={(regStep === 'pcd_wizard' || regStep === 'tutor_wizard' || regStep === 'institution_wizard' || regStep === 'empresa_wizard') ? { justifyContent: 'flex-start' } : undefined}>
          <div style={{ maxWidth: 440, width: '100%', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'clamp(12px, 2.4vh, 26px)' }}>
              <BrandMark size={24} onClick={() => nav('/')} />
            </div>
            <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 'clamp(10px, 2vh, 22px)', fontFamily: 'var(--font-body)' }}>
              {Icons.arrowLeft({ s: 15 })} Volver al inicio
            </button>
            
            <main id="main" key={`${mode}-${String(regStep)}`} className="animate-tab-in">
              {mode === 'login' && (
                <>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', margin: '0 0 clamp(12px, 2.2vh, 22px)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bienvenido a tu nuevo camino</p>
                  <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vh, 18px)' }}>
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
                  <p style={{ textAlign: 'center', marginTop: 'clamp(14px, 2.2vh, 26px)', fontSize: 14, color: 'var(--fg2)' }}>¿No tienes una cuenta?{' '}<button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--primary)', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('register'); setError('') }}>Regístrate</button></p>
                </>
              )}

              {mode === 'register' && (
                <>
                  {regStep === 1 && (
                    <>
                      <div style={{ marginBottom: 8 }}><p style={{ fontSize: 12.5, color: 'var(--fg3)', fontWeight: 700, marginBottom: 6 }}>Paso 1 de 2</p><div style={s.progress} role="progressbar" aria-valuenow={1} aria-valuemin={1} aria-valuemax={2} aria-label="Paso 1 de 2"><div style={s.progressBar(50)} /></div></div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.8vh, 25px)', fontWeight: 800, color: 'var(--fg1)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>¿Cómo te gustaría unirte?</h1>
                      <p style={{ fontSize: 'clamp(12.5px, 1.6vh, 14px)', color: 'var(--fg2)', margin: '0 0 clamp(10px, 1.8vh, 18px)', lineHeight: 1.4 }}>Selecciona el tipo de cuenta que mejor se adapte a ti</p>
                      {error && <div style={{ ...s.errorBox, marginBottom: 14 }} role="alert" aria-live="assertive">{Icons.shieldAlert({ s: 18 })} {error}</div>}
                      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 clamp(10px, 1.8vh, 18px)' }}>
                        <legend className="sr-only">Selecciona tu tipo de cuenta</legend>
                        {ROLES.map(r => {
                          const RoleIcon = r.icon
                          return (
                            <button key={r.id} type="button" onClick={() => setForm(f => ({ ...f, role: r.id }))} aria-pressed={form.role === r.id} style={s.roleBtn(form.role === r.id)}>
                              <span style={s.avatar(form.role === r.id)}><RoleIcon size={28} /></span>
                              <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 12, width: 'calc(100% - 90px)' }}>
                                <span style={{ display: 'block', fontSize: 'clamp(13.5px, 1.8vh, 15px)', fontWeight: 700, color: 'var(--fg1)' }}>{r.title}</span>
                                <span style={{ display: 'block', fontSize: 'clamp(11.5px, 1.5vh, 12px)', color: 'var(--fg2)', marginTop: 2 }}>{r.desc}</span>
                              </span>
                              {form.role === r.id && <span style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--primary)', marginLeft: 'auto' }}>{Icons.check({ s: 18 })}</span>}
                            </button>
                          )
                        })}
                      </fieldset>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}><button className="auth-btn-primary" type="button" onClick={() => setRegStep('consent')}>Continuar {Icons.arrowRight({ s: 18 })}</button></div>
                    </>
                  )}

                  {regStep === 'consent' && (
                    <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
                      <div style={{ width: 'clamp(36px, 5.5vh, 48px)', height: 'clamp(36px, 5.5vh, 48px)', borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto clamp(8px, 1.5vh, 14px)' }}>{Icons.shieldCheck ? Icons.shieldCheck({ s: 24 }) : Icons.shield({ s: 24 })}</div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(17px, 2.4vh, 21px)', fontWeight: 800, color: 'var(--fg1)', margin: '0 0 clamp(8px, 1.5vh, 14px)', textAlign: 'center', lineHeight: 1.25 }}>Verificamos y protegemos tu identidad para un camino seguro y confidencial.</h1>
                      <div style={{ background: 'var(--bg-cool)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 'clamp(12px, 2vh, 18px) clamp(14px, 2vw, 18px)', display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.2vh, 10px)', marginBottom: 'clamp(10px, 2vh, 18px)', color: 'var(--fg2)', fontSize: 'clamp(12.5px, 1.6vh, 14px)', lineHeight: 1.4 }}>
                        <p style={{ margin: 0 }}>Tu registro nos permite confirmar tu identidad, proteger tu seguridad y ofrecerte caminos más confiables, personalizados y dignos dentro de la plataforma.</p>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--fg1)', display: 'flex', alignItems: 'center', gap: 6 }}><CatalogIcon icon={FluentEmoji.privacidad} size={14} /> Tus datos son confidenciales, están protegidos y nunca serán compartidos sin tu autorización.</p>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 'clamp(10px, 1.8vh, 16px)', fontSize: 'clamp(12.5px, 1.6vh, 14px)', color: 'var(--fg1)', userSelect: 'none', padding: '2px 4px' }}>
                        <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} style={{ width: 17, height: 17, cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }} />
                        <span>Acepto los términos de confidencialidad y protección de datos</span>
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.2vh, 10px)' }}>
                        <button className="auth-btn-primary" type="button" disabled={!consentChecked} onClick={() => { if (form.role === 'pcd') setRegStep('pcd_wizard'); else if (form.role === 'tutor') setRegStep('tutor_wizard'); else if (form.role === 'institution') setRegStep('institution_wizard'); else if (form.role === 'empresa') setRegStep('empresa_wizard') }} style={{ padding: 'clamp(10px, 1.6vh, 14px) 18px', fontSize: 'clamp(13.5px, 1.8vh, 15px)' }}>De acuerdo y continuar {Icons.arrowRight({ s: 18 })}</button>
                        <button className="auth-btn-secondary" type="button" onClick={() => setRegStep(1)} style={{ padding: 'clamp(9px, 1.4vh, 12px) 16px', fontSize: 'clamp(13px, 1.7vh, 14.5px)' }}>{Icons.arrowLeft({ s: 16 })} Cambiar tipo de cuenta</button>
                      </div>
                    </div>
                  )}

                  {regStep === 'pcd_wizard' && <RegistrationWizard onBackToRoles={() => setRegStep(1)} onGoToLogin={goToLogin} />}
                  {regStep === 'tutor_wizard' && <TutorRegistrationWizard onBackToRoles={() => setRegStep(1)} onGoToLogin={goToLogin} />}
                  {regStep === 'institution_wizard' && <InstitutionRegistrationWizard onBackToRoles={() => setRegStep(1)} />}
                  {regStep === 'empresa_wizard' && <EnterpriseRegistrationWizard onBackToRoles={() => setRegStep(1)} />}

                  {regStep !== 'pcd_wizard' && regStep !== 'tutor_wizard' && regStep !== 'institution_wizard' && regStep !== 'empresa_wizard' && <p style={{ textAlign: 'center', marginTop: 'clamp(10px, 1.8vh, 20px)', fontSize: 13.5, color: 'var(--fg2)' }}>¿Ya tienes cuenta?{' '}<button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 700, color: 'var(--primary)', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('login'); setError('') }}>Inicia sesión</button></p>}
                </>
              )}

              {mode === 'forgot' && (
                <>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vh, 27px)', fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>¿Olvidaste tu contraseña?</h1>
                  <p style={{ fontSize: 'clamp(13px, 1.7vh, 14px)', color: 'var(--fg2)', margin: '0 0 clamp(14px, 2.2vh, 22px)', lineHeight: 1.5 }}>Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecerla</p>
                  <form onSubmit={handleForgotPassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.8vh, 18px)' }}>
                    {error && <div style={s.errorBox} role="alert" aria-live="assertive">{Icons.shieldAlert({ s: 18 })} {error}</div>}
                    <div><label htmlFor="forgot-email" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg1)', marginBottom: 8 }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label><input id="forgot-email" name="email" type="email" autoComplete="email" className="auth-input" value={form.email} onChange={set('email')} required placeholder="ejemplo@correo.com" /></div>
                    <button className="auth-btn-primary" type="submit" disabled={sending} style={{ marginTop: 6 }}>{sending ? 'Enviando...' : 'Enviar enlace'} {Icons.arrowRight({ s: 18 })}</button>
                  </form>
                  <p style={{ textAlign: 'center', marginTop: 'clamp(14px, 2.4vh, 26px)', fontSize: 14, color: 'var(--fg2)' }}>¿Recordaste tu contraseña?{' '}<button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--primary)', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('login'); setError(''); }}>Inicia sesión aquí</button></p>
                </>
              )}
            </main>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--fg3)', fontSize: 12, fontWeight: 800, letterSpacing: '0.05em', marginTop: 'clamp(16px, 2.6vh, 32px)' }}>POWERED BY <img src="/images/Techmaleon_Logo.png" alt="Techmaleon" style={{ height: 18, width: 'auto', objectFit: 'contain' }} /></div>
            <div style={{ fontSize: 11, color: 'var(--fg3)', opacity: 0.7, fontWeight: 500, marginTop: 4 }}>v{VERSION}</div>
          </div>
        </div>
        
        {/* Columna derecha: Branding */}
        <div className="auth-brand-column">
          <svg style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 70, height: '100%', transform: 'translateX(-99%)', pointerEvents: 'none', zIndex: 1 }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M100 0 C30 20, 20 70, 100 100 Z" className="auth-brand-curve" />
          </svg>
          <div className="auth-brand-grid" />
          <div className="auth-brand-glow" />
          <div className="auth-brand-header">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 3.6vw, 48px)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', display: 'block', lineHeight: 1.05, textShadow: '0 8px 24px rgba(0, 0, 0, 0.25)' }}>
              Raíces<span style={{ color: '#FF4D68' }}>.</span>
            </span>
            <div className="auth-brand-pill">
              <span className="auth-brand-pill-dot" />
              <span>Comunidad · Inclusión · Oportunidades</span>
            </div>
          </div>
          <div className="auth-brand-illustration" aria-hidden="true">
            <svg viewBox="0 0 420 185" preserveAspectRatio="xMidYMax slice" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <g className="auth-anim-cloud-1" opacity="0.12">
                <rect x="44" y="20" width="68" height="20" rx="10" fill="white" />
                <circle cx="64" cy="20" r="14" fill="white" />
                <circle cx="88" cy="22" r="11" fill="white" />
              </g>
              <g className="auth-anim-cloud-2" opacity="0.1">
                <rect x="292" y="10" width="76" height="22" rx="11" fill="white" />
                <circle cx="318" cy="10" r="15" fill="white" />
                <circle cx="344" cy="12" r="12" fill="white" />
              </g>
              <g className="auth-anim-float-1">
                <circle cx="322" cy="38" r="8" fill="#F4C84A" opacity="0.92" />
                <circle cx="322" cy="38" r="14" fill="#F4C84A" opacity="0.18" />
              </g>
              <g className="auth-anim-float-2">
                <circle cx="92" cy="50" r="5" fill="#FF4D68" opacity="0.88" />
                <circle cx="92" cy="50" r="10" fill="#FF4D68" opacity="0.18" />
              </g>
              <g className="auth-anim-float-3">
                <circle cx="366" cy="68" r="4.5" fill="#5EEAD4" opacity="0.8" />
                <circle cx="164" cy="28" r="3.5" fill="#F4C84A" opacity="0.65" />
              </g>
              <path d="M-20 125 Q70 65 150 105 Q230 145 310 85 Q375 45 440 75 L440 190 L-20 190 Z" fill="#18603c" opacity="0.48" />
              <path d="M-20 150 Q85 80 190 120 Q305 162 440 104 L440 190 L-20 190 Z" fill="#229B58" />
              <path d="M-20 157 Q85 92 190 126 Q305 166 440 112 L440 172 Q305 140 190 150 Q85 118 -20 180 Z" fill="#2db36b" opacity="0.42" />
              <path className="auth-anim-path" d="M22 172 Q120 144 220 155 Q315 164 408 142" stroke="rgba(255,255,255,0.58)" strokeWidth="3" strokeLinecap="round" fill="none" />
              <g className="auth-anim-sprout" transform="translate(88, 118)">
                <line x1="0" y1="30" x2="0" y2="8" stroke="#A8B86B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0 18 Q-10 8 -14 2" stroke="#229B58" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M0 22 Q10 12 14 6" stroke="#229B58" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <ellipse cx="-14" cy="2" rx="5.5" ry="4" fill="#34D399" transform="rotate(-30 -14 2)" />
                <ellipse cx="14" cy="6" rx="5.5" ry="4" fill="#A8B86B" transform="rotate(30 14 6)" />
              </g>
              <g transform="translate(232, 100)">
                <ellipse className="auth-anim-shadow" cx="16" cy="53" rx="14" ry="4" fill="rgba(0,0,0,0.2)" />
                <g className="auth-anim-mascot">
                  <path d="M6 30 Q4 42 5 50 Q10 54 16 54 Q22 54 27 50 Q28 42 26 30 Z" fill="#F4C84A" />
                  <circle cx="16" cy="18" r="16" fill="#F4C84A" />
                  <g className="auth-anim-eyes">
                    <circle cx="11" cy="16" r="2" fill="#073B4C" />
                    <circle cx="21" cy="16" r="2" fill="#073B4C" />
                  </g>
                  <path d="M11 22 Q16 27 21 22" stroke="#073B4C" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <circle cx="8" cy="20" r="3" fill="#FF4D68" opacity="0.45" />
                  <circle cx="24" cy="20" r="3" fill="#FF4D68" opacity="0.45" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
