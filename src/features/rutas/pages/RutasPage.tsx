import { useState, useRef, useEffect, type FormEvent, type ChangeEvent, type CSSProperties } from 'react'
import {
  useRutas,
  useRutasSummary,
  useGenerarRutaPersonalizada,
  useUpdateRuta,
  useDeleteRuta,
  useRutaDetail,
  useAddPaso,
  useCompletarPaso,
  useDescompletarPaso
} from '../hooks/useRutas'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, labelStyle, RestrictedBlock } from '@shared/components/shared'
import { CustomSelect } from '@shared/components/CustomSelect'
import { useOnboardingStatus } from '@features/institutions/hooks/useRecommendations'
import type {
  PasoRuta,
  RutaPrioridad,
  RutaEstado,
} from '@/types/rutas'

const PRIORITY_COLORS: Record<string, { bg: string; fg: string }> = {
  baja: { bg: 'rgba(75, 163, 163, 0.15)', fg: '#4BA3A3' },
  media: { bg: 'rgba(212, 148, 76, 0.15)', fg: '#D4944C' },
  alta: { bg: 'rgba(220, 53, 69, 0.15)', fg: '#DC3545' },
}

const STATUS_LABELS: Record<string, string> = {
  activa: 'Activa',
  completada: 'Completada',
  pausada: 'Pausada',
  cancelada: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  activa: '#01ADFF',
  completada: '#10B981',
  pausada: '#D4944C',
  cancelada: '#94A3B8',
}

interface AreaItem {
  id: string
  label: string
}

// ─── Estado de generación automática (motor de recomendación) ─────────────

/**
 * Se muestra mientras el motor genera la ruta personalizada (puede tardar
 * unos segundos por la IA). Reemplaza al empty state tradicional para no
 * ofrecer una creación manual que ya no existe.
 */
