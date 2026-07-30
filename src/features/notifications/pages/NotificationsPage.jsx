import { useState } from 'react'
import { useNotifications, useMarkRead, useMarkAllRead } from '../hooks/useNotifications'
import { useAuthStore } from '@features/auth'
import { Icons } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'
import BackendFallback from '@shared/components/BackendFallback'
import { NOTIFICATION_ENDPOINTS } from '@shared/constants/backendEndpoints'
import { NOTIFICATION_UI } from '../constants/notificationMessages'

const TYPE_META = {
  info: { color: '#01ADFF', icon: Icons.info, label: 'Info' },
  success: { color: '#7BA05B', icon: Icons.check, label: 'Éxito' },
  warning: { color: '#D4944C', icon: Icons.shieldAlert, label: 'Advertencia' },
  error: { color: '#D46A6A', icon: Icons.x, label: 'Error' },
}

function relativeDate(d) {
  const diff = Date.now() - new Date(d)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return NOTIFICATION_UI.TIME_NOW
  if (mins < 60) return `${NOTIFICATION_UI.TIME_MINUTES} ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${NOTIFICATION_UI.TIME_HOURS} ${hours}h`
  const days = Math.floor(hours / 24)
  return `${NOTIFICATION_UI.TIME_DAYS} ${days}d`
}

const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }

export default function NotificationsPage() {
  const { logout } = useAuthStore()
  const { data: user } = { data: useAuthStore.getState().user }
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  const [filter, setFilter] = useState('all')

  const unread = notifications.filter(n => !n.is_read).length
  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type === filter)

  const handleMarkRead = (id) => {
    markRead.mutate(id)
  }

  const handleMarkAllRead = () => {
    markAll.mutate()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <AppSidebar currentPage="notifications" />
      <TopNav user={user} onLogout={logout} currentPage="notifications" />

      <main className="responsive-main" style={{ '--main-max-width': '800px' }}>
        {/* Header */}
        <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>
              {NOTIFICATION_UI.PAGE_TITLE}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0 }}>
              {unread > 0 ? `${unread} ${NOTIFICATION_UI.UNREAD_SUFFIX}` : NOTIFICATION_UI.ALL_READ}
            </p>
          </div>
          {unread > 0 && (
            <button onClick={handleMarkAllRead} disabled={markAll.isPending}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.check({ s: 14 })} {NOTIFICATION_UI.MARK_ALL_READ}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="animate-fade-in-up delay-1" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { k: 'all', label: `Todas (${notifications.length})` },
            { k: 'unread', label: `Sin leer (${unread})` },
          ].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              style={{ padding: '7px 16px', borderRadius: 20, border: filter === f.k ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: filter === f.k ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: filter === f.k ? 'var(--primary)' : 'var(--fg2)', cursor: 'pointer', fontWeight: filter === f.k ? 700 : 500, fontSize: 13, fontFamily: 'var(--font-body)' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        {isError ? (
          <BackendFallback method={NOTIFICATION_ENDPOINTS.GET_ALL.method} endpoint={NOTIFICATION_ENDPOINTS.GET_ALL.path} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ ...card, padding: 20, animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--border-color)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 16, width: '60%', borderRadius: 6, background: 'var(--border-color)', marginBottom: 8 }} />
                    <div style={{ height: 14, width: '80%', borderRadius: 6, background: 'var(--border-color)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...card, padding: 64, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {Icons.bell({ s: 24 })}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>              { filter === 'unread' ? NOTIFICATION_UI.EMPTY_UNREAD_TITLE : NOTIFICATION_UI.EMPTY_ALL_TITLE}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0 }}>
              {filter === 'unread' ? NOTIFICATION_UI.EMPTY_UNREAD_DESC : NOTIFICATION_UI.EMPTY_ALL_DESC}
            </p>
          </div>
        ) : (
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(n => {
              const meta = TYPE_META[n.type] ?? TYPE_META.info
              return (
                <div key={n.id} className="animate-fade-in-up"
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  style={{
                    ...card,
                    padding: '16px 20px',
                    cursor: n.is_read ? 'default' : 'pointer',
                    background: n.is_read ? 'var(--bg-surface)' : 'color-mix(in oklch, var(--primary) 4%, var(--bg-surface))',
                    borderLeft: `4px solid ${n.is_read ? 'var(--border-color)' : meta.color}`,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `color-mix(in oklch, ${meta.color} 12%, transparent)`,
                      color: meta.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {meta.icon({ s: 18 })}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: n.is_read ? 500 : 700, color: 'var(--fg1)' }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--fg3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {relativeDate(n.created_at)}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
                        {n.body}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
