import React from 'react'
import { Icons } from '@shared/components/shared'
import { WizardNavButtons, PasswordField, LocationInputs } from './WizardUI'
import { getPasswordStrength, checkPasswordCriteria } from '../lib/passwordStrength'
import { isValidCurp } from '../lib/validators'

/**
 * PASOS COMPARTIDOS DE ORGANIZACIÓN (Fase 2 · Migración TSX)
 * ==========================================================
 * Componentes reutilizables para EnterpriseRegistrationWizard e
 * InstitutionRegistrationWizard.
 */

export interface OrgFormData {
  nombre: string
  descripcion: string
  mision?: string
  especialidades?: string
  contactName?: string
  phone?: string
  website?: string
  curp?: string
}

export interface AccountFormData {
  email: string
  password: string
  country: string
  postalCode: string
  state: string
  city: string
  showPass?: boolean
}

export interface OrganizationProgressProps {
  accent: string
  title: string
  stepIndex: number
  totalSteps: number
}

export function OrganizationProgress({
  accent,
  title,
  stepIndex,
  totalSteps,
}: OrganizationProgressProps): React.JSX.Element {
  const progressPct = stepIndex >= 0 ? ((stepIndex + 1) / totalSteps) * 100 : 100

  return (
    <div style={{ marginBottom: 20, flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase' }}>
          {title}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)' }}>
          {stepIndex >= 0 ? `Paso ${stepIndex + 1} de ${totalSteps}` : 'Completado ✓'}
        </span>
      </div>
      <div style={{ height: 5, background: '#E5DCD2', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${accent} 0%, ${accent}dd 100%)`,
            borderRadius: 3,
            transition: 'width 0.4s ease',
            width: `${progressPct}%`,
          }}
        />
      </div>
    </div>
  )
}

export interface OrganizationErrorBannerProps {
  error?: string | null
}

export function OrganizationErrorBanner({ error }: OrganizationErrorBannerProps): React.JSX.Element | null {
  if (!error) return null
  return (
    <div
      style={{
        background: 'rgba(239,68,68,0.1)',
        border: '1.5px solid rgba(239,68,68,0.4)',
        color: '#ef4444',
        padding: '10px 14px',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}
    >
      {Icons.shieldAlert({ s: 16 })} {error}
    </div>
  )
}

export interface OrgSubtypeItem {
  id: string
  label: string
  desc: string
  icon: React.ReactNode
}

export interface OrganizationSubtypeStepProps {
  subtypes: OrgSubtypeItem[]
  selectedSubtype: string
  onSelectSubtype: (id: string) => void
  onBack: () => void
  onContinue: () => void
  title: string
  description: string
  accentColor: string
  variant?: 'horizontal' | 'vertical' | 'grid'
}

export function OrganizationSubtypeStep({
  subtypes,
  selectedSubtype,
  onSelectSubtype,
  onBack,
  onContinue,
  title,
  description,
  accentColor,
  variant = 'horizontal',
}: OrganizationSubtypeStepProps): React.JSX.Element {
  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onContinue()
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}
    >
      <div style={{ marginBottom: 2 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      {variant === 'horizontal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {subtypes.map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectSubtype(st.id)}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                border: `2px solid ${selectedSubtype === st.id ? accentColor : '#E5DCD2'}`,
                background: selectedSubtype === st.id ? `rgba(${hexToRgb(accentColor)}, 0.08)` : '#ffffff',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: selectedSubtype === st.id ? `rgba(${hexToRgb(accentColor)}, 0.12)` : 'var(--bg-cool)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {st.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: selectedSubtype === st.id ? '#073B4C' : 'var(--fg1)' }}>
                  {st.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{st.desc}</div>
              </div>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: `2px solid ${selectedSubtype === st.id ? accentColor : '#9ca3af'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {selectedSubtype === st.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor }} />}
              </div>
            </button>
          ))}
        </div>
      )}

      {variant === 'vertical' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {subtypes.map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectSubtype(st.id)}
              style={{
                padding: '16px 14px',
                borderRadius: 12,
                border: `2px solid ${selectedSubtype === st.id ? accentColor : '#E5DCD2'}`,
                background: selectedSubtype === st.id ? `rgba(${hexToRgb(accentColor)}, 0.08)` : '#ffffff',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: 24 }}>{st.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: selectedSubtype === st.id ? '#073B4C' : 'var(--fg1)' }}>
                {st.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.3 }}>{st.desc}</div>
            </button>
          ))}
        </div>
      )}

      {variant === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {subtypes.map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectSubtype(st.id)}
              style={{
                padding: '16px 14px',
                borderRadius: 12,
                border: `2px solid ${selectedSubtype === st.id ? accentColor : '#E5DCD2'}`,
                background: selectedSubtype === st.id ? `rgba(${hexToRgb(accentColor)}, 0.08)` : '#ffffff',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: 24 }}>{st.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: selectedSubtype === st.id ? '#073B4C' : 'var(--fg1)' }}>
                {st.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg3)', lineHeight: 1.3 }}>{st.desc}</div>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button className="auth-btn-secondary" type="button" onClick={onBack} style={{ flex: 1 }}>
          {Icons.arrowLeft({ s: 16 })} Volver
        </button>
        <button className="auth-btn-primary" type="submit" style={{ flex: 2 }}>
          Continuar {Icons.arrowRight({ s: 18 })}
        </button>
      </div>
    </form>
  )
}

