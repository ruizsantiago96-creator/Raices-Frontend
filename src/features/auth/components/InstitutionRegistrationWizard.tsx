import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '@shared/stores/uiStore'
import api from '@shared/lib/api'
import { Icons, CATEGORY_COLORS } from '@shared/components/shared'
import { INSTITUTION_SUBTYPES, SERVICE_CATEGORIES, INSTITUTION_CATEGORIES, COMMUNITIES } from '../constants/institutionCatalogos'
import { WizardNavButtons, StateCitySelects } from './WizardUI'
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

export type InstitutionWizardStep = 'subtype' | 'org' | 'category' | 'services' | 'community' | 'account' | 'thanks'

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function InstitutionRegistrationWizard({
  onBackToRoles = () => {},
}: InstitutionRegistrationWizardProps): React.JSX.Element {
  const { addToast } = useUiStore()
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
  const [showPass, setShowPass] = useState<boolean>(false)

  // Step 1: Subtipo institucional
  const [subtipo, setSubtipo] = useState<string>('')

  // Step 2: Categoría principal
  const [categoria, setCategoria] = useState<string>('')

  // Step 2: Info de la organización
  const [orgForm, setOrgForm] = useState<OrgFormData>({
    nombre: '',
    descripcion: '',
    mision: '',
    contactName: '',
    phone: '',
    website: '',
    curp: '',
  })

  // Step 4: Servicios que ofrece
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Step 5: Comunidad a conectar
  const [selectedCommunity, setSelectedCommunity] = useState<string>('')

  // Step 6: Cuenta y ubicación
  const [accountForm, setAccountForm] = useState<AccountFormData>({
    email: '',
    password: '',
    state: '',
    city: '',
  })

  const scrollTop = (): void => {
    const col = document.querySelector('.auth-form-column')
    if (col) col.scrollTop = 0
  }

  const TOTAL_STEPS = 6
  const stepIndex = (['subtype', 'org', 'category', 'services', 'community', 'account'] as const).indexOf(
    wizardStep as 'subtype' | 'org' | 'category' | 'services' | 'community' | 'account'
  )

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
    setWizardStep('org')
    scrollTop()
  }

  const handleOrgSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    const validation = validateOrgForm(orgForm, { requireCurp: true })
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }
    setWizardStep('category')
    scrollTop()
  }

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setError('')
    if (!categoria) {
      setError('Selecciona la categoría principal de tu institución.')
      return
    }
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
    setWizardStep('account')
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
          onContinue={() => { handleSubtypeSubmit(); setWizardStep('org'); scrollTop() }}
          title="¿Qué tipo de institución representas?"
          description="Esto nos ayuda a personalizar tu experiencia en Raíces."
          accentColor="#2F80ED"
          variant="vertical"
        />
      )}

      {/* STEP 2: INFO DE LA ORGANIZACIÓN */}
      {wizardStep === 'org' && (
        <OrganizationInfoStep
          orgForm={orgForm}
          onOrgChange={(field, value) => setOrgForm(prev => ({ ...prev, [field]: value }))}
          onBack={() => { setWizardStep('subtype'); scrollTop() }}
          onContinue={() => { handleOrgSubmit(); setWizardStep('category'); scrollTop() }}
          title="Cuéntanos sobre tu institución"
          description="Esta información ayuda a la comunidad a conocerte mejor."
          institutionFields={true}
          placeholderNombre="Ej. Fundación Inclusión México"
          placeholderDescripcion="Describe brevemente los servicios o programas que ofrecen"
        />
      )}

      {/* STEP 3: CATEGORÍA PRINCIPAL */}
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

          <WizardNavButtons onBack={() => { setWizardStep('org'); scrollTop() }} submitLabel="Continuar a servicios" />
        </form>
      )}

      {/* STEP 4: SERVICIOS QUE OFRECE */}
      {wizardStep === 'services' && (
        <OrganizationServicesStep
          serviceCategories={SERVICE_CATEGORIES}
          selectedServices={selectedServices}
          onToggleService={toggleService}
          onBack={() => { setWizardStep('category'); scrollTop() }}
          onContinue={() => { handleServicesSubmit(); setWizardStep('community'); scrollTop() }}
          title="¿Cómo ayudas a la comunidad?"
          description="Selecciona las áreas en las que tu institución ofrece apoyo. Esto conecta directamente a las personas que buscan lo que tú ofreces."
        />
      )}

      {/* STEP 5: COMUNIDAD A CONECTAR */}
      {wizardStep === 'community' && (
        <OrganizationCommunityStep
          communities={COMMUNITIES}
          selectedCommunity={selectedCommunity}
          onSelectCommunity={setSelectedCommunity}
          onBack={() => { setWizardStep('services'); scrollTop() }}
          onContinue={() => { handleCommunitySubmit(); setWizardStep('account'); scrollTop() }}
          title="¿Con quién quieres conectar?"
          description="La comunidad de Raíces se beneficia cuando las instituciones se conectan con quienes más necesitan apoyo."
          accentColor="#2F80ED"
        />
      )}

      {/* STEP 6: CUENTA Y UBICACIÓN */}
      {wizardStep === 'account' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Crea tu cuenta institucional
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Estos datos son para acceder a tu panel institucional.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Correo electrónico institucional <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              className="auth-input"
              required
              placeholder="contacto@institucion.org"
              value={accountForm.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Contraseña segura <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              className="auth-input"
              required
              placeholder="Mínimo 8 caracteres"
              value={accountForm.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountForm(prev => ({ ...prev, password: e.target.value }))}
              style={{ paddingRight: 48 }}
            />
          </div>

          <StateCitySelects
            state={accountForm.state}
            city={accountForm.city}
            onStateChange={(st: string) => setAccountForm(prev => ({ ...prev, state: st, city: '' }))}
            onCityChange={(c: string) => setAccountForm(prev => ({ ...prev, city: c }))}
          />

          <WizardNavButtons
            onBack={() => { setWizardStep('community'); scrollTop() }}
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
