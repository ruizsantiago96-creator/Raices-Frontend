/**
 * EmpresaOnboardingModal
 * =====================
 * Onboarding de EMPRESAS (personas morales).
 *
 * Sustuye por completo la bitácora de verificación individual: aquí NO se pide
 * CURP ni identificación oficial, porque una empresa no tiene CURP. La identidad
 * de una persona moral se acredita con la Constancia de Situación Fiscal (CSF).
 *
 * El formulario pide exactamente tres cosas:
 *   a) Tipo de categoría empresarial  → campo `categoria`  (PUT /instituciones/mi-institucion)
 *   b) Políticas / adaptaciones de inclusión → campo `servicios` (string[])
 *   c) Constancia de Situación Fiscal (CSF) → verificación oficial de la empresa
 *
 * El guardado va contra el endpoint de actualización del perfil de la institución
 * (`PUT /instituciones/mi-institucion`, vía `useUpdateMiInstitucion`).
 */
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import { useMiInstitucion, useUpdateMiInstitucion } from '@features/institutions'
import { useEsEmpresa } from '@features/auth/lib/empresaRole'
import type { Institution } from '../../../types/institutions'

/* ═══════════════════════════════════════════════════════════════════
   Catálogos
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Categorías-empresa. Los `value` son EXACTAMENTE el enum que valida
 * `UpdateInstitucionDto.categoria` en el backend (`@IsIn`), por lo que no
 * pueden cambiarse sin cambiar el DTO.
 */
export const CATEGORIAS_EMPRESA = [
  { value: 'laboral', label: 'Empleo y bolsa de trabajo', desc: 'Contratación, capacitación y colocación laboral inclusiva.' },
  { value: 'educativo', label: 'Educación y capacitación', desc: 'Formación, educación inclusiva y capacitación técnica.' },
  { value: 'social', label: 'Atención social y comunidad', desc: 'Apoyo social, rehabilitación y acompañamiento comunitario.' },
  { value: 'funcional', label: 'Servicios e inclusión funcional', desc: 'Servicios accesibles, infraestructura adaptada y atención directa.' },
] as const

export type CategoriaEmpresa = (typeof CATEGORIAS_EMPRESA)[number]['value']

/** Políticas/adaptaciones de inclusión que la empresa declara aplicar. */
export const POLITICAS_INCLUSION = [
  { id: 'accesibilidad_infraestructura', label: 'Infraestructura accesible', desc: 'Rampas, baños adaptados, señalética y rutas peatonales sin barreras.' },
  { id: 'flexibilidad_laboral', label: 'Flexibilidad laboral', desc: 'Jornadas flexibles, trabajo remoto o híbrido y horarios adaptados.' },
  { id: 'ajuste_razonable', label: 'Ajustes razonables en el puesto', desc: 'Adaptación de funciones, herramientas y ritmo de trabajo.' },
  { id: 'capacitacion_inclusiva', label: 'Capacitación en inclusión', desc: 'Personal capacitado en atención y acompañamiento de personas con discapacidad.' },
  { id: 'proceso_seleccion_inclusivo', label: 'Proceso de selección inclusivo', desc: 'Entrevistas accesibles y evaluación sin discriminación por discapacidad.' },
  { id: 'acompañamiento_laboral', label: 'Acompañamiento laboral', desc: 'Tutoría, mentoría y seguimiento durante la adaptación al puesto.' },
  { id: 'empresa_sostenible', label: 'Empresa social y sostenible', desc: 'Políticas internas de bienestar, diversidad e inclusión.' },
] as const

/* ═══════════════════════════════════════════════════════════════════
   Utilidades de lectura del estado actual
   ═══════════════════════════════════════════════════════════════════ */

const ETIQUETA_CAMPO: Record<string, string> = {
  laboral: 'Empleo y bolsa de trabajo',
  educativo: 'Educación y capacitación',
  social: 'Atención social y comunidad',
  funcional: 'Servicios e inclusión funcional',
}

/** Lee la categoría aceptando el alias en español que devuelve el backend. */
function leerCategoria(inst: Institution | null | undefined): string {
  const raw = inst?.category ?? inst?.categoria
  return typeof raw === 'string' ? raw : ''
}

