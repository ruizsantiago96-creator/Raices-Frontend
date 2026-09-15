import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { Icons } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import { WizardNavButtons, LocationInputs, PasswordField } from './WizardUI'
import {
  OrganizationProgress,
  OrganizationThanksStep,
  validateAccountForm,
  type OrgFormData,
  type AccountFormData,
} from './OrganizationFormSteps'
import { useCreateAccount, payloadBuilders, type InstitutionFormData } from '../hooks/useCreateAccount'
import { getPasswordStrength } from '../lib/passwordStrength'
import { FluentEmoji } from '../constants/fluentEmojis'

export interface InstitutionRegistrationWizardProps {
  onBackToRoles?: () => void
}

export type InstitutionWizardStep = 'account_location' | 'org_name' | 'account_email' | 'account_password' | 'csf' | 'thanks'

const STEP_ORDER: InstitutionWizardStep[] = [
  'org_name',
  'account_email',
  'account_password',
  'account_location',
  'csf',
]

const TOTAL_STEPS = 5

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function InstitutionRegistrationWizard({
  onBackToRoles = () => {},
}: InstitutionRegistrationWizardProps): React.JSX.Element {
  const nav = useNavigate()
  const { addToast } = useUiStore()

  const createAccount = useCreateAccount<InstitutionFormData>({
    role: 'institution',
    buildPayload: (formData: InstitutionFormData) => payloadBuilders.institution(formData),
    // El wizard controla la redirección a /inicio tras el éxito
    navigateOnSuccess: false,
    postSteps: [
      {
        name: 'perfil-institucional',
        optional: true,
        execute: async () => {
          await api.put('/usuarios/perfil', {
            perfilInstitucional: {
              nombreInstitucion: orgForm.nombre,
              descripcion: orgForm.descripcion,
              mision: orgForm.mision,
              nombreContacto: orgForm.contactName,
              telefonoContacto: orgForm.phone,
              sitioWeb: orgForm.website,
            },
          })
        },
      },
    ],
  })

  const [wizardStep, setWizardStep] = useState<InstitutionWizardStep>('org_name')
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [showPass, setShowPass] = useState<boolean>(false)

  // CSF
  const [csfFile, setCsfFile] = useState<File | null>(null)
  const csfInputRef = useRef<HTMLInputElement>(null)

  // Info de la organización
  const [orgForm, setOrgForm] = useState<OrgFormData>({
    nombre: '',
    descripcion: '',
    mision: '',
    contactName: '',
    phone: '',
    website: '',
    curp: '',
  })

  // Cuenta y ubicación
  const [accountForm, setAccountForm] = useState<AccountFormData>({
    email: '',
    password: '',
    country: 'MX',
    postalCode: '',
    state: '',
    city: '',
  })

  const scrollTop = (): void => {
    const col = document.querySelector('.auth-form-column')
    if (col) col.scrollTop = 0
  }

  const stepIndex = STEP_ORDER.indexOf(wizardStep)
  const progressPct = stepIndex >= 0 ? ((stepIndex + 1) / TOTAL_STEPS) * 100 : 100

  // ── Step handlers ───────────────────────────────────────────────
  const handleOrgNameSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (!orgForm.nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setWizardStep('account_email')
    scrollTop()
  }

  const handleAccountEmailSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (!accountForm.email.trim()) {
      setError('El correo es obligatorio.')
      return
    }
    setWizardStep('account_password')
    scrollTop()
  }

  const handleAccountPasswordSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (!accountForm.password.trim()) {
      setError('La contraseña es obligatoria.')
      return
    }
    setWizardStep('account_location')
    scrollTop()
  }

  const handleLocationSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (!accountForm.country || !accountForm.postalCode || !accountForm.state || !accountForm.city) {
      setError('Por favor, ingresa un código postal válido, estado y ciudad.')
      return
    }
    setWizardStep('csf')
    scrollTop()
  }

  // ── Final submit (triggered from CSF step) ─────────────────────
  const handleFinalSubmit = async (): Promise<void> => {
    setError('')

    const validation = validateAccountForm(accountForm)
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }

    setSending(true)
    try {
      const result = await createAccount.mutateAsync({
        orgForm,
        accountForm,
        csfFile,
      })

      if (result.requiresLogin) {
        setWizardStep('thanks')
        scrollTop()
      } else {
        // Auto-login completado → directo al dashboard con UI restringida (soft-lock)
        nav('/inicio')
      }
    } catch (err: unknown) {
      console.error('Institution registration error:', err)
      const errorMsg = err instanceof Error ? err.message : 'No pudimos registrar tu institución. Intenta de nuevo.'
      setError(errorMsg)
      addToast(errorMsg, 'error')
    } finally {
      setSending(false)
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* ── Progress bar ── */}
      {wizardStep !== 'thanks' && (
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
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {Icons.shieldAlert({ s: 16 })} {error}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 1: NOMBRE DE LA ORGANIZACIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'org_name' && (
        <form onSubmit={handleOrgNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              ¿Cómo se llama tu institución?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Ingresa el nombre público de tu organización o fundación.
            </p>
          </div>
          <div>
            <input
              type="text"
              className="auth-input"
              required
              placeholder="Ej. Fundación Inclusión México"
              value={orgForm.nombre}
              onChange={(e) => setOrgForm({ ...orgForm, nombre: e.target.value })}
            />
          </div>
          <WizardNavButtons onBack={onBackToRoles} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 2: CORREO ELECTRÓNICO
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'account_email' && (
        <form onSubmit={handleAccountEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Crea tu cuenta institucional
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Ingresa el correo electrónico para acceder a tu panel.
            </p>
          </div>
          <div>
            <input
              type="email"
              className="auth-input"
              required
              placeholder="contacto@institucion.org"
              value={accountForm.email}
              onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <WizardNavButtons onBack={() => { setWizardStep('org_name'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 3: CONTRASEÑA
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'account_password' && (
        <form onSubmit={handleAccountPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Contraseña segura
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Crea una contraseña segura para proteger la información de tu institución.
            </p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>Contraseña segura <span style={{ color: '#ef4444' }}>*</span></label>
            <PasswordField
              value={accountForm.password}
              onChange={(v) => setAccountForm(prev => ({ ...prev, password: v }))}
              showPass={showPass}
              onToggleShow={() => setShowPass(!showPass)}
              strength={getPasswordStrength(accountForm.password)}
            />
          </div>
          <WizardNavButtons onBack={() => { setWizardStep('account_email'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 4: UBICACIÓN
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'account_location' && (
        <form onSubmit={handleLocationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              ¿Dónde se encuentran?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Esta información permite conectarte con personas en tu área.
            </p>
          </div>
          <LocationInputs
            country={accountForm.country}
            postalCode={accountForm.postalCode}
            state={accountForm.state}
            city={accountForm.city}
            onCountryChange={(p) => setAccountForm(prev => ({ ...prev, country: p }))}
            onPostalCodeChange={(cp) => setAccountForm(prev => ({ ...prev, postalCode: cp }))}
            onStateChange={(st) => setAccountForm(prev => ({ ...prev, state: st }))}
            onCityChange={(c) => setAccountForm(prev => ({ ...prev, city: c }))}
          />
          <WizardNavButtons
            onBack={() => { setWizardStep('account_password'); scrollTop() }}
            submitLabel="Continuar"
          />
        </form>
      )}

      {/* ═══════════════════════════════════════════════════════════
           STEP 5: CSF (último paso)
           ═══════════════════════════════════════════════════════════ */}
      {wizardStep === 'csf' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Constancia de Situación Fiscal (CSF)
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Sube tu CSF; se adjuntará a tu registro y será revisada durante la verificación de tu institución.
            </p>
          </div>
          <input
            ref={csfInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) setCsfFile(file)
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => csfInputRef.current?.click()}
              style={{
                padding: '10px 16px', borderRadius: 10,
                border: '1px solid var(--border-color)', background: 'var(--bg-warm)',
                color: 'var(--fg1)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {Icons.upload({ s: 14 })} {csfFile ? 'Cambiar archivo' : 'Seleccionar CSF'}
            </button>
            {csfFile && (
              <span style={{ fontSize: 13, color: 'var(--fg2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {csfFile.name}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="auth-btn-secondary" type="button" onClick={() => { setWizardStep('account_password'); scrollTop() }} style={{ flex: 1 }} disabled={sending}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button
              className="auth-btn-primary"
              type="button"
              onClick={handleFinalSubmit}
              style={{ flex: 2 }}
              disabled={sending}
            >
              {sending ? 'Creando cuenta...' : 'Finalizar registro'} {Icons.check({ s: 18 })}
            </button>
          </div>
        </div>
      )}

      {/* THANKS STEP */}
      {wizardStep === 'thanks' && (
        <OrganizationThanksStep
          subtypeLabel="institución"
          icon={FluentEmoji.exito}
          onContinue={() => nav('/institution-portal')}
          continueLabel="Ir a mi panel"
          continueHref="/institution-portal"
        />
      )}
    </div>
  )
}
