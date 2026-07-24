import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCrearInstitucion } from '../hooks/useInstitutions'
import { useMe, useAuthStore, AppSidebar, TopNav } from '@features/auth'
import { Icons, CATEGORY_COLORS, labelStyle, inputStyle } from '@shared/components/shared'

const CATEGORIES = [
  { value: 'funcional', label: 'Funcional' },
  { value: 'educativo', label: 'Educativo' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'social', label: 'Social' },
]

const DISABILITY_TYPES = [
  { value: 'tea', label: 'TEA (Autismo)' },
  { value: 'motriz', label: 'Motriz' },
  { value: 'visual', label: 'Visual' },
  { value: 'auditiva', label: 'Auditiva' },
  { value: 'intelectual', label: 'Intelectual' },
  { value: 'psicosocial', label: 'Psicosocial' },
  { value: 'multiple', label: 'Múltiple' },
  { value: 'otro', label: 'Otro' },
]

const initialForm = {
  nombre: '',
  descripcion: '',
  categoria: '',
  ciudad: '',
  estado: '',
  direccion: '',
  telefono: '',
  email: '',
  sitioWeb: '',
  tiposDiscapacidad: [],
}

export default function CrearInstitucionPage() {
  const [form, setForm] = useState(initialForm)
  const [apiError, setApiError] = useState(null)
  const { data: user } = useMe()
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const crear = useCrearInstitucion()

  const isAuthenticated = !!token

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (apiError) setApiError(null)
  }

  const toggleDisability = (value) => {
    setForm(prev => ({
      ...prev,
      tiposDiscapacidad: prev.tiposDiscapacidad.includes(value)
        ? prev.tiposDiscapacidad.filter(v => v !== value)
        : [...prev.tiposDiscapacidad, value],
    }))
    if (apiError) setApiError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    if (!form.nombre.trim()) {
      setApiError('El nombre de la institución es obligatorio.')
      return
    }

    try {
      const datos = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        categoria: form.categoria || undefined,
        ciudad: form.ciudad.trim() || undefined,
        estado: form.estado.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        email: form.email.trim() || undefined,
        sitioWeb: form.sitioWeb.trim() || undefined,
        tiposDiscapacidad: form.tiposDiscapacidad.length > 0 ? form.tiposDiscapacidad : undefined,
      }

      // Remove undefined keys
      const datosLimpios = Object.fromEntries(
        Object.entries(datos).filter(([, v]) => v !== undefined)
      )

      const result = await crear.mutateAsync(datosLimpios)

      // Redirect to the newly created institution or explore page
      if (result?.id) {
        navigate(`/institution/${result.id}`)
      } else {
        navigate('/explore')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al crear la institución. Intenta de nuevo.'
      setApiError(msg)
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
        <TopNav currentPage="explore" />
        <main style={{ maxWidth: 600, margin: '0 auto', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '48px 32px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white' }}>
              {Icons.building({ s: 28 })}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 12px' }}>Inicia sesión para registrar una institución</h2>
            <p style={{ fontSize: 15, color: 'var(--fg3)', margin: '0 0 28px', lineHeight: 1.6 }}>Necesitas estar autenticado para crear una nueva institución en la plataforma.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => navigate('/auth?mode=login')} className="btn-secondary" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10 }}>Iniciar sesión</button>
              <button onClick={() => navigate('/auth?mode=register')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10 }}>Registrarse</button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="explore" />
      <TopNav user={user} onLogout={() => { useAuthStore.getState().logout(); navigate('/'); }} currentPage="explore" />
      <main className="responsive-main" style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}>
          {Icons.arrowLeft({ s: 16 })} Volver
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
          Registrar nueva institución
        </h1>
        <p style={{ fontSize: 15, color: 'var(--fg3)', margin: '0 0 32px', lineHeight: 1.5 }}>
          Completa los datos para registrar una institución. Los campos marcados con * son obligatorios.
        </p>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            {Icons.shieldAlert({ s: 18 })}
            <span style={{ color: '#991b1b', fontSize: 14, fontWeight: 500 }}>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sección: Datos básicos */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {Icons.building({ s: 18 })} Datos básicos
            </h3>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Nombre de la institución *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => updateField('nombre', e.target.value)}
                placeholder="Ej. Centro de Terapia Familiar"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={e => updateField('descripcion', e.target.value)}
                placeholder="Describe brevemente la institución y sus servicios..."
                rows={3}
                style={{ ...inputStyle, height: 'auto', minHeight: 80, padding: '12px 16px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Categoría</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const active = form.categoria === cat.value
                  const color = CATEGORY_COLORS[cat.value] ?? 'var(--primary)'
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => updateField('categoria', active ? '' : cat.value)}
                      style={{
                        padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        border: active ? 'none' : '1px solid var(--border-color)',
                        background: active ? color : 'var(--bg-warm)',
                        color: active ? 'white' : 'var(--fg3)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sección: Ubicación */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {Icons.mapPin({ s: 18 })} Ubicación
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Ciudad</label>
                <input
                  type="text"
                  value={form.ciudad}
                  onChange={e => updateField('ciudad', e.target.value)}
                  placeholder="Ej. Monterrey"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <input
                  type="text"
                  value={form.estado}
                  onChange={e => updateField('estado', e.target.value)}
                  placeholder="Ej. Nuevo León"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>Dirección</label>
              <input
                type="text"
                value={form.direccion}
                onChange={e => updateField('direccion', e.target.value)}
                placeholder="Ej. Av. Universidad 1234"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Sección: Contacto */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {Icons.phone({ s: 18 })} Contacto
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={e => updateField('telefono', e.target.value)}
                  placeholder="Ej. 81 1234 5678"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="Ej. contacto@institucion.org"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>Sitio web</label>
              <input
                type="url"
                value={form.sitioWeb}
                onChange={e => updateField('sitioWeb', e.target.value)}
                placeholder="Ej. https://www.institucion.org"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Sección: Discapacidades */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {Icons.heartPulse({ s: 18 })} Tipos de discapacidad que atiende
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 16px' }}>Selecciona todas las que apliquen (opcional).</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DISABILITY_TYPES.map(dt => {
                const active = form.tiposDiscapacidad.includes(dt.value)
                return (
                  <button
                    key={dt.value}
                    type="button"
                    onClick={() => toggleDisability(dt.value)}
                    style={{
                      padding: '8px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                      border: active ? 'none' : '1px solid var(--border-color)',
                      background: active ? 'var(--primary)' : 'var(--bg-warm)',
                      color: active ? 'white' : 'var(--fg3)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {active && <span style={{ marginRight: 4 }}>✓</span>}
                    {dt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 48 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
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
              {crear.isPending ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Registrando...
                </>
              ) : (
                <>
                  {Icons.plus({ s: 18 })} Registrar institución
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
