import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icons } from '@shared/components/shared'
import { CustomSelect } from '@shared/components/CustomSelect'
import { useMiInstitucion, useUpdateMiInstitucion } from '../hooks/useInstitutions'
import { useUiStore } from '@shared/stores/uiStore'

export interface ServicioItem {
  id: string
  nombre: string
  categoria: 'Salud y Terapia' | 'Educación' | 'Recreación' | 'Asistencia Social' | 'Otro'
  descripcion: string
  costo: string
  horario: string
  accesibilidad: string[]
  activo: boolean
}

const CATEGORIAS = ['Salud y Terapia', 'Educación', 'Recreación', 'Asistencia Social', 'Otro'] as const
const ETIQUETAS_ACCESIBILIDAD = [
  'Rampa de acceso',
  'Elevador',
  'Intérprete LSM',
  'Señalética Braille',
  'Espacio sensorial amigable',
  'Estacionamiento accesible',
  'Baños adaptados',
]

let serviceIdCounter = 100

function generateServiceId(): string {
  serviceIdCounter += 1
  return `s-${serviceIdCounter}`
}

function parseServicio(raw: unknown, idx: number): ServicioItem {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && parsed.nombre) {
        return {
          id: parsed.id ? String(parsed.id) : `s-${idx}`,
          nombre: String(parsed.nombre),
          categoria: parsed.categoria ?? 'Salud y Terapia',
          descripcion: parsed.descripcion ?? '',
          costo: parsed.costo ? String(parsed.costo) : 'Gratuito',
          horario: parsed.horario ?? '',
          accesibilidad: Array.isArray(parsed.accesibilidad) ? parsed.accesibilidad : [],
          activo: parsed.activo !== false,
        }
      }
    } catch {
      return {
        id: `s-${idx}`,
        nombre: raw,
        categoria: 'Salud y Terapia',
        descripcion: '',
        costo: 'Gratuito',
        horario: '',
        accesibilidad: [],
        activo: true,
      }
    }
  } else if (raw && typeof raw === 'object') {
    const s = raw as Record<string, unknown>
    return {
      id: s.id ? String(s.id) : `s-${idx}`,
      nombre: (s.nombre as string) || (s.name as string) || '',
      categoria: (s.categoria as ServicioItem['categoria']) ?? 'Salud y Terapia',
      descripcion: (s.descripcion as string) ?? '',
      costo: (s.costo as string) ?? 'Gratuito',
      horario: (s.horario as string) ?? '',
      accesibilidad: Array.isArray(s.accesibilidad) ? (s.accesibilidad as string[]) : [],
      activo: s.activo !== false,
    }
  }
  return {
    id: `s-${idx}`,
    nombre: '',
    categoria: 'Salud y Terapia',
    descripcion: '',
    costo: 'Gratuito',
    horario: '',
    accesibilidad: [],
    activo: true,
  }
}

