import { useState } from 'react'
import { useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { useForos, useForoDetail, useCreateForo, useCreateForoRespuesta } from '../hooks/useCommunity'

const relativeDate = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d)
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'ahora'
  if (h < 24) return `${h}h`
  const d2 = Math.floor(h / 24)
  return `${d2}d`
}

/* ── Forum Card ──────────────────────────────────────────── */
function ForumCard({ forum, onClick }) {
  return (
    <button
      onClick={() => onClick(forum.id)}
      style={{
        width: '100%', textAlign: 'left', background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)', borderRadius: 12, padding: 20,
        boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', margin: 0, lineHeight: 1.3 }}>
          {forum.titulo}
        </h3>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, flexShrink: 0,
          background: 'rgba(99,102,241,0.1)', color: 'var(--primary, #6366f1)',
        }}>
          {forum.respuestasCount} respuesta{forum.respuestasCount !== 1 ? 's' : ''}
        </span>
      </div>
      {forum.preguntaDetonante && (
        <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
          {forum.preguntaDetonante}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--fg3)', marginTop: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {Icons.user({ s: 12 })} {forum.autorNombre || 'Institución'}
        </span>
        <span>·</span>
        <span>{relativeDate(forum.fechaCreacion)}</span>
      </div>
    </button>
  )
}

