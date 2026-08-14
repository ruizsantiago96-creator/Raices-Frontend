import { useState } from 'react'
import {
  useAdminVerificaciones,
  useAprobarVerificacion,
  useRechazarVerificacion
} from '../hooks/useAdmin'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, labelStyle } from '@shared/components/shared'

export default function IdentitiesTab() {
  const { addToast } = useUiStore()
  const [filterEstado, setFilterEstado] = useState('pendiente')
  const { data: queue = [], isLoading } = useAdminVerificaciones({ estado: filterEstado || undefined })

  const [activeReqId, setActiveReqId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)

  const approveVerif = useAprobarVerificacion(activeReqId)
  const rejectVerif = useRechazarVerificacion(activeReqId)

  const handleApprove = async (id) => {
    if (!window.confirm('¿Confirmas que deseas APROBAR la identidad de este usuario?')) return
    setActiveReqId(id)
    try {
      await approveVerif.mutateAsync()
      addToast('Usuario verificado con éxito', 'success')
      setActiveReqId(null)
    } catch {
      addToast('Error al aprobar la verificación', 'error')
      setActiveReqId(null)
    }
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectReason.trim()) {
      addToast('Debes especificar un motivo de rechazo', 'error')
      return
    }
    try {
      await rejectVerif.mutateAsync({ motivoRechazo: rejectReason.trim() })
      addToast('Verificación rechazada', 'info')
      setRejectOpen(false)
      setRejectReason('')
      setActiveReqId(null)
    } catch {
      addToast('Error al rechazar la verificación', 'error')
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* Title & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Cola de Verificación de Identidad</h2>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '4px 0 0' }}>Revisa CURPs e identificaciones oficiales subidas por los usuarios</p>
        </div>
        <div>
          <select
            className="onboarding-input auth-select"
            style={{ height: 38, fontSize: 13.5, padding: '0 12px' }}
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
          >
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
            <option value="">Todos</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 48, textClassName: 'text-center', color: 'var(--fg3)', fontSize: 14 }}>Cargando cola de solicitudes...</div>
      ) : queue.length === 0 ? (
        <div style={{ border: '1px dashed var(--border-color)', borderRadius: 12, padding: 48, textAlign: 'center', color: 'var(--fg3)', fontSize: 14 }}>
          No hay solicitudes de verificación en este momento.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {queue.map((req) => (
            <div
              key={req.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 24,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20
              }}
            >
              {/* User Info */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{req.usuarioNombre}</h4>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: req.estado === 'aprobado' ? 'rgba(16, 185, 129, 0.12)' : req.estado === 'pendiente' ? 'rgba(212, 148, 76, 0.12)' : 'rgba(220, 53, 69, 0.12)',
                    color: req.estado === 'aprobado' ? '#10B981' : req.estado === 'pendiente' ? '#D4944C' : '#DC3545',
                    textTransform: 'uppercase'
                  }}>
                    {req.estado}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg2)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div><strong>Email:</strong> {req.usuarioEmail}</div>
                  <div><strong>CURP declarada:</strong> {req.curp || 'No declarada'}</div>
                  <div><strong>Fecha subida:</strong> {new Date(req.fechaSubida).toLocaleString()}</div>
                  {req.motivoRechazo && (
                    <div style={{ color: '#DC3545', marginTop: 4 }}><strong>Motivo de rechazo:</strong> {req.motivoRechazo}</div>
                  )}
                </div>
              </div>

              {/* Document Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', minWidth: 200 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {req.documentoCurpUrl ? (
                    <a href={req.documentoCurpUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: 8, textDecoration: 'none', color: 'var(--fg1)', fontSize: 13, fontWeight: 600, background: 'var(--bg-surface)' }}>
                      {Icons.eye({ s: 14 })} Ver CURP
                    </a>
                  ) : (
                    <span style={{ fontSize: 12.5, color: 'var(--fg3)', padding: '8px 0' }}>Sin CURP física</span>
                  )}

                  {req.documentoIdentificacionUrl ? (
                    <a href={req.documentoIdentificacionUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: 8, textDecoration: 'none', color: 'var(--fg1)', fontSize: 13, fontWeight: 600, background: 'var(--bg-surface)' }}>
                      {Icons.eye({ s: 14 })} Ver Identificación
                    </a>
                  ) : (
                    <span style={{ fontSize: 12.5, color: 'var(--fg3)', padding: '8px 0' }}>Sin ID física</span>
                  )}
                </div>

                {/* Queue status actions */}
                {req.estado === 'pendiente' && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={activeReqId === req.id}
                      style={{ flex: 1, padding: '8px 14px', background: '#10B981', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: 'pointer' }}
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => { setActiveReqId(req.id); setRejectOpen(true) }}
                      disabled={activeReqId === req.id}
                      style={{ flex: 1, padding: '8px 14px', background: '#DC3545', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: 'pointer' }}
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── REJECTION REASON MODAL ── */}
      {rejectOpen && (
        <div onClick={() => setRejectOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: 20 }}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleRejectSubmit} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: 32, maxWidth: 440, width: '100%', position: 'relative' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Rechazar Solicitud</h3>
            <p style={{ fontSize: 13.5, color: 'var(--fg2)', marginBottom: 20 }}>Especifica la razón del rechazo para que el usuario pueda corregirla.</p>
            
            <div>
              <label style={labelStyle}>Motivo del rechazo *</label>
              <textarea
                required
                className="onboarding-input"
                style={{ marginTop: 6, height: 80, resize: 'none' }}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Ej. La imagen de la identificación oficial está borrosa o la CURP no coincide."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
              <button type="button" className="btn-secondary" onClick={() => setRejectOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ background: '#DC3545', border: 'none', padding: '10px 20px', borderRadius: 8, color: '#fff', fontWeight: 600 }}>
                Confirmar Rechazo
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
