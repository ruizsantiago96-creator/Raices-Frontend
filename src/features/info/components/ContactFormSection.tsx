import { useState } from 'react'
import type { FormEvent, ChangeEvent, CSSProperties } from 'react'
import { Icons, inputStyle } from '@shared/components/shared'
import { CustomSelect } from '@shared/components/CustomSelect'
import { useEnviarContacto } from '../hooks/useEnviarContacto'

/* ── Opciones del selector de motivo ──────────────────────── */
const ASUNTOS = [
  { value: 'consulta', label: 'Consulta general' },
  { value: 'institucion', label: 'Soy una institución' },
  { value: 'empresa', label: 'Soy una empresa' },
  { value: 'soporte', label: 'Soporte técnico' },
  { value: 'otro', label: 'Otro motivo' },
] as const

const labelStyleContacto: CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--fg2)',
  marginBottom: 6,
  letterSpacing: '0.02em',
}

/** Mensaje de error inline por campo. */
function FieldError({ id, msg }: { id: string; msg: string }) {
  return (
    <p id={id} role="alert" style={{ fontSize: 13, color: 'var(--color-error)', margin: '4px 0 0', fontWeight: 600 }}>
      {msg}
    </p>
  )
}

export default function ContactFormSection() {
  const enviar = useEnviarContacto()
  const [values, setValues] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({})

  /** Validación en cliente (el backend re-valida con class-validator). */
  const validate = (): boolean => {
    const e: Partial<Record<keyof typeof values, string>> = {}
    if (values.nombre.trim().length < 3) e.nombre = 'Tu nombre debe tener al menos 3 caracteres.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) e.email = 'Escribe un correo electrónico válido.'
    if (!values.asunto) e.asunto = 'Selecciona el motivo de tu mensaje.'
    if (values.mensaje.trim().length < 20) e.mensaje = 'Cuéntanos un poco más: el mensaje necesita al menos 20 caracteres.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (!validate()) return
    enviar.mutate(values, {
      onSuccess: () => setValues({ nombre: '', email: '', asunto: '', mensaje: '' }),
    })
  }

  const set = (campo: keyof typeof values) => (
    ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setValues(v => ({ ...v, [campo]: ev.target.value }))
    // Limpia el error del campo mientras la persona corrige
    setErrors(err => (err[campo] ? { ...err, [campo]: undefined } : err))
  }

  const bordeError = (campo: keyof typeof values) =>
    errors[campo] ? '2px solid var(--color-error)' : '1px solid var(--border-color)'

  return (
    <section id="formulario" aria-labelledby="formulario-titulo" style={{ maxWidth: 720, margin: '0 auto', padding: '8px 48px 88px' }}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '48px 40px', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50% 50% 50% 14%',
          background: 'var(--primary-subtle)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          {Icons.mail({ s: 24 })}
        </div>
        <h2 id="formulario-titulo" style={{
          fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700,
          color: 'var(--fg1)', margin: '0 0 8px', textAlign: 'center',
        }}>
          Envíanos un mensaje
        </h2>
        <p style={{ fontSize: 15, color: 'var(--fg2)', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.6 }}>
          Respuesta en máximo 48 horas hábiles. Tus datos solo se usan para responderte.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Nombre */}
            <div>
              <label htmlFor="contacto-nombre" style={labelStyleContacto}>
                Nombre <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="contacto-nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                value={values.nombre}
                onChange={set('nombre')}
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? 'error-nombre' : undefined}
                style={{ ...inputStyle, border: bordeError('nombre') }}
              />
              {errors.nombre && <FieldError id="error-nombre" msg={errors.nombre} />}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contacto-email" style={labelStyleContacto}>
                Correo electrónico <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="contacto-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={set('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'error-email' : undefined}
                style={{ ...inputStyle, border: bordeError('email') }}
              />
              {errors.email && <FieldError id="error-email" msg={errors.email} />}
            </div>
          </div>

          {/* Asunto */}
          <div style={{ marginTop: 16 }}>
            <label htmlFor="contacto-asunto" style={labelStyleContacto}>
              Motivo <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <CustomSelect
              value={values.asunto}
              onChange={val => {
                const event = { target: { value: val } } as ChangeEvent<HTMLSelectElement>
                set('asunto')(event)
              }}
              placeholder="Selecciona el motivo…"
              options={ASUNTOS.map(a => ({ value: a.value, label: a.label }))}
            />
            {errors.asunto && <FieldError id="error-asunto" msg={errors.asunto} />}
          </div>

          {/* Mensaje */}
          <div style={{ marginTop: 16 }}>
            <label htmlFor="contacto-mensaje" style={labelStyleContacto}>
              Mensaje <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <textarea
              id="contacto-mensaje"
              name="mensaje"
              value={values.mensaje}
              onChange={set('mensaje')}
              rows={5}
              maxLength={2000}
              aria-invalid={!!errors.mensaje}
              aria-describedby={errors.mensaje ? 'error-mensaje mensaje-ayuda' : 'mensaje-ayuda'}
              style={{ ...inputStyle, height: 'auto', minHeight: 130, resize: 'vertical', border: bordeError('mensaje') }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 6 }}>
              <span id="mensaje-ayuda" style={{ fontSize: 12.5, color: 'var(--fg3)' }}>Máximo 2000 caracteres.</span>
              {errors.mensaje
                ? <FieldError id="error-mensaje" msg={errors.mensaje} />
                : <span style={{ fontSize: 12.5, color: 'var(--fg3)' }}>{values.mensaje.length}/2000</span>}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={enviar.isPending}
            style={{ fontSize: 16, padding: '14px 36px', minHeight: 52, width: '100%', marginTop: 24, opacity: enviar.isPending ? 0.6 : 1 }}
          >
            {enviar.isPending ? 'Enviando…' : 'Enviar mensaje'} {Icons.send({ s: 18 })}
          </button>
          <p aria-live="polite" style={{ fontSize: 13, color: 'var(--fg3)', textAlign: 'center', margin: '12px 0 0', minHeight: 18 }}>
            {enviar.isSuccess && '✅ Tu mensaje fue enviado. Te responderemos muy pronto.'}
          </p>
        </form>
      </div>
    </section>
  )
}