function GenerandoRutaState() {
  return (
    <div
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Spinner con ícono central */}
      <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 18px' }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)',
          borderRadius: '50%', animation: 'spin 0.9s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
        }}>
          {Icons.compass({ s: 24 })}
        </div>
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
        Preparando tu ruta de desarrollo
      </h3>
      <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.6 }}>
        Analizando tu perfil e integrando especialistas reales para tu ruta ideal...
      </p>

      {/* Skeletons sutiles mientras la IA trabaja */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26, textAlign: 'left' }}>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              height: 54, borderRadius: 10,
              background: 'var(--bg-warm)', border: '1px solid var(--border-color)',
              animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function RutasPage() {
  const { addToast } = useUiStore()
  const { data: catalogos } = useCatalogos()
  const { data: onboardingStatus } = useOnboardingStatus()
  const isIncomplete = Boolean(onboardingStatus && !(onboardingStatus as { onboardingCompleto?: boolean }).onboardingCompleto)

  // State filters
  const [filterEstado, setFilterEstado] = useState<string>('')
  const [filterArea, setFilterArea] = useState<string>('')

  // Queries
  const { data: routes = [], isLoading: loadingRoutes } = useRutas({
    estado: filterEstado || undefined,
    areaInteres: filterArea || undefined,
  })
  const { data: summary } = useRutasSummary()

  // Motor de recomendación automatizado (reemplaza al CRUD manual de creación)
  const generar = useGenerarRutaPersonalizada()
  const rutasActivas = routes.filter(r => r.estado === 'activa').length
  // Ref (no state) para disparar la generación solo una vez por montaje sin
  // provocar renders en cascada dentro del effect.
  const generacionDisparada = useRef(false)

  const dispararGeneracion = () => {
    generar.mutate(undefined, {
      onSuccess: () => addToast('Tu ruta personalizada está lista', 'success'),
      onError: () => addToast('No pudimos generar tu ruta automáticamente', 'error'),
    })
  }

  // ── Auto-Fetch: sin rutas activas → el motor genera la ruta ──────────────
  useEffect(() => {
    // Solo una vez por montaje, y únicamente cuando el listado ya terminó de
    // cargar (así sabemos con certeza que no hay rutas activas).
    if (generacionDisparada.current || loadingRoutes || isIncomplete) return
    if (rutasActivas > 0) return

    generacionDisparada.current = true
    generar.mutate(undefined, {
      onSuccess: () => addToast('Tu ruta personalizada está lista', 'success'),
      onError: () => addToast('No pudimos generar tu ruta automáticamente', 'error'),
    })
  }, [loadingRoutes, rutasActivas, isIncomplete, generar, addToast])

  // Modals state
  const [selectedRouteId, setSelectedRouteId] = useState<string | number | null>(null)

  // Hooks CRUD (edición/eliminación de rutas existentes)
  const updateRuta = useUpdateRuta(selectedRouteId)
  const deleteRuta = useDeleteRuta(selectedRouteId)

  // Handle route deletion
  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta ruta de desarrollo?')) return
    try {
      await deleteRuta.mutateAsync()
      addToast('Ruta de desarrollo eliminada', 'success')
      setSelectedRouteId(null)
    } catch {
      addToast('Error al eliminar la ruta', 'error')
    }
  }

  // Interest areas list
  const listAreas: AreaItem[] = catalogos?.areasInteres ?? [
    { id: 'salud', label: 'Salud y Terapia' },
    { id: 'educacion', label: 'Educación' },
    { id: 'empleo', label: 'Empleo' },
    { id: 'comunidad', label: 'Comunidad y Recreación' },
  ]

  // Mientras la generación inicial está en curso se ocupa toda la zona de
  // contenido con el estado estratégico (sin empty state ni skeletons de lista).
  const generandoRutaInicial = generar.isPending

  return (
    <main className="responsive-main" style={{ '--main-max-width': '1100px' } as CSSProperties}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 48px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>
            Mis Rutas de Desarrollo
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0' }}>Tu camino personalizado, generado automáticamente para ti</p>
        </div>

        {isIncomplete ? (
          <RestrictedBlock
            title="Rutas restringidas"
            message="Completa tu perfil desde el panel principal (dashboard) para comenzar a planificar tus metas y rutas de desarrollo."
            height={360}
          />
        ) : (
          <>
            {/* Stats Summary Panel */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Rutas</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginTop: 4 }}>{summary.totalRutas ?? 0}</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activas</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginTop: 4 }}>{summary.rutasActivas ?? 0}</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completadas</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginTop: 4 }}>{summary.rutasCompletadas ?? 0}</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progreso Promedio</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg1)', marginTop: 4 }}>
                {summary.progresoPromedio !== undefined ? `${Math.round(summary.progresoPromedio)}%` : '0%'}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 170 }}>
            <CustomSelect
              value={filterEstado}
              onChange={val => setFilterEstado(val)}
              placeholder="Todos los estados"
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'activa', label: 'Activa' },
                { value: 'completada', label: 'Completada' },
                { value: 'pausada', label: 'Pausada' },
                { value: 'cancelada', label: 'Cancelada' },
              ]}
            />
          </div>
          <div style={{ minWidth: 190 }}>
            <CustomSelect
              value={filterArea}
              onChange={val => setFilterArea(val)}
              placeholder="Todas las áreas"
              options={[
                { value: '', label: 'Todas las áreas' },
                ...listAreas.map(a => ({ value: a.id, label: a.label })),
              ]}
            />
          </div>
        </div>

        {/* Routes Grid */}
        {loadingRoutes ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24, height: 160, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : generandoRutaInicial ? (
          /* Motor de recomendación en curso: se oculta el empty state tradicional */
          <GenerandoRutaState />
        ) : routes.length === 0 ? (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
              {Icons.compass({ s: 24 })}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Aún no tienes rutas de desarrollo</h3>
            <p style={{ fontSize: 14, color: 'var(--fg2)', marginBottom: generar.isError ? 20 : 0, maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Estamos preparando tu primera ruta personalizada a partir de tu perfil. Si no aparece en unos segundos, puedes reintentar.
            </p>
            {generar.isError && (
              <button onClick={dispararGeneracion} className="btn-primary" style={{ padding: '10px 24px' }}>
                Reintentar generación
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {routes.map((ruta) => {
              const area = listAreas.find(a => a.id === ruta.areaInteres)
              const prio = PRIORITY_COLORS[ruta.prioridad] ?? PRIORITY_COLORS.media
              return (
                <div
                  key={ruta.id}
                  onClick={() => setSelectedRouteId(ruta.id)}
                  className="card-hover"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 14,
                    padding: 24,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 180,
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    {/* Tags */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: STATUS_COLORS[ruta.estado] || '#01ADFF', background: 'rgba(255,255,255,0.8)' }}>
                        ● {STATUS_LABELS[ruta.estado] || ruta.estado}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: prio.bg, color: prio.fg }}>
                        {ruta.prioridad}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px', lineHeight: 1.3 }}>{ruta.nombre}</h3>
                    <p style={{ fontSize: 13, color: 'var(--fg2)', margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ruta.descripcion || 'Sin descripción'}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 13, fontWeight: 600, color: 'var(--fg1)', marginBottom: 6 }}>
                      <span>{area?.label || ruta.areaInteres}</span>
                      <span>{Math.round(ruta.porcentajeProgreso ?? 0)}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${ruta.porcentajeProgreso ?? 0}%`, background: STATUS_COLORS[ruta.estado] || 'var(--primary)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── ROUTE DETAIL MODAL ── */}
        {selectedRouteId && (
          <RouteDetailModal
            routeId={selectedRouteId}
            onClose={() => setSelectedRouteId(null)}
            onDelete={handleDelete}
            listAreas={listAreas}
            updateRuta={updateRuta}
          />
        )}

        </>
        )}
      </div>
    </main>
  )
}

interface RouteDetailModalProps {
  routeId: string | number
  onClose: () => void
  onDelete: () => void
  listAreas: AreaItem[]
  updateRuta: ReturnType<typeof useUpdateRuta>
}

function RouteDetailModal({ routeId, onClose, onDelete, listAreas, updateRuta }: RouteDetailModalProps) {
  const { addToast } = useUiStore()
  const { data: ruta, isLoading } = useRutaDetail(routeId)
  const addPaso = useAddPaso(routeId)
  const completarPaso = useCompletarPaso(routeId)
  const descompletarPaso = useDescompletarPaso(routeId)

  const [newStepTitle, setNewStepTitle] = useState('')

  const handleStatusChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    try {
      await updateRuta.mutateAsync({ estado: e.target.value as RutaEstado })
      addToast('Estado actualizado', 'success')
    } catch {
      addToast('Error al actualizar el estado', 'error')
    }
  }

  const handlePriorityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    try {
      await updateRuta.mutateAsync({ prioridad: e.target.value as RutaPrioridad })
      addToast('Prioridad actualizada', 'success')
    } catch {
      addToast('Error al actualizar la prioridad', 'error')
    }
  }

  const handleAddStep = async (e: FormEvent) => {
    e.preventDefault()
    if (!newStepTitle.trim()) return
    try {
      await addPaso.mutateAsync({ titulo: newStepTitle.trim() })
      addToast('Hito agregado', 'success')
      setNewStepTitle('')
    } catch {
      addToast('Error al agregar el hito', 'error')
    }
  }

  const handleTogglePaso = async (paso: PasoRuta) => {
    try {
      if (paso.completado) {
        await descompletarPaso.mutateAsync(paso.id)
      } else {
        await completarPaso.mutateAsync(paso.id)
      }
    } catch {
      addToast('Error al cambiar el estado del paso', 'error')
    }
  }

  if (isLoading || !ruta) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 48, textAlign: 'center', width: 300 }}>Cargando detalles...</div>
      </div>
    )
  }

  const area = listAreas.find(a => a.id === ruta.areaInteres)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: 32, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        {/* Close */}
        <button type="button" onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--bg-warm)', color: 'var(--fg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {Icons.x({ s: 16 })}
        </button>

        {/* Header */}
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{area?.label || ruta.areaInteres}</span>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '4px 0 8px' }}>{ruta.nombre}</h2>
        <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 20px', lineHeight: 1.5 }}>{ruta.descripcion || 'Sin descripción'}</p>

        {/* Progress Tracker */}
        <div style={{ background: 'var(--bg-warm)', borderRadius: 12, padding: 18, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 13, fontWeight: 700, color: 'var(--fg1)', marginBottom: 8 }}>
            <span>Progreso</span>
            <span>{Math.round(ruta.porcentajeProgreso ?? 0)}% ({ruta.pasosCompletados ?? 0} de {ruta.totalPasos ?? 0} pasos)</span>
          </div>
          <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${ruta.porcentajeProgreso ?? 0}%`, background: STATUS_COLORS[ruta.estado] || 'var(--primary)', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
          {ruta.metaFinal && (
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--fg2)' }}>
              <strong>Meta final:</strong> {ruta.metaFinal}
            </div>
          )}
        </div>

        {/* Route settings row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Estado</label>
            <div style={{ marginTop: 4 }}>
              <CustomSelect
                value={ruta.estado}
                onChange={val => {
                  const event = { target: { value: val } } as ChangeEvent<HTMLSelectElement>
                  handleStatusChange(event)
                }}
                options={[
                  { value: 'activa', label: 'Activa' },
                  { value: 'completada', label: 'Completada' },
                  { value: 'pausada', label: 'Pausada' },
                  { value: 'cancelada', label: 'Cancelada' },
                ]}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Prioridad</label>
            <div style={{ marginTop: 4 }}>
              <CustomSelect
                value={ruta.prioridad}
                onChange={val => {
                  const event = { target: { value: val } } as ChangeEvent<HTMLSelectElement>
                  handlePriorityChange(event)
                }}
                options={[
                  { value: 'baja', label: 'Baja' },
                  { value: 'media', label: 'Media' },
                  { value: 'alta', label: 'Alta' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Steps List */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>Hitos y Pasos</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, maxHeight: 220, overflowY: 'auto' }}>
          {ruta.pasos?.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--fg3)', fontStyle: 'italic', margin: '8px 0' }}>No hay hitos creados aún. Agrega uno abajo.</p>
          ) : (
            ruta.pasos?.map((paso: PasoRuta, idx: number) => (
              <label
                key={paso.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: paso.completado ? 'color-mix(in oklch, var(--primary) 4%, var(--bg-surface))' : 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={!!paso.completado}
                  onChange={() => handleTogglePaso(paso)}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: paso.completado ? 'var(--fg3)' : 'var(--fg1)',
                  textDecoration: paso.completado ? 'line-through' : 'none'
                }}>
                  {idx + 1}. {paso.titulo}
                </span>
              </label>
            ))
          )}
        </div>

        {/* Quick Add Step form */}
        <form onSubmit={handleAddStep} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input
            className="onboarding-input"
            value={newStepTitle}
            onChange={e => setNewStepTitle(e.target.value)}
            placeholder="Nuevo hito (Ej. Comprar andadera...)"
            style={{ height: 38, flex: 1, padding: '0 12px' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.plus({ s: 16 })}
          </button>
        </form>

        {/* Footer controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
          <button type="button" onClick={onDelete} style={{ background: 'none', border: '1px solid #DC3545', color: '#DC3545', padding: '10px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.trash({ s: 14 })} Eliminar Ruta
          </button>
          <button type="button" className="btn-secondary" style={{ fontSize: 13.5, padding: '10px 20px', borderRadius: 8 }} onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  )
}
