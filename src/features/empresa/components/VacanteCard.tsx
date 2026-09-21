import { Icons } from '@shared/components/shared'

/**
 * Modelo de vista de una vacante publicada por la empresa.
 * (Mientras el backend expone su endpoint propio, la capa de datos
 * vive en EmpresaDashboard; este tipo describe la tarjeta.)
 */
export interface VacanteItem {
  id: string
  /** Nombre del puesto, ej. "Desarrollador Frontend" */
  puesto: string
  /** Área del puesto, ej. "Tecnología", "Recursos Humanos" */
  area: string
  /** Breve resumen de las responsabilidades */
  descripcion: string
  /** Modalidad de trabajo, ej. "Home Office", "Híbrido" */
  modalidad: string
  /** Tipo de jornada, ej. "Tiempo Completo" */
  jornada: string
  /** Requerimientos de accesibilidad del puesto (pills inferiores) */
  accesibilidad: string[]
  /** Estado de publicación de la vacante */
  activo: boolean
  /** Número de personas postuladas (opcional) */
  postulantes?: number
}

export interface VacanteCardProps {
  vacante: VacanteItem
  onEdit?: (vacante: VacanteItem) => void
  onDelete?: (id: string) => void
  onToggleStatus?: (id: string) => void
  onViewPostulantes?: (vacante: VacanteItem) => void
}

/**
 * VacanteCard — adapta el diseño de las tarjetas de servicios del portal
 * de institución al modelo de negocio de bolsa de trabajo:
 *  - Tag superior: Área del puesto.
 *  - Etiqueta de estado "● Activo" + iconos de editar/eliminar.
 *  - Título grande con el nombre del puesto y descripción breve.
 *  - Metadatos centrales: Modalidad y Tipo de jornada (antes Cuota/Horarios).
 *  - Pills inferiores: requerimientos de accesibilidad del puesto.
 */
export default function VacanteCard({
  vacante,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewPostulantes,
}: VacanteCardProps) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: vacante.activo ? 1 : 0.6,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header row: tag de área + estado + acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <span
          style={{
            fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 12,
            background: 'color-mix(in oklch, var(--primary) 12%, transparent)', color: 'var(--primary)',
          }}
        >
          {vacante.area}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => onToggleStatus?.(vacante.id)}
            title={vacante.activo ? 'Pausar vacante' : 'Activar vacante'}
            style={{
              background: vacante.activo ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-warm)',
              color: vacante.activo ? '#16A34A' : 'var(--fg3)',
              border: '1px solid var(--border-color)',
              borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {vacante.activo ? '● Activo' : '○ Pausada'}
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(vacante)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', padding: 4 }}
              title="Editar vacante"
              aria-label={`Editar vacante ${vacante.puesto}`}
            >
              {Icons.edit({ s: 16 })}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(vacante.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 4 }}
              title="Eliminar vacante"
              aria-label={`Eliminar vacante ${vacante.puesto}`}
            >
              {Icons.trash({ s: 16 })}
            </button>
          )}
        </div>
      </div>

      {/* Título del puesto y descripción */}
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
          {vacante.puesto}
        </h3>
        <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>
          {vacante.descripcion || 'Sin descripción ingresada.'}
        </p>
      </div>

      {/* Metadatos centrales: Modalidad · Jornada · Postulantes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'var(--fg3)', paddingTop: 8, borderTop: '1px dashed var(--border-color)' }}>
        {vacante.modalidad && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden>🏠</span>
            <span style={{ fontWeight: 600, color: 'var(--fg1)' }}>{vacante.modalidad}</span>
          </div>
        )}
        {vacante.jornada && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden>🕒</span>
            <span>{vacante.jornada}</span>
          </div>
        )}
        {typeof vacante.postulantes === 'number' && vacante.postulantes > 0 && (
          <button
            type="button"
            onClick={() => onViewPostulantes?.(vacante)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
              padding: 0, cursor: 'pointer', fontSize: 13, color: 'var(--fg3)',
              fontFamily: 'var(--font-body)',
            }}
            title="Ver postulantes"
          >
            <span aria-hidden>👥</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
              {vacante.postulantes} {vacante.postulantes === 1 ? 'postulante' : 'postulantes'}
            </span>
          </button>
        )}
      </div>

      {/* Pills de accesibilidad del puesto */}
      {vacante.accesibilidad && vacante.accesibilidad.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
          {vacante.accesibilidad.map((tag, i) => (
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
  )
}
