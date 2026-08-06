import { useState } from 'react'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'

// Los catálogos se reciben via props (catalogos) desde el componente padre

const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }

/**
 * Modal para crear un nuevo dependiente.
 *
 * @param {Object} props
 * @param {Function} props.onClose   - Cierra el modal
 * @param {Function} props.onSubmit  - Recibe el payload del formulario.
 *                                     Inyecta aquí la mutación: (payload) => add.mutate(payload, { onSuccess, onError })
 * @param {boolean}  props.saving    - true mientras la mutación está en curso (deshabilita botones)
 */
export default function AddDependienteModal({ onClose, onSubmit, saving = false, catalogos = {} }) {
  const PARENTESCOS = catalogos?.parentescos ?? []
  const DISABILIDADES = catalogos?.tiposDiscapacidad?.map(d => d.label ?? d) ?? []
  const ETAPAS_VIDA = catalogos?.etapasVida ?? []

  const [form, setForm] = useState({
    nombreCompleto: '',
    parentesco: PARENTESCOS[0] ?? '',
    tiposDiscapacidad: [],
    etapaVida: '',
    rangoEdad: '',
    notas: '',
    // Campos para crear cuenta Firebase
    crearCuenta: false,
    email: '',
    password: '',
  })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const toggleDiscapacidad = (d) =>
    setForm((f) => ({
      ...f,
      tiposDiscapacidad: f.tiposDiscapacidad.includes(d)
        ? f.tiposDiscapacidad.filter((x) => x !== d)
        : [...f.tiposDiscapacidad, d],
    }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombreCompleto.trim()) return
    
    const payload = {
      nombreCompleto: form.nombreCompleto.trim(),
      parentesco: form.parentesco,
      tiposDiscapacidad: form.tiposDiscapacidad,
      etapaVida: form.etapaVida || null,
      rangoEdad: form.rangoEdad || null,
      notas: form.notas,
    }

    // Incluir datos de cuenta si se activó la opción
    if (form.crearCuenta && form.email.trim() && form.password) {
      payload.crearCuenta = true
      payload.email = form.email.trim()
      payload.password = form.password
    }

    onSubmit(payload)
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Agregar dependiente"
        style={{ ...card, padding: 28, maxWidth: 540, width: '100%', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
            Agregar persona
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={closeBtnStyle}
          >
            {Icons.x({ s: 18 })}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Nombre completo ── */}
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-nombre" style={labelStyle}>Nombre completo</label>
            <input
              id="dep-nombre"
              style={inputStyle}
              value={form.nombreCompleto}
              onChange={set('nombreCompleto')}
              required
              placeholder="Ej. Mateo Pérez"
              autoFocus
            />
          </div>

          {/* ── Parentesco ── */}
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-parentesco" style={labelStyle}>Relación contigo</label>
            <select
              id="dep-parentesco"
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.parentesco}
              onChange={set('parentesco')}
            >
              {PARENTESCOS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* ── Etapa de vida ── */}
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-etapa" style={labelStyle}>Etapa de vida</label>
            <select
              id="dep-etapa"
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.etapaVida}
              onChange={set('etapaVida')}
            >
              <option value="">Sin especificar</option>
              {ETAPAS_VIDA.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* ── Rango de Edad ── */}
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-rango" style={labelStyle}>Rango de Edad</label>
            <input
              id="dep-rango"
              style={inputStyle}
              value={form.rangoEdad}
              onChange={set('rangoEdad')}
              placeholder="Ej. 0-12"
            />
          </div>

          {/* ── Tipos de discapacidad ── */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 18px' }}>
            <legend style={{ ...labelStyle, padding: 0 }}>Tipo(s) de discapacidad</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {DISABILIDADES.map((d) => {
                const active = form.tiposDiscapacidad.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDiscapacidad(d)}
                    aria-pressed={active}
                    style={{
                      padding: '8px 14px',
                      minHeight: 44,
                      borderRadius: 'var(--radius-pill)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      fontWeight: 600,
                      border: active ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                      background: active ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                      color: active ? 'var(--primary)' : 'var(--fg2)',
                    }}
                  >
                    {active && <span aria-hidden="true">✓ </span>}{d}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {/* ── Notas ── */}
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-notas" style={labelStyle}>Notas (opcional)</label>
            <textarea
              id="dep-notas"
              style={{ ...inputStyle, height: 80, resize: 'vertical' }}
              value={form.notas}
              onChange={(e) => setForm(f => ({ ...f, notas: e.target.value }))}
              placeholder="Información útil: terapias actuales, intereses, lo que necesita..."
            />
          </div>

          {/* ── Crear cuenta para el dependiente ── */}
          <div style={{ marginBottom: 18, padding: 16, borderRadius: 12, background: 'var(--bg-warm)', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.crearCuenta}
                onChange={(e) => setForm(f => ({ ...f, crearCuenta: e.target.checked }))}
                style={{ width: 20, height: 20, accentColor: 'var(--primary)' }}
              />
              <div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg1)' }}>Crear cuenta de acceso</span>
                <p style={{ fontSize: 13, color: 'var(--fg2)', margin: '2px 0 0' }}>
                  Permite que {form.nombreCompleto || 'esta persona'} inicie sesión en la plataforma
                </p>
              </div>
            </label>

            {form.crearCuenta && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label htmlFor="dep-email" style={labelStyle}>Correo electrónico</label>
                  <input
                    id="dep-email"
                    type="email"
                    style={inputStyle}
                    value={form.email}
                    onChange={set('email')}
                    required
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                <div>
                  <label htmlFor="dep-password" style={labelStyle}>Contraseña</label>
                  <input
                    id="dep-password"
                    type="password"
                    style={inputStyle}
                    value={form.password}
                    onChange={set('password')}
                    required={form.crearCuenta}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                  />
                  <p style={{ fontSize: 12, color: 'var(--fg3)', margin: '6px 0 0' }}>
                    La cuenta se creará en Firebase para que puedan iniciar sesión
                  </p>
                </div>
              </div>
            )}
          </div>



          {/* ── Acciones ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={saving}
              style={{
                fontSize: 14.5,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#F3D6E1',
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.2s ease',
                opacity: saving ? 0.6 : 1,
              }}
              onMouseEnter={e => !saving && (e.currentTarget.style.background = '#E8BCCF')}
              onMouseLeave={e => !saving && (e.currentTarget.style.background = '#F3D6E1')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !form.nombreCompleto.trim()}
              style={{
                fontSize: 14.5,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                opacity: (saving || !form.nombreCompleto.trim()) ? 0.6 : 1,
              }}
            >
              {saving ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Estilos ── */
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
  overflowY: 'auto',
}

const closeBtnStyle = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: '2px solid var(--border-color)',
  background: 'var(--bg-surface)',
  color: 'var(--fg2)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
