import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, hashColor } from '@shared/components/shared'
import { useAllJobApplicants, useUpdateApplicationStatus } from '../hooks/useInstitutionJobs'
import { PORTAL_UI, PORTAL_TOAST, APPLICATION_STATUS_COLORS } from '../constants/institutionPortalMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { JOB_ENDPOINTS } from '@shared/constants/backendEndpoints'

const STATUS_OPTIONS = [
  { value: 'pending', label: PORTAL_UI.APP_STATUS_PENDING, color: APPLICATION_STATUS_COLORS.pending },
  { value: 'reviewed', label: PORTAL_UI.APP_STATUS_REVIEWED, color: APPLICATION_STATUS_COLORS.reviewed },
  { value: 'accepted', label: PORTAL_UI.APP_STATUS_ACCEPTED, color: APPLICATION_STATUS_COLORS.accepted },
  { value: 'rejected', label: PORTAL_UI.APP_STATUS_REJECTED, color: APPLICATION_STATUS_COLORS.rejected },
]

const FILTER_OPTIONS = [
  { value: 'all', label: PORTAL_UI.FILTER_ALL },
  { value: 'pending', label: PORTAL_UI.FILTER_PENDING },
  { value: 'reviewed', label: PORTAL_UI.FILTER_REVIEWED },
  { value: 'accepted', label: PORTAL_UI.FILTER_ACCEPTED },
]

/* ─── StatusDropdown ──────────────────────────────────────── */
function StatusDropdown({ currentStatus, applicantId, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const [menuPos, setMenuPos] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = STATUS_OPTIONS.find(s => s.value === currentStatus) ?? STATUS_OPTIONS[0]

  const handleSelect = (value) => {
    onChange({ applicantId, status: value })
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
          if (open) { setOpen(false); setMenuPos(null); return }
          const r = e.currentTarget.getBoundingClientRect()
          setMenuPos({ top: r.bottom + 4, left: r.left })
          setOpen(true)
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 8,
          border: `1px solid ${current.color}30`,
          background: `${current.color}15`,
          color: current.color,
          cursor: 'pointer', fontSize: 12, fontWeight: 600,
          fontFamily: 'var(--font-body)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: current.color, flexShrink: 0 }} />
        {current.label}
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && menuPos && createPortal(
        <div style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, minWidth: 160, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', zIndex: 9999, padding: '4px 0', animation: 'fade-in 0.12s ease-out' }}>
          {STATUS_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => handleSelect(opt.value)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', border: 'none', background: opt.value === currentStatus ? 'var(--bg-cool)' : 'transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: opt.value === currentStatus ? 700 : 500,
                color: opt.value === currentStatus ? opt.color : 'var(--fg2)',
                fontFamily: 'var(--font-body)', textAlign: 'left',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-cool)'}
              onMouseLeave={e => e.currentTarget.style.background = opt.value === currentStatus ? 'var(--bg-cool)' : 'transparent'}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

/* ─── CandidatosTab ──────────────────────────────────────── */
export default function CandidatosTab() {
  const { addToast } = useUiStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const { data: applicants = [], isLoading, isError, refetch } = useAllJobApplicants()
  const updateStatus = useUpdateApplicationStatus()

  const filtered = applicants.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    if (!search.trim()) return matchesFilter
    const q = search.toLowerCase()
    const matchesSearch = (app.user_name ?? '').toLowerCase().includes(q) ||
                          (app.job_title ?? '').toLowerCase().includes(q) ||
                          (app.user_email ?? '').toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  const counts = {
    all: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    reviewed: applicants.filter(a => a.status === 'reviewed').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
  }

  const handleStatusChange = ({ applicantId, status }) => {
    updateStatus.mutate(
      { applicantId, status },
      {
        onSuccess: () => addToast(PORTAL_TOAST.APPLICATION_UPDATED, 'success'),
        onError: () => addToast(PORTAL_TOAST.APPLICATION_UPDATE_FAILED, 'error'),
      }
    )
  }

  const inputStyle = { height: 40, padding: '0 12px 0 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)', width: '100%' }

  if (isError) {
    return <BackendFallback method={JOB_ENDPOINTS.LIST.method} endpoint={JOB_ENDPOINTS.LIST.path} onRetry={() => refetch()} />
  }

  return (
    <div>
      {/* Toolbar: filters + search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {FILTER_OPTIONS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{ padding: '7px 16px', borderRadius: 20, border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              background: filter === f.value ? 'var(--primary)' : 'var(--bg-surface)', color: filter === f.value ? '#fff' : 'var(--fg2)',
              transition: 'all 0.15s' }}>
            {f.label} ({counts[f.value] ?? 0})
          </button>
        ))}
        <div style={{ position: 'relative', flex: 1, minWidth: 220, marginLeft: 'auto' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)' }}>{Icons.search({ s: 16 })}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={PORTAL_UI.SEARCH_CANDIDATES_PLACEHOLDER}
            style={inputStyle} />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 60, borderRadius: 'var(--radius-md)', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
            {Icons.users({ s: 24 })}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>{PORTAL_UI.NO_CANDIDATES}</h3>
          <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0 }}>{PORTAL_UI.NO_CANDIDATES_HINT}</p>
        </div>
      ) : (
        <div className="responsive-table-wrap" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
          <table className="responsive-table" style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'color-mix(in oklch, var(--bg-warm) 60%, var(--bg-surface))' }}>
                {[PORTAL_UI.COL_NAME, PORTAL_UI.COL_JOB, PORTAL_UI.COL_DATE, PORTAL_UI.COL_STATUS].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => (
                <tr key={app.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'color-mix(in oklch, var(--primary) 2%, var(--bg-surface))'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: hashColor(app.user_name ?? ''), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {(app.user_name ?? '?')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{app.user_name ?? '—'}</div>
                        {app.user_email && <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.mail({ s: 10 })} {app.user_email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg1)' }}>{app.job_title ?? '—'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--fg3)' }}>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusDropdown
                      currentStatus={app.status}
                      applicantId={app.id}
                      onChange={handleStatusChange}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
