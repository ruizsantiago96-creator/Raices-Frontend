import React, { useEffect, useId, useRef, useState } from 'react'
import { Icons } from '@shared/components/shared'
import { lookupPostalCode, validatePostalCodeFormat } from '@shared/lib/postalCodeLookup'
import { COUNTRIES, DEFAULT_COUNTRY } from '@shared/constants/countries'
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

// ── Inputs de Ubicación (País + Código Postal con autocompletado) ────

/** Estado del autocompletado por código postal. */
type PostalStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; etiqueta: string }
  | { kind: 'notfound' }
  | { kind: 'format'; mensaje: string }
  | { kind: 'nocatalog' }

export interface LocationInputsProps {
  country: string
  postalCode: string
  state: string
  city: string
  onCountryChange: (val: string) => void
  onPostalCodeChange: (val: string) => void
  onStateChange: (val: string) => void
  onCityChange: (val: string) => void
}

/**
 * Vista inicial compacta: solo País (selector ISO, México por defecto) y
 * Código Postal. Estado/Ciudad NO se muestran al inicio para no saturar.
 *
 * Al completar el CP (blur o formato ya válido a medio teclear) se busca en
 * el catálogo local (GeoNames, CC BY 4.0):
 *   ✓ encontrado  → rellena internamente Estado y Ciudad (para el submit) y
 *                   muestra el chip "📍 Ciudad, Estado" con botón Editar.
 *   ✗ no existe   → despliega suavemente los campos "Estado / Región" y
 *                   "Ciudad" (texto libre, dos columnas) con un aviso sutil:
 *                   fallback manual que nunca bloquea al usuario.
 *
 * El payload resultante siempre contiene { pais, codigoPostal, estado, ciudad }.
 */
export function LocationInputs({
  country,
  postalCode,
  state,
  city,
  onCountryChange,
  onPostalCodeChange,
  onStateChange,
  onCityChange,
}: LocationInputsProps): React.JSX.Element {
  const uid = useId()
  const [status, setStatus] = useState<PostalStatus>({ kind: 'idle' })
  // Si ya hay estado/ciudad guardados (p. ej. edición de perfil), abrimos el modo manual
  const [manualOpen, setManualOpen] = useState(() => Boolean(state || city))
  const debounceRef = useRef<number | null>(null)
  const lastLookupRef = useRef('')

  // Limpieza del temporizador al desmontar
  useEffect(() => () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }, [])

  const runLookup = async (cc: string, cp: string) => {
    const trimmed = cp.trim()
    if (!cc || !trimmed) return
    const key = `${cc}:${trimmed}`
    if (lastLookupRef.current === key) return
    lastLookupRef.current = key

    setStatus({ kind: 'loading' })
    const result = await lookupPostalCode(cc, trimmed)
    switch (result.status) {
      case 'encontrado': {
        const { estado, ciudad } = result.location
        if (!estado || !ciudad) {
          // Datos incompletos en el catálogo → tratamos como fallback manual
          setStatus({ kind: 'notfound' })
          setManualOpen(true)
          break
        }
        onStateChange(estado)
        onCityChange(ciudad)
        setStatus({ kind: 'found', etiqueta: `${ciudad}, ${estado}` })
        setManualOpen(false)
        break
      }
      case 'formato_invalido':
        setStatus({ kind: 'format', mensaje: `Formato de código postal no válido para este país (${result.mensaje}).` })
        break
      case 'no_encontrado':
        setStatus({ kind: 'notfound' })
        setManualOpen(true)
        break
      case 'catalogo_no_disponible':
        setStatus({ kind: 'nocatalog' })
        setManualOpen(true)
        break
    }
  }

  const handlePostalChange = (value: string) => {
    onPostalCodeChange(value)
    lastLookupRef.current = ''
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    const trimmed = value.trim()
    if (!trimmed) {
      setStatus({ kind: 'idle' })
      return
    }
    // Autocompletado anticipado solo cuando el formato ya es válido
    // (evita errores de formato a medio teclear); blur siempre consulta.
    if (trimmed.length >= 4 && !validatePostalCodeFormat(country, trimmed)) {
      debounceRef.current = window.setTimeout(() => { void runLookup(country, trimmed) }, 450)
    } else {
      setStatus({ kind: 'idle' })
    }
  }

  const handlePostalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    const val = e.target.value
    if (val.trim()) void runLookup(country, val)
  }

  const handleCountryChange = (value: string) => {
    onCountryChange(value)
    lastLookupRef.current = ''
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    // Revalidamos el CP actual contra el nuevo país
    if (postalCode.trim()) void runLookup(value, postalCode)
  }

  const countryName = COUNTRIES.find(c => c.code === country)?.name ?? country
  const postalInvalid = status.kind === 'format'
  const foundChip = status.kind === 'found' && !manualOpen

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Animación suave para el despliegue del fallback manual y el chip */}
      <style>{`@keyframes locFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }`}</style>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor={`${uid}-pais`} style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
            País <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            id={`${uid}-pais`}
            className="auth-input"
            required
            value={country || DEFAULT_COUNTRY}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCountryChange(e.target.value)}
            style={{ height: 48 }}
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor={`${uid}-cp`} style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
            Código postal <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id={`${uid}-cp`}
            type="text"
            className="auth-input"
            required
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="Ej. 97113"
            aria-invalid={postalInvalid}
            aria-describedby={status.kind !== 'idle' && status.kind !== 'loading' ? `${uid}-cp-ayuda` : undefined}
            value={postalCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePostalChange(e.target.value)}
            onBlur={handlePostalBlur}
          />
        </div>
      </div>

      {status.kind === 'loading' && (
        <p aria-live="polite" style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', margin: '-4px 0 0' }}>
          Buscando código postal…
        </p>
      )}

      {status.kind === 'format' && (
        <p
          id={`${uid}-cp-ayuda`}
          aria-live="polite"
          style={{ fontSize: 12, marginTop: -4, fontWeight: 600, color: '#ef4444' }}
        >
          {status.mensaje}
        </p>
      )}

      {foundChip && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: -4, animation: 'locFadeIn 0.25s ease' }}>
          <span
            id={`${uid}-cp-ayuda`}
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: '#1d7a42',
              background: 'rgba(34,155,88,0.1)',
              border: '1px solid rgba(34,155,88,0.35)',
              borderRadius: 8,
              padding: '4px 10px',
            }}
          >
            📍 {status.etiqueta}
          </span>
          <button
            type="button"
            onClick={() => setManualOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontFamily: 'var(--font-body)',
            }}
          >
            Editar
          </button>
        </div>
      )}

      {manualOpen && (
        <div style={{ animation: 'locFadeIn 0.25s ease' }}>
          {(status.kind === 'notfound' || status.kind === 'nocatalog') && (
            <p
              aria-live="polite"
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg3)', margin: '0 0 8px', lineHeight: 1.4 }}
            >
              {status.kind === 'nocatalog'
                ? `Sin catálogo local para ${countryName}. Por favor completa tu estado y ciudad manualmente.`
                : 'Código no detectado en el catálogo. Por favor completa tu estado y ciudad manualmente.'}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor={`${uid}-estado`} style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
                Estado / Región <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id={`${uid}-estado`}
                type="text"
                className="auth-input"
                required
                autoComplete="address-level1"
                placeholder="Ej. Jalisco, Antioquia"
                value={state}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onStateChange(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor={`${uid}-ciudad`} style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 5 }}>
                Ciudad <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id={`${uid}-ciudad`}
                type="text"
                className="auth-input"
                required
                autoComplete="address-level2"
                placeholder="Ej. Guadalajara, Medellín"
                value={city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCityChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
