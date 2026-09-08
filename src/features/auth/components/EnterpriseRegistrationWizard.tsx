import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '@shared/stores/uiStore'
import api from '@shared/lib/api'
import { Icons } from '@shared/components/shared'
import { ENTERPRISE_SUBTYPES, ECOSYSTEM_SERVICES, COMMUNITIES } from '../constants/enterpriseCatalogos'
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
import { useCreateAccount, payloadBuilders, type EnterpriseFormData } from '../hooks/useCreateAccount'

export interface EnterpriseRegistrationWizardProps {
  onBackToRoles?: () => void
}

export type EnterpriseWizardStep = 'subtype' | 'org' | 'services' | 'community' | 'account' | 'thanks'

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function EnterpriseRegistrationWizard({
  onBackToRoles = () => {},
}: EnterpriseRegistrationWizardProps): React.JSX.Element {
  const { addToast } = useUiStore()
  const nav = useNavigate()
  const createAccount = useCreateAccount<EnterpriseFormData>({
    role: 'empresa',
    buildPayload: (formData: EnterpriseFormData) => payloadBuilders.empresa(formData),
    postSteps: [
      {
        name: 'perfil-ecosistema',
        optional: true,
        execute: async () => {
          await api.put('/usuarios/perfil', {
            perfilEcosistema: {
              tipoEcosistema: subtipo,
              nombreOrganizacion: orgForm.nombre,
              descripcion: orgForm.descripcion,
              especialidades: orgForm.especialidades,
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

  const [wizardStep, setWizardStep] = useState<EnterpriseWizardStep>('subtype')
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // Step 1: Subtipo
  const [subtipo, setSubtipo] = useState<string>('')

  // Step 2: Info de la organización
  const [orgForm, setOrgForm] = useState<OrgFormData>({
    nombre: '',
    descripcion: '',
    especialidades: '',
    contactName: '',
    phone: '',
    website: '',
  })

  // Step 3: Servicios
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Step 4: Comunidad a conectar
  const [selectedCommunity, setSelectedCommunity] = useState<string>('')

  // Step 5: Cuenta y ubicación
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

  const TOTAL_STEPS = 5
  const stepIndex = (['subtype', 'org', 'services', 'community', 'account'] as const).indexOf(
    wizardStep as 'subtype' | 'org' | 'services' | 'community' | 'account'
  )

  const toggleService = (item: string): void => {
    setSelectedServices(prev => (prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]))
  }

  // ── Navigation handlers ─────────────────────────────────────────
  const handleSubtypeSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (!subtipo) {
      setError('Selecciona el tipo de organización.')
      return
    }
    setWizardStep('org')
    scrollTop()
  }

  const handleOrgSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    const validation = validateOrgForm(orgForm)
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }
    setWizardStep('services')
    scrollTop()
  }

  const handleServicesSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault()
    setError('')
    if (selectedServices.length === 0) {
      setError('Selecciona al menos un servicio.')
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
        subtipo,
        selectedServices,
        selectedCommunity,
      })

      if (result.requiresLogin) {
        setWizardStep('thanks')
        scrollTop()
      }
    } catch (err: unknown) {
      console.error('Enterprise registration error:', err)
      const errorMsg = err instanceof Error ? err.message : 'No pudimos crear tu cuenta. Intenta de nuevo.'
      setError(errorMsg)
    } finally {
      setSending(false)
    }
  }

  const selectedLabel = ENTERPRISE_SUBTYPES.find(s => s.id === subtipo)?.label || ''

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* ── Progress bar ── */}
      {wizardStep !== 'thanks' && (
        <OrganizationProgress accent="#D4944C" title="Registro Ecosistema" stepIndex={stepIndex} totalSteps={TOTAL_STEPS} />
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {Icons.shieldAlert({ s: 16 })} {error}
        </div>
      )}

      {/* STEP 1: TIPO DE ORGANIZACIÓN */}
      {wizardStep === 'subtype' && (
        <OrganizationSubtypeStep
          subtypes={ENTERPRISE_SUBTYPES}
          selectedSubtype={subtipo}
          onSelectSubtype={setSubtipo}
          onBack={onBackToRoles}
          onContinue={() => { handleSubtypeSubmit(); setWizardStep('org'); scrollTop() }}
          title="¿Qué tipo de organización representas?"
          description="Conecta tu experiencia con las personas que más la necesitan."
          accentColor="#D4944C"
          variant="horizontal"
        />
      )}

      {/* STEP 2: INFO DE LA ORGANIZACIÓN */}
      {wizardStep === 'org' && (
        <OrganizationInfoStep
          orgForm={orgForm}
          onOrgChange={(field, value) => setOrgForm(prev => ({ ...prev, [field]: value }))}
          onBack={() => { setWizardStep('subtype'); scrollTop() }}
          onContinue={() => { handleOrgSubmit(); setWizardStep('services'); scrollTop() }}
          title={`Cuéntanos sobre tu ${selectedLabel.toLowerCase()}`}
          description="Esta información ayuda a la comunidad a conocerte."
          showEspecialidades={true}
          placeholderNombre={subtipo === 'especialista' ? 'Ej. Dra. María López' : 'Ej. Centro Terapéutico Raíces'}
          placeholderDescripcion="Describe brevemente tus servicios o especialidades..."
        />
      )}

      {/* STEP 3: SERVICIOS */}
      {wizardStep === 'services' && (
        <OrganizationServicesStep
          serviceCategories={ECOSYSTEM_SERVICES}
          selectedServices={selectedServices}
          onToggleService={toggleService}
          onBack={() => { setWizardStep('org'); scrollTop() }}
          onContinue={() => { handleServicesSubmit(); setWizardStep('community'); scrollTop() }}
          title="¿Qué servicios ofreces?"
          description="Selecciona las áreas en las que puedes apoyar. La IA conectará a las personas según lo que necesiten."
        />
      )}

      {/* STEP 4: COMUNIDAD A CONECTAR */}
      {wizardStep === 'community' && (
        <OrganizationCommunityStep
          communities={COMMUNITIES}
          selectedCommunity={selectedCommunity}
          onSelectCommunity={setSelectedCommunity}
          onBack={() => { setWizardStep('services'); scrollTop() }}
          onContinue={() => { handleCommunitySubmit(); setWizardStep('account'); scrollTop() }}
          title="¿Con quién quieres conectar?"
          description="Conecta tu experiencia con quienes más la necesitan."
          accentColor="#D4944C"
        />
      )}

      {/* STEP 5: CUENTA Y UBICACIÓN */}
      {wizardStep === 'account' && (
        <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ marginBottom: 2 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
              Crea tu cuenta
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
              Estos datos son para acceder a tu panel.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Correo electrónico <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              className="auth-input"
              required
              placeholder="contacto@organizacion.com"
              value={accountForm.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              Contraseña segura <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type={accountForm.showPass ? 'text' : 'password'}
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
          subtypeLabel={selectedLabel}
          icon="🚀"
          onContinue={() => nav('/dashboard')}
          continueLabel="Ir a mi panel"
          continueHref="/dashboard"
        />
      )}
    </div>
  )
}
