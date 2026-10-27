import { useState, useMemo } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Plus,
  Heart,
  ArrowUpRight,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import {
  useEventos,
  useToggleAsistenciaEvento,
  useEliminarEvento,
  getEventosEliminadosIds,
  marcarEventoComoEliminado,
} from '../hooks/useEventos'
import { CustomSelect } from '@shared/components/CustomSelect'
import { CrearEventoModal } from './CrearEventoModal'
import { EventoDetalleModal } from './EventoDetalleModal'
import { useAuthStore } from '../../auth/store/authStore'
import { useUiStore } from '../../../shared/stores/uiStore'
import type { EventoItem, ModalidadEvento } from '@/types/social'

const CATEGORIAS_OPTIONS = [
  { value: 'todas', label: 'Todos los temas (Topics)' },
  { value: 'taller', label: 'Taller / Capacitación' },
  { value: 'cultural', label: 'Arte y Cultura' },
  { value: 'deporte', label: 'Deporte y Bienestar' },
  { value: 'encuentro', label: 'Encuentro y Convivencia' },
  { value: 'voluntariado', label: 'Voluntariado' },
  { value: 'otro', label: 'Comunidad' },
]

const MODALIDADES_OPTIONS = [
  { value: '', label: 'Cualquier modalidad (Event Type)' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Online / Virtual' },
  { value: 'hibrido', label: 'Híbrido' },
]

// Paletas vibrantes encabezadas por el verde #20bd88 del usuario
const CARD_PALETTES = [
  {
    dateBg: '#e8f8f2',
    dateBorder: '#c7edd9',
    accent: '#20bd88',
    tagBg: '#e8f8f2',
    tagText: '#15805d',
  },
  {
    dateBg: '#f5f3ff',
    dateBorder: '#ede9fe',
    accent: '#8b5cf6',
    tagBg: '#ede9fe',
    tagText: '#7c3aed',
  },
  {
    dateBg: '#fff7ed',
    dateBorder: '#ffedd5',
    accent: '#f97316',
    tagBg: '#ffedd5',
    tagText: '#ea580c',
  },
  {
    dateBg: '#eff6ff',
    dateBorder: '#dbeafe',
    accent: '#3b82f6',
    tagBg: '#dbeafe',
    tagText: '#2563eb',
  },
  {
    dateBg: '#f0fdfa',
    dateBorder: '#ccfbf1',
    accent: '#0d9488',
    tagBg: '#ccfbf1',
    tagText: '#0f766e',
  },
  {
    dateBg: '#fdf2f8',
    dateBorder: '#fce7f3',
    accent: '#ec4899',
    tagBg: '#fce7f3',
    tagText: '#db2777',
  },
]

function obtenerDatosFecha(fechaInicioStr?: string, fechaFinStr?: string) {
  if (!fechaInicioStr) return { mes: 'EVENTO', dia: '--', rango: '' }
  try {
    const inicio = new Date(fechaInicioStr)
    if (isNaN(inicio.getTime())) return { mes: 'EVENTO', dia: '--', rango: fechaInicioStr }

    const mes = inicio
      .toLocaleDateString('es-MX', { month: 'short' })
      .replace('.', '')
      .toUpperCase()
    const dia = inicio.getDate().toString()

    let rango = `${mes.slice(0, 3)} ${dia}`
    if (fechaFinStr) {
      const fin = new Date(fechaFinStr)
      if (!isNaN(fin.getTime())) {
        const diaFin = fin.getDate()
        if (inicio.getMonth() === fin.getMonth() && inicio.getFullYear() === fin.getFullYear()) {
          rango = `${mes.slice(0, 3)} ${dia} – ${diaFin}, ${inicio.getFullYear()}`
        } else {
          const mesFin = fin.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '')
          rango = `${mes.slice(0, 3)} ${dia} – ${mesFin.slice(0, 3)} ${diaFin}`
        }
      } else {
        rango += `, ${inicio.getFullYear()}`
      }
    } else {
      rango += `, ${inicio.getFullYear()}`
    }

    return { mes, dia, rango }
  } catch {
    return { mes: 'EVENTO', dia: '--', rango: fechaInicioStr }
  }
}

