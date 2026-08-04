import { useState } from 'react'
import { Icons } from '@shared/components/shared'
import { useAdminAlerts } from '../hooks/useAdmin'
import { Card, SectionTitle, Skeleton, EmptyState } from './AdminUI'

const SEVERITY_META = {
  alta: { color: 'var(--color-error)', icon: Icons.shieldAlert },
  media: { color: 'var(--color-empleo)', icon: Icons.target },
  info: { color: 'var(--color-comunidad)', icon: Icons.sparkles },
}

function formatTimeAgo(dateString) {
  try {
    const d = new Date(dateString)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours} h`
    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays} d`
  } catch {
    return ''
  }
}

export default function AlertsTab({ alerts: initialAlerts, onNavigate }) {
  const [filter, setFilter] = useState('all')
  const { data: freshAlerts, refetch, isFetching } = useAdminAlerts()
  const alerts = freshAlerts ?? initialAlerts ?? []

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[{ k: 'all', l: `Todas (${alerts.length})` }, { k: 'alta', l: 'Alta' }, { k: 'media', l: 'Media' }, { k: 'info', l: 'Info' }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            style={{ padding: '7px 16px', borderRadius: 20, border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              background: filter === f.k ? (f.k === 'alta' ? 'var(--color-error)' : f.k === 'media' ? 'var(--color-empleo)' : 'var(--primary)') : 'var(--bg-surface)', color: filter === f.k ? '#fff' : 'var(--fg2)' }}>
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Icons.shieldCheck({ s: 32 })} title="Sin alertas" sub="Todo está funcionando correctamente" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => {
            const meta = SEVERITY_META[a.severity] ?? SEVERITY_META.info
            return (
              <Card key={a.id} style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `4px solid ${meta.color}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in oklch, ${meta.color} 14%, transparent)`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {meta.icon({ s: 20 })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)', marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--fg2)', lineHeight: 1.5 }}>{a.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 8 }}>{formatTimeAgo(a.created_at)}</div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
