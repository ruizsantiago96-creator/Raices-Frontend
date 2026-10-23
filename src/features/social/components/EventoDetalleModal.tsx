import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Clock,
  MapPin,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Copy,
  Plus,
  Tag,
  Share2,
  Calendar as CalendarIcon,
  Trash2,
} from 'lucide-react'
import { useEventoDetalle, useToggleAsistenciaEvento, useEliminarEvento } from '../hooks/useEventos'
import { useUiStore } from '../../../shared/stores/uiStore'
import { useAuthStore } from '../../auth/store/authStore'
import type { EventoItem } from '@/types/social'

interface EventoDetalleModalProps {
  eventoId: string | null
  eventoInicial?: EventoItem | null
  onClose: () => void
}

function formatearFechaLarga(fechaStr?: string): string {
  if (!fechaStr) return 'Fecha por confirmar'
  try {
    const fecha = new Date(fechaStr)
    if (isNaN(fecha.getTime())) return fechaStr
    const str = fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    return str.charAt(0).toUpperCase() + str.slice(1)
  } catch {
    return fechaStr
  }
}

function generarGoogleCalendarUrl(evento: EventoItem): string {
  if (!evento.fechaInicio) return '#'
  try {
    const inicio = new Date(evento.fechaInicio)
    const fin = evento.fechaFin
      ? new Date(evento.fechaFin)
      : new Date(inicio.getTime() + 2 * 60 * 60 * 1000)

    const formatGCal = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')

    const dates = `${formatGCal(inicio)}/${formatGCal(fin)}`
    const details = encodeURIComponent(
      `${evento.descripcion || 'Evento comunitario en Raíces'}\n\nEnlace: ${window.location.href}`,
    )
    const location = encodeURIComponent(evento.ubicacion || evento.ciudad || 'Por confirmar')
    const text = encodeURIComponent(evento.titulo)

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`
  } catch {
    return '#'
  }
}

const CATEGORIA_LABELS: Record<string, string> = {
  taller: 'Taller / Capacitación',
  cultural: 'Arte y Cultura',
  deporte: 'Deporte y Bienestar',
  encuentro: 'Encuentro y Convivencia',
  voluntariado: 'Voluntariado',
  otro: 'Comunidad',
}

export function EventoDetalleModal({ eventoId, eventoInicial, onClose }: EventoDetalleModalProps) {
  const { addToast } = useUiStore()
  const { user } = useAuthStore()
  const toggleAsistencia = useToggleAsistenciaEvento()
  const eliminarEventoMutation = useEliminarEvento()
  const [copiado, setCopiado] = useState(false)

  const { data: eventoRemoto, isLoading, isError } = useEventoDetalle(eventoId)
  const evento: EventoItem | null | undefined = eventoRemoto ?? eventoInicial

  // Determinar si el usuario actual es el creador del evento o administrador
  const esCreadorOAdmin = Boolean(
    user && (
      (evento?.creadorId && (evento.creadorId === user.id || evento.creadorId === (user as { _id?: string })._id)) ||
      (evento?.organizador?.id && evento.organizador.id === user.id) ||
      user.role === 'admin' ||
      user.rol === 'admin'
    )
  )

  const [confirmarEliminar, setConfirmarEliminar] = useState(false)

  const handleEliminarEvento = () => {
    setConfirmarEliminar(true)
  }

  const ejecutarEliminacion = () => {
    if (!eventoId) return

    eliminarEventoMutation.mutate(eventoId, {
      onSuccess: () => {
        addToast('Evento eliminado exitosamente', 'success')
        setConfirmarEliminar(false)
        onClose()
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        addToast(error.response?.data?.message || 'No se pudo eliminar el evento', 'error')
      },
    })
  }

  if (!eventoId) return null

  const esAsistiendo = Boolean(evento?.asisto)
  const totalAsistentes = evento?.cantidadAsistentes ?? 0
  const organizadorNombre =
    evento?.organizador?.nombre || evento?.nombreCreador || 'Comunidad Raíces'
  const organizadorAvatar = evento?.organizador?.avatar || evento?.urlAvatarCreador || ''
  const categoriaLabel = CATEGORIA_LABELS[evento?.categoria ?? 'otro'] ?? 'Comunidad'

  const queryDireccionCompleta = [
    evento?.ubicacion?.trim(),
    evento?.ciudad?.trim(),
  ]
    .filter(Boolean)
    .join(', ')

  const handleToggleAsistencia = () => {
    if (!user) {
      addToast('Inicia sesión para confirmar tu asistencia a este evento', 'info')
      return
    }
    toggleAsistencia.mutate(eventoId, {
      onSuccess: data => {
        if (data.asistiendo) {
          addToast('¡Asistencia confirmada! Nos vemos allí.', 'success')
        } else {
          addToast('Has cancelado tu asistencia al evento.', 'info')
        }
      },
      onError: () => {
        addToast('No se pudo actualizar la asistencia', 'error')
      },
    })
  }

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      addToast('Enlace del evento copiado al portapapeles', 'success')
      setTimeout(() => setCopiado(false), 2500)
    }
  }

  const handleShareWhatsApp = () => {
    const texto = encodeURIComponent(
      `¡Te invito a este evento en Raíces! 🌟\n"${evento?.titulo ?? 'Evento'}"\n${window.location.href}`,
    )
    window.open(`https://wa.me/?text=${texto}`, '_blank', 'noopener,noreferrer')
  }

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer')
  }

  const handleShareTwitter = () => {
    const texto = encodeURIComponent(`Te invito a "${evento?.titulo ?? 'Evento'}" en @RaicesMX 🌱`)
    const url = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${texto}&url=${url}`, '_blank', 'noopener,noreferrer')
  }

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-evento-title"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 60000,
        background: '#09151e',
        color: '#0f172a',
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Sticky Top Bar (Frosted Dark Glass) ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(9, 21, 30, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 24px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: 24,
              padding: '8px 20px',
              fontSize: 13.5,
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'
              e.currentTarget.style.transform = 'translateX(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <ArrowLeft size={16} /> Volver a eventos
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {esCreadorOAdmin && (
              <button
                type="button"
                onClick={handleEliminarEvento}
                disabled={eliminarEventoMutation.isPending}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(239, 68, 68, 0.16)',
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  borderRadius: 24,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fca5a5',
                  cursor: eliminarEventoMutation.isPending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)'
                  e.currentTarget.style.color = '#fca5a5'
                }}
              >
                {eliminarEventoMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Eliminar evento
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: copiado ? '#20bd88' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: 24,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copiado ? <Check size={14} /> : <Copy size={14} />}
              {copiado ? 'Enlace copiado' : 'Compartir'}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar vista completa"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Loading state */}
      {isLoading && !evento ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader2 size={48} className="animate-spin" color="#20bd88" />
        </div>
      ) : isError && !evento ? (
        <div style={{ textAlign: 'center', padding: '100px 24px', color: '#cbd5e1' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#ffffff' }}>
            No pudimos cargar los detalles de este evento
          </h3>
          <p style={{ margin: '0 0 24px', fontSize: 14 }}>
            Verifica tu conexión o intenta nuevamente más tarde.
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              border: 'none',
              background: '#20bd88',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Regresar a eventos
          </button>
        </div>
      ) : evento ? (
        <>
          {/* ══════════════════════════════════════════════════════════════════
              HERO SECTION (Cinematic Edge-to-Edge Full Width)
             ══════════════════════════════════════════════════════════════════ */}
          <section
            style={{
              width: '100%',
              position: 'relative',
              background: evento.urlImagen
                ? `linear-gradient(180deg, rgba(9, 21, 30, 0.72) 0%, rgba(9, 21, 30, 0.94) 85%, #fcfaf6 100%), url(${evento.urlImagen}) center/cover no-repeat`
                : 'linear-gradient(135deg, #072a35 0%, #0d3b4c 45%, #174d57 75%, #20bd88 120%)',
              color: '#ffffff',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              paddingTop: 36,
              paddingBottom: 48,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                maxWidth: 1280,
                margin: '0 auto',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 40,
                flexWrap: 'wrap',
              }}
            >
              {/* Left Column: Category, Title, Organizer & Venue summary */}
              <div style={{ flex: '1 1 540px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '5px 14px',
                      borderRadius: 20,
                      background: '#20bd88',
                      color: '#064e3b',
                      fontSize: 12.5,
                      fontWeight: 800,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {categoriaLabel}
                  </span>
                  <span
                    style={{
                      padding: '5px 14px',
                      borderRadius: 20,
                      background: 'rgba(255, 255, 255, 0.16)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      fontSize: 12.5,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {evento.modalidad ?? 'Presencial'}
                  </span>
                  {evento.cupoMaximo && (
                    <span
                      style={{
                        padding: '5px 12px',
                        borderRadius: 20,
                        background: 'rgba(254, 240, 138, 0.22)',
                        color: '#fef08a',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Cupo: {evento.cupoMaximo} asistentes
                    </span>
                  )}
                </div>

                {/* Event Title */}
                <h1
                  id="modal-evento-title"
                  style={{
                    fontFamily: 'var(--font-display, inherit)',
                    fontSize: 38,
                    fontWeight: 900,
                    lineHeight: 1.18,
                    letterSpacing: '-0.025em',
                    color: '#ffffff',
                    margin: '6px 0 0',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {evento.titulo}
                </h1>

                {/* Organizer line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#20bd88',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 15,
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '2px solid rgba(255,255,255,0.4)',
                    }}
                  >
                    {organizadorAvatar ? (
                      <img
                        src={organizadorAvatar}
                        alt={organizadorNombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      organizadorNombre.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ fontSize: 14.5, color: '#e2e8f0' }}>
                    Organizado por <strong style={{ color: '#ffffff' }}>{organizadorNombre}</strong>
                  </div>
                </div>

                {/* Location row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1', fontSize: 14.5, marginTop: 2 }}>
                  <MapPin size={18} color="#20bd88" style={{ flexShrink: 0 }} />
                  <span>
                    {evento.ubicacion || evento.ciudad || 'Ubicación confirmada al inscribirte'}
                  </span>
                </div>
              </div>

              {/* Right Floating Ticket Card */}
              <div
                style={{
                  width: 360,
                  maxWidth: '100%',
                  background: '#ffffff',
                  borderRadius: 22,
                  padding: 26,
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.35)',
                  color: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  flexShrink: 0,
                  boxSizing: 'border-box',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Fecha y Hora
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    {formatearFechaLarga(evento.fechaInicio)}
                  </div>
                  {evento.fechaFin && (
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                      Hasta: {formatearFechaLarga(evento.fechaFin)}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderTop: '1px solid #f1f5f9',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Entrada:</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#20bd88' }}>
                    Gratis
                  </span>
                </div>

                {/* CTA Button: Confirm attendance */}
                <button
                  type="button"
                  onClick={handleToggleAsistencia}
                  disabled={toggleAsistencia.isPending}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: 14,
                    border: 'none',
                    background: esAsistiendo ? '#f1f5f9' : '#20bd88',
                    color: esAsistiendo ? '#0f172a' : '#ffffff',
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: toggleAsistencia.isPending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease',
                    boxShadow: esAsistiendo ? 'none' : '0 6px 18px rgba(32, 189, 136, 0.35)',
                  }}
                >
                  {toggleAsistencia.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : esAsistiendo ? (
                    <>
                      <Check size={18} color="#20bd88" strokeWidth={3} />
                      Asistiendo (Cancelar)
                    </>
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={2.6} />
                      Asistir al evento (Gratis)
                    </>
                  )}
                </button>

                {/* Google Calendar Link */}
                <a
                  href={generarGoogleCalendarUrl(evento)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f8fafc')}
                >
                  <CalendarIcon size={15} color="#20bd88" />
                  Agregar a Google Calendar
                </a>

                {/* Total attendees count */}
                <div style={{ textAlign: 'center', fontSize: 12.5, color: '#64748b' }}>
                  {totalAsistentes > 0 ? (
                    <>
                      👥 <strong>{totalAsistentes}</strong>{' '}
                      {totalAsistentes === 1 ? 'persona asistirá' : 'personas asistirán'}
                    </>
                  ) : (
                    'Sé el primero de la comunidad en unirte.'
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              BODY SECTION (2 Columns: Details + Interactive Map & Social)
             ══════════════════════════════════════════════════════════════════ */}
          <main
            style={{
              flex: 1,
              width: '100%',
              background: 'var(--bg-warm, #fcfaf6)',
              padding: '40px 24px 100px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                maxWidth: 1280,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 380px',
                gap: 36,
              }}
            >
              {/* ── Left Column: Description, Schedule, Accessibility ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* 1. Descripción */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: 20,
                    padding: '28px 32px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-display, inherit)',
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'var(--fg1, #0f172a)',
                      margin: '0 0 16px',
                    }}
                  >
                    Descripción del evento
                  </h2>
                  <div
                    style={{
                      fontSize: 15.5,
                      lineHeight: 1.7,
                      color: 'var(--fg2, #334155)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {evento.descripcion ||
                      'Te invitamos a ser parte de esta actividad diseñada para fortalecer la convivencia, el desarrollo y la inclusión comunitaria en Raíces. Todos los miembros de nuestra comunidad son bienvenidos.'}
                  </div>
                </div>

                {/* 2. Horario y Fechas */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: 20,
                    padding: '28px 32px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: '#e8f8f2',
                        color: '#20bd88',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Clock size={20} />
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display, inherit)',
                        fontSize: 20,
                        fontWeight: 800,
                        color: 'var(--fg1, #0f172a)',
                        margin: 0,
                      }}
                    >
                      Horario y Fechas
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Inicio del evento:</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                        {formatearFechaLarga(evento.fechaInicio)}
                      </div>
                    </div>
                    {evento.fechaFin && (
                      <div>
                        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Finalización:</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                          {formatearFechaLarga(evento.fechaFin)}
                        </div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Modalidad:</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#20bd88', marginTop: 4, textTransform: 'capitalize' }}>
                        {evento.modalidad ?? 'Presencial'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Accesibilidad e Inclusión */}
                {evento.etiquetasAccesibilidad && evento.etiquetasAccesibilidad.length > 0 && (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-color, #e2e8f0)',
                      borderRadius: 20,
                      padding: '28px 32px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: '#e8f8f2',
                          color: '#20bd88',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ShieldCheck size={20} />
                      </div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display, inherit)',
                          fontSize: 20,
                          fontWeight: 800,
                          color: 'var(--fg1, #0f172a)',
                          margin: 0,
                        }}
                      >
                        Accesibilidad e Inclusión
                      </h3>
                    </div>

                    <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px' }}>
                      Este evento cuenta con adaptaciones y facilidades para personas con discapacidad:
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {evento.etiquetasAccesibilidad.map(tag => (
                        <span
                          key={tag}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 16px',
                            borderRadius: 24,
                            background: '#e8f8f2',
                            color: '#064e3b',
                            fontSize: 13.5,
                            fontWeight: 700,
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          <Check size={14} color="#20bd88" strokeWidth={3} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right Column: Real Google Maps, Tags, Sharing ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* 1. REAL GOOGLE MAPS CARD */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: 20,
                    padding: 24,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-display, inherit)',
                      fontSize: 18,
                      fontWeight: 800,
                      color: 'var(--fg1, #0f172a)',
                      margin: '0 0 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <MapPin size={18} color="#20bd88" />
                    Ubicación del evento
                  </h3>

                  {evento.modalidad === 'virtual' ? (
                    <div
                      style={{
                        padding: 20,
                        borderRadius: 14,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                        Evento Virtual / En Línea
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                        Acceso directo para toda la comunidad vía enlace seguro.
                      </div>
                      {evento.ubicacion?.startsWith('http') ? (
                        <a
                          href={evento.ubicacion}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '10px 18px',
                            borderRadius: 10,
                            background: '#20bd88',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 13.5,
                            textDecoration: 'none',
                          }}
                        >
                          Unirse a la reunión <ExternalLink size={14} />
                        </a>
                      ) : (
                        <div style={{ fontSize: 12.5, color: '#64748b' }}>
                          El enlace se enviará al confirmar tu asistencia.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {queryDireccionCompleta ? (
                        <>
                          {/* Real Google Maps Embed Iframe */}
                          <div
                            style={{
                              width: '100%',
                              height: 240,
                              borderRadius: 14,
                              overflow: 'hidden',
                              background: '#e2e8f0',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            }}
                          >
                            <iframe
                              title="Mapa real del evento"
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(queryDireccionCompleta)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            />
                          </div>

                          {/* Venue details below map */}
                          <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                              {evento.ubicacion || evento.ciudad || 'Ubicación'}
                            </div>
                            {evento.ciudad && (
                              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                                {evento.ciudad}
                              </div>
                            )}

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryDireccionCompleta)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                marginTop: 12,
                                padding: '9px 16px',
                                borderRadius: 10,
                                background: '#e8f8f2',
                                color: '#0f766e',
                                fontSize: 13,
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              📍 Cómo llegar / Ver en Google Maps <ExternalLink size={13} />
                            </a>
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            padding: '24px 16px',
                            borderRadius: 14,
                            background: '#f8fafc',
                            border: '1.5px dashed #cbd5e1',
                            textAlign: 'center',
                          }}
                        >
                          <MapPin size={28} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                            Ubicación por confirmar
                          </div>
                          <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                            El organizador especificará la dirección física pronto.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Etiquetas */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: 20,
                    padding: 24,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-display, inherit)',
                      fontSize: 18,
                      fontWeight: 800,
                      color: 'var(--fg1, #0f172a)',
                      margin: '0 0 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Tag size={16} color="#20bd88" /> Etiquetas
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                      }}
                    >
                      #{categoriaLabel.replace(/\s+/g, '')}
                    </span>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                      }}
                    >
                      #{evento.modalidad ?? 'Presencial'}
                    </span>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                      }}
                    >
                      #Raíces
                    </span>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                      }}
                    >
                      #ComunidadInclusiva
                    </span>
                    {evento.ciudad && (
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: 10,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                        }}
                      >
                        #{evento.ciudad}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Compartir con amigos */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: 20,
                    padding: 24,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-display, inherit)',
                      fontSize: 18,
                      fontWeight: 800,
                      color: 'var(--fg1, #0f172a)',
                      margin: '0 0 14px',
                    }}
                  >
                    Compartir con amigos
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      title="Compartir por WhatsApp"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 3px 8px rgba(37, 211, 102, 0.35)',
                        transition: 'transform 0.15s ease',
                        fontSize: 16,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      💬
                    </button>

                    {/* Facebook */}
                    <button
                      type="button"
                      onClick={handleShareFacebook}
                      title="Compartir en Facebook"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#1877F2',
                        color: '#ffffff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 3px 8px rgba(24, 119, 242, 0.35)',
                        transition: 'transform 0.15s ease',
                        fontSize: 16,
                        fontWeight: 800,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      f
                    </button>

                    {/* Twitter / X */}
                    <button
                      type="button"
                      onClick={handleShareTwitter}
                      title="Compartir en X (Twitter)"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 3px 8px rgba(15, 23, 42, 0.35)',
                        transition: 'transform 0.15s ease',
                        fontWeight: 900,
                        fontSize: 16,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      𝕏
                    </button>

                    {/* Copiar enlace */}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      title="Copiar enlace"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: copiado ? '#20bd88' : '#f1f5f9',
                        color: copiado ? '#ffffff' : '#0f172a',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {copiado ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      ) : null}

      {/* ── Modal de Confirmación de Eliminación Moderno ── */}
      {confirmarEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80000,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setConfirmarEliminar(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: '28px 24px',
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              ¿Eliminar este evento?
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>
              Se removerá permanentemente el evento <strong>"{evento?.titulo || 'Evento'}"</strong> de la plataforma.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setConfirmarEliminar(false)}
                disabled={eliminarEventoMutation.isPending}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarEliminacion}
                disabled={eliminarEventoMutation.isPending}
                style={{
                  padding: '10px 22px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                }}
              >
                {eliminarEventoMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Confirmar eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(modalContent, document.body)
}
