import { useState } from 'react'
import { useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import { useForos, useForoDetail, useCreateForo, useCreateForoRespuesta } from '../hooks/useCommunity'

const PAGE_SIZE = 10

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
  const isExclusivo = forum.exclusivoPadres
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
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {isExclusivo && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
              background: 'rgba(16,185,129,0.1)', color: '#10b981',
            }}>
              👨‍👩‍👧 Solo padres
            </span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
            background: 'rgba(99,102,241,0.1)', color: 'var(--primary, #6366f1)',
          }}>
            {forum.respuestasCount} respuesta{forum.respuestasCount !== 1 ? 's' : ''}
          </span>
        </div>
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

/* ── Respuesta ───────────────────────────────────────────── */
function RespuestaCard({ r }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50% 50% 50% 14%',
          background: r.autorAvatar ? 'transparent' : 'var(--primary-subtle)',
          color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, overflow: 'hidden', flexShrink: 0,
        }}>
          {r.autorAvatar ? (
            <img src={r.autorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (r.autorNombre?.[0] ?? '?').toUpperCase()
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg1)' }}>{r.autorNombre}</div>
          <div style={{ fontSize: 11, color: 'var(--fg3)' }}>{relativeDate(r.fechaCreacion)}</div>
        </div>
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--fg1)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {r.contenido}
      </p>
    </div>
  )
}

