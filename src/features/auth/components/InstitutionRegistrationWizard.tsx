import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@shared/lib/api'
import { Icons, CATEGORY_COLORS } from '@shared/components/shared'
import { INSTITUTION_SUBTYPES, SERVICE_CATEGORIES, INSTITUTION_CATEGORIES, COMMUNITIES } from '../constants/institutionCatalogos'
import { WizardNavButtons, LocationInputs } from './WizardUI'
import {
  OrganizationProgress,
  OrganizationSubtypeStep,
  OrganizationInfoStep,
  OrganizationServicesStep,
  OrganizationCommunityStep,
  OrganizationThanksStep,
  validateOrgForm,
  validateAccountForm,
  type OrgFormData,
  type AccountFormData,
} from './OrganizationFormSteps'
import { useCreateAccount, payloadBuilders, type InstitutionFormData } from '../hooks/useCreateAccount'

export interface InstitutionRegistrationWizardProps {
  onBackToRoles?: () => void
}

export type InstitutionWizardStep =
  | 'org_name'
  | 'account_email'
  | 'account_password'
  | 'account_location'

const STEP_ORDER: InstitutionWizardStep[] = [
  'org_name',
  'account_email',
  'account_password',
  'account_location',
]

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function InstitutionRegistrationWizard({
  onBackToRoles = () => {},
}: InstitutionRegistrationWizardProps): React.JSX.Element {
  const nav = useNavigate()

  const createAccount = useCreateAccount<InstitutionFormData>({
    role: 'institution',
    buildPayload: (formData: InstitutionFormData) => payloadBuilders.institution(formData),
    postSteps: [
      {
        name: 'perfil-institucional',
        optional: true,
        execute: async () => {
          await api.put('/usuarios/perfil', {
            perfilInstitucional: {
              tipoInstitucion: subtipo,
              categoria,
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
        },
      },
    ],
  })

  const [wizardStep, setWizardStep] = useState<InstitutionWizardStep>('subtype')
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // Step 1: Subtipo institucional
  const [subtipo, setSubtipo] = useState<string>('')

  // Step 2: Categoría principal
  const [categoria, setCategoria] = useState<string>('')

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

  // Servicios
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Comunidad a conectar
  const [selectedCommunity, setSelectedCommunity] = useState<string>('')

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

  const TOTAL_STEPS = 12
  const stepIndex = STEP_ORDER.indexOf(wizardStep)

  // ── Toggle service ──────────────────────────────────────────────
  const toggleService = (item: string): void => {
    setSelectedServices(prev => (prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]))
  }

  // ── Navigation handlers ─────────────────────────────────────────
  const handleSubtypeSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (!subtipo) {
      setError('Selecciona el tipo de institución.')
      return
    }
    setWizardStep('category')
    scrollTop()
  }

  const handleCategorySubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (!categoria) {
      setError('Selecciona la categoría principal de tu institución.')
      return
    }
    setWizardStep('org_name')
    scrollTop()
  }

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

  const handleOrgDescSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (!orgForm.descripcion.trim()) {
      setError('La descripción es obligatoria.')
      return
    }
    setWizardStep('org_mision')
    scrollTop()
  }

  const handleOrgMisionSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    setWizardStep('org_contact')
    scrollTop()
  }

  const handleOrgContactSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    setWizardStep('org_website')
    scrollTop()
  }

  const handleOrgWebsiteSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    setWizardStep('services')
    scrollTop()
  }

  const handleServicesSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (selectedServices.length === 0) {
      setError('Selecciona al menos un servicio o área de apoyo.')
      return
    }
    setWizardStep('community')
    scrollTop()
  }

  const handleCommunitySubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (!selectedCommunity) {
      setError('Selecciona la comunidad con la que quieres conectar.')
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

  // ── Final submit ────────────────────────────────────────────────
  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
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
        categoria,
        subtipo,
        selectedServices,
        selectedCommunity,
      })

      if (result.requiresLogin) {
        setWizardStep('thanks')
        scrollTop()
      }
    } catch (err: unknown) {
      console.error('Institution registration error:', err)
      const errorMsg = err instanceof Error ? err.message : 'No pudimos registrar tu institución. Intenta de nuevo.'
      setError(errorMsg)
    } finally {
      setSending(false)
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* ── Progress bar ── */}
      {wizardStep !== 'thanks' && (
        <OrganizationProgress accent="#2F80ED" title="Registro Institucional" stepIndex={stepIndex} totalSteps={TOTAL_STEPS} />
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {Icons.shieldAlert({ s: 16 })} {error}
        </div>
      )}

      {/* STEP 1: TIPO DE INSTITUCIÓN */}
      {wizardStep === 'subtype' && (
        <OrganizationSubtypeStep
          subtypes={INSTITUTION_SUBTYPES}
          selectedSubtype={subtipo}
          onSelectSubtype={setSubtipo}
          onBack={onBackToRoles}
          onContinue={() => { handleSubtypeSubmit() }}
          title="¿Qué tipo de institución representas?"
          description="Esto nos ayuda a personalizar tu experiencia en Raíces."
          accentColor="#2F80ED"
          variant="vertical"
        />
      )}

      {/* STEP 2: CATEGORÍA PRINCIPAL */}
      {wizardStep === 'category' && (
        <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              ¿Cuál es la categoría principal de tu institución?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Ayuda a que las personas encuentren tu institución según el tipo de apoyo que buscan.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {INSTITUTION_CATEGORIES.map(cat => {
              const color = CATEGORY_COLORS[cat.id] ?? '#2F80ED'
              const active = categoria === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoria(cat.id)}
                  style={{
                    padding: '16px 14px',
                    borderRadius: 12,
                    border: `2px solid ${active ? color : '#E5DCD2'}`,
                    background: active ? `${color}1a` : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: 24 }}>{cat.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: active ? '#073B4C' : 'var(--fg1)' }}>{cat.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.3 }}>{cat.desc}</div>
                </button>
              )
            })}
          </div>

          <WizardNavButtons onBack={() => { setWizardStep('subtype'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 3: NOMBRE DE LA ORGANIZACIÓN */}
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
          <WizardNavButtons onBack={() => { setWizardStep('category'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 11: CUENTA - EMAIL */}
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
              onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
            />
          </div>
          <WizardNavButtons onBack={() => { setWizardStep('community'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 12: CUENTA - PASSWORD */}
      {wizardStep === 'account_password' && (
        <form onSubmit={handleAccountPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Contraseña segura
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Crea una contraseña segura para tu cuenta.
            </p>
          </div>
          <div>
            <input
              type="password"
              className="auth-input"
              required
              placeholder="Mínimo 8 caracteres"
              value={accountForm.password}
              onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
            />
          </div>
          <WizardNavButtons onBack={() => { setWizardStep('account_email'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}

      {/* STEP 13: UBICACIÓN */}
      {wizardStep === 'account_location' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
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
            onCountryChange={(p) => setAccountForm({ ...accountForm, country: p })}
            onPostalCodeChange={(cp) => setAccountForm({ ...accountForm, postalCode: cp })}
            onStateChange={(st) => setAccountForm({ ...accountForm, state: st })}
            onCityChange={(c) => setAccountForm({ ...accountForm, city: c })}
          />
          <WizardNavButtons
            onBack={() => { setWizardStep('account_password'); scrollTop() }}
            submitLabel={sending ? 'Creando cuenta...' : 'Finalizar registro'}
            submitDisabled={sending}
          />
        </form>
      )}

      {/* THANKS STEP */}
      {wizardStep === 'thanks' && (
        <OrganizationThanksStep
          subtypeLabel={INSTITUTION_SUBTYPES.find(s => s.id === subtipo)?.label || 'institución'}
          icon="🎉"
          onContinue={() => nav('/institution-portal')}
          continueLabel="Ir a mi panel"
          continueHref="/institution-portal"
        />
      )}
    </div>
  )
}
