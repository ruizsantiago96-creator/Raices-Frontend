import { useState, useEffect, type FC } from 'react'
import {
  useMiRuta,
  useGenerarRutaPersonalizada,
  type MiRutaResponse,
} from '../hooks/useRutas'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons, labelStyle } from '@shared/components/shared'
import { EmptyState } from '@shared/components/EmptyState'

// ─── Tipos locales ────────────────────────────────────────────────────────

interface EntidadLocal {
  id: string | number
  nombre: string
  categoria: string
  distancia?: string
  logo_url?: string | null
  ciudad?: string
}

interface VacanteRecomendada {
  id: string | number
  titulo: string
  modalidad: string
  ciudad: string
}

interface EntidadesLocales {
  instituciones: EntidadLocal[]
  vacantes: VacanteRecomendada[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function timeAgo(dateString?: string | null): string | null {
  if (!dateString) return null
  const now = Date.now()
  const then = new Date(dateString).getTime()
  if (isNaN(then)) return null
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return 'ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  return `${Math.floor(days / 30)}mes`
}

function categoriaLabel(cat: string | undefined | null): string {
  if (!cat) return cat ?? 'General'
  if (['habla', 'motricidad', 'visual', 'auditiva', 'tea', 'cognitiva'].includes(cat)) return cat === 'tea' ? 'TEA' : cat.charAt(0).toUpperCase() + cat.slice(1)
  return cat === 'funcional' ? 'Funcional' : cat.charAt(0).toUpperCase() + cat.slice(1)
}

function EntidadCard({ entidad }: { entidad: EntidadLocal }) {
  const { addToast } = useUiStore()
  return (
    <div
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}
      onClick={() => addToast(`Abriendo ${entidad.nombre}`, 'info')}
      title="Ver institución"
    >
      <div
        style={{
          width: 46, height: 46, borderRadius: 10, flexShrink: 0,
          background: 'var(--bg-cool)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icons.compass s={22} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entidad.nombre}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-warm)', color: 'var(--fg2)' }}>
            {categoriaLabel(entidad.categoria)}
          </span>
          {entidad.distancia && <span style={{ color: 'var(--fg3)' }}>· {entidad.distancia}</span>}
        </div>
      </div>
      <Icons.arrowRight s={16} color="var(--fg3)" />
    </div>
  )
}

function VacanteCard({ vacante }: { vacante: VacanteRecomendada }) {
  const { addToast } = useUiStore()
  return (
    <div
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      onClick={() => addToast(`Explorando vacante: ${vacante.titulo}`, 'info')}
      title="Ver vacante"
    >
      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg1)', marginBottom: 6, lineHeight: 1.3 }}>
        {vacante.titulo}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(251, 133, 0, 0.12)', color: '#FB8500' }}>
          {vacante.modalidad}
        </span>          <span style={{ fontSize: 11.5, color: 'var(--fg3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icons.mapPin s={13} /> {vacante.ciudad}
        </span>
      </div>
    </div>
  )
}

// ─── Timeline de pasos ────────────────────────────────────────────────────

interface TimelineProps {
  pasos: (MiRutaResponse['pasos'])[0][]
  pasoActual: MiRutaResponse['pasoActual']
  porcentaje: number
}

function RutaTimeline({ pasos, pasoActual, porcentaje }: TimelineProps) {
  const completados = pasos.filter(p => p.completado).length
  const total = pasos.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {pasos.length === 0 ? (
        <div style={{ background: 'var(--bg-warm)', borderRadius: 10, padding: '16px 18px', color: 'var(--fg3)', fontSize: 13.5, textAlign: 'center' }}>
          Esta ruta aún no tiene pasos definidos.
        </div>
      ) : (
        pasos.map((paso, idx) => {
          const isCurrent = paso === pasoActual
          return (
            <div
              key={paso.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr',
                gap: 12,
                alignItems: 'start',
                padding: '12px 14px',
                background: paso.completado ? 'color-mix(in oklch, var(--primary) 4%, var(--bg-surface))' : isCurrent ? 'var(--bg-warm)' : 'var(--bg-surface)',
                border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: 10,
                transition: 'background 0.2s',
                cursor: 'default',
              }}
            >
              {/* Nodo */}
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 2,
                  background: paso.completado ? 'var(--primary)' : isCurrent ? 'var(--primary)' : 'var(--bg-warm)',
                  border: '2px solid var(--primary)',
                  color: paso.completado || isCurrent ? '#fff' : 'var(--fg2)',
                }}
              >
                {paso.completado ? <Icons.check s={18} /> : idx + 1}
              </div>

              {/* Contenido */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', marginBottom: 2, lineHeight: 1.35 }}>
                  {paso.titulo}
                </div>
                {paso.descripcion && (
                  <div style={{ fontSize: 13, color: 'var(--fg2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {paso.descripcion}
                  </div>
                )}
                {isCurrent && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--primary)', color: '#fff' }}>
                      Paso actual
                    </span>
{paso.categoria ? <span style={{ fontSize: 11, color: 'var(--fg3)' }}>· {categoriaLabel(paso.categoria as string | undefined | null)}</span> : null}
                  </div>
                )}
                {paso.completado && paso.fechaCompletado && (
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--fg3)' }}>
                    Completado {timeAgo(paso.fechaCompletado)} · {categoriaLabel(paso.categoria as string | undefined | null)}
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── Vista principal ───────────────────────────────────────────────────────

const ORIGIN_LABELS: Record<string, string> = {
  experto: 'Basada en plantillas expertas (Día Cero)',
  comunidad: 'Enriquecida con la comunidad',
  ia: 'Generada con Inteligencia Artificial',
}

export default function MisRutasPage(): JSX.Element {
  const { addToast } = useUiStore()
  const { data: miRuta, isLoading: loadingMiRuta, refetch: refetchMiRuta } = useMiRuta()
  const generar = useGenerarRutaPersonalizada()

  const [generando, setGenerando] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // ── Inicialización: si no hay ruta activa → generar una (Día Cero) ──────
  useEffect(() => {
    if (initialized || !miRuta) return
    setInitialized(true)

    if (!miRuta.ruta) {
      // No tiene ruta activa: disparar generación personalizada
      (async () => {
        try {
          setGenerando(true)
          await generar.mutateAsync(undefined as unknown as void)
        } catch (err: unknown) {
          addToast('No se pudo generar tu ruta automáticamente', 'error')
        } finally {
          setGenerando(false)
        }
      })()
    }
  }, [initialized, miRuta, generar, addToast])

  const ruta = miRuta?.ruta ?? null
  const pasos = miRuta?.pasos ?? []
  const pasoActual = miRuta?.pasoActual ?? null
  const entidades = miRuta?.entidadesLocales as EntidadesLocales | undefined
  const porcentaje = ruta ? (Number(ruta.porcentajeProgreso) || 0) : 0

  // Estado de generación pendiente (cuando no hay ruta y está siendo creada)
  const showEmptyState = !loadingMiRuta && !miRuta?.ruta && !generando && initialized

  return (
    <main className="responsive-main" style={{ '--main-max-width': '900px' } as any}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 20px 64px' }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
            Mis Rutas de Desarrollo
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '6px 0 0' }}>
            Tu camino personalizado paso a paso, con apoyo local para avanzar en cada hito.
          </p>
        </div>

        {/* ── Cargando ── */}
        {loadingMiRuta && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, height: 120, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        )}

        {/* ── Estado vacío (sin ruta y sin generación en curso) ── */}
        {showEmptyState && (
          <EmptyState
            icon={<Icons.compass s={36} />}
            title="No tienes una ruta activa"
            description="Generaremos automáticamente tu primera ruta de desarrollo basada en tus intereses y etapa de vida. Este proceso toma unos segundos."
            action={
              generando ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg3)', fontSize: 14 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Generando tu ruta...
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      setGenerando(true)
                      await generar.mutateAsync(undefined as unknown as void)
                      addToast('Ruta generada correctamente', 'success')
                    } catch {
                      addToast('Error al generar la ruta', 'error')
                    } finally {
                      setGenerando(false)
                    }
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 20px' }}
                  disabled={generando}
                >
                  {generando ? 'Generando...' : 'Generar mi ruta ahora'}
                </button>
              )
            }

          />
        )}

        {/* ── Ruta activa ── */}
        {miRuta?.ruta && ruta && (
          <>
            {/* Encabezado de la ruta */}
            <div
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 14,
                padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        padding: '3px 10px', borderRadius: 6,
                        background: ruta.estado === 'activa' ? 'rgba(1, 173, 255, 0.12)' : 'var(--bg-warm)',
                        color: ruta.estado === 'activa' ? '#01ADFF' : 'var(--fg2)',
                      }}
                    >
                      ● {ruta.estado}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--fg3)' }}>
                      {categoriaLabel(ruta.areaInteres as string | undefined | null)} · {categoriaLabel(ruta.origen as string | undefined | null)}
                    </span>
                    {ruta.origen && ORIGIN_LABELS[ruta.origen as string] ? (
                      <span style={{ fontSize: 11.5, color: 'var(--fg3)', fontStyle: 'italic' }}>
                        {" "}{ORIGIN_LABELS[ruta.origen as string]}
                      </span>
                    ) : null}
                  </div>

                  <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                    {ruta.nombre}
                  </h2>
                  {ruta.descripcion && (
                    <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '8px 0 0', lineHeight: 1.5 }}>
                      {ruta.descripcion}
                    </p>
                  )}
                </div>

                {/* KPI mini */}
                <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progreso</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                      {porcentaje}%
                    </div>
                  </div>
                  <div style={{ width: 1, height: 40, background: 'var(--border-color)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pasos</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--fg1)', marginTop: 2 }}>
                      {pasos.filter(p => p.completado).length} / {pasos.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div style={{ marginTop: 20, height: 10, background: 'var(--border-color)', borderRadius: 5, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%', width: `${porcentaje}%`,
                    background: 'var(--primary)',
                    borderRadius: 5,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>

              {ruta.metaFinal && (
                <div style={{ marginTop: 14, fontSize: 13.5, color: 'var(--fg2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.target s={16} color="var(--fg3)" /> <strong>Meta final:</strong> {ruta.metaFinal}
              </div>
              )}
            </div>

            {/* ── Timeline de pasos ── */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                  Pasos de la ruta
                </h3>
                <span style={{ fontSize: 12, color: 'var(--fg3)' }}>
                  {pasos.filter(p => p.completado).length} completados de {pasos.length}
                </span>
              </div>
              <RutaTimeline pasos={pasos} pasoActual={pasoActual} porcentaje={porcentaje} />
            </section>

            {/* ── Entidades locales recomendadas ── */}
            {entidades && (entidades.instituciones.length > 0 || entidades.vacantes.length > 0) && (
              <section style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                    Recomendaciones para este paso
                  </h3>
                  {pasoActual && (
                    <span style={{ fontSize: 12, color: 'var(--fg3)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Paso actual: {pasoActual.titulo}
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Instituciones */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                      Instituciones cercanas
                    </div>
                    {entidades.instituciones.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--fg3)', fontStyle: 'italic', padding: '10px 0' }}>
                        No hay instituciones recomendadas para tu zona en este paso.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {entidades.instituciones.map(ent => (
                          <EntidadCard key={`inst-${ent.id}`} entidad={ent} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vacantes */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                      Oportunidades laborales
                    </div>
                    {entidades.vacantes.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--fg3)', fontStyle: 'italic', padding: '10px 0' }}>
                        No hay vacantes recomendadas para este paso.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                        {entidades.vacantes.map(vac => (
                          <VacanteCard key={`vac-${vac.id}`} vacante={vac} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── Footer de acciones rápidas ── */}
            {pasoActual && (
              <div
                style={{
                  background: 'var(--primary-subtle)', border: '1px solid var(--primary)', borderRadius: 12,
                  padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: 13.5, color: 'var(--fg1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.lightbulb s={18} color="var(--primary)" />
                  <span>
                    Te recomendamos explorar las instituciones y oportunidades de arriba para avanzar en:{' '}
                    <strong>{pasoActual.titulo}</strong>
                  </span>
                </div>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: 13.5 }}
                  onClick={() => addToast('Explorando recomendaciones...', 'info')}
                >
                  Explorar ahora <Icons.arrowRight s={15} /> </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