export interface OrganizationInfoStepProps {
  orgForm: OrgFormData
  onOrgChange: (field: string, value: string) => void
  onBack: () => void
  onContinue: () => void
  title: string
  description: string
  institutionFields?: boolean
  showEspecialidades?: boolean
  placeholderNombre?: string
  placeholderDescripcion?: string
}

export function OrganizationInfoStep({
  orgForm,
  onOrgChange,
  onBack,
  onContinue,
  title,
  description,
  institutionFields = false,
  showEspecialidades = false,
  placeholderNombre,
  placeholderDescripcion,
}: OrganizationInfoStepProps): React.JSX.Element {
  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onContinue()
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}
    >
      <div style={{ marginBottom: 2 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
          Nombre <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          className="auth-input"
          required
          placeholder={placeholderNombre || 'Ej. Nombre de la organización'}
          value={orgForm.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onOrgChange('nombre', e.target.value)}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
          ¿Qué hacen? <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea
          className="auth-input"
          rows={3}
          required
          placeholder={placeholderDescripcion || 'Describe brevemente tus servicios o especialidades...'}
          value={orgForm.descripcion}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onOrgChange('descripcion', e.target.value)}
          style={{ resize: 'vertical', minHeight: 70 }}
        />
      </div>

      {showEspecialidades && (
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
            Especialidades
          </label>
          <input
            type="text"
            className="auth-input"
            placeholder="Ej. Terapia de lenguaje, Psicología infantil"
            value={orgForm.especialidades || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onOrgChange('especialidades', e.target.value)}
          />
        </div>
      )}

      {institutionFields && (
        <>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              ¿Cuál es su misión? (opcional)
            </label>
            <textarea
              className="auth-input"
              rows={2}
              placeholder="¿Cuál es su misión o propósito principal?"
              value={orgForm.mision || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onOrgChange('mision', e.target.value)}
              style={{ resize: 'vertical', minHeight: 50 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
              CURP del representante legal <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="auth-input"
              required
              placeholder="18 caracteres alfanuméricos"
              value={orgForm.curp || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onOrgChange('curp', e.target.value.toUpperCase())}
              maxLength={18}
              style={{ textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}
            />
            <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 4 }}>
              La CURP del representante legal es necesaria para verificar tu institución.
            </div>
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
            Persona de contacto
          </label>
          <input
            type="text"
            className="auth-input"
            placeholder="Nombre del contacto"
            value={orgForm.contactName || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onOrgChange('contactName', e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
            Teléfono
          </label>
          <input
            type="tel"
            className="auth-input"
            placeholder="Ej. 33 1234 5678"
            value={orgForm.phone || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onOrgChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
          Sitio web (opcional)
        </label>
        <input
          type="url"
          className="auth-input"
          placeholder="https://ejemplo.org"
          value={orgForm.website || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onOrgChange('website', e.target.value)}
        />
      </div>

      <WizardNavButtons onBack={onBack} submitLabel="Continuar a servicios" />
    </form>
  )
}

export interface ServiceCategory {
  title: string
  color: string
  items: string[]
}

export interface OrganizationServicesStepProps {
  serviceCategories: ServiceCategory[]
  selectedServices: string[]
  onToggleService: (item: string) => void
  onBack: () => void
  onContinue: () => void
  title: string
  description: string
}

export function OrganizationServicesStep({
  serviceCategories,
  selectedServices,
  onToggleService,
  onBack,
  onContinue,
  title,
  description,
}: OrganizationServicesStepProps): React.JSX.Element {
  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onContinue()
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}
    >
      <div style={{ marginBottom: 2 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      {serviceCategories.map(cat => (
        <div key={cat.title}>
          <h3
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: cat.color,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0 0 8px',
            }}
          >
            {cat.title}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cat.items.map(item => {
              const isSel = selectedServices.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onToggleService(item)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${isSel ? cat.color : '#E5DCD2'}`,
                    background: isSel ? `${cat.color}15` : '#ffffff',
                    color: isSel ? '#073B4C' : 'var(--fg1)',
                    fontWeight: isSel ? 700 : 500,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <WizardNavButtons onBack={onBack} submitLabel="Continuar a comunidad" />
    </form>
  )
}

export interface OrgCommunityItem {
  id: string
  label: string
  desc: string
  icon: React.ReactNode
}

export interface OrganizationCommunityStepProps {
  communities: OrgCommunityItem[]
  selectedCommunity: string
  onSelectCommunity: (id: string) => void
  onBack: () => void
  onContinue: () => void
  title: string
  description: string
  accentColor: string
}

export function OrganizationCommunityStep({
  communities,
  selectedCommunity,
  onSelectCommunity,
  onBack,
  onContinue,
  title,
  description,
  accentColor,
}: OrganizationCommunityStepProps): React.JSX.Element {
  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onContinue()
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}
    >
      <div style={{ marginBottom: 2 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#073B4C', margin: '0 0 4px' }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {communities.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectCommunity(c.id)}
            style={{
              padding: '16px 18px',
              borderRadius: 12,
              border: `2px solid ${selectedCommunity === c.id ? accentColor : '#E5DCD2'}`,
              background: selectedCommunity === c.id ? `rgba(${hexToRgb(accentColor)}, 0.08)` : '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                fontSize: 28,
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: selectedCommunity === c.id ? `rgba(${hexToRgb(accentColor)}, 0.12)` : 'var(--bg-cool)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {c.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: selectedCommunity === c.id ? '#073B4C' : 'var(--fg1)' }}>
                {c.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{c.desc}</div>
            </div>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid ${selectedCommunity === c.id ? accentColor : '#9ca3af'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {selectedCommunity === c.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor }} />}
            </div>
          </button>
        ))}
      </div>

      <WizardNavButtons onBack={onBack} submitLabel="Continuar a cuenta" />
    </form>
  )
}

export interface OrganizationAccountStepProps {
  accountForm: AccountFormData
  onAccountChange: (field: string, value: string | boolean) => void
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
  onCountryChange?: (country: string) => void
  onBack: () => void
  onSubmit: () => void
  sending?: boolean
  submitLabel?: string
  showCitySelect?: boolean
}

export function OrganizationAccountStep({
  accountForm,
  onAccountChange,
  onStateChange,
  onCityChange,
  onCountryChange,
  onBack,
  onSubmit,
  sending = false,
  submitLabel,
  showCitySelect = true,
}: OrganizationAccountStepProps): React.JSX.Element {
  const passStrength = getPasswordStrength(accountForm.password)

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSubmit()
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}
    >
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAccountChange('email', e.target.value)}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
          Contraseña segura <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <PasswordField
          value={accountForm.password}
          onChange={v => onAccountChange('password', v)}
          showPass={Boolean(accountForm.showPass)}
          onToggleShow={() => onAccountChange('showPass', !accountForm.showPass)}
          strength={passStrength}
        />
      </div>

      {showCitySelect && (
        <LocationInputs
          country={accountForm.country}
          postalCode={accountForm.postalCode}
          state={accountForm.state}
          city={accountForm.city}
          onCountryChange={c => (onCountryChange ? onCountryChange(c) : onAccountChange('country', c))}
          onPostalCodeChange={cp => onAccountChange('postalCode', cp)}
          onStateChange={st => onStateChange(st)}
          onCityChange={c => onCityChange(c)}
        />
      )}

      <WizardNavButtons
        onBack={onBack}
        submitLabel={sending ? 'Creando cuenta...' : submitLabel || 'Finalizar registro'}
        submitDisabled={sending}
      />
    </form>
  )
}

export interface OrganizationThanksStepProps {
  subtypeLabel: string
  icon?: React.ReactNode
  onContinue: () => void
  continueLabel?: string
  continueHref?: string
}

export function OrganizationThanksStep({
  subtypeLabel,
  icon = '🎉',
  onContinue,
  continueLabel = 'Ir a mi panel',
}: OrganizationThanksStepProps): React.JSX.Element {
  return (
    <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 48 }}>{icon}</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#073B4C', margin: 0 }}>
        ¡Bienvenido/a, {subtypeLabel}!
      </h2>
      <p style={{ fontSize: 14, color: 'var(--fg2)', maxWidth: 380, lineHeight: 1.5 }}>
        Tu cuenta está lista. Ya puedes acceder a tu panel y conectar con la comunidad de Raíces.
      </p>
      <button className="auth-btn-primary" onClick={onContinue} style={{ marginTop: 16 }}>
        {continueLabel} {Icons.arrowRight({ s: 18 })}
      </button>
    </div>
  )
}

export interface ValidateOrgRequirements {
  requireCurp?: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validador de campos de organización (usado en handleOrgSubmit)
 */
export function validateOrgForm(
  orgForm: Partial<OrgFormData>,
  requirements: ValidateOrgRequirements = {}
): ValidationResult {
  const errors: string[] = []

  if (!orgForm.nombre?.trim()) {
    errors.push('Ingresa el nombre de la organización.')
  }

  if (!orgForm.descripcion?.trim()) {
    errors.push('Ingresa una descripción de los servicios o programas.')
  }

  if (requirements.requireCurp && !orgForm.curp?.trim()) {
    errors.push('Ingresa la CURP del representante legal.')
  }

  if (requirements.requireCurp && orgForm.curp?.trim() && !isValidCurp(orgForm.curp.trim().toUpperCase())) {
    errors.push('La CURP del representante legal no es válida. Debe tener 18 caracteres alfanuméricos.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validador de campos de cuenta (usado en handleFinalSubmit)
 */
export function validateAccountForm(accountForm: Partial<AccountFormData>): ValidationResult {
  const errors: string[] = []

  if (!accountForm.email?.trim()) {
    errors.push('Ingresa tu correo electrónico.')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email)) {
    errors.push('Ingresa un correo electrónico válido.')
  }

  if (!accountForm.password) {
    errors.push('Ingresa una contraseña.')
  } else {
    const { isValid, missing } = checkPasswordCriteria(accountForm.password)
    if (!isValid) {
      errors.push(`Tu contraseña debe cumplir con todos los requisitos. Te hace falta: ${missing.map(m => m.missingText).join(', ')}.`)
    }
  }

  if (!accountForm.country) {
    errors.push('Ingresa tu país.')
  }

  if (!accountForm.state) {
    errors.push('Ingresa tu estado, región o provincia.')
  }

  if (!accountForm.city) {
    errors.push('Ingresa tu ciudad.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Helpers
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '34, 155, 88'
}
