import { useState, useMemo, useCallback } from 'react'
import {
  useAdminVerificaciones,
  useAprobarVerificacion,
  useRechazarVerificacion
} from '../hooks/useAdmin'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, labelStyle } from '@shared/components/shared'

/* ══════════════════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════════════════ */

const ROLE_LABELS = {
  pcd: 'Persona con discapacidad',
  tutor: 'Tutor / familiar',
  institution: 'Institución',
  admin: 'Admin',
}

const TIPO_LABELS = {
  curp: 'CURP',
  identificacion_oficial: 'Identificación oficial',
}

/** Agrupa documentos por usuarioId. */
function groupByUser(docs) {
  const map = new Map()
  for (const doc of docs) {
    const uid = doc.usuarioId
    if (!map.has(uid)) {
      map.set(uid, {
        usuarioId: uid,
        nombreUsuario: doc.nombreUsuario ?? doc.usuarioNombre ?? '—',
        emailUsuario: doc.emailUsuario ?? doc.usuarioEmail ?? '—',
        rolUsuario: doc.rolUsuario ?? '—',
        documentos: [],
      })
    }
    map.get(uid).documentos.push(doc)
  }
  return Array.from(map.values()).sort((a, b) => {
    // Priorizar usuarios con más documentos pendientes
    const pendingA = a.documentos.filter(d => d.estado === 'pendiente').length
    const pendingB = b.documentos.filter(d => d.estado === 'pendiente').length
    return pendingB - pendingA
  })
}

function userStatusSummary(user) {
  const pendientes = user.documentos.filter(d => d.estado === 'pendiente').length
  const aprobados = user.documentos.filter(d => d.estado === 'aprobado').length
  const rechazados = user.documentos.filter(d => d.estado === 'rechazado').length
  const parts = []
  if (pendientes) parts.push({ label: `${pendientes} pendiente${pendientes > 1 ? 's' : ''}`, color: '#D4944C', bg: 'rgba(212,148,76,0.12)' })
  if (aprobados) parts.push({ label: `${aprobados} aprobado${aprobados > 1 ? 's' : ''}`, color: '#10B981', bg: 'rgba(16,185,129,0.12)' })
  if (rechazados) parts.push({ label: `${rechazados} rechazado${rechazados > 1 ? 's' : ''}`, color: '#DC3545', bg: 'rgba(220,53,69,0.12)' })
  return parts
}

/* ══════════════════════════════════════════════════════════════════════
   Sub-componentes
   ══════════════════════════════════════════════════════════════════════ */

