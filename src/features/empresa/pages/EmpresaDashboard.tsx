import { useState } from 'react'
import type { FormEvent, CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icons, hashColor } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import { useMe } from '@features/auth'
import { ForosExplorer } from '@features/social/pages/ForosPage'
import VacanteCard, { type VacanteItem } from '../components/VacanteCard'
import PerfilPostulanteModal from '../components/PerfilPostulanteModal'
import {
  useMyJobPostings,
  useCreateJobPosting,
  useUpdateJobPosting,
  useDeleteJobPosting,
  useToggleJobStatus,
  useAllJobApplicants,
  useUpdateApplicationStatus,
} from '@features/institutions/hooks/useInstitutionJobs'
import type { InstitutionJobApplicant } from '@/types/institutions'
import type { Job } from '@/types/jobs'

/* ── Mapeo entre el modelo visual (VacanteItem) y el payload del API ── */

/** Convierte una vacante del backend en la tarjeta del portal. */
function mapJobToVacante(job: Job): VacanteItem {
  const jornada = job.schedule ?? job.horario ?? ''
  return {
    id: String(job.id ?? ''),
    puesto: job.title ?? job.titulo ?? '',
    area: job.city ? job.city : 'General',
    descripcion: job.description ?? job.descripcion ?? '',
    modalidad: job.modality ?? job.modalidad ?? 'presencial',
    jornada,
    accesibilidad: Array.isArray(job.disability_types) ? job.disability_types : (Array.isArray(job.tiposDiscapacidad) ? job.tiposDiscapacidad : []),
    activo: (job.is_active ?? job.activa ?? true) as boolean,
    postulantes: job.applicants_count ?? 0,
  }
}

/** Normaliza la modalidad visual al enum del backend. */
function modalidadToApi(modalidad: string): string {
  const lower = modalidad.toLowerCase()
  if (lower.includes('home') || lower.includes('remoto')) return 'remoto'
  if (lower.includes('híbrido') || lower.includes('hibrido') || lower.includes('hibrid')) return 'híbrido'
  return 'presencial'
}

/* ── Constantes de UI ─────────────────────────────────────── */

const TAB_TITLES: Record<string, string> = {
  bolsa: 'Bolsa de Trabajo',
  postulantes: 'Postulantes',
  foros: 'Foros y Comunidad',
}

const SUBTITULOS: Record<string, string> = {
  bolsa: 'Publica y administra las vacantes y oportunidades laborales de tu empresa.',
  postulantes: 'Revisa las postulaciones recibidas y gestiona el proceso de selección.',
  foros: 'Participa en la comunidad: comparte experiencias y buenas prácticas inclusivas.',
}

const AREAS = [
  'Tecnología', 'Recursos Humanos', 'Administración', 'Ventas',
  'Marketing', 'Educación', 'Salud', 'Operaciones', 'Otro',
] as const

const MODALIDADES = ['Presencial', 'Home Office', 'Híbrido'] as const
const JORNADAS = ['Tiempo Completo', 'Medio Tiempo', 'Por Horas', 'Prácticas / Pasantía'] as const

const ETIQUETAS_ACCESIBILIDAD = [
  'Instalaciones adaptadas',
  'Lector de pantalla compatible',
  'Intérprete LSM',
  'Horario flexible',
  'Señalética Braille',
  'Accesibilidad digital',
  'Baños adaptados',
  'Estacionamiento accesible',
]

/* ── Estilos compartidos del formulario (mismo patrón del portal de institución) ── */

const inputStyle: CSSProperties = {
  width: '100%', height: 42, padding: '0 14px', borderRadius: 10,
  border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)',
  fontSize: 14, outline: 'none', boxSizing: 'border-box', color: 'var(--fg1)',
  fontFamily: 'var(--font-body)',
}

const labelStyle: CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6,
}

/* ── Tab: Bolsa de Trabajo (vacantes) ─────────────────────── */

