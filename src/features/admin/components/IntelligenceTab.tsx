import { Icons } from '@shared/components/shared'
import { useNeedsIntelligence } from '../hooks/useAdmin'
import { Card, SectionTitle, Skeleton, EmptyState } from './AdminUI'
import type { CoberturaDiscapacidadItem, PercepcionInteligencia } from '@/types/admin'

const ESTADO_COBERTURA_META: Record<string, { label: string; color: string; bg: string }> = {
  critica: { label: 'Crítica', color: 'var(--color-error)', bg: 'color-mix(in oklch, var(--color-error) 12%, transparent)' },
  media: { label: 'Media', color: 'var(--color-empleo)', bg: 'color-mix(in oklch, var(--color-empleo) 14%, transparent)' },
  adecuada: { label: 'Adecuada', color: 'var(--color-comunidad)', bg: 'color-mix(in oklch, var(--color-comunidad) 14%, transparent)' },
  sin_demanda: { label: 'Sin demanda', color: 'var(--fg3)', bg: 'color-mix(in oklch, var(--fg3) 10%, transparent)' },
}

const SEVERIDAD_PERCEPCION: Record<string, { color: string; bg: string; icon: (p?: { s?: number; color?: string }) => React.ReactNode }> = {
  alta: { color: 'var(--color-error)', bg: 'color-mix(in oklch, var(--color-error) 10%, transparent)', icon: Icons.shieldAlert },
  media: { color: 'var(--color-empleo)', bg: 'color-mix(in oklch, var(--color-empleo) 12%, transparent)', icon: Icons.target },
  info: { color: 'var(--color-comunidad)', bg: 'color-mix(in oklch, var(--color-comunidad) 12%, transparent)', icon: Icons.sparkles },
}

export interface IntelligenceTabProps {
  onNavigate?: (tab: string) => void
}

