import { useState } from 'react'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'

/**
 * Constantes de catálogo (idénticas a las del backend)
 */
const PARENTESCOS = ['Hijo/a', 'Hermano/a', 'Nieto/a', 'Sobrino/a', 'Cónyuge', 'Tutor legal', 'Otro familiar']
const DISABILIDADES = ['Motriz', 'Visual', 'Auditiva', 'Intelectual', 'Psicosocial', 'TEA / Autismo', 'Síndrome de Down', 'Lenguaje', 'Múltiple', 'Otra']
const ETAPAS_VIDA = [
  { id: 'infancia', label: 'Infancia (0-12)' },
  { id: 'adolescencia', label: 'Adolescencia (13-17)' },
  { id: 'adulto_joven', label: 'Adulto joven (18-29)' },
  { id: 'adulto', label: 'Adulto (30-59)' },
  { id: 'mayor', label: 'Adulto mayor (60+)' },
]

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
export default function AddDependienteModal({ onClose, onSubmit, saving = false }) {
  const [form, setForm] = useState({
    nombreCompleto: '',
    parentesco: PARENTESCOS[0],
    tiposDiscapacidad: [],
    etapaVida: '',
    notas: '',
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
    onSubmit({
      nombreCompleto: form.nombreCompleto.trim(),
      parentesco: form.parentesco,
      tiposDiscapacidad: form.tiposDiscapacidad,
      etapaVida: form.etapaVida || null,
      notas: form.notas,
    })
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Agregar dependiente"
        style={{ ...card, padding: 28, maxWidth: 540, width: '100%', margin: 'auto' }}
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
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="dep-notas" style={labelStyle}>Notas (opcional)</label>
            <textarea
              id="dep-notas"
              value={form.notas}
              onChange={set('notas')}
              rows={3}
              placeholder="Información útil: terapias actuales, intereses, lo que necesita..."
              style={{ ...inputStyle, height: 'auto', paddingTop: 12, paddingBottom: 12, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* ── Acciones ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !form.nombreCompleto.trim()}
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
