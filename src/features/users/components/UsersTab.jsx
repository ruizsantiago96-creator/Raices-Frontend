import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, hashColor } from '@shared/components/shared'
import { useAdminUsers, useToggleUserActive, useChangeUserRole, useDeleteUser, useUpdateUserAdmin } from '../hooks/useUsers'
import { USERS_UI, ROLE_LABELS } from '../constants/usersMessages'

/* ════════════════════ Paleta y helpers ════════════════════ */
const ROLE_META = {
  admin: { bg: '#C4789A', fg: '#C4789A', label: 'Admin' },
  institution: { bg: '#01ADFF', fg: '#01ADFF', label: 'Institución' },
  tutor: { bg: '#D4944C', fg: '#D4944C', label: 'Tutor' },
  pcd: { bg: '#7BA05B', fg: '#7BA05B', label: 'Persona c/ disc.' },
  user: { bg: '#6b7280', fg: '#6b7280', label: 'Usuario' },
}

const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }

function Card({ children, style, className }) {
  return <div className={className} style={{ ...card, padding: 24, ...style }}>{children}</div>
}

function SectionTitle({ icon, children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ color: 'var(--primary)' }}>{icon}</span>}
        {children}
      </h2>
      {right}
    </div>
  )
}

function Skeleton({ w = '100%', h = 16, r = 6, style }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', ...style }} />
}

function EmptyState({ icon, title, sub }) {
  return (
    <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ color: 'var(--fg3)', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg2)', margin: 0 }}>{title}</p>
      {sub && <p style={{ fontSize: 13, color: 'var(--fg3)', marginTop: 4 }}>{sub}</p>}
    </Card>
  )
}

function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...card, padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: danger ? 'color-mix(in oklch, var(--color-error) 14%, transparent)' : 'var(--primary-subtle)', color: danger ? 'var(--color-error)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {danger ? Icons.shieldAlert({ s: 20 }) : Icons.shield({ s: 20 })}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={onCancel}>Cancelar</button>
          <button onClick={onConfirm} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: danger ? 'var(--color-error)' : 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════ TAB: Usuarios ════════════════════ */
const USER_PAGE_SIZE = 8