/* ── Forum Detail ────────────────────────────────────────── */
function ForumDetail({ forumId, onBack }) {
  const { addToast } = useUiStore()
  const { data: forum, isLoading } = useForoDetail(forumId)
  const createRespuesta = useCreateForoRespuesta(forumId)
  const [respuesta, setRespuesta] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!respuesta.trim() || createRespuesta.isPending) return
    createRespuesta.mutate({ contenido: respuesta.trim() }, {
      onSuccess: () => {
        setRespuesta('')
        addToast('Respuesta publicada', 'success')
      },
      onError: () => addToast('Error al publicar respuesta', 'error'),
    })
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none',
          border: 'none', color: 'var(--primary)', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
          marginBottom: 20, padding: 0,
        }}
      >
        {Icons.arrowLeft({ s: 16 })} Volver a foros
      </button>

      {isLoading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg3)', fontSize: 14 }}>
          Cargando foro...
        </div>
      ) : !forum ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg3)', fontSize: 14 }}>
          Foro no encontrado
        </div>
      ) : (
        <>
          {/* Forum header */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 14, padding: 28, boxShadow: 'var(--shadow-sm)', marginBottom: 20,
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
              {forum.titulo}
            </h2>
            {forum.descripcion && (
              <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 16px', lineHeight: 1.6 }}>
                {forum.descripcion}
              </p>
            )}
            {forum.preguntaDetonante && (
              <div style={{
                padding: '16px 20px', background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10,
                fontSize: 15, color: 'var(--fg1)', fontWeight: 600, lineHeight: 1.5,
                fontStyle: 'italic',
              }}>
                💬 {forum.preguntaDetonante}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 12, color: 'var(--fg3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {Icons.user({ s: 12 })} {forum.autorNombre || 'Institución'}
              </span>
              <span>·</span>
              <span>{relativeDate(forum.fechaCreacion)}</span>
              <span>·</span>
              <span>{forum.respuestas?.length ?? 0} respuesta{(forum.respuestas?.length ?? 0) !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Responses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {forum.respuestas?.length > 0 ? (
              forum.respuestas.map((r) => (
                <div key={r.id} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                  borderRadius: 12, padding: 18, boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50% 50% 50% 14%',
                      background: r.autorAvatar ? 'transparent' : 'var(--primary-subtle)',
                      color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, overflow: 'hidden', flexShrink: 0,
                    }}>
                      {r.autorAvatar ? (
                        <img src={r.autorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (r.autorNombre?.[0] ?? '?').toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg1)' }}>{r.autorNombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg3)' }}>{relativeDate(r.fechaCreacion)}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--fg1)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {r.contenido}
                  </p>
                </div>
              ))
            ) : (
              <div style={{
                background: 'var(--bg-surface)', border: '1px dashed var(--border-color)',
                borderRadius: 12, padding: 32, textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, color: 'var(--fg3)' }}>
                  Sé el primero en responder esta pregunta detonante
                </div>
              </div>
            )}
          </div>

          {/* Response form */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-sm)',
          }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 14px' }}>
              Tu respuesta
            </h4>
            <form onSubmit={handleSubmit}>
              <textarea
                rows={4}
                value={respuesta}
                onChange={e => setRespuesta(e.target.value)}
                placeholder="Comparte tu experiencia o consejo..."
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1px solid var(--border-color)', borderRadius: 10,
                  fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'var(--font-body)', color: 'var(--fg1)',
                  background: 'var(--bg-warm)', outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="submit"
                  disabled={!respuesta.trim() || createRespuesta.isPending}
                  className="btn-primary"
                  style={{
                    padding: '10px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {createRespuesta.isPending ? 'Enviando...' : 'Publicar respuesta'}
                  {Icons.send({ s: 15 })}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Create Forum Modal ──────────────────────────────────── */
function CreateForumModal({ onClose }) {
  const { addToast } = useUiStore()
  const createForo = useCreateForo()
  const [form, setForm] = useState({ titulo: '', descripcion: '', preguntaDetonante: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim() || !form.preguntaDetonante.trim()) return
    createForo.mutate(form, {
      onSuccess: () => { addToast('Foro creado exitosamente', 'success'); onClose() },
      onError: () => addToast('Error al crear el foro', 'error'),
    })
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)',
    borderRadius: 10, fontSize: 14, boxSizing: 'border-box',
    fontFamily: 'var(--font-body)', color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none',
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 32, maxWidth: 520, width: '100%', boxShadow: 'var(--shadow-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 20px' }}>
          Crear nuevo foro
        </h2>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>Título *</label>
          <input
            value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            placeholder="Ej. Consejos para la primera jornada laboral"
            required style={{ ...inputStyle, marginBottom: 14 }}
          />
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>Descripción</label>
          <textarea
            rows={2} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            placeholder="Contexto breve sobre el tema del foro..."
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 14 }}
          />
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>Pregunta detonante *</label>
          <textarea
            rows={3} value={form.preguntaDetonante} onChange={e => setForm(f => ({ ...f, preguntaDetonante: e.target.value }))}
            placeholder="¿Qué consejo le darías a alguien que está empezando?"
            required style={{ ...inputStyle, resize: 'vertical', marginBottom: 20 }}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={!form.titulo.trim() || !form.preguntaDetonante.trim() || createForo.isPending} style={{ padding: '10px 24px', fontSize: 14 }}>
              {createForo.isPending ? 'Creando...' : 'Crear foro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/* ═══ ForosPage (main) ════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════ */

export default function ForosPage() {
  const { user } = useAuthStore()
  const [selectedForoId, setSelectedForoId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const { data: foros = [], isLoading } = useForos()

  const isInstitutionOrAdmin = user?.role === 'institution' || user?.role === 'admin'

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '760px' }}>
      <div style={{ maxWidth: 760, width: '100%', margin: '0 auto', padding: '0 20px 48px' }}>

        {/* Header */}
        <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
              Foros
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0' }}>
              Espacio de discusión para compartir experiencias y consejos
            </p>
          </div>
          {isInstitutionOrAdmin && !selectedForoId && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {Icons.plus({ s: 15 })} Crear foro
            </button>
          )}
        </div>

        {selectedForoId ? (
          <div className="animate-fade-in-up">
            <ForumDetail forumId={selectedForoId} onBack={() => setSelectedForoId(null)} />
          </div>
        ) : isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                height: 110, borderRadius: 12, background: 'var(--border-color)',
                animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>
        ) : foros.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)', border: '1px dashed var(--border-color)',
            borderRadius: 14, padding: 48, textAlign: 'center',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {Icons.message({ s: 24 })}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>No hay foros aún</h3>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0 }}>
              {isInstitutionOrAdmin ? 'Sé el primero en crear un foro de discusión.' : 'Pronto habrá foros de discusión disponibles.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="stagger-children">
            {foros.map((forum) => (
              <div key={forum.id} className="animate-fade-in-up">
                <ForumCard forum={forum} onClick={setSelectedForoId} />
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateForumModal onClose={() => setShowCreate(false)} />}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </main>
  )
}
