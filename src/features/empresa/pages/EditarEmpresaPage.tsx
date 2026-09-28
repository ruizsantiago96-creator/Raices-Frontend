import { useState } from 'react'
import type { FormEvent, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import { useProfile, useUpdateProfile } from '@features/profile/hooks/useProfile'
import type { UserProfile } from '@/types/profile'

/* ── Catálogo de accesibilidad corporativa sugerida ───────── */

const ACCESIBILIDAD_SUGERIDA = [
  'Rampas',
  'Elevadores',
  'Baños adaptados',
  'Estacionamiento accesible',
  'Puertas y pasillos amplios',
  'Señalética Braille',
  'Lector de pantalla compatible',
  'Intérprete LSM',
  'Horario flexible',
  'Accesibilidad digital',
] as const

interface EmpresaFormState {
  nombre: string
  descripcion: string
  sector: string
  direccion: string
  ciudad: string
  estado: string
  sitioWeb: string
  telefono: string
  emailContacto: string
  accesibilidad: string[]
}

const FORM_INITIAL: EmpresaFormState = {
  nombre: '',
  descripcion: '',
  sector: '',
  direccion: '',
  ciudad: '',
  estado: '',
  sitioWeb: '',
  telefono: '',
  emailContacto: '',
  accesibilidad: [],
}

/* ── Estilos (mismo patrón visual del portal de institución) ─ */

const inputStyle: CSSProperties = {
  width: '100%',
  height: 42,
  padding: '0 14px',
  borderRadius: 10,
  border: '1.5px solid var(--border-color)',
  background: 'var(--bg-surface)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  color: 'var(--fg1)',
  fontFamily: 'var(--font-body)',
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--fg2)',
  marginBottom: 6,
}

const sectionCard: CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 16,
  padding: '24px 28px',
}

/** Extrae el primer string no vacío entre alias español/inglés del perfil. */
function pickString(...valores: unknown[]): string {
  for (const valor of valores) {
    if (typeof valor === 'string' && valor.trim()) return valor
  }
  return ''
}

/** Normaliza un campo que puede llegar como array de strings u objetos { nombre }. */
function pickStringArray(...valores: unknown[]): string[] {
  for (const valor of valores) {
    if (Array.isArray(valor)) {
      const limpio = valor
        .map(item => (typeof item === 'string' ? item : (item as { nombre?: string } | null)?.nombre ?? ''))
        .filter((s): s is string => Boolean(s))
      if (limpio.length > 0) return limpio
    }
  }
  return []
}