export function EventsDiscovery() {
  const { user } = useAuthStore()
  const { addToast } = useUiStore()
  const toggleAsistenciaMutation = useToggleAsistenciaEvento()
  const eliminarEventoMutation = useEliminarEvento()

  // Filtros
  const [categoria, setCategoria] = useState<string>('todas')
  const [modalidad, setModalidad] = useState<ModalidadEvento | ''>('')
  const [busquedaUbicacion, setBusquedaUbicacion] = useState<string>('')
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('')
  const [online, setOnline] = useState<boolean>(false)
  const [proximosOnly, setProximosOnly] = useState<boolean>(true)
  const [pagina, setPagina] = useState<number>(1)

  // Modales
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false)
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<string | null>(null)
  const [eventoSeleccionadoInicial, setEventoSeleccionadoInicial] = useState<EventoItem | null>(null)
  const [eventoAEliminar, setEventoAEliminar] = useState<EventoItem | null>(null)

  const puedeCrearEvento = Boolean(
    user &&
      (user.role === 'institucion' ||
        user.role === 'institution' ||
        user.role === 'empresa' ||
        user.role === 'admin' ||
        user.rol === 'institucion' ||
        user.rol === 'empresa' ||
        user.rol === 'admin'),
  )

  const effectiveModalidad: ModalidadEvento | undefined = online
    ? 'virtual'
    : modalidad || undefined

  const filtrosQuery = useMemo(
    () => ({
      pagina,
      limite: 12,
      categoria: categoria !== 'todas' ? categoria : undefined,
      modalidad: effectiveModalidad,
      buscar: terminoBusqueda || undefined,
      proximos: proximosOnly,
    }),
    [pagina, categoria, effectiveModalidad, terminoBusqueda, proximosOnly],
  )

  const { data, isLoading, isError, refetch } = useEventos(filtrosQuery)

  const eliminadosIds = getEventosEliminadosIds()
  const eventos = useMemo(
    () => (data?.datos ?? []).filter(e => !eliminadosIds.has(e.id) && !eliminadosIds.has(String(e.id))),
    [data?.datos, eliminadosIds],
  )

  const meta = data?.meta ?? {
    total: eventos.length,
    pagina: 1,
    limite: 12,
    totalPaginas: 1,
    tieneMas: false,
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPagina(1)
    setTerminoBusqueda(busquedaUbicacion.trim())
  }

  const handleToggleHeart = (e: React.MouseEvent, evento: EventoItem) => {
    e.stopPropagation()
    if (!user) {
      addToast('Inicia sesión para guardar este evento o confirmar asistencia', 'info')
      return
    }
    toggleAsistenciaMutation.mutate(evento.id, {
      onSuccess: res => {
        if (res.asistiendo) {
          addToast(`¡Asistencia guardada para "${evento.titulo}"!`, 'success')
        } else {
          addToast(`Has cancelado tu asistencia a "${evento.titulo}".`, 'info')
        }
      },
      onError: () => {
        addToast('No se pudo actualizar el estado del evento', 'error')
      },
    })
  }

  const handleEliminarCard = (e: React.MouseEvent, evento: EventoItem) => {
    e.stopPropagation()
    setEventoAEliminar(evento)
  }

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', paddingBottom: 60 }} className="animate-fade-in-up">
      {/* ── Top Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: 'var(--fg1, #0f172a)',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-display, inherit)',
            }}
          >
            Events
          </h1>
          <p
            style={{
              fontSize: 15,
              color: 'var(--fg2, #64748b)',
              margin: 0,
              fontWeight: 400,
            }}
          >
            Discover and join the best events and inclusive experiences.
          </p>
        </div>

        {puedeCrearEvento && (
          <button
            type="button"
            onClick={() => setIsCrearModalOpen(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              background: '#20bd88',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(32, 189, 136, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={18} /> Crear evento
          </button>
        )}
      </div>

      {/* ── Filter Bar (Layout exacto de la referencia con color #20bd88) ── */}
      <div
        style={{
          background: 'var(--bg-surface, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: 16,
          padding: '14px 20px',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Left side: Topics + Event Type + Search Location */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, flex: '1 1 500px' }}>
          {/* Topics Dropdown */}
          <div style={{ minWidth: 210, flex: '0 1 auto' }}>
            <CustomSelect
              options={CATEGORIAS_OPTIONS}
              value={categoria}
              onChange={val => {
                setCategoria(val as string)
                setPagina(1)
              }}
              minWidth={210}
              borderRadius={12}
              accentColor="#20bd88"
            />
          </div>

          {/* Event Type Dropdown */}
          <div style={{ minWidth: 230, flex: '0 1 auto' }}>
            <CustomSelect
              options={MODALIDADES_OPTIONS}
              value={online ? 'virtual' : modalidad}
              onChange={val => {
                setModalidad(val as ModalidadEvento | '')
                setPagina(1)
              }}
              disabled={online}
              minWidth={230}
              borderRadius={12}
              accentColor="#20bd88"
            />
          </div>

          {/* Search Location Input */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              position: 'relative',
              flex: '1 1 200px',
              minWidth: 180,
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--fg3, #94a3b8)',
              }}
            />
            <input
              type="text"
              value={busquedaUbicacion}
              onChange={e => setBusquedaUbicacion(e.target.value)}
              placeholder="Buscar por ciudad o lugar..."
              style={{
                width: '100%',
                background: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 12,
                padding: '9px 12px 9px 34px',
                fontSize: 13,
                color: 'var(--fg1, #0f172a)',
                outline: 'none',
              }}
            />
            {busquedaUbicacion && (
              <button
                type="button"
                onClick={() => {
                  setBusquedaUbicacion('')
                  setTerminoBusqueda('')
                  setPagina(1)
                }}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--fg3, #94a3b8)',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>

        {/* Right side: Modern Toggle Switches con #20bd88 (sin checkbox nativo) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Próximos */}
          <div
            role="switch"
            aria-checked={proximosOnly}
            onClick={() => {
              setProximosOnly(!proximosOnly)
              setPagina(1)
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
          >
            <div
              style={{
                width: 38,
                height: 22,
                borderRadius: 11,
                background: proximosOnly ? '#20bd88' : '#cbd5e1',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: 2,
                  left: proximosOnly ? 18 : 2,
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }}
              />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2, #64748b)' }}>
              Próximos
            </span>
          </div>

          {/* Online Only */}
          <div
            role="switch"
            aria-checked={online}
            onClick={() => {
              setOnline(!online)
              setPagina(1)
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
          >
            <div
              style={{
                width: 38,
                height: 22,
                borderRadius: 11,
                background: online ? '#20bd88' : '#cbd5e1',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: 2,
                  left: online ? 18 : 2,
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }}
              />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2, #64748b)' }}>
              Online 
            </span>
          </div>
        </div>
      </div>

      {/* ── Events Grid (3 columns layout like user image) ── */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 140,
                background: 'var(--bg-surface, #fff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 16,
                display: 'flex',
                overflow: 'hidden',
                animation: 'pulse 1.5s infinite',
              }}
            >
              <div style={{ width: 104, background: 'var(--bg-warm, #f8fafc)' }} />
              <div style={{ flex: 1, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: '70%', height: 18, background: 'var(--bg-warm, #f8fafc)', borderRadius: 4 }} />
                <div style={{ width: '35%', height: 14, background: 'var(--bg-warm, #f8fafc)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          style={{
            background: 'var(--bg-surface, #fff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: 16,
            padding: '50px 20px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 15, color: 'var(--fg2, #64748b)', margin: '0 0 16px' }}>
            No se pudieron cargar los eventos.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              background: '#20bd88',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(32, 189, 136, 0.25)',
            }}
          >
            Reintentar
          </button>
        </div>
      ) : eventos.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface, #fff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: 16,
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#e8f8f2',
              color: '#20bd88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Calendar size={28} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1, #0f172a)', margin: '0 0 6px' }}>
            No events found
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg2, #64748b)', margin: 0 }}>
            Intenta cambiar los filtros de búsqueda o desactiva la opción de online/próximos.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          {eventos.map((evento, index) => {
            const palette = CARD_PALETTES[index % CARD_PALETTES.length]
            const { mes, dia, rango } = obtenerDatosFecha(evento.fechaInicio, evento.fechaFin)
            const esAsistiendo = Boolean(evento.asisto)
            const ubicacionLabel =
              evento.ciudad ||
              (evento.modalidad === 'virtual' ? 'Online / Virtual' : evento.ubicacion || 'Por definir')

            const tagLabel =
              CATEGORIAS_OPTIONS.find(c => c.value === evento.categoria)?.label.split('/')[0].trim() ||
              evento.categoria ||
              'Event'

            return (
              <div
                key={evento.id}
                onClick={() => {
                  setEventoSeleccionadoId(evento.id)
                  setEventoSeleccionadoInicial(evento)
                }}
                className="card-hover"
                style={{
                  background: 'var(--bg-surface, #ffffff)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: 18,
                  display: 'flex',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  minHeight: 146,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  position: 'relative',
                }}
              >
                {/* ── Left Date Column (Colored box matching reference) ── */}
                <div
                  style={{
                    width: 104,
                    minWidth: 104,
                    background: palette.dateBg,
                    borderRight: `1px solid ${palette.dateBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px 12px 14px',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        color: palette.accent,
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        marginBottom: 4,
                      }}
                    >
                      {mes}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 34,
                        fontWeight: 900,
                        color: palette.accent,
                        lineHeight: 1,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {dia}
                    </span>
                  </div>

                  <span
                    style={{
                      display: 'block',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--fg3, #64748b)',
                      lineHeight: 1.25,
                    }}
                  >
                    {rango}
                  </span>
                </div>

                {/* ── Right Content Column ── */}
                <div
                  style={{
                    flex: 1,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Top row: Title + Heart Button */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: 'var(--fg1, #0f172a)',
                        margin: 0,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontFamily: 'var(--font-display, inherit)',
                      }}
                    >
                      {evento.titulo}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {/* Delete button for event owner / admin */}
                      {user &&
                        Boolean(
                          (evento.creadorId &&
                            (evento.creadorId === user.id ||
                              evento.creadorId === (user as { _id?: string })._id)) ||
                            (evento.organizador?.id && evento.organizador.id === user.id) ||
                            user.role === 'admin' ||
                            user.rol === 'admin',
                        ) && (
                          <button
                            type="button"
                            aria-label="Eliminar mi evento"
                            title="Eliminar evento"
                            onClick={e => handleEliminarCard(e, evento)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ef4444',
                              transition: 'transform 0.15s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                      {/* Bookmark / Heart Button */}
                      <button
                        type="button"
                        aria-label={esAsistiendo ? 'Cancelar asistencia' : 'Asistir a este evento'}
                        onClick={e => handleToggleHeart(e, evento)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: esAsistiendo ? '#20bd88' : 'var(--fg3, #94a3b8)',
                          transition: 'transform 0.15s ease, color 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <Heart size={18} fill={esAsistiendo ? '#20bd88' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Middle row: Category Pill Badge */}
                  <div style={{ margin: '8px 0' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: palette.tagBg,
                        color: palette.tagText,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {tagLabel}
                    </span>
                  </div>

                  {/* Bottom row: Location Pin + Open Arrow in #20bd88 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: 'var(--fg2, #64748b)',
                      marginTop: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                      <MapPin size={13} style={{ flexShrink: 0, color: 'var(--fg3, #94a3b8)' }} />
                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 180,
                        }}
                      >
                        {ubicacionLabel}
                      </span>
                    </div>

                    {/* Arrow Icon in #20bd88 */}
                    <div
                      style={{
                        color: '#20bd88',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowUpRight size={17} strokeWidth={2.4} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination Controls ── */}
      {meta.totalPaginas > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginTop: 36,
          }}
        >
          <button
            type="button"
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina <= 1}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-surface, #ffffff)',
              color: 'var(--fg1, #0f172a)',
              fontSize: 13,
              fontWeight: 600,
              cursor: pagina <= 1 ? 'not-allowed' : 'pointer',
              opacity: pagina <= 1 ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2, #64748b)' }}>
            Página <strong style={{ color: 'var(--fg1, #0f172a)' }}>{pagina}</strong> de{' '}
            <strong style={{ color: 'var(--fg1, #0f172a)' }}>{meta.totalPaginas}</strong>
          </span>

          <button
            type="button"
            onClick={() => setPagina(p => Math.min(meta.totalPaginas, p + 1))}
            disabled={pagina >= meta.totalPaginas}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-surface, #ffffff)',
              color: 'var(--fg1, #0f172a)',
              fontSize: 13,
              fontWeight: 600,
              cursor: pagina >= meta.totalPaginas ? 'not-allowed' : 'pointer',
              opacity: pagina >= meta.totalPaginas ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Modal de Detalle de Evento ── */}
      <EventoDetalleModal
        eventoId={eventoSeleccionadoId}
        eventoInicial={eventoSeleccionadoInicial}
        onClose={() => {
          setEventoSeleccionadoId(null)
          setEventoSeleccionadoInicial(null)
        }}
      />

      {/* ── Modal de Crear Evento ── */}
      <CrearEventoModal
        isOpen={isCrearModalOpen}
        onClose={() => setIsCrearModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* ── Modal de Confirmación de Eliminación ── */}
      {eventoAEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70000,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setEventoAEliminar(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '28px 24px',
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
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
              Se removerá el evento <strong>"{eventoAEliminar.titulo}"</strong> de la plataforma.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setEventoAEliminar(null)}
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
                onClick={() => {
                  const id = eventoAEliminar.id
                  marcarEventoComoEliminado(id)
                  setEventoAEliminar(null)
                  addToast('Evento eliminado exitosamente', 'success')
                  eliminarEventoMutation.mutate(id)
                }}
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
}