export default function UsersTab({ currentUserId }) {
  const { addToast } = useUiStore()
  const { data: users = [], isLoading } = useAdminUsers()
  const toggleActive = useToggleUserActive()
  const changeRole = useChangeUserRole()
  const deleteUser = useDeleteUser()
  const updateUser = useUpdateUserAdmin()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [actionMenuId, setActionMenuId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [roleConfirm, setRoleConfirm] = useState(null)
  const [pendingRoleChange, setPendingRoleChange] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({ full_name: '', email: '' })
  const actionMenuRef = useRef(null)
  const [menuPos, setMenuPos] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActionMenuId(null); setMenuPos(null)
      }
    }
    if (actionMenuId) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [actionMenuId])



  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / USER_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * USER_PAGE_SIZE, safePage * USER_PAGE_SIZE)

  const onToggle = (u) => toggleActive.mutate(u.id, {
    onSuccess: (d) => { addToast(d.is_active ? 'Usuario activado' : 'Usuario desactivado', 'success'); setActionMenuId(null) },
    onError: (e) => addToast(e.response?.data?.message ?? 'Error', 'error'),
  })
  const onRole = (id, role) => changeRole.mutate({ id, role }, {
    onSuccess: () => { addToast('Rol actualizado', 'success'); setRoleConfirm(null); setActionMenuId(null) },
    onError: (e) => addToast(e.response?.data?.message ?? 'Error', 'error'),
  })
  const doDelete = () => {
    deleteUser.mutate(confirm.id, { onSuccess: () => { addToast('Usuario eliminado', 'success'); setConfirm(null); setActionMenuId(null) } })
  }
  const openEdit = (u) => {
    setEditUser(u)
    setEditForm({ full_name: u.full_name ?? '', email: u.email ?? '' })
    setActionMenuId(null)
  }
  const doEdit = () => {
    if (!editUser) return
    updateUser.mutate({ id: editUser.id, ...editForm }, {
      onSuccess: () => { addToast('Usuario actualizado', 'success'); setEditUser(null) },
      onError: (e) => addToast(e.response?.data?.message ?? 'Error al actualizar', 'error'),
    })
  }

  const inputStyle = { height: 40, padding: '0 12px 0 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)', width: '100%' }

  return (
    <div>
      {/* Toolbar: unified search + role filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)' }}>{Icons.search({ s: 16 })}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={USERS_UI.SEARCH_PLACEHOLDER}
            style={inputStyle} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ height: 40, padding: '0 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, color: 'var(--fg2)', background: 'var(--bg-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          <option value="all">{USERS_UI.FILTER_ALL}</option>
          <option value="admin">{USERS_UI.FILTER_ADMIN}</option>
          <option value="institution">{USERS_UI.FILTER_INSTITUTION}</option>
          <option value="tutor">{USERS_UI.FILTER_TUTOR}</option>
          <option value="pcd">{USERS_UI.FILTER_PCD}</option>
        </select>
      </div>

      {isLoading ? (
        <Card><Skeleton h={40} style={{ marginBottom: 12 }} /><Skeleton h={40} style={{ marginBottom: 12 }} /><Skeleton h={40} /></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Icons.users({ s: 32 })} title={USERS_UI.EMPTY_STATE} />
      ) : (
        <>
          <div className="responsive-table-wrap" style={{ ...card, overflowX: 'auto' }}>
            <table className="responsive-table" style={{ width: '100%', minWidth: 750, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'color-mix(in oklch, var(--bg-warm) 60%, var(--bg-surface))' }}>
                  {Object.values(USERS_UI.TABLE_HEADERS).map(h => (
                    <th key={h + 'user'} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((u, i) => {
                  const isSelf = u.id === currentUserId
                  const meta = ROLE_META[u.role] ?? ROLE_META.user
                  return (
                    <tr key={u.id} style={{ borderBottom: i < paged.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'color-mix(in oklch, var(--primary) 2%, var(--bg-surface))'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: hashColor(u.full_name ?? u.email ?? ''), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {(u.full_name ?? u.email ?? '?')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{u.full_name ?? '—'} {isSelf && <span style={{ fontSize: 11, color: 'var(--fg3)' }}>{USERS_UI.SELF_BADGE}</span>}</div>
                            <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: `color-mix(in oklch, ${meta.bg} 14%, transparent)`, color: meta.fg }}>
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                          background: u.is_active ? 'color-mix(in oklch, var(--color-artes) 14%, transparent)' : 'color-mix(in oklch, var(--color-error) 14%, transparent)',
                          color: u.is_active ? 'var(--color-artes)' : 'var(--color-error)' }}>
                          {u.is_active ? USERS_UI.STATUS_ACTIVE : USERS_UI.STATUS_INACTIVE}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--fg3)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('es-MX') : '—'}</td>
                      <td style={{ padding: '14px 16px', position: 'relative' }}>
                        <button onClick={(e) => { if (actionMenuId === u.id) { setActionMenuId(null); setMenuPos(null) } else { const r = e.currentTarget.getBoundingClientRect(); setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right - 16 }); setActionMenuId(u.id) } }}
                          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg3)', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-cool)'; e.currentTarget.style.color = 'var(--fg1)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--fg3)' }}>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                        </button>
                        {actionMenuId === u.id && menuPos && createPortal(
                          <div ref={actionMenuRef} style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, width: 210, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', zIndex: 9999, padding: '6px 0', animation: 'fade-in 0.12s ease-out' }}>
                            <button onClick={() => openEdit(u)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--fg2)', fontFamily: 'var(--font-body)', textAlign: 'left' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-cool)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              {Icons.sliders({ s: 15 })} {USERS_UI.EDIT_TITLE}
                            </button>
                            {!isSelf && (
                              <button onClick={() => { setRoleConfirm(u); setActionMenuId(null) }}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--fg2)', fontFamily: 'var(--font-body)', textAlign: 'left' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-cool)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                {Icons.shield({ s: 15 })} {USERS_UI.ROLE_TITLE}
                              </button>
                            )}
                            <button onClick={() => { onToggle(u) }} disabled={isSelf}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: 'none', background: 'transparent', cursor: isSelf ? 'not-allowed' : 'pointer', fontSize: 13.5, fontWeight: 600, color: u.is_active ? 'var(--color-error)' : 'var(--color-artes)', fontFamily: 'var(--font-body)', textAlign: 'left', opacity: isSelf ? 0.4 : 1 }}
                              onMouseEnter={e => { if (!isSelf) e.currentTarget.style.background = 'var(--bg-cool)' }} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              {u.is_active ? Icons.x({ s: 15 }) : Icons.check({ s: 15 })} {u.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                            <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 12px' }} />
                            <button onClick={() => { if (!isSelf) { setConfirm(u); setActionMenuId(null) } }} disabled={isSelf}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: 'none', background: 'transparent', cursor: isSelf ? 'not-allowed' : 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--color-error)', fontFamily: 'var(--font-body)', textAlign: 'left', opacity: isSelf ? 0.4 : 1 }}
                              onMouseEnter={e => { if (!isSelf) e.currentTarget.style.background = 'var(--bg-cool)' }} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              {Icons.x({ s: 15 })} {USERS_UI.DELETE_TITLE}
                            </button>
                          </div>,
                          document.body
                        )}
                      </td>
                    </tr>
                  )
                })}
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
      {editUser && (
        <div onClick={() => setEditUser(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ ...card, padding: 28, maxWidth: 420, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.user({ s: 20 })}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{USERS_UI.EDIT_TITLE}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>{USERS_UI.EDIT_NAME_LABEL}</label>
                <input value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                  style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>{USERS_UI.EDIT_EMAIL_LABEL}</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={() => setEditUser(null)}>{USERS_UI.EDIT_CANCEL}</button>
              <button onClick={doEdit} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{USERS_UI.EDIT_SAVE}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirm && (
        <ConfirmDialog
          title={USERS_UI.DELETE_TITLE}
          message={USERS_UI.DELETE_MESSAGE}
          confirmLabel={USERS_UI.DELETE_CONFIRM}
          danger
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Role Change Select */}
      {roleConfirm && (
        <div onClick={() => setRoleConfirm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ ...card, padding: 28, maxWidth: 420, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.shield({ s: 20 })}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{USERS_UI.ROLE_TITLE}</h3>
            </div>
            <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 16px' }}>
              {USERS_UI.ROLE_CONFIRM_MESSAGE} <strong>{roleConfirm.full_name ?? roleConfirm.email}</strong>:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[{ k: 'admin', l: USERS_UI.FILTER_ADMIN, c: ROLE_META.admin.bg }, { k: 'institution', l: USERS_UI.FILTER_INSTITUTION, c: ROLE_META.institution.bg }, { k: 'tutor', l: USERS_UI.FILTER_TUTOR, c: ROLE_META.tutor.bg }, { k: 'pcd', l: USERS_UI.FILTER_PCD, c: ROLE_META.pcd.bg }].filter(r => r.k !== roleConfirm.role).map(r => (
                <button key={r.k} onClick={() => { onRole(roleConfirm.id, r.k); setRoleConfirm(null) }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${r.c}`, background: `color-mix(in oklch, ${r.c} 8%, var(--bg-surface))`, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: r.c, fontFamily: 'var(--font-body)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = `color-mix(in oklch, ${r.c} 14%, var(--bg-surface))`}
                  onMouseLeave={e => e.currentTarget.style.background = `color-mix(in oklch, ${r.c} 8%, var(--bg-surface))`}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.c }} />
                  {r.l}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={() => setRoleConfirm(null)}>{USERS_UI.EDIT_CANCEL}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
