import { useState } from 'react'
import type { FormEvent, CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import { useMe } from '@features/auth'
import { ForosExplorer } from '@features/social/pages/ForosPage'
import VacanteCard, { type VacanteItem } from '../components/VacanteCard'

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

/* Datos demo mientras se conecta el endpoint de la empresa en el backend */
const VACANTES_DEMO: VacanteItem[] = [
  {
    id: 'v1',
    puesto: 'Desarrollador Frontend',
    area: 'Tecnología',
    descripcion: 'Mantendrás y evolucionarás nuestra plataforma web, colaborando con diseño para crear interfaces accesibles.',
    modalidad: 'Home Office',
    jornada: 'Tiempo Completo',
    accesibilidad: ['Lector de pantalla compatible', 'Horario flexible', 'Accesibilidad digital'],
    activo: true,
    postulantes: 12,
  },
  {
    id: 'v2',
    puesto: 'Analista de Reclutamiento',
    area: 'Recursos Humanos',
    descripcion: 'Gestión de procesos de selección, entrevistas iniciales y seguimiento de candidatos en la bolsa de trabajo.',
    modalidad: 'Híbrido',
    jornada: 'Medio Tiempo',
    accesibilidad: ['Instalaciones adaptadas', 'Intérprete LSM'],
    activo: true,
    postulantes: 5,
  },
]

let vacanteIdCounter = 100
function generateVacanteId(): string {
  vacanteIdCounter += 1
  return `v-${vacanteIdCounter}`
}

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

  const [vacantes, setVacantes] = useState<VacanteItem[]>(VACANTES_DEMO)
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

  const handleOpenAdd = () => {
    setEditingVacante(null)
    setFormPuesto('')
    setFormArea('Tecnología')
    setFormDescripcion('')
    setFormModalidad('Presencial')
    setFormJornada('Tiempo Completo')
    setFormAccesibilidad(['Instalaciones adaptadas'])
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
    setIsModalOpen(true)
  }

  const handleToggleAccesibilidad = (tag: string) => {
    setFormAccesibilidad(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleToggleStatus = (id: string) => {
    setVacantes(prev => prev.map(v => (v.id === id ? { ...v, activo: !v.activo } : v)))
    addToast('Estado de la vacante actualizado', 'success')
  }

  const handleSaveVacante = (e: FormEvent) => {
    e.preventDefault()
    if (!formPuesto.trim()) {
      addToast('Por favor escribe el nombre del puesto', 'warning')
      return
    }

    if (editingVacante) {
      setVacantes(prev =>
        prev.map(v =>
          v.id === editingVacante.id
            ? {
                ...v,
                puesto: formPuesto.trim(),
                area: formArea,
                descripcion: formDescripcion.trim(),
                modalidad: formModalidad,
                jornada: formJornada,
                accesibilidad: formAccesibilidad,
              }
            : v
        )
      )
      addToast('Vacante actualizada correctamente', 'success')
    } else {
      const nueva: VacanteItem = {
        id: generateVacanteId(),
        puesto: formPuesto.trim(),
        area: formArea,
        descripcion: formDescripcion.trim(),
        modalidad: formModalidad,
        jornada: formJornada,
        accesibilidad: formAccesibilidad,
        activo: true,
        postulantes: 0,
      }
      setVacantes(prev => [nueva, ...prev])
      addToast('Nueva vacante publicada en tu bolsa de trabajo', 'success')
    }
    setIsModalOpen(false)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    setVacantes(prev => prev.filter(v => v.id !== deleteTarget.id))
    addToast('Vacante eliminada', 'info')
    setDeleteTarget(null)
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ETIQUETAS_ACCESIBILIDAD.map(tag => {
                    const selected = formAccesibilidad.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
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
                  style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700 }}
                >
                  {editingVacante ? 'Guardar Cambios' : 'Publicar Vacante'}
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

/* ── Tab: Postulantes (placeholder de la pestaña) ─────────── */

function PostulantesTab() {
  return (
    <div className="animate-fade-in-up" style={{
      textAlign: 'center', padding: '60px 20px',
      background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-color)',
    }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
        {Icons.users({ s: 24 })}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
        Aún no hay postulaciones
      </h3>
      <p style={{ color: 'var(--fg3)', fontSize: 14, margin: 0, maxWidth: 420, marginInline: 'auto', lineHeight: 1.6 }}>
        Cuando las personas postulen a tus vacantes, podrás revisar sus CV y gestionar el proceso de selección aquí.
      </p>
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
