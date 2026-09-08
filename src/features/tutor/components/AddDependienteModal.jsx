import { useState } from 'react'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import { DependentForm } from './DependentForm'

const card = {
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--glass-shadow)'
}

/**
 * Modal contenedor que delega la UI del formulario a DependentForm.
 *
 * @param {Object} props
 * @param {Function} props.onClose   - Cierra el modal
 * @param {Function} props.onSubmit  - Crea el dependiente (payload) => Promise
 * @param {boolean}  props.saving    - true mientras la mutación está en curso (deshabilita botones)
 * @param {Object}   props.catalogos - catálogos de parentescos, discapacidades, etapas de vida
 * @param {Object}   props.form      - estado actual del formulario (nombreCompleto, parentesco, necesidades, etapaVida, birth_date, crearCuenta, email, password)
 * @param {Function} props.onChange  - (key, value) => void — actualiza una campo del formulario
 */
export default function AddDependienteModal({ onClose, onSubmit, saving = false, catalogos = {}, form = {}, onChange }) {
  const PARENTESCOS = catalogos?.parentescos ?? []
  const DISABILIDADES = catalogos?.tiposDiscapacidad?.map(d => d.label ?? d) ?? []
  const ETAPAS_VIDA = catalogos?.etapasVida ?? []

  const listDiscapacidades = DISABILIDADES.filter(d => {
    const name = d.toLowerCase()
    return name.includes('motriz') || name.includes('visual') || name.includes('auditiva') || 
           name.includes('intelectual') || name.includes('psicosocial') || 
           name.includes('múltiple') || name.includes('multiple') || name.includes('otra')
  })
  const listCondiciones = DISABILIDADES.filter(d => !listDiscapacidades.includes(d))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombreCompleto.trim()) return

    const payload = {
      nombreCompleto: form.nombreCompleto.trim(),
      parentesco: form.parentesco,
      necesidades: form.necesidades,
      etapaVida: form.etapaVida || null,
      birth_date: form.birth_date || null,
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
    <DependentForm
      initial={null}
      onCancel={onClose}
      onSave={onSubmit}
      saving={saving}
      relationships={PARENTESCOS}
      disabilities={DISABILIDADES}
    />
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