export default function ServiciosTab() {
  const { data: institution } = useMiInstitucion()
  const updateMutation = useUpdateMiInstitucion()
  const { addToast } = useUiStore()

  const [servicios, setServicios] = useState<ServicioItem[]>(() => {
    if (institution?.servicios && Array.isArray(institution.servicios) && institution.servicios.length > 0) {
      return (institution.servicios as unknown[]).map(parseServicio).filter(s => Boolean(s.nombre))
    }
    return []
  })

  useEffect(() => {
    if (institution?.servicios && Array.isArray(institution.servicios)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setServicios(
        (institution.servicios as unknown[]).map(parseServicio).filter(s => Boolean(s.nombre))
      )
    }
  }, [institution?.servicios])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServicioItem | null>(null)

  // Form state
  const [formNombre, setFormNombre] = useState('')
  const [formCategoria, setFormCategoria] = useState<ServicioItem['categoria']>('Salud y Terapia')
  const [formDescripcion, setFormDescripcion] = useState('')
  const [formCosto, setFormCosto] = useState('Gratuito')
  const [formHorario, setFormHorario] = useState('')
  const [formAccesibilidad, setFormAccesibilidad] = useState<string[]>([])

  const handleOpenAdd = () => {
    setEditingService(null)
    setFormNombre('')
    setFormCategoria('Salud y Terapia')
    setFormDescripcion('')
    setFormCosto('Gratuito')
    setFormHorario('')
    setFormAccesibilidad(['Rampa de acceso'])
    setIsModalOpen(true)
  }

  const handleOpenEdit = (servicio: ServicioItem) => {
    setEditingService(servicio)
    setFormNombre(servicio.nombre)
    setFormCategoria(servicio.categoria)
    setFormDescripcion(servicio.descripcion)
    setFormCosto(servicio.costo)
    setFormHorario(servicio.horario)
    setFormAccesibilidad(servicio.accesibilidad)
    setIsModalOpen(true)
  }

  const handleToggleAccesibilidad = (tag: string) => {
    setFormAccesibilidad(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleToggleActive = (id: string) => {
    const next = servicios.map(s => (s.id === id ? { ...s, activo: !s.activo } : s))
    setServicios(next)
    saveServicios(next)
  }

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formNombre.trim()) {
      addToast('Por favor escribe un nombre para el servicio', 'warning')
      return
    }

    let next: ServicioItem[]
    if (editingService) {
      next = servicios.map(s =>
        s.id === editingService.id
          ? {
              ...s,
              nombre: formNombre.trim(),
              categoria: formCategoria,
              descripcion: formDescripcion.trim(),
              costo: formCosto.trim(),
              horario: formHorario.trim(),
              accesibilidad: formAccesibilidad,
            }
          : s
      )
      addToast('Servicio actualizado correctamente', 'success')
    } else {
      const newService: ServicioItem = {
        id: generateServiceId(),
        nombre: formNombre.trim(),
        categoria: formCategoria,
        descripcion: formDescripcion.trim(),
        costo: formCosto.trim(),
        horario: formHorario.trim(),
        accesibilidad: formAccesibilidad,
        activo: true,
      }
      next = [newService, ...servicios]
      addToast('Nuevo servicio agregado a tu catálogo', 'success')
    }

    setServicios(next)
    saveServicios(next)
    setIsModalOpen(false)
  }

  const handleDeleteService = (id: string) => {
    const next = servicios.filter(s => s.id !== id)
    setServicios(next)
    saveServicios(next)
    addToast('Servicio eliminado', 'info')
  }

  const saveServicios = (lista: ServicioItem[]) => {
    // El backend valida que cada elemento en servicios sea string (@IsString({ each: true })).
    // Serializamos como JSON strings para preservar todos los atributos del servicio.
    const payloadServicios: string[] = lista.map(s => JSON.stringify(s))

    updateMutation.mutate(
      {
        servicios: payloadServicios,
      },
      {
        onError: (err: unknown) => {
          const apiErr = err as { response?: { data?: { message?: string | string[] } } }
          const msg = apiErr?.response?.data?.message
          const errMsg = Array.isArray(msg) ? msg.join(', ') : msg || 'Error al guardar los servicios'
          addToast(errMsg, 'error')
        },
      }
    )
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header section */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px' }}>
            Catálogo de Servicios y Programas
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0, lineHeight: 1.5, maxWidth: 600 }}>
            Publica y administra las terapias, talleres, asesorías y actividades que ofrece tu institución a la comunidad.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          {Icons.plus({ s: 18 })} Agregar servicio
        </button>
      </div>

      {/* Services List */}
      {servicios.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px dashed var(--border-color)',
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'color-mix(in oklch, var(--primary) 12%, transparent)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            {Icons.building({ s: 28 })}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0, fontFamily: 'var(--font-display)' }}>
            Aún no tienes servicios registrados
          </h3>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0, maxWidth: 440, lineHeight: 1.5 }}>
            Publica las terapias, talleres, asesorías o actividades que tu institución ofrece para que los usuarios puedan conocerlas y contactarte.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ marginTop: 8, padding: '10px 22px', fontSize: 14, fontWeight: 700, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {Icons.plus({ s: 18 })} Agregar mi primer servicio
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {servicios.map(servicio => (
          <div
            key={servicio.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              opacity: servicio.activo ? 1 : 0.6,
              transition: 'all 0.2s ease',
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 12,
                background: 'color-mix(in oklch, var(--primary) 12%, transparent)', color: 'var(--primary)',
              }}>
                {servicio.categoria}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleToggleActive(servicio.id)}
                  title={servicio.activo ? 'Desactivar servicio' : 'Activar servicio'}
                  style={{
                    background: servicio.activo ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-warm)',
                    color: servicio.activo ? '#16A34A' : 'var(--fg3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {servicio.activo ? '● Activo' : '○ Inactivo'}
                </button>
                <button
                  onClick={() => handleOpenEdit(servicio)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4 }}
                  title="Editar"
                >
                  {Icons.edit({ s: 16 })}
                </button>
                <button
                  onClick={() => handleDeleteService(servicio.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 4 }}
                  title="Eliminar"
                >
                  {Icons.trash({ s: 16 })}
                </button>
              </div>
            </div>

            {/* Title & description */}
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
                {servicio.nombre}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
                {servicio.descripcion || 'Sin descripción ingresada.'}
              </p>
            </div>

            {/* Cost & Hours */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'var(--fg3)', paddingTop: 8, borderTop: '1px dashed var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>💰</span>
                <span style={{ fontWeight: 600, color: 'var(--fg1)' }}>{servicio.costo}</span>
              </div>
              {servicio.horario && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🕒</span>
                  <span>{servicio.horario}</span>
                </div>
              )}
            </div>

            {/* Accessibility Tags */}
            {servicio.accesibilidad && servicio.accesibilidad.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                {servicio.accesibilidad.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--fg2)',
                      background: 'var(--bg-warm)', border: '1px solid var(--border-color)',
                      padding: '2px 8px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    ♿ {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Modal: Agregar / Editar servicio */}
      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="glass-card animate-scale-in"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
              padding: 28,
              borderRadius: 16,
              margin: 'auto',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                {editingService ? 'Editar Servicio' : 'Agregar Servicio o Programa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4 }}>
                {Icons.x({ s: 18 })}
              </button>
            </div>

            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>
                  Nombre del servicio *
                </label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  placeholder="ej. Terapia del habla / Taller de lectoescritura"
                  style={{ width: '100%', height: 42, padding: '0 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', fontSize: 14, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>
                    Categoría
                  </label>
                  <CustomSelect
                    value={formCategoria}
                    onChange={val => setFormCategoria(val as ServicioItem['categoria'])}
                    options={CATEGORIAS.map(cat => ({ value: cat, label: cat }))}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>
                    Modalidad / Costo
                  </label>
                  <input
                    type="text"
                    value={formCosto}
                    onChange={e => setFormCosto(e.target.value)}
                    placeholder="Gratuito / Cuota de recuperación"
                    style={{ width: '100%', height: 42, padding: '0 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>
                  Horario de atención
                </label>
                <input
                  type="text"
                  value={formHorario}
                  onChange={e => setFormHorario(e.target.value)}
                  placeholder="ej. Lunes a Viernes de 9:00 a 14:00 hrs"
                  style={{ width: '100%', height: 42, padding: '0 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', fontSize: 14, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 6 }}>
                  Descripción detallada
                </label>
                <textarea
                  rows={3}
                  value={formDescripcion}
                  onChange={e => setFormDescripcion(e.target.value)}
                  placeholder="Explica a quién va dirigido y en qué consiste..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)', fontSize: 14, outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Accessibility options */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--fg2)', marginBottom: 8 }}>
                  Accesibilidad en este servicio
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
                          padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                      >
                        {selected ? '✓ ' : '+ '}{tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action buttons */}
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
                  {editingService ? 'Guardar Cambios' : 'Agregar Servicio'}
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
