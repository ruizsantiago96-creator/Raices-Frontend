import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@shared/lib/api'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, hashColor } from '@shared/components/shared'
import { useAllInstitutions, usePendingInstitutions, useApproveInstitution, useRejectInstitution, useToggleVerifyInstitution, useUpdateAdminInstitution } from '@features/institutions'
import { Card, Skeleton, EmptyState } from './AdminUI'

function EmailCell({ inst }) {
  // Always call hooks at the top level (rules of hooks)
  const { data: detail, isLoading } = useQuery({
    queryKey: ['admin', 'institution-detail', inst.id],
    queryFn: () => api.get(`/instituciones/${inst.id}`).then(r => r.data?.datos ?? r.data),
    staleTime: 5 * 60 * 1000,
    enabled: !!inst.id,
  })

  // If the emails/correos array is present, display it
  const correos = inst.correos ?? inst.emails ?? inst.correosContacto
  if (Array.isArray(correos) && correos.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {correos.map((c, idx) => (
          <div key={idx} style={{ fontSize: 11.5, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {Icons.mail({ s: 10 })} <span>{typeof c === 'string' ? c : c.email ?? c.correo ?? String(c)}</span>
          </div>
        ))}
      </div>
    )
  }

  // If a direct email property is present, display it
  const directEmail = inst.email ?? inst.emailContacto ?? inst.correo ?? inst.correoElectronico
  if (directEmail) {
    return (
      <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {Icons.mail({ s: 10 })} <span>{directEmail}</span>
      </div>
    )
  }

  // Otherwise, fallback to fetching the detailed institution info on-demand
  if (isLoading) {
    return <span style={{ fontSize: 11.5, color: 'var(--fg3)', opacity: 0.6 }}>Cargando correo...</span>
  }

  const email = detail?.email ?? detail?.emailContacto ?? detail?.correo ?? detail?.correoElectronico
  if (email) {
    return (
      <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {Icons.mail({ s: 10 })} <span>{email}</span>
      </div>
    )
  }

  return <div style={{ fontSize: 12, color: 'var(--fg3)' }}>—</div>
}

const INST_PAGE_SIZE = 8

export default function InstitutionsTab() {
  const { addToast } = useUiStore()
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionMenuId, setActionMenuId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [editInst, setEditInst] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const actionMenuRef = useRef(null)
  const [menuPos, setMenuPos] = useState(null)

  const { data: pending = [], isLoading: _pLoad } = usePendingInstitutions()
  const { data: all = [], isLoading: _aLoad } = useAllInstitutions()
  const approve = useApproveInstitution()
  const reject = useRejectInstitution()
  const verify = useToggleVerifyInstitution()
  const updateInst = useUpdateAdminInstitution()

  useEffect(() => {
    const handler = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) { setActionMenuId(null) }
    }
    if (actionMenuId) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [actionMenuId])

  const pendingVerification = all.filter(inst => !inst.is_verified && inst.is_active)
  const combinedPendingMap = new Map()
  for (const inst of [...pending, ...pendingVerification]) {
    if (!combinedPendingMap.has(inst.id)) combinedPendingMap.set(inst.id, inst)
  }
  const combinedPending = [...combinedPendingMap.values()]

  const baseRows = filter === 'pending' ? combinedPending : all
  const rows = search.trim()
    ? baseRows.filter(inst => {
        const q = search.toLowerCase()
        return (inst.name ?? '').toLowerCase().includes(q) || (inst.city ?? '').toLowerCase().includes(q) || (inst.category ?? '').toLowerCase().includes(q)
      })
    : baseRows
  const isLoading = filter === 'pending' ? (_pLoad || _aLoad) : _aLoad
  const totalPages = Math.max(1, Math.ceil(rows.length / INST_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = rows.slice((safePage - 1) * INST_PAGE_SIZE, safePage * INST_PAGE_SIZE)

  const doApprove = (id) => approve.mutate(id, { onSuccess: () => addToast('Institución aprobada', 'success') })
  const doVerify = (id) => verify.mutate(id, { onSuccess: (d) => { addToast(d.is_verified ? 'Marcada como verificada' : 'Verificación retirada', 'success'); setActionMenuId(null) } })
  const doReject = () => {
    reject.mutate(confirm.id, { onSuccess: () => { addToast('Institución eliminada', 'success'); setConfirm(null); setActionMenuId(null) } })
  }
  const doEdit = () => {
    if (!editInst) return
    updateInst.mutate({ id: editInst.id, ...editForm }, {
      onSuccess: () => { addToast('Institución actualizada', 'success'); setEditInst(null) },
      onError: (e) => addToast(e.response?.data?.message ?? 'Error al actualizar', 'error'),
    })
  }
  const openEdit = (inst) => {
    setEditInst(inst)
    setEditForm({ name: inst.name ?? '', email: inst.email ?? '' })
    setActionMenuId(null)
  }

  const inputStyle = { height: 40, padding: '0 12px 0 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)', width: '100%' }

  return (
    <div>
      {/* Toolbar: filters + search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ k: 'pending', l: `Pendientes (${combinedPending.length})` }, { k: 'all', l: `Todas (${all.length})` }].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              style={{ padding: '7px 16px', borderRadius: 20, border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                background: filter === f.k ? 'var(--primary)' : 'var(--bg-surface)', color: filter === f.k ? '#fff' : 'var(--fg2)' }}>
              {f.l}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 220, marginLeft: 'auto' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)' }}>{Icons.search({ s: 16 })}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, ciudad o categoría..."
            style={inputStyle} />
        </div>
      </div>

      {isLoading ? (
        <Card><Skeleton h={40} style={{ marginBottom: 12 }} /><Skeleton h={40} style={{ marginBottom: 12 }} /><Skeleton h={40} /></Card>
      ) : rows.length === 0 ? (
        <EmptyState icon={Icons.check({ s: 32 })} title={filter === 'pending' ? 'Sin instituciones pendientes' : 'No hay instituciones'} sub={filter === 'pending' ? 'Todas las solicitudes han sido procesadas' : null} />
      ) : (
        <>
          <div className="responsive-table-wrap" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
            <table className="responsive-table" style={{ width: '100%', minWidth: 750, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'color-mix(in oklch, var(--bg-warm) 60%, var(--bg-surface))' }}>
                  {['Institución', 'Categoría', 'Ciudad', 'Estado', 'Verificada', 'Acciones'].map(h => (
                    <th key={h + 'inst'} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((inst, i) => (
                  <tr key={inst.id} style={{ borderBottom: i < paged.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'color-mix(in oklch, var(--primary) 2%, var(--bg-surface))'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: hashColor(inst.name ?? ''), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {(inst.name ?? '?')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{inst.name}</div>
                          <EmailCell inst={inst} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: 'color-mix(in oklch, var(--color-comunidad) 14%, transparent)', color: 'var(--color-comunidad)' }}>{inst.category ?? '—'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--fg2)' }}>{inst.city ?? '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        background: inst.is_active ? 'color-mix(in oklch, var(--color-artes) 14%, transparent)' : 'color-mix(in oklch, var(--color-empleo) 14%, transparent)',
                        color: inst.is_active ? 'var(--color-artes)' : 'var(--color-empleo)' }}>
                        {inst.is_active ? 'Activa' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        background: inst.is_verified ? 'color-mix(in oklch, var(--color-artes) 14%, transparent)' : 'color-mix(in oklch, var(--color-error) 14%, transparent)',
                        color: inst.is_verified ? 'var(--color-artes)' : 'var(--color-error)' }}>
                        {inst.is_verified ? 'Verificada' : 'No verificada'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', position: 'relative' }}>
                      <button onClick={(e) => { if (actionMenuId === inst.id) { setActionMenuId(null); setMenuPos(null) } else { const r = e.currentTarget.getBoundingClientRect(); setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right - 16 }); setActionMenuId(inst.id) } }}
                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg3)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-cool)'; e.currentTarget.style.color = 'var(--fg1)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--fg3)' }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                      </button>
                      {actionMenuId === inst.id && menuPos && createPortal(
                        <div ref={actionMenuRef} style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, width: 200, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', zIndex: 9999, padding: '6px 0', animation: 'fade-in 0.12s ease-out' }}>
                          <button onClick={() => openEdit(inst)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--fg2)', fontFamily: 'var(--font-body)', textAlign: 'left' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-cool)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {Icons.sliders({ s: 15 })} Configuración
                          </button>
                          {!inst.is_active && (
                            <button onClick={() => { doApprove(inst.id); setActionMenuId(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--color-artes)', fontFamily: 'var(--font-body)', textAlign: 'left' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-cool)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              {Icons.check({ s: 15 })} Aprobar
                            </button>
                          )}
                          {inst.is_active && (
                            <button onClick={() => doVerify(inst.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-body)', textAlign: 'left' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-cool)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              {Icons.shield({ s: 15 })} {inst.is_verified ? 'Quitar verificación' : 'Verificar'}
                            </button>
                          )}
                          <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 12px' }} />
                          <button onClick={() => { setConfirm(inst); setActionMenuId(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--color-error)', fontFamily: 'var(--font-body)', textAlign: 'left' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-cool)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {Icons.x({ s: 15 })} Eliminar
                          </button>
                        </div>,
                        document.body
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: safePage === 1 ? 'transparent' : 'var(--bg-surface)', color: safePage === 1 ? 'var(--fg3)' : 'var(--fg2)', cursor: safePage === 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
                    background: p === safePage ? 'var(--primary)' : 'transparent', color: p === safePage ? '#fff' : 'var(--fg3)', transition: 'all 0.15s' }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: safePage === totalPages ? 'transparent' : 'var(--bg-surface)', color: safePage === totalPages ? 'var(--fg3)' : 'var(--fg2)', cursor: safePage === totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editInst && (
        <div onClick={() => setEditInst(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', padding: 28, maxWidth: 420, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.building({ s: 20 })}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Editar institución</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>Nombre</label>
                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>Correo</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={() => setEditInst(null)}>Cancelar</button>
              <button onClick={doEdit} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <div onClick={() => setConfirm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', padding: 28, maxWidth: 420, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-error) 14%, transparent)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.shieldAlert({ s: 20 })}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Eliminar institución</h3>
            </div>
            <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>
              ¿Eliminar <strong>{confirm.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={() => setConfirm(null)}>Cancelar</button>
              <button onClick={doReject} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-error)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