/** Normaliza `servicios` (string[] u objetos) a etiquetas de texto. */
function leerServicios(inst: Institution | null | undefined): string[] {
  const raw = inst?.servicios
  if (!Array.isArray(raw)) return []
  return raw
    .map((s) => (typeof s === 'string' ? s : (s?.nombre ?? s?.name ?? '')))
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
}

function esCategoriaValida(valor: string): valor is CategoriaEmpresa {
  return CATEGORIAS_EMPRESA.some(c => c.value === valor)
}

/**
 * Determina qué falta para que el onboarding de la empresa esté completo.
 *
 * Nota de diseño: la CSF no tiene endpoint de persistencia (el único endpoint
 * actual, `POST /instituciones/validar-csf-qr`, solo lee el QR y no guarda el
 * archivo), así que la señal de completitud se apoya únicamente en estado de
 * servidor: `categoria` + políticas de inclusión. La CSF se exige al presentar
 * el alta, pero no vuelve a bloquear el modal después.
 */
export function getCamposOnboardingFaltantes(
  institucion: Institution | null | undefined,
): string[] {
  const faltan: string[] = []
  if (!esCategoriaValida(leerCategoria(institucion))) faltan.push('categoria')
  if (leerServicios(institucion).length === 0) faltan.push('politicasInclusión')
  return faltan
}