/* ── Formulario de respuesta por pregunta ────────────────── */
function RespuestaForm({ preguntaIndex, pregunta, foroId }) {
  const { addToast } = useUiStore()
  const createRespuesta = useCreateForoRespuesta(foroId)
  const [respuesta, setRespuesta] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!respuesta.trim() || createRespuesta.isPending) return
    createRespuesta.mutate({ preguntaIndex, contenido: respuesta.trim() }, {
      onSuccess: () => {
        setRespuesta('')
        addToast('Respuesta publicada', 'success')
      },
      onError: () => addToast('Error al publicar respuesta', 'error'),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        rows={3}
        value={respuesta}
        onChange={e => setRespuesta(e.target.value)}
        placeholder={`Responde a: ${pregunta}`}
        style={{
          width: '100%', padding: '12px 14px',
          border: '1px solid var(--border-color)', borderRadius: 10,
          fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
          fontFamily: 'var(--font-body)', color: 'var(--fg1)',
          background: 'var(--bg-warm)', outline: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button
          type="submit"
          disabled={!respuesta.trim() || createRespuesta.isPending}
          className="btn-primary"
          style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {createRespuesta.isPending ? 'Enviando...' : 'Responder'}
          {Icons.send({ s: 14 })}
        </button>
      </div>
    </form>
  )
}

/* ── Forum Detail ────────────────────────────────────────── */
function ForumDetail({ forumId, onBack }) {
  const { user } = useAuthStore()
  const { data: forum, isLoading } = useForoDetail(forumId)

  const puedeResponder = !forum?.exclusivoPadres || user?.role === 'tutor' || user?.role === 'admin'

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                {forum.titulo}
              </h2>
              {forum.exclusivoPadres && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 8,
                  background: 'rgba(16,185,129,0.1)', color: '#10b981',
                }}>
                  👨‍👩‍👧 Exclusivo para padres/tutores
                </span>
              )}
            </div>
            {forum.descripcion && (
              <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 16px', lineHeight: 1.6 }}>
                {forum.descripcion}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: 'var(--fg3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {Icons.user({ s: 12 })} {forum.autorNombre || 'Institución'}
              </span>
              <span>·</span>
              <span>{relativeDate(forum.fechaCreacion)}</span>
              <span>·</span>
              <span>{forum.respuestas?.length ?? 0} respuesta{(forum.respuestas?.length ?? 0) !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Preguntas detonantes con sus respuestas agrupadas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
            {(forum.preguntasConRespuestas ?? []).map((pcr, idx) => {
              const hayRespuestas = pcr.respuestas.length > 0
              return (
                <div key={idx} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                  borderRadius: 14, padding: 22, boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{
                    padding: '12px 16px', background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10,
                    fontSize: 14.5, color: 'var(--fg1)', fontWeight: 600, lineHeight: 1.5,
                    marginBottom: hayRespuestas || !puedeResponder ? 14 : 0,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
                      Pregunta {idx + 1}
                    </span>
                    💬 {pcr.pregunta}
                  </div>

                  {hayRespuestas && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                      {pcr.respuestas.map((r) => (
                        <RespuestaCard key={r.id} r={r} />
                      ))}
                    </div>
                  )}

                  {puedeResponder ? (
                    <RespuestaForm preguntaIndex={idx} pregunta={pcr.pregunta} foroId={forumId} />
                  ) : (
                    <div style={{
                      padding: '14px 16px', borderRadius: 10, fontSize: 13, color: 'var(--fg2)',
                      background: 'rgba(16,185,129,0.06)', border: '1px dashed rgba(16,185,129,0.3)',
                    }}>
                      👨‍👩‍👧 Este foro es exclusivo para padres y tutores. Inicia sesión con una cuenta de padre/tutor para participar.
                    </div>
                  )}
                </div>
              )
            })}
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
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    preguntasDetonantes: [''],
    exclusivoPadres: false,
  })

  const preguntasValidas = form.preguntasDetonantes.map(p => p.trim()).filter(Boolean)

  const setPregunta = (idx, value) => {
    setForm(f => ({
      ...f,
      preguntasDetonantes: f.preguntasDetonantes.map((p, i) => i === idx ? value : p),
    }))
  }

  const addPregunta = () => {
    setForm(f => ({ ...f, preguntasDetonantes: [...f.preguntasDetonantes, ''] }))
  }

  const removePregunta = (idx) => {
    setForm(f => ({
      ...f,
      preguntasDetonantes: f.preguntasDetonantes.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim() || preguntasValidas.length === 0) return
    createForo.mutate({
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      preguntasDetonantes: preguntasValidas,
      exclusivoPadres: form.exclusivoPadres,
    }, {
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
      <div onClick={e => e.stopPropagation()} className="animate-scale-in" style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 32, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
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

          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg2)', display: 'block', marginBottom: 6 }}>
            Preguntas detonantes *
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {form.preguntasDetonantes.map((pregunta, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <textarea
                  rows={2}
                  value={pregunta}
                  onChange={e => setPregunta(idx, e.target.value)}
                  placeholder={`Pregunta ${idx + 1}: ¿Qué consejo le darías a alguien que empieza?`}
                  style={{ ...inputStyle, resize: 'vertical', flex: 1 }}
                />
                {form.preguntasDetonantes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePregunta(idx)}
                    title="Quitar pregunta"
                    style={{
                      padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)',
                      background: 'transparent', color: 'var(--fg3)', cursor: 'pointer',
                      fontSize: 14, lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPregunta}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
              color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font-body)', padding: 0, marginBottom: 16,
            }}
          >
            {Icons.plus({ s: 14 })} Agregar otra pregunta
          </button>

          {/* Toggle exclusivo para padres */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
            border: form.exclusivoPadres ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-color)',
            background: form.exclusivoPadres ? 'rgba(16,185,129,0.05)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            <input
              type="checkbox"
              checked={form.exclusivoPadres}
              onChange={e => setForm(f => ({ ...f, exclusivoPadres: e.target.checked }))}
              style={{ width: 17, height: 17, accentColor: '#10b981', cursor: 'pointer', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg1)' }}>
                👨‍👩‍👧 Exclusivo para padres/tutores
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>
                Solo los padres y tutores podrán ver y responder este foro.
              </div>
            </div>
          </label>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={!form.titulo.trim() || preguntasValidas.length === 0 || createForo.isPending} style={{ padding: '10px 24px', fontSize: 14 }}>
              {createForo.isPending ? 'Creando...' : 'Crear foro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/* ═══ ForosExplorer (reutilizable) ════════════════════════ */
/* ═══ Se usa en /foros y dentro del Portal de Institución ═ */
/* ═══════════════════════════════════════════════════════════ */

export function ForosExplorer({ showHeader = true }) {
  const { user } = useAuthStore()
  const [selectedForoId, setSelectedForoId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [buscarInput, setBuscarInput] = useState('')
  const [buscar, setBuscar] = useState('')
  const [pagina, setPagina] = useState(1)
  const { data, isLoading } = useForos({ pagina, limite: PAGE_SIZE, buscar })
  const foros = data?.foros ?? []
  const totalPaginas = data?.totalPaginas ?? 1
  const total = data?.total ?? 0

  const isInstitutionOrAdmin = user?.role === 'institution' || user?.role === 'admin'

  const handleSearch = (e) => {
    e.preventDefault()
    setPagina(1)
    setBuscar(buscarInput.trim())
  }

  return (
    <div style={{ maxWidth: 760, width: '100%', margin: '0 auto' }}>
      {showHeader && (
        <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
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
      )}

      {selectedForoId ? (
        <div className="animate-fade-in-up">
          <ForumDetail forumId={selectedForoId} onBack={() => setSelectedForoId(null)} />
        </div>
      ) : (
        <>
          {/* Buscador */}
          <form
            onSubmit={handleSearch}
            className="animate-fade-in-up"
            style={{ display: 'flex', gap: 8, marginBottom: 16 }}
          >
            <input
              value={buscarInput}
              onChange={e => setBuscarInput(e.target.value)}
              placeholder="Buscar por título o descripción..."
              style={{
                flex: 1, padding: '10px 14px', border: '1px solid var(--border-color)',
                borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-body)',
                color: 'var(--fg1)', background: 'var(--bg-warm)', outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {Icons.search({ s: 14 })} Buscar
            </button>
            {!showHeader && isInstitutionOrAdmin && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="btn-primary"
                style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {Icons.plus({ s: 14 })} Crear foro
              </button>
            )}
          </form>

          {isLoading ? (
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
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
                {buscar ? 'Sin resultados' : 'No hay foros aún'}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0 }}>
                {buscar
                  ? 'No encontramos foros con ese término. Prueba con otra búsqueda.'
                  : (isInstitutionOrAdmin ? 'Sé el primero en crear un foro de discusión.' : 'Pronto habrá foros de discusión disponibles.')}
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="stagger-children">
                {foros.map((forum) => (
                  <div key={forum.id} className="animate-fade-in-up">
                    <ForumCard forum={forum} onClick={setSelectedForoId} />
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPaginas > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 24 }}>
                  <button
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina <= 1}
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
                      color: pagina <= 1 ? 'var(--fg3)' : 'var(--fg1)', cursor: pagina <= 1 ? 'default' : 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    ← Anterior
                  </button>
                  <span style={{ fontSize: 13, color: 'var(--fg3)' }}>
                    Página {pagina} de {totalPaginas} · {total} foro{total !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina >= totalPaginas}
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
                      color: pagina >= totalPaginas ? 'var(--fg3)' : 'var(--fg1)', cursor: pagina >= totalPaginas ? 'default' : 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {showCreate && <CreateForumModal onClose={() => setShowCreate(false)} />}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/* ═══ ForosPage (main) ════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════ */

export default function ForosPage() {
  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '760px' }}>
      <div style={{ maxWidth: 760, width: '100%', margin: '0 auto', padding: '0 20px 48px' }}>
        <ForosExplorer showHeader />
      </div>
    </main>
  )
}
