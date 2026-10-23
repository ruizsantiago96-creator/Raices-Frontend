import { useState } from 'react'
import { usePublicacionesRechazadas, useModerarPublicacion } from '../hooks/useAdmin'
import { Card, Skeleton } from './AdminUI'
import { Icons, EmptyState } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import type { PublicacionRechazadaAdmin } from '@/types/admin'

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
  const [pagina, setPagina] = useState(1)
  const { data, isLoading, isError, refetch } = usePublicacionesRechazadas({ pagina, limite: 15 })
  const moderar = useModerarPublicacion()
  const { addToast } = useUiStore()

  // Modal para resolución con nota opcional
  const [activeItem, setActiveItem] = useState<{
    post: PublicacionRechazadaAdmin
    decision: 'aprobar' | 'rechazar'
  } | null>(null)
  const [nota, setNota] = useState('')

  const items = data?.datos ?? []
  const total = data?.total ?? 0
  const totalPaginas = data?.totalPaginas ?? 1

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
        'success'
      )
      setActiveItem(null)
      setNota('')
    } catch {
      addToast('Error al resolver la moderación de la publicación', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
              background: total > 0 ? 'color-mix(in srgb, var(--color-coral, #FF4D68) 12%, transparent)' : 'var(--bg-cool)',
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
          {[1, 2, 3].map(i => (
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
          <div style={{ color: 'var(--color-error)', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
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
          {items.map(post => {
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
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
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--fg3)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Contenido original:
                  </div>
                  <p style={{ margin: 0, fontSize: 14.5, color: 'var(--fg1)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
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
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-coral, #FF4D68)', textTransform: 'uppercase' }}>
                      Motivo del rechazo automático:
                    </span>
                    <div style={{ fontSize: 13.5, color: 'var(--fg1)', marginTop: 2, fontWeight: 500 }}>
                      {post.moderacion?.razon || 'Contenido detectado como no apto para la comunidad.'}
                    </div>
                  </div>

                  {post.moderacion?.sugerenciaMejora && (
                    <div style={{ borderTop: '1px solid color-mix(in srgb, var(--color-coral, #FF4D68) 15%, transparent)', paddingTop: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-matcha, #7C8B46)', textTransform: 'uppercase' }}>
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <button
            onClick={() => setPagina(p => Math.max(1, p - 1))}
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
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
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

      {/* Modal para ingresar nota antes de resolver */}
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
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>
                Nota opcional (máx. 500 caracteres):
              </label>
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
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