export function useEmpresaOnboardingPendiente(): { pendiente: boolean; cargando: boolean } {
  const { data: institucion, isLoading } = useMiInstitucion()
  return {
    pendiente: getCamposOnboardingFaltantes(institucion).length > 0,
    cargando: isLoading,
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════════ */

export interface EmpresaOnboardingModalProps {
  open: boolean
  onClose?: () => void
  onSaved?: () => void
}

const CSF_MAX_BYTES = 10 * 1024 * 1024
const CSF_MIMES = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp']
const CSF_EXTENSIONES = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp']

function extraerMensajeError(err: unknown): string {
  const axiosErr = err as {
    response?: { status?: number; data?: { message?: string | string[] } }
    message?: string
  }
  const status = axiosErr?.response?.status
  const data = axiosErr?.response?.data?.message

  if (Array.isArray(data)) return data.join('. ')
  if (typeof data === 'string' && data.trim()) return data

  // El endpoint de institución restringe por rol a `institucion`/`admin`.
  // Para una empresa eso se traduce en un 403: lo explicamos en lugar de dejar
  // un error técnico seco.
  if (status === 403) {
    return 'Tu cuenta (rol empresa) todavía no está autorizada por el servidor para actualizar el perfil de la institución. Tu información se guardó localmente; contacta a soporte si el error continúa.'
  }
  if (status === 404) {
    return 'No encontramos una entidad de institución asociada a tu cuenta. Regístrala primero para poder guardar los datos de tu empresa.'
  }
  return axiosErr?.message || 'No se pudo guardar la información de tu empresa.'
}

export default function EmpresaOnboardingModal({
  open,
  onClose,
  onSaved,
}: EmpresaOnboardingModalProps) {
  const isEmpresa = useEsEmpresa()
  const addToast = useUiStore(s => s.addToast)
  const { data: institucion } = useMiInstitucion()
  const updateMiInstitucion = useUpdateMiInstitucion()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tituloId = useId()
  const errorId = useId()

  const [categoria, setCategoria] = useState<string>('')
  const [politicas, setPoliticas] = useState<string[]>([])
  const [otraPolitica, setOtraPolitica] = useState('')
  const [csf, setCsf] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tocado, setTocado] = useState(false)

  // Siembra el formulario con lo que ya tiene la empresa, una sola vez por id de
  // entidad (mismo patrón que EditarEmpresaPage: evita pisar lo escrito).
  // `id` puede ser string o number según el backend: se normaliza a string.
  const institutionId = institucion?.id != null ? String(institucion.id) : null
  const semillaRef = useRef<string | null>(null)
  if (semillaRef.current !== institutionId) {
    semillaRef.current = institutionId
    const cat = leerCategoria(institucion)
    setCategoria(esCategoriaValida(cat) ? cat : '')
    setPoliticas(leerServicios(institucion))
    setOtraPolitica('')
    setCsf(null)
    setError(null)
    setTocado(false)
  }

  // Bloqueo de scroll del fondo mientras el modal está abierto
  useEffect(() => {
    if (!open) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [open])

  const servicios = construirServicios(politicas, otraPolitica)
  const faltaCategoria = !esCategoriaValida(categoria)
  const faltaPoliticas = servicios.length === 0

  if (!open) return null

  // Guarda en el origen: una empresa nunca debe ver este modal.
  if (!isEmpresa) return null

  const validar = (): boolean => {
    setTocado(true)
    if (faltaCategoria) {
      setError('Selecciona el tipo de categoría de tu empresa.')
      return false
    }
    if (faltaPoliticas) {
      setError('Selecciona al menos una política o adaptación de inclusión.')
      return false
    }
    if (csf === null) {
      setError('Adjunta tu Constancia de Situación Fiscal (CSF) para la verificación oficial.')
      return false
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validar()) return

    updateMiInstitucion.mutate(
      {
        categoria,
        servicios,
        // El backend todavía no expone un campo para la CSF (whitelist:true la
        // descarta). Se envía la referencia para que quede registrada en cuanto
        // exista el endpoint de almacenamiento.
        csfNombreArchivo: csf?.name,
      },
      {
        onSuccess: () => {
          addToast('Datos de tu empresa guardados correctamente', 'success')
          setTocado(false)
          onSaved?.()
          onClose?.()
        },
        onError: (err: unknown) => {
          const mensaje = extraerMensajeError(err)
          setError(mensaje)
          addToast(mensaje, 'error')
        },
      },
    )
  }

  const alternarPolitica = (id: string) => {
    setPoliticas(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const extensionOk = CSF_EXTENSIONES.some(ext => file.name.toLowerCase().endsWith(ext))
    if (!CSF_MIMES.includes(file.type) && !extensionOk) {
      setError('La CSF debe ser un PDF o una imagen (PNG, JPEG, GIF, WebP, BMP).')
      return
    }
    if (file.size > CSF_MAX_BYTES) {
      setError('El archivo supera el tamaño máximo permitido de 10 MB.')
      return
    }
    setError(null)
    setCsf(file)
  }

  const limpiarCsf = () => {
    setCsf(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ zIndex: 9999 }}
    >
      <div
        className="glass-card animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={error ? errorId : undefined}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          margin: 'auto',
          padding: 28,
          borderRadius: 20,
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'var(--primary-subtle)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {Icons.briefcase({ s: 22 })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              id={tituloId}
              style={{
                fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 800,
                color: 'var(--fg1)', margin: '0 0 4px', lineHeight: 1.25,
              }}
            >
              Completa el registro de tu empresa
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--fg3)', margin: 0, lineHeight: 1.5 }}>
              Como persona moral no tienes CURP: te verificamos con tu Constancia de Situación Fiscal.
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--fg3)', padding: 6, borderRadius: 8, display: 'flex', flexShrink: 0,
              }}
            >
              {Icons.x({ s: 20 })}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── a) Categoría empresarial ─────────────────────────── */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px' }}>
            <legend style={{ ...labelStyle, marginBottom: 8, padding: 0 }}>
              Tipo de categoría empresarial <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </legend>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              aria-required="true"
              aria-invalid={tocado && faltaCategoria}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                borderColor: tocado && faltaCategoria ? 'var(--color-error)' : 'var(--border-color)',
              }}
            >
              <option value="">Selecciona una categoría…</option>
              {CATEGORIAS_EMPRESA.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label} — {c.desc}
                </option>
              ))}
            </select>
            {categoria && (
              <p style={{ fontSize: 12.5, color: 'var(--fg3)', margin: '6px 0 0' }}>
                Se guardará como <strong>{ETIQUETA_CAMPO[categoria] ?? categoria}</strong>.
              </p>
            )}
          </fieldset>

          {/* ── b) Políticas de inclusión ────────────────────────── */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px' }}>
            <legend style={{ ...labelStyle, marginBottom: 4, padding: 0 }}>
              Políticas y adaptaciones de inclusión{' '}
              <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </legend>
            <p style={{ fontSize: 12.5, color: 'var(--fg3)', margin: '0 0 12px', lineHeight: 1.5 }}>
              ¿Cómo apoya tu empresa a las personas con discapacidad? Selecciona todas las que apliquen.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {POLITICAS_INCLUSION.map(p => {
                const marcado = politicas.includes(p.id)
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${marcado ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: marcado ? 'var(--primary-subtle)' : 'transparent',
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternarPolitica(p.id)}
                      style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--primary)', flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>
                        {p.label}
                      </span>
                      <span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg3)', lineHeight: 1.45 }}>
                        {p.desc}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>

            <div style={{ marginTop: 12 }}>
              <label htmlFor="empresa-otra-politica" style={labelStyle}>Otra política (opcional)</label>
              <input
                id="empresa-otra-politica"
                type="text"
                style={inputStyle}
                value={otraPolitica}
                onChange={e => setOtraPolitica(e.target.value)}
                placeholder="Ej. Becas de prácticas para personas con discapacidad"
                maxLength={120}
              />
            </div>
            {tocado && faltaPoliticas && (
              <p style={{ fontSize: 12.5, color: 'var(--color-error)', margin: '6px 0 0' }}>
                Selecciona al menos una política o escribe la tuya.
              </p>
            )}
          </fieldset>

          {/* ── c) Constancia de Situación Fiscal ────────────────── */}
          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 8px' }}>
            <legend style={{ ...labelStyle, marginBottom: 4, padding: 0 }}>
              Constancia de Situación Fiscal (CSF) <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
            </legend>
            <p style={{ fontSize: 12.5, color: 'var(--fg3)', margin: '0 0 12px', lineHeight: 1.5 }}>
              PDF o imagen con el código QR del SAT, máx. 10 MB. Es el documento con el que se
              verifica formalmente a una empresa.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/gif,image/webp,image/bmp,.pdf,.png,.jpg,.jpeg,.gif,.webp,.bmp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              aria-label="Seleccionar archivo de la Constancia de Situación Fiscal"
            />

            {csf ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 10,
                border: '1.5px solid rgba(34,155,88,0.3)', background: 'rgba(34,155,88,0.08)',
              }}>
                <span style={{ color: '#229B58', display: 'flex', flexShrink: 0 }}>{Icons.check({ s: 18 })}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: 'var(--fg1)', fontWeight: 600, wordBreak: 'break-all' }}>
                  {csf.name}
                </span>
                <span style={{ fontSize: 12, color: 'var(--fg3)', flexShrink: 0 }}>
                  {(csf.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  onClick={limpiarCsf}
                  aria-label="Quitar archivo"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--fg3)', padding: 4, display: 'flex', flexShrink: 0,
                  }}
                >
                  {Icons.x({ s: 16 })}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '20px 16px', cursor: 'pointer',
                  border: '2px dashed var(--border-color)', borderRadius: 12,
                  background: 'transparent', color: 'var(--fg2)',
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}
              >
                {Icons.upload({ s: 22 })}
                Seleccionar archivo de la CSF
              </button>
            )}
          </fieldset>

          {/* ── Error ────────────────────────────────────────────── */}
          {error && (
            <div
              id={errorId}
              role="alert"
              style={{
                marginTop: 16, padding: '12px 14px', borderRadius: 10,
                background: 'rgba(220,53,69,0.08)', border: '1.5px solid rgba(220,53,69,0.25)',
                color: 'var(--color-error)', fontSize: 13, lineHeight: 1.5,
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1 }}>{Icons.shieldAlert({ s: 16 })}</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── Footer ───────────────────────────────────────────── */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24,
            paddingTop: 18, borderTop: '1px solid var(--border-color)',
          }}>
            {onClose && (
              <button type="button" className="btn-secondary" onClick={onClose} disabled={updateMiInstitucion.isPending}>
                Ahora no
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={updateMiInstitucion.isPending}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {updateMiInstitucion.isPending
                ? (<>{Icons.loader({ s: 16 })} Guardando…</>)
                : 'Guardar y enviar a verificación'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Helpers locales
   ═══════════════════════════════════════════════════════════════════ */

/** Traduce la selección de políticas al campo `servicios` del backend. */
function construirServicios(politicas: string[], otraPolitica: string): string[] {
  const base = politicas.map(id => POLITICAS_INCLUSION.find(p => p.id === id)?.label ?? id)
  const otra = otraPolitica.trim()
  return otra ? [...base, otra] : base
}
