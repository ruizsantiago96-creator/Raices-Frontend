import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCrearInstitucion, useMiInstitucion } from '../hooks/useInstitutions'
import { useMe, useAuthStore, TopNav } from '@features/auth'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons, CATEGORY_COLORS } from '@shared/components/shared'
import { PORTAL_UI } from '../constants/institutionPortalMessages'

/* ═══════════════════════════════════════════════════════════════════
   LIQUID GLASS DESIGN TOKENS (inline for this page)
   ═══════════════════════════════════════════════════════════════════ */
const GLASS = {
  panel: {
    background: 'rgba(255, 249, 242, 0.55)',
    backdropFilter: 'blur(24px) saturate(190%)',
    WebkitBackdropFilter: 'blur(24px) saturate(190%)',
    border: '1px solid rgba(255, 255, 255, 0.55)',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6), 0 12px 40px 0 rgba(31, 38, 135, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
    borderRadius: 18,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid rgba(229, 220, 210, 0.7)',
    borderRadius: 12,
    fontSize: 15,
    fontFamily: 'var(--font-body)',
    color: 'var(--fg1)',
    background: 'rgba(255, 249, 242, 0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--fg2)',
    display: 'block',
    marginBottom: 6,
    fontFamily: 'var(--font-body)',
  },
}

/* ═══════════════════════════════════════════════════════════════════
   STEP INDICATOR
   ═══════════════════════════════════════════════════════════════════ */