/** Valida formato básico de email con regex simple. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EditarEmpresaPage() {
  const navigate = useNavigate()
  const { addToast } = useUiStore()
  const { data: perfil, isLoading: loadingPerfil } = useProfile()
  const updatePerfil = useUpdateProfile()

  const [form, setForm] = useState<EmpresaFormState>(FORM_INITIAL)
  const [accesibilidadExtra, setAccesibilidadExtra] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [prevPerfilId, setPrevPerfilId] = useState<string | number | null>(null)

  const updateField = <K extends keyof EmpresaFormState>(key: K, value: EmpresaFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (error) setError(null)
  }

  // Rellenar el formulario cuando el perfil carga (derivado durante el render,
  // mismo patrón de EditarInstitucionPage)
  if (perfil && perfil.id !== undefined && perfil.id !== prevPerfilId) {
    setPrevPerfilId(perfil.id)
    setForm({
      nombre: pickString(perfil.nombreCompleto, perfil.full_name),
      descripcion: pickString(perfil.bio, perfil.descripcion),
      sector: pickString(perfil.sector, perfil.giroComercial, perfil.tipoEcosistema),
      direccion: pickString(perfil.domicilio, perfil.direccion),
      ciudad: pickString(perfil.ciudad, perfil.city),
      estado: pickString(perfil.estado, perfil.state),
      sitioWeb: pickString(perfil.sitioWeb, perfil.website),
      telefono: pickString(perfil.telefonoContacto, perfil.telefono),
      emailContacto: pickString(perfil.emailContacto, perfil.email),
      accesibilidad: pickStringArray(perfil.accesibilidadInfraestructura, perfil.serviciosOfrecidos),
    })
  }

  const toggleAccesibilidad = (tag: string) => {
    setForm(prev => ({
      ...prev,
      accesibilidad: prev.accesibilidad.includes(tag)
        ? prev.accesibilidad.filter(t => t !== tag)
        : [...prev.accesibilidad, tag],
    }))
  }

  const addAccesibilidadExtra = () => {
    const trimmed = accesibilidadExtra.trim()
    if (!trimmed) return
    if (form.accesibilidad.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setAccesibilidadExtra('')
      return
    }
    setForm(prev => ({ ...prev, accesibilidad: [...prev.accesibilidad, trimmed] }))
    setAccesibilidadExtra('')
  }

  const removeAccesibilidad = (tag: string) => {
    setForm(prev => ({ ...prev, accesibilidad: prev.accesibilidad.filter(t => t !== tag) }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.nombre.trim()) {
      setError('El nombre de la empresa es obligatorio.')
      return
    }
    if (form.emailContacto.trim() && !EMAIL_REGEX.test(form.emailContacto.trim())) {
      setError('El correo de contacto no tiene un formato válido.')
      return
    }

    try {
      await updatePerfil.mutateAsync({
        nombreCompleto: form.nombre.trim(),
        bio: form.descripcion.trim() || undefined,
        sector: form.sector.trim() || undefined,
        domicilio: form.direccion.trim() || undefined,
        ciudad: form.ciudad.trim() || undefined,
        estado: form.estado.trim() || undefined,
        sitioWeb: form.sitioWeb.trim() || undefined,
        telefonoContacto: form.telefono.trim() || undefined,
        emailContacto: form.emailContacto.trim() || undefined,
        accesibilidadInfraestructura: form.accesibilidad.length > 0 ? form.accesibilidad : undefined,
      })
      addToast('Datos de la empresa actualizados correctamente', 'success')
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      const msg = errObj?.response?.data?.message || 'No se pudo guardar la información. Intenta de nuevo.'
      setError(msg)
    }
  }

  if (loadingPerfil) {
    return (
      <main id="main" className="responsive-main" style={{ '--main-max-width': '900px' } as Record<string, string>}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: 'var(--fg3)', fontSize: 15, gap: 10 }}>
          {Icons.loader({ s: 20 })} Cargando información de la empresa...
        </div>
      </main>
    )
  }

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '900px' } as Record<string, string>}>
      <button
        onClick={() => navigate('/empresa-portal')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0, fontFamily: 'var(--font-body)' }}
      >
        {Icons.arrowRight({ s: 16, color: 'var(--fg3)' })} Volver a la Bolsa de Trabajo
      </button>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        Editar empresa
      </h1>
      <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '0 0 28px' }}>
        Actualiza la información pública de tu empresa: nombre, descripción, ubicación y datos de contacto.
      </p>

      <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── Información general ── */}
        <section style={sectionCard}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 18px' }}>
            Información general
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="empresa-nombre" style={labelStyle}>Nombre de la empresa *</label>
              <input
                id="empresa-nombre"
                type="text"
                required
                maxLength={100}
                value={form.nombre}
                onChange={e => updateField('nombre', e.target.value)}
                placeholder="ej. Innovación Accesible SA de CV"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="empresa-descripcion" style={labelStyle}>Acerca de la empresa</label>
              <textarea
                id="empresa-descripcion"
                rows={4}
                maxLength={500}
                value={form.descripcion}
                onChange={e => updateField('descripcion', e.target.value)}
                placeholder="Describe a qué se dedica tu empresa, su misión y los valores que la distinguen..."
                style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'vertical' }}
              />
            </div>
            <div>
              <label htmlFor="empresa-sector" style={labelStyle}>Sector o giro comercial</label>
              <input
                id="empresa-sector"
                type="text"
                maxLength={100}
                value={form.sector}
                onChange={e => updateField('sector', e.target.value)}
                placeholder="ej. Tecnología, Manufactura, Servicios financieros..."
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* ── Ubicación ── */}
        <section style={sectionCard}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 18px' }}>
            Ubicación
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="empresa-direccion" style={labelStyle}>Dirección</label>
              <input
                id="empresa-direccion"
                type="text"
                maxLength={300}
                value={form.direccion}
                onChange={e => updateField('direccion', e.target.value)}
                placeholder="Calle, número, colonia, CP"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label htmlFor="empresa-ciudad" style={labelStyle}>Ciudad</label>
                <input
                  id="empresa-ciudad"
                  type="text"
                  maxLength={100}
                  value={form.ciudad}
                  onChange={e => updateField('ciudad', e.target.value)}
                  placeholder="ej. Mérida"
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="empresa-estado" style={labelStyle}>Estado</label>
                <input
                  id="empresa-estado"
                  type="text"
                  maxLength={100}
                  value={form.estado}
                  onChange={e => updateField('estado', e.target.value)}
                  placeholder="ej. Yucatán"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Contacto ── */}
        <section style={sectionCard}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 18px' }}>
            Contacto
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="empresa-web" style={labelStyle}>Sitio web</label>
              <input
                id="empresa-web"
                type="url"
                maxLength={300}
                value={form.sitioWeb}
                onChange={e => updateField('sitioWeb', e.target.value)}
                placeholder="https://miempresa.mx"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label htmlFor="empresa-telefono" style={labelStyle}>Teléfono</label>
                <input
                  id="empresa-telefono"
                  type="tel"
                  maxLength={20}
                  value={form.telefono}
                  onChange={e => updateField('telefono', e.target.value)}
                  placeholder="999 123 4567"
                  style={inputStyle}
                />
              </div>
              <div>
                <label htmlFor="empresa-email" style={labelStyle}>Correo de contacto</label>
                <input
                  id="empresa-email"
                  type="email"
                  maxLength={100}
                  value={form.emailContacto}
                  onChange={e => updateField('emailContacto', e.target.value)}
                  placeholder="contacto@miempresa.mx"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Accesibilidad corporativa ── */}
        <section style={sectionCard}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
            Accesibilidad corporativa
          </h2>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 16px', lineHeight: 1.5 }}>
            Indica la infraestructura accesible disponible en tus instalaciones.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {ACCESIBILIDAD_SUGERIDA.map(tag => {
              const selected = form.accesibilidad.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleAccesibilidad(tag)}
                  aria-pressed={selected}
                  style={{
                    border: '1.5px solid',
                    borderColor: selected ? 'var(--primary)' : 'var(--border-color)',
                    background: selected ? 'color-mix(in oklch, var(--primary) 10%, transparent)' : 'var(--bg-warm)',
                    color: selected ? 'var(--primary)' : 'var(--fg2)',
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {selected ? '✓ ' : '+ '}{tag}
                </button>
              )
            })}
          </div>

          {/* Elementos personalizados ya agregados */}
          {form.accesibilidad.filter(t => !(ACCESIBILIDAD_SUGERIDA as readonly string[]).includes(t)).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {form.accesibilidad
                .filter(t => !(ACCESIBILIDAD_SUGERIDA as readonly string[]).includes(t))
                .map(tag => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
                      color: 'var(--primary)', border: '1.5px solid var(--primary)',
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeAccesibilidad(tag)}
                      aria-label={`Quitar ${tag}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, fontSize: 13, lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              maxLength={60}
              value={accesibilidadExtra}
              onChange={e => setAccesibilidadExtra(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addAccesibilidadExtra()
                }
              }}
              placeholder="Otro elemento accesible no listado..."
              style={inputStyle}
            />
            <button
              type="button"
              onClick={addAccesibilidadExtra}
              className="btn-secondary"
              style={{ padding: '0 18px', height: 42, borderRadius: 10, fontSize: 14, whiteSpace: 'nowrap' }}
            >
              Agregar
            </button>
          </div>
        </section>

        {/* ── Error de API ── */}
        {error && (
          <div role="alert" style={{ background: 'color-mix(in oklch, var(--color-error) 8%, transparent)', border: '1.5px solid color-mix(in oklch, var(--color-error) 25%, transparent)', color: 'var(--color-error)', borderRadius: 12, padding: '12px 16px', fontSize: 13.5, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* ── Acciones ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 40 }}>
          <button
            type="button"
            onClick={() => navigate('/empresa-portal')}
            className="btn-secondary"
            style={{ padding: '10px 22px', borderRadius: 10, fontSize: 14 }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={updatePerfil.isPending}
            style={{ padding: '10px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, opacity: updatePerfil.isPending ? 0.7 : 1 }}
          >
            {updatePerfil.isPending ? Icons.loader({ s: 16 }) : Icons.check({ s: 16 })}
            {updatePerfil.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </main>
  )
}
