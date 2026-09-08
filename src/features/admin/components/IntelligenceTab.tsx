import { Icons } from '@shared/components/shared'
import { useNeedsIntelligence } from '../hooks/useAdmin'
import { Card, SectionTitle, Skeleton, EmptyState } from './AdminUI'

export default function IntelligenceTab() {
  const { data, isLoading } = useNeedsIntelligence()

  if (isLoading) return <Card><Skeleton h={200} /></Card>
  if (!data) return <EmptyState icon={Icons.brain({ s: 32 })} title="Sin datos de inteligencia" />

  const totalProfiles = (data.total_profiles ?? 0).toString()
  const totalInstitutions = (data.total_institutions ?? 0).toString()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card>
        <SectionTitle icon={Icons.brain({ s: 18 })}>Análisis de Necesidades</SectionTitle>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: '0 0 20px' }}>
          Basado en los perfiles de {totalProfiles} usuarios, se detectaron las siguientes necesidades principales.
        </p>
      </Card>
      <Card>
        <SectionTitle icon={Icons.target({ s: 18 })}>Brechas de Cobertura</SectionTitle>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.6, margin: '0 0 20px' }}>
          Cruza la demanda (perfiles de {totalProfiles} usuarios) contra la oferta ({totalInstitutions} instituciones) para detectar brechas de cobertura.
        </p>
      </Card>
      <Card>
        <SectionTitle icon={Icons.star({ s: 18 })}>Top 5 Necesidades Más Comunes</SectionTitle>
      </Card>
    </div>
  )
}