function DocumentRow({ doc, onApprove, onReject, isProcessing }) {
  const isPending = doc.estado === 'pendiente'
  const isCurp = doc.tipo === 'curp'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', background: 'var(--bg-warm, #f8fafc)',
      borderRadius: 10, gap: 12, flexWrap: 'wrap',
      opacity: isProcessing ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Left: icon + label + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: isCurp ? 'rgba(34,155,88,0.12)' : 'rgba(212,148,76,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {isCurp ? Icons.shieldCheck({ s: 16 }) : Icons.user({ s: 16 })}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg1)' }}>
            {TIPO_LABELS[doc.tipo] ?? doc.tipo}
          </div>
          {doc.numeroCurp && (
            <div style={{ fontSize: 11.5, color: 'var(--fg3)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doc.numeroCurp}
            </div>
          )}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, flexShrink: 0,
          background: doc.estado === 'aprobado' ? 'rgba(16,185,129,0.12)' : doc.estado === 'pendiente' ? 'rgba(212,148,76,0.12)' : 'rgba(220,53,69,0.12)',
          color: doc.estado === 'aprobado' ? '#10B981' : doc.estado === 'pendiente' ? '#D4944C' : '#DC3545',
          textTransform: 'uppercase', letterSpacing: '0.03em',
        }}>
          {doc.estado}
        </span>
      </div>

      {/* Right: view link + actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {doc.urlDocumento ? (
          <a
            href={doc.urlDocumento}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', border: '1px solid var(--border-color)',
              borderRadius: 8, textDecoration: 'none', color: 'var(--fg1)',
              fontSize: 12.5, fontWeight: 600, background: 'var(--bg-surface)',
            }}
          >
            {Icons.eye({ s: 13 })} Ver
          </a>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--fg3)', padding: '6px 0' }}>Sin archivo</span>
        )}

        {isPending && (
          <>
            <button
              onClick={() => onApprove(doc.id)}
              disabled={isProcessing}
              style={{
                padding: '6px 12px', background: '#10B981', border: 'none',
                color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 8,
                cursor: isProcessing ? 'default' : 'pointer',
                opacity: isProcessing ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {isProcessing ? (
                <span style={{ width: 10, height: 10, border: '1.5px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'block' }} />
              ) : Icons.check({ s: 12 })}
              Aprobar
            </button>
            <button
              onClick={() => onReject(doc.id)}
              disabled={isProcessing}
              style={{
                padding: '6px 12px', background: '#DC3545', border: 'none',
                color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 8,
                cursor: isProcessing ? 'default' : 'pointer',
                opacity: isProcessing ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {isProcessing ? (
                <span style={{ width: 10, height: 10, border: '1.5px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'block' }} />
              ) : Icons.x({ s: 12 })}
              Rechazar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function UserCard({ user, onApproveOne, onRejectOne, onApproveAll, onRejectAll, processingIds }) {
  const pending = useMemo(() => user.documentos.filter(d => d.estado === 'pendiente'), [user.documentos])
  const summary = useMemo(() => userStatusSummary(user), [user])
  const hasMultiplePending = pending.length > 1

  const earliestDate = useMemo(() => {
    const dates = user.documentos.map(d => d.fechaSubida).filter(Boolean).sort()
    return dates[0]
  }, [user.documentos])

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      {/* ── User Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              {user.nombreUsuario}
            </h4>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: 'rgba(99,102,241,0.1)', color: 'var(--primary, #6366f1)',
              textTransform: 'capitalize',
            }}>
              {ROLE_LABELS[user.rolUsuario] ?? user.rolUsuario}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg3)', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {Icons.mail({ s: 13 })} {user.emailUsuario}
            </span>
            {earliestDate && (
              <span style={{ fontSize: 12 }}>
                Subido {new Date(earliestDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Status badges */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {summary.map((s, i) => (
            <span key={i} style={{
              fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
              background: s.bg, color: s.color, whiteSpace: 'nowrap',
            }}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Documents ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {user.documentos.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            onApprove={onApproveOne}
            onReject={onRejectOne}
            isProcessing={processingIds.has(doc.id)}
          />
        ))}
      </div>

      {/* ── Rejection reason(s) ── */}
      {user.documentos.filter(d => d.motivoRechazo).length > 0 && (
        <div style={{
          padding: '12px 16px', background: 'rgba(220,53,69,0.06)',
          border: '1px solid rgba(220,53,69,0.15)', borderRadius: 10,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#DC3545', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Motivo de rechazo
          </div>
          {user.documentos.filter(d => d.motivoRechazo).map((doc) => (
            <div key={doc.id} style={{ fontSize: 13, color: 'var(--fg1)', lineHeight: 1.5, marginBottom: 4 }}>
              <strong>{TIPO_LABELS[doc.tipo] ?? doc.tipo}:</strong> {doc.motivoRechazo}
            </div>
          ))}
        </div>
      )}

      {/* ── Batch action bar (only when multiple pending) ── */}
      {hasMultiplePending && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12,
          borderTop: '1px solid var(--border-color)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--fg3)', flex: 1 }}>
            {pending.length} documentos pendientes
          </span>
          <button
            onClick={() => onApproveAll(pending)}
            disabled={pending.some(d => processingIds.has(d.id))}
            style={{
              padding: '8px 16px', background: '#10B981', border: 'none',
              color: '#fff', fontSize: 12.5, fontWeight: 700, borderRadius: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {Icons.check({ s: 13 })} Aprobar todos ({pending.length})
          </button>
          <button
            onClick={() => onRejectAll(pending)}
            disabled={pending.some(d => processingIds.has(d.id))}
            style={{
              padding: '8px 16px', background: '#DC3545', border: 'none',
              color: '#fff', fontSize: 12.5, fontWeight: 700, borderRadius: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {Icons.x({ s: 13 })} Rechazar todos ({pending.length})
          </button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   Main component
   ══════════════════════════════════════════════════════════════════════ */

export default function IdentitiesTab() {
  const { addToast } = useUiStore()
  const [filterEstado, setFilterEstado] = useState('pendiente')
  const { data: queue = [], isLoading } = useAdminVerificaciones({ estado: filterEstado || undefined })

  const approveVerif = useAprobarVerificacion()
  const rejectVerif = useRechazarVerificacion()

  // Track which document IDs are currently being processed
  const [processingIds, setProcessingIds] = useState(() => new Set())

  // Rejection modal state
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null) // null = single doc, array = batch
  const [rejectMode, setRejectMode] = useState('single') // 'single' | 'batch'

  const groupedUsers = useMemo(() => {
    if (!Array.isArray(queue)) return []
    return groupByUser(queue)
  }, [queue])

  // ── Process a single document ──────────────────────────
  const processDoc = useCallback(async (id, action, reason) => {
    setProcessingIds(prev => new Set(prev).add(id))
    try {
      if (action === 'approve') {
        await approveVerif.mutateAsync(id)
      } else {
        await rejectVerif.mutateAsync({ id, motivo: reason })
      }
      return true
    } catch {
      return false
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [approveVerif, rejectVerif])

  // ── Single doc actions ─────────────────────────────────
  const handleApproveOne = useCallback(async (id) => {
    const ok = await processDoc(id, 'approve')
    addToast(ok ? 'Documento aprobado' : 'Error al aprobar', ok ? 'success' : 'error')
  }, [processDoc, addToast])

  const handleRejectOne = useCallback((id) => {
    setRejectTarget(id)
    setRejectMode('single')
    setRejectReason('')
    setRejectOpen(true)
  }, [])

  // ── Batch actions ──────────────────────────────────────
  const handleApproveAll = useCallback(async (pendingDocs) => {
    if (!window.confirm(`¿Aprobar los ${pendingDocs.length} documentos de este usuario?`)) return
    let ok = 0, fail = 0
    for (const doc of pendingDocs) {
      const success = await processDoc(doc.id, 'approve')
      if (success) ok++
      else fail++
    }
    if (ok > 0) addToast(`${ok} documento${ok > 1 ? 's' : ''} aprobado${ok > 1 ? 's' : ''}`, 'success')
    if (fail > 0) addToast(`${fail} documento${fail > 1 ? 's' : ''} falló`, 'error')
  }, [processDoc, addToast])

  const handleRejectAll = useCallback((pendingDocs) => {
    setRejectTarget(pendingDocs)
    setRejectMode('batch')
    setRejectReason('')
    setRejectOpen(true)
  }, [])

  // ── Rejection modal submit ─────────────────────────────
  const handleRejectSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!rejectReason.trim()) {
      addToast('Debes especificar un motivo de rechazo', 'error')
      return
    }

    if (rejectMode === 'single') {
      const ok = await processDoc(rejectTarget, 'reject', rejectReason.trim())
      addToast(ok ? 'Documento rechazado' : 'Error al rechazar', ok ? 'success' : 'error')
    } else {
      // batch
      let ok = 0, fail = 0
      for (const doc of rejectTarget) {
        const success = await processDoc(doc.id, 'reject', rejectReason.trim())
        if (success) ok++
        else fail++
      }
      if (ok > 0) addToast(`${ok} documento${ok > 1 ? 's' : ''} rechazado${ok > 1 ? 's' : ''}`, 'success')
      if (fail > 0) addToast(`${fail} documento${fail > 1 ? 's' : ''} falló`, 'error')
    }

    setRejectOpen(false)
    setRejectReason('')
    setRejectTarget(null)
  }, [rejectMode, rejectTarget, rejectReason, processDoc, addToast])

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* ── Title & Filters ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Cola de Verificación de Identidad</h2>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '4px 0 0' }}>
            Revisa CURPs e identificaciones oficiales — {groupedUsers.length} usuario{groupedUsers.length !== 1 ? 's' : ''} en la cola
          </p>
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

      {/* ── Content ── */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              height: 140, borderRadius: 12, background: 'var(--border-color)',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      ) : groupedUsers.length === 0 ? (
        <div style={{ border: '1px dashed var(--border-color)', borderRadius: 12, padding: 48, textAlign: 'center', color: 'var(--fg3)', fontSize: 14 }}>
          No hay solicitudes de verificación en este momento.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {groupedUsers.map((user) => (
            <UserCard
              key={user.usuarioId}
              user={user}
              onApproveOne={handleApproveOne}
              onRejectOne={handleRejectOne}
              onApproveAll={handleApproveAll}
              onRejectAll={handleRejectAll}
              processingIds={processingIds}
            />
          ))}
        </div>
      )}

      {/* ── Rejection Reason Modal ── */}
      {rejectOpen && (
        <div onClick={() => setRejectOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: 20 }}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleRejectSubmit} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: 32, maxWidth: 480, width: '100%', position: 'relative', animation: 'fade-in 0.12s ease-out' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
              {rejectMode === 'batch' ? 'Rechazar documentos' : 'Rechazar documento'}
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--fg2)', marginBottom: 20 }}>
              {rejectMode === 'batch'
                ? `Se rechazarán ${rejectTarget?.length ?? 0} documentos con el siguiente motivo:`
                : 'Especifica la razón del rechazo para que el usuario pueda corregirla.'
              }
            </p>

            {rejectMode === 'batch' && rejectTarget && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {rejectTarget.map((doc) => (
                  <span key={doc.id} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                    background: 'rgba(220,53,69,0.1)', color: '#DC3545',
                  }}>
                    {TIPO_LABELS[doc.tipo] ?? doc.tipo}
                  </span>
                ))}
              </div>
            )}

            <div>
              <label style={labelStyle}>Motivo del rechazo *</label>
              <textarea
                required
                className="onboarding-input"
                style={{ marginTop: 6, height: 90, resize: 'none' }}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Ej. La imagen de la identificación oficial está borrosa o la CURP no coincide."
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
              <button type="button" className="btn-secondary" onClick={() => setRejectOpen(false)}>Cancelar</button>
              <button
                type="submit"
                className="btn-primary"
                style={{ background: '#DC3545', border: 'none', padding: '10px 20px', borderRadius: 8, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {Icons.x({ s: 14 })}
                {rejectMode === 'batch' ? `Rechazar ${rejectTarget?.length ?? 0} documentos` : 'Confirmar rechazo'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
