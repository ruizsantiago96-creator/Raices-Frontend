/**
 * InstitutionAIChat — Panel de chat con asistente IA para preguntas sobre la institución.
 *
 * Props:
 *   institutionName — Nombre de la institución (para placeholder)
 */

import { useState, useRef, useEffect } from 'react'
import { useChat } from '../../tutor/hooks/useAI'
import { Icons } from '@shared/components/shared'

export default function InstitutionAIChat({ institutionName }) {
  const chat = useChat()
  const [aiInput, setAiInput] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, chat.isPending])

  const handleSendAi = async (e) => {
    e.preventDefault()
    const msg = aiInput.trim()
    if (!msg || chat.isPending) return
    setAiInput('')
    const userMsg = { role: 'user', content: msg }
    const nextHistory = [...chatHistory, userMsg]
    setChatHistory(nextHistory)
    try {
      const res = await chat.mutateAsync({ message: msg, history: chatHistory })
      const aiMsg = { role: 'assistant', content: res.response ?? res.reply ?? '...' }
      setChatHistory(h => [...h, aiMsg])
    } catch {
      setChatHistory(h => [
        ...h,
        { role: 'assistant', content: 'Hubo un error al conectar con el asistente. Intenta de nuevo.' },
      ])
    }
  }

  return (
    <div className="animate-fade-in-up delay-2" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: 24,
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: '50% 50% 50% 14%',
          background: 'var(--primary-subtle)',
          color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icons.sparkles({ s: 18 })}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>
            Asistente IA
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
            Pregunta sobre {institutionName}
          </div>
        </div>
      </div>

      {/* Message area */}
      <div style={{
        background: 'var(--bg-warm)',
        borderRadius: 'var(--radius-md)',
        padding: 16,
        height: 240,
        overflowY: 'auto',
        marginBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {chatHistory.length === 0 && !chat.isPending && (
          <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Prueba: &ldquo;¿Atienden TEA?&rdquo;, &ldquo;¿Cuáles son sus horarios?&rdquo;, &ldquo;¿Tienen transporte accesible?&rdquo;
          </p>
        )}

        {chatHistory.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <span style={{
              background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
              color: m.role === 'user' ? 'white' : 'var(--fg1)',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '10px 16px',
              fontSize: 14,
              maxWidth: '78%',
              border: m.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
              lineHeight: 1.55,
              wordBreak: 'break-word',
            }}>
              {m.content}
            </span>
          </div>
        ))}

        {chat.isPending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg3)', fontSize: 13 }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-flex' }}>
              {Icons.loader({ s: 14 })}
            </span>
            Pensando...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendAi} style={{ display: 'flex', gap: 10 }}>
        <input
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          style={{
            flex: 1, height: 44,
            padding: '0 16px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-pill)',
            fontSize: 15,
            fontFamily: 'var(--font-body)',
            color: 'var(--fg1)',
            outline: 'none',
            background: 'var(--bg-surface)',
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '0 20px', fontSize: 15, display: 'flex', alignItems: 'center' }}
          disabled={chat.isPending || !aiInput.trim()}
        >
          {Icons.send({ s: 18 })}
        </button>
      </form>
    </div>
  )
}
