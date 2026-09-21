import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Icons } from '@shared/components/shared'
import { useMiInstitucion } from '../hooks/useInstitutions'
import { useUiStore } from '@shared/stores/uiStore'

export interface ResenaItem {
  id: string
  usuarioNombre: string
  calificacion: number
  comentario: string
  fecha: string
  respuestaOficial?: string
  fechaRespuesta?: string
}

const MOCK_RESENAS: ResenaItem[] = [
  {
    id: 'r1',
    usuarioNombre: 'María Elena Ramos',
    calificacion: 5,
    comentario: 'Excelente atención en los talleres de terapia ocupacional. Las instalaciones son muy accesibles y el personal es sumamente paciente y profesional.',
    fecha: 'Hace 3 días',
    respuestaOficial: '¡Muchas gracias María Elena! Nos alegra profundamente poder acompañar el desarrollo y bienestar de tu familia.',
    fechaRespuesta: 'Hace 2 días',
  },
  {
    id: 'r2',
    usuarioNombre: 'Carlos Mendoza (Tutor)',
    calificacion: 4,
    comentario: 'Muy buena orientación sobre becas y programas de asistencia. Sería genial que ampliaran los horarios los fines de semana.',
    fecha: 'Hace 1 semana',
  },
]

export default function ResenasTab() {
  const { data: institution } = useMiInstitucion()
  const { addToast } = useUiStore()

  const [resenas, setResenas] = useState<ResenaItem[]>(MOCK_RESENAS)

  // Modal response state
  const [selectedResena, setSelectedResena] = useState<ResenaItem | null>(null)
  const [respuestaText, setRespuestaText] = useState('')

  const avgRating = (resenas.reduce((acc, r) => acc + r.calificacion, 0) / (resenas.length || 1)).toFixed(1)

  const handleOpenResponder = (resena: ResenaItem) => {
    setSelectedResena(resena)
    setRespuestaText(resena.respuestaOficial ?? '')
  }

  const handleSaveRespuesta = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResena) return
    if (!respuestaText.trim()) {
      addToast('Por favor escribe un mensaje de respuesta', 'warning')
      return
    }

    const next = resenas.map(r =>
      r.id === selectedResena.id
        ? {
            ...r,
            respuestaOficial: respuestaText.trim(),
            fechaRespuesta: 'Ahora mismo',
          }
        : r
    )

    setResenas(next)
    addToast('Respuesta oficial publicada', 'success')
    setSelectedResena(null)
    setRespuestaText('')
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Stats bar */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
            Reputación y Reseñas de la Comunidad
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0, lineHeight: 1.5, maxWidth: 580 }}>
            Consulta las opiniones que han dejado familias y usuarios en tu perfil público y responde oficialmente a sus mensajes.
          </p>
        </div>

        {/* Rating badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-warm)',
          border: '1.5px solid var(--border-color)', borderRadius: 14, padding: '12px 20px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--fg1)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
              {avgRating}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)', marginTop: 2 }}>
              de 5 estrellas
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} style={{ color: star <= Math.round(Number(avgRating)) ? '#F59E0B' : 'var(--border-color)', fontSize: 18 }}>
                  ★
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg2)' }}>
              {resenas.length} opiniones registradas
            </div>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {resenas.map(resena => (
          <div
            key={resena.id}
            style={{
              background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)',
              borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            {/* User row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: 'color-mix(in oklch, var(--primary) 12%, transparent)',
                  color: 'var(--primary)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {resena.usuarioNombre.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>{resena.usuarioNombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{resena.fecha}</div>
                </div>
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} style={{ color: star <= resena.calificacion ? '#F59E0B' : 'var(--border-color)', fontSize: 16 }}>
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Comment */}
            <p style={{ fontSize: 14.5, color: 'var(--fg2)', lineHeight: 1.6, margin: 0 }}>
              "{resena.comentario}"
            </p>

            {/* Official response if present */}
            {resena.respuestaOficial ? (
              <div style={{
                marginTop: 8, padding: '14px 18px', borderRadius: 12,
                background: 'color-mix(in oklch, var(--primary) 6%, var(--bg-surface))',
                borderLeft: '4px solid var(--primary)',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🏢 Respuesta Oficial de {institution?.name ?? 'tu Institución'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--fg3)' }}>{resena.fechaRespuesta}</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--fg1)', margin: 0, lineHeight: 1.5 }}>
                  {resena.respuestaOficial}
                </p>
                <div style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                  <button
                    onClick={() => handleOpenResponder(resena)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Editar respuesta
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => handleOpenResponder(resena)}
                  style={{
                    background: 'var(--bg-warm)', border: '1px solid var(--border-color)',
                    borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 700,
                    color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  💬 Responder oficialmente
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Responder a Reseña */}
      {selectedResena && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedResena(null)}>
          <div
            className="glass-card animate-scale-in"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 500,
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
              padding: 28,
              borderRadius: 20,
              margin: 'auto',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                Respuesta Oficial a {selectedResena.usuarioNombre}
              </h3>
              <button onClick={() => setSelectedResena(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4 }}>
                {Icons.x({ s: 18 })}
              </button>
            </div>

            {/* Original comment quote */}
            <div style={{ background: 'var(--bg-warm)', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, color: 'var(--fg2)', fontStyle: 'italic' }}>
              "{selectedResena.comentario}"
            </div>

            <form onSubmit={handleSaveRespuesta} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>
                  Tu mensaje institucional *
                </label>
                <textarea
                  rows={4}
                  required
                  value={respuestaText}
                  onChange={e => setRespuestaText(e.target.value)}
                  placeholder="Escribe una respuesta amable, clara y representativa de tu institución..."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', fontSize: 14, outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setSelectedResena(null)}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', borderRadius: 10, fontSize: 14 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700 }}
                >
                  Publicar Respuesta
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
