import { useState, useRef, useEffect } from 'react'
import { useConversations, useMessages, useSendMessage } from '../hooks/useMessages'
import { useMiembrosDestacados } from '../hooks/useCommunity'
import { useUploadMultimedia } from '../hooks/useMultimedia'
import { useAuthStore, useMe } from '@features/auth'
import { Icons } from '@shared/components/shared'
import { SOCIAL_UI } from '../constants/socialMessages'
import { useUiStore } from '@shared/stores/uiStore'
import { useNavigate } from 'react-router-dom'

const relativeDate = (d) => {
  const diff = Date.now() - new Date(d)
  const h = Math.floor(diff / 3600000)
  return h < 1 ? SOCIAL_UI.TIME_NOW : h < 24 ? `${SOCIAL_UI.TIME_PREFIX} ${h}h` : `${SOCIAL_UI.TIME_PREFIX} ${Math.floor(h / 24)}d`
}

function hashColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  const colors = ['var(--primary)', 'color-mix(in oklch, var(--primary) 85%, white)', 'color-mix(in oklch, var(--primary) 70%, white)', 'color-mix(in oklch, var(--primary) 55%, white)', 'color-mix(in oklch, var(--primary) 40%, white)', 'color-mix(in oklch, var(--primary) 25%, white)', 'var(--fg3)']
  return colors[Math.abs(h) % colors.length]
}

const ROLE_LABELS = { pcd: 'Persona con discapacidad', tutor: 'Tutor / familiar', institution: 'Institución' }

const ChatAvatar = ({ name, src, size = 44, status = 'online' }) => {
  const initials = name.split(' ').map(w => w?.[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
  const color = hashColor(name)
  const statusColor = status === 'online' ? '#229B58' : '#F4C84A'
  
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {src ? (
        <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden' }}>
          <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ width: size, height: size, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>
          {initials}
        </div>
      )}
      <span style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 10, height: 10, borderRadius: '50%',
        background: statusColor, border: '2px solid #fff'
      }} />
    </div>
  )
}

const WelcomeIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" style={{ marginBottom: 24 }}>
    {/* Outer warm cream circle */}
    <circle cx="50" cy="50" r="46" fill="#FBF6EE" stroke="#EFE5D8" strokeWidth="2.5" />

    {/* Center Character (The yellow emoji style from Landing) */}
    {/* Shoulders */}
    <path
      d="M 33 74 C 33 58, 67 58, 67 74"
      fill="#229B58"
      stroke="#0C3B4B"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    
    {/* Head/Face - Yellow circle */}
    <circle cx="50" cy="42" r="14" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3.2" />

    {/* Eyes & Smile */}
    <circle cx="45" cy="40" r="2.2" fill="#0C3B4B" />
    <circle cx="55" cy="40" r="2.2" fill="#0C3B4B" />
    <path
      d="M 45.5 46 C 47.5 49.5, 52.5 49.5, 54.5 46"
      fill="none"
      stroke="#0C3B4B"
      strokeWidth="2.8"
      strokeLinecap="round"
    />

    {/* Message Bubble Left (Coral/Pink) */}
    <g transform="translate(24, 28)">
      <rect x="-14" y="-10" width="22" height="16" rx="5" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2" />
      <polygon points="-4,6 0,6 -4,11" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="-4,6 0,6 -4,10" fill="#FF4D68" />
      <circle cx="-7" cy="-2" r="1.2" fill="#fff" />
      <circle cx="-3" cy="-2" r="1.2" fill="#fff" />
      <circle cx="1" cy="-2" r="1.2" fill="#fff" />
    </g>

    {/* Message Bubble Right (Navy Blue) */}
    <g transform="translate(76, 32)">
      <rect x="-8" y="-10" width="22" height="16" rx="5" fill="#0C3B4B" stroke="#0C3B4B" strokeWidth="2" />
      <polygon points="4,6 0,6 4,11" fill="#0C3B4B" stroke="#0C3B4B" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="4,6 0,6 4,10" fill="#0C3B4B" />
      <circle cx="-1" cy="-2" r="1.2" fill="#fff" />
      <circle cx="3" cy="-2" r="1.2" fill="#fff" />
      <circle cx="7" cy="-2" r="1.2" fill="#fff" />
    </g>

    {/* Green leaf badge top-center */}
    <g transform="translate(50, 16)">
      <path d="M 0 -6 C 4 -6, 6 -2, 0 6 C -6 -2, -4 -6, 0 -6 Z" fill="#229B58" stroke="#0C3B4B" strokeWidth="1.8" />
    </g>
    <path d="M 50 22 L 50 26" stroke="#0C3B4B" strokeWidth="1.8" strokeLinecap="round" />

    {/* Orange sparkle bottom-left */}
    <path
      d="M 21 53 L 22 55.5 L 24.5 56.5 L 22 57.5 L 21 60 L 20 57.5 L 17.5 56.5 L 20 55.5 Z"
      fill="#FFB703"
      stroke="#0C3B4B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Pink sparkle bottom-right */}
    <path
      d="M 79 56 L 80 58.5 L 82.5 59.5 L 80 60.5 L 79 63 L 78 60.5 L 75.5 59.5 L 78 58.5 Z"
      fill="#FF4D68"
      stroke="#0C3B4B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

