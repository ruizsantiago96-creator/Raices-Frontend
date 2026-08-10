import { useState } from 'react'
import { useNotifications, useMarkRead, useMarkAllRead } from '../hooks/useNotifications'
import { Icons } from '@shared/components/shared'
import BackendFallback from '@shared/components/BackendFallback'
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

export default function NotificationsPage() {
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
    <main className="responsive-main" style={{ '--main-max-width': '800px' }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>
            {NOTIFICATION_UI.PAGE_TITLE}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>
            {unread > 0 ? `${unread} ${NOTIFICATION_UI.UNREAD_SUFFIX}` : NOTIFICATION_UI.ALL_READ}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead} disabled={markAll.isPending}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--bg-cool)', color: 'var(--fg2)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-cool)'}>
            {Icons.check({ s: 14 })} {NOTIFICATION_UI.MARK_ALL_READ}
          </button>
        )}
      </div>

      {/* iOS-style Segmented Control */}
      <div className="animate-fade-in-up delay-1" style={{ display: 'inline-flex', background: 'var(--bg-cool)', borderRadius: 10, padding: 3, gap: 2, marginBottom: 20 }}>
        {[
          { k: 'all', label: `Todas (${notifications.length})` },
          { k: 'unread', label: `No leídas (${unread})` },
          { k: 'intelligence', label: 'Inteligencia' },
          { k: 'risk', label: 'Riesgos' }
        ].map(opt => {
          const act = filter === opt.k
          return (
            <button key={opt.k} onClick={() => setFilter(opt.k)}
              style={{
                border: 'none', background: act ? 'var(--bg-surface)' : 'transparent',
                color: act ? 'var(--fg1)' : 'var(--fg3)',
                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: act ? 700 : 500,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                boxShadow: act ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}>
              {opt.label}
            </button>
          )
        })}
      </div>

      {isError ? (
        <BackendFallback onRetry={refetch} />
      ) : isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg3)', padding: 40 }}>
          {Icons.loader({ s: 20 })} {NOTIFICATION_UI.LOADING}
        </div>
      ) : filtered.length === 0 ? (
        <div className="animate-fade-in-up delay-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '48px 24px', textAlign: 'center', color: 'var(--fg3)', fontSize: 14.5 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-cool)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--fg3)' }}>
            {Icons.bell({ s: 20 })}
          </div>
          {NOTIFICATION_UI.EMPTY}
        </div>
      ) : (
        <div className="animate-fade-in-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((n) => {
            const meta = TYPE_META[n.type] ?? { icon: Icons.bell, color: 'var(--primary)' }
            const timeStr = relativeDate(n.created_at)
            return (
              <div key={n.id} onClick={() => handleMarkRead(n.id)}
                style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                  borderRadius: 14, padding: 18, boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  cursor: n.is_read ? 'default' : 'pointer',
                  position: 'relative', overflow: 'hidden',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex', gap: 16, alignItems: 'flex-start'
                }}
                onMouseEnter={e => {
                  if (!n.is_read) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (!n.is_read) {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'
                  }
                }}
              >
                {/* Visual indicator of read state */}
                {!n.is_read && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3.5, background: meta.color }} />
                )}

                {/* Left: Icon circle */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `color-mix(in oklch, ${meta.color} 12%, transparent)`,
                  color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {meta.icon({ s: 20 })}
                </div>

                {/* Right: Content details */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>
                        {timeStr}
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
    </main>)
}
