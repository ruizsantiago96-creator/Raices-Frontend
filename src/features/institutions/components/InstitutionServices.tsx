/**
 * InstitutionServices — Sección "Servicios y Programas" del detalle público.
 *
 * Renderiza el catálogo que la institución administró desde su panel privado
 * (`ServiciosTab`). El backend ya devuelve únicamente los servicios en estado
 * "Activo", pero aquí se vuelve a normalizar por robustez: acepta objetos,
 * strings con JSON serializado y etiquetas legadas de texto plano.
 *
 * Props:
 *   institution — Objeto de la institución
 */

import { Icons } from '@shared/components/shared'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import {
  useMisInscripcionesServicio,
  useInscribirServicio,
  useCancelarInscripcionServicio,
} from '../hooks/useInscripcionesServicio'
import type { Institution } from '@/types/institutions'

export interface ServicioPublico {
  id: string
  nombre: string
  categoria?: string | null
  descripcion?: string | null
  costo?: string | null
  horario?: string | null
  accesibilidad?: string[]
}

/** Cadena no vacía (también acepta números y arreglos), o `null`. */
function texto(valor: unknown): string | null {
  if (typeof valor === 'string') {
    const t = valor.trim()
    return t ? t : null
  }
  if (typeof valor === 'number' && Number.isFinite(valor)) return String(valor)
  if (Array.isArray(valor)) {
    const items = valor.map(v => texto(v)).filter((v): v is string => v !== null)
    return items.length > 0 ? items.join(', ') : null
  }
  return null
}

function parsearEntrada(entrada: unknown, idx: number): ServicioPublico | null {
  let fuente: Record<string, unknown> | null = null
  let etiquetaLegado: string | null = null

  if (typeof entrada === 'string') {
    const t = entrada.trim()
    if (!t) return null
    try {
      const parsed: unknown = JSON.parse(t)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        fuente = parsed as Record<string, unknown>
      } else {
        etiquetaLegado = t
      }
    } catch {
      etiquetaLegado = t // texto plano de versiones anteriores
    }
  } else if (entrada && typeof entrada === 'object' && !Array.isArray(entrada)) {
    fuente = entrada as Record<string, unknown>
  }

  // Documento legado: solo un texto plano, se asume publicado (Activo).
  if (!fuente) {
    return etiquetaLegado ? { id: `s-${idx}`, nombre: etiquetaLegado, costo: 'Gratuito' } : null
  }

  const nombre = texto(fuente.nombre) ?? texto(fuente.name)
  if (!nombre) return null

  // Solo servicios activos: `activo: false` o `estado` distinto de "Activo".
  const estado = texto(fuente.estado)
  if (estado && estado.toLowerCase() !== 'activo') return null
  if (fuente.activo === false) return null

  return {
    id: texto(fuente.id) ?? `s-${idx}`,
    nombre,
    categoria: texto(fuente.categoria),
    descripcion: texto(fuente.descripcion),
    // El panel usa `costo`; se acepta `precio` como alias.
    costo: texto(fuente.costo) ?? texto(fuente.precio) ?? 'Gratuito',
    horario: texto(fuente.horario) ?? texto(fuente.horarios),
    accesibilidad: Array.isArray(fuente.accesibilidad)
      ? fuente.accesibilidad.filter((a): a is string => typeof a === 'string')
      : [],
  }
}

/** Normaliza el arreglo `servicios` de la institución a servicios visibles. */
function normalizarServicios(raw: unknown): ServicioPublico[] {
  if (!Array.isArray(raw)) return []
  const servicios: ServicioPublico[] = []
  raw.forEach((entrada, idx) => {
    const servicio = parsearEntrada(entrada, idx)
    if (servicio) servicios.push(servicio)
  })
  return servicios
}

export interface InstitutionServicesProps {
  institution: Institution
}

