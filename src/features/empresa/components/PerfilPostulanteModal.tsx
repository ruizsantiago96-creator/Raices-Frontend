import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { FormEvent, CSSProperties } from 'react'
import { Icons, hashColor } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { useMessages, useSendMessage, useMarcarConversacionLeida } from '@features/social/hooks/useMessages'
import { usePerfilPcd, type PerfilPcd } from '../hooks/usePerfilPcd'
import type { InstitutionJobApplicant } from '@/types/institutions'

export interface PerfilPostulanteModalProps {
  /** Postulación seleccionada (datos de la fila + usuarioId del postulante) */
  postulacion: InstitutionJobApplicant | null
  onClose: () => void
}

const labelStyle: CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--fg3)',
  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4,
}

const valueStyle: CSSProperties = {
  fontSize: 14, color: 'var(--fg1)', lineHeight: 1.5, fontWeight: 500,
}

interface ChatMensaje {
  id: string | number
  from_id?: string | number
  remitenteId?: string | number
  to_id?: string | number
  destinatarioId?: string | number
  content?: string
  contenido?: string
  created_at?: string
  fechaCreacion?: string
}

/** Extrae el primer arreglo de strings válido entre varios campos candidatos. */
function pickArray(perfil: PerfilPcd | undefined, ...rutas: string[][]): string[] {
  if (!perfil) return []
  for (const ruta of rutas) {
    let actual: unknown = perfil
    for (const key of ruta) {
      actual = (actual as Record<string, unknown>)?.[key]
    }
    if (Array.isArray(actual) && actual.length > 0) {
      const limpio = actual.filter((s): s is string => typeof s === 'string' && s.length > 0)
      if (limpio.length > 0) return limpio
    }
  }
  return []
}

/* ── Chat directo con el postulante (dentro del modal) ─────── */

