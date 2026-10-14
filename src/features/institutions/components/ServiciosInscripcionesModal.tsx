/**
 * ServiciosInscripcionesModal — Personas inscritas a un servicio (panel privado).
 *
 * Muestra quiénes se inscribieron (con nombre, correo y fecha) para que la
 * institución pueda aprobar/rechazar solicitudes pendientes y ubicar a su
 * audiencia al crear foros y publicaciones.
 *
 * Props:
 *   institucionId   — ID de la institución (dueña de la lista)
 *   servicioId      — ID del servicio dentro del catálogo
 *   servicioNombre  — Nombre del servicio (encabezado)
 *   onCrearPublicacion — Atajo: abre el composer de publicaciones precargado
 *   onCrearForo        — Atajo: abre la creación de foros precargada
 *   onClose        — Cierra el modal
 */

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Icons } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import {
  useInscripcionesDeServicio,
  useResolverInscripcionServicio,
  type EstadoInscripcion,
} from '../hooks/useInscripcionesServicio'

const FILTROS: Array<{ valor: EstadoInscripcion | 'todas'; etiqueta: string }> = [
  { valor: 'todas', etiqueta: 'Todos' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'activa', etiqueta: 'Inscritos' },
  { valor: 'rechazada', etiqueta: 'Rechazados' },
]

const ESTILOS_ESTADO: Record<string, { background: string; color: string; label: string }> = {
  pendiente: { background: 'rgba(212, 148, 76, 0.14)', color: '#D4944C', label: '⏳ Pendiente' },
  activa: { background: 'rgba(34, 197, 94, 0.14)', color: '#16A34A', label: '✓ Inscrito' },
  rechazada: { background: 'color-mix(in oklch, var(--color-error) 12%, transparent)', color: 'var(--color-error)', label: '✗ Rechazado' },
  cancelada: { background: 'var(--bg-warm)', color: 'var(--fg3)', label: 'Cancelado' },
}

export interface ServiciosInscripcionesModalProps {
  institucionId: string
  servicioId: string
  servicioNombre: string
  onCrearPublicacion: () => void
  onCrearForo: () => void
  onClose: () => void
}