export default function InstitutionServices({ institution }: InstitutionServicesProps) {
  const servicios = normalizarServicios(institution.servicios ?? institution.services)

  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToast } = useUiStore()
  const institucionId = String(institution.id)

  // Estados de MIS inscripciones (solo cuando hay sesión)
  const { data: misInscripciones } = useMisInscripcionesServicio(institucionId, { enabled: Boolean(user) })
  const inscribir = useInscribirServicio(institucionId)
  const cancelar = useCancelarInscripcionServicio(institucionId)

  const estados = new Map((misInscripciones?.datos ?? []).map(d => [d.servicioId, d.estado]))

  const manejarInscripcion = (servicio: ServicioPublico) => {
    if (!user) {
      addToast('Inicia sesión para inscribirte a este servicio', 'warning')
      navigate('/login')
      return
    }

    const estado = estados.get(servicio.id) ?? null

    if (estado === 'pendiente' || estado === 'activa') {
      cancelar.mutate(servicio.id, {
        onSuccess: () => addToast(
          estado === 'activa' ? 'Inscripción cancelada' : 'Solicitud de inscripción cancelada',
          'info',
        ),
        onError: () => addToast('No se pudo cancelar la inscripción. Intenta de nuevo.', 'error'),
      })
      return
    }

    inscribir.mutate(servicio.id, {
      onSuccess: () => addToast('Solicitud enviada: la institución revisará tu inscripción', 'success'),
      onError: () => addToast('No se pudo enviar la solicitud. Intenta de nuevo.', 'error'),
    })
  }

  return (
    <div className="animate-fade-in-up delay-2" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: 24,
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 24,
    }}>
      {/* Header */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 20, fontWeight: 700, color: 'var(--fg1)',
        margin: '0 0 20px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {Icons.briefcase({ s: 20 })} Servicios y Programas
        <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--fg3)' }}>
          ({servicios.length})
        </span>
      </h2>

      {servicios.length === 0 ? (
        /* Empty state */
        <div style={{
          textAlign: 'center',
          padding: '32px 20px',
          background: 'var(--bg-warm)',
          border: '1.5px dashed var(--border-color)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'color-mix(in oklch, var(--primary) 12%, transparent)',
            color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px',
          }}>
            {Icons.briefcase({ s: 22 })}
          </div>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0, lineHeight: 1.55 }}>
            Esta institución aún no ha publicado servicios
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
        }}>
          {servicios.map(servicio => (
            <div
              key={servicio.id}
              style={{
                background: 'var(--bg-warm)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              {/* Título + categoría */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: 0,
                  lineHeight: 1.35,
                }}>
                  {servicio.nombre}
                </h3>
                {servicio.categoria && (
                  <span style={{
                    flexShrink: 0,
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 9px', borderRadius: 12,
                    background: 'color-mix(in oklch, var(--primary) 12%, transparent)',
                    color: 'var(--primary)',
                  }}>
                    {servicio.categoria}
                  </span>
                )}
              </div>

              {/* Descripción */}
              {servicio.descripcion && (
                <p style={{ fontSize: 13, color: 'var(--fg2)', margin: 0, lineHeight: 1.55 }}>
                  {servicio.descripcion}
                </p>
              )}

              {/* Precio y horario */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 6,
                fontSize: 13, color: 'var(--fg3)',
                marginTop: 'auto', paddingTop: 8,
                borderTop: '1px dashed var(--border-color)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span aria-hidden="true">💰</span>
                  <span><strong style={{ color: 'var(--fg1)' }}>Precio:</strong> {servicio.costo || 'Gratuito'}</span>
                </span>
                {servicio.horario && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span aria-hidden="true">🕒</span>
                    <span><strong style={{ color: 'var(--fg1)' }}>Horario:</strong> {servicio.horario}</span>
                  </span>
                )}
              </div>

              {/* Accesibilidad */}
              {servicio.accesibilidad && servicio.accesibilidad.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {servicio.accesibilidad.map((tag, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--fg2)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 8px', borderRadius: 8,
                    }}>
                      ♿ {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Inscripción (flujo con aprobación de la institución) */}
              {(() => {
                const estado = estados.get(servicio.id) ?? null
                const ocupado = inscribir.isPending || cancelar.isPending
                const estiloBase: React.CSSProperties = {
                  width: '100%', marginTop: 4,
                  padding: '9px 14px', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
                  cursor: ocupado ? 'wait' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.15s ease',
                }

                if (estado === 'pendiente') {
                  return (
                    <button
                      type="button"
                      onClick={() => manejarInscripcion(servicio)}
                      disabled={ocupado}
                      title="Solicitud enviada. Haz clic para cancelarla"
                      style={{
                        ...estiloBase,
                        background: 'color-mix(in oklch, #D4944C 12%, transparent)',
                        border: '1px solid color-mix(in oklch, #D4944C 40%, transparent)',
                        color: '#D4944C',
                      }}
                    >
                      ⏳ Solicitud enviada (pendiente)
                    </button>
                  )
                }

                if (estado === 'activa') {
                  return (
                    <button
                      type="button"
                      onClick={() => manejarInscripcion(servicio)}
                      disabled={ocupado}
                      title="Inscrito. Haz clic para cancelar tu inscripción"
                      style={{
                        ...estiloBase,
                        background: 'rgba(34, 197, 94, 0.12)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        color: '#16A34A',
                      }}
                    >
                      {Icons.check({ s: 15 })} Inscrito
                    </button>
                  )
                }

                return (
                  <>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => manejarInscripcion(servicio)}
                      disabled={ocupado}
                      style={{ ...estiloBase, padding: '10px 14px' }}
                    >
                      {Icons.plus({ s: 15 })} Inscribirme
                    </button>
                    <span style={{ fontSize: 11, color: 'var(--fg3)', textAlign: 'center' }}>
                      Requiere aprobación de la institución
                    </span>
                  </>
                )
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