function ChatConPostulante({
  postulacion,
  onVolver,
}: {
  postulacion: InstitutionJobApplicant
  onVolver: () => void
}) {
  const { addToast } = useUiStore()
  const { user } = useAuthStore()
  const partnerId = postulacion.user_id ?? null

  const [text, setText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: mensajesRaw = [], isLoading: cargando } = useMessages(partnerId) as {
    data?: ChatMensaje[]
    isLoading: boolean
  }
  const sendMessage = useSendMessage() as unknown as {
    mutateAsync: (v: { toId: string | number; content: string }) => Promise<unknown>
    isPending: boolean
  }
  const marcarLeidos = useMarcarConversacionLeida()

  // Al abrir la conversación, marcar como leídos los mensajes del postulante.
  // La llamada es idempotente: el backend solo actualiza los que estén
  // `leido == false` y devuelve 0 si no hay pendientes.
  useEffect(() => {
    if (partnerId) {
      marcarLeidos.mutate(partnerId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId])

  const normalizar = (m: ChatMensaje) => ({
    id: m.id,
    mio: String(m.from_id ?? m.remitenteId ?? '') === String(user?.id),
    content: m.content ?? m.contenido ?? '',
    fecha: m.created_at ?? m.fechaCreacion ?? '',
  })
  const mensajes = mensajesRaw.map(normalizar)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajesRaw, sendMessage.isPending])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    const msg = text.trim()
    if (!msg || sendMessage.isPending || !partnerId) return
    setText('')
    try {
      await sendMessage.mutateAsync({ toId: partnerId, content: msg })
    } catch (err: unknown) {
      setText(msg) // restaurar el texto si falla el envío
      const apiErr = err as { response?: { data?: { message?: string } } }
      addToast(apiErr.response?.data?.message ?? 'No se pudo enviar el mensaje', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 380 }}>
      {/* Sub-header del chat */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button
          onClick={onVolver}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none',
            border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 13,
            fontWeight: 600, padding: 0, fontFamily: 'var(--font-body)',
          }}
        >
          ← Perfil
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: hashColor(postulacion.user_name ?? ''), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            {(postulacion.user_name ?? '?')[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--fg1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {postulacion.user_name ?? 'Postulante'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg3)' }}>Re: {postulacion.job_title ?? 'Vacante'}</div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
        minHeight: 260, maxHeight: 340, background: 'var(--bg-warm)', borderRadius: 14,
        border: '1px solid var(--border-color)',
      }}>
        {cargando && mensajes.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--fg3)', fontSize: 13, gap: 6 }}>
            {Icons.loader({ s: 14 })} Cargando conversación...
          </div>
        ) : mensajes.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons.message({ s: 20 })}
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg3)', textAlign: 'center', lineHeight: 1.5 }}>
              Inicia la conversación sobre la vacante<br />
              <strong style={{ color: 'var(--fg2)' }}>{postulacion.job_title ?? 'publicada'}</strong>
            </div>
          </div>
        ) : (
          mensajes.map(msg => (
            <div key={String(msg.id)} style={{ display: 'flex', justifyContent: msg.mio ? 'flex-end' : 'flex-start' }}>
              <span style={{
                background: msg.mio ? 'var(--primary)' : 'var(--bg-surface)',
                color: msg.mio ? '#fff' : 'var(--fg1)',
                borderRadius: msg.mio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '10px 14px', fontSize: 14, maxWidth: '75%',
                border: msg.mio ? 'none' : '1px solid var(--border-color)',
                lineHeight: 1.5, wordBreak: 'break-word',
              }}>
                {msg.content}
                {msg.fecha && (
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: msg.mio ? 'right' : 'left' }}>
                    {new Date(msg.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          aria-label="Escribe un mensaje al postulante"
          style={{
            flex: 1, height: 42, padding: '0 14px', border: '1.5px solid var(--border-color)',
            borderRadius: 21, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--fg1)',
            background: 'var(--bg-surface)', outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMessage.isPending}
          aria-label="Enviar mensaje"
          style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none', flexShrink: 0,
            background: text.trim() && !sendMessage.isPending ? 'var(--primary)' : 'var(--border-color)',
            color: '#fff', cursor: text.trim() && !sendMessage.isPending ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
          }}
        >
          {sendMessage.isPending ? Icons.loader({ s: 18 }) : Icons.send({ s: 18 })}
        </button>
      </form>
    </div>
  )
}

/* ── Contenido del perfil (datos + accesibilidad) ──────────── */

function PerfilCargado({ perfil, postulacion, onContactar }: { perfil: PerfilPcd; postulacion: InstitutionJobApplicant; onContactar: () => void }) {
  const ext = perfil.perfilNecesidades ?? null

  const tiposDiscapacidad = pickArray(perfil, ['perfilNecesidades', 'tiposDiscapacidad'], ['tiposDiscapacidad'])
  const comunicacion = pickArray(perfil, ['perfilNecesidades', 'modosComunicacion'])
  const movilidad = pickArray(perfil, ['perfilNecesidades', 'necesidadesMovilidad'])
  const tecnologia = pickArray(perfil, ['perfilNecesidades', 'accesoTecnologia'])
  const areasApoyo = pickArray(perfil, ['perfilNecesidades', 'areasApoyo'])
  const metas = pickArray(perfil, ['perfilNecesidades', 'metasActuales'], ['perfilNecesidades', 'areasInteres'])

  const ubicacion = [perfil.ciudad, perfil.estado].filter(Boolean).join(', ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Encabezado del postulante */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {perfil.urlAvatar ? (
          <img
            src={perfil.urlAvatar}
            alt={perfil.nombreCompleto ?? 'Postulante'}
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: hashColor(perfil.nombreCompleto ?? ''), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
            {(perfil.nombreCompleto ?? '?')[0]?.toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              {perfil.nombreCompleto ?? postulacion.user_name ?? 'Postulante'}
            </h3>
            {perfil.verificado === true && (
              <span title="Cuenta verificada" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--primary)' }}>
                {Icons.shield({ s: 15 })}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 3 }}>
            {perfil.email && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{Icons.mail({ s: 12 })} {perfil.email}</span>}
            {ubicacion && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{Icons.mapPin({ s: 12 })} {ubicacion}</span>}
          </div>
        </div>
      </div>

      {/* Vacante a la que postuló */}
      <div style={{ background: 'var(--bg-warm)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: 'var(--fg2)' }}>
        Postuló a: <strong style={{ color: 'var(--fg1)' }}>{postulacion.job_title ?? 'Vacante'}</strong>
        {' · '}
        {postulacion.created_at ? new Date(postulacion.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
      </div>

      {/* Carta de presentación */}
      {postulacion.cover_letter && (
        <section>
          <span style={labelStyle}>Carta de presentación</span>
          <p style={{ fontSize: 13.5, color: 'var(--fg2)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap', background: 'var(--bg-warm)', borderRadius: 10, padding: '12px 14px' }}>
            {postulacion.cover_letter}
          </p>
        </section>
      )}

      {/* Perfil de accesibilidad */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={labelStyle}>Perfil de accesibilidad y necesidades</span>

        {tiposDiscapacidad.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)', marginBottom: 6 }}>Tipos de discapacidad</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tiposDiscapacidad.map(t => (
                <span key={t} style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg2)', background: 'var(--bg-warm)', border: '1px solid var(--border-color)', padding: '3px 10px', borderRadius: 12 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {(comunicacion.length > 0 || movilidad.length > 0 || tecnologia.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {comunicacion.length > 0 && (
              <div style={{ background: 'var(--bg-warm)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', marginBottom: 4 }}>🗣️ Comunicación</div>
                <div style={{ ...valueStyle, fontSize: 13 }}>{comunicacion.join(', ')}</div>
              </div>
            )}
            {movilidad.length > 0 && (
              <div style={{ background: 'var(--bg-warm)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', marginBottom: 4 }}>♿ Movilidad</div>
                <div style={{ ...valueStyle, fontSize: 13 }}>{movilidad.join(', ')}</div>
              </div>
            )}
            {tecnologia.length > 0 && (
              <div style={{ background: 'var(--bg-warm)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', marginBottom: 4 }}>💻 Tecnología</div>
                <div style={{ ...valueStyle, fontSize: 13 }}>{tecnologia.join(', ')}</div>
              </div>
            )}
          </div>
        )}

        {areasApoyo.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)', marginBottom: 6 }}>Áreas donde necesita apoyo</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {areasApoyo.map(a => (
                <span key={a} style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', background: 'color-mix(in oklch, var(--primary) 8%, transparent)', border: '1px solid color-mix(in oklch, var(--primary) 25%, transparent)', padding: '3px 10px', borderRadius: 12 }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {metas.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)', marginBottom: 6 }}>Metas e intereses</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: 'var(--fg2)', lineHeight: 1.7 }}>
              {metas.map(m => <li key={m}>{m}</li>)}
            </ul>
          </div>
        )}

        {/* Sin datos de accesibilidad cargados */}
        {!ext && (
          <div style={{ background: 'var(--bg-warm)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--fg3)', lineHeight: 1.5 }}>
            Esta persona aún no ha completado su perfil de necesidades en Raíces.
          </div>
        )}
      </section>

      {/* CTA: contacto directo */}
      {postulacion.user_id ? (
        <button
          onClick={onContactar}
          className="btn-primary"
          style={{
            padding: '12px 24px', borderRadius: 12, fontSize: 14.5, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {Icons.message({ s: 17 })} Enviar mensaje
        </button>
      ) : (
        <div style={{ background: 'var(--bg-warm)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--fg3)', textAlign: 'center' }}>
          No está disponible el contacto directo para esta postulación.
        </div>
      )}
    </div>
  )
}

