import { useState, useMemo } from 'react'
import {
  usePublicacionesRechazadas,
  useModerarPublicacion,
  usePalabrasProhibidas,
  useCrearPalabraProhibida,
  useEliminarPalabraProhibida,
} from '../hooks/useAdmin'
import { Card, Skeleton } from './AdminUI'
import { Icons, EmptyState } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import type { PublicacionRechazadaAdmin, PalabraProhibidaAdmin } from '@/types/admin'

const CATEGORY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  spam: {
    label: 'Spam / Irrelevante',
    color: '#D4944C',
    bg: 'color-mix(in srgb, #D4944C 14%, transparent)',
  },
  lenguaje_inapropiado: {
    label: 'Lenguaje Inapropiado',
    color: 'var(--color-coral, #FF4D68)',
    bg: 'color-mix(in srgb, var(--color-coral, #FF4D68) 14%, transparent)',
  },
  desinformacion: {
    label: 'Desinformación Médica',
    color: '#E06D53',
    bg: 'color-mix(in srgb, #E06D53 14%, transparent)',
  },
  datos_sensibles: {
    label: 'Datos Sensibles',
    color: '#8A5BD6',
    bg: 'color-mix(in srgb, #8A5BD6 14%, transparent)',
  },
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function ModeracionTab() {
  const [seccion, setSeccion] = useState<'cola' | 'palabras'>('cola')
  const [pagina, setPagina] = useState(1)
  const { data, isLoading, isError, refetch } = usePublicacionesRechazadas({ pagina, limite: 15 })
  const moderar = useModerarPublicacion()
  const { addToast } = useUiStore()

  // ── Palabras Prohibidas ──
  const {
    data: palabras = [],
    isLoading: isLoadingPalabras,
    isError: isErrorPalabras,
    refetch: refetchPalabras,
  } = usePalabrasProhibidas()
  const crearPalabra = useCrearPalabraProhibida()
  const eliminarPalabra = useEliminarPalabraProhibida()

  const [modalAgregarPalabra, setModalAgregarPalabra] = useState(false)
  const [nuevaPalabra, setNuevaPalabra] = useState('')
  const [nuevaCategoria, setNuevaCategoria] = useState('insulto_local')
  const [errorAgregar, setErrorAgregar] = useState<string | null>(null)
  const [palabraAEliminar, setPalabraAEliminar] = useState<PalabraProhibidaAdmin | null>(null)
  const [busquedaPalabra, setBusquedaPalabra] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

  // Modal para resolución con nota opcional (Cola de publicaciones)
  const [activeItem, setActiveItem] = useState<{
    post: PublicacionRechazadaAdmin
    decision: 'aprobar' | 'rechazar'
  } | null>(null)
  const [nota, setNota] = useState('')

  const items = data?.datos ?? []
  const total = data?.total ?? 0
  const totalPaginas = data?.totalPaginas ?? 1

  // Filtro de palabras prohibidas
  const palabrasFiltradas = useMemo(() => {
    return palabras.filter((p) => {
      const q = busquedaPalabra.trim().toLowerCase()
      const coincideTexto =
        !q ||
        p.palabra.toLowerCase().includes(q) ||
        p.palabraNormalizada.toLowerCase().includes(q)
      const coincideCat =
        filtroCategoria === 'todas' ||
        p.categoria.toLowerCase() === filtroCategoria.toLowerCase()
      return coincideTexto && coincideCat
    })
  }, [palabras, busquedaPalabra, filtroCategoria])

  const categoriasDisponibles = useMemo(() => {
    const set = new Set<string>()
    palabras.forEach((p) => {
      if (p.categoria) set.add(p.categoria)
    })
    return Array.from(set)
  }, [palabras])

  const handleOpenAction = (post: PublicacionRechazadaAdmin, decision: 'aprobar' | 'rechazar') => {
    setActiveItem({ post, decision })
    setNota(decision === 'aprobar' ? 'El contenido es pertinente para la comunidad.' : '')
  }

  const handleConfirmAction = async () => {
    if (!activeItem) return
    const { post, decision } = activeItem
    try {
      await moderar.mutateAsync({
        id: post.id,
        payload: {
          decision,
          nota: nota.trim() || undefined,
        },
      })
      addToast(
        decision === 'aprobar'
          ? 'Publicación aprobada y visible en el feed'
          : 'Rechazo de publicación confirmado',
        'success',
      )
      setActiveItem(null)
      setNota('')
    } catch {
      addToast('Error al resolver la moderación de la publicación', 'error')
    }
  }

  const handleCrearPalabra = async (e: React.FormEvent) => {
    e.preventDefault()
    const p = nuevaPalabra.trim()
    if (!p) {
      setErrorAgregar('La palabra o frase no puede estar vacía.')
      return
    }
    if (p.length > 50) {
      setErrorAgregar('La palabra no puede exceder los 50 caracteres.')
      return
    }

    try {
      setErrorAgregar(null)
      await crearPalabra.mutateAsync({
        palabra: p,
        categoria: nuevaCategoria.trim() || 'insulto_local',
      })
      addToast(`Palabra "${p}" agregada al diccionario de moderación`, 'success')
      setNuevaPalabra('')
      setNuevaCategoria('insulto_local')
      setModalAgregarPalabra(false)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'No se pudo registrar la palabra. Verifica que no esté duplicada.'
      setErrorAgregar(msg)
    }
  }

  const handleConfirmarEliminarPalabra = async () => {
    if (!palabraAEliminar) return
    try {
      await eliminarPalabra.mutateAsync(palabraAEliminar.id)
      addToast(`Palabra "${palabraAEliminar.palabra}" eliminada`, 'success')
      setPalabraAEliminar(null)
    } catch {
      addToast('Error al eliminar la palabra prohibida', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Selector de sub-sección con estilo Raíces */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setSeccion('cola')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: seccion === 'cola' ? 'var(--primary)' : 'var(--bg-surface)',
            color: seccion === 'cola' ? '#ffffff' : 'var(--fg2)',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {Icons.shieldAlert({ s: 16 })}
          Cola de Revisión
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11.5,
              fontWeight: 800,
              background: seccion === 'cola' ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-cool)',
              color: seccion === 'cola' ? '#ffffff' : 'var(--fg3)',
            }}
          >
            {total}
          </span>
        </button>

        <button
          onClick={() => setSeccion('palabras')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: seccion === 'palabras' ? 'var(--primary)' : 'var(--bg-surface)',
            color: seccion === 'palabras' ? '#ffffff' : 'var(--fg2)',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {Icons.book({ s: 16 })}
          Palabras Prohibidas
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11.5,
              fontWeight: 800,
              background: seccion === 'palabras' ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-cool)',
              color: seccion === 'palabras' ? '#ffffff' : 'var(--fg3)',
            }}
          >
            {palabras.length}
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          VISTA 1: COLA DE REVISIÓN
          ═══════════════════════════════════════════════════════════════════ */}
      {seccion === 'cola' && (
        <>
          {/* Header informativo */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                Cola de Revisión de Publicaciones
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--fg3)', margin: '4px 0 0' }}>
                Publicaciones retenidas por revisión automática (IA Gemini o reglas). Puedes aprobarlas para restaurar su visibilidad o confirmar su rechazo.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  background:
                    total > 0
                      ? 'color-mix(in srgb, var(--color-coral, #FF4D68) 12%, transparent)'
                      : 'var(--bg-cool)',
                  color: total > 0 ? 'var(--color-coral, #FF4D68)' : 'var(--fg3)',
                  border: '1px solid currentColor',
                }}
              >
                {total} {total === 1 ? 'pendiente' : 'pendientes'}
              </span>
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--fg2)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {Icons.refresh({ s: 15 })} Actualizar
              </button>
            </div>
          </div>

          {/* Lista de publicaciones retenidas */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <Card key={i} style={{ padding: 24 }}>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                    <Skeleton w={44} h={44} r="50%" />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Skeleton w="40%" h={18} />
                      <Skeleton w="25%" h={14} />
                    </div>
                  </div>
                  <Skeleton w="100%" h={40} style={{ marginBottom: 12 }} />
                  <Skeleton w="80%" h={32} />
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card style={{ padding: 36, textAlign: 'center' }}>
              <div
                style={{
                  color: 'var(--color-error)',
                  marginBottom: 12,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {Icons.shieldAlert({ s: 36 })}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--fg1)' }}>
                Error al consultar la cola de moderación
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--fg3)', margin: '8px 0 16px' }}>
                Verifica la conexión con el servidor o permisos administrativos.
              </p>
              <button
                onClick={() => refetch()}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Reintentar
              </button>
            </Card>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Icons.check({ s: 36 })}
              title="¡Cola al día!"
              description="No hay publicaciones pendientes de revisión en este momento. Todas las publicaciones activas cumplen con las directrices comunitarias."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {items.map((post) => {
                const cat = CATEGORY_STYLES[post.moderacion?.categoria?.toLowerCase() || ''] ?? {
                  label: post.moderacion?.categoria || 'Revisión General',
                  color: 'var(--color-coral, #FF4D68)',
                  bg: 'color-mix(in srgb, var(--color-coral, #FF4D68) 12%, transparent)',
                }
                const fuenteStr =
                  post.moderacion?.fuente === 'gemini'
                    ? '🤖 Gemini IA'
                    : post.moderacion?.fuente === 'admin'
                    ? '👤 Moderador'
                    : '🛡️ Reglas de Seguridad'

                return (
                  <Card
                    key={post.id}
                    style={{
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                      borderLeft: `4px solid ${cat.color}`,
                    }}
                  >
                    {/* Cabecera del autor */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: 'var(--primary-subtle, #e0f2fe)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 16,
                          }}
                        >
                          {(post.nombreAutor || 'U').slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>
                              {post.nombreAutor || 'Usuario anónimo'}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'var(--bg-cool)',
                                color: 'var(--fg3)',
                                textTransform: 'uppercase',
                              }}
                            >
                              {post.rolAutor || 'pcd'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--fg3)', marginTop: 2 }}>
                            {post.emailAutor} · {formatDate(post.fechaCreacion)}
                          </div>
                        </div>
                      </div>

                      {/* Etiquetas de moderación */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: cat.color,
                            background: cat.bg,
                            padding: '4px 10px',
                            borderRadius: 8,
                          }}
                        >
                          {cat.label}
                        </span>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: 'var(--fg2)',
                            background: 'var(--bg-cool)',
                            padding: '4px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {fuenteStr}
                        </span>
                      </div>
                    </div>

                    {/* Contenido de la publicación retenida */}
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: 'var(--bg-cool)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: 'var(--fg3)',
                          textTransform: 'uppercase',
                          marginBottom: 6,
                        }}
                      >
                        Contenido original:
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14.5,
                          color: 'var(--fg1)',
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {post.contenido}
                      </p>
                      {post.mediaUrl && (
                        <div style={{ marginTop: 12 }}>
                          <img
                            src={post.mediaUrl}
                            alt="Adjunto de publicación"
                            style={{ maxHeight: 220, borderRadius: 8, objectFit: 'cover' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Dictamen de moderación */}
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: 'color-mix(in srgb, var(--color-coral, #FF4D68) 6%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--color-coral, #FF4D68) 20%, transparent)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: 'var(--color-coral, #FF4D68)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Motivo del rechazo automático:
                        </span>
                        <div style={{ fontSize: 13.5, color: 'var(--fg1)', marginTop: 2, fontWeight: 500 }}>
                          {post.moderacion?.razon || 'Contenido detectado como no apto para la comunidad.'}
                        </div>
                      </div>

                      {post.moderacion?.sugerenciaMejora && (
                        <div
                          style={{
                            borderTop:
                              '1px solid color-mix(in srgb, var(--color-coral, #FF4D68) 15%, transparent)',
                            paddingTop: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: 'var(--color-matcha, #7C8B46)',
                              textTransform: 'uppercase',
                            }}
                          >
                            💡 Sugerencia en Lectura Fácil enviada al autor:
                          </span>
                          <div style={{ fontSize: 13.5, color: 'var(--fg1)', marginTop: 2 }}>
                            {post.moderacion.sugerenciaMejora}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción del admin */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 12,
                        paddingTop: 8,
                      }}
                    >
                      <button
                        onClick={() => handleOpenAction(post, 'rechazar')}
                        disabled={moderar.isPending}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-surface)',
                          color: 'var(--color-coral, #FF4D68)',
                          fontSize: 13.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {Icons.x({ s: 16 })} Confirmar Rechazo
                      </button>

                      <button
                        onClick={() => handleOpenAction(post, 'aprobar')}
                        disabled={moderar.isPending}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 10,
                          border: 'none',
                          background: 'var(--color-matcha, #A8B86B)',
                          color: '#ffffff',
                          fontSize: 13.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(168, 184, 107, 0.4)',
                        }}
                      >
                        {Icons.check({ s: 16 })} Aprobar y Publicar
                      </button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                marginTop: 12,
              }}
            >
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina <= 1 || isLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--fg2)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: pagina <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pagina <= 1 ? 0.5 : 1,
                }}
              >
                Anterior
              </button>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg2)' }}>
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina >= totalPaginas || isLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--fg2)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: pagina >= totalPaginas ? 'not-allowed' : 'pointer',
                  opacity: pagina >= totalPaginas ? 0.5 : 1,
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          VISTA 2: DICCIONARIO DE PALABRAS PROHIBIDAS
          ═══════════════════════════════════════════════════════════════════ */}
      {seccion === 'palabras' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header informativo */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                Diccionario de Palabras Prohibidas
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--fg3)', margin: '4px 0 0' }}>
                Términos e insultos locales restringidos automáticamente en el feed comunitario. Gemini y el motor de respaldo analizan cada publicación contra este diccionario en tiempo real.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => {
                  setErrorAgregar(null)
                  setNuevaPalabra('')
                  setNuevaCategoria('insulto_local')
                  setModalAgregarPalabra(true)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                {Icons.plus({ s: 16 })} Agregar palabra
              </button>
              <button
                onClick={() => refetchPalabras()}
                disabled={isLoadingPalabras}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--fg2)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {Icons.refresh({ s: 15 })} Actualizar
              </button>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
              background: 'var(--bg-surface)',
              padding: 14,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <span
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--fg3)',
                }}
              >
                {Icons.search({ s: 16 })}
              </span>
              <input
                type="text"
                value={busquedaPalabra}
                onChange={(e) => setBusquedaPalabra(e.target.value)}
                placeholder="Buscar palabra o término normalizado..."
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 12px 0 36px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontSize: 13.5,
                  color: 'var(--fg1)',
                  background: 'var(--bg-cool)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Categorías filtro */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', marginRight: 4 }}>
                Categoría:
              </span>
              {['todas', ...categoriasDisponibles].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    background:
                      filtroCategoria === cat
                        ? 'var(--primary)'
                        : 'var(--bg-cool)',
                    color: filtroCategoria === cat ? '#ffffff' : 'var(--fg2)',
                    textTransform: 'capitalize',
                  }}
                >
                  {cat === 'todas' ? 'Todas' : cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido de palabras */}
          {isLoadingPalabras ? (
            <Card style={{ padding: 24 }}>
              <Skeleton h={48} style={{ marginBottom: 12 }} />
              <Skeleton h={48} style={{ marginBottom: 12 }} />
              <Skeleton h={48} />
            </Card>
          ) : isErrorPalabras ? (
            <Card style={{ padding: 36, textAlign: 'center' }}>
              <div
                style={{
                  color: 'var(--color-error)',
                  marginBottom: 12,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {Icons.shieldAlert({ s: 36 })}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--fg1)' }}>
                Error al cargar el diccionario de palabras prohibidas
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--fg3)', margin: '8px 0 16px' }}>
                No se pudo obtener la lista de términos desde el servidor.
              </p>
              <button
                onClick={() => refetchPalabras()}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Reintentar
              </button>
            </Card>
          ) : palabrasFiltradas.length === 0 ? (
            <EmptyState
              icon={Icons.book({ s: 36 })}
              title={
                busquedaPalabra || filtroCategoria !== 'todas'
                  ? 'Sin coincidencias'
                  : 'No hay palabras prohibidas'
              }
              description={
                busquedaPalabra || filtroCategoria !== 'todas'
                  ? 'No se encontraron términos que coincidan con los filtros aplicados.'
                  : 'Aún no se han configurado palabras prohibidas en el diccionario. Haz clic en "Agregar palabra" para registrar términos locales.'
              }
            />
          ) : (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 18px',
                  background: 'var(--bg-cool)',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--fg3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <div style={{ flex: 1.5, minWidth: 160 }}>Palabra / Término</div>
                <div style={{ flex: 1.2, minWidth: 130 }}>Forma Normalizada</div>
                <div style={{ flex: 1, minWidth: 110 }}>Categoría</div>
                <div style={{ flex: 1.2, minWidth: 140 }}>Registrada</div>
                <div style={{ width: 80, textAlign: 'right' }}>Acciones</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {palabrasFiltradas.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--bg-warm, #f8fafc)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    {/* Palabra */}
                    <div style={{ flex: 1.5, minWidth: 160, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: 'var(--fg1)',
                        }}
                      >
                        {item.palabra}
                      </span>
                    </div>

                    {/* Normalizada */}
                    <div style={{ flex: 1.2, minWidth: 130 }}>
                      <code
                        style={{
                          fontSize: 12,
                          fontFamily: 'monospace',
                          background: 'var(--bg-cool)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          color: 'var(--fg2)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {item.palabraNormalizada}
                      </code>
                    </div>

                    {/* Categoría */}
                    <div style={{ flex: 1, minWidth: 110 }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 12,
                          background: 'color-mix(in srgb, var(--color-coral, #FF4D68) 12%, transparent)',
                          color: 'var(--color-coral, #FF4D68)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.categoria.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Fecha */}
                    <div style={{ flex: 1.2, minWidth: 140, fontSize: 12.5, color: 'var(--fg3)' }}>
                      {formatDate(item.fechaCreacion)}
                    </div>

                    {/* Acciones */}
                    <div style={{ width: 80, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setPalabraAEliminar(item)}
                        title="Eliminar palabra prohibida"
                        aria-label={`Eliminar ${item.palabra}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-surface)',
                          color: 'var(--color-coral, #FF4D68)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            'color-mix(in srgb, var(--color-coral, #FF4D68) 12%, transparent)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-surface)'
                        }}
                      >
                        {Icons.trash({ s: 15 })}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: AGREGAR PALABRA PROHIBIDA
          ═══════════════════════════════════════════════════════════════════ */}
      {modalAgregarPalabra && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--modal-backdrop, rgba(0,0,0,0.5))',
            backdropFilter: 'blur(4px)',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'var(--bg-surface)',
              borderRadius: 16,
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--fg1)' }}>
                Agregar Palabra Prohibida
              </h3>
              <button
                onClick={() => setModalAgregarPalabra(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--fg3)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                }}
              >
                {Icons.x({ s: 20 })}
              </button>
            </div>

            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg3)', lineHeight: 1.5 }}>
              Registra un término o insulto local. La moderación automática de Gemini y las reglas de seguridad lo detectarán en cualquier combinación de mayúsculas, minúsculas o con acentos.
            </p>

            <form onSubmit={handleCrearPalabra} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: 'var(--fg2)',
                    marginBottom: 6,
                  }}
                >
                  Palabra o frase (requerida, máx. 50 caracteres):
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={nuevaPalabra}
                  onChange={(e) => {
                    setNuevaPalabra(e.target.value)
                    if (errorAgregar) setErrorAgregar(null)
                  }}
                  placeholder="ej. chairo, discriminador..."
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-cool)',
                    color: 'var(--fg1)',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: 'var(--fg2)',
                    marginBottom: 6,
                  }}
                >
                  Categoría o motivo:
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="ej. insulto_local, discriminacion..."
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-cool)',
                    color: 'var(--fg1)',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--fg3)', marginTop: 4, display: 'block' }}>
                  Por defecto: <code>insulto_local</code>
                </span>
              </div>

              {errorAgregar && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'color-mix(in srgb, var(--color-coral, #FF4D68) 12%, transparent)',
                    border: '1px solid var(--color-coral, #FF4D68)',
                    color: 'var(--color-coral, #FF4D68)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {errorAgregar}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setModalAgregarPalabra(false)}
                  disabled={crearPalabra.isPending}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--fg2)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={crearPalabra.isPending || !nuevaPalabra.trim()}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor:
                      crearPalabra.isPending || !nuevaPalabra.trim()
                        ? 'not-allowed'
                        : 'pointer',
                    opacity: !nuevaPalabra.trim() ? 0.6 : 1,
                  }}
                >
                  {crearPalabra.isPending ? 'Guardando...' : 'Guardar Término'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: CONFIRMAR ELIMINACIÓN DE PALABRA
          ═══════════════════════════════════════════════════════════════════ */}
      {palabraAEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--modal-backdrop, rgba(0,0,0,0.5))',
            backdropFilter: 'blur(4px)',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'var(--bg-surface)',
              borderRadius: 16,
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>
              ¿Eliminar palabra prohibida?
            </h3>

            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg3)', lineHeight: 1.5 }}>
              ¿Estás seguro de que deseas eliminar <strong>"{palabraAEliminar.palabra}"</strong> del diccionario de moderación? El sistema dejará de restringir publicaciones que contengan este término.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setPalabraAEliminar(null)}
                disabled={eliminarPalabra.isPending}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--fg2)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminarPalabra}
                disabled={eliminarPalabra.isPending}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--color-coral, #FF4D68)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: eliminarPalabra.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {eliminarPalabra.isPending ? 'Eliminando...' : 'Eliminar Término'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: NOTA DE RESOLUCIÓN PARA PUBLICACIONES RETENIDAS
          ═══════════════════════════════════════════════════════════════════ */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--modal-backdrop, rgba(0,0,0,0.5))',
            backdropFilter: 'blur(4px)',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 460,
              background: 'var(--bg-surface)',
              borderRadius: 16,
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--fg1)' }}>
              {activeItem.decision === 'aprobar'
                ? 'Aprobar publicación para el feed'
                : 'Confirmar rechazo de publicación'}
            </h3>

            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg3)', lineHeight: 1.5 }}>
              {activeItem.decision === 'aprobar'
                ? 'La publicación volverá a ser visible en todos los feeds de la comunidad. Puedes agregar una nota para auditoría o para el autor.'
                : 'La publicación permanecerá oculta. Se notificará al autor con el motivo del rechazo.'}
            </p>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--fg2)',
                  marginBottom: 6,
                }}
              >
                Nota opcional (máx. 500 caracteres):
              </label>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder={
                  activeItem.decision === 'aprobar'
                    ? 'Ej: El contenido es pertinente a pesar del falso positivo.'
                    : 'Ej: Incumple norma de respeto comunitario.'
                }
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-cool)',
                  color: 'var(--fg1)',
                  fontSize: 13.5,
                  fontFamily: 'inherit',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setActiveItem(null)}
                disabled={moderar.isPending}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--fg2)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={moderar.isPending}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background:
                    activeItem.decision === 'aprobar'
                      ? 'var(--color-matcha, #A8B86B)'
                      : 'var(--color-coral, #FF4D68)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: moderar.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {moderar.isPending
                  ? 'Guardando...'
                  : activeItem.decision === 'aprobar'
                  ? 'Confirmar Aprobación'
                  : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
