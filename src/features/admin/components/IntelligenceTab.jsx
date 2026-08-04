import { Icons } from '@shared/components/shared'
import { useNeedsIntelligence } from '../hooks/useAdmin'
import { Card, SectionTitle, Skeleton, EmptyState, HBar } from './AdminUI'

export default function IntelligenceTab() {
  const { data, isLoading } = useNeedsIntelligence()

  if (isLoading) return <Card><Skeleton h={200} /></Card>
  if (!data) return <EmptyState icon={Icons.brain({ s: 32 })} title="Sin datos de inteligencia" />

  const needs = data.necesidades ?? data.needs ?? data ?? []
  const categories = data.categorias ?? data.categories ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Resumen de necesidades */}
      <Card>
        <SectionTitle icon={Icons.brain({ s: 18 })}>Análisis de Necesidades</SectionTitle>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: '0 0 20px' }}>
          Basado en los perfiles de {data.total_profiles ?? 0} usuarios, se detectaron las siguientes necesidades principales.
        </p>

        {categories.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.map((cat, idx) => (
              <HBar key={idx} label={cat.name ?? cat.nombre ?? `Categoría ${idx + 1}`} value={cat.count ?? cat.cantidad ?? 0} max={Math.max(...categories.map(c => c.count ?? c.cantidad ?? 0))} />
            ))}
          </div>
        )}
      </Card>

      {/* Brechas de cobertura */}
      {data.gaps && data.gaps.length > 0 && (
        <Card>
          <SectionTitle icon={Icons.target({ s: 18 })}>Brechas de Cobertura</SectionTitle>
          <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: '0 0 20px' }}>
            Cruza la <b>demanda</b> (perfiles de {data.total_profiles ?? 0} usuarios) contra la <b>oferta</b> ({data.total_institutions ?? 0} instituciones) para detectar brechas de cobertura.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.gaps.map((gap, idx) => (
              <div key={idx} style={{ padding: 16, background: 'var(--bg-cool)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'color-mix(in oklch, var(--color-empleo) 14%, transparent)', color: 'var(--color-empleo)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {Icons.alertTriangle({ s: 18 })}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{gap.needs ?? gap.necesidad ?? 'Necesidad'}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2 }}>{gap.gap ?? gap.brecha ?? 0} instituciones faltantes</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top necesidades */}
      {data.top_needs && data.top_needs.length > 0 && (
        <Card>
          <SectionTitle icon={Icons.star({ s: 18 })}>Top 5 Necesidades Más Comunes</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.top_needs.slice(0, 5).map((need, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: idx % 2 === 0 ? 'var(--bg-cool)' : 'transparent', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', width: 24 }}>{idx + 1}</span>
                <span style={{ fontSize: 14, color: 'var(--fg1)', flex: 1 }}>{need.name ?? need.nombre ?? need}</span>
                <span style={{ fontSize: 13, color: 'var(--fg3)', fontWeight: 600 }}>{need.count ?? need.cantidad ?? 0} usuarios</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
