import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import { useMe } from '@features/auth'
import { EMPRESA_HOME } from '@features/auth/lib/empresaRole'
import { useMyJobPostings } from '@features/institutions/hooks/useInstitutionJobs'
import type { Job } from '@/types/jobs'

/**
 * VacantesPublicasPage — Vista previa de perfil público de una empresa.
 * ================================================================
 * Superficie de SOLO LECTURA: muestra las vacantes activas de la empresa tal
 * como las vería un postulante que la encuentra en la app.
 *
 * Por qué no basta con mandar a `/instituciones` (que es lo que hace el botón
 * homónimo del portal de institución): el backend excluye deliberadamente a las
 * empresas del directorio público (`institutions.service.ts`,
 * `filas.filter(f => f.tipo !== 'empresa')`), así que la empresa no se vería
 * listada. Esta ruta cubre ese hueco sin tocar el directorio público.
 *
 * El sidebar es el de la app, no el del panel: MainLayout excluye esta ruta del
 * modo `empresa` (`esVistaPreviaEmpresa`) y dibuja el sidebar estándar. Por eso
 * esta página necesita su propio "Volver al panel".
 *
 * Vive bajo `/empresa` (EMPRESA_VISTA_PREVIA), que no está en
 * RUTAS_BLOQUEADAS_EMPRESA, así que ProtectedRoute no expulsa a la persona moral.
 */

/** Convierte una vacante del backend en una fila de la vista pública. */
function toPublicVacante(job: Job) {
  return {
    id: String(job.id ?? ''),
    puesto: job.title ?? job.titulo ?? '',
    descripcion: job.description ?? job.descripcion ?? '',
    modalidad: job.modality ?? job.modalidad ?? '',
    jornada: job.schedule ?? job.horario ?? '',
    ciudad: job.city ?? job.ciudad ?? '',
    rangoSalario: job.salary_range ?? job.rangoSalario ?? '',
    accesibilidad: Array.isArray(job.disability_types)
      ? job.disability_types
      : Array.isArray(job.tiposDiscapacidad) ? job.tiposDiscapacidad : [],
  }
}

export default function VacantesPublicasPage() {
  const navigate = useNavigate()
  const addToast = useUiStore(s => s.addToast)
  const [search, setSearch] = useState('')
  const { data: me } = useMe()
  const { data: jobs = [], isLoading } = useMyJobPostings()

  // Un visitante solo ve lo publicado: las pausadas no existen para él.
  const activas = useMemo(() => jobs.filter(j => (j.is_active ?? j.activa ?? true)), [jobs])

  // Búsqueda por texto sobre lo que el visitante puede ver (no sobre el array
  // completo): los pausados nunca entran en el índice de búsqueda.
  const visibles = useMemo(() => {
    const term = search.trim().toLowerCase()
    const base = activas.map(toPublicVacante)
    if (!term) return base
    return base.filter(v =>
      v.puesto.toLowerCase().includes(term) ||
      (v.ciudad ?? '').toLowerCase().includes(term),
    )
  }, [activas, search])

  const irAlPanel = () => navigate(EMPRESA_HOME)

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '1100px' } as Record<string, string>}>
      {/* Barra de contexto: deja claro que esto es una vista de solo lectura y
          ofrece el regreso al panel, que aquí no está en el sidebar. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        padding: '14px 18px', marginBottom: 24, borderRadius: 12,
        border: '1.5px solid var(--border-color)', background: 'var(--bg-surface)',
      }}>
        <span aria-hidden style={{ color: 'var(--primary)', display: 'flex' }}>{Icons.eye({ s: 18 })}</span>
        <span style={{ flex: 1, minWidth: 200, fontSize: 13.5, color: 'var(--fg2)', lineHeight: 1.5 }}>
          Estás viendo tu perfil público como lo ve un postulante. No puedes editarlo desde aquí.
        </span>
        <button
          type="button"
          onClick={irAlPanel}
          className="btn-secondary"
          style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          {Icons.arrowLeft({ s: 16 })} Volver al panel
        </button>
      </div>

      {/* Identidad de la empresa */}
      <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>
          {me?.full_name ?? 'Mi empresa'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0' }}>
          {isLoading ? 'Cargando tus vacantes publicadas...' : `${visibles.length} ${visibles.length === 1 ? 'vacante publicada' : 'vacantes publicadas'}`}
        </p>
      </div>

      {/* Buscador (mismo control que el catálogo público) */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)', pointerEvents: 'none', display: 'flex' }}>
            {Icons.search({ s: 18 })}
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar puesto o ciudad..."
            aria-label="Buscar vacantes publicadas"
            style={{
              width: '100%', height: 48, paddingLeft: 48, paddingRight: 16,
              border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)', fontSize: 15,
              background: 'var(--bg-surface)', color: 'var(--fg1)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Listado */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 14, padding: 20 }}>
              <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'var(--bg-cool)', marginBottom: 12 }} />
              <div style={{ height: 12, width: '90%', borderRadius: 6, background: 'var(--bg-cool)', marginBottom: 8 }} />
              <div style={{ height: 12, width: '45%', borderRadius: 6, background: 'var(--bg-cool)' }} />
            </div>
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {Icons.briefcase({ s: 24 })}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
            {search.trim() ? 'Ninguna vacante coincide con tu búsqueda' : 'Todavía no tienes vacantes publicadas'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '0 0 24px' }}>
            {search.trim()
              ? 'Prueba con otros términos o limpia el buscador.'
              : 'Un postulante solo ve lo que está activo: publica tu primera vacante desde el panel.'}
          </p>
          {!search.trim() && (
            <button
              type="button"
              onClick={() => {
                addToast('Publica una vacante activa para que aparezca en tu perfil público.', 'info')
                irAlPanel()
              }}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: 15, fontWeight: 600, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {Icons.plus({ s: 18 })} Ir a la Bolsa de Trabajo
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {visibles.map(v => (
            <div
              key={v.id}
              style={{
                background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)',
                borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg1)', margin: 0, fontFamily: 'var(--font-display)' }}>
                {v.puesto}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: 0, lineHeight: 1.5, flex: 1 }}>
                {v.descripcion ? `${v.descripcion.slice(0, 110)}${v.descripcion.length > 110 ? '...' : ''}` : 'Sin descripción ingresada.'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: 'var(--fg3)', paddingTop: 8, borderTop: '1px dashed var(--border-color)' }}>
                {v.modalidad && <span>{v.modalidad}</span>}
                {v.jornada && <span>{v.jornada}</span>}
                {v.ciudad && <span>{v.ciudad}</span>}
                {v.rangoSalario && <span>{v.rangoSalario}</span>}
              </div>
              {v.accesibilidad.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {v.accesibilidad.map((tag, i) => (
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
    </main>
  )
}
