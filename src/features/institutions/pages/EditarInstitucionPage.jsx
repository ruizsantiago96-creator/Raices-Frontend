import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMe, useAuthStore } from '@features/auth'
import { useMiInstitucion, useUpdateMiInstitucion } from '../hooks/useInstitutions'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import InstitutionPortalSidebar from '../components/InstitutionPortalSidebar'
import MobileInstitutionDrawer from '../components/MobileInstitutionDrawer'
import { PORTAL_UI } from '../constants/institutionPortalMessages'

const CATEGORY_OPTIONS = [
  { value: 'funcional', label: 'Funcional' },
  { value: 'educativo', label: 'Educativo' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'social', label: 'Social' },
]

const PLAN_OPTIONS = [
  { value: 'gratuito', label: 'Gratuito' },
  { value: 'basico', label: 'Básico' },
  { value: 'premium', label: 'Premium' },
]

export default function EditarInstitucionPage() {
  const { logout } = useAuthStore()
  const { data: user } = useMe()
  const navigate = useNavigate()
  const { data: catalogos } = useCatalogos()
  const { data: institution, isLoading: loadingInst } = useMiInstitucion()
  const updateInst = useUpdateMiInstitucion()

  const [tab] = useState('configuracion')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const DISABILITY_TYPES = catalogos?.tiposDiscapacidad ?? []

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    subcategoria: '',
    direccion: '',
    ciudad: '',
    estado: '',
    lat: '',
    lng: '',
    telefono: '',
    whatsapp: '',
    email: '',
    sitioWeb: '',
    urlLogo: '',
    urlPortada: '',
    tiposDiscapacidad: [],
    edadMinima: 0,
    edadMaxima: 99,
    horarioAtencion: '',
    tipoPlan: 'gratuito',
    servicios: [],
  })

  const [nuevoServicio, setNuevoServicio] = useState('')

  // Populate form when institution data loads
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (institution) {
      setForm({
        nombre: institution.nombre ?? institution.name ?? '',
        descripcion: institution.descripcion ?? institution.description ?? '',
        categoria: institution.categoria ?? institution.category ?? '',
        subcategoria: institution.subcategoria ?? '',
        direccion: institution.direccion ?? institution.address ?? '',
        ciudad: institution.ciudad ?? institution.city ?? '',
        estado: institution.estado ?? institution.state ?? '',
        lat: institution.lat ?? '',
        lng: institution.lng ?? '',
        telefono: institution.telefono ?? institution.phone ?? '',
        whatsapp: institution.whatsapp ?? '',
        email: institution.email ?? '',
        sitioWeb: institution.sitioWeb ?? institution.website ?? '',
        urlLogo: institution.urlLogo ?? '',
        urlPortada: institution.urlPortada ?? '',
        tiposDiscapacidad: institution.tiposDiscapacidad ?? institution.disability_types ?? [],
        edadMinima: institution.edadMinima ?? 0,
        edadMaxima: institution.edadMaxima ?? 99,
        horarioAtencion: institution.horarioAtencion ?? '',
        tipoPlan: institution.tipoPlan ?? 'gratuito',
        servicios: institution.servicios ?? [],
      })
    }
  }, [institution])
  /* eslint-enable react-hooks/set-state-in-effect */

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (apiError) setApiError(null)
    if (successMsg) setSuccessMsg(null)
  }

  const toggleDisability = (value) => {
    setForm(prev => ({
      ...prev,
      tiposDiscapacidad: prev.tiposDiscapacidad.includes(value)
        ? prev.tiposDiscapacidad.filter(v => v !== value)
        : [...prev.tiposDiscapacidad, value],
    }))
  }

  const addServicio = () => {
    const trimmed = nuevoServicio.trim()
    if (trimmed && !form.servicios.includes(trimmed)) {
      setForm(prev => ({ ...prev, servicios: [...prev.servicios, trimmed] }))
      setNuevoServicio('')
    }
  }

  const removeServicio = (srv) => {
    setForm(prev => ({ ...prev, servicios: prev.servicios.filter(s => s !== srv) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    setSuccessMsg(null)

    if (!form.nombre.trim()) {
      setApiError('El nombre de la institución es obligatorio.')
      return
    }

    try {
      const datos = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        categoria: form.categoria || undefined,
        subcategoria: form.subcategoria.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        ciudad: form.ciudad.trim() || undefined,
        estado: form.estado.trim() || undefined,
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
        telefono: form.telefono.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        email: form.email.trim() || undefined,
        sitioWeb: form.sitioWeb.trim() || undefined,
        urlLogo: form.urlLogo.trim() || undefined,
        urlPortada: form.urlPortada.trim() || undefined,
        tiposDiscapacidad: form.tiposDiscapacidad.length > 0 ? form.tiposDiscapacidad : undefined,
        edadMinima: form.edadMinima,
        edadMaxima: form.edadMaxima,
        horarioAtencion: form.horarioAtencion.trim() || undefined,
        tipoPlan: form.tipoPlan || undefined,
        servicios: form.servicios.length > 0 ? form.servicios : undefined,
      }

      // Remove undefined values
      const datosLimpios = Object.fromEntries(
        Object.entries(datos).filter(([, v]) => v !== undefined)
      )

      await updateInst.mutateAsync({ id: institution.id || institution._id, ...datosLimpios })
      setSuccessMsg('Institución actualizada correctamente.')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al actualizar la institución.'
      setApiError(msg)
    }
  }

  if (loadingInst) {
    return (
      <main className="responsive-main">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </main>
    )
  }

  if (!institution) {
    return (
      <main className="responsive-main">
        <div style={{ flex: 1, padding: 40, textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '48px 32px', maxWidth: 500, margin: '0 auto' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              {Icons.building({ s: 28 })}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 12px' }}>No tienes una institución registrada</h2>
            <p style={{ fontSize: 15, color: 'var(--fg3)', marginBottom: 24 }}>Registra tu institución para comenzar a gestionar vacantes y postulaciones.</p>
            <button onClick={() => navigate('/institution-portal/registro')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10 }}>
              {Icons.plus({ s: 18 })} Registrar institución
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '800px' }}>
          <button onClick={() => navigate('/institution-portal')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}>
            {Icons.arrowLeft({ s: 16 })} Volver al portal
          </button>

          <h1 className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Editar mi institución
          </h1>
          <p style={{ fontSize: 15, color: 'var(--fg3)', margin: '0 0 32px', lineHeight: 1.5 }}>
            Actualiza la información de tu institución. Los campos marcados con * son obligatorios.
          </p>

          {apiError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              {Icons.shieldAlert({ s: 18 })}
              <span style={{ color: '#991b1b', fontSize: 14, fontWeight: 500 }}>{apiError}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              {Icons.check({ s: 18 })}
              <span style={{ color: '#166534', fontSize: 14, fontWeight: 500 }}>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Sección: Datos básicos */}
            <div className="animate-fade-in-up delay-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icons.building({ s: 18 })} Datos básicos
              </h3>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Nombre de la institución *</label>
                <input type="text" value={form.nombre} onChange={e => updateField('nombre', e.target.value)} placeholder="Ej. Centro de Terapia Familiar" style={inputStyle} required />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Descripción</label>
                <textarea value={form.descripcion} onChange={e => updateField('descripcion', e.target.value)} placeholder="Describe brevemente la institución y sus servicios..." rows={3} style={{ ...inputStyle, height: 'auto', minHeight: 80, padding: '12px 16px', resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Categoría</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORY_OPTIONS.map(cat => {
                    const active = form.categoria === cat.value
                    return (
                      <button key={cat.value} type="button" onClick={() => updateField('categoria', active ? '' : cat.value)} style={{ padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', border: active ? 'none' : '1px solid var(--border-color)', background: active ? 'var(--primary)' : 'var(--bg-warm)', color: active ? 'white' : 'var(--fg3)', transition: 'all 0.2s' }}>
                        {cat.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 0 }}>
                <label style={labelStyle}>Subcategoría</label>
                <input type="text" value={form.subcategoria} onChange={e => updateField('subcategoria', e.target.value)} placeholder="Ej. terapias, apoyo escolar" style={inputStyle} />
              </div>
            </div>

            {/* Sección: Ubicación */}
            <div className="animate-fade-in-up delay-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icons.mapPin({ s: 18 })} Ubicación
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div>
                  <label style={labelStyle}>Ciudad</label>
                  <input type="text" value={form.ciudad} onChange={e => updateField('ciudad', e.target.value)} placeholder="Ej. Monterrey" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <input type="text" value={form.estado} onChange={e => updateField('estado', e.target.value)} placeholder="Ej. Nuevo León" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Dirección</label>
                <input type="text" value={form.direccion} onChange={e => updateField('direccion', e.target.value)} placeholder="Ej. Av. Universidad 1234" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }}>
                <div>
                  <label style={labelStyle}>Latitud</label>
                  <input type="number" step="any" value={form.lat} onChange={e => updateField('lat', e.target.value)} placeholder="Ej. 20.9674" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Longitud</label>
                  <input type="number" step="any" value={form.lng} onChange={e => updateField('lng', e.target.value)} placeholder="Ej. -89.6237" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Sección: Contacto */}
            <div className="animate-fade-in-up delay-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icons.phone({ s: 18 })} Contacto
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input type="tel" value={form.telefono} onChange={e => updateField('telefono', e.target.value)} placeholder="Ej. 81 1234 5678" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} placeholder="Ej. 81 1234 5678" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }}>
                <div>
                  <label style={labelStyle}>Correo electrónico</label>
                  <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="Ej. contacto@institucion.org" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sitio web</label>
                  <input type="url" value={form.sitioWeb} onChange={e => updateField('sitioWeb', e.target.value)} placeholder="Ej. https://www.institucion.org" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Sección: Imágenes */}
            <div className="animate-fade-in-up delay-3b" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icons.camera({ s: 18 })} Imágenes
              </h3>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>URL del logo</label>
                <input type="url" value={form.urlLogo} onChange={e => updateField('urlLogo', e.target.value)} placeholder="https://storage.../logo.png" style={inputStyle} />
                {form.urlLogo && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={form.urlLogo} alt="Logo preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-color)' }} onError={e => e.target.style.display = 'none'} />
                    <span style={{ fontSize: 12, color: 'var(--fg3)' }}>Vista previa del logo</span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 0 }}>
                <label style={labelStyle}>URL de portada</label>
                <input type="url" value={form.urlPortada} onChange={e => updateField('urlPortada', e.target.value)} placeholder="https://storage.../cover.jpg" style={inputStyle} />
                {form.urlPortada && (
                  <div style={{ marginTop: 8 }}>
                    <img src={form.urlPortada} alt="Cover preview" style={{ width: '100%', maxHeight: 120, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-color)' }} onError={e => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
            </div>

            {/* Sección: Discapacidades */}
            <div className="animate-fade-in-up delay-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icons.heartPulse({ s: 18 })} Tipos de discapacidad que atiende
              </h3>
              <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 16px' }}>Selecciona todas las que apliquen.</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DISABILITY_TYPES.map(dt => {
                  const dtValue = dt.id ?? dt.value ?? dt
                  const dtLabel = dt.label ?? dt
                  const active = form.tiposDiscapacidad.includes(dtValue)
                  return (
                    <button key={dtValue} type="button" onClick={() => toggleDisability(dtValue)} style={{ padding: '8px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', border: active ? 'none' : '1px solid var(--border-color)', background: active ? 'var(--primary)' : 'var(--bg-warm)', color: active ? 'white' : 'var(--fg3)', transition: 'all 0.2s' }}>
                        {active && <span style={{ marginRight: 4 }}>✓</span>}
                        {dtLabel}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sección: Atención y plan */}
            <div className="animate-fade-in-up delay-4b" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icons.activity({ s: 18 })} Atención y plan
              </h3>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Horario de atención</label>
                <input type="text" value={form.horarioAtencion} onChange={e => updateField('horarioAtencion', e.target.value)} placeholder="Ej. Lun-Vie 8:00-16:00" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div>
                  <label style={labelStyle}>Edad mínima</label>
                  <input type="number" min="0" max="150" value={form.edadMinima} onChange={e => updateField('edadMinima', Number(e.target.value))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Edad máxima</label>
                  <input type="number" min="0" max="150" value={form.edadMaxima} onChange={e => updateField('edadMaxima', Number(e.target.value))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Tipo de plan</label>
                  <select value={form.tipoPlan} onChange={e => updateField('tipoPlan', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {PLAN_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección: Servicios */}
            <div className="animate-fade-in-up delay-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '24px 28px', marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icons.list({ s: 18 })} Servicios que ofrece
              </h3>
              <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 16px' }}>Agrega los servicios que ofrece tu institución.</p>

              <div style={{ display: 'flex', gap: 8, marginBottom: form.servicios.length > 0 ? 16 : 0 }}>
                <input
                  type="text"
                  value={nuevoServicio}
                  onChange={e => setNuevoServicio(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addServicio() } }}
                  placeholder="Ej. Terapia ABA"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="button" onClick={addServicio} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-warm)', color: 'var(--fg1)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                  {Icons.plus({ s: 16 })} Agregar
                </button>
              </div>

              {form.servicios.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {form.servicios.map((srv, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9999, background: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
                      {srv}
                      <button type="button" onClick={() => removeServicio(srv)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                        {Icons.x({ s: 14 })}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 48 }}>
              <button type="button" onClick={() => navigate('/institution-portal')} className="btn-secondary" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10, minWidth: 140 }} disabled={updateInst.isPending}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10, minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={updateInst.isPending}>
                {updateInst.isPending ? (
                  <>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Guardando...
                  </>
                ) : (
                  <>
                    {Icons.check({ s: 18 })} Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
  )
}