export default function IntelligenceTab({ onNavigate }: IntelligenceTabProps = {}) {
  const { data, isLoading } = useNeedsIntelligence()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card><Skeleton h={100} /></Card>
        <Card><Skeleton h={220} /></Card>
        <Card><Skeleton h={200} /></Card>
      </div>
    )
  }

  if (!data) return <EmptyState icon={Icons.brain({ s: 32 })} title="Sin datos de inteligencia" />

  const totalProfiles = data.totalPerfiles ?? data.total_profiles ?? 0
  const totalInstitutions = data.totalInstituciones ?? data.total_institutions ?? 0
  const coberturaList: CoberturaDiscapacidadItem[] = data.cobertura ?? []
  const percepcionesList: PercepcionInteligencia[] = data.percepciones ?? []
  const necesidadesList = data.demanda?.necesidades ?? []
  const metasList = data.demanda?.metas ?? []

  const brechasCriticas = coberturaList.filter(c => c.estado === 'critica').length
  const maxDemanda = Math.max(1, ...coberturaList.map(c => c.demanda))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── Métricas Resumen ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'color-mix(in oklch, var(--primary) 14%, transparent)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Icons.users({ s: 22 })}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>Perfiles PCD Analizados</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg1)', marginTop: 2 }}>{totalProfiles}</div>
          </div>
        </Card>

        <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'color-mix(in oklch, var(--color-empleo) 14%, transparent)', color: 'var(--color-empleo)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Icons.building({ s: 22 })}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>Instituciones Activas</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg1)', marginTop: 2 }}>{totalInstitutions}</div>
          </div>
        </Card>

        <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: brechasCriticas > 0 ? 'color-mix(in oklch, var(--color-error) 14%, transparent)' : 'color-mix(in oklch, var(--color-comunidad) 14%, transparent)', color: brechasCriticas > 0 ? 'var(--color-error)' : 'var(--color-comunidad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {brechasCriticas > 0 ? Icons.shieldAlert({ s: 22 }) : Icons.check({ s: 22 })}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--fg3)', fontWeight: 600 }}>Brechas Críticas</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: brechasCriticas > 0 ? 'var(--color-error)' : 'var(--color-comunidad)', marginTop: 2 }}>
              {brechasCriticas} {brechasCriticas === 1 ? 'área' : 'áreas'}
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Análisis y Percepciones del Sistema ─── */}
      <Card>
        <SectionTitle icon={Icons.brain({ s: 18 })}>Análisis y Hallazgos del Sistema</SectionTitle>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: '0 0 18px' }}>
          Basado en los perfiles de <strong>{totalProfiles} usuarios</strong> y <strong>{totalInstitutions} instituciones</strong>, el motor de inteligencia detectó los siguientes hallazgos automáticos:
        </p>

        {/* Guía de resolución rápida */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: 'color-mix(in oklch, var(--primary) 8%, transparent)',
            border: '1px solid color-mix(in oklch, var(--primary) 20%, transparent)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }}>
            {Icons.sparkles({ s: 18 })}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg1)', lineHeight: 1.5 }}>
            <strong>¿Cómo resolver las alertas de cobertura y necesidades?</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--fg2)' }}>
              Para cerrar brechas críticas de atención, usa las acciones directas en cada hallazgo para verificar centros existentes o invitar instituciones especializadas a la plataforma.
            </p>
          </div>
        </div>

        {percepcionesList.length === 0 ? (
          <div style={{ padding: '16px', borderRadius: 10, background: 'var(--bg-canvas)', color: 'var(--fg3)', fontSize: 13, textAlign: 'center' }}>
            No se han generado hallazgos críticos aún. Se requiere mayor actividad de perfiles completados.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {percepcionesList.map((p, idx) => {
              const meta = SEVERIDAD_PERCEPCION[p.severidad] ?? SEVERIDAD_PERCEPCION.info
              const isBrecha = p.tipo === 'brecha_cobertura'
              const isConfianza = p.tipo === 'confianza'
              const isDatosIncompletos = p.tipo === 'datos_incompletos'

              return (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: meta.bg,
                    borderLeft: `4px solid ${meta.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
                    <div style={{ color: meta.color, flexShrink: 0 }}>
                      {meta.icon({ s: 20 })}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg1)', lineHeight: 1.5, fontWeight: 500 }}>
                      {p.texto}
                    </div>
                  </div>

                  {onNavigate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {isBrecha && (
                        <>
                          <button
                            type="button"
                            onClick={() => onNavigate('institutions')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: `1px solid ${meta.color}`,
                              background: 'var(--bg-surface)',
                              color: meta.color,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontFamily: 'var(--font-body)',
                            }}
                          >
                            {Icons.building({ s: 13 })} Resolver: Gestionar Instituciones
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate('alerts')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: '1px solid var(--border-color)',
                              background: 'var(--bg-surface)',
                              color: 'var(--fg2)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontFamily: 'var(--font-body)',
                            }}
                          >
                            {Icons.shieldAlert({ s: 13 })} Ver en Alertas
                          </button>
                        </>
                      )}
                      {isConfianza && (
                        <button
                          type="button"
                          onClick={() => onNavigate('institutions')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: `1px solid ${meta.color}`,
                            background: 'var(--bg-surface)',
                            color: meta.color,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {Icons.check({ s: 13 })} Resolver: Verificar Instituciones
                        </button>
                      )}
                      {isDatosIncompletos && (
                        <button
                          type="button"
                          onClick={() => onNavigate('users')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-surface)',
                            color: 'var(--fg1)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {Icons.users({ s: 13 })} Ver Usuarios
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* ─── Brechas de Cobertura (Demanda vs Oferta) ─── */}
      <Card>
        <SectionTitle icon={Icons.target({ s: 18 })}>Brechas de Cobertura (Demanda vs. Oferta)</SectionTitle>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: '0 0 20px' }}>
          Cruza la demanda (usuarios que requieren atención) contra la oferta (instituciones activas que atienden cada tipo de discapacidad):
        </p>

        {coberturaList.length === 0 ? (
          <div style={{ padding: '24px', borderRadius: 10, background: 'var(--bg-canvas)', color: 'var(--fg3)', fontSize: 13, textAlign: 'center' }}>
            No hay datos de cobertura registrados todavía.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {coberturaList.map((item) => {
              const estadoMeta = ESTADO_COBERTURA_META[item.estado] ?? ESTADO_COBERTURA_META.sin_demanda
              const pctDemanda = Math.min(100, Math.round((item.demanda / maxDemanda) * 100))

              return (
                <div
                  key={item.tipo}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-canvas)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{item.etiqueta}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          color: estadoMeta.color,
                          background: estadoMeta.bg,
                        }}
                      >
                        {estadoMeta.label}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--fg2)' }}>
                      <strong>{item.demanda}</strong> demanda vs <strong>{item.oferta}</strong> instituciones
                      {item.relacion !== null && (
                        <span style={{ fontSize: 11, color: 'var(--fg3)', marginLeft: 6 }}>
                          (ratio: {item.relacion}x)
                        </span>
                      )}
                      {item.estado === 'critica' && onNavigate && (
                        <button
                          type="button"
                          onClick={() => onNavigate('institutions')}
                          style={{
                            marginLeft: 10,
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1px solid var(--color-error)',
                            background: 'color-mix(in oklch, var(--color-error) 10%, transparent)',
                            color: 'var(--color-error)',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {Icons.building({ s: 11 })} Gestionar instituciones
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Barra de Demanda Visual */}
                  <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--border-color)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pctDemanda}%`,
                        height: '100%',
                        borderRadius: 4,
                        background: estadoMeta.color,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* ─── Top Necesidades y Metas Más Demandadas ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <Card>
          <SectionTitle icon={Icons.star({ s: 18 })}>Top Necesidades Más Comunes</SectionTitle>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 16px' }}>
            Necesidades concretas reportadas en los perfiles extendidos:
          </p>

          {necesidadesList.length === 0 ? (
            <div style={{ padding: '20px', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--fg3)', fontSize: 13, textAlign: 'center' }}>
              Sin necesidades registradas aún.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {necesidadesList.slice(0, 5).map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', width: 20 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg1)' }}>{n.necesidad}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'color-mix(in oklch, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                    {n.cantidad} {n.cantidad === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle icon={Icons.target({ s: 18 })}>Top Metas de los Usuarios</SectionTitle>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '0 0 16px' }}>
            Objetivos personales declarados (laborales, educativos, sociales):
          </p>

          {metasList.length === 0 ? (
            <div style={{ padding: '20px', borderRadius: 8, background: 'var(--bg-canvas)', color: 'var(--fg3)', fontSize: 13, textAlign: 'center' }}>
              Sin metas registradas aún.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {metasList.slice(0, 5).map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-empleo)', width: 20 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg1)' }}>{m.meta}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'color-mix(in oklch, var(--color-empleo) 12%, transparent)', color: 'var(--color-empleo)' }}>
                    {m.cantidad} {m.cantidad === 1 ? 'usuario' : 'usuarios'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
