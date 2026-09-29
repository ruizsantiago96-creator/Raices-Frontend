import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@shared/components/shared'
import { useUiStore } from '@shared/stores/uiStore'
import { useMyJobPostings } from '@features/institutions/hooks/useInstitutionJobs'
import type { Job } from '@/types/jobs'

/**
 * VacantesPublicasPage — Vista previa pública de las vacantes de la empresa.
 * ===========================================================================
 * Es la "vista previa de perfil público" de una empresa (persona moral): una
 * superficie de solo lectura fuera del portal, donde se listan las vacantes
 * activas tal como las vería un candidato.
 *
 * Se navega desde el botón "Vista Previa de Perfil Público" del
 * EmpresaDashboard. Vive bajo RUTAS_EMPRESA para que ProtectedRoute no
 * expulse la cuenta al panel de usuario estándar (bug histórico de /explore).
 */

export default function VacantesPublicasPage() {
  const navigate = useNavigate()
  const { addToast } = useUiStore()
  const [query, setQuery] = useState('')

  // Las vacantes de la empresa autenticada (incluye pausadas; aquí se filtran
  // las activas para simular lo que vería un visitante).
  const { data: jobs = [], isLoading } = useMyJobPostings()
  const vacantes = (jobs as Job[]).filter(j => j.is_active ?? j.activa ?? true)

  const visibles = query.trim()
    ? vacantes.filter(j =>
        (j.title ?? j.titulo ?? '').toLowerCase().includes(query.trim().toLowerCase()) ||
        (j.city ?? '').toLowerCase().includes(query.trim().toLowerCase()))
    : vacantes

  return (
    <main className="responsive-main" style={{ '--main-max-width': '900px' } as React.CSSProperties}>
      {/* ── Header ── */}
      <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', margin: 0, letterSpacing: '-0.02em' }}>
            Oportunidades de mi empresa
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0' }}>
            Así se muestran tus vacantes activas al público. Esta es una vista de solo lectura.
          </p>
        </div>
        <button
          onClick={() => navigate('/empresa/dashboard')}
          style={{
            padding: '10px 18px', borderRadius: 10, border: '1.5px solid var(--border-color)',
            background: 'var(--bg-surface)', color: 'var(--primary)', fontSize: 13.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: 'var(--shadow-xs)', transition: 'all 0.15s ease',
          }}
        >
          {Icons.arrowRight({ s: 16 })} Volver al panel
        </button>
      </div>

      {/* ── Buscador (controlado correcto) ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)', pointerEvents: 'none', display: 'flex' }}>
            {Icons.search({ s: 18 })}
          </span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por puesto o ciudad..."
            aria-label="Buscar vacantes"
            style={{ width: '100%', height: 48, paddingLeft: 48, paddingRight: 16, border: '1px solid var(--border-color)', borderRadius: 9999, fontFamily: 'var(--font-body)', fontSize: 15, background: 'var(--bg-surface)', color: 'var(--fg1)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* ── Listado ── */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: '60%', height: 18, borderRadius: 6, background: 'var(--bg-cool)' }} />
              <div style={{ width: '90%', height: 12, borderRadius: 6, background: 'var(--bg-cool)' }} />
              <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'var(--bg-cool)' }} />
            </div>
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {Icons.briefcase({ s: 24 })}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 8px' }}>
            {query ? 'Sin resultados' : 'Aún no tienes vacantes activas'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: 0 }}>
            {query ? 'Prueba con otros términos de búsqueda.' : 'Publica tu primera vacante desde la Bolsa de Trabajo del panel.'}
          </p>
          {!query && (
            <button
              onClick={() => { addToast('Publica vacantes desde la Bolsa de Trabajo del panel.', 'info'); navigate('/empresa/dashboard') }}
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: 14, fontWeight: 700, borderRadius: 10, marginTop: 16 }}
            >
              Ir a la Bolsa de Trabajo
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibles.map(job => (
            <div key={job.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50% 50% 50% 14%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {Icons.briefcase({ s: 20 })}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--fg1)' }}>{job.title ?? job.titulo}</span>
                  {(job.modality ?? job.modalidad) && (
                    <span style={{ fontSize: 11.5, padding: '2px 10px', borderRadius: 9999, background: 'var(--bg-cool)', color: 'var(--fg3)', fontWeight: 600 }}>
                      {String(job.modality ?? job.modalidad)}
                    </span>
                  )}
                </div>
                {(job.description ?? job.descripcion) && (
                  <p style={{ fontSize: 13.5, color: 'var(--fg2)', margin: '6px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {String(job.description ?? job.descripcion)}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5, color: 'var(--fg3)', marginTop: 8 }}>
                  {(job.city ?? '') && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.mapPin({ s: 13 })} {String(job.city)}</span>}
                  {(job.schedule ?? job.horario) && <span>{String(job.schedule ?? job.horario)}</span>}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#229B58', background: 'rgba(34,155,88,0.08)', padding: '6px 12px', borderRadius: 9999, whiteSpace: 'nowrap' }}>
                Activa
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