function VacantesTab() {
  const navigate = useNavigate()
  const { addToast } = useUiStore()

  // Datos reales desde GET /empleo/mis-vacantes (incluye pausadas)
  const { data: jobs = [], isLoading: loadingVacantes, isError, refetch } = useMyJobPostings()
  const vacantes: VacanteItem[] = jobs.map(mapJobToVacante)
  const createVacante = useCreateJobPosting()
  const updateVacante = useUpdateJobPosting()
  const deleteVacante = useDeleteJobPosting()
  const toggleStatus = useToggleJobStatus()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVacante, setEditingVacante] = useState<VacanteItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<VacanteItem | null>(null)

  // Form state
  const [formPuesto, setFormPuesto] = useState('')
  const [formArea, setFormArea] = useState<string>('Tecnología')
  const [formDescripcion, setFormDescripcion] = useState('')
  const [formModalidad, setFormModalidad] = useState<string>('Presencial')
  const [formJornada, setFormJornada] = useState<string>('Tiempo Completo')
  const [formAccesibilidad, setFormAccesibilidad] = useState<string[]>([])
  const [accesibilidadInput, setAccesibilidadInput] = useState('')

  const handleOpenAdd = () => {
    setEditingVacante(null)
    setFormPuesto('')
    setFormArea('Tecnología')
    setFormDescripcion('')
    setFormModalidad('Presencial')
    setFormJornada('Tiempo Completo')
    setFormAccesibilidad(['Instalaciones adaptadas'])
    setAccesibilidadInput('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (vacante: VacanteItem) => {
    setEditingVacante(vacante)
    setFormPuesto(vacante.puesto)
    setFormArea(vacante.area)
    setFormDescripcion(vacante.descripcion)
    setFormModalidad(vacante.modalidad)
    setFormJornada(vacante.jornada)
    setFormAccesibilidad(vacante.accesibilidad)
    setAccesibilidadInput('')
    setIsModalOpen(true)
  }

  const handleToggleAccesibilidad = (tag: string) => {
    setFormAccesibilidad(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  /** Agrega un requerimiento personalizado escrito por la empresa. */
  const handleAddAccesibilidadCustom = () => {
    const trimmed = accesibilidadInput.trim()
    if (!trimmed) return
    if (formAccesibilidad.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setAccesibilidadInput('')
      return
    }
    setFormAccesibilidad(prev => [...prev, trimmed])
    setAccesibilidadInput('')
  }

  /** Quita un requerimiento (predefinido o personalizado) de la selección. */
  const handleRemoveAccesibilidad = (tag: string) => {
    setFormAccesibilidad(prev => prev.filter(t => t !== tag))
  }

  const handleToggleStatus = (id: string) => {
    const target = vacantes.find(v => v.id === id)
    if (!target) return
    toggleStatus.mutate(
      { id, is_active: !target.activo },
      {
        onSuccess: () => addToast(target.activo ? 'Vacante pausada' : 'Vacante reactivada', 'success'),
        onError: (e: unknown) => {
          const err = e as { response?: { data?: { message?: string } } }
          addToast(err.response?.data?.message ?? 'No se pudo cambiar el estado', 'error')
        },
      }
    )
  }

  /** Payload común del formulario hacia POST/PUT /empleo. */
  const buildPayload = () => ({
    titulo: formPuesto.trim(),
    descripcion: formDescripcion.trim(),
    requisitos: '',
    modalidad: modalidadToApi(formModalidad),
    horario: formJornada,
    tiposDiscapacidad: formAccesibilidad,
    inclusivaDiscapacidad: true,
  })

  const handleSaveVacante = (e: FormEvent) => {
    e.preventDefault()
    if (!formPuesto.trim()) {
      addToast('Por favor escribe el nombre del puesto', 'warning')
      return
    }

    const onError = (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } }
      addToast(err.response?.data?.message ?? 'No se pudo guardar la vacante', 'error')
    }

    if (editingVacante) {
      updateVacante.mutate(
        { id: editingVacante.id, ...buildPayload() },
        {
          onSuccess: () => {
            addToast('Vacante actualizada correctamente', 'success')
            setIsModalOpen(false)
          },
          onError,
        }
      )
    } else {
      createVacante.mutate(buildPayload(), {
        onSuccess: () => {
          addToast('Nueva vacante publicada en tu bolsa de trabajo', 'success')
          setIsModalOpen(false)
        },
        onError,
      })
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteVacante.mutate(deleteTarget.id, {
      onSuccess: () => {
        addToast('Vacante eliminada', 'info')
        setDeleteTarget(null)
      },
      onError: (e: unknown) => {
        const err = e as { response?: { data?: { message?: string } } }
        addToast(err.response?.data?.message ?? 'No se pudo eliminar la vacante', 'error')
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header de sección */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
            Vacantes publicadas
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0, lineHeight: 1.5, maxWidth: 600 }}>
            Administra las oportunidades laborales activas de tu empresa. Pausa, edita o elimina vacantes cuando lo necesites.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          {Icons.plus({ s: 18 })} Agregar vacante
        </button>
      </div>

      {/* Grid de tarjetas de vacantes */}
      {loadingVacantes ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--fg3)', fontSize: 15, gap: 10 }}>
          {Icons.loader({ s: 20 })} Cargando tus vacantes...
        </div>
      ) : isError ? (
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg2)', margin: '0 0 16px' }}>
            No pudimos cargar tus vacantes. Verifica tu conexión e intenta de nuevo.
          </p>
          <button onClick={() => refetch()} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 10 }}>
            Reintentar
          </button>
        </div>
      ) : vacantes.length === 0 ? (
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {Icons.briefcase({ s: 24 })}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>Aún no tienes vacantes publicadas</h3>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '0 0 20px', lineHeight: 1.6 }}>
            Publica tu primera vacante para que aparezca en la bolsa de trabajo inclusiva de Raíces.
          </p>
          <button onClick={handleOpenAdd} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {Icons.plus({ s: 16 })} Publicar primera vacante
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {vacantes.map(vacante => (
            <VacanteCard
              key={vacante.id}
              vacante={vacante}
              onEdit={handleOpenEdit}
              onDelete={v => setDeleteTarget(vacantes.find(x => x.id === v) ?? null)}
              onToggleStatus={handleToggleStatus}
              onViewPostulantes={() => addToast('La gestión de postulantes estará disponible en la pestaña Postulantes', 'info')}
            />
          ))}
        </div>
      )}

      {/* Modal: Agregar / Editar vacante */}
      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="glass-card animate-scale-in"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 520,
              maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
              padding: 28, borderRadius: 20, margin: 'auto',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                {editingVacante ? 'Editar vacante' : 'Agregar vacante'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4 }}>
                {Icons.x({ s: 18 })}
              </button>
            </div>

            <form onSubmit={handleSaveVacante} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nombre del puesto *</label>
                <input
                  type="text"
                  required
                  value={formPuesto}
                  onChange={e => setFormPuesto(e.target.value)}
                  placeholder="ej. Desarrollador Frontend / Analista de datos"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Área del puesto</label>
                  <select value={formArea} onChange={e => setFormArea(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Modalidad de trabajo</label>
                  <select value={formModalidad} onChange={e => setFormModalidad(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {MODALIDADES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Tipo de jornada</label>
                  <select value={formJornada} onChange={e => setFormJornada(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {JORNADAS.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Rango salarial (opcional)</label>
                  <input
                    type="text"
                    placeholder="ej. $15,000 - $20,000 MXN"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Responsabilidades principales</label>
                <textarea
                  rows={3}
                  value={formDescripcion}
                  onChange={e => setFormDescripcion(e.target.value)}
                  placeholder="Describe brevemente las responsabilidades del puesto..."
                  style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'vertical' }}
                />
              </div>

              {/* Requerimientos de accesibilidad */}
              <div>
                <label style={{ ...labelStyle, marginBottom: 8 }}>
                  Requerimientos de accesibilidad del puesto
                </label>
                {/* Opciones predefinidas: seleccionar / deseleccionar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {ETIQUETAS_ACCESIBILIDAD.map(tag => {
                    const selected = formAccesibilidad.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => handleToggleAccesibilidad(tag)}
                        style={{
                          border: '1.5px solid',
                          borderColor: selected ? 'var(--primary)' : 'var(--border-color)',
                          background: selected ? 'color-mix(in oklch, var(--primary) 10%, transparent)' : 'var(--bg-warm)',
                          color: selected ? 'var(--primary)' : 'var(--fg2)',
                          padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                      >
                        {selected ? '✓ ' : '+ '}{tag}
                      </button>
                    )
                  })}
                </div>

                {/* Input para requerimientos personalizados */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    maxLength={60}
                    value={accesibilidadInput}
                    onChange={e => setAccesibilidadInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddAccesibilidadCustom()
                      }
                    }}
                    placeholder="Agregar otro requerimiento no listado..."
                    style={{
                      flex: 1, height: 38, padding: '0 12px', borderRadius: 10,
                      border: '1.5px solid var(--border-color)', background: 'var(--bg-warm)',
                      fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      color: 'var(--fg1)', fontFamily: 'var(--font-body)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAccesibilidadCustom}
                    disabled={!accesibilidadInput.trim()}
                    style={{
                      padding: '0 16px', height: 38, borderRadius: 10, fontSize: 13, fontWeight: 700,
                      border: '1.5px solid var(--border-color)', cursor: accesibilidadInput.trim() ? 'pointer' : 'not-allowed',
                      background: 'var(--bg-surface)', color: accesibilidadInput.trim() ? 'var(--primary)' : 'var(--fg3)',
                      whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', opacity: accesibilidadInput.trim() ? 1 : 0.7,
                    }}
                  >
                    Agregar
                  </button>
                </div>

                {/* Requerimientos seleccionados, cada uno removible */}
                {formAccesibilidad.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {formAccesibilidad.map(tag => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '5px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
                          color: 'var(--primary)', border: '1.5px solid var(--primary)',
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveAccesibilidad(tag)}
                          aria-label={`Quitar ${tag}`}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, fontSize: 13, lineHeight: 1 }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createVacante.isPending || updateVacante.isPending}
                  style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, opacity: createVacante.isPending || updateVacante.isPending ? 0.7 : 1 }}
                >
                  {(createVacante.isPending || updateVacante.isPending)
                    ? 'Guardando...'
                    : editingVacante ? 'Guardar Cambios' : 'Publicar Vacante'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: confirmar eliminación */}
      {deleteTarget && createPortal(
        <div onClick={() => setDeleteTarget(null)} style={{ position: 'fixed', inset: 0, background: 'var(--modal-backdrop)', backdropFilter: 'blur(10px) saturate(140%)', WebkitBackdropFilter: 'blur(10px) saturate(140%)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="animate-scale-in" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: 'var(--radius-md)', padding: 28, maxWidth: 420, width: '100%', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-error) 14%, transparent)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.shieldAlert({ s: 20 })}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Eliminar vacante</h3>
            </div>
            <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Esta acción eliminará la vacante permanentemente. Las postulaciones asociadas dejarán de ser visibles.
            </p>
            <p style={{ fontSize: 14, color: 'var(--fg1)', fontWeight: 600, margin: '0 0 20px' }}>
              &quot;{deleteTarget.puesto}&quot;
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button onClick={handleConfirmDelete} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-error)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Eliminar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

/* ── Tab: Postulantes (conectada a /empleo/postulantes-institucion) ── */

type EstadoFiltro = 'all' | 'pending' | 'accepted' | 'rejected'

const POSTULANTES_FILTROS: { value: EstadoFiltro; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'rejected', label: 'Rechazadas' },
]

const ESTADO_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: 'var(--color-empleo)', bg: 'color-mix(in oklch, var(--color-empleo) 14%, transparent)' },
  accepted: { label: 'Aceptada', color: 'var(--primary)', bg: 'color-mix(in oklch, var(--primary) 14%, transparent)' },
  rejected: { label: 'Rechazada', color: 'var(--color-error)', bg: 'color-mix(in oklch, var(--color-error) 14%, transparent)' },
}

function PostulantesTab() {
  const { addToast } = useUiStore()
  const [filter, setFilter] = useState<EstadoFiltro>('all')
  const [search, setSearch] = useState('')
  const [cartaAbierta, setCartaAbierta] = useState<string | number | null>(null)
  const [perfilTarget, setPerfilTarget] = useState<InstitutionJobApplicant | null>(null)

  // El gate de rol (institution | empresa) vive dentro de los hooks
  const { data: applicants = [], isLoading, isError, refetch } = useAllJobApplicants()
  const updateStatus = useUpdateApplicationStatus()
  const [updatingId, setUpdatingId] = useState<string | number | null>(null)

  const filtered = applicants.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    if (!search.trim()) return matchesFilter
    const q = search.toLowerCase()
    const matchesSearch = (app.user_name ?? '').toLowerCase().includes(q) ||
                          (app.job_title ?? '').toLowerCase().includes(q) ||
                          (app.user_email ?? '').toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  const counts: Record<EstadoFiltro, number> = {
    all: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  }

  const handleSetStatus = (applicantId: string | number, status: 'accepted' | 'rejected') => {
    setUpdatingId(applicantId)
    updateStatus.mutate(
      { applicantId, status },
      {
        onSuccess: () => {
          addToast(status === 'accepted' ? 'Postulación aceptada. Se notificó a la persona.' : 'Postulación rechazada. Se notificó a la persona.', 'success')
          setUpdatingId(null)
        },
        onError: (e: unknown) => {
          const err = e as { response?: { data?: { message?: string } } }
          addToast(err.response?.data?.message ?? 'No se pudo actualizar la postulación', 'error')
          setUpdatingId(null)
        },
      }
    )
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toolbar: filtros + búsqueda */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {POSTULANTES_FILTROS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '7px 16px', borderRadius: 20, border: '1px solid var(--border-color)', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              background: filter === f.value ? 'var(--primary)' : 'var(--bg-surface)',
              color: filter === f.value ? '#fff' : 'var(--fg2)',
            }}
          >
            {f.label} ({counts[f.value]})
          </button>
        ))}
        <div style={{ position: 'relative', flex: 1, minWidth: 220, marginLeft: 'auto' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)' }}>{Icons.search({ s: 16 })}</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o vacante..."
            style={{
              height: 40, padding: '0 12px 0 36px', border: '1px solid var(--border-color)',
              borderRadius: 10, fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)',
              outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)', width: '100%',
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 72, borderRadius: 14, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : isError ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg2)', margin: '0 0 16px' }}>
            No pudimos cargar las postulaciones. Intenta de nuevo.
          </p>
          <button onClick={() => refetch()} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 10 }}>
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
            {Icons.users({ s: 24 })}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
            {applicants.length === 0 ? 'Aún no hay postulaciones' : 'Sin resultados'}
          </h3>
          <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0, maxWidth: 420, marginInline: 'auto', lineHeight: 1.6 }}>
            {applicants.length === 0
              ? 'Cuando las personas postulen a tus vacantes, podrás revisar sus cartas y gestionar el proceso de selección aquí.'
              : 'Prueba con otro filtro o término de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="responsive-table-wrap overflow-x-auto" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
          <table className="responsive-table" style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'color-mix(in oklch, var(--bg-warm) 60%, var(--bg-surface))' }}>
                {['Postulante', 'Vacante', 'Carta', 'Fecha', 'Estado', 'Perfil', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => {
                const meta = ESTADO_META[app.status] ?? ESTADO_META.pending
                const isUpdating = updatingId === app.id
                return (
                  <tr key={String(app.id)} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'color-mix(in oklch, var(--primary) 2%, var(--bg-surface))'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: hashColor(app.user_name ?? ''), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {(app.user_name ?? '?')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{app.user_name ?? '—'}</div>
                          {app.user_email && <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{app.user_email}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--fg1)' }}>
                      {app.job_title ?? '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {app.cover_letter ? (
                        <button
                          onClick={() => setCartaAbierta(cartaAbierta === app.id ? null : app.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 600, padding: 0, fontFamily: 'var(--font-body)' }}
                        >
                          {cartaAbierta === app.id ? 'Ocultar carta' : 'Ver carta'}
                        </button>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--fg3)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--fg3)' }}>
                      {app.created_at ? new Date(app.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => setPerfilTarget(app)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                          cursor: 'pointer', border: '1.5px solid var(--border-color)',
                          background: 'var(--bg-surface)', color: 'var(--fg2)', fontFamily: 'var(--font-body)',
                        }}
                        title="Ver perfil completo del postulante"
                      >
                        {Icons.user({ s: 13 })} Ver perfil
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {app.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleSetStatus(app.id, 'accepted')}
                            disabled={isUpdating}
                            style={{
                              padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: isUpdating ? 'wait' : 'pointer',
                              border: '1.5px solid var(--primary)', background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
                              color: 'var(--primary)', fontFamily: 'var(--font-body)', opacity: isUpdating ? 0.6 : 1,
                            }}
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleSetStatus(app.id, 'rejected')}
                            disabled={isUpdating}
                            style={{
                              padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: isUpdating ? 'wait' : 'pointer',
                              border: '1.5px solid var(--color-error)', background: 'color-mix(in oklch, var(--color-error) 8%, transparent)',
                              color: 'var(--color-error)', fontFamily: 'var(--font-body)', opacity: isUpdating ? 0.6 : 1,
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12.5, color: 'var(--fg3)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: perfil completo del postulante */}
      {perfilTarget && (
        <PerfilPostulanteModal
          postulacion={perfilTarget}
          onClose={() => setPerfilTarget(null)}
        />
      )}

      {/* Panel de carta de presentación (inline, bajo la tabla) */}
      {cartaAbierta !== null && (() => {
        const app = applicants.find(a => a.id === cartaAbierta)
        if (!app?.cover_letter) return null
        return (
          <div className="animate-fade-in-up" style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>
                Carta de presentación — {app.user_name ?? 'Postulante'}
              </span>
              <button onClick={() => setCartaAbierta(null)} aria-label="Cerrar carta" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4 }}>
                {Icons.x({ s: 16 })}
              </button>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--fg2)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
              {app.cover_letter}
            </p>
          </div>
        )
      })()}
    </div>
  )
}

