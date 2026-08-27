import { useState } from 'react'
import { useAdminAuditoria, useAdminAuditoriaStats } from '../hooks/useAdmin'
import { Icons } from '@shared/components/shared'

const ACCION_COLORS = {
  crear: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
  actualizar: { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' },
  eliminar: { bg: 'rgba(220,53,69,0.12)', color: '#DC3545' },
  login: { bg: 'rgba(212,148,76,0.12)', color: '#D4944C' },
  aprobar: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
  rechazar: { bg: 'rgba(220,53,69,0.12)', color: '#DC3545' },
}

function getAccionStyle(accion) {
  if (!accion) return { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' }
  const lower = accion.toLowerCase()
  for (const [key, style] of Object.entries(ACCION_COLORS)) {
    if (lower.includes(key)) return style
  }
  return { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' }
}

function AuditStatsBar({ stats }) {
  if (!stats) return null
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
      {[
        { label: 'Total registros', value: stats.totalRegistros ?? stats.total ?? 0, icon: Icons.barChart },
        { label: 'Usuarios activos', value: stats.usuariosActivos ?? 0, icon: Icons.users },
        { label: 'Acciones hoy', value: stats.accionesHoy ?? 0, icon: Icons.activity },
      ].map((s, i) => (
        <div key={i} style={{
          flex: 1, minWidth: 160, padding: '14px 18px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: 'var(--primary-subtle)',
            color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {s.icon({ s: 16 })}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AuditLogRow({ log }) {
  const accionStyle = getAccionStyle(log.accion)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
      borderBottom: '1px solid var(--border-color)',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-warm, #f8fafc)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Action badge */}
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
        background: accionStyle.bg, color: accionStyle.color,
        textTransform: 'uppercase', letterSpacing: '0.03em', flexShrink: 0, minWidth: 70, textAlign: 'center',
      }}>
        {log.accion ?? '—'}
      </span>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--fg1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {log.descripcion ?? log.recurso ?? 'Sin descripción'}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--fg3)', display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
          {log.usuarioNombre && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {Icons.user({ s: 10 })} {log.usuarioNombre}
            </span>
          )}
          {log.recurso && (
            <span style={{ fontWeight: 600 }}>{log.recurso}</span>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <span style={{ fontSize: 11, color: 'var(--fg3)', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {log.fechaCreacion ? new Date(log.fechaCreacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
      </span>
    </div>
  )
}

export default function AuditTab() {
  const [filters, setFilters] = useState({ pagina: 1, limite: 20 })
  const [filterAcción, setFilterAccion] = useState('')
  const [filterRecurso, setFilterRecurso] = useState('')

  const queryParams = { ...filters }
  if (filterAcción) queryParams.accion = filterAcción
  if (filterRecurso) queryParams.recurso = filterRecurso

  const { data: auditData, isLoading } = useAdminAuditoria(queryParams)
  const { data: stats } = useAdminAuditoriaStats()

  const logs = auditData?.datos ?? auditData?.data ?? (Array.isArray(auditData) ? auditData : [])
  const total = auditData?.total ?? logs.length
  const totalPaginas = auditData?.totalPaginas ?? 1

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Title & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Auditoría del Sistema</h2>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '4px 0 0' }}>
            Registro de acciones realizadas en la plataforma
          </p>
        </div>
      </div>

      {/* Stats */}
      <AuditStatsBar stats={stats} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          className="onboarding-input auth-select"
          style={{ height: 36, fontSize: 13, padding: '0 12px' }}
          value={filterAcción}
          onChange={e => { setFilterAccion(e.target.value); setFilters(f => ({ ...f, pagina: 1 })) }}
        >
          <option value="">Todas las acciones</option>
          <option value="crear">Crear</option>
          <option value="actualizar">Actualizar</option>
          <option value="eliminar">Eliminar</option>
          <option value="login">Login</option>
          <option value="aprobar">Aprobar</option>
          <option value="rechazar">Rechazar</option>
        </select>
        <select
          className="onboarding-input auth-select"
          style={{ height: 36, fontSize: 13, padding: '0 12px' }}
          value={filterRecurso}
          onChange={e => { setFilterRecurso(e.target.value); setFilters(f => ({ ...f, pagina: 1 })) }}
        >
          <option value="">Todos los recursos</option>
          <option value="usuario">Usuarios</option>
          <option value="institucion">Instituciones</option>
          <option value="documento">Documentos</option>
          <option value="vacante">Vacantes</option>
          <option value="publicacion">Publicaciones</option>
        </select>
        <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          {total} registro{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Log list */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: 52, borderRadius: 8, background: 'var(--border-color)',
              animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div style={{
          border: '1px dashed var(--border-color)', borderRadius: 12,
          padding: 48, textAlign: 'center', color: 'var(--fg3)', fontSize: 14,
        }}>
          No hay registros de auditoría con estos filtros.
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          {logs.map((log, i) => (
            <AuditLogRow key={log.id ?? i} log={log} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button
            disabled={filters.pagina <= 1}
            onClick={() => setFilters(f => ({ ...f, pagina: f.pagina - 1 }))}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)', color: filters.pagina <= 1 ? 'var(--fg3)' : 'var(--fg1)',
              cursor: filters.pagina <= 1 ? 'default' : 'pointer', fontSize: 13, fontWeight: 600,
              opacity: filters.pagina <= 1 ? 0.5 : 1,
            }}
          >
            Anterior
          </button>
          <span style={{ fontSize: 13, color: 'var(--fg3)', fontWeight: 600 }}>
            Página {filters.pagina} de {totalPaginas}
          </span>
          <button
            disabled={filters.pagina >= totalPaginas}
            onClick={() => setFilters(f => ({ ...f, pagina: f.pagina + 1 }))}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)', color: filters.pagina >= totalPaginas ? 'var(--fg3)' : 'var(--fg1)',
              cursor: filters.pagina >= totalPaginas ? 'default' : 'pointer', fontSize: 13, fontWeight: 600,
              opacity: filters.pagina >= totalPaginas ? 0.5 : 1,
            }}
          >
            Siguiente
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}