export function DirectMessages({ currentUserId, isFloating = false, onClose, dragHandleProps }) {
  const floatingChatPartnerId = useUiStore(s => s.floatingChatPartnerId)
  const setFloatingChatPartnerId = useUiStore(s => s.setFloatingChatPartnerId)
  const setFloatingChatMinimized = useUiStore(s => s.setFloatingChatMinimized)
  const floatingChatMaximized = useUiStore(s => s.floatingChatMaximized)
  const setFloatingChatMaximized = useUiStore(s => s.setFloatingChatMaximized)
  const navigate = useNavigate()

  const [activePartnerId, setActivePartnerIdState] = useState(isFloating ? floatingChatPartnerId : null)
  const [text, setText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingFile, setPendingFile] = useState(null)
  const [pendingFileName, setPendingFileName] = useState('')
  const uploadMedia = useUploadMultimedia()
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [activeNewPartner, setActiveNewPartner] = useState(null)
  const [modalSearchQuery, setModalSearchQuery] = useState('')
  const chatEndRef = useRef(null)

  const { data: conversations = [], isLoading: convsLoading } = useConversations()
  const { data: messages = [] } = useMessages(activePartnerId)
  const { data: members = [] } = useMiembrosDestacados(50) // load up to 50 members to allow starting chats
  const sendMessage = useSendMessage()

  // Sync floating chat partner when it changes (avoids setState-in-effect lint error)
  if (isFloating && floatingChatPartnerId !== activePartnerId) {
    setActivePartnerIdState(floatingChatPartnerId)
  }

  const setActivePartnerId = (id) => {
    setActivePartnerIdState(id)
    if (isFloating) {
      setFloatingChatPartnerId(id)
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return
    setPendingFile(file)
    setPendingFileName(file.name)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!text.trim() && !pendingFile) || !activePartnerId || sendMessage.isPending) return

    let content = text
    if (pendingFile) {
      try {
        const result = await uploadMedia.mutateAsync(pendingFile)
        const url = result?.url ?? ''
        content = url ? `${content}${content.trim() ? '\n' : ''}${url}` : content
      } catch {
        // silently fail on upload error
      }
    }

    if (!content.trim()) return
    sendMessage.mutate({ toId: activePartnerId, content }, {
      onSuccess: () => {
        setText('')
        setPendingFile(null)
        setPendingFileName('')
      }
    })
  }

  const activeConv = conversations.find(c => c.partner?.id === activePartnerId) || 
    (activeNewPartner && activeNewPartner.id === activePartnerId ? { partner: activeNewPartner } : null)

  const filteredConversations = conversations.filter(conv => 
    conv.partner && conv.partner.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMembers = members.filter(m => 
    m.nombreCompleto.toLowerCase().includes(modalSearchQuery.toLowerCase()) &&
    m.id !== currentUserId
  )

  const handleStartNewChat = (member) => {
    const partnerData = {
      id: member.id,
      full_name: member.nombreCompleto,
      avatar_url: member.urlAvatar,
      role: member.rol,
      is_active: true,
    }
    setActiveNewPartner(partnerData)
    setActivePartnerId(member.id)
    setShowNewChatModal(false)
    setModalSearchQuery('')
  }

  return (
    <div className="grid-messages" style={{
      background: 'var(--bg-surface)',
      border: isFloating ? 'none' : '1px solid var(--border-color)',
      borderRadius: isFloating ? 0 : '16px',
      overflow: 'hidden',
      boxShadow: isFloating ? 'none' : 'var(--shadow-md)',
      height: isFloating ? '100%' : 'calc(100vh - 200px)',
      display: 'grid',
      gridTemplateColumns: isFloating ? '210px 1fr' : '280px 1fr'
    }}>
      {/* Columna izquierda: Lista de chats */}
      <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
        
        {/* Chats Header - Reddit Style */}
        <div 
          {...(isFloating ? dragHandleProps : {})}
          style={{
            height: 56, padding: '0 16px', borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            ...(isFloating ? dragHandleProps?.style : {})
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, display: 'flex', alignItems: 'center' }}>💬</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              Chats
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* New chat */}
            <button onClick={() => setShowNewChatModal(true)} title="Nuevo chat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg2)', padding: 5, borderRadius: '50%', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(7, 59, 76, 0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center' }}>
              {Icons.search({ s: 15 })}
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: 36,
                padding: '0 12px 0 34px',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                background: 'var(--bg-surface)',
                outline: 'none',
                color: 'var(--fg1)',
              }}
            />
          </div>
        </div>

        {/* Chats List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {convsLoading ? (
            <div style={{ padding: 20, color: 'var(--fg3)', fontSize: 13 }}>{SOCIAL_UI.LOADING}</div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg3)', fontSize: 13 }}>
              <div style={{ marginBottom: 8 }}>{Icons.message({ s: 24 })}</div>
              {searchQuery ? 'No se encontraron chats' : <>{SOCIAL_UI.MESSAGES_EMPTY}</>}
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isSelected = activePartnerId === conv.partner.id
              const timeLabel = conv.last_message_time ? relativeDate(conv.last_message_time) : ''
              const partnerRole = ROLE_LABELS[conv.partner.role] || 'Miembro'

              return (
                <button key={conv.partner.id} onClick={() => { setActiveNewPartner(null); setActivePartnerId(conv.partner.id); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(7, 59, 76, 0.08)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    display: 'flex', gap: 12, alignItems: 'center',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(7, 59, 76, 0.04)'; }}
                  onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                  <ChatAvatar name={conv.partner.full_name} src={conv.partner.avatar_url} status={conv.partner.is_active ? 'online' : 'offline'} size={38} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.partner.full_name}
                      </span>
                      <span style={{ fontSize: 10.5, color: 'var(--fg3)', flexShrink: 0, marginLeft: 8 }}>{timeLabel}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg2)', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {partnerRole}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.last_message}
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <span style={{
                      background: 'var(--color-coral)', color: '#fff', borderRadius: '50%',
                      width: 8, height: 8, flexShrink: 0, marginLeft: 8
                    }} />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Columna derecha: Conversación activa / Bienvenido */}
      {activePartnerId ? (
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
          {/* Header del Chat */}
          <div 
            {...(isFloating ? dragHandleProps : {})}
            style={{
              height: 56, padding: '0 20px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-surface)',
              ...(isFloating ? dragHandleProps?.style : {})
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ChatAvatar name={activeConv?.partner.full_name ?? ''} src={activeConv?.partner.avatar_url} status={activeConv?.partner.is_active ? 'online' : 'offline'} size={36} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--fg1)' }}>
                  {activeConv?.partner.full_name ?? SOCIAL_UI.USER_FALLBACK}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--fg3)' }}>
                  {activeConv?.partner.is_active ? 'En línea' : 'Desconectado'}
                </div>
              </div>
            </div>
            
            {/* Opciones de Ventana / Menú estilo Reddit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--fg3)' }}>
              {isFloating ? (
                <>
                  <button onClick={() => {
                    onClose?.()
                    navigate('/messages')
                  }} title="Pop-out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </button>
                  <button onClick={() => setFloatingChatMaximized(!floatingChatMaximized)} title={floatingChatMaximized ? "Restaurar" : "Maximizar"} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    {floatingChatMaximized ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      </svg>
                    )}
                  </button>
                  <button onClick={() => setFloatingChatMinimized(true)} title="Minimizar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  <button onClick={onClose} title="Cerrar chat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button title="Pop-out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </button>
                  <button title="Minimizar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  <button onClick={() => { setActivePartnerId(null); setActiveNewPartner(null); }} title="Cerrar chat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Lista de Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--bg-surface)' }}>
            {messages.map(msg => {
              const mine = msg.from_id === currentUserId
              const timeStr = new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

              if (mine) {
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
                    <div style={{
                      background: 'var(--primary)', color: '#fff',
                      borderRadius: '12px 12px 4px 12px', padding: '10px 14px',
                      fontSize: 14.5, maxWidth: '70%', lineHeight: 1.5,
                      wordBreak: 'break-word', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 4, marginRight: 2 }}>
                      {timeStr}
                    </div>
                  </div>
                )
              } else {
                const partnerFirstName = activeConv?.partner.full_name.split(' ')[0] || 'Socio'
                return (
                  <div key={msg.id} style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <ChatAvatar name={activeConv?.partner.full_name ?? ''} src={activeConv?.partner.avatar_url} status={activeConv?.partner.is_active ? 'online' : 'offline'} size={36} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                      <div style={{
                        background: '#F1F5F9', color: '#0F172A',
                        borderRadius: '12px 12px 12px 4px', padding: '10px 14px',
                        fontSize: 14.5, maxWidth: '70%', lineHeight: 1.5,
                        wordBreak: 'break-word', border: '1px solid #E2E8F0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 4, marginLeft: 2 }}>
                        {partnerFirstName}, {timeStr}
                      </div>
                    </div>
                  </div>
                )
              }
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Formulario de Envío de Mensaje */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            {/* Pending file indicator */}
            {pendingFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-warm)', border: '1px solid var(--border-color)', fontSize: 13 }}>
                <span style={{ color: 'var(--primary)' }}>📎</span>
                <span style={{ flex: 1, color: 'var(--fg2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingFileName}</span>
                <button type="button" onClick={() => { setPendingFile(null); setPendingFileName('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 14, padding: 0 }}>✕</button>
              </div>
            )}
            <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              
              {/* Pill Container */}
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                border: '1.5px solid var(--border-color)', borderRadius: 24,
                padding: '0 8px 0 16px', background: 'var(--bg-surface)',
                height: 46, transition: 'border-color 0.2s',
              }}>
                <button type="button" title="Emojis" style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  😊
                </button>
                <input
                  value={text} onChange={e => setText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  style={{
                    flex: 1, height: '100%', border: 'none', background: 'transparent',
                    outline: 'none', fontSize: 14, fontFamily: 'var(--font-body)',
                    color: 'var(--fg1)'
                  }}
                />
                
                {/* Adjuntar Archivo */}
                <label title="Adjuntar archivo" style={{ background: 'none', border: 'none', cursor: 'pointer', color: pendingFile ? 'var(--primary)' : 'var(--fg3)', padding: 4, display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                  <input type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                </label>
                
                {/* Nota de voz */}
                <button type="button" title="Mensaje de voz" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4, display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </button>
              </div>

              {/* Botón enviar */}
              <button type="submit" disabled={(!text.trim() && !pendingFile) || sendMessage.isPending || uploadMedia.isPending}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: (text.trim() || pendingFile) ? 'var(--primary)' : 'var(--border-color)',
                  border: 'none', color: '#fff', cursor: (text.trim() || pendingFile) ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s'
                }}>
                {sendMessage.isPending || uploadMedia.isPending ? (
                  <span style={{ fontSize: 16, animation: 'spin 0.8s linear infinite' }}>⏳</span>
                ) : (
                  Icons.send({ s: 18 })
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Empty State - Reddit style */
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
          {/* Header of Empty State with window controls if isFloating */}
          <div 
            {...(isFloating ? dragHandleProps : {})}
            style={{
              height: 56, padding: '0 20px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              background: 'var(--bg-surface)',
              ...(isFloating ? dragHandleProps?.style : {})
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--fg3)' }}>
              {isFloating && (
                <>
                  <button onClick={() => {
                    onClose?.()
                    navigate('/messages')
                  }} title="Pop-out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </button>
                  <button onClick={() => setFloatingChatMaximized(!floatingChatMaximized)} title={floatingChatMaximized ? "Restaurar" : "Maximizar"} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    {floatingChatMaximized ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      </svg>
                    )}
                  </button>
                  <button onClick={() => setFloatingChatMinimized(true)} title="Minimizar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  <button onClick={onClose} title="Cerrar chat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 40 }}>
            <WelcomeIllustration />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px', textAlign: 'center' }}>
              ¡Te damos la bienvenida al chat!
            </h3>
            <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 28px', textAlign: 'center', maxWidth: 360, lineHeight: 1.5 }}>
              Empieza un chat directo o grupal con otros miembros de Raíces.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 24px', borderRadius: 24, border: 'none',
                background: '#0F172A', color: '#fff', fontWeight: 700,
                fontSize: 14.5, fontFamily: 'var(--font-body)', cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
              onMouseLeave={e => e.currentTarget.style.background = '#0F172A'}
            >
              <span style={{ fontSize: 18, fontWeight: 800 }}>+</span>
              Comenzar nuevo chat
            </button>
          </div>
        </div>
      )}

      {/* Modal comenzar nuevo chat - Reddit style */}
      {showNewChatModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)', zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="animate-scale-in" style={{
            background: 'var(--bg-surface)', borderRadius: 16, padding: 24,
            maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-xl)',
            display: 'flex', flexDirection: 'column', gap: 16
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                Nuevo mensaje
              </h3>
              <button onClick={() => { setShowNewChatModal(false); setModalSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4, display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Modal Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center' }}>
                {Icons.search({ s: 15 })}
              </span>
              <input
                type="text"
                placeholder="Buscar miembros..."
                value={modalSearchQuery}
                onChange={e => setModalSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: 40,
                  padding: '0 12px 0 36px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'var(--font-body)',
                  background: 'var(--bg-surface)',
                  outline: 'none',
                  color: 'var(--fg1)',
                }}
              />
            </div>

            {/* Members List */}
            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {filteredMembers.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg3)', fontSize: 13 }}>
                  No se encontraron miembros de la comunidad
                </div>
              ) : (
                filteredMembers.map(m => (
                  <button key={m.id} onClick={() => handleStartNewChat(m)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', border: 'none', background: 'transparent',
                      cursor: 'pointer', fontFamily: 'var(--font-body)', borderRadius: 8,
                      textAlign: 'left', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(7, 59, 76, 0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                      {m.urlAvatar ? (
                        <img src={m.urlAvatar} alt={m.nombreCompleto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: hashColor(m.nombreCompleto), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                          {m.nombreCompleto.split(' ').map(w => w?.[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.nombreCompleto}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--primary)', fontWeight: 600 }}>
                        {ROLE_LABELS[m.rol] ?? m.rol}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            {/* Cancel Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => { setShowNewChatModal(false); setModalSearchQuery(''); }} style={{
                padding: '8px 16px', borderRadius: 16, border: '1px solid var(--border-color)',
                background: 'transparent', color: 'var(--fg2)', fontWeight: 600, fontSize: 13.5,
                cursor: 'pointer', fontFamily: 'var(--font-body)'
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  const { data: user } = useMe()
  const { logout } = useAuthStore()

  return (
    <main className="responsive-main" style={{ '--main-max-width': '1060px' }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>
          Mensajes
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>
          Conversa de forma segura y directa con tu comunidad
        </p>
      </div>

      <div className="animate-fade-in-up delay-1">
        <DirectMessages currentUserId={user?.id} />
      </div>
    </main>
  )
}