/* ── Página principal del portal de empresa ───────────────── */

export default function EmpresaDashboard() {
  const navigate = useNavigate()
  const tab = useUiStore(s => s.empresaPortalTab)

  // Nota: sustituir por el hook propio de la empresa p. ej. useMiEmpresa()
  // cuando el backend exponga el endpoint equivalente a /instituciones/mi-institucion
  const { data: me, isLoading: loadingMe } = useMe()

  const hasEmpresa = !loadingMe && !!me

  const currentTab = tab && TAB_TITLES[tab] ? tab : 'bolsa'

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '1100px' } as Record<string, string>}>
      {/* Loading */}
      {loadingMe && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: 'var(--fg3)', fontSize: 15, gap: 10 }}>
          {Icons.loader({ s: 20 })} Cargando información de la empresa...
        </div>
      )}

      {/* Sin empresa registrada — invitar a completar el registro */}
      {!loadingMe && !me && (
        <div className="animate-fade-in-up" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '48px 32px', maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {Icons.briefcase({ s: 28 })}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>Completa el registro de tu empresa</h2>
          <p style={{ fontSize: 15, color: 'var(--fg3)', marginBottom: 8, lineHeight: 1.6 }}>Tu cuenta de usuario fue creada correctamente, pero aún falta registrar los datos de tu empresa.</p>
          <p style={{ fontSize: 13, color: 'var(--fg3)', marginBottom: 24, lineHeight: 1.5 }}>Este paso es necesario para publicar vacantes y participar en la comunidad.</p>
          <button onClick={() => navigate('/completar-perfil')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {Icons.plus({ s: 18 })} Registrar datos de mi empresa
          </button>
        </div>
      )}

      {/* Empresa registrada — mostrar dashboard */}
      {hasEmpresa && (
        <>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 key={currentTab} className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', margin: 0, letterSpacing: '-0.02em' }}>
                {TAB_TITLES[currentTab]}
              </h1>
              <span style={{ fontSize: 14, color: 'var(--fg3)', fontWeight: 500 }}>
                {TAB_TITLES[currentTab] === 'Bolsa de Trabajo'
                  ? SUBTITULOS.bolsa
                  : me?.full_name ? `${me.full_name}` : SUBTITULOS[currentTab] ?? ''}
              </span>
            </div>

            <button
              onClick={() => navigate('/explore')}
              style={{
                padding: '10px 18px', borderRadius: 10, border: '1.5px solid var(--border-color)',
                background: 'var(--bg-surface)', color: 'var(--primary)', fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: 'var(--shadow-xs)', transition: 'all 0.15s ease',
              }}
            >
              👁️ Vista Previa de Perfil Público
            </button>
          </div>

          <div key={`content-${currentTab}`} className="animate-tab-in">
            {currentTab === 'bolsa' && <VacantesTab />}
            {currentTab === 'postulantes' && <PostulantesTab />}
            {currentTab === 'foros' && <ForosExplorer showHeader={false} />}
          </div>
        </>
      )}
    </main>
  )
}
