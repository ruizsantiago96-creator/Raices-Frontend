import { useState } from 'react'
import {
  useRutas,
  useRutasSummary,
  useCreateRuta,
  useUpdateRuta,
  useDeleteRuta,
  useRutaDetail,
  useAddPaso,
  useCompletarPaso,
  useDescompletarPaso
} from '../hooks/useRutas'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'

const PRIORITY_COLORS = {
  baja: { bg: 'rgba(75, 163, 163, 0.15)', fg: '#4BA3A3' },
  media: { bg: 'rgba(212, 148, 76, 0.15)', fg: '#D4944C' },
  alta: { bg: 'rgba(220, 53, 69, 0.15)', fg: '#DC3545' },
}

const STATUS_LABELS = {
  activa: 'Activa',
  completada: 'Completada',
  pausada: 'Pausada',
  cancelada: 'Cancelada',
}

const STATUS_COLORS = {
  activa: '#01ADFF',
  completada: '#10B981',
  pausada: '#D4944C',
  cancelada: '#94A3B8',
}

export default function RutasPage() {
  const { addToast } = useUiStore()
  const { data: catalogos } = useCatalogos()

  // State filters
  const [filterEstado, setFilterEstado] = useState('')
  const [filterArea, setFilterArea] = useState('')

  // Queries
  const { data: routes = [], isLoading: loadingRoutes } = useRutas({ estado: filterEstado || undefined, areaInteres: filterArea || undefined })
  const { data: summary } = useRutasSummary()

  // Modals state
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState(null)

  // Hooks CRUD
  const createRuta = useCreateRuta()
  const updateRuta = useUpdateRuta(selectedRouteId)
  const deleteRuta = useDeleteRuta(selectedRouteId)

  // Creation form state
  const [newForm, setNewForm] = useState({
    nombre: '',
    descripcion: '',
    metaFinal: '',
    areaInteres: '',
    prioridad: 'media',
    fechaLimite: '',
  })

  // Handle route creation
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newForm.nombre || !newForm.areaInteres) {
      addToast('Nombre y Área de interés son requeridos', 'error')
      return
    }
    try {
      await createRuta.mutateAsync(newForm)
      addToast('Ruta de desarrollo creada', 'success')
      setCreateOpen(false)
      setNewForm({ nombre: '', descripcion: '', metaFinal: '', areaInteres: '', prioridad: 'media', fechaLimite: '' })
    } catch {
      addToast('Error al crear la ruta', 'error')
    }
  }

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
  const listAreas = catalogos?.areasInteres ?? [
    { id: 'salud', label: 'Salud y Terapia' },
    { id: 'educacion', label: 'Educación' },
    { id: 'empleo', label: 'Empleo' },
    { id: 'comunidad', label: 'Comunidad y Recreación' },
  ]

  return (
    <main className="responsive-main" style={{ '--main-max-width': '1100px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 48px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>
              Mis Rutas de Desarrollo
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0' }}>Planifica tus metas y haz un seguimiento paso a paso</p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="auth-btn-primary" style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icons.plus({ s: 18 })} Nueva Ruta
          </button>
        </div>

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
          <div style={{ minWidth: 160 }}>
            <select className="onboarding-input auth-select" style={{ height: 42, padding: '0 16px 0 12px' }} value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="completada">Completada</option>
              <option value="pausada">Pausada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div style={{ minWidth: 180 }}>
            <select className="onboarding-input auth-select" style={{ height: 42, padding: '0 16px 0 12px' }} value={filterArea} onChange={e => setFilterArea(e.target.value)}>
              <option value="">Todas las áreas</option>
              {listAreas.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Routes Grid */}
        {loadingRoutes ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24, height: 160, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : routes.length === 0 ? (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
              {Icons.compass({ s: 24 })}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Aún no tienes rutas de desarrollo</h3>
            <p style={{ fontSize: 14, color: 'var(--fg2)', marginBottom: 20 }}>Crea una ruta personalizada para dar seguimiento a tus hitos terapéuticos, educativos o laborales.</p>
            <button onClick={() => setCreateOpen(true)} className="btn-primary" style={{ padding: '10px 24px' }}>
              Crear mi primera ruta
            </button>
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
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: STATUS_COLORS[ruta.estado], background: 'rgba(255,255,255,0.8)' }}>
                        ● {STATUS_LABELS[ruta.estado]}
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

        {/* ── CREATE ROUTE MODAL ── */}
        {createOpen && (
          <div onClick={() => setCreateOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <form onClick={e => e.stopPropagation()} onSubmit={handleCreate} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', padding: 32, maxWidth: 500, width: '100%', position: 'relative' }}>
              <button type="button" onClick={() => setCreateOpen(false)} style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--bg-warm)', color: 'var(--fg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {Icons.x({ s: 16 })}
              </button>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>Nueva Ruta de Desarrollo</h3>
              <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 20px' }}>Establece un plan y agrega hitos para dar seguimiento.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Nombre de la ruta *</label>
                  <input required className="onboarding-input" value={newForm.nombre} onChange={e => setNewForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej. Terapia física de marcha" style={{ marginTop: 6 }} />
                </div>
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea className="onboarding-input" value={newForm.descripcion} onChange={e => setNewForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Hitos y enfoque actual..." style={{ marginTop: 6, height: 60, resize: 'none' }} />
                </div>
                <div>
                  <label style={labelStyle}>Meta final</label>
                  <input className="onboarding-input" value={newForm.metaFinal} onChange={e => setNewForm(f => ({ ...f, metaFinal: e.target.value }))} placeholder="Ej. Caminar 50 metros sin andadera" style={{ marginTop: 6 }} />
                </div>
                <div>
                  <label style={labelStyle}>Área de interés *</label>
                  <select required className="onboarding-input auth-select" value={newForm.areaInteres} onChange={e => setNewForm(f => ({ ...f, areaInteres: e.target.value }))} style={{ marginTop: 6 }}>
                    <option value="">Selecciona...</option>
                    {listAreas.map(a => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Prioridad</label>
                    <select className="onboarding-input auth-select" value={newForm.prioridad} onChange={e => setNewForm(f => ({ ...f, prioridad: e.target.value }))} style={{ marginTop: 6 }}>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Fecha límite</label>
                    <input type="date" className="onboarding-input" value={newForm.fechaLimite} onChange={e => setNewForm(f => ({ ...f, fechaLimite: e.target.value }))} style={{ marginTop: 6 }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancelar</button>
                <button type="submit" disabled={createRuta.isPending} className="btn-primary" style={{ padding: '10px 24px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>
                  {createRuta.isPending ? 'Guardando...' : 'Crear Ruta'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── ROUTE DETAIL MODAL ── */}
        {selectedRouteId && (
          <RouteDetailModal routeId={selectedRouteId} onClose={() => setSelectedRouteId(null)} onDelete={handleDelete} listAreas={listAreas} updateRuta={updateRuta} />
        )}

      </div>
    </main>
  )
}

function RouteDetailModal({ routeId, onClose, onDelete, listAreas, updateRuta }) {
  const { addToast } = useUiStore()
  const { data: ruta, isLoading } = useRutaDetail(routeId)
  const addPaso = useAddPaso(routeId)
  const completarPaso = useCompletarPaso(routeId)
  const descompletarPaso = useDescompletarPaso(routeId)

  const [newStepTitle, setNewStepTitle] = useState('')

  const handleStatusChange = async (e) => {
    try {
      await updateRuta.mutateAsync({ estado: e.target.value })
      addToast('Estado actualizado', 'success')
    } catch {
      addToast('Error al actualizar el estado', 'error')
    }
  }

  const handlePriorityChange = async (e) => {
    try {
      await updateRuta.mutateAsync({ prioridad: e.target.value })
      addToast('Prioridad actualizada', 'success')
    } catch {
      addToast('Error al actualizar la prioridad', 'error')
    }
  }

  const handleAddStep = async (e) => {
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

  const handleTogglePaso = async (paso) => {
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
            <span>{Math.round(ruta.porcentajeProgreso ?? 0)}% ({ruta.pasosCompletados} de {ruta.totalPasos} pasos)</span>
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
            <select className="onboarding-input auth-select" style={{ height: 38, marginTop: 4, fontSize: 13.5 }} value={ruta.estado} onChange={handleStatusChange}>
              <option value="activa">Activa</option>
              <option value="completada">Completada</option>
              <option value="pausada">Pausada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Prioridad</label>
            <select className="onboarding-input auth-select" style={{ height: 38, marginTop: 4, fontSize: 13.5 }} value={ruta.prioridad} onChange={handlePriorityChange}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        {/* Steps List */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>Hitos y Pasos</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, maxHeight: 220, overflowY: 'auto' }}>
          {ruta.pasos?.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--fg3)', fontStyle: 'italic', margin: '8px 0' }}>No hay hitos creados aún. Agrega uno abajo.</p>
          ) : (
            ruta.pasos?.map((paso, idx) => (
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
