import React from 'react'
import { Icons } from '@shared/components/shared'
import { STATES, getMunicipalities } from '@shared/lib/mexicoLocations'
import PasswordRequirements from './PasswordRequirements'

/**
 * PRIMITIVAS UI COMPARTIDAS DE LOS WIZARDS DE REGISTRO (Fase 2 · Migración TSX)
 * ============================================================================
 */

// ── Botones de navegación (Volver / Enviar) ───────────────────────
export interface WizardNavButtonsProps {
  onBack?: (event: React.MouseEvent<HTMLButtonElement>) => void
  submitLabel: React.ReactNode
  submitDisabled?: boolean
  submitIcon?: React.ReactNode
}

export function WizardNavButtons({
  onBack,
  submitLabel,
  submitDisabled = false,
  submitIcon,
}: WizardNavButtonsProps): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 14, flexShrink: 0 }}>
      <button className="auth-btn-secondary" type="button" onClick={onBack} style={{ flex: 1 }}>
        {Icons.arrowLeft({ s: 16 })} Volver
      </button>
      <button className="auth-btn-primary" type="submit" disabled={submitDisabled} style={{ flex: 2 }}>
        {submitLabel} {submitIcon || Icons.arrowRight({ s: 18 })}
      </button>
    </div>
  )
}

// ── Tarjeta de escala (una opción por nivel) ──────────────────────
export interface ScaleOption {
  value: number | string
  label: string
}

export interface ScaleCardProps {
  title: string
  desc: string
  options: ScaleOption[]
  value: number | string | null
  onChange: (value: number | string) => void
}

export function ScaleCard({
  title,
  desc,
  options,
  value,
  onChange,
}: ScaleCardProps): React.JSX.Element {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 12, padding: 14 }}>
      <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 3px' }}>{title}</h3>
      <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 10px', lineHeight: 1.4 }}>{desc}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map(opt => {
          const isSelected = value === opt.value
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 8,
                border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                background: isSelected ? 'var(--primary-subtle)' : 'transparent',
                fontWeight: isSelected ? 700 : 500,
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
                color: isSelected ? 'var(--primary)' : 'var(--fg1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{opt.label}</span>
              {isSelected && (
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 13, flexShrink: 0, marginLeft: 6 }}>
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Chip de selección múltiple ────────────────────────────────────
export interface CheckChipProps {
  label: string
  selected: boolean
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void
  accent?: string
}

export function CheckChip({
  label,
  selected,
  onToggle,
  accent = '#229B58',
}: CheckChipProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        padding: '9px 12px',
        borderRadius: 8,
        border: `1.5px solid ${selected ? accent : 'var(--border-color)'}`,
        background: selected ? `color-mix(in oklch, ${accent} 15%, transparent)` : 'var(--bg-surface)',
        color: selected ? 'var(--fg1)' : 'var(--fg1)',
        fontWeight: selected ? 700 : 500,
        fontSize: 12.5,
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        fontFamily: 'var(--font-body)',
        transition: 'all 0.15s ease',
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1.5px solid ${selected ? accent : 'var(--border-color)'}`,
          background: selected ? accent : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        {selected && Icons.check({ s: 10 })}
      </div>
      <span>{label}</span>
    </button>
  )
}

// ── Barra de progreso del wizard ──────────────────────────────────
export interface WizardProgressProps {
  accent: string
  title: string
  stepIndex: number
  totalSteps: number
  gradientTo?: string
}

export function WizardProgress({
  accent,
  title,
  stepIndex,
  totalSteps,
  gradientTo = '#073B4C',
}: WizardProgressProps): React.JSX.Element {
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
            background: `linear-gradient(90deg, ${accent} 0%, ${gradientTo} 100%)`,
            borderRadius: 3,
            transition: 'width 0.4s ease',
            width: `${progressPct}%`,
          }}
        />
      </div>
    </div>
  )
}

// ── Banner de error estándar ──────────────────────────────────────
export interface WizardErrorBannerProps {
  error?: string | null
}

export function WizardErrorBanner({ error }: WizardErrorBannerProps): React.JSX.Element | null {
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

// ── Campo de contraseña (input + toggle + medidor + requisitos) ───
export interface PasswordStrengthInfo {
  width: string
  color: string
  label: string
}

export interface PasswordFieldProps {
  value: string
  onChange: (value: string) => void
  showPass: boolean
  onToggleShow: () => void
  strength: PasswordStrengthInfo
}

export function PasswordField({
  value,
  onChange,
  showPass,
  onToggleShow,
  strength,
}: PasswordFieldProps): React.JSX.Element {
  return (
    <>
      <div style={{ position: 'relative' }}>
        <input
          type={showPass ? 'text' : 'password'}
          className="auth-input"
          required
          placeholder="Mínimo 8 caracteres"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          style={{ paddingRight: 48 }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="auth-pass-toggle"
          aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={showPass}
        >
          {showPass ? Icons.eyeOff({ s: 20 }) : Icons.eye({ s: 20 })}
        </button>
      </div>
      {value && (
        <div style={{ marginTop: 5 }}>
          <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
          </div>
          <PasswordRequirements password={value} />
        </div>
      )}
    </>
  )
}

// ── Selects Estado / Municipio con dependencia ────────────────────
export interface StateCitySelectsProps {
  state: string
  city: string
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
}

export function StateCitySelects({
  state,
  city,
  onStateChange,
  onCityChange,
}: StateCitySelectsProps): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
          Estado <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          className="auth-input auth-select"
          required
          value={state}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onStateChange(e.target.value)}
        >
          <option value="" disabled>Selecciona un estado</option>
          {STATES.map(st => <option key={st} value={st}>{st}</option>)}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
          Municipio <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          className="auth-input auth-select"
          required
          disabled={!state}
          value={city}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCityChange(e.target.value)}
        >
          <option value="" disabled>{state ? 'Selecciona un municipio' : 'Primero elige un estado'}</option>
          {state && getMunicipalities(state).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  )
}