/** Skeleton de carga mientras se consulta el perfil. */
function PerfilSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 18, width: 180, borderRadius: 6, background: 'var(--border-color)', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 13, width: 240, borderRadius: 6, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      {[100, 64, 80, 46].map((w, i) => (
        <div key={i} style={{ height: 42, width: `${w}%`, borderRadius: 10, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

/**
 * Modal con el perfil completo del postulante (datos, accesibilidad, carta)
 * y chat directo integrado (GET /mensajes/con/:id, POST /mensajes/enviar/:id).
 * El perfil consume GET /usuarios/perfil-pcd/:usuarioId, endpoint que el
 * backend autoriza a instituciones/empresas para evaluar postulaciones.
 */
export default function PerfilPostulanteModal({ postulacion, onClose }: PerfilPostulanteModalProps) {
  const usuarioId = postulacion?.user_id ?? null
  const [chatAbierto, setChatAbierto] = useState(false)
  const { data: perfil, isLoading, isError } = usePerfilPcd(usuarioId)

  if (!postulacion) return null

  // Al abrir el modal se muestra el perfil; el CTA cambia a la vista de chat
  const modo = chatAbierto && postulacion.user_id ? 'chat' : 'perfil'

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'var(--modal-backdrop, rgba(15, 23, 42, 0.45))',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={modo === 'chat' ? `Conversación con ${postulacion.user_name ?? 'postulante'}` : `Perfil de ${postulacion.user_name ?? 'postulante'}`}
        className="animate-scale-in"
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
          borderRadius: 20, width: '100%', maxWidth: 560,
          maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
          padding: 28, boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header con cerrar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {modo === 'chat' ? 'Mensaje directo' : 'Perfil del postulante'}
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4, display: 'flex' }}
          >
            {Icons.x({ s: 18 })}
          </button>
        </div>

        {modo === 'chat' ? (
          <ChatConPostulante postulacion={postulacion} onVolver={() => setChatAbierto(false)} />
        ) : isLoading ? (
          <PerfilSkeleton />
        ) : isError || !perfil ? (
          <div style={{ textAlign: 'center', padding: '40px 16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-error) 12%, transparent)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              {Icons.shieldAlert({ s: 22 })}
            </div>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg2)', margin: '0 0 6px' }}>
              No pudimos cargar el perfil de esta persona.
            </p>
            <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>
              Es posible que haya restringido la visibilidad de sus datos o que su cuenta ya no esté activa.
            </p>
          </div>
        ) : (
          <PerfilCargado perfil={perfil} postulacion={postulacion} onContactar={() => setChatAbierto(true)} />
        )}
      </div>
    </div>,
    document.body
  )
}
