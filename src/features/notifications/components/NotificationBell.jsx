import { useState } from 'react'
import { useNotifications, useMarkAllRead, useNotificationStream, useMarkRead } from '../hooks/useNotifications'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: notifications = [] } = useNotifications()
  const markAll = useMarkAllRead()
  const markRead = useMarkRead()
  const navigate = useNavigate()
  const qc = useQueryClient()

  useNotificationStream(() => {
    qc.invalidateQueries({ queryKey: ['notifications'] })
    // Despachar evento para alertas visuales de accesibilidad
    window.dispatchEvent(new Event('a11y-notify'))
  })

  const unread = notifications.filter(n => !n.is_read).length

  const handleItemClick = (n) => {
    if (!n.is_read && !n.id.toString().startsWith('virtual-')) {
      markRead.mutate(n.id)
    }
    setOpen(false)
    if (n.url) {
      navigate(n.url)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, position: 'relative' }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#e74c3c', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%', width: 320,
          background: 'white', color: '#243434', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.15)',
          zIndex: 1000, maxHeight: 400, overflowY: 'auto',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', color: '#243434' }}>
            <strong style={{ color: '#243434' }}>Notificaciones</strong>
            {unread > 0 && (
              <button onClick={() => markAll.mutate()} style={{ background: 'none', border: 'none', color: '#6C63FF', cursor: 'pointer', fontSize: 12 }}>
                Marcar leídas
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>Sin notificaciones</div>
          ) : (
            notifications.map(n => (
              <div key={n.id}
                onClick={() => handleItemClick(n)}
                className="notification-item"
                style={{
                  padding: '12px 16px', borderBottom: '1px solid #f5f5f5',
                  background: n.is_read ? 'white' : '#f0eeff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ fontWeight: n.is_read ? 400 : 600, fontSize: 14, color: '#243434' }}>{n.title}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{n.body}</div>
              </div>
            ))
          )}
        </div>
      )}
      <style>{`
        .notification-item {
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .notification-item:hover {
          background: rgba(0, 0, 0, 0.04) !important;
        }
      `}</style>
    </div>
  )
}