function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)',
              background: i < currentStep ? 'var(--primary)' : i === currentStep ? 'var(--primary-subtle)' : 'rgba(229, 220, 210, 0.4)',
              color: i < currentStep ? '#fff' : i === currentStep ? 'var(--primary)' : 'var(--fg3)',
              border: i === currentStep ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.3s ease',
            }}
          >
            {i < currentStep ? '✓' : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div style={{
              width: 40, height: 2,
              background: i < currentStep ? 'var(--primary)' : 'rgba(229, 220, 210, 0.6)',
              borderRadius: 1,
              transition: 'background 0.3s ease',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   GLASS SECTION WRAPPER
   ═══════════════════════════════════════════════════════════════════ */
function GlassSection({ icon, title, delay, children }) {
  return (
    <div
      className={`animate-fade-in-up ${delay}`}
      style={{ ...GLASS.panel, padding: '24px 28px', marginBottom: 20 }}
    >
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
        color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function CrearInstitucionPage() {
  const [phase, setPhase] = useState(1) // 1 = básico, 2 = verificación
  const [form, setForm] = useState({
    // Phase 1 - Basic (field names match backend API)
    nombre: '',
    descripcion: '',
    categoria: '',
    email: '',
    telefono: '',
    ciudad: '',
    estado: '',
    tiposDiscapacidad: [],
    // Phase 2 - Verification
    rfc: '',
    documentoLegal: null,
    sitioWeb: '',
    telefonoOficial: '',
    razonSocial: '',
    declaracionJurada: false,
  })
  const [apiError, setApiError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const fileInputRef = useRef(null)

  const { data: user } = useMe()
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const crear = useCrearInstitucion()
  const { data: catalogos, isLoading: loadingCatalogos } = useCatalogos()
  const { data: existingInst, isLoading: loadingExisting } = useMiInstitucion()

  const CATEGORIES = catalogos?.categoriasInstitucion ?? []
  const DISABILITY_TYPES = catalogos?.tiposDiscapacidad ?? []
  const isAuthenticated = !!token

  // Pre-fill form from user profile when data loads (run once)
  const hasPrefilledRef = useRef(false)
  useEffect(() => {
    if (user && !hasPrefilledRef.current) {
      hasPrefilledRef.current = true
      setForm(prev => ({
        ...prev,
        nombre: prev.nombre || (user.full_name ?? ''),
        email: prev.email || (user.email ?? ''),
        ciudad: prev.ciudad || (user.city ?? ''),
        estado: prev.estado || (user.state ?? ''),
      }))
    }
  }, [user])

  // If institution already exists, redirect to portal
  if (!loadingExisting && existingInst) {
    navigate('/institution-portal', { replace: true })
    return null
  }

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (apiError) setApiError(null)
    if (fieldErrors[key]) setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  const toggleDisability = (value) => {
    setForm(prev => ({
      ...prev,
      tiposDiscapacidad: prev.tiposDiscapacidad.includes(value)
        ? prev.tiposDiscapacidad.filter(v => v !== value)
        : [...prev.tiposDiscapacidad, value],
    }))
  }

  /* ── Validation ──────────────────────────────────────── */
  const validatePhase1 = () => {
    const errors = {}
    if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio'
    if (!form.categoria) errors.categoria = 'Selecciona una categoría'
    if (!form.telefono.trim()) errors.telefono = 'El teléfono es obligatorio'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePhase2 = () => {
    const errors = {}
    if (form.declaracionJurada !== true) errors.declaracionJurada = 'Debes aceptar la declaración'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  /* ── Handlers ────────────────────────────────────────── */
  const handleNext = () => {
    if (validatePhase1()) setPhase(2)
  }

  /** Build the payload from form state, optionally including verification fields. */
  const buildPayload = (includeVerification = false) => {
    const base = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      categoria: form.categoria || undefined,
      representante: form.nombre.trim() || undefined, // Auto-use nombre as representative
      email: form.email.trim() || undefined,
      telefono: form.telefono.trim() || undefined,
      ciudad: form.ciudad.trim() || undefined,
      estado: form.estado.trim() || undefined,
      tiposDiscapacidad: form.tiposDiscapacidad.length > 0 ? form.tiposDiscapacidad : undefined,
    }
    if (includeVerification) {
      Object.assign(base, {
        rfc: form.rfc.trim() || undefined,
        sitioWeb: form.sitioWeb.trim() || undefined,
        razonSocial: form.razonSocial.trim() || undefined,
        telefonoOficial: form.telefonoOficial.trim() || undefined,
        // NOTE: documentoLegal (File) requires multipart/form-data on the backend.
        // For now, send filename as metadata; full upload requires backend support.
        documentoLegalNombre: form.documentoLegal?.name || undefined,
      })
    }
    return Object.fromEntries(Object.entries(base).filter(([, v]) => v !== undefined))
  }

  const handleSubmit = async (includeVerification = false) => {
    if (includeVerification && !validatePhase2()) return
    if (!includeVerification && !validatePhase1()) return
    setApiError(null)
    try {
      const datos = buildPayload(includeVerification)
      const result = await crear.mutateAsync(datos)
      if (result?.id) navigate('/institution-portal')
      else navigate('/explore')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || ''
      // Si el backend dice que ya tiene institución, redirigir al portal
      if (err.response?.status === 400 && msg.toLowerCase().includes('ya tienes')) {
        navigate('/institution-portal', { replace: true })
        return
      }
      setApiError(msg || 'Error al crear la institución. Intenta de nuevo.')
    }
  }

  /* ── Not authenticated ───────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
        <TopNav currentPage="explore" />
        <main style={{ maxWidth: 520, margin: '0 auto', padding: '60px 32px', textAlign: 'center' }}>
          <div className="animate-scale-in" style={{ ...GLASS.panel, padding: '52px 36px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(1, 43, 41, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', color: 'var(--primary)',
            }}>
              {Icons.building({ s: 32 })}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 12px' }}>
              Inicia sesión para registrar una institución
            </h2>
            <p style={{ fontSize: 15, color: 'var(--fg3)', margin: '0 0 32px', lineHeight: 1.6 }}>
              Necesitas estar autenticado para crear una nueva institución en la plataforma.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => navigate('/auth?mode=login')} className="btn-secondary" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10 }}>
                Iniciar sesión
              </button>
              <button onClick={() => navigate('/auth?mode=register')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10 }}>
                Registrarse
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ── Field style with error state ────────────────────── */
  const fieldStyle = (hasError) => ({
    ...GLASS.input,
    borderColor: hasError ? 'var(--color-error)' : 'rgba(229, 220, 210, 0.7)',
    background: hasError ? 'rgba(254, 242, 242, 0.5)' : 'rgba(255, 249, 242, 0.6)',
  })

  const errorTextStyle = { fontSize: 12, color: 'var(--color-error)', marginTop: 4, fontWeight: 600 }

  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <main className="responsive-main" style={{ '--main-max-width': '680px' }}>
      {/* Back button */}
      <button
        onClick={() => phase === 2 ? setPhase(1) : navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}
      >
        {Icons.arrowLeft({ s: 16 })} {phase === 2 ? 'Volver a datos básicos' : 'Volver'}
      </button>

      {/* Title */}
      <h1 className="animate-title" style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
        color: 'var(--fg1)', margin: '0 0 6px', letterSpacing: '-0.02em',
      }}>
        {phase === 1 ? PORTAL_UI.REG_TITLE : PORTAL_UI.REG_PHASE_2_TITLE}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--fg3)', margin: '0 0 28px', lineHeight: 1.5 }}>
        {phase === 1 ? PORTAL_UI.REG_SUBTITLE : PORTAL_UI.REG_PHASE_2_DESC}
      </p>

      {/* Step indicator */}
      <StepIndicator currentStep={phase} totalSteps={2} />

      {/* API Error */}
      {apiError && (
        <div className="animate-fade-in-up" style={{
          background: 'rgba(254, 242, 242, 0.7)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(254, 202, 202, 0.6)', borderRadius: 12,
          padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {Icons.shieldAlert({ s: 18 })}
          <span style={{ color: '#991b1b', fontSize: 14, fontWeight: 500 }}>{apiError}</span>
        </div>
      )}

      {/* ═══ PHASE 1: BASIC DATA ═══ */}
      {phase === 1 && (
        <form onSubmit={e => { e.preventDefault(); handleNext() }}>
          {/* Datos de la institución (pre-filled from registration) */}
          <GlassSection icon={Icons.building({ s: 18 })} title={PORTAL_UI.REG_PHASE_1_TITLE} delay="delay-1">
            <div style={{ marginBottom: 18 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_INSTITUTION_NAME}</label>
              <input
                type="text" value={form.nombre}
                onChange={e => updateField('nombre', e.target.value)}
                placeholder={PORTAL_UI.REG_INSTITUTION_NAME_PLACEHOLDER}
                style={fieldStyle(fieldErrors.nombre)} required
              />
              {fieldErrors.nombre && <div style={errorTextStyle}>{fieldErrors.nombre}</div>}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_DESCRIPTION}</label>
              <textarea
                value={form.descripcion}
                onChange={e => updateField('descripcion', e.target.value)}
                placeholder={PORTAL_UI.REG_DESCRIPTION_PLACEHOLDER}
                rows={3}
                style={{ ...fieldStyle(false), height: 'auto', minHeight: 80, padding: '12px 16px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_CATEGORY}</label>
              {loadingCatalogos ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ width: 120, height: 36, borderRadius: 9999, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))}
                </div>
              ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const catValue = cat.value ?? cat
                  const catLabel = cat.label ?? cat
                  const active = form.categoria === catValue
                  const color = CATEGORY_COLORS[catValue] ?? 'var(--primary)'
                  return (
                    <button
                      key={catValue} type="button"
                      onClick={() => updateField('categoria', active ? '' : catValue)}
                      style={{
                        padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        border: active ? 'none' : '1px solid var(--border-color)',
                        background: active ? color : 'rgba(255, 249, 242, 0.5)',
                        color: active ? 'white' : 'var(--fg3)',
                        transition: 'all 0.2s',
                        backdropFilter: active ? 'none' : 'blur(8px)',
                      }}
                    >
                      {catLabel}
                    </button>
                  )
                })}
              </div>
              )}
              {fieldErrors.categoria && <div style={errorTextStyle}>{fieldErrors.categoria}</div>}
            </div>
          </GlassSection>

          {/* Contacto (pre-filled from registration) */}
          <GlassSection icon={Icons.phone({ s: 18 })} title="Contacto de la institución" delay="delay-2">
            {/* Pre-filled info note */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'rgba(1, 43, 41, 0.04)', borderRadius: 10, marginBottom: 16,
              border: '1px solid rgba(1, 43, 41, 0.08)',
            }}>
              {Icons.check({ s: 14 })}
              <span style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 500 }}>
                Correo y ubicación pre-llenados desde tu registro. Puedes editarlos si es necesario.
              </span>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_REP_PHONE}</label>
              <input
                type="tel" value={form.telefono}
                onChange={e => updateField('telefono', e.target.value)}
                placeholder={PORTAL_UI.REG_REP_PHONE_PLACEHOLDER}
                style={fieldStyle(fieldErrors.telefono)} required
              />
              {fieldErrors.telefono && <div style={errorTextStyle}>{fieldErrors.telefono}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }}>
              <div>
                <label style={GLASS.label}>{PORTAL_UI.REG_REP_EMAIL}</label>
                <input
                  type="email" value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder={PORTAL_UI.REG_REP_EMAIL_PLACEHOLDER}
                  style={fieldStyle(false)} readOnly
                />
                <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 3, fontStyle: 'italic' }}>De tu registro</div>
              </div>
              <div>
                <label style={GLASS.label}>{PORTAL_UI.REG_CITY}</label>
                <input
                  type="text" value={form.ciudad}
                  onChange={e => updateField('ciudad', e.target.value)}
                  placeholder={PORTAL_UI.REG_CITY_PLACEHOLDER}
                  style={fieldStyle(false)} readOnly
                />
                <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 3, fontStyle: 'italic' }}>De tu registro</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_STATE}</label>
              <input
                type="text" value={form.estado}
                onChange={e => updateField('estado', e.target.value)}
                placeholder={PORTAL_UI.REG_STATE_PLACEHOLDER}
                style={fieldStyle(false)} readOnly
              />
              <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 3, fontStyle: 'italic' }}>De tu registro</div>
            </div>
          </GlassSection>

          {/* Discapacidades */}
          <GlassSection icon={Icons.heartPulse({ s: 18 })} title="Tipos de discapacidad que atiende" delay="delay-4">
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 16px' }}>
              {PORTAL_UI.REG_DISABILITY_HINT}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DISABILITY_TYPES.map(dt => {
                const dtValue = dt.id ?? dt.value ?? dt
                const dtLabel = dt.label ?? dt
                const active = form.tiposDiscapacidad.includes(dtValue)
                return (
                  <button
                    key={dtValue} type="button"
                    onClick={() => toggleDisability(dtValue)}
                    style={{
                      padding: '8px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                      border: active ? 'none' : '1px solid var(--border-color)',
                      background: active ? 'var(--primary)' : 'rgba(255, 249, 242, 0.5)',
                      color: active ? 'white' : 'var(--fg3)',
                      transition: 'all 0.2s',
                      backdropFilter: active ? 'none' : 'blur(8px)',
                    }}
                  >
                    {active && <span style={{ marginRight: 4 }}>✓</span>}
                    {dtLabel}
                  </button>
                )
              })}
            </div>
          </GlassSection>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 48 }}>
            <button
              type="button" onClick={() => navigate(-1)}
              className="btn-secondary"
              style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10, minWidth: 140 }}
              disabled={crear.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10, minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={crear.isPending}
            >
              {Icons.arrowRight({ s: 18 })} {PORTAL_UI.REG_NEXT_STEP}
            </button>
          </div>
        </form>
      )}

      {/* ═══ PHASE 2: VERIFICATION ═══ */}
      {phase === 2 && (
        <form onSubmit={e => { e.preventDefault(); handleSubmit(true) }}>
          {/* Info banner */}
          <div className="animate-fade-in-up delay-1" style={{
            ...GLASS.panel,
            padding: '20px 24px', marginBottom: 20,
            display: 'flex', gap: 14, alignItems: 'flex-start',
            border: '1px solid rgba(165, 218, 222, 0.4)',
            background: 'rgba(165, 218, 222, 0.12)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(1, 43, 41, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
            }}>
              {Icons.shield({ s: 18 })}
            </div>
            <div>
              <p style={{ fontSize: 14, color: 'var(--fg1)', fontWeight: 600, margin: '0 0 4px', lineHeight: 1.4 }}>
                {PORTAL_UI.REG_VERIFY_DESCRIPTION}
              </p>
              <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0, lineHeight: 1.4 }}>
                {PORTAL_UI.REG_SKIP_INFO}
              </p>
            </div>
          </div>

          {/* Documentos */}
          <GlassSection icon={Icons.list({ s: 18 })} title="Documentos y datos legales" delay="delay-2">
            <div style={{ marginBottom: 18 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_RFC}</label>
              <input
                type="text" value={form.rfc}
                onChange={e => updateField('rfc', e.target.value.toUpperCase())}
                placeholder={PORTAL_UI.REG_RFC_PLACEHOLDER}
                style={fieldStyle(false)}
                maxLength={13}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_SOCIAL_REASON}</label>
              <input
                type="text" value={form.razonSocial}
                onChange={e => updateField('razonSocial', e.target.value)}
                placeholder={PORTAL_UI.REG_SOCIAL_REASON_PLACEHOLDER}
                style={fieldStyle(false)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_LEGAL_DOC}</label>
              <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '0 0 8px' }}>{PORTAL_UI.REG_LEGAL_DOC_HINT}</p>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(229, 220, 210, 0.7)', borderRadius: 12,
                  padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
                  background: 'rgba(255, 249, 242, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(1, 43, 41, 0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(229, 220, 210, 0.7)'; e.currentTarget.style.background = 'rgba(255, 249, 242, 0.3)' }}
              >
                {Icons.upload({ s: 24 })}
                <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '8px 0 0', fontWeight: 500 }}>
                  {form.documentoLegal ? form.documentoLegal.name : 'Arrastra o haz clic para subir'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '4px 0 0' }}>PDF, JPG o PNG (max 5MB)</p>
              </div>
              <input
                ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) updateField('documentoLegal', file)
                }}
              />
            </div>
          </GlassSection>

          {/* Contacto oficial */}
          <GlassSection icon={Icons.phone({ s: 18 })} title="Contacto oficial" delay="delay-3">
            <div style={{ marginBottom: 18 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_OFFICIAL_PHONE}</label>
              <input
                type="tel" value={form.telefonoOficial}
                onChange={e => updateField('telefonoOficial', e.target.value)}
                placeholder={PORTAL_UI.REG_OFFICIAL_PHONE_PLACEHOLDER}
                style={fieldStyle(false)}
              />
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={GLASS.label}>{PORTAL_UI.REG_WEBSITE}</label>
              <input
                type="url" value={form.sitioWeb}
                onChange={e => updateField('sitioWeb', e.target.value)}
                placeholder={PORTAL_UI.REG_WEBSITE_PLACEHOLDER}
                style={fieldStyle(false)}
              />
            </div>
          </GlassSection>

          {/* Declaración jurada */}
          <GlassSection icon={Icons.check({ s: 18 })} title="Declaración" delay="delay-4">
            <label
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                padding: '14px 16px', borderRadius: 12,
                background: form.declaracionJurada ? 'rgba(1, 43, 41, 0.06)' : 'rgba(255, 249, 242, 0.3)',
                border: `1px solid ${form.declaracionJurada ? 'var(--primary)' : 'rgba(229, 220, 210, 0.5)'}`,
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="checkbox" checked={form.declaracionJurada}
                onChange={e => updateField('declaracionJurada', e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--primary)', flexShrink: 0 }}
              />
              <span style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5 }}>
                {PORTAL_UI.REG_DECLARATION}
              </span>
            </label>
            {fieldErrors.declaracionJurada && <div style={{ ...errorTextStyle, marginTop: 8 }}>{fieldErrors.declaracionJurada}</div>}
          </GlassSection>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 48 }}>
            <button
              type="button"
              onClick={() => setPhase(1)}
              className="btn-secondary"
              style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10 }}
              disabled={crear.isPending}
            >
              {Icons.arrowLeft({ s: 16 })} {PORTAL_UI.REG_BACK_TO_BASIC}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              style={{
                padding: '14px 24px', fontSize: 14, fontWeight: 600, borderRadius: 10,
                border: '1px solid var(--border-color)', background: 'rgba(255, 249, 242, 0.5)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                color: 'var(--fg2)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s ease',
              }}
              disabled={crear.isPending}
            >
              {Icons.loader({ s: 16 })} {PORTAL_UI.REG_COMPLETE_LATER}
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10, minWidth: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={crear.isPending}
            >
              {crear.isPending ? (
                <>
                  <span style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block',
                  }} />
                  {PORTAL_UI.REGSubmittingVerify}
                </>
              ) : (
                <>
                  {Icons.shield({ s: 18 })} {PORTAL_UI.REG_SUBMIT_VERIFY}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
