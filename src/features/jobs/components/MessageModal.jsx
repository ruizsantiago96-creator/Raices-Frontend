import { useState, useRef, useEffect } from 'react'
import { useMessages, useSendMessage } from '@features/social/hooks/useMessages'
import { useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { JOBS_UI } from '../constants/jobsMessages'

/* ─── MessageModal (chat en tiempo real) ────────────────────── */
export default function MessageModal({ job, onClose }) {
  const [text, setText] = useState('')
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  const sendMessage = useSendMessage()
  const { user } = useAuthStore()
  const { addToast } = useUiStore()

  const ownerUserId = job.institution_owner_id
  const { data: messages = [], isLoading: msgsLoading } = useMessages(ownerUserId)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sendMessage.isPending])

  useEffect(() => {
    chatInputRef.current?.focus()
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || sendMessage.isPending || !ownerUserId) return
    const msg = text.trim()
    setText('')
    try {
      await sendMessage.mutateAsync({ toId: ownerUserId, content: msg })
    } catch {
      setText(msg) // restaurar si falla
      addToast(JOBS_UI.MESSAGE_FAILED, 'error')
    }
  }

  if (!ownerUserId) {
    return (
      <div className="modal-overlay" style={{ zIndex: 2000 }}>
        <div className="animate-scale-in glass-card" style={{ padding: 28, maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'color-mix(in oklch, #D4944C 15%, transparent)', color: '#D4944C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {Icons.message({ s: 22 })}
          </div>
          <p style={{ fontSize: 15, color: 'var(--fg2)', margin: '0 0 20px', lineHeight: 1.6 }}>{JOBS_UI.MESSAGE_NO_OWNER}</p>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>{JOBS_UI.CANCEL_BUTTON}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="animate-scale-in glass-card" style={{ padding: 0, maxWidth: 520, width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
              {(job.institution_name?.[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>
                {job.institution_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg3)' }}>💬 {JOBS_UI.MESSAGE_MODAL_HINT}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4, display: 'flex' }}>{Icons.x({ s: 18 })}</button>
        </div>

        {/* Job context card */}
        <div style={{ padding: '10px 20px', background: 'color-mix(in oklch, var(--primary) 5%, var(--bg-warm))', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>💼 {job.title}</div>
          {job.salary_range && <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{job.salary_range}</div>}
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200, maxHeight: 'calc(80vh - 180px)', background: 'var(--bg-warm)' }}>
          {msgsLoading && messages.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--fg3)', fontSize: 13, gap: 6 }}>
              {Icons.loader({ s: 14 })} Cargando conversación...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Icons.message({ s: 20 })}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg3)', textAlign: 'center', lineHeight: 1.5 }}>
                Inicia la conversación con {job.institution_name}<br />sobre la vacante de <strong>{job.title}</strong>
              </div>
            </div>
          ) : (
            messages.map(msg => {
              const mine = msg.from_id === user?.id
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                  <span style={{
                    background: mine ? 'var(--primary)' : 'var(--bg-surface)',
                    color: mine ? '#fff' : 'var(--fg1)',
                    borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px',
                    fontSize: 14,
                    maxWidth: '75%',
                    border: mine ? 'none' : '1px solid var(--border-color)',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: mine ? 'right' : 'left' }}>
                      {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </span>
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8, flexShrink: 0, background: 'var(--bg-surface)' }}>
          <input
            ref={chatInputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={JOBS_UI.MESSAGE_PLACEHOLDER}
            style={{ flex: 1, height: 42, padding: '0 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-pill)', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none' }}
          />
          <button type="submit" disabled={!text.trim() || sendMessage.isPending}
            style={{ width: 42, height: 42, borderRadius: '50%', background: text.trim() ? 'var(--primary)' : 'var(--border-color)', border: 'none', color: '#fff', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
            {sendMessage.isPending ? Icons.loader({ s: 18 }) : Icons.send({ s: 18 })}
          </button>
        </form>
      </div>
    </div>
  )
}