export default function ServiciosInscripcionesModal({
  institucionId,
  servicioId,
  servicioNombre,
  onCrearPublicacion,
  onCrearForo,
  onClose,
}: ServiciosInscripcionesModalProps) {
  const { addToast } = useUiStore()
  const { data, isLoading } = useInscripcionesDeServicio(institucionId, servicioId)
  const resolver = useResolverInscripcionServicio(institucionId)
  const [filtro, setFiltro] = useState<EstadoInscripcion | 'todas'>('todas')

  const datos = data?.datos ?? []
  const visibles = filtro === 'todas' ? datos : datos.filter(d => d.estado === filtro)
  const correos = datos.map(d => d.usuario?.email).filter(Boolean) as string[]

  const copiarCorreos = async () => {
    if (correos.length === 0) {
      addToast('Aún no hay personas inscritas en este servicio', 'warning')
      return
    }
    try {
      await navigator.clipboard.writeText(correos.join(', '))
      addToast(`${correos.length} correo${correos.length === 1 ? '' : 's'} copiado${correos.length === 1 ? '' : 's'} al portapapeles`, 'success')
    } catch {
      addToast('No se pudieron copiar los correos', 'error')
    }
  }

  const responder = (inscripcionId: string, accion: 'aprobar' | 'rechazar') => {
    resolver.mutate(
      { servicioId, inscripcionId, accion },
      {
        onSuccess: () => addToast(accion === 'aprobar' ? 'Inscripción aprobada' : 'Solicitud rechazada', 'success'),
        onError: () => addToast('No se pudo actualizar la solicitud', 'error'),
      },
    )
  }

  const contar = (valor: EstadoInscripcion | 'todas') =>
    valor === 'todas' ? datos.length : datos.filter(d => d.estado === valor).length

  const estiloBotonAccion: React.CSSProperties = {
    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
    border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
    color: 'var(--fg2)', cursor: resolver.isPending ? 'wait' : 'pointer',
    fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card animate-scale-in"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
          padding: 28, borderRadius: 16, margin: 'auto', boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>
              👥 Personas inscritas
            </h3>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>
              Servicio: <strong style={{ color: 'var(--fg2)' }}>{servicioNombre}</strong>
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4 }}>
            {Icons.x({ s: 18 })}
          </button>
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--fg3)', margin: '8px 0 16px', lineHeight: 1.5 }}>
          Aprueba las solicitudes pendientes y usa esta audiencia para crear foros y publicaciones dirigidos a este servicio.
        </p>

        {/* Filtros por estado */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {FILTROS.map(f => {
            const activo = filtro === f.valor
            return (
              <button
                key={f.valor}
                type="button"
                onClick={() => setFiltro(f.valor)}
                style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 700,
                  border: `1px solid ${activo ? 'var(--primary)' : 'var(--border-color)'}`,
                  background: activo ? 'color-mix(in oklch, var(--primary) 12%, transparent)' : 'var(--bg-surface)',
                  color: activo ? 'var(--primary)' : 'var(--fg2)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                {f.etiqueta} ({contar(f.valor)})
              </button>
            )
          })}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 0', color: 'var(--fg3)', fontSize: 14, gap: 8 }}>
            {Icons.loader({ s: 16 })} Cargando inscritos...
          </div>
        ) : visibles.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 20px',
            background: 'var(--bg-warm)', border: '1.5px dashed var(--border-color)', borderRadius: 12,
          }}>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0, lineHeight: 1.55 }}>
              {filtro === 'todas'
                ? 'Aún no hay personas inscritas a este servicio'
                : `No hay solicitudes en estado "${FILTROS.find(f => f.valor === filtro)?.etiqueta.toLowerCase()}"`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visibles.map(inscripcion => {
              const usuario = inscripcion.usuario
              const estilo = ESTILOS_ESTADO[inscripcion.estado] ?? ESTILOS_ESTADO.cancelada
              const iniciales = (usuario?.nombre ?? '?').trim().slice(0, 1).toUpperCase()
              return (
                <div
                  key={inscripcion.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--border-color)', background: 'var(--bg-warm)',
                  }}
                >
                  {/* Avatar */}
                  {usuario?.urlAvatar ? (
                    <img
                      src={usuario.urlAvatar}
                      alt={usuario.nombre}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: 'color-mix(in oklch, var(--primary) 15%, transparent)',
                      color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 16,
                    }}>
                      {iniciales}
                    </div>
                  )}

                  {/* Datos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{usuario?.nombre ?? 'Usuario de Raíces'}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {usuario?.email || 'Sin correo registrado'}
                      {inscripcion.fechaCreacion && (
                        <> · {new Date(inscripcion.fechaCreacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                      )}
                    </div>
                  </div>

                  {/* Estado / acciones */}
                  {inscripcion.estado === 'pendiente' ? (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => responder(inscripcion.id, 'aprobar')}
                        disabled={resolver.isPending}
                        style={{ ...estiloBotonAccion, background: 'rgba(34, 197, 94, 0.14)', color: '#16A34A', border: '1px solid rgba(34, 197, 94, 0.4)' }}
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() => responder(inscripcion.id, 'rechazar')}
                        disabled={resolver.isPending}
                        style={{ ...estiloBotonAccion, color: 'var(--color-error)' }}
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : (
                    <span style={{
                      fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                      background: estilo.background, color: estilo.color, whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {estilo.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Acciones rápidas: contactar a la audiencia */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20,
          paddingTop: 16, borderTop: '1px solid var(--border-color)',
        }}>
          <button
            type="button"
            onClick={copiarCorreos}
            style={{
              ...estiloBotonAccion, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', fontSize: 13,
            }}
          >
            📋 Copiar correos ({correos.length})
          </button>
          <button
            type="button"
            onClick={onCrearPublicacion}
            disabled={datos.length === 0}
            title={datos.length === 0 ? 'Aún no hay personas inscritas' : 'Crear una publicación dirigida a esta audiencia'}
            style={{
              ...estiloBotonAccion, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', fontSize: 13,
              opacity: datos.length === 0 ? 0.55 : 1,
            }}
          >
            ✍️ Crear publicación
          </button>
          <button
            type="button"
            onClick={onCrearForo}
            disabled={datos.length === 0}
            title={datos.length === 0 ? 'Aún no hay personas inscritas' : 'Crear un foro para esta audiencia'}
            style={{
              ...estiloBotonAccion, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', fontSize: 13,
              opacity: datos.length === 0 ? 0.55 : 1,
            }}
          >
            💬 Crear foro
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
